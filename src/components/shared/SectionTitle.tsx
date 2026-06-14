import { cn } from "@/lib/cn";
import { SealStamp } from "./SealStamp";

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
      {seal ? <SealStamp text={seal} size={48} className="-translate-y-1" /> : null}
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
