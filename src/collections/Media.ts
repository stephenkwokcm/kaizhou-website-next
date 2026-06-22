import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "媒體", plural: "媒體庫" },
  admin: {
    group: "媒體・查詢",
    useAsTitle: "title",
    description: "網站所有圖片集中於此管理。",
  },
  access: { read: () => true },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "thumbnail", width: 400 },
      { name: "card", width: 800 },
      { name: "hero", width: 1920 },
    ],
    mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/gif"],
  },
  fields: [
    { name: "title", type: "text", label: "名稱", admin: { description: "方便在媒體庫辨識的名稱（例：理事會合照）。" } },
    { name: "alt", type: "text", label: "替代文字", admin: { description: "供螢幕閱讀器朗讀；簡述圖片內容，例：理事會成員合照。" } },
  ],
};
