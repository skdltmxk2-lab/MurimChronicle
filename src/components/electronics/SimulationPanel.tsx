"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultSimulationConfig } from "@/lib/electronics/simulation";
import type { Circuit, CircuitLayout, ComponentDefinition } from "@/lib/electronics/types";
import type { SimulationConfig, SimulationResult, SimulationWaveform } from "@/lib/electronics/simulation-types";
import type { SimulationWorkerRequest, SimulationWorkerResponse } from "@/lib/electronics/simulation.worker";
import "./simulation.css";

export type SimulationProbe = { holeId: string | null; netId: string | null };
type Channel = 0 | 1;
type ResultTab = "time" | "ac" | "dc";
type CapturedResult = { result: SimulationResult; fingerprint: string; config: SimulationConfig; probes: [SimulationProbe, SimulationProbe]; names: Record<string, string> };
type Trace = { label: string; color: string; values: number[] };
const CHANNEL_COLORS = ["#d49124", "#3c8ed4"];
const WAVEFORMS: { id: SimulationWaveform; label: string }[] = [{ id: "sine", label: "사인파" }, { id: "square", label: "사각파" }, { id: "triangle", label: "삼각파" }, { id: "dc", label: "DC" }];

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

function WavePlot({ x, traces, mode, cursor, onCursor }: { x: number[]; traces: Trace[]; mode: "time" | "gain" | "phase"; cursor: number | null; onCursor: (index: number | null) => void }) {
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
  const padding = Math.max((rawMax - rawMin) * 0.12, mode === "gain" ? 1 : mode === "phase" ? 5 : Math.max(Math.abs(rawMax) * 0.08, 0.05));
  const yMin = rawMin - padding, yMax = rawMax + padding;
  const xMin = mode === "time" ? x[0] : Math.log10(x[0]), xMax = mode === "time" ? x[x.length - 1] : Math.log10(x[x.length - 1]);
  const plotX = (value: number) => left + ((mode === "time" ? value : Math.log10(value)) - xMin) / (xMax - xMin || 1) * plotWidth;
  const plotY = (value: number) => top + (yMax - value) / (yMax - yMin) * plotHeight;
  const selected = cursor === null ? null : Math.max(0, Math.min(x.length - 1, cursor));
  const yLabel = mode === "time" ? "전압 (V)" : mode === "gain" ? "이득 (dB)" : "위상 (°)";
  const yText = (value: number) => mode === "time" ? engineering(value, "V") : `${Number(value.toFixed(1))}${mode === "gain" ? " dB" : "°"}`;
  const moveCursor = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, ((event.clientX - rect.left) / rect.width * width - left) / plotWidth));
    const target = xMin + position * (xMax - xMin);
    let low = 0, high = x.length - 1;
    while (low < high) { const mid = (low + high) >> 1; if ((mode === "time" ? x[mid] : Math.log10(x[mid])) < target) low = mid + 1; else high = mid; }
    if (low > 0 && Math.abs((mode === "time" ? x[low - 1] : Math.log10(x[low - 1])) - target) < Math.abs((mode === "time" ? x[low] : Math.log10(x[low])) - target)) low -= 1;
    onCursor(low);
  };
  return <div className="el-sim-plot-wrap" ref={container}>
    <svg className="el-sim-plot" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${mode === "time" ? "시간 파형" : "주파수 응답"}: ${traces.map(trace => trace.label).join(", ")}`} onPointerMove={moveCursor} onPointerDown={moveCursor}>
      <text className="el-sim-axis-title" x={left} y={14}>{yLabel}</text>
      {Array.from({ length: 6 }, (_, index) => { const py = top + index / 5 * plotHeight, value = yMax - index / 5 * (yMax - yMin); return <g key={`y${index}`}><line className="el-sim-gridline" x1={left} y1={py} x2={width - right} y2={py} /><text className="el-sim-axis" x={left - 9} y={py + 4} textAnchor="end">{yText(value)}</text></g>; })}
      {Array.from({ length: xTicks + 1 }, (_, index) => { const px = left + index / xTicks * plotWidth, value = mode === "time" ? xMin + index / xTicks * (xMax - xMin) : 10 ** (xMin + index / xTicks * (xMax - xMin)); return <g key={`x${index}`}><line className="el-sim-gridline" x1={px} y1={top} x2={px} y2={height - bottom} /><text className="el-sim-axis" x={px} y={height - bottom + 21} textAnchor="middle">{engineering(value, mode === "time" ? "s" : "Hz")}</text></g>; })}
      {yMin < 0 && yMax > 0 && <line className="el-sim-zero" x1={left} x2={width - right} y1={plotY(0)} y2={plotY(0)} />}
      {traces.map(trace => <path key={trace.label} d={trace.values.map((value, index) => `${index ? "L" : "M"}${plotX(x[index]).toFixed(2)},${plotY(value).toFixed(2)}`).join(" ")} fill="none" stroke={trace.color} strokeWidth={1.8} vectorEffect="non-scaling-stroke" />)}
      {selected !== null && <g className="el-sim-cursor"><line x1={plotX(x[selected])} x2={plotX(x[selected])} y1={top} y2={height - bottom} />{traces.map(trace => <circle key={trace.label} cx={plotX(x[selected])} cy={plotY(trace.values[selected])} r={3.5} fill={trace.color} />)}</g>}
    </svg>
    <div className="el-sim-cursor-readout" aria-live="polite"><span>{selected === null ? "그래프 위에 포인터를 올려 값을 읽으세요" : engineering(x[selected], mode === "time" ? "s" : "Hz")}</span>{selected !== null && traces.map(trace => <b key={trace.label} style={{ color: trace.color }}>{trace.label} <span>{yText(trace.values[selected])}</span></b>)}</div>
    <label className="el-sim-cursor-control"><span>커서 위치</span><input aria-label="파형 커서 위치" type="range" min={0} max={x.length - 1} value={selected ?? 0} onChange={event => onCursor(Number(event.target.value))} /></label>
  </div>;
}

export function SimulationPanel({ circuit, layout, definitions, probes, onPickProbe, onClearProbe, pickingChannel }: {
  circuit: Circuit; layout: CircuitLayout; definitions: ComponentDefinition[];
  probes: [SimulationProbe, SimulationProbe]; onPickProbe: (channel: Channel) => void; onClearProbe: (channel: Channel) => void; pickingChannel: Channel | null;
}) {
  const [config, setConfig] = useState<SimulationConfig>(() => defaultSimulationConfig(circuit));
  const [capture, setCapture] = useState<CapturedResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<ResultTab>("time");
  const [acMode, setAcMode] = useState<"gain" | "phase">("gain");
  const [cursor, setCursor] = useState<number | null>(null);
  const worker = useRef<Worker | null>(null), timer = useRef<ReturnType<typeof setTimeout> | null>(null), sequence = useRef(0);
  const nets = useMemo(() => netIds(circuit), [circuit]);
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
      if (nets.includes(previous.groundNetId) && nets.includes(previous.source.netId) && previous.supplies.every(supply => nets.includes(supply.netId))) return previous;
      return defaultSimulationConfig(circuit);
    });
  // A removed net invalidates the settings; ordinary value/placement edits keep them.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netsKey]);

  const updateSource = (patch: Partial<SimulationConfig["source"]>) => setConfig(previous => ({ ...previous, source: { ...previous.source, ...patch }, supplies: patch.netId ? previous.supplies.filter(supply => supply.netId !== patch.netId) : previous.supplies }));
  const updateConfig = (patch: Partial<SimulationConfig>) => setConfig(previous => ({ ...previous, ...patch }));
  const netName = (net: string) => circuit.netNames[net] && circuit.netNames[net] !== net ? `${circuit.netNames[net]} · ${net}` : net;
  const start = () => {
    stop(); setError(""); setNotice("");
    if (!config.groundNetId || !config.source.netId || config.groundNetId === config.source.netId) { setError("입력 신호와 기준 GND를 서로 다른 연결에서 선택해 주세요."); setRunning(false); return; }
    if (!probes.some(probe => probe.holeId && probe.netId)) { setError("CH1 또는 CH2를 눌러 연결된 빵판 구멍에 프로브를 지정해 주세요."); setRunning(false); return; }
    if (probes.some(probe => probe.holeId && (!probe.netId || !nets.includes(probe.netId)))) { setError("연결되지 않았거나 회로에서 사라진 프로브가 있습니다. 위치를 다시 선택해 주세요."); setRunning(false); return; }
    const numbers = [config.source.frequencyHz, config.source.amplitudePeak, config.source.offset, config.durationSeconds, config.sampleCount, config.acStartHz, config.acStopHz, config.acPoints, ...config.supplies.map(supply => supply.voltage)];
    if (numbers.some(value => !Number.isFinite(value))) { setError("빈 입력란을 포함해 모든 계산 조건에 올바른 숫자를 입력해 주세요."); setRunning(false); return; }
    if (config.durationSeconds <= 0 || config.source.frequencyHz <= 0 || config.source.amplitudePeak < 0 || config.acStartHz <= 0 || config.acStopHz <= config.acStartHz || !Number.isInteger(config.sampleCount) || config.sampleCount < 32 || config.sampleCount > 4096 || !Number.isInteger(config.acPoints) || config.acPoints < 2 || config.acPoints > 512) { setError("시간·주파수는 양수, 진폭은 0 이상이어야 합니다. 샘플은 32~4096개, 주파수 지점은 2~512개 정수로 설정해 주세요."); setRunning(false); return; }
    const requestId = ++sequence.current, runFingerprint = fingerprint;
    try {
      const instance = new Worker(new URL("../../lib/electronics/simulation.worker.ts", import.meta.url));
      worker.current = instance; setRunning(true); setCursor(null);
      const finish = () => { instance.terminate(); if (worker.current === instance) worker.current = null; if (timer.current) clearTimeout(timer.current); timer.current = null; setRunning(false); };
      instance.onmessage = (event: MessageEvent<SimulationWorkerResponse>) => {
        if (event.data.requestId !== requestId || sequence.current !== requestId || currentFingerprint.current !== runFingerprint || worker.current !== instance) return;
        finish();
        if (event.data.type === "error") { setError(event.data.message); return; }
        if (event.data.type === "result") { setCapture({ result: event.data.result, fingerprint: runFingerprint, config, probes: probes.map(probe => ({ ...probe })) as [SimulationProbe, SimulationProbe], names: { ...circuit.netNames } }); setNotice("현재 배선과 설정으로 계산했습니다."); }
      };
      instance.onerror = event => { if (worker.current !== instance) return; event.preventDefault(); finish(); setError("계산 작업을 시작하지 못했습니다. 페이지를 새로고침한 뒤 다시 실행해 주세요."); };
      instance.onmessageerror = () => { if (worker.current !== instance) return; finish(); setError("계산 결과를 읽지 못했습니다. 다시 실행해 주세요."); };
      timer.current = setTimeout(() => { if (worker.current !== instance) return; finish(); sequence.current += 1; setError("계산 시간이 20초를 넘겨 중단했습니다. 샘플 수를 줄이거나 회로 구성을 확인해 주세요."); }, 20000);
      const request: SimulationWorkerRequest = { type: "run", requestId, input: { circuit, definitions, layout, config } };
      instance.postMessage(request);
    } catch (failure) { stop(); setRunning(false); setError(failure instanceof Error ? failure.message : "이 브라우저에서 계산 작업을 시작하지 못했습니다."); }
  };
  const resultChannels = capture ? capture.probes.flatMap((probe, channel) => {
    const values = probe.netId ? capture.result.nodeVoltages[probe.netId] : undefined;
    return probe.holeId && probe.netId && values?.length === capture.result.time.length && values.every(Number.isFinite) ? [{ channel, probe, values, label: `CH${channel + 1} · ${capture.names[probe.netId] || probe.netId}`, color: CHANNEL_COLORS[channel] }] : [];
  }) : [];
  const traces: Trace[] = resultChannels.flatMap(channel => {
    if (!capture) return [];
    const values = tab === "time" ? channel.values : acMode === "gain" ? capture.result.ac.nodeGainMagnitude[channel.probe.netId!]?.map(value => 20 * Math.log10(Math.max(value, 1e-8))) : capture.result.ac.nodePhaseDegrees[channel.probe.netId!];
    return values?.length === (tab === "time" ? capture.result.time.length : capture.result.ac.frequenciesHz.length) && values.every(Number.isFinite) ? [{ label: channel.label, color: channel.color, values }] : [];
  });
  const missingChannels = capture?.probes.flatMap((probe, channel) => probe.holeId && !resultChannels.some(item => item.channel === channel) ? [`CH${channel + 1} · ${probe.netId || probe.holeId}`] : []) || [];
  const saveCsv = () => {
    if (!capture || stale || running) return;
    const csvCell = (value: string | number) => `"${String(value).replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    const matrix: (string | number)[][] = tab === "dc" ? [["kind", "id", "value", "unit"], ...Object.entries(capture.result.dc.nodeVoltages).map(([id, value]) => ["node_voltage", id, value, "V"]), ...Object.entries(capture.result.dc.componentCurrents).map(([id, value]) => ["component_current_pin1_to_pin2", id, value, "A"]), ...Object.entries(capture.result.dc.sourceCurrents).map(([id, value]) => ["source_current_node_to_source", id, value, "A"])] : tab === "ac" ? [["frequency_Hz", ...resultChannels.flatMap(channel => [`${channel.label}_gain_ratio`, `${channel.label}_phase_deg`])], ...capture.result.ac.frequenciesHz.map((frequency, index) => [frequency, ...resultChannels.flatMap(channel => [capture.result.ac.nodeGainMagnitude[channel.probe.netId!]?.[index] ?? "", capture.result.ac.nodePhaseDegrees[channel.probe.netId!]?.[index] ?? ""])])] : [["time_s", ...resultChannels.map(channel => `${channel.label}_V`)], ...capture.result.time.map((time, index) => [time, ...resultChannels.map(channel => channel.values[index])])];
    const contents = "\uFEFF" + matrix.map(row => row.map(value => typeof value === "number" ? String(value) : csvCell(value)).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `electronics-${tab}-${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="el-simulation" aria-label="파형 및 회로 시뮬레이션">
    <header className="el-sim-header"><div><span className="el-eyebrow">VIRTUAL INSTRUMENTS</span><h2>파형 · 계측</h2><p>빵판의 측정 지점을 고르고 회로 응답을 확인하세요.</p></div><span className={`el-sim-status ${stale ? "stale" : ""}`}>{running ? "계산 중" : stale ? "다시 계산 필요" : capture ? "계산 완료" : "실행 대기"}</span></header>
    <p className="el-sim-model-note">교육용 선형 모델 · 실제 소자 포화/대역폭/슬루율 미반영</p>
    <div className="el-sim-probes">{probes.map((probe, channel) => <div key={channel} className={`el-sim-probe ${pickingChannel === channel ? "picking" : ""}`} style={{ "--channel-color": CHANNEL_COLORS[channel] } as React.CSSProperties}><button onClick={() => onPickProbe(channel as Channel)} aria-pressed={pickingChannel === channel}><b>CH{channel + 1}</b><span><strong>{probe.holeId || "측정할 구멍 선택"}</strong><small>{pickingChannel === channel ? "빵판에서 구멍을 클릭하세요" : probe.netId ? netName(probe.netId) : probe.holeId ? "연결되지 않은 구멍" : "클릭하여 프로브 연결"}</small></span><span aria-hidden="true">↗</span></button>{probe.holeId && <button className="el-sim-probe-clear" aria-label={`CH${channel + 1} 프로브 해제`} onClick={() => onClearProbe(channel as Channel)}>×</button>}</div>)}</div>
    <div className="el-sim-controls"><div className="el-sim-control-heading"><h3>신호 발생기</h3><span>전압은 선택한 GND 기준</span></div>
      <div className="el-sim-fields"><label className="el-sim-field"><span>입력 연결</span><select value={config.source.netId} onChange={event => updateSource({ netId: event.target.value })}><option value="">입력 선택</option>{nets.map(net => <option key={net} value={net} disabled={net === config.groundNetId}>{netName(net)}</option>)}</select></label><label className="el-sim-field"><span>기준 GND</span><select value={config.groundNetId} onChange={event => updateConfig({ groundNetId: event.target.value, supplies: config.supplies.filter(supply => supply.netId !== event.target.value) })}><option value="">GND 선택</option>{nets.map(net => <option key={net} value={net} disabled={net === config.source.netId}>{netName(net)}</option>)}</select></label><label className="el-sim-field"><span>파형</span><select value={config.source.waveform} onChange={event => updateSource({ waveform: event.target.value as SimulationWaveform })}>{WAVEFORMS.map(wave => <option key={wave.id} value={wave.id}>{wave.label}</option>)}</select></label><NumericField label="주파수" unit="Hz" value={config.source.frequencyHz} onChange={frequencyHz => updateSource({ frequencyHz })} min={0.001} disabled={config.source.waveform === "dc"} /><NumericField label="진폭" unit="V peak" value={config.source.amplitudePeak} onChange={amplitudePeak => updateSource({ amplitudePeak })} min={0} disabled={config.source.waveform === "dc"} /><NumericField label={config.source.waveform === "dc" ? "DC 전압" : "DC 오프셋"} unit="V" value={config.source.offset} onChange={offset => updateSource({ offset })} /></div>
      <p className="el-sim-control-note">{config.source.waveform === "dc" ? "DC는 전압 값만 사용합니다. 주파수 응답은 별도의 단위 AC 입력으로 계산합니다." : `진폭은 중심에서 꼭대기까지의 값입니다. ${Number.isFinite(config.source.amplitudePeak) ? `${engineering(config.source.amplitudePeak * 2, "V")} p-p` : ""} · 초기 상태는 DC 오프셋의 정상 상태입니다.`}</p>
      <details className="el-sim-advanced"><summary>전원 · 시간 범위 · 계산 정밀도<span>{engineering(config.durationSeconds, "s")} · {config.sampleCount} 샘플</span></summary><div className="el-sim-fields"><NumericField label="표시 시간" unit="ms" value={config.durationSeconds * 1000} onChange={value => updateConfig({ durationSeconds: value / 1000 })} min={0.001} /><NumericField label="시간 샘플" value={config.sampleCount} onChange={sampleCount => updateConfig({ sampleCount })} min={32} max={4096} step={1} /><NumericField label="AC 시작" unit="Hz" value={config.acStartHz} onChange={acStartHz => updateConfig({ acStartHz })} min={0.001} /><NumericField label="AC 끝" unit="Hz" value={config.acStopHz} onChange={acStopHz => updateConfig({ acStopHz })} min={0.001} /><NumericField label="AC 지점" value={config.acPoints} onChange={acPoints => updateConfig({ acPoints })} min={2} max={512} step={1} /></div><div className="el-sim-supplies"><h4>추가 DC 전원</h4>{config.supplies.map((supply, index) => <div className="el-sim-supply" key={`${index}-${supply.netId}`}><label className="el-sim-field"><span>전원 연결 {index + 1}</span><select value={supply.netId} onChange={event => updateConfig({ supplies: config.supplies.map((item, at) => at === index ? { ...item, netId: event.target.value } : item) })}>{nets.filter(net => net !== config.groundNetId && net !== config.source.netId).map(net => <option key={net} value={net} disabled={config.supplies.some((item, at) => at !== index && item.netId === net)}>{netName(net)}</option>)}</select></label><NumericField label="전압" unit="V" value={supply.voltage} onChange={voltage => updateConfig({ supplies: config.supplies.map((item, at) => at === index ? { ...item, voltage } : item) })} /><button className="el-text-button" onClick={() => updateConfig({ supplies: config.supplies.filter((_, at) => at !== index) })} aria-label={`${supply.netId} 전원 제거`}>제거</button></div>)}<button className="el-button el-small" onClick={() => { const netId = nets.find(net => net !== config.source.netId && net !== config.groundNetId && !config.supplies.some(supply => supply.netId === net)); if (netId) updateConfig({ supplies: [...config.supplies, { netId, voltage: 0 }] }); }} disabled={!nets.some(net => net !== config.source.netId && net !== config.groundNetId && !config.supplies.some(supply => supply.netId === net))}>+ DC 전원</button><p>기본값은 회로의 전원 표기를 참고합니다. 실제 실험의 전압과 비교해 수정하세요.</p></div></details>
    </div>
    <div className="el-sim-runbar"><span>지원: 저항 · 커패시터 · UA741 선형 모델</span>{running ? <button className="el-button" onClick={() => { stop(); setRunning(false); setNotice("계산을 취소했습니다."); }}>계산 취소</button> : <button className="el-button el-primary" onClick={start}>시뮬레이션 실행 <span aria-hidden="true">↗</span></button>}</div>
    {error && <div className="el-sim-message error" role="alert"><b>계산을 완료하지 못했습니다</b><p>{error}</p><small>지원하지 않는 소자는 결과에서 생략하지 않습니다. 지원 모델과 연결 상태를 확인해 주세요.</small></div>}
    {notice && !error && <p className="el-sim-notice" role="status">{notice}</p>}
    {stale && <div className="el-sim-message stale" role="status"><b>이전 조건의 결과입니다</b><p>회로·배선·프로브 또는 설정이 변경되었습니다. 다시 실행하면 현재 상태로 갱신됩니다.</p></div>}
    <div className={`el-sim-results ${stale ? "is-stale" : ""}`}><div className="el-sim-result-toolbar"><div className="el-sim-tabs" role="tablist" aria-label="시뮬레이션 결과">{([{ id: "time", name: "시간 파형" }, { id: "ac", name: "주파수 응답" }, { id: "dc", name: "DC 동작점" }] as const).map(item => <button role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} key={item.id} onClick={() => { setTab(item.id); setCursor(null); }}>{item.name}</button>)}</div><button className="el-button el-small" disabled={!capture || stale || running} onClick={saveCsv}>CSV 저장</button></div>
      {!capture ? <div className="el-sim-empty"><span aria-hidden="true">∿</span><h3>{running ? "회로 응답을 계산하고 있습니다" : "아직 계산한 파형이 없습니다"}</h3><p>{running ? "계산 중에도 빵판을 살펴볼 수 있습니다." : "프로브와 입력을 설정한 뒤 시뮬레이션을 실행하세요."}</p></div> : <>
        <div className="el-sim-result-context"><span>공통 기준: {capture.names[capture.config.groundNetId] || capture.config.groundNetId}</span><span>입력: {capture.names[capture.config.source.netId] || capture.config.source.netId}</span>{resultChannels.map(channel => <span key={channel.channel} style={{ color: channel.color }}><b>CH{channel.channel + 1}</b> {channel.probe.holeId} · {channel.probe.netId}</span>)}</div>
        {missingChannels.length > 0 && <p className="el-sim-missing">{missingChannels.join(", ")}은 계산 모델에 포함되지 않은 연결입니다. 다른 측정 지점을 선택하세요.</p>}
        {tab !== "dc" ? <>
          {tab === "ac" && <div className="el-sim-ac-toolbar"><p>입력 대비 전압비 · 로그 주파수 축 · 0 이득은 −160 dB로 표시</p><div><button className={acMode === "gain" ? "active" : ""} onClick={() => { setAcMode("gain"); setCursor(null); }}>이득</button><button className={acMode === "phase" ? "active" : ""} onClick={() => { setAcMode("phase"); setCursor(null); }}>위상</button></div></div>}
          <WavePlot x={tab === "time" ? capture.result.time : capture.result.ac.frequenciesHz} traces={traces} mode={tab === "time" ? "time" : acMode} cursor={cursor} onCursor={setCursor} />
          {tab === "time" && <div className="el-sim-stats">{resultChannels.map(channel => { const min = Math.min(...channel.values), max = Math.max(...channel.values), rms = Math.sqrt(channel.values.reduce((sum, value) => sum + value * value, 0) / channel.values.length); return <div key={channel.channel}><b style={{ color: channel.color }}>CH{channel.channel + 1}</b><span>최댓값 <strong>{engineering(max, "V")}</strong></span><span>최솟값 <strong>{engineering(min, "V")}</strong></span><span>Vpp <strong>{engineering(max - min, "V")}</strong></span><span>RMS <strong>{engineering(rms, "V")}</strong></span></div>; })}<p>표시한 시간 구간 전체의 표본 기준 · 초기 과도 응답 포함</p></div>}
        </> : <div className="el-sim-dc-grid">
          <div><h3>노드 전압</h3><table><thead><tr><th>연결</th><th>전압</th></tr></thead><tbody>{Object.entries(capture.result.dc.nodeVoltages).map(([net, voltage]) => <tr key={net}><td>{capture.names[net] || net}</td><td>{engineering(voltage, "V")}</td></tr>)}</tbody></table></div>
          <div><h3>소자 전류</h3><table><thead><tr><th>소자</th><th>전류</th></tr></thead><tbody>{Object.entries(capture.result.dc.componentCurrents).map(([id, current]) => <tr key={id}><td>{id}</td><td>{engineering(current, "A")}</td></tr>)}</tbody></table><p>1번 핀 → 2번 핀이 양의 방향입니다. 커패시터의 DC 정상 상태 전류는 0입니다.</p></div>
          <div><h3>이상 전압원 전류</h3><table><thead><tr><th>전원 연결</th><th>전류</th></tr></thead><tbody>{Object.entries(capture.result.dc.sourceCurrents).map(([net, current]) => <tr key={net}><td>{capture.names[net] || net}</td><td>{engineering(current, "A")}</td></tr>)}</tbody></table><p>양수: 연결 노드에서 이상 전압원으로 흐르는 방향. DC 동작점은 입력의 DC 오프셋 기준입니다.</p></div>
        </div>}
        {capture.result.warnings.length > 0 && <details className="el-sim-warnings" open><summary>모델 및 계산 안내 <span>{capture.result.warnings.length}</span></summary><ul>{capture.result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul></details>}
      </>}
    </div>
  </section>;
}
