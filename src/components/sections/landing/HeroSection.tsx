"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-ink"
    >
      {/* Background photo with parallax */}
      <motion.div
        className="absolute inset-0 will-change-transform"
        style={prefersReducedMotion ? undefined : { y: bgY, scale: 1.1 }}
      >
        <Image
          src="/images/kaizhou/hero-river-bridge.jpg"
          alt="開州山水 — 漢豐湖與長江"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover"
        />
        {/* Ink wash gradient overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.25) 70%, rgba(26,26,26,0.85) 100%)",
          }}
        />
        {/* Side vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </motion.div>

      {/* Vertical calligraphy + association name */}
      <motion.div
        className="relative z-10 h-full container-page flex items-center"
        style={prefersReducedMotion ? undefined : { y: overlayY, opacity: fadeOut }}
      >
        <div className="flex items-start gap-10 md:gap-16 pt-24">
          {/* Couplet — vertical Chinese */}
          <div className="flex gap-4 md:gap-6">
            {["巴山蒼翠連香江", "漢豐源遠繫鄉情"].map((line, idx) => (
              <motion.div
                key={line}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.3 + idx * 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-vertical-mixed font-calligraphy text-paper ink-shadow text-3xl md:text-5xl leading-[1.4] tracking-[0.2em]"
                style={{ writingMode: "vertical-rl" }}
              >
                {line}
              </motion.div>
            ))}
          </div>

          {/* Association name + subtitle (horizontal, beside the couplet) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="hidden md:block self-end pb-2"
          >
            <div className="font-calligraphy text-paper ink-shadow text-6xl lg:text-7xl leading-none">
              香港
              <br />
              開州
              <br />
              同鄉會
            </div>
            <div className="mt-6 h-px w-32 bg-gold/70" />
            <p className="mt-4 font-sans-zh text-paper/70 text-xs tracking-[0.4em] uppercase">
              Hong Kong Kaizhou
              <br />
              Association
            </p>
          </motion.div>
        </div>

        {/* Mobile association name */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 md:hidden text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="font-calligraphy text-paper ink-shadow text-5xl"
          >
            香港開州同鄉會
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-paper/70"
      >
        <span className="font-sans-zh text-[10px] tracking-[0.4em]">向下滑動</span>
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
