"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { attemptRepo } from "@/lib/exam/storage";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import type { AttemptResult } from "@/types/exam";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, authChecked } = useAuth();
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authChecked) return;
    if (user?.role === "student") {
      attemptRepo.listResults().then((r) => {
        setResults(r.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)));
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user, authChecked]);

  async function deleteAccount() {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        alert("로그인 상태가 아닙니다.");
        return;
      }

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await res.json() as { ok: boolean; message?: string };

      if (!result.ok) {
        alert(result.message ?? "탈퇴 처리 중 오류가 발생했습니다.");
        return;
      }

      // 로컬 스토리지 정리
      window.localStorage.removeItem("cbt:auth:student:v1");
      window.localStorage.removeItem("cbt:welcome:pending");
      await supabase.auth.signOut();
      router.push("/student/exams");
    } catch {
      alert("탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  }

  if (!authChecked) return null;

  if (!user || user.role === "admin") {
    return (
      <main className="mx-auto max-w-6xl px-5 py-16">
        <section className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <div className="mb-5 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
          <Link
            href="/student/exams"
            className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white hover:bg-brand-700"
          >
            시험 목록으로
          </Link>
        </section>
      </main>
    );
  }

  const totalAnswered = results.reduce((sum, r) => sum + r.score.total, 0);
  const totalCorrect = results.reduce((sum, r) => sum + r.score.correct, 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const recentResults = results.slice(0, 5);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">내 정보</p>
        <h1 className="mt-1 text-3xl font-black text-ink">{user.name}님의 학습 현황</h1>
      </section>

      {/* 통계 카드 */}
      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5 text-center shadow-soft">
          <div className="text-xs font-bold text-slate-500">총 응시</div>
          <div className="mt-2 text-3xl font-black text-ink">{results.length}</div>
          <div className="mt-1 text-xs text-slate-400">회</div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 text-center shadow-soft">
          <div className="text-xs font-bold text-slate-500">총 풀이</div>
          <div className="mt-2 text-3xl font-black text-ink">{totalAnswered}</div>
          <div className="mt-1 text-xs text-slate-400">문항</div>
        </div>
        <div className="col-span-2 rounded-lg border border-line bg-white p-5 text-center shadow-soft md:col-span-1">
          <div className="text-xs font-bold text-slate-500">평균 정답률</div>
          <div className={`mt-2 text-3xl font-black ${accuracy >= 70 ? "text-brand-600" : accuracy >= 50 ? "text-amber-500" : "text-coral-600"}`}>
            {totalAnswered > 0 ? `${accuracy}%` : "-"}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {totalAnswered > 0 ? `${totalCorrect}/${totalAnswered} 정답` : "아직 풀이 없음"}
          </div>
        </div>
      </section>

      {/* 취약 유형 */}
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-black text-ink">취약 유형 분석</h2>
        {totalAnswered < 100 ? (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-5 text-center">
            <div className="text-3xl">📊</div>
            <p className="mt-2 text-sm font-bold text-orange-700">
              취약 유형 분석은 100문항 이상 풀어야 제공됩니다.
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-orange-200">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{ width: `${Math.min(100, (totalAnswered / 100) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-orange-500">{totalAnswered}/100 문항 완료</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">단원별 취약 분석 기능을 준비 중입니다.</p>
          </div>
        )}
      </section>

      {/* 최근 응시 내역 */}
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-ink">최근 응시 내역</h2>
        {loading ? (
          <p className="text-sm text-slate-400">불러오는 중...</p>
        ) : recentResults.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-3xl">📝</div>
            <p className="mt-2 text-sm text-slate-500">아직 응시한 시험이 없습니다.</p>
            <Link
              href="/student/exams"
              className="mt-4 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700"
            >
              시험 보러 가기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentResults.map((r) => (
              <Link
                key={r.attemptId}
                href={`/student/results/${r.attemptId}`}
                className="flex items-center justify-between rounded-lg border border-line p-4 hover:border-brand-400 hover:bg-brand-50"
              >
                <div>
                  <div className="text-sm font-black text-ink">{r.examTitle}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{formatDate(r.submittedAt)}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${r.score.percent >= 70 ? "text-brand-600" : r.score.percent >= 50 ? "text-amber-500" : "text-coral-600"}`}>
                    {r.score.percent}%
                  </div>
                  <div className="text-xs text-slate-400">
                    {r.score.correct}/{r.score.total} 정답
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 회원탈퇴 */}
      <section className="rounded-lg border border-red-200 bg-white p-6 shadow-soft">
        <h2 className="text-base font-black text-red-600">위험 구역</h2>
        <p className="mt-1 text-sm text-slate-500">
          탈퇴하면 모든 풀이 기록이 삭제됩니다. 탈퇴 후 동일한 이메일로 재가입할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="mt-4 rounded-md border border-red-300 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-50"
        >
          회원탈퇴
        </button>
      </section>

      {/* 탈퇴 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
          onClick={() => !deleting && setShowDeleteConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-4xl">⚠️</div>
              <h3 className="mt-3 text-lg font-black text-ink">정말 탈퇴하시겠습니까?</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                모든 풀이 기록이 영구 삭제됩니다.
                <br />
                탈퇴 후 동일한 이메일로 재가입 가능합니다.
              </p>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 rounded-md border border-line py-3 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                취소
              </button>
              <button
                type="button"
                onClick={deleteAccount}
                disabled={deleting}
                className="flex-1 rounded-md bg-red-600 py-3 text-sm font-black text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
