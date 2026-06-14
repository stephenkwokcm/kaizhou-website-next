import Link from "next/link";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { InkDivider } from "@/components/shared/InkDivider";

export function AboutPreviewSection() {
  return (
    <section className="container-page py-24">
      <RevealOnScroll>
        <SectionTitle zh="同鄉之誼" en="Fellowship" seal="同鄉" />
      </RevealOnScroll>

      <RevealOnScroll delay={0.15}>
        {/* PLACEHOLDER */}
        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-2xl font-serif-zh text-lg md:text-xl leading-[2] text-ink-soft">
            香港開州同鄉會自成立以來，凝聚旅港開州鄉親，傳承故鄉文化，守望相助。
            我們以「敦睦鄉誼、回饋桑梓、服務社會」為宗旨，連繫起香江與漢豐之間綿延千里的鄉情。
          </p>
          <Link
            href="/about"
            className="group inline-flex items-center gap-3 font-sans-zh text-sm tracking-widest text-vermillion hover:gap-5 transition-all"
          >
            <span className="border-b border-vermillion/40 pb-1">了解更多</span>
            <span className="text-lg">→</span>
          </Link>
        </div>
      </RevealOnScroll>

      <InkDivider />
    </section>
  );
}
