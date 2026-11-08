import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "@payload-config";
import { migrateRoleAssignments } from "../src/lib/committee-roles";
import { loadCommitteeRoster } from "../src/lib/committee-roster";

if (new URL(process.env.DATABASE_URL!).pathname !== "/roles_test") throw new Error("Use the disposable roles_test database only.");
const payload = await getPayload({ config });
try {
  const first = await payload.create({ collection: "committee-members", data: { name: "測試甲", title: "副會長", order: 2 } });
  const retired = await payload.create({ collection: "committee-members", data: { name: "測試乙", title: "創會會長", order: 1, isCurrent: false } });
  const honorary = await payload.create({ collection: "honorary-presidents", data: { name: "測試丙", title: "測試公職" } });
  const before = await loadCommitteeRoster(payload);
  assert.equal(before.flatMap((role) => role.members).length, 2);
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [] } }), /遷移/);
  const roles = migrateRoleAssignments([retired, first], [honorary], { 創會會長: "會長" });
  await payload.updateGlobal({ slug: "committee-roles", data: { roles }, context: { committeeRoleMigration: true } });
  assert.equal((await payload.findByID({ collection: "committee-members", id: retired.id })).title, "創會會長");
  assert.equal((await payload.findByID({ collection: "honorary-presidents", id: honorary.id })).title, "測試公職");
  const loaded = await loadCommitteeRoster(payload);
  assert.deepEqual(loaded.map((role) => role.name), ["榮譽會長", "副會長"]);
  assert.equal(loaded[0].members[0].bio, "測試公職");
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles }, overrideAccess: false }), /not allowed|Forbidden|permission|權限/i);
  const editor = { id: 999, collection: "users", roles: ["editor"] };
  const reordered = [...roles].reverse();
  reordered.find((role) => role.name === "副會長")!.color = "#123456";
  await payload.updateGlobal({ slug: "committee-roles", data: { roles: reordered }, overrideAccess: false, user: editor });
  const after = await loadCommitteeRoster(payload);
  assert.deepEqual(after.map((role) => role.name), ["副會長", "榮譽會長"]);
  assert.equal(after[0].color, "#123456");
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [{ ...roles[0], color: "red;display:none" }] } }));
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [roles[0], { ...roles[0], name: "重複分配" }] } }), /只能/);
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [{ ...roles[0], members: [{ relationTo: "committee-members", value: 999999 }] }] } }));
  const retained = await payload.findGlobal({ slug: "committee-roles", depth: 0 });
  assert.equal(retained.roles?.length, 11);
  await payload.delete({ collection: "committee-members", id: first.id });
  assert.equal((await loadCommitteeRoster(payload)).flatMap((role) => role.members).length, 1);
  await payload.updateGlobal({ slug: "committee-roles", data: { roles: [] } });
  assert.deepEqual(await loadCommitteeRoster(payload), []);
  assert.equal((await payload.findByID({ collection: "honorary-presidents", id: honorary.id })).name, "測試丙");
  console.log("committee-roles.integration.test.ts: all assertions passed");
} finally {
  await payload.destroy();
}
