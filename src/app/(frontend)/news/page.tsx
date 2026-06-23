import type { Metadata } from "next";
import Link from "next/link";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { MediaImage } from "@/components/shared/MediaImage";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage, type ImageData } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { formatDateZh } from "@/lib/format";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata: Metadata = pageMetadata(
  "最新消息",
  "香港開州同鄉會最新消息與會務公告，包括會務動態、兩地交流及社區活動資訊。",
  "/news",
);

type NewsItem = {
  id: string | number;
  title: string;
  excerpt?: string;
  publishDate: string;
  slug?: string;
  image?: ImageData | null;
};

export default async function NewsPage() {
  const news = await safePayloadQuery<NewsItem[]>(async (payload) => {
    const res = await payload.find({
      collection: "news",
      limit: 24,
      sort: "-publishDate",
      where: { status: { equals: "published" } },
    });
    return res.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      excerpt: doc.excerpt ?? undefined,
      publishDate: doc.publishDate ?? "",
      slug: doc.slug ?? undefined,
      image: pickImage(doc.featuredImage, "card"),
    }));
  }, []);

  return (
    <article className="pt-32 pb-24">
      <section className="container-page">
        <RevealOnScroll>
          <p className="font-sans-zh text-xs tracking-[0.4em] uppercase text-vermillion mb-4">
            Latest News
          </p>
          <SectionTitle zh="最新消息" en="Association News & Announcements" seal="新聞" />
        </RevealOnScroll>

        {news.length === 0 && <EmptyState message="暫無最新消息" />}

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item, idx) => (
            <RevealOnScroll key={item.id} delay={(idx % 3) * 0.08}>
              <Link
                href={item.slug ? `/news/${item.slug}` : "#"}
                className="group block"
              >
                <MediaImage image={item.image} aspectRatio="4 / 3" label="新聞圖片" className="mb-5" />
                <div className="font-sans-zh text-xs tracking-widest text-stone mb-2">
                  {formatDateZh(item.publishDate)}
                </div>
                <h2 className="font-serif-zh text-xl text-ink leading-snug group-hover:text-vermillion transition-colors mb-3">
                  {item.title}
                </h2>
                {item.excerpt && (
                  <p className="font-serif-zh text-sm text-ink-soft/80 leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                )}
                <div className="mt-4 inline-flex items-center gap-2 font-sans-zh text-xs tracking-widest text-vermillion opacity-0 group-hover:opacity-100 transition-opacity">
                  閱讀全文 →
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </article>
  );
}
