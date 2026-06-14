import type { Metadata } from "next";
import Image from "next/image";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { InkDivider } from "@/components/shared/InkDivider";
import { MediaImage } from "@/components/shared/MediaImage";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage, type ImageData } from "@/lib/media";
import { pageMetadata } from "@/lib/seo";
import { EmptyState } from "@/components/shared/EmptyState";

export const metadata: Metadata = pageMetadata(
  "關於我們",
  "介紹香港開州同鄉會 — 本會宗旨、發展歷程、組織架構與現任理事會成員，以及入會申請辦法。",
  "/about",
);

type Member = {
  id: string | number;
  name: string;
  title?: string;
  bio?: string;
  photo?: ImageData | null;
};

export default async function AboutPage() {
  const committee = await safePayloadQuery<Member[]>(async (payload) => {
    const res = await payload.find({
      collection: "committee-members",
      limit: 24,
      sort: "order",
      where: { isCurrent: { equals: true } },
    });
    return res.docs.map((doc) => ({
      id: doc.id,
      name: doc.name,
      title: doc.title ?? undefined,
      bio: doc.bio ?? undefined,
      photo: pickImage(doc.photo, "thumbnail"),
    }));
  }, []);

  const members = committee;

  return (
    <article className="pt-32 pb-16">
      {/* Intro */}
      <section className="container-page">
        <RevealOnScroll>
          <p className="font-sans-zh text-xs tracking-[0.4em] uppercase text-vermillion mb-4">
            About Us
          </p>
          <h1 className="font-calligraphy text-5xl md:text-6xl text-ink leading-tight">
            敦睦鄉誼<br className="md:hidden" />
            <span className="text-vermillion">·</span> 服務社群
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          {/* PLACEHOLDER */}
          <div className="mt-12 grid gap-12 md:grid-cols-[2fr_3fr] md:items-start">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/kaizhou/plaza-statue.jpg"
                alt="開州 — 劉伯承故里"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-6 font-serif-zh text-lg leading-[2] text-ink-soft">
              <p>
                香港開州同鄉會成立於 <span className="text-vermillion font-semibold">2026 年</span>，
                由旅港開州籍人士共同發起，創會會長為沈女士。
                本會以團結旅港鄉親、傳承家鄉文化、促進香港與重慶開州兩地的友好交流為宗旨。
              </p>
              <p>
                作為一個年輕的鄉誼組織，本會雖剛起步，
                卻凝聚著一份綿延千里的鄉情。我們將以「服務鄉親、回饋桑梓」為初衷，
                逐步開展鄉誼聯絡、教育獎助、文化交流等會務工作。
              </p>
              <p>
                展望未來，本會期望成為連繫香江與漢豐之間的橋樑，
                凝聚旅港鄉親的力量，既為香港社會貢獻所能，
                亦為家鄉的發展架起兩地交流的紐帶。
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <InkDivider />

      {/* Organizational structure */}
      <section className="container-page">
        <RevealOnScroll>
          <SectionTitle zh="組織架構" en="Organization" seal="組織" />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          {/* PLACEHOLDER */}
          <div className="mt-10 max-w-4xl">
            <OrgChart />
          </div>
        </RevealOnScroll>
      </section>

      <InkDivider />

      {/* Current committee */}
      <section className="container-page">
        <RevealOnScroll>
          <SectionTitle zh="現任理事會" en="Current Committee" seal="理事" />
        </RevealOnScroll>

        {members.length === 0 && <EmptyState message="理事會名單即將公佈" />}

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, idx) => (
            <RevealOnScroll key={m.id} delay={idx * 0.05}>
              <article className="group flex gap-5 p-6 border border-stone/15 hover:border-vermillion/40 hover:bg-paper-dark/30 transition-all">
                <MediaImage image={m.photo} aspectRatio="3 / 4" className="w-24 shrink-0" label="" sizes="96px" />
                <div>
                  <div className="font-sans-zh text-[10px] tracking-[0.3em] uppercase text-vermillion mb-1">
                    {m.title || "理事"}
                  </div>
                  <h3 className="font-calligraphy text-2xl text-ink mb-2">{m.name}</h3>
                  {m.bio && (
                    <p className="font-serif-zh text-xs text-ink-soft/80 leading-relaxed line-clamp-3">
                      {m.bio}
                    </p>
                  )}
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <InkDivider />

      {/* Membership application */}
      <section className="container-page">
        <RevealOnScroll>
          <div className="bg-rice-paper-dark text-paper py-16 px-8 md:px-16 text-center">
            <SectionTitle zh="入會申請" en="Join Us" align="center" invert />
            <p className="mt-8 max-w-2xl mx-auto font-serif-zh text-paper/85 leading-[1.9]">
              {/* PLACEHOLDER */}
              凡祖籍重慶開州，現居香港之華籍人士，年滿十八歲，認同本會宗旨者，
              均歡迎加入本會。請下載申請表，填妥後郵寄或親送至本會會址。
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <button
                disabled
                className="inline-flex items-center gap-3 bg-vermillion text-paper px-8 py-4 font-sans-zh tracking-widest text-sm cursor-not-allowed opacity-60"
              >
                下載申請表 <span>↓</span>
                <span className="text-[10px] opacity-70">(PDF)</span>
              </button>
              <a
                href="/contact"
                className="inline-flex items-center gap-3 border border-paper/40 text-paper px-8 py-4 font-sans-zh tracking-widest text-sm hover:bg-paper/10 transition-colors"
              >
                查詢詳情 →
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </section>
    </article>
  );
}

function OrgChart() {
  /* PLACEHOLDER — simple visual org chart */
  const Box = ({ children, accent }: { children: React.ReactNode; accent?: boolean }) => (
    <div
      className={`px-6 py-4 text-center font-sans-zh text-sm border ${
        accent
          ? "bg-vermillion text-paper border-vermillion"
          : "bg-paper text-ink border-stone/30"
      }`}
    >
      {children}
    </div>
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Box accent>會員大會</Box>
      </div>
      <Connector />
      <div className="flex justify-center">
        <Box accent>理事會</Box>
      </div>
      <Connector />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Box>會務委員會</Box>
        <Box>財務委員會</Box>
        <Box>教育委員會</Box>
        <Box>青年委員會</Box>
      </div>
    </div>
  );
}

function Connector() {
  return <div className="mx-auto h-6 w-px bg-stone/40" />;
}
