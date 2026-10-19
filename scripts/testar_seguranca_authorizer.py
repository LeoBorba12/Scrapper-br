import sys
sys.path.insert(0, '.')
from backend.ia_analista import executar_query_segura

print("1. Testando tentativa de acesso à tabela de credenciais 'usuarios'...")
try:
    executar_query_segura("SELECT * FROM usuarios")
    print("ERRO CRÍTICO: Consulta permitida!")
except PermissionError as e:
    print("SUCESSO: Bloqueado pelo Sandboxing Zero-Trust ->", e)

print("\n2. Testando tentativa de acesso à metadados internos sqlite_master...")
try:
    executar_query_segura("SELECT name FROM sqlite_master WHERE type='table'")
    print("ERRO CRÍTICO: Consulta a metadados permitida!")
except PermissionError as e:
    print("SUCESSO: Bloqueado pelo Sandboxing Zero-Trust ->", e)

print("\n3. Testando consulta legítima aos dados analíticos do Brasileirão Série A...")
cols, dados = executar_query_segura("SELECT COUNT(*) as total FROM partidas WHERE campeonato = 'Campeonato Brasileiro Série A'")
print("SUCESSO: Consulta legítima retornou ->", cols, dados)
