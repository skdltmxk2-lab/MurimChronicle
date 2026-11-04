"use client";

import { memo, useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { scopeAutoVolts, scopeCoupledValues, scopeFormat, scopeMeasurements, scopePath, scopeTimeInfo, scopeValueAt, scopeWindow } from "@/lib/electronics/simulation-scope";
import type { ScopeTrace, ScopeTrigger } from "@/lib/electronics/simulation-scope";
import "./oscilloscope.css";

export type OscilloscopeProps = { time: number[]; traces: ScopeTrace[]; captureKey: string; stale: boolean };
type ChannelSettings = { visible: boolean; coupling: "AC" | "DC"; autoScale: boolean; voltsPerDivision: number; offset: number };
const mean = (values: number[]) => { const valid = values.filter(Number.isFinite); return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0; };
const defaults = (trace?: ScopeTrace): ChannelSettings => ({ visible: true, coupling: "DC", autoScale: true, voltsPerDivision: 1, offset: trace ? -mean(trace.values) : 0 });
const positiveNumber = (text: string) => text.trim() === "" ? NaN : Number(text);
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

const ScopeGrid = memo(function ScopeGrid({ width, height }: { width: number; height: number }) {
  const left = 52, top = 24, w = width - 70, h = height - 58;
  return <g className="el-scope-grid">
    {Array.from({ length: 11 }, (_, i) => <line key={`v${i}`} x1={left + w * i / 10} x2={left + w * i / 10} y1={top} y2={top + h} className={i === 5 ? "is-center" : ""} />)}
    {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={left} x2={left + w} y1={top + h * i / 8} y2={top + h * i / 8} className={i === 4 ? "is-center" : ""} />)}
  </g>;
});

/** A view of recorded samples: controls never alter the solver or invent new acquisition data. */
export function Oscilloscope({ time, traces, captureKey, stale }: OscilloscopeProps) {
  const channels = useMemo(() => traces.slice(0, 3), [traces]);
  const [settings, setSettings] = useState<ChannelSettings[]>(() => channels.map(defaults));
  const [timeDivision, setTimeDivision] = useState<number | null>(null);
  const [position, setPosition] = useState(0);
  const [trigger, setTrigger] = useState<ScopeTrigger>(() => ({ source: 0, slope: "rising", level: channels[0] ? mean(channels[0].values) : 0, mode: "auto" }));
  const [cursors, setCursors] = useState<[number, number]>([0, 0]);
  const [activeCursor, setActiveCursor] = useState<0 | 1>(0);
  const [width, setWidth] = useState(760);
  const plotRef = useRef<HTMLDivElement>(null), drag = useRef<number | null>(null);
  const clipId = `scope-${useId().replace(/[^A-Za-z0-9_-]/g, "")}`;
  const info = useMemo(() => scopeTimeInfo(time), [time]);
  const channelSettings = useMemo(() => channels.map((trace, i) => settings[i] ?? defaults(trace)), [channels, settings]);
  const coupled = useMemo(() => channels.map((trace, i) => ({ ...trace, values: scopeCoupledValues(trace.values, settings[i]?.coupling ?? "DC") })), [channels, settings]);
  const measurements = useMemo(() => coupled.map(trace => scopeMeasurements(time, trace.values)), [time, coupled]);
  const effectiveTrigger = useMemo(() => trigger.source < channels.length ? trigger : { ...trigger, source: 0 }, [trigger, channels.length]);
  const window = useMemo(() => scopeWindow(time, coupled, timeDivision, position, effectiveTrigger), [time, coupled, timeDivision, position, effectiveTrigger]);
  const scales = useMemo(() => coupled.map((trace, i) => channelSettings[i].autoScale ? scopeAutoVolts(trace.values, channelSettings[i].offset) : channelSettings[i].voltsPerDivision), [coupled, channelSettings]);
  const settingsValid = channelSettings.every((setting, i) => Number.isFinite(setting.offset) && Number.isFinite(scales[i]) && scales[i] > 0);
  const showTrace = window.showTrace && settingsValid;
  const height = 330, left = 52, top = 24, plotWidth = width - 70, plotHeight = height - 58;
  const paths = useMemo(() => coupled.map((trace, i) => scopePath(time, trace.values, window, scales[i], channelSettings[i].offset, width, height)), [time, coupled, window, scales, channelSettings, width]);
  const x = (value: number) => left + (value - window.start) / (window.end - window.start) * plotWidth;
  const y = (value: number, channel: number) => top + plotHeight / 2 - (value + channelSettings[channel].offset) / scales[channel] * plotHeight / 8;
  const deltaTime = cursors[1] - cursors[0];
  const timeChoices = useMemo(() => {
    if (!info) return [];
    const values: number[] = [];
    for (let exponent = -12; exponent <= 2; exponent++) for (const multiplier of [1, 2, 5]) {
      const value = multiplier * 10 ** exponent;
      if (value * 10 >= info.step * 2 * 0.999 && value * 10 <= info.duration * 1.001) values.push(value);
    }
    if (timeDivision !== null && !values.includes(timeDivision)) values.push(timeDivision);
    return values.sort((a, b) => a - b);
  }, [info, timeDivision]);

  useEffect(() => {
    if (!plotRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => { const measured = entries[0]?.contentRect.width; if (measured > 0) setWidth(Math.max(280, Math.round(measured))); });
    observer.observe(plotRef.current); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (info) setCursors([info.start + info.duration * 0.25, info.start + info.duration * 0.75]);
    drag.current = null;
  }, [captureKey, info]);
  useEffect(() => {
    setCursors(previous => {
      const next: [number, number] = [clamp(previous[0], window.start, window.end), clamp(previous[1], window.start, window.end)];
      return next[0] === previous[0] && next[1] === previous[1] ? previous : next;
    });
  }, [window.start, window.end]);

  const updateChannel = (index: number, patch: Partial<ChannelSettings>) => setSettings(previous => Array.from({ length: channels.length }, (_, i) => ({ ...(previous[i] ?? defaults(channels[i])), ...(i === index ? patch : {}) })));
  const updateCursor = (value: number, index = activeCursor) => setCursors(previous => { const next: [number, number] = [...previous]; next[index] = clamp(value, window.start, window.end); return next; });
  const pointerCursor = (event: PointerEvent<SVGSVGElement>) => {
    if (!showTrace) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = clamp(((event.clientX - rect.left) / rect.width * width - left) / plotWidth, 0, 1);
    updateCursor(window.start + ratio * (window.end - window.start));
  };
  const stopDrag = (event: PointerEvent<SVGSVGElement>) => { if (drag.current === event.pointerId) { drag.current = null; if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } };
  const autoSet = () => {
    setSettings(channels.map(defaults)); setTimeDivision(null); setPosition(0);
    setTrigger({ source: 0, slope: "rising", level: channels[0] ? mean(channels[0].values) : 0, mode: "auto" });
    if (info) setCursors([info.start + info.duration * 0.25, info.start + info.duration * 0.75]);
  };
  const status = !settingsValid || window.status === "invalid" ? "설정·표본 확인" : window.status === "triggered" ? "Triggered" : window.status === "waiting" ? "트리거 없음" : "Auto · 교차점 없음";
  return <section className={`el-scope ${stale ? "is-stale" : ""}`} aria-label="가상 오실로스코프">
    <header className="el-scope-heading"><div><span className="el-scope-eyebrow">OSCILLOSCOPE</span><h4>시간 파형</h4></div><div className="el-scope-heading-actions">{stale && <span className="el-scope-stale">이전 조건의 캡처</span>}<button className="el-button el-small" onClick={autoSet}>자동 맞춤</button></div></header>
    <div className="el-scope-display" ref={plotRef}>
      <div className="el-scope-display-bar"><span role="status">{status}</span><span>{scopeFormat(window.secondsPerDivision, "s")}/div · 10 × 8 div</span></div>
      <svg className="el-scope-screen" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`오실로스코프 시간 화면: ${status}`} onPointerDown={event => { if (event.button !== 0 || !showTrace) return; drag.current = event.pointerId; event.currentTarget.setPointerCapture?.(event.pointerId); pointerCursor(event); }} onPointerMove={event => { if (drag.current === event.pointerId) pointerCursor(event); }} onPointerUp={stopDrag} onPointerCancel={stopDrag} onLostPointerCapture={() => { drag.current = null; }}>
        <defs><clipPath id={clipId}><rect x={left} y={top} width={plotWidth} height={plotHeight} /></clipPath></defs>
        <ScopeGrid width={width} height={height} />
        {[0, 0.5, 1].map(ratio => <text key={ratio} className="el-scope-axis" x={left + plotWidth * ratio} y={height - 12} textAnchor="middle">{scopeFormat(window.start + (window.end - window.start) * ratio, "s")}</text>)}
        <text className="el-scope-axis" x={left} y={14}>전압 · 채널별 V/div</text>
        {showTrace && <g clipPath={`url(#${clipId})`}>
          {coupled.map((trace, i) => channelSettings[i].visible && <path key={`trace-${i}`} data-scope-trace={i} d={paths[i]} fill="none" stroke={trace.color} strokeWidth={1.7} vectorEffect="non-scaling-stroke" />)}
          {window.triggerTime !== undefined && effectiveTrigger.source < channels.length && <g className="el-scope-trigger-mark"><line x1={x(window.triggerTime)} x2={x(window.triggerTime)} y1={top} y2={top + plotHeight} /><line x1={left} x2={left + plotWidth} y1={y(trigger.level, effectiveTrigger.source)} y2={y(trigger.level, effectiveTrigger.source)} /><text x={x(window.triggerTime) + 4} y={top + 13}>T</text></g>}
          {cursors.map((value, i) => <g className={`el-scope-cursor ${activeCursor === i ? "is-active" : ""}`} key={i}><line x1={x(value)} x2={x(value)} y1={top} y2={top + plotHeight} /><text x={x(value) + 4} y={top + 28}>{i ? "B" : "A"}</text></g>)}
        </g>}
        {!showTrace && <text className="el-scope-empty" x={left + plotWidth / 2} y={top + plotHeight / 2} textAnchor="middle">{window.status === "waiting" && settingsValid ? "지정한 레벨·방향의 트리거가 없습니다" : "유효한 시간 표본과 스케일을 확인하세요"}</text>}
      </svg>
      <div className="el-scope-legend">{coupled.map((trace, i) => <span key={i} className={channelSettings[i].visible ? "" : "is-hidden"} style={{ color: trace.color }}><b>{trace.label}</b> {scopeFormat(scales[i], "V")}/div · {channelSettings[i].coupling}{channelSettings[i].offset !== 0 && ` · 위치 ${scopeFormat(channelSettings[i].offset, "V")}`}</span>)}</div>
    </div>

    <div className="el-scope-channel-grid">{channels.map((trace, i) => <fieldset className="el-scope-channel" key={i} style={{ "--scope-channel": trace.color } as CSSProperties}><legend>{trace.label}</legend>
      <div className="el-scope-channel-toggles"><label><input type="checkbox" aria-label={`${trace.label} 표시`} checked={channelSettings[i].visible} onChange={event => updateChannel(i, { visible: event.target.checked })} />표시</label><label>커플링<select aria-label={`${trace.label} 커플링`} value={channelSettings[i].coupling} onChange={event => updateChannel(i, { coupling: event.target.value as "AC" | "DC", offset: event.target.value === "AC" ? 0 : -mean(trace.values) })}><option value="DC">DC</option><option value="AC">AC</option></select></label><label><input type="checkbox" aria-label={`${trace.label} 자동 V/div`} checked={channelSettings[i].autoScale} onChange={event => updateChannel(i, { autoScale: event.target.checked, voltsPerDivision: scales[i] })} />자동 V/div</label></div>
      <div className="el-scope-fields"><label><span>V/div</span><input aria-label={`${trace.label} V/div`} type="number" min={1e-12} step="any" disabled={channelSettings[i].autoScale} value={Number.isFinite(scales[i]) ? scales[i] : ""} onChange={event => updateChannel(i, { voltsPerDivision: positiveNumber(event.target.value) })} /></label><label><span>수직 위치 · V</span><input aria-label={`${trace.label} 수직 위치`} type="number" step="any" value={Number.isFinite(channelSettings[i].offset) ? channelSettings[i].offset : ""} onChange={event => updateChannel(i, { offset: positiveNumber(event.target.value) })} /></label></div>
    </fieldset>)}</div>

    <div className="el-scope-control-grid"><fieldset><legend>수평축</legend><div className="el-scope-fields"><label><span>시간축 · s/div</span><select aria-label="시간축 s/div" value={timeDivision ?? "auto"} onChange={event => setTimeDivision(event.target.value === "auto" ? null : Number(event.target.value))}><option value="auto">전체 캡처 · {scopeFormat((info?.duration ?? 1) / 10, "s")}/div</option>{timeChoices.map(value => <option key={value} value={value}>{scopeFormat(value, "s")}/div</option>)}</select></label></div><label className="el-scope-range"><span>시간 위치 · 캡처 내부</span><input aria-label="시간 위치" type="range" min={0} max={1000} value={Math.round(position * 1000)} disabled={!info || window.end - window.start >= info.duration * 0.999999} onChange={event => setPosition(Number(event.target.value) / 1000)} /></label><small>트리거를 왼쪽 20%에 맞추되 캡처 경계에서는 제한됩니다.</small></fieldset>
      <fieldset><legend>트리거</legend><div className="el-scope-fields"><label><span>소스</span><select aria-label="트리거 소스" value={effectiveTrigger.source} onChange={event => setTrigger(previous => ({ ...previous, source: Number(event.target.value) }))}>{channels.map((trace, i) => <option key={i} value={i}>{trace.label}</option>)}</select></label><label><span>방향</span><select aria-label="트리거 방향" value={trigger.slope} onChange={event => setTrigger(previous => ({ ...previous, slope: event.target.value as "rising" | "falling" }))}><option value="rising">상승 ↗</option><option value="falling">하강 ↘</option></select></label><label><span>레벨 · V</span><input aria-label="트리거 레벨" type="number" step="any" value={Number.isFinite(trigger.level) ? trigger.level : ""} onChange={event => setTrigger(previous => ({ ...previous, level: positiveNumber(event.target.value) }))} /></label><label><span>모드</span><select aria-label="트리거 모드" value={trigger.mode} onChange={event => setTrigger(previous => ({ ...previous, mode: event.target.value as "auto" | "normal" }))}><option value="auto">Auto</option><option value="normal">Normal</option></select></label></div><small>Normal에서 교차점이 없으면 파형을 표시하지 않습니다.</small></fieldset>
    </div>

    <details className="el-scope-cursors" open><summary>커서 A / B <span>Δt {scopeFormat(deltaTime, "s")} · 1/|Δt| {scopeFormat(Math.abs(deltaTime) > 0 ? 1 / Math.abs(deltaTime) : undefined, "Hz")}</span></summary><div className="el-scope-cursor-controls">{cursors.map((value, i) => <label key={i}><span><input type="radio" name={`${clipId}-cursor`} aria-label={`커서 ${i ? "B" : "A"} 선택`} checked={activeCursor === i} onChange={() => setActiveCursor(i as 0 | 1)} />{i ? "B" : "A"} · {scopeFormat(value, "s")}</span><input type="range" aria-label={`커서 ${i ? "B" : "A"} 위치`} min={window.start} max={window.end} step={(window.end - window.start) / 2000} value={value} disabled={!showTrace} onChange={event => updateCursor(Number(event.target.value), i as 0 | 1)} /></label>)}</div><div className="el-scope-cursor-values">{coupled.map((trace, i) => { const a = scopeValueAt(time, trace.values, cursors[0]), b = scopeValueAt(time, trace.values, cursors[1]); return <p key={i}><b style={{ color: trace.color }}>{trace.label}</b><span>A {scopeFormat(a, "V")}</span><span>B {scopeFormat(b, "V")}</span><strong>ΔV {scopeFormat(a !== undefined && b !== undefined ? b - a : undefined, "V")}</strong></p>; })}</div><small>선택한 커서를 화면에서 클릭·드래그하거나 슬라이더로 이동합니다. 1/|Δt|는 커서 간격의 역수이며 자동 주파수 판정이 아닙니다.</small></details>

    <div className="el-scope-measurements"><h5>전체 캡처 자동 측정 <span>커플링 적용 · 화면 확대/수직 위치와 독립</span></h5><div className="el-scope-table-scroll"><table><thead><tr><th>채널</th><th>Vpp</th><th>평균</th><th>RMS</th><th>반복 주파수</th><th>Duty</th></tr></thead><tbody>{measurements.map((measurement, i) => <tr key={i}><th style={{ color: channels[i].color }}>{channels[i].label}</th><td>{scopeFormat(measurement.vpp, "V")}</td><td>{scopeFormat(measurement.mean, "V")}</td><td>{scopeFormat(measurement.rms, "V")}</td><td title={measurement.periodReason}>{scopeFormat(measurement.frequency, "Hz")}</td><td title={measurement.periodReason}>{measurement.duty === undefined ? "—" : `${(measurement.duty * 100).toFixed(1)}%`}</td></tr>)}</tbody></table></div>{measurements.map((measurement, i) => measurement.frequency === undefined && <p className="el-scope-measurement-note" key={i}>{channels[i].label}: {measurement.periodReason}{!measurement.complete && " 전압 통계는 유효한 표본만 사용합니다."}</p>)}</div>
    <p className="el-scope-note">저장된 계산 표본을 관측합니다. AC 커플링은 캡처의 평균을 빼는 교육용 근사로, 실물 입력 커패시터의 차단주파수·과도응답은 재현하지 않습니다. 자동 주파수는 3주기 이상 반복 여부를 확인한 추정값이며 혼합·변조·과도 파형은 —로 표시할 수 있습니다.</p>
  </section>;
}

export default Oscilloscope;
