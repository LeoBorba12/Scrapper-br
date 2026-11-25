import os
import sys
from pathlib import Path
import pytest

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from scripts.bot_telegram_interativo import (
    TECLADO_INLINE_MENU,
    obter_jogos_hoje_com_transmissoes,
    obter_status_orquestrador,
)


def test_teclado_inline_menu_has_required_buttons():
    buttons = []
    for row in TECLADO_INLINE_MENU["inline_keyboard"]:
        for btn in row:
            buttons.append(btn.get("text", ""))

    btn_text = " ".join(buttons)
    assert "Jogos de Hoje" in btn_text
    assert "Status VM" in btn_text
    assert "Orquestrador" in btn_text
    assert "Auditoria Universal" in btn_text


def test_obter_jogos_hoje_com_transmissoes():
    res = obter_jogos_hoje_com_transmissoes()
    assert isinstance(res, str)
    assert len(res) > 20
    assert ("Agenda de Transmissões" in res or "Nenhum jogo" in res)
    assert "Horários no fuso de Brasília (BRT)" in res


def test_obter_status_orquestrador():
    res = obter_status_orquestrador()
    assert isinstance(res, str)
    assert ("ORQUESTRADOR" in res or "Log do orquestrador" in res)
