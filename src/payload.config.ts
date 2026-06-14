import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
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
    user: Users.slug,
    meta: {
      titleSuffix: " — 香港開州同鄉會",
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  editor: lexicalEditor(),
  // Admin UI language: default to Traditional Chinese (繁體中文); keep English available.
  i18n: {
    supportedLanguages: { "zh-TW": zhTw, en },
    fallbackLanguage: "zh-TW",
  },
  collections: [Users, Media, News, Activities, CommitteeMembers, Enquiries],
  globals: [SiteSettings],
  secret: PAYLOAD_SECRET,
  // Reject uploads larger than 5MB (defense-in-depth alongside Media mimeTypes allowlist).
  // abortOnLimit makes the server reject oversized files (HTTP 413) instead of
  // silently truncating them.
  upload: {
    limits: {
      fileSize: 5_000_000,
    },
    abortOnLimit: true,
  },
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: DATABASE_URL,
    },
  }),
  sharp,
});
