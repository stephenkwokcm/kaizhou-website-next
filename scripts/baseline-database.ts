import { getPayload } from "payload";
import config from "@payload-config";
import { baselineDatabase } from "./lib/baseline-database";

if (process.env.NODE_ENV !== "production") throw new Error("Run with NODE_ENV=production to disable schema push.");
const [mode = "dry-run"] = process.argv.slice(2);
if (!["dry-run", "apply"].includes(mode)) throw new Error("Expected dry-run or apply.");
const payload = await getPayload({ config });
try {
  payload.logger.info(await baselineDatabase(payload, mode === "apply"));
} finally {
  await payload.destroy();
}
