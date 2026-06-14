import { cn } from "@/lib/cn";

type Props = {
  className?: string;
};

/**
 * Horizontal ink-wash divider that simulates a brushstroke bleeding into rice paper.
 * Pure SVG — no image dependency.
 */
export function InkDivider({ className }: Props) {
  return (
    <div className={cn("flex justify-center py-12", className)}>
      <svg
        width="100%"
        height="40"
        viewBox="0 0 800 40"
        preserveAspectRatio="none"
        className="max-w-2xl opacity-70"
        aria-hidden="true"
      >
        <defs>
          <filter id="ink-bleed" x="-10%" y="-50%" width="120%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
          <linearGradient id="ink-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0" />
            <stop offset="20%" stopColor="#2c2c2c" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#1a1a1a" stopOpacity="1" />
            <stop offset="80%" stopColor="#2c2c2c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1a1a1a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M20 20 Q 200 12, 400 20 T 780 20"
          stroke="url(#ink-grad)"
          strokeWidth="2.2"
          fill="none"
          filter="url(#ink-bleed)"
        />
        <circle cx="400" cy="20" r="3.5" fill="#8B2323" opacity="0.85" />
      </svg>
    </div>
  );
}
