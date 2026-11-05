import { COURSE_ANALOG_CASES } from "./course-analog-fixtures";
import { measureCourseAnalogCase } from "./course-analog-verification";
import { ADVANCED_ANALOG_CASES, buildAdvancedAnalogCase, measureAdvancedAnalogCase } from "./course-advanced-fixtures";
import { LAB5_REFERENCE_CASES, buildLab5ReferenceCase, lab5Measurements } from "./lab5-reference";
import type { Lab5CaseId, Lab5Ratio } from "./lab5-reference";
import type { Circuit } from "./types";
import type { SimulationConfig, SimulationResult } from "./simulation-types";
import { ensureReferenceConnections } from "./reference-connections";

export type VerificationStatus = "pass" | "mismatch" | "blocked" | "reference-missing";
export type VerificationMetric = {
  label: string;
  key?: string;
  metric?: string;
  value: number | string | null;
  reference?: number;
  unit?: string;
  relativeErrorPercent?: number;
  tolerance?: number | { relative: number; absolute: number; description?: string };
  basis: string;
  status?: string;
};
/** "s" is seconds (the default when absent). "sample" is a discrete index with no known sampling frequency. */
export type VerificationWaveformTimeUnit = "s" | "sample";
export type VerificationWaveform = { time: number[]; series: { label: string; values: number[] }[]; unit: string; timeUnit?: VerificationWaveformTimeUnit };
export type VerificationRecord = {
  id: string;
  experimentId: string;
  title: string;
  kind: "analog" | "dsp" | "external";
  status: VerificationStatus;
  sources: { label: string; pages: number[] }[];
  conditions: string[];
  metrics: VerificationMetric[];
  notes: string[];
  reason?: string;
  waveform?: VerificationWaveform;
};
export type CourseVerificationReport = { schemaVersion: 1; generatedAt: string; scope: string; cases: VerificationRecord[] };
export type VerificationInput = { circuit: Circuit; config: SimulationConfig; probes: string[]; blockedReason?: string };

const lab5Cases = LAB5_REFERENCE_CASES.flatMap(definition => {
  const ratios: Lab5Ratio[] = definition.circuitNumber === 1 || definition.id.endsWith("dc") ? ["1:1"] : ["1:1", "2:1"];
  return ratios.map(ratio => ({ id: `lab-5-${definition.id}-${ratio.replace(":", "to")}`, caseId: definition.id, ratio }));
});

/** This registry accepts reviewed course case IDs only. Numerical runs use schematic nets. */
export function getVerificationInput(id: string): VerificationInput | null {
  const analog = COURSE_ANALOG_CASES.find(item => item.id === id);
  if (analog) {
    const outputs = analog.references.filter(reference => /^(vpp|transientGain|rms|frequency|oscillating):/.test(reference.metric)).map(reference => reference.metric.split(":")[1]);
    return { circuit: ensureReferenceConnections(analog.circuit, analog.config), config: analog.config, probes: [...new Set([...outputs, ...analog.probes])], blockedReason: analog.blockedReason };
  }
  const lab5 = lab5Cases.find(item => item.id === id);
  if (lab5) {
    const input = buildLab5ReferenceCase(lab5.caseId, lab5.ratio);
    return { ...input, probes: ["OUT1", "OUT2", "OUT1-OUT2"] };
  }
  if (ADVANCED_ANALOG_CASES.some(item => item.id === id)) {
    const input = buildAdvancedAnalogCase(id);
    return { ...input, probes: ["OUT1", "OUT2", "OUT1-OUT2"] };
  }
  return null;
}

function compareMetric(metric: VerificationMetric, value: number | undefined): VerificationMetric {
  if (value === undefined || !Number.isFinite(value)) return { ...metric, value: null, relativeErrorPercent: undefined, status: "unavailable" };
  if (metric.reference === undefined) return { ...metric, value, status: "reported" };
  const tolerance = typeof metric.tolerance === "object" ? metric.tolerance : { relative: 0, absolute: metric.tolerance ?? 0 };
  const error = Math.abs(value - metric.reference);
  return { ...metric, value, relativeErrorPercent: metric.reference ? error / Math.abs(metric.reference) * 100 : undefined,
    status: error <= tolerance.absolute + Math.abs(metric.reference) * tolerance.relative ? "pass" : "mismatch" };
}

export function measureVerificationResult(reference: VerificationRecord, result: SimulationResult): VerificationRecord {
  const analog = COURSE_ANALOG_CASES.find(item => item.id === reference.id);
  if (analog) {
    const measured = measureCourseAnalogCase(analog, result);
    return { ...reference, ...measured, reason: measured.reason, sources: reference.sources, waveform: undefined };
  }
  const lab5 = lab5Cases.find(item => item.id === reference.id);
  let values: Record<string, number> = {};
  if (lab5) {
    const measured = lab5Measurements(result, lab5.caseId as Lab5CaseId);
    values = {
      ...Object.fromEntries(Object.entries(result.dc.nodeVoltages).map(([key, value]) => [`dc_${key}`, value])),
      ...Object.fromEntries(Object.entries(measured.halfVpp).map(([key, value]) => [`halfVpp_${key}`, value])),
      ...Object.fromEntries(Object.entries(measured.tonePeak).map(([key, value]) => [`tone_${key}`, value])),
    };
  } else {
    const definition = ADVANCED_ANALOG_CASES.find(item => item.id === reference.id);
    if (!definition) throw new Error("이 검증 항목의 회로 계산을 지원하지 않습니다.");
    values = measureAdvancedAnalogCase(definition, result);
  }
  // Independent SPICE rows retain their labelled offline result and never become a live app result.
  const metrics = reference.metrics.map(metric => metric.key && Object.hasOwn(values, metric.key) ? compareMetric(metric, values[metric.key]) : metric);
  const compared = metrics.filter(metric => metric.key && Object.hasOwn(values, metric.key) && metric.reference !== undefined);
  const status = compared.length ? compared.every(metric => metric.status === "pass") ? "pass" : "mismatch" : "reference-missing";
  return { ...reference, status, metrics, reason: undefined, waveform: undefined, notes: [...reference.notes, ...result.warnings] };
}

export function verificationTraces(input: VerificationInput, result: SimulationResult) {
  return input.probes.slice(0, 3).flatMap((probe, index) => {
    let values = result.nodeVoltages[probe];
    if (!values) {
      const [plus, minus] = probe.split("-");
      if (result.nodeVoltages[plus] && result.nodeVoltages[minus]) values = result.nodeVoltages[plus].map((value, i) => value - result.nodeVoltages[minus][i]);
    }
    return values ? [{ label: probe, color: ["#ddb768", "#79abd4", "#baa2d4"][index], values }] : [];
  });
}

/** Preserve a contiguous sample window so revisiting a case retains its real waveform. */
export function verificationWaveform(input: VerificationInput, result: SimulationResult): VerificationWaveform {
  const start = Math.max(0, result.time.length - 1024);
  return { time: result.time.slice(start), unit: "V", series: verificationTraces(input, result).map(trace => ({ label: trace.label, values: trace.values.slice(start) })) };
}

export type VerificationWorkerRequest = { type: "run"; requestId: number; caseId: string };
export type VerificationWorkerResponse = { type: "result"; requestId: number; caseId: string; result: SimulationResult }
  | { type: "error"; requestId: number; caseId: string; message: string };
