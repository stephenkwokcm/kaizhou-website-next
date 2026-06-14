import Image from "next/image";
import { cn } from "@/lib/cn";
import type { ImageData } from "@/lib/media";
import { Placeholder } from "./Placeholder";

type Props = {
  image?: ImageData | null;
  aspectRatio?: string;
  /** Placeholder label shown when no image has been uploaded in the CMS. */
  label?: string;
  className?: string;
  sizes?: string;
};

/**
 * Renders a Payload media image, falling back to the grey `Placeholder`
 * block when the document has no image uploaded yet.
 */
export function MediaImage({
  image,
  aspectRatio = "16 / 9",
  label,
  className,
  sizes = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
}: Props) {
  if (!image?.url) {
    return <Placeholder aspectRatio={aspectRatio} label={label} className={className} />;
  }
  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-sm bg-paper-dark", className)}
      style={{ aspectRatio }}
    >
      <Image
        src={image.url}
        alt={image.alt ?? ""}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
