import sys
import os
sys.path.append('backend')
from ia_analista import responder_perguntas_demo

# Configura encoding de saída para UTF-8 no Windows
sys.stdout.reconfigure(encoding='utf-8')

perguntas = [
    "Qual é o retrospecto do Palmeiras em jogos logo após o último capítulo de uma novela das 9 da Globo?",
    "Qual o aproveitamento de vitórias do Corinthians jogando em dias pares vs dias ímpares?",
    "Quais clubes mais marcaram gols nos acréscimos (minuto 45+ ou 90+) na história catalogada?",
    "Quais são os 5 maiores artilheiros da história da Série B do Brasileirão?",
    "Qual o aproveitamento do Flamengo jogando com chuva torrencial acima de 15mm?",
    "Quem são os jogadores com mais gols de falta catalogados no futebol brasileiro?",
    "Quais os clássicos com a maior média de cartões vermelhos por partida?"
]

print(f"Testando {len(perguntas)} perguntas sugeridas do Oráculo:\n")
all_ok = True
for i, q in enumerate(perguntas, 1):
    try:
        res = responder_perguntas_demo(q)
        if not res:
            print(f"[{i}] FAIL - Retornou None para: {q}")
            all_ok = False
            continue
        
        # Validar integridade
        dados = res.get('dados', [])
        insight = res.get('insight', '')
        tweet = res.get('tweet', '')
        
        print(f"[{i}] OK: {q[:45]}...")
        print(f"     Modelo: {res.get('modelo_usado')}")
        print(f"     Registros: {len(dados)}")
        print(f"     Insight: {insight[:90]}...")
        print(f"     Tweet: {tweet[:90]}...")
        
        # Checar se há 'Destaque' ou 'None' indevido
        if 'Destaque com 0 gols' in insight or 'None com None' in tweet or 'None' in tweet:
            print(f"     [ERRO CRÍTICO] Texto corrompido ou 'None' detectado no tweet/insight!")
            all_ok = False
        print()
    except Exception as e:
        print(f"[{i}] ERRO: {e}")
        all_ok = False

if all_ok:
    print(">>> TODOS OS 7 TESTES PASSARAM COM SUCESSO ABSOLUTO! <<<")
else:
    print(">>> ALGUNS TESTES FALHARAM! <<<")
