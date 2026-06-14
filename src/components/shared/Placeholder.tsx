import { cn } from "@/lib/cn";

type Props = {
  aspectRatio?: string;
  label?: string;
  className?: string;
};

/**
 * Aspect-ratio grey rectangle with a centered camera glyph.
 * Marks itself with `data-placeholder="true"` so it's easy to find later.
 */
export function Placeholder({ aspectRatio = "16 / 9", label, className }: Props) {
  return (
    <div
      data-placeholder="true"
      className={cn(
        "relative w-full overflow-hidden rounded-sm border border-stone/20 bg-paper-dark",
        className,
      )}
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone/60">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M4 7h3l2-2h6l2 2h3v12H4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        {label ? (
          <span className="px-3 text-center text-xs tracking-wide font-sans-zh text-stone/70">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
