import type { CollectionConfig } from "payload";

export const CommitteeMembers: CollectionConfig = {
  slug: "committee-members",
  labels: {
    singular: "理事會成員",
    plural: "理事會成員",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "title", "isCurrent", "order"],
    listSearchableFields: ["name", "title"],
  },
  access: {
    read: () => true,
  },
  defaultSort: "order",
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "title",
      type: "text",
      admin: { description: "例: 會長 / 副會長 / 秘書長 / 理事" },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 100,
      admin: { position: "sidebar" },
    },
    {
      name: "isCurrent",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "bio",
      type: "textarea",
    },
  ],
};
