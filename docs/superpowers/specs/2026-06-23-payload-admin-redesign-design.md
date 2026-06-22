# Payload Admin Redesign — Design Spec

**Date:** 2026-06-23
**Project:** 香港開州同鄉會 (Hong Kong Kaizhou Association) website — Payload CMS admin
**Stack:** Payload 3.85.0 · Next.js 16 · Postgres · `@payloadcms/richtext-lexical` · Tailwind v4 (public site)

## 1. Goal & context

The Payload admin is functional but reads as "broken/unfriendly" to the association's **non-technical, Chinese-speaking editors**. Investigation found the foundation is fine (admin chrome already renders in 繁體中文 via the existing i18n config; a `custom.scss` is already wired up in `src/app/(payload)/layout.tsx`), but the *content forms* are half-configured and the admin is unbranded.

This redesign makes the admin genuinely usable by a non-technical editor and visually consistent with the public website's brand, **without** changing the public site's behavior (other than additively adding an activity detail page).

### Root causes identified
1. ~93% of fields have no `label`, so Payload shows **English auto-labels** ("Title / Excerpt / Content / Alt / Slug / Order") on a Chinese admin.
2. Flat navigation — no `admin.group`.
3. Lexical defaults to a **hidden floating toolbar** + slash menu; non-technical editors never find formatting.
4. No brand theming applied (and the one `custom.scss` override targets `--color-success-500`, but Payload renders from **`--theme-success-*`**).
5. Generic default dashboard and login — no guidance, no branding.
6. Developer-term fields exposed (`slug`, `alt`, `order`) and free-text where dropdowns belong.

## 2. Decisions locked (with user)

| Area | Decision |
|---|---|
| Dashboard | **Direction B — operational**: 4 stat cards (incl. an 未讀查詢 alert) + two columns (recent content · pending enquiries). Full custom dashboard view. |
| Login | **Centered branded card** on rice-paper. |
| Theme | **Light only**, brand-matched. `admin.theme: 'light'`. |
| Nav | Grouped: **內容 · 媒體・查詢 · 系統**. |
| Editor UX | **Comprehensive** — Chinese labels + help on every field; hide/auto technical fields; dropdowns; image guidance; Enquiries read-only for editors. |
| Rich text | Always-visible toolbar; headings limited to H2/H3; inline image insert. |
| Live preview | **Both News and Activities** (side-by-side). Build the missing public `/activities/[slug]` page. |

### Brand kit (from public site `globals.css`)
- **Colours:** vermillion `#8b2323` (primary) · deep `#6e1a1a` · paper `#f5f0e8` · paper-dark `#ede4d3` · ink `#1a1a1a` / soft `#2c2c2c` · gold `#c5a55a` · stone `#8a857a`.
- **Fonts:** Noto Serif TC (headings) · Noto Sans TC (UI/body).
- **Logo (會徽):** `/public/images/logo.jpg` (circular emblem).

## 3. Design by workstream

### 3.1 Branding & light theme
**Files:** `src/payload.config.ts`, `src/app/(payload)/custom.scss`, `src/app/(payload)/layout.tsx`

- `admin.theme: 'light'`.
- In `custom.scss`, override the **runtime** theme variables (not `--color-*`):
  - `--theme-success-500/600` → `#8b2323` / `#6e1a1a` (primary action/brand colour).
  - Background/elevation toward warm paper (`--theme-bg`, low elevations toward `#f5f0e8`/`#fffdf8`), borders toward `#e0d5bf`.
  - `--font-body` → Noto Sans TC stack; gold (`#c5a55a`) for subtle accents; slightly larger `--style-radius-*`.
- Replace the current `--color-success-500` override (ineffective at runtime).
- **CJK font:** load Noto Sans TC + Noto Serif TC in the `(payload)` layout (via `next/font/google`, mirroring the frontend) or `@font-face`, and reference them from `--font-body` / heading rules.
- `admin.components.graphics.Logo` → `src/components/admin/Logo.tsx` (large 會徽 for login).
- `admin.components.graphics.Icon` → `src/components/admin/Icon.tsx` (small emblem for nav header).
- `admin.meta`: keep `titleSuffix`; add `description: '香港開州同鄉會內容管理系統'` and admin `icons`.

### 3.2 Grouped navigation
Add `admin.group` (localized object `{ 'zh-TW': '…', en: '…' }`) to each collection/global:
- **內容 (Content):** News, Activities, CommitteeMembers
- **媒體・查詢 (Media & Enquiries):** Media, Enquiries
- **系統 (System):** Users, SiteSettings

### 3.3 Field localization + structural fixes
Add Chinese `label` + `admin.description` to **every** field below. Selects keep code-or-existing values; only labels change. Tables list the target label, help text, and any structural change.

**News** (group 內容)
| Field | Label | Help (admin.description) | Change |
|---|---|---|---|
| title | 標題 | — | required |
| slug | 網址名稱 | 留空會自動從標題產生，一般無須修改 | **`admin.hidden: true`** (still auto-generates via existing hook) |
| publishDate | 發佈日期 | 留空預設為今天 | sidebar |
| status | 狀態 | — | options already 草稿/已發佈 |
| featuredImage | 封面圖片 | 建議尺寸 1920×1080 以上；JPG／PNG／WebP | |
| excerpt | 摘要 | 列表與分享預覽顯示的簡短描述，約 100–150 字 | |
| content | 內文 | 文章正文。用上方工具列設定標題、粗體、清單、插入圖片 | |

**Activities** (group 內容)
| Field | Label | Help | Change |
|---|---|---|---|
| title | 標題 | — | required |
| slug | 網址名稱 | 留空會自動產生 | `admin.hidden: true` |
| eventDate | 活動日期 | — | sidebar, required |
| eventType | 活動類型 | — | options already 活動預告/活動回顧 |
| location | 地點 | 場地名稱或地址，例：香港灣仔會議展覽中心 | |
| featuredImage | 封面圖片 | 建議尺寸 1920×1080 以上 | |
| description | 活動內容 | 詳述活動內容、流程、參加者等 | |
| gallery | 活動相片 | 上傳活動相片（建議 5–20 張） | nested `image` → 圖片 |

**CommitteeMembers** (group 內容)
| Field | Label | Help | Change |
|---|---|---|---|
| name | 姓名 | — | required |
| title | 職銜 | 從清單選擇職銜 | **text → select**: 會長/副會長/秘書長/副秘書長/財務/常務理事/理事/監事/顧問 |
| order | 顯示順序 | 數字越小越靠前（例：會長 1、副會長 2）。預設 100 | sidebar |
| isCurrent | 現任成員 | 勾選＝現任；取消＝已卸任（仍保留記錄） | sidebar |
| photo | 相片 | 人像相片，建議直度 400×500 以上 | |
| bio | 簡介 | 個人簡介，約 50–150 字 | |

**Media** (group 媒體・查詢)
| Field | Label | Help | Change |
|---|---|---|---|
| **title** (new) | 名稱 | 方便在媒體庫辨識的名稱 | **new field** + `admin.useAsTitle: 'title'` |
| alt | 替代文字 | 供螢幕閱讀器朗讀；簡述圖片內容，例：理事會成員合照 | |

Collection description: 網站所有圖片集中於此管理。

**Enquiries** (group 媒體・查詢)
| Field | Label | Help | Change |
|---|---|---|---|
| name | 姓名 | — | |
| email | 電郵 | — | |
| phone | 電話 | — | |
| message | 查詢內容 | — | |
| readStatus | 已讀 | 勾選表示已處理此查詢 | sidebar |

**Access:** public form submissions must keep working; in the **admin** editors get a read-focused view — hide the manual "create" action and restrict create. *Mechanism finalized in the plan after confirming the public contact form's submission path (so it isn't broken).* Consider `admin.hideAPIURL: true`.

**SiteSettings** (group 系統)
| Field | Label | Help | Change |
|---|---|---|---|
| siteName | 網站名稱 | — | |
| logo | 標誌 | SVG 或 PNG，建議 200×200 以上 | |
| sealImage | 印章 | 官方印章圖案（PNG 透明背景，約 400×400） | |
| contactInfo (group) | 聯絡資訊 | — | |
| › address | 地址 | 此欄支援多語言 | stays `localized` |
| › phone | 電話 | — | |
| › fax | 傳真 | — | |
| › email | 電郵 | — | |
| › officeHours | 辦公時間 | (keep existing example) | |
| › wechatQR | 微信二維碼 | 約 300×300 PNG | |
| socialLinks (array) | 社交媒體連結 | — | |
| › platform | 平台 | — | **text → select**: Facebook/WeChat/Instagram/YouTube/Threads/小紅書/LinkedIn |
| › url | 連結網址 | 完整網址，含 https:// | |

**Users** (group 系統)
| Field | Label | Help | Change |
|---|---|---|---|
| email | 電郵 | — | |
| name | 姓名 | — | |
| roles | 角色 | — | option labels → 管理員 / 編輯 (values stay admin/editor) |

> **Select value/data note:** existing rows for `CommitteeMembers.title` and `socialLinks.platform` hold free text. To avoid a forced migration we either (a) set option **values** to the existing strings, or (b) run a tiny one-off backfill after deploy. Member/social counts are small; finalize in the plan.

### 3.4 Friendly rich-text editor
**File:** `src/payload.config.ts` (root `editor`)
```
editor: lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    FixedToolbarFeature(),                                   // always-visible toolbar
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),   // H1 reserved for page title
    UploadFeature({ collections: { media: { fields: [{ name: 'caption', type: 'text', label: { 'zh-TW': '圖片說明', en: 'Caption' } }] } } }),
  ],
})
```
Applies to News `content`, Activities `description`, SiteSettings `footerText`. UI localizes to zh-TW automatically. (If the footer should be simpler, give it a minimal per-field editor — optional.)

### 3.5 Custom dashboard (Direction B)
**Files:** `src/payload.config.ts` (`admin.components.views.dashboard`), `src/components/admin/Dashboard.tsx` (+ small presentational subcomponents/CSS).

React **Server** Component using the Payload local API (`getPayload`). Renders:
- **4 stat cards:** 未讀查詢 (count where `readStatus` not true; vermillion alert style) · 最新消息 (news count) · 會務活動 (activities count) · 理事會成員 (committee count).
- **Recent content** column: latest News + Activities merged, sorted by `updatedAt`, top ~5, each linking to its edit view; header has a 撰寫消息 / 新增活動 link.
- **Pending enquiries** column: latest unread Enquiries, top ~5, linking to the entry.
- Branded with the light/paper/vermillion palette (scoped classes in `custom.scss` or a co-located module).

### 3.6 Branded login
**Files:** `src/components/admin/BeforeLogin.tsx` (`admin.components.beforeLogin`), `Logo.tsx` (from 3.1), `custom.scss`.
- `graphics.Logo` shows the 會徽; `BeforeLogin` adds 香港開州同鄉會 (serif) + 內容管理系統 subtitle + English name.
- `custom.scss` centers and brands the login card (paper background, gold top-border, vermillion 登入 button) — matching login mock 風格 1.

### 3.7 Live preview (News + Activities)
**Files:** `src/payload.config.ts` (`admin.livePreview`), `src/app/(frontend)/news/[slug]/` (add client wrapper), **new** `src/app/(frontend)/activities/[slug]/` (page + wrapper), `src/app/(frontend)/activities/page.tsx` (link items to detail), `package.json` (add `@payloadcms/live-preview-react`).

- `admin.livePreview`: `{ collections: ['news','activities'], url: ({ data, collectionConfig }) => \`${NEXT_PUBLIC_SITE_URL}/${'news'|'activities'}/${data.slug}\`, breakpoints: [mobile/tablet/desktop] }`.
- **News:** existing server page fetches the doc; introduce a client component that calls `useLivePreview({ initialData, serverURL, depth })` and renders the article body, so the iframe updates live.
- **Activities:** build `/activities/[slug]/page.tsx` (server fetch by slug) + matching client live-preview wrapper, reusing the news pattern and the site's existing layout/components. Update the activities list to link to detail pages.
- Keep all public changes **additive**; do not alter existing SSR output paths.

### 3.8 Cross-cutting
- Regenerate import map (`payload generate:importmap`) after adding any custom component (Logo, Icon, Dashboard, BeforeLogin) — required, or components 404.
- Regenerate types (`payload generate:types`).
- `db:push` for the new `Media.title` column (dev auto-syncs; prod uses the existing one-off push).
- No new env vars.

## 4. Data flow & schema

- **Dashboard / live preview:** server-side reads via Payload local API; live preview streams editor form state into the public page over `postMessage` (handled by `useLivePreview`).
- **Schema change:** only `Media.title` (new text column). Rich-text feature changes need no migration (stored as JSON). Text→select changes reuse the existing column type.
- **Migration:** none forced; optional small backfill for select fields if any stored value is outside the option list.

## 5. Testing & verification

No test suite exists, and the work is overwhelmingly config / CSS / RSC. Verification = automated build checks + a manual checklist.

**Automated:** `pnpm`/`npm run build` (Next + Payload) clean; `payload generate:types` and `payload generate:importmap` run without error; TypeScript passes.

**Manual checklist (admin):**
- [ ] Login page shows centered branded card (會徽 + 會名), vermillion button.
- [ ] Nav grouped 內容 / 媒體・查詢 / 系統; light theme with vermillion accents throughout.
- [ ] Every collection/global: all field labels + help text in 繁體中文; no English auto-labels; `slug` hidden.
- [ ] Rich text shows an always-visible toolbar; can set H2/H3, bold, lists, and **insert an image** inline.
- [ ] Dashboard shows real counts + recent content + pending enquiries; 新增 links work.
- [ ] CommitteeMembers 職銜 and socialLinks 平台 are dropdowns; existing data still displays.
- [ ] Live preview opens for a News post **and** an Activity, and updates as you type.
- [ ] Enquiries: no manual "create" button for editors; existing entries readable; 已讀 toggle works.

**Manual checklist (public site — no regressions):**
- [ ] Contact form still submits and creates an Enquiry.
- [ ] `/news/[slug]` renders as before; new `/activities/[slug]` renders; activities list links to it.

## 6. Risks & gotchas
- **Import map:** forgetting to regenerate after adding components → "component not found". 
- **Wrong CSS var:** must override `--theme-success-*` (runtime), not `--color-success-*`.
- **Live preview touches public pages** — keep additive; verify SSR still works without the admin.
- **Enquiries access** must not block public form submissions — confirm submission path first.
- **CJK admin font** must actually load in the `(payload)` route (separate from frontend).
- **Select migration** — pick value strategy to avoid breaking existing rows.

## 7. Out of scope (YAGNI)
- Dark mode (explicitly light-only).
- A fully custom `Nav` component (using `admin.group` instead).
- New public multi-language content beyond the existing localized `address`.
- New collections or fields beyond `Media.title` and the activities detail page.
- Analytics, custom providers, account-view replacement.

## 8. Suggested implementation order (for the plan)
1. Theme/branding: `custom.scss` + `admin.theme: 'light'` + Logo/Icon + meta (visible quick win).
2. Nav grouping + field localization + structural fixes (per collection) + Media `title` + Enquiries access.
3. Friendly Lexical editor config.
4. Branded login (BeforeLogin + CSS).
5. Custom dashboard component.
6. Live preview: News client wrapper → new Activities detail page → `admin.livePreview` config.
7. Regenerate import map + types, `db:push`, run full verification checklist.
