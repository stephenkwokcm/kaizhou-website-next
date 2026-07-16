import type { CollectionConfig } from "payload";
import { adminOrEditor, anyone } from "@/access";

export const HonoraryPresidents: CollectionConfig = {
  slug: "honorary-presidents",
  labels: { singular: "榮譽會長", plural: "榮譽會長" },
  admin: {
    group: "內容",
    useAsTitle: "name",
    defaultColumns: ["name", "title", "isCurrent", "order"],
    listSearchableFields: ["name", "title"],
    description: "管理本會敦聘的榮譽會長名錄（政府及各界嘉賓）。",
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
      // ponytail: free text, not a select like 理事會成員.職銜 — government offices
      // are open-ended (立法會議員、局長、區議員…) and would need an enum edit plus a
      // schema push for every new appointee.
      admin: { description: "現任公職或銜頭，顯示於姓名下方。例：立法會議員、民政事務總署署長。" },
    },
    {
      name: "order",
      type: "number",
      label: "顯示順序",
      defaultValue: 100,
      admin: { position: "sidebar", description: "數字越小越靠前。名次按禮節排列，請自行編定。預設 100。" },
    },
    {
      name: "isCurrent",
      type: "checkbox",
      label: "現任榮譽會長",
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
