"use client";

import { useMemo } from "react";
import type { SimulationSource, SimulationWaveform } from "@/lib/electronics/simulation-types";
import { sourceVoltage, sourceSamplingLimits, SOURCE_DEFAULTS } from "@/lib/electronics/simulation-source";

export type FunctionGeneratorProps = {
  source: SimulationSource;
  onChange: (patch: Partial<SimulationSource>) => void;
  label?: string;
  idPrefix?: string;
};
const WAVEFORMS: { id: SimulationWaveform; label: string }[] = [
  { id: "sine", label: "사인파" }, { id: "square", label: "사각파" }, { id: "triangle", label: "삼각파" },
  { id: "pulse", label: "펄스" }, { id: "sawtooth", label: "톱니파" }, { id: "am", label: "AM 진폭 변조" }, { id: "dc", label: "DC" },
];
function NumericField({ label, value, onChange, unit, min, max, disabled = false }: {
  label: string; value: number; onChange: (value: number) => void; unit: string; min?: number; max?: number; disabled?: boolean;
}) {
  return <label className="el-sim-field"><span>{label}<small>{unit}</small></span><input type="number" value={Number.isFinite(value) ? value : ""} onChange={event => onChange(event.target.value === "" ? NaN : Number(event.target.value))} min={min} max={max} step="any" disabled={disabled} /></label>;
}
const format = (value: number, unit: string) => `${Number(value.toPrecision(4))} ${unit}`;
function validSource(source: SimulationSource) {
  const range = (value: number, min: number, max: number) => Number.isFinite(value) && value >= min && value <= max;
  return WAVEFORMS.some(wave => wave.id === source.waveform) && range(source.frequencyHz, 0.001, 1e7) && range(source.amplitudePeak, 0, 1e4) && range(source.offset, -1e4, 1e4)
    && range(source.phaseDegrees ?? 0, -360, 360) && range(source.dutyCyclePercent ?? SOURCE_DEFAULTS.dutyCyclePercent, 1, 99)
    && range(source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz, 0.001, 1e7) && range(source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth, 0, 1)
    && Math.abs(source.offset) + source.amplitudePeak * (source.waveform === "am" ? 1 + (source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth) : 1) <= 1e4;
}

export function FunctionGenerator({ source, onChange, label = "기본 입력", idPrefix }: FunctionGeneratorProps) {
  const isPrimary = label === "기본 입력", prefix = isPrimary ? "" : `${label} `;
  const previewTitleId = `${idPrefix ?? `generator-${label.replace(/\s+/g, "-")}`}-preview`;
  const isDc = source.waveform === "dc", isAm = source.waveform === "am", isPulse = source.waveform === "pulse";
  const preview = useMemo(() => {
    if (!validSource(source)) return null;
    const limits = sourceSamplingLimits(source);
    // Keep the entire visible preview adequately sampled even for extreme AM ratios.
    // Show two envelope periods where possible, otherwise state the shorter window.
    const duration = isDc ? 0.002 : isAm
      ? Math.min(2 / Math.min(source.frequencyHz, source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz), 16 / Math.max(source.frequencyHz, limits.maximumFrequencyHz))
      : 2 / source.frequencyHz;
    const sampleCount = Math.max(257, Math.min(2049, Math.ceil(duration / limits.maximumOutputStepSeconds * 2) + 1));
    const values = Array.from({ length: sampleCount }, (_, index) => sourceVoltage(source, duration * index / (sampleCount - 1)));
    const peak = isDc ? 0 : source.amplitudePeak * (isAm ? 1 + (source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth) : 1);
    const padding = Math.max(peak * 0.2, Math.abs(source.offset) * 0.05, 0.001), low = source.offset - peak - padding, high = source.offset + peak + padding;
    const y = (value: number) => 18 + (high - value) / (high - low) * 112;
    return { duration, low, high, zeroY: y(0), path: values.map((value, index) => `${index ? "L" : "M"}${(64 + index / (sampleCount - 1) * 468).toFixed(3)},${y(value).toFixed(3)}`).join(" "), limits };
  }, [source, isDc, isAm]);
  return <section className="el-function-generator" aria-label={`${label} 함수발생기`}>
    <div className="el-sim-fields">
      <label className="el-sim-field"><span>{prefix}파형</span><select value={source.waveform} onChange={event => onChange({ waveform: event.target.value as SimulationWaveform })}>{WAVEFORMS.map(wave => <option key={wave.id} value={wave.id}>{wave.label}</option>)}</select></label>
      <NumericField label={`${prefix}주파수`} unit={isAm ? "Hz · 반송파" : "Hz"} value={source.frequencyHz} onChange={frequencyHz => onChange({ frequencyHz })} min={0.001} max={1e7} disabled={isDc} />
      <NumericField label={`${prefix}진폭`} unit={isAm ? "V peak · 반송파" : "V peak"} value={source.amplitudePeak} onChange={amplitudePeak => onChange({ amplitudePeak })} min={0} max={1e4} disabled={isDc} />
      <NumericField label={isPrimary ? isDc ? "DC 전압" : "DC 오프셋" : `${label} 오프셋`} unit="V" value={source.offset} onChange={offset => onChange({ offset })} min={-1e4} max={1e4} />
      <NumericField label={`${label} 위상`} unit={isAm ? "° · 반송파" : "°"} value={source.phaseDegrees ?? 0} onChange={phaseDegrees => onChange({ phaseDegrees })} min={-360} max={360} disabled={isDc} />
      {isPulse && <NumericField label={`${prefix}듀티 비율`} unit="% · high 구간" value={source.dutyCyclePercent ?? SOURCE_DEFAULTS.dutyCyclePercent} onChange={dutyCyclePercent => onChange({ dutyCyclePercent })} min={1} max={99} />}
      {isAm && <><NumericField label={`${prefix}변조 주파수`} unit="Hz · cos 포락선" value={source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz} onChange={modulationFrequencyHz => onChange({ modulationFrequencyHz })} min={0.001} max={1e7} /><NumericField label={`${prefix}변조 깊이`} unit="0~1" value={source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth} onChange={modulationDepth => onChange({ modulationDepth })} min={0} max={1} /></>}
    </div>
    <details data-generator-preview="true" aria-labelledby={previewTitleId} style={{ margin: "12px 0 0", border: "1px solid var(--el-line)", borderRadius: 8, padding: "10px 12px", background: "var(--el-bg)" }}>
      <summary id={previewTitleId} style={{ fontSize: 12, fontWeight: 700, color: "var(--el-text)", cursor: "pointer" }}>발생기 설정 미리보기 <span style={{ fontWeight: 400 }}>· {label}</span></summary>
      {preview ? <><svg viewBox="0 0 550 158" role="img" aria-label={`발생기 설정 미리보기: ${label}`} style={{ display: "block", width: "100%", maxHeight: 158 }}>
        <rect x="64" y="18" width="468" height="112" fill="var(--el-surface)" stroke="var(--el-line)" />
        {[0.25, 0.5, 0.75].map(at => <g key={at}><line x1={64 + 468 * at} x2={64 + 468 * at} y1="18" y2="130" stroke="var(--el-line)" /><line x1="64" x2="532" y1={18 + 112 * at} y2={18 + 112 * at} stroke="var(--el-line)" /></g>)}
        {preview.zeroY >= 18 && preview.zeroY <= 130 && <line x1="64" x2="532" y1={preview.zeroY} y2={preview.zeroY} stroke="var(--el-line-strong)" strokeDasharray="4 3" />}
        <text x="58" y="24" textAnchor="end" fill="var(--el-muted)" fontSize="10">{format(preview.high, "V")}</text><text x="58" y="130" textAnchor="end" fill="var(--el-muted)" fontSize="10">{format(preview.low, "V")}</text>
        <text x="64" y="148" fill="var(--el-muted)" fontSize="10">0 s</text><text x="532" y="148" textAnchor="end" fill="var(--el-muted)" fontSize="10">{format(preview.duration * 1000, "ms")}</text>
        <path d={preview.path} fill="none" stroke="var(--el-text)" strokeWidth="1.6" />
      </svg><p className="el-sim-control-note">무부하 이상 전압원의 설정 파형입니다. 회로 결과는 시뮬레이션 실행 후 표시되며, 시간 0의 회로 초기값은 DC 오프셋입니다.{!isDc && ` 이 설정의 출력 표본 간격은 ${format(preview.limits.maximumOutputStepSeconds * 1e6, "µs")} 이하여야 합니다.`}</p></> : <p className="el-notice error" role="alert">유효한 발생기 설정을 입력하면 미리보기가 표시됩니다.</p>}
    </details>
    {isAm && <p className="el-sim-control-note">AM = 오프셋 + 진폭 × [1 + 깊이 × cos(2π × 변조 주파수 × t)] × sin(2π × 반송파 주파수 × t + 위상). cos 반송파는 위상을 90°로 설정하세요.</p>}
    {isPulse && <p className="el-sim-control-note">high = 오프셋 + 진폭, low = 오프셋 − 진폭. 짧은 high/low 구간당 출력 4표본·내부 16단계 이상이 필요합니다.</p>}
    {["square", "pulse", "sawtooth"].includes(source.waveform) && <p className="el-sim-control-note">상승·하강 시간은 0인 이상 파형입니다. 모든 고조파나 실제 발생기의 에지를 재현하지 않습니다. 내부 계산은 출력 구간당 128단계·전체 65,536단계로 제한됩니다.</p>}
  </section>;
}

export default FunctionGenerator;
