#!/usr/bin/env python3
"""
FutStats — Teste Automatizado de Restauração do Cold Archive:
Valida a integridade, o checksum SHA-256 e a capacidade de restauração completa
dos dados frios arquivados em data/futebol_cold.db.gz
"""

import gzip
import hashlib
import json
import sqlite3
import tempfile
from pathlib import Path

COLD_GZ_PATH = Path("data/futebol_cold.db.gz")
MANIFEST_PATH = Path("data/cold_manifest.json")

def testar_restauracao():
    print("[1/4] Verificando existência dos arquivos de cold storage...")
    if not COLD_GZ_PATH.exists():
        raise FileNotFoundError(f"Arquivo {COLD_GZ_PATH} não encontrado!")
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"Manifesto {MANIFEST_PATH} não encontrado!")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    # 2. Validar Checksum SHA-256
    print("[2/4] Validando integridade criptográfica SHA-256...")
    with open(COLD_GZ_PATH, "rb") as f:
        sha256_calculado = hashlib.sha256(f.read()).hexdigest()

    print(f"-> SHA-256 Manifesto:  {manifest['sha256']}")
    print(f"-> SHA-256 Calculado:  {sha256_calculado}")
    assert sha256_calculado == manifest["sha256"], "FALHA: Checksum SHA-256 do cold archive diverge do manifesto!"
    print("-> Checksum íntegro e verificado!")

    # 3. Teste de Descompressão e Restauração em Sandbox
    print("[3/4] Descomprimindo para sandbox temporário em memória...")
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        tmp_path = Path(tmp_file.name)
        with gzip.open(COLD_GZ_PATH, "rb") as gz_in:
            tmp_file.write(gz_in.read())

    try:
        conn = sqlite3.connect(tmp_path)
        cur = conn.cursor()

        # Checar PRAGMA integrity_check
        cur.execute("PRAGMA integrity_check;")
        status = cur.fetchone()[0]
        assert status == "ok", f"FALHA: Integridade corrompida: {status}"
        print("-> PRAGMA integrity_check: OK")

        # 4. Validar contagens de tabelas contra o manifesto
        print("[4/4] Validando contagem de registros restaurados...")
        for tabela_nome, contagem_esperada in manifest["tabelas"].items():
            cur.execute(f"SELECT count(*) FROM {tabela_nome};")
            real = cur.fetchone()[0]
            print(f"-> {tabela_nome}: {real} registros (Esperado: {contagem_esperada})")
            assert real == contagem_esperada, f"FALHA: Divergência na tabela {tabela_nome}: {real} != {contagem_esperada}"

        conn.close()
        print("\nSUCESSO: Restauração do cold archive testada e 100% aprovada!")
    finally:
        if tmp_path.exists():
            tmp_path.unlink()

if __name__ == "__main__":
    testar_restauracao()
