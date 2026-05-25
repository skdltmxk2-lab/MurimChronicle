"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";

export function AdminEnglishClient() {
  const { user, authChecked } = useAuth();
  const [total, setTotal] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadCount() {
    try {
      const res = await adminFetch("/api/admin/english/words");
      const json = await res.json();
      if (json.ok) setTotal(json.total);
    } catch {
      // 무시
    }
  }

  useEffect(() => {
    if (!authChecked || !isAdminUser(user)) return;
    loadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, user]);

  async function upload() {
    if (!text.trim() || uploading) return;
    setUploading(true);
    setMsg("");
    try {
      const res = await adminFetch("/api/admin/english/words", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!json.ok) {
        setMsg(json.message ?? "업로드 실패");
        return;
      }
      setMsg(`${json.parsed}개 인식 → 등록 완료. 현재 총 ${json.total}개.`);
      setText("");
      setTotal(json.total);
    } catch {
      setMsg("업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
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

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin" className="text-xs font-black text-slate-500 hover:text-brand-700">← 관리자 콘솔</Link>
      <h1 className="mt-2 text-3xl font-black text-ink">편입영어 단어 DB</h1>
      <p className="mt-2 text-sm text-slate-600">
        현재 등록된 단어: <b className="text-ink">{total === null ? "..." : total.toLocaleString()}</b>개
      </p>

      <section className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-soft">
        <h2 className="text-lg font-black text-ink">단어 일괄 등록</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          아래 형식으로 붙여넣고 등록하세요. 영문 단어 한 줄, 다음 줄(들)에 뜻을 적으면 됩니다. 같은 단어는 자동으로 갱신돼요.
        </p>
        <pre className="mt-2 rounded-md bg-slate-50 p-3 text-xs text-slate-500">{`inform
v. 알리다, 통지하다

service
n. 봉사, 공공 업무, 서비스`}</pre>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="단어 목록을 여기에 붙여넣으세요..."
          className="mt-3 w-full resize-y rounded-lg border border-line px-4 py-3 text-sm outline-none focus:border-brand-600"
        />
        {msg ? <div className="mt-3 rounded-md bg-brand-50 px-4 py-3 text-sm font-bold text-brand-700">{msg}</div> : null}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={upload}
            disabled={uploading || !text.trim()}
            className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {uploading ? "등록 중..." : "단어 등록"}
          </button>
          <button
            type="button"
            onClick={loadCount}
            className="rounded-md border border-line px-4 py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            새로고침
          </button>
        </div>
      </section>
    </main>
  );
}
