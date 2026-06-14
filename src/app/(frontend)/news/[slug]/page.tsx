import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { richTextConverters } from "@/lib/richtext-converters";
import { MediaImage } from "@/components/shared/MediaImage";
import { InkDivider } from "@/components/shared/InkDivider";
import { JsonLd } from "@/components/shared/JsonLd";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage, type ImageData } from "@/lib/media";
import { SITE_URL, SITE_NAME, absoluteUrl, newsPath } from "@/lib/seo";
import type { News } from "@/payload-types";

type Props = { params: Promise<{ slug: string }> };

type Article = {
  title: string;
  publishDate: string;
  updatedAt?: string;
  excerpt?: string;
  content?: News["content"];
  image?: ImageData | null;
};

// Shared between generateMetadata and the page — one query per request.
const getArticle = cache(async (slug: string): Promise<Article | null> => {
  return safePayloadQuery<Article | null>(async (payload) => {
    const res = await payload.find({
      collection: "news",
      where: { slug: { equals: slug }, status: { equals: "published" } },
      limit: 1,
    });
    const doc = res.docs[0];
    if (!doc) return null;
    return {
      title: doc.title,
      publishDate: doc.publishDate ?? "",
      updatedAt: doc.updatedAt,
      excerpt: doc.excerpt ?? undefined,
      content: doc.content,
      image: pickImage(doc.featuredImage, "hero"),
    };
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
  const article = await getArticle(slug);
  if (!article) return { title: "找不到文章", robots: { index: false } };

  const path = newsPath(slug);
  const description = article.excerpt ?? `${SITE_NAME}最新消息 — ${article.title}`;
  const ogImage = article.image?.url ?? "/og.jpg";

  return {
    title: article.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE_NAME,
      title: `${article.title} | ${SITE_NAME}`,
      description,
      url: path,
      type: "article",
      locale: "zh_HK",
      publishedTime: article.publishDate || undefined,
      modifiedTime: article.updatedAt,
      images: [
        {
          url: ogImage,
          alt: article.image?.alt ?? article.title,
          width: article.image?.width ?? 1200,
          height: article.image?.height ?? 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | ${SITE_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  // Route params arrive percent-encoded; slugs are stored raw (incl. Chinese).
  const slug = decodeURIComponent((await params).slug);
  const article = await getArticle(slug);

  if (!article) notFound();

  const articleUrl = absoluteUrl(newsPath(slug));
  const newsArticleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    ...(article.excerpt ? { description: article.excerpt } : {}),
    ...(article.publishDate ? { datePublished: article.publishDate } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    ...(article.image ? { image: [absoluteUrl(article.image.url)] } : {}),
    inLanguage: "zh-Hant",
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    // Inlined (not @id refs): Google's Article guidance expects publisher
    // name + logo resolvable within the same JSON-LD block.
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
      { "@type": "ListItem", position: 3, name: article.title, item: articleUrl },
    ],
  };

  return (
    <article className="pt-32 pb-24">
      <JsonLd data={newsArticleLd} />
      <JsonLd data={breadcrumbLd} />
      <div className="container-page max-w-3xl">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 font-sans-zh text-xs tracking-widest text-vermillion hover:gap-4 transition-all mb-8"
        >
          ← 返回新聞列表
        </Link>

        <p className="font-sans-zh text-xs tracking-widest text-stone mb-4">
          {formatDate(article.publishDate)}
        </p>
        <h1 className="font-calligraphy text-4xl md:text-5xl text-ink leading-tight mb-8">
          {article.title}
        </h1>

        <MediaImage
          image={article.image}
          aspectRatio="16 / 9"
          label="專題圖片"
          className="mb-10"
          sizes="(min-width: 768px) 768px, 100vw"
        />

        {article.excerpt && (
          <p className="font-serif-zh text-xl leading-[2] text-ink-soft/90 border-l-4 border-vermillion pl-6 mb-10">
            {article.excerpt}
          </p>
        )}

        <div className="font-serif-zh text-lg leading-[2] text-ink-soft prose-content [&_p]:mb-6 [&_h2]:font-calligraphy [&_h2]:text-3xl [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-serif-zh [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-vermillion [&_blockquote]:pl-6 [&_a]:text-vermillion [&_a]:underline">
          {article.content ? (
            <RichText
              converters={richTextConverters}
              data={article.content as SerializedEditorState}
            />
          ) : (
            <p className="text-stone italic text-sm">（本文暫無內文）</p>
          )}
        </div>

        <InkDivider />

        <Link
          href="/news"
          className="inline-flex items-center gap-2 font-sans-zh text-xs tracking-widest text-vermillion"
        >
          ← 返回新聞列表
        </Link>
      </div>
    </article>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
