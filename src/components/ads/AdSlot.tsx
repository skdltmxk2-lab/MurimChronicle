"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier } from "@/lib/auth/tierGuard";

type AdSlotProps = {
  // 광고 네트워크 연동 시 식별용 슬롯 키 (예: "exams-top", "results-inline").
  slot: string;
  // 레이아웃 형태. banner는 가로형, inline은 본문 사이 작은 박스, rail은 세로 스카이스크래퍼.
  format?: "banner" | "inline" | "rail";
  className?: string;
};

/**
 * 광고 슬롯 자리(플레이스홀더).
 * - PRO 등급과 관리자에게는 렌더링하지 않는다(광고 제거 혜택).
 * - 무료 사용자에게만 빈 광고 자리를 노출한다.
 * - 실제 광고 스크립트(AdSense 등)는 이 자리 안에 추후 연결한다.
 */
export function AdSlot({ slot, format = "banner", className = "" }: AdSlotProps) {
  const { user } = useAuth();

  // PRO/관리자는 광고 없음.
  if (canUseTier(user, "pro")) return null;

  const minH =
    format === "banner" ? "min-h-[90px]" : format === "rail" ? "min-h-[600px]" : "min-h-[120px]";

  return (
    <div
      data-ad-slot={slot}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center ${minH} ${className}`}
    >
      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
        Sponsored
      </span>
      <p className="text-xs font-bold text-slate-400">이 자리에 광고가 표시됩니다</p>
      <Link
        href="/student/pricing"
        className="text-[11px] font-black text-brand-600 hover:underline"
      >
        PRO로 업그레이드하면 광고가 사라져요 →
      </Link>
    </div>
  );
}
