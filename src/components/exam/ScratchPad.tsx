"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type Tool = "pen" | "eraser";

type Point = {
  x: number;
  y: number;
  p: number;
};

type Stroke = {
  tool: Tool;
  color: string;
  width: number;
  points: Point[];
};

type StoredScratchPad = {
  version: 2;
  strokes: Stroke[];
};

type ScratchPadProps = {
  storageKey: string;
  className?: string;
};

const PAD_HEIGHT = 240;
const PAPER_BACKGROUND = "#fffdf8";
const PAPER_LINE = "rgba(100, 116, 139, 0.15)";
const PAPER_RULE = `linear-gradient(to bottom, transparent 31px, ${PAPER_LINE} 32px)`;
const PEN_COLORS = [
  { label: "검정", value: "#0f172a" },
  { label: "파랑", value: "#1d4ed8" },
  { label: "빨강", value: "#dc2626" },
];
const PEN_WIDTHS = [
  { label: "얇게", value: 2.2 },
  { label: "보통", value: 3.4 },
  { label: "굵게", value: 5 },
];
const ERASER_WIDTH = 18;

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function pressureOf(event: PointerEvent) {
  if (event.pressure > 0) return clamp(event.pressure, 0.25, 1);
  return event.pointerType === "mouse" ? 0.55 : 0.72;
}

function lineWidthFor(stroke: Stroke, point: Point) {
  if (stroke.tool === "eraser") return stroke.width;
  return stroke.width * (0.72 + point.p * 0.45);
}

function loadStoredStrokes(storageKey: string): Stroke[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw || !raw.trim().startsWith("{")) return [];
    const parsed = JSON.parse(raw) as Partial<StoredScratchPad>;
    if (parsed.version !== 2 || !Array.isArray(parsed.strokes)) return [];
    return parsed.strokes.filter((stroke): stroke is Stroke => {
      return (
        (stroke.tool === "pen" || stroke.tool === "eraser") &&
        typeof stroke.color === "string" &&
        typeof stroke.width === "number" &&
        Array.isArray(stroke.points)
      );
    });
  } catch {
    return [];
  }
}

function saveStoredStrokes(storageKey: string, strokes: Stroke[]) {
  if (!canUseStorage()) return;
  try {
    const payload: StoredScratchPad = { version: 2, strokes };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable or full on private/mobile browsers.
  }
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, width: number, height: number) {
  if (stroke.points.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const first = stroke.points[0];
  if (stroke.points.length === 1) {
    const radius = lineWidthFor(stroke, first) / 2;
    ctx.beginPath();
    ctx.arc(first.x * width, first.y * height, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  for (let i = 1; i < stroke.points.length; i += 1) {
    const prev = stroke.points[i - 1];
    const current = stroke.points[i];
    const prevX = prev.x * width;
    const prevY = prev.y * height;
    const currentX = current.x * width;
    const currentY = current.y * height;

    ctx.lineWidth = lineWidthFor(stroke, current);
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
  }

  ctx.restore();
}

export function ScratchPad({ storageKey, className = "" }: ScratchPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const activeStrokeRef = useRef<Stroke | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [tool, setTool] = useState<Tool>("pen");
  const [penColor, setPenColor] = useState(PEN_COLORS[0].value);
  const [penWidth, setPenWidth] = useState(PEN_WIDTHS[1].value);

  const hasInk = strokes.length > 0;

  function redraw(strokesToDraw = strokesRef.current, activeStroke = activeStrokeRef.current) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    ctx.clearRect(0, 0, width, PAD_HEIGHT);
    strokesToDraw.forEach((stroke) => drawStroke(ctx, stroke, width, PAD_HEIGHT));
    if (activeStroke) drawStroke(ctx, activeStroke, width, PAD_HEIGHT);
  }

  function resizeCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(rect.width));
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(PAD_HEIGHT * ratio);
    canvas.style.height = `${PAD_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    redraw();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const loaded = loadStoredStrokes(storageKey);
    strokesRef.current = loaded;
    setStrokes(loaded);
    activeStrokeRef.current = null;
    resizeCanvas();

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(canvas);
    return () => observer.disconnect();
    // resizeCanvas intentionally reads refs so it can repaint without forcing React state churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  function normalizedPoint(event: PointerEvent): Point | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const raw: Point = {
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
      p: pressureOf(event),
    };

    const active = activeStrokeRef.current;
    const last = active?.points.at(-1);
    if (!last) return raw;

    const distance = Math.hypot(raw.x - last.x, raw.y - last.y);
    if (distance < 0.0018) return null;

    return {
      x: last.x * 0.58 + raw.x * 0.42,
      y: last.y * 0.58 + raw.y * 0.42,
      p: last.p * 0.45 + raw.p * 0.55,
    };
  }

  function addPoint(event: PointerEvent) {
    const active = activeStrokeRef.current;
    if (!active) return;
    const point = normalizedPoint(event);
    if (!point) return;
    active.points.push(point);
  }

  function pointerEventsFrom(event: ReactPointerEvent<HTMLCanvasElement>): PointerEvent[] {
    const nativeEvent = event.nativeEvent as PointerEvent & {
      getCoalescedEvents?: () => PointerEvent[];
    };
    return nativeEvent.getCoalescedEvents?.() ?? [nativeEvent];
  }

  function startDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    activeStrokeRef.current = {
      tool,
      color: tool === "eraser" ? "#000000" : penColor,
      width: tool === "eraser" ? ERASER_WIDTH : penWidth,
      points: [],
    };
    pointerEventsFrom(event).forEach(addPoint);
    redraw();
  }

  function moveDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    event.preventDefault();
    pointerEventsFrom(event).forEach(addPoint);
    redraw();
  }

  function stopDrawing(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    drawingRef.current = false;

    const active = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (!active || active.points.length === 0) {
      redraw();
      return;
    }

    const next = [...strokesRef.current, active];
    strokesRef.current = next;
    setStrokes(next);
    saveStoredStrokes(storageKey, next);
    redraw(next, null);
  }

  function undo() {
    const next = strokesRef.current.slice(0, -1);
    strokesRef.current = next;
    setStrokes(next);
    saveStoredStrokes(storageKey, next);
    redraw(next, null);
  }

  function clear() {
    strokesRef.current = [];
    activeStrokeRef.current = null;
    setStrokes([]);
    if (canUseStorage()) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage failures.
      }
    }
    redraw([], null);
  }

  return (
    <section className={`student-screen-only rounded-lg border border-line bg-slate-50 p-3 ${className}`}>
      <div className="mb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">필기</p>
            <p className="mt-0.5 text-xs font-bold text-slate-500">펜으로 자연스럽게 쓰고, 지우개와 실행취소를 쓸 수 있습니다.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={undo}
              disabled={!hasInk}
              className="rounded-md border border-line bg-white px-3 py-2 text-xs font-black text-slate-600 hover:border-brand-500 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              실행취소
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={!hasInk}
              className="rounded-md border border-line bg-white px-3 py-2 text-xs font-black text-slate-600 hover:border-coral-500 hover:text-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              전체 지우기
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-line bg-white p-1">
            {(["pen", "eraser"] as Tool[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTool(item)}
                className={`rounded px-3 py-1.5 text-xs font-black transition ${
                  tool === item ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item === "pen" ? "펜" : "지우개"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1.5">
            {PEN_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  setPenColor(color.value);
                  setTool("pen");
                }}
                aria-label={`${color.label} 펜`}
                title={`${color.label} 펜`}
                className={`grid size-7 place-items-center rounded-full border ${
                  penColor === color.value && tool === "pen" ? "border-ink" : "border-transparent"
                }`}
              >
                <span className="block size-4 rounded-full" style={{ backgroundColor: color.value }} />
              </button>
            ))}
          </div>

          <div className="flex rounded-md border border-line bg-white p-1">
            {PEN_WIDTHS.map((width) => (
              <button
                key={width.value}
                type="button"
                onClick={() => {
                  setPenWidth(width.value);
                  setTool("pen");
                }}
                className={`rounded px-3 py-1.5 text-xs font-black transition ${
                  penWidth === width.value && tool === "pen" ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {width.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="rounded-md border border-line p-1 shadow-inner"
        style={{
          backgroundColor: PAPER_BACKGROUND,
          backgroundImage: PAPER_RULE,
          backgroundSize: "100% 32px",
        }}
      >
        <canvas
          ref={canvasRef}
          aria-label="문제 풀이 필기장"
          className="scratch-pad-canvas block w-full rounded"
          style={{
            touchAction: "none",
          }}
          onPointerDown={startDrawing}
          onPointerMove={moveDrawing}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
        />
      </div>
    </section>
  );
}
