#!/bin/sh
# Sinkronkan password Postgres dengan POSTGRES_PASSWORD di secrets.env
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SECRETS_FILE="$ROOT/secrets.env"
ENV_FILE="$ROOT/.env"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT/docker-compose.yml}"

read_password() {
  for f in "$SECRETS_FILE" "$ENV_FILE"; do
    if [ -f "$f" ]; then
      line=$(grep -E '^POSTGRES_PASSWORD=' "$f" | tail -n1 || true)
      if [ -n "$line" ]; then
        val=${line#POSTGRES_PASSWORD=}
        val=$(printf '%s' "$val" | sed -e 's/\$\$/\$/g' -e "s/^['\"]//" -e "s/['\"]$//")
        printf '%s' "$val"
        return 0
      fi
    fi
  done
  return 1
}

PASS=$(read_password) || {
  echo "POSTGRES_PASSWORD tidak ditemukan di secrets.env atau .env"
  exit 1
}

if [ -z "$PASS" ]; then
  echo "POSTGRES_PASSWORD kosong"
  exit 1
fi

ESCAPED=$(printf '%s' "$PASS" | sed "s/'/''/g")

echo "Mengubah password user kasku di Postgres..."
docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -U kasku -d postgres -v ON_ERROR_STOP=1 \
  -c "ALTER USER kasku WITH PASSWORD '${ESCAPED}';"

echo "Restart api..."
docker compose -f "$COMPOSE_FILE" restart api
echo "Selesai."
