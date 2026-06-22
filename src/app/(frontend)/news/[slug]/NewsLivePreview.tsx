"use client";

import Link from "next/link";
import { useLivePreview } from "@payloadcms/live-preview-react";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { richTextConverters } from "@/lib/richtext-converters";
import { MediaImage } from "@/components/shared/MediaImage";
import { InkDivider } from "@/components/shared/InkDivider";
import { pickImage } from "@/lib/media";
import { formatDateZh } from "@/lib/format";
import { PROSE_CLASS } from "@/lib/prose";
import { SITE_URL } from "@/lib/seo";
import type { News } from "@/payload-types";

export function NewsLivePreview({ initialDoc }: { initialDoc: News }) {
  const { data } = useLivePreview<News>({ initialData: initialDoc, serverURL: SITE_URL, depth: 2 });
  const image = pickImage(data.featuredImage, "hero");

  return (
    <div className="container-page max-w-3xl">
      <Link
        href="/news"
        className="inline-flex items-center gap-2 font-sans-zh text-xs tracking-widest text-vermillion hover:gap-4 transition-all mb-8"
      >
        ← 返回新聞列表
      </Link>

      <p className="font-sans-zh text-xs tracking-widest text-stone mb-4">{formatDateZh(data.publishDate)}</p>
      <h1 className="font-calligraphy text-4xl md:text-5xl text-ink leading-tight mb-8">{data.title}</h1>

      <MediaImage image={image} aspectRatio="16 / 9" label="專題圖片" className="mb-10" sizes="(min-width: 768px) 768px, 100vw" />

      {data.excerpt && (
        <p className="font-serif-zh text-xl leading-[2] text-ink-soft/90 border-l-4 border-vermillion pl-6 mb-10">
          {data.excerpt}
        </p>
      )}

      <div className={PROSE_CLASS}>
        {data.content ? (
          <RichText converters={richTextConverters} data={data.content as SerializedEditorState} />
        ) : (
          <p className="text-stone italic text-sm">（本文暫無內文）</p>
        )}
      </div>

      <InkDivider />

      <Link href="/news" className="inline-flex items-center gap-2 font-sans-zh text-xs tracking-widest text-vermillion">
        ← 返回新聞列表
      </Link>
    </div>
  );
}
