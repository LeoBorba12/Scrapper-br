import sys, os
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass
sys.path.insert(0, os.path.abspath('.'))
from backend.app import app

client = app.test_client()

# 1. Test Login Admin LB
res = client.post('/api/auth/login', json={'username': 'LB', 'password': '46475595'})
assert res.status_code == 200, f"Error {res.status_code}: {res.data}"
data = res.get_json()
token_lb = data['token']
print("1. Login Admin LB:", data['user']['nome'], "| Token válido:", bool(token_lb))

# 2. Test Me com token do LB
res_me = client.get('/api/auth/me', headers={'Authorization': f'Bearer {token_lb}'})
assert res_me.status_code == 200
print("2. /api/auth/me validado:", res_me.get_json()['user'])

# 3. Test Pegar Código de Convite como Admin
res_conv = client.get('/api/auth/convite-codigo', headers={'Authorization': f'Bearer {token_lb}'})
assert res_conv.status_code == 200
codigo = res_conv.get_json()['codigo_convite']
print("3. Código de convite obtido pelo Admin:", codigo)

# 4. Test Cadastro de novo moderador com o convite
import time
unique_user = f"mod_{int(time.time())}"
res_reg = client.post('/api/auth/registro', json={
    'nome': 'Moderador Convidado',
    'username': unique_user,
    'password': 'senha_moderador',
    'codigo_convite': codigo
})
assert res_reg.status_code == 200, f"Error {res_reg.status_code}: {res_reg.data}"
mod_data = res_reg.get_json()
print("4. Cadastro de Moderador com Convite:", mod_data['user'])

# 5. Test Cadastro com código errado (deve falhar 400)
res_fail = client.post('/api/auth/registro', json={
    'nome': 'Hacker',
    'username': 'hacker',
    'password': '123',
    'codigo_convite': 'ERRADO-123'
})
assert res_fail.status_code == 400
print("5. Cadastro com código inválido bloqueado com sucesso (400):", res_fail.get_json()['error'])

print("\nTODOS OS TESTES DE AUTENTICAÇÃO E CONVITE PASSARAM COM SUCESSO!")
