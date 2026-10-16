import sys
import io
import urllib.request
import requests
import pandas as pd
import numpy as np

# Configurar UTF-8
sys.stdout.reconfigure(encoding='utf-8')

print("⚽ 1. Baixando base do Brasileirão (2003 - 2024)...")
url = 'https://raw.githubusercontent.com/adaoduque/Brasileirao_Dataset/master/campeonato-brasileiro-full.csv'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    data = resp.read()
df = pd.read_csv(io.BytesIO(data))

# Formatar datas: a coluna 'data' vem como DD/MM/AAAA ou AAAA-MM-DD
df['data_dt'] = pd.to_datetime(df['data'], format='mixed', dayfirst=True)
df['ano'] = df['data_dt'].dt.year
df['data_str'] = df['data_dt'].dt.strftime('%Y-%m-%d')
df['dia_semana'] = df['data_dt'].dt.day_name()

# Filtrar período recente (2015 a 2024) para cruzar com dados meteorológicos detalhados
df_recent = df[df['ano'] >= 2015].copy()
print(f"Total de jogos de 2015 a 2024: {len(df_recent)}")

print("\n🌤️ 2. Buscando histórico de clima de São Paulo na Open-Meteo API...")
# São Paulo: lat -23.5505, lon -46.6333
weather_url = 'https://archive-api.open-meteo.com/v1/archive'
weather_params = {
    'latitude': -23.5505,
    'longitude': -46.6333,
    'start_date': '2015-01-01',
    'end_date': '2024-12-31',
    'daily': ['temperature_2m_max', 'precipitation_sum'],
    'timezone': 'America/Sao_Paulo'
}
w_res = requests.get(weather_url, params=weather_params).json()
df_weather_sp = pd.DataFrame({
    'data_str': w_res['daily']['time'],
    'temp_max': w_res['daily']['temperature_2m_max'],
    'chuva_mm': w_res['daily']['precipitation_sum']
})
print(f"Dados climáticos de SP carregados: {len(df_weather_sp)} dias.")

print("\n🌤️ 3. Buscando histórico de clima do Rio de Janeiro na Open-Meteo API...")
# Rio de Janeiro: lat -22.9068, lon -43.1729
weather_params_rj = {
    'latitude': -22.9068,
    'longitude': -43.1729,
    'start_date': '2015-01-01',
    'end_date': '2024-12-31',
    'daily': ['temperature_2m_max', 'precipitation_sum'],
    'timezone': 'America/Sao_Paulo'
}
w_res_rj = requests.get(weather_url, params=weather_params_rj).json()
df_weather_rj = pd.DataFrame({
    'data_str': w_res_rj['daily']['time'],
    'temp_max': w_res_rj['daily']['temperature_2m_max'],
    'chuva_mm': w_res_rj['daily']['precipitation_sum']
})

# Merge SP
sp_teams = ['Palmeiras', 'Corinthians', 'Sao Paulo', 'Santos']
df_sp = df_recent[df_recent['mandante'].isin(sp_teams)].merge(df_weather_sp, on='data_str', how='inner')

# Merge RJ
rj_teams = ['Flamengo', 'Fluminense', 'Botafogo-RJ', 'Vasco']
df_rj = df_recent[df_recent['mandante'].isin(rj_teams)].merge(df_weather_rj, on='data_str', how='inner')

# Função para classificar resultado do mandante
def get_resultado(row):
    if row['vencedor'] == row['mandante']:
        return 'Vitoria'
    elif row['vencedor'] == '-':
        return 'Empate'
    else:
        return 'Derrota'

df_sp['resultado'] = df_sp.apply(get_resultado, axis=1)
df_rj['resultado'] = df_rj.apply(get_resultado, axis=1)

print("\n" + "="*60)
print("🔍 MINERAÇÃO DE FATOS BIZARROS & CORRELAÇÕES")
print("="*60)

# Análise 1: Palmeiras sob Chuva vs Seco
palm = df_sp[df_sp['mandante'] == 'Palmeiras']
palm_chuva = palm[palm['chuva_mm'] >= 5.0]
palm_seco = palm[palm['chuva_mm'] < 1.0]

v_chuva = (palm_chuva['resultado'] == 'Vitoria').mean() * 100
v_seco = (palm_seco['resultado'] == 'Vitoria').mean() * 100
print(f"1. PALMEIRAS COMO MANDANTE (2015-2024):")
print(f"   - Com chuva (>= 5mm, {len(palm_chuva)} jogos): Aproveitamento de vitórias = {v_chuva:.1f}%")
print(f"   - Dia seco (< 1mm, {len(palm_seco)} jogos): Aproveitamento de vitórias = {v_seco:.1f}%")

# Análise 2: Flamengo sob Calor Extremo (>= 32°C) vs Ameno
fla = df_rj[df_rj['mandante'] == 'Flamengo']
fla_calor = fla[fla['temp_max'] >= 32.0]
fla_ameno = fla[fla['temp_max'] < 26.0]

v_calor = (fla_calor['resultado'] == 'Vitoria').mean() * 100
v_ameno = (fla_ameno['resultado'] == 'Vitoria').mean() * 100
gols_calor = (fla_calor['mandante_Placar'] + fla_calor['visitante_Placar']).mean()
gols_ameno = (fla_ameno['mandante_Placar'] + fla_ameno['visitante_Placar']).mean()
print(f"\n2. FLAMENGO NO MARACANÃ (2015-2024):")
print(f"   - Em dias de calor senegalês (>= 32°C, {len(fla_calor)} jogos): Taxa de vitória = {v_calor:.1f}% | Média de gols totais = {gols_calor:.2f}")
print(f"   - Em dias amenos (< 26°C, {len(fla_ameno)} jogos): Taxa de vitória = {v_ameno:.1f}% | Média de gols totais = {gols_ameno:.2f}")

# Análise 3: Corinthians - O Rei dos Dias de Frio (< 20°C)
cor = df_sp[df_sp['mandante'] == 'Corinthians']
cor_frio = cor[cor['temp_max'] <= 21.0]
cor_calor = cor[cor['temp_max'] >= 28.0]
v_frio = (cor_frio['resultado'] == 'Vitoria').mean() * 100
v_cor_calor = (cor_calor['resultado'] == 'Vitoria').mean() * 100
print(f"\n3. CORINTHIANS EM ITAQUERA (2015-2024):")
print(f"   - No frio paulistano (<= 21°C, {len(cor_frio)} jogos): Taxa de vitória = {v_frio:.1f}%")
print(f"   - No calor paulistano (>= 28°C, {len(cor_calor)} jogos): Taxa de vitória = {v_cor_calor:.1f}%")

# Análise 4: São Paulo e o dia da semana
spfc = df_sp[df_sp['mandante'] == 'Sao Paulo']
spfc_sab = spfc[spfc['dia_semana'] == 'Saturday']
spfc_dom = spfc[spfc['dia_semana'] == 'Sunday']
spfc_qua = spfc[spfc['dia_semana'] == 'Wednesday']
print(f"\n4. SÃO PAULO NO MORUMBI POR DIA DA SEMANA:")
print(f"   - Quarta-feira ({len(spfc_qua)} jogos): Vitórias = {(spfc_qua['resultado']=='Vitoria').mean()*100:.1f}%")
print(f"   - Sábado ({len(spfc_sab)} jogos): Vitórias = {(spfc_sab['resultado']=='Vitoria').mean()*100:.1f}%")
print(f"   - Domingo ({len(spfc_dom)} jogos): Vitórias = {(spfc_dom['resultado']=='Vitoria').mean()*100:.1f}%")

print("\n" + "="*60)
print("✅ Mineração concluída com sucesso!")
print("="*60)
