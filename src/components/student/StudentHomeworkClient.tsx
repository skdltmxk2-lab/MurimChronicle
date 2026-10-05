"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { adminFetch } from "@/lib/api/adminFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";
import {
  HOMEWORK_MAX_BYTES,
  HOMEWORK_MAX_PAGES,
  HOMEWORK_VERDICT_LABELS,
  type HomeworkFeedback,
  type StudentHomework,
} from "@/types/homework";

type Submission = StudentHomework["submissions"][number];
type HomeworkFilter = "all" | "unsubmitted" | "feedback";
type UploadPhase = "ready" | "preparing" | "uploading" | "submitting";
type PreparedFile = { file: File; pages: number };

const buttonClass = "rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";
const verdictClasses: Record<HomeworkFeedback["verdict"], string> = {
  correct: "bg-emerald-50 text-emerald-700",
  partial: "bg-amber-50 text-amber-700",
  incorrect: "bg-rose-50 text-rose-700",
  unreadable: "bg-slate-100 text-slate-700",
  missing: "bg-slate-100 text-slate-700",
  review: "bg-indigo-50 text-indigo-700",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 확인 필요";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function orderedSubmissions(homework: StudentHomework): Submission[] {
  return [...homework.submissions].sort((a, b) => b.attemptNumber - a.attemptNumber);
}

function isPublished(submission: Submission | undefined): boolean {
  return Boolean(submission?.publishedAt && submission.publishedFeedback);
}

function submissionStatus(submission: Submission | undefined): string {
  if (!submission) return "미제출";
  if (isPublished(submission)) return "피드백 도착";
  if (submission.aiStatus === "pending" || submission.aiStatus === "processing") return "풀이 확인 중";
  return "선생님 확인 중";
}

function hasPendingAnalysis(homework: StudentHomework[]): boolean {
  return homework.some((item) => {
    const submission = orderedSubmissions(item)[0];
    return submission && !isPublished(submission) && (submission.aiStatus === "pending" || submission.aiStatus === "processing");
  });
}

function matchesFilter(item: StudentHomework, filter: HomeworkFilter): boolean {
  const latest = orderedSubmissions(item)[0];
  if (filter === "unsubmitted") return !latest;
  if (filter === "feedback") return isPublished(latest);
  return true;
}

async function readApi<T>(response: Response, fallback: string): Promise<T> {
  let json: (T & { ok?: boolean; message?: string }) | null;
  try {
    json = await response.json();
  } catch {
    throw new Error(fallback);
  }
  if (!response.ok || !json?.ok) throw new Error(json?.message || fallback);
  return json;
}

async function preparePdf(file: File): Promise<PreparedFile> {
  if (!file.name.toLowerCase().endsWith(".pdf")) throw new Error("풀이를 PDF 파일로 올려 주세요.");
  if (!file.size) throw new Error("내용이 없는 파일입니다. PDF를 다시 선택해 주세요.");
  if (file.size > HOMEWORK_MAX_BYTES) throw new Error("PDF는 15MB 이하로 올려 주세요.");

  const header = new TextDecoder("ascii").decode(await file.slice(0, 1024).arrayBuffer());
  if (!header.includes("%PDF-")) throw new Error("PDF 형식을 확인할 수 없습니다. PDF로 다시 저장해 주세요.");

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
    stopAtErrors: true,
  });
  try {
    const document = await task.promise;
    if (document.numPages < 1) throw new Error("내용이 없는 PDF입니다.");
    if (document.numPages > HOMEWORK_MAX_PAGES) throw new Error(`PDF는 ${HOMEWORK_MAX_PAGES}쪽 이하로 올려 주세요.`);
    return { file, pages: document.numPages };
  } catch (error) {
    if (error instanceof Error && error.name === "PasswordException") {
      throw new Error("암호가 설정된 PDF입니다. 암호를 해제한 뒤 올려 주세요.");
    }
    if (error instanceof Error && (error.message.includes("쪽 이하") || error.message === "내용이 없는 PDF입니다.")) throw error;
    throw new Error("PDF를 읽을 수 없습니다. 파일을 다시 저장한 뒤 올려 주세요.");
  } finally {
    await task.destroy();
  }
}

function FeedbackCard({ feedback }: { feedback: HomeworkFeedback }) {
  const sections = [
    { label: "선생님 코멘트", text: feedback.comment },
    { label: "다시 확인할 단계", text: feedback.errorStep },
    { label: "이유", text: feedback.reason },
    { label: "다음 풀이 힌트", text: feedback.hint },
  ].filter((section) => section.text?.trim());

  return (
    <article className="min-w-0 rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h4 className="text-lg font-black text-ink">{feedback.questionNumber}번</h4>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${verdictClasses[feedback.verdict] ?? verdictClasses.review}`}>
          {HOMEWORK_VERDICT_LABELS[feedback.verdict] ?? "확인 필요"}
        </span>
      </div>
      <div className="space-y-4 text-sm leading-7 text-slate-700">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="mb-1 text-xs font-bold text-slate-500">{section.label}</p>
            <ContentRenderer text={section.text} />
          </div>
        ))}
        {sections.length === 0 ? <p>등록된 상세 코멘트가 없습니다.</p> : null}
      </div>
    </article>
  );
}

export function StudentHomeworkClient() {
  const { user, authChecked } = useAuth();
  const [homework, setHomework] = useState<StudentHomework[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [filter, setFilter] = useState<HomeworkFilter>("all");
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [prepared, setPrepared] = useState<PreparedFile | null>(null);
  const [checkingFile, setCheckingFile] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("ready");
  const [submitError, setSubmitError] = useState("");
  const [notice, setNotice] = useState("");
  const [fileBusy, setFileBusy] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const [fileLink, setFileLink] = useState<{ key: string; url: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const checkingVersion = useRef(0);
  const submitLock = useRef(false);
  const fileLock = useRef(false);
  const requestVersion = useRef(0);

  const items = useMemo(() => homework ?? [], [homework]);
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const attempts = useMemo(() => selected ? orderedSubmissions(selected) : [], [selected]);
  const activeAttempt = attempts.find((attempt) => attempt.id === attemptId) ?? attempts[0];
  const latestAttempt = attempts[0];
  const busy = uploadPhase !== "ready";
  const pendingAnalysis = hasPendingAnalysis(items);
  const filteredItems = items.filter((item) => matchesFilter(item, filter));

  const loadHomework = useCallback(async (quiet = false) => {
    if (!user) return;
    const version = ++requestVersion.current;
    if (!quiet) setLoading(true);
    try {
      const response = await adminFetch("/api/student/homework", { cache: "no-store" });
      const data = await readApi<{ ok: true; homework: StudentHomework[] }>(response, "숙제를 불러오지 못했습니다. 다시 시도해 주세요.");
      if (version !== requestVersion.current) return;
      if (!Array.isArray(data.homework)) throw new Error("숙제 목록을 확인할 수 없습니다. 다시 시도해 주세요.");
      setHomework(data.homework);
      setSelectedId((current) => data.homework.some((item) => item.id === current) ? current : data.homework[0]?.id ?? null);
      setListError("");
    } catch (error) {
      if (version !== requestVersion.current) return;
      setListError(error instanceof Error ? error.message : "숙제를 불러오지 못했습니다.");
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authChecked || !user) {
      requestVersion.current += 1;
      setHomework(null);
      setSelectedId(null);
      return;
    }
    void loadHomework();
    return () => { requestVersion.current += 1; };
  }, [authChecked, user, loadHomework]);

  useEffect(() => {
    if (!user || !pendingAnalysis) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible" && !submitLock.current) void loadHomework(true);
    }, 15000);
    return () => window.clearInterval(interval);
  }, [user, pendingAnalysis, loadHomework]);

  useEffect(() => {
    checkingVersion.current += 1;
    setPrepared(null);
    setCheckingFile(false);
    setAttemptId(null);
    setSubmitError("");
    setNotice("");
    setFileError("");
    setFileLink(null);
    if (fileRef.current) fileRef.current.value = "";
  }, [selectedId]);

  useEffect(() => () => { checkingVersion.current += 1; }, []);

  function changeFilter(value: HomeworkFilter) {
    setFilter(value);
    if (!selected || !matchesFilter(selected, value)) {
      setSelectedId(items.find((item) => matchesFilter(item, value))?.id ?? null);
    }
  }

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const version = ++checkingVersion.current;
    setPrepared(null);
    setSubmitError("");
    setNotice("");
    if (!file) {
      setCheckingFile(false);
      return;
    }
    setCheckingFile(true);
    try {
      const result = await preparePdf(file);
      if (version === checkingVersion.current) setPrepared(result);
    } catch (error) {
      if (version !== checkingVersion.current) return;
      setSubmitError(error instanceof Error ? error.message : "PDF를 확인하지 못했습니다.");
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      if (version === checkingVersion.current) setCheckingFile(false);
    }
  }

  async function submitPdf(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !prepared || checkingFile || submitLock.current) return;
    submitLock.current = true;
    const assignmentId = selected.id;
    const { file, pages } = prepared;
    setSubmitError("");
    setNotice("");
    setUploadPhase("preparing");
    try {
      const response = await adminFetch("/api/homework/upload", {
        method: "POST",
        body: JSON.stringify({ purpose: "submission", assignmentId, name: file.name, size: file.size, pages }),
      });
      const upload = await readApi<{ ok: true; uploadId: string; bucket: string; path: string; token: string }>(response, "업로드를 준비하지 못했습니다.");
      if (!upload.uploadId || !upload.bucket || !upload.path || !upload.token) throw new Error("업로드 정보를 확인하지 못했습니다. 다시 시도해 주세요.");
      setUploadPhase("uploading");
      const { error } = await supabase.storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, file, { contentType: "application/pdf" });
      if (error) throw new Error("PDF 업로드에 실패했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.");
      setUploadPhase("submitting");
      const submitted = await adminFetch(`/api/student/homework/${encodeURIComponent(assignmentId)}/submit`, {
        method: "POST",
        body: JSON.stringify({ uploadId: upload.uploadId }),
      });
      const result = await readApi<{ ok: true; submissionId: string }>(submitted, "제출을 저장하지 못했습니다. 다시 시도해 주세요.");
      setPrepared(null);
      if (fileRef.current) fileRef.current.value = "";
      setAttemptId(result.submissionId);
      setNotice("풀이 PDF를 제출했습니다. 피드백이 공개되면 이 화면에서 확인할 수 있어요.");
      await loadHomework(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      submitLock.current = false;
      setUploadPhase("ready");
    }
  }

  async function openPdf(kind: "assignmentId" | "submissionId", id: string) {
    if (fileLock.current) return;
    fileLock.current = true;
    const key = `${kind}:${id}`;
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    setFileBusy(key);
    setFileError("");
    setFileLink(null);
    try {
      const response = await adminFetch(`/api/homework/file?${kind}=${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await readApi<{ ok: true; url: string }>(response, "PDF를 열지 못했습니다. 다시 시도해 주세요.");
      const url = new URL(data.url);
      if (!["https:", "http:"].includes(url.protocol)) throw new Error("PDF 주소를 확인하지 못했습니다.");
      if (popup) popup.location.replace(url.toString());
      else setFileLink({ key, url: url.toString() });
    } catch (error) {
      popup?.close();
      setFileError(error instanceof Error ? error.message : "PDF를 열지 못했습니다.");
    } finally {
      fileLock.current = false;
      setFileBusy(null);
    }
  }

  if (!authChecked) {
    return <main className="mx-auto max-w-6xl px-5 py-12"><p role="status" className="text-sm text-slate-500">로그인을 확인하고 있어요.</p></main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <section className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
          <h1 className="text-2xl font-black text-ink">로그인이 필요합니다</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">로그인한 뒤 배부받은 숙제와 피드백을 확인해 주세요.</p>
          <Link href="/student/exams" className="mt-6 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700">로그인하러 가기</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black tracking-widest text-brand-600">루트편입</p>
          <h1 className="mt-1 text-3xl font-black text-ink">내 숙제</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">문제 PDF를 받고, 풀이 PDF를 제출한 뒤 문항별 피드백을 확인하세요.</p>
        </div>
        <button type="button" className={buttonClass} disabled={loading || busy} onClick={() => void loadHomework()}>
          {loading ? "불러오는 중…" : "새로고침"}
        </button>
      </header>

      {listError ? <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{listError}</p> : null}

      {homework === null ? (
        <section className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-slate-500" role="status">
          {loading ? "배부받은 숙제를 불러오고 있어요." : "새로고침을 눌러 숙제를 다시 불러와 주세요."}
        </section>
      ) : items.length === 0 ? (
        <section className="rounded-2xl border border-line bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-black text-ink">아직 배부받은 숙제가 없어요</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">선생님이 숙제나 데일리테스트를 배부하면 여기에 표시됩니다.</p>
        </section>
      ) : (
        <div className="grid min-w-0 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="min-w-0">
            <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1" aria-label="숙제 목록 필터">
              {([
                ["all", "전체"], ["unsubmitted", "미제출"], ["feedback", "피드백"],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" aria-pressed={filter === value} disabled={busy || fileBusy !== null} onClick={() => changeFilter(value)}
                  className={`flex-1 rounded-lg px-2 py-2 text-sm font-bold transition ${filter === value ? "bg-white text-ink shadow-sm" : "text-slate-500 hover:text-ink"}`}>
                  {label}
                </button>
              ))}
            </div>
            <ul className="max-h-[360px] space-y-2 overflow-y-auto pb-1 lg:max-h-[calc(100vh-230px)]" aria-label="배부받은 숙제">
              {filteredItems.map((item) => {
                const latest = orderedSubmissions(item)[0];
                const active = selected?.id === item.id;
                return (
                  <li key={item.id}>
                    <button type="button" disabled={busy || fileBusy !== null} aria-pressed={active} onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition disabled:cursor-wait ${active ? "border-brand-500 bg-brand-50" : "border-line bg-white hover:border-brand-300"}`}>
                      <span className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                        <span>{item.kind === "daily" ? "데일리테스트" : "숙제"}</span>
                        {item.subject ? <span>· {item.subject}</span> : null}
                      </span>
                      <span className="mt-2 block break-words font-black leading-6 text-ink">{item.title}</span>
                      <span className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`rounded-full px-2.5 py-1 font-bold ${isPublished(latest) ? "bg-emerald-50 text-emerald-700" : latest ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>
                          {submissionStatus(latest)}
                        </span>
                        <span className="text-slate-500">{item.dueAt ? `마감 ${formatDate(item.dueAt)}` : "마감일 없음"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {filteredItems.length === 0 ? <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-slate-500">이 조건에 해당하는 숙제가 없어요.</p> : null}
          </aside>

          {selected ? (
            <div className="min-w-0 space-y-5">
              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6" aria-labelledby="homework-title">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-brand-600">
                  <span>{selected.kind === "daily" ? "데일리테스트" : "숙제"}</span>
                  {selected.subject ? <span>· {selected.subject}</span> : null}
                </div>
                <h2 id="homework-title" className="mt-2 break-words text-2xl font-black text-ink">{selected.title}</h2>
                <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div><dt className="inline font-bold">배부일 </dt><dd className="inline">{formatDate(selected.createdAt)}</dd></div>
                  <div><dt className="inline font-bold">마감일 </dt><dd className="inline">{selected.dueAt ? `${formatDate(selected.dueAt)} (한국 시간)` : "없음 · 편한 시간에 제출하세요"}</dd></div>
                  {selected.questionNumbers.length ? <div className="sm:col-span-2"><dt className="inline font-bold">문항 </dt><dd className="inline break-words">{selected.questionNumbers.map((number) => `${number}번`).join(", ")}</dd></div> : null}
                </dl>
                {selected.instructions ? (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                    <h3 className="mb-1 text-xs font-bold text-slate-500">선생님 안내</h3>
                    <ContentRenderer text={selected.instructions} />
                  </div>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button type="button" className={buttonClass} disabled={fileBusy !== null} onClick={() => void openPdf("assignmentId", selected.id)}>
                    {fileBusy === `assignmentId:${selected.id}` ? "PDF 여는 중…" : "문제 PDF 보기·저장"}
                  </button>
                  <span className="min-w-0 break-all text-xs text-slate-500">{selected.pdfName}</span>
                </div>
              </section>

              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6" aria-labelledby="upload-title">
                <h3 id="upload-title" className="text-lg font-black text-ink">{latestAttempt ? "풀이 다시 제출하기" : "풀이 PDF 제출하기"}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">풀이에 문항 번호가 보이도록 작성해 주세요. 여러 장의 풀이를 PDF 한 파일로 묶어 올리면 됩니다.</p>
                {latestAttempt ? <p className="mt-2 text-xs leading-5 text-slate-500">재제출은 새 제출 회차로 기록됩니다. 이전 제출물과 피드백도 계속 확인할 수 있어요.</p> : null}
                {selected.dueAt && Date.parse(selected.dueAt) < Date.now() ? <p className="mt-2 text-xs leading-5 text-amber-700">마감일이 지났지만 제출할 수 있어요. 마감 후 제출로 기록됩니다.</p> : null}
                <form onSubmit={submitPdf} className="mt-4">
                  <label htmlFor="homework-pdf" className="block text-sm font-bold text-ink">풀이 PDF 선택 <span className="font-normal text-slate-500">(15MB · {HOMEWORK_MAX_PAGES}쪽 이하)</span></label>
                  <input id="homework-pdf" ref={fileRef} type="file" accept="application/pdf,.pdf" disabled={busy || checkingFile} onChange={(event) => void chooseFile(event)}
                    className="mt-2 block w-full min-w-0 rounded-xl border border-line bg-slate-50 p-3 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-bold file:text-ink disabled:opacity-50" />
                  <div className="mt-3 min-h-5 text-xs text-slate-500" role="status">
                    {checkingFile ? "PDF의 형식과 페이지 수를 확인하고 있어요." : prepared ? `${prepared.pages}쪽 · ${(prepared.file.size / 1024 / 1024).toFixed(1)}MB · 제출 준비 완료` : "태블릿 필기와 종이를 스캔한 PDF 모두 제출할 수 있어요."}
                  </div>
                  {submitError ? <p role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm leading-6 text-rose-700">{submitError}</p> : null}
                  {notice ? <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm leading-6 text-emerald-700">{notice}</p> : null}
                  <button type="submit" disabled={!prepared || busy || checkingFile}
                    className="mt-4 w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                    {uploadPhase === "preparing" ? "제출 준비 중…" : uploadPhase === "uploading" ? "PDF 업로드 중…" : uploadPhase === "submitting" ? "제출 저장 중…" : latestAttempt ? "새 풀이 제출하기" : "풀이 제출하기"}
                  </button>
                </form>
              </section>

              <section className="rounded-2xl border border-line bg-white p-5 sm:p-6" aria-labelledby="feedback-title">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 id="feedback-title" className="text-lg font-black text-ink">제출 내역과 피드백</h3>
                  {attempts.length ? <span className="text-xs text-slate-500">총 {attempts.length}회 제출</span> : null}
                </div>
                {!activeAttempt ? <p className="mt-4 text-sm leading-6 text-slate-500">풀이를 제출하면 제출 내역과 번호별 피드백이 여기에 표시됩니다.</p> : (
                  <>
                    <label htmlFor="homework-attempt" className="mt-4 block text-xs font-bold text-slate-500">확인할 제출 회차</label>
                    <select id="homework-attempt" value={activeAttempt.id} onChange={(event) => setAttemptId(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-line bg-white p-3 text-sm text-ink">
                      {attempts.map((attempt) => (
                        <option key={attempt.id} value={attempt.id}>{attempt.attemptNumber}회차{attempt.id === latestAttempt?.id ? " · 최근 제출" : ""} · {formatDate(attempt.createdAt)} · {submissionStatus(attempt)}</option>
                      ))}
                    </select>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="min-w-0 text-xs leading-5 text-slate-600">
                        <p className="break-all font-bold">{activeAttempt.pdfName}</p>
                        <p>{formatDate(activeAttempt.createdAt)} 제출{activeAttempt.isLate ? " · 마감 후 제출" : ""}</p>
                      </div>
                      <button type="button" className={`${buttonClass} shrink-0`} disabled={fileBusy !== null} onClick={() => void openPdf("submissionId", activeAttempt.id)}>
                        {fileBusy === `submissionId:${activeAttempt.id}` ? "PDF 여는 중…" : "내 풀이 PDF"}
                      </button>
                    </div>
                    {isPublished(activeAttempt) ? (
                      <div className="mt-5">
                        <p className="mb-4 text-xs leading-5 text-slate-500">{activeAttempt.attemptNumber}회차 풀이에 대한 피드백 · {formatDate(activeAttempt.publishedAt!)} 공개</p>
                        <div className="space-y-3">
                          {activeAttempt.publishedFeedback!.map((feedback, index) => <FeedbackCard key={`${feedback.questionNumber}:${index}`} feedback={feedback} />)}
                        </div>
                        {activeAttempt.publishedFeedback!.length === 0 ? <p className="text-sm text-slate-500">공개된 문항별 코멘트가 없습니다.</p> : null}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl border border-dashed border-line p-5" role="status">
                        <p className="text-sm font-bold text-ink">{submissionStatus(activeAttempt)}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">피드백이 공개되면 문항 번호별로 확인할 수 있어요. 새로고침으로 최신 상태를 확인하세요.</p>
                      </div>
                    )}
                  </>
                )}
              </section>
              {fileError ? <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{fileError}</p> : null}
              {fileLink ? <p role="status" className="rounded-xl bg-brand-50 p-3 text-sm leading-6 text-brand-700">새 창이 차단되어 있어요. <a href={fileLink.url} target="_blank" rel="noopener noreferrer" className="font-bold underline">PDF 열기</a>를 눌러 확인하고 저장하세요.</p> : null}
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
