import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "網站設定",
  access: {
    read: () => true,
  },
  fields: [
    { name: "siteName", type: "text", defaultValue: "香港開州同鄉會" },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "sealImage", type: "upload", relationTo: "media", admin: { description: "印章圖案" } },
    {
      name: "contactInfo",
      type: "group",
      fields: [
        { name: "address", type: "text", localized: true },
        { name: "phone", type: "text" },
        { name: "fax", type: "text" },
        { name: "email", type: "email" },
        { name: "officeHours", type: "text", admin: { description: "例: 星期一至五 10:00 – 18:00（公眾假期休息）" } },
        { name: "wechatQR", type: "upload", relationTo: "media" },
      ],
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        { name: "platform", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
    {
      name: "footerText",
      type: "richText",
    },
  ],
};
