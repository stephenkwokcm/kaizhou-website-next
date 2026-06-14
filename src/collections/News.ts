import type { CollectionConfig } from "payload";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const News: CollectionConfig = {
  slug: "news",
  labels: {
    singular: "最新消息",
    plural: "最新消息",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishDate", "status"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Auto-generated from title if left blank.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (typeof value === "string" && value.length > 0) return value;
            if (data?.title && typeof data.title === "string") {
              return slugify(data.title);
            }
            return value;
          },
        ],
      },
    },
    {
      name: "publishDate",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "status",
      type: "select",
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
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "content",
      type: "richText",
    },
  ],
};
