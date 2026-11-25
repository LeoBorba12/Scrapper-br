from __future__ import annotations

import os
import shutil
import sqlite3
from typing import Callable

from core.base_worker import BaseWorker, send_telegram_message
from core.db import get_connection, write_transaction


class WorkerGuardiao(BaseWorker):
    def __init__(
        self,
        db_path: str | None = None,
        interval_seconds: float = 600.0,
        soft_limit_mb: float = 84.0,
        hard_limit_mb: float = 94.0,
        notifier: Callable[[str], bool] | None = None,
    ):
        super().__init__("worker_guardiao", interval_seconds=interval_seconds, db_path=db_path)
        self.soft_limit_mb = soft_limit_mb
        self.hard_limit_mb = hard_limit_mb
        # Notificações espontâneas silenciadas: apenas agenda diária de jogos envia push
        self.notifier = notifier or (lambda msg: False)

    def get_db_size_mb(self) -> float:
        if not os.path.exists(self.db_path):
            return 0.0
        total_bytes = os.path.getsize(self.db_path)
        for suffix in ("-wal", "-shm"):
            sidecar = f"{self.db_path}{suffix}"
            if os.path.exists(sidecar):
                total_bytes += os.path.getsize(sidecar)
        return round(total_bytes / (1024 * 1024), 2)

    def run_safe_vacuum(self) -> float:
        """Executa checkpoint passivo primeiro e VACUUM de forma segura."""
        conn = get_connection(self.db_path, readonly=False)
        try:
            # 1. Checkpoint PASSIVE primeiro para não bloquear leitores/escritores
            try:
                conn.execute("PRAGMA wal_checkpoint(PASSIVE);")
            except sqlite3.OperationalError:
                pass

            # 2. VACUUM controlado
            conn.execute("VACUUM;")
        finally:
            conn.close()
        return self.get_db_size_mb()

    def run_cycle(self) -> dict[str, float | bool]:
        size_mb = self.get_db_size_mb()
        vacuum_ran = False
        alert_sent = False

        if size_mb >= self.soft_limit_mb:
            new_size_mb = self.run_safe_vacuum()
            vacuum_ran = True
            severity = "CRITICO (Hard Limit)" if new_size_mb >= self.hard_limit_mb else "ALERTA (Soft Limit)"
            msg = (
                f"*[FutStats Guardião - {severity}]*\n"
                f"Banco `futebol.db` atingiu *{size_mb:.2f} MB* (limite soft: {self.soft_limit_mb} MB).\n"
                f"VACUUM seguro executado -> tamanho atual: *{new_size_mb:.2f} MB*."
            )
            alert_sent = bool(self.notifier(msg))
            size_mb = new_size_mb

        with write_transaction(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO slos_guardiao (tamanho_mb, vacuum_executado, alerta_enviado)
                VALUES (?, ?, ?)
                """,
                (size_mb, int(vacuum_ran), int(alert_sent)),
            )
            # Rotação de logs de SLO: mantém apenas os últimos 2000 registros
            conn.execute(
                """
                DELETE FROM slos_guardiao
                WHERE id NOT IN (SELECT id FROM slos_guardiao ORDER BY id DESC LIMIT 2000)
                """
            )

        self.logger.info(
            "Verificação do Guardião concluída",
            extra={
                "extra_data": {
                    "tamanho_mb": size_mb,
                    "vacuum_executado": vacuum_ran,
                    "alerta_enviado": alert_sent,
                }
            },
        )
        return {
            "tamanho_mb": size_mb,
            "vacuum_executado": vacuum_ran,
            "alerta_enviado": alert_sent,
        }


if __name__ == "__main__":
    WorkerGuardiao().run_forever()
