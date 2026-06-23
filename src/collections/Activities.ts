import type { CollectionConfig } from "payload";
import { slugField } from "@/lib/slugField";
import { ADMIN_DATE_FORMAT } from "@/lib/format";
import { adminOrEditor, anyone } from "@/access";

export const Activities: CollectionConfig = {
  slug: "activities",
  labels: { singular: "會務活動", plural: "會務活動" },
  admin: {
    group: "內容",
    useAsTitle: "title",
    defaultColumns: ["title", "eventDate", "eventType"],
    listSearchableFields: ["title", "location"],
    description: "管理活動預告與活動回顧。",
  },
  access: {
    read: anyone,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  fields: [
    { name: "title", type: "text", required: true, label: "標題" },
    slugField(),
    {
      name: "eventDate",
      type: "date",
      label: "活動日期",
      required: true,
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime", displayFormat: ADMIN_DATE_FORMAT } },
    },
    {
      name: "eventType",
      type: "select",
      label: "活動類型",
      defaultValue: "upcoming",
      options: [
        { label: "活動預告", value: "upcoming" },
        { label: "活動回顧", value: "past" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "location",
      type: "text",
      label: "地點",
      admin: { description: "場地名稱或地址，例：香港灣仔會議展覽中心。" },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      label: "封面圖片",
      admin: { description: "建議尺寸 1920×1080 或以上。" },
    },
    {
      name: "description",
      type: "richText",
      label: "活動內容",
      admin: {
        description: "詳述活動內容、流程、參加者等。",
        components: {
          beforeInput: [
            { path: "/components/admin/ContentStarter", clientProps: { target: "description" } },
          ],
        },
      },
    },
    {
      name: "gallery",
      type: "array",
      label: "活動相片",
      labels: { singular: "圖片", plural: "圖片集" },
      admin: { description: "上傳活動相片（建議 5–20 張）。" },
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true, label: "圖片" }],
    },
  ],
};
