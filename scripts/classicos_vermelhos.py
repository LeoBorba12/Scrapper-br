import sqlite3
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

classicos = [
    ('Fla-Flu (RJ)', 'Flamengo', 'Fluminense'),
    ('Clássico Mineiro (MG)', 'Atlético-MG', 'Cruzeiro'),
    ('Atletiba (PR)', 'Athletico-PR', 'Coritiba'),
    ('Gre-Nal (RS)', 'Grêmio', 'Internacional'),
    ('Clássico dos Milhões (RJ)', 'Flamengo', 'Vasco'),
    ('Clássico Alvinegro (SP)', 'Corinthians', 'Santos'),
    ('Clássico da Rivalidade (RJ)', 'Botafogo', 'Flamengo'),
    ('Derby Paulista (SP)', 'Corinthians', 'Palmeiras'),
    ('Majestoso (SP)', 'Corinthians', 'São Paulo'),
    ('Choque-Rei (SP)', 'Palmeiras', 'São Paulo'),
    ('San-São (SP)', 'Santos', 'São Paulo'),
    ('Clássico dos Gigantes (RJ)', 'Fluminense', 'Vasco'),
    ('Clássico Vovô (RJ)', 'Botafogo', 'Fluminense'),
    ('Clássico da Amizade (RJ)', 'Botafogo', 'Vasco'),
    ('Clássico da Saudade (SP)', 'Palmeiras', 'Santos'),
    ('Ba-Vi (BA)', 'Bahia', 'Vitória'),
    ('Clássico-Rei (CE)', 'Ceará', 'Fortaleza'),
    ('Clássico das Multidões (PE)', 'Santa Cruz', 'Sport'),
    ('Clássico dos Clássicos (PE)', 'Náutico', 'Sport'),
    ('Clássico Florianópolis (SC)', 'Avaí', 'Figueirense'),
]

resultado = []

for nome_classico, t1, t2 in classicos:
    c.execute('''
        WITH jogos_confronto AS (
            SELECT p.id_partida, p.ano, p.mandante, p.visitante
            FROM partidas p
            WHERE ((p.mandante = ? AND p.visitante = ?) OR (p.mandante = ? AND p.visitante = ?))
              AND p.id_partida IN (SELECT DISTINCT id_partida FROM cartoes)
        ),
        vermelhos AS (
            SELECT c.id_partida, COUNT(*) as qtd
            FROM cartoes c
            WHERE c.cartao LIKE '%Vermelho%'
            GROUP BY c.id_partida
        ),
        amarelos AS (
            SELECT c.id_partida, COUNT(*) as qtd
            FROM cartoes c
            WHERE c.cartao LIKE '%Amarelo%'
            GROUP BY c.id_partida
        )
        SELECT 
            COUNT(j.id_partida) as jogos,
            COALESCE(SUM(v.qtd), 0) as total_vermelhos,
            COALESCE(SUM(a.qtd), 0) as total_amarelos
        FROM jogos_confronto j
        LEFT JOIN vermelhos v ON j.id_partida = v.id_partida
        LEFT JOIN amarelos a ON j.id_partida = a.id_partida;
    ''', (t1, t2, t2, t1))
    row = c.fetchone()
    jogos = row[0]
    vermelhos = row[1]
    amarelos = row[2]
    if jogos > 0:
        media_v = round(vermelhos / jogos, 3)
        media_a = round(amarelos / jogos, 2)
        resultado.append({
            'classico': nome_classico,
            'times': f'{t1} x {t2}',
            'jogos': jogos,
            'vermelhos': vermelhos,
            'media_vermelhos': media_v,
            'amarelos': amarelos,
            'media_amarelos': media_a
        })

resultado.sort(key=lambda x: x['media_vermelhos'], reverse=True)

print("RANKING DOS CLÁSSICOS POR MÉDIA DE EXPULSÕES (CARTÕES VERMELHOS):")
print("-" * 105)
print(f"{'Pos':<4} | {'Clássico':<28} | {'Confronto':<24} | {'Jogos':<6} | {'Vermelhos':<10} | {'Média Verm.':<12} | {'Média Amar.'}")
print("-" * 105)

for idx, r in enumerate(resultado, 1):
    print(f"{idx:<4} | {r['classico']:<28} | {r['times']:<24} | {r['jogos']:<6} | {r['vermelhos']:<10} | {r['media_vermelhos']:<12.2f} | {r['media_amarelos']:.2f}")

# Investigação adicional: partidas mais violentas (com mais vermelhos num único jogo)
print("\n" + "=" * 105)
print("MAIORES RECORDES DE EXPULSÕES EM UMA ÚNICA PARTIDA ENTRE RIVAIS:")
print("=" * 105)
c.execute('''
    SELECT 
        p.data, p.campeonato, p.mandante, p.visitante, p.placar, p.arbitro,
        COUNT(c.id_cartao) as vermelhos
    FROM partidas p
    JOIN cartoes c ON p.id_partida = c.id_partida
    WHERE c.cartao LIKE '%Vermelho%'
    GROUP BY p.id_partida
    HAVING vermelhos >= 3
    ORDER BY vermelhos DESC, p.data DESC
    LIMIT 10;
''')
for r in c.fetchall():
    print(f"{r[0]} | {r[1]} | {r[2]} {r[4]} {r[3]} | Expulsões: {r[6]} | Árbitro: {r[5]}")
