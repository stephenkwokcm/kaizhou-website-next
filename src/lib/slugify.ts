export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[\s　]+/g, "-")
    .replace(/[^\w一-鿿-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
