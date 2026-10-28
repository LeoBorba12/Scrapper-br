import sys, os
sys.path.insert(0, os.path.abspath('.'))
from backend.app import app
import json

client = app.test_client()

# 1. Destaques
res = client.get('/api/jogadores/destaques')
assert res.status_code == 200, f"Error {res.status_code}"
d = json.loads(res.data)
print("Destaques artilheiros:", [a['nome'] for a in d['artilheiros'][:5]])
print("Destaques amarelos:", [a['nome'] for a in d['amarelos'][:5]])

# 2. Busca
res = client.get('/api/jogadores/busca?q=Zico')
assert res.status_code == 200
b = json.loads(res.data)
print("Busca Zico:", b[0] if b else "Nenhum")

# 3. Perfil Zico
res = client.get('/api/jogadores/perfil?nome=Zico')
assert res.status_code == 200
p = json.loads(res.data)
print("Perfil Zico resumo:", p['resumo'])
print("Top vítimas Zico:", p['top_vitimas'])
print("Total partidas retornadas:", len(p['partidas']))

# 4. Perfil Thiago Heleno
res = client.get('/api/jogadores/perfil?nome=Thiago%20Heleno')
assert res.status_code == 200
p_th = json.loads(res.data)
print("Perfil Thiago Heleno resumo:", p_th['resumo'])

print("\nTODOS OS TESTES DE API PASSARAM COM SUCESSO!")
