import type { CollectionConfig } from "payload";
import { adminOrEditor, anyone } from "@/access";

export const HonoraryPresidents: CollectionConfig = {
  slug: "honorary-presidents",
  labels: { singular: "榮譽會長", plural: "榮譽會長" },
  admin: {
    group: "會長名單",
    useAsTitle: "name",
    defaultColumns: ["name", "title", "isCurrent"],
    listSearchableFields: ["name", "title"],
    description: "管理榮譽會長資料及顯示順序，於前台獨立區塊展示，顏色固定。",
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
      type: "text",
      label: "公職／銜頭",
      admin: { description: "現任公職或銜頭，顯示於姓名下方。例：立法會議員、民政事務總署署長。" },
    },
    {
      name: "order",
      type: "number",
      label: "顯示順序",
      defaultValue: 100,
      admin: { description: "數字越小越先顯示；相同時按建立順序排列。" },
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
      admin: { description: "人像相片，建議正方形 400×400 或以上。未上傳時將以姓氏印代替。" },
    },
  ],
};
