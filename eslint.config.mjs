import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next.js 16 removed `next lint`; lint with the ESLint CLI + flat config.
// `core-web-vitals` upgrades the perf-impacting Next rules to errors, and
// `typescript` layers in @typescript-eslint/recommended for our TS sources.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Build output and Payload-generated files — not hand-written, not linted.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/payload-types.ts",
    "src/app/(payload)/**",
  ]),
]);

export default eslintConfig;
