export type MemberReference = {
  relationTo: "committee-members" | "honorary-presidents";
  value: number | string | { id: number | string };
};

export type RoleConfiguration = {
  name: string;
  color: string;
  appearance: "standard" | "honorary" | "chair";
  members?: MemberReference[] | null;
};

// Initial configuration only; display order comes from the saved array.
export const INITIAL_COMMITTEE_ROLES: RoleConfiguration[] = [
  { name: "會長", color: "#8b2323", appearance: "chair" },
  ...["常務會長", "副會長", "秘書長", "副秘書長", "司庫", "常務理事", "顧問", "義務法律顧問"].map(
    (name): RoleConfiguration => ({ name, color: "#8b2323", appearance: "standard" }),
  ),
];

export function memberKey(member: MemberReference): string {
  const id = typeof member.value === "object" ? member.value.id : member.value;
  return `${member.relationTo}:${id}`;
}

export function validateRoleAssignments(roles: RoleConfiguration[]): true | string {
  const names = new Set<string>();
  const members = new Set<string>();
  for (const role of roles) {
    const name = role.name?.trim();
    if (!name) return "請輸入職銜名稱。";
    if (name === "榮譽會長" || name === "名譽會長") return "榮譽會長及名譽會長請於各自的成員頁面管理。";
    if (names.has(name)) return `職銜「${name}」重複。`;
    names.add(name);
    for (const member of role.members ?? []) {
      if (member.relationTo !== "committee-members") return "現任理事會只能加入理事會成員。";
      const key = memberKey(member);
      if (members.has(key)) return "同一位成員只能分配到一個職銜，請先移除原有分配。";
      members.add(key);
    }
  }
  return true;
}

export function sealTextColor(color: string): string {
  const channels = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!channels) return "#ffffff";
  const [r, g, b] = channels.slice(1).map((hex) => {
    const value = parseInt(hex, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return r * 0.2126 + g * 0.7152 + b * 0.0722 > 0.179 ? "#1a1a1a" : "#ffffff";
}

type LegacyMember = { id: number | string; title?: string | null };

export function migrateRoleAssignments(
  committee: LegacyMember[],
  mapping: Record<string, string> = {},
): RoleConfiguration[] {
  const roles = INITIAL_COMMITTEE_ROLES.map((role) => ({ ...role, members: [] as MemberReference[] }));
  const rolesByName = new Map(roles.map((role) => [role.name, role]));
  const unresolved = new Set<string>();
  for (const member of committee) {
    const title = member.title ?? "";
    const role = rolesByName.get(mapping[title] ?? title);
    if (!role) unresolved.add(title || "（未設定職銜）");
    else role.members.push({ relationTo: "committee-members", value: member.id });
  }
  if (unresolved.size) throw new Error(`請先提供舊職銜對應：${[...unresolved].join("、")}`);
  return roles;
}
