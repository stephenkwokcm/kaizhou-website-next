import type { CollectionConfig } from "payload";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^\w\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const Activities: CollectionConfig = {
  slug: "activities",
  labels: {
    singular: "會務活動",
    plural: "會務活動",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "eventDate", "eventType"],
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
      admin: { position: "sidebar" },
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
      name: "eventDate",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "eventType",
      type: "select",
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
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "description",
      type: "richText",
    },
    {
      name: "gallery",
      type: "array",
      labels: { singular: "圖片", plural: "圖片集" },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
};
