import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { MemberAnchor, type AnchoredMember } from "@/components/shared/MemberAnchor";

export type HonoraryPresident = AnchoredMember & { title?: string };

/**
 * 榮譽會長 — invited from government and public life. No hierarchy among them,
 * so this must not grow `CommitteeRoster`'s spine and tiers: one peer row only,
 * after the 匾額 hung in a clan hall. Order is protocol, set by hand in the CMS.
 */
export function HonoraryBoard({ members }: { members: HonoraryPresident[] }) {
  return (
    <RevealOnScroll className="mt-14">
      <div className="relative mx-auto max-w-4xl border border-gold/35 px-6 py-14 sm:px-10">
        {/* inner beading — the double rule of a lacquered plaque */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[6px] border border-gold/20"
        />

        {/* ponytail: flex-wrap, not a fixed grid — the board starts with one or two
            honorees and grows, and centring has to hold at every count. */}
        <ul className="relative flex flex-wrap justify-center gap-x-14 gap-y-12">
          {members.map((member) => (
            <li key={member.id} className="group flex w-40 flex-col items-center text-center">
              <MemberAnchor member={member} size={96} tone="gold" />
              <h3 className="mt-5 font-calligraphy text-3xl leading-none text-ink transition-colors group-hover:text-gold">
                {member.name}
              </h3>
              {member.title && (
                <p className="mt-2.5 font-sans-zh text-xs leading-relaxed tracking-[0.15em] text-stone">
                  {member.title}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </RevealOnScroll>
  );
}
