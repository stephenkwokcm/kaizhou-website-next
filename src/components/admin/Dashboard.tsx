import { safePayloadQuery } from "@/lib/payload";

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
        ...recentNews.docs.map((d) => ({
          id: `n${d.id}`,
          title: d.title,
          href: `/admin/collections/news/${d.id}`,
          meta: `消息 · ${fmt(d.updatedAt)}`,
          _ts: new Date(d.updatedAt ?? 0).getTime(),
        })),
        ...recentAct.docs.map((d) => ({
          id: `a${d.id}`,
          title: d.title,
          href: `/admin/collections/activities/${d.id}`,
          meta: `活動 · ${fmt(d.updatedAt)}`,
          _ts: new Date(d.updatedAt ?? 0).getTime(),
        })),
      ]
        .sort((x, y) => y._ts - x._ts)
        .slice(0, 6)
        .map(({ _ts, ...item }) => item);

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

export default async function Dashboard() {
  const { stats, recent, pending } = await load();
  return (
    <div className="kz-dash">
      <div className="kz-dash__stats">
        <a className="kz-dash__stat kz-dash__stat--alert" href="/admin/collections/enquiries">
          <span className="kz-dash__num">{stats.unread}</span>
          <span className="kz-dash__lbl">未讀查詢</span>
        </a>
        <a className="kz-dash__stat" href="/admin/collections/news">
          <span className="kz-dash__num">{stats.news}</span>
          <span className="kz-dash__lbl">最新消息</span>
        </a>
        <a className="kz-dash__stat" href="/admin/collections/activities">
          <span className="kz-dash__num">{stats.activities}</span>
          <span className="kz-dash__lbl">會務活動</span>
        </a>
        <a className="kz-dash__stat" href="/admin/collections/committee-members">
          <span className="kz-dash__num">{stats.members}</span>
          <span className="kz-dash__lbl">理事會成員</span>
        </a>
      </div>

      <div className="kz-dash__cols">
        <section className="kz-dash__panel">
          <div className="kz-dash__panel-head">
            <h2>最近內容</h2>
            <span>
              <a href="/admin/collections/news/create">＋ 撰寫消息</a>
              {" · "}
              <a href="/admin/collections/activities/create">＋ 新增活動</a>
            </span>
          </div>
          {recent.length === 0 ? (
            <p className="kz-dash__empty">暫無內容</p>
          ) : (
            recent.map((it) => (
              <a key={it.id} className="kz-dash__row" href={it.href}>
                <span>{it.title}</span>
                <span className="kz-dash__meta">{it.meta}</span>
              </a>
            ))
          )}
        </section>

        <section className="kz-dash__panel">
          <div className="kz-dash__panel-head">
            <h2>待處理查詢</h2>
            <a href="/admin/collections/enquiries">查看全部</a>
          </div>
          {pending.length === 0 ? (
            <p className="kz-dash__empty">目前沒有未讀查詢</p>
          ) : (
            pending.map((it) => (
              <a key={it.id} className="kz-dash__row" href={it.href}>
                <span>{it.title}</span>
                <span className="kz-dash__meta">{it.meta}</span>
              </a>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
