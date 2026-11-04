"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseSimulationAction, parseSimulationContext, type SimulationAssistantAction, type SimulationContext } from "@/lib/electronics/simulation-controls";
import type { Circuit, CircuitLayout } from "@/lib/electronics/types";

/** Connect chat to the lazily mounted instrument panel without stale-project actions. */
export function useSimulationControls(ownerId: string, projectId: string, circuit: Circuit, layout: CircuitLayout, onOpen: () => void) {
  const identity = useMemo(() => JSON.stringify({ ownerId, projectId, circuit, board: layout.board.options, placements: layout.placements, jumpers: layout.jumpers, terminals: layout.terminals }), [ownerId, projectId, circuit, layout]);
  const currentIdentity = useRef(identity);
  currentIdentity.current = identity;
  const [snapshot, setSnapshot] = useState<{ identity: string; context: SimulationContext }>();
  const [request, setRequest] = useState<{ identity: string; id: number; action: SimulationAssistantAction }>();
  const sequence = useRef(0);
  const pending = useRef<{ identity: string; id: number; resolve: (message: string) => void; timer: ReturnType<typeof setTimeout> } | undefined>(undefined);

  const finish = useCallback((id: number, message: string) => {
    const active = pending.current;
    if (!active || active.id !== id) return;
    clearTimeout(active.timer); pending.current = undefined;
    active.resolve(active.identity === currentIdentity.current ? message : "회로가 변경되어 이전 파형 조작을 취소했습니다.");
    setRequest(previous => previous?.id === id ? undefined : previous);
  }, []);

  useEffect(() => {
    const active = pending.current;
    if (active && active.identity !== identity) finish(active.id, "회로가 변경되어 이전 파형 조작을 취소했습니다.");
  }, [identity, finish]);
  useEffect(() => () => {
    const active = pending.current;
    if (active) { clearTimeout(active.timer); active.resolve("화면이 닫혀 파형 조작을 취소했습니다."); pending.current = undefined; }
  }, []);

  const perform = useCallback((value: SimulationAssistantAction): Promise<string> => {
    const action = parseSimulationAction(value, circuit);
    if (!ownerId || !projectId) return Promise.reject(new Error("관리자 실험 공간을 준비한 뒤 다시 요청해 주세요."));
    if (currentIdentity.current !== identity) return Promise.reject(new Error("회로가 변경되었습니다. 현재 회로로 다시 요청해 주세요."));
    const previous = pending.current;
    if (previous) finish(previous.id, "새 파형 요청으로 이전 요청을 취소했습니다.");
    const id = ++sequence.current;
    return new Promise(resolve => {
      const timer = setTimeout(() => finish(id, "파형 도구의 응답을 확인하지 못해 대기 중인 요청을 종료했습니다. 현재 설정과 계산 상태를 확인해 주세요."), 30000);
      pending.current = { identity, id, resolve, timer };
      setRequest({ identity, id, action }); onOpen();
    });
  }, [circuit, ownerId, projectId, identity, finish, onOpen]);

  const onContextChange = useCallback((context: SimulationContext | null) => {
    if (currentIdentity.current !== identity) return;
    if (context === null) { setSnapshot(undefined); return; }
    let parsed: SimulationContext;
    try { parsed = parseSimulationContext(context, circuit); }
    catch { setSnapshot(undefined); return; }
    setSnapshot(previous => previous?.identity === identity && JSON.stringify(previous.context) === JSON.stringify(parsed) ? previous : { identity, context: parsed });
  }, [identity, circuit]);

  return {
    simulation: snapshot?.identity === identity ? snapshot.context : undefined,
    controlRequest: request?.identity === identity ? request : undefined,
    onControlResult: finish, onContextChange, perform,
  };
}
