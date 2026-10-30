"""
FutStats - Gerador Editorial Determinístico de Crônicas e Manchetes Táticas
Produz manchetes de até 80 caracteres, subtítulos e textos analíticos no tom clássico de imprensa esportiva.
"""
from typing import Dict, List, Any, TypedDict, Optional

class GoalEvent(TypedDict):
    minuto: int
    autor: str
    clube: str
    detalhe: str  # ex: 'contra-ataque', 'cabeceio', 'falta direta'

class CardEvent(TypedDict):
    minuto: int
    jogador: str
    clube: str
    tipo: str     # 'amarelo' ou 'vermelho'

class MatchData(TypedDict):
    mandante: str
    visitante: str
    gols_mandante: int
    gols_visitante: int
    data: str
    campeonato: str
    estadio: str
    gols: List[GoalEvent]
    cartoes: List[CardEvent]
    virada: bool
    tabu_quebrado: Optional[str]
    protagonista: str
    destaque_tatico: str
    xg_mandante: float
    xg_visitante: float


def gerar_editorial_partida(dados: MatchData) -> Dict[str, str]:
    """
    Gera manchete (<= 80 chars), subtítulo e 2 parágrafos analíticos
    a partir do JSON de estatísticas e eventos do confronto.
    """
    m, v = dados["mandante"], dados["visitante"]
    gm, gv = dados["gols_mandante"], dados["gols_visitante"]
    saldo = abs(gm - gv)
    vencedor = m if gm > gv else (v if gv > gm else "Empate")
    derrotado = v if vencedor == m else m
    
    gols_ordenados = sorted(dados.get("gols", []), key=lambda x: x.get("minuto", 0))
    ultimo_gol = gols_ordenados[-1] if gols_ordenados else None
    vermelhos = [c for c in dados.get("cartoes", []) if c.get("tipo") == "vermelho"]

    # 1. Identificação do Arquétipo do Jogo e Geração da Manchete (<= 80 caracteres)
    if vencedor == "Empate" and vermelhos:
        clube_expulso = vermelhos[0]["clube"]
        min_exp = vermelhos[0]["minuto"]
        clube_rival = m if clube_expulso == v else v
        manchete = f"Com um a menos desde os {min_exp}', {clube_expulso} sustenta {gm} a {gv} ante o {clube_rival}"
        subtitulo = (
            f"Em duelo de alta exigência tática pelo {dados['campeonato']}, reorganização defensiva "
            f"e atuação de {dados['protagonista']} neutralizam superioridade numérica rival."
        )
    elif saldo >= 3:
        manchete = f"Imposição tática: {vencedor} aplica {max(gm, gv)} a {min(gm, gv)} no {derrotado} pelo {dados['campeonato']}"
        subtitulo = (
            f"Com volume ofensivo implacável ({max(dados['xg_mandante'], dados['xg_visitante']):.2f} xG) e comando de "
            f"{dados['protagonista']}, equipe constrói placar elástico no {dados['estadio']}."
        )
    elif ultimo_gol and ultimo_gol["minuto"] >= 88 and saldo == 1:
        manchete = f"{dados['protagonista']} decide aos {ultimo_gol['minuto']}' e {vencedor} vence o {derrotado} por {max(gm, gv)} a {min(gm, gv)}"
        subtitulo = (
            f"Confronto válido pelo {dados['campeonato']} é definido nos acréscimos após "
            f"{'virada e ' if dados.get('virada') else ''}ajuste estrutural na etapa complementar."
        )
    else:
        manchete = f"{vencedor} supera {derrotado} por {max(gm, gv)} a {min(gm, gv)} com protagonismo de {dados['protagonista']}"
        subtitulo = f"Eficiência nas áreas define clássico pelo {dados['campeonato']} em {dados['data']}."

    # Trava rigorosa de segurança de 80 caracteres para a manchete
    if len(manchete) > 80:
        manchete = manchete[:77].rstrip() + "..."

    # 2. Construção do Parágrafo 1: Desenho Tático, Placar e Momento Decisivo
    if vencedor != "Empate":
        contexto_tabu = f" O resultado ainda encerra uma marca histórica: {dados['tabu_quebrado']}." if dados.get("tabu_quebrado") else ""
        momento_gol = ""
        if ultimo_gol:
            momento_gol = (
                f", o momento capital da partida ocorreu aos {ultimo_gol['minuto']} minutos, quando {ultimo_gol['autor']} "
                f"converteu em {ultimo_gol['detalhe']} para consolidar o marcador"
            )
        p1 = (
            f"A vitória do {vencedor} por {max(gm, gv)} a {min(gm, gv)} sobre o {derrotado}, no {dados['estadio']}, "
            f"foi construída a partir de uma leitura precisa dos espaços ({dados['destaque_tatico']}). "
            f"Refletindo a produção de {dados['xg_mandante']:.2f} contra {dados['xg_visitante']:.2f} em Expected Goals (xG)"
            f"{momento_gol}.{contexto_tabu}"
        )
    else:
        exp_texto = f"a expulsão de {vermelhos[0]['jogador']} ({vermelhos[0]['clube']})" if vermelhos else "a forte marcação mútua"
        min_texto = f"aos {vermelhos[0]['minuto']} minutos, com " if vermelhos else ""
        p1 = (
            f"O empate por {gm} a {gv} entre {m} e {v}, no {dados['estadio']}, teve seu roteiro tático "
            f"redefinido {min_texto}{exp_texto}. "
            f"Em confronto disputado pelo {dados['campeonato']}, a partida caracterizou-se por ({dados['destaque_tatico']}), "
            f"com os sistemas defensivos contendo a produção de {max(dados['xg_mandante'], dados['xg_visitante']):.2f} xG adversário."
        )

    # 3. Construção do Parágrafo 2: Análise do Protagonista e Impacto Técnico
    gols_protagonista = [g for g in dados.get("gols", []) if g.get("autor") == dados.get("protagonista")]
    acao_protagonista = (
        f"autor de {len(gols_protagonista)} gol(s) — incluindo a finalização aos {gols_protagonista[-1]['minuto']} minutos"
        if gols_protagonista else "eixo de equilíbrio nas transições e na proteção de zona"
    )
    
    p2 = (
        f"No plano individual, {dados['protagonista']} foi o diferencial técnico do confronto, atuando como "
        f"{acao_protagonista}. Sua capacidade de sustentar a intensidade sob pressão e executar o plano de jogo "
        f"sem desvios posicionais determinou o desfecho da partida pelo {dados['campeonato']}, "
        f"premiando a equipe que melhor controlou a relação entre risco e eficiência nas duas áreas."
    )

    return {
        "manchete": manchete,
        "tamanho_manchete": f"{len(manchete)} caracteres",
        "subtitulo": subtitulo,
        "paragrafo_1": p1,
        "paragrafo_2": p2
    }
