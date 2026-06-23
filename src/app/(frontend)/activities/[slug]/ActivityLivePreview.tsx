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
import type { Activity } from "@/payload-types";

export function ActivityLivePreview({ initialDoc }: { initialDoc: Activity }) {
  const { data } = useLivePreview<Activity>({ initialData: initialDoc, serverURL: SITE_URL, depth: 2 });
  const hero = pickImage(data.featuredImage, "hero");
  const gallery = (data.gallery ?? [])
    .map((g) => pickImage(g.image, "card"))
    .filter((img): img is NonNullable<typeof img> => Boolean(img));

  return (
    <div className="container-page max-w-3xl">
      <Link
        href="/activities"
        className="inline-flex items-center gap-2 font-sans-zh text-xs tracking-widest text-vermillion hover:gap-4 transition-all mb-8"
      >
        ← 返回活動列表
      </Link>

      <p className="font-sans-zh text-xs tracking-widest text-stone mb-4">
        {formatDateZh(data.eventDate)}
        {data.location ? ` · ${data.location}` : ""}
      </p>
      <h1 className="font-calligraphy text-4xl md:text-5xl text-ink leading-tight mb-8">{data.title}</h1>

      <MediaImage image={hero} aspectRatio="16 / 9" label="活動相片" className="mb-10" sizes="(min-width: 768px) 768px, 100vw" />

      {data.description && (
        <div className={PROSE_CLASS}>
          <RichText converters={richTextConverters} data={data.description as SerializedEditorState} />
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {gallery.map((img) => (
            <MediaImage key={img.url} image={img} aspectRatio="4 / 3" label="活動相片" />
          ))}
        </div>
      )}

      <InkDivider />

      <Link href="/activities" className="inline-flex items-center gap-2 font-sans-zh text-xs tracking-widest text-vermillion">
        ← 返回活動列表
      </Link>
    </div>
  );
}
