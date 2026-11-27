import sqlite3
import sys
import threading
import time
from pathlib import Path

import pytest
from werkzeug.serving import make_server

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from scripts.vm_auth_server import create_auth_app, hash_senha
from backend.app import app as main_app


@pytest.fixture
def auth_stack(tmp_path, monkeypatch):
    db_file = str(tmp_path / "test_auth.db")
    secret = "pytest-bridge-secret-123"
    auth_app = create_auth_app(db_path=db_file, shared_secret=secret, enable_telegram=False)

    # Seed admin test account
    with sqlite3.connect(db_file) as conn:
        conn.execute(
            """
            INSERT INTO users (username, nome, senha_hash, role, status, origem_cadastro, criado_em)
            VALUES (?, ?, ?, 'admin', 'ativo', 'teste', '2026-01-01 00:00:00')
            """,
            ("admin_teste", "Admin Teste", hash_senha("AdminPass123!")),
        )
        conn.commit()

    server = make_server("127.0.0.1", 0, auth_app)
    port = server.server_port
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()

    monkeypatch.setenv("FUTSTATS_AUTH_URL", f"http://127.0.0.1:{port}")
    monkeypatch.setenv("FUTSTATS_AUTH_SECRET", secret)

    main_app.config["TESTING"] = True
    client = main_app.test_client()
    try:
        yield client, db_file
    finally:
        server.shutdown()


def _login(client, username, password):
    return client.post(
        "/api/auth/login",
        json={"username": username, "password": password},
    )


def test_convite_24h_expiracao_aprovacao_manual_e_permissoes(auth_stack):
    client, db_file = auth_stack

    # 1. Admin faz login
    r_adm = _login(client, "admin_teste", "AdminPass123!")
    assert r_adm.status_code == 200
    adm_token = r_adm.get_json()["token"]
    adm_headers = {"Authorization": f"Bearer {adm_token}"}

    # 2. Admin gera link de 24h com escopo limitado de ferramentas
    r_inv = client.post(
        "/api/admin/equipe/convites",
        headers=adm_headers,
        json={
            "titulo": "Turma 24h",
            "duracao_horas": 24,
            "role_padrao": "leitor",
            "max_usos": 2,
            "ferramentas": ["overview", "times", "jogadores"],
        },
    )
    assert r_inv.status_code == 201
    inv_token = r_inv.get_json()["token"]

    # 3. Verificação pública do status do convite
    r_st = client.get(f"/api/auth/convite/status?token={inv_token}")
    assert r_st.status_code == 200
    assert r_st.get_json()["valido"] is True
    assert r_st.get_json()["restante_segundos"] > 80000

    # 4. Colega 1 se cadastra via link 24h -> aprovado imediatamente e recebe JWT
    r_reg1 = client.post(
        "/api/auth/registro",
        json={
            "nome": "Colega Um",
            "username": "colega1",
            "password": "SenhaForte1!",
            "codigo_convite": inv_token,
        },
    )
    assert r_reg1.status_code == 201
    d1 = r_reg1.get_json()
    assert "token" in d1
    assert d1["user"]["role"] == "leitor"
    assert d1["user"]["ferramentas_permitidas"] == ["overview", "times", "jogadores"]

    # 5. Não-admin NÃO pode acessar endpoints /api/admin/equipe
    c1_headers = {"Authorization": f"Bearer {d1['token']}"}
    r_rbac = client.get("/api/admin/equipe", headers=c1_headers)
    assert r_rbac.status_code == 403

    # 6. Simula expiração de >24h do convite no SQLite -> status cai e novo cadastro vira pendente
    with sqlite3.connect(db_file) as conn:
        conn.execute(
            "UPDATE invite_links SET expira_em = ? WHERE token = ?",
            (int(time.time()) - 10, inv_token),
        )
        conn.commit()

    r_st_exp = client.get(f"/api/auth/convite/status?token={inv_token}")
    assert r_st_exp.get_json()["valido"] is False
    assert r_st_exp.get_json()["motivo"] == "expirado"

    # 7. Colega 2 tenta cadastrar usando link expirado -> fica PENDENTE sem JWT
    r_reg2 = client.post(
        "/api/auth/registro",
        json={
            "nome": "Colega Dois",
            "username": "colega2",
            "password": "SenhaForte2!",
            "codigo_convite": inv_token,
        },
    )
    assert r_reg2.status_code == 202
    d2 = r_reg2.get_json()
    assert d2["pending"] is True
    assert "token" not in d2

    # 8. Login enquanto pendente deve falhar com 403
    r_login_pend = _login(client, "colega2", "SenhaForte2!")
    assert r_login_pend.status_code == 403

    # 9. Admin aprova colega2 e libera apenas 'overview' e 'h2h'
    r_aprov = client.patch(
        "/api/admin/equipe/usuarios/colega2",
        headers=adm_headers,
        json={"status": "ativo", "role": "moderador", "ferramentas": ["overview", "h2h"]},
    )
    assert r_aprov.status_code == 200
    assert r_aprov.get_json()["user"]["status"] == "ativo"

    # 10. Colega 2 agora consegue logar e vê suas ferramentas
    r_login_ok = _login(client, "colega2", "SenhaForte2!")
    assert r_login_ok.status_code == 200
    c2_token = r_login_ok.get_json()["token"]
    assert r_login_ok.get_json()["user"]["ferramentas_permitidas"] == ["overview", "h2h"]

    # 11. Política global bloqueia 'h2h' -> refletido ao vivo no /api/auth/me de colega2, mas admin mantém
    r_glob = client.put(
        "/api/admin/equipe/ferramentas-globais",
        headers=adm_headers,
        json={"ferramentas_bloqueadas_global": ["h2h"]},
    )
    assert r_glob.status_code == 200

    r_me_c2 = client.get("/api/auth/me", headers={"Authorization": f"Bearer {c2_token}"})
    assert r_me_c2.status_code == 200
    assert r_me_c2.get_json()["user"]["ferramentas_permitidas"] == ["overview"]

    r_me_adm = client.get("/api/auth/me", headers=adm_headers)
    assert "h2h" in r_me_adm.get_json()["user"]["ferramentas_permitidas"]

    # 12. Admin bloqueia colega2 -> /api/auth/me imediatamente nega com 403
    r_blk = client.patch(
        "/api/admin/equipe/usuarios/colega2",
        headers=adm_headers,
        json={"status": "bloqueado"},
    )
    assert r_blk.status_code == 200

    r_me_blocked = client.get("/api/auth/me", headers={"Authorization": f"Bearer {c2_token}"})
    assert r_me_blocked.status_code == 403
