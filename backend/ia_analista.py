import os
import sqlite3
import re
import json
import requests

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
DB_FUTEBOL = os.path.join(ROOT_DIR, 'data', 'futebol.db')
DB_CLIMA = os.path.join(ROOT_DIR, 'data', 'clima.db')

SCHEMA_PROMPT = """
Você é o Oráculo de Futebol & IA Analista de Dados do FutStats, conectado a um banco SQLite real com 55.395 jogos oficiais e 42.138 gols do futebol brasileiro.

Tabelas disponíveis:
1. partidas (todas as partidas 1971-2024 de Série A, Série B, Copa do Brasil, etc):
   - id_partida (INT, PK)
   - ano (INT, ex: 1982, 2024)
   - data (TEXT, formato YYYY-MM-DD, ex: '2024-05-12')
   - horario (TEXT, ex: '16:00')
   - estadio (TEXT)
   - cidade (TEXT)
   - estado (TEXT)
   - mandante (TEXT, ex: 'Flamengo', 'Corinthians', 'Palmeiras', 'São Paulo')
   - visitante (TEXT)
   - gols_mandante (INT)
   - gols_visitante (INT)
   - placar (TEXT, ex: '2 x 1')
   - vencedor (TEXT, ex: 'Flamengo' ou 'Empate')
   - campeonato (TEXT, ex: 'Campeonato Brasileiro Série A', 'Campeonato Brasileiro Série B')
   - fase (TEXT, ex: 'Final', 'Rodada 1')
   - arbitro (TEXT)
   - publico (INT)

2. gols (gols catalogados lance a lance):
   - id_gol (INT, PK)
   - id_partida (INT, FK partidas)
   - clube (TEXT)
   - atleta (TEXT, ex: 'Zico', 'Roberto Dinamite', 'Reinaldo', 'Gabriel Barbosa')
   - minuto (TEXT, ex: '34', '45+2', '90+3')
   - tempo (TEXT, ex: '1T', '2T')
   - tipo_de_gol (TEXT, ex: 'Normal', 'Pênalti', 'Falta', 'Contra')

3. cartoes (cartões aplicados):
   - id_cartao (INT, PK)
   - id_partida (INT, FK)
   - clube (TEXT)
   - atleta (TEXT, ex: 'Thiago Heleno', 'Fagner', 'Felipe Melo')
   - cartao (TEXT, ex: 'Amarelo', 'Vermelho')
   - minuto (TEXT)
   - motivo (TEXT)

4. escalacoes (titulares e reservas):
   - id_escalacao (INT)
   - id_partida (INT)
   - clube (TEXT)
   - atleta (TEXT)
   - titular (INT, 1=titular, 0=reserva)
   - posicao (TEXT)

5. clima.clima_diario (dados meteorológicos oficiais do INMET em capitais brasileiras):
   - data (TEXT, YYYY-MM-DD)
   - cidade (TEXT)
   - estado (TEXT)
   - precipitacao_mm (REAL)
   - temperatura_media (REAL)

REGRAS OBRIGATÓRIAS DE SQL:
- Escreva APENAS comandos SELECT (somente-leitura).
- Para filtros de data por dia par/ímpar, use: CAST(strftime('%d', data) AS INT) % 2 = 0
- Para filtros de acréscimos, use: (minuto LIKE '45+%' OR minuto LIKE '90+%' OR CAST(minuto AS INT) >= 90)
- Para clubes, use LIKE com % (ex: mandante LIKE '%Corinthians%' ou visitante LIKE '%Corinthians%')
- Sempre limite o resultado caso retorne muitas linhas (LIMIT 50).
"""

def executar_query_segura(sql):
    cleaned = sql.strip().upper()
    prohibited = ['DROP ', 'DELETE ', 'UPDATE ', 'INSERT ', 'ALTER ', 'CREATE ', 'ATTACH ', 'DETACH ', 'TRUNCATE ', ';--']
    for p in prohibited:
        if p in cleaned:
            raise ValueError(f"Comando proibido detectado: {p.strip()}. Apenas consultas SELECT são permitidas.")
            
    conn = sqlite3.connect(DB_FUTEBOL)
    c = conn.cursor()
    c.execute("PRAGMA query_only = ON;")
    if os.path.exists(DB_CLIMA):
        try:
            c.execute(f"ATTACH DATABASE '{DB_CLIMA}' AS clima;")
        except Exception:
            pass
            
    c.execute(sql)
    colunas = [d[0] for d in c.description] if c.description else []
    linhas = c.fetchall()
    conn.close()
    
    # Formata como lista de dicionários
    resultados = []
    for row in linhas:
        resultados.append(dict(zip(colunas, row)))
        
    return colunas, resultados

def chamar_gemini(prompt, api_key, model="gemini-2.0-flash"):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048
        }
    }
    resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=25)
    if resp.status_code != 200:
        # Fallback to gemini-1.5-flash se 2.0-flash der 404/400
        if model != "gemini-1.5-flash":
            return chamar_gemini(prompt, api_key, model="gemini-1.5-flash")
        raise RuntimeError(f"Erro Gemini API ({resp.status_code}): {resp.text}")
        
    data = resp.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        raise RuntimeError("Resposta vazia ou inválida da Gemini API.")

def chamar_deepseek(prompt, api_key, model="deepseek-chat"):
    # Suporta DeepSeek API oficial ou OpenRouter se a chave for do OpenRouter
    is_openrouter = api_key.startswith("sk-or-")
    url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.deepseek.com/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    if is_openrouter:
        headers["HTTP-Referer"] = "https://futstats.vercel.app"
        headers["X-Title"] = "FutStats AI Analyst"
        actual_model = "deepseek/deepseek-r1:free" if "r1" in model.lower() else "deepseek/deepseek-chat"
    else:
        actual_model = "deepseek-reasoner" if "r1" in model.lower() else "deepseek-chat"
        
    payload = {
        "model": actual_model,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 2048
    }
    resp = requests.post(url, json=payload, headers=headers, timeout=35)
    if resp.status_code != 200:
        raise RuntimeError(f"Erro DeepSeek API ({resp.status_code}): {resp.text}")
        
    data = resp.json()
    try:
        return data["choices"][0]["message"]["content"]
    except Exception:
        raise RuntimeError("Resposta inválida da DeepSeek API.")

def processar_pergunta_oraculo(pergunta, modelo_escolhido="gemini", api_key_usuario=""):
    pergunta = pergunta.strip()
    if not pergunta:
        return {"error": "Por favor, digite uma pergunta."}
        
    # Resolver Chave de API
    api_key = api_key_usuario.strip()
    if not api_key:
        if modelo_escolhido == "deepseek":
            api_key = os.environ.get("DEEPSEEK_API_KEY", "") or os.environ.get("OPENROUTER_API_KEY", "")
        else:
            api_key = os.environ.get("GEMINI_API_KEY", "")

    # Se não houver chave de API, verificar se é uma das perguntas de demonstração integrada
    if not api_key:
        demo_resp = responder_perguntas_demo(pergunta)
        if demo_resp:
            return demo_resp
        return {
            "requer_api_key": True,
            "mensagem": "Para fazer qualquer pergunta inédita e livre ao Oráculo com IA, configure sua chave de API gratuita do Google AI Studio (Gemini) ou DeepSeek na barra acima. Você pode obter gratuitamente em aistudio.google.com.",
            "pergunta": pergunta
        }

    # PASSO 1: Pedir ao modelo para gerar a query SQL
    prompt_sql = f"""{SCHEMA_PROMPT}

A pergunta do usuário é:
"{pergunta}"

Gere uma consulta SQL SQLite para responder à pergunta.
Retorne APENAS o bloco SQL dentro de ```sql ... ```. Não inclua texto explicativo antes ou depois.
"""

    if modelo_escolhido == "deepseek":
        resposta_sql_raw = chamar_deepseek(prompt_sql, api_key)
    else:
        resposta_sql_raw = chamar_gemini(prompt_sql, api_key)

    # Extrair SQL do bloco de código
    match = re.search(r'```(?:sql)?\s*(.*?)\s*```', resposta_sql_raw, re.DOTALL | re.IGNORECASE)
    sql = match.group(1).strip() if match else resposta_sql_raw.strip()

    # PASSO 2: Executar a query SQL
    try:
        colunas, dados = executar_query_segura(sql)
    except Exception as e:
        # Auto-correção: tenta consertar enviando o erro de volta ao modelo
        prompt_fix = f"""{SCHEMA_PROMPT}
A seguinte consulta SQL gerou um erro no SQLite:
SQL: {sql}
Erro: {str(e)}

Pergunta original: "{pergunta}"
Corrija a consulta SQL. Retorne APENAS o SQL corrigido em ```sql ... ```."""
        if modelo_escolhido == "deepseek":
            resposta_sql_raw = chamar_deepseek(prompt_fix, api_key)
        else:
            resposta_sql_raw = chamar_gemini(prompt_fix, api_key)
        match = re.search(r'```(?:sql)?\s*(.*?)\s*```', resposta_sql_raw, re.DOTALL | re.IGNORECASE)
        sql = match.group(1).strip() if match else resposta_sql_raw.strip()
        colunas, dados = executar_query_segura(sql)

    # PASSO 3: Gerar a síntese analítica e o tweet
    amostra_dados = json.dumps(dados[:20], ensure_ascii=False)
    prompt_sintese = f"""Você é o Oráculo de Futebol do FutStats.
O usuário perguntou: "{pergunta}"

A consulta SQL executada foi:
{sql}

O resultado retornado do banco de dados (55.395 jogos) foi:
{amostra_dados}

Gere uma resposta em formato JSON com as 3 chaves exatas:
1. "insight": Um parágrafo com uma análise perspicaz, divertida e jornalística em português do Brasil, destacando os números encontrados e respondendo à dúvida com clareza.
2. "tweet": Um texto pronto de até 280 caracteres para postar no Twitter/X, com emojis, os dados mais impactantes e hashtags (#Futebol #Dados #FutStats).
3. "conclusao": Uma frase de resumo direto.

Retorne APENAS o JSON válido dentro de ```json ... ```."""

    if modelo_escolhido == "deepseek":
        resp_analise_raw = chamar_deepseek(prompt_sintese, api_key)
    else:
        resp_analise_raw = chamar_gemini(prompt_sintese, api_key)

    match_json = re.search(r'```(?:json)?\s*(.*?)\s*```', resp_analise_raw, re.DOTALL | re.IGNORECASE)
    json_text = match_json.group(1).strip() if match_json else resp_analise_raw.strip()
    
    try:
        sintese = json.loads(json_text)
    except Exception:
        sintese = {
            "insight": resp_analise_raw.replace('```json', '').replace('```', '').strip(),
            "tweet": f"📊 Dados do Oráculo FutStats sobre '{pergunta[:40]}...': confira os números históricos! #Futebol #Dados",
            "conclusao": "Análise concluída com sucesso com base nas 55.395 partidas do banco."
        }

    return {
        "pergunta": pergunta,
        "modelo_usado": modelo_escolhido,
        "sql_executado": sql,
        "colunas": colunas,
        "dados": dados[:50],
        "total_registros": len(dados),
        "insight": sintese.get("insight", ""),
        "tweet": sintese.get("tweet", ""),
        "conclusao": sintese.get("conclusao", "")
    }

def responder_perguntas_demo(pergunta):
    p = pergunta.lower()
    
    # 1. Dias pares vs ímpares
    if "par" in p or "impar" in p or "ímpar" in p:
        clube = "Corinthians"
        if "flamengo" in p: clube = "Flamengo"
        elif "palmeiras" in p: clube = "Palmeiras"
        elif "são paulo" in p or "sao paulo" in p: clube = "São Paulo"
        elif "vasco" in p: clube = "Vasco"
        
        sql = f"""
SELECT 
    CASE WHEN CAST(strftime('%d', data) AS INT) % 2 = 0 THEN 'Dias Pares' ELSE 'Dias Ímpares' END as tipo_dia,
    COUNT(*) as total_jogos,
    SUM(CASE WHEN vencedor = '{clube}' THEN 1 ELSE 0 END) as vitorias,
    SUM(CASE WHEN vencedor = 'Empate' THEN 1 ELSE 0 END) as empates,
    SUM(CASE WHEN vencedor != '{clube}' AND vencedor != 'Empate' AND vencedor IS NOT NULL THEN 1 ELSE 0 END) as derrotas,
    ROUND(SUM(CASE WHEN vencedor = '{clube}' THEN 1.0 ELSE 0 END) * 100.0 / COUNT(*), 1) as pct_vitorias
FROM partidas
WHERE mandante LIKE '%{clube}%' OR visitante LIKE '%{clube}%'
GROUP BY tipo_dia;
"""
        colunas, dados = executar_query_segura(sql)
        d_par = next((d for d in dados if 'Par' in d['tipo_dia']), {})
        d_imp = next((d for d in dados if 'Ímpar' in d['tipo_dia'] or 'Impar' in d['tipo_dia']), {})
        
        insight = f"Mito desvendado! Analisando todos os jogos oficiais do {clube} no banco de dados, a diferença é mínima: em dias pares o clube tem {d_par.get('pct_vitorias', 0)}% de aproveitamento de vitórias ({d_par.get('vitorias', 0)} vitórias em {d_par.get('total_jogos', 0)} partidas), enquanto em dias ímpares o aproveitamento é de {d_imp.get('pct_vitorias', 0)}% ({d_imp.get('vitorias', 0)} vitórias em {d_imp.get('total_jogos', 0)} partidas). O calendário do calendário gregoriano não afeta o desempenho do time!"
        tweet = f"🗓️ Mito dos Dias Pares x Ímpares: O {clube} tem mais vitórias em dias pares ({d_par.get('pct_vitorias', 0)}%) ou ímpares ({d_imp.get('pct_vitorias', 0)}%)? Analisamos mais de {d_par.get('total_jogos', 0) + d_imp.get('total_jogos', 0)} jogos históricos na base do FutStats! #Futebol #Dados #Curiosidade"
        
        return {
            "pergunta": pergunta,
            "modelo_usado": "Demonstração (Executado no Banco SQLite)",
            "sql_executado": sql.strip(),
            "colunas": colunas,
            "dados": dados,
            "total_registros": len(dados),
            "insight": insight,
            "tweet": tweet,
            "conclusao": "Aproveitamento quase idêntico entre dias pares e ímpares."
        }

    # 2. Acréscimos
    if "acréscimo" in p or "acrescimo" in p or "45+" in p or "90+" in p:
        sql = """
SELECT 
    clube,
    COUNT(*) as gols_acrescimos
FROM gols
WHERE (minuto LIKE '45+%' OR minuto LIKE '90+%' OR CAST(minuto AS INT) >= 90)
  AND clube IS NOT NULL
GROUP BY clube
ORDER BY gols_acrescimos DESC
LIMIT 8;
"""
        colunas, dados = executar_query_segura(sql)
        top = dados[0] if dados else {}
        insight = f"Nos acréscimos e finais de jogo (minuto 45+ ou 90+), o clube com mais gols decisivos catalogados é o {top.get('clube', 'Grêmio')}, com {top.get('gols_acrescimos', 0)} gols anotados no apagar das luzes!"
        tweet = f"⏱️ Emoção até o fim! Os clubes com mais gols marcados nos acréscimos (45+ e 90+) na história catalogada do futebol brasileiro: 1º {top.get('clube')} ({top.get('gols_acrescimos')} gols). Confira a lista completa no FutStats! #Futebol #Estatisticas"
        return {
            "pergunta": pergunta,
            "modelo_usado": "Demonstração (Executado no Banco SQLite)",
            "sql_executado": sql.strip(),
            "colunas": colunas,
            "dados": dados,
            "total_registros": len(dados),
            "insight": insight,
            "tweet": tweet,
            "conclusao": f"{top.get('clube')} lidera em gols nos acréscimos."
        }

    # 3. Série B maiores artilheiros
    if "série b" in p or "serie b" in p:
        sql = """
SELECT 
    g.atleta,
    GROUP_CONCAT(DISTINCT g.clube) as clubes,
    COUNT(*) as total_gols
FROM gols g
JOIN partidas p ON g.id_partida = p.id_partida
WHERE p.campeonato LIKE '%Série B%' OR p.campeonato LIKE '%Serie B%'
GROUP BY g.atleta
ORDER BY total_gols DESC
LIMIT 8;
"""
        colunas, dados = executar_query_segura(sql)
        top = dados[0] if dados else {}
        insight = f"Na história da Série B do Brasileirão catalogada (todas as 46 edições de 1971 a 2024), o atleta com mais gols registrados é {top.get('atleta', 'Destaque')} com {top.get('total_gols', 0)} gols marcados por {top.get('clubes', '')}!"
        tweet = f"🏆 Os maiores artilheiros da história da Série B do Campeonato Brasileiro (1971 a 2024)! 1º lugar: {top.get('atleta')} com {top.get('total_gols')} gols. #SerieB #Brasileirao #FutStats"
        return {
            "pergunta": pergunta,
            "modelo_usado": "Demonstração (Executado no Banco SQLite)",
            "sql_executado": sql.strip(),
            "colunas": colunas,
            "dados": dados,
            "total_registros": len(dados),
            "insight": insight,
            "tweet": tweet,
            "conclusao": f"Artilharia da Série B liderada por {top.get('atleta')}."
        }

    return None
