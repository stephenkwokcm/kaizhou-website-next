import type { Metadata } from "next";
import Link from "next/link";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { InkDivider } from "@/components/shared/InkDivider";
import { MediaImage } from "@/components/shared/MediaImage";
import { safePayloadQuery } from "@/lib/payload";
import { pickImage, type ImageData } from "@/lib/media";
import { lexicalToPlainText } from "@/lib/richtext";
import type { Activity as ActivityDoc } from "@/payload-types";
import { JsonLd } from "@/components/shared/JsonLd";
import { EmptyState } from "@/components/shared/EmptyState";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import { formatDateZh } from "@/lib/format";

export const metadata: Metadata = pageMetadata(
  "會務活動",
  "香港開州同鄉會會務活動 — 活動預告及回顧，涵蓋聯誼、文化、教育與公益活動，誠邀鄉親踴躍參與。",
  "/activities",
);

type Activity = {
  id: string | number;
  slug?: string;
  title: string;
  eventDate: string;
  location?: string;
  excerpt?: string;
  image?: ImageData | null;
};

export default async function ActivitiesPage() {
  const data = await safePayloadQuery(async (payload) => {
    const [up, past] = await Promise.all([
      payload.find({
        collection: "activities",
        where: { eventType: { equals: "upcoming" } },
        sort: "eventDate",
        limit: 24,
      }),
      payload.find({
        collection: "activities",
        where: { eventType: { equals: "past" } },
        sort: "-eventDate",
        limit: 24,
      }),
    ]);
    const map = (docs: ActivityDoc[]): Activity[] =>
      docs.map((d) => ({
        id: d.id,
        slug: d.slug ?? undefined,
        title: d.title,
        eventDate: d.eventDate,
        location: d.location ?? undefined,
        excerpt: lexicalToPlainText(d.description),
        image: pickImage(d.featuredImage, "card") ?? pickImage(d.gallery?.[0]?.image, "card"),
      }));
    return { upcoming: map(up.docs), past: map(past.docs) };
  }, { upcoming: [] as Activity[], past: [] as Activity[] });

  // Structured data only for real CMS events — never the DB-down fallback,
  // which would publish fictitious events to crawlers.
  const eventsLd = data.upcoming.length === 0 ? null : {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: data.upcoming.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: a.title,
        startDate: a.eventDate,
        ...(a.excerpt ? { description: a.excerpt } : {}),
        location: {
          "@type": "Place",
          name: a.location ?? "香港",
          address: { "@type": "PostalAddress", addressRegion: "Hong Kong", addressCountry: "HK" },
        },
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        organizer: { "@id": `${SITE_URL}/#organization` },
      },
    })),
  };

  return (
    <article className="pt-32 pb-24">
      {eventsLd && <JsonLd data={eventsLd} />}
      <section className="container-page">
        <RevealOnScroll>
          <p className="font-sans-zh text-xs tracking-[0.4em] uppercase text-vermillion mb-4">
            Activities
          </p>
          <h1 className="font-calligraphy text-5xl md:text-6xl text-ink leading-tight">
            會務活動
          </h1>
          <p className="mt-6 max-w-2xl font-serif-zh text-lg text-ink-soft/85 leading-[1.9]">
            {/* PLACEHOLDER */}
            本會定期舉辦各類聯誼、文化、教育及公益活動，
            旨在凝聚鄉誼、傳承文化、服務社群。誠邀鄉親踴躍參與。
          </p>
        </RevealOnScroll>
      </section>

      <section className="container-page mt-20">
        <RevealOnScroll>
          <SectionTitle zh="活動預告" en="Upcoming" seal="預告" />
        </RevealOnScroll>

        {data.upcoming.length === 0 ? (
          <EmptyState message="暫無活動預告" />
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.upcoming.map((a, idx) => (
              <ActivityCard key={a.id} activity={a} delay={idx * 0.08} accent />
            ))}
          </div>
        )}
      </section>

      <InkDivider />

      <section className="container-page">
        <RevealOnScroll>
          <SectionTitle zh="活動回顧" en="Past Events" seal="回顧" />
        </RevealOnScroll>

        {data.past.length === 0 ? (
          <EmptyState message="暫無活動回顧" />
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.past.map((a, idx) => (
              <ActivityCard key={a.id} activity={a} delay={idx * 0.08} />
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

function ActivityCard({
  activity,
  delay,
  accent,
}: {
  activity: Activity;
  delay: number;
  accent?: boolean;
}) {
  const d = new Date(activity.eventDate);
  const valid = !isNaN(d.getTime());

  return (
    <RevealOnScroll delay={delay}>
      <article className="group">
        <div className="relative">
          <MediaImage image={activity.image} aspectRatio="4 / 3" label="活動相片" className="mb-5" />
          {accent && valid && (
            <div className="absolute top-3 left-3 bg-vermillion text-paper px-3 py-1 font-sans-zh text-xs tracking-wider">
              {d.getMonth() + 1}/{d.getDate()}
            </div>
          )}
        </div>
        <div className="font-sans-zh text-xs tracking-widest text-stone mb-2">
          {formatDateZh(activity.eventDate)}
          {activity.location ? ` · ${activity.location}` : ""}
        </div>
        <h3 className="font-serif-zh text-xl text-ink mb-2 group-hover:text-vermillion transition-colors">
          {activity.slug ? (
            <Link href={`/activities/${encodeURIComponent(activity.slug)}`}>{activity.title}</Link>
          ) : (
            activity.title
          )}
        </h3>
        {activity.excerpt && (
          <p className="font-serif-zh text-sm text-ink-soft/80 leading-relaxed line-clamp-3">
            {activity.excerpt}
          </p>
        )}
      </article>
    </RevealOnScroll>
  );
}
