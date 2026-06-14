/**
 * Seed the current committee (現任理事會) into the `committee-members`
 * collection. Affiliations are intentionally high-level / professional rather
 * than the members' exact employers. Idempotent: upserts by name.
 *
 *   docker run --rm --network kaizhou_default -e NODE_ENV=production \
 *     -e DATABASE_URL=postgres://kaizhou:***@db:5432/kaizhou \
 *     -e PAYLOAD_SECRET=*** -e NEXT_PUBLIC_SITE_URL=https://kaizhou.hk \
 *     kaizhou-builder pnpm payload run scripts/seed-committee.ts
 */
import { getPayload } from "payload";
import config from "@payload-config";

const MEMBERS: { order: number; title: string; name: string; bio?: string }[] = [
  { order: 1, title: "會長", name: "沈宗燕", bio: "資訊科技業 · 管理層" },
  { order: 2, title: "常務副會長", name: "余樂", bio: "國際貿易業 · 管理層" },
  { order: 3, title: "常務副會長", name: "楊先偉", bio: "餐飲服務業 · 管理" },
  { order: 4, title: "副會長", name: "扈麗霞" },
  { order: 5, title: "副會長", name: "熊秉華", bio: "文化創意產業 · 企業管理" },
  { order: 6, title: "秘書長", name: "周鑫", bio: "高等院校在讀" },
  { order: 7, title: "副秘書長", name: "梁莉敏", bio: "高等院校研究生" },
  { order: 8, title: "司庫", name: "歐陽中蓉", bio: "保險及地產業" },
];

const payload = await getPayload({ config });

for (const m of MEMBERS) {
  const data = {
    name: m.name,
    title: m.title,
    order: m.order,
    isCurrent: true,
    ...(m.bio ? { bio: m.bio } : {}),
  };
  const existing = await payload.find({
    collection: "committee-members",
    where: { name: { equals: m.name } },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({ collection: "committee-members", id: existing.docs[0].id, data });
    payload.logger.info(`[seed-committee] updated ${m.title} ${m.name}`);
  } else {
    await payload.create({ collection: "committee-members", data });
    payload.logger.info(`[seed-committee] created ${m.title} ${m.name}`);
  }
}

payload.logger.info(`[seed-committee] done (${MEMBERS.length} members)`);
process.exit(0);
