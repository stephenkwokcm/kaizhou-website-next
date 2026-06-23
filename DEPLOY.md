# Deploying to the Synology NAS (Docker)

This site runs as two containers via Docker Compose: a Next.js standalone app and
a PostgreSQL database. The database is **internal-only** (no published port); the
app is published on host port **3100** and exposed publicly through a **Cloudflare
Tunnel** at `https://kaizhou.hk`.

## Layout

| | |
|---|---|
| Host | Synology DS224+ (DSM 7, x86_64), Container Manager (Docker 24 / Compose v2) |
| Project dir | `/volume1/docker/kaizhou-website` |
| App container | `kaizhou-app` — host `3100` → container `3000` |
| DB container | `kaizhou-db` — `postgres:16-alpine`, internal network only |
| Volumes | `kaizhou_db_data` (Postgres), `kaizhou_media` (uploads) — named volumes |
| Public URL | `https://kaizhou.hk` via the existing `cloudflared-tunnel` |

`docker` is not on the SSH PATH; use `sudo /usr/local/bin/docker` (passwordless
sudo is configured).

## First deploy

```sh
# 1. Clone (repo is public)
sudo mkdir -p /volume1/docker/kaizhou-website
sudo chown "$(id -u):$(id -g)" /volume1/docker/kaizhou-website
git clone https://github.com/stephenkwokcm/kaizhou-website-next.git /volume1/docker/kaizhou-website
cd /volume1/docker/kaizhou-website

# 2. Create .env with production secrets (NOT committed; chmod 600)
# The ENTRA_* values come from the Microsoft Entra app registration (Azure portal)
# and are REQUIRED: prod is SSO-only (disableLocalStrategy), so without them the
# admin panel has no way to log in. Also register the redirect URI in that app:
#   https://kaizhou.hk/api/users/oauth/entra/callback
cat > .env <<EOF
NEXT_PUBLIC_SITE_URL=https://kaizhou.hk
PAYLOAD_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
ENTRA_TENANT_ID=<tenant-id>
ENTRA_CLIENT_ID=<client-id>
ENTRA_CLIENT_SECRET=<client-secret>
EOF
chmod 600 .env

# 3. Build + start
sudo /usr/local/bin/docker compose up -d --build

# 4. Create the database schema (one-off).
# The runtime image is trimmed and has no drizzle-kit, so the schema is synced
# from the full build image. NOTE: Payload only applies `push` when NOT in
# production (it expects migrations in prod), so this one-off runs with
# NODE_ENV=development against the production DB purely to create the schema.
# The running app stays NODE_ENV=production. Re-run after collection changes.
# --env-file .env is REQUIRED: it carries ENTRA_* so the OAuth plugin is enabled
# during the push and its injected `sub` field (users.sub, indexed) gets created.
# Without it the prod app crashes every user query with "column users.sub does
# not exist". (The same applies to any plugin that adds fields when enabled.)
source .env
sudo /usr/local/bin/docker build --target builder -t kaizhou-builder \
  --build-arg NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL" .
sudo /usr/local/bin/docker run --rm --network kaizhou_default \
  --env-file .env \
  -e NODE_ENV=development -e PAYLOAD_DB_PUSH=true \
  -e DATABASE_URL="postgres://kaizhou:${POSTGRES_PASSWORD}@db:5432/kaizhou" \
  kaizhou-builder pnpm payload run scripts/db-push.ts

# 5. Smoke-test locally on the NAS
curl -I http://localhost:3100
```

## Cloudflare Tunnel (done once, in the dashboard)

The tunnel is **token-managed**, so the route is added in the Cloudflare Zero Trust
dashboard, not on the NAS:

**Zero Trust → Networks → Tunnels → (your tunnel) → Public Hostnames → Add:**

- Subdomain/Domain: `kaizhou.hk`
- Service: **HTTP** → `10.1.1.7:3100`

## First admin user

After the tunnel is live, create the first admin (a fresh DB grants it the `admin`
role automatically — no role back-fill needed):

`https://kaizhou.hk/admin/create-first-user`

> Create the first user via the real `https://kaizhou.hk` origin, not the LAN IP —
> CORS/CSRF are locked to `NEXT_PUBLIC_SITE_URL`.

## Updating

```sh
cd /volume1/docker/kaizhou-website
git pull
sudo /usr/local/bin/docker compose up -d --build
```

If the update changed collections/fields **or enabled a plugin that adds fields**
(e.g. turning on Entra SSO adds `users.sub`), re-run the schema sync in step 4
afterwards — `compose up` does not migrate the DB. Symptom of a skipped sync:
the app boots but every query errors with `column ... does not exist`.

## Backups

- **Database:** `sudo /usr/local/bin/docker exec kaizhou-db pg_dump -U kaizhou kaizhou > backup.sql`
- **Uploads:** the `kaizhou_media` named volume holds all Payload Media files.

## Notes

- `PAYLOAD_SECRET` / `POSTGRES_PASSWORD` live only in `.env` on the NAS. Losing
  `PAYLOAD_SECRET` invalidates all admin sessions; losing the DB password requires
  resetting it in Postgres.
- Email is not configured (no SMTP) — admin password resets are done via the
  Payload Local API, not the "Forgot password" link. See the main README.
