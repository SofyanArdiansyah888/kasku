#!/bin/sh
# Sinkronkan password Postgres dengan secrets/db_password.txt
# (wajib dijalankan jika volume DB sudah pernah dibuat sebelumnya)
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS_FILE="$ROOT/secrets/db_password.txt"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"

if [ ! -f "$PASS_FILE" ]; then
  echo "File tidak ditemukan: secrets/db_password.txt"
  echo "Buat dengan: mkdir -p secrets && echo -n 'password-anda' > secrets/db_password.txt"
  exit 1
fi

PASS=$(tr -d '\n\r' < "$PASS_FILE")
ESCAPED=$(printf '%s' "$PASS" | sed "s/'/''/g")

echo "Mengubah password user kasku di Postgres..."
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -U kasku -d postgres -v ON_ERROR_STOP=1 \
  -c "ALTER USER kasku WITH PASSWORD '${ESCAPED}';"

echo "Restart api..."
docker compose -f "$COMPOSE_FILE" restart api
echo "Selesai."
