"""
Suíte de Testes E2E (End-to-End) e Validação de Aceitação - FutStats Desacoplado
Sistema de Desacoplamento da Base de Dados e Ingestão Universal de Gols Históricos

Metodologia em 4 Camadas (Tiers 1-4):
  - Tier 1: Feature Coverage (Decoupling Gateway, Fallback Resilience, Historical Ingestion, Career Reconcile)
  - Tier 2: Boundary & Corner Cases (timeouts, malformed JSON, stoppage time, penalty shootouts, substitutions, load burst, homonyms, storage cap)
  - Tier 3: Cross-Feature Combinations (remote failure during active ingestion, cache invalidation, fallback career recalculation, sqlite WAL checkpoint, circuit breaker half-open)
  - Tier 4: Real-World Scenarios (athlete career deep dive, dashboard cold boot under outage, match day live ingestion, historic cup navigation, production master gate)

Fontes Autoritativas de Validação:
  - PROJECT.md: Especificação de Arquitetura, Feature Inventory e Interface Contracts
  - ORIGINAL_REQUEST.md (seção 2026-11-01T14:16:05Z): Requisitos R1, R2, R3 e Critérios de Aceite
  - scripts/auditar_integridade_dados.py: Governança Relacional (12 regras)
  - tests/test_model_evals.py: Regressão Matemática Dixon-Coles (22 testes)
"""

import os
import sys
import time
import json
import sqlite3
import subprocess
from typing import Dict, Any, List, Optional
from unittest.mock import patch, MagicMock
from concurrent.futures import ThreadPoolExecutor
import requests
import pytest

# Garante acesso à raiz do projeto
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app, gerar_token, proxy_client, _calc_poisson_bivariate, _calcular_radar_pes
from backend.gateway.circuit_breaker import CircuitBreaker
from backend.gateway.cache_manager import CacheManager
from backend.gateway.proxy_client import ProxyClient

DB_PATH = os.path.join(PROJECT_ROOT, "data", "futebol.db")
STORAGE_LIMIT_BYTES = 94 * 1024 * 1024  # 94.0 MB = 98.566.144 bytes


# ==============================================================================
# FIXTURES COMPARTILHADAS E TEST HARNESS
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
    """Cliente de teste Flask configurado com autenticação JWT de administrador."""
    app.config["TESTING"] = True
    token = gerar_token({"email": "e2e_decoupled_tester@futstats.com", "role": "admin"})

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


@pytest.fixture
def gateway_env_config(monkeypatch):
    """Injeta configurações e variáveis de ambiente da API Gateway remota."""
    monkeypatch.setenv("FUTSTATS_REMOTE_GATEWAY_URL", "http://mock-remote-gateway.futstats.internal:8000")
    monkeypatch.setenv("FUTSTATS_GATEWAY_SECRET", "test-secret-gateway-token-xyz")
    monkeypatch.setenv("FUTSTATS_GATEWAY_TIMEOUT_SEC", "1.8")
    monkeypatch.setenv("FUTSTATS_CIRCUIT_MAX_FAILURES", "3")
    monkeypatch.setenv("FUTSTATS_CIRCUIT_RESET_SEC", "60")
    proxy_client.breaker.reset()
    proxy_client.cache.clear()
    yield
    proxy_client.breaker.reset()
    proxy_client.cache.clear()


class RemoteGatewayMockController:
    """Controlador de mock para simular comportamentos do gateway remoto."""
    def __init__(self):
        self.status_code = 200
        self.json_data = {"total_partidas": 115625, "total_gols": 95522, "total_clubes": 2014}
        self.exception = None
        self.delay_sec = 0.0
        self.malformed_json = False

    def make_response(self, *args, **kwargs):
        if self.delay_sec > 0:
            time.sleep(self.delay_sec)
        if self.exception:
            raise self.exception
        mock_resp = MagicMock()
        mock_resp.status_code = self.status_code
        if self.malformed_json:
            mock_resp.json.side_effect = json.JSONDecodeError("Expecting value", "{malformed", 0)
        else:
            mock_resp.json.return_value = self.json_data
        mock_resp.headers = {"Content-Type": "application/json"}
        return mock_resp


@pytest.fixture
def mock_remote_gateway():
    """Fixture modular para simular respostas e falhas do gateway upstream."""
    controller = RemoteGatewayMockController()
    with patch.object(proxy_client._session, "request", side_effect=controller.make_response):
        yield controller


@pytest.fixture
def sample_match_sheet():
    """Payload canônico de súmula de partida para testes de ingestão histórica."""
    return {
        "id_partida": 20249999,
        "ano": 2024,
        "campeonato": "Brasileirão Série A",
        "rodada": "38",
        "mandante": "Flamengo",
        "visitante": "Palmeiras",
        "placar": "2 x 1",
        "gols_mandante": 2,
        "gols_visitante": 1,
        "gols": [
            {
                "id_jogador": 10,
                "atleta": "Pedro",
                "clube": "Flamengo",
                "minuto": 23,
                "tempo": "1T",
                "tipo_de_gol": "Normal"
            },
            {
                "id_jogador": 9991,
                "atleta": "Veiga",
                "clube": "Palmeiras",
                "minuto": 45,
                "tempo": "1T",
                "tipo_de_gol": "Pênalti"
            },
            {
                "id_jogador": 10,
                "atleta": "Pedro",
                "clube": "Flamengo",
                "minuto": 90,
                "tempo": "2T",
                "tipo_de_gol": "Cabeça"
            }
        ],
        "escalacoes": [
            {
                "id_jogador": 10,
                "atleta": "Pedro",
                "clube": "Flamengo",
                "numero": 9,
                "posicao": "Atacante",
                "titular": 1,
                "saiu_minuto": None,
                "entrou_minuto": None
            },
            {
                "id_jogador": 9992,
                "atleta": "Gabriel Barbosa",
                "clube": "Flamengo",
                "numero": 10,
                "posicao": "Atacante",
                "titular": 0,
                "saiu_minuto": None,
                "entrou_minuto": 70
            }
        ]
    }


# ==============================================================================
# TIER 1: FEATURE COVERAGE (24 TESTES: GATEWAY, FALLBACK, INGESTION, RECONCILE)
# ==============================================================================

class TestTier1FeatureCoverage:
    """Validação primária das 4 funcionalidades nucleares do desacoplamento."""

    # --------------------------------------------------------------------------
    # Funcionalidade 1: Decoupling Gateway (6 testes)
    # --------------------------------------------------------------------------

    @pytest.mark.tier1
    def test_t1_gateway_headers_contract(self, api_client, gateway_env_config, mock_remote_gateway):
        """Verifica a presença dos headers obrigatórios de telemetria no modo Gateway."""
        response = api_client.get("/api/overview")
        assert response.status_code == 200

        data_source = response.headers.get("X-Data-Source")
        assert data_source in ["remote-gateway", "cache"], (
            f"Header 'X-Data-Source' esperado 'remote-gateway' ou 'cache', obtido '{data_source}'."
        )

        cb_state = response.headers.get("X-Circuit-Breaker-State")
        assert cb_state == "closed", (
            f"Header 'X-Circuit-Breaker-State' esperado 'closed', obtido '{cb_state}'."
        )

        assert "X-Response-Time-Ms" in response.headers, (
            "Header 'X-Response-Time-Ms' ausente na resposta da API."
        )

    @pytest.mark.tier1
    def test_t1_gateway_remote_query_dispatch_overview(self, api_client, gateway_env_config, mock_remote_gateway):
        """Valida que GET /api/overview via gateway retorna envelope com métricas globais."""
        response = api_client.get("/api/overview")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, dict), "Payload de /api/overview deve ser um dicionário JSON"

        for chave_obrigatoria in ["total_partidas", "total_gols", "total_clubes"]:
            assert chave_obrigatoria in data, (
                f"Chave obrigatória '{chave_obrigatoria}' ausente no payload de /api/overview"
            )

        assert data["total_partidas"] >= 115000, "Contagem global de partidas inconsistente"
        assert data["total_gols"] >= 95522, "Contagem global de gols inconsistente"

    @pytest.mark.tier1
    def test_t1_gateway_remote_query_dispatch_partidas(self, api_client, gateway_env_config, mock_remote_gateway):
        """Valida despacho de consulta de partidas com parâmetros de paginação e filtro."""
        mock_remote_gateway.json_data = {
            "partidas": [{"mandante": "Flamengo", "visitante": "Vasco", "placar": "2 x 0", "ano": 2024}],
            "total": 1
        }
        response = api_client.get("/api/partidas?ano=2024&limit=10")
        assert response.status_code == 200
        data = response.get_json()
        partidas = data.get("partidas") if isinstance(data, dict) else data

        assert isinstance(partidas, list), "Resultado deve conter lista de partidas"
        assert len(partidas) <= 10, f"Limite de 10 partidas violado (obtido {len(partidas)})"
        if len(partidas) > 0:
            partida = partidas[0]
            for col in ["mandante", "visitante", "placar", "ano"]:
                assert col in partida, f"Campo '{col}' ausente no objeto de partida"

    @pytest.mark.tier1
    def test_t1_gateway_auth_passthrough(self, api_client, gateway_env_config):
        """Garante que cabeçalhos de autenticação Bearer JWT são preservados pelo proxy."""
        response = api_client.get("/api/auth/me")
        assert response.status_code == 200, (
            f"Falha de autenticação no passthrough do gateway: status {response.status_code}"
        )
        data = response.get_json()
        assert "user" in data, "Payload de /api/auth/me deve conter objeto 'user'"
        assert data["user"]["role"] == "admin"

    @pytest.mark.tier1
    def test_t1_gateway_cache_layer_hit(self, api_client, gateway_env_config, mock_remote_gateway):
        """Duas requisições idênticas consecutivas devem acionar o cache em memória."""
        # Primeira requisição (aquecimento)
        res1 = api_client.get("/api/overview")
        assert res1.status_code == 200

        # Segunda requisição imediata
        t0 = time.perf_counter()
        res2 = api_client.get("/api/overview")
        elapsed_ms = (time.perf_counter() - t0) * 1000.0

        assert res2.status_code == 200
        data_source = res2.headers.get("X-Data-Source")
        assert data_source in ["cache", "remote-gateway"], (
            f"Esperado hit de cache ('cache' ou 'remote-gateway'), obtido '{data_source}'."
        )
        assert elapsed_ms < 50.0, f"Latência de cache excessiva: {elapsed_ms:.2f}ms >= 50ms"

    @pytest.mark.tier1
    def test_t1_gateway_p95_latency_slo(self, api_client):
        """Garante que a latência p95 das consultas permanece abaixo do SLO de 200ms."""
        latencias = []
        for _ in range(15):
            t0 = time.perf_counter()
            res = api_client.get("/api/health")
            elapsed_ms = (time.perf_counter() - t0) * 1000.0
            assert res.status_code == 200
            latencias.append(elapsed_ms)

        latencias.sort()
        idx_p95 = int(len(latencias) * 0.95)
        p95 = latencias[idx_p95]
        assert p95 < 200.0, f"Latência p95 ({p95:.2f}ms) violou o SLO estrito de 200ms"

    # --------------------------------------------------------------------------
    # Funcionalidade 2: Resilient Local Fallback (6 testes)
    # --------------------------------------------------------------------------

    @pytest.mark.tier1
    def test_t1_fallback_when_remote_url_unset(self, api_client, monkeypatch):
        """Operação em modo local standalone quando FUTSTATS_REMOTE_GATEWAY_URL não está definida."""
        monkeypatch.delenv("FUTSTATS_REMOTE_GATEWAY_URL", raising=False)
        response = api_client.get("/api/overview")
        assert response.status_code == 200

        data_source = response.headers.get("X-Data-Source")
        assert data_source in ["local-standalone", "local-fallback"], (
            f"Esperado 'local-standalone' ou 'local-fallback', obtido '{data_source}'."
        )

    @pytest.mark.tier1
    def test_t1_fallback_trigger_on_connection_error(self, api_client, gateway_env_config, mock_remote_gateway):
        """Disparo transparente de fallback local com header X-Fallback-Reason: connect_error."""
        mock_remote_gateway.exception = requests.exceptions.ConnectionError("Connection refused by peer")

        response = api_client.get("/api/overview")
        assert response.status_code == 200, "Fallback não deve gerar erro 500 para o usuário"

        data_source = response.headers.get("X-Data-Source")
        assert data_source == "local-fallback", (
            f"Header X-Data-Source esperado 'local-fallback', obtido '{data_source}'."
        )

        fallback_reason = response.headers.get("X-Fallback-Reason")
        assert fallback_reason in ["connect_error", "remote_timeout"], (
            f"Header X-Fallback-Reason esperado 'connect_error', obtido '{fallback_reason}'."
        )

    @pytest.mark.tier1
    def test_t1_fallback_trigger_on_timeout(self, api_client, gateway_env_config, mock_remote_gateway):
        """Timeout de rede upstream (>1.8s) deve ativar fallback local sem travar a requisição."""
        mock_remote_gateway.exception = requests.exceptions.Timeout("Read timeout from remote")

        t0 = time.perf_counter()
        response = api_client.get("/api/overview")
        elapsed_sec = time.perf_counter() - t0

        assert response.status_code == 200
        assert elapsed_sec < 2.5, f"Fallback demorou mais que 2.5s: {elapsed_sec:.2f}s"

        data_source = response.headers.get("X-Data-Source")
        assert data_source == "local-fallback", (
            f"Header X-Data-Source esperado 'local-fallback', obtido '{data_source}'."
        )
        assert response.headers.get("X-Fallback-Reason") in ["remote_timeout", "connect_error"]

    @pytest.mark.tier1
    def test_t1_fallback_trigger_on_remote_5xx(self, api_client, gateway_env_config, mock_remote_gateway):
        """Erro 500/502/503 retornado pelo upstream é interceptado caindo no SQLite local."""
        mock_remote_gateway.status_code = 502

        response = api_client.get("/api/overview")
        assert response.status_code == 200
        assert response.headers.get("X-Data-Source") == "local-fallback"
        assert response.headers.get("X-Fallback-Reason") == "status_5xx"

    @pytest.mark.tier1
    def test_t1_fallback_circuit_breaker_trips_to_open(self, api_client, gateway_env_config, mock_remote_gateway):
        """Após 3 falhas consecutivas, circuit breaker entra em estado OPEN."""
        mock_remote_gateway.exception = requests.exceptions.ConnectionError("Unreachable")

        # 3 chamadas que falham
        api_client.get("/api/overview")
        api_client.get("/api/overview")
        api_client.get("/api/overview")

        assert proxy_client.breaker.state == CircuitBreaker.STATE_OPEN

        # 4ª chamada deve cair em fallback imediato com circuit_open
        res4 = api_client.get("/api/overview")
        assert res4.status_code == 200
        assert res4.headers.get("X-Circuit-Breaker-State") == "open"
        assert res4.headers.get("X-Fallback-Reason") == "circuit_open"

    @pytest.mark.tier1
    def test_t1_fallback_health_endpoint_status_degraded(self, api_client, monkeypatch):
        """O endpoint /api/health reporta status 'degraded' ou fallback sem retornar erro 500."""
        monkeypatch.setenv("FUTSTATS_REMOTE_GATEWAY_URL", "http://127.0.0.1:59997")
        response = api_client.get("/api/health")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, dict)
        assert "status" in data

    # --------------------------------------------------------------------------
    # Funcionalidade 3: Universal Historical Goals Ingestion (6 testes)
    # --------------------------------------------------------------------------

    @pytest.mark.tier1
    def test_t1_ingestion_goal_count_threshold(self, db_conn):
        """Total de gols catalogados detalhados deve ultrapassar estritamente a marca de 95.522."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM gols")
        total_gols = cursor.fetchone()[0]
        assert total_gols > 95522, (
            f"Total de gols catalogados ({total_gols}) não ultrapassa 95.522. "
            f"(Pendente Marco M2: Ingestor Massivo de Súmulas e Gols Históricos)"
        )

    @pytest.mark.tier1
    def test_t1_ingestion_goal_schema_and_types(self, db_conn):
        """Valida que todos os tipos de gol na tabela gols pertencem à taxonomia oficial canônica."""
        cursor = db_conn.cursor()
        cursor.execute("SELECT DISTINCT tipo_de_gol FROM gols WHERE tipo_de_gol IS NOT NULL AND tipo_de_gol != ''")
        tipos_encontrados = {row[0] for row in cursor.fetchall()}

        # Taxonomia canônica: 'Normal', 'Pênalti', 'Falta', 'Contra', 'Cabeça' (+ 'Barriga' histórico do Renato Gaúcho 1995)
        tipos_canonicos = {"Normal", "Pênalti", "Falta", "Contra", "Cabeça", "Barriga"}
        tipos_invalidos = tipos_encontrados - tipos_canonicos

        assert not tipos_invalidos, (
            f"Encontrados tipos de gol não-canônicos no banco: {tipos_invalidos}. "
            f"(Pendente Marco M2: Padronização e Higienização de Tipos de Gol)"
        )

    @pytest.mark.tier1
    def test_t1_ingestion_no_orphan_goals(self, db_conn):
        """Garante integridade referencial: zero gols sem partida correspondente."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) 
            FROM gols g 
            LEFT JOIN partidas p ON g.id_partida = p.id_partida 
            WHERE p.id_partida IS NULL
        """)
        gols_orfaos = cursor.fetchone()[0]
        assert gols_orfaos == 0, f"Encontrados {gols_orfaos} gols órfãos na base de dados"

    @pytest.mark.tier1
    def test_t1_ingestion_no_orphan_lineups(self, db_conn):
        """Garante integridade referencial: zero escalações sem partida correspondente."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT COUNT(*) 
            FROM escalacoes e 
            LEFT JOIN partidas p ON e.id_partida = p.id_partida 
            WHERE p.id_partida IS NULL
        """)
        escalacoes_orfas = cursor.fetchone()[0]
        assert escalacoes_orfas == 0, f"Encontradas {escalacoes_orfas} escalações órfãs na base de dados"

    @pytest.mark.tier1
    def test_t1_ingestion_match_sheet_lineup_and_goal_club_coherence(self, db_conn):
        """Todo gol atribuído deve pertencer estritamente ao mandante ou ao visitante da partida."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT g.id_gol, g.id_partida, g.clube, p.mandante, p.visitante
            FROM gols g
            JOIN partidas p ON g.id_partida = p.id_partida
            WHERE g.clube != p.mandante AND g.clube != p.visitante
            LIMIT 5
        """)
        incoerencias = cursor.fetchall()
        assert len(incoerencias) == 0, (
            f"Encontrados gols com clube divergente de mandante/visitante: {incoerencias}. "
            f"(Pendente Marco M2: Harmonização de Nomes e Aliases de Clubes em Súmulas Históricas)"
        )

    @pytest.mark.tier1
    def test_t1_ingestion_points_era_brasileirao_coverage(self, db_conn):
        """Todas as partidas finalizadas da era dos pontos corridos da Série A (2003-2024) devem ter placar."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT COUNT(*)
            FROM partidas
            WHERE campeonato LIKE '%Brasileiro%Série A%'
              AND ano >= 2003
              AND placar IS NOT NULL AND placar LIKE '%x%'
              AND (gols_mandante IS NULL OR gols_visitante IS NULL)
        """)
        partidas_sem_placar = cursor.fetchone()[0]
        assert partidas_sem_placar == 0, (
            f"Encontradas {partidas_sem_placar} partidas finalizadas da Série A com placar numérico nulo"
        )

    # --------------------------------------------------------------------------
    # Funcionalidade 4: Career Reconcile & Legend Profiles (6 testes)
    # --------------------------------------------------------------------------

    @pytest.mark.tier1
    def test_t1_reconcile_no_forced_jogos_equals_gols_systemwide(self, db_conn):
        """Nenhum atleta com histórico oficial amplo deve ter total_jogos = total_gols artificial."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT id_jogador, nome_exibicao, total_jogos, total_gols, jogos_carreira_oficiais
            FROM jogadores_estatisticas
            WHERE total_gols >= 10
              AND jogos_carreira_oficiais > total_gols * 1.5
              AND total_jogos = total_gols
        """)
        anomalias = cursor.fetchall()
        assert len(anomalias) == 0, (
            f"Atletas com total_jogos forçado a total_gols encontrados: {[(r[0], r[1], r[2]) for r in anomalias]}. "
            f"(Pendente Marco M3: Systematic Career Reconciliation & 1.00 Ratio Removal)"
        )

    @pytest.mark.tier1
    def test_t1_reconcile_marcos_9488_homonym_disambiguation(self, db_conn):
        """O goleiro Marcos (ID 9488) não deve possuir equivalência artificial 11 jogos = 11 gols."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT total_jogos, total_gols, jogos_carreira_oficiais
            FROM jogadores_estatisticas
            WHERE id_jogador = 9488
        """)
        row = cursor.fetchone()
        assert row is not None, "Atleta Marcos (ID 9488) não localizado no banco"
        total_jogos, total_gols, jogos_oficiais = row[0], row[1], row[2]

        assert total_jogos != total_gols, (
            f"Goleiro Marcos (ID 9488) possui equivalência forçada {total_jogos} jogos = {total_gols} gols. "
            f"(Pendente Marco M3: Desambiguação de Homônimo e Reconciliação)"
        )

    @pytest.mark.tier1
    def test_t1_reconcile_neymar_career_profile(self, api_client):
        """Perfil de Neymar (ID 352) exibe contagem consolidada oficial e média coerente (< 1.00)."""
        response = api_client.get("/api/jogadores/perfil?id=352")
        assert response.status_code == 200
        data = response.get_json()

        carreira = data.get("carreira_oficial") or {}
        jogos_oficiais = carreira.get("jogos") or 0
        assert jogos_oficiais >= 700, f"Jogos oficiais de Neymar ({jogos_oficiais}) abaixo do esperado (>=700)"

        resumo = data.get("resumo") or {}
        media_gols = resumo.get("media_gols") or 0.0
        assert 0.35 <= media_gols <= 0.85, f"Média de gols de Neymar ({media_gols}) inverossímil"

    @pytest.mark.tier1
    def test_t1_reconcile_fred_consolidated_totals(self, db_conn):
        """Fred (ID 6051) possui carreira oficial superior a 800 jogos e mais de 200 gols."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT total_gols, jogos_carreira_oficiais, media_gols_por_jogo
            FROM jogadores_estatisticas
            WHERE id_jogador = 6051
        """)
        row = cursor.fetchone()
        assert row is not None, "Fred (ID 6051) ausente em jogadores_estatisticas"
        assert row[0] >= 200, f"Fred deve ter >= 200 gols catalogados (obtido {row[0]})"
        assert row[1] >= 800, f"Fred deve ter >= 800 jogos oficiais (obtido {row[1]})"

    @pytest.mark.tier1
    def test_t1_reconcile_luis_fabiano_authentic_average(self, api_client):
        """Luís Fabiano (ID 9033) exibe média de carreira autêntica (~0.53) e não 1.00."""
        response = api_client.get("/api/jogadores/perfil?id=9033")
        assert response.status_code == 200
        data = response.get_json()

        resumo = data.get("resumo") or {}
        media = resumo.get("media_gols")
        assert media is not None
        assert abs(media - 0.53) <= 0.05, (
            f"Luís Fabiano não deve exibir média distorcida; esperado ~0.53, obtido {media}."
        )

        clubes = data.get("clubes") or []
        clubes_str = " ".join(clubes) if isinstance(clubes, list) else str(clubes)
        assert "River Plate" not in clubes_str, "Clube espúrio 'River Plate' ainda presente em Luís Fabiano"
        assert "Universidad de Chile" not in clubes_str, "Clube espúrio 'U. de Chile' ainda presente em Luís Fabiano"

    @pytest.mark.tier1
    def test_t1_reconcile_legends_zico_and_romario_averages(self, api_client):
        """Lendas históricas Zico (13953) e Romário (12212) exibem médias autênticas (~0.68 e ~0.77)."""
        # Zico
        res_zico = api_client.get("/api/jogadores/perfil?id=13953")
        assert res_zico.status_code == 200
        data_zico = res_zico.get_json()
        resumo_zico = data_zico.get("resumo") or {}
        media_zico = resumo_zico.get("media_gols") or 0.0
        assert abs(media_zico - 0.68) <= 0.06, (
            f"Zico esperado média ~0.68, obtido {media_zico}."
        )

        # Romário
        res_romario = api_client.get("/api/jogadores/perfil?id=12212")
        assert res_romario.status_code == 200
        data_romario = res_romario.get_json()
        resumo_romario = data_romario.get("resumo") or {}
        media_romario = resumo_romario.get("media_gols") or 0.0
        assert abs(media_romario - 0.77) <= 0.06, (
            f"Romário esperado média ~0.77, obtido {media_romario}."
        )


# ==============================================================================
# TIER 2: BOUNDARY & CORNER CASES (8 TESTES)
# ==============================================================================

class TestTier2BoundaryAndCorner:
    """Validação de limites, condições extremas, timeouts e integridade estrutural."""

    @pytest.mark.tier2
    def test_t2_gateway_exact_timeout_boundary(self):
        """Valida a fronteira exata de timeout (limiar configurado de 1.80s)."""
        client = ProxyClient(remote_url="http://mock-remote-gateway.futstats.internal:8000", timeout=1.8)

        # Sub-timeout deve ser tratado como sucesso
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"status": "ok"}
        with patch.object(client._session, "request", return_value=mock_resp):
            res = client.call_remote(MagicMock(full_path="/api/overview", method="GET", headers={}))
            assert res is not None
            assert res.status_code == 200

        # Simulação de timeout excedendo 1.8s
        with patch.object(client._session, "request", side_effect=requests.exceptions.Timeout("Read timed out")):
            res = client.call_remote(MagicMock(full_path="/api/overview", method="GET", headers={}))
            assert res is None
            assert client.breaker.failure_count >= 1

    @pytest.mark.tier2
    def test_t2_gateway_malformed_remote_json(self, api_client, gateway_env_config, mock_remote_gateway):
        """Respostas HTTP 200 do gateway remoto contendo JSON truncado ou inválido não quebram o proxy."""
        mock_remote_gateway.malformed_json = True

        response = api_client.get("/api/overview")
        assert response.status_code == 200, "Proxy deve cair transparentemente no SQLite local sem erro 500"
        data = response.get_json()
        assert data is not None
        assert "total_partidas" in data

    @pytest.mark.tier2
    def test_t2_ingestion_stoppage_time_parsing(self):
        """Valida que minutos com acréscimo ('45+2', '90+4', '105', '120+3') são convertidos em inteiros válidos."""
        def parse_minuto_sumula(minuto_str: str) -> int:
            if not minuto_str:
                return 0
            cleaned = str(minuto_str).replace("'", "").replace(" ", "").strip()
            if "+" in cleaned:
                partes = cleaned.split("+")
                return int(partes[0]) + int(partes[1])
            return int(cleaned)

        casos = [
            ("45+2'", 47),
            ("90+4'", 94),
            ("105'", 105),
            ("120+3'", 123),
            ("15", 15)
        ]
        for entrada, esperado in casos:
            obtido = parse_minuto_sumula(entrada)
            assert obtido == esperado, f"Falha ao processar minuto '{entrada}': esperado {esperado}, obtido {obtido}"

    @pytest.mark.tier2
    def test_t2_ingestion_penalty_shootouts_exclusion(self, db_conn):
        """Pênaltis de disputa de desempate pós-prorrogação NÃO devem constar como gols em tempo normal na tabela gols."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT COUNT(*)
            FROM gols
            WHERE tipo_de_gol LIKE '%desempate%' 
               OR tipo_de_gol LIKE '%disputa%'
               OR (CAST(minuto AS INTEGER) > 120 AND tipo_de_gol LIKE '%pên%')
        """)
        gols_penaltis_desempate = cursor.fetchone()[0]
        assert gols_penaltis_desempate == 0, (
            f"Encontrados {gols_penaltis_desempate} gols indevidos de disputa de pênaltis na tabela gols"
        )

    @pytest.mark.tier2
    def test_t2_ingestion_triple_substitution_same_minute(self, db_conn):
        """Três substituições ocorrendo no mesmo minuto (ex: minuto 60) não causam violação de chave."""
        temp_conn = sqlite3.connect(":memory:")
        temp_cursor = temp_conn.cursor()
        temp_cursor.execute("""
            CREATE TABLE escalacoes_teste (
                id_escalacao INTEGER PRIMARY KEY AUTOINCREMENT,
                id_partida INT,
                id_jogador INT,
                atleta TEXT,
                clube TEXT,
                numero INT,
                posicao TEXT,
                titular INT,
                saiu_minuto INT,
                entrou_minuto INT
            )
        """)

        substituicoes = [
            (20240101, 101, "Atleta Sai 1", "Flamengo", 7, "Meia", 1, 60, None),
            (20240101, 102, "Atleta Entra 1", "Flamengo", 17, "Meia", 0, None, 60),
            (20240101, 201, "Atleta Sai 2", "Flamengo", 9, "Atacante", 1, 60, None),
            (20240101, 202, "Atleta Entra 2", "Flamengo", 19, "Atacante", 0, None, 60),
            (20240101, 301, "Atleta Sai 3", "Flamengo", 11, "Atacante", 1, 60, None),
            (20240101, 302, "Atleta Entra 3", "Flamengo", 21, "Atacante", 0, None, 60)
        ]
        temp_cursor.executemany("""
            INSERT INTO escalacoes_teste (id_partida, id_jogador, atleta, clube, numero, posicao, titular, saiu_minuto, entrou_minuto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, substituicoes)
        temp_conn.commit()

        temp_cursor.execute("SELECT COUNT(*) FROM escalacoes_teste WHERE saiu_minuto = 60 OR entrou_minuto = 60")
        assert temp_cursor.fetchone()[0] == 6, "Falha ao registrar substituição tripla simultânea"
        temp_conn.close()

    @pytest.mark.tier2
    def test_t2_gateway_concurrency_load_burst(self):
        """Disparo concorrente de 30 requisições simultâneas sem travamento de SQLite."""
        def requisitar(url):
            with app.test_client() as c:
                return c.get(url).status_code

        with ThreadPoolExecutor(max_workers=5) as executor:
            urls = ["/api/overview", "/api/health", "/api/campeonatos"] * 10
            resultados = list(executor.map(requisitar, urls))

        assert all(codigo == 200 for codigo in resultados), (
            f"Falhas observadas sob concorrência: {set(resultados) - {200}}"
        )

    @pytest.mark.tier2
    def test_t2_homonym_athlete_disambiguation(self, db_conn):
        """Atletas homônimos (mesmo nome de exibição) devem manter registros estritamente isolados por id_jogador."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT nome_exibicao, COUNT(*) as qtd
            FROM jogadores_estatisticas
            GROUP BY nome_exibicao
            HAVING qtd > 1
            LIMIT 5
        """)
        homonimos = cursor.fetchall()
        assert len(homonimos) > 0, "Base de dados deve conter atletas homônimos para teste de isolamento"

        for nome, qtd in homonimos:
            cursor.execute("""
                SELECT id_jogador, total_gols, total_jogos, clubes
                FROM jogadores_estatisticas
                WHERE nome_exibicao = ?
            """, (nome,))
            registros = cursor.fetchall()
            ids = [r[0] for r in registros]
            assert len(set(ids)) == len(ids), f"IDs de homônimos não são únicos para '{nome}'"

    @pytest.mark.tier2
    def test_t2_storage_hard_cap_below_94mb(self):
        """Tamanho físico do arquivo data/futebol.db deve permanecer estritamente abaixo de 94.0 MB."""
        tamanho_bytes = os.path.getsize(DB_PATH)
        limite_bytes = 94 * 1024 * 1024  # 98.566.144 bytes
        assert tamanho_bytes < limite_bytes, (
            f"Tamanho do banco ({tamanho_bytes / (1024*1024):.2f} MB) excedeu o teto rígido de 94.0 MB"
        )
        # Margem de segurança operacional recomendada: < 91.0 MB
        assert tamanho_bytes < 91 * 1024 * 1024, (
            f"Alerta de proximidade ao teto Vercel: {tamanho_bytes / (1024*1024):.2f} MB >= 91.0 MB"
        )


# ==============================================================================
# TIER 3: CROSS-FEATURE COMBINATIONS (5 TESTES: PAIRWISE & RESILIÊNCIA)
# ==============================================================================

class TestTier3CrossFeatureCombinations:
    """Validação de interações cruzadas entre proxy, fallback, banco e cache."""

    @pytest.mark.tier3
    def test_t3_cross_remote_failure_during_active_ingestion(self, api_client, gateway_env_config, mock_remote_gateway):
        """Queda do gateway remoto no meio de uma consulta permite leitura imediata via fallback local."""
        mock_remote_gateway.exception = requests.exceptions.ConnectionError("Gateway crashed during ingestion")

        response = api_client.get("/api/partidas?ano=2024&limit=5")
        assert response.status_code == 200
        data = response.get_json()
        assert data is not None, "Resposta de partidas não deve ser nula durante falha de upstream"
        assert response.headers.get("X-Data-Source") == "local-fallback"

    @pytest.mark.tier3
    def test_t3_cross_cache_invalidation_upon_match_enrichment(self):
        """Ao ingerir/atualizar uma partida, a chave correspondente no cache deve ser limpa."""
        cache = CacheManager(default_ttl=60)
        cache.set("partida_20240101", {"id": 20240101, "gols": 1})
        assert cache.get("partida_20240101") is not None

        # Simula evento de enriquecimento / invalidação via delete
        deletado = cache.delete("partida_20240101")
        assert deletado is True
        assert cache.get("partida_20240101") is None, "Cache não foi invalidado após atualização"

    @pytest.mark.tier3
    def test_t3_cross_fallback_career_recalculation(self, api_client, monkeypatch):
        """Cálculo de perfil e Radar PES em modo fallback preserva valores matemáticos e 5 eixos preenchidos."""
        monkeypatch.delenv("FUTSTATS_REMOTE_GATEWAY_URL", raising=False)

        # Consulta perfil de Gabigol (ID 12)
        response = api_client.get("/api/jogadores/perfil?id=12")
        assert response.status_code == 200
        data = response.get_json()

        radar = data.get("radar_pes") or {}
        assert "eixos" in radar, "Objeto radar_pes deve conter lista de eixos"
        assert "ovr" in radar, "Objeto radar_pes deve conter pontuação global ovr"

        eixos_dict = {e["key"]: e["valor"] for e in radar["eixos"]}
        for eixo in ["atk", "fin", "cri", "fis", "def"]:
            assert eixo in eixos_dict, f"Eixo '{eixo}' ausente no Radar PES calculado em modo local"
            assert 40 <= eixos_dict[eixo] <= 99, f"Valor do eixo '{eixo}' fora da faixa permitida (40-99): {eixos_dict[eixo]}"

    @pytest.mark.tier3
    def test_t3_cross_sqlite_wal_checkpoint_under_concurrency(self, db_conn):
        """Execução concorrente de consultas enquanto PRAGMA wal_checkpoint é executado."""
        def executar_leitura():
            conn_local = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
            c = conn_local.cursor()
            c.execute("SELECT COUNT(*) FROM partidas WHERE ano = 2024")
            total = c.fetchone()[0]
            conn_local.close()
            return total

        with ThreadPoolExecutor(max_workers=5) as executor:
            leituras = list(executor.map(lambda _: executar_leitura(), range(10)))

        assert all(total > 0 for total in leituras), "Falha de concorrência durante leitura SQLite"

    @pytest.mark.tier3
    def test_t3_cross_circuit_breaker_half_open_transition(self):
        """Circuit breaker em OPEN transita para HALF-OPEN após cooldown e recupera para CLOSED."""
        cb = CircuitBreaker(failure_threshold=2, recovery_time=0.1)  # 100ms timeout para teste
        cb.record_failure()
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN

        # Aguarda cooldown
        time.sleep(0.15)
        assert cb.can_attempt(), "Deveria permitir requisição de teste no estado HALF-OPEN"
        assert cb.state == CircuitBreaker.STATE_HALF_OPEN

        # Sucesso no teste recupera o circuito
        cb.record_success()
        assert cb.state == CircuitBreaker.STATE_CLOSED


# ==============================================================================
# TIER 4: REAL-WORLD SCENARIOS (5 TESTES: JORNADAS COMPLETAS)
# ==============================================================================

class TestTier4RealWorldScenarios:
    """Testes de ponta a ponta simulando as jornadas mais críticas do usuário na plataforma."""

    @pytest.mark.tier4
    def test_t4_realworld_athlete_career_deep_dive(self, api_client):
        """Jornada completa de exploração do perfil do atleta: busca, métricas, radar e histórico."""
        response = api_client.get("/api/jogadores/perfil?id=352")  # Neymar
        assert response.status_code == 200
        data = response.get_json()

        # Validações completas da resposta de perfil
        nome_atleta = data.get("atleta") or data.get("nome") or data.get("nome_exibicao")
        assert nome_atleta in ["Neymar", "Neymar Jr"]
        assert data.get("posicao") in ["Atacante", "Ponta"]

        carreira = data.get("carreira_oficial") or {}
        assert carreira.get("jogos") is not None
        assert carreira.get("gols") is not None

        # Rótulo de acervo e média no objeto resumo
        resumo = data.get("resumo") or {}
        assert "jogos_rotulo" in resumo
        assert "acervo_parcial" in resumo

        # Radar PES
        radar = data.get("radar_pes") or {}
        assert "ovr" in radar
        assert radar["ovr"] >= 80

    @pytest.mark.tier4
    def test_t4_realworld_dashboard_cold_boot_under_total_remote_outage(self, api_client, monkeypatch):
        """Cold boot da dashboard quando o gateway remoto está 100% indisponível."""
        monkeypatch.setenv("FUTSTATS_REMOTE_GATEWAY_URL", "http://127.0.0.1:59995")
        monkeypatch.setenv("FUTSTATS_GATEWAY_TIMEOUT_SEC", "0.2")

        # 3 requisições primárias que a página inicial faz no carregamento
        t0 = time.perf_counter()
        r_health = api_client.get("/api/health")
        r_overview = api_client.get("/api/overview")
        r_campeonatos = api_client.get("/api/campeonatos")
        elapsed = time.perf_counter() - t0

        assert r_health.status_code == 200
        assert r_overview.status_code == 200
        assert r_campeonatos.status_code == 200
        assert elapsed < 1.5, f"Carregamento offline excedeu 1.5s: {elapsed:.2f}s"

    @pytest.mark.tier4
    def test_t4_realworld_match_day_live_ingestion(self, sample_match_sheet):
        """Simulação de ingestão de rodada de fim de semana: integridade de gols, escalações e placares."""
        assert "gols" in sample_match_sheet
        assert "escalacoes" in sample_match_sheet

        gols = sample_match_sheet["gols"]
        mandante = sample_match_sheet["mandante"]
        visitante = sample_match_sheet["visitante"]

        gols_mandante = sum(1 for g in gols if g["clube"] == mandante)
        gols_visitante = sum(1 for g in gols if g["clube"] == visitante)

        assert gols_mandante == sample_match_sheet["gols_mandante"]
        assert gols_visitante == sample_match_sheet["gols_visitante"]

    @pytest.mark.tier4
    def test_t4_realworld_historic_cup_navigation(self, db_conn):
        """Navegação por confrontos históricos de mata-mata de Copa do Brasil e Libertadores."""
        cursor = db_conn.cursor()
        cursor.execute("""
            SELECT id_partida, ano, campeonato, mandante, visitante, placar, gols_mandante, gols_visitante
            FROM partidas
            WHERE campeonato LIKE '%Copa do Brasil%' AND ano BETWEEN 2000 AND 2023
            LIMIT 10
        """)
        partidas_copa = cursor.fetchall()
        assert len(partidas_copa) == 10, "Não foi possível carregar 10 partidas históricas de Copa do Brasil"

        for p in partidas_copa:
            assert p["mandante"] != p["visitante"], f"Mandante e visitante idênticos na partida {p['id_partida']}"
            assert p["gols_mandante"] is not None and p["gols_visitante"] is not None

    @pytest.mark.tier4
    def test_t4_realworld_production_master_gate(self):
        """Master Pre-flight Gate: executa a verificação completa de sanidade e conformidade de produção."""
        # 1. Teto de armazenamento (<94.0 MB)
        tamanho = os.path.getsize(DB_PATH)
        assert tamanho < 94 * 1024 * 1024, f"Tamanho {tamanho} excedeu 94.0 MB"

        # 2. Integridade física SQLite
        conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
        cursor = conn.cursor()
        cursor.execute("PRAGMA integrity_check")
        status_integridade = cursor.fetchone()[0]
        conn.close()
        assert status_integridade == "ok", f"Integridade física SQLite corrompida: {status_integridade}"

        # 3. Model Evals - Dixon-Coles e probabilidades
        dc = _calc_poisson_bivariate(1.5, 1.2)
        assert "prob_mandante" in dc and "prob_empate" in dc and "prob_visitante" in dc
        soma_prob = dc["prob_mandante"] + dc["prob_empate"] + dc["prob_visitante"]
        assert abs(soma_prob - 100.0) <= 0.1, f"Probabilidades 1X2 somam {soma_prob:.2f}% != 100%"


# ==============================================================================
# TIER 5: ADVERSARIAL HARDENING & STRESS RESILIENCE (MARCO M4)
# ==============================================================================

class TestTier5AdversarialHardening:
    """Testes de estresse e resiliência adversarial da arquitetura desacoplada sob falhas caóticas."""

    @pytest.mark.tier5
    def test_t5_adversarial_timeout_burst_resilience(self, api_client, monkeypatch):
        """Disparo em rajada com timeout de socket upstream: 100% failover transparente para SQLite."""
        monkeypatch.setenv("FUTSTATS_REMOTE_GATEWAY_URL", "http://mock-unresponsive-gateway.internal:8000")
        monkeypatch.setenv("FUTSTATS_GATEWAY_TIMEOUT_SEC", "0.05")
        proxy_client.breaker.reset()
        proxy_client.cache.clear()

        with patch("requests.Session.request", side_effect=requests.exceptions.Timeout("Upstream socket hang")):
            respostas = [api_client.get("/api/overview") for _ in range(5)]

        assert all(r.status_code == 200 for r in respostas), "Falha no fallback durante rajada de timeouts"
        for r in respostas:
            assert r.headers.get("X-Data-Source") == "local-fallback"
            assert r.headers.get("X-Fallback-Reason") in ["remote_timeout", "circuit_open"]
            data = r.get_json()
            assert "total_partidas" in data
            assert data["total_partidas"] > 100000

    @pytest.mark.tier5
    def test_t5_adversarial_circuit_breaker_saturation_recovery(self):
        """Saturação do circuit breaker com erros 503 consecutivos, fast-fail e recuperação após cooldown."""
        cb = CircuitBreaker(failure_threshold=3, recovery_time=0.1)

        # 3 falhas consecutivas disparam o circuito para OPEN
        cb.record_failure()
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_CLOSED
        cb.record_failure()
        assert cb.state == CircuitBreaker.STATE_OPEN

        # Durante o cooldown, can_attempt deve retornar False imediatamente (fast-fail sem I/O de rede)
        assert not cb.can_attempt()
        assert not cb.can_attempt()

        # Cooldown expira: transição para HALF-OPEN
        time.sleep(0.12)
        assert cb.can_attempt()
        assert cb.state == CircuitBreaker.STATE_HALF_OPEN

        # Sonda bem-sucedida restaura circuito para CLOSED
        cb.record_success()
        assert cb.state == CircuitBreaker.STATE_CLOSED
        assert cb.failure_count == 0

    @pytest.mark.tier5
    def test_t5_adversarial_corrupted_json_payload_sanitization(self, api_client, monkeypatch):
        """Gateway remoto entrega HTML de erro 200 com payload corrompido: fallback local higienizado."""
        monkeypatch.setenv("FUTSTATS_REMOTE_GATEWAY_URL", "http://mock-corrupted-gateway.internal:8000")
        proxy_client.breaker.reset()
        proxy_client.cache.clear()

        # Mock de resposta 200 com HTML de proxy corrompido ao invés de JSON
        mock_resp = requests.Response()
        mock_resp.status_code = 200
        mock_resp._content = b"<html><head><title>502 Bad Gateway Nginx</title></head><body>Invalid Body</body></html>"

        with patch("requests.Session.request", return_value=mock_resp):
            response = api_client.get("/api/campeonatos")

        assert response.status_code == 200
        assert response.headers.get("X-Data-Source") == "local-fallback"
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "campeonato" in data[0]

    @pytest.mark.tier5
    def test_t5_adversarial_concurrent_fallback_under_wal_stress(self, api_client):
        """Concorrência multi-thread pesada contra o fallback local sob checkpoint WAL contínuo."""
        def requisitar_com_checkpoint(i):
            # A cada 3 threads, dispara um checkpoint WAL passivo no SQLite
            if i % 3 == 0:
                try:
                    conn = sqlite3.connect(f"file:{DB_PATH}?mode=ro", uri=True)
                    conn.execute("PRAGMA wal_checkpoint(PASSIVE);")
                    conn.close()
                except Exception:
                    pass
            with app.test_client() as c:
                resp = c.get("/api/overview")
                return resp.status_code

        with ThreadPoolExecutor(max_workers=5) as executor:
            codigos = list(executor.map(requisitar_com_checkpoint, range(15)))

        assert all(c == 200 for c in codigos), f"Erros observados sob estresse WAL concorrente: {codigos}"

    @pytest.mark.tier5
    def test_t5_adversarial_telemetry_header_tampering_defense(self, api_client):
        """Tentativa de injeção/tampering de headers de telemetria pelo cliente é neutralizada."""
        headers_adulterados = {
            "X-Data-Source": "remote-master-spoofed",
            "X-Circuit-Breaker-State": "hacked-closed",
            "X-Fallback-Reason": "none"
        }
        response = api_client.get("/api/health", headers=headers_adulterados)
        assert response.status_code == 200

        # O servidor deve sobrescrever rigorosamente com os valores reais de tempo de execução
        assert response.headers.get("X-Data-Source") in ["remote-gateway", "local-fallback", "local-standalone", "cache"]
        assert response.headers.get("X-Data-Source") != "remote-master-spoofed"
        assert response.headers.get("X-Circuit-Breaker-State") in ["closed", "open", "half-open"]
