import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  type JSXConverterArgs,
  type JSXConvertersFunction,
  LinkJSXConverter,
} from "@payloadcms/richtext-lexical/react";
import type {
  DefaultNodeTypes,
  SerializedAutoLinkNode,
  SerializedLinkNode,
} from "@payloadcms/richtext-lexical";
// Payload's own URL sanitizer. Allows http/https/mailto/tel, relative paths
// (/, ./, ../) and fragment (#) URLs; strips control chars and returns "#"
// for any disallowed protocol (javascript:, data:, vbscript:, …).
import { sanitizeUrl } from "payload/shared";

// Resolve internal links (linkType === "internal") to an href, then let the
// shared sanitizer below clean it. Without this, the default converter logs an
// error and falls back to "#" for internal links. Keep it conservative.
const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const doc = linkNode.fields?.doc;
  const value = doc?.value;
  const slug = value && typeof value === "object" ? (value as { slug?: string }).slug : undefined;
  if (!slug) return "#";
  switch (doc?.relationTo) {
    case "news":
      return `/news/${slug}`;
    default:
      return `/${doc?.relationTo ?? ""}/${slug}`.replace(/\/+/g, "/");
  }
};

// Wrap a default link/autolink converter so the rendered <a> href is run
// through sanitizeUrl. Payload's JSX link converter renders href={fields.url}
// with NO sanitization, so an editor could inject a `javascript:` URL → stored
// XSS. We sanitize the href on the element the default converter produces.
type ConverterFn<Args> = (args: Args) => ReactNode;

function withSanitizedHref<Args>(
  converter: ConverterFn<Args> | ReactNode,
): ConverterFn<Args> | ReactNode {
  if (typeof converter !== "function") return converter;
  return (args: Args): ReactNode => {
    const el = (converter as ConverterFn<Args>)(args);
    if (isValidElement(el)) {
      const props = (el as ReactElement<{ href?: string }>).props;
      if (typeof props.href === "string") {
        return cloneElement(el as ReactElement<{ href?: string }>, {
          href: sanitizeUrl(props.href),
        });
      }
    }
    return el;
  };
}

/**
 * JSX converters for `<RichText converters={...}>` that harden link rendering
 * against `javascript:`/`data:`/`vbscript:` href injection (stored XSS).
 *
 * Safe to use from React Server Components (Payload's React RichText renders in
 * RSC and this module has no client-only state).
 */
export const richTextConverters: JSXConvertersFunction<DefaultNodeTypes> = ({
  defaultConverters,
}) => {
  const linkConverters = LinkJSXConverter({ internalDocToHref });
  return {
    ...defaultConverters,
    ...linkConverters,
    link: withSanitizedHref<JSXConverterArgs<SerializedLinkNode>>(
      linkConverters.link,
    ),
    autolink: withSanitizedHref<JSXConverterArgs<SerializedAutoLinkNode>>(
      linkConverters.autolink,
    ),
  };
};
