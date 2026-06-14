"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/shared/Logo";
import { MobileNav } from "./MobileNav";

export const NAV_ITEMS = [
  { href: "/", zh: "主頁", en: "Home" },
  { href: "/about", zh: "關於我們", en: "About" },
  { href: "/hometown", zh: "家鄉開州", en: "Hometown" },
  { href: "/news", zh: "最新消息", en: "News" },
  { href: "/activities", zh: "會務活動", en: "Activities" },
  { href: "/contact", zh: "聯絡我們", en: "Contact" },
];

export function Header({ siteName = "香港開州同鄉會" }: { siteName?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const transparent = isLanding && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          transparent
            ? "bg-transparent"
            : "border-b border-stone/15 bg-paper/95 backdrop-blur-md shadow-[0_1px_0_rgba(139,35,35,0.06)]",
        )}
      >
        <div className="container-page flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <Logo size={44} priority className="transition-transform group-hover:scale-105" />
            <span
              className={cn(
                "font-calligraphy text-xl md:text-2xl leading-none transition-colors",
                transparent ? "text-paper ink-shadow" : "text-ink",
              )}
            >
              {siteName}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 font-sans-zh text-sm tracking-wide transition-colors",
                    transparent ? "text-paper/90 hover:text-paper" : "text-ink-soft hover:text-vermillion",
                  )}
                >
                  {item.zh}
                  {active && (
                    <span
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 bottom-1 h-1 w-1 rounded-full",
                        "bg-vermillion",
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            aria-label="開啟選單"
            onClick={() => setMobileOpen(true)}
            className={cn(
              "lg:hidden inline-flex h-10 w-10 items-center justify-center rounded transition-colors",
              transparent ? "text-paper" : "text-ink",
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />
    </>
  );
}
