// Security check for the SSO role mapping. No test runner is configured in this
// repo, so run it directly:  pnpm dlx tsx src/lib/sso.test.ts
import assert from "node:assert/strict";
import { mapEntraRoles, decodeJwt } from "./sso";

// mapEntraRoles — Admin outranks Editor; unknown/empty/non-array → reject (null)
assert.deepEqual(mapEntraRoles(["Admin"]), ["admin"]);
assert.deepEqual(mapEntraRoles(["Editor"]), ["editor"]);
assert.deepEqual(mapEntraRoles(["Editor", "Admin"]), ["admin"]); // admin wins
assert.equal(mapEntraRoles([]), null);
assert.equal(mapEntraRoles(undefined), null);
assert.equal(mapEntraRoles("Admin"), null); // a bare string is not an app-role array

// decodeJwt — reads the base64url payload segment, incl. url-safe chars (- _)
const payload = { roles: ["Editor"], email: "a@b.com", sub: "x?y>z" };
const fakeJwt = `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.sig`;
assert.deepEqual(decodeJwt(fakeJwt), payload);
assert.deepEqual(decodeJwt(""), {}); // malformed → empty object, no throw

console.log("sso.test.ts: all assertions passed");
