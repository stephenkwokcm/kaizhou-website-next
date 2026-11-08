import { Fragment } from "react";
import { RevealOnScroll } from "@/components/shared/RevealOnScroll";
import { MemberAnchor, type AnchoredMember } from "@/components/shared/MemberAnchor";
import type { RoleConfiguration } from "@/lib/committee-roles";

export type CommitteeMember = AnchoredMember & { bio?: string };
export type CommitteeTier = Pick<RoleConfiguration, "name" | "color" | "appearance"> & {
  id: string;
  members: CommitteeMember[];
};

export function CommitteeRoster({ roles }: { roles: CommitteeTier[] }) {
  return (
    <div className="mt-16">
      {roles.map((role, index) => (
        <Fragment key={role.id}>
          {index > 0 && (
            <div className="flex justify-center py-10" aria-hidden="true">
              <span className="h-14 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent" />
            </div>
          )}
          <section aria-label={role.name}>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-14">
              {role.members.map((member, memberIndex) => {
                const chair = role.appearance === "chair";
                const honorary = role.appearance === "honorary";
                return (
                  <li key={member.id} className={chair ? "w-full" : "w-40 sm:w-56"}>
                    <RevealOnScroll delay={memberIndex * 0.04}>
                      <article className="group flex flex-col items-center px-4 text-center">
                        <MemberAnchor member={member} size={chair ? 112 : honorary ? 96 : 76} color={role.color} tone={honorary ? "gold" : "vermillion"} />
                        <div className={`mt-5 font-sans-zh uppercase ${chair ? "text-[11px] tracking-[0.5em]" : "text-[10px] tracking-[0.4em]"}`} style={{ color: role.color }}>
                          {role.name}
                        </div>
                        <h3 className={`mt-2 font-calligraphy leading-none text-ink ${chair ? "text-5xl md:text-6xl" : "text-3xl"}`}>
                          {member.name}
                        </h3>
                        {member.bio && (
                          <p className={`mt-3 font-serif-zh leading-relaxed text-ink-soft/65 ${chair ? "max-w-sm text-sm" : "max-w-[20ch] text-xs"}`}>
                            {member.bio}
                          </p>
                        )}
                        {chair && <span className="mt-8 block h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />}
                      </article>
                    </RevealOnScroll>
                  </li>
                );
              })}
            </ul>
          </section>
        </Fragment>
      ))}
    </div>
  );
}
