import os
import sys
import traceback

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.app import app

    class VercelPathMiddleware:
        def __init__(self, wsgi_app):
            self.wsgi_app = wsgi_app

        def __call__(self, environ, start_response):
            # Vercel passes the original requested path in HTTP_X_MATCHED_PATH
            matched = environ.get('HTTP_X_MATCHED_PATH')
            if matched and matched.startswith('/api'):
                environ['PATH_INFO'] = matched.split('?')[0]
            return self.wsgi_app(environ, start_response)

    app.wsgi_app = VercelPathMiddleware(app.wsgi_app)

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
