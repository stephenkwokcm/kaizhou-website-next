import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  lexicalEditor,
  FixedToolbarFeature,
  HeadingFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import { en } from "@payloadcms/translations/languages/en";
import { zhTw } from "@payloadcms/translations/languages/zhTw";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { News } from "./collections/News";
import { Activities } from "./collections/Activities";
import { CommitteeMembers } from "./collections/CommitteeMembers";
import { Enquiries } from "./collections/Enquiries";
import { SiteSettings } from "./globals/SiteSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET;
const DATABASE_URL = process.env.DATABASE_URL;
if (!PAYLOAD_SECRET || !DATABASE_URL) {
  throw new Error("Missing required env vars: PAYLOAD_SECRET and DATABASE_URL must be set.");
}

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL,
  cors: [process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean) as string[],
  csrf: [process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean) as string[],
  admin: {
    theme: "light",
    user: Users.slug,
    // Use Payload's built-in default avatar instead of Gravatar (which renders
    // a broken image when the account has no Gravatar / is offline).
    avatar: "default",
    meta: {
      titleSuffix: " — 香港開州同鄉會",
      description: "香港開州同鄉會內容管理系統",
    },
    components: {
      graphics: {
        Logo: "/components/admin/Logo",
        Icon: "/components/admin/Icon",
      },
      beforeLogin: ["/components/admin/BeforeLogin"],
      beforeNavLinks: ["/components/admin/NavHome"],
      views: {
        dashboard: { Component: "/components/admin/Dashboard" },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
      UploadFeature({
        collections: {
          media: {
            fields: [
              { name: "caption", type: "text", label: { "zh-TW": "圖片說明", en: "Caption" } },
            ],
          },
        },
      }),
    ],
  }),
  // Admin UI language: default to Traditional Chinese (繁體中文); keep English available.
  i18n: {
    supportedLanguages: { "zh-TW": zhTw, en },
    fallbackLanguage: "zh-TW",
  },
  // Order drives the admin nav: content first (the editor's daily work),
  // media/enquiries next, admin-only (Users) last.
  collections: [News, Activities, CommitteeMembers, Media, Enquiries, Users],
  globals: [SiteSettings],
  secret: PAYLOAD_SECRET,
  // Reject uploads larger than 12MB (defense-in-depth alongside Media mimeTypes
  // allowlist) — generous enough for typical phone/camera photos, while still
  // bounded. Must stay BELOW next.config's serverActions.bodySizeLimit (20MB)
  // so the Next Server Action doesn't reject the upload before Payload can.
  // abortOnLimit makes the server reject oversized files (HTTP 413) instead of
  // silently truncating them.
  upload: {
    limits: {
      fileSize: 12_000_000,
    },
    abortOnLimit: true,
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    // Auto-sync the schema in development. In production it stays OFF so the
    // running app never mutates the schema — run the one-off `db:push` script
    // (PAYLOAD_DB_PUSH=true, via the full build image) to create/update it.
    push:
      process.env.NODE_ENV !== "production" ||
      process.env.PAYLOAD_DB_PUSH === "true",
    pool: {
      connectionString: DATABASE_URL,
    },
  }),
  sharp,
});
