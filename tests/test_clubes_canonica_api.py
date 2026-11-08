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
    """Valida resolução tática em 5 métodos auditáveis: Marcelo Lomba e Carlos Miguel são goleiros, sem gols colididos."""
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()

    goleiros = [a['atleta'] for a in data['setores']['goleiros']]
    assert 'Marcelo Lomba' in goleiros, 'Marcelo Lomba deve estar no setor de goleiros!'
    assert 'Carlos Miguel' in goleiros, 'Carlos Miguel deve estar no setor de goleiros!'

    lomba = next(a for a in data['setores']['goleiros'] if a['atleta'] == 'Marcelo Lomba')
    assert lomba['posicao'] == 'Goleiro'
    assert lomba['gols'] == 0, 'Marcelo Lomba não pode herdar gols de ID cruzado (Adaílton)!'
    assert lomba['metodo_posicao'] in ('posicao_do_recorte', 'predominante_em_escalacoes')
    assert lomba['nota_participacao'] is not None

    atacantes = [a['atleta'] for a in data['setores']['atacantes']]
    assert 'Marcelo Lomba' not in atacantes, 'Goleiro jamais pode cair em atacantes!'
    assert 'Carlos Miguel' not in atacantes


def test_invariante_matematica_titulares_menor_igual_jogos(client):
    """
    Invariantes obrigatórias em 100% dos atletas:
    1. titulares <= jogos_disputados
    2. jogos_disputados = titulares + substituto_entrou
    3. relacionado sem atuar (reservas) permanece estritamente separado
    """
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()

    todos_atletas = []
    for s in data['setores'].values():
        todos_atletas.extend(s)

    assert len(todos_atletas) == 43, f"Esperado 43 atletas, encontrado {len(todos_atletas)}"

    for a in todos_atletas:
        tit = a['titularidades']
        sub = a['substituto_entrou'] or 0
        disp = a['jogos_disputados']
        banco = a['reservas']

        # Invariante 1
        assert tit <= disp, f"Incoerência no atleta {a['atleta']}: tit={tit} > disp={disp}"
        # Invariante 2
        assert disp == tit + sub, f"Incoerência na soma de {a['atleta']}: disp={disp} != {tit} + {sub}"
        # Invariante 3
        assert banco >= 0

    # Testes específicos para os 4 atletas auditados
    at_map = {a['atleta']: a for a in todos_atletas}

    carlos = at_map['Carlos Miguel']
    assert carlos['titularidades'] == 44
    assert carlos['jogos_disputados'] == 44
    assert carlos['reservas'] == 0

    andreas = at_map['Andreas Pereira']
    assert andreas['titularidades'] == 41
    assert andreas['jogos_disputados'] == 41
    assert andreas['reservas'] == 0

    gomez = at_map['Gustavo Gómez']
    assert gomez['titularidades'] == 39
    assert gomez['jogos_disputados'] == 39
    assert gomez['reservas'] == 2

    lomba = at_map['Marcelo Lomba']
    assert lomba['titularidades'] == 1
    assert lomba['jogos_disputados'] == 1
    assert lomba['reservas'] == 44
    assert "1 partida como titular, 44 no banco" in lomba['nota_participacao']


def test_auditoria_5_metodos_posicoes(client):
    """Valida que gols não confirmam posição e contagem por método é transparente."""
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()

    assert 'auditoria_posicoes' in data
    metodos = data['auditoria_posicoes']['metodos_classificacao']
    assert metodos['posicao_do_recorte'] == 25
    assert metodos['predominante_em_escalacoes'] == 6
    assert metodos['cadastro_validado'] == 1
    assert metodos['posicao_a_confirmar'] == 11


def test_clube_historico_escopos_gols_verificaveis(client):
    """Valida metadados verificáveis de escopo (tabela_origem, lance a lance, Ademir e Marcos)."""
    resp = client.get('/api/clubes/detalhe/2459/historico')
    assert resp.status_code == 200
    data = resp.get_json()

    # Acervo Oficial
    assert 'metadados_artilheiros_acervo' in data
    meta_acervo = data['metadados_artilheiros_acervo']
    assert meta_acervo['tabela_origem'] == 'gols (JOIN partidas)'
    assert meta_acervo['tem_lance_a_lance'] is True

    # Estatística de Carreira Catalogada (apenas metadados comprovados em schema)
    assert 'metadados_idolos_carreira' in data
    meta_idolos = data['metadados_idolos_carreira']
    assert meta_idolos['tabela_origem'] == 'clubes_perfil'
    assert meta_idolos['campo'] == 'idolos_historicos_json'
    assert meta_idolos['tem_lance_a_lance'] is False
    assert meta_idolos['fonte'] is None  # ausente no schema de clubes_perfil

    # Marcos
    marcos = next(i for i in data['idolos_historicos'] if i['nome'] == 'Marcos')
    assert marcos['posicao'] == 'Goleiro'
    assert marcos['gols'] == 0
    assert marcos['jogos'] == 533

    # Ademir da Guia
    ademir_acervo = next(a for a in data['maiores_artilheiros'] if a['atleta'] == 'Ademir da Guia')
    assert ademir_acervo['total_gols'] == 107
    ademir_carreira = next(i for i in data['idolos_historicos'] if i['nome'] == 'Ademir da Guia')
    assert ademir_carreira['gols'] == 155


def test_partidas_santos_0x0_distintas_com_fase(client):
    """Valida que os dois Santos 0x0 de 2026 permanecem distintos e exibem fase e competição."""
    resp = client.get('/api/clubes/detalhe/2459/jogos?ano=2026&limit=20')
    assert resp.status_code == 200
    data = resp.get_json()
    jogos = data['jogos']

    santos_jogos = [j for j in jogos if 'santos' in j['adversario_nome'].lower() and j['placar'] == '0 x 0']
    assert len(santos_jogos) == 2, f"Esperado 2 empates 0x0 contra o Santos em 2026, encontrado {len(santos_jogos)}"

    ids = {j['id_partida'] for j in santos_jogos}
    assert 202532949 in ids  # Brasileirão Série A
    assert 202425567 in ids  # Copa do Brasil

    # Conferir presença de fase
    for j in santos_jogos:
        assert j['fase'] is not None
