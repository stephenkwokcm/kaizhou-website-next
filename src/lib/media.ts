import type { Media } from "@/payload-types";

export type ImageData = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
};

/**
 * Extract a usable image URL from a Payload upload relation value.
 * The value is a bare id when the relation isn't populated, or a `Media`
 * doc when it is (default query depth populates it). Prefers the named
 * generated size and falls back to the original upload.
 */
export function pickImage(
  value: number | Media | null | undefined,
  size?: "thumbnail" | "card" | "hero",
): ImageData | null {
  if (!value || typeof value === "number") return null;
  const sized = size ? value.sizes?.[size] : null;
  const url = sized?.url || value.url;
  if (!url) return null;
  return {
    url,
    alt: value.alt ?? undefined,
    width: (sized?.url ? sized.width : value.width) ?? undefined,
    height: (sized?.url ? sized.height : value.height) ?? undefined,
  };
}
