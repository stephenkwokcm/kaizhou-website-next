import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
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
    {
      name: "alt",
      type: "text",
    },
  ],
};
