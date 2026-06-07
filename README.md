# 1. Pastikan network Traefik ada
docker network create traefik

# 2. Siapkan env
cp env.prod.example .env
# Edit: DB_PASSWORD, JWT_SECRET

# 3. Build & jalankan
docker compose -f docker-compose.prod.yml up -d --build