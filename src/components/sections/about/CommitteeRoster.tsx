import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { MemberAnchor, type AnchoredMember } from "@/components/shared/MemberAnchor";

export type CommitteeMember = AnchoredMember & {
  title?: string;
  bio?: string;
};

/**
 * Leadership roster for the 現任理事會 section. Members are arranged on a
 * vertical "org spine" by rank — 會長 at the crown, then the 副會長 tier, then
 * the 秘書 / 司庫 tier — each anchored by a vermillion name-seal (姓氏印).
 */
export function CommitteeRoster({ members }: { members: CommitteeMember[] }) {
  const chair = members.find((m) => rank(m.title) === 0);
  const viceChairs = members.filter((m) => rank(m.title) === 1);
  const officers = members.filter((m) => rank(m.title) === 2);

  return (
    <div className="mt-16">
      {chair && <Crown member={chair} />}

      {viceChairs.length > 0 && (
        <>
          <Spine />
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
            {viceChairs.map((m, i) => (
              <MemberCard key={m.id} member={m} delay={i * 0.08} sealSize={76} />
            ))}
          </div>
        </>
      )}

      {officers.length > 0 && (
        <>
          <Spine />
          <div className="mx-auto grid max-w-3xl gap-x-6 gap-y-14 sm:grid-cols-3">
            {officers.map((m, i) => (
              <MemberCard key={m.id} member={m} delay={i * 0.08} sealSize={68} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Rank by role title: 0 = 會長, 1 = 副會長 tier, 2 = 秘書 / 司庫 / 理事. */
function rank(title = ""): 0 | 1 | 2 {
  if (title.includes("會長") && !title.includes("副")) return 0;
  if (title.includes("副會長")) return 1;
  return 2;
}

function Crown({ member }: { member: CommitteeMember }) {
  return (
    <RevealOnScroll className="flex flex-col items-center text-center">
      <MemberAnchor member={member} size={112} />
      <div className="mt-6 font-sans-zh text-[11px] uppercase tracking-[0.5em] text-vermillion">
        {member.title}
      </div>
      <h3 className="mt-2 font-calligraphy text-5xl leading-none text-ink md:text-6xl">
        {member.name}
      </h3>
      {member.bio && (
        <p className="mt-4 max-w-sm font-serif-zh text-sm tracking-wide text-ink-soft/70">
          {member.bio}
        </p>
      )}
      <span className="mt-8 block h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
    </RevealOnScroll>
  );
}

function MemberCard({
  member,
  delay,
  sealSize,
}: {
  member: CommitteeMember;
  delay: number;
  sealSize: number;
}) {
  return (
    <RevealOnScroll delay={delay}>
      <article className="group flex flex-col items-center px-4 text-center">
        <MemberAnchor member={member} size={sealSize} />
        <div className="mt-5 font-sans-zh text-[10px] uppercase tracking-[0.4em] text-vermillion/90">
          {member.title}
        </div>
        <h4 className="mt-1.5 font-calligraphy text-3xl leading-none text-ink transition-colors group-hover:text-vermillion">
          {member.name}
        </h4>
        {member.bio && (
          <p className="mt-3 max-w-[20ch] font-serif-zh text-xs leading-relaxed text-ink-soft/65">
            {member.bio}
          </p>
        )}
      </article>
    </RevealOnScroll>
  );
}

/** The vertical org-chart "spine" connecting the tiers. */
function Spine() {
  return (
    <div className="flex justify-center py-10" aria-hidden="true">
      <span className="h-14 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent" />
    </div>
  );
}
