import os
import sys

# Garante que a pasta raiz esteja no sys.path para imports locais
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.app import app
import backend.auth
import backend.ia_analista

# Exporta app para o runtime serverless do Vercel
if __name__ == '__main__':
    app.run(debug=True)

