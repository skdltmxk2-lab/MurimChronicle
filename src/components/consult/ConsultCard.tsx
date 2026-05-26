"use client";

import type { ReactNode } from "react";

const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_IwHRX";

const TEACHERS = ["장T", "류T", "병권T", "신근T"];

/** 강사명에 형광펜(하이라이트) 효과 */
function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="bg-[linear-gradient(transparent_58%,rgba(253,224,71,0.9)_58%)] px-1 font-black tracking-tight text-slate-900 dark:bg-[linear-gradient(transparent_58%,rgba(250,204,21,0.45)_58%)] dark:text-white">
      {children}
    </span>
  );
}

export function ConsultCard({ className = "" }: { className?: string }) {
  return (
    <a
      href={KAKAO_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="1타강사 현장조교에게 편입 상담하기 (카카오톡 채널)"
      className={`group block rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-lg ${className}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-amber-100 text-lg dark:bg-amber-500/20">
          🎓
        </span>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
          1:1 무료 상담
        </p>
      </div>

      <h3 className="text-[15px] font-black leading-snug text-ink">
        1타강사 현장조교에게
        <br />
        편입 상담받기
      </h3>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-7">
        {TEACHERS.map((t) => (
          <Highlight key={t}>{t}</Highlight>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">
        실제 현장조교 · 현장조교 출신이 직접 상담해줘요.
      </p>

      <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-sm font-black text-[#191600] shadow-sm transition group-hover:brightness-95">
        <span aria-hidden>💬</span>
        카톡으로 상담하기 →
      </div>
    </a>
  );
}
