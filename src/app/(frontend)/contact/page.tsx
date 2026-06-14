import type { Metadata } from "next";
import Image from "next/image";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Placeholder } from "@/components/shared/Placeholder";
import { getSiteSettings } from "@/lib/site-settings";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = pageMetadata(
  "聯絡我們",
  "聯絡香港開州同鄉會 — 會址、電話、電郵及線上查詢表格，歡迎查詢入會申請與合作建議。",
  "/contact",
);

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const rows = [
    { label: "會址 Address", value: settings.address },
    { label: "電話 Phone", value: settings.phone },
    { label: "傳真 Fax", value: settings.fax },
    { label: "電郵 Email", value: settings.email },
    { label: "辦公時間 Office Hours", value: settings.officeHours },
  ].filter((r): r is { label: string; value: string } => Boolean(r.value));

  return (
    <article className="pt-32 pb-24">
      <section className="container-page">
        <RevealOnScroll>
          <p className="font-sans-zh text-xs tracking-[0.4em] uppercase text-vermillion mb-4">
            Contact
          </p>
          <h1 className="font-calligraphy text-5xl md:text-6xl text-ink leading-tight">
            聯絡我們
          </h1>
          <p className="mt-6 max-w-2xl font-serif-zh text-lg text-ink-soft/85 leading-[1.9]">
            如有任何查詢、入會申請或合作建議，歡迎透過以下方式與我們聯絡，
            本會將於三個工作天內回覆。
          </p>
        </RevealOnScroll>

        <div className="mt-16 grid gap-12 lg:grid-cols-[2fr_3fr]">
          {/* Contact info column */}
          <RevealOnScroll>
            <div className="space-y-10">
              <SectionTitle zh="聯絡資料" en="Get in Touch" />

              <ul className="space-y-6 font-sans-zh text-sm">
                {rows.map((row) => (
                  <ContactRow key={row.label} label={row.label} value={row.value} />
                ))}
              </ul>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-stone/20">
                <div>
                  <p className="font-sans-zh text-xs tracking-widest text-stone mb-3">微信公眾號</p>
                  {settings.wechatQR ? (
                    <div className="relative w-32 aspect-square overflow-hidden rounded-sm border border-stone/20">
                      <Image
                        src={settings.wechatQR.url}
                        alt={settings.wechatQR.alt ?? "WeChat QR"}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <Placeholder aspectRatio="1 / 1" className="w-32" label="WeChat QR" />
                  )}
                </div>
                <div>
                  <p className="font-sans-zh text-xs tracking-widest text-stone mb-3">會址地圖</p>
                  <Placeholder aspectRatio="1 / 1" className="w-32" label="Map" />
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Form column */}
          <RevealOnScroll delay={0.1}>
            <div className="bg-paper-dark/30 p-8 md:p-12 border border-stone/15">
              <SectionTitle zh="留言查詢" en="Send a Message" />
              <p className="mt-4 font-serif-zh text-sm text-ink-soft/80 leading-relaxed">
                請填寫以下表格，我們將盡快與您聯繫。所有資料僅供本會內部聯絡之用。
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </article>
  );
}

function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="grid gap-1">
      <span className="text-[10px] tracking-[0.3em] uppercase text-vermillion">{label}</span>
      <span className="text-ink-soft text-base font-serif-zh">{value}</span>
    </li>
  );
}
