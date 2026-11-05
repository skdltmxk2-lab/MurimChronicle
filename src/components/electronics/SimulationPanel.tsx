"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultSimulationConfig, parseSimulationConfig } from "@/lib/electronics/simulation";
import { applySimulationSettings, parseSimulationAction, parseSimulationContext, type SimulationAssistantAction, type SimulationContext } from "@/lib/electronics/simulation-controls";
import { deriveSimulationRecommendation, fitSimulationSampling, resolveSimulationProbeHoles, simulationSamplingWarning } from "@/lib/electronics/simulation-recommendations";
import { createSimulationLayoutIndex, SimulationLayoutError } from "@/lib/electronics/simulation-layout";
import type { ProbeHoles } from "@/lib/electronics/simulation-probes";
import { amplitudeSpectrum, differentialResponse } from "@/lib/electronics/simulation-measurements";
import { NONLINEAR_MODEL_REGISTRY } from "@/lib/electronics/simulation-models";
import type { Circuit, CircuitLayout, ComponentDefinition } from "@/lib/electronics/types";
import { FunctionGenerator } from "./FunctionGenerator";
import { Oscilloscope } from "./Oscilloscope";
import { Multimeter } from "./Multimeter";
import type { SimulationConfig, SimulationResult } from "@/lib/electronics/simulation-types";
import type { SimulationWorkerRequest, SimulationWorkerResponse } from "@/lib/electronics/simulation.worker";
import "./simulation.css";

export type SimulationProbe = { holeId: string | null; netId: string | null };
type Channel = 0 | 1;
type ResultTab = "time" | "spectrum" | "ac" | "dc" | "meter";
type CapturedResult = { circuit: Circuit; definitions: ComponentDefinition[]; result: SimulationResult; fingerprint: string; config: SimulationConfig; probes: [SimulationProbe, SimulationProbe]; names: Record<string, string> };
type Trace = { label: string; color: string; values: number[] };
const CHANNEL_COLORS = ["#d49124", "#3c8ed4"];

function netIds(circuit: Circuit) {
  return [...new Set([...circuit.components.flatMap(component => Object.values(component.pinNets)), ...circuit.instruments.map(item => item.netId)])].filter(Boolean);
}

function engineering(value: number | undefined, unit = "") {
  if (value === undefined || !Number.isFinite(value)) return "—";
  if (value === 0) return `0${unit ? ` ${unit}` : ""}`;
  const magnitude = Math.abs(value);
  const [factor, prefix] = magnitude >= 1e6 ? [1e6, "M"] : magnitude >= 1e3 ? [1e3, "k"] : magnitude < 1e-6 ? [1e-9, "n"] : magnitude < 1e-3 ? [1e-6, "µ"] : magnitude < 1 ? [1e-3, "m"] : [1, ""];
  const scaled = Number((value / Number(factor)).toPrecision(4));
  return `${scaled}${unit ? ` ${prefix}${unit}` : ""}`;
}

function NumericField({ label, value, onChange, unit, min, max, step = "any", disabled = false }: { label: string; value: number; onChange: (value: number) => void; unit?: string; min?: number; max?: number; step?: number | "any"; disabled?: boolean }) {
  return <label className="el-sim-field"><span>{label}{unit && <small>{unit}</small>}</span><input type="number" value={Number.isFinite(value) ? value : ""} onChange={event => onChange(event.target.value === "" ? NaN : Number(event.target.value))} min={min} max={max} step={step} disabled={disabled} /></label>;
}

function WavePlot({ x, traces, mode, cursor, onCursor }: { x: number[]; traces: Trace[]; mode: "time" | "spectrum" | "gain" | "phase"; cursor: number | null; onCursor: (index: number | null) => void }) {
  const [width, setWidth] = useState(760);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => { const measured = entries[0]?.contentRect.width; if (measured > 0) setWidth(Math.max(320, Math.round(measured))); });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [traces.length]);
  const height = 270, left = 63, right = 22, top = 25, bottom = 42, xTicks = width < 500 ? 3 : 5;
  const plotWidth = width - left - right, plotHeight = height - top - bottom;
  const all = traces.flatMap(trace => trace.values.filter(Number.isFinite));
  if (!x.length || !all.length) return <div className="el-sim-no-traces">계산된 채널이 없습니다. 연결된 구멍에 프로브를 지정해 주세요.</div>;
  const rawMin = Math.min(...all), rawMax = Math.max(...all);
  const padding = Math.max((rawMax - rawMin) * 0.12, mode === "gain" ? 1 : mode === "phase" ? 5 : Math.max(Math.abs(rawMax) * 0.08, rawMin === 0 && rawMax === 0 ? 0.05 : 1e-9));
  const yMin = mode === "spectrum" ? 0 : rawMin - padding, yMax = rawMax + padding;
  const logarithmic = mode === "gain" || mode === "phase";
  const xMin = logarithmic ? Math.log10(x[0]) : x[0], xMax = logarithmic ? Math.log10(x[x.length - 1]) : x[x.length - 1];
  const plotX = (value: number) => left + ((logarithmic ? Math.log10(value) : value) - xMin) / (xMax - xMin || 1) * plotWidth;
  const plotY = (value: number) => top + (yMax - value) / (yMax - yMin) * plotHeight;
  const selected = cursor === null ? null : Math.max(0, Math.min(x.length - 1, cursor));
  const yLabel = mode === "time" ? "전압 (V)" : mode === "spectrum" ? "진폭 (V peak)" : mode === "gain" ? "이득 (dB)" : "위상 (°)";
  const yText = (value: number) => !logarithmic ? engineering(value, "V") : `${Number(value.toFixed(1))}${mode === "gain" ? " dB" : "°"}`;
  const moveCursor = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, ((event.clientX - rect.left) / rect.width * width - left) / plotWidth));
    const target = xMin + position * (xMax - xMin);
    let low = 0, high = x.length - 1;
    while (low < high) { const mid = (low + high) >> 1; if ((logarithmic ? Math.log10(x[mid]) : x[mid]) < target) low = mid + 1; else high = mid; }
    if (low > 0 && Math.abs((logarithmic ? Math.log10(x[low - 1]) : x[low - 1]) - target) < Math.abs((logarithmic ? Math.log10(x[low]) : x[low]) - target)) low -= 1;
    onCursor(low);
  };
  return <div className="el-sim-plot-wrap" ref={container}>
    <svg className="el-sim-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${mode === "time" ? "시간 파형" : mode === "spectrum" ? "주파수 성분" : "주파수 응답"}: ${traces.map(trace => trace.label).join(", ")}`} onPointerMove={moveCursor} onPointerDown={moveCursor}>
      <text className="el-sim-axis-title" x={left} y={14}>{yLabel}</text>
      {Array.from({ length: 6 }, (_, index) => { const py = top + index / 5 * plotHeight, value = yMax - index / 5 * (yMax - yMin); return <g key={`y${index}`}><line className="el-sim-gridline" x1={left} y1={py} x2={width - right} y2={py} /><text className="el-sim-axis" x={left - 9} y={py + 4} textAnchor="end">{yText(value)}</text></g>; })}
      {Array.from({ length: xTicks + 1 }, (_, index) => { const px = left + index / xTicks * plotWidth, value = logarithmic ? 10 ** (xMin + index / xTicks * (xMax - xMin)) : xMin + index / xTicks * (xMax - xMin); return <g key={`x${index}`}><line className="el-sim-gridline" x1={px} y1={top} x2={px} y2={height - bottom} /><text className="el-sim-axis" x={px} y={height - bottom + 21} textAnchor="middle">{engineering(value, mode === "time" ? "s" : "Hz")}</text></g>; })}
      {yMin < 0 && yMax > 0 && <line className="el-sim-zero" x1={left} x2={width - right} y1={plotY(0)} y2={plotY(0)} />}
      {traces.map(trace => <path key={trace.label} d={trace.values.map((value, index) => `${index ? "L" : "M"}${plotX(x[index]).toFixed(2)},${plotY(value).toFixed(2)}`).join(" ")} fill="none" stroke={trace.color} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />)}
      {selected !== null && <g className="el-sim-cursor"><line x1={plotX(x[selected])} x2={plotX(x[selected])} y1={top} y2={height - bottom} />{traces.map(trace => <circle key={trace.label} cx={plotX(x[selected])} cy={plotY(trace.values[selected])} r={3.5} fill={trace.color} />)}</g>}
    </svg>
    <div className="el-sim-cursor-readout" aria-live="polite"><span>{selected === null ? "그래프 위에 포인터를 올려 값을 읽으세요" : engineering(x[selected], mode === "time" ? "s" : "Hz")}</span>{selected !== null && traces.map(trace => <b key={trace.label} style={{ color: trace.color }}>{trace.label} <span>{yText(trace.values[selected])}</span></b>)}</div>
    <label className="el-sim-cursor-control"><span>커서 위치</span><input aria-label="파형 커서 위치" type="range" min={0} max={x.length - 1} value={selected ?? 0} onChange={event => onCursor(Number(event.target.value))} /></label>
  </div>;
}

export function SimulationPanel({ circuit, layout, definitions, probes, onPickProbe, onClearProbe, pickingChannel, controlRequest, onControlResult, onContextChange, onSetProbeHoles }: {
  circuit: Circuit; layout: CircuitLayout; definitions: ComponentDefinition[];
  probes: [SimulationProbe, SimulationProbe]; onPickProbe: (channel: Channel) => void; onClearProbe: (channel: Channel) => void; pickingChannel: Channel | null;
  controlRequest?: { id: number; action: SimulationAssistantAction };
  onControlResult?: (id: number, message: string) => void;
  onContextChange?: (context: SimulationContext | null) => void;
  onSetProbeHoles?: (holes: ProbeHoles) => void;
}) {
  const [config, setConfig] = useState<SimulationConfig>(() => defaultSimulationConfig(circuit));
  const [capture, setCapture] = useState<CapturedResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<ResultTab>("time");
  const [acMode, setAcMode] = useState<"gain" | "phase">("gain");
  const [cursor, setCursor] = useState<number | null>(null);
  const [showDifference, setShowDifference] = useState(false);
  const [controlNotice, setControlNotice] = useState("");
  const [requestedNets, setRequestedNets] = useState<[string | null, string | null]>([null, null]);
  type Undo = { config: SimulationConfig; holes: ProbeHoles; nets: [string | null, string | null]; scene: string; appliedConfig: string; appliedHoles: string };
  const [undo, setUndo] = useState<Undo | null>(null);
  const [pendingRun, setPendingRun] = useState<{ id?: number; configKey: string; holes: ProbeHoles; scene: string; generation: number } | null>(null);
  const controlGeneration = useRef(0);
  const lastControlId = useRef(-1);
  const callbacks = useRef({ onControlResult, onContextChange, onSetProbeHoles });
  callbacks.current = { onControlResult, onContextChange, onSetProbeHoles };
  const worker = useRef<Worker | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), sequence = useRef(0);
  const nets = useMemo(() => netIds(circuit), [circuit]);
  const recommendation = useMemo(() => deriveSimulationRecommendation(circuit, definitions), [circuit, definitions]);
  const sceneKey = useMemo(() => JSON.stringify({ circuit, placements: layout.placements, jumpers: layout.jumpers, terminals: layout.terminals, board: layout.board.options, definitions }), [circuit, layout, definitions]);
  const previousScene = useRef(sceneKey);
  const probeKey = JSON.stringify(probes.map(probe => probe.holeId));
  const configKey = JSON.stringify(config);
  const samplingWarning = simulationSamplingWarning(config);
  const wiringCheck = useMemo(() => {
    try { createSimulationLayoutIndex(circuit, definitions, layout); return { message: "", issues: [], unsupported: false }; }
    catch (failure) {
      const issues = failure instanceof SimulationLayoutError ? failure.issues : [];
      const unsupportedIds = new Set(issues.filter(issue => ["UNSUPPORTED_MOUNTING", "UNSUPPORTED_FOOTPRINT"].includes(issue.code)).map(issue => issue.componentId));
      return {
        message: failure instanceof Error ? failure.message : "실행 전에 빵판 연결을 확인하세요.",
        issues: issues.filter(issue => issue.code !== "MISSING_PLACEMENT" || !unsupportedIds.has(issue.componentId)),
        unsupported: unsupportedIds.size > 0,
      };
    }
  }, [circuit, definitions, layout]);
  const wiringStatus = wiringCheck.message;
  const configurationProblem = useMemo(() => {
    try { parseSimulationConfig(config); return ""; }
    catch (failure) { return failure instanceof Error ? failure.message : "계산 조건을 확인하세요."; }
  }, [config]);
  const probeProblem = !probes.some(probe => probe.holeId && probe.netId)
    ? "VIN·VOUT 자동 설정을 적용하거나 CH1·CH2의 측정할 구멍을 선택하세요."
    : probes.some(probe => probe.holeId && (!probe.netId || !nets.includes(probe.netId)))
      ? "연결되지 않았거나 회로에서 사라진 프로브가 있습니다. 위치를 다시 선택해 주세요."
      : "";
  const executionProblem = wiringStatus || configurationProblem || probeProblem;
  const hasOpamp = circuit.components.some(component => definitions.find(definition => definition.id === component.definitionId)?.kind === "opamp");
  const deviceModels = useMemo(() => circuit.components.flatMap(component => {
    const model = NONLINEAR_MODEL_REGISTRY.find(model => model.definitionId === component.definitionId);
    return model ? [{ id: component.id, model }] : [];
  }), [circuit]);
  const netsKey = nets.join("\u0000");
  const fingerprint = useMemo(() => JSON.stringify({ circuit, placements: layout.placements, jumpers: layout.jumpers, terminals: layout.terminals, board: layout.board.options, definitions, config, probes }), [circuit, layout, definitions, config, probes]);
  const currentFingerprint = useRef(fingerprint), previousFingerprint = useRef(fingerprint);
  currentFingerprint.current = fingerprint;
  const stale = Boolean(capture && capture.fingerprint !== fingerprint);
  const stop = () => { sequence.current += 1; worker.current?.terminate(); worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => () => { worker.current?.terminate(); if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (previousFingerprint.current === fingerprint) return;
    previousFingerprint.current = fingerprint;
    if (worker.current) { stop(); setRunning(false); setNotice("회로·배치·설정이 변경되어 계산을 중단했습니다."); }
    else setNotice("");
    setError(""); setCursor(null);
  }, [fingerprint]);
  useEffect(() => {
    setConfig(previous => {
      if (nets.includes(previous.groundNetId) && nets.includes(previous.source.netId) && previous.supplies.every(supply => nets.includes(supply.netId)) && (previous.extraSources || []).every(source => nets.includes(source.netId))) return previous;
      return defaultSimulationConfig(circuit);
    });
  // A removed net invalidates the settings; ordinary value/placement edits keep them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netsKey]);

  const invalidateControls = () => {
    const message = pendingRun ? "직접 설정을 변경하여 예약 실행을 취소했습니다." : "";
    if (pendingRun?.id !== undefined) callbacks.current.onControlResult?.(pendingRun.id, message);
    controlGeneration.current += 1; setUndo(null); setPendingRun(null); setControlNotice(message); setRequestedNets([null, null]);
  };
  const updateSource = (patch: Partial<SimulationConfig["source"]>) => { invalidateControls(); setConfig(previous => ({ ...previous, source: { ...previous.source, ...patch }, supplies: patch.netId ? previous.supplies.filter(supply => supply.netId !== patch.netId) : previous.supplies })); };
  const updateConfig = (patch: Partial<SimulationConfig>) => { invalidateControls(); setConfig(previous => ({ ...previous, ...patch })); };
  const extraSources = config.extraSources || [];
  const drivenNets = [config.source.netId, ...extraSources.map(source => source.netId), ...config.supplies.map(supply => supply.netId)];
  const availableDriveNets = nets.filter(net => net !== config.groundNetId && !drivenNets.includes(net));
  const updateExtra = (index: number, patch: Partial<SimulationConfig["source"]>) => updateConfig({ extraSources: extraSources.map((source, at) => at === index ? { ...source, ...patch } : source) });
  const netName = (net: string) => circuit.netNames[net] && circuit.netNames[net] !== net ? `${circuit.netNames[net]} · ${net}` : net;
  const start = () => {
    stop(); setError(""); setNotice("");
    if (executionProblem) { setError(executionProblem); setRunning(false); return; }
    const requestId = ++sequence.current, runFingerprint = fingerprint;
    try {
      const instance = new Worker(new URL("../../lib/electronics/simulation.worker.ts", import.meta.url));
      worker.current = instance; setRunning(true); setCursor(null);
      const finish = () => { instance.terminate(); if (worker.current === instance) worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setRunning(false); };
      instance.onmessage = (event: MessageEvent<SimulationWorkerResponse>) => {
        if (event.data.requestId !== requestId || sequence.current !== requestId || currentFingerprint.current !== runFingerprint || worker.current !== instance) return;
        finish();
        if (event.data.type === "error") { setError(event.data.message); return; }
        if (event.data.type === "result") { setCapture({ circuit: structuredClone(circuit), definitions: structuredClone(definitions), result: event.data.result, fingerprint: runFingerprint, config, probes: probes.map(probe => ({ ...probe })) as [SimulationProbe, SimulationProbe], names: { ...circuit.netNames } }); setNotice("현재 배선과 설정으로 계산했습니다."); }
      };
      instance.onerror = event => { if (worker.current !== instance) return; event.preventDefault(); finish(); setError("계산 작업을 시작하지 못했습니다. 페이지를 새로고침한 뒤 다시 실행해 주세요."); };
      instance.onmessageerror = () => { if (worker.current !== instance) return; finish(); setError("계산 결과를 읽지 못했습니다. 다시 실행해 주세요."); };
      timer.current = setTimeout(() => { if (worker.current !== instance) return; finish(); sequence.current += 1; setError("계산 시간이 20초를 넘겨 중단했습니다. 샘플 수를 줄이거나 회로 구성을 확인해 주세요."); }, 20000);
      const request: SimulationWorkerRequest = { type: "run", requestId, input: { circuit, definitions, layout, config } };
      instance.postMessage(request);
    } catch (failure) { stop(); setRunning(false); setError(failure instanceof Error ? failure.message : "이 브라우저에서 계산 작업을 시작하지 못했습니다."); }
  };
  const respondControl = (id: number | undefined, message: string) => {
    setControlNotice(message);
    if (id !== undefined) callbacks.current.onControlResult?.(id, message);
  };
  const applyPrepared = (next: SimulationConfig, targetNets: [string | null, string | null], run: boolean, id?: number) => {
    const generation = ++controlGeneration.current;
    const checked = parseSimulationConfig(next);
    const resolved = resolveSimulationProbeHoles(circuit, definitions, layout, targetNets);
    const oldHoles = probes.map(probe => probe.holeId) as ProbeHoles;
    const canMove = Boolean(callbacks.current.onSetProbeHoles) || JSON.stringify(resolved.holes) === probeKey;
    // Preserve only a real, valid prior configuration. A direct invalid edit is
    // never advertised as a usable undo target.
    let prior: SimulationConfig | null = null;
    try { prior = parseSimulationConfig(config); } catch { /* direct incomplete input */ }
    setUndo(prior ? { config: prior, holes: oldHoles, nets: [...requestedNets] as [string | null, string | null], scene: sceneKey, appliedConfig: JSON.stringify(checked), appliedHoles: JSON.stringify(canMove ? resolved.holes : oldHoles) } : null);
    stop(); setRunning(false); setError(""); setConfig(checked); setRequestedNets(targetNets);
    if (canMove) callbacks.current.onSetProbeHoles?.(resolved.holes);
    const blocked = resolved.blockedReason || (!canMove ? "프로브 위치를 자동으로 적용할 연결이 없습니다. CH1·CH2를 직접 지정하세요." : !resolved.holes.some(Boolean) ? "계산할 프로브의 빵판 위치를 확인하세요." : "");
    if (run && !blocked) {
      setPendingRun({ id, configKey: JSON.stringify(checked), holes: resolved.holes, scene: sceneKey, generation });
      setControlNotice("설정과 프로브를 적용한 뒤 계산을 시작합니다.");
    } else {
      setPendingRun(null);
      respondControl(id, blocked ? `파형 설정은 적용했습니다. 실행은 차단되어 있습니다. ${blocked}` : "파형 설정과 VIN·VOUT 프로브를 적용했습니다. 실행 버튼으로 계산할 수 있습니다.");
      if (run && blocked) setError(blocked);
    }
  };
  const controlRun = (id?: number) => {
    try {
      parseSimulationConfig(config);
      const index = createSimulationLayoutIndex(circuit, definitions, layout);
      if (!probes.some(probe => probe.holeId && probe.netId)) throw new Error("VIN·VOUT 프로브의 빵판 위치를 먼저 지정하세요.");
      for (const probe of probes) if (probe.holeId && (!probe.netId || index.netForHole(probe.holeId) !== probe.netId)) throw new Error("프로브의 현재 빵판 연결을 다시 확인하세요.");
      start();
      respondControl(id, worker.current ? "현재 설정과 실제 빵판 연결로 계산을 시작했습니다." : "계산을 시작하지 못했습니다. 파형 화면의 오류를 확인하세요.");
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "파형 설정과 빵판 연결을 확인하세요.";
      setError(message); setRunning(false); respondControl(id, `실행이 차단되었습니다. ${message}`);
    }
  };
  const applyCommand = (value: SimulationAssistantAction, id?: number) => {
    controlGeneration.current += 1;
    try {
      const action = parseSimulationAction(value, circuit);
      setPendingRun(null);
      if (action.resultTab) { setTab(action.resultTab); setCursor(null); }
      if (action.kind === "stop") { stop(); setRunning(false); respondControl(id, "계산을 취소했습니다."); return; }
      if (action.kind === "run") { controlRun(id); return; }
      if (action.kind === "undo") {
        if (!undo || undo.scene !== sceneKey || undo.appliedConfig !== configKey || undo.appliedHoles !== probeKey) throw new Error("현재 상태에서 되돌릴 자동 설정이 없습니다. 직접 편집이나 회로 변경 후에는 이전 자동 설정을 복원하지 않습니다.");
        if (!callbacks.current.onSetProbeHoles && JSON.stringify(undo.holes) !== probeKey) throw new Error("이전 프로브 위치를 복원할 연결이 없습니다.");
        stop(); setRunning(false); setError(""); setConfig(undo.config); setRequestedNets(undo.nets); callbacks.current.onSetProbeHoles?.(undo.holes); setUndo(null);
        respondControl(id, "직전 자동 설정 이전의 발생기·시간 설정과 프로브 위치로 되돌렸습니다."); return;
      }
      const initial = action.kind === "auto_setup" ? recommendation.config : config;
      if (!initial) throw new Error("입력과 GND를 추천할 근거가 부족합니다. 연결을 직접 선택해 주세요.");
      const next = applySimulationSettings(initial, action.settings);
      const targets: [string | null, string | null] = action.kind === "auto_setup"
        ? [action.settings?.sourceNetId ?? recommendation.inputNetId, action.settings?.outputNetId ?? recommendation.outputNetId]
        : [action.settings?.sourceNetId ?? requestedNets[0] ?? probes[0].netId, action.settings?.outputNetId ?? requestedNets[1] ?? probes[1].netId];
      applyPrepared(next, targets, action.run === true, id);
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : "파형 조작을 적용하지 못했습니다.";
      setError(message); respondControl(id, message);
    }
  };
  const fitCapture = () => {
    try {
      const timing = fitSimulationSampling(config);
      const next = { ...config, durationSeconds: timing.durationSeconds, sampleCount: timing.sampleCount };
      let prior: SimulationConfig | null = null;
      try { prior = parseSimulationConfig(config); } catch { /* blank capture fields can be repaired */ }
      invalidateControls();
      setConfig(next);
      setUndo(prior ? { config: prior, holes: probes.map(probe => probe.holeId) as ProbeHoles, nets: [...requestedNets], scene: sceneKey, appliedConfig: JSON.stringify(next), appliedHoles: probeKey } : null);
      setError(""); setControlNotice(timing.note);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "입력 조건을 확인한 뒤 자동 맞춤을 사용하세요."); }
  };
  // Invalidate actions tied to a previous circuit/layout before accepting a new
  // command. IDs remain monotonic across ordinary parent re-renders.
  useEffect(() => {
    if (previousScene.current === sceneKey) return;
    previousScene.current = sceneKey;
    controlGeneration.current += 1;
    setUndo(null); setPendingRun(null); setRequestedNets([null, null]); setControlNotice("");
    if (controlRequest && controlRequest.id > lastControlId.current) { lastControlId.current = controlRequest.id; respondControl(controlRequest.id, "회로·배치가 변경되어 이전 파형 요청을 적용하지 않았습니다. 현재 회로에서 다시 요청하세요."); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey]);
  useEffect(() => {
    if (!controlRequest || !Number.isSafeInteger(controlRequest.id) || controlRequest.id < 0 || controlRequest.id <= lastControlId.current) return;
    lastControlId.current = controlRequest.id;
    applyCommand(controlRequest.action, controlRequest.id);
  // Request contents are consumed exactly once. Current render state is used.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlRequest?.id]);
  useEffect(() => {
    if (!pendingRun || pendingRun.generation !== controlGeneration.current) return;
    if (pendingRun.scene !== sceneKey) { setPendingRun(null); respondControl(pendingRun.id, "회로·배치가 변경되어 예약한 계산을 취소했습니다."); return; }
    if (pendingRun.configKey !== configKey || JSON.stringify(pendingRun.holes) !== probeKey) return;
    setPendingRun(null); controlRun(pendingRun.id);
  // The queued command survives the parent's removal of controlRequest.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRun, configKey, probeKey, sceneKey]);
  useEffect(() => {
    if (!pendingRun) return;
    const timeout = setTimeout(() => {
      if (pendingRun.generation !== controlGeneration.current) return;
      controlGeneration.current += 1; setPendingRun(null);
      const message = "설정·프로브 적용을 확인하지 못해 예약 실행을 취소했습니다. 현재 연결을 확인한 뒤 다시 실행하세요.";
      setError(message); respondControl(pendingRun.id, message);
    }, 1500);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRun]);
  useEffect(() => {
    if (undo && (undo.scene !== sceneKey || undo.appliedConfig !== configKey || (!pendingRun && undo.appliedHoles !== probeKey))) setUndo(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, probeKey, sceneKey]);
  const contextKey = JSON.stringify({ config, probes: probes.map(probe => probe.netId), status: running ? "running" : error ? "error" : capture && !stale ? "complete" : "idle", message: error || controlNotice || notice });
  useEffect(() => {
    try {
      const context = parseSimulationContext({ config, probeNetIds: probes.map(probe => probe.netId), status: running ? "running" : error ? "error" : capture && !stale ? "complete" : "idle", message: (error || controlNotice || notice).slice(0, 800) }, circuit);
      callbacks.current.onContextChange?.(context);
    } catch { callbacks.current.onContextChange?.(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextKey, sceneKey]);

  const resultChannels = useMemo(() => capture ? capture.probes.flatMap((probe, channel) => {
    const values = probe.netId ? capture.result.nodeVoltages[probe.netId] : undefined;
    return probe.holeId && probe.netId && values?.length === capture.result.time.length && values.every(Number.isFinite) ? [{ channel, probe, values, label: `CH${channel + 1} · ${capture.names[probe.netId] || probe.netId}`, color: CHANNEL_COLORS[channel] }] : [];
  }) : [], [capture]);
  const measurementChannels = useMemo(() => {
    if (!capture) return [];
    const channels = resultChannels.map(channel => ({ ...channel, magnitude: capture.result.ac.nodeGainMagnitude[channel.probe.netId!] || [], phase: capture.result.ac.nodePhaseDegrees[channel.probe.netId!] || [] }));
    if (showDifference && channels.length === 2) {
      const [a, b] = channels, difference = differentialResponse(a.magnitude, a.phase, b.magnitude, b.phase);
      channels.push({ ...a, channel: 2, values: a.values.map((value, index) => value - b.values[index]), label: "MATH · CH1−CH2", color: "#a67bd5", magnitude: difference.magnitude, phase: difference.phase });
    }
    return channels;
  }, [capture, resultChannels, showDifference]);
  const spectra = useMemo(() => capture ? measurementChannels.map(channel => ({ ...amplitudeSpectrum(capture.result.time, channel.values), label: channel.label, color: channel.color })) : [], [capture, measurementChannels]);
  const traces: Trace[] = tab === "spectrum" ? spectra.map(spectrum => ({ label: spectrum.label, color: spectrum.color, values: spectrum.amplitudes })) : measurementChannels.flatMap(channel => {
    if (!capture) return [];
    const values = tab === "time" ? channel.values : acMode === "gain" ? channel.magnitude.map(value => 20 * Math.log10(Math.max(value, 1e-8))) : channel.phase;
    return values?.length === (tab === "time" ? capture.result.time.length : capture.result.ac.frequenciesHz.length) && values.every(Number.isFinite) ? [{ label: channel.label, color: channel.color, values }] : [];
  });
  const missingChannels = capture?.probes.flatMap((probe, channel) => probe.holeId && !resultChannels.some(item => item.channel === channel) ? [`CH${channel + 1} · ${probe.netId || probe.holeId}`] : []) || [];
  const acUnavailable = tab === "ac" ? capture?.result.acUnavailableReason : undefined;
  const saveCsv = () => {
    if (!capture || stale || running || acUnavailable || tab === "meter") return;
    const csvCell = (value: string | number) => `"${String(value).replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    const matrix: (string | number)[][] = tab === "dc" ? [["kind", "id", "value", "unit"], ...Object.entries(capture.result.dc.nodeVoltages).map(([id, value]) => ["node_voltage", id, value, "V"]), ...Object.entries(capture.result.dc.componentCurrents).map(([id, value]) => ["component_current_pin1_to_pin2", id, value, "A"]), ...Object.entries(capture.result.dc.deviceCurrents || {}).flatMap(([id, pins]) => Object.entries(pins).map(([pin, value]) => ["device_current_into_terminal", `${id}.${pin}`, value, "A"])), ...Object.entries(capture.result.dc.sourceCurrents).map(([id, value]) => ["source_current_node_to_source", id, value, "A"])] : tab === "ac" ? [["frequency_Hz", ...measurementChannels.flatMap(channel => [`${channel.label}_gain_ratio`, `${channel.label}_phase_deg`])], ...capture.result.ac.frequenciesHz.map((frequency, index) => [frequency, ...measurementChannels.flatMap(channel => [channel.magnitude[index] ?? "", channel.phase[index] ?? ""])])] : tab === "spectrum" ? [["frequency_Hz", ...spectra.map(channel => `${channel.label}_Vpeak_Hann_DC_removed`)], ...(spectra[0]?.frequenciesHz || []).map((frequency, index) => [frequency, ...spectra.map(channel => channel.amplitudes[index])])] : [["time_s", ...measurementChannels.map(channel => `${channel.label}_V`)], ...capture.result.time.map((time, index) => [time, ...measurementChannels.map(channel => channel.values[index])])];
    const contents = "\uFEFF" + matrix.map(row => row.map(value => typeof value === "number" ? String(value) : csvCell(value)).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `electronics-${tab}-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="el-simulation" aria-label="파형 및 회로 시뮬레이션">
    <header className="el-sim-header"><div><span className="el-eyebrow">VIRTUAL INSTRUMENTS</span><h2>파형 · 계측</h2><p>빵판의 측정 지점을 고르고 회로 응답을 확인하세요.</p></div><span className={`el-sim-status ${error || executionProblem ? "blocked" : stale ? "stale" : ""}`}>{running ? "계산 중" : error ? "실행 오류" : executionProblem ? "설정 확인 필요" : stale ? "다시 계산 필요" : capture ? "계산 완료" : "실행 준비 완료"}</span></header>
    <p className="el-sim-model-note">교육용 회로 모델 · BJT/MOSFET의 바이어스와 비선형 응답 계산 · 제조사 SPICE 실측 모델과 다를 수 있습니다</p>
    <div className="el-sim-setup" aria-label="파형 자동 설정">
      <div className="el-sim-setup-heading"><div><h3>VIN · VOUT 자동 설정</h3><p>계측기 단자·연결 이름·소자 핀을 바탕으로 측정 지점을 추천합니다.</p></div><div><button className="el-button el-primary" onClick={() => applyCommand({ kind: "auto_setup", run: true })} disabled={!recommendation.config || Boolean(wiringStatus)}>자동 설정 · 실행</button><button className="el-button" onClick={() => applyCommand({ kind: "auto_setup" })} disabled={!recommendation.config}>설정만 적용</button><button className="el-button" onClick={() => applyCommand({ kind: "undo" })} disabled={!undo || undo.scene !== sceneKey || undo.appliedConfig !== configKey || undo.appliedHoles !== probeKey}>설정 되돌리기</button></div></div>
      <div className="el-sim-fields">{([0, 1] as const).map(channel => <label key={channel} className="el-sim-field"><span>{channel === 0 ? "VIN · CH1 측정 연결" : "VOUT · CH2 측정 연결"}</span><select aria-label={channel === 0 ? "VIN 측정 연결" : "VOUT 측정 연결"} value={requestedNets[channel] ?? probes[channel].netId ?? ""} onChange={event => {
        const targets = [requestedNets[0] ?? probes[0].netId, requestedNets[1] ?? probes[1].netId] as [string | null, string | null];
        targets[channel] = event.target.value || null;
        try { applyPrepared(config, targets, false); } catch (failure) { setError(failure instanceof Error ? failure.message : "측정 연결을 적용하지 못했습니다."); }
      }}><option value="">측정 연결 선택</option>{nets.map(net => <option key={net} value={net}>{netName(net)}</option>)}</select></label>)}</div>
      {recommendation.assumptions.length > 0 && <p className="el-sim-assumption-summary">자동 설정에 원자료 확인이 필요한 조건 {recommendation.assumptions.length}개가 있습니다. 아래 기본값을 확인하세요.</p>}
      <details><summary>추천 근거와 확인할 기본값{recommendation.assumptions.length > 0 && <span className="el-sim-assumption-count">확인 {recommendation.assumptions.length}개</span>}</summary>{recommendation.assumptions.length > 0 && <div className="el-sim-assumptions"><b>미지정 조건은 교육용 시작값입니다</b><ul>{recommendation.assumptions.map(reason => <li key={reason}>{reason}</li>)}</ul></div>}<ul>{recommendation.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul></details>
      {wiringStatus && <div className="el-sim-setup-blocked" role="status"><b>빵판 배치를 먼저 확인하세요</b>{wiringCheck.issues.length > 0 ? <ul>{wiringCheck.issues.slice(0, 5).map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}</ul> : <p>{wiringStatus}</p>}{wiringCheck.issues.length > 5 && <p>추가 {wiringCheck.issues.length - 5}개 항목은 빵판의 연결 검사에서 확인할 수 있습니다.</p>}{wiringCheck.unsupported && <p>이 패키지의 물리 배치 지원이 필요합니다. 설정 변경이나 재실행으로 해결되지 않습니다.</p>}</div>}
      {samplingWarning && <div className="el-sim-sampling-warning" role="status"><p>{samplingWarning}</p><button className="el-button el-small" onClick={fitCapture}>시간·샘플 자동 맞춤</button></div>}
      {controlNotice && <p className="el-sim-control-notice" role="status">{controlNotice}</p>}
    </div>
    {deviceModels.length > 0 && <details className="el-sim-device-models"><summary>사용한 반도체 모델 · {deviceModels.length}개 · 300 K</summary>{deviceModels.map(({ id, model }) => <div key={id}><b>{id} · {model.label}</b><p>{model.parameterBasis}</p><small>{Object.entries(model.parameters).map(([key, value]) => `${key}=${value}`).join(" · ")}</small>{model.pinoutSources.filter(source => source.url).map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">제조사 핀맵 ↗</a>)}</div>)}</details>}
    <div className="el-sim-probes">{probes.map((probe, channel) => <div key={channel} className={`el-sim-probe ${pickingChannel === channel ? "picking" : ""}`} style={{ "--channel-color": CHANNEL_COLORS[channel] } as React.CSSProperties}><button onClick={() => { invalidateControls(); onPickProbe(channel as Channel); }} aria-pressed={pickingChannel === channel}><b>CH{channel + 1}</b><span><strong>{probe.holeId || "측정할 구멍 선택"}</strong><small>{pickingChannel === channel ? "빵판에서 구멍을 클릭하세요" : probe.netId ? netName(probe.netId) : probe.holeId ? "연결되지 않은 구멍" : "클릭하여 프로브 연결"}</small></span><span aria-hidden="true">↗</span></button>{probe.holeId && <button className="el-sim-probe-clear" aria-label={`CH${channel + 1} 프로브 해제`} onClick={() => { invalidateControls(); onClearProbe(channel as Channel); }}>×</button>}</div>)}</div>
    <div className="el-sim-controls"><div className="el-sim-control-heading"><h3>신호 발생기</h3><span>전압은 선택한 GND 기준</span></div>
      {hasOpamp && <details className="el-sim-advanced"><summary>연산증폭기 모델<span>{config.opampModel === "educational-dynamic" ? "대역폭 · 슬루율 · 출력 제한" : "이상적 선형 모델"}</span></summary><div className="el-sim-fields"><label className="el-sim-field"><span>UA741 계산 모델</span><select value={config.opampModel ?? "ideal"} onChange={event => updateConfig({ opampModel: event.target.value as SimulationConfig["opampModel"] })}><option value="ideal">이상적 선형 모델</option><option value="educational-dynamic">교육용 동적 모델</option></select></label>{config.opampModel === "educational-dynamic" && <NumericField label="시동 초기 변화" unit="mV" value={(config.startupPerturbationVolts ?? 0) * 1000} onChange={value => updateConfig({ startupPerturbationVolts: value / 1000 })} min={0} max={10} />}</div><p className="el-sim-control-note">동적 모델은 유한 대역폭·슬루율·전원에 따른 출력 제한을 계산합니다. 발진기의 초기 변화는 사용자가 지정한 시동 조건이며 실제 잡음이 아닙니다. 양의 피드백 회로는 시간 파형과 주파수 성분으로 확인하세요.</p></details>}
      <div className="el-sim-fields"><label className="el-sim-field"><span>입력 연결</span><select value={config.source.netId} onChange={event => updateSource({ netId: event.target.value })}><option value="">입력 선택</option>{nets.map(net => <option key={net} value={net} disabled={net === config.groundNetId || extraSources.some(source => source.netId === net)}>{netName(net)}</option>)}</select></label><label className="el-sim-field"><span>기준 GND</span><select value={config.groundNetId} onChange={event => updateConfig({ groundNetId: event.target.value, supplies: config.supplies.filter(supply => supply.netId !== event.target.value) })}><option value="">GND 선택</option>{nets.map(net => <option key={net} value={net} disabled={net === config.source.netId || extraSources.some(source => source.netId === net)}>{netName(net)}</option>)}</select></label></div>
      <FunctionGenerator source={config.source} onChange={updateSource} label="기본 입력" />
      <details className="el-sim-advanced" open={extraSources.length > 0 ? true : undefined}><summary>다중 입력 · 위상<span>RF/LO와 차동 입력 · 최대 4개 발생기</span></summary>

        {extraSources.map((source, index) => <div className="el-sim-extra-source" key={index}><div className="el-sim-control-heading"><h4>추가 입력 {index + 1}</h4><button className="el-text-button" aria-label={`추가 입력 ${index + 1} 제거`} onClick={() => updateConfig({ extraSources: extraSources.filter((_, at) => at !== index) })}>제거</button></div><div className="el-sim-fields">
          <label className="el-sim-field"><span>추가 입력 {index + 1} 연결</span><select value={source.netId} onChange={event => updateExtra(index, { netId: event.target.value })}>{nets.filter(net => net !== config.groundNetId).map(net => <option key={net} value={net} disabled={net !== source.netId && drivenNets.includes(net)}>{netName(net)}</option>)}</select></label>
        </div><FunctionGenerator source={source} onChange={patch => updateExtra(index, patch)} label={`추가 입력 ${index + 1}`} /></div>)}
        <button className="el-button el-small" disabled={extraSources.length >= 3 || !availableDriveNets.length} onClick={() => { const netId = availableDriveNets[0]; if (netId) updateConfig({ extraSources: [...extraSources, { netId, waveform: "sine", frequencyHz: 1000, amplitudePeak: 0.01, offset: 0, phaseDegrees: 0 }] }); }}>+ 신호 발생기</button>
        <p className="el-sim-control-note">시간 파형은 모든 입력을 함께 계산합니다. AC 주파수 응답은 기본 입력만 1 V 소신호로 인가하며 추가 입력은 각 DC 오프셋에 고정합니다. 믹서의 변환 이득은 주파수 성분에서 확인하세요.</p>
      </details>
      <details className="el-sim-advanced"><summary>전원 · 시간 범위 · 계산 정밀도<span>{engineering(config.durationSeconds, "s")} · {config.sampleCount} 샘플</span></summary><div className="el-sim-fields"><NumericField label="표시 시간" unit="ms" value={config.durationSeconds * 1000} onChange={value => updateConfig({ durationSeconds: value / 1000 })} min={0.001} /><NumericField label="시간 샘플" value={config.sampleCount} onChange={sampleCount => updateConfig({ sampleCount })} min={32} max={4096} step={1} /><NumericField label="AC 시작" unit="Hz" value={config.acStartHz} onChange={acStartHz => updateConfig({ acStartHz })} min={0.001} /><NumericField label="AC 끝" unit="Hz" value={config.acStopHz} onChange={acStopHz => updateConfig({ acStopHz })} min={0.001} /><NumericField label="AC 지점" value={config.acPoints} onChange={acPoints => updateConfig({ acPoints })} min={2} max={512} step={1} /></div><div className="el-sim-supplies"><h4>추가 DC 전원</h4>{config.supplies.map((supply, index) => <div className="el-sim-supply" key={`${index}-${supply.netId}`}><label className="el-sim-field"><span>전원 연결 {index + 1}</span><select value={supply.netId} onChange={event => updateConfig({ supplies: config.supplies.map((item, at) => at === index ? { ...item, netId: event.target.value } : item) })}>{nets.filter(net => net !== config.groundNetId && net !== config.source.netId && !extraSources.some(source => source.netId === net)).map(net => <option key={net} value={net} disabled={config.supplies.some((item, at) => at !== index && item.netId === net)}>{netName(net)}</option>)}</select></label><NumericField label="전압" unit="V" value={supply.voltage} onChange={voltage => updateConfig({ supplies: config.supplies.map((item, at) => at === index ? { ...item, voltage } : item) })} /><button className="el-text-button" onClick={() => updateConfig({ supplies: config.supplies.filter((_, at) => at !== index) })} aria-label={`${supply.netId} 전원 제거`}>제거</button></div>)}<button className="el-button el-small" onClick={() => { const netId = availableDriveNets[0]; if (netId) updateConfig({ supplies: [...config.supplies, { netId, voltage: 0 }] }); }} disabled={config.supplies.length >= 8 || !availableDriveNets.length}>+ DC 전원</button><p>기본값은 회로의 전원 표기를 참고합니다. 실제 실험의 전압과 비교해 수정하세요.</p></div></details>
    </div>
    <div className="el-sim-runbar"><span>{configurationProblem || probeProblem || "현재 입력과 프로브로 계산합니다."}</span><div className="el-sim-run-actions">{!samplingWarning && <button className="el-button" onClick={fitCapture} disabled={running}>시간·샘플 자동 맞춤</button>}{running ? <button className="el-button" onClick={() => { stop(); setRunning(false); setNotice("계산을 취소했습니다."); }}>계산 취소</button> : <button className="el-button el-primary" disabled={Boolean(executionProblem)} onClick={start}>시뮬레이션 실행 <span aria-hidden="true">↗</span></button>}</div></div>
    {error && <div className="el-sim-message error" role="alert"><b>계산을 완료하지 못했습니다</b><p>{error}</p><small>지원하지 않는 소자는 결과에서 생략하지 않습니다. 지원 모델과 연결 상태를 확인해 주세요.</small></div>}
    {notice && !error && <p className="el-sim-notice" role="status">{notice}</p>}
    {stale && <div className="el-sim-message stale" role="status"><b>이전 조건의 결과입니다</b><p>회로·배선·프로브 또는 설정이 변경되었습니다. 다시 실행하면 현재 상태로 갱신됩니다.</p></div>}
    <div className={`el-sim-results ${stale ? "is-stale" : ""}`}><div className="el-sim-result-toolbar"><div className="el-sim-tabs" role="tablist" aria-label="시뮬레이션 결과">{([{ id: "time", name: "시간 파형" }, { id: "spectrum", name: "주파수 성분" }, { id: "ac", name: "주파수 응답" }, { id: "dc", name: "DC 동작점" }, { id: "meter", name: "멀티미터" }] as const).map(item => <button role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} key={item.id} onClick={() => { setTab(item.id); setCursor(null); }}>{item.name}</button>)}</div><button className="el-button el-small" disabled={!capture || stale || running || Boolean(acUnavailable) || tab === "meter"} onClick={saveCsv}>CSV 저장</button></div>
      {tab === "meter" ? <Multimeter key={circuit.id} circuit={stale || !capture ? circuit : capture.circuit} layout={layout} definitions={stale || !capture ? definitions : capture.definitions} config={config} result={capture?.result} stale={stale || running} captureKey={capture?.fingerprint || ""} probeNets={[probes[0].netId, probes[1].netId]} /> : !capture ? <div className="el-sim-empty"><span aria-hidden="true">∿</span><h3>{running ? "회로 응답을 계산하고 있습니다" : "아직 계산한 파형이 없습니다"}</h3><p>{running ? "계산 중에도 빵판을 살펴볼 수 있습니다." : "프로브와 입력을 설정한 뒤 시뮬레이션을 실행하세요."}</p></div> : <>
        <div className="el-sim-result-context"><span>공통 기준: {capture.names[capture.config.groundNetId] || capture.config.groundNetId}</span><span>입력: {capture.names[capture.config.source.netId] || capture.config.source.netId}</span>{resultChannels.map(channel => <span key={channel.channel} style={{ color: channel.color }}><b>CH{channel.channel + 1}</b> {channel.probe.holeId} · {channel.probe.netId}</span>)}</div>
        <div className="el-sim-math"><label><input type="checkbox" checked={showDifference} disabled={resultChannels.length !== 2} onChange={event => { setShowDifference(event.target.checked); setCursor(null); }} />MATH · CH1−CH2 차동 출력</label><span>두 출력은 연결하지 않고 계산값을 뺍니다.</span></div>
        {missingChannels.length > 0 && <p className="el-sim-missing">{missingChannels.join(", ")}은 계산 모델에 포함되지 않은 연결입니다. 다른 측정 지점을 선택하세요.</p>}
        {tab !== "dc" ? <>
          {tab === "ac" && !acUnavailable && <div className="el-sim-ac-toolbar"><p>DC 동작점의 기본 입력 대비 소신호 전압비 · 로그 축 · 0 이득은 −160 dB</p><div><button className={acMode === "gain" ? "active" : ""} onClick={() => { setAcMode("gain"); setCursor(null); }}>이득</button><button className={acMode === "phase" ? "active" : ""} onClick={() => { setAcMode("phase"); setCursor(null); }}>위상</button></div></div>}
          {tab === "spectrum" && spectra[0] && <p className="el-sim-spectrum-note">Hann 창 · 평균 DC 제거 · 단측 V peak · 전체 시간 구간(초기 과도 응답 포함). Fs={engineering(spectra[0].sampleRateHz, "Hz")}, 관측 분해능≈{engineering(spectra[0].observationResolutionHz, "Hz")}. 0 채움은 실제 분해능을 높이지 않으며, 표본 사이의 고주파 왜곡은 놓칠 수 있습니다.</p>}
          {acUnavailable ? <div className="el-sim-message" role="status"><b>이 회로의 AC 응답은 제공하지 않습니다</b><p>{acUnavailable}</p><p>시간 파형과 주파수 성분에서 동작을 확인하세요.</p></div> : tab === "time" ? <Oscilloscope time={capture.result.time} traces={measurementChannels} captureKey={capture.fingerprint} stale={stale} /> : <WavePlot x={tab === "spectrum" ? spectra[0]?.frequenciesHz || [] : capture.result.ac.frequenciesHz} traces={traces} mode={tab === "spectrum" ? "spectrum" : acMode} cursor={cursor} onCursor={setCursor} />}

        </> : <div className="el-sim-dc-grid">
          <div><h3>노드 전압</h3><table><thead><tr><th>연결</th><th>전압</th></tr></thead><tbody>{Object.entries(capture.result.dc.nodeVoltages).map(([net, voltage]) => <tr key={net}><td>{capture.names[net] || net}</td><td>{engineering(voltage, "V")}</td></tr>)}</tbody></table></div>
          <div><h3>소자 전류</h3><table><thead><tr><th>소자</th><th>전류</th></tr></thead><tbody>{Object.entries(capture.result.dc.componentCurrents).map(([id, current]) => <tr key={id}><td>{id}</td><td>{engineering(current, "A")}</td></tr>)}</tbody></table><p>1번 핀 → 2번 핀이 양의 방향입니다. 커패시터의 DC 정상 상태 전류는 0입니다.</p></div>
          {Object.keys(capture.result.dc.deviceCurrents || {}).length > 0 && <div><h3>반도체 단자 전류</h3><table><thead><tr><th>소자 · 단자</th><th>유입 전류</th></tr></thead><tbody>{Object.entries(capture.result.dc.deviceCurrents || {}).flatMap(([id, pins]) => Object.entries(pins).map(([pin, current]) => <tr key={`${id}.${pin}`}><td>{id} · {pin}</td><td>{engineering(current, "A")}</td></tr>))}</tbody></table><p>각 단자로 들어가는 방향이 양수입니다. C/B/E 또는 D/G/S 전류의 합은 0입니다.</p></div>}
          <div><h3>이상 전압원 전류</h3><table><thead><tr><th>전원 연결</th><th>전류</th></tr></thead><tbody>{Object.entries(capture.result.dc.sourceCurrents).map(([net, current]) => <tr key={net}><td>{capture.names[net] || net}</td><td>{engineering(current, "A")}</td></tr>)}</tbody></table><p>양수: 연결 노드에서 이상 전압원으로 흐르는 방향. DC 동작점은 입력의 DC 오프셋 기준입니다.</p></div>
        </div>}
        {capture.result.warnings.length > 0 && <details className="el-sim-warnings" open><summary>모델 및 계산 안내 <span>{capture.result.warnings.length}</span></summary><ul>{capture.result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></details>}
      </>}
    </div>
  </section>;
}
