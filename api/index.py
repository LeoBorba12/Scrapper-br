import os
import sys
import traceback
from flask import Flask, jsonify

# app definido no nível superior para análise estática de AST do @vercel/python
app = Flask(__name__)

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.app import app as backend_app
    app = backend_app
except Exception as e:
    # Telemetria interna gravada estritamente no stderr do runtime (Vercel Function logs)
    sys.stderr.write(f"[BOOT_ERROR] Falha no boot da aplicação: {type(e).__name__}: {e}\n")
    sys.stderr.write(traceback.format_exc())

    # Resposta pública limpa e segura (sem expor tracebacks, variáveis de ambiente ou caminhos internos)
    @app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    @app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    def vercel_boot_diagnostic(path):
        return jsonify({
            "error": "Serviço temporariamente indisponível",
            "status": 500,
            "mensagem": "Falha na inicialização do serviço. Tente novamente em instantes."
        }), 500

if __name__ == '__main__':
    app.run(debug=True)

