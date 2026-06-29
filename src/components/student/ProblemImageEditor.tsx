"use client";

import { useEffect, useRef, useState } from "react";
import {
  clampImageRect,
  clientPointToImagePoint,
  fullImageRect,
  imageRectToDisplayRect,
  prepareProblemImage,
  rectFromImagePoints,
  resizeImageRect,
  type ImagePoint,
  type ImageRect,
  type ImageSize,
  type PreparedProblemImage,
  type ResizeHandle,
} from "@/lib/images/problemImage";

type SourceMeta = {
  sourceWidth: number;
  sourceHeight: number;
  sourceType: string;
  scaledDown: boolean;
};

type Props = {
  sourceBlob: Blob;
  sourceUrl: string;
  sourceSize: ImageSize;
  sourceMeta: SourceMeta;
  debug: boolean;
  onPrepared: (image: PreparedProblemImage | null) => void;
  onRotate: () => void;
};

type DragState =
  | { mode: "new"; start: ImagePoint }
  | { mode: "move"; start: ImagePoint; initial: ImageRect }
  | { mode: "resize"; handle: ResizeHandle; initial: ImageRect };

const HANDLES: Array<{ handle: ResizeHandle; className: string; cursor: string }> = [
  { handle: "nw", className: "-left-1.5 -top-1.5", cursor: "nwse-resize" },
  { handle: "n", className: "left-1/2 -top-1.5 -translate-x-1/2", cursor: "ns-resize" },
  { handle: "ne", className: "-right-1.5 -top-1.5", cursor: "nesw-resize" },
  { handle: "e", className: "-right-1.5 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
  { handle: "se", className: "-bottom-1.5 -right-1.5", cursor: "nwse-resize" },
  { handle: "s", className: "-bottom-1.5 left-1/2 -translate-x-1/2", cursor: "ns-resize" },
  { handle: "sw", className: "-bottom-1.5 -left-1.5", cursor: "nesw-resize" },
  { handle: "w", className: "-left-1.5 top-1/2 -translate-y-1/2", cursor: "ew-resize" },
];

function blobPreviewUrl(blob: Blob | null): string | null {
  return blob ? URL.createObjectURL(blob) : null;
}

export function ProblemImageEditor({
  sourceBlob,
  sourceUrl,
  sourceSize,
  sourceMeta,
  debug,
  onPrepared,
  onRotate,
}: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const preparedCallbackRef = useRef(onPrepared);
  const [selection, setSelection] = useState<ImageRect>(() => fullImageRect(sourceSize));
  const [displaySize, setDisplaySize] = useState<ImageSize>({ width: 0, height: 0 });
  const [prepared, setPrepared] = useState<PreparedProblemImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processingError, setProcessingError] = useState("");
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);

  useEffect(() => {
    preparedCallbackRef.current = onPrepared;
  }, [onPrepared]);

  useEffect(() => {
    const full = fullImageRect(sourceSize);
    setSelection(full);
    setPrepared(null);
    preparedCallbackRef.current(null);
  }, [sourceBlob, sourceSize.height, sourceSize.width]);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const update = () => {
      const rect = image.getBoundingClientRect();
      setDisplaySize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(image);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [sourceUrl]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setProcessing(true);
      setProcessingError("");
      try {
        const next = await prepareProblemImage(sourceBlob, selection);
        if (!active) return;
        setPrepared(next);
        preparedCallbackRef.current(next);
      } catch (error) {
        if (!active) return;
        setPrepared(null);
        preparedCallbackRef.current(null);
        setProcessingError(error instanceof Error ? error.message : "선택 영역 처리에 실패했습니다.");
      } finally {
        if (active) setProcessing(false);
      }
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [selection, sourceBlob]);

  useEffect(() => {
    const nextRaw = blobPreviewUrl(prepared?.rawCropBlob ?? null);
    const nextProcessed = blobPreviewUrl(prepared?.blob ?? null);
    setRawPreview(nextRaw);
    setProcessedPreview(nextProcessed);
    return () => {
      if (nextRaw) URL.revokeObjectURL(nextRaw);
      if (nextProcessed) URL.revokeObjectURL(nextProcessed);
    };
  }, [prepared]);

  useEffect(() => {
    function pointerMove(event: PointerEvent) {
      const image = imageRef.current;
      const drag = dragRef.current;
      if (!image || !drag) return;
      event.preventDefault();
      const bounds = image.getBoundingClientRect();
      const point = clientPointToImagePoint(
        { x: event.clientX, y: event.clientY },
        bounds,
        sourceSize
      );

      if (drag.mode === "new") {
        setSelection(rectFromImagePoints(drag.start, point, sourceSize));
        return;
      }
      if (drag.mode === "resize") {
        setSelection(resizeImageRect(drag.initial, drag.handle, point, sourceSize));
        return;
      }

      const dx = point.x - drag.start.x;
      const dy = point.y - drag.start.y;
      setSelection(
        clampImageRect(
          {
            x: drag.initial.x + dx,
            y: drag.initial.y + dy,
            width: drag.initial.width,
            height: drag.initial.height,
          },
          sourceSize
        )
      );
    }

    function pointerUp() {
      dragRef.current = null;
    }

    window.addEventListener("pointermove", pointerMove, { passive: false });
    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointercancel", pointerUp);
    return () => {
      window.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointercancel", pointerUp);
    };
  }, [sourceSize]);

  function imagePoint(event: React.PointerEvent): ImagePoint {
    const bounds = imageRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return clientPointToImagePoint({ x: event.clientX, y: event.clientY }, bounds, sourceSize);
  }

  function startNewSelection(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    const start = imagePoint(event);
    dragRef.current = { mode: "new", start };
    setSelection(rectFromImagePoints(start, start, sourceSize));
  }

  function startMoving(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    dragRef.current = { mode: "move", start: imagePoint(event), initial: selection };
  }

  function startResize(event: React.PointerEvent<HTMLButtonElement>, handle: ResizeHandle) {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();
    dragRef.current = { mode: "resize", handle, initial: selection };
  }

  const selectionStyle = {
    left: `${(selection.x / sourceSize.width) * 100}%`,
    top: `${(selection.y / sourceSize.height) * 100}%`,
    width: `${(selection.width / sourceSize.width) * 100}%`,
    height: `${(selection.height / sourceSize.height) * 100}%`,
  };
  const displaySelection = imageRectToDisplayRect(selection, displaySize, sourceSize);

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500">
        문제 영역을 드래그하세요. 선택 박스 안쪽은 이동하고 모서리와 변은 크기를 조절합니다.
      </p>
      <div className="overflow-auto rounded-lg border border-line bg-slate-100 p-2 text-center">
        <div className="relative inline-block max-w-full touch-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            src={sourceUrl}
            alt="선택할 원본 문제"
            draggable={false}
            className="block max-h-[30rem] max-w-full object-contain"
          />
          <div
            role="presentation"
            className="absolute inset-0 cursor-crosshair"
            onPointerDown={startNewSelection}
          >
            <div
              role="presentation"
              className="absolute cursor-move border-2 border-brand-500 bg-brand-400/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]"
              style={selectionStyle}
              onPointerDown={startMoving}
            >
              {HANDLES.map(({ handle, className, cursor }) => (
                <button
                  key={handle}
                  type="button"
                  aria-label={`선택 영역 ${handle} 조절`}
                  className={`absolute size-3 rounded-sm border border-white bg-brand-600 shadow ${className}`}
                  style={{ cursor }}
                  onPointerDown={(event) => startResize(event, handle)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelection(fullImageRect(sourceSize))}
          className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          전체 영역 선택
        </button>
        <button
          type="button"
          onClick={onRotate}
          className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
        >
          시계 방향 회전
        </button>
      </div>

      <div className="rounded-lg border border-line bg-slate-50 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-black text-slate-600">AI에 전송될 이미지 미리보기</p>
          <span className="text-[11px] text-slate-400">
            {processing
              ? "전처리 중..."
              : prepared
                ? `${prepared.outputSize.width} × ${prepared.outputSize.height}`
                : ""}
          </span>
        </div>
        {processedPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={processedPreview}
            alt="AI 전송 이미지"
            className="mx-auto max-h-64 max-w-full rounded border border-line bg-white object-contain"
          />
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            {processingError || "선택 영역을 처리하고 있습니다."}
          </div>
        )}
      </div>

      {debug ? (
        <details className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-slate-700">
          <summary className="cursor-pointer font-black text-amber-800">개발용 이미지 디버그</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 font-black">전처리 전 crop</p>
              {rawPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={rawPreview} alt="전처리 전 crop" className="max-h-44 w-full object-contain" />
              ) : null}
            </div>
            <div>
              <p className="mb-1 font-black">전처리 후 전송본</p>
              {processedPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={processedPreview} alt="전처리 후 crop" className="max-h-44 w-full object-contain" />
              ) : null}
            </div>
          </div>
          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono leading-5">
            {JSON.stringify(
              {
                sourceOriginal: [sourceMeta.sourceWidth, sourceMeta.sourceHeight],
                sourceNormalized: [sourceSize.width, sourceSize.height],
                displayed: [Math.round(displaySize.width), Math.round(displaySize.height)],
                selectionOriginal: selection,
                selectionDisplayed: Object.fromEntries(
                  Object.entries(displaySelection).map(([key, value]) => [key, Math.round(value * 10) / 10])
                ),
                cropResult: prepared?.cropSize,
                output: prepared?.outputSize,
                inputMimeType: sourceMeta.sourceType,
                outputMimeType: prepared?.mediaType,
                sourceScaledDown: sourceMeta.scaledDown,
                preprocessing: prepared?.preprocessing ?? [],
                devicePixelRatio: window.devicePixelRatio,
                visualViewportScale: window.visualViewport?.scale ?? 1,
              },
              null,
              2
            )}
          </pre>
        </details>
      ) : null}
    </div>
  );
}
