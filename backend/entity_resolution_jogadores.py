"""
FutStats - Motor de Entity Resolution e Desambiguação de Atletas no SQLite
Aplica paradigma de Record Linkage com Blocking + Hard Constraints (Veto Biológico e Veto de Ubiquidade Temporal).
"""
import sqlite3
import unicodedata
from datetime import datetime
from difflib import SequenceMatcher
from typing import Dict, List, Any, Optional, Tuple


def normalizar_texto(texto: str) -> str:
    """Remove acentos, converte para minúsculas e limpa espaços extras."""
    if not texto:
        return ""
    nfkd = unicodedata.normalize("NFKD", texto)
    sem_acento = "".join([c for c in nfkd if not unicodedata.combining(c)])
    return " ".join(sem_acento.lower().split())


AFINIDADE_POSICAO: Dict[str, Dict[str, float]] = {
    "Goleiro":      {"Goleiro": 1.0},
    "Zagueiro":     {"Zagueiro": 1.0, "Lateral": 0.65, "Volante": 0.70},
    "Lateral":      {"Lateral": 1.0, "Zagueiro": 0.65, "Volante": 0.65, "Meia": 0.50, "Ponta": 0.70},
    "Volante":      {"Volante": 1.0, "Zagueiro": 0.70, "Lateral": 0.65, "Meia": 0.75},
    "Meia":         {"Meia": 1.0, "Volante": 0.75, "Lateral": 0.50, "Ponta": 0.80, "Centroavante": 0.55, "Atacante": 0.65},
    "Ponta":        {"Ponta": 1.0, "Meia": 0.80, "Lateral": 0.70, "Centroavante": 0.85, "Atacante": 0.90},
    "Centroavante": {"Centroavante": 1.0, "Ponta": 0.85, "Meia": 0.55, "Atacante": 1.0},
    "Atacante":     {"Atacante": 1.0, "Centroavante": 1.0, "Ponta": 0.90, "Meia": 0.65}
}


class PlayerEntityResolver:
    LIMIAR_VINCULO_AUTO = 78.0
    LIMIAR_REVISAO = 55.0

    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def _buscar_candidatos_bloqueio(self, nome_sumula: str) -> List[sqlite3.Row]:
        """
        Fase de Blocking: Filtra apenas jogadores cujo nome ou apelido compartilhe
        tokens com o nome na súmula.
        """
        nome_norm = normalizar_texto(nome_sumula)
        primeiro_token = nome_norm.split()[0] if nome_norm else ""

        query = """
            SELECT id_jogador, nome_completo, apelido_principal, outros_apelidos,
                   ano_nascimento, posicao_primaria
            FROM jogadores
            WHERE apelido_norm = ?
               OR nome_norm LIKE ?
               OR outros_apelidos_norm LIKE ?
        """
        cursor = self.conn.cursor()
        cursor.execute(query, (
            nome_norm,
            f"%{primeiro_token}%",
            f"%{nome_norm}%"
        ))
        return cursor.fetchall()

    def _avaliar_historico_clube(self, id_jogador: int, clube_jogo: str, data_jogo: str) -> Tuple[float, bool, str]:
        """
        Consulta histórico de presenças do candidato na proximidade temporal da partida.
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT clube, data_partida,
                   ABS(JULIANDAY(data_partida) - JULIANDAY(?)) AS diff_dias
            FROM presencas_sumula
            WHERE id_jogador = ?
            ORDER BY diff_dias ASC
            LIMIT 5
        """, (data_jogo, id_jogador))
        
        historico = cursor.fetchall()
        if not historico:
            return 12.0, False, "Sem histórico prévio (possível estreia)"

        menor_diff_outro_clube = 99999.0
        menor_diff_mesmo_clube = 99999.0

        for reg in historico:
            if reg["clube"] == clube_jogo:
                menor_diff_mesmo_clube = min(menor_diff_mesmo_clube, reg["diff_dias"])
            else:
                menor_diff_outro_clube = min(menor_diff_outro_clube, reg["diff_dias"])

        # Veto de Ubiquidade: jogou por outro clube no mesmo fim de semana (< 1.5 dias)
        if menor_diff_outro_clube <= 1.5:
            return 0.0, True, f"VETO: Atuou por outro clube a {menor_diff_outro_clube:.0f} dia(s) da data"

        if menor_diff_mesmo_clube <= 180:
            return 45.0, False, f"Ativo no {clube_jogo} (jogo a {menor_diff_mesmo_clube:.0f} dias)"
        if menor_diff_mesmo_clube <= 365:
            return 32.0, False, f"Vínculo na temporada com {clube_jogo} ({menor_diff_mesmo_clube:.0f} dias)"
        if menor_diff_mesmo_clube < 99999.0:
            return 20.0, False, f"Passagem anterior/posterior pelo {clube_jogo}"

        if menor_diff_outro_clube <= 20:
            return -20.0, False, f"Penalidade: Atuava em outro clube há {menor_diff_outro_clube:.0f} dias"

        return 10.0, False, "Sem vínculo prévio com o clube, mas calendário livre"

    def calcular_confianca_candidato(
        self, candidato: sqlite3.Row, registro_sumula: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calcula a pontuação de 0% a 100% aplicando vetos absolutos e multicritérios."""
        data_str = registro_sumula["data_partida"]
        ano_jogo = int(data_str.split("-")[0])
        clube_jogo = registro_sumula["clube"]
        pos_jogo = registro_sumula.get("posicao_sumula", "Atacante")
        nome_sumula_norm = normalizar_texto(registro_sumula["nome_sumula"])

        # 1. VETO BIOLÓGICO (Idade ativa na data do jogo)
        ano_nasc = candidato["ano_nascimento"] or (ano_jogo - 24)
        idade_no_jogo = ano_jogo - ano_nasc
        idade_max = 45 if candidato["posicao_primaria"] == "Goleiro" else 42
        if idade_no_jogo < 15 or idade_no_jogo > idade_max:
            return {
                "id_jogador": candidato["id_jogador"],
                "nome_completo": candidato["nome_completo"],
                "confianca": 0.0,
                "motivo": f"VETO BIOLÓGICO: Idade incompatível ({idade_no_jogo} anos em {ano_jogo})"
            }

        # 2. VÍNCULO CLUBE-TEMPO E VETO DE UBIQUIDADE (Máx: 45 pts)
        pts_clube, veto_colisao, msg_clube = self._avaliar_historico_clube(
            candidato["id_jogador"], clube_jogo, data_str
        )
        if veto_colisao:
            return {
                "id_jogador": candidato["id_jogador"],
                "nome_completo": candidato["nome_completo"],
                "confianca": 0.0,
                "motivo": msg_clube
            }

        # 3. SIMILARIDADE NOMINAL (Máx: 25 pts)
        apelido_norm = normalizar_texto(candidato["apelido_principal"] or "")
        nome_comp_norm = normalizar_texto(candidato["nome_completo"] or "")
        outros_norm = [normalizar_texto(a) for a in (candidato["outros_apelidos"] or "").split(",") if a]

        if nome_sumula_norm == apelido_norm or nome_sumula_norm == nome_comp_norm or nome_sumula_norm in outros_norm:
            pts_nome = 25.0
        elif nome_sumula_norm in nome_comp_norm.split():
            pts_nome = 20.0
        else:
            ratio = max(
                SequenceMatcher(None, nome_sumula_norm, apelido_norm).ratio(),
                SequenceMatcher(None, nome_sumula_norm, nome_comp_norm).ratio()
            )
            pts_nome = round(ratio * 18.0, 2)

        # 4. COMPATIBILIDADE POSICIONAL (Máx: 20 pts)
        pos_cand = candidato["posicao_primaria"] or "Atacante"
        if (pos_cand == "Goleiro") != (pos_jogo == "Goleiro"):
            pts_pos = -30.0
        else:
            fator_pos = AFINIDADE_POSICAO.get(pos_cand, {}).get(pos_jogo, 0.50)
            pts_pos = round(20.0 * fator_pos, 2)

        # 5. CURVA ETÁRIA (Máx: 10 pts)
        if 18 <= idade_no_jogo <= 34:
            pts_idade = 10.0
        elif 16 <= idade_no_jogo <= 38:
            pts_idade = 6.0
        else:
            pts_idade = 2.0

        score_final = max(0.0, min(100.0, round(pts_clube + pts_nome + pts_pos + pts_idade, 2)))

        return {
            "id_jogador": candidato["id_jogador"],
            "nome_completo": candidato["nome_completo"],
            "confianca": score_final,
            "detalhes": {
                "clube_pts": pts_clube,
                "nome_pts": pts_nome,
                "posicao_pts": pts_pos,
                "idade_pts": pts_idade,
                "idade_no_jogo": idade_no_jogo,
                "contexto_clube": msg_clube
            }
        }

    def processar_escalacao(self, registro_sumula: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa um item de escalação e decide entre:
        - VINCULAR_EXISTENTE (>= 78%)
        - REVISAO_HUMANA_SUGERIDA (55% a 77.9%)
        - CRIAR_NOVO_JOGADOR (< 55%)
        """
        candidatos = self._buscar_candidatos_bloqueio(registro_sumula["nome_sumula"])
        avaliacoes = [self.calcular_confianca_candidato(c, registro_sumula) for c in candidatos]
        avaliacoes.sort(key=lambda x: x["confianca"], reverse=True)

        melhor = avaliacoes[0] if avaliacoes else None
        confianca_max = melhor["confianca"] if melhor else 0.0

        cursor = self.conn.cursor()

        if melhor and confianca_max >= self.LIMIAR_VINCULO_AUTO:
            acao = "VINCULAR_EXISTENTE"
            id_final = melhor["id_jogador"]
            nome_final = melhor["nome_completo"]
        elif melhor and confianca_max >= self.LIMIAR_REVISAO:
            acao = "REVISAO_HUMANA_SUGERIDA"
            id_final = melhor["id_jogador"]
            nome_final = melhor["nome_completo"]
        else:
            acao = "CRIAR_NOVO_JOGADOR"
            ano_jogo = int(registro_sumula["data_partida"].split("-")[0])
            ano_nasc_estimado = registro_sumula.get("ano_nascimento_sumula") or (ano_jogo - 22)
            nome_limpo = registro_sumula["nome_sumula"]

            cursor.execute("""
                INSERT INTO jogadores (
                    nome_completo, apelido_principal, outros_apelidos,
                    nome_norm, apelido_norm, outros_apelidos_norm,
                    ano_nascimento, posicao_primaria
                ) VALUES (?, ?, '', ?, ?, '', ?, ?)
            """, (
                f"{nome_limpo} ({registro_sumula['clube']} {ano_jogo})",
                nome_limpo,
                normalizar_texto(nome_limpo),
                normalizar_texto(nome_limpo),
                ano_nasc_estimado,
                registro_sumula.get("posicao_sumula", "Atacante")
            ))
            id_final = cursor.lastrowid
            nome_final = f"{nome_limpo} [NOVO ID #{id_final}]"

        cursor.execute("""
            INSERT INTO presencas_sumula (id_jogador, data_partida, clube, posicao_sumula, confianca_vinculo, status_vinculo)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (id_final, registro_sumula["data_partida"], registro_sumula["clube"],
              registro_sumula.get("posicao_sumula", "Atacante"), confianca_max, acao))
        self.conn.commit()

        return {
            "entrada_sumula": f"{registro_sumula['nome_sumula']} ({registro_sumula['clube']} em {registro_sumula['data_partida']})",
            "decisao": acao,
            "id_jogador_atribuido": id_final,
            "atleta_identificado": nome_final,
            "confianca_pct": confianca_max,
            "diagnostico": melhor.get("detalhes") or melhor.get("motivo") if melhor else "Nenhum homônimo prévio na base"
        }
