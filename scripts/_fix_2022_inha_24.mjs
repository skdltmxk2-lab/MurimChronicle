// q-2022-inha-24를 실제 2022 인하대 24번(포물면 곡면적분)으로 교체
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

const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
const updated = {
  question: "곡면 $S=\\!\\left\\{(x,y,z)\\,\\Big|\\,z=\\dfrac{1}{2}(x^2+y^2),\\;x^2+y^2\\le 1\\right\\}$ 위에서 정의된 함수 $f(x,y,z)=z$에 대하여 곡면적분 $\\!\\displaystyle\\iint_S f(x,y,z)\\,dS$의 값은?",
  options: [
    o("1", "$\\dfrac{2\\pi}{15}(\\sqrt 2+1)$"),
    o("2", "$\\dfrac{2\\pi}{15}(\\sqrt 2+3)$"),
    o("3", "$\\dfrac{2\\pi}{15}(\\sqrt 2+5)$"),
    o("4", "$\\dfrac{2\\pi}{15}(\\sqrt 2+7)$"),
    o("5", "$\\dfrac{2\\pi}{15}(\\sqrt 2+9)$"),
  ],
  correct_option_id: "1",
  subject: "다변수함수",
  unit: "곡면적분",
  concept: "포물면 위의 스칼라 곡면적분",
  difficulty: "mediumHard",
  explanation:
    "$z=\\tfrac{1}{2}(x^2+y^2)$, $z_x=x$, $z_y=y$.\n$dS=\\sqrt{1+x^2+y^2}\\,dA$.\n$\\!\\iint_S z\\,dS=\\!\\iint_D\\dfrac{x^2+y^2}{2}\\sqrt{1+x^2+y^2}\\,dA$.\n극좌표 $D:0\\le r\\le 1$: $\\pi\\!\\int_0^1 r^3\\sqrt{1+r^2}\\,dr$.\n$u=1+r^2$ 치환: $\\dfrac{\\pi}{2}\\!\\int_1^2(u-1)\\sqrt u\\,du=\\dfrac{\\pi}{2}\\!\\left[\\dfrac{2u^{5/2}}{5}-\\dfrac{2u^{3/2}}{3}\\right]_1^2$.\n계산하면 $\\dfrac{2\\pi}{15}(\\sqrt 2+1)$.",
  tags: ["2022", "인하대", "다변수함수", "곡면적분", "포물면 위의 스칼라 곡면적분"],
  updated_at: new Date().toISOString(),
};

const { data, error } = await sb.from("questions").update(updated).eq("id", "q-2022-inha-24").select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log("Updated:", data);
