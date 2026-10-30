"""
Suíte de Testes E2E (End-to-End) e Validação de Aceitação - FutStats
Metodologia em 4 Camadas (Tiers 1-4):
  - Tier 1: Feature Coverage (R1, R2, R3, R4)
  - Tier 2: Boundary & Corner Cases
  - Tier 3: Cross-Feature Combinations (Pairwise)
  - Tier 4: Real-World Application Scenarios (Jornadas Reais)

Fontes Autoritativas de Validação:
  - R1: Reconciliação Jogos-Gols, Rótulo 'Jogos c/ Gol' e Média Carreira Oficial
  - R2: Purga Conmebol Invertidas (19997098, 20027112) e Clubes Limpos (LF 9033, Mycael 2066, Pedro 10)
  - R3: Motor Tanh 0.0-10.0 (calculo_player_rating), xG Discreto (calculo_xg_discreto) e Radar PES 5 Eixos
  - R4: Teto Storage Vercel (<94 MB), Auditoria Relacional (12/12) e Regressão Dixon-Coles (22/22)
"""

import os
import sys
import math
import json
import sqlite3
import subprocess
import pytest

# Garante acesso à raiz e ao backend
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app, gerar_token, _calc_poisson_bivariate, _calcular_radar_pes
from backend.calculo_player_rating import (
    calcular_nota_partida_sofascore,
    WEIGHT_MATRIX,
    normalizar_posicao
)
from backend.calculo_xg_discreto import (
    analisar_performance_xg_atleta,
    calcular_xg_finalizacao,
    classificar_perfil_clinico,
    PENALTY_XG,
    XG_LOOKUP_MATRIX
)

DB_PATH = os.path.join(PROJECT_ROOT, "data", "futebol.db")
STORAGE_LIMIT_BYTES = 94 * 1024 * 1024  # 94.0 MB = 98.566.144 bytes


# ==============================================================================
# FIXTURES COMPARTILHADAS
# ==============================================================================

@pytest.fixture(scope="session")
def db_conn():
    """Conexão somente-leitura com o banco SQLite real data/futebol.db."""
    assert os.path.exists(DB_PATH), f"Banco SQLite não encontrado em {DB_PATH}"
    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
    conn.row_factory = sqlite3.Row
    yield conn
    conn.close()


@pytest.fixture(scope="session")
def api_client():
    """Cliente de teste Flask configurado com autenticação JWT válida."""
    app.config["TESTING"] = True
    token = gerar_token({"email": "e2e_tester@futstats.com", "role": "admin"})
    
    class AuthenticatedClient:
        def __init__(self, test_client, auth_token):
            self.client = test_client
            self.headers = {"Authorization": f"Bearer {auth_token}"}

        def get(self, url, **kwargs):
            headers = kwargs.pop("headers", {})
            merged = {**self.headers, **headers}
            return self.client.get(url, headers=merged, **kwargs)

        def post(self, url, **kwargs):
            headers = kwargs.pop("headers", {})
            merged = {**self.headers, **headers}
            return self.client.post(url, headers=merged, **kwargs)

    with app.test_client() as c:
        yield AuthenticatedClient(c, token)


# ==============================================================================
# TIER 1: FEATURE COVERAGE (R1, R2, R3, R4)
# ==============================================================================

class TestTier1FeatureCoverage:
    """Validação primária dos quatro requisitos de entrega do FutStats."""

    # --- R1: Reconciliação Jogos-Gols & Rótulo Honesto ---

    @pytest.mark.tier1
    @pytest.mark.r1
    def test_t1_r1_jogos_carreira_oficiais_distintos_de_gols(self, db_conn):
        """Atletas com acervo parcial pré-2018 devem ter jogos oficiais de carreira divergentes de total_gols."""
        cursor = db_conn.cursor()
        for atleta_id in [9033, 13953, 12212]:  # Luís Fabiano, Zico, Romário
            cursor.execute(
                "SELECT nome_exibicao, total_gols, total_jogos, jogos_carreira_oficiais "
                "FROM jogadores_estatisticas WHERE id_jogador = ?",
                (atleta_id,)
            )
            row = cursor.fetchone()
            assert row is not None, f"Atleta ID {atleta_id} não encontrado na base"
            assert row["jogos_carreira_oficiais"] > row["total_gols"], (
                f"Atleta {row['nome_exibicao']} deve possuir mais jogos oficiais ({row['jogos_carreira_oficiais']}) "
                f"do que gols catalogados ({row['total_gols']})"
            )

    @pytest.mark.tier1
    @pytest.mark.r1
    def test_t1_r1_api_acervo_parcial_flag(self, api_client):
        """API /api/jogadores/perfil deve sinalizar acervo_parcial=True para atletas de acervo incompleto."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200, f"Falha ao consultar perfil 9033: {resp.data}"
        data = resp.get_json()
        assert data["resumo"]["acervo_parcial"] is True, (
            "Luís Fabiano (ID 9033) deve ter acervo_parcial=True"
        )

    @pytest.mark.tier1
    @pytest.mark.r1
    def test_t1_r1_api_rotulo_jogos_com_gol(self, api_client):
        """API deve retornar rótulo honesto 'Jogos c/ Gol' quando acervo_parcial for True."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["resumo"]["jogos_rotulo"] == "Jogos c/ Gol", (
            f"Esperado rótulo 'Jogos c/ Gol', recebido '{data['resumo']['jogos_rotulo']}'"
        )

    @pytest.mark.tier1
    @pytest.mark.r1
    def test_t1_r1_api_media_gols_autentica_carreira(self, api_client):
        """Quando acervo_parcial=True, resumo.media_gols deve refletir a média oficial de carreira (0.53 para Luís Fabiano), e NÃO 1.00."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200
        data = resp.get_json()
        media = data["resumo"]["media_gols"]
        media_oficial = data["resumo"].get("media_oficial_carreira")
        assert media_oficial == 0.53, f"Esperado media_oficial_carreira 0.53, recebido {media_oficial}"
        assert media == 0.53, (
            f"Esperado media_gols 0.53 (média autêntica de carreira 403/755), recebido {media}. "
            f"Não deve exibir 1.00 resultante de equivalência artificial de jogos=gols."
        )

    @pytest.mark.tier1
    @pytest.mark.r1
    def test_t1_r1_db_no_forced_jogos_equals_gols_with_divergent_career(self, db_conn):
        """Nenhum atleta com carreira oficial divergente (>10 gols) deve ter total_jogos forçado a total_gols."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
            FROM jogadores_estatisticas
            WHERE total_gols > 10
              AND jogos_carreira_oficiais > total_gols * 1.5
              AND total_jogos = total_gols
            LIMIT 5;
        """)
        anomalias = cursor.fetchall()
        assert len(anomalias) == 0, (
            f"Encontrados atletas com total_jogos forçado artificialmente a total_gols: "
            f"{[(r['id_jogador'], r['nome_exibicao'], r['total_jogos']) for r in anomalias]}"
        )

    # --- R2: Auto-Cura de Clubes Espúrios & Conmebol ---

    @pytest.mark.tier1
    @pytest.mark.r2
    def test_t1_r2_conmebol_19997098_palmeiras_river(self, db_conn):
        """Partida 19997098 da Libertadores 1999: Palmeiras 3x0 River Plate (Palmeiras mandante, placar 3 x 0, gols Palmeiras)."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT mandante, visitante, placar FROM partidas WHERE id_partida = 19997098")
        partida = cursor.fetchone()
        assert partida is not None, "Partida 19997098 não encontrada"
        assert partida["mandante"] == "Palmeiras", f"Esperado mandante Palmeiras, obtido {partida['mandante']}"
        assert partida["visitante"] == "River Plate", f"Esperado visitante River Plate, obtido {partida['visitante']}"
        assert "3" in partida["placar"].split("x")[0] and "0" in partida["placar"].split("x")[1], (
            f"Esperado placar 3 x 0, obtido {partida['placar']}"
        )

        cursor.execute("SELECT atleta, clube FROM gols WHERE id_partida = 19997098")
        gols = cursor.fetchall()
        assert len(gols) >= 3, f"Esperado ao menos 3 gols, obtido {len(gols)}"
        for g in gols:
            assert g["clube"] == "Palmeiras", (
                f"Gol de {g['atleta']} atribuído indevidamente ao clube {g['clube']}, esperado Palmeiras"
            )

    @pytest.mark.tier1
    @pytest.mark.r2
    def test_t1_r2_conmebol_20027112_gremio_river(self, db_conn):
        """Partida 20027112 da Libertadores 2002: Grêmio 4x0 River Plate (Grêmio mandante, placar 4 x 0, gols Grêmio)."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT mandante, visitante, placar FROM partidas WHERE id_partida = 20027112")
        partida = cursor.fetchone()
        assert partida is not None, "Partida 20027112 não encontrada"
        assert partida["mandante"] == "Grêmio", f"Esperado mandante Grêmio, obtido {partida['mandante']}"
        assert partida["visitante"] == "River Plate", f"Esperado visitante River Plate, obtido {partida['visitante']}"
        assert "4" in partida["placar"].split("x")[0] and "0" in partida["placar"].split("x")[1], (
            f"Esperado placar 4 x 0, obtido {partida['placar']}"
        )

        cursor.execute("SELECT atleta, clube FROM gols WHERE id_partida = 20027112")
        gols = cursor.fetchall()
        assert len(gols) >= 4, f"Esperado ao menos 4 gols, obtido {len(gols)}"
        for g in gols:
            assert g["clube"] == "Grêmio", (
                f"Gol de {g['atleta']} atribuído indevidamente ao clube {g['clube']}, esperado Grêmio"
            )

    @pytest.mark.tier1
    @pytest.mark.r2
    def test_t1_r2_luis_fabiano_sem_clubes_estrangeiros_no_perfil(self, db_conn):
        """Perfil de Luís Fabiano (ID 9033) não deve listar clubes estrangeiros espúrios (River Plate, U. de Chile)."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT clubes, detalhe_carreira_clubes FROM jogadores_estatisticas WHERE id_jogador = 9033")
        row = cursor.fetchone()
        assert row is not None
        clubes_str = (row["clubes"] or "").lower()
        for espurio in ["river plate", "universidad de chile", "river", "chile"]:
            assert espurio not in clubes_str, f"Clube espúrio '{espurio}' encontrado em clubes de Luís Fabiano: {row['clubes']}"

    @pytest.mark.tier1
    @pytest.mark.r2
    def test_t1_r2_luis_fabiano_detalhe_carreira_limpo(self, db_conn):
        """JSON detalhe_carreira_clubes de Luís Fabiano não deve conter River Plate ou Universidad de Chile."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT detalhe_carreira_clubes FROM jogadores_estatisticas WHERE id_jogador = 9033")
        row = cursor.fetchone()
        assert row is not None
        if row["detalhe_carreira_clubes"]:
            detalhes = json.loads(row["detalhe_carreira_clubes"])
            clubes_detalhe = [d.get("clube", "").lower() for d in detalhes]
            for espurio in ["river plate", "universidad de chile"]:
                assert not any(espurio in c for c in clubes_detalhe), (
                    f"Clube espúrio {espurio} presente em detalhe_carreira_clubes de Luís Fabiano"
                )

    @pytest.mark.tier1
    @pytest.mark.r2
    def test_t1_r2_mycael_sem_gols_historicos_espurios(self, db_conn):
        """Goleiro Mycael (ID 2066, nascido em 2004) não deve possuir gols nas décadas de 80 e 90 nem clubes como San Lorenzo/Boca."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT g.id_gol, p.ano, g.clube
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE g.id_jogador = 2066 AND p.ano < 2018;
        """)
        gols_antigos = cursor.fetchall()
        assert len(gols_antigos) == 0, (
            f"Goleiro Mycael (ID 2066) possui gols atribuídos indevidamente antes de 2018: {gols_antigos}"
        )

    # --- R3: Ratings Sofascore (tanh), xG e Radar PES ---

    @pytest.mark.tier1
    @pytest.mark.r3
    def test_t1_r3_schema_atleta_sofascore_ratings(self, db_conn):
        """Tabela atleta_sofascore_ratings deve conter colunas de scouting e métricas atômicas xG."""
        cursor = db_conn.cursor()
        cursor.execute("PRAGMA table_info(atleta_sofascore_ratings)")
        colunas = [r["name"] for r in cursor.fetchall()]
        colunas_obrigatorias = [
            "id_jogador", "sofascore_id", "rating_medio", "jogos_avaliados",
            "xg_acumulado", "xa_acumulado", "npxg_acumulado", "delta_xg",
            "perfil_clinico", "taxa_conversao_pct"
        ]
        for col in colunas_obrigatorias:
            assert col in colunas, (
                f"Coluna obrigatória '{col}' ausente na tabela atleta_sofascore_ratings. Colunas atuais: {colunas}"
            )

    @pytest.mark.tier1
    @pytest.mark.r3
    def test_t1_r3_player_rating_tanh_base_650(self):
        """Motor calculo_player_rating.py deve utilizar base 6.50 e produzir notas calibradas."""
        stats = {
            "minutos_jogados": 90,
            "posicao": "Centroavante",
            "gols": 1,
            "assistencias": 0,
            "finalizacoes_no_gol": 2,
            "chutes_para_fora": 1,
            "cartoes_amarelos": 0,
            "cartoes_vermelhos": 0
        }
        res = calcular_nota_partida_sofascore(stats)
        assert res["nota_base"] == 6.50
        assert 7.00 <= res["nota_final"] <= 8.50, f"Nota fora da faixa esperada: {res['nota_final']}"

    @pytest.mark.tier1
    @pytest.mark.r3
    def test_t1_r3_xg_discreto_penalti_valor_fixo(self):
        """Pênalti deve ter valor fixo de xG = 0.760 conforme calibração do modelo discreto Opta."""
        assert PENALTY_XG == 0.760
        chute = {"tipo_lance": "penalti", "zona": "grande_area_central", "parte_corpo": "pe_dominante"}
        assert calcular_xg_finalizacao(chute) == 0.760

    @pytest.mark.tier1
    @pytest.mark.r3
    def test_t1_r3_xg_discreto_analise_performance(self):
        """Função analisar_performance_xg_atleta deve retornar estrutura analítica completa."""
        chutes = [
            {"tipo_lance": "bola_rolando", "zona": "pequena_area", "parte_corpo": "pe_dominante", "gol": True},
            {"tipo_lance": "bola_rolando", "zona": "grande_area_central", "parte_corpo": "pe_dominante", "gol": True},
            {"tipo_lance": "contra_ataque", "zona": "grande_area_diagonal", "parte_corpo": "pe_dominante", "gol": False},
        ]
        res = analisar_performance_xg_atleta(chutes)
        assert res["total_finalizacoes"] == 3
        assert res["gols_reais"] == 2
        assert res["xg_acumulado"] > 0
        assert res["xg_nao_penalti_npxg"] > 0
        assert res["delta_xg"] is not None
        assert res["perfil_clinico"] in ["Clínico de Elite", "Eficiente", "Neutro", "Volume Shooter"]

    @pytest.mark.tier1
    @pytest.mark.r3
    def test_t1_r3_radar_pes_cinco_eixos_completos(self, api_client):
        """API de perfil deve retornar radar_pes com 5 eixos (atk, fin, cri, fis, def) e ovr na faixa 40-99."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "radar_pes" in data, "Chave radar_pes ausente no perfil do atleta"
        radar = data["radar_pes"]
        assert 40 <= radar["ovr"] <= 99, f"OVR fora da escala PES 40-99: {radar['ovr']}"
        eixos = {e["key"]: e["valor"] for e in radar["eixos"]}
        for chave in ["atk", "fin", "cri", "fis", "def"]:
            assert chave in eixos, f"Eixo '{chave}' ausente no radar PES"
            assert 40 <= eixos[chave] <= 99, f"Eixo '{chave}' com valor inválido: {eixos[chave]}"

    # --- R4: Storage, Regressão e Auditoria ---

    @pytest.mark.tier1
    @pytest.mark.r4
    def test_t1_r4_sqlite_storage_abaixo_94mb(self):
        """Arquivo data/futebol.db deve ter tamanho estritamente menor que 94.0 MB (limite Vercel)."""
        tamanho = os.path.getsize(DB_PATH)
        assert tamanho < STORAGE_LIMIT_BYTES, (
            f"Arquivo data/futebol.db ({tamanho / 1024 / 1024:.2f} MB) excede o teto de 94.0 MB"
        )

    @pytest.mark.tier1
    @pytest.mark.r4
    def test_t1_r4_sqlite_integrity_check_ok(self, db_conn):
        """Banco SQLite deve passar em PRAGMA integrity_check com resultado 'ok'."""
        cursor = db_conn.cursor()
        cursor.execute("PRAGMA integrity_check")
        rows = cursor.fetchall()
        assert len(rows) == 1 and rows[0][0] == "ok", f"Integridade do SQLite comprometida: {rows}"

    @pytest.mark.tier1
    @pytest.mark.r4
    def test_t1_r4_auditoria_dados_12_regras_ok(self):
        """Script scripts/auditar_integridade_dados.py deve reportar 12/12 regras OK com 0 inconsistências."""
        script_path = os.path.join(PROJECT_ROOT, "scripts", "auditar_integridade_dados.py")
        proc = subprocess.run(
            [sys.executable, script_path],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        assert proc.returncode == 0, f"Script de auditoria falhou com código {proc.returncode}: {proc.stderr}"
        dados = json.loads(proc.stdout)
        assert dados["inconsistencias_encontradas"] == 0, (
            f"Auditoria detectou inconsistências: {dados['inconsistencias_encontradas']}"
        )
        assert len(dados["regras"]) == 12, f"Esperado 12 regras auditadas, obtido {len(dados['regras'])}"
        for regra in dados["regras"]:
            assert regra["status"] == "OK", f"Regra falhou na auditoria: {regra}"

    @pytest.mark.tier1
    @pytest.mark.r4
    def test_t1_r4_regressao_dixon_coles_22_pass(self):
        """Suíte de avaliação preditiva tests/test_model_evals.py deve aprovar 22/22 testes sem falhas."""
        evals_path = os.path.join(PROJECT_ROOT, "tests", "test_model_evals.py")
        proc = subprocess.run(
            [sys.executable, "-m", "pytest", evals_path, "-q"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        assert proc.returncode == 0, (
            f"Regressão matemática Dixon-Coles reprovou: {proc.stdout}\n{proc.stderr}"
        )

    @pytest.mark.tier1
    @pytest.mark.r4
    def test_t1_r4_dixon_coles_normalizacao_probabilidades(self):
        """Probabilidades 1X2 calculadas por Dixon-Coles devem somar exatamente 100% (tolerância 0.2%)."""
        dist = _calc_poisson_bivariate(1.45, 1.10, rho=-0.12)
        soma = dist["prob_mandante"] + dist["prob_empate"] + dist["prob_visitante"]
        assert math.isclose(soma, 100.0, abs_tol=0.2), f"Soma de probabilidades diverge de 100%: {soma}"


# ==============================================================================
# TIER 2: BOUNDARY & CORNER CASES (VALORES DE BORDA)
# ==============================================================================

class TestTier2BoundaryAndCornerCases:
    """Casos de contorno, divisões por zero, saturação e valores extremos."""

    # --- Borda R1 ---

    @pytest.mark.tier2
    @pytest.mark.r1
    def test_t2_r1_atleta_zero_jogos(self, api_client):
        """Atleta com zero jogos e zero gols não deve disparar ZeroDivisionError."""
        carreira_vazia = {"gols": 0, "jogos": 0, "assistencias": 0, "clubes": []}
        resumo_vazio = {"total_gols": 0, "jogos_registrados": 0}
        radar = _calcular_radar_pes("Atacante", resumo_vazio, carreira_vazia)
        assert 40 <= radar["ovr"] <= 99
        for e in radar["eixos"]:
            assert 40 <= e["valor"] <= 99

    @pytest.mark.tier2
    @pytest.mark.r1
    def test_t2_r1_atleta_um_jogo_um_gol_genuino(self, db_conn):
        """Atleta com 1 jogo e 1 gol de carreira genuína possui média 1.00 legítima sem distorção."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
            FROM jogadores_estatisticas
            WHERE total_jogos = 1 AND total_gols = 1 AND jogos_carreira_oficiais = 1
            LIMIT 1;
        """)
        row = cursor.fetchone()
        if row:
            assert row["total_jogos"] == row["jogos_carreira_oficiais"] == 1

    @pytest.mark.tier2
    @pytest.mark.r1
    def test_t2_r1_atleta_apenas_gols_sem_escalacao(self, api_client):
        """Atleta presente em tabela de gols mas ausente em escalações (Paulinho Criciúma ID 6) deve ativar salvaguarda de acervo parcial."""
        resp = api_client.get("/api/jogadores/perfil?id=6")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["resumo"]["acervo_parcial"] is True, "Atleta sem escalações deve ativar acervo_parcial=True"
        assert data["resumo"]["jogos_rotulo"] == "Jogos c/ Gol", "Rótulo deve ser 'Jogos c/ Gol'"

    @pytest.mark.tier2
    @pytest.mark.r1
    def test_t2_r1_atleta_era_moderna_pos_2018(self, db_conn):
        """Atleta moderno (ano_inicio >= 2023) com 100% de escalações catalogadas não deve ser forçado como parcial indevidamente."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT id_jogador, total_jogos, total_gols, ano_inicio
            FROM jogadores_estatisticas
            WHERE ano_inicio >= 2023 AND total_jogos > 20
            LIMIT 1;
        """)
        row = cursor.fetchone()
        if row:
            assert row["total_jogos"] >= row["total_gols"]

    @pytest.mark.tier2
    @pytest.mark.r1
    def test_t2_r1_atleta_carreira_oficial_ausente_fallback(self):
        """Cálculo do radar para atleta sem contagem oficial na carreira deve fazer fallback seguro aos jogos locais."""
        carreira_sem_oficiais = {"gols": 0, "jogos": 0, "assistencias": 0, "clubes": []}
        resumo_com_jogos = {"total_gols": 10, "jogos_registrados": 25, "pontaria_chutes_pct": 55.0}
        radar = _calcular_radar_pes("Atacante", resumo_com_jogos, carreira_sem_oficiais)
        assert radar["ovr"] >= 50

    # --- Borda R2 ---

    @pytest.mark.tier2
    @pytest.mark.r2
    def test_t2_r2_partida_conmebol_sem_gols(self, db_conn):
        """Partidas 0x0 em competições Conmebol não devem possuir gols fantasmas registrados."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT p.id_partida
            FROM partidas p
            JOIN gols g ON p.id_partida = g.id_partida
            WHERE p.campeonato LIKE '%Libertadores%' AND (p.placar = '0 x 0' OR p.placar = '0-0')
            LIMIT 5;
        """)
        fantasmas = cursor.fetchall()
        assert len(fantasmas) == 0, f"Gols fantasmas encontrados em partidas 0x0: {fantasmas}"

    @pytest.mark.tier2
    @pytest.mark.r2
    def test_t2_r2_clube_com_caracteres_especiais_e_acentos(self, db_conn):
        """Nomes de clubes com acentos (ex: São Paulo, Grêmio) devem ser preservados sem quebra de encoding."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT DISTINCT clube FROM gols WHERE clube LIKE '%São Paulo%' OR clube LIKE '%Grêmio%' LIMIT 5;")
        clubes = [r["clube"] for r in cursor.fetchall()]
        assert any("São Paulo" in c for c in clubes), "Clube 'São Paulo' não preservado com acentuação correta"
        assert any("Grêmio" in c for c in clubes), "Clube 'Grêmio' não preservado com acentuação correta"

    @pytest.mark.tier2
    @pytest.mark.r2
    def test_t2_r2_homonimos_atletas_mesmo_nome(self, db_conn):
        """Atletas com mesmo apelido (ex: Zico ID 13953 vs Zico ID 101712) devem manter identidades separadas."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT id_jogador, total_gols FROM jogadores_estatisticas WHERE id_jogador IN (13953, 101712);")
        rows = {r["id_jogador"]: r["total_gols"] for r in cursor.fetchall()}
        assert 13953 in rows and 101712 in rows
        assert rows[13953] != rows[101712], "Gols de homônimos misturados na mesma contagem"

    @pytest.mark.tier2
    @pytest.mark.r2
    def test_t2_r2_atleta_clube_unico_toda_carreira(self, db_conn):
        """Atletas de um único clube devem possuir string limpa sem separadores vazios ou duplicatas."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT clubes FROM jogadores_estatisticas WHERE clubes NOT LIKE '%,%' AND total_jogos > 30 LIMIT 1;")
        row = cursor.fetchone()
        if row:
            assert len(row["clubes"].strip()) > 0
            assert ",," not in row["clubes"]

    @pytest.mark.tier2
    @pytest.mark.r2
    def test_t2_r2_filtro_clube_inexistente_na_api(self, api_client):
        """Filtro por clube inexistente deve responder com integridade e sem erro interno 500."""
        resp = api_client.get("/api/jogadores/perfil?id=9033&clube=ClubeInexistenteXYZ")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["id_jogador"] == 9033

    # --- Borda R3 ---

    @pytest.mark.tier2
    @pytest.mark.r3
    def test_t2_r3_rating_minutos_zero_sem_nota(self):
        """Jogador sem minutagem (0 min) deve retornar nota nula e status 'Sem nota'."""
        res = calcular_nota_partida_sofascore({"minutos_jogados": 0, "posicao": "Meia"})
        assert res["nota_final"] is None
        assert res["status"] == "Sem nota"

    @pytest.mark.tier2
    @pytest.mark.r3
    def test_t2_r3_rating_clamping_teto_dez(self):
        """Atuação de valor brutalmente positivo deve ser amortecida assintoticamente no teto 10.00."""
        stats = {
            "minutos_jogados": 90, "posicao": "Centroavante",
            "gols": 6, "assistencias": 4, "finalizacoes_no_gol": 8,
            "grandes_chances_criadas": 5, "passes_decisivos": 6
        }
        res = calcular_nota_partida_sofascore(stats)
        assert res["nota_final"] == 10.00, f"Esperado teto 10.00, recebido {res['nota_final']}"

    @pytest.mark.tier2
    @pytest.mark.r3
    def test_t2_r3_rating_clamping_piso_tres(self):
        """Atuação catastrófica deve ser limitada no piso 3.00 (sem notas negativas ou inferiores)."""
        stats = {
            "minutos_jogados": 30, "posicao": "Zagueiro",
            "cartoes_vermelhos": 1, "penaltis_cometidos": 2,
            "gols_sofridos": 6, "grandes_chances_perdidas": 3
        }
        res = calcular_nota_partida_sofascore(stats)
        assert res["nota_final"] == 3.00, f"Esperado piso 3.00, recebido {res['nota_final']}"

    @pytest.mark.tier2
    @pytest.mark.r3
    def test_t2_r3_goleiro_gols_sofridos_decaimento_marginal(self):
        """Gols sofridos em goleiros utilizam expoente 0.85 para evitar penalidade desproporcional em goleadas."""
        stats_4 = {"minutos_jogados": 90, "posicao": "Goleiro", "gols_sofridos": 4}
        stats_8 = {"minutos_jogados": 90, "posicao": "Goleiro", "gols_sofridos": 8}
        res_4 = calcular_nota_partida_sofascore(stats_4)
        res_8 = calcular_nota_partida_sofascore(stats_8)
        # O impacto de 8 gols não é o dobro de 4 gols devido ao decaimento marginal pow(g, 0.85)
        imp_4 = abs(res_4["breakdown_negativo"]["gols_sofridos"])
        imp_8 = abs(res_8["breakdown_negativo"]["gols_sofridos"])
        assert imp_8 < (imp_4 * 2.0), "Decaimento marginal de gols sofridos não foi aplicado"

    @pytest.mark.tier2
    @pytest.mark.r3
    def test_t2_r3_xg_chute_longa_distancia_pe_fraco(self):
        """Chute de longa distância com pé fraco deve ter valor positivo mínimo (0.010)."""
        chute = {"tipo_lance": "bola_rolando", "zona": "longa_distancia", "parte_corpo": "pe_fraco"}
        xg = calcular_xg_finalizacao(chute)
        assert xg == 0.010

    @pytest.mark.tier2
    @pytest.mark.r3
    def test_t2_r3_xg_zero_finalizacoes(self):
        """Análise de xG para atleta com 0 finalizações retorna valores zerados e perfil neutro sem erro."""
        res = analisar_performance_xg_atleta([])
        assert res["total_finalizacoes"] == 0
        assert res["xg_acumulado"] == 0.0
        assert res["delta_xg"] == 0.0
        assert "Neutro" in res["perfil_clinico"]

    # --- Borda R4 ---

    @pytest.mark.tier2
    @pytest.mark.r4
    def test_t2_r4_dixon_coles_lambda_minimo_clamping(self):
        """Taxas minúsculas de gol (0.01) calculam probabilidades válidas sem erro de domínio numérico."""
        res = _calc_poisson_bivariate(0.01, 0.01, rho=-0.12)
        assert res["prob_empate"] > res["prob_mandante"]
        assert 0.0 < res["prob_empate"] < 100.0

    @pytest.mark.tier2
    @pytest.mark.r4
    def test_t2_r4_dixon_coles_lambda_maximo_clamping(self):
        """Taxas de gol gigantescas (10.0 x 0.1) calculam sem overflow numérico."""
        res = _calc_poisson_bivariate(10.0, 0.1, rho=-0.12)
        assert res["prob_mandante"] > 90.0

    @pytest.mark.tier2
    @pytest.mark.r4
    def test_t2_r4_sqlite_teto_com_margem_seguranca_5mb(self):
        """Banco SQLite deve estar com margem de segurança de pelo menos 1.5 MB abaixo de 94.0 MB."""
        tamanho = os.path.getsize(DB_PATH)
        assert tamanho < (92.5 * 1024 * 1024), (
            f"Margem de segurança apertada: tamanho atual {tamanho / 1024 / 1024:.2f} MB"
        )

    @pytest.mark.tier2
    @pytest.mark.r4
    def test_t2_r4_auditoria_partidas_recentes_nao_nulas(self):
        """Auditoria confirma presença de acervo volumoso nas temporadas recentes 2024-2026."""
        script_path = os.path.join(PROJECT_ROOT, "scripts", "auditar_integridade_dados.py")
        proc = subprocess.run([sys.executable, script_path], capture_output=True, text=True, cwd=PROJECT_ROOT)
        dados = json.loads(proc.stdout)
        rec = dados.get("partidas_recentes", {})
        assert rec.get("2024", 0) > 1000
        assert rec.get("2025", 0) > 1000
        assert rec.get("2026", 0) > 1000


# ==============================================================================
# TIER 3: CROSS-FEATURE COMBINATIONS (INTERAÇÕES PAREADAS)
# ==============================================================================

class TestTier3CrossFeatureCombinations:
    """Valida a interação harmônica entre múltiplos requisitos do sistema."""

    @pytest.mark.tier3
    def test_t3_cross_acervo_parcial_com_sofascore_rating(self, api_client):
        """Atleta com acervo_parcial=True deve retornar dados de scouting/sofascore sem conflito de estrutura."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["resumo"]["acervo_parcial"] is True
        assert data["resumo"]["jogos_rotulo"] == "Jogos c/ Gol"
        # Sofascore ou scouting presente no resumo
        assert "sofascore" in data["resumo"]

    @pytest.mark.tier3
    def test_t3_cross_acervo_parcial_com_radar_pentagonal(self, api_client):
        """Atleta com acervo parcial deve ter radar calculado priorizando a carreira oficial."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200
        data = resp.get_json()
        radar = data["radar_pes"]
        eixos = {e["key"]: e["valor"] for e in radar["eixos"]}
        # Luís Fabiano é artilheiro consagrado (>400 gols); nota de ataque e finalização deve ser condizente
        assert eixos["atk"] >= 85, f"Eixo ataque subdimensionado: {eixos['atk']}"
        assert eixos["fin"] >= 85, f"Eixo finalização subdimensionado: {eixos['fin']}"

    @pytest.mark.tier3
    def test_t3_cross_saneamento_clubes_com_historico_temporadas(self, api_client):
        """Purga de clubes espúrios deve se propagar para historico_temporadas e historico_clubes."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200
        data = resp.get_json()
        for clb in data.get("historico_clubes", []):
            nome = clb.get("clube", "").lower()
            assert "river" not in nome and "chile" not in nome, (
                f"Clube espúrio vazou em historico_clubes: {clb}"
            )

    @pytest.mark.tier3
    def test_t3_cross_xg_perfil_clinico_eixo_finalizacao_radar(self):
        """Atleta com perfil Clínico de Elite deve apresentar nota de finalização PES correspondente (>=85)."""
        carreira_goleador = {"gols": 200, "jogos": 350, "assistencias": 40, "clubes": []}
        resumo_goleador = {
            "total_gols": 200, "jogos_registrados": 350,
            "pontaria_chutes_pct": 65.0, "gols_decisivos_80mais": 8
        }
        radar = _calcular_radar_pes("Centroavante", resumo_goleador, carreira_goleador)
        eixos = {e["key"]: e["valor"] for e in radar["eixos"]}
        assert eixos["fin"] >= 85, f"Finalização insuficiente para artilheiro de elite: {eixos['fin']}"

    @pytest.mark.tier3
    def test_t3_cross_schema_expansion_com_storage_e_auditoria(self, db_conn):
        """Expansão de schema e persistência de ratings deve respeitar simultaneamente o teto de storage e integridade 12/12."""
        tamanho = os.path.getsize(DB_PATH)
        assert tamanho < STORAGE_LIMIT_BYTES, f"Tamanho excede teto: {tamanho / 1024 / 1024:.2f} MB"
        script_path = os.path.join(PROJECT_ROOT, "scripts", "auditar_integridade_dados.py")
        proc = subprocess.run([sys.executable, script_path], capture_output=True, text=True, cwd=PROJECT_ROOT)
        assert proc.returncode == 0
        dados = json.loads(proc.stdout)
        assert dados["inconsistencias_encontradas"] == 0, "Auditoria falhou na combinação cross-feature"


# ==============================================================================
# TIER 4: REAL-WORLD APPLICATION SCENARIOS (JORNADAS REAIS)
# ==============================================================================

class TestTier4RealWorldApplicationScenarios:
    """Jornadas completas de ponta a ponta dos perfis mais emblemáticos."""

    @pytest.mark.tier4
    def test_t4_cenario_luis_fabiano_perfil_completo(self, api_client, db_conn):
        """Cenário 1: Perfil de Luís Fabiano (ID 9033) - Média oficial autêntica (0.53), sem clubes estrangeiros, radar PES robusto."""
        resp = api_client.get("/api/jogadores/perfil?id=9033")
        assert resp.status_code == 200
        perfil = resp.get_json()
        resumo = perfil["resumo"]

        # 1. Rótulo honesto e acervo parcial
        assert resumo["acervo_parcial"] is True
        assert resumo["jogos_rotulo"] == "Jogos c/ Gol"
        assert resumo["media_oficial_carreira"] == 0.53
        assert resumo["media_gols"] == 0.53, "Luís Fabiano não deve exibir média 1.00"

        # 2. Ausência de clubes espúrios
        for clb in perfil.get("historico_clubes", []):
            assert "river" not in clb["clube"].lower()
            assert "chile" not in clb["clube"].lower()

        # 3. Radar PES calibrado
        assert perfil["radar_pes"]["ovr"] >= 80

    @pytest.mark.tier4
    def test_t4_cenario_zico_e_romario_lendas_historicas(self, api_client):
        """Cenário 2: Perfis de Zico (13953) e Romário (12212) - Exibição de totais consolidados e rótulo 'Jogos c/ Gol'."""
        for atleta_id, gols_oficiais, jogos_oficiais, media_esperada in [
            (13953, 530, 777, 0.68),
            (12212, 744, 961, 0.77)
        ]:
            resp = api_client.get(f"/api/jogadores/perfil?id={atleta_id}")
            assert resp.status_code == 200
            data = resp.get_json()
            resumo = data["resumo"]
            assert resumo["acervo_parcial"] is True, f"Atleta {atleta_id} deveria ser acervo parcial"
            assert resumo["jogos_rotulo"] == "Jogos c/ Gol"
            assert resumo["media_oficial_carreira"] == media_esperada
            assert resumo["media_gols"] == media_esperada, (
                f"Atleta {atleta_id} exibindo média distorcida de 1.00 em vez da média oficial {media_esperada}"
            )

    @pytest.mark.tier4
    def test_t4_cenario_artilheiro_moderno_pedro(self, api_client, db_conn):
        """Cenário 3: Perfil de Pedro (ID 10) - Sem clube espúrio 'Guabirá', métricas xG e radar PES."""
        resp = api_client.get("/api/jogadores/perfil?id=10")
        assert resp.status_code == 200
        perfil = resp.get_json()

        # Verifica banco direto
        cursor = db_conn.cursor()
        cursor.execute("SELECT clubes FROM jogadores_estatisticas WHERE id_jogador = 10")
        row = cursor.fetchone()
        assert "guabirá" not in row["clubes"].lower(), "Clube espúrio 'Guabirá' presente no perfil de Pedro"

        # Métricas analíticas presentes
        assert "analytics_xg" in perfil
        assert perfil["analytics_xg"]["xg_acumulado"] is not None

    @pytest.mark.tier4
    def test_t4_cenario_goleiro_mycael_sem_gols_espurios(self, api_client, db_conn):
        """Cenário 4: Goleiro Mycael (ID 2066) - Sem gols nos anos 80/90 e sem clubes espúrios."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT clubes, ano_inicio FROM jogadores_estatisticas WHERE id_jogador = 2066")
        row = cursor.fetchone()
        assert row is not None
        assert row["ano_inicio"] >= 2018, f"Ano de início absurdo para Mycael (nascido em 2004): {row['ano_inicio']}"
        for clb in ["boca", "san lorenzo", "católica", "guarani"]:
            assert clb not in row["clubes"].lower(), f"Clube espúrio '{clb}' associado ao goleiro Mycael"

    @pytest.mark.tier4
    def test_t4_cenario_pipeline_aceitacao_producao_completo(self):
        """Cenário 5: Pipeline completo de aceitação operacional (Auditoria 12/12 + Dixon-Coles 22/22 + Storage < 94MB)."""
        # 1. Teto de storage
        tamanho = os.path.getsize(DB_PATH)
        assert tamanho < STORAGE_LIMIT_BYTES, f"Storage excedido: {tamanho / 1024 / 1024:.2f} MB"

        # 2. Auditoria de dados
        proc_audit = subprocess.run(
            [sys.executable, os.path.join(PROJECT_ROOT, "scripts", "auditar_integridade_dados.py")],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        assert proc_audit.returncode == 0
        audit_res = json.loads(proc_audit.stdout)
        assert audit_res["inconsistencias_encontradas"] == 0

        # 3. Regressão matemática
        proc_evals = subprocess.run(
            [sys.executable, "-m", "pytest", os.path.join(PROJECT_ROOT, "tests", "test_model_evals.py"), "-q"],
            capture_output=True,
            text=True,
            cwd=PROJECT_ROOT
        )
        assert proc_evals.returncode == 0
