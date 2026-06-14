type Props = {
  data: Record<string, unknown>;
};

/**
 * Renders a JSON-LD structured-data script tag.
 *
 * Output is JSON.stringify-ed (never raw HTML) with `<`, `>`, `&` and the
 * JS line separators replaced by \u escapes, so CMS-provided strings cannot
 * close the script tag or otherwise break out — the pattern recommended by
 * the Next.js JSON-LD docs.
 */
export function JsonLd({ data }: Props) {
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
