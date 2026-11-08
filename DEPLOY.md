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
# 3. Build from committed source and start the database.
git archive HEAD | ssh nas 'sudo /usr/local/bin/docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://kaizhou.hk -t kaizhou-app:latest -'
ssh nas 'cat > /volume1/docker/kaizhou-website/docker-compose.yml' < docker-compose.yml
ssh nas 'cd /volume1/docker/kaizhou-website && sudo /usr/local/bin/docker compose up -d db'

# Only when schema changes require it, build a temporary full builder image.
git archive HEAD | ssh nas 'sudo /usr/local/bin/docker build --target builder \
  --build-arg NEXT_PUBLIC_SITE_URL=https://kaizhou.hk -t kaizhou-builder -'
```

On the NAS, for an initial database or a release requiring schema changes:

```sh
cd /volume1/docker/kaizhou-website

# 4. Apply reviewed, versioned migrations before starting the new runtime.
# For an existing push-managed DB, complete the baseline procedure below first.
# Keep ENTRA_* enabled so migration tooling uses the production SSO configuration.
source .env
sudo /usr/local/bin/docker run --rm --network kaizhou_default \
  --env-file .env -e NODE_ENV=production \
  -e DATABASE_URL="postgres://kaizhou:${POSTGRES_PASSWORD}@db:5432/kaizhou" \
  kaizhou-builder pnpm db:migrate
sudo /usr/local/bin/docker image rm kaizhou-builder

# 5. Start the runtime and smoke-test locally on the NAS
sudo /usr/local/bin/docker compose up -d --no-deps --no-build app
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
# Apply pending migrations as in step 4, then verify the new image before switching.
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

Schema changes must have committed Payload migrations. Apply them from the matching
full build image **before** switching the runtime; `compose up` does not migrate the DB.
Never point development-mode schema push at production.

## Versioned database migrations

Production uses Node.js 24.22.2 and `NODE_ENV=production`. Schema push is enabled only
in development. `pnpm db:migrate` applies pending migrations and records them in
`payload_migrations`; `pnpm db:status` reports their status. Run one migration process
at a time while member/role editing is paused, with a verified database backup.

A fresh, empty database needs only `pnpm db:migrate`. For the existing database that
was previously managed by schema push, adopt the baseline once from the full build
environment, with production `DATABASE_URL`, `PAYLOAD_SECRET` and `ENTRA_*` configured:

```sh
NODE_ENV=production pnpm payload run scripts/baseline-database.ts dry-run
NODE_ENV=production pnpm payload run scripts/baseline-database.ts apply
pnpm db:migrate
pnpm db:status
```

The baseline represents commit `3b4057e` with production SSO enabled. Adoption checks
required tables, column types/nullability/defaults, enums, indexes and foreign keys.
It refuses schema drift and unexpected migration history. Extra legacy password columns
are retained. Only after verification does `apply` replace the old `dev` marker with
the baseline record, in a transaction; it does not rewrite application data. Never
manually mark the baseline as applied on a mismatched database. Reconcile differences
against the backup in a disposable database first. A previously recorded baseline is
a no-op, so the adoption command can safely be retried after an interrupted deployment.

The next migration adds `titular_presidents` and its relationships. It does not move
members: run the separate president-data migration below before switching the runtime.
Its `down` refuses to drop a populated president table. The baseline cannot be undone
with `migrate:down`; restore the intentional pre-deployment backup for a full rollback.

For future schema changes, generate migrations with production SSO enabled (dummy
values are sufficient for generation; it does not connect to Microsoft or the DB):

```sh
NODE_ENV=production ENTRA_CLIENT_ID=schema-generation \
  ENTRA_CLIENT_SECRET=schema-generation ENTRA_TENANT_ID=schema-generation \
  pnpm payload migrate:create describe_the_change
```

Review and commit both generated SQL/TypeScript and JSON snapshots. Test fresh install,
upgrade, rerun and rollback against disposable Postgres databases, then run the same
migration files in the full build environment. Keep dev push databases separate from
migration-managed databases. Do not run `migrate:fresh` or `migrate:reset` on live data.

`NODE_ENV=production pnpm payload run scripts/migrations.integration.test.ts` tests
baseline adoption, drift rejection, data preservation, repeated upgrades and rollback
protection. It requires an **empty disposable database named `migrations_test`**, with
SSO enabled. Existing member tests use a separate `roles_test` development database.

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

The committee member collection remains the source of committee person details. `committee-roles`
stores the ordered roles, colors, presentation style, and references to those records.
The former committee `title` enum and member `order` fields remain intact for rollback;
the committee admin hides them. President collections manage their own order and public-office `title`.

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
4. Apply pending versioned schema migrations with `pnpm db:migrate` from the full
   build image. If adopting an existing database, complete baseline verification first.
5. Run `NODE_ENV=production pnpm payload run scripts/migrate-committee-roles.ts apply ./role-mapping.json`
   (omit the filename when all titles already match). It writes the assignments in one
   transaction and verifies member references before committing. Repeating `apply`
   leaves an already-saved configuration unchanged.
6. Deploy the runtime and check `/admin/globals/committee-roles`, the member forms,
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

## Separate president sections

This release adds a `titular-presidents` (名譽會長) collection. 榮譽會長 and 名譽會長
have separate admin lists and fixed gold presentation on `/about`. Only 現任理事會
uses the configurable roles. The old honorary relationship column is retained for
migration compatibility; both the selector filter and save validation reject new
honorary assignments to the committee.

Before switching the runtime, pause member/role editing and back up the database.
Use the full build environment to apply the additive schema with `pnpm db:migrate`,
then run:

```sh
NODE_ENV=production pnpm payload run scripts/split-president-sections.ts dry-run
NODE_ENV=production pnpm payload run scripts/split-president-sections.ts apply
```

The migration preserves saved order and moves members assigned to the two president
roles into their respective collections, including retired members. Existing honorary
records in the honorary role stay in place. When copying between collections, the
original record is retained with `isCurrent: false`; names, public titles or bios,
photos and current status are copied. Remaining committee roles keep their settings.
Duplicate assignments, missing members or honorary members assigned to other committee
roles abort the transaction for review. Repeating a successful apply makes no changes.
A dry run rolls back without writing data.

For installations with no saved roles, use the initial committee role migration above;
president lists are independent and require no role assignment. Verify all three
sections and admin lists before reopening editing. Rollback after moving records
requires restoring the pre-migration database backup along with the previous release.
Keep migration scripts and evidence in the build workspace; remove disposable staging
and test containers when finished, retaining intentional recovery backups.
