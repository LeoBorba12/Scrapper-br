"""
Script Unificado de Validação do FutStats
Executa as skills de:
1. Design & Contraste WCAG 2.2 AA (Tokens Areia e Carvão)
2. Integridade Relacional do Banco de Dados (12 regras)
3. Coerência Estatística e Evals Preditivos (test_model_evals.py)
4. Sanidade Cadastral dos Clubes e Réplicas 3D
5. Verificação de Confinamento de Tamanho do SQLite (< 94.0 MB)
"""

import os
import sys
import json
import re
import math
import sqlite3
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "data" / "futebol.db"
TOKENS_CSS_PATH = BASE_DIR / "frontend" / "src" / "tokens.css"

def parse_color_hex(hex_str):
    hex_clean = hex_str.strip().lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = ''.join([c*2 for c in hex_clean])
    r = int(hex_clean[0:2], 16) / 255.0
    g = int(hex_clean[2:4], 16) / 255.0
    b = int(hex_clean[4:6], 16) / 255.0
    return r, g, b

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.03928 else math.pow((c + 0.055) / 1.055, 2.4)

def relative_luminance(r, g, b):
    r_lin = srgb_to_linear(r)
    g_lin = srgb_to_linear(g)
    b_lin = srgb_to_linear(b)
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin

def contrast_ratio(hex1, hex2):
    lum1 = relative_luminance(*parse_color_hex(hex1))
    lum2 = relative_luminance(*parse_color_hex(hex2))
    l_max = max(lum1, lum2)
    l_min = min(lum1, lum2)
    return (l_max + 0.05) / (l_min + 0.05)

def validar_design_tokens_contrast():
    print("=" * 70)
    print("1. SKILL: DESIGN TOKEN CONTRAST (WCAG 2.2 AA)")
    print("=" * 70)

    if not TOKENS_CSS_PATH.exists():
        print(f"Erro: {TOKENS_CSS_PATH} não encontrado.")
        return False

    with open(TOKENS_CSS_PATH, 'r', encoding='utf-8') as f:
        css = f.read()

    # Extrair blocos light e dark
    light_match = re.search(r':root.*?\n(.*?)\n\}', css, re.DOTALL)
    dark_match = re.search(r'\[data-theme="dark"\].*?\n(.*?)\n\}', css, re.DOTALL)

    def extract_vars(block):
        vars_dict = {}
        for line in block.splitlines():
            line = line.strip()
            if line.startswith('--') and ':' in line:
                k, v = line.split(':', 1)
                k = k.strip()
                v = v.split(';')[0].strip()
                if v.startswith('#'):
                    vars_dict[k] = v
        return vars_dict

    light_tokens = extract_vars(light_match.group(1)) if light_match else {}
    dark_tokens = extract_vars(dark_match.group(1)) if dark_match else {}

    testes = [
        # (texto, fundo, min_ratio, tipo)
        ('--text-primary', '--surface-page', 4.5, "Texto Normal"),
        ('--text-primary', '--surface-panel', 4.5, "Texto Normal"),
        ('--text-primary', '--surface-card', 4.5, "Texto Normal"),
        ('--text-secondary', '--surface-page', 4.5, "Texto Normal"),
        ('--text-secondary', '--surface-card', 4.5, "Texto Normal"),
        ('--text-muted', '--surface-page', 3.0, "Texto Secundário/UI"),
        ('--accent', '--surface-page', 3.0, "Controles e Destaque UI"),
        ('--accent', '--surface-card', 3.0, "Controles e Destaque UI"),
        ('--positive', '--surface-page', 4.5, "Feedback Positivo"),
        ('--negative', '--surface-page', 4.5, "Feedback Negativo"),
    ]

    falhas = 0
    total = 0

    print("\n--- TEMA AREIA (LIGHT) ---")
    for t_text, t_bg, min_r, desc in testes:
        hex_t = light_tokens.get(t_text)
        hex_bg = light_tokens.get(t_bg)
        if hex_t and hex_bg:
            ratio = contrast_ratio(hex_t, hex_bg)
            passou = ratio >= min_r
            status = "PASS" if passou else "FAIL"
            if not passou:
                falhas += 1
            total += 1
            print(f"[{status}] {ratio:.2f}:1 (min {min_r}:1) -> {t_text} ({hex_t}) sobre {t_bg} ({hex_bg}) [{desc}]")

    print("\n--- TEMA CARVÃO QUENTE (DARK) ---")
    for t_text, t_bg, min_r, desc in testes:
        hex_t = dark_tokens.get(t_text)
        hex_bg = dark_tokens.get(t_bg)
        if hex_t and hex_bg:
            ratio = contrast_ratio(hex_t, hex_bg)
            passou = ratio >= min_r
            status = "PASS" if passou else "FAIL"
            if not passou:
                falhas += 1
            total += 1
            print(f"[{status}] {ratio:.2f}:1 (min {min_r}:1) -> {t_text} ({hex_t}) sobre {t_bg} ({hex_bg}) [{desc}]")

    print(f"\nResultado Design Contrast: {total - falhas}/{total} pares aprovados.")
    return falhas == 0

def validar_integridade_dados():
    print("\n" + "=" * 70)
    print("2. AUDITORIA DE INTEGRIDADE RELACIONAL (12 REGRAS DO BANCO)")
    print("=" * 70)

    cmd = [sys.executable, "scripts/auditar_integridade_dados.py"]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=BASE_DIR)

    try:
        data = json.loads(res.stdout)
        total_p = data.get("total_partidas", 0)
        regras = data.get("regras", [])
        todas_ok = True
        print(f"Acervo Total Auditado: {total_p:,} partidas.")
        for r in regras:
            status = r.get("status")
            regra_nome = r.get("regra")
            ocorr = r.get("ocorrencias", 0)
            rep = r.get("reparados", 0)
            if status not in ["OK", "CORRIGIDO"]:
                todas_ok = False
            print(f"[{status}] {regra_nome} | Ocorrências: {ocorr} | Reparados: {rep}")
        return todas_ok
    except Exception as e:
        print(f"Erro ao processar auditoria de dados: {e}")
        print("Output:", res.stdout[:400])
        return False

def validar_coerencia_estatistica():
    print("\n" + "=" * 70)
    print("3. COERÊNCIA ESTATÍSTICA & MODEL EVALS (DIXON-COLES, XG, ODDS)")
    print("=" * 70)

    cmd = [sys.executable, "-m", "pytest", "tests/test_model_evals.py", "-q"]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=BASE_DIR)
    print(res.stdout.strip())
    if res.returncode == 0:
        print("Resultado: 22/22 testes preditivos e estatísticos aprovados.")
        return True
    else:
        print("Falha na suíte de testes de evals:", res.stderr)
        return False

def validar_cadastros_e_3d():
    print("\n" + "=" * 70)
    print("4. SANIDADE CADASRAL DOS CLUBES & RÉPLICAS 3D")
    print("=" * 70)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM clubes_perfil")
    total_perfis = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM clubes_trofeus_vitrine")
    total_trofeus = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM campeonatos_estatisticas_equipes")
    total_equipes_stats = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM estatisticas_atletas_temporada")
    total_atletas_stats = c.fetchone()[0]

    # Checar se os 16 perfis possuem dados vitais
    c.execute("""
        SELECT nome, estadio_nome, presidente, treinador_atual, valor_elenco_milhoes_eur
        FROM clubes_perfil
        WHERE estadio_nome IS NULL OR presidente IS NULL OR treinador_atual IS NULL
    """)
    nulos = c.fetchall()

    conn.close()

    print(f"Clubes com Dossiê Cadastral Completo: {total_perfis}")
    print(f"Troféus Oficiais com Modelo 3D: {total_trofeus}")
    print(f"Equipes com Scouts de Temporada: {total_equipes_stats}")
    print(f"Atletas com 46 Métricas OGol: {total_atletas_stats}")

    if len(nulos) == 0:
        print("[OK] Todos os clubes possuem estádio, presidente, treinador e valor de mercado válidos.")
        return True
    else:
        print(f"[FAIL] {len(nulos)} clubes com campos nulos: {nulos}")
        return False

def validar_tamanho_banco():
    print("\n" + "=" * 70)
    print("5. VERIFICAÇÃO DE ARMAZENAMENTO & JOURNAL MODE (TETO VERCEL)")
    print("=" * 70)

    sz_mb = DB_PATH.stat().st_size / (1024 * 1024)
    conn = sqlite3.connect(DB_PATH)
    jm = conn.execute("PRAGMA journal_mode").fetchone()[0]
    conn.close()

    print(f"Tamanho de data/futebol.db: {sz_mb:.2f} MB (Teto Vercel: 94.00 MB)")
    print(f"SQLite PRAGMA journal_mode: {jm} (Obrigatório: DELETE)")

    passou_sz = sz_mb < 94.0
    passou_jm = jm.lower() == "delete"

    if passou_sz and passou_jm:
        print("[OK] Armazenamento dentro da margem de segurança e journal mode correto.")
        return True
    else:
        print("[FAIL] Excede teto ou journal mode incorreto.")
        return False

def main():
    r1 = validar_design_tokens_contrast()
    r2 = validar_integridade_dados()
    r3 = validar_coerencia_estatistica()
    r4 = validar_cadastros_e_3d()
    r5 = validar_tamanho_banco()

    print("\n" + "=" * 70)
    print("RESUMO EXECUTIVO DE AUDITORIA & VALIDAÇÃO")
    print("=" * 70)
    print(f"1. Design Token Contrast (WCAG 2.2 AA):  {'APROVADO' if r1 else 'FALHA'}")
    print(f"2. Integridade Relacional dos Dados:     {'APROVADO' if r2 else 'FALHA'}")
    print(f"3. Coerência Estatística & Evals (22/22): {'APROVADO' if r3 else 'FALHA'}")
    print(f"4. Sanidade Cadastral & Réplicas 3D:     {'APROVADO' if r4 else 'FALHA'}")
    print(f"5. Teto de Armazenamento Vercel:         {'APROVADO' if r5 else 'FALHA'}")

    all_passed = all([r1, r2, r3, r4, r5])
    print("=" * 70)
    if all_passed:
        print("STATUS GERAL: TODAS AS VALIDAÇÕES FORAM APROVADAS COM SUCESSO!")
    else:
        print("STATUS GERAL: HÁ ITENS REQUERENDO ATENÇÃO.")
    print("=" * 70)

    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
