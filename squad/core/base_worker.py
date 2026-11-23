from __future__ import annotations

import json
import logging
import os
import signal
import sys
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "worker": record.name,
            "msg": record.getMessage(),
        }
        if hasattr(record, "extra_data"):
            payload.update(record.extra_data)
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)


def build_logger(worker_name: str) -> logging.Logger:
    logger = logging.getLogger(worker_name)
    logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
    logger.propagate = False
    return logger


def _load_env_if_needed() -> None:
    if not os.getenv("TELEGRAM_BOT_TOKEN"):
        base = os.path.dirname(os.path.abspath(__file__))
        for cand in [".env", "../.env", os.path.join(base, "../../.env"), os.path.join(base, "../.env")]:
            if os.path.exists(cand):
                try:
                    with open(cand, "r", encoding="utf-8") as f:
                        for line in f:
                            if "=" in line and not line.strip().startswith("#"):
                                k, v = line.strip().split("=", 1)
                                os.environ.setdefault(k.strip(), v.strip())
                    if os.getenv("TELEGRAM_BOT_TOKEN"):
                        break
                except Exception:
                    pass


def send_telegram_message(
    text: str,
    parse_mode: str = "Markdown",
    token: str | None = None,
    chat_id: str | None = None,
    timeout: int = 10,
) -> bool:
    _load_env_if_needed()
    bot_token = token or os.getenv("TELEGRAM_BOT_TOKEN")
    target_chat = chat_id or os.getenv("TELEGRAM_CHAT_ID")
    if not bot_token or not target_chat:
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    body = json.dumps(
        {
            "chat_id": target_chat,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": True,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return 200 <= resp.status < 300
    except (urllib.error.URLError, TimeoutError):
        return False


class BaseWorker:
    def __init__(self, name: str, interval_seconds: float, db_path: str | None = None):
        self.name = name
        self.interval_seconds = interval_seconds
        self.db_path = db_path or os.getenv("FUTSTATS_DB_PATH", "data/futebol.db")
        self.logger = build_logger(name)
        self._stop_event = threading.Event()
        self._register_signals()
        self._ensure_db_initialized()

    def _ensure_db_initialized(self) -> None:
        try:
            from core.db import init_schema
            init_schema(self.db_path)
        except Exception as exc:
            self.logger.warning(
                "Não foi possível inicializar schema automaticamente",
                extra={"extra_data": {"erro": str(exc)}},
            )

    def _register_signals(self) -> None:
        if threading.current_thread() is threading.main_thread():
            try:
                signal.signal(signal.SIGTERM, self._handle_signal)
                signal.signal(signal.SIGINT, self._handle_signal)
            except ValueError:
                # Caso esteja rodando fora do thread principal em testes
                pass

    def _handle_signal(self, signum: int, _frame: Any) -> None:
        self.logger.info(
            "Sinal de encerramento recebido; iniciando graceful shutdown",
            extra={"extra_data": {"signal": signum}},
        )
        self._stop_event.set()

    @property
    def should_stop(self) -> bool:
        return self._stop_event.is_set()

    def stop(self) -> None:
        self._stop_event.set()

    def run_cycle(self) -> Any:
        raise NotImplementedError

    def run_forever(self) -> None:
        self.logger.info("Worker iniciado", extra={"extra_data": {"db_path": self.db_path}})
        backoff = 1.0
        while not self.should_stop:
            start = time.monotonic()
            try:
                self.run_cycle()
                backoff = 1.0
            except Exception:
                self.logger.exception(
                    "Erro no ciclo do worker; aplicando backoff exponencial",
                    extra={"extra_data": {"backoff_s": backoff}},
                )
                self._stop_event.wait(timeout=min(backoff, 300.0))
                backoff = min(backoff * 2.0, 300.0)
                continue

            elapsed = time.monotonic() - start
            sleep_for = max(0.0, self.interval_seconds - elapsed)
            self._stop_event.wait(timeout=sleep_for)

        self.logger.info("Worker encerrado com segurança")
