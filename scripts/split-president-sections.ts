// Run after pnpm db:migrate, before switching the runtime to this release.
// NODE_ENV=production pnpm payload run scripts/split-president-sections.ts dry-run|apply
import { getPayload } from "payload";
import config from "@payload-config";
import { splitPresidentSections } from "../src/lib/split-president-sections";

if (process.env.NODE_ENV !== "production") throw new Error("Run with NODE_ENV=production; schema changes must be applied separately.");
const [mode = "dry-run"] = process.argv.slice(2);
if (!["dry-run", "apply"].includes(mode)) throw new Error("Expected dry-run or apply.");
const payload = await getPayload({ config });
try {
  const count = await splitPresidentSections(payload, mode === "apply");
  payload.logger.info(`${mode}: ${count} president assignments. ${mode === "apply" ? "Migration complete." : "No data changed."}`);
} finally {
  await payload.destroy();
}
