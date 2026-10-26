import sys, os
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
sys.path.insert(0, os.path.abspath('.'))
from backend.app import app
from backend.auth import gerar_token

client = app.test_client()

# Generate valid test token
token = gerar_token({"id": 1, "username": "admin", "role": "admin"})
headers = {"Authorization": f"Bearer {token}"}

# 1. Test index
r = client.get('/')
assert r.status_code == 200
print("Index HTML served 200 OK")

# 2. Test Oráculo: Dias Pares (autenticado)
r = client.post('/api/ia/perguntar', json={
    'pergunta': 'Qual o aproveitamento do Corinthians em dias pares vs dias ímpares?',
    'modelo': 'gemini'
}, headers=headers)
assert r.status_code == 200
data = r.get_json()
print("Oráculo dias pares 200 OK:")
print("  Insight:", data['insight'][:70], '...')
print("  Total registros:", data['total_registros'])
print("  Tweet sugerido:", data['tweet'][:70], '...')

# 3. Test Oráculo: Acréscimos (autenticado)
r2 = client.post('/api/ia/perguntar', json={
    'pergunta': 'Quem mais fez gols nos acréscimos 45+?',
    'modelo': 'deepseek'
}, headers=headers)
assert r2.status_code == 200
data2 = r2.get_json()
print("\nOráculo acréscimos 200 OK:")
print("  Insight:", data2['insight'][:70], '...')
print("  Total registros:", data2['total_registros'])

# 4. Test runaway-guard: Pergunta excedendo 500 caracteres deve ser rejeitada com 400
pergunta_gigante = "Flamengo " * 100
r3 = client.post('/api/ia/perguntar', json={
    'pergunta': pergunta_gigante,
    'modelo': 'gemini'
}, headers=headers)
assert r3.status_code == 400
assert "500 caracteres" in r3.get_json().get("error", "")
print("\nRunaway-guard test 400 OK: Pergunta > 500 caracteres bloqueada com sucesso!")

print("\nTODOS OS TESTES DO ORÁCULO E IA ANALISTA FORAM APROVADOS!")
