import { SsoButton } from "./SsoButton";

// When Entra SSO is configured, show a "Sign in with Microsoft" button on the
// login screen (the idiomatic Payload pattern — a beforeLogin slot component).
// In SSO-only prod there's no password form, so this button is the way in.
// Local dev without creds shows just the branding; autoLogin skips this anyway.
const SSO_ENABLED = !!process.env.ENTRA_CLIENT_ID;

export default function BeforeLogin() {
  return (
    <div className="kz-before-login">
      <h1 className="kz-before-login__title">香港開州同鄉會</h1>
      <p className="kz-before-login__sub">內容管理系統</p>
      <p className="kz-before-login__en">Hong Kong Kaizhou Association</p>
      {SSO_ENABLED ? <SsoButton /> : null}
    </div>
  );
}
