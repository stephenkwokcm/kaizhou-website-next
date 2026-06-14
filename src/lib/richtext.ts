/**
 * Flatten a Payload Lexical richText value into plain text — used for
 * card excerpts where we don't want full rich rendering.
 */
export function lexicalToPlainText(value: unknown, maxLength = 160): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const root = (value as { root?: { children?: unknown[] } }).root;
  if (!root?.children) return undefined;

  const parts: string[] = [];
  const walk = (nodes: unknown[]) => {
    for (const node of nodes) {
      if (!node || typeof node !== "object") continue;
      const n = node as { text?: unknown; children?: unknown[] };
      if (typeof n.text === "string") parts.push(n.text);
      if (Array.isArray(n.children)) walk(n.children);
    }
  };
  walk(root.children);

  const text = parts.join("").trim();
  if (!text) return undefined;
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
