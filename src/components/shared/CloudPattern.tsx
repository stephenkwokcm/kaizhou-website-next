import { cn } from "@/lib/cn";

/** Decorative traditional Chinese cloud (雲紋) pattern, repeats horizontally. */
export function CloudPattern({ className }: { className?: string }) {
  return (
    <svg
      className={cn("opacity-30", className)}
      viewBox="0 0 200 40"
      width="100%"
      height="40"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern id="cloud-tile" x="0" y="0" width="80" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M5 25 q 5 -10 15 -10 q 8 0 12 6 q 4 -8 14 -8 q 12 0 14 12 q 0 6 -8 8 l -38 0 q -8 -2 -9 -8 z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="60" cy="22" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#cloud-tile)" />
    </svg>
  );
}
