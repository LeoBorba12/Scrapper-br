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
    boot_error = {
        "error": "Falha no boot da aplicação serverless",
        "tipo": type(e).__name__,
        "mensagem": str(e),
        "traceback": traceback.format_exc(),
        "cwd": os.getcwd(),
        "sys_path": sys.path,
        "root_contents": os.listdir(ROOT_DIR) if os.path.exists(ROOT_DIR) else None,
        "cwd_contents": os.listdir('.') if os.path.exists('.') else None,
        "data_exists": os.path.exists(os.path.join(ROOT_DIR, 'data')),
        "db_exists": os.path.exists(os.path.join(ROOT_DIR, 'data', 'futebol.db')),
        "backend_exists": os.path.exists(os.path.join(ROOT_DIR, 'backend'))
    }

    @app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    @app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
    def vercel_boot_diagnostic(path):
        return jsonify(boot_error), 500

if __name__ == '__main__':
    app.run(debug=True)

