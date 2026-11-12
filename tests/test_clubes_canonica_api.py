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

import sqlite3
import pytest
from backend.app import app
from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica

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
    assert metodos['predominante_em_escalacoes'] == 2
    assert metodos['cadastro_validado'] == 1
    assert metodos['posicao_a_confirmar'] == 15


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


def test_elenco_temporada_pre_2023_sem_escalacao_ficticia(client):
    """Valida que temporadas anteriores a 2023 retornam 0 atletas e aviso explícito de não digitalizado."""
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=1993')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['total_atletas'] == 0
    assert data['cobertura']['escalacoes_digitalizadas'] is False
    assert 'não estão digitalizadas' in data['cobertura']['nota_recorte']
    for setor, lista in data['setores'].items():
        assert len(lista) == 0


def test_regressao_estatisticas_fechamento_mando_totais(client):
    """
    Valida que o endpoint de estatísticas cumpre estritamente o fechamento:
    casa + fora = total para jogos, gols pró e gols contra.
    Testado com Palmeiras #2459 (caso conhecido com 37 casa e 37 fora em 2026).
    """
    resp = client.get('/api/clubes/detalhe/2459/estatisticas?ano=2026')
    assert resp.status_code == 200
    eb = resp.get_json()['estatisticas_basicas']

    mc = eb['desempenho_mando']['casa']
    mf = eb['desempenho_mando']['fora']

    assert mc['jogos'] == 37
    assert mf['jogos'] == 37
    assert mc['jogos'] + mf['jogos'] == eb['jogos'] == 74

    assert mc['gols_pro'] == 72
    assert mf['gols_pro'] == 52
    assert mc['gols_pro'] + mf['gols_pro'] == eb['gols_pro'] == 124

    assert mc['gols_contra'] == 21
    assert mf['gols_contra'] == 33
    assert mc['gols_contra'] + mf['gols_contra'] == eb['gols_contra'] == 54


def test_regressao_gol_contra_separado_de_artilharia_individual(client):
    """
    Valida que:
    1. O gol contra de Fabiano (Vitória 0x4 Palmeiras) não é computado na
       artilharia individual do atleta Fabiano no Palmeiras (gols == 0).
    2. O evento original permanece íntegro e compõe os gols_pro do Palmeiras.
    3. Gols contra recebidos são expostos separadamente em cobertura.gols_contra_a_favor.
    """
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()

    # Gols contra recebidos a favor
    assert data['cobertura']['gols_contra_a_favor'] == 3

    # Localizar Fabiano no elenco do Palmeiras
    todos_atletas = []
    for setor, lista in data['setores'].items():
        todos_atletas.extend(lista)

    fabianos = [a for a in todos_atletas if a['atleta'].strip().lower() == 'fabiano']
    assert len(fabianos) == 1
    fab = fabianos[0]

    # Artilharia individual deve ser zero (gol contra não pertence à artilharia do atleta)
    assert fab['gols'] == 0
    assert fab['jogos'] == 0
    assert fab['titularidades'] == 0
    assert fab['reservas'] == 2
    assert fab['nota_participacao'] == '2 partidas relacionado no banco sem entrar'


def test_regressao_posicao_identidade_estrita_fabiano_vs_emerson_fabiano(client):
    """
    Valida que:
    1. LIKE '%fabiano%' não transfere a posição de Emerson Fabiano para Fabiano.
    2. Fabiano não está no setor de goleiros.
    3. Emerson Fabiano resolve para goleiro por mérito próprio de súmula.
    4. Atleta sem evidência tática suficiente cai em 'Posição a Confirmar'.
    """
    resp = client.get('/api/clubes/detalhe/2459/elenco?ano=2026')
    assert resp.status_code == 200
    data = resp.get_json()

    # Fabiano NÃO deve estar em goleiros
    goleiros = data['setores']['goleiros']
    assert all('fabiano' not in g['atleta'].lower() for g in goleiros)

    # Teste unitário da função pericial hierárquica
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica
    from backend.app import get_db

    conn = get_db()
    try:
        # Emerson Fabiano (goleiro id 18925)
        setor_ef, pos_ef, met_ef = _resolver_posicao_atleta_hierarquica(
            conn, "Emerson Fabiano", 18925, {"internacional"}, 2026
        )
        assert setor_ef == 'goleiros'
        assert pos_ef == 'Goleiro'

        # Fabiano (id 1561) - sem evidência suficiente, não pode ser Goleiro nem Lateral
        setor_f, pos_f, met_f = _resolver_posicao_atleta_hierarquica(
            conn, "Fabiano", 1561, {"palmeiras"}, 2026
        )
        assert setor_f == 'outros'
        assert pos_f == 'Posição a Confirmar'
        assert met_f == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_homonimo_exato_com_ids_distintos():
    """
    Regressão 1: Homônimo exato com IDs distintos.
    Garante que quando dois atletas possuem exatamente o mesmo nome,
    mas IDs cadastrais distintos, as escalações de um NÃO são atribuídas ao outro.
    """
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica
    from backend.app import get_db

    conn = get_db()
    try:
        # ID inexistente com mesmo nome não herda escalações do atleta canônico
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Eduardo", 9999999, {"palmeiras"}, 2026
        )
        assert setor == 'outros'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_id_compartilhado_por_identidades_conflitantes():
    """
    Regressão 2: ID compartilhado por identidades conflitantes.
    Kaique (#1423 no Palmeiras) e Kaique Kenji (#1423 no Cruzeiro) compartilham o mesmo ID 1423.
    A função deve rejeitar o vínculo entre identidades de nomes conflitantes e
    NÃO atribuir a posição de meia/atacante do Cruzeiro ao Kaique do Palmeiras.
    """
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica
    from backend.app import get_db

    conn = get_db()
    try:
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Kaique", 1423, {"palmeiras"}, 2026
        )
        # Não pode herdar Meio-campo ou Atacante de Kaique Kenji
        assert setor == 'outros'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_nome_curto_versus_nome_composto():
    """
    Regressão 3: Nome curto versus nome composto.
    Garante que nomes curtos isolados ('Fabiano', 'Kaique') não sofram
    correspondência com nomes compostos distintos ('Emerson Fabiano', 'Kaique Kenji').
    """
    from backend.rotas_clubes_canonica import _nomes_estritamente_compativeis

    # Casos proibidos de contaminação por substring
    assert _nomes_estritamente_compativeis("Fabiano", "Emerson Fabiano") is False
    assert _nomes_estritamente_compativeis("Emerson Fabiano", "Fabiano") is False
    assert _nomes_estritamente_compativeis("Kaique", "Kaique Kenji") is False
    assert _nomes_estritamente_compativeis("Eduardo", "Carlos Eduardo") is False

    # Casos de nomes compostos distintos sem elipse (rejeição de subconjunto de tokens)
    assert _nomes_estritamente_compativeis("João Pedro", "João Pedro Silva") is False
    assert _nomes_estritamente_compativeis("João Pedro Silva", "João Pedro") is False

    # Casos de reordenação de tokens (não tratados como igualdade)
    assert _nomes_estritamente_compativeis("José Carlos", "Carlos José") is False
    assert _nomes_estritamente_compativeis("Carlos José", "José Carlos") is False

    # Casos legítimos aceitos (igualdade exata ou elipses de súmula oficial)
    assert _nomes_estritamente_compativeis("Eduardo", "eduardo ") is True
    assert _nomes_estritamente_compativeis("Emerson Fabiano", "Emerson Ju ... Emerson Fabiano Kerb ...") is True


def test_regressao_evidencia_insuficiente_retorna_posicao_a_confirmar():
    """
    Regressão 4: Evidência insuficiente.
    Atletas sem amostragem tática suficiente (< 3 titularidades comprovadas na carreira,
    contradições cadastrais ou apenas banco de reservas sem entrar) devem retornar
    'Posição a Confirmar' e NÃO uma posição inventada ou extrapolada.
    """
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica
    from backend.app import get_db

    conn = get_db()
    try:
        # Fabiano (camisa 37 do Palmeiras, 2 bancos, contradição com cadastro Atacante)
        setor_f, pos_f, met_f = _resolver_posicao_atleta_hierarquica(
            conn, "Fabiano", 1561, {"palmeiras"}, 2026
        )
        assert setor_f == 'outros'
        assert pos_f == 'Posição a Confirmar'
        assert met_f == 'posicao_a_confirmar'

        # Aranha (camisa 24 do Palmeiras, 5 jogos como reserva, 0 titularidades)
        setor_a, pos_a, met_a = _resolver_posicao_atleta_hierarquica(
            conn, "Aranha", 3435, {"palmeiras"}, 2026
        )
        assert setor_a == 'outros'
        assert pos_a == 'Posição a Confirmar'
        assert met_a == 'posicao_a_confirmar'

        # Atleta totalmente fictício sem registros
        setor_x, pos_x, met_x = _resolver_posicao_atleta_hierarquica(
            conn, "Atleta Sem Registros 123", None, {"palmeiras"}, 2026
        )
        assert setor_x == 'outros'
        assert pos_x == 'Posição a Confirmar'
        assert met_x == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_minuto_desconhecido_fora_do_numerador_temporal(client):
    """
    Regressão 5: minuto_desconhecido fora do numerador temporal.
    Valida que o payload de estatísticas separa a chave minuto_desconhecido,
    e que a fórmula de consolidação de cobertura exclui essa chave do somatório
    de gols com minutagem catalogada.
    """
    resp = client.get('/api/clubes/detalhe/2459/estatisticas?ano=2026')
    assert resp.status_code == 200
    eb = resp.get_json()['estatisticas_basicas']

    dist_marcados = eb['distribuicao_gols_temporais']['gols_marcados']
    dist_sofridos = eb['distribuicao_gols_temporais']['gols_sofridos']

    # A chave minuto_desconhecido existe explicitamente no payload para auditoria
    assert 'minuto_desconhecido' in dist_marcados
    assert 'minuto_desconhecido' in dist_sofridos

    # Faixas válidas digitalizadas consumidas pelo JSX
    faixas_validas = [
        '0_15', '16_30', '31_45', '46_60', '61_75', '76_90',
        'acrescimos_1t', 'acrescimos_2t', 'prorrogacao'
    ]

    total_com_minuto_marcados = sum(dist_marcados.get(k, 0) for k in faixas_validas)
    total_com_minuto_sofridos = sum(dist_sofridos.get(k, 0) for k in faixas_validas)

    # O numerador NÃO pode somar minuto_desconhecido
    assert total_com_minuto_marcados == sum(v for k, v in dist_marcados.items() if k != 'minuto_desconhecido')
    assert total_com_minuto_sofridos == sum(v for k, v in dist_sofridos.items() if k != 'minuto_desconhecido')

    # Garantir que se houver minuto desconhecido, o total de lances catalogados não é inflacionado
    total_com_desconhecido = sum(dist_marcados.values())
    assert total_com_minuto_marcados <= total_com_desconhecido


def test_regressao_empate_posicoes_historicas():
    """
    Regressão 6: Empate nas posições históricas.
    Garante que quando há empate na contagem máxima de posições históricas (sem predominância única),
    o sistema não escolhe uma posição arbitrariamente e descende na hierarquia até 'Posição a Confirmar'.
    """
    import sqlite3
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("""
        CREATE TABLE partidas (
            id_partida INTEGER PRIMARY KEY,
            ano INTEGER
        )
    """)
    c.execute("""
        CREATE TABLE escalacoes (
            id_escalacao INTEGER PRIMARY KEY,
            id_partida INTEGER,
            clube TEXT,
            atleta TEXT,
            id_jogador INTEGER,
            posicao TEXT,
            is_goleiro INTEGER,
            titular INTEGER
        )
    """)
    c.execute("""
        CREATE TABLE jogadores (
            id_jogador INTEGER PRIMARY KEY,
            nome_exibicao TEXT,
            apelido TEXT,
            nome_completo TEXT,
            posicao TEXT
        )
    """)

    # Partidas 2024 (fora do recorte 2026, mas dentro de 2023-2026)
    c.execute("INSERT INTO partidas (id_partida, ano) VALUES (1, 2024), (2, 2024), (3, 2024), (4, 2024)")
    # Empate: 2 titularidades como 'Zagueiro' e 2 titularidades como 'Lateral'
    c.execute("INSERT INTO escalacoes (id_partida, clube, atleta, id_jogador, posicao, is_goleiro, titular) VALUES (1, 'Outro Clube', 'Atleta Teste Empate', 9999, 'Zagueiro', 0, 1)")
    c.execute("INSERT INTO escalacoes (id_partida, clube, atleta, id_jogador, posicao, is_goleiro, titular) VALUES (2, 'Outro Clube', 'Atleta Teste Empate', 9999, 'Zagueiro', 0, 1)")
    c.execute("INSERT INTO escalacoes (id_partida, clube, atleta, id_jogador, posicao, is_goleiro, titular) VALUES (3, 'Outro Clube', 'Atleta Teste Empate', 9999, 'Lateral', 0, 1)")
    c.execute("INSERT INTO escalacoes (id_partida, clube, atleta, id_jogador, posicao, is_goleiro, titular) VALUES (4, 'Outro Clube', 'Atleta Teste Empate', 9999, 'Lateral', 0, 1)")
    # Em jogadores, posicao = None (sem cadastro pré-validado)
    c.execute("INSERT INTO jogadores (id_jogador, nome_exibicao, posicao) VALUES (9999, 'Atleta Teste Empate', NULL)")
    conn.commit()

    try:
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Atleta Teste Empate", 9999, {"qualquer_clube"}, 2026
        )
        # Havendo empate entre Zagueiro (2) e Lateral (2), não pode escolher arbitrariamente nenhum dos dois
        assert setor == 'outros'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_metodo_3_id_colidido_cadastro_nao_nulo():
    """
    Regressão: ID colidido com cadastro de posição não nula no Método 3.
    Garante que se um atleta consultado (ex: 'Fabiano', ID 1561) possui id_jogador que aponta
    no cadastro para outro atleta ('Outro Atleta', Lateral), o conflito nominal é detectado
    e rejeitado, sem retornar a posição indevida por OR/LIMIT 1 e sem buscar identidade divergente.
    """
    import sqlite3
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("CREATE TABLE partidas (id_partida INTEGER PRIMARY KEY, ano INTEGER)")
    c.execute("""CREATE TABLE escalacoes (
        id_escalacao INTEGER PRIMARY KEY,
        id_partida INTEGER,
        clube TEXT,
        atleta TEXT,
        id_jogador INTEGER,
        posicao TEXT,
        is_goleiro INTEGER,
        titular INTEGER
    )""")
    c.execute("""CREATE TABLE jogadores (
        id_jogador INTEGER PRIMARY KEY,
        nome_exibicao TEXT,
        apelido TEXT,
        nome_completo TEXT,
        posicao TEXT
    )""")

    # Jogador com ID 1561 cadastrado com nome diferente e posição 'Lateral'
    c.execute("INSERT INTO jogadores (id_jogador, nome_exibicao, apelido, nome_completo, posicao) VALUES (1561, 'Outro Atleta', 'Outro', 'Outro Atleta Completo', 'Lateral')")
    conn.commit()

    try:
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Fabiano", 1561, {"palmeiras"}, 2026
        )
        # O ID colidido não pode transferir 'Lateral' para Fabiano
        assert setor == 'outros'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_metodo_4_homonimo_mesmo_clube_id_distinto():
    """
    Regressão: Homônimo no mesmo clube alcançável pelo Método 4.
    Garante que uma entrada em escalações do mesmo clube com mesmo nome ('Eduardo'),
    mas id_jogador divergente (9999 != 382), seja rejeitada pelos mesmos critérios estritos
    de identidade, impedindo seleção indevida por LIMIT 1.
    """
    import sqlite3
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("CREATE TABLE partidas (id_partida INTEGER PRIMARY KEY, ano INTEGER)")
    c.execute("""CREATE TABLE escalacoes (
        id_escalacao INTEGER PRIMARY KEY,
        id_partida INTEGER,
        clube TEXT,
        atleta TEXT,
        id_jogador INTEGER,
        posicao TEXT,
        is_goleiro INTEGER,
        titular INTEGER
    )""")
    c.execute("""CREATE TABLE jogadores (
        id_jogador INTEGER PRIMARY KEY,
        nome_exibicao TEXT,
        apelido TEXT,
        nome_completo TEXT,
        posicao TEXT
    )""")

    # Partida prévia fora do recorte da temporada (ex: 2022) no mesmo clube ('palmeiras')
    c.execute("INSERT INTO partidas (id_partida, ano) VALUES (1, 2022)")
    # Entrada de escalação no mesmo clube ('palmeiras'), com mesmo nome ('Eduardo'), mas id_jogador divergente (9999)
    c.execute("INSERT INTO escalacoes (id_partida, clube, atleta, id_jogador, posicao, is_goleiro, titular) VALUES (1, 'palmeiras', 'Eduardo', 9999, 'Zagueiro', 0, 1)")
    conn.commit()

    try:
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Eduardo", 382, {"palmeiras"}, 2026
        )
        # O homônimo com ID divergente (9999) no mesmo clube não pode contaminar o atleta (382)
        assert setor == 'outros'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_metodo_2_amostra_minima_goleiro_externo():
    """
    Regressão: Uma única ocorrência externa de goleiro, insuficiente para o Método 2.
    Garante que a regra declarada de amostra mínima (>= 3 titularidades auditáveis) se aplica
    também a goleiros no histórico de carreira (Método 2), rejeitando inferência por aparição única isolada.
    """
    import sqlite3
    from backend.rotas_clubes_canonica import _resolver_posicao_atleta_hierarquica

    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("CREATE TABLE partidas (id_partida INTEGER PRIMARY KEY, ano INTEGER)")
    c.execute("""CREATE TABLE escalacoes (
        id_escalacao INTEGER PRIMARY KEY,
        id_partida INTEGER,
        clube TEXT,
        atleta TEXT,
        id_jogador INTEGER,
        posicao TEXT,
        is_goleiro INTEGER,
        titular INTEGER
    )""")
    c.execute("""CREATE TABLE jogadores (
        id_jogador INTEGER PRIMARY KEY,
        nome_exibicao TEXT,
        apelido TEXT,
        nome_completo TEXT,
        posicao TEXT
    )""")

    # Única partida histórica externa em 2024 em 'Outro Clube'
    c.execute("INSERT INTO partidas (id_partida, ano) VALUES (1, 2024)")
    c.execute("INSERT INTO escalacoes (id_partida, clube, atleta, id_jogador, posicao, is_goleiro, titular) VALUES (1, 'Outro Clube', 'Goleiro Amostra Insuficiente', 5555, 'Goleiro', 1, 1)")
    conn.commit()

    try:
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Goleiro Amostra Insuficiente", 5555, {"palmeiras"}, 2026
        )
        # Uma única ocorrência externa é insuficiente (< 3 titularidades) para o Método 2
        assert setor == 'outros'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_metodo_3_multiplos_candidatos_mesma_posicao_inconclusivo():
    """Valida que múltiplos cadastros candidatos com mesma posição não validam no Método 3.
    
    Regra estrita: coincidência de posição entre homônimos com IDs distintos
    deve permanecer inconclusiva. Não pode retornar 'cadastro_validado'.
    """
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("CREATE TABLE partidas (id_partida INTEGER PRIMARY KEY, ano INTEGER)")
    c.execute("""CREATE TABLE escalacoes (
        id_escalacao INTEGER PRIMARY KEY,
        id_partida INTEGER,
        clube TEXT,
        atleta TEXT,
        id_jogador INTEGER,
        posicao TEXT,
        is_goleiro INTEGER,
        titular INTEGER
    )""")
    c.execute("""CREATE TABLE jogadores (
        id_jogador INTEGER PRIMARY KEY,
        nome_exibicao TEXT,
        apelido TEXT,
        nome_completo TEXT,
        posicao TEXT
    )""")

    # Dois atletas homônimos distintos com mesma posição cadastral ('Zagueiro')
    c.execute("""
        INSERT INTO jogadores (id_jogador, nome_exibicao, apelido, nome_completo, posicao)
        VALUES (9001, 'Lucas Silva', 'Lucas', 'Lucas Silva Ferreira', 'Zagueiro')
    """)
    c.execute("""
        INSERT INTO jogadores (id_jogador, nome_exibicao, apelido, nome_completo, posicao)
        VALUES (9002, 'Lucas Silva', 'Lucas Silva', 'Lucas Silva Santos', 'Zagueiro')
    """)
    conn.commit()

    try:
        # Consulta sem id_jogador definido: cai no Método 3 por busca de nome
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Lucas Silva", None, {"palmeiras"}, 2026
        )
        # Mais de um candidato candidato: Método 3 deve ser inconclusivo
        # Não pode aceitar por coincidência de posição nem retornar 'cadastro_validado'
        assert met != 'cadastro_validado'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()


def test_regressao_metodo_3_candidato_unico_valida():
    """Valida o caminho positivo do Método 3: candidato único cadastral deve validar.
    
    Demonstra que a tabela 'jogadores' é a fonte do Método 3 e que, havendo
    exatamente 1 candidato compatível, o retorno legítimo é 'cadastro_validado'.
    """
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("CREATE TABLE partidas (id_partida INTEGER PRIMARY KEY, ano INTEGER)")
    c.execute("""CREATE TABLE escalacoes (
        id_escalacao INTEGER PRIMARY KEY,
        id_partida INTEGER,
        clube TEXT,
        atleta TEXT,
        id_jogador INTEGER,
        posicao TEXT,
        is_goleiro INTEGER,
        titular INTEGER
    )""")
    c.execute("""CREATE TABLE jogadores (
        id_jogador INTEGER PRIMARY KEY,
        nome_exibicao TEXT,
        apelido TEXT,
        nome_completo TEXT,
        posicao TEXT
    )""")

    # Apenas um único atleta no cadastro com esse nome
    c.execute("""
        INSERT INTO jogadores (id_jogador, nome_exibicao, apelido, nome_completo, posicao)
        VALUES (8001, 'Marcos Rocha', 'Marcos Rocha', 'Marcos Luis Rocha Aquino', 'Lateral')
    """)
    conn.commit()

    try:
        # Consulta sem id_jogador definido: deve desambiguar pelo cadastro único
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Marcos Rocha", None, {"palmeiras"}, 2026
        )
        assert met == 'cadastro_validado'
        assert pos == 'Lateral'
        assert setor == 'defensores'
    finally:
        conn.close()


def test_regressao_metodo_3_multiplos_candidatos_posicoes_diferentes_inconclusivo():
    """Valida que múltiplos cadastros candidatos com posições distintas permanecem inconclusivos.
    
    Comprova que a inconclusão no Método 3 decorre estritamente da pluralidade
    de candidatos (len > 1), independentemente de as posições coincidirem ou divergirem.
    """
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("CREATE TABLE partidas (id_partida INTEGER PRIMARY KEY, ano INTEGER)")
    c.execute("""CREATE TABLE escalacoes (
        id_escalacao INTEGER PRIMARY KEY,
        id_partida INTEGER,
        clube TEXT,
        atleta TEXT,
        id_jogador INTEGER,
        posicao TEXT,
        is_goleiro INTEGER,
        titular INTEGER
    )""")
    c.execute("""CREATE TABLE jogadores (
        id_jogador INTEGER PRIMARY KEY,
        nome_exibicao TEXT,
        apelido TEXT,
        nome_completo TEXT,
        posicao TEXT
    )""")

    # Dois homônimos com posições divergentes (Zagueiro vs Atacante)
    c.execute("""
        INSERT INTO jogadores (id_jogador, nome_exibicao, apelido, nome_completo, posicao)
        VALUES (9001, 'Lucas Silva', 'Lucas', 'Lucas Silva Ferreira', 'Zagueiro')
    """)
    c.execute("""
        INSERT INTO jogadores (id_jogador, nome_exibicao, apelido, nome_completo, posicao)
        VALUES (9003, 'Lucas Silva', 'Lucas Silva', 'Lucas Silva Santos', 'Atacante')
    """)
    conn.commit()

    try:
        setor, pos, met = _resolver_posicao_atleta_hierarquica(
            conn, "Lucas Silva", None, {"palmeiras"}, 2026
        )
        assert met != 'cadastro_validado'
        assert pos == 'Posição a Confirmar'
        assert met == 'posicao_a_confirmar'
    finally:
        conn.close()



