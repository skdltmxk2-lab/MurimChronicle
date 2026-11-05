"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { EXPERIMENTS } from "@/lib/electronics/experiments";
import { downloadText } from "@/lib/electronics/storage";
import { getVerificationInput, measureVerificationResult, verificationTraces, verificationWaveform } from "@/lib/electronics/course-verification";
import type { CourseVerificationReport, VerificationRecord, VerificationStatus, VerificationWorkerResponse } from "@/lib/electronics/course-verification";
import type { SimulationResult } from "@/lib/electronics/simulation-types";
import { Oscilloscope } from "./Oscilloscope";
import { SampleSequenceChart } from "./SampleSequenceChart";
import "./lab5-reference.css";
import "./course-verification.css";

const statusNames: Record<VerificationStatus, string> = { pass: "기준 충족", mismatch: "차이 확인", blocked: "실행 보류", "reference-missing": "비교 기준 없음" };
const basisNames: Record<string, string> = { "pdf-simulation": "원문 시뮬레이션", "pdf-measured": "원문 실측", "independent-equation": "독립 계산식", "independent-spice": "독립 SPICE", "assignment-target": "과제 목표", "engine-result": "사이트 계산" };
// Tiny residuals such as 4.4e-16 read as exponents; a plain decimal would run to twenty zeros.
const kindNames: Record<VerificationRecord["kind"], string> = { analog: "회로 계산", dsp: "신호처리 계산", external: "외부 장비" };
// A row can pass while only some of its metrics have a reference; say so instead of implying a full comparison.
const comparedText = (row: VerificationRecord) => { const compared = row.metrics.filter(metric => metric.reference !== undefined).length; return compared > 0 && compared < row.metrics.length ? ` · 비교 ${compared}/${row.metrics.length}` : ""; };
const numberText = (value: number | string | null | undefined) => typeof value === "number" ? Number.isFinite(value) ? value !== 0 && Math.abs(value) < 1e-4 ? Number(value.toPrecision(6)).toExponential() : Number(value.toPrecision(6)).toLocaleString("ko-KR", { maximumSignificantDigits: 6 }) : "—" : value ?? "—";

export function CourseVerificationPanel({ report }: { report: CourseVerificationReport }) {
  const { user, authChecked } = useAuth();
  const authorized = isAdminUser(user);
  const [selectedId, setSelectedId] = useState(report.cases[0]?.id ?? "");
  const [experiment, setExperiment] = useState("all");
  const [filter, setFilter] = useState<VerificationStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<Record<string, VerificationRecord>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [busyId, setBusyId] = useState("");
  const [progress, setProgress] = useState("");
  const [notice, setNotice] = useState("");
  const worker = useRef<Worker | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0);
  const selectedRef = useRef(selectedId);
  selectedRef.current = selectedId;

  const stop = useCallback(() => {
    generation.current++;
    worker.current?.terminate();
    worker.current = null;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => {
    stop(); setBusyId(""); setProgress(""); setResult(null); setLive({}); setNotice("");
  }, [user?.id, authorized, authChecked, stop]);

  const rows = useMemo(() => report.cases.map(row => live[row.id] ?? row), [report.cases, live]);
  const selected = rows.find(row => row.id === selectedId);
  const input = useMemo(() => getVerificationInput(selectedId), [selectedId]);
  const counts = useMemo(() => Object.fromEntries(Object.keys(statusNames).map(status => [status, rows.filter(row => row.status === status).length])), [rows]);
  const experiments = useMemo(() => [...new Set(report.cases.map(row => row.experimentId))], [report.cases]);
  const visible = rows.filter(row => (experiment === "all" || row.experimentId === experiment) && (filter === "all" || row.status === filter) && `${row.title} ${row.id} ${row.conditions.join(" ")}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const traces = useMemo(() => result && input ? verificationTraces(input, result) : (selected?.waveform?.series ?? []).slice(0, 3).map((series, index) => ({ ...series, color: ["#ddb768", "#79abd4", "#baa2d4"][index] })), [result, input, selected]);
  const time = result?.time ?? selected?.waveform?.time;
  // A recomputed run is always seconds. A saved row names its axis; a sample index must never reach the time-based scope.
  const savedAxis = selected?.waveform?.timeUnit ?? "s";
  const sampleAxis = !result && savedAxis === "sample";
  const secondsAxis = Boolean(result) || savedAxis === "s";
  const acOnly = input?.config.source.waveform === "dc" && selected?.metrics.some(metric => /^(gain|phase):/.test(metric.metric ?? ""));
  const runnable = (row: VerificationRecord) => {
    const candidate = getVerificationInput(row.id);
    return candidate && !candidate.blockedReason;
  };

  function choose(id: string) {
    stop(); setBusyId(""); setProgress(""); setResult(null); setNotice(""); setSelectedId(id);
  }

  function runCases(ids: string[]) {
    if (!isAdminUser(user)) return;
    stop(); setResult(null); setNotice("");
    const token = generation.current;
    const queue = report.cases.filter(row => ids.includes(row.id) && runnable(row));
    let index = 0;
    const next = () => {
      if (generation.current !== token) return;
      if (index >= queue.length) { setBusyId(""); setProgress(`${queue.length}개 조건 재검증 완료`); return; }
      const baseline = queue[index++];
      setBusyId(baseline.id); setProgress(`${index} / ${queue.length} · ${baseline.title}`);
      const finish = (measurement: VerificationRecord, capture?: SimulationResult) => {
        if (generation.current !== token) return;
        worker.current?.terminate(); worker.current = null;
        if (timer.current) clearTimeout(timer.current);
        timer.current = null;
        const captureInput = capture ? getVerificationInput(baseline.id) : null;
        const saved = capture && captureInput ? { ...measurement, waveform: verificationWaveform(captureInput, capture) } : measurement;
        setLive(previous => ({ ...previous, [baseline.id]: saved }));
        if (selectedRef.current === baseline.id) setResult(capture ?? null);
        next();
      };
      const failed = (message: string) => finish({ ...baseline, status: "blocked", metrics: [], waveform: undefined, reason: message });
      try {
        const current = new Worker(new URL("../../lib/electronics/course-verification.worker.ts", import.meta.url), { type: "module" });
        worker.current = current;
        current.onmessage = (event: MessageEvent<VerificationWorkerResponse>) => {
          if (generation.current !== token || worker.current !== current || event.data.requestId !== token || event.data.caseId !== baseline.id) return;
          if (event.data.type === "error") { failed(event.data.message); return; }
          try { finish(measureVerificationResult(baseline, event.data.result), event.data.result); }
          catch (error) { failed(error instanceof Error ? error.message : "비교 수치를 계산하지 못했습니다."); }
        };
        current.onerror = () => { if (generation.current === token && worker.current === current) failed("계산 도구를 불러오지 못했습니다. 새로고침 후 다시 실행하세요."); };
        timer.current = setTimeout(() => { if (generation.current === token && worker.current === current) failed("이 조건의 계산이 30초를 넘어 중단했습니다."); }, 30000);
        current.postMessage({ type: "run", requestId: token, caseId: baseline.id });
      } catch (error) { failed(error instanceof Error ? error.message : "계산을 시작하지 못했습니다."); }
    };
    next();
  }

  if (!authChecked) return <main className="lab5-page lab5-loading">관리자 계정을 확인하고 있습니다…</main>;
  if (!authorized) return <main className="lab5-page lab5-loading"><h1>관리자 전용 검증 화면입니다</h1><Link href="/">사이트로 돌아가기</Link></main>;
  return <main className="lab5-page course-verification">
    <header className="lab5-header">
      <div><Link href="/admin/electronics">← 전자공학 실험실</Link><p className="lab5-eyebrow">COURSE VERIFICATION</p><h1>전체 실험 검증</h1><p>{report.scope}</p></div>
      <div className="course-header-actions"><Link href="/admin/electronics/lab5">Lab 5 상세 비교</Link><button onClick={() => downloadText("course-verification.json", JSON.stringify({ ...report, cases: rows }, null, 2))}>검증 결과 JSON</button></div>
    </header>
    <p className="course-report-date">기준 보고서 {report.generatedAt.slice(0, 16).replace("T", " ")} UTC · 총 {rows.length}개 조건</p>
    <div className="course-status-filters" role="group" aria-label="검증 상태 필터">
      <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>전체 {rows.length}</button>
      {(Object.entries(statusNames) as [VerificationStatus, string][]).map(([status, label]) => <button key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}>{label} {counts[status]}</button>)}
    </div>
    <section className="lab5-toolbar" aria-label="실험 검색과 재검증">
      <label><span>실험 선택</span><select value={experiment} onChange={event => setExperiment(event.target.value)}><option value="all">모든 실험</option>{experiments.map(id => <option key={id} value={id}>{EXPERIMENTS.find(item => item.id === id)?.title ?? id}</option>)}</select></label>
      <label><span>회로·조건 검색</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="CE, 1 kHz, 믹서…" /></label>
      <button disabled={Boolean(busyId) || !visible.some(runnable)} onClick={() => runCases(visible.map(row => row.id))}>검색된 조건 재검증</button>
      {busyId && <button onClick={() => { stop(); setBusyId(""); setNotice("재검증을 중단했습니다. 완료된 항목의 결과는 보관했습니다."); }}>계산 중단</button>}
    </section>
    <div role="status" className="lab5-run-status">{notice || progress || "기준 충족은 표시된 수치 비교 기준을 만족한다는 뜻입니다. 원문에 기준값이 없는 조건은 별도로 표시합니다."}</div>
    <div className="course-verification-grid">
      <nav className="course-case-list" aria-label="실험 검증 조건">
        {visible.length ? visible.map(row => <button key={row.id} aria-current={selectedId === row.id ? "true" : undefined} onClick={() => choose(row.id)}><span>{row.title}</span><small className={`course-status-${row.status}`}>{busyId === row.id ? "계산 중" : `${statusNames[row.status]}${comparedText(row)}`}</small></button>) : <p>검색 조건에 맞는 항목이 없습니다.</p>}
      </nav>
      {selected && <section className="course-case-detail" aria-label="선택한 실험 검증 결과">
        <div className="lab5-card">
          <div className="lab5-section-heading"><h2>{selected.title}</h2><span><span className="course-kind">{kindNames[selected.kind]}</span> <span className={`course-status-${selected.status}`}>{statusNames[selected.status]}{comparedText(selected)}</span></span></div>
          <ul className="course-conditions">{selected.conditions.map((condition, i) => <li key={i}>{condition}</li>)}</ul>
          <div className="course-sources">{selected.sources.map((source, i) => <span key={i}>{source.label}{source.pages.length ? ` · ${source.pages.join(", ")}쪽` : ""}</span>)}</div>
          <div className="lab5-export">
            {input && <button className="lab5-primary" disabled={Boolean(busyId) || Boolean(input.blockedReason)} onClick={() => runCases([selectedId])}>이 조건 다시 계산</button>}
            {input && <button onClick={() => downloadText(`${selectedId}-circuit.json`, JSON.stringify(input.circuit, null, 2))}>회로 JSON</button>}
            {input && <button onClick={() => downloadText(`${selectedId}-simulation-config.json`, JSON.stringify(input.config, null, 2))}>계산 설정 JSON</button>}
          </div>
          <p className="lab5-muted">{live[selected.id] ? "이번 브라우저에서 다시 계산한 결과입니다." : "검증 스크립트에서 실제 실행해 저장한 결과입니다."} 회로 재검증은 회로도 연결로 계산합니다. 빵판 배치는 일반 830홀 모델로 실험실에서 별도 점검하며 외부 변압기·직접 루프백·마이크 조건은 그 대상이 아닙니다. 실물 조립과 측정은 수행하지 않았습니다.</p>
          {selected.reason && <p className="lab5-error" role="alert">{selected.reason}</p>}
        </div>
        {selected.metrics.length > 0 && <section className="lab5-card">
          <div className="lab5-section-heading"><h2>수치 비교</h2><span>오차는 기준값에 대한 절댓값 비율</span></div>
          <div className="lab5-table-scroll"><table><thead><tr><th>측정량</th><th>계산값</th><th>기준값</th><th>차이</th></tr></thead><tbody>{selected.metrics.map((metric, i) => <tr key={i}>
            <th><span>{metric.label}</span><small>{basisNames[metric.basis] ?? metric.basis}</small></th>
            <td>{numberText(metric.value)} {metric.unit}</td><td>{numberText(metric.reference)}{metric.reference !== undefined && ` ${metric.unit ?? ""}`}</td>
            <td className={metric.status === "mismatch" ? "course-status-mismatch" : ""}>{metric.relativeErrorPercent === undefined ? "—" : `${numberText(metric.relativeErrorPercent)}%`}</td>
          </tr>)}</tbody></table></div>
          <details className="course-method"><summary>비교 허용오차</summary><ul>{selected.metrics.filter(metric => metric.reference !== undefined).map((metric, i) => <li key={i}>{metric.label} · {typeof metric.tolerance === "object" ? `상대 ${numberText(metric.tolerance.relative * 100)}% + 절대 ${numberText(metric.tolerance.absolute)} ${metric.unit ?? ""}` : metric.tolerance === undefined ? "개별 기준 설명 참고" : `절대 ${numberText(metric.tolerance)} ${metric.unit ?? ""}`}</li>)}</ul></details>
        </section>}
        {acOnly && <p className="lab5-muted">이 조건은 AC 이득·위상표를 비교합니다. 위 수치 비교에서 확인하세요.</p>}
        {!acOnly && time && traces.length > 0 && (sampleAxis || secondsAxis) && <section className="course-waveform"><h2>{result ? "다시 계산한 파형" : sampleAxis ? "검증 당시 표본열" : "검증 당시 파형"}</h2>{selected.waveform?.unit === "normalized" && <p className="lab5-muted">표시값은 정규화된 신호 진폭입니다.</p>}{sampleAxis ? <><p className="lab5-muted">가로축은 시간(초)이 아니라 표본 번호입니다. 표본화 주파수를 알 수 없는 열이므로 초 단위로 환산하지 않습니다.</p><SampleSequenceChart index={time} series={traces} unit={selected.waveform?.unit ?? ""} /></> : <Oscilloscope key={`${selectedId}-${live[selectedId] ? "live" : "reference"}-${generation.current}`} time={time} traces={traces} captureKey={`${selectedId}-${generation.current}`} stale={false} amplitudeUnit={selected.waveform?.unit === "normalized" ? "normalized" : "V"} />}</section>}
        {!acOnly && time && traces.length > 0 && !sampleAxis && !secondsAxis && <p className="lab5-muted" role="status">이 파형의 시간축 단위를 알 수 없어 그래프를 표시하지 않습니다.</p>}
        <details className="lab5-card" open><summary>판정 근거와 남은 확인</summary><ul>{[...new Set(selected.notes)].map((note, i) => <li key={i}>{note}</li>)}</ul></details>
      </section>}
    </div>
  </main>;
}
