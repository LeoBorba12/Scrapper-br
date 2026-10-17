import sys, os
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
sys.path.insert(0, os.path.abspath('.'))
from backend.app import app

client = app.test_client()

# 1. Test index
r = client.get('/')
assert r.status_code == 200
print("Index HTML served 200 OK")

# 2. Test Oráculo: Dias Pares
r = client.post('/api/ia/perguntar', json={
    'pergunta': 'Qual o aproveitamento do Corinthians em dias pares vs dias ímpares?',
    'modelo': 'gemini'
})
assert r.status_code == 200
data = r.get_json()
print("Oráculo dias pares 200 OK:")
print("  Insight:", data['insight'][:70], '...')
print("  Total registros:", data['total_registros'])
print("  Tweet sugerido:", data['tweet'][:70], '...')

# 3. Test Oráculo: Acréscimos
r2 = client.post('/api/ia/perguntar', json={
    'pergunta': 'Quem mais fez gols nos acréscimos 45+?',
    'modelo': 'deepseek'
})
assert r2.status_code == 200
data2 = r2.get_json()
print("\nOráculo acréscimos 200 OK:")
print("  Insight:", data2['insight'][:70], '...')
print("  Total registros:", data2['total_registros'])

print("\nTODOS OS TESTES DO ORÁCULO E IA ANALISTA FORAM APROVADOS!")
