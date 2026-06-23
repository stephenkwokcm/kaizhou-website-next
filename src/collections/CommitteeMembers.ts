import type { CollectionConfig } from "payload";
import { adminOrEditor, anyone } from "@/access";

export const CommitteeMembers: CollectionConfig = {
  slug: "committee-members",
  labels: { singular: "理事會成員", plural: "理事會成員" },
  admin: {
    group: "內容",
    useAsTitle: "name",
    defaultColumns: ["name", "title", "isCurrent", "order"],
    listSearchableFields: ["name", "title"],
    description: "管理理事會成員名錄。",
  },
  access: {
    read: anyone,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true, label: "姓名" },
    {
      name: "title",
      type: "select",
      label: "職銜",
      admin: { description: "從清單選擇職銜。" },
      // Values == labels (Chinese). This set is a SUPERSET of every 職銜
      // already in the DB (incl. 創會會長 / 財務長) so the text→enum schema
      // push converts cleanly. Add any new title here BEFORE assigning it.
      options: [
        { label: "創會會長", value: "創會會長" },
        { label: "會長", value: "會長" },
        { label: "副會長", value: "副會長" },
        { label: "秘書長", value: "秘書長" },
        { label: "副秘書長", value: "副秘書長" },
        { label: "財務長", value: "財務長" },
        { label: "財務", value: "財務" },
        { label: "常務理事", value: "常務理事" },
        { label: "理事", value: "理事" },
        { label: "監事", value: "監事" },
        { label: "顧問", value: "顧問" },
      ],
    },
    {
      name: "order",
      type: "number",
      label: "顯示順序",
      defaultValue: 100,
      admin: { position: "sidebar", description: "數字越小越靠前（例：會長 1、副會長 2）。預設 100。" },
    },
    {
      name: "isCurrent",
      type: "checkbox",
      label: "現任成員",
      defaultValue: true,
      admin: { position: "sidebar", description: "勾選＝現任；取消＝已卸任（仍保留記錄）。" },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: "相片",
      admin: { description: "人像相片，建議直度 400×500 或以上。" },
    },
    { name: "bio", type: "textarea", label: "簡介", admin: { description: "個人簡介，約 50–150 字。" } },
  ],
};
