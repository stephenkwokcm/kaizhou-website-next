import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Association emblem (會徽) — the circular logo, cropped to a circle so the
 * source image's square white corners are clipped away.
 */
export function Logo({
  size = 44,
  className,
  priority,
}: {
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/images/logo.jpg"
      alt="香港開州同鄉會 會徽"
      width={size}
      height={size}
      priority={priority}
      sizes={`${size}px`}
      className={cn("rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
