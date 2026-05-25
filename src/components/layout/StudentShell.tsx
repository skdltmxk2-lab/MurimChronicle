"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { LiveChatPanel } from "@/components/chat/LiveChatPanel";
import { MobileChatButton } from "@/components/chat/MobileChatButton";

/**
 * 학생 화면 공통 셸.
 * - 와이드 데스크탑: [좌측 광고 레일] [메인 콘텐츠] [우측 실시간 채팅] 3단 배치.
 * - 좁은 화면: 레일/사이드 채팅은 숨기고, 채팅은 플로팅 버튼으로 접근.
 * - 시험 응시 등 집중이 필요한 하위 경로에서는 사이드 요소를 모두 숨긴다.
 */
export function StudentShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // /student/exams/{examId}, /student/exams/unit-test, /student/exams/weakness/... 등 응시·분석 화면은 풀집중.
  const focusMode = pathname.startsWith("/student/exams/") && pathname !== "/student/exams";

  if (focusMode) return <>{children}</>;

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1800px] justify-center gap-4 px-0 xl:px-4">
        {/* 좌측 광고 레일 — 아주 넓은 화면에서만 */}
        <aside className="hidden shrink-0 pt-6 2xl:block 2xl:w-40">
          <div className="sticky top-4">
            <AdSlot slot="rail-left" format="rail" />
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="min-w-0 flex-1">{children}</div>

        {/* 우측 실시간 채팅 — 큰 화면에서만 */}
        <aside className="hidden shrink-0 pt-6 xl:block xl:w-80">
          <div className="sticky top-4 h-[calc(100vh-2rem)]">
            <LiveChatPanel className="h-full" />
          </div>
        </aside>
      </div>

      {/* 좁은 화면용 채팅 플로팅 버튼 */}
      <MobileChatButton />
    </>
  );
}
