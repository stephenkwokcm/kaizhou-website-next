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

The NAS project directory contains only `docker-compose.yml`, `.env`, and
intentional recovery backups. Source, documentation, and verification scripts
stay in the local checkout and Git remote. Stream committed source directly to
Docker for builds; do not unpack a checkout or retain a source archive on the NAS.

`docker` is not on the SSH PATH; use `sudo /usr/local/bin/docker` (passwordless
sudo is configured).

## First deploy

```sh
# 1. On the NAS, create the runtime directory.
sudo mkdir -p /volume1/docker/kaizhou-website
sudo chown "$(id -u):$(id -g)" /volume1/docker/kaizhou-website
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

```

From the **local checkout**, build and install the runtime configuration:

```sh
# 3. Build from committed source and start the runtime image.
git archive HEAD | ssh nas 'sudo /usr/local/bin/docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://kaizhou.hk -t kaizhou-app:latest -'
ssh nas 'cat > /volume1/docker/kaizhou-website/docker-compose.yml' < docker-compose.yml
ssh nas 'cd /volume1/docker/kaizhou-website && sudo /usr/local/bin/docker compose up -d --no-build'

# Only when schema changes require it, build a temporary full builder image.
git archive HEAD | ssh nas 'sudo /usr/local/bin/docker build --target builder \
  --build-arg NEXT_PUBLIC_SITE_URL=https://kaizhou.hk -t kaizhou-builder -'
```

On the NAS, for an initial database or a release requiring schema changes:

```sh
cd /volume1/docker/kaizhou-website

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
sudo /usr/local/bin/docker run --rm --network kaizhou_default \
  --env-file .env \
  -e NODE_ENV=development -e PAYLOAD_DB_PUSH=true \
  -e DATABASE_URL="postgres://kaizhou:${POSTGRES_PASSWORD}@db:5432/kaizhou" \
  kaizhou-builder pnpm payload run scripts/db-push.ts
sudo /usr/local/bin/docker image rm kaizhou-builder

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

Run from the local checkout after committing, pushing, and passing checks:

```sh
release=$(git rev-parse --short HEAD)
git archive HEAD | ssh nas "sudo /usr/local/bin/docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://kaizhou.hk -t kaizhou-app:$release -"
ssh nas 'cat > /volume1/docker/kaizhou-website/docker-compose.yml' < docker-compose.yml
ssh nas "cd /volume1/docker/kaizhou-website && \
  sudo /usr/local/bin/docker tag kaizhou-app:latest kaizhou-app:rollback && \
  sudo /usr/local/bin/docker tag kaizhou-app:$release kaizhou-app:latest && \
  sudo /usr/local/bin/docker compose up -d --no-deps --no-build app"
```

Verify the new image on a private port before switching, then smoke-test the
public pages, content APIs, media, and admin login. Remove temporary containers,
secret files, and this build's unused builder/dependency images once no container
uses them. Keep the deployed image and intentional rollback images. Do not use
global prune commands on this shared Docker host.

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


## Committee role configuration migration

The two member collections remain the source of person details. `committee-roles`
stores the ordered roles, colors, presentation style, and references to those records.
The former committee `title` enum and member `order` fields remain intact for rollback;
the new admin hides them. Honorary presidents' public-office `title` is unchanged.

Before deploying this change:

1. Back up the target database using the existing backup process.
2. From the full build environment, run the migration in read-only mode against the
   target database: `NODE_ENV=production pnpm payload run scripts/migrate-committee-roles.ts dry-run`.
   This reads **all** records, including retired members. Resolve every reported legacy
   title with the content owner; no mapping is assumed.
3. If needed, supply a JSON file whose keys are old titles and values are exact new
   titles: `NODE_ENV=production pnpm payload run scripts/migrate-committee-roles.ts dry-run ./role-mapping.json`.
   An empty old title uses the key `""`. Keep mapping files local to the deployment
   workspace; do not add real member exports or working reports to the runtime image.
4. Use the existing `scripts/db-push.ts` workflow to add the new global tables from the
   full build image. This does not remove the existing member columns.
5. Run `NODE_ENV=production pnpm payload run scripts/migrate-committee-roles.ts apply ./role-mapping.json`
   (omit the filename when all titles already match). It writes the assignments in one
   transaction and verifies member references before committing. Repeating `apply`
   leaves an already-saved configuration unchanged.
6. Deploy the runtime and check `/admin/globals/committee-roles`, both member forms,
   and `/about`. The new page uses the existing admin/editor permissions. New people
   are created on the existing member pages and assigned through the role settings.

Until the first configuration is saved, the frontend retains legacy member content.
The admin prevents an initial save over existing members until migration has run.
An intentionally saved empty configuration displays the normal empty state.
Public pages retain their existing five-minute revalidation interval.

For rollback, restore the prior application release; legacy titles and member records
are retained. If editors changed assignments after migration, review those changes
before rolling back because the legacy role values are not synchronized afterward.
Remove temporary migration containers and staging files when finished; retain the
intentional database backup according to the existing recovery policy.

Verification: `pnpm lint`, `pnpm exec tsc --noEmit`, and
`pnpm payload run src/lib/committee-roles.test.ts`. Database integration checks are in
`scripts/committee-roles.integration.test.ts`; run them only against a disposable
Postgres database named `roles_test`, with development schema push enabled.
