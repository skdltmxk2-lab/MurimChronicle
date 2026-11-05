export type ScopeTrace = { label: string; color: string; values: number[] };
export type ScopeMeasurements = { min?: number; max?: number; mean?: number; rms?: number; vpp?: number; frequency?: number; duty?: number; complete: boolean; cycles: number; periodReason: string };
export type ScopeTrigger = { source: number; slope: "rising" | "falling"; level: number; mode: "auto" | "normal" };
export type ScopeWindow = { start: number; end: number; secondsPerDivision: number; triggerTime?: number; showTrace: boolean; status: "triggered" | "auto" | "waiting" | "invalid" };

export function scopeFormat(value: number | undefined, unit = "") {
  if (value === undefined || !Number.isFinite(value)) return "—";
  if (!value) return `0${unit ? ` ${unit}` : ""}`;
  // A dimensionless quantity has no SI prefix to print, so rescaling it would misstate its size by 10^3n.
  if (!unit) return String(Number(value.toPrecision(4)));
  const power = Math.max(-12, Math.min(9, Math.floor(Math.log10(Math.abs(value)) / 3) * 3));
  const prefixes: Record<number, string> = { [-12]: "p", [-9]: "n", [-6]: "µ", [-3]: "m", 0: "", 3: "k", 6: "M", 9: "G" };
  return `${Number((value / 10 ** power).toPrecision(4))}${unit ? ` ${prefixes[power]}${unit}` : ""}`;
}
const median = (values: number[]) => { const sorted = [...values].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; };
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

/** Plot, trigger and cursor interpolation never bridge missing or nonmonotonic data. */
export function scopeTimeInfo(time: number[]) {
  if (time.length < 2 || time.some(value => !Number.isFinite(value))) return null;
  const steps = time.slice(1).map((value, i) => value - time[i]);
  if (steps.some(value => value <= 0)) return null;
  const step = median(steps);
  return { start: time[0], end: time[time.length - 1], duration: time[time.length - 1] - time[0], step, uniform: steps.every(value => Math.abs(value - step) <= Math.max(step * 0.01, 1e-15)) };
}

export function scopeCoupledValues(values: number[], coupling: "AC" | "DC") {
  if (coupling === "DC") return values;
  const finite = values.filter(Number.isFinite), mean = finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
  return values.map(value => Number.isFinite(value) ? value - mean : NaN);
}

export function scopeValueAt(time: number[], values: number[], target: number): number | undefined {
  const info = scopeTimeInfo(time);
  if (!info || values.length !== time.length || !Number.isFinite(target) || target < info.start || target > info.end) return undefined;
  let lo = 0, hi = time.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (time[mid] < target) lo = mid + 1; else hi = mid; }
  if (time[lo] === target) return Number.isFinite(values[lo]) ? values[lo] : undefined;
  if (!lo || !Number.isFinite(values[lo]) || !Number.isFinite(values[lo - 1]) || time[lo] - time[lo - 1] > info.step * 2) return undefined;
  return values[lo - 1] + (values[lo] - values[lo - 1]) * (target - time[lo - 1]) / (time[lo] - time[lo - 1]);
}

export function scopeCrossings(time: number[], values: number[], level: number, slope: "rising" | "falling", hysteresis = 0): number[] {
  const info = scopeTimeInfo(time);
  if (!info || time.length !== values.length || !Number.isFinite(level) || !Number.isFinite(hysteresis) || hysteresis < 0) return [];
  const sign = slope === "rising" ? 1 : -1, result: number[] = [];
  let armed = false;
  for (let i = 1; i < time.length; i++) {
    const a = sign * (values[i - 1] - level), b = sign * (values[i] - level);
    if (!Number.isFinite(a) || !Number.isFinite(b) || time[i] - time[i - 1] > info.step * 2) { armed = false; continue; }
    if (a <= -hysteresis && a < 0) armed = true;
    if (armed && a < 0 && b >= 0) { result.push(time[i - 1] + (time[i] - time[i - 1]) * -a / (b - a)); armed = false; }
  }
  return result;
}

export function scopeMeasurements(time: number[], values: number[]): ScopeMeasurements {
  const finite = values.filter(Number.isFinite), info = scopeTimeInfo(time);
  const complete = Boolean(info && values.length === time.length && finite.length === values.length && info.uniform);
  const result: ScopeMeasurements = { complete, cycles: 0, periodReason: "유효한 표본이 없습니다." };
  if (!finite.length) return result;
  result.min = finite.reduce((a, b) => Math.min(a, b), Infinity); result.max = finite.reduce((a, b) => Math.max(a, b), -Infinity);
  result.vpp = result.max - result.min; result.mean = finite.reduce((a, b) => a + b, 0) / finite.length;
  result.rms = Math.hypot(...finite) / Math.sqrt(finite.length);
  if (!complete || !info) { result.periodReason = "누락·불균일·끊긴 표본에서는 주기를 판단하지 않습니다."; return result; }
  if (result.vpp <= Math.max(1e-12, Math.max(Math.abs(result.min), Math.abs(result.max)) * 1e-10)) { result.periodReason = "DC 또는 분해 가능한 진폭이 없습니다."; return result; }
  const level = (result.min + result.max) / 2;
  const rising = scopeCrossings(time, values, level, "rising", result.vpp * 0.05);
  if (rising.length < 4) { result.periodReason = "최소 3개의 완전한 반복 주기가 필요합니다."; return result; }
  const periods = rising.slice(1).map((value, i) => value - rising[i]), centralPeriod = median(periods);
  const period = (rising[rising.length - 1] - rising[0]) / periods.length;
  if (period < info.step * 16) { result.periodReason = "주기당 표본이 16개 미만입니다."; return result; }
  if (periods.some(value => Math.abs(value - centralPeriod) > Math.max(centralPeriod * 0.025, info.step * 1.5))) { result.periodReason = "주기가 일정하지 않습니다. 변조·다중 주파수·과도 응답을 확인하세요."; return result; }
  const cycleRanges: number[] = [], cycleMeans: number[] = [];
  let sample = 0;
  for (let cycle = 0; cycle < periods.length; cycle++) {
    while (sample < time.length && time[sample] < rising[cycle]) sample++;
    let low = Infinity, high = -Infinity, sum = 0, count = 0;
    for (; sample < time.length && time[sample] < rising[cycle + 1]; sample++) { low = Math.min(low, values[sample]); high = Math.max(high, values[sample]); sum += values[sample]; count++; }
    if (count) { cycleRanges.push(high - low); cycleMeans.push(sum / count); }
  }
  const centralRange = median(cycleRanges), centralMean = median(cycleMeans);
  if (cycleRanges.some(range => Math.abs(range - centralRange) > centralRange * 0.06) || cycleMeans.some(value => Math.abs(value - centralMean) > result.vpp! * 0.03)) { result.periodReason = "주기별 진폭·평균이 달라 정상 반복 신호로 판단하지 않습니다."; return result; }
  // A stable edge interval alone can mislabel beating or an amplitude ramp as a clean period.
  let squaredError = 0, comparisons = 0;
  for (let i = 0; i < time.length && time[i] + period <= info.end; i++) {
    const next = interpolateKnownTime(time, values, time[i] + period);
    squaredError += (values[i] - next) ** 2; comparisons++;
  }
  // A noncoherent square-wave capture has sub-sample edge uncertainty. Amplitude,
  // cycle means and edge periods were checked separately before this shape test.
  if (!comparisons || Math.sqrt(squaredError / comparisons) > result.vpp * 0.075) { result.periodReason = "주기마다 파형이 달라 단일 반복 주파수를 확정하지 않습니다."; return result; }
  result.frequency = 1 / period; result.cycles = periods.length;
  const falling = scopeCrossings(time, values, level, "falling", result.vpp * 0.05);
  const duties = rising.slice(0, -1).map((start, i) => {
    const fall = falling.find(value => value > start && value < rising[i + 1]);
    return fall === undefined ? NaN : (fall - start) / (rising[i + 1] - start);
  });
  if (duties.every(Number.isFinite)) {
    const duty = median(duties);
    if (duties.every(value => Math.abs(value - duty) <= Math.max(0.025, info.step * 1.5 / period))) result.duty = duty;
  }
  result.periodReason = "반복 주기 추정 · duty는 최솟값과 최댓값의 중간 전압보다 높은 시간 비율입니다.";
  return result;
}

// Called only after complete monotonic finite data were established above.
function interpolateKnownTime(time: number[], values: number[], target: number) {
  let lo = 0, hi = time.length - 1;
  while (lo < hi) { const mid = (lo + hi) >> 1; if (time[mid] < target) lo = mid + 1; else hi = mid; }
  if (!lo || time[lo] === target) return values[lo];
  return values[lo - 1] + (values[lo] - values[lo - 1]) * (target - time[lo - 1]) / (time[lo] - time[lo - 1]);
}

export function scopeWindow(time: number[], traces: ScopeTrace[], secondsPerDivision: number | null, position: number, trigger: ScopeTrigger): ScopeWindow {
  const info = scopeTimeInfo(time), invalid: ScopeWindow = { start: 0, end: 1, secondsPerDivision: 0.1, showTrace: false, status: "invalid" };
  if (!info || !Number.isFinite(position) || !Number.isFinite(trigger.level) || (secondsPerDivision !== null && (!Number.isFinite(secondsPerDivision) || secondsPerDivision <= 0))) return invalid;
  const span = secondsPerDivision === null ? info.duration : clamp(secondsPerDivision * 10, Math.min(info.step * 2, info.duration), info.duration);
  const requestedStart = info.start + clamp(position, 0, 1) * (info.duration - span), target = requestedStart + span * 0.2;
  const crosses = scopeCrossings(time, traces[trigger.source]?.values ?? [], trigger.level, trigger.slope).filter(value => value >= requestedStart && value <= requestedStart + span);
  const triggerTime = crosses.reduce<number | undefined>((best, value) => best === undefined || Math.abs(value - target) < Math.abs(best - target) ? value : best, undefined);
  const start = triggerTime === undefined ? requestedStart : clamp(triggerTime - span * 0.2, info.start, info.end - span);
  return { start, end: start + span, secondsPerDivision: span / 10, triggerTime, showTrace: triggerTime !== undefined || trigger.mode === "auto", status: triggerTime !== undefined ? "triggered" : trigger.mode === "auto" ? "auto" : "waiting" };
}

export function scopeAutoVolts(values: number[], offset = 0) {
  const peak = values.reduce((largest, value) => Number.isFinite(value) ? Math.max(largest, Math.abs(value + offset)) : largest, 0);
  const required = Math.max(peak / 3.4, 1e-9), base = 10 ** Math.floor(Math.log10(required));
  return ([1, 2, 5, 10].find(multiplier => multiplier * base >= required) ?? 10) * base;
}

/** Path pieces preserve gaps; clipping is purely visual and never changes measurements. */
export function scopePath(time: number[], values: number[], window: ScopeWindow, voltsPerDivision: number, offset: number, width: number, height: number) {
  const info = scopeTimeInfo(time);
  if (!info || !window.showTrace || values.length !== time.length || !(voltsPerDivision > 0) || !Number.isFinite(voltsPerDivision) || !Number.isFinite(offset)) return "";
  const left = 52, right = 18, top = 24, bottom = 34, plotWidth = width - left - right, plotHeight = height - top - bottom;
  let path = "", connected = false;
  for (let i = 0; i < time.length; i++) {
    if (!Number.isFinite(values[i])) { connected = false; continue; }
    if ((i < time.length - 1 && time[i + 1] < window.start) || (i > 0 && time[i - 1] > window.end)) { connected = false; continue; }
    if (i && time[i] - time[i - 1] > info.step * 2) connected = false;
    const x = left + (time[i] - window.start) / (window.end - window.start) * plotWidth;
    const y = top + plotHeight / 2 - (values[i] + offset) / voltsPerDivision * plotHeight / 8;
    if (!Number.isFinite(x) || !Number.isFinite(y)) { connected = false; continue; }
    path += `${connected ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)} `; connected = true;
  }
  return path.trim();
}
