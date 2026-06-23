import { cn } from "@/lib/cn";

type Props = {
  zh: string;
  en?: string;
  align?: "left" | "center";
  seal?: string;
  className?: string;
  invert?: boolean;
};

export function SectionTitle({
  zh,
  en,
  align = "left",
  seal,
  className,
  invert = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex items-end gap-4",
        align === "center" && "justify-center text-center",
        className,
      )}
    >
      {seal ? <Seal text={seal} /> : null}
      <div>
        <h2
          className={cn(
            "font-calligraphy text-4xl leading-none md:text-5xl",
            invert ? "text-paper" : "text-ink",
          )}
        >
          {zh}
        </h2>
        {en ? (
          <p
            className={cn(
              "mt-2 font-sans-zh text-xs uppercase tracking-[0.25em]",
              invert ? "text-paper/60" : "text-stone",
            )}
          >
            {en}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Vermillion seal stamp (印章) — two stylized characters on a red rounded
 * square. Inlined here because SectionTitle is its only caller.
 */
function Seal({ text }: { text: string }) {
  const chars = text.slice(0, 2).split("");
  while (chars.length < 2) chars.push(" ");

  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 100 100"
      className="inline-block shrink-0 -translate-y-1"
      aria-hidden="true"
    >
      <defs>
        <filter id="seal-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <rect x="4" y="4" width="92" height="92" rx="8" fill="#8B2323" stroke="#6e1a1a" strokeWidth="1.5" />
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
