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
  // Use the named size only when it actually resolved to a URL; else the original.
  const src = sized?.url ? sized : value;
  if (!src.url) return null;
  return {
    url: src.url,
    alt: value.alt ?? undefined,
    width: src.width ?? undefined,
    height: src.height ?? undefined,
  };
}
