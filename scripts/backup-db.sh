#!/bin/bash
# =============================================================================
# Cole Platform — PostgreSQL Backup Script
# =============================================================================
# Usage: ./scripts/backup-db.sh [daily|weekly|monthly]
# Schedule via cron: 0 2 * * * /path/to/backup-db.sh daily
# =============================================================================

set -euo pipefail

BACKUP_TYPE="${1:-daily}"
BACKUP_DIR="/backups/postgres"
RETENTION_DAYS_DAILY=7
RETENTION_DAYS_WEEKLY=30
RETENTION_DAYS_MONTHLY=365

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"

# Environment variables (with defaults)
PGHOST="${POSTGRES_HOST:-localhost}"
PGPORT="${POSTGRES_PORT:-5432}"
PGDATABASE="${POSTGRES_DB:-cole_platform}"
PGUSER="${POSTGRES_USER:-cole_admin}"
export PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting ${BACKUP_TYPE} backup of ${PGDATABASE}..."

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Export plain SQL before gzip compression. The custom pg_dump format is already
# compressed and must not be piped through gzip or combined with stderr.
pg_dump \
  -h "${PGHOST}" \
  -p "${PGPORT}" \
  -U "${PGUSER}" \
  -d "${PGDATABASE}" \
  --format=plain \
  --no-owner \
  --no-privileges \
  | gzip -9 > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Retention cleanup
cleanup_old_backups() {
  local retention_days=$1
  local type=$2
  find "${BACKUP_DIR}" -name "${type}_*.sql.gz" -mtime +${retention_days} -delete 2>/dev/null || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Cleaned up ${type} backups older than ${retention_days} days"
}

case "${BACKUP_TYPE}" in
  daily)
    cleanup_old_backups "${RETENTION_DAYS_DAILY}" "daily"
    ;;
  weekly)
    cleanup_old_backups "${RETENTION_DAYS_WEEKLY}" "weekly"
    ;;
  monthly)
    cleanup_old_backups "${RETENTION_DAYS_MONTHLY}" "monthly"
    ;;
esac

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup process complete."
