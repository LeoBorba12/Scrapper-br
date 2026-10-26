import sqlite3

conn = sqlite3.connect('data/futebol.db')
c = conn.cursor()

# 1. Corrigir gols com clube invertido onde o time atribuido fez 0 gols
print("--- [1] Auto-heal de gols com clube invertido onde o placar era 0 ---")
c.execute("""
    UPDATE gols
    SET clube = (SELECT p.visitante FROM partidas p WHERE p.id_partida = gols.id_partida)
    WHERE id_gol IN (
        SELECT g.id_gol
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.clube = p.mandante 
          AND p.gols_mandante = 0 
          AND p.gols_visitante > 0
          AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
    );
""")
afetados_mandante_zero = c.rowcount
print(f"Gols corrigidos de mandante 0 -> visitante: {afetados_mandante_zero}")

c.execute("""
    UPDATE gols
    SET clube = (SELECT p.mandante FROM partidas p WHERE p.id_partida = gols.id_partida)
    WHERE id_gol IN (
        SELECT g.id_gol
        FROM gols g
        JOIN partidas p ON g.id_partida = p.id_partida
        WHERE g.clube = p.visitante 
          AND p.gols_visitante = 0 
          AND p.gols_mandante > 0
          AND (g.tipo_de_gol IS NULL OR lower(g.tipo_de_gol) NOT LIKE '%contra%')
    );
""")
afetados_visitante_zero = c.rowcount
print(f"Gols corrigidos de visitante 0 -> mandante: {afetados_visitante_zero}")

# 2. Corrigir jogo especifico Palmeiras 2 x 1 Fluminense (20155156)
c.execute("""
    UPDATE gols SET clube = 'Fluminense' WHERE id_partida = 20155156 AND atleta = 'Fred';
""")
c.execute("""
    UPDATE gols SET clube = 'Palmeiras' WHERE id_partida = 20155156 AND atleta = 'Lucas Barrios';
""")

conn.commit()
conn.close()
print("Auto-heal concluido com sucesso!")
