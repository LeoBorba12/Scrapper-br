import sys, os
sys.path.insert(0, os.path.abspath('.'))
from backend.app import app

client = app.test_client()

# Test index
res = client.get('/')
assert res.status_code == 200
assert 'FutStats' in res.data.decode('utf-8')
print("Index route successfully served dist/index.html")

# Test player endpoints
res_dest = client.get('/api/jogadores/destaques')
assert res_dest.status_code == 200
print("Destaques endpoint 200 OK")

res_search = client.get('/api/jogadores/busca?q=Dinamite')
assert res_search.status_code == 200
print("Busca endpoint 200 OK")

res_perfil = client.get('/api/jogadores/perfil?nome=Roberto%20Dinamite')
assert res_perfil.status_code == 200
print("Perfil endpoint 200 OK")

print("TODOS OS TESTES DE INTEGRAÇÃO PASSARAM!")
