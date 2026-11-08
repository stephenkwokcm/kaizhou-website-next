import type { Payload } from "payload";
import type { CommitteeTier } from "@/components/sections/about/CommitteeRoster";
import { INITIAL_COMMITTEE_ROLES, memberKey } from "@/lib/committee-roles";
import { pickImage } from "@/lib/media";

export async function loadCommitteeRoster(payload: Payload): Promise<CommitteeTier[]> {
  const settings = await payload.findGlobal({ slug: "committee-roles", depth: 2 });
  if (!settings.updatedAt) {
    // shortcut: preserve legacy content before migration; remove after all environments migrate.
    const committee = await payload.find({ collection: "committee-members", pagination: false, sort: ["order", "id"], where: { isCurrent: { equals: true } } });
    const roles = INITIAL_COMMITTEE_ROLES.map((role): CommitteeTier => ({ ...role, id: role.name, members: [] }));
    for (const member of committee.docs) {
      const name = member.title || "理事會成員";
      let role = roles.find((role) => role.name === name);
      if (!role) {
        role = { id: name, name, color: "#8b2323", appearance: "standard", members: [] };
        roles.push(role);
      }
      role.members.push({ id: `committee-members:${member.id}`, name: member.name, bio: member.bio ?? undefined, photo: pickImage(member.photo, "thumbnail") });
    }
    return roles.filter((role) => role.members.length);
  }
  return (settings.roles ?? []).filter((role) => role.name.trim() !== "榮譽會長" && role.name.trim() !== "名譽會長").map((role): CommitteeTier => ({
    id: role.id!, name: role.name, color: role.color, appearance: role.appearance,
    members: (role.members ?? []).flatMap((reference) => {
      if (reference.relationTo !== "committee-members" || typeof reference.value !== "object" || !reference.value || !reference.value.isCurrent) return [];
      const member = reference.value;
      return [{
        id: memberKey(reference), name: member.name,
        bio: reference.value.bio ?? undefined,
        photo: pickImage(member.photo, "thumbnail"),
      }];
    }),
  })).filter((role) => role.members.length);
}

export async function loadPresidentBoards(payload: Payload): Promise<CommitteeTier[]> {
  return Promise.all(([
    { collection: "honorary-presidents", name: "榮譽會長" },
    { collection: "titular-presidents", name: "名譽會長" },
  ] as const).map(async ({ collection, name }): Promise<CommitteeTier> => {
    const result = await payload.find({
      collection,
      pagination: false, depth: 1, sort: ["order", "id"],
      where: { isCurrent: { equals: true } },
    });
    return {
      id: collection, name, color: "#c5a55a", appearance: "honorary",
      members: result.docs.map((member) => ({
        id: `${collection}:${member.id}`, name: member.name,
        bio: member.title ?? undefined, photo: pickImage(member.photo, "thumbnail"),
      })),
    };
  }));
}
