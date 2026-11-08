import type { Payload } from "payload";
import type { CommitteeTier } from "@/components/sections/about/CommitteeRoster";
import { INITIAL_COMMITTEE_ROLES, memberKey } from "@/lib/committee-roles";
import { pickImage } from "@/lib/media";

export async function loadCommitteeRoster(payload: Payload): Promise<CommitteeTier[]> {
  const settings = await payload.findGlobal({ slug: "committee-roles", depth: 2 });
  if (!settings.updatedAt) {
    // shortcut: preserve legacy content before migration; remove after all environments migrate.
    const [committee, honorary] = await Promise.all([
      payload.find({ collection: "committee-members", pagination: false, sort: ["order", "id"], where: { isCurrent: { equals: true } } }),
      payload.find({ collection: "honorary-presidents", pagination: false, sort: ["order", "id"], where: { isCurrent: { equals: true } } }),
    ]);
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
    roles[0].members = honorary.docs.map((member) => ({ id: `honorary-presidents:${member.id}`, name: member.name, bio: member.title ?? undefined, photo: pickImage(member.photo, "thumbnail") }));
    return roles.filter((role) => role.members.length);
  }
  return (settings.roles ?? []).map((role): CommitteeTier => ({
    id: role.id!, name: role.name, color: role.color, appearance: role.appearance,
    members: (role.members ?? []).flatMap((reference) => {
      if (typeof reference.value !== "object" || !reference.value || !reference.value.isCurrent) return [];
      const member = reference.value;
      return [{
        id: memberKey(reference), name: member.name,
        bio: (reference.relationTo === "honorary-presidents" ? reference.value.title : reference.value.bio) ?? undefined,
        photo: pickImage(member.photo, "thumbnail"),
      }];
    }),
  })).filter((role) => role.members.length);
}
