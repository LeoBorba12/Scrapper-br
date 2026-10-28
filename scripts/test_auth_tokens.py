import hmac
import hashlib
import base64
import json
import time
from werkzeug.security import generate_password_hash, check_password_hash

SECRET_KEY = "futstats-secret-key-super-segura-2026"
INVITE_CODE = "FUTSTATS-2026"

def gerar_token(payload):
    header = {"alg": "HS256", "typ": "JWT"}
    payload_copy = payload.copy()
    payload_copy["exp"] = int(time.time()) + (30 * 86400) # 30 dias
    
    h_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip('=')
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload_copy).encode()).decode().rstrip('=')
    
    signature = hmac.new(SECRET_KEY.encode(), f"{h_b64}.{p_b64}".encode(), hashlib.sha256).digest()
    s_b64 = base64.urlsafe_b64encode(signature).decode().rstrip('=')
    
    return f"{h_b64}.{p_b64}.{s_b64}"

def validar_token(token):
    try:
        parts = token.split('.')
        if len(parts) != 3: return None
        h_b64, p_b64, s_b64 = parts
        
        # Recriar assinatura
        expected_sig = hmac.new(SECRET_KEY.encode(), f"{h_b64}.{p_b64}".encode(), hashlib.sha256).digest()
        calc_s_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip('=')
        
        if not hmac.compare_digest(s_b64, calc_s_b64):
            return None
            
        # Decodificar payload
        rem = len(p_b64) % 4
        if rem > 0: p_b64 += '=' * (4 - rem)
        payload = json.loads(base64.urlsafe_b64decode(p_b64).decode())
        
        if payload.get("exp", 0) < int(time.time()):
            return None # Expirado
            
        return payload
    except Exception as e:
        return None

# Teste LB Admin
lb_hash = generate_password_hash("46475595")
print("LB Hash gerado:", lb_hash)
assert check_password_hash(lb_hash, "46475595") == True
assert check_password_hash(lb_hash, "senha_errada") == False

token = gerar_token({"sub": "LB", "nome": "Leonardo (LB)", "role": "admin"})
print("Token gerado:", token[:40], "...")

val = validar_token(token)
print("Token validado:", val)
assert val["sub"] == "LB"
assert val["role"] == "admin"

print("\nSISTEMA DE AUTENTICAÇÃO CRIPTOGRÁFICA TESTADO COM SUCESSO!")
