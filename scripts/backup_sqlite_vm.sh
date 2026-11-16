#!/usr/bin/env bash
set -euo pipefail

SOURCE_DB="/home/opc/Guia-profissional/data/futebol.db"
BACKUP_DIR="/opt/futstats/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")
TEMP_BACKUP="${BACKUP_DIR}/futebol_temp_${TIMESTAMP}.db"
FINAL_BACKUP="${BACKUP_DIR}/futebol_${TIMESTAMP}.db.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando backup transacional online..."

sqlite3 "${SOURCE_DB}" ".backup '${TEMP_BACKUP}'"

INTEGRITY=$(sqlite3 "${TEMP_BACKUP}" "PRAGMA integrity_check;")
if [ "${INTEGRITY}" != "ok" ]; then
    echo "[ERRO] Integridade falhou no backup: ${INTEGRITY}. Abortando!"
    rm -f "${TEMP_BACKUP}"
    exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Integridade verificada com sucesso (PRAGMA integrity_check: ok)."

gzip -c "${TEMP_BACKUP}" > "${FINAL_BACKUP}"
rm -f "${TEMP_BACKUP}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup concluido: ${FINAL_BACKUP} ($(du -h "${FINAL_BACKUP}" | cut -f1))"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Aplicando politica de retencao de 7 dias..."
find "${BACKUP_DIR}" -name "futebol_*.db.gz" -type f -mtime +7 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Rotina finalizada com sucesso."
