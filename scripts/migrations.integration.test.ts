import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createLocalReq, getPayload } from "payload";
import config from "@payload-config";
import { up as createBaseline } from "../src/migrations/20261108_091832_baseline";
import { down as removePresidents } from "../src/migrations/20261108_091921_president_sections";
import { baselineDatabase } from "./lib/baseline-database";
import { splitPresidentSections } from "../src/lib/split-president-sections";

if (process.env.NODE_ENV !== "production" || new URL(process.env.DATABASE_URL!).pathname !== "/migrations_test") {
  throw new Error("Use NODE_ENV=production and an empty disposable migrations_test database only.");
}
const payload = await getPayload({ config });
try {
  const { rows } = await payload.db.pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
  assert.equal(rows.length, 0, "Database must be empty; never run against live data.");
  const req = await createLocalReq({}, payload);
  await createBaseline({ db: payload.db.drizzle, payload, req });
  await payload.db.pool.query("INSERT INTO payload_migrations (name, batch) VALUES ('dev', -1)");
  const member = await payload.create({ collection: "committee-members", data: { name: "保留理事", bio: "遷移保留簡介" } });
  const honorary = await payload.create({ collection: "honorary-presidents", data: { name: "轉任名譽", title: "保留銜頭" } });
  await payload.db.updateGlobal({ slug: "committee-roles", data: { roles: [
    { id: randomUUID(), name: "會長", color: "#8b2323", appearance: "chair", members: [{ relationTo: "committee-members", value: member.id }] },
    { id: randomUUID(), name: "名譽會長", color: "#c5a55a", appearance: "honorary", members: [{ relationTo: "honorary-presidents", value: honorary.id }] },
  ] } });
  // Previous pushes may have left password fields. Baselining must preserve them.
  await payload.db.pool.query("ALTER TABLE users ADD COLUMN hash varchar");
  await payload.db.pool.query("CREATE TABLE users_sessions (id varchar PRIMARY KEY)");
  await payload.db.pool.query("INSERT INTO users_sessions VALUES ('preserve-legacy-session')");
  await payload.db.pool.query("CREATE TABLE unexpected_table (id integer)");
  await assert.rejects(baselineDatabase(payload, true), /Unexpected table: unexpected_table/);
  await payload.db.pool.query("DROP TABLE unexpected_table");
  assert.match(await baselineDatabase(payload, false), /matches/);
  assert.equal((await payload.find({ collection: "payload-migrations" })).docs[0].name, "dev");
  await payload.db.pool.query("DROP INDEX users_email_idx");
  await assert.rejects(baselineDatabase(payload, true), /users_email_idx/);
  assert.equal((await payload.find({ collection: "payload-migrations" })).docs[0].name, "dev");
  await payload.db.pool.query("CREATE UNIQUE INDEX users_email_idx ON users (email)");
  await payload.db.pool.query("ALTER TABLE honorary_presidents RENAME COLUMN title TO wrong_title");
  await assert.rejects(baselineDatabase(payload, true), /honorary_presidents.title/);
  await payload.db.pool.query("ALTER TABLE honorary_presidents RENAME COLUMN wrong_title TO title");
  assert.match(await baselineDatabase(payload, true), /verified and recorded/);
  assert.match(await baselineDatabase(payload, true), /already recorded/);
  assert.equal((await payload.db.pool.query("SELECT id FROM users_sessions")).rows[0].id, "preserve-legacy-session");
  await payload.db.migrate();
  await payload.db.migrateDown();
  await payload.db.migrate();
  assert.equal((await payload.find({ collection: "payload-migrations" })).totalDocs, 2);
  assert.equal((await payload.findByID({ collection: "committee-members", id: member.id })).bio, "遷移保留簡介");
  assert.equal(await splitPresidentSections(payload, false), 1);
  assert.equal(await splitPresidentSections(payload, true), 1);
  assert.equal(await splitPresidentSections(payload, true), 0);
  await payload.db.migrate();
  assert.equal((await payload.find({ collection: "titular-presidents" })).docs[0].title, "保留銜頭");
  await assert.rejects(removePresidents({ db: payload.db.drizzle, payload, req }), /Refusing to drop/);
  assert.equal((await payload.find({ collection: "titular-presidents" })).totalDocs, 1);
  assert.equal((await payload.find({ collection: "payload-migrations" })).totalDocs, 2);
  console.log("migrations.integration.test.ts: baseline, drift refusal, upgrade, rollback, data preservation and rerun passed");
} finally {
  await payload.destroy();
}
