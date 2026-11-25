from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any, Callable

from core.base_worker import BaseWorker
from core.db import read_connection, write_transaction


class WorkerSniper(BaseWorker):
    def __init__(
        self,
        db_path: str | None = None,
        interval_seconds: float = 30.0,
        feed_fetcher: Callable[[list[int]], list[dict[str, Any]]] | None = None,
    ):
        super().__init__("worker_sniper", interval_seconds=interval_seconds, db_path=db_path)
        self.api_url = os.getenv("LIVE_FEED_API_URL", "")
        self.api_key = os.getenv("LIVE_FEED_API_KEY", "")
        self.feed_fetcher = feed_fetcher or self._fetch_from_http

    def _fetch_from_http(self, match_ids: list[int]) -> list[dict[str, Any]]:
        if not self.api_url or not match_ids:
            return []
        ids_param = ",".join(map(str, match_ids))
        url = f"{self.api_url}?ids={ids_param}"
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        backoff = 1.0
        for attempt in range(4):
            req = urllib.request.Request(url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=8) as resp:
                    payload = json.loads(resp.read().decode("utf-8"))
                    return payload.get("matches", [])
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                if attempt == 3:
                    raise exc
                time.sleep(backoff)
                backoff *= 2.0
        return []

    def run_cycle(self) -> int:
        with read_connection(self.db_path) as conn:
            cols = [r[1] for r in conn.execute("PRAGMA table_info(partidas)").fetchall()]
            is_production_schema = "id_partida" in cols
            if is_production_schema:
                rows = conn.execute(
                    """
                    SELECT id_partida AS id FROM partidas
                    WHERE data = strftime('%Y-%m-%d', 'now') OR data = strftime('%Y-%m-%d', 'now', '+1 day')
                    ORDER BY data ASC, horario ASC
                    LIMIT 100
                    """
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                    SELECT id FROM partidas
                    WHERE status IN ('AO_VIVO', 'AGENDADA')
                      AND datetime(data_hora) <= datetime('now', '+15 minutes')
                    ORDER BY data_hora ASC
                    LIMIT 100
                    """
                ).fetchall()

        match_ids = [r["id"] for r in rows]
        if not match_ids:
            return 0

        updates = self.feed_fetcher(match_ids)
        if not updates:
            return 0

        updated_count = 0
        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        with write_transaction(self.db_path) as conn:
            if is_production_schema:
                for item in updates:
                    m_id = item.get("id") or item.get("id_partida")
                    gols_c = item.get("gols_casa") if "gols_casa" in item else item.get("gols_mandante")
                    gols_f = item.get("gols_fora") if "gols_fora" in item else item.get("gols_visitante")
                    placar = f"{gols_c}x{gols_f}" if (gols_c is not None and gols_f is not None) else None
                    cur = conn.execute(
                        """
                        UPDATE partidas
                        SET gols_mandante = COALESCE(?, gols_mandante),
                            gols_visitante = COALESCE(?, gols_visitante),
                            placar = COALESCE(?, placar)
                        WHERE id_partida = ?
                        """,
                        (gols_c, gols_f, placar, m_id),
                    )
                    updated_count += cur.rowcount
            else:
                for item in updates:
                    cur = conn.execute(
                        """
                        UPDATE partidas
                        SET gols_casa = ?,
                            gols_fora = ?,
                            status = ?,
                            odd_casa = COALESCE(?, odd_casa),
                            odd_empate = COALESCE(?, odd_empate),
                            odd_fora = COALESCE(?, odd_fora),
                            atualizado_em = ?,
                            quant_processado = CASE WHEN ? = 'FINALIZADA' THEN 0 ELSE quant_processado END
                        WHERE id = ?
                        """,
                        (
                            item.get("gols_casa"),
                            item.get("gols_fora"),
                            item["status"],
                            item.get("odd_casa"),
                            item.get("odd_empate"),
                            item.get("odd_fora"),
                            now_iso,
                            item["status"],
                            item["id"],
                        ),
                    )
                    updated_count += cur.rowcount

        self.logger.info(
            "Ciclo sniper concluído",
            extra={"extra_data": {"monitoradas": len(match_ids), "atualizadas": updated_count}},
        )
        return updated_count


if __name__ == "__main__":
    WorkerSniper().run_forever()
