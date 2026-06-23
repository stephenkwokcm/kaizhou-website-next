// Pure Entra/SSO helpers — no Payload or plugin imports, so the role-mapping
// logic stays unit-testable (see sso.test.ts) and Users.ts can read the env gate
// without pulling the OAuth plugin into its module graph.

/** Entra SSO is wired only when a client id is present. Dev has none, so the
 *  plugin stays off and email/password login (the local bypass) keeps working. */
export const ENTRA_ENABLED = (process.env.ENTRA_CLIENT_ID ?? "").length > 0;

/** Prod is SSO-only: the email/password method is OFF in production (no legacy
 *  fallback). Dev deliberately keeps the local strategy ON — even with Entra
 *  creds set — so the password columns stay in the dev DB (no destructive schema
 *  push) and admin.autoLogin keeps working as a fallback. The password form is
 *  therefore visible in dev alongside the SSO button; that's a dev-only
 *  convenience that never ships, since prod is a separate DB with the local
 *  strategy disabled (its schema simply never has those columns). */
export const SSO_ONLY = process.env.NODE_ENV === "production";

/** Decode (NOT verify) a JWT payload. Safe in our flow: the token comes straight
 *  from Entra's token endpoint over TLS during the server-side code exchange, so
 *  its provenance is already trusted. */
// ponytail: decode-not-verify. If a token ever reaches this from a less-trusted
// path (e.g. one sent by the browser), verify signature/issuer/audience with
// `jose` against Entra's JWKS before trusting these claims.
export function decodeJwt(token: string): Record<string, unknown> {
  const payload = token?.split(".")[1];
  if (!payload) return {};
  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}

/** Map Entra "App Role" values → this site's roles, mirroring the Users.roles
 *  options. Admin outranks Editor. Returns null when the user holds no
 *  recognised app role, so login is REJECTED — nobody is silently granted
 *  access just for existing in the tenant. */
export function mapEntraRoles(claim: unknown): ["admin"] | ["editor"] | null {
  const roles = Array.isArray(claim) ? claim.map(String) : [];
  if (roles.includes("Admin")) return ["admin"];
  if (roles.includes("Editor")) return ["editor"];
  return null;
}
