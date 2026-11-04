import type { SimulationSource } from "./simulation-types";

const TAU = 2 * Math.PI;
export const SOURCE_DEFAULTS = { dutyCyclePercent: 50, modulationFrequencyHz: 100, modulationDepth: 0.2 } as const;

/** Ideal, unloaded generator voltage. The circuit initializes separately at offset. */
export function sourceVoltage(source: SimulationSource, timeSeconds: number): number {
  if (source.waveform === "dc") return source.offset;
  const cycle = ((timeSeconds * source.frequencyHz + (source.phaseDegrees ?? 0) / 360) % 1 + 1) % 1;
  let normalized: number;
  switch (source.waveform) {
    case "sine": normalized = Math.sin(TAU * cycle); break;
    case "square": normalized = cycle < 0.5 ? 1 : -1; break;
    case "triangle": normalized = 2 / Math.PI * Math.asin(Math.sin(TAU * cycle)); break;
    case "pulse": normalized = cycle < (source.dutyCyclePercent ?? SOURCE_DEFAULTS.dutyCyclePercent) / 100 ? 1 : -1; break;
    case "sawtooth": normalized = 2 * cycle - 1; break;
    case "am": normalized = (1 + (source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth) * Math.cos(TAU * (source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz) * timeSeconds)) * Math.sin(TAU * cycle); break;
    default: throw new Error("지원하지 않는 발생기 파형입니다.");
  }
  return source.offset + source.amplitudePeak * normalized;
}

/** Resolution floors, not a claim to reproduce infinitely sharp edges/harmonics. */
export function sourceSamplingLimits(source: SimulationSource): {
  maximumFrequencyHz: number; maximumOutputStepSeconds: number; maximumInternalStepSeconds: number; shortestPulseSeconds?: number;
} {
  if (source.waveform === "dc" || source.amplitudePeak === 0) return { maximumFrequencyHz: 0, maximumOutputStepSeconds: Infinity, maximumInternalStepSeconds: Infinity };
  const maximumFrequencyHz = source.frequencyHz + (source.waveform === "am" && (source.modulationDepth ?? SOURCE_DEFAULTS.modulationDepth) > 0 ? source.modulationFrequencyHz ?? SOURCE_DEFAULTS.modulationFrequencyHz : 0);
  const duty = (source.dutyCyclePercent ?? SOURCE_DEFAULTS.dutyCyclePercent) / 100;
  const shortestPulseSeconds = source.waveform === "pulse" ? Math.min(duty, 1 - duty) / source.frequencyHz : undefined;
  return {
    maximumFrequencyHz,
    maximumOutputStepSeconds: Math.min(1 / maximumFrequencyHz / 32, shortestPulseSeconds === undefined ? Infinity : shortestPulseSeconds / 4),
    maximumInternalStepSeconds: Math.min(1 / maximumFrequencyHz / 128, shortestPulseSeconds === undefined ? Infinity : shortestPulseSeconds / 16),
    ...(shortestPulseSeconds === undefined ? {} : { shortestPulseSeconds }),
  };
}
