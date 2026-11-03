# Mock Azure PaaS Monorepo

Three independently deployable services — no Docker Compose, modeled as separate
Azure App Services (or Container Apps) each with its own container image and,
for the backends, its own Azure Database for PostgreSQL instance.

```
services/
  backend-auth/   Fastify + Prisma, own Postgres DB
  backend-game/   Fastify + Prisma, own Postgres DB, seeds + serves game data
  frontend/       Vite + React static app, calls both backends
```

## Running locally (without Docker)

Requires Node 20+ and two local Postgres databases (or two Postgres containers
started individually — not via compose — e.g. `docker run -p 5432:5432 ... postgres:16`
and `docker run -p 5433:5432 ... postgres:16`).

```bash
# backend-auth
cd services/backend-auth
cp .env.example .env            # edit DATABASE_URL if needed
npm install
npm run migrate:deploy          # applies prisma/migrations
npm run dev                     # http://localhost:3001/health

# backend-game (separate terminal)
cd services/backend-game
cp .env.example .env
npm install
npm run migrate:deploy
npm run seed                    # inserts mock games if table is empty
npm run dev                     # http://localhost:3002/health, /games

# frontend (separate terminal)
cd services/frontend
cp .env.example .env
npm install
npm run dev                     # http://localhost:5173
```

## Running locally with Docker (each service standalone, no compose)

```bash
docker build -t backend-auth ./services/backend-auth
docker run --env-file services/backend-auth/.env -p 3001:3001 backend-auth

docker build -t backend-game ./services/backend-game
docker run --env-file services/backend-game/.env -p 3002:3002 backend-game

docker build -t frontend \
  --build-arg VITE_AUTH_API_URL=http://localhost:3001 \
  --build-arg VITE_GAME_API_URL=http://localhost:3002 \
  ./services/frontend
docker run -p 8080:80 frontend
```

Each backend's container entrypoint runs `prisma migrate deploy` (and, for
backend-game, the seed script) before starting the server — so the "mock
migrations" happen automatically on every container start.

## Setting up on Azure App Service (PaaS)

1. **Provision two Azure Database for PostgreSQL Flexible Server instances**
   (one for auth, one for game), or one server with two databases. Grab the
   connection strings.

2. **Create a container registry** — GHCR is already wired up via
   `.github/workflows/deploy.yml`, which builds and pushes all three images
   on every push to `main`:
   - `ghcr.io/<owner>/backend-auth:latest`
   - `ghcr.io/<owner>/backend-game:latest`
   - `ghcr.io/<owner>/frontend:latest`

   Set repository variables `VITE_AUTH_API_URL` / `VITE_GAME_API_URL` (Settings →
   Secrets and variables → Actions → Variables) to the public URLs your
   backend App Services will have, so the frontend is built pointing at them.

3. **Create three Azure App Service (Linux, Container) instances**, one per
   service, each configured to pull from GHCR:
   - `backend-auth-app` → image `ghcr.io/<owner>/backend-auth:latest`, port `3001`
     - App setting: `DATABASE_URL` = auth Postgres connection string
     - App setting: `WEBSITES_PORT` = `3001`
   - `backend-game-app` → image `ghcr.io/<owner>/backend-game:latest`, port `3002`
     - App setting: `DATABASE_URL` = game Postgres connection string
     - App setting: `WEBSITES_PORT` = `3002`
   - `frontend-app` → image `ghcr.io/<owner>/frontend:latest`, port `80`
     - App setting: `WEBSITES_PORT` = `80`
     - (API URLs are already baked into the static build — see step 2)

   If GHCR packages are private, add registry credentials under
   App Service → Deployment Center (or `az webapp config container set
   --docker-registry-server-url https://ghcr.io --docker-registry-server-user
   <user> --docker-registry-server-password <PAT>`).

4. **Allow App Service outbound IPs** through the Postgres Flexible Server
   firewall (or enable "Allow public access from Azure services").

5. Each backend applies its own migrations on container start, so there's no
   separate migration step to run in Azure — redeploying the image is enough.
