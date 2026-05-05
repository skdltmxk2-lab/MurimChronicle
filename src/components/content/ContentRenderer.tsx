"use client";

import { KaTeXRenderer } from "@/components/math/KaTeXRenderer";
import type { ContentType } from "@/types/exam";

type ContentRendererProps = {
  contentType?: ContentType;
  text?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
};

export function ContentRenderer({
  contentType = "latex",
  text = "",
  image,
  imageAlt = "문제 이미지",
  className
}: ContentRendererProps) {
  const shouldShowText = contentType === "latex" || contentType === "mixed";
  const shouldShowImage = (contentType === "image" || contentType === "mixed") && image;

  return (
    <div className={className}>
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={imageAlt}
          className="max-h-[560px] w-auto max-w-full rounded-md border border-line bg-white object-contain"
        />
      ) : null}
      {shouldShowText && text ? (
        <div className={shouldShowImage ? "mt-3" : undefined}>
          <KaTeXRenderer content={text} />
        </div>
      ) : null}
      {!shouldShowImage && !text ? <span className="text-slate-400">내용 없음</span> : null}
    </div>
  );
}
