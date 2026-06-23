import type { CollectionConfig } from "payload";
import { adminOnly, adminOrEditor } from "@/access";

export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "聯絡查詢", plural: "聯絡查詢" },
  admin: {
    group: "媒體・查詢",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "createdAt", "readStatus"],
    description: "網站聯絡表單的查詢會自動出現在這裡，無法手動新增。",
  },
  access: {
    // Public submissions come through /api/contact-submit (local API, overrides
    // access), so blocking create here only removes the admin "Create" button
    // and the public REST create — the contact form keeps working.
    create: () => false,
    read: adminOrEditor,
    update: adminOrEditor,
    delete: adminOnly,
  },
  fields: [
    { name: "name", type: "text", required: true, label: "姓名" },
    { name: "email", type: "email", required: true, label: "電郵" },
    { name: "phone", type: "text", label: "電話" },
    { name: "message", type: "textarea", required: true, label: "查詢內容" },
    {
      name: "readStatus",
      type: "checkbox",
      defaultValue: false,
      label: "已讀",
      admin: { position: "sidebar", description: "勾選表示已處理此查詢。" },
    },
  ],
};
