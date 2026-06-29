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
  const rootClassName = ["min-w-0 overflow-visible break-words", className].filter(Boolean).join(" ");

  return (
    <div className={rootClassName}>
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={imageAlt}
          className="block h-auto max-h-none max-w-full rounded-md border border-line bg-white object-contain"
        />
      ) : null}
      {shouldShowText && text ? (
        <div className={shouldShowImage ? "mt-3 min-w-0 overflow-visible" : "min-w-0 overflow-visible"}>
          <KaTeXRenderer content={text} />
        </div>
      ) : null}
      {!shouldShowImage && !text ? <span className="text-slate-400">내용 없음</span> : null}
    </div>
  );
}
