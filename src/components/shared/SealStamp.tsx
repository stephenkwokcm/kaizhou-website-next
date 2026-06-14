import { cn } from "@/lib/cn";

type Props = {
  size?: number;
  text?: string;
  className?: string;
};

/**
 * Vermillion seal stamp (印章) — two stylized characters on a red rounded square.
 * Used as decorative section accent and as the fallback logo.
 */
export function SealStamp({ size = 56, text = "開州", className }: Props) {
  const chars = text.slice(0, 2).split("");
  while (chars.length < 2) chars.push(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={cn("inline-block shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <filter id="seal-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="8"
        fill="#8B2323"
        stroke="#6e1a1a"
        strokeWidth="1.5"
      />
      <rect x="4" y="4" width="92" height="92" rx="8" filter="url(#seal-grain)" />
      <text
        x="28"
        y="56"
        fontFamily="var(--font-bakudai), 'Bakudai', 'STKaiti', serif"
        fontSize="42"
        fill="#F5F0E8"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {chars[0]}
      </text>
      <text
        x="72"
        y="56"
        fontFamily="var(--font-bakudai), 'Bakudai', 'STKaiti', serif"
        fontSize="42"
        fill="#F5F0E8"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {chars[1]}
      </text>
    </svg>
  );
}
