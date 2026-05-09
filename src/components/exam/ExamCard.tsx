"use client";

import Link from "next/link";
import type { MockExam } from "@/types/exam";
import { useAuth } from "@/lib/auth/AuthContext";
import { canUseTier } from "@/lib/auth/tierGuard";
import type { UserTier } from "@/types/auth";

// 카테고리 마커 태그에 따른 최소 요구 등급.
//   - 자체 모의고사 / 향후 추가 sub-type: Pro 이상
//   - 기출유형 / 과목별 모의고사 / 그 외: Plus 이상
function requiredTierForExam(tags: string[]): UserTier {
  if (tags.includes("자체모고")) return "pro";
  if (tags.includes("유형3") || tags.includes("유형4")) return "pro";
  return "plus";
}

export function ExamCard({ exam }: { exam: MockExam }) {
  const { user } = useAuth();
  const minutes = Math.floor(exam.timeLimitSec / 60);
  const required = requiredTierForExam(exam.tags ?? []);
  const allowed = canUseTier(user, required);
  const tierLabel = required === "pro" ? "Pro 이상" : "Plus 이상";

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap gap-2">
        {exam.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="text-xl font-black tracking-normal text-ink">{exam.title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{exam.description}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
        <div>
          <div className="text-xs font-semibold text-slate-500">문항</div>
          <div className="mt-1 font-black text-ink">{exam.problems.length}문항</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">시간</div>
          <div className="mt-1 font-black text-ink">{minutes}분</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">방식</div>
          <div className="mt-1 font-black text-ink">선택모고</div>
        </div>
      </div>
      {allowed ? (
        <Link
          href={`/student/exams/${exam.id}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700"
        >
          시험 시작
        </Link>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-2 rounded-md bg-slate-100 px-4 py-3">
          <span className="text-sm font-black text-slate-500">🔒 {tierLabel} 등급부터 응시 가능</span>
          <Link href="/student/pricing" className="text-xs font-black text-brand-700 underline">
            요금제 보기 →
          </Link>
        </div>
      )}
    </article>
  );
}
