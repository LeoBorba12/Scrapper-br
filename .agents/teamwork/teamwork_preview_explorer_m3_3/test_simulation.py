import sqlite3
import json
import math

def safe_calcular_radar_pes(posicao, resumo=None, carreira=None):
    resumo = resumo or {}
    carreira = carreira or {}
    pos = (posicao or 'Atacante').lower()

    # Sanitização segura de gols e jogos
    cgols = carreira.get('gols')
    cjogos = carreira.get('jogos')
    rgols = resumo.get('total_gols')
    rjogos = resumo.get('jogos_registrados')

    if cjogos is not None and cjogos > 0 and cgols is not None:
        total_gols = float(cgols)
        total_jogos = float(cjogos)
    else:
        total_gols = float(rgols) if rgols is not None else 0.0
        total_jogos = float(rjogos) if (rjogos is not None and rjogos > 0) else 1.0

    if total_jogos <= 0:
        total_jogos = 1.0

    media_gols = total_gols / total_jogos if total_jogos > 0 else 0.0
    if total_jogos > 10 and media_gols > 2.0:
        if rgols is not None and rjogos is not None and rjogos > 0:
            media_gols = float(rgols) / float(rjogos)
        else:
            media_gols = min(media_gols, 1.4)

    cassists = carreira.get('assistencias')
    rassists = resumo.get('total_assistencias')
    total_assists = float(cassists) if cassists is not None else (float(rassists) if rassists is not None else 0.0)

    pontaria_raw = resumo.get('pontaria_chutes_pct')
    try:
        pontaria = float(pontaria_raw) if (pontaria_raw is not None and 0 <= float(pontaria_raw) <= 100) else 60.0
    except (ValueError, TypeError):
        pontaria = 60.0

    amarelos = float(resumo.get('amarelos') or 0.0)
    vermelhos = float(resumo.get('vermelhos') or 0.0)
    clutch = float(resumo.get('gols_decisivos_80mais') or 0.0)
    jogos_titular = float(resumo.get('jogos_titular') or 0.0)

    is_atacante = any(k in pos for k in ['atacante', 'centroavante', 'ponta']) or media_gols > 0.3 or total_gols > 30
    is_meia = any(k in pos for k in ['meia', 'meio', 'armador'])
    is_defensor = any(k in pos for k in ['zagueiro', 'lateral', 'defensor', 'volante'])
    is_goleiro = 'goleiro' in pos

    # 1. Ataque
    if is_atacante:
        atk = 82 + min(16, round(media_gols * 22) + (3 if clutch > 3 else 0))
    elif is_meia:
        atk = 74 + min(18, round(media_gols * 18) + (5 if total_assists > 20 else 2))
    elif is_defensor:
        atk = 48 + min(22, round(media_gols * 25))
    elif is_goleiro:
        atk = 40
    else:
        atk = 60 + min(25, round(media_gols * 22))

    # 2. Finalização
    if is_atacante:
        fin = 76
        if total_gols > 150: fin += 18
        elif total_gols > 80: fin += 14
        elif total_gols > 40: fin += 9
        elif total_gols > 15: fin += 4
        if media_gols > 0.45: fin += 5
        fin += round((pontaria - 50) * 0.2)
    elif is_meia:
        fin = 66 + (12 if total_gols > 30 else 5)
        if media_gols > 0.25: fin += 6
    elif is_defensor:
        fin = 45 + min(20, round(total_gols * 1.5))
    elif is_goleiro:
        fin = 40
    else:
        fin = 55 + (12 if total_gols > 20 else 4)

    # 3. Criação / Passe
    if is_meia:
        cri = 78
        if total_assists > 50: cri += 18
        elif total_assists > 25: cri += 12
        elif total_assists > 10: cri += 7
    elif is_atacante:
        cri = 60
        if total_assists > 40: cri += 18
        elif total_assists > 20: cri += 10
        elif total_assists > 5: cri += 5
    elif is_defensor:
        cri = 50 + (14 if 'lateral' in pos else 4)
    else:
        cri = 55 + min(20, total_assists * 2)

    # 4. Físico / Presença
    fis = 65
    if total_jogos > 400: fis += 25
    elif total_jogos > 250: fis += 18
    elif total_jogos > 150: fis += 12
    elif total_jogos > 60: fis += 6
    if jogos_titular > 100: fis += 5

    # 5. Defesa / Disciplina
    if is_goleiro:
        def_val = 92
    elif is_defensor:
        def_val = 82 + (8 if total_jogos > 100 else 4)
    elif is_meia:
        def_val = 80 if 'volante' in pos else 58
    else:
        def_val = 44
        cartoes_por_jogo = (amarelos + vermelhos * 2) / total_jogos if total_jogos > 0 else 0
        if cartoes_por_jogo < 0.12: def_val += 8
        elif cartoes_por_jogo > 0.25: def_val -= 6

    def clamp(v):
        try:
            val = float(v)
            if math.isnan(val): return 50
            return max(40, min(99, int(round(val))))
        except Exception:
            return 50

    eixos = [
        {"key": "atk", "label": "Ataque", "valor": clamp(atk), "desc": "Presença e volume ofensivo"},
        {"key": "fin", "label": "Finalização", "valor": clamp(fin), "desc": "Conversão e precisão no arremate"},
        {"key": "cri", "label": "Criação / Passe", "valor": clamp(cri), "desc": "Visão de jogo e assistências"},
        {"key": "fis", "label": "Físico / Presença", "valor": clamp(fis), "desc": "Resistência, minutagem e solidez"},
        {"key": "def", "label": "Defesa / Disciplina", "valor": clamp(def_val), "desc": "Combate e disciplina tática"}
    ]
    ovr = round(sum(e["valor"] for e in eixos) / len(eixos))
    return {"eixos": eixos, "ovr": ovr}

def test_feature_10():
    print("=== TESTING FEATURE 10: RADAR PES ===")
    # 1. Null / sparse inputs
    r1 = safe_calcular_radar_pes(None, None, None)
    assert 40 <= r1["ovr"] <= 99
    assert len(r1["eixos"]) == 5
    for e in r1["eixos"]:
        assert 40 <= e["valor"] <= 99
        assert e["key"] in ["atk", "fin", "cri", "fis", "def"]
    print("PASS: Null / None input safe")

    # 2. Extreme goalkeeper
    r_gk = safe_calcular_radar_pes("Goleiro", {"total_gols": 0, "jogos_registrados": 300}, {"gols": 0, "jogos": 300})
    assert r_gk["ovr"] >= 50
    e_gk = {e["key"]: e["valor"] for e in r_gk["eixos"]}
    assert e_gk["def"] >= 90
    print("PASS: Goalkeeper profile safe")

    # 3. Super striker (Luis Fabiano style)
    r_lf = safe_calcular_radar_pes("Atacante", {"total_gols": 168, "jogos_registrados": 158}, {"gols": 403, "jogos": 755})
    assert r_lf["ovr"] >= 80
    e_lf = {e["key"]: e["valor"] for e in r_lf["eixos"]}
    assert e_lf["atk"] >= 85
    assert e_lf["fin"] >= 85
    print("PASS: Super striker profile safe (Luís Fabiano: atk=%d, fin=%d, ovr=%d)" % (e_lf["atk"], e_lf["fin"], r_lf["ovr"]))

def test_feature_11():
    print("=== TESTING FEATURE 11: HONEST LABEL & CAREER AVERAGE ===")
    conn = sqlite3.connect('data/futebol.db')
    conn.row_factory = sqlite3.Row

    # Test logic on database athletes
    athletes_to_test = [
        (9033, "Luís Fabiano", True, "Jogos c/ Gol", 0.53),
        (13953, "Zico", True, "Jogos c/ Gol", 0.68),
        (12212, "Romário", True, "Jogos c/ Gol", 0.77),
        (6, "Paulinho Criciúma", True, "Jogos c/ Gol", 0.31),
        (10, "Pedro", False, "Jogos", 0.47)
    ]

    for aid, name, exp_parcial, exp_rotulo, exp_media in athletes_to_test:
        c = conn.cursor()
        row_est = c.execute("SELECT * FROM jogadores_estatisticas WHERE id_jogador = ?", (aid,)).fetchone()
        stats_meta = dict(row_est) if row_est else {}

        # Simulate profile calculation
        total_gols_final = stats_meta.get('total_gols') or 0
        total_assists_final = stats_meta.get('total_assistencias') or 0
        raw_gols_carreira = stats_meta.get('gols_carreira_oficiais') or 0
        raw_jogos_carreira = stats_meta.get('jogos_carreira_oficiais') or 0
        raw_assists_carreira = stats_meta.get('assistencias_carreira_oficiais') or 0
        total_jogos = stats_meta.get('total_jogos') or 1

        carreira_oficial = {
            "gols": max(raw_gols_carreira, total_gols_final),
            "jogos": max(raw_jogos_carreira, total_jogos),
            "assistencias": max(raw_assists_carreira, total_assists_final)
        }

        # Proposed Feature 11 logic:
        # acervo_parcial is True if official career games exceed catalog games, OR catalog has the classic pre-2018 symptom (games <= goals)
        # However, for modern players with authentic catalog where games >= goals and ano_inicio >= 2014, check whether it's truly partial:
        # Luís Fabiano has raw_jogos_carreira = 755, total_jogos = 158 (755 > 158)
        # Zico has 777 > 98
        # Romario has 961 > 109
        # Paulinho Criciuma has 32 > 10
        # What about Pedro? In DB, Pedro has total_jogos=329, raw_jogos_carreira=496.
        # Wait, if raw_jogos_carreira > total_jogos, for Pedro 496 > 329 is True!
        # Wait, should Pedro be acervo_parcial True or False?
        # Let's inspect!
        pass

if __name__ == '__main__':
    test_feature_10()
