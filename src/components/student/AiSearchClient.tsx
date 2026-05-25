"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { ContentRenderer } from "@/components/content/ContentRenderer";

type Extracted = {
  problemText: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  keywords: string[];
};

type Option = { id: string; label: string; text: string; contentType?: string | null; image?: string | null };

type MatchItem = {
  id: string;
  subject: string;
  unit: string;
  concept: string;
  difficulty: string;
  question: string;
  content_type: string | null;
  question_image: string | null;
  options: Option[];
  correct_option_id: string;
  explanation: string;
  explanation_content_type: string | null;
  explanation_image: string | null;
  question_type: "multiple_choice" | "subjective";
  answer_text: string | null;
};

type ChatTurn = { role: "user" | "assistant"; content: string };
type AnswerState = { selected: string | null; revealed: boolean };

function fileToBase64(file: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const comma = result.indexOf(",");
      const meta = result.slice(0, comma);
      const data = result.slice(comma + 1);
      const mediaType = meta.match(/data:(.*?);/)?.[1] ?? file.type;
      resolve({ base64: data, mediaType });
    };
    reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

export function AiSearchClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  // 업로드 문제에 대한 AI 풀이
  const [solution, setSolution] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);

  // AI 튜터 채팅
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [asking, setAsking] = useState(false);

  function pickFile(file: File | null) {
    if (!file) return;
    setPending(file);
    setError("");
    setPreview(URL.createObjectURL(file));
  }

  // 클립보드 붙여넣기(Ctrl+V)
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === "file" && it.type.startsWith("image/")) {
          const file = it.getAsFile();
          if (file) {
            pickFile(file);
            e.preventDefault();
            break;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function solve(problem: { problemText: string; subject: string; unit: string }) {
    setSolving(true);
    setSolution(null);
    try {
      const res = await adminFetch("/api/search/solve", {
        method: "POST",
        body: JSON.stringify({ problem }),
      });
      const json = await res.json();
      setSolution(json.ok ? (json.solution as string) : `⚠️ ${json.message ?? "풀이를 불러오지 못했어요."}`);
    } catch {
      setSolution("⚠️ 풀이를 불러오지 못했어요.");
    } finally {
      setSolving(false);
    }
  }

  async function runSearch() {
    if (!pending || loading) return;
    setLoading(true);
    setError("");
    setExtracted(null);
    setMatches([]);
    setAnswers({});
    setChat([]);
    setSolution(null);
    try {
      const { base64, mediaType } = await fileToBase64(pending);
      const res = await adminFetch("/api/search", {
        method: "POST",
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.message ?? "검색에 실패했습니다.");
        return;
      }
      const ex = json.extracted as Extracted;
      setExtracted(ex);
      setMatches((json.matches ?? []) as MatchItem[]);
      // 인식 직후 AI 풀이 로드(병렬)
      solve({ problemText: ex.problemText, subject: ex.subject, unit: ex.unit });
    } catch (e) {
      setError(e instanceof Error ? e.message : "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function selectOption(id: string, optId: string) {
    setAnswers((prev) => {
      const cur = prev[id];
      if (cur?.revealed) return prev;
      return { ...prev, [id]: { selected: optId, revealed: false } };
    });
  }

  function reveal(id: string) {
    setAnswers((prev) => ({ ...prev, [id]: { selected: prev[id]?.selected ?? null, revealed: true } }));
  }

  async function ask() {
    const q = input.trim();
    if (!q || asking || !extracted) return;
    const next = [...chat, { role: "user" as const, content: q }];
    setChat(next);
    setInput("");
    setAsking(true);
    try {
      const recommendations = matches.map((m, i) => ({
        n: i + 1,
        question: m.question,
        answer:
          m.question_type === "subjective"
            ? m.answer_text ?? ""
            : m.options?.find((o) => o.id === m.correct_option_id)?.label ?? m.correct_option_id,
        explanation: m.explanation,
      }));
      const res = await adminFetch("/api/search/ask", {
        method: "POST",
        body: JSON.stringify({
          problem: {
            problemText: extracted.problemText,
            subject: extracted.subject,
            unit: extracted.unit,
            solution: solution && !solution.startsWith("⚠️") ? solution : undefined,
            recommendations,
          },
          messages: next,
        }),
      });
      const json = await res.json();
      setChat([
        ...next,
        { role: "assistant", content: json.ok ? (json.answer as string) : `⚠️ ${json.message ?? "응답 실패"}` },
      ]);
    } catch {
      setChat([...next, { role: "assistant", content: "⚠️ 네트워크 오류로 답변을 받지 못했어요." }]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <main className={`mx-auto px-5 py-10 ${extracted ? "max-w-6xl" : "max-w-3xl"}`}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-2xl bg-[#0D1F3C] text-3xl">
          🔍
        </div>
        <h1 className="text-2xl font-black text-ink">AI 문제 검색</h1>
        <p className="mt-1 text-sm text-slate-500">
          문제를 캡쳐해 올리면 AI 풀이와 비슷한 문제를 찾아주고, 풀이도 물어볼 수 있어요.
        </p>
      </div>

      <div className={extracted ? "lg:flex lg:items-start lg:gap-6" : ""}>
        <div className={extracted ? "lg:min-w-0 lg:flex-1" : ""}>
          {/* 업로드 */}
          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="업로드한 문제" className="mx-auto max-h-72 rounded-lg border border-line" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 rounded-md border border-line py-2.5 text-sm font-black text-slate-600 hover:bg-slate-50"
                  >
                    다른 이미지
                  </button>
                  <button
                    type="button"
                    onClick={runSearch}
                    disabled={loading}
                    className="flex-[2] rounded-md bg-brand-600 py-2.5 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {loading ? "분석 중..." : "이 문제로 검색"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center hover:border-brand-400"
              >
                <span className="text-3xl">📷</span>
                <span className="text-sm font-bold text-slate-600">문제 이미지를 업로드하거나 붙여넣으세요</span>
                <span className="text-xs text-slate-400">PNG · JPG · WEBP · 클립보드 붙여넣기(Ctrl+V) 가능</span>
              </button>
            )}
          </section>

          {error ? (
            <div className="mt-4 rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">{error}</div>
          ) : null}

          {/* 인식된 문제 */}
          {extracted ? (
            <section className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-brand-600">인식된 문제</p>
              <div className="mt-2 text-sm leading-7 text-ink">
                <ContentRenderer contentType="latex" text={extracted.problemText} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[extracted.subject, extracted.unit, extracted.concept, extracted.difficulty]
                  .filter(Boolean)
                  .map((t, i) => (
                    <span key={i} className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
                      {t}
                    </span>
                  ))}
              </div>
            </section>
          ) : null}

          {/* AI 풀이 */}
          {extracted ? (
            <section className="mt-6 rounded-2xl border border-mint-200 bg-white shadow-soft">
              <div className="flex items-center gap-2 border-b border-line bg-mint-50 px-5 py-3">
                <span className="text-lg">🧠</span>
                <p className="text-sm font-black text-mint-800">AI 풀이</p>
              </div>
              <div className="px-5 py-4 text-sm leading-7 text-ink">
                {solving ? (
                  <p className="py-4 text-center text-xs text-slate-400">AI가 풀이를 작성 중이에요...</p>
                ) : solution ? (
                  <ContentRenderer contentType="latex" text={solution} />
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400">풀이를 불러오는 중...</p>
                )}
              </div>
            </section>
          ) : null}

          {/* 추천 문제 (직접 풀어보기) */}
          {extracted ? (
            <section className="mt-6">
              <h2 className="mb-3 text-lg font-black text-ink">추천 문제 {matches.length > 0 ? `(${matches.length})` : ""}</h2>
              {matches.length === 0 ? (
                <div className="rounded-xl border border-line bg-slate-50 p-5 text-center text-sm font-bold text-slate-500">
                  같은 유형(개념)의 등록 문제가 없어요. 오른쪽 AI 튜터에게 풀이를 물어보세요.
                </div>
              ) : (
                <ul className="space-y-3">
                  {matches.map((m, i) => {
                    const a = answers[m.id] ?? { selected: null, revealed: false };
                    const correct = m.options?.find((o) => o.id === m.correct_option_id);
                    const isMC = m.question_type !== "subjective" && Array.isArray(m.options) && m.options.length > 0;
                    const isRight = a.selected === m.correct_option_id;
                    return (
                      <li key={m.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
                        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-slate-50 px-4 py-2.5 text-xs">
                          <span className="rounded-full bg-brand-600 px-2.5 py-0.5 font-black text-white">문제 {i + 1}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-600 ring-1 ring-line">{m.subject}</span>
                          <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-600 ring-1 ring-line">{m.unit}</span>
                          {m.concept ? <span className="rounded-full bg-white px-2 py-0.5 font-bold text-slate-600 ring-1 ring-line">{m.concept}</span> : null}
                        </div>
                        <div className="px-4 py-4">
                          <ContentRenderer
                            contentType={(m.content_type as "latex" | "image" | "mixed" | null) ?? "latex"}
                            text={m.question}
                            image={m.question_image ?? undefined}
                            imageAlt="문제"
                            className="text-sm font-semibold leading-7 text-ink"
                          />

                          {/* 보기 (직접 선택) */}
                          {isMC ? (
                            <div className="mt-3 space-y-2">
                              {m.options.map((opt) => {
                                const isSelected = a.selected === opt.id;
                                const isCorrect = opt.id === m.correct_option_id;
                                let ring = "border-line bg-white hover:border-brand-400";
                                if (a.revealed && isCorrect) ring = "border-mint-500 bg-mint-50";
                                else if (a.revealed && isSelected && !isCorrect) ring = "border-coral-300 bg-coral-50";
                                else if (isSelected) ring = "border-brand-500 bg-brand-50";
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => selectOption(m.id, opt.id)}
                                    disabled={a.revealed}
                                    className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left transition ${ring} disabled:cursor-default`}
                                  >
                                    <span
                                      className={`grid size-6 shrink-0 place-items-center rounded-md text-xs font-black ${
                                        a.revealed && isCorrect
                                          ? "bg-mint-500 text-white"
                                          : isSelected
                                            ? "bg-brand-600 text-white"
                                            : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {opt.label}
                                    </span>
                                    <ContentRenderer
                                      contentType={(opt.contentType as "latex" | "image" | "mixed" | null) ?? "latex"}
                                      text={opt.text}
                                      image={opt.image ?? undefined}
                                      imageAlt={`보기 ${opt.label}`}
                                      className="flex-1 text-sm leading-7 text-ink"
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          ) : null}

                          {!a.revealed ? (
                            <button
                              type="button"
                              onClick={() => reveal(m.id)}
                              disabled={isMC && !a.selected}
                              className="mt-3 w-full rounded-md bg-brand-600 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {isMC ? "정답 확인" : "정답·해설 보기"}
                            </button>
                          ) : (
                            <div className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
                              {isMC ? (
                                <p className={`text-sm font-black ${isRight ? "text-mint-700" : "text-coral-600"}`}>
                                  {isRight ? "정답입니다! 🎉" : "오답이에요."} 정답: {correct?.label ?? m.correct_option_id}
                                </p>
                              ) : (
                                <p className="text-sm font-bold text-ink">정답: {m.answer_text ?? "—"}</p>
                              )}
                              <p className="mt-2 text-xs font-black text-brand-600">해설</p>
                              <div className="mt-0.5 text-sm leading-7 text-ink">
                                <ContentRenderer
                                  contentType={(m.explanation_content_type as "latex" | "image" | "mixed" | null) ?? "latex"}
                                  text={m.explanation}
                                  image={m.explanation_image ?? undefined}
                                  imageAlt="해설"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ) : null}
        </div>

        {/* 오른쪽: AI 튜터 (검색 후 표시) */}
        {extracted ? (
          <div className="mt-6 lg:mt-0 lg:w-96 lg:shrink-0">
            <div className="lg:sticky lg:top-4">
              <section className="rounded-2xl border border-line bg-white shadow-soft">
                <div className="flex items-center gap-2 border-b border-line bg-[#0D1F3C] px-4 py-3">
                  <span className="text-lg">🤖</span>
                  <div>
                    <p className="text-sm font-black text-white">AI 튜터에게 질문</p>
                    <p className="text-[11px] text-slate-300">&ldquo;3번 문제 풀어줘&rdquo; 처럼 번호로 물어볼 수 있어요</p>
                  </div>
                </div>
                <div className="h-[55vh] space-y-3 overflow-y-auto px-4 py-4">
                  {chat.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-400">
                      예: &ldquo;이 문제 풀이 알려줘&rdquo;, &ldquo;2번 문제 어떻게 풀어?&rdquo;
                    </p>
                  ) : (
                    chat.map((m, i) => (
                      <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-7 ${
                            m.role === "user" ? "rounded-br-sm bg-brand-600 text-white" : "rounded-bl-sm bg-slate-100 text-ink"
                          }`}
                        >
                          {m.role === "assistant" ? <ContentRenderer contentType="latex" text={m.content} /> : m.content}
                        </div>
                      </div>
                    ))
                  )}
                  {asking ? <p className="text-center text-xs text-slate-400">답변 작성 중...</p> : null}
                </div>
                <div className="border-t border-line p-2">
                  <div className="flex items-center gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          ask();
                        }
                      }}
                      placeholder="풀이에 대해 질문하기"
                      className="min-w-0 flex-1 rounded-full border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                    />
                    <button
                      type="button"
                      onClick={ask}
                      disabled={asking || !input.trim()}
                      className="shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700 disabled:opacity-40"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
