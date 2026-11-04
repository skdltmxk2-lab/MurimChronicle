/** Subtract phasors, not gain magnitudes: CH1 - CH2 keeps both phase and sign. */
export function differentialResponse(aMagnitude: number[], aPhase: number[], bMagnitude: number[], bPhase: number[]) {
  if (new Set([aMagnitude.length, aPhase.length, bMagnitude.length, bPhase.length]).size !== 1) throw new Error("차동 AC 데이터의 길이가 다릅니다.");
  const magnitude: number[] = [], phase: number[] = [];
  for (let index = 0; index < aMagnitude.length; index++) {
    const ar = aPhase[index] * Math.PI / 180, br = bPhase[index] * Math.PI / 180;
    const real = aMagnitude[index] * Math.cos(ar) - bMagnitude[index] * Math.cos(br);
    const imaginary = aMagnitude[index] * Math.sin(ar) - bMagnitude[index] * Math.sin(br);
    magnitude.push(Math.hypot(real, imaginary));
    phase.push(real === 0 && imaginary === 0 ? 0 : Math.atan2(imaginary, real) * 180 / Math.PI);
  }
  return { magnitude, phase };
}

/** Uniformly sampled, one-sided peak-amplitude spectrum. No PSD or RMS claim. */
export function amplitudeSpectrum(time: number[], values: number[]) {
  if (time.length !== values.length || time.length < 32 || time.length > 4096 || [...time, ...values].some(value => !Number.isFinite(value))) throw new Error("스펙트럼 표본이 올바르지 않습니다.");
  const interval = (time[time.length - 1] - time[0]) / (time.length - 1);
  if (!(interval > 0) || time.some((value, index) => Math.abs(value - time[0] - index * interval) > Math.max(1e-12, interval * 1e-6))) throw new Error("등간격 시간 표본이 필요합니다.");
  const count = values.length, size = 2 ** Math.ceil(Math.log2(count));
  const real = new Float64Array(size), imaginary = new Float64Array(size);
  const mean = values.reduce((sum, value) => sum + value, 0) / count;
  let windowSum = 0;
  for (let i = 0; i < count; i++) {
    const window = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (count - 1));
    real[i] = (values[i] - mean) * window; windowSum += window;
  }
  for (let i = 1, j = 0; i < size; i++) {
    let bit = size >> 1;
    while (j & bit) { j ^= bit; bit >>= 1; }
    j ^= bit;
    if (i < j) [real[i], real[j]] = [real[j], real[i]];
  }
  for (let length = 2; length <= size; length <<= 1) {
    const angle = -2 * Math.PI / length, stepRe = Math.cos(angle), stepIm = Math.sin(angle);
    for (let start = 0; start < size; start += length) {
      let wr = 1, wi = 0;
      for (let offset = 0; offset < length / 2; offset++) {
        const even = start + offset, odd = even + length / 2;
        const tr = wr * real[odd] - wi * imaginary[odd], ti = wr * imaginary[odd] + wi * real[odd];
        real[odd] = real[even] - tr; imaginary[odd] = imaginary[even] - ti;
        real[even] += tr; imaginary[even] += ti;
        const nextRe = wr * stepRe - wi * stepIm; wi = wr * stepIm + wi * stepRe; wr = nextRe;
      }
    }
  }
  const sampleRateHz = 1 / interval;
  const frequenciesHz = Array.from({ length: size / 2 + 1 }, (_, i) => i * sampleRateHz / size);
  const amplitudes = frequenciesHz.map((_, i) => Math.hypot(real[i], imaginary[i]) / windowSum * (i === 0 || i === size / 2 ? 1 : 2));
  return { frequenciesHz, amplitudes, sampleRateHz, binWidthHz: sampleRateHz / size, observationResolutionHz: sampleRateHz / count, mean };
}
