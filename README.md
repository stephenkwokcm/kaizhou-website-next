# 香港開州同鄉會 — Hong Kong Kaizhou Fellow Townsmen Association

Bilingual (zh-Hant / en) Next.js 16 + Payload CMS 3 website for the 香港開州同鄉會, designed in a traditional Chinese ink-wash (水墨) aesthetic.

## Stack

- **Next.js 16.2.9** (App Router, Turbopack)
- **Payload CMS 3.85** with PostgreSQL (Supabase) adapter
- **Tailwind CSS 4** (CSS-first `@theme` config)
- **Framer Motion** for parallax + scroll-triggered reveals
- Fonts: `Noto Serif TC` (body), `Ma Shan Zheng` (calligraphy), `Noto Sans TC` (UI)

## Getting started

```bash
pnpm install
# 1. Edit .env.local — set DATABASE_URL to a real Supabase Postgres URL, set PAYLOAD_SECRET to a long random string
pnpm dev
```

Then open:

- `http://localhost:3000` — public site
- `http://localhost:3000/admin` — Payload admin (creates the first user on first visit)

## Deploying to production

Work through this checklist before the first production deploy. Items 1–4 are
required; skipping them will break auth, SEO, abuse protection, or lock you out
of the admin panel.

### 1. Environment variables (set at **build** *and* runtime)

| Variable | Notes |
|---|---|
| `PAYLOAD_SECRET` | Long random string. Boot **hard-fails** if missing — it must be set. |
| `DATABASE_URL` | Production Postgres connection string. Boot hard-fails if missing. |
| `NEXT_PUBLIC_SITE_URL` | Production value: `https://kaizhou.hk`. **Inlined at build time** into canonical/sitemap/OG tags and the Payload `serverURL`/CORS/CSRF allowlist, so it must be set in the build environment, not just at runtime. The build hard-fails if it is unset, but **not** if it is wrong — double-check the value (don't ship `localhost`). |

### 2. Back-fill admin roles (only for a DB that already has users)

Access control is role-based: a user needs `roles` containing `admin` to reach
`/admin` or manage content. A **fresh** database is fine — the first user
created via `/admin/create-first-user` is granted `["admin"]` automatically.

For a database that **already has users** (e.g. migrated from an earlier build),
back-fill them or they'll be locked out. The `roles` of a `hasMany` select live
in a separate table:

```sql
INSERT INTO users_roles ("order", parent_id, value)
SELECT 1, u.id, 'admin'::enum_users_roles FROM users u
WHERE NOT EXISTS (SELECT 1 FROM users_roles r WHERE r.parent_id = u.id);
```

### 3. Run behind a trusted reverse proxy

The contact endpoint (`/api/contact-submit`) rate-limits per client IP read from
`X-Forwarded-For`. Deploy behind a proxy/CDN that **overwrites** that header with
the real peer address — otherwise the header is client-spoofable and the limit
can be bypassed.

### 4. Smoke-test after deploy

- Load `/admin` and confirm the panel works (the admin Content-Security-Policy is
  scoped to allow the lexical/React bundle, but verify against the live deploy).
- Submit the contact form on `/contact` and confirm it lands in the `enquiries`
  collection.

### Security posture (already enforced in code)

- **Security headers + CSP** on every route (`next.config.ts`) — strict CSP for
  the public site, a looser one scoped to `/admin`.
- **RBAC** on `users` with self-elevation blocked; **SVG uploads blocked** + 5 MB
  upload cap; **rich-text link hrefs sanitized** against `javascript:`/`data:`.
- **Secure auth cookies** in production; CORS/CSRF locked to `NEXT_PUBLIC_SITE_URL`.
- `pnpm audit` is clean (transitive advisories pinned via `pnpm.overrides`).

> **Email is intentionally not configured** (no SMTP available). `payload.config.ts`
> has no `email` adapter, so the admin **"Forgot password" link won't deliver an
> email**. With only a few admins this is fine — manage credentials directly
> instead: create the first admin via `/admin/create-first-user`, and reset a
> password later through the Payload Local API (a short `payload run` script that
> calls `payload.update({ collection: 'users', id, data: { password } })`). If you
> ever get an email provider, you don't need to run your own server — most hand you
> SMTP credentials or an API key, and adding `@payloadcms/email-nodemailer` is a
> ~5-line change.

## Pages

| Path | Purpose |
|---|---|
| `/` | Landing — hero, latest news, upcoming events, hometown showcase |
| `/about` | 關於我們 — mission, committee, history |
| `/hometown` | 家鄉開州 — 1800 years of history, 劉伯承, 三峽庫區, photo gallery |
| `/news` | 最新消息 list (paginated) |
| `/news/[slug]` | News article detail |
| `/activities` | 會務活動 — upcoming + past |
| `/contact` | 聯絡我們 — contact form posts to `enquiries` collection |
| `/admin` | Payload admin panel |

## Payload collections

- `news` — articles (localized title/excerpt/content)
- `activities` — upcoming/past events with image gallery
- `committee-members` — 理事會 directory
- `enquiries` — contact form submissions (admin-only read)
- `media` — uploads
- `users` — admin auth

Plus `site-settings` global for site-wide config (logo, contact info, social links).

## Design tokens

| Token | Value | Purpose |
|---|---|---|
| `--color-paper` | `#F5F0E8` | 宣紙色 — primary background |
| `--color-ink` | `#1A1A1A` | Ink black — contrast sections |
| `--color-vermillion` | `#8B2323` | 朱紅 — seals, accents |
| `--color-gold` | `#C5A55A` | Decorative gold |
| `--color-text` | `#2C2C2C` | Body text on light bg |

## Project structure

```
src/
  app/
    (frontend)/      # Public site
    (payload)/       # Payload admin + REST/GraphQL API
  collections/       # News, Activities, CommitteeMembers, Enquiries, Media, Users
  globals/           # SiteSettings
  components/
    layout/          # Header, MobileNav, Footer
    sections/        # Landing page sections
    shared/          # SealStamp, InkDivider, Placeholder, SectionTitle, RevealOnScroll
  lib/               # Payload client helper, cn()
  payload.config.ts
public/
  images/kaizhou/    # 12 photos of 開州 (resized + renamed)
```

## Replacing placeholder content

Every block of placeholder Chinese copy is marked with a `{/* PLACEHOLDER */}` comment in the source — search the codebase for that string to find everything that still needs real client copy.
