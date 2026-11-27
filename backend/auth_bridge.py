"""
Ponte segura entre o backend Flask (Vercel) e o serviço persistente de autenticação na VM Oracle.
"""

import hashlib
import os
import requests

ALL_TOOL_IDS = [
    "overview",
    "oraculo-preditivo",
    "probabilidades",
    "metricas-avancadas",
    "campeonato",
    "times",
    "jogadores",
    "h2h",
    "tecnicos",
    "playground",
    "arbitros",
    "tweets",
    "oraculo",
    "clima",
    "aovivo",
]


def get_auth_service_url():
    return os.environ.get(
        "FUTSTATS_AUTH_URL", "https://futstats-auth.129.148.21.244.sslip.io"
    ).rstrip("/")


def get_auth_bridge_secret(secret_key):
    explicit = os.environ.get("FUTSTATS_AUTH_SECRET", "").strip()
    if explicit:
        return explicit
    return hashlib.sha256(f"{secret_key}:vm-auth-bridge".encode()).hexdigest()


def vm_auth_request(method, path, secret_key, json_body=None, params=None, timeout=6.0):
    """
    Executa requisição autenticada via X-Auth-Secret para o serviço da VM.
    Retorna (status_code, dict_json) ou (None, None) em caso de falha de rede.
    """
    base_url = get_auth_service_url()
    if not base_url:
        return None, None
    url = f"{base_url}{path}"
    headers = {"X-Auth-Secret": get_auth_bridge_secret(secret_key)}
    try:
        resp = requests.request(
            method=method.upper(),
            url=url,
            headers=headers,
            json=json_body,
            params=params,
            timeout=timeout,
        )
        try:
            data = resp.json()
        except Exception:
            data = {"error": f"Resposta inválida do servidor de autenticação ({resp.status_code})."}
        return resp.status_code, data
    except Exception:
        return None, None
