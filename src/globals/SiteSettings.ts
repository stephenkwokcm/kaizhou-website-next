import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "網站設定",
  admin: { group: "系統" },
  access: { read: () => true },
  fields: [
    { name: "siteName", type: "text", label: "網站名稱", defaultValue: "香港開州同鄉會" },
    { name: "logo", type: "upload", relationTo: "media", label: "標誌", admin: { description: "SVG 或 PNG，建議 200×200 或以上。" } },
    { name: "sealImage", type: "upload", relationTo: "media", label: "印章", admin: { description: "官方印章圖案（PNG 透明背景，約 400×400）。" } },
    {
      name: "contactInfo",
      type: "group",
      label: "聯絡資訊",
      fields: [
        { name: "address", type: "text", label: "地址", localized: true, admin: { description: "此欄支援多語言。" } },
        { name: "phone", type: "text", label: "電話" },
        { name: "fax", type: "text", label: "傳真" },
        { name: "email", type: "email", label: "電郵" },
        { name: "officeHours", type: "text", label: "辦公時間", admin: { description: "例: 星期一至五 10:00 – 18:00（公眾假期休息）" } },
        { name: "wechatQR", type: "upload", relationTo: "media", label: "微信二維碼", admin: { description: "約 300×300 PNG。" } },
      ],
    },
    {
      name: "socialLinks",
      type: "array",
      label: "社交媒體連結",
      fields: [
        {
          // Kept as free text: existing rows hold arbitrary platform names
          // (e.g. "WeChat") and the value is never rendered (the footer reads
          // only `url`), so an enum conversion would fail the schema push for
          // no benefit.
          name: "platform",
          type: "text",
          label: "平台",
          required: true,
          admin: { description: "例：Facebook、WeChat、Instagram、YouTube、小紅書" },
        },
        { name: "url", type: "text", required: true, label: "連結網址", admin: { description: "完整網址，含 https://" } },
      ],
    },
    { name: "footerText", type: "richText", label: "頁尾文字" },
  ],
};
