import type { MetadataRoute } from "next";
import { safePayloadQuery } from "@/lib/payload";
import { absoluteUrl, newsPath } from "@/lib/seo";

// Regenerate hourly so articles published in the CMS reach the sitemap
// without a redeploy (this file sits outside the (frontend) ISR segment).
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/hometown"), changeFrequency: "yearly", priority: 0.6 },
    { url: absoluteUrl("/news"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/activities"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
  ];

  const newsRoutes = await safePayloadQuery<MetadataRoute.Sitemap>(async (payload) => {
    const res = await payload.find({
      collection: "news",
      where: { status: { equals: "published" } },
      sort: "-publishDate",
      limit: 1000,
    });
    return res.docs
      .filter((doc) => Boolean(doc.slug))
      .map((doc) => ({
        url: absoluteUrl(newsPath(doc.slug as string)),
        lastModified: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
  }, []);

  return [...staticRoutes, ...newsRoutes];
}
