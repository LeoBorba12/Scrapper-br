"""
Validação de Conformidade Regulatória — Remoção de Alertas de Apostas do Bot Telegram
=====================================================================================
Garante que:
1. O menu interativo (TECLADO_INLINE_MENU) não contém botões ou referências a apostas, odds ou +EV.
2. Comandos de apostas (/ev, /ev_alertas, /anomalias) retornam mensagem de suspensão de conformidade.
"""

import pytest
from unittest.mock import patch
from scripts.bot_telegram_interativo import TECLADO_INLINE_MENU, tratar_comando

def test_menu_sem_botoes_apostas():
    """Garante que nenhum botão do menu inline aponta para comandos de apostas ou +EV."""
    for row in TECLADO_INLINE_MENU.get("inline_keyboard", []):
        for btn in row:
            texto = btn.get("text", "").lower()
            callback = btn.get("callback_data", "").lower()
            assert "+ev" not in texto, f"Botão com texto de +EV encontrado: {btn}"
            assert "aposta" not in texto, f"Botão com texto de aposta encontrado: {btn}"
            assert callback not in ("/ev", "/ev_alertas", "/ev_scanner", "/anomalias"), f"Callback de aposta encontrado: {btn}"

def test_comando_ev_retorna_suspensao():
    """Garante que /ev retorna mensagem informando a suspensão do módulo de apostas."""
    mensagens_enviadas = []
    
    with patch("scripts.bot_telegram_interativo.notificar") as mock_notificar, \
         patch("scripts.bot_telegram_interativo.ADMIN_CHATS", {"123456"}):
        def fake_notificar(chat_id, texto, reply_markup=None):
            mensagens_enviadas.append(texto)
        mock_notificar.side_effect = fake_notificar

        tratar_comando("123456", "/ev")
        assert len(mensagens_enviadas) == 1
        assert "SUSPENSO" in mensagens_enviadas[0].upper()
        assert "regulamentação vigente no brasil" in mensagens_enviadas[0].lower()

def test_comando_ev_alertas_retorna_suspensao():
    """Garante que /ev_alertas também retorna a mensagem de conformidade regulatória."""
    mensagens_enviadas = []
    
    with patch("scripts.bot_telegram_interativo.notificar") as mock_notificar, \
         patch("scripts.bot_telegram_interativo.ADMIN_CHATS", {"123456"}):
        def fake_notificar(chat_id, texto, reply_markup=None):
            mensagens_enviadas.append(texto)
        mock_notificar.side_effect = fake_notificar

        tratar_comando("123456", "/ev_alertas")
        assert len(mensagens_enviadas) == 1
        assert "SUSPENSO" in mensagens_enviadas[0].upper()
