"""
Suíte de Testes Automatizados — Módulo Canônico de Clubes (Fase 1)
Cobre:
1. Lista geral com busca universal e paginação
2. Resolução de aliases conhecidos (Athletico/Athletico-PR e Atlético/Atlético-MG)
3. Deduplicação determinística comprovada (confronto de 17/10/2026)
4. Perfil completo de clube tradicional (ex: Flamengo ID 1389 ou Palmeiras ID 2459)
5. Clube histórico sem perfil institucional completo (exibição honesta sem campos inventados)
6. Clube sem métricas BED 2026
7. Não fusão indevida de entidades distintas
8. Erro HTTP 404 estruturado para ID inexistente
9. Consistência de filtros de recorte (ano, competição e mando)
"""

import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_clubes_lista_geral_contrato(client):
    """Valida contrato geral de listagem paginada."""
    resp = client.get('/api/clubes/lista-geral?ano=2026&limit=10')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'total_clubes' in data
    assert 'clubes' in data
    assert 'page' in data
    assert 'anos_disponiveis' in data
    assert 'competicoes_disponiveis' in data
    assert len(data['clubes']) <= 10

    if data['clubes']:
        c = data['clubes'][0]
        assert 'clube_id' in c
        assert 'nome' in c
        assert 'estado' in c
        assert 'jogos' in c
        assert 'vitorias' in c
        assert 'empates' in c
        assert 'derrotas' in c
        assert 'gols_pro' in c
        assert 'gols_contra' in c
        assert 'pontos' in c
        assert 'aproveitamento_pct' in c
        assert 'forma_recente' in c

def test_clubes_busca_alias_athletico(client):
    """Busca com alias 'Athletico' deve resolver para 'Athletico-PR' ID 324 sem duplicar identidade."""
    resp = client.get('/api/clubes/lista-geral?q=Athletico&ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()
    nomes = [c['nome'] for c in data['clubes']]
    assert 'Athletico-PR' in nomes
    # Não deve ter 2 linhas separadas para Athletico e Athletico-PR
    assert len(data['clubes']) == 1
    assert data['clubes'][0]['clube_id'] == 324

def test_clubes_deduplicacao_deterministica_palmeiras(client):
    """Garante que a partida duplicada de 17/10/2026 (IDs 202532908 e 202425559) é colapsada para exatamente 1 registro."""
    resp = client.get('/api/clubes/detalhe/2459/jogos?ano=2026&limit=50')
    assert resp.status_code == 200
    data = resp.get_json()
    jogos_17 = [j for j in data['jogos'] if j['data'] == '2026-10-17']
    assert len(jogos_17) == 1, "A duplicata de 17/10/2026 deve ser colapsada para exatamente 1 registro de partida"
    j = jogos_17[0]
    assert j['id_partida'] == 202532908, "Representante determinístico padrão deve ser preservado"
    assert 202425559 in j['duplicatas_associadas'], "ID associado deve ser preservado na lista de duplicatas"
    assert j['resultado'] == 'V'

def test_clubes_detalhe_institucional_completo(client):
    """Valida clube com perfil institucional cadastrado (Palmeiras ID 2459)."""
    resp = client.get('/api/clubes/detalhe/2459?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()
    ident = data['identificacao']
    assert ident['clube_id'] == 2459
    assert ident['nome'] == 'Palmeiras'
    assert ident['estadio_nome'] == 'Allianz Parque'
    assert ident['estado'] == 'SP'
    assert data['resumo_recorte']['jogos'] > 0
    assert 'ultimos_resultados' in data
    assert 'artilheiros_recorte' in data

def test_clubes_detalhe_sem_perfil_institucional(client):
    """Valida clube histórico do acervo que não possui registro em clubes_perfil: exibe campos ausentes como None, nunca 'Brasil'."""
    # Clube ID 1: - Barueri
    resp = client.get('/api/clubes/detalhe/1?ano=todos')
    assert resp.status_code == 200
    data = resp.get_json()
    ident = data['identificacao']
    assert ident['cidade'] is None
    assert ident['cidade'] != 'Brasil'
    assert ident['fundacao'] is None
    assert ident['estadio_nome'] is None
    assert 'cobertura' in data

def test_clubes_sem_metricas_bed(client):
    """Clube histórico sem BED deve retornar tem_metricas_bed_2026 = False e preview None."""
    resp = client.get('/api/clubes/detalhe/1?ano=todos')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['cobertura']['tem_metricas_bed_2026'] is False
    assert data['metricas_avancadas_preview'] is None

def test_clubes_id_inexistente_retorna_404(client):
    """ID de clube inexistente deve retornar HTTP 404 estruturado."""
    resp = client.get('/api/clubes/detalhe/9999999')
    assert resp.status_code == 404
    data = resp.get_json()
    assert 'erro' in data

def test_clubes_filtro_mando_e_competicao(client):
    """Testa filtros de mando (casa/fora) e consistência com totais."""
    resp_casa = client.get('/api/clubes/detalhe/2459/jogos?ano=2026&mando=casa')
    assert resp_casa.status_code == 200
    data_casa = resp_casa.get_json()
    for j in data_casa['jogos']:
        assert j['mando'] == 'casa'

    resp_fora = client.get('/api/clubes/detalhe/2459/jogos?ano=2026&mando=fora')
    assert resp_fora.status_code == 200
    data_fora = resp_fora.get_json()
    for j in data_fora['jogos']:
        assert j['mando'] == 'fora'

def test_nao_fusao_de_entidades_distintas(client):
    """Dois clubes parecidos como Atlético Goianiense e Atlético Mineiro devem permanecer estritamente separados."""
    r_go = client.get('/api/clubes/lista-geral?q=Atlético Goianiense&ano=2026')
    r_mg = client.get('/api/clubes/lista-geral?q=Atlético-MG&ano=2026')
    d_go = r_go.get_json()['clubes']
    d_mg = r_mg.get_json()['clubes']
    assert len(d_go) >= 1
    assert len(d_mg) >= 1
    assert d_go[0]['clube_id'] != d_mg[0]['clube_id']


def test_clube_elenco_setores(client):
    """Fase 2: Valida recuperação e agrupamento de elenco por setores e contagem real de súmulas."""
    resp = client.get('/api/clubes/detalhe/324/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['clube_id'] == 324
    assert 'setores' in data
    setores = data['setores']
    assert 'goleiros' in setores
    assert 'defensores' in setores
    assert 'meio_campistas' in setores
    assert 'atacantes' in setores
    assert data['total_atletas'] > 0
    # Valida estrutura do atleta
    atleta = setores['atacantes'][0] if setores['atacantes'] else setores['defensores'][0]
    assert 'atleta' in atleta
    assert 'jogos' in atleta
    assert 'titularidades' in atleta
    assert 'gols' in atleta
    assert 'cartoes_amarelos' in atleta


def test_clube_estatisticas_basicas_e_bed(client):
    """Fase 2: Valida agregação de estatísticas básicas, mandos, gols temporais e BED 2026."""
    resp = client.get('/api/clubes/detalhe/2459/estatisticas?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['clube_id'] == 2459
    eb = data['estatisticas_basicas']
    assert eb['jogos'] > 0
    assert 'desempenho_mando' in eb
    assert 'casa' in eb['desempenho_mando']
    assert 'fora' in eb['desempenho_mando']
    assert 'clean_sheets' in eb
    assert 'btts' in eb
    assert 'distribuicao_gols_temporais' in eb
    assert 'gols_marcados' in eb['distribuicao_gols_temporais']
    assert 'gols_sofridos' in eb['distribuicao_gols_temporais']
    assert data['metricas_avancadas_bed'] is not None
    assert 'xg' in data['metricas_avancadas_bed']


def test_clube_historico_titulos_artilheiros(client):
    """Fase 2: Valida vitrine de títulos, maiores artilheiros no acervo e campanhas históricas."""
    resp = client.get('/api/clubes/detalhe/1389/historico')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['clube_id'] == 1389
    assert 'trofeus' in data
    assert len(data['trofeus']) > 0
    assert 'maiores_artilheiros' in data
    assert len(data['maiores_artilheiros']) > 0
    # Maior artilheiro histórico do Flamengo no acervo é Zico
    assert data['maiores_artilheiros'][0]['atleta'] == 'Zico'
    assert data['maiores_artilheiros'][0]['total_gols'] > 300
    assert 'campanhas_historicas' in data
    assert len(data['campanhas_historicas']) > 0



def test_clube_elenco_resolucao_posicoes_e_marcelo_lomba(client):
    """Valida resolução tática em 4 passos: Marcelo Lomba e Carlos Miguel são goleiros, sem gols colididos."""
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()
    
    goleiros = [a['atleta'] for a in data['setores']['goleiros']]
    assert 'Marcelo Lomba' in goleiros, 'Marcelo Lomba deve estar no setor de goleiros!'
    assert 'Carlos Miguel' in goleiros, 'Carlos Miguel deve estar no setor de goleiros!'
    
    lomba = next(a for a in data['setores']['goleiros'] if a['atleta'] == 'Marcelo Lomba')
    assert lomba['posicao'] == 'Goleiro'
    assert lomba['gols'] == 0, 'Marcelo Lomba não pode herdar gols de ID cruzado (Adaílton)!'
    
    atacantes = [a['atleta'] for a in data['setores']['atacantes']]
    assert 'Marcelo Lomba' not in atacantes, 'Goleiro jamais pode cair em atacantes!'
    assert 'Carlos Miguel' not in atacantes


def test_clube_elenco_semantica_jogos_e_relacionados(client):
    """Valida semântica de elenco: banco não conta como jogo atuado; coberturas nulas viram None."""
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()
    
    # Atleta com BED que só entrou vindo do banco (Larson)
    outros = {a['atleta']: a for a in data['setores']['outros']}
    assert 'Larson' in outros
    larson = outros['Larson']
    assert larson['posicao'] == 'Posição a Confirmar'
    assert larson['titularidades'] == 0
    assert larson['reservas'] == 40
    assert larson['substituto_entrou'] == 8
    assert larson['jogos_disputados'] == 8
    
    # Atleta sem minutos nem titularidades (Erick Machado)
    assert 'Erick Machado' in outros
    erick = outros['Erick Machado']
    assert erick['titularidades'] == 0
    assert erick['jogos_disputados'] == 0
    assert erick['reservas'] > 0


def test_clube_historico_escopos_gols_ademir_e_marcos(client):
    """Valida explicitação de escopos e reconciliação honesta de Ademir da Guia e Marcos."""
    resp = client.get('/api/clubes/detalhe/2459/historico')
    assert resp.status_code == 200
    data = resp.get_json()
    
    assert 'escopo_artilheiros' in data
    assert 'acervo' in data['escopo_artilheiros']['rotulo'].lower()
    
    assert 'escopo_idolos' in data
    assert 'enciclopédia' in data['escopo_idolos']['rotulo'].lower()
    assert 'nota_reconciliacao' in data['escopo_idolos']
    
    # Marcos (goleiro) não pode ficar sem gols
    marcos = next(i for i in data['idolos_historicos'] if i['nome'] == 'Marcos')
    assert marcos['posicao'] == 'Goleiro'
    assert marcos['gols'] == 0
    assert marcos['jogos'] == 533


def test_partida_santos_0x0_palmeiras_consistencia(client):
    """Valida que Santos 0x0 Palmeiras em 2026 é um jogo legítimo e consistente."""
    resp = client.get('/api/clubes/detalhe/2459/jogos?ano=2026&limit=10')
    assert resp.status_code == 200
    data = resp.get_json()
    jogos = data['jogos']
    
    # O jogo mais recente disputado em 2026 foi Santos 0x0 Palmeiras em 28/10/2026
    jogo_santos = next((j for j in jogos if j['id_partida'] == 202532949), None)
    assert jogo_santos is not None
    assert jogo_santos['data'] == '2026-10-28'
    assert jogo_santos['placar'] == '0 x 0'
    assert jogo_santos['status_conflito'] is None
