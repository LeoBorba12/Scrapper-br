#!/usr/bin/env python3
"""
Validador de Integridade de Handoffs da Tríade de IA.
Verifica se os arquivos de handoff contêm as seções obrigatórias para evitar perda de contexto.
"""

import sys
import os
import re

SECOES_OBRIGATORIAS = {
    "briefing": [
        "## 1. Contexto",
        "## 2. Escopo",
        "## 3. Restrições",
        "## 5. Contratos",
        "## 6. Critérios de Aceite"
    ],
    "pacote": [
        "## 1. Referência",
        "## 2. Mapa de Arquivos",
        "## 3. Código-Fonte",
        "## 4. Comandos de Execução"
    ],
    "evidencias": [
        "## 1. Identificação",
        "## 2. Resumo Executivo",
        "## 3. Matriz de Cobertura",
        "## 4. Telemetria e Evidências"
    ]
}

def validar_arquivo(caminho):
    if not os.path.exists(caminho):
        print(f"[ERRO] Arquivo não encontrado: {caminho}")
        return False

    conteudo = open(caminho, "r", encoding="utf-8").read()
    nome = os.path.basename(caminho).lower()

    tipo = None
    for k in SECOES_OBRIGATORIAS:
        if k in nome:
            tipo = k
            break

    if not tipo:
        print(f"[AVISO] Tipo de handoff não identificado pelo nome ({nome}). Esperado: briefing, pacote ou evidencias.")
        return True

    ausentes = []
    for secao in SECOES_OBRIGATORIAS[tipo]:
        if not re.search(re.escape(secao), conteudo, re.IGNORECASE):
            ausentes.append(secao)

    if ausentes:
        print(f"[FALHA] O handoff '{nome}' não possui as seguintes seções obrigatórias:")
        for a in ausentes:
            print(f"  - {a}")
        return False

    print(f"[SUCESSO] Handoff '{nome}' validado com 100% das seções obrigatórias presentes.")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python validate_handoff.py <caminho_do_arquivo.md>")
        sys.exit(1)

    sucesso = validar_arquivo(sys.argv[1])
    sys.exit(0 if sucesso else 1)
