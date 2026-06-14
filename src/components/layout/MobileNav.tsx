"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { NAV_ITEMS } from "./Header";

type Props = {
  open: boolean;
  onClose: () => void;
  pathname: string;
};

export function MobileNav({ open, onClose, pathname }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 lg:hidden bg-rice-paper"
        >
          <div className="absolute inset-y-0 left-0 w-12 bg-vermillion flex items-start justify-center pt-12">
            <span className="font-calligraphy text-paper text-2xl text-vertical">開州同鄉</span>
          </div>

          <button
            type="button"
            aria-label="關閉選單"
            onClick={onClose}
            className="absolute top-6 right-6 inline-flex h-12 w-12 items-center justify-center text-ink"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <nav className="absolute inset-0 pl-20 pr-8 flex flex-col justify-center gap-2">
            {NAV_ITEMS.map((item, idx) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group flex items-baseline gap-4 py-3 border-b border-stone/20",
                      active ? "text-vermillion" : "text-ink",
                    )}
                  >
                    <span className="font-calligraphy text-3xl">{item.zh}</span>
                    <span className="font-sans-zh text-xs tracking-[0.3em] uppercase text-stone">
                      {item.en}
                    </span>
                    {active && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-vermillion" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
