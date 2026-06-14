import type { Metadata, Viewport } from "next";
import { Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/shared/JsonLd";
import { getSiteSettings } from "@/lib/site-settings";
import { SITE_URL, SITE_NAME, SITE_NAME_EN, SITE_DESCRIPTION, absoluteUrl } from "@/lib/seo";
import "./globals.css";

const notoSerifTC = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-tc",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

// 莫大毛筆 Bakudai — open-source (OFL 1.1) brush calligraphy font with full
// Traditional Chinese coverage. Self-hosted, subset to Big5 level-1 + site glyphs.
const bakudai = localFont({
  src: "./fonts/Bakudai-Bold.subset.woff2",
  weight: "700",
  variable: "--font-bakudai",
  display: "swap",
});

// ISR: re-render CMS-driven pages at most every 5 minutes so content
// edited in the Payload admin shows up without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "zh_HK",
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${SITE_NAME} ${SITE_NAME_EN}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#8b2323",
};

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: settings.siteName,
    alternateName: SITE_NAME_EN,
    url: SITE_URL,
    logo: absoluteUrl("/icon-512.png"),
    description: SITE_DESCRIPTION,
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressRegion: "Hong Kong",
            addressCountry: "HK",
          },
        }
      : {}),
    ...(settings.socialLinks.length > 0
      ? { sameAs: settings.socialLinks.map((l) => l.url).filter((u) => u.startsWith("http")) }
      : {}),
  };

  return (
    <html
      lang="zh-Hant"
      className={`${notoSerifTC.variable} ${notoSansTC.variable} ${bakudai.variable}`}
    >
      <body className="bg-rice-paper antialiased">
        <JsonLd data={organizationLd} />
        <Header siteName={settings.siteName} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
