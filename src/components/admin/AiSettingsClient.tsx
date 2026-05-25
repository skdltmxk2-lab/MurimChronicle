"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";

type Engine = "concept" | "embedding";
type Status = { total: number; embedded: number; remaining: number };

export function AiSettingsClient() {
  const { user, authChecked } = useAuth();
  const [engine, setEngine] = useState<Engine>("concept");
  const [savingEngine, setSavingEngine] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [backfilling, setBackfilling] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadAll() {
    try {
      const [s, e] = await Promise.all([
        adminFetch("/api/admin/settings").then((r) => r.json()),
        adminFetch("/api/admin/embeddings").then((r) => r.json()),
      ]);
      if (s.ok) setEngine(s.searchEngine as Engine);
      if (e.ok) setStatus({ total: e.total, embedded: e.embedded, remaining: e.remaining });
    } catch {
      setMsg("불러오는 중 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    if (!authChecked || !isAdminUser(user)) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, user]);

  async function changeEngine(next: Engine) {
    if (next === engine || savingEngine) return;
    setSavingEngine(true);
    setMsg("");
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ searchEngine: next }),
      });
      const json = await res.json();
      if (!json.ok) { setMsg(json.message ?? "변경 실패"); return; }
      setEngine(next);
      setMsg(`추천 엔진을 '${next === "embedding" ? "임베딩(벡터검색)" : "개념(태그)"}'(으)로 변경했습니다.`);
    } catch {
      setMsg("변경 중 오류가 발생했습니다.");
    } finally {
      setSavingEngine(false);
    }
  }

  async function runBackfill() {
    if (backfilling) return;
    setBackfilling(true);
    setMsg("임베딩 생성 중...");
    try {
      for (let i = 0; i < 2000; i++) {
        const res = await adminFetch("/api/admin/embeddings", { method: "POST" });
        const json = await res.json();
        if (!json.ok) { setMsg(json.message ?? "임베딩 생성 실패"); break; }
        setStatus({ total: json.total, embedded: json.embedded, remaining: json.remaining });
        if (json.done || json.processed === 0) {
          setMsg("임베딩 생성 완료!");
          break;
        }
      }
    } catch {
      setMsg("임베딩 생성 중 오류가 발생했습니다.");
    } finally {
      setBackfilling(false);
    }
  }

  if (!authChecked) return null;
  if (!isAdminUser(user)) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1>
        <Link href="/student/exams" className="mt-6 inline-block rounded-md bg-brand-600 px-6 py-3 text-sm font-black text-white">
          돌아가기
        </Link>
      </main>
    );
  }

  const pct = status && status.total > 0 ? Math.round((status.embedded / status.total) * 100) : 0;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin" className="text-xs font-black text-slate-500 hover:text-brand-700">← 관리자 콘솔</Link>
      <h1 className="mt-2 text-3xl font-black text-ink">AI 추천 설정</h1>
      <p className="mt-2 text-sm text-slate-600">문제검색의 추천 엔진을 선택하고, 임베딩을 생성/관리합니다.</p>

      {msg ? (
        <div className="mt-4 rounded-md bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">{msg}</div>
      ) : null}

      {/* 엔진 선택 */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-black text-ink">추천 엔진</h2>
        <p className="mt-1 text-sm text-slate-500">현재 적용: <b className="text-ink">{engine === "embedding" ? "임베딩(벡터검색)" : "개념(태그 매칭)"}</b></p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => changeEngine("concept")}
            disabled={savingEngine}
            className={`rounded-xl border-2 p-4 text-left transition disabled:opacity-50 ${
              engine === "concept" ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-300"
            }`}
          >
            <p className="text-sm font-black text-ink">📂 개념(태그) 매칭</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">과목+단원 안에서 개념 태그가 일치하는 문제 추천. DB 태그 정리 상태에 의존.</p>
          </button>
          <button
            type="button"
            onClick={() => changeEngine("embedding")}
            disabled={savingEngine}
            className={`rounded-xl border-2 p-4 text-left transition disabled:opacity-50 ${
              engine === "embedding" ? "border-brand-600 bg-brand-50" : "border-line bg-white hover:border-brand-300"
            }`}
          >
            <p className="text-sm font-black text-ink">🧬 임베딩(벡터검색)</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">의미가 가까운 문제를 전체 DB에서 추천. 임베딩 생성 필요(아래).</p>
          </button>
        </div>
        {engine === "embedding" && status && status.embedded === 0 ? (
          <p className="mt-3 text-xs font-bold text-coral-600">⚠️ 아직 임베딩이 없어 개념 매칭으로 폴백돼요. 아래에서 임베딩을 먼저 생성하세요.</p>
        ) : null}
      </section>

      {/* 임베딩 생성 */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-black text-ink">임베딩 생성</h2>
        <p className="mt-1 text-sm text-slate-500">기존 문제를 벡터로 변환해 저장합니다. 새 문제를 올린 뒤에도 이 버튼을 눌러 추가 생성하세요.</p>

        {status ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-slate-600">진행률</span>
              <span className="text-brand-700">{status.embedded.toLocaleString()} / {status.total.toLocaleString()} ({pct}%)</span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-brand-600 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-400">남은 문제: {status.remaining.toLocaleString()}개</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-400">상태 불러오는 중...</p>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={runBackfill}
            disabled={backfilling || (status?.remaining ?? 0) === 0}
            className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {backfilling ? "생성 중..." : (status?.remaining ?? 0) === 0 ? "모두 생성됨" : "임베딩 생성 시작"}
          </button>
          <button
            type="button"
            onClick={loadAll}
            disabled={backfilling}
            className="rounded-md border border-line px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            새로고침
          </button>
        </div>
        <p className="mt-3 text-[11px] text-slate-400">
          ※ 먼저 Supabase에서 pgvector 마이그레이션을 실행해야 동작합니다. 생성 중에는 페이지를 닫지 마세요.
        </p>
      </section>
    </main>
  );
}
