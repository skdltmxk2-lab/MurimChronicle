import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const fixes = [
  {
    id: "q-2019-kookmin-11",
    explanation:
      "가우스 적분 표준 결과: $\\!\\int_{-\\infty}^{\\infty}e^{-x^2}dx=\\sqrt\\pi$.\n따라서 $I=\\sqrt\\pi$이고 $I^2=(\\sqrt\\pi)^2=\\pi$.\n극좌표 변환으로 $I^2=\\!\\int_{\\mathbb{R}^2}e^{-(x^2+y^2)}dA=\\!\\int_0^{2\\pi}\\!\\int_0^{\\infty}e^{-r^2}r\\,dr\\,d\\theta=\\pi$로도 유도된다.",
  },
  {
    id: "q-2021-kookmin-11",
    explanation:
      "행 사다리꼴로 축약: $R_2\\to R_2-\\dfrac{3}{2}R_1$ 등 차례로 소거 후 영행 1개 발생.\n비영 피벗이 3개 ⇒ $\\text{rank}(A)=3$.\n또는 4개 행 중 1개가 다른 행들의 일차결합으로 표현됨을 확인.",
  },
];

for (const f of fixes) {
  const { data, error } = await sb.from("questions").update({ explanation: f.explanation, updated_at: new Date().toISOString() }).eq("id", f.id).select("id");
  if (error) console.error(f.id, error);
  else console.log("Updated:", data?.[0]?.id);
}
