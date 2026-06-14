import type { Metadata } from "next";
import Image from "next/image";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { InkDivider } from "@/components/shared/InkDivider";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata(
  "家鄉開州",
  "認識家鄉開州 — 重慶市開州區的千年歷史、人文風物與山水勝景，劉伯承元帥故里，三峽庫區明珠漢豐湖。",
  "/hometown",
);

const GALLERY = [
  { src: "/images/kaizhou/hanfeng-lake.jpg", caption: "漢豐湖 · 雲影波光" },
  { src: "/images/kaizhou/modern-bridge.jpg", caption: "今日開州 · 城市新貌" },
  { src: "/images/kaizhou/riverside-walk.jpg", caption: "濱湖綠道 · 春櫻爛漫" },
  { src: "/images/kaizhou/ferris-wheel-lake.jpg", caption: "舉子園 · 漁舟唱晚" },
  { src: "/images/kaizhou/dam-river.jpg", caption: "三峽庫區 · 江山如畫" },
  { src: "/images/kaizhou/courtyard.jpg", caption: "傳統院落 · 巴渝風韻" },
  { src: "/images/kaizhou/xuebao-spring.jpg", caption: "雪寶山 · 春意盎然" },
  { src: "/images/kaizhou/xuebao-autumn.jpg", caption: "雪寶山 · 層林盡染" },
  { src: "/images/kaizhou/xuebao-meadow.jpg", caption: "雪寶山 · 高山牧場" },
];

export default function HometownPage() {
  return (
    <article>
      {/* Hero banner */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-ink">
        <Image
          src="/images/kaizhou/pagoda-clouds.jpg"
          alt="開州 · 雲霧中的文峰塔"
          fill
          priority
          quality={88}
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 40%, rgba(26,26,26,0.85) 100%)",
          }}
        />
        <div className="container-page relative z-10 h-full flex flex-col justify-end pb-16">
          <p className="font-sans-zh text-xs tracking-[0.4em] uppercase text-gold mb-3">
            Our Hometown · Kaizhou, Chongqing
          </p>
          <h1 className="font-calligraphy text-5xl md:text-7xl text-paper ink-shadow leading-none">
            家鄉開州
          </h1>
          <p className="mt-4 max-w-xl font-serif-zh text-paper/85 ink-shadow text-base md:text-lg">
            東漢始置漢豐 · 千八百年文脈綿延 · 今為重慶開州區
          </p>
        </div>
      </section>

      {/* History */}
      <section className="container-page py-24">
        <RevealOnScroll>
          <SectionTitle zh="歷史沿革" en="History" seal="千年" />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="mt-10 grid gap-12 md:grid-cols-[3fr_2fr]">
            <div className="space-y-6 font-serif-zh text-lg leading-[2] text-ink-soft">
              <p>
                開州，古稱 <span className="text-vermillion font-semibold">漢豐</span>，
                位於重慶市東北部，地處長江三峽庫區腹心，與四川省接壤。
                <strong>東漢建安二十一年（公元 216 年）</strong>始置漢豐縣，至今已有逾一千八百年的建置歷史。
              </p>
              <p>
                南北朝西魏、北周之際（六世紀中葉），於此始置「開州」。
                南河古稱開江，州縣之名即由此而得。
                此後歷經唐、宋、元、明、清，州縣建置雖屢有更迭，
                而「開州」之名沿用至今，文脈綿延不絕。
              </p>
              <p>
                2016 年，國務院批准撤銷開縣設立重慶市開州區，
                古老的漢豐之地，自此邁入新的歷史篇章。
              </p>
            </div>
            <aside className="border-l-2 border-vermillion/30 pl-6 space-y-5 text-sm font-sans-zh">
              <Timeline year="216 年" event="東漢建安年間，置漢豐縣" />
              <Timeline year="六世紀中葉" event="西魏、北周之際，首置「開州」" />
              <Timeline year="1373 年" event="明初降開州為開縣" />
              <Timeline year="2016 年" event="撤縣設區，成立重慶開州區" />
            </aside>
          </div>
        </RevealOnScroll>
      </section>

      <InkDivider />

      {/* Famous people */}
      <section className="bg-rice-paper-dark text-paper py-24">
        <div className="container-page">
          <RevealOnScroll>
            <SectionTitle zh="名人輩出" en="Distinguished Sons" seal="名人" invert />
          </RevealOnScroll>

          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <RevealOnScroll>
              <div className="border-l-2 border-gold/50 pl-8">
                <h3 className="font-calligraphy text-3xl text-paper mb-2">劉伯承元帥</h3>
                <p className="font-sans-zh text-xs tracking-widest text-gold mb-4 uppercase">
                  Marshal Liu Bocheng · 1892 – 1986
                </p>
                <p className="font-serif-zh text-paper/85 leading-[1.9]">
                  生於開州趙家（今開州區趙家街道），中華人民共和國開國十大元帥之一，
                  軍事教育家、戰略家。號稱「軍神」，
                  為中國近代軍事史上最具影響力的將領之一。
                </p>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.1}>
              <div className="border-l-2 border-gold/50 pl-8">
                <h3 className="font-calligraphy text-3xl text-paper mb-2">公車上書 · 開州六舉人</h3>
                <p className="font-sans-zh text-xs tracking-widest text-gold mb-4 uppercase">
                  Six Juren of Kaizhou · 1895
                </p>
                <p className="font-serif-zh text-paper/85 leading-[1.9]">
                  1895 年（光緒二十一年），開州六位舉人聯名參與康有為、梁啟超發起的
                  「公車上書」，反對《馬關條約》，主張變法圖強，
                  在中國近代史上留下了重要一筆。
                </p>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="container-page py-24">
        <RevealOnScroll>
          <SectionTitle zh="文化特色" en="Culture" seal="文化" />
        </RevealOnScroll>

        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {[
            {
              title: "溫湯井鹽",
              text: "自漢代開採滷泉，兩千年井鹽不絕，明清鼎盛時溫湯井名列「川東四大鹽場」。",
            },
            {
              title: "開江之名",
              text: "南河古稱開江，「開州」州縣之名由此而得；「漢豐」故稱，則取「漢土豐盛」之意。",
            },
            {
              title: "兩河漢豐",
              text: "南河、東河於城中交匯，瀦為漢豐湖，孕育了開州獨特的水鄉文化。",
            },
          ].map((c, idx) => (
            <RevealOnScroll key={c.title} delay={idx * 0.1}>
              <div className="p-8 border border-stone/20 bg-paper-dark/20 h-full">
                <h3 className="font-calligraphy text-2xl text-vermillion mb-4">{c.title}</h3>
                <p className="font-serif-zh text-sm text-ink-soft/85 leading-[1.9]">{c.text}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <InkDivider />

      {/* Modern day */}
      <section className="container-page pb-24">
        <RevealOnScroll>
          <SectionTitle zh="今日開州" en="Modern Kaizhou" seal="今日" />
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="mt-10 grid gap-10 md:grid-cols-[3fr_2fr] md:items-center">
            <div className="space-y-5 font-serif-zh text-lg leading-[2] text-ink-soft">
              <p>
                作為三峽庫區重要的移民安置區，開州區轄域面積 3,963 平方公里，
                轄 27 個鎮、5 個鄉、8 個街道，戶籍人口逾 160 萬。
              </p>
              <p>
                近年來，開州高新技術產業開發區蓬勃發展，
                形成了以能源建材、食品醫藥、電子信息、裝備製造為支柱的產業格局。
                漢豐湖環湖而建的新城區，更成為三峽庫區的一顆明珠。
              </p>
            </div>
            <div className="relative aspect-[4/5]">
              <Image
                src="/images/kaizhou/modern-bridge.jpg"
                alt="今日開州 · 漢豐湖大橋"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* Photo gallery */}
      <section className="bg-paper-dark/30 py-24">
        <div className="container-page">
          <RevealOnScroll>
            <SectionTitle zh="開州勝景" en="Photo Gallery" seal="勝景" align="center" />
          </RevealOnScroll>

          <div className="mt-14 grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((g, idx) => (
              <RevealOnScroll key={g.src} delay={(idx % 3) * 0.08}>
                <figure className="group relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={g.src}
                    alt={g.caption}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <figcaption
                    className="absolute inset-x-0 bottom-0 p-4 font-sans-zh text-sm text-paper translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                    }}
                  >
                    {g.caption}
                  </figcaption>
                </figure>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

function Timeline({ year, event }: { year: string; event: string }) {
  return (
    <div>
      <div className="text-vermillion font-semibold tracking-widest">{year}</div>
      <div className="text-stone text-sm mt-1">{event}</div>
    </div>
  );
}
