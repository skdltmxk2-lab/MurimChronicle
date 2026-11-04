"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { electronicsAdminFetch } from "@/lib/electronics/api";
import type { BoardOptions, Circuit, CircuitLayout } from "@/lib/electronics/types";
import type { BoardSelection } from "./Breadboard";
import { parseSimulationAction, type SimulationAssistantAction, type SimulationContext } from "@/lib/electronics/simulation-controls";

type ChatTurn = {
  id: number;
  question: string;
  answer?: string;
  context: string;
  status: "pending" | "done" | "error" | "cancelled";
  error?: string;
  controlResult?: string;
};
type HistoryMessage = { role: "user" | "assistant"; content: string };

/** The server receives complete question/answer pairs followed by the new question. */
function requestHistory(turns: ChatTurn[], context: string, question: string): HistoryMessage[] {
  const result: HistoryMessage[] = [{ role: "user", content: question }];
  let characters = question.length;
  const completed = turns.filter(turn => turn.context === context && turn.status === "done" && turn.answer);
  for (let index = completed.length - 1; index >= 0 && result.length < 21; index -= 1) {
    const turn = completed[index];
    const answer = turn.answer!.slice(0, 12000);
    if (characters + turn.question.length + answer.length > 40000) break;
    result.unshift({ role: "user", content: turn.question }, { role: "assistant", content: answer });
    characters += turn.question.length + answer.length;
  }
  return result;
}

export function ElectronicsChat({ ownerId, circuit, boardOptions, layout, selection, simulation, onSimulationAction, onClose }: {
  ownerId: string;
  circuit: Circuit;
  boardOptions: BoardOptions;
  layout: CircuitLayout;
  selection: BoardSelection;
  simulation?: SimulationContext;
  onSimulationAction?: (action: SimulationAssistantAction) => Promise<string>;
  onClose?: () => void;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const version = useRef(0);
  const sequence = useRef(0);
  const currentOwner = useRef(ownerId);
  const previousOwner = useRef(ownerId);
  const input = useRef<HTMLTextAreaElement>(null);
  const messages = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const simulationSettings = JSON.stringify(simulation ? { config: simulation.config, probeNetIds: simulation.probeNetIds } : null);
  const currentSimulationSettings = useRef(simulationSettings);
  currentSimulationSettings.current = simulationSettings;
  const context = useMemo(() => JSON.stringify({ circuit, boardOptions, placements: layout.placements, jumpers: layout.jumpers, terminals: layout.terminals }), [circuit, boardOptions, layout]);
  const currentContext = useRef(context);
  const previousContext = useRef(context);
  // Update synchronously so a response cannot land between a prop change and an effect.
  currentOwner.current = ownerId;
  currentContext.current = context;

  useEffect(() => {
    if (previousOwner.current === ownerId) return;
    previousOwner.current = ownerId;
    previousContext.current = context;
    version.current += 1;
    request.current?.abort(); request.current = null;
    setTurns([]); setDraft(""); setNotice(""); setPendingId(null);
  }, [ownerId, context]);

  useEffect(() => {
    if (previousContext.current === context) return;
    previousContext.current = context;
    version.current += 1;
    request.current?.abort(); request.current = null;
    setPendingId(null);
    setTurns(items => items.map(turn => turn.status === "pending" ? { ...turn, status: "cancelled", error: "회로가 변경되어 답변을 중단했습니다. 새 회로로 다시 질문해 주세요." } : turn));
    setNotice(turns.length ? "다음 질문부터 변경된 회로를 참고합니다." : "");
  }, [context, turns.length]);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; version.current += 1; request.current?.abort(); }; }, []);
  useEffect(() => {
    const container = messages.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [turns, notice]);

  function cancel() {
    version.current += 1;
    request.current?.abort(); request.current = null;
    setPendingId(null);
    setTurns(items => items.map(turn => turn.status === "pending" ? { ...turn, status: "cancelled", error: "답변을 중단했습니다." } : turn));
  }

  function clearConversation() {
    version.current += 1;
    request.current?.abort(); request.current = null;
    setTurns([]); setPendingId(null); setNotice(""); setDraft("");
    input.current?.focus();
  }

  async function send(value: string, retryId?: number) {
    const question = value.trim();
    if (!question || question.length > 4000 || request.current || !ownerId) return;
    const controller = new AbortController();
    request.current = controller;
    const activeVersion = ++version.current;
    const actingOwner = ownerId;
    const actingContext = context;
    const actingSimulationSettings = simulationSettings;
    // Retry the latest turn in place. An older failed question is asked again at
    // the end, so later answers never become the past of an earlier transcript row.
    const replaceLatest = retryId !== undefined && turns[turns.length - 1]?.id === retryId;
    const id = replaceLatest ? retryId : ++sequence.current;
    const history = requestHistory(turns.filter(turn => turn.id !== retryId), context, question);
    const nextTurn: ChatTurn = { id, question, context, status: "pending" };
    setTurns(items => replaceLatest ? items.map(turn => turn.id === retryId ? nextTurn : turn) : [...items, nextTurn]);
    setPendingId(id); setNotice("");
    if (retryId === undefined) setDraft("");
    const isCurrent = () => version.current === activeVersion && currentOwner.current === actingOwner && currentContext.current === actingContext;
    try {
      const response = await electronicsAdminFetch(actingOwner, "/api/admin/electronics/chat", {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          messages: history,
          circuit,
          boardOptions,
          layout: { placements: layout.placements, jumpers: layout.jumpers, terminals: layout.terminals },
          ...(selection && selection.type !== "hole" ? { selection } : {}),
          ...(simulation ? { simulation } : {}),
        }),
      });
      let data: { ok?: boolean; answer?: string; message?: string; action?: unknown };
      try { data = await response.json(); }
      catch { throw new Error("답변을 불러오지 못했습니다. 잠시 후 다시 질문해 주세요."); }
      if (!isCurrent()) return;
      if (!response.ok || !data.ok || typeof data.answer !== "string" || !data.answer.trim()) throw new Error(data.message || "Gemini 답변을 받지 못했습니다. 잠시 후 다시 질문해 주세요.");
      setTurns(items => items.map(turn => turn.id === id ? { ...turn, status: "done", answer: data.answer!.trim(), error: undefined } : turn));
      if (data.action != null) {
        let receipt: string;
        try {
          if (currentSimulationSettings.current !== actingSimulationSettings) throw new Error("답변을 기다리는 동안 파형 설정이 바뀌어 자동 조작을 적용하지 않았습니다. 현재 설정으로 다시 요청해 주세요.");
          const action = parseSimulationAction(data.action, circuit);
          if (!onSimulationAction) throw new Error("이 화면에서는 파형 조작을 사용할 수 없습니다.");
          receipt = await onSimulationAction(action);
        } catch (failure) { receipt = failure instanceof Error ? failure.message : "파형 조작을 적용하지 못했습니다."; }
        // A control can legitimately change settings. Still reject receipts from
        // a different owner/project or a conversation cleared while it ran.
        if (mounted.current && currentOwner.current === actingOwner && currentContext.current === actingContext && version.current === activeVersion) {
          setTurns(items => items.map(turn => turn.id === id ? { ...turn, controlResult: receipt } : turn));
        }
      }
    } catch (error) {
      if (!isCurrent()) return;
      const cancelled = error instanceof Error && error.name === "AbortError";
      setTurns(items => items.map(turn => turn.id === id ? { ...turn, status: cancelled ? "cancelled" : "error", error: cancelled ? "답변을 중단했습니다." : error instanceof Error ? error.message : "답변을 받지 못했습니다. 다시 질문해 주세요." } : turn));
    } finally {
      if (request.current === controller) { request.current = null; if (isCurrent()) setPendingId(null); }
    }
  }

  const busy = pendingId !== null;
  const selectedLabel = selection?.type === "component" ? `${selection.id} 소자` : selection?.type === "jumper" ? `${selection.id} 점퍼선` : selection?.type === "terminal" ? "선택한 계측기 단자" : null;
  const suggestions = [
    "VIN과 VOUT을 자동 설정하고 파형을 실행해 줘.",
    "입력을 1 kHz, 10 mV peak로 바꾸고 실행해 줘.",
    "이 회로가 어떻게 동작하는지 설명해 줘.",
    selectedLabel ? `${selectedLabel}의 연결과 꽂을 위치를 설명해 줘.` : "소자를 꽂을 순서와 방향을 알려 줘.",
    "전원을 켜기 전에 확인할 연결을 알려 줘.",
  ];

  return <section className="el-chat" aria-label="Gemini 회로 도우미">
    <header className="el-chat-header">
      <span className="el-chat-mark" aria-hidden="true">✦</span>
      <div className="el-chat-heading"><h2>Gemini</h2><p>회로 옆의 실험 도우미</p></div>
      <div className="el-chat-actions">
        <button type="button" className="el-text-button" onClick={clearConversation} disabled={!turns.length && !draft} title="대화 새로 시작" aria-label="대화 새로 시작">새 대화</button>
        {onClose && <button type="button" className="el-text-button" onClick={onClose} aria-label="Gemini 채팅 접기" title="채팅 접기">×</button>}
      </div>
    </header>
    <div className="el-chat-context"><span><i aria-hidden="true" />현재 회로 함께 보기</span><b title={circuit.title}>{circuit.title}</b>{selectedLabel && <small>{selectedLabel} 선택됨</small>}</div>
    <div className="el-chat-messages" ref={messages} role="log" aria-live="polite" aria-relevant="additions text" aria-busy={busy}>
      {!turns.length && <div className="el-chat-empty"><span aria-hidden="true">✧</span><h3>막히는 부분을 물어보세요</h3><p>지금 보고 있는 소자와 배선을<br />함께 확인하며 설명해 드려요.</p><div className="el-chat-suggestions">{suggestions.map(question => <button type="button" key={question} onClick={() => void send(question)} disabled={busy}>{question}<span aria-hidden="true">↗</span></button>)}</div></div>}
      {turns.map(turn => <div className="el-chat-turn" key={turn.id}>
        <div className="el-chat-question"><span className="sr-only">내 질문: </span>{turn.question}</div>
        <div className="el-chat-answer"><div className="el-chat-answer-label"><span aria-hidden="true">✦</span> Gemini{turn.context !== context && <small>이전 회로 기준</small>}</div>
          {turn.status === "done" ? <div className="el-chat-answer-text">{turn.answer}</div> : turn.status === "pending" ? <div className="el-chat-pending"><span aria-hidden="true">···</span> 회로를 살펴보고 있어요</div> : <div className="el-chat-error" role={turn.status === "error" ? "alert" : undefined}><p>{turn.error}</p><button type="button" className="el-text-button" disabled={busy} onClick={() => void send(turn.question, turn.id)}>{turn.context === context ? "다시 질문" : "현재 회로로 다시 질문"}</button></div>}
          {turn.controlResult && <p className="el-chat-notice" role="status"><b>파형 조작 결과</b><br />{turn.controlResult}</p>}
        </div>
      </div>)}
      {notice && <p className="el-chat-notice" role="status">{notice}</p>}
    </div>
    <form className="el-chat-composer" onSubmit={event => { event.preventDefault(); void send(draft); }}>
      <label className="sr-only" htmlFor="el-chat-question">Gemini에게 질문</label>
      <textarea ref={input} id="el-chat-question" className="el-chat-input" rows={3} maxLength={4000} value={draft} onChange={event => setDraft(event.target.value)} placeholder={selectedLabel ? `${selectedLabel}에 대해 질문해 보세요…` : "회로, 소자, 연결 방법을 질문하세요…"} onKeyDown={event => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); if (!busy) void send(draft); }
      }} />
      <div className="el-chat-compose-actions"><small>Enter 전송 · Shift+Enter 줄바꿈</small>{busy ? <button type="button" className="el-button el-small" onClick={cancel}>답변 중단</button> : <button type="submit" className="el-button el-primary el-small" disabled={!draft.trim() || !ownerId}>질문 보내기 <span aria-hidden="true">↑</span></button>}</div>
    </form>
    <p className="el-chat-footnote">설정·실행을 요청하면 파형 도구에 적용합니다. 실제 적용 결과를 확인하고, 파형 도구에서 되돌릴 수 있습니다. 실물 장비는 조작하지 않습니다.</p>
  </section>;
}
