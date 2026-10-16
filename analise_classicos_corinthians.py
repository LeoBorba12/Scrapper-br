import sys
import pandas as pd
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

url = 'https://raw.githubusercontent.com/adaoduque/Brasileirao_Dataset/master/campeonato-brasileiro-full.csv'
df = pd.read_csv(url)

df['data_dt'] = pd.to_datetime(df['data'], format='mixed', dayfirst=True)
df = df.sort_values('data_dt').reset_index(drop=True)

# Filtrar todos os jogos do Corinthians
cor_mask = (df['mandante'] == 'Corinthians') | (df['visitante'] == 'Corinthians')
df_cor = df[cor_mask].copy().sort_values('data_dt').reset_index(drop=True)

classicos = ['Palmeiras', 'Sao Paulo', 'Santos']

df_cor['eh_classico'] = df_cor.apply(
    lambda r: (r['mandante'] == 'Corinthians' and r['visitante'] in classicos) or
              (r['visitante'] == 'Corinthians' and r['mandante'] in classicos), axis=1
)

def gols_sofridos(r):
    if r['mandante'] == 'Corinthians':
        return r['visitante_Placar']
    else:
        return r['mandante_Placar']

def corinthians_venceu(r):
    return r['vencedor'] == 'Corinthians'

df_cor['gols_sofridos'] = df_cor.apply(gols_sofridos, axis=1)
df_cor['venceu'] = df_cor.apply(corinthians_venceu, axis=1)

jogos_mais_3 = df_cor[(df_cor['eh_classico']) & (df_cor['gols_sofridos'] > 3)].index.tolist()
jogos_3_ou_mais = df_cor[(df_cor['eh_classico']) & (df_cor['gols_sofridos'] >= 3)].index.tolist()

print(f"Total de jogos do Corinthians no Brasileirão (2003-2024): {len(df_cor)}")
print(f"Total de clássicos estaduais (Palmeiras, Santos, SPFC): {df_cor['eh_classico'].sum()}")
print(f"Clássicos tomando > 3 gols (4 ou mais gols): {len(jogos_mais_3)}")
print(f"Clássicos tomando >= 3 gols (3 ou mais gols): {len(jogos_3_ou_mais)}")

print("\n" + "="*70)
print("CENÁRIO 1: TOMANDO MAIS DE 3 GOLS (>3, OU SEJA, 4 OU MAIS GOLS)")
print("="*70)
seguintes_1 = []
for i in jogos_mais_3:
    atual = df_cor.iloc[i]
    if i + 1 < len(df_cor):
        prox = df_cor.iloc[i + 1]
        res = "VITÓRIA" if prox['venceu'] else ("EMPATE" if prox['vencedor'] == '-' else "DERROTA")
        adv = atual['visitante'] if atual['mandante'] == 'Corinthians' else atual['mandante']
        print(f"Jogo: {atual['data']} -> {atual['mandante']} {atual['mandante_Placar']} x {atual['visitante_Placar']} {atual['visitante']}")
        print(f"   ↳ Próximo jogo ({prox['data']}): {prox['mandante']} {prox['mandante_Placar']} x {prox['visitante_Placar']} {prox['visitante']} | Resultado: {res}\n")
        seguintes_1.append(prox['venceu'])

tx_1 = np.mean(seguintes_1) * 100 if seguintes_1 else 0
print(f"Taxa de vitória no jogo seguinte (>3 gols): {sum(seguintes_1)}/{len(seguintes_1)} ({tx_1:.1f}%)")

print("\n" + "="*70)
print("CENÁRIO 2: TOMANDO 3 OU MAIS GOLS (>=3 GOLS)")
print("="*70)
seguintes_2 = []
for i in jogos_3_ou_mais:
    atual = df_cor.iloc[i]
    if i + 1 < len(df_cor):
        prox = df_cor.iloc[i + 1]
        res = "VITÓRIA" if prox['venceu'] else ("EMPATE" if prox['vencedor'] == '-' else "DERROTA")
        print(f"Jogo: {atual['data']} -> {atual['mandante']} {atual['mandante_Placar']} x {atual['visitante_Placar']} {atual['visitante']}")
        print(f"   ↳ Próximo jogo ({prox['data']}): {prox['mandante']} {prox['mandante_Placar']} x {prox['visitante_Placar']} {prox['visitante']} | Resultado: {res}\n")
        seguintes_2.append(prox['venceu'])

tx_2 = np.mean(seguintes_2) * 100 if seguintes_2 else 0
print(f"Taxa de vitória no jogo seguinte (>=3 gols): {sum(seguintes_2)}/{len(seguintes_2)} ({tx_2:.1f}%)")
