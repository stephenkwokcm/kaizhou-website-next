import type { CollectionConfig } from "payload";

export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: {
    singular: "聯絡查詢",
    plural: "聯絡查詢",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt", "readStatus"],
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "message", type: "textarea", required: true },
    {
      name: "readStatus",
      type: "checkbox",
      defaultValue: false,
      label: "已讀",
      admin: { position: "sidebar" },
    },
  ],
};
