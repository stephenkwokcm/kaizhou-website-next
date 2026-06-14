import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/landing/HeroSection";
import { AboutPreviewSection } from "@/components/sections/landing/AboutPreviewSection";
import { LatestNewsSection } from "@/components/sections/landing/LatestNewsSection";
import { UpcomingEventsSection } from "@/components/sections/landing/UpcomingEventsSection";
import { HometownShowcaseSection } from "@/components/sections/landing/HometownShowcaseSection";
import { SITE_NAME, SITE_NAME_EN } from "@/lib/seo";

// Landing page shows the full bilingual name in the <title>; description/OG
// inherit the site-wide defaults from the layout.
export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_NAME_EN}` },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutPreviewSection />
      <LatestNewsSection />
      <UpcomingEventsSection />
      <HometownShowcaseSection />
    </>
  );
}
