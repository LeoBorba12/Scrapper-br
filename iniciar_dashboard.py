import os
import sys
import webbrowser
import threading
import time

# Adiciona o diretório atual ao sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import app

def abrir_navegador(url):
    time.sleep(1.2)
    print(f"\n🚀 Abrindo a dashboard no navegador: {url}")
    webbrowser.open(url)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    url = f"http://localhost:{port}"

    print("=" * 70)
    print("FUTSTATS & CLIMA | DASHBOARD INTERATIVA PARA MODERAÇÃO DO TWITTER")
    print("=" * 70)
    print(f"Servidor iniciado com sucesso!")
    print(f"Acesse pelo navegador em: {url}")
    print("Pressione Ctrl+C para encerrar o servidor a qualquer momento.")
    print("=" * 70)

    # Inicia a thread para abrir o navegador automaticamente
    threading.Thread(target=abrir_navegador, args=(url,), daemon=True).start()

    # Inicia a aplicação Flask
    app.run(host='0.0.0.0', port=port, debug=False)
