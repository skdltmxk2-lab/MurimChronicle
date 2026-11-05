import { parseExplicitComponentValue } from "./component-values";

const DIGIT_COLORS = ["#202020", "#75432a", "#bc292f", "#e47e32", "#e2bd43", "#50824b", "#3472aa", "#7e539a", "#7c8087", "#eee9d9"];
const DIGIT_NAMES = ["검정", "갈색", "빨강", "주황", "노랑", "초록", "파랑", "보라", "회색", "흰색"];
const MULTIPLIER_COLORS: Record<number, string> = { [-2]: "#b8bfc3", [-1]: "#b59b52" };

export type ResistorMarking = { colors: string[]; toleranceUnknown: boolean; label: string };

/** Color mapping follows https://www.vishay.com/docs/49411/resistor_color_code_calculator.pdf. */
export function resistorMarking(value: string): ResistorMarking {
  const resistance = parseExplicitComponentValue(value, "resistor");
  if (resistance === 0) return { colors: [DIGIT_COLORS[0]], toleranceUnknown: false, label: "0 Ω 점퍼 · 검정 한 띠" };
  if (resistance === null || !Number.isFinite(resistance) || resistance < 0) {
    return { colors: [], toleranceUnknown: false, label: "색띠 표시 불가 · 저항값과 단위를 확인하세요" };
  }
  for (const digitCount of [2, 3]) {
    const exponent = Math.floor(Math.log10(resistance)) - digitCount + 1;
    if (exponent < -2 || exponent > 9) continue;
    const coefficient = Math.round(resistance / 10 ** exponent);
    const digits = String(coefficient);
    const represented = coefficient * 10 ** exponent;
    if (digits.length !== digitCount || Math.abs(represented - resistance) > resistance * 1e-12) continue;
    const multiplierColor = MULTIPLIER_COLORS[exponent] ?? DIGIT_COLORS[exponent];
    const multiplierName = exponent === -2 ? "은색" : exponent === -1 ? "금색" : DIGIT_NAMES[exponent];
    const numbers = [...digits].map(Number);
    return {
      colors: [...numbers.map(digit => DIGIT_COLORS[digit]), multiplierColor],
      toleranceUnknown: true,
      label: `저항값 색띠 ${[...numbers.map(digit => DIGIT_NAMES[digit]), multiplierName].join(" · ")} · ?는 공차 미지정`,
    };
  }
  return { colors: [], toleranceUnknown: false, label: "이 저항값은 4·5띠로 정확히 표시할 수 없습니다" };
}
