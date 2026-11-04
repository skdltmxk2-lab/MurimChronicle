"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Native modal supplies focus containment, Escape and focus restoration. */
export function WorkspaceDrawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="el-workspace-drawer" aria-labelledby="el-drawer-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="el-drawer-content">
      <header><div><p className="el-eyebrow">WORKSPACE</p><h2 id="el-drawer-title">{title}</h2></div><button className="el-button" aria-label="패널 닫기" onClick={onClose}>닫기 ×</button></header>
      {children}
    </div>
  </dialog>;
}
