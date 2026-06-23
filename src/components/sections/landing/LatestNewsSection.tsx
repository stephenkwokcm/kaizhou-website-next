import Link from "next/link";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { MediaImage } from "@/components/shared/MediaImage";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage, type ImageData } from "@/lib/media";
import { formatDateZh } from "@/lib/format";
import { EmptyState } from "@/components/shared/EmptyState";

type NewsCard = {
  id: string | number;
  title: string;
  excerpt?: string;
  publishDate: string;
  slug?: string;
  image?: ImageData | null;
};

export async function LatestNewsSection() {
  const news = await safePayloadQuery<NewsCard[]>(async (payload) => {
    const res = await payload.find({
      collection: "news",
      limit: 3,
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
    <section className="bg-paper-dark/40 py-24">
      <div className="container-page">
        <RevealOnScroll className="flex items-end justify-between gap-6 mb-12">
          <SectionTitle zh="最新消息" en="Latest News" seal="新聞" />
          <Link
            href="/news"
            className="group hidden md:inline-flex items-center gap-2 font-sans-zh text-sm tracking-widest text-vermillion hover:gap-4 transition-all"
          >
            查看全部 <span>→</span>
          </Link>
        </RevealOnScroll>

        {news.length === 0 && <EmptyState message="暫無最新消息" />}

        <div className="grid gap-8 md:grid-cols-3">
          {news.map((item, idx) => (
            <RevealOnScroll key={item.id} delay={idx * 0.1}>
              <Link
                href={item.slug ? `/news/${item.slug}` : "/news"}
                className="group block"
              >
                <MediaImage image={item.image} aspectRatio="4 / 3" label="新聞圖片" className="mb-5" />
                <div className="font-sans-zh text-xs tracking-widest text-stone mb-2">
                  {formatDateZh(item.publishDate)}
                </div>
                <h3 className="font-serif-zh text-xl text-ink leading-snug group-hover:text-vermillion transition-colors mb-3">
                  {item.title}
                </h3>
                {item.excerpt && (
                  <p className="font-serif-zh text-sm text-ink-soft/80 leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                )}
              </Link>
            </RevealOnScroll>
          ))}
        </div>

        <div className="md:hidden mt-10 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 font-sans-zh text-sm tracking-widest text-vermillion"
          >
            查看全部 →
          </Link>
        </div>
      </div>
    </section>
  );
}
