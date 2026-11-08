// Run with NODE_ENV=production to keep dry runs from pushing the database schema.
// pnpm payload run scripts/migrate-committee-roles.ts dry-run [mapping.json]
// pnpm payload run scripts/migrate-committee-roles.ts apply [mapping.json]
import { readFile } from "node:fs/promises";
import { getPayload } from "payload";
import config from "@payload-config";
import { memberKey, migrateRoleAssignments } from "../src/lib/committee-roles";

if (process.env.NODE_ENV !== "production") throw new Error("Run with NODE_ENV=production; schema changes must be applied separately.");
const [mode = "dry-run", mappingPath] = process.argv.slice(2);
if (!["dry-run", "apply"].includes(mode)) throw new Error("Expected dry-run or apply, followed by an optional mapping JSON file.");
const mapping = mappingPath ? JSON.parse(await readFile(mappingPath, "utf8")) : {};
if (!mapping || Array.isArray(mapping) || typeof mapping !== "object" || Object.values(mapping).some((value) => typeof value !== "string")) {
  throw new Error("The mapping must be a JSON object of old role names to new role names.");
}

const payload = await getPayload({ config });
async function migrate() {
  if (mode === "apply") {
    const existing = await payload.findGlobal({ slug: "committee-roles", depth: 0 });
    if (existing.updatedAt) {
      payload.logger.info("Role configuration already exists; leaving it unchanged.");
      return;
    }
  }
  const committee = await payload.find({ collection: "committee-members", pagination: false, depth: 0, sort: ["order", "id"] });
  const roles = migrateRoleAssignments(committee.docs, mapping);
  for (const role of roles) payload.logger.info(`${role.name}: ${role.members?.length ?? 0} members`);
  if (mode === "apply") {
    const transactionID = await payload.db.beginTransaction();
    if (!transactionID) throw new Error("Migration requires database transactions.");
    const req = { transactionID };
    try {
      const existing = await payload.findGlobal({ slug: "committee-roles", depth: 0, req });
      if (existing.updatedAt) {
        payload.logger.info("Role configuration already exists; leaving it unchanged.");
      } else {
        const saved = await payload.updateGlobal({ slug: "committee-roles", data: { roles }, depth: 0, req, context: { committeeRoleMigration: true } });
        const expected = roles.flatMap((role) => role.members ?? []).map(memberKey).sort();
        const actual = (saved.roles ?? []).flatMap((role) => role.members ?? []).map(memberKey).sort();
        if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error("Assignment verification failed; rolling back.");
        payload.logger.info(`Migrated ${actual.length} assignments. Original records and titles are unchanged.`);
      }
      await payload.db.commitTransaction(transactionID);
    } catch (error) {
      await payload.db.rollbackTransaction(transactionID);
      throw error;
    }
  } else {
    payload.logger.info("Dry run complete. No data changed.");
  }
}

try {
  await migrate();
} finally {
  await payload.destroy();
}
