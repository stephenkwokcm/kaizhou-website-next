import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/components/shared/JsonLd";
import { ActivityLivePreview } from "./ActivityLivePreview";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage } from "@/lib/media";
import { lexicalToPlainText } from "@/lib/richtext";
import { SITE_URL, SITE_NAME, absoluteUrl, activityPath } from "@/lib/seo";
import type { Activity } from "@/payload-types";

type Props = { params: Promise<{ slug: string }> };

const getActivityDoc = cache(async (slug: string): Promise<Activity | null> => {
  return safePayloadQuery<Activity | null>(async (payload) => {
    const res = await payload.find({
      collection: "activities",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    return res.docs[0] ?? null;
  }, null);
});

export async function generateStaticParams() {
  const slugs = await safePayloadQuery<string[]>(async (payload) => {
    const res = await payload.find({ collection: "activities", limit: 1000 });
    return res.docs.map((doc) => doc.slug).filter((s): s is string => Boolean(s));
  }, []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug);
  const doc = await getActivityDoc(slug);
  if (!doc) return { title: "找不到活動", robots: { index: false } };

  const path = activityPath(slug);
  const description = lexicalToPlainText(doc.description) || `${SITE_NAME}會務活動 — ${doc.title}`;
  const image = pickImage(doc.featuredImage, "hero");
  const ogImage = image?.url ?? "/og.jpg";

  return {
    title: doc.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE_NAME,
      title: `${doc.title} | ${SITE_NAME}`,
      description,
      url: path,
      type: "article",
      locale: "zh_HK",
      images: [{ url: ogImage, alt: image?.alt ?? doc.title, width: image?.width ?? 1200, height: image?.height ?? 630 }],
    },
    twitter: { card: "summary_large_image", title: `${doc.title} | ${SITE_NAME}`, description, images: [ogImage] },
  };
}

export default async function ActivityDetailPage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug);
  const doc = await getActivityDoc(slug);
  if (!doc) notFound();

  const image = pickImage(doc.featuredImage, "hero");
  const url = absoluteUrl(activityPath(slug));
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: doc.title,
    ...(doc.eventDate ? { startDate: doc.eventDate } : {}),
    ...(image ? { image: [absoluteUrl(image.url)] } : {}),
    location: {
      "@type": "Place",
      name: doc.location ?? "香港",
      address: { "@type": "PostalAddress", addressRegion: "Hong Kong", addressCountry: "HK" },
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    organizer: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME },
    inLanguage: "zh-Hant",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <article className="pt-32 pb-24">
      <JsonLd data={eventLd} />
      <ActivityLivePreview initialDoc={doc} />
    </article>
  );
}
