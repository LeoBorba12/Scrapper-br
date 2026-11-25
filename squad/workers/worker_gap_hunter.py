from __future__ import annotations

import hashlib
import json
import os
import random
import socket
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Any, Callable

from core.base_worker import BaseWorker, send_telegram_message
from core.db import read_connection, write_transaction

MAX_BATCH_SIZE = 50
CACHE_TTL_DAYS = 30


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    nfkd = unicodedata.normalize("NFKD", value.strip().lower())
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch))


def make_fingerprint(*parts: Any) -> str:
    canonical = "|".join(normalize_text(str(p)) for p in parts)
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


class ExternalSourceAdapter:
    """Adaptador base com rate limit (5-10s), cache local 30d e backoff exponencial."""

    def __init__(
        self,
        db_path: str,
        source_name: str,
        base_url: str = "",
        rate_limit_range: tuple[float, float] = (5.0, 10.0),
        sleep_fn: Callable[[float], None] = time.sleep,
    ):
        self.db_path = db_path
        self.source_name = source_name
        self.base_url = base_url
        self.rate_limit_range = rate_limit_range
        self.sleep_fn = sleep_fn
        self._last_request_ts = 0.0

    def _respect_rate_limit(self) -> None:
        if self._last_request_ts > 0:
            min_s, max_s = self.rate_limit_range
            wait_target = random.uniform(min_s, max_s)
            elapsed = time.monotonic() - self._last_request_ts
            if elapsed < wait_target:
                self.sleep_fn(wait_target - elapsed)
        self._last_request_ts = time.monotonic()

    def _get_cache(self, cache_key: str) -> dict[str, Any] | None:
        with read_connection(self.db_path) as conn:
            row = conn.execute(
                """
                SELECT payload_json FROM cache_externo_gap_hunter
                WHERE cache_key = ? AND datetime(expira_em) > datetime('now')
                """,
                (cache_key,),
            ).fetchone()
        return json.loads(row["payload_json"]) if row else None

    def _set_cache(self, cache_key: str, payload: dict[str, Any]) -> None:
        expires = (datetime.now(timezone.utc) + timedelta(days=CACHE_TTL_DAYS)).strftime(
            "%Y-%m-%d %H:%M:%S"
        )
        with write_transaction(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO cache_externo_gap_hunter (cache_key, fonte, payload_json, expira_em)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(cache_key) DO UPDATE SET
                    payload_json = excluded.payload_json,
                    expira_em = excluded.expira_em,
                    criado_em = datetime('now')
                """,
                (cache_key, self.source_name, json.dumps(payload, ensure_ascii=False), expires),
            )

    def fetch(self, tipo_entidade: str, chave_entidade: str, payload: dict[str, Any]) -> dict[str, Any]:
        cache_key = f"{self.source_name}:{tipo_entidade}:{normalize_text(chave_entidade)}"
        cached = self._get_cache(cache_key)
        if cached is not None:
            return cached

        if not self.base_url:
            return {"fonte": self.source_name, "partidas": [], "estatisticas": {}, "periodos": [], "entidades": []}

        self._respect_rate_limit()
        url = f"{self.base_url.rstrip('/')}/{tipo_entidade}/{urllib.parse.quote(chave_entidade)}"
        backoff = 2.0
        for attempt in range(4):
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "FutStats-GapHunter/1.0 (+compliance-rate-limited)"},
            )
            try:
                with urllib.request.urlopen(req, timeout=12) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    data["fonte"] = self.source_name
                    self._set_cache(cache_key, data)
                    return data
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                if attempt == 3:
                    raise exc
                self.sleep_fn(backoff)
                backoff *= 2.0

        return {"fonte": self.source_name}


def format_gap_alert_markdown(
    tipo_entidade: str,
    chave_entidade: str,
    fonte: str,
    summary: dict[str, int],
) -> str:
    total = sum(summary.values())
    lines = [
        "*[FutStats Gap Hunter | Auditoria de Quarentena]*",
        f"*Entidade:* `{tipo_entidade.upper()}` — {chave_entidade}",
        f"*Fonte Canônica:* {fonte}",
        f"*Total de Candidatos em Staging:* *{total}*",
        "",
    ]
    if summary.get("partidas", 0):
        lines.append(f"- Partidas descobertas: *{summary['partidas']}*")
    if summary.get("estatisticas", 0):
        lines.append(f"- Estatísticas divergentes: *{summary['estatisticas']}*")
    if summary.get("entidades", 0):
        lines.append(f"- Entidades candidatas: *{summary['entidades']}*")
    if summary.get("periodos", 0):
        lines.append(f"- Períodos/passagens descobertos: *{summary['periodos']}*")
    lines.append("")
    lines.append("_Produção preservada (imutável). Aguardando revisão humana em staging._")
    return "\n".join(lines)


class WorkerGapHunter(BaseWorker):
    def __init__(
        self,
        db_path: str | None = None,
        interval_seconds: float = 30.0,
        lock_ttl_seconds: int = 300,
        adapters: list[ExternalSourceAdapter] | None = None,
        notifier: Callable[[str], bool] | None = None,
    ):
        super().__init__("worker_gap_hunter", interval_seconds=interval_seconds, db_path=db_path)
        self.worker_id = f"gap_hunter_{socket.gethostname()}_{os.getpid()}"
        self.lock_ttl_seconds = lock_ttl_seconds
        # Notificações espontâneas silenciadas: apenas agenda diária de jogos envia push
        self.notifier = notifier or (lambda msg: False)
        self.adapters = adapters or [
            ExternalSourceAdapter(
                db_path=self.db_path,
                source_name="RSSSF_BRASIL",
                base_url=os.getenv("RSSSF_ADAPTER_URL", ""),
            ),
            ExternalSourceAdapter(
                db_path=self.db_path,
                source_name="OGOL",
                base_url=os.getenv("OGOL_ADAPTER_URL", ""),
            ),
        ]

    def claim_next_task(self) -> dict[str, Any] | None:
        """Consome a próxima tarefa pendente ou com lock expirado respeitando prioridade."""
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        expires_str = (
            datetime.now(timezone.utc) + timedelta(seconds=self.lock_ttl_seconds)
        ).strftime("%Y-%m-%d %H:%M:%S")

        with write_transaction(self.db_path) as conn:
            row = conn.execute(
                """
                SELECT * FROM fila_reconciliacao_entidades
                WHERE status = 'pending'
                   OR (status = 'running' AND lock_expires_at IS NOT NULL AND datetime(lock_expires_at) < datetime(?))
                ORDER BY prioridade ASC, id ASC
                LIMIT 1
                """,
                (now_str,),
            ).fetchone()
            if not row:
                return None

            conn.execute(
                """
                UPDATE fila_reconciliacao_entidades
                SET status = 'running',
                    locked_by = ?,
                    lock_expires_at = ?,
                    tentativas = tentativas + 1,
                    atualizado_em = ?
                WHERE id = ?
                """,
                (self.worker_id, expires_str, now_str, row["id"]),
            )
            return dict(row)

    def release_task(self, task_id: int, status: str, error_msg: str | None = None) -> None:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        with write_transaction(self.db_path) as conn:
            conn.execute(
                """
                UPDATE fila_reconciliacao_entidades
                SET status = ?,
                    locked_by = NULL,
                    lock_expires_at = NULL,
                    ultimo_erro = ?,
                    atualizado_em = ?
                WHERE id = ?
                """,
                (status, error_msg, now_str, task_id),
            )

    def _collect_internal_snapshot(self, tipo: str, payload: dict[str, Any]) -> dict[str, Any]:
        with read_connection(self.db_path) as conn:
            if tipo == "h2h":
                clube_a = payload["clube_a_id"]
                clube_b = payload["clube_b_id"]
                rows = conn.execute(
                    """
                    SELECT substr(p.data_hora, 1, 10) AS data_partida,
                           ch.nome AS casa, ca.nome AS fora,
                           p.gols_casa, p.gols_fora
                    FROM partidas p
                    JOIN clubes ch ON ch.id = p.clube_casa_id
                    JOIN clubes ca ON ca.id = p.clube_fora_id
                    WHERE (p.clube_casa_id = ? AND p.clube_fora_id = ?)
                       OR (p.clube_casa_id = ? AND p.clube_fora_id = ?)
                    """,
                    (clube_a, clube_b, clube_b, clube_a),
                ).fetchall()
                fps = {
                    make_fingerprint(r["data_partida"], r["casa"], r["fora"], f"{r['gols_casa']}x{r['gols_fora']}")
                    for r in rows
                }
                return {"fingerprints_partidas": fps, "total_partidas": len(rows)}

            if tipo == "jogador":
                row = conn.execute(
                    "SELECT id, nome, data_nascimento, nacionalidade, total_gols, total_jogos FROM jogadores WHERE id = ?",
                    (payload["jogador_id"],),
                ).fetchone()
                return dict(row) if row else {}

            return {}

    def _fetch_external_data(self, tipo: str, chave: str, payload: dict[str, Any]) -> dict[str, Any]:
        last_error: Exception | None = None
        for adapter in self.adapters:
            try:
                data = adapter.fetch(tipo, chave, payload)
                if data:
                    return data
            except Exception as exc:
                last_error = exc
                self.logger.warning(
                    "Falha no adaptador externo; tentando fallback",
                    extra={"extra_data": {"fonte": adapter.source_name, "erro": str(exc)}},
                )
        if last_error:
            raise last_error
        return {"fonte": "NONE"}

    def _write_batches(self, sql: str, rows: list[tuple[Any, ...]]) -> int:
        inserted = 0
        for i in range(0, len(rows), MAX_BATCH_SIZE):
            chunk = rows[i : i + MAX_BATCH_SIZE]
            with write_transaction(self.db_path) as conn:
                for params in chunk:
                    cur = conn.execute(sql, params)
                    inserted += cur.rowcount
        return inserted

    def _reconcile_and_stage(
        self,
        tipo: str,
        chave: str,
        snapshot: dict[str, Any],
        external: dict[str, Any],
    ) -> dict[str, int]:
        fonte = external.get("fonte", "EXTERNO")
        summary = {"partidas": 0, "estatisticas": 0, "entidades": 0, "periodos": 0}

        if tipo == "h2h":
            existing_fps: set[str] = snapshot.get("fingerprints_partidas", set())
            batch_partidas: list[tuple[Any, ...]] = []
            for m in external.get("partidas", []):
                fp = make_fingerprint(
                    m["data_partida"], m["casa"], m["fora"], f"{m['gols_casa']}x{m['gols_fora']}"
                )
                if fp not in existing_fps:
                    batch_partidas.append(
                        (
                            fp,
                            m["data_partida"],
                            m["casa"],
                            m["fora"],
                            int(m["gols_casa"]),
                            int(m["gols_fora"]),
                            m.get("competicao", ""),
                            fonte,
                            json.dumps(m, ensure_ascii=False),
                        )
                    )
            if batch_partidas:
                summary["partidas"] = self._write_batches(
                    """
                    INSERT OR IGNORE INTO staging_partidas_descobertas (
                        fingerprint, data_partida, clube_casa_nome, clube_fora_nome,
                        gols_casa, gols_fora, competicao, fonte, payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    batch_partidas,
                )

        if tipo in ("jogador", "tecnico", "clube"):
            ext_stats: dict[str, float] = external.get("estatisticas", {})
            batch_stats: list[tuple[Any, ...]] = []
            for metrica, valor_ext in ext_stats.items():
                if metrica in snapshot and snapshot[metrica] is not None:
                    valor_int = float(snapshot[metrica])
                    delta = round(float(valor_ext) - valor_int, 4)
                    if delta != 0:
                        fp = make_fingerprint(tipo, chave, metrica, valor_int, valor_ext, fonte)
                        batch_stats.append(
                            (
                                fp,
                                tipo,
                                snapshot.get("id"),
                                snapshot.get("nome", chave),
                                metrica,
                                valor_int,
                                float(valor_ext),
                                delta,
                                fonte,
                            )
                        )
            if batch_stats:
                summary["estatisticas"] = self._write_batches(
                    """
                    INSERT OR IGNORE INTO staging_estatisticas_entidade (
                        fingerprint, tipo_entidade, entidade_id, entidade_nome,
                        metrica, valor_interno, valor_externo, delta, fonte
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    batch_stats,
                )

            batch_entidades: list[tuple[Any, ...]] = []
            for ent in external.get("entidades", []):
                fp = make_fingerprint(
                    ent.get("nome", ""), ent.get("data_nascimento", ""), ent.get("nacionalidade", "")
                )
                batch_entidades.append(
                    (
                        fp,
                        tipo,
                        ent["nome"],
                        ent.get("data_nascimento"),
                        ent.get("nacionalidade"),
                        fonte,
                        json.dumps(ent, ensure_ascii=False),
                    )
                )
            if batch_entidades:
                summary["entidades"] = self._write_batches(
                    """
                    INSERT OR IGNORE INTO staging_entidades (
                        fingerprint, tipo_entidade, nome, data_nascimento, nacionalidade, fonte, payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    batch_entidades,
                )

            batch_periodos: list[tuple[Any, ...]] = []
            for per in external.get("periodos", []):
                fp = make_fingerprint(
                    tipo, chave, per.get("clube", ""), per.get("data_inicio", ""), per.get("data_fim", "")
                )
                batch_periodos.append(
                    (
                        fp,
                        tipo,
                        chave,
                        per["clube"],
                        per.get("data_inicio"),
                        per.get("data_fim"),
                        fonte,
                        json.dumps(per, ensure_ascii=False),
                    )
                )
            if batch_periodos:
                summary["periodos"] = self._write_batches(
                    """
                    INSERT OR IGNORE INTO staging_periodos_entidade (
                        fingerprint, tipo_entidade, entidade_nome, clube_nome,
                        data_inicio, data_fim, fonte, payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    batch_periodos,
                )

        return summary

    def run_cycle(self) -> dict[str, Any] | None:
        task = self.claim_next_task()
        if not task:
            return None

        task_id = task["id"]
        tipo = task["tipo_entidade"]
        chave = task["chave_entidade"]
        payload = json.loads(task["payload_json"] or "{}")

        try:
            snapshot = self._collect_internal_snapshot(tipo, payload)
            external = self._fetch_external_data(tipo, chave, payload)
            summary = self._reconcile_and_stage(tipo, chave, snapshot, external)

            total_gaps = sum(summary.values())
            final_status = "needs_review" if total_gaps > 0 else "completed"
            self.release_task(task_id, final_status)

            alert_sent = False
            if total_gaps > 0:
                msg = format_gap_alert_markdown(tipo, chave, external.get("fonte", "EXTERNO"), summary)
                alert_sent = bool(self.notifier(msg))

            self.logger.info(
                "Reconciliação concluída",
                extra={
                    "extra_data": {
                        "task_id": task_id,
                        "tipo": tipo,
                        "chave": chave,
                        "status": final_status,
                        "summary": summary,
                        "alert_sent": alert_sent,
                    }
                },
            )
            return {"task_id": task_id, "status": final_status, "summary": summary, "alert_sent": alert_sent}

        except Exception as exc:
            self.release_task(task_id, "failed", str(exc))
            self.logger.exception(
                "Erro na reconciliação da tarefa",
                extra={"extra_data": {"task_id": task_id, "chave": chave}},
            )
            raise


if __name__ == "__main__":
    WorkerGapHunter().run_forever()
