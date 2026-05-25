"use client";

import { useState } from "react";
import { LiveChatPanel } from "./LiveChatPanel";

/**
 * 좁은 화면(xl 미만)에서 우측 사이드바 채팅을 대신하는 플로팅 버튼 + 드로어.
 * 데스크탑(xl 이상)에서는 사이드바 채팅이 보이므로 이 버튼은 숨긴다.
 */
export function MobileChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="실시간 채팅 열기"
          className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-brand-600 text-2xl text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
        >
          💬
        </button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <div className="relative m-3 flex h-[78vh] w-full max-w-sm flex-col">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="채팅 닫기"
              className="absolute -top-3 right-1 z-10 grid size-8 place-items-center rounded-full bg-white text-slate-500 shadow-md hover:text-slate-800"
            >
              ✕
            </button>
            <LiveChatPanel className="h-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
