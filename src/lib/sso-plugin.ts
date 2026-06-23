import { type Plugin, parseCookies } from "payload";
import { OAuth2Plugin } from "payload-oauth2";
import { ENTRA_ENABLED, decodeJwt, mapEntraRoles } from "./sso";

const TENANT_ID = process.env.ENTRA_TENANT_ID ?? "";
const CLIENT_ID = process.env.ENTRA_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.ENTRA_CLIENT_SECRET ?? "";
const SERVER_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const AUTHORITY = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0`;
const TOKEN_ENDPOINT = `${AUTHORITY}/token`;
const CALLBACK_PATH = "/oauth/entra/callback";
// payload-oauth2 mounts the callback under the auth collection. Register THIS
// exact URI as the redirect URI in the Entra app registration:
//   {NEXT_PUBLIC_SITE_URL}/api/users/oauth/entra/callback
const REDIRECT_URI = `${SERVER_URL}/api/users${CALLBACK_PATH}`;

/** Microsoft Entra ID (Azure AD) SSO for the admin panel. No-op until
 *  ENTRA_CLIENT_ID is set, so local dev keeps email/password login. */
export const entraPlugin: Plugin = OAuth2Plugin({
  enabled: ENTRA_ENABLED,
  strategyName: "entra",
  authCollection: "users",
  useEmailAsIdentity: true,
  onUserNotFoundBehavior: "create",
  serverURL: SERVER_URL,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  providerAuthorizationUrl: `${AUTHORITY}/authorize`,
  tokenEndpoint: TOKEN_ENDPOINT,
  scopes: ["openid", "profile", "email"],
  authorizePath: "/oauth/entra",
  callbackPath: CALLBACK_PATH,
  // PKCE binds the auth code to the browser that started the flow (via the
  // pkce_verifier cookie set on /authorize), closing login-CSRF / code-injection:
  // a code can only be exchanged by the browser that initiated the login.
  pkceEnabled: true,
  // Confidential client (we hold the secret) → auth-code flow. We return the ID
  // token (not the access token): for Entra it carries BOTH the user's identity
  // and their assigned App Roles (the `roles` claim), so getUserInfo needs no
  // extra Microsoft Graph call. payload-oauth2 feeds whatever getToken returns
  // straight into getUserInfo, and passes the request as the 2nd arg so we can
  // forward the PKCE verifier cookie.
  getToken: async (code, req) => {
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      scope: "openid profile email",
    });
    const verifier = parseCookies(req.headers).get("pkce_verifier");
    if (verifier) body.append("code_verifier", verifier);
    const res = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
    });
    const data = (await res.json()) as { id_token?: string; error_description?: string };
    if (!data.id_token) {
      throw new Error(`Entra token exchange failed: ${data.error_description ?? "no id_token returned"}`);
    }
    return data.id_token;
  },
  getUserInfo: async (idToken) => {
    const claims = decodeJwt(idToken);
    const roles = mapEntraRoles(claims.roles);
    // Reject anyone without an assigned Admin/Editor app role (defence-in-depth
    // alongside Entra's "require user assignment").
    if (!roles) {
      throw new Error("SSO rejected: account has no Kaizhou App Role (Admin/Editor) assigned in Entra.");
    }
    return {
      email: (claims.email as string | undefined) ?? (claims.preferred_username as string | undefined),
      name: claims.name as string | undefined,
      roles,
    };
  },
  successRedirect: () => "/admin",
  // Emit a stable code (not the raw error message) so nothing verbose or
  // sensitive is reflected to the login page; SsoButton maps it to a localized
  // message. The descriptive Error still surfaces in server logs for debugging.
  failureRedirect: (_req, err) => {
    const msg = err instanceof Error ? err.message : "";
    const code = msg.includes("App Role") ? "no_role" : "sso_failed";
    return `/admin/login?error=${code}`;
  },
});
