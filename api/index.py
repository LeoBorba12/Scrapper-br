import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.app import app
except Exception as e:
    import traceback
    from flask import Flask, jsonify
    app = Flask(__name__)
    tb = traceback.format_exc()

    @app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    @app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    def vercel_boot_error_fallback(path):
        return jsonify({
            "error": "Falha na inicialização da aplicação serverless",
            "tipo_excecao": type(e).__name__,
            "mensagem": str(e),
            "traceback": tb
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
