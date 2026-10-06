"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HomeworkAssignment, HomeworkMaterial, HomeworkSettings, HomeworkSubmission } from "@/types/homework";
import type { HomeworkUser } from "./AdminHomeworkClient";
import { HomeworkFeedbackEditor } from "./HomeworkFeedbackEditor";
import { buttonClass, deadlineIso, errorMessage, Field, formatHomeworkDate, homeworkApi, inputClass, Notice, panelClass, secondaryClass, toDeadlineInput, useHomeworkDraftWarning } from "./HomeworkShared";

const groupLabels: Record<string, string> = { external: "외부", private: "과외", routemath: "루트" };
export function HomeworkAssignmentsPanel({ active, materials, assignments, users, usersError, refreshUsers, initialMaterialId, selectionVersion, settings, aiAvailable, refresh }: { active: boolean; materials: HomeworkMaterial[]; assignments: HomeworkAssignment[]; users: HomeworkUser[]; usersError: string; refreshUsers: () => Promise<void>; initialMaterialId: string; selectionVersion: number; settings: HomeworkSettings; aiAvailable: boolean; refresh: () => Promise<void> }) {
  const [materialId, setMaterialId] = useState(initialMaterialId || materials[0]?.id || "");
  const [selectedAssignment, setSelectedAssignment] = useState(assignments[0]?.id || "");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [due, setDue] = useState("");
  const [aiEnabled, setAiEnabled] = useState(settings.aiEnabled);
  const [releaseMode, setReleaseMode] = useState<HomeworkAssignment["releaseMode"]>("review");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useHomeworkDraftWarning(Boolean(studentIds.length || instructions || due));
  const selectedMaterial = materials.find((item) => item.id === materialId);
  const students = useMemo(() => users.filter((student) => !student.isAdmin), [users]);
  const visibleStudents = useMemo(() => students.filter((student) => (group === "all" || student.studentGroup === group) && `${student.name} ${student.email}`.toLowerCase().includes(search.toLowerCase().trim())), [students, group, search]);
  useEffect(() => { if (initialMaterialId) setMaterialId(initialMaterialId); }, [initialMaterialId, selectionVersion]);
  useEffect(() => { if (materialId && !materials.some((m) => m.id === materialId)) setMaterialId(""); }, [materials, materialId]);
  function toggle(id: string) { setStudentIds((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]); }
  async function distribute(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    if (!materialId || !studentIds.length) { setError("자료와 배부할 학생을 선택해 주세요."); return; }
    setBusy(true);
    try {
      const result = await homeworkApi<{ assignment: HomeworkAssignment }>("/api/admin/homework/assignments", { method: "POST", body: JSON.stringify({ materialId, studentIds, instructions: instructions.trim(), dueAt: deadlineIso(due), aiEnabled, releaseMode }) });
      if (result.assignment?.id) setSelectedAssignment(result.assignment.id);
      setStudentIds([]); setInstructions(""); setDue(""); setMessage("선택한 학생에게 PDF를 배부했습니다. 학생의 숙제함에서 확인할 수 있습니다.");
      try { await refresh(); } catch { setError("배부는 완료했습니다. 목록을 보려면 새로고침해 주세요."); }
    } catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <div className="space-y-6">
    <details open={Boolean(initialMaterialId) || assignments.length === 0} className={panelClass}><summary className="cursor-pointer text-lg font-black text-ink">학생에게 숙제 배부</summary>
      <form onSubmit={distribute} className="mt-5 grid gap-6 lg:grid-cols-2"><div className="space-y-4">
        <Field label="배부할 PDF"><select required value={materialId} onChange={(e) => setMaterialId(e.target.value)} className={inputClass}><option value="">자료 선택</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.title} · {material.questionNumbers.length}문항</option>)}</select></Field>
        {materials.length === 0 && <Notice>자료함에서 문제 PDF를 먼저 등록해 주세요.</Notice>}
        <Field label="학생에게 전달할 안내"><textarea rows={3} maxLength={5000} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="풀이에 문항 번호를 표시하고 PDF 한 파일로 제출해 주세요." className={inputClass} /></Field>
        <Field label="제출 기한 (한국시간)" hint="비워 두면 제출 기한을 정하지 않습니다."><input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} /></Field>
        <AiControls aiEnabled={aiEnabled} setAiEnabled={setAiEnabled} releaseMode={releaseMode} setReleaseMode={setReleaseMode} disabled={busy} available={aiAvailable} globallyEnabled={settings.aiEnabled} referenceApproved={selectedMaterial?.referenceStatus === "approved"} />
      </div><div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-black text-ink">가입 학생 선택</h3><span className="text-xs font-bold text-brand-700">{studentIds.length}명 선택</span></div>
        {usersError && <Notice error>{usersError} <button type="button" onClick={() => void refreshUsers()} className="font-black underline">다시 불러오기</button></Notice>}
        <div className="flex gap-2"><input aria-label="학생 이름 또는 이메일 검색" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름 또는 이메일 검색" className={inputClass} /><select aria-label="학생 그룹 필터" value={group} onChange={(e) => setGroup(e.target.value)} className={`${inputClass} max-w-[110px]`}><option value="all">전체 그룹</option>{Object.entries(groupLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="flex items-center justify-between text-xs"><button type="button" onClick={() => setStudentIds((ids) => [...new Set([...ids, ...visibleStudents.map((student) => student.id)])])} className="font-bold text-brand-700">검색 결과 모두 선택</button><button type="button" onClick={() => setStudentIds([])} className="font-bold text-slate-500">선택 해제</button></div>
        <div className="max-h-72 overflow-y-auto rounded-xl border border-line">{visibleStudents.length === 0 ? <p className="p-6 text-center text-sm text-slate-500">선택할 학생이 없습니다.</p> : visibleStudents.map((student) => <label key={student.id} className={`flex cursor-pointer items-center gap-3 border-b border-line px-3 py-3 last:border-0 ${studentIds.includes(student.id) ? "bg-brand-50" : "hover:bg-slate-50"}`}><input type="checkbox" checked={studentIds.includes(student.id)} onChange={() => toggle(student.id)} className="h-4 w-4 shrink-0 accent-brand-600" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{student.name || "이름 미등록"}</span><span className="block truncate text-xs text-slate-500">{student.email}</span></span><span className="text-xs text-slate-500">{groupLabels[student.studentGroup] || student.studentGroup}</span></label>)}</div>
        <p className="text-xs text-slate-500">관리자 계정은 배부 대상에서 제외됩니다. 검색·필터를 바꿔도 선택한 학생은 유지됩니다.</p>
        {studentIds.length > 0 && <p className="text-xs leading-5 text-slate-600">선택: {students.filter((s) => studentIds.includes(s.id)).map((s) => s.name || s.email).join(", ")}</p>}
        {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
        <button type="submit" disabled={busy || !materialId || !studentIds.length} className={`${buttonClass} w-full`}>{busy ? "배부 중..." : `${studentIds.length}명에게 PDF 배부`}</button>
      </div></form>
    </details>
    <section className={panelClass}><h2 className="text-lg font-black text-ink">배부한 숙제와 제출</h2>{assignments.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">아직 배부한 숙제가 없습니다.</p> : <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{assignments.map((assignment) => <button type="button" key={assignment.id} onClick={() => setSelectedAssignment(assignment.id)} aria-pressed={selectedAssignment === assignment.id} className={`rounded-xl border p-4 text-left ${selectedAssignment === assignment.id ? "border-brand-400 bg-brand-50" : "border-line hover:border-brand-200"}`}><p className="font-black text-ink">{assignment.material.title}</p><p className="mt-2 text-xs text-slate-500">제출 {assignment.submittedCount} / 배부 {assignment.recipientCount}명</p><p className="mt-1 text-xs text-slate-500">{formatHomeworkDate(assignment.dueAt)}</p><p className="mt-2 text-xs font-bold text-brand-700">{!assignment.aiEnabled ? "직접 첨삭" : assignment.releaseMode === "auto" ? "AI 자동발송" : "AI 초안 · 검토 후 발송"}</p></button>)}</div>}</section>
    {selectedAssignment && <AssignmentDetail key={selectedAssignment} activePane={active} id={selectedAssignment} settings={settings} aiAvailable={aiAvailable} refresh={refresh} />}
  </div>;
}

function AiControls({ aiEnabled, setAiEnabled, releaseMode, setReleaseMode, disabled, available, globallyEnabled, referenceApproved }: { aiEnabled: boolean; setAiEnabled: (value: boolean) => void; releaseMode: HomeworkAssignment["releaseMode"]; setReleaseMode: (value: HomeworkAssignment["releaseMode"]) => void; disabled: boolean; available: boolean; globallyEnabled: boolean; referenceApproved: boolean }) {
  return <fieldset disabled={disabled} className="space-y-3 rounded-xl bg-slate-50 p-4"><label className="flex items-center gap-2 text-sm font-black text-ink"><input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} className="h-4 w-4 accent-brand-600" />이 숙제에 AI 첨삭 사용</label>{aiEnabled && <Field label="피드백 발송 방식"><select value={releaseMode} onChange={(e) => setReleaseMode(e.target.value as HomeworkAssignment["releaseMode"])} className={inputClass}><option value="review">교사 검토 후 발송</option><option value="auto">AI 자동발송</option></select></Field>}
    <p className="text-xs leading-5 text-slate-500">{!aiEnabled ? "선생님이 직접 문항별 피드백을 작성하고 발송합니다." : releaseMode === "review" ? "AI 초안을 확인·수정하고 검토 완료한 뒤 학생에게 보냅니다." : "교사 승인 기준풀이와 검증된 첨삭이 준비된 경우 발송합니다. 판독·검증이 어려운 문항은 검토 대기로 남습니다."}</p>
    {aiEnabled && (!available || !globallyEnabled) && <p className="text-xs font-bold text-amber-700">{!available ? "AI 연결이 없어 현재 생성할 수 없습니다. 직접 첨삭할 수 있습니다." : "전체 숙제 AI 설정이 꺼져 있어 현재 생성하지 않습니다."}</p>}
    {aiEnabled && releaseMode === "auto" && !referenceApproved && <p className="text-xs font-bold text-amber-700">이 자료의 기준풀이를 교사가 승인하기 전에는 자동발송되지 않습니다.</p>}
  </fieldset>;
}

function AssignmentDetail({ activePane, id, settings, aiAvailable, refresh }: { activePane: boolean; id: string; settings: HomeworkSettings; aiAvailable: boolean; refresh: () => Promise<void> }) {
  const [assignment, setAssignment] = useState<HomeworkAssignment | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [releaseMode, setReleaseMode] = useState<HomeworkAssignment["releaseMode"]>("review");
  const [due, setDue] = useState("");
  const active = useRef(true);
  const load = useCallback(async (signal?: AbortSignal) => {
    const result = await homeworkApi<{ assignment: HomeworkAssignment; submissions: HomeworkSubmission[] }>(`/api/admin/homework/assignments/${id}`, { signal });
    if (!active.current) return;
    setAssignment(result.assignment); setSubmissions(result.submissions); setError("");
    return result;
  }, [id]);
  useEffect(() => {
    active.current = true;
    const controller = new AbortController();
    load(controller.signal).then((result) => { if (!active.current || !result) return; setAiEnabled(result.assignment.aiEnabled); setReleaseMode(result.assignment.releaseMode); setDue(toDeadlineInput(result.assignment.dueAt)); setSelectedId(result.submissions.find((s) => s.isLatest)?.id || result.submissions[0]?.id || ""); }).catch((e) => { if (active.current && !controller.signal.aborted) setError(errorMessage(e)); }).finally(() => { if (active.current) setLoading(false); });
    return () => { active.current = false; controller.abort(); };
  }, [load]);
  const selected = submissions.find((submission) => submission.id === selectedId);
  const processing = selected?.aiStatus === "processing" || selected?.aiStatus === "pending" || assignment?.material.referenceStatus === "processing";
  useEffect(() => {
    if (!processing || !activePane) return;
    let inFlight = false;
    const timer = setInterval(async () => { if (inFlight) return; inFlight = true; try { await load(); } catch (e) { if (active.current) setError(errorMessage(e)); } finally { inFlight = false; } }, 7000);
    return () => clearInterval(timer);
  }, [processing, activePane, load]);
  async function saveOptions(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try { await homeworkApi(`/api/admin/homework/assignments/${id}`, { method: "PATCH", body: JSON.stringify({ aiEnabled, releaseMode, dueAt: deadlineIso(due) }) }); await load(); await refresh(); setMessage("배부 설정을 저장했습니다."); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  if (loading) return <p className="py-10 text-center text-sm text-slate-500">학생 제출을 불러오고 있습니다.</p>;
  if (!assignment) return <Notice error>{error || "숙제를 불러오지 못했습니다."} <button type="button" onClick={() => void load().catch((e) => setError(errorMessage(e)))} className="font-black underline">다시 불러오기</button></Notice>;
  return <section className={`${panelClass} space-y-5`}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black text-ink">{assignment.material.title}</h2><p className="mt-1 text-xs text-slate-500">배부 {assignment.recipientCount}명 · {formatHomeworkDate(assignment.dueAt)}</p>{assignment.instructions && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{assignment.instructions}</p>}</div><button type="button" onClick={() => void load().catch((e) => setError(errorMessage(e)))} className={secondaryClass}>제출 새로고침</button></div>
    <details className="rounded-xl border border-line p-4"><summary className="cursor-pointer text-sm font-bold text-slate-600">AI 사용·발송 방식·기한 변경</summary><form onSubmit={saveOptions} className="mt-4 grid items-start gap-4 md:grid-cols-2"><AiControls aiEnabled={aiEnabled} setAiEnabled={setAiEnabled} releaseMode={releaseMode} setReleaseMode={setReleaseMode} disabled={busy} available={aiAvailable} globallyEnabled={settings.aiEnabled} referenceApproved={assignment.material.referenceStatus === "approved"} /><div className="space-y-4"><Field label="제출 기한 (한국시간)"><input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} /></Field><button type="submit" disabled={busy} className={buttonClass}>{busy ? "저장 중..." : "배부 설정 저장"}</button></div></form></details>
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-base font-black text-ink">학생 제출</h3><span className="text-xs text-slate-500">재제출 전 파일도 확인할 수 있습니다.</span></div>
    {submissions.length === 0 ? <p className="rounded-xl bg-slate-50 py-10 text-center text-sm text-slate-500">아직 제출한 학생이 없습니다.</p> : <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">{submissions.map((submission) => <button type="button" key={submission.id} onClick={() => setSelectedId(submission.id)} aria-pressed={selectedId === submission.id} className={`rounded-xl border p-3 text-left ${selectedId === submission.id ? "border-brand-400 bg-brand-50" : "border-line"}`}><div className="flex justify-between gap-2"><span className="text-sm font-black text-ink">{submission.studentName || "학생"}</span><span className="text-[11px] font-bold text-slate-500">{submission.attemptNumber}차 {submission.isLatest ? "· 최신" : "· 이전"}</span></div><p className="mt-1 text-xs text-slate-500">{formatHomeworkDate(submission.createdAt)}{submission.isLate ? " · 기한 후 제출" : ""}</p><p className={`mt-2 text-xs font-bold ${submission.publishedAt ? "text-brand-700" : "text-amber-700"}`}>{submission.publishedAt ? "피드백 발송됨" : submission.aiStatus === "processing" ? "AI 분석 중" : submission.aiStatus === "pending" ? "AI 처리 대기" : submission.aiStatus === "failed" ? "AI 처리 실패 · 직접 첨삭 가능" : submission.aiStatus === "draft" ? "피드백 검토 대기" : "직접 첨삭 대기"}</p></button>)}</div>}
    {selected && <HomeworkFeedbackEditor key={selected.id} submission={selected} assignment={assignment} aiAvailable={aiAvailable} globallyEnabled={settings.aiEnabled} refresh={async () => { await load(); await refresh(); }} />}
  </section>;
}
