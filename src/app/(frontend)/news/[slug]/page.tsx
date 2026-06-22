import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/shared/JsonLd";
import { NewsLivePreview } from "./NewsLivePreview";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage } from "@/lib/media";
import { SITE_URL, SITE_NAME, absoluteUrl, newsPath } from "@/lib/seo";
import type { News } from "@/payload-types";

type Props = { params: Promise<{ slug: string }> };

// One published-doc query per request, shared by metadata + page.
const getNewsDoc = cache(async (slug: string): Promise<News | null> => {
  return safePayloadQuery<News | null>(async (payload) => {
    const res = await payload.find({
      collection: "news",
      where: { slug: { equals: slug }, status: { equals: "published" } },
      limit: 1,
      depth: 2,
    });
    return res.docs[0] ?? null;
  }, null);
});

export async function generateStaticParams() {
  const slugs = await safePayloadQuery<string[]>(async (payload) => {
    const res = await payload.find({
      collection: "news",
      where: { status: { equals: "published" } },
      limit: 1000,
    });
    return res.docs.map((doc) => doc.slug).filter((s): s is string => Boolean(s));
  }, []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const doc = await getNewsDoc(slug);
  if (!doc) return { title: "找不到文章", robots: { index: false } };

  const path = newsPath(slug);
  const description = doc.excerpt ?? `${SITE_NAME}最新消息 — ${doc.title}`;
  const image = pickImage(doc.featuredImage, "hero");
  const ogImage = image?.url ?? "/og.jpg";

  return {
    title: doc.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE_NAME,
      title: `${doc.title} | ${SITE_NAME}`,
      description,
      url: path,
      type: "article",
      locale: "zh_HK",
      publishedTime: doc.publishDate || undefined,
      modifiedTime: doc.updatedAt,
      images: [{ url: ogImage, alt: image?.alt ?? doc.title, width: image?.width ?? 1200, height: image?.height ?? 630 }],
    },
    twitter: { card: "summary_large_image", title: `${doc.title} | ${SITE_NAME}`, description, images: [ogImage] },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const doc = await getNewsDoc(slug);
  if (!doc) notFound();

  const image = pickImage(doc.featuredImage, "hero");
  const articleUrl = absoluteUrl(newsPath(slug));
  const newsArticleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: doc.title,
    ...(doc.excerpt ? { description: doc.excerpt } : {}),
    ...(doc.publishDate ? { datePublished: doc.publishDate } : {}),
    ...(doc.updatedAt ? { dateModified: doc.updatedAt } : {}),
    ...(image ? { image: [absoluteUrl(image.url)] } : {}),
    inLanguage: "zh-Hant",
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    author: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") },
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "主頁", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "最新消息", item: absoluteUrl("/news") },
      { "@type": "ListItem", position: 3, name: doc.title, item: articleUrl },
    ],
  };

  return (
    <article className="pt-32 pb-24">
      <JsonLd data={newsArticleLd} />
      <JsonLd data={breadcrumbLd} />
      <NewsLivePreview initialDoc={doc} />
    </article>
  );
}
