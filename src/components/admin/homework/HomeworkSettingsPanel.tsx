"use client";

import { useState } from "react";
import type { HomeworkSettings } from "@/types/homework";
import { buttonClass, errorMessage, Field, homeworkApi, inputClass, Notice, panelClass, useHomeworkDraftWarning } from "./HomeworkShared";

export function HomeworkSettingsPanel({ settings, aiAvailable, refresh }: { settings: HomeworkSettings; aiAvailable: boolean; refresh: () => Promise<void> }) {
  const [draft, setDraft] = useState(settings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useHomeworkDraftWarning(JSON.stringify(draft) !== JSON.stringify(settings));
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try { const result = await homeworkApi<{ settings: HomeworkSettings }>("/api/admin/homework/settings", { method: "PATCH", body: JSON.stringify(draft) }); setDraft(result.settings); await refresh(); setMessage("AI 설정을 저장했습니다. 새로 생성하는 피드백부터 적용됩니다."); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  }
  return <form onSubmit={save} className={`${panelClass} mx-auto max-w-3xl space-y-6`}>
    <div><h2 className="text-xl font-black text-ink">우리 수업에 맞는 피드백</h2><p className="mt-2 text-sm leading-6 text-slate-500">말투와 설명 방식을 저장하고, 실제 초안을 검토하며 조정하세요.</p></div>
    {!aiAvailable && <Notice>현재 서버에 AI 연결이 설정되지 않아 생성 기능을 사용할 수 없습니다. 설정을 저장하거나 직접 첨삭하는 것은 가능합니다.</Notice>}
    <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"><input type="checkbox" checked={draft.aiEnabled} onChange={(e) => setDraft({ ...draft, aiEnabled: e.target.checked })} className="mt-1 h-4 w-4 accent-brand-600" /><span><span className="block text-sm font-black text-ink">숙제 AI 사용</span><span className="mt-1 block text-xs leading-5 text-slate-500">끄면 기준풀이와 자동 첨삭을 새로 생성하지 않습니다. 숙제 배부와 직접 첨삭은 계속 사용할 수 있습니다.</span></span></label>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="말투"><select value={draft.tone} onChange={(e) => setDraft({ ...draft, tone: e.target.value as HomeworkSettings["tone"] })} className={inputClass}><option value="polite">존댓말 · 차분하게</option><option value="casual">반말 · 친근하게</option></select></Field><Field label="설명 방식"><select value={draft.depth} onChange={(e) => setDraft({ ...draft, depth: e.target.value as HomeworkSettings["depth"] })} className={inputClass}><option value="hint">힌트 중심</option><option value="detailed">자세한 설명</option></select></Field></div>
    <Field label="우리의 피드백 원칙" hint="강조할 내용, 설명 길이, 자주 쓰거나 피할 표현을 적어 주세요."><textarea rows={5} maxLength={4000} value={draft.styleGuide} onChange={(e) => setDraft({ ...draft, styleGuide: e.target.value })} placeholder="잘한 점을 먼저 짚고, 처음 틀린 단계와 다음에 확인할 것을 알려 주세요." className={inputClass} /></Field>
    <Field label="실제 첨삭 예시" hint="학생 이름과 개인정보를 제외한 예시를 넣어 주세요. 예시는 생성 요청의 참고 자료로 사용됩니다."><textarea rows={8} maxLength={10000} value={draft.examples} onChange={(e) => setDraft({ ...draft, examples: e.target.value })} placeholder="예: 치환을 고른 건 좋아요. 다만 u로 바꾼 뒤 적분 구간도 같이 바꾸어야 해요. 먼저 양 끝값부터 다시 확인해 봅시다." className={inputClass} /></Field>
    <p className="text-xs leading-5 text-slate-500">피드백 수정만으로 AI 모델이 자동 학습되지는 않습니다. 참고할 첨삭은 이곳의 예시에 추가해 주세요.</p>
    {error && <Notice error>{error}</Notice>}{message && <Notice>{message}</Notice>}
    <button type="submit" disabled={busy} className={buttonClass}>{busy ? "저장 중..." : "AI 설정 저장"}</button>
  </form>;
}
