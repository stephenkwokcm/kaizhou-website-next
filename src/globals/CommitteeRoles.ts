import { APIError, type GlobalConfig } from "payload";
import { adminOrEditor, anyone } from "@/access";
import { INITIAL_COMMITTEE_ROLES, validateRoleAssignments } from "@/lib/committee-roles";

export const CommitteeRoles: GlobalConfig = {
  slug: "committee-roles",
  label: "職銜與排序",
  admin: {
    group: "現任理事會",
    description: "只設定「現任理事會」的職銜、顏色及排序，只可加入「理事會成員」。榮譽會長及名譽會長於各自頁面管理。",
  },
  access: { read: anyone, update: adminOrEditor },
  hooks: {
    beforeChange: [async ({ data, originalDoc, req, context }) => {
      if (!originalDoc?.updatedAt && !context.committeeRoleMigration) {
        const count = await req.payload.count({ collection: "committee-members", req });
        if (count.totalDocs > 0) {
          throw new APIError("請先執行職銜遷移，保留現有成員分配後再編輯。", 400);
        }
      }
      const result = validateRoleAssignments(data.roles ?? []);
      if (result !== true) throw new APIError(result, 400);
      return data;
    }],
  },
  fields: [
    {
      name: "roles",
      type: "array",
      label: "職銜",
      labels: { singular: "職銜", plural: "職銜" },
      defaultValue: INITIAL_COMMITTEE_ROLES,
      interfaceName: "CommitteeRole",
      admin: {
        initCollapsed: true,
        components: { RowLabel: "/components/admin/RoleRowLabel" },
        description: "從上至下顯示；沒有現任成員的職銜會自動隱藏。",
      },
      fields: [
        { name: "name", type: "text", label: "職銜名稱", required: true },
        {
          name: "color", type: "text", label: "職銜顏色", required: true, defaultValue: "#8b2323",
          validate: (value: string | null | undefined) => /^#[0-9a-f]{6}$/i.test(value ?? "") || "請輸入六位十六進位色碼，例如 #8b2323。",
          admin: { components: { Field: "/components/admin/RoleColor" } },
        },
        {
          name: "appearance", type: "select", label: "展示樣式", required: true, defaultValue: "standard",
          options: [
            { label: "標準姓氏印", value: "standard" },
            { label: "榮譽姓氏印（墨底）", value: "honorary" },
            { label: "會長大印", value: "chair" },
          ],
        },
        {
          name: "members", type: "relationship", label: "成員", hasMany: true,
          // shortcut: retain the old relation column for safe migration; remove after all environments split their president sections.
          relationTo: ["committee-members", "honorary-presidents"],
          filterOptions: ({ relationTo }) => relationTo === "committee-members",
          admin: {
            allowCreate: false, allowEdit: false, isSortable: true,
            description: "只可選取理事會成員，拖曳調整同一職銜內的順序。已卸任成員保留分配，但不會顯示於前台。",
          },
        },
      ],
    },
  ],
};
