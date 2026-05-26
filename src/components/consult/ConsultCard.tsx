"use client";

const KAKAO_CHANNEL_URL = "https://pf.kakao.com/_IwHRX";

export function ConsultCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-line bg-white p-5 shadow-soft ${className}`}
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

      <p className="mt-4 text-[12px] leading-6 text-slate-500">
        김영편입 1타강사 영수 현장조교가
        <br />
        직접 상담해드립니다.
      </p>

      <a
        href={KAKAO_CHANNEL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="카카오톡으로 편입 상담하기"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-sm font-black text-[#191600] shadow-sm transition hover:brightness-95"
      >
        <span aria-hidden>💬</span>
        카톡으로 상담하기 →
      </a>
    </div>
  );
}
