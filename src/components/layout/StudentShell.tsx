"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier } from "@/lib/auth/tierGuard";

/**
 * 학생 화면 공통 셸.
 * - 광고가 활성화된 경우에만 데스크탑에서 콘텐츠 양옆에 광고 레일을 배치한다.
 * - 광고가 없으면 사이드 공간을 예약하지 않는다.
 * - 시험 응시 등 집중이 필요한 하위 경로에서는 사이드 요소를 모두 숨긴다.
 */
export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const showAdRails = process.env.NEXT_PUBLIC_ADS_ENABLED === "true" && !canUseTier(user, "pro");
  // 응시·분석 화면과 자체 AI 튜터 패널이 있는 문제검색에서는 광고 레일을 숨긴다.
  const focusMode =
    pathname === "/student/search" ||
    (pathname.startsWith("/student/exams/") && pathname !== "/student/exams");

  if (focusMode || !showAdRails) return <>{children}</>;

  return (
    <div className="mx-auto flex w-full max-w-[1800px] justify-center gap-4 px-0 xl:px-4">
      {/* 좌측 — 초대형 화면 광고 레일 */}
      <aside className="hidden shrink-0 pt-6 2xl:block 2xl:w-80">
        <AdSlot slot="rail-left" format="rail" />
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="min-w-0 flex-1">{children}</div>

      {/* 우측 광고 — 큰 화면에서만 */}
      <aside className="hidden shrink-0 pt-6 xl:block xl:w-80">
        <AdSlot slot="rail-right" format="rail" />
      </aside>
    </div>
  );
}
