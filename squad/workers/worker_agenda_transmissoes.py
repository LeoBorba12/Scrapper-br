from __future__ import annotations

from datetime import datetime
from typing import Callable
from zoneinfo import ZoneInfo

try:
    from core.base_worker import BaseWorker, send_telegram_message
    from core.db import read_connection
except ImportError:
    from squad.core.base_worker import BaseWorker, send_telegram_message
    from squad.core.db import read_connection

BRT = ZoneInfo("America/Sao_Paulo")
TELEGRAM_MAX_LENGTH = 4000

LIGAS_PRIORITARIAS = (
    "Brasileirão Série A",
    "Copa do Brasil",
    "Libertadores",
    "Champions League",
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
)

MAPA_TRANSMISSOES_BR: dict[str, list[str]] = {
    "Brasileirão Série A": ["Globo", "SporTV", "Premiere", "CazéTV"],
    "Copa do Brasil": ["Globo", "SporTV", "Premiere", "Amazon Prime Video"],
    "Libertadores": ["Globo", "ESPN", "Disney+", "Paramount+"],
    "Champions League": ["SBT", "TNT", "Max"],
    "Premier League": ["ESPN", "Disney+"],
    "La Liga": ["ESPN", "Disney+"],
    "Serie A": ["ESPN", "Disney+"],
    "Bundesliga": ["SporTV", "CazéTV", "OneFootball"],
}


def resolve_broadcasters(liga: str) -> str:
    l_lower = liga.lower()
    if "brasileir" in l_lower:
        return "Globo / SporTV / Premiere / CazéTV"
    if "copa do brasil" in l_lower:
        return "Globo / SporTV / Premiere / Amazon Prime Video"
    if "libertadores" in l_lower:
        return "Globo / ESPN / Disney+ / Paramount+"
    if "champions" in l_lower:
        return "SBT / TNT / Max"
    if "premier league" in l_lower:
        return "ESPN / Disney+"
    if "la liga" in l_lower or "espanhol" in l_lower:
        return "ESPN / Disney+"
    if "bundesliga" in l_lower or "alemão" in l_lower:
        return "SporTV / CazéTV / OneFootball"
    if "serie a" in l_lower or "italiano" in l_lower:
        return "ESPN / Disney+"
    canais = MAPA_TRANSMISSOES_BR.get(liga, ["Consultar grade local"])
    return " / ".join(canais)


def format_agenda_markdown(date_label: str, matches: list[dict]) -> str:
    if not matches:
        return (
            f"*FutStats | Agenda de Transmissões ({date_label})*\n\n"
            "Nenhum jogo das ligas monitoradas agendado para hoje."
        )

    grouped: dict[str, list[dict]] = {}
    for m in matches:
        grouped.setdefault(m["liga"], []).append(m)

    lines = [f"*FutStats | Agenda de Transmissões ({date_label})*", ""]
    for liga, jogos in grouped.items():
        lines.append(f"*{liga}*")
        for j in jogos:
            hora = j["data_hora"][11:16]
            canais = resolve_broadcasters(liga)
            lines.append(f"- `{hora}` | {j['casa']} x {j['fora']} — _{canais}_")
        lines.append("")

    lines.append("_Horários no fuso de Brasília (BRT)._")
    return "\n".join(lines).strip()


def chunk_message(text: str, max_chars: int = TELEGRAM_MAX_LENGTH) -> list[str]:
    """Divide a mensagem em pedaços seguros menores que o limite do Telegram."""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    lines = text.split("\n")
    current_chunk = []
    current_len = 0

    for line in lines:
        line_len = len(line) + 1
        if current_len + line_len > max_chars:
            chunks.append("\n".join(current_chunk))
            current_chunk = [line]
            current_len = line_len
        else:
            current_chunk.append(line)
            current_len += line_len

    if current_chunk:
        chunks.append("\n".join(current_chunk))
    return chunks


class WorkerAgendaTransmissoes(BaseWorker):
    def __init__(
        self,
        db_path: str | None = None,
        notifier: Callable[[str], bool] | None = None,
    ):
        super().__init__("worker_agenda_transmissoes", interval_seconds=60.0, db_path=db_path)
        self.notifier = notifier or (lambda msg: send_telegram_message(msg))
        self._sent_idempotency_keys: set[str] = set()

    def fetch_today_matches(self, target_date_iso: str) -> list[dict]:
        with read_connection(self.db_path) as conn:
            cols = [r[1] for r in conn.execute("PRAGMA table_info(partidas)").fetchall()]
            if "mandante" in cols:
                # Esquema oficial de produção (futebol.db)
                query = """
                SELECT campeonato AS liga,
                       (data || ' ' || COALESCE(horario, '00:00')) AS data_hora,
                       mandante AS casa,
                       visitante AS fora
                FROM partidas
                WHERE data = ?
                ORDER BY campeonato ASC, horario ASC
                """
                rows = conn.execute(query, (target_date_iso,)).fetchall()
            else:
                # Esquema relacional com tabela clubes
                placeholders = ",".join("?" for _ in LIGAS_PRIORITARIAS)
                rows = conn.execute(
                    f"""
                    SELECT p.liga, p.data_hora, ch.nome AS casa, ca.nome AS fora
                    FROM partidas p
                    JOIN clubes ch ON ch.id = p.clube_casa_id
                    JOIN clubes ca ON ca.id = p.clube_fora_id
                    WHERE substr(p.data_hora, 1, 10) = ?
                      AND p.status IN ('AGENDADA', 'AO_VIVO')
                      AND p.liga IN ({placeholders})
                    ORDER BY p.liga ASC, p.data_hora ASC
                    """,
                    (target_date_iso, *LIGAS_PRIORITARIAS),
                ).fetchall()
        return [dict(r) for r in rows]

    def dispatch_for_date(self, target_dt: datetime) -> tuple[str, bool]:
        date_iso = target_dt.strftime("%Y-%m-%d")
        idempotency_key = f"agenda_transmissoes:{date_iso}"

        # Proteção contra envio duplicado no mesmo dia
        if idempotency_key in self._sent_idempotency_keys:
            self.logger.info("Agenda já enviada para esta data; ignorando disparo duplicado",
                             extra={"extra_data": {"chave": idempotency_key}})
            return "", False

        date_label = target_dt.strftime("%d/%m/%Y")
        matches = self.fetch_today_matches(date_iso)
        card = format_agenda_markdown(date_label, matches)

        chunks = chunk_message(card)
        all_sent = True
        for chunk in chunks:
            if not self.notifier(chunk):
                all_sent = False

        if all_sent:
            self._sent_idempotency_keys.add(idempotency_key)

        self.logger.info(
            "Agenda matinal processada",
            extra={"extra_data": {"data": date_iso, "jogos": len(matches), "enviado": all_sent, "partes": len(chunks)}},
        )
        return card, all_sent

    def run_cycle(self) -> bool:
        now_brt = datetime.now(BRT)
        if now_brt.hour == 8 and now_brt.minute == 0:
            _, sent = self.dispatch_for_date(now_brt)
            return sent
        return False


if __name__ == "__main__":
    WorkerAgendaTransmissoes().run_forever()
