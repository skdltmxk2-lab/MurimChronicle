export type SequenceSeries = { label: string; values: number[] };
export type SequenceChartModel = {
  count: number;
  xMin: number;
  xMax: number;
  xTicks: number[];
  yMin: number;
  yMax: number;
  yTicks: number[];
};

/** 1-2-5 tick positions inside [min, max]. */
export function niceTicks(min: number, max: number, target = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min || !(target >= 1)) return [];
  if (max === min) return [min];
  const rough = (max - min) / target;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map(multiplier => multiplier * magnitude).find(candidate => candidate >= rough * (1 - 1e-12))!;
  // Integer multiples of the step: accumulating "tick += step" leaves float noise where zero should be.
  const first = Math.ceil(min / step - 1e-9), last = Math.floor(max / step + 1e-9);
  const ticks: number[] = [];
  for (let multiple = first; multiple <= last; multiple++) ticks.push(Number((multiple * step).toPrecision(12)));
  return ticks;
}

/**
 * Geometry of a discrete-sequence chart. A sequence is drawn against its sample index only when the axis is
 * consecutive integers and every series is finite and as long as the axis; anything else returns null so the
 * viewer never relabels or stretches data it cannot place on a sample axis.
 */
export function sequenceChartModel(index: number[], series: SequenceSeries[]): SequenceChartModel | null {
  if (index.length < 2 || !series.length) return null;
  if (!index.every((value, position) => Number.isInteger(value) && (position === 0 || value === index[position - 1] + 1))) return null;
  if (series.some(item => item.values.length !== index.length || item.values.some(value => !Number.isFinite(value)))) return null;
  const values = series.flatMap(item => item.values);
  // A stem plot is anchored at zero so the sign and size of every sample stay readable.
  let low = Math.min(0, ...values), high = Math.max(0, ...values);
  if (low === high) { low = -1; high = 1; }
  const pad = (high - low) * 0.06;
  const yMin = low - pad, yMax = high + pad;
  return { count: index.length, xMin: index[0], xMax: index.at(-1)!, xTicks: niceTicks(index[0], index.at(-1)!, 11).filter(Number.isInteger),
    yMin, yMax, yTicks: niceTicks(yMin, yMax, 5) };
}
