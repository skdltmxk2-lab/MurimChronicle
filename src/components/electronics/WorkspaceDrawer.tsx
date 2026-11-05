"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Keep native focus containment and restore the opener even after React removes the dialog. */
export function WorkspaceDrawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    dialog?.showModal();
    return () => {
      dialog?.close();
      const active = document.activeElement;
      if (opener instanceof HTMLElement && opener.isConnected && (active === document.body || dialog?.contains(active))) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);
  function close() {
    ref.current?.close();
    onClose();
  }
  return <dialog ref={ref} className="el-workspace-drawer" aria-labelledby="el-drawer-title" onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
    <div className="el-drawer-content">
      <header><div><p className="el-eyebrow">WORKSPACE</p><h2 id="el-drawer-title">{title}</h2></div><button className="el-button" aria-label="패널 닫기" onClick={close}>닫기 ×</button></header>
      {children}
    </div>
  </dialog>;
}
