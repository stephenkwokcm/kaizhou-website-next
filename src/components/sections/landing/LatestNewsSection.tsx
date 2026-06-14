import Link from "next/link";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { MediaImage } from "@/components/shared/MediaImage";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage, type ImageData } from "@/lib/media";

type NewsCard = {
  id: string | number;
  title: string;
  excerpt?: string;
  publishDate: string;
  slug?: string;
  image?: ImageData | null;
};

/* PLACEHOLDER */
const FALLBACK_NEWS: NewsCard[] = [
  {
    id: "p1",
    title: "本會首屆理事會正式成立",
    excerpt: "首屆理事會於本月選出，會長對未來會務發展提出規劃，期望帶領同鄉會穩步啟航。",
    publishDate: "2026-04-08",
    slug: "#",
  },
  {
    id: "p2",
    title: "重慶開州區政府代表團訪港",
    excerpt: "代表團與本會就教育、商貿、文化交流等議題進行深入交流，並參觀本會會址。",
    publishDate: "2026-03-22",
    slug: "#",
  },
  {
    id: "p3",
    title: "2026 春茗聯歡晚宴順利舉辦",
    excerpt: "逾百位鄉親出席春茗，會長致辭時展望本會未來發展，並感謝各界人士的鼎力支持。",
    publishDate: "2026-02-15",
    slug: "#",
  },
];

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

  const items = news.length > 0 ? news : FALLBACK_NEWS;

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

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, idx) => (
            <RevealOnScroll key={item.id} delay={idx * 0.1}>
              <Link
                href={item.slug ? `/news/${item.slug}` : "/news"}
                className="group block"
              >
                <MediaImage image={item.image} aspectRatio="4 / 3" label="新聞圖片" className="mb-5" />
                <div className="font-sans-zh text-xs tracking-widest text-stone mb-2">
                  {formatDate(item.publishDate)}
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}
