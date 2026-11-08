import Link from "next/link";
import type { UIFieldServerProps } from "payload";
import { memberKey } from "@/lib/committee-roles";

export default async function MemberRole({ data, collectionSlug, req }: UIFieldServerProps) {
  const settings = await req.payload.findGlobal({ slug: "committee-roles", depth: 0, req });
  const key = `${collectionSlug}:${data.id}`;
  const role = settings.roles?.find((role) => role.members?.some((member) => memberKey(member) === key));
  return (
    <div className="kz-member-role">
      <p>職銜：{role?.name ?? "尚未分配"}</p>
      <Link href="/admin/globals/committee-roles">前往「職銜與排序」分配職銜 →</Link>
      {!data.id && <p>請先儲存成員資料，再分配職銜。</p>}
    </div>
  );
}
