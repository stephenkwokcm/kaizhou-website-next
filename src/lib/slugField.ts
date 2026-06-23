import type { Field, FieldHook } from "payload";
import { slugify } from "@/lib/slugify";

// Auto-derive the slug from the title when left blank. Shared by the content
// collections (News, Activities), whose slug fields were otherwise identical.
const slugFromTitle: FieldHook = ({ value, data }) => {
  if (typeof value === "string" && value.length > 0) return value;
  if (data?.title && typeof data.title === "string") return slugify(data.title);
  return value;
};

export const slugField = (description = "留空會自動產生。"): Field => ({
  name: "slug",
  type: "text",
  label: "網址名稱",
  unique: true,
  index: true,
  admin: { hidden: true, description },
  hooks: { beforeValidate: [slugFromTitle] },
});
