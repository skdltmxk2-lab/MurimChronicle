"use client";

import { useEffect, useMemo, useState } from "react";
import { measureMultimeter, type MultimeterSettings } from "@/lib/electronics/simulation-instruments";
import { createSimulationLayoutIndex } from "@/lib/electronics/simulation-layout";
import type { Circuit, CircuitLayout, ComponentDefinition } from "@/lib/electronics/types";
import type { SimulationConfig, SimulationResult } from "@/lib/electronics/simulation-types";
import "./multimeter.css";

const MODES: { id: MultimeterSettings["mode"]; label: string; symbol: string }[] = [
  { id: "dc-voltage", label: "DC 전압", symbol: "V ⎓" }, { id: "ac-voltage", label: "AC 전압", symbol: "V ∿" },
  { id: "dc-current", label: "DC 전류", symbol: "A ⎓" }, { id: "ac-current", label: "AC 전류", symbol: "A ∿" },
  { id: "resistance", label: "저항", symbol: "Ω" }, { id: "continuity", label: "도통", symbol: "·)))" }, { id: "diode", label: "다이오드", symbol: "▷|" },
];
const OFFLINE = new Set(["resistance", "continuity", "diode"]);
function formatted(value: number, unit: string) {
  const abs = Math.abs(value);
  const [scale, prefix] = abs >= 1e6 ? [1e6, "M"] : abs >= 1e3 ? [1e3, "k"] : abs > 0 && abs < 1e-3 ? [1e-6, "µ"] : abs > 0 && abs < 1 ? [1e-3, "m"] : [1, ""];
  return { value: Number((value / scale).toPrecision(6)).toString(), unit: `${prefix}${unit}` };
}

export function Multimeter({ circuit, layout, definitions, config, result, stale, captureKey, probeNets }: {
  circuit: Circuit; layout: CircuitLayout; definitions: ComponentDefinition[]; config: SimulationConfig;
  result?: SimulationResult; stale: boolean; captureKey: string; probeNets?: [string | null, string | null];
}) {
  const nets = useMemo(() => [...new Set(circuit.components.flatMap(item => Object.values(item.pinNets)))], [circuit]);
  const [settings, setSettings] = useState<MultimeterSettings>(() => ({ mode: "dc-voltage", power: "on", redNetId: nets.includes("OUT") ? "OUT" : nets[0], blackNetId: config.groundNetId }));
  const [range, setRange] = useState(0);
  const [windowPart, setWindowPart] = useState("full");
  const [held, setHeld] = useState<{ key: string; text: string; unit: string } | null>(null);
  const offline = OFFLINE.has(settings.mode), current = settings.mode.includes("current");
  const selectedComponent = circuit.components.find(item => item.id === settings.branch?.componentId);
  const selectedDefinition = definitions.find(item => item.id === selectedComponent?.definitionId);
  const branches = circuit.components.filter(item => ["resistor", "capacitor", "electrolytic", "transistor", "mosfet", "diode"].includes(definitions.find(def => def.id === item.definitionId)?.kind || ""));
  const apply = (patch: Partial<MultimeterSettings>) => { setSettings(previous => ({ ...previous, ...patch })); setHeld(null); };
  const settingsForReading = useMemo(() => ({ ...settings,
    ...(result && !offline && windowPart !== "full" ? { startTimeSeconds: result.time[result.time.length - 1] * (windowPart === "last-half" ? 0.5 : 0.8), endTimeSeconds: result.time[result.time.length - 1] } : {}),
  }), [settings, result, offline, windowPart]);
  const wiringError = useMemo(() => { try { createSimulationLayoutIndex(circuit, definitions, layout); return ""; } catch (error) { return error instanceof Error ? error.message : "현재 배선 검사를 통과해야 측정할 수 있습니다."; } }, [circuit, definitions, layout]);
  const reading = useMemo(() => {
    if (wiringError || (!offline && (!result || stale))) return null;
    try { return measureMultimeter({ circuit, definitions, config, result, settings: settingsForReading }); }
    catch (error) { return { status: "invalid" as const, value: null, message: error instanceof Error ? error.message : "측정 설정을 확인하세요.", warnings: [] as string[], continuity: undefined }; }
  }, [circuit, definitions, config, result, settingsForReading, wiringError, offline, stale]);
  const readingKey = JSON.stringify({ circuit, config, placements: layout.placements, jumpers: layout.jumpers, terminals: layout.terminals, board: layout.board.options, settings: settingsForReading, range, captureKey });
  useEffect(() => setHeld(null), [readingKey, stale, wiringError]);
  const unit = settings.mode.includes("current") ? "A" : settings.mode === "resistance" || settings.mode === "continuity" ? "Ω" : "V";
  const overRange = reading?.value !== null && reading?.value !== undefined && range > 0 && Math.abs(reading.value) > range;
  const display = reading?.status === "ok" && reading.value !== null && !overRange ? formatted(reading.value, unit) : { value: overRange || reading?.status === "open" ? "OL" : "—", unit };
  const heldDisplay = reading?.status === "ok" && held?.key === readingKey ? held : null;
  const rangeOptions = unit === "Ω" ? [200, 2000, 20000, 200000, 2000000, 20000000] : unit === "A" ? [0.002, 0.02, 0.2, 2, 10] : [0.2, 2, 20, 200, 1000];
  const modeLabel = MODES.find(mode => mode.id === settings.mode)!;
  return <section className="el-meter" aria-label="가상 멀티미터">
    <header><div><span className="el-eyebrow">DIGITAL MULTIMETER</span><h3>멀티미터</h3></div><span className="el-mini-tag">{offline ? "무전원 시험" : "회로 응답 측정"}</span></header>
    <div className="el-meter-modes" role="group" aria-label="멀티미터 측정 모드">{MODES.map(mode => <button key={mode.id} aria-pressed={settings.mode === mode.id} onClick={() => { const part = branches[0], def = definitions.find(item => item.id === part?.definitionId); apply({ mode: mode.id, power: OFFLINE.has(mode.id) ? "off" : "on", branch: settings.branch || (part && def ? { componentId: part.id, terminal: def.pins[0].label } : undefined) }); setRange(0); }}><b>{mode.symbol}</b><span>{mode.label}</span></button>)}</div>
    <div className={`el-meter-display ${overRange ? "over-range" : ""}`} role="status" aria-label="멀티미터 측정값"><div><span>{modeLabel.label}{settings.mode.startsWith("ac") ? " · TRUE RMS" : ""}</span><span>{heldDisplay ? "HOLD" : range ? "MANUAL RANGE" : "AUTO RANGE"}</span></div><p><strong>{heldDisplay?.text ?? display.value}</strong><span>{heldDisplay?.unit ?? display.unit}</span></p><small>{reading?.continuity === true ? "● 도통" : overRange ? "선택한 표시 범위를 넘었습니다" : offline ? "독립 시험 전류를 인가한 가상 측정" : windowPart === "full" ? "전체 기록 구간" : windowPart === "last-half" ? "기록 후반 50%" : "기록 후반 20%"}</small></div>
    <div className="el-meter-fields">
      {current ? <><label className="el-sim-field"><span>전류 측정 소자</span><select value={settings.branch?.componentId || ""} onChange={event => { const part = branches.find(item => item.id === event.target.value), def = definitions.find(item => item.id === part?.definitionId); if (part && def) apply({ branch: { componentId: part.id, terminal: def.pins[0].label } }); }}><option value="">소자 선택</option>{branches.map(item => <option key={item.id} value={item.id}>{item.id} · {item.value}</option>)}</select></label><label className="el-sim-field"><span>전류 유입 단자</span><select value={settings.branch?.terminal || ""} onChange={event => apply({ branch: { componentId: settings.branch!.componentId, terminal: event.target.value } })}>{selectedDefinition?.pins.map(pin => <option key={pin.id} value={pin.label}>{pin.label} · 핀 {pin.id}</option>)}</select></label></> : <>{(["redNetId", "blackNetId"] as const).map(key => <label key={key} className="el-sim-field"><span>{key === "redNetId" ? "빨강 프로브 (+)" : "검정 프로브 (COM)"}</span><select value={settings[key] || ""} onChange={event => apply({ [key]: event.target.value })}><option value="">측정 연결 선택</option>{nets.map(net => <option key={net} value={net}>{circuit.netNames[net] || net}</option>)}</select></label>)}</>}
      <label className="el-sim-field"><span>측정 범위</span><select value={range} onChange={event => { setRange(Number(event.target.value)); setHeld(null); }}><option value={0}>자동 범위</option>{rangeOptions.map(value => { const label = formatted(value, unit); return <option key={value} value={value}>{label.value} {label.unit}</option>; })}</select></label>
      {!offline && <label className="el-sim-field"><span>측정 시간 구간</span><select value={windowPart} onChange={event => { setWindowPart(event.target.value); setHeld(null); }}><option value="full">전체 구간</option><option value="last-half">후반 50%</option><option value="last-fifth">후반 20%</option></select></label>}
      {settings.mode === "continuity" && <label className="el-sim-field"><span>도통 기준 (Ω)</span><input type="number" min={0} max={1000} value={settings.continuityThresholdOhms ?? 50} onChange={event => apply({ continuityThresholdOhms: event.target.value === "" ? NaN : Number(event.target.value) })} /></label>}
    </div>
    {!current && probeNets && <button className="el-text-button" disabled={!probeNets[0] || !probeNets[1]} onClick={() => apply({ redNetId: probeNets[0]!, blackNetId: probeNets[1]! })}>빵판의 CH1 → 빨강 · CH2 → COM으로 측정</button>}
    <div className="el-meter-actions"><button className="el-button el-small" aria-pressed={Boolean(heldDisplay)} disabled={reading?.status !== "ok" || overRange} onClick={() => setHeld(heldDisplay ? null : { key: readingKey, text: display.value, unit: display.unit })}>{heldDisplay ? "HOLD 해제" : "HOLD"}</button><p>{current ? "선택한 단자로 들어가는 전류가 양수입니다. 회로를 끊지 않는 가상 가지 전류 프로브입니다." : "표시값은 빨강 프로브에서 검정 프로브를 뺀 값입니다."}</p></div>
    {wiringError ? <p className="el-meter-message" role="alert">{wiringError}</p> : !offline && (!result || stale) ? <p className="el-meter-message" role="status">{stale ? "회로 조건이 변경되었습니다. 다시 실행한 후 측정하세요." : "시뮬레이션을 실행하면 회로 응답을 측정합니다."}</p> : reading && <p className="el-meter-message" role={reading.status === "invalid" ? "alert" : "status"}>{reading.message}</p>}
    {offline && <p className="el-meter-note">전원과 신호원을 제거하고 커패시터를 개방한 시험 모델입니다. 무전원 선택은 실제 장비의 전원을 제어하지 않습니다.</p>}
    {reading?.warnings.length ? <details className="el-meter-notes"><summary>측정 모델 안내</summary><ul>{reading.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></details> : null}
  </section>;
}
