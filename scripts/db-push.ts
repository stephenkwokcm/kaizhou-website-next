/**
 * One-off schema sync for production.
 *
 * The runtime app image is a trimmed Next.js standalone build that does NOT
 * include drizzle-kit, so it cannot create or migrate the Postgres schema.
 * Run this from the full build image instead:
 *
 *   docker run --rm --network kaizhou_default \
 *     -e NODE_ENV=development -e PAYLOAD_DB_PUSH=true \
 *     -e DATABASE_URL=postgres://kaizhou:***@db:5432/kaizhou \
 *     -e PAYLOAD_SECRET=*** -e NEXT_PUBLIC_SITE_URL=https://kaizhou.hk \
 *     kaizhou-builder pnpm payload run scripts/db-push.ts
 *
 * Initialising Payload with push enabled syncs the DB schema to match the
 * collections, then exits. Re-run after any change to collections/fields.
 * NOTE: must run with NODE_ENV=development — Payload skips `push` in production.
 */
import { getPayload } from "payload";
import config from "@payload-config";

// Top-level await so `payload run` waits for the schema sync to finish before
// the process exits (a fire-and-forget call would exit before push completes).
const payload = await getPayload({ config });
payload.logger.info("[db-push] schema sync complete");
process.exit(0);
