import type { CollectionConfig } from "payload";
import { slugField } from "@/lib/slugField";
import { adminOrEditor, anyone } from "@/access";

export const News: CollectionConfig = {
  slug: "news",
  labels: { singular: "最新消息", plural: "最新消息" },
  admin: {
    group: "內容",
    useAsTitle: "title",
    defaultColumns: ["title", "publishDate", "status"],
    listSearchableFields: ["title", "excerpt"],
    description: "管理網站的最新消息與公告。",
  },
  access: {
    read: anyone,
    create: adminOrEditor,
    update: adminOrEditor,
    delete: adminOrEditor,
  },
  fields: [
    { name: "title", type: "text", required: true, label: "標題" },
    slugField("留空會自動從標題產生，一般無須修改。"),
    {
      name: "publishDate",
      type: "date",
      label: "發佈日期",
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" }, description: "留空預設為今天。" },
    },
    {
      name: "status",
      type: "select",
      label: "狀態",
      defaultValue: "draft",
      options: [
        { label: "草稿", value: "draft" },
        { label: "已發佈", value: "published" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      label: "封面圖片",
      admin: { description: "建議尺寸 1920×1080 或以上；JPG／PNG／WebP。" },
    },
    {
      name: "excerpt",
      type: "textarea",
      label: "摘要",
      admin: { description: "列表與分享預覽顯示的簡短描述，約 100–150 字。" },
    },
    {
      name: "content",
      type: "richText",
      label: "內文",
      admin: {
        description: "文章正文。用上方工具列設定標題、粗體、清單、插入圖片。",
        components: {
          beforeInput: [
            { path: "/components/admin/ContentStarter", clientProps: { target: "content" } },
          ],
        },
      },
    },
  ],
};
