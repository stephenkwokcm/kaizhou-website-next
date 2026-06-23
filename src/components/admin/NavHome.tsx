import Link from "next/link";

// Adds a 首頁 entry at the top of the admin nav — Payload's nav has no link back
// to the dashboard home otherwise. Mounted via admin.components.beforeNavLinks;
// reuses the .nav__link styling + the #nav-home icon mask in custom.scss.
export default function NavHome() {
  return (
    <Link id="nav-home" className="nav__link" href="/admin">
      <span className="nav__link-label">首頁概覽</span>
    </Link>
  );
}
