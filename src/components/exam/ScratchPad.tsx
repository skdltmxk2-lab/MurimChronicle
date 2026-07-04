"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type Point = {
  x: number;
  y: number;
};

type ScratchPadProps = {
  storageKey: string;
  className?: string;
};

const PAD_HEIGHT = 220;
const PAPER_BACKGROUND = "#fffdf8";
const PAPER_LINE = "rgba(100, 116, 139, 0.16)";
const INK_COLOR = "#0f172a";

function getPoint(canvas: HTMLCanvasElement, event: PointerEvent<HTMLCanvasElement>): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function ScratchPad({ storageKey, className = "" }: ScratchPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resizeCanvas(imageData?: string | null) {
      const target = canvasRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width));
      const ratio = window.devicePixelRatio || 1;
      const previous = imageData ?? (target.width > 0 && target.height > 0 ? target.toDataURL("image/png") : null);
      target.width = Math.floor(width * ratio);
      target.height = Math.floor(PAD_HEIGHT * ratio);
      target.style.height = `${PAD_HEIGHT}px`;

      const ctx = target.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, PAD_HEIGHT);

      if (!previous) return;
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, PAD_HEIGHT);
      };
      img.src = previous;
    }

    let saved: string | null = null;
    if (canUseStorage()) {
      try {
        saved = window.localStorage.getItem(storageKey);
        setHasInk(Boolean(saved));
      } catch {
        saved = null;
      }
    }
    resizeCanvas(saved);

    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [storageKey]);

  function persist() {
    const canvas = canvasRef.current;
    if (!canvas || !canUseStorage()) return;
    try {
      window.localStorage.setItem(storageKey, canvas.toDataURL("image/png"));
      setHasInk(true);
    } catch {
      // Storage can be unavailable or full on private/mobile browsers.
    }
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, PAD_HEIGHT);
    if (canUseStorage()) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage failures.
      }
    }
    setHasInk(false);
  }

  function drawTo(point: Point) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const last = lastPointRef.current;
    if (!canvas || !ctx || !last) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = INK_COLOR;
    ctx.lineWidth = 3.1;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = getPoint(canvas, event);
    lastPointRef.current = point;
    drawTo({ x: point.x + 0.01, y: point.y + 0.01 });
  }

  function moveDrawing(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    drawTo(getPoint(canvas, event));
  }

  function stopDrawing(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    persist();
  }

  return (
    <section className={`student-screen-only rounded-lg border border-line bg-slate-50 p-3 ${className}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">필기</p>
          <p className="mt-0.5 text-xs font-bold text-slate-500">손가락이나 펜으로 풀이 과정을 적어두세요.</p>
        </div>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk}
          className="shrink-0 rounded-md border border-line bg-white px-3 py-2 text-xs font-black text-slate-600 hover:border-coral-500 hover:text-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          지우기
        </button>
      </div>
      <canvas
        ref={canvasRef}
        aria-label="문제 풀이 필기장"
        className="scratch-pad-canvas block w-full rounded-md border shadow-inner"
        style={{
          touchAction: "none",
          backgroundColor: PAPER_BACKGROUND,
          backgroundImage: `linear-gradient(to bottom, transparent 31px, ${PAPER_LINE} 32px)`,
          backgroundSize: "100% 32px",
        }}
        onPointerDown={startDrawing}
        onPointerMove={moveDrawing}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
      />
    </section>
  );
}
