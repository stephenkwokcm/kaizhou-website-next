/**
 * Shown in place of CMS-driven lists when there is no content yet, so the site
 * never displays fabricated entries before real content is published.
 */
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center font-serif-zh text-base text-ink-soft/45 tracking-wide">
      {message}
    </div>
  );
}
