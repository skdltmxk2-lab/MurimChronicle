import { parseSimulationValue } from "./simulation";
import type { CourseAnalogCase, CourseAnalogReference } from "./course-analog-fixtures";
import type { SimulationResult } from "./simulation-types";

export type CourseAnalogMetric = {
  label: string;
  metric: string;
  value: number | null;
  reference?: number;
  unit: string;
  relativeErrorPercent?: number;
  tolerance?: { relative: number; absolute: number; description: string };
  basis: CourseAnalogReference["basis"] | "engine-result";
  status: "pass" | "mismatch" | "unavailable" | "reported";
};
export type CourseAnalogVerification = {
  id: string;
  experimentId: string;
  title: string;
  kind: "analog";
  status: "pass" | "mismatch" | "blocked" | "reference-missing";
  source: CourseAnalogCase["source"];
  conditions: string[];
  metrics: CourseAnalogMetric[];
  notes: string[];
  reason?: string;
};

function series(result: SimulationResult, expression: string): number[] | undefined {
  if (result.nodeVoltages[expression]) return result.nodeVoltages[expression];
  const [plus, minus, extra] = expression.split("-");
  if (extra || !result.nodeVoltages[plus] || !result.nodeVoltages[minus]) return undefined;
  return result.nodeVoltages[plus].map((value, index) => value - result.nodeVoltages[minus][index]);
}
function statistics(result: SimulationResult, expression: string) {
  const signal = series(result, expression);
  if (!signal?.length) return undefined;
  // Discard the first 40% of the actual trace. The remaining three periods are
  // used for ordinary five-period source cases. Oscillators use the same window.
  const start = Math.floor((signal.length - 1) * 0.4);
  const values = signal.slice(start), times = result.time.slice(start);
  const min = Math.min(...values), max = Math.max(...values), span = times.at(-1)! - times[0];
  let integral = 0, squaredIntegral = 0;
  for (let i = 1; i < values.length; i++) {
    const dt = times[i] - times[i - 1];
    integral += dt * (values[i] + values[i - 1]) / 2;
    squaredIntegral += dt * (values[i] ** 2 + values[i - 1] ** 2) / 2;
  }
  const mean = span > 0 ? integral / span : values[0];
  const rms = span > 0 ? Math.sqrt(Math.max(0, squaredIntegral / span)) : Math.abs(values[0]);
  const crossings: number[] = [];
  if (max - min > 1e-4) {
    const level = (max + min) / 2;
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] <= level && values[i] > level) crossings.push(times[i - 1] + (times[i] - times[i - 1]) * (level - values[i - 1]) / (values[i] - values[i - 1]));
    }
  }
  const periods = crossings.slice(1).map((time, index) => time - crossings[index]);
  const averagePeriod = periods.reduce((sum, value) => sum + value, 0) / periods.length;
  const regular = periods.length >= 2 && periods.every(period => Math.abs(period - averagePeriod) <= averagePeriod * 0.1);
  const early = values.slice(0, Math.max(2, Math.floor(values.length / 3)));
  const late = values.slice(Math.floor(values.length * 2 / 3));
  const earlyAmplitude = Math.max(...early) - Math.min(...early);
  const lateAmplitude = Math.max(...late) - Math.min(...late);
  // A decaying response to the declared 1 mV startup disturbance is not
  // sustained oscillation. Compare equal-length parts of the observed window.
  const sustained = lateAmplitude >= 0.9 * earlyAmplitude;
  return { min, max, mean, rms, vpp: max - min, frequency: regular ? 1 / averagePeriod : null, oscillating: regular && sustained && lateAmplitude > 1e-3 ? 1 : 0 };
}

export function courseAnalogMetricValue(testCase: CourseAnalogCase, result: SimulationResult, metric: string): number | null {
  const [operation, name, ...terminal] = metric.split(":");
  if (operation === "dc") return result.dc.nodeVoltages[name] ?? null;
  if (operation === "current") return result.dc.deviceCurrents?.[name]?.[terminal.join(":")] ?? null;
  if (operation === "resistorCurrent") return result.dc.componentCurrents[name] ?? null;
  if (operation === "supplyCurrent") return result.dc.sourceCurrents[name] === undefined ? null : -result.dc.sourceCurrents[name];
  if (operation === "gain") return result.ac.nodeGainMagnitude[name]?.[0] ?? null;
  if (operation === "phase") return result.ac.nodePhaseDegrees[name]?.[0] ?? null;
  if (operation === "power") {
    const part = testCase.circuit.components.find(item => item.id === name);
    if (!part || part.definitionId !== "resistor-axial") return null;
    const a = result.nodeVoltages[part.pinNets["1"]], b = result.nodeVoltages[part.pinNets["2"]];
    if (!a || !b) return null;
    const resistance = parseSimulationValue(part.value, "resistor");
    const powerSignal = a.map((value, index) => (value - b[index]) ** 2 / resistance);
    return statistics({ ...result, nodeVoltages: { ...result.nodeVoltages, __power: powerSignal } }, "__power")?.mean ?? null;
  }
  const measured = statistics(result, name);
  if (!measured) return null;
  if (operation === "transientGain") {
    const input = statistics(result, testCase.config.source.netId);
    return input && input.vpp > 1e-12 ? measured.vpp / input.vpp : null;
  }
  if (operation === "vpp" || operation === "mean" || operation === "rms" || operation === "frequency" || operation === "oscillating") return measured[operation];
  return null;
}

/** The tolerance is an audit comparison threshold, not a physical component rating. */
export function measureCourseAnalogCase(testCase: CourseAnalogCase, result?: SimulationResult, failure?: string): CourseAnalogVerification {
  const base = { id: testCase.id, experimentId: testCase.experimentId, title: testCase.title, kind: "analog" as const, source: testCase.source, conditions: testCase.conditions, notes: [...testCase.notes] };
  if (testCase.blockedReason || !result) return { ...base, status: "blocked", metrics: [], reason: testCase.blockedReason ?? failure ?? "계산 결과가 없습니다." };
  const metrics: CourseAnalogMetric[] = testCase.references.map(reference => {
    const value = courseAnalogMetricValue(testCase, result, reference.metric);
    const error = value === null ? Infinity : Math.abs(value - reference.expected);
    return {
      label: reference.label, metric: reference.metric, value, reference: reference.expected, unit: reference.unit, basis: reference.basis,
      ...(value !== null && reference.expected !== 0 ? { relativeErrorPercent: error / Math.abs(reference.expected) * 100 } : {}),
      tolerance: { relative: reference.relativeTolerance, absolute: reference.absoluteTolerance, description: "감사에서 사전 선택한 수치 비교 기준. 부품 공차 또는 실물 성능 보증값과 구분합니다." },
      status: value === null ? "unavailable" : error <= reference.absoluteTolerance + reference.relativeTolerance * Math.abs(reference.expected) ? "pass" : "mismatch",
    };
  });
  for (const probe of testCase.probes) {
    for (const [operation, unit] of [["dc", "V"], ["vpp", "V"], ["rms", "V"], ["frequency", "Hz"]]) {
      const metric = `${operation}:${probe}`;
      if (metrics.some(item => item.metric === metric)) continue;
      const value = courseAnalogMetricValue(testCase, result, metric);
      if (value !== null) metrics.push({ label: `${probe} ${operation}`, metric, value, unit, basis: "engine-result", status: "reported" });
    }
  }
  const compared = metrics.filter(item => item.reference !== undefined);
  const status = compared.length === 0 ? "reference-missing" : compared.every(item => item.status === "pass") ? "pass" : "mismatch";
  return { ...base, status, metrics, notes: [...base.notes, "Vpp/RMS/반복주파수는 실제 계산 파형의 뒤 60%에서 측정했습니다. 주파수는 3개 이상 상승 교차와 주기 일관성이 확인된 경우만 표시합니다. 발진 여부는 같은 길이의 관찰 앞·뒤 구간에서 진폭 감소가 10% 이하이고 후반 Vpp가 1 mV를 넘는 조건으로 판정합니다.", ...result.warnings] };
}
