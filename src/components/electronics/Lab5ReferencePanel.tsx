"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { LAB5_REFERENCE_CASES, LAB5_DC_REFERENCE, LAB5_AMPLITUDE_REFERENCE, buildLab5ReferenceCase, lab5Measurements } from "@/lib/electronics/lab5-reference";
import type { Lab5CaseId, Lab5Ratio, Lab5WorkerRequest, Lab5WorkerResponse } from "@/lib/electronics/lab5-reference";
import type { SimulationResult } from "@/lib/electronics/simulation-types";
import { downloadText } from "@/lib/electronics/storage";
import { Oscilloscope } from "./Oscilloscope";
import "./lab5-reference.css";

const numeric = (value: number | undefined, unit = "V") => value === undefined || !Number.isFinite(value) ? "—" : `${Number(value.toPrecision(6))} ${unit}`;
const difference = (value: number | undefined, target: number) => value === undefined ? "—" : `${((value - target) / Math.abs(target) * 100).toFixed(2)}%`;

export function Lab5ReferencePanel() {
  const { user, authChecked } = useAuth();
  const authorized = isAdminUser(user);
  const [caseId, setCaseId] = useState<Lab5CaseId>("c1-drive"), [ratio, setRatio] = useState<Lab5Ratio>("1:1");
  const [result, setResult] = useState<SimulationResult | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const worker = useRef<Worker | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), requestId = useRef(0);
  const selected = useMemo(() => buildLab5ReferenceCase(caseId, ratio), [caseId, ratio]);
  const metrics = useMemo(() => result ? lab5Measurements(result, caseId) : null, [result, caseId]);
  const traces = useMemo(() => result && metrics ? [
    { label: "OUT1", color: "#e0c184", values: result.nodeVoltages.OUT1 },
    { label: "OUT2", color: "#9bbbd6", values: result.nodeVoltages.OUT2 },
    { label: "OUT1 − OUT2", color: "#c2a6d9", values: metrics.differential },
  ] : [], [result, metrics]);
  const stop = useCallback(() => { requestId.current++; worker.current?.terminate(); worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; }, []);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => { stop(); setBusy(false); setResult(null); setError(""); }, [user?.id, authChecked, authorized, stop]);
  const reset = () => { stop(); setBusy(false); setResult(null); setError(""); };
  const run = () => {
    if (!isAdminUser(user)) return;
    reset(); const id = requestId.current; setBusy(true);
    try {
      const current = new Worker(new URL("../../lib/electronics/lab5-reference.worker.ts", import.meta.url), { type: "module" });
      worker.current = current;
      const finish = () => { current.terminate(); if (worker.current === current) worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setBusy(false); };
      current.onmessage = (event: MessageEvent<Lab5WorkerResponse>) => {
        if (id !== requestId.current || event.data.requestId !== id) return;
        finish(); if (event.data.type === "result") setResult(event.data.result); else setError(event.data.message);
      };
      current.onerror = () => { if (id !== requestId.current) return; finish(); setError("계산 도구를 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 실행해 주세요."); };
      timer.current = setTimeout(() => { if (id !== requestId.current) return; finish(); requestId.current++; setError("계산이 20초를 넘어 중단했습니다. 미완료 파형은 표시하지 않습니다."); }, 20000);
      current.postMessage({ type: "run", requestId: id, caseId, ratio } satisfies Lab5WorkerRequest);
    } catch (caught) { setBusy(false); setError(caught instanceof Error ? caught.message : "계산을 시작하지 못했습니다."); }
  };
  const exportCsv = () => {
    if (!result || !metrics) return;
    const nets = Object.keys(result.nodeVoltages);
    downloadText(`${caseId}-${ratio.replace(":", "to")}.csv`, [["time_s", ...nets.map(net => `${net}_V`), "OUT1_minus_OUT2_V"].join(","), ...result.time.map((time, i) => [time, ...nets.map(net => result.nodeVoltages[net][i]), metrics.differential[i]].join(","))].join("\n"), "text/csv;charset=utf-8");
  };
  const amp = caseId === "c1-drive" || caseId === "c2-drive" ? LAB5_AMPLITUDE_REFERENCE[caseId] : null;
  const physicalDc = selected.definition.circuitNumber === 1 ? LAB5_DC_REFERENCE.measured1 : LAB5_DC_REFERENCE.measured2;
  if (!authChecked) return <main className="lab5-page lab5-loading">관리자 계정을 확인하고 있습니다…</main>;
  if (!isAdminUser(user)) return <main className="lab5-page lab5-loading"><h1>관리자 전용 실험실입니다</h1><p>관리자 계정으로 로그인한 뒤 이용해 주세요.</p><Link href="/">사이트로 돌아가기 →</Link></main>;
  return <main className="lab5-page">
    <header className="lab5-header"><div><Link href="/admin/electronics">← 전자공학 실험실</Link><p className="lab5-eyebrow">LAB 05 · REFERENCE BENCH</p><h1>원문 회로 수치 비교</h1><p>세 회로를 같은 조건으로 계산하고, PDF의 시뮬레이션·실측 기록과 비교합니다.</p></div><span className="lab5-badge">실물 빵판 배치 검증 전</span></header>
    <section className="lab5-toolbar" aria-label="Lab 5 비교 설정">
      <label><span>실험 조건</span><select value={caseId} onChange={event => { reset(); setCaseId(event.target.value as Lab5CaseId); }}>{LAB5_REFERENCE_CASES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <label><span>가정한 권선비 · 1차:전체 2차</span><select value={ratio} disabled={selected.definition.circuitNumber === 1} onChange={event => { reset(); setRatio(event.target.value as Lab5Ratio); }}><option value="1:1">1:1 · 원문 미확정</option><option value="2:1">2:1 · 원문 미확정</option></select></label>
      <button className="lab5-primary" onClick={busy ? () => { reset(); setError("계산을 중단했습니다."); } : run}>{busy ? "계산 중단" : "이 조건으로 계산"}</button>
    </section>
    <div className="lab5-condition"><b>{selected.definition.condition}</b><span>{selected.definition.sourcePages}</span><span>BC109C ×3 · 300 K · 0–{selected.config.durationSeconds * 1000} ms / {selected.config.sampleCount.toLocaleString()} 표본</span></div>
    <aside className="lab5-note"><b>비교 기준</b><p>현재 사이트는 축약 BJT 모델과 이상 변압기를 사용합니다. PDF의 전체 SPICE 모델·실물 부품을 동일하게 재현한 결과가 아닙니다. 수치가 다르면 차이를 그대로 표시합니다. 권선비는 PDF에 없어서 두 가정을 선택할 수 있습니다.</p><p>회로 2는 B1의 분압기를 유지하고, 회로 3은 이를 제거합니다. B1·B2와 센터탭은 별도 연결입니다. myDAQ DSA 화면은 재현하지 않습니다.</p></aside>
    {error && <p className="lab5-error" role="alert">{error}</p>}
    <div aria-live="polite" className="lab5-run-status">{busy ? "회로의 동작점과 시간 파형을 계산하고 있습니다…" : result ? "계산 완료 · 아래 수치는 현재 선택한 조건의 결과입니다." : "조건을 선택하고 계산을 실행하세요."}</div>
    {result && metrics && <>
      <section className="lab5-card"><div className="lab5-section-heading"><h2>DC 동작점</h2><span>전압 V · 실제 측정은 참고 기록</span></div>
        {selected.definition.circuitNumber === 3 && <p className="lab5-muted">회로 3은 원문에 DC 수치표가 없습니다. 회로 1·2의 값을 복사하지 않고 계산했습니다.</p>}
        <div className="lab5-table-scroll"><table><thead><tr><th>측정점</th><th>현재 계산</th><th>PDF 시뮬레이션</th><th>차이</th><th>PDF 실측</th></tr></thead><tbody>
          {(Object.keys(LAB5_DC_REFERENCE.simulated) as (keyof typeof LAB5_DC_REFERENCE.simulated)[]).map(net => <tr key={net}><th>{net === "TAIL" ? "S · 공통 이미터" : net}</th><td>{numeric(result.dc.nodeVoltages[net])}</td><td>{selected.definition.circuitNumber < 3 ? numeric(LAB5_DC_REFERENCE.simulated[net]) : "기록 없음"}</td><td>{selected.definition.circuitNumber < 3 ? difference(result.dc.nodeVoltages[net], LAB5_DC_REFERENCE.simulated[net]) : "—"}</td><td>{selected.definition.circuitNumber < 3 ? numeric(physicalDc[net]) : "기록 없음"}</td></tr>)}
        </tbody></table></div>
        <p className="lab5-muted">현재 IEE = {numeric(-(result.dc.deviceCurrents?.Q3?.E ?? 0) * 1000, "mA")} · IC1 = {numeric((result.dc.deviceCurrents?.Q1?.C ?? 0) * 1000, "mA")} · IC2 = {numeric((result.dc.deviceCurrents?.Q2?.C ?? 0) * 1000, "mA")}. IEE는 Q3 이미터 전류이며 컬렉터 전류와 구분합니다.</p>
      </section>
      {amp && <section className="lab5-card"><div className="lab5-section-heading"><h2>시간 파형의 진폭 비교</h2><span>{metrics.measurementWindow.map(value => value * 1000).join("–")} ms 구간 · half Vpp</span></div><div className="lab5-table-scroll"><table><thead><tr><th>항목</th><th>현재 계산</th><th>PDF 시뮬레이션</th><th>차이</th><th>PDF 실측</th></tr></thead><tbody>
        <tr><th>{amp.inputNode} 입력</th><td>{numeric(metrics.halfVpp[amp.inputNode] * 1000, "mV")}</td><td>{numeric(amp.simulatedInputPeak * 1000, "mV")}</td><td>{difference(metrics.halfVpp[amp.inputNode], amp.simulatedInputPeak)}</td><td>{numeric(amp.measuredInputPeak * 1000, "mV")}</td></tr>
        <tr><th>OUT1 출력</th><td>{numeric(metrics.halfVpp.OUT1 * 1000, "mV")}</td><td>{numeric(amp.simulatedOutputHalfVpp * 1000, "mV")}</td><td>{difference(metrics.halfVpp.OUT1, amp.simulatedOutputHalfVpp)}</td><td>{numeric(amp.measuredOutputHalfVpp * 1000, "mV")}</td></tr>
        <tr><th>진폭비의 크기</th><td>{numeric(metrics.halfVpp.OUT1 / metrics.halfVpp[amp.inputNode], "V/V")}</td><td>{numeric(Math.abs(amp.simulatedGain), "V/V")}</td><td>{difference(metrics.halfVpp.OUT1 / metrics.halfVpp[amp.inputNode], Math.abs(amp.simulatedGain))}</td><td>{numeric(Math.abs(amp.measuredGain), "V/V")}</td></tr>
      </tbody></table></div><p className="lab5-muted">원문의 음수 이득은 반전을 나타냅니다. 여기서는 half Vpp 비의 크기를 비교합니다. 회로 1의 왜곡된 파형에서 이 값은 소신호 AC 이득이나 기본파 이득과 같지 않습니다.</p></section>}
      {caseId === "c3-mix" && <section className="lab5-card"><div className="lab5-section-heading"><h2>차동 출력의 주파수 성분</h2><span>OUT1 − OUT2 · V peak</span></div><div className="lab5-table-scroll"><table><thead><tr><th>현재 분석 주파수</th><th>현재 계산</th><th>PDF 그래프 마커</th><th>차이</th></tr></thead><tbody>
        <tr><th>9 kHz · 차 주파수</th><td>{numeric(metrics.tonePeak["9000"] * 1000, "mV")}</td><td>9.000 kHz · 153.763 mV</td><td>{difference(metrics.tonePeak["9000"], 0.153763)}</td></tr>
        <tr><th>10 kHz · 반송파</th><td>{numeric(metrics.tonePeak["10000"] * 1000, "mV")}</td><td>10.000 kHz · 875.423 mV</td><td>{difference(metrics.tonePeak["10000"], 0.875423)}</td></tr>
        <tr><th>11 kHz · 합 주파수</th><td>{numeric(metrics.tonePeak["11000"] * 1000, "mV")}</td><td>10.989 kHz · 145.570 mV</td><td>마커 주파수 다름</td></tr>
      </tbody></table></div><p className="lab5-muted">3–5 ms의 두 주기를 적분해 각 성분의 피크 진폭을 구합니다. PDF 본문의 상측파대 153.721 mV는 그래프 마커와 다릅니다. 원문의 진폭 ×2 계수와 myDAQ dBVrms 기록을 피크 전압으로 혼용하지 않습니다.</p></section>}
      <Oscilloscope key={`${caseId}-${ratio}-${requestId.current}`} time={result.time} traces={traces} captureKey={`${caseId}-${ratio}-${requestId.current}`} stale={false} />
      <div className="lab5-export"><button onClick={exportCsv}>파형 CSV</button><button onClick={() => downloadText(`${caseId}-comparison.json`, JSON.stringify({ scope: "schematic-only; physical layout not validated", transformerRatioAssumption: ratio, ...selected, result, measurements: metrics }, null, 2), "application/json")}>비교 결과 JSON</button></div>
      <details className="lab5-card"><summary>계산 모델과 한계</summary><ul>{result.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></details>
    </>}
    <details className="lab5-card" open><summary>{selected.circuit.title} · 소자와 연결</summary><p className="lab5-muted">{selected.circuit.description}. 아래는 회로도 단자 연결표이며 실제 빵판 구멍 위치가 아닙니다.</p><div className="lab5-table-scroll"><table><thead><tr><th>소자</th><th>값 / 품번</th><th>단자 연결</th></tr></thead><tbody>{selected.circuit.components.map(part => { const definition = COMPONENT_CATALOG.find(item => item.id === part.definitionId); return <tr key={part.id}><th>{part.id}</th><td>{part.value}</td><td>{Object.entries(part.pinNets).map(([pin, net]) => `${definition?.pins.find(item => item.id === pin)?.label ?? pin} → ${net}`).join(" · ")}</td></tr>; })}</tbody></table></div></details>
    <aside className="lab5-note"><b>자료에서 확인된 차이</b><p>회로 1은 본문·파형·표의 20 mV 조건을 적용했습니다. 회로 그림의 10 mV 표기와 충돌합니다. 회로 3의 “1 Vac”는 AC 분석값으로, 시간 파형에는 본문의 10 mV를 사용합니다.</p><p>두 PDF 모두 계수 b를 1.2배로 만드는 저항 설계는 “수행하지 않음”으로 기록했습니다. 비교할 완성 회로가 없는 항목입니다.</p></aside>
  </main>;
}
