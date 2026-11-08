import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { getPayload } from "payload";
import config from "@payload-config";
import { splitPresidentSections } from "../src/lib/split-president-sections";
import { migrateRoleAssignments } from "../src/lib/committee-roles";
import { loadCommitteeRoster, loadPresidentBoards } from "../src/lib/committee-roster";

if (new URL(process.env.DATABASE_URL!).pathname !== "/roles_test") throw new Error("Use the disposable roles_test database only.");
const payload = await getPayload({ config });
try {
  const first = await payload.create({ collection: "committee-members", data: { name: "測試甲", title: "副會長", order: 2 } });
  const retired = await payload.create({ collection: "committee-members", data: { name: "測試乙", title: "創會會長", order: 1, isCurrent: false } });
  const honorary = await payload.create({ collection: "honorary-presidents", data: { name: "測試丙", title: "測試公職" } });
  const before = await loadCommitteeRoster(payload);
  assert.equal(before.flatMap((role) => role.members).length, 1);
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [] } }), /遷移/);
  const roles = migrateRoleAssignments([retired, first], { 創會會長: "會長" });
  await payload.updateGlobal({ slug: "committee-roles", data: { roles }, context: { committeeRoleMigration: true } });
  assert.equal((await payload.findByID({ collection: "committee-members", id: retired.id })).title, "創會會長");
  assert.equal((await payload.findByID({ collection: "honorary-presidents", id: honorary.id })).title, "測試公職");
  const loaded = await loadCommitteeRoster(payload);
  assert.deepEqual(loaded.map((role) => role.name), ["副會長"]);
  const titular = await payload.create({ collection: "titular-presidents", data: { name: "測試丁", title: "測試銜頭" } });
  const boards = await loadPresidentBoards(payload);
  assert.deepEqual(boards.map((board) => board.name), ["榮譽會長", "名譽會長"]);
  assert.equal(boards[0].members[0].bio, "測試公職");
  assert.equal(boards[1].members[0].name, titular.name);
  assert.ok(boards.every((board) => board.color === "#c5a55a"));
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles }, overrideAccess: false }), /not allowed|Forbidden|permission|權限/i);
  const editor = { id: 999, collection: "users", roles: ["editor"] };
  const reordered = [...roles].reverse();
  reordered.find((role) => role.name === "副會長")!.color = "#123456";
  await payload.updateGlobal({ slug: "committee-roles", data: { roles: reordered }, overrideAccess: false, user: editor });
  const after = await loadCommitteeRoster(payload);
  assert.deepEqual(after.map((role) => role.name), ["副會長"]);
  assert.equal(after[0].color, "#123456");
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [{ ...roles[0], color: "red;display:none" }] } }));
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [roles[2], { ...roles[2], name: "重複分配" }] } }), /只能/);
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [{ ...roles[0], members: [{ relationTo: "committee-members", value: 999999 }] }] } }));
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [{ ...roles[0], name: "名譽會長" }] } }), /各自/);
  await assert.rejects(payload.updateGlobal({ slug: "committee-roles", data: { roles: [{ ...roles[0], members: [{ relationTo: "honorary-presidents", value: honorary.id }] }] } }));
  const retained = await payload.findGlobal({ slug: "committee-roles", depth: 0 });
  assert.equal(retained.roles?.length, 9);
  await payload.delete({ collection: "committee-members", id: first.id });
  assert.equal((await loadCommitteeRoster(payload)).flatMap((role) => role.members).length, 0);
  await payload.updateGlobal({ slug: "committee-roles", data: { roles: [] } });
  assert.deepEqual(await loadCommitteeRoster(payload), []);
  assert.equal((await payload.findByID({ collection: "honorary-presidents", id: honorary.id })).name, "測試丙");
  assert.equal((await loadPresidentBoards(payload)).flatMap((board) => board.members).length, 2);
  const moving = await payload.create({ collection: "committee-members", data: { name: "轉任測試", bio: "保留簡介" } });
  const legacyRoles = [
    { ...roles[0], members: [{ relationTo: "committee-members", value: retired.id }] },
    { name: "榮譽會長", color: "#ffffff", appearance: "honorary", members: [{ relationTo: "committee-members", value: moving.id }] },
    { name: "名譽會長", color: "#000000", appearance: "honorary", members: [{ relationTo: "honorary-presidents", value: honorary.id }] },
  ].map((role) => ({ ...role, id: randomUUID() }));
  // Bypass current validation only to recreate the previous release's saved data.
  await payload.db.updateGlobal({ slug: "committee-roles", data: { roles: legacyRoles } });
  assert.equal(await splitPresidentSections(payload, false), 2);
  assert.equal((await payload.count({ collection: "titular-presidents" })).totalDocs, 1);
  assert.equal((await payload.findByID({ collection: "committee-members", id: moving.id })).isCurrent, true);
  await payload.db.updateGlobal({ slug: "committee-roles", data: { roles: [...legacyRoles, { ...legacyRoles[1], id: randomUUID() }] } });
  await assert.rejects(splitPresidentSections(payload, true), /Duplicate/);
  assert.equal((await payload.count({ collection: "titular-presidents" })).totalDocs, 1);
  assert.equal((await payload.findByID({ collection: "committee-members", id: moving.id })).isCurrent, true);
  await payload.db.updateGlobal({ slug: "committee-roles", data: { roles: legacyRoles } });
  assert.equal(await splitPresidentSections(payload, true), 2);
  assert.equal(await splitPresidentSections(payload, true), 0);
  assert.equal((await payload.count({ collection: "titular-presidents" })).totalDocs, 2);
  assert.equal((await payload.findByID({ collection: "committee-members", id: moving.id })).isCurrent, false);
  assert.equal((await payload.findByID({ collection: "honorary-presidents", id: honorary.id })).isCurrent, false);
  const migratedBoards = await loadPresidentBoards(payload);
  assert.equal(migratedBoards[0].members[0].bio, "保留簡介");
  assert.ok(migratedBoards[1].members.some((member) => member.bio === "測試公職"));
  assert.ok(migratedBoards.every((board) => board.color === "#c5a55a"));
  assert.deepEqual((await payload.findGlobal({ slug: "committee-roles", depth: 0 })).roles?.map((role) => role.name), ["會長"]);
  console.log("committee-roles.integration.test.ts: all assertions passed");
} finally {
  await payload.destroy();
}
