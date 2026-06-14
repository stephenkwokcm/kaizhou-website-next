import Link from "next/link";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { safePayloadQuery } from "@/lib/payload";
import { lexicalToPlainText } from "@/lib/richtext";

type EventItem = {
  id: string | number;
  title: string;
  description?: string;
  eventDate: string;
  location?: string;
};

/* PLACEHOLDER */
const FALLBACK_EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "端午鄉誼茶聚",
    eventDate: "2026-06-08T14:00:00",
    location: "本會會址 · 尖沙咀",
    description: "與鄉親共度端午佳節，品嘗家鄉粽子，分享童年記憶。",
  },
  {
    id: "e2",
    title: "家鄉開州歷史文化講座",
    eventDate: "2026-07-19T19:30:00",
    location: "九龍中央圖書館演講廳",
    description: "邀請開州地方文史專家主講「漢豐千年：從漢豐縣到開州區」。",
  },
  {
    id: "e3",
    title: "中秋鄉親聯歡晚會",
    eventDate: "2026-09-26T18:30:00",
    location: "九龍灣國際展貿中心",
    description: "中秋雅集、文藝表演、抽獎活動，歡迎攜眷出席。",
  },
];

export async function UpcomingEventsSection() {
  const events = await safePayloadQuery<EventItem[]>(async (payload) => {
    const res = await payload.find({
      collection: "activities",
      limit: 3,
      sort: "eventDate",
      where: { eventType: { equals: "upcoming" } },
    });
    return res.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      description: lexicalToPlainText(doc.description),
      eventDate: doc.eventDate,
      location: doc.location ?? undefined,
    }));
  }, []);

  const items = events.length > 0 ? events : FALLBACK_EVENTS;

  return (
    <section className="container-page py-24">
      <RevealOnScroll>
        <SectionTitle zh="活動預告" en="Upcoming Events" seal="活動" />
      </RevealOnScroll>

      <ul className="mt-12 max-w-3xl mx-auto">
        {items.map((event, idx) => (
          <RevealOnScroll as="li" key={event.id} delay={idx * 0.1}>
            <article className="group flex gap-6 md:gap-10 py-8 border-b border-stone/15 last:border-0">
              <DateBadge iso={event.eventDate} />
              <div className="flex-1">
                <h3 className="font-serif-zh text-xl md:text-2xl text-ink mb-2 group-hover:text-vermillion transition-colors">
                  {event.title}
                </h3>
                {event.location && (
                  <div className="font-sans-zh text-xs tracking-wider text-stone mb-3 flex items-center gap-2">
                    <span className="text-vermillion">⟜</span> {event.location}
                  </div>
                )}
                {event.description && (
                  <p className="font-serif-zh text-sm md:text-base text-ink-soft/85 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </article>
          </RevealOnScroll>
        ))}
      </ul>

      <div className="mt-10 text-center">
        <Link
          href="/activities"
          className="inline-flex items-center gap-2 font-sans-zh text-sm tracking-widest text-vermillion hover:gap-4 transition-all"
        >
          所有活動 <span>→</span>
        </Link>
      </div>
    </section>
  );
}

function DateBadge({ iso }: { iso: string }) {
  const d = new Date(iso);
  const valid = !isNaN(d.getTime());
  const month = valid ? d.getMonth() + 1 : "—";
  const day = valid ? d.getDate() : "—";
  const year = valid ? d.getFullYear() : "";
  return (
    <div className="shrink-0 w-20 md:w-24 text-center border-r border-stone/20 pr-6">
      <div className="font-calligraphy text-vermillion text-5xl md:text-6xl leading-none">
        {day}
      </div>
      <div className="font-sans-zh text-xs text-stone mt-2 tracking-wider">
        {year} · {month} 月
      </div>
    </div>
  );
}
