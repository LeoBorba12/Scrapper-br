import os
import sys
import traceback

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.app import app
except Exception:
    from flask import Flask, jsonify
    app = Flask(__name__)
    tb = traceback.format_exc()
    
    @app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    @app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    def err_route(path):
        return jsonify({
            "error": "Falha na inicialização da aplicação",
            "detalhes": tb
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
