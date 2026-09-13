"use client";

import { useEffect, useRef, useState, type PointerEvent, type MouseEvent, type KeyboardEvent } from "react";

export function useCoachingStudentDrag(disabled: boolean, onDrop: (source: string, target: string) => void) {
  const gesture = useRef<{ source: string; x: number; y: number; pointer: number; active: boolean; target: string } | null>(null);
  const suppressClick = useRef(false);
  const [draggedId, setDraggedId] = useState("");
  const [targetId, setTargetId] = useState("");

  function cancel() {
    gesture.current = null;
    setDraggedId("");
    setTargetId("");
  }

  useEffect(() => {
    if (disabled) {
      gesture.current = null;
      setDraggedId("");
      setTargetId("");
    }
  }, [disabled]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    if (disabled || event.button !== 0) return;
    const element = event.target as HTMLElement;
    if (element.closest("button,input,a,textarea,select") && !element.closest("[data-student-drag-handle]")) return;
    const source = event.currentTarget.dataset.coachingStudentId;
    if (!source) return;
    gesture.current = { source, x: event.clientX, y: event.clientY, pointer: event.pointerId, active: false, target: "" };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId || disabled) return;
    if (!current.active) {
      if (Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return;
      current.active = true;
      suppressClick.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDraggedId(current.source);
    }
    event.preventDefault();
    const grid = event.currentTarget.parentElement;
    const bounds = grid?.getBoundingClientRect();
    if (grid && bounds) {
      if (event.clientY < bounds.top + 24) grid.scrollTop -= 12;
      else if (event.clientY > bounds.bottom - 24) grid.scrollTop += 12;
    }
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-coaching-student-id]");
    current.target = target?.parentElement === grid ? target?.dataset.coachingStudentId ?? "" : "";
    setTargetId(current.target);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    const current = gesture.current;
    if (!current || current.pointer !== event.pointerId) return;
    cancel();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (current.active && !disabled && current.target && current.target !== current.source) {
      onDrop(current.source, current.target);
    }
  }

  return {
    draggedId, targetId,
    handlers: {
      onPointerDown, onPointerMove, onPointerUp,
      onPointerCancel: cancel,
      onLostPointerCapture: cancel,
      onClickCapture(event: MouseEvent<HTMLDivElement>) {
        if (suppressClick.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }
      },
      onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") cancel();
      },
    },
  };
}
