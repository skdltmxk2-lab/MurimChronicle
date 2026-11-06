"use client";

import { KaTeXRenderer } from "@/components/math/KaTeXRenderer";
import type { ContentType } from "@/types/exam";

type ContentRendererProps = {
  contentType?: ContentType;
  text?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
  viewBoxes?: boolean;
  /**
   * 글과 그림이 함께 있을 때 그림을 어느 쪽에 둘지 정한다. 기본은 그림이 위(문제 본문 관례).
   * 선지처럼 "…다음과 같이 그릴 수 있다." 라는 안내 문장 뒤에 그림이 이어져야 하는 곳은
   * "after" 로 둬 글을 먼저 읽게 한다.
   */
  imagePlacement?: "before" | "after";
};

export function ContentRenderer({
  contentType = "latex",
  text = "",
  image,
  imageAlt = "문제 이미지",
  className,
  viewBoxes = true,
  imagePlacement = "before"
}: ContentRendererProps) {
  const shouldShowText = contentType === "latex" || contentType === "mixed";
  const shouldShowImage = (contentType === "image" || contentType === "mixed") && image;
  const rootClassName = ["min-w-0 overflow-visible break-words", className].filter(Boolean).join(" ");
  const showTextFirst = imagePlacement === "after" && Boolean(shouldShowImage) && shouldShowText && Boolean(text);

  const imageNode = shouldShowImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={imageAlt}
      className={`block h-auto max-h-none max-w-full rounded-md border border-line bg-white object-contain ${
        showTextFirst ? "mt-3" : ""
      }`}
    />
  ) : null;
  const textNode =
    shouldShowText && text ? (
      <div
        className={
          shouldShowImage && !showTextFirst ? "mt-3 min-w-0 overflow-visible" : "min-w-0 overflow-visible"
        }
      >
        <KaTeXRenderer content={text} viewBoxes={viewBoxes} />
      </div>
    ) : null;

  return (
    <div className={rootClassName}>
      {showTextFirst ? textNode : imageNode}
      {showTextFirst ? imageNode : textNode}
      {!shouldShowImage && !text ? <span className="text-slate-400">내용 없음</span> : null}
    </div>
  );
}
