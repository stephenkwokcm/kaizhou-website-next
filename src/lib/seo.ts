import type { Metadata } from "next";

/**
 * Single source of truth for SEO constants. The production domain is set
 * via NEXT_PUBLIC_SITE_URL — every canonical URL, OG URL, sitemap entry
 * and JSON-LD id derives from it.
 */
const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!rawSiteUrl && process.env.NODE_ENV === "production") {
  throw new Error("NEXT_PUBLIC_SITE_URL must be set in production.");
}
export const SITE_URL = (rawSiteUrl || "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "香港開州同鄉會";
export const SITE_NAME_EN = "Hong Kong Kaizhou Association";

export const SITE_DESCRIPTION =
  "香港開州同鄉會 — 連繫旅港鄉親、傳承家鄉文化、促進香港與重慶開州的兩地交流。";

/** Resolve a site-relative path to an absolute URL. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Canonical path for a news article (slugs may contain Chinese). */
export function newsPath(slug: string): string {
  return `/news/${encodeURIComponent(slug)}`;
}

/**
 * Standard metadata for a static page: unique title/description, canonical
 * URL and matching Open Graph / Twitter tags. (Page-level `openGraph`
 * replaces the layout's wholesale, so images must be restated here.)
 */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      type: "website",
      locale: "zh_HK",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${SITE_NAME} ${SITE_NAME_EN}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: ["/og.jpg"],
    },
  };
}
