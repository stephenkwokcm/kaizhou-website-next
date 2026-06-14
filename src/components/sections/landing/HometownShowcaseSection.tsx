import Link from "next/link";
import Image from "next/image";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";

const FEATURES = [
  {
    zh: "千年歷史",
    en: "1800 Years",
    image: "/images/kaizhou/pagoda-clouds.jpg",
    text: "東漢建安二十一年（公元 216 年）始置漢豐縣，至今逾一千八百年。歷經唐宋元明清，文脈綿延不絕。",
  },
  {
    zh: "名人輩出",
    en: "Distinguished Sons",
    image: "/images/kaizhou/courtyard.jpg",
    text: "開國十大元帥之一劉伯承元帥誕生於此。1895 年公車上書，開州六位舉人聯名上陳，士風之盛聞於巴蜀。",
  },
  {
    zh: "山水勝景",
    en: "Mountains & Waters",
    image: "/images/kaizhou/hanfeng-lake.jpg",
    text: "地處三峽庫區腹心，雪寶山國家森林公園層巒疊翠，漢豐湖煙波浩淼，自古為巴蜀勝地。",
  },
];

export function HometownShowcaseSection() {
  return (
    <section className="bg-rice-paper-dark text-paper py-24">
      <div className="container-page">
        <RevealOnScroll className="flex items-end justify-between gap-6 mb-14">
          <SectionTitle zh="家鄉開州" en="Our Hometown" seal="開州" invert />
          <Link
            href="/hometown"
            className="group hidden md:inline-flex items-center gap-2 font-sans-zh text-sm tracking-widest text-gold hover:gap-4 transition-all"
          >
            探索更多 <span>→</span>
          </Link>
        </RevealOnScroll>

        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((f, idx) => (
            <RevealOnScroll key={f.zh} delay={idx * 0.12}>
              <article className="group relative overflow-hidden border border-paper/10 hover:border-gold/40 transition-colors">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={f.image}
                    alt={f.zh}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.92) 100%)",
                    }}
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <div className="font-sans-zh text-[10px] tracking-[0.4em] uppercase text-gold mb-2">
                    {f.en}
                  </div>
                  <h3 className="font-calligraphy text-4xl text-paper mb-4 ink-shadow">
                    {f.zh}
                  </h3>
                  <p className="font-serif-zh text-sm text-paper/85 leading-relaxed line-clamp-4">
                    {f.text}
                  </p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>

        <div className="md:hidden mt-10 text-center">
          <Link
            href="/hometown"
            className="inline-flex items-center gap-2 font-sans-zh text-sm tracking-widest text-gold"
          >
            探索更多 →
          </Link>
        </div>
      </div>
    </section>
  );
}
