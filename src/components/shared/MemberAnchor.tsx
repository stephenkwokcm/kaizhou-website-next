import { MediaImage } from "@/components/shared/MediaImage";
import type { ImageData } from "@/lib/media";

export type AnchoredMember = {
  id: string | number;
  name: string;
  photo?: ImageData | null;
};

/**
 * Vermillion is the association acting under its own seal (印) — the working
 * committee. Gold is an honour inscribed for a guest (匾). Same artifact, two
 * meanings, so the tone is the only thing that differs.
 */
const TONES = {
  vermillion: {
    ring: "ring-vermillion/30",
    seal: "bg-vermillion text-paper ring-vermillion-deep/70 shadow-[0_8px_24px_-10px_rgba(139,35,35,0.75)]",
    carve: "ring-paper/25",
  },
  gold: {
    ring: "ring-gold/50",
    seal: "bg-ink text-gold-soft ring-gold/40 shadow-[0_8px_24px_-10px_rgba(26,26,26,0.55)]",
    carve: "ring-gold/30",
  },
} as const;

/** A member's photo, or — when there is none — a name-seal (姓氏印) of their surname. */
export function MemberAnchor({
  member,
  size,
  tone = "vermillion",
}: {
  member: AnchoredMember;
  size: number;
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];

  if (member.photo) {
    return (
      <span
        className={`relative block shrink-0 overflow-hidden rounded-full ring-1 ${t.ring} transition-transform duration-500 group-hover:-translate-y-0.5`}
        style={{ width: size, height: size }}
      >
        <MediaImage image={member.photo} aspectRatio="1 / 1" label="" sizes={`${size}px`} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center rounded-[7px] ring-1 ${t.seal} transition-transform duration-500 group-hover:-translate-y-0.5`}
      style={{ width: size, height: size }}
    >
      {/* carved inner border, like an engraved seal */}
      <span className={`pointer-events-none absolute inset-[3px] rounded-[4px] ring-1 ${t.carve}`} />
      <span className="font-calligraphy leading-none" style={{ fontSize: Math.round(size * 0.55) }}>
        {member.name.slice(0, 1)}
      </span>
    </span>
  );
}
