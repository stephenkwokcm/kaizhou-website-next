import Link from "next/link";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { richTextConverters } from "@/lib/richtext-converters";
import { SealStamp } from "@/components/shared/SealStamp";
import { Placeholder } from "@/components/shared/Placeholder";
import { getSiteSettings } from "@/lib/site-settings";

const QUICK_LINKS = [
  { href: "/about", zh: "關於我們" },
  { href: "/hometown", zh: "家鄉開州" },
  { href: "/news", zh: "最新消息" },
  { href: "/activities", zh: "會務活動" },
  { href: "/contact", zh: "聯絡我們" },
];

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="relative bg-rice-paper-dark text-paper/80">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <SealStamp size={56} />
              <div>
                <div className="font-calligraphy text-2xl text-paper">{settings.siteName}</div>
                <div className="font-sans-zh text-[10px] tracking-[0.3em] uppercase text-paper/50 mt-1">
                  Hong Kong Kaizhou Fellowship Association
                </div>
              </div>
            </div>
            {settings.footerText ? (
              <div className="mt-6 text-sm leading-relaxed text-paper/65 [&_p]:mb-2 [&_p:last-child]:mb-0">
                <RichText
                  converters={richTextConverters}
                  data={settings.footerText as SerializedEditorState}
                />
              </div>
            ) : (
              <p className="mt-6 text-sm leading-relaxed text-paper/65">
                連繫旅港鄉親、傳承家鄉文化、促進兩地交流。本會自成立以來，一直致力於團結鄉誼，服務社群。
              </p>
            )}
          </div>

          <div>
            <h3 className="font-calligraphy text-xl text-paper mb-5">聯絡資料</h3>
            <ul className="space-y-3 text-sm font-sans-zh">
              {settings.address && (
                <li className="flex gap-3">
                  <span className="text-vermillion">⟜</span>
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.phone && (
                <li className="flex gap-3">
                  <span className="text-vermillion">☎</span>
                  <span>{settings.phone}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-3">
                  <span className="text-vermillion">✉</span>
                  <a href={`mailto:${settings.email}`} className="hover:text-vermillion transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-calligraphy text-xl text-paper mb-5">快速連結</h3>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-sans-zh text-sm text-paper/70 hover:text-vermillion transition-colors"
                >
                  {link.zh}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {settings.wechatQR ? (
                <div className="relative w-20 aspect-square overflow-hidden rounded-sm bg-paper">
                  <Image
                    src={settings.wechatQR.url}
                    alt={settings.wechatQR.alt ?? "WeChat QR"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <Placeholder
                  aspectRatio="1 / 1"
                  className="w-20 bg-paper/10 border-paper/20"
                  label="WeChat"
                />
              )}
              <p className="text-xs font-sans-zh text-paper/60 leading-relaxed">
                掃描二維碼<br />關注本會微信公眾號
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-paper/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs font-sans-zh text-paper/50">
            © {new Date().getFullYear()} {settings.siteName} Hong Kong Kaizhou Fellowship Association. All rights reserved.
          </p>
          <p className="text-xs font-sans-zh text-paper/40 tracking-widest">
            巴山蒼翠連香江 · 漢豐源遠繫鄉情
          </p>
        </div>
      </div>
    </footer>
  );
}
