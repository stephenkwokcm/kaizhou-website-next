import { cache } from "react";
import type { SiteSetting } from "@/payload-types";
import { safePayloadQuery } from "./payload";
import { pickImage, type ImageData } from "./media";

export type SiteInfo = {
  siteName: string;
  /** null = 後台未填寫（隱藏該欄），fallback 時為示範文字 */
  address: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  officeHours: string | null;
  wechatQR: ImageData | null;
  logo: ImageData | null;
  socialLinks: { platform: string; url: string }[];
  footerText: SiteSetting["footerText"] | null;
};

/* PLACEHOLDER — only shown when the database is unreachable */
const FALLBACK: SiteInfo = {
  siteName: "香港開州同鄉會",
  address: "香港九龍尖沙咀彌敦道 ___ 號 ___ 大廈 ___ 樓 ___ 室",
  phone: "(852) 0000 0000",
  fax: "(852) 0000 0000",
  email: "info@kaizhou.hk",
  officeHours: "星期一至五 10:00 – 18:00（公眾假期休息）",
  wechatQR: null,
  logo: null,
  socialLinks: [],
  footerText: null,
};

/**
 * Fetch the `site-settings` global. Wrapped in React `cache()` so the
 * layout, footer and contact page share a single query per request.
 */
export const getSiteSettings = cache(async (): Promise<SiteInfo> => {
  return safePayloadQuery<SiteInfo>(async (payload) => {
    const s = (await payload.findGlobal({ slug: "site-settings" })) as SiteSetting;
    return {
      siteName: s.siteName || FALLBACK.siteName,
      address: s.contactInfo?.address || null,
      phone: s.contactInfo?.phone || null,
      fax: s.contactInfo?.fax || null,
      email: s.contactInfo?.email || null,
      officeHours: s.contactInfo?.officeHours || null,
      wechatQR: pickImage(s.contactInfo?.wechatQR, "thumbnail"),
      logo: pickImage(s.logo, "thumbnail"),
      socialLinks: (s.socialLinks ?? []).map(({ platform, url }) => ({ platform, url })),
      footerText: s.footerText ?? null,
    };
  }, FALLBACK);
});
