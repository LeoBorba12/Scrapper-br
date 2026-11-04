import sqlite3
import os
import datetime

db_path = 'data/futebol.db'

def expurgar_telemetria_expirada(dias_retencao=90):
    """
    Remove eventos de telemetria brutos com mais de 90 dias,
    garantindo que o banco de dados permaneça estritamente sob o teto de 84 MB.
    """
    if not os.path.exists(db_path):
        print(f"Banco {db_path} não localizado.")
        return 0

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Verifica se a tabela telemetria_eventos existe
    c.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='telemetria_eventos'")
    if c.fetchone()[0] == 0:
        conn.close()
        return 0

    c.execute("SELECT count(*) FROM telemetria_eventos")
    total_antes = c.fetchone()[0]

    # Data limite de corte (90 dias atrás)
    data_limite = (datetime.datetime.now() - datetime.timedelta(days=dias_retencao)).strftime('%Y-%m-%d %H:%M:%S')

    c.execute("DELETE FROM telemetria_eventos WHERE datetime(ocorrido_em) < datetime(?)", (data_limite,))
    removidos = c.rowcount
    conn.commit()

    c.execute("PRAGMA journal_mode = DELETE;")
    conn.commit()
    conn.close()

    size_mb = os.path.getsize(db_path) / (1024 * 1024)
    print(f"Limpeza de telemetria: {removidos} eventos brutos anteriores a {data_limite} removidos.")
    print(f"Eventos remanescentes: {total_antes - removidos}")
    print(f"Tamanho de {db_path}: {size_mb:.2f} MB")
    return removidos

if __name__ == '__main__':
    expurgar_telemetria_expirada(90)
