import type { Metadata } from "next";
import Link from "next/link";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { MediaImage } from "@/components/shared/MediaImage";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage, type ImageData } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";

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

/* PLACEHOLDER */
const FALLBACK: NewsItem[] = [
  { id: 1, title: "本會理事會換屆選舉圓滿舉行", excerpt: "第十二屆理事會於本月選出，新任會長對未來會務發展提出五年規劃。", publishDate: "2026-04-08" },
  { id: 2, title: "重慶開州區政府代表團訪港", excerpt: "代表團與本會就教育、商貿、文化交流等議題進行深入交流。", publishDate: "2026-03-22" },
  { id: 3, title: "2026 春茗聯歡晚宴順利舉辦", excerpt: "逾三百位鄉親出席，會長致辭時回顧過去一年會務成就。", publishDate: "2026-02-15" },
  { id: 4, title: "本會獎學金計劃頒獎典禮舉行", excerpt: "本年度共有 28 位同學獲得本會獎學金，總金額逾港幣三十萬元。", publishDate: "2026-01-30" },
  { id: 5, title: "歲末關懷探訪長者活動", excerpt: "理事們親臨多個長者中心，為旅港鄉親長者送上節日祝福與慰問品。", publishDate: "2025-12-20" },
  { id: 6, title: "開州區政協主席率團蒞港訪問", excerpt: "代表團一行十二人於本月訪港，與本會理事舉行座談交流。", publishDate: "2025-11-18" },
];

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

  const items = news.length > 0 ? news : FALLBACK;
  const isPlaceholder = news.length === 0;

  return (
    <article className="pt-32 pb-24">
      <section className="container-page">
        <RevealOnScroll>
          <p className="font-sans-zh text-xs tracking-[0.4em] uppercase text-vermillion mb-4">
            Latest News
          </p>
          <SectionTitle zh="最新消息" en="Association News & Announcements" seal="新聞" />
        </RevealOnScroll>

        {isPlaceholder && (
          <RevealOnScroll delay={0.1}>
            <p className="mt-6 text-xs font-sans-zh text-stone italic">
              {/* PLACEHOLDER */}* 以下為示範內容，真實新聞將由 CMS 後台發佈。
            </p>
          </RevealOnScroll>
        )}

        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => (
            <RevealOnScroll key={item.id} delay={(idx % 3) * 0.08}>
              <Link
                href={item.slug ? `/news/${item.slug}` : "#"}
                className="group block"
              >
                <MediaImage image={item.image} aspectRatio="4 / 3" label="新聞圖片" className="mb-5" />
                <div className="font-sans-zh text-xs tracking-widest text-stone mb-2">
                  {formatDate(item.publishDate)}
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
