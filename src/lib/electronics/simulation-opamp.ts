import type { NonlinearDevice } from "./simulation-models";

/** Educational one-pole approximation; ST UA741 typical values at ±15 V/25 C.
 * https://www.st.com/resource/en/datasheet/ua741.pdf, tables 3 (pp.5–6).
 * The fixed 1.5 V headroom is an educational assumption, not a guaranteed swing.
 */
export const EDUCATIONAL_OPAMP = { openLoopGain: 200000, gainBandwidthHz: 1e6, slewRate: 500000, headroom: 1.5 } as const;
const pole = 2 * Math.PI * EDUCATIONAL_OPAMP.gainBandwidthHz / EDUCATIONAL_OPAMP.openLoopGain;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

export function createEducationalOpamp(id: string, out: string, plus: string, minus: string, low: number, high: number, equationNet: string) {
  const lowerRail = low + EDUCATIONAL_OPAMP.headroom, upperRail = high - EDUCATIONAL_OPAMP.headroom, midpoint = (low + high) / 2;
  if (high - low < 5 || high - low > 40) throw new Error(`${id}: 교육용 UA741 동적 모델은 총 DC 전원 5~40 V에서만 실행합니다.`);
  let mode: "dc" | "initial" | "transient" = "dc", previous = 0, step = 0;
  const device: NonlinearDevice = {
    id: `${id}:pole`, pins: [out, plus, minus, equationNet], pinLabels: ["OUT", "IN+", "IN-", "EQUATION"],
    evaluate(values) {
      const [output, positive, negative] = values;
      const raw = midpoint + EDUCATIONAL_OPAMP.openLoopGain * (positive - negative);
      let target: number, outputDerivative = 1, positiveDerivative = 0;
      if (mode === "initial") target = previous;
      else if (mode === "dc") {
        target = clamp(raw, lowerRail, upperRail);
        if (raw > lowerRail && raw < upperRail) positiveDerivative = -EDUCATIONAL_OPAMP.openLoopGain;
      } else {
        const rawRate = pole * (raw - output), rate = clamp(rawRate, -EDUCATIONAL_OPAMP.slewRate, EDUCATIONAL_OPAMP.slewRate);
        const proposed = previous + step * rate;
        target = clamp(proposed, lowerRail, upperRail);
        if (proposed > lowerRail && proposed < upperRail && Math.abs(rawRate) < EDUCATIONAL_OPAMP.slewRate) {
          outputDerivative += step * pole;
          positiveDerivative = -step * pole * EDUCATIONAL_OPAMP.openLoopGain;
        }
      }
      // The last row is an MNA voltage/state equation, not a physical pin current.
      return { currents: [0, 0, 0, output - target], jacobian: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [outputDerivative, positiveDerivative, -positiveDerivative, 0]] };
    },
    validateFinal(values) {
      if (values[0] < lowerRail - 1e-6 || values[0] > upperRail + 1e-6) throw new Error(`${id}: 동적 출력 상태가 전원 제한을 벗어났습니다.`);
      if (mode === "transient" && Math.abs(values[0] - previous) > step * EDUCATIONAL_OPAMP.slewRate + 1e-6) throw new Error(`${id}: 동적 출력 상태가 slew rate 제한을 벗어났습니다.`);
    },
  };
  return { device, out, equationNet, lowerRail, upperRail, midpoint, pole,
    dc() { mode = "dc"; }, initial(value: number) { mode = "initial"; previous = clamp(value, lowerRail, upperRail); },
    transient(value: number, timeStep: number) { mode = "transient"; previous = value; step = timeStep; },
  };
}
