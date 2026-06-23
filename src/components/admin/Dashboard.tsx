import Link from "next/link";
import { safePayloadQuery } from "@/lib/payload";
import { formatDateZh } from "@/lib/format";

type Item = { id: string | number; title: string; href: string; meta: string };

async function load() {
  return safePayloadQuery(
    async (payload) => {
      const [newsCount, actCount, memberCount, unreadCount, recentNews, recentAct, pending] =
        await Promise.all([
          payload.count({ collection: "news" }),
          payload.count({ collection: "activities" }),
          payload.count({ collection: "committee-members" }),
          payload.count({ collection: "enquiries", where: { readStatus: { not_equals: true } } }),
          payload.find({ collection: "news", sort: "-updatedAt", limit: 5 }),
          payload.find({ collection: "activities", sort: "-updatedAt", limit: 5 }),
          payload.find({
            collection: "enquiries",
            where: { readStatus: { not_equals: true } },
            sort: "-createdAt",
            limit: 5,
          }),
        ]);

      const recent: Item[] = [
        ...recentNews.docs.map((d) => ({ d, kind: "消息", base: "news" as const })),
        ...recentAct.docs.map((d) => ({ d, kind: "活動", base: "activities" as const })),
      ]
        .sort(
          (x, y) =>
            new Date(y.d.updatedAt ?? 0).getTime() - new Date(x.d.updatedAt ?? 0).getTime(),
        )
        .slice(0, 6)
        .map(({ d, kind, base }) => ({
          id: `${base[0]}${d.id}`,
          title: d.title,
          href: `/admin/collections/${base}/${d.id}`,
          meta: `${kind} · ${fmt(d.updatedAt)}`,
        }));

      const pendingItems: Item[] = pending.docs.map((d) => ({
        id: d.id,
        title: d.name ?? "（無姓名）",
        href: `/admin/collections/enquiries/${d.id}`,
        meta: fmt(d.createdAt),
      }));

      return {
        stats: {
          unread: unreadCount.totalDocs,
          news: newsCount.totalDocs,
          activities: actCount.totalDocs,
          members: memberCount.totalDocs,
        },
        recent,
        pending: pendingItems,
      };
    },
    { stats: { unread: 0, news: 0, activities: 0, members: 0 }, recent: [] as Item[], pending: [] as Item[] },
  );
}

function fmt(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

/* --- inline line icons (stroke = currentColor) --- */
const sv = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const IconMail = () => (
  <svg {...sv}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
);
const IconDoc = () => (
  <svg {...sv}><path d="M14 3v5h5" /><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M8 13h8M8 17h6" /></svg>
);
const IconCal = () => (
  <svg {...sv}><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></svg>
);
const IconUsers = () => (
  <svg {...sv}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.5M21 20a6 6 0 0 0-4-5.6" /></svg>
);
const IconGear = () => (
  <svg {...sv}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 0 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 2.6V2a2 2 0 0 1 4 0v.1A1.6 1.6 0 0 0 17 4.6l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></svg>
);

export default async function Dashboard() {
  const { stats, recent, pending } = await load();
  const today = formatDateZh(new Date().toISOString());

  const cards = [
    { key: "unread", n: stats.unread, label: "未讀查詢", href: "/admin/collections/enquiries", Icon: IconMail, alert: true },
    { key: "news", n: stats.news, label: "最新消息", href: "/admin/collections/news", Icon: IconDoc, alert: false },
    { key: "act", n: stats.activities, label: "會務活動", href: "/admin/collections/activities", Icon: IconCal, alert: false },
    { key: "mem", n: stats.members, label: "理事會成員", href: "/admin/collections/committee-members", Icon: IconUsers, alert: false },
  ];

  return (
    <div className="kz-dash">
      <header className="kz-dash__header">
        <div className="kz-dash__heading">
          <h1>內容管理系統</h1>
          <p>香港開州同鄉會</p>
        </div>
        <p className="kz-dash__date">{today}</p>
      </header>

      <div className="kz-dash__stats">
        {cards.map(({ key, n, label, href, Icon, alert }) => (
          <Link key={key} className={`kz-dash__stat${alert ? " kz-dash__stat--alert" : ""}`} href={href}>
            <span className="kz-dash__stat-icon"><Icon /></span>
            <span className="kz-dash__stat-body">
              <span className="kz-dash__num">{n}</span>
              <span className="kz-dash__lbl">{label}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="kz-dash__cols">
        <section className="kz-dash__panel">
          <div className="kz-dash__panel-head">
            <h2>最近內容</h2>
            <Link className="kz-dash__link" href="/admin/collections/news/create">＋ 撰寫消息</Link>
          </div>
          {recent.length === 0 ? (
            <p className="kz-dash__empty">暫無內容</p>
          ) : (
            <ul className="kz-dash__list">
              {recent.map((it) => (
                <li key={it.id}>
                  <Link className="kz-dash__row" href={it.href}>
                    <span className="kz-dash__row-title">{it.title}</span>
                    <span className="kz-dash__meta">{it.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="kz-dash__panel">
          <div className="kz-dash__panel-head">
            <h2>待處理查詢</h2>
            <Link className="kz-dash__link" href="/admin/collections/enquiries">查看全部</Link>
          </div>
          {pending.length === 0 ? (
            <p className="kz-dash__empty">目前沒有未讀查詢</p>
          ) : (
            <ul className="kz-dash__list">
              {pending.map((it) => (
                <li key={it.id}>
                  <Link className="kz-dash__row" href={it.href}>
                    <span className="kz-dash__dot" aria-hidden="true" />
                    <span className="kz-dash__row-title">{it.title}</span>
                    <span className="kz-dash__meta">{it.meta}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="kz-dash__actions">
        <Link className="kz-dash__action" href="/admin/collections/news/create"><span className="kz-dash__action-icon"><IconDoc /></span>撰寫消息</Link>
        <Link className="kz-dash__action" href="/admin/collections/activities/create"><span className="kz-dash__action-icon"><IconCal /></span>新增活動</Link>
        <Link className="kz-dash__action" href="/admin/collections/committee-members"><span className="kz-dash__action-icon"><IconUsers /></span>管理成員</Link>
        <Link className="kz-dash__action" href="/admin/globals/site-settings"><span className="kz-dash__action-icon"><IconGear /></span>網站設定</Link>
      </div>
    </div>
  );
}
