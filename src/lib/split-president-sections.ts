import type { Payload } from "payload";
import { memberKey, validateRoleAssignments } from "./committee-roles";

export async function splitPresidentSections(payload: Payload, apply: boolean) {
  const transactionID = await payload.db.beginTransaction();
  if (!transactionID) throw new Error("Migration requires database transactions.");
  const req = { transactionID };
  try {
    const settings = await payload.findGlobal({ slug: "committee-roles", depth: 0, req });
    const presidents = new Set((settings.roles ?? []).filter((role) => ["榮譽會長", "名譽會長"].includes(role.name.trim())));
    const roles = (settings.roles ?? []).filter((role) => !presidents.has(role));
    const validation = validateRoleAssignments(roles);
    if (validation !== true) throw new Error(validation);
    const assigned = new Set(roles.flatMap((role) => role.members ?? []).map(memberKey));
    for (const role of presidents) {
      const collection = role.name.trim() === "榮譽會長" ? "honorary-presidents" : "titular-presidents";
      for (const [order, reference] of (role.members ?? []).entries()) {
        const key = memberKey(reference);
        if (assigned.has(key)) throw new Error(`Duplicate assignment: ${key}`);
        assigned.add(key);
        const id = typeof reference.value === "object" ? reference.value.id : reference.value;
        // react-doctor-disable-next-line async-await-in-loop -- Preserve transaction ordering and stop before later writes on failure.
        const member = await payload.findByID({ collection: reference.relationTo, id, depth: 0, req });
        if (apply) {
          if (reference.relationTo === collection) {
            await payload.update({ collection, id, data: { order }, req });
          } else {
            await payload.create({
              collection, req,
              data: {
                name: member.name, title: "bio" in member ? member.bio : member.title,
                photo: typeof member.photo === "object" ? member.photo?.id : member.photo,
                isCurrent: member.isCurrent, order,
              },
            });
            // Keep the original record for recovery without showing it in two sections.
            await payload.update({ collection: reference.relationTo, id, data: { isCurrent: false }, req });
          }
        }
      }
    }
    if (apply && presidents.size) {
      await payload.updateGlobal({ slug: "committee-roles", data: { roles }, req });
      await payload.db.commitTransaction(transactionID);
    } else {
      await payload.db.rollbackTransaction(transactionID);
    }
    return [...presidents].reduce((count, role) => count + (role.members?.length ?? 0), 0);
  } catch (error) {
    await payload.db.rollbackTransaction(transactionID);
    throw error;
  }
}
