"use client";
import { useSearchParams } from "next/navigation";

const SSO_LOGIN_URL = "/api/users/oauth/entra";

// Stable error codes from the OAuth failureRedirect → localized messages.
// Keeps the raw error off the login page (no verbose/sensitive reflection).
const ERROR_MESSAGES: Record<string, string> = {
  no_role: "此帳戶未獲指派權限（需 Admin 或 Editor） / Your account has no assigned role",
  sso_failed: "登入失敗，請重試 / Sign-in failed — please try again",
};

/**
 * "Sign in with Microsoft" button for the admin login screen, shown when Entra
 * SSO is configured. A plain link to the OAuth authorize endpoint (a full
 * navigation, which the server 302s to Entra). If Entra bounced us back with
 * `?error=<code>`, show the matching localized message above the button.
 */
export function SsoButton() {
  const code = useSearchParams().get("error");
  const message = code ? (ERROR_MESSAGES[code] ?? ERROR_MESSAGES.sso_failed) : null;
  return (
    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
      {message ? (
        <p style={{ marginBottom: "1rem", color: "var(--theme-error-500)" }}>{message}</p>
      ) : null}
      <a href={SSO_LOGIN_URL} className="btn btn--style-primary btn--size-medium">
        使用 Microsoft 帳戶登入 / Sign in with Microsoft
      </a>
    </div>
  );
}
