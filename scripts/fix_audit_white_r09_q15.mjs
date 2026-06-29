// Fixes THE 앤드 화이트 Final A 9회 15번 broken differential notation and thin explanation.
// Usage: node scripts/fix_audit_white_r09_q15.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import katex from "katex";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const question = `영역 $S=\\left\\{(x, y, z) \\mid 0 \\leq x \\leq 2,-\\sqrt{4-x^{2}} \\leq y \\leq \\sqrt{4-x^{2}},\\ \\sqrt{x^{2}+y^{2}} \\leq z \\leq \\sqrt{8-x^{2}-y^{2}}\\right\\}$ 에서 다음 삼중적분 $\\iiint_{S} z\\,d z\\,d y\\,d x$ 의 값은?`;

const explanation = `15) $xy$평면에서의 영역은 오른쪽 반원판이므로 원통좌표에서
$-\\dfrac{\\pi}{2}\\leq\\theta\\leq\\dfrac{\\pi}{2}$, $0\\leq r\\leq2$ 이다.
또 $z$의 범위는 $r\\leq z\\leq\\sqrt{8-r^{2}}$ 이다.

$$\\begin{aligned}
\\iiint_S z\\,dV
&=\\int_{-\\pi/2}^{\\pi/2}\\int_0^2\\int_r^{\\sqrt{8-r^2}} z\\,r\\,dz\\,dr\\,d\\theta \\\\
&=\\pi\\int_0^2 \\frac{r}{2}\\{(8-r^2)-r^2\\}\\,dr \\\\
&=\\pi\\int_0^2 r(4-r^2)\\,dr \\\\
&=\\pi\\left[2r^2-\\frac{r^4}{4}\\right]_0^2=4\\pi.
\\end{aligned}$$

정답: (4)`;

for (const value of [question, explanation]) {
  const segments = [...value.matchAll(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g)];
  for (const match of segments) {
    const token = match[0];
    const displayMode = token.startsWith("$$");
    katex.renderToString(displayMode ? token.slice(2, -2) : token.slice(1, -1), {
      displayMode,
      throwOnError: true,
      strict: false,
    });
  }
}

const { error } = await supabase
  .from("questions")
  .update({
    question,
    explanation,
    updated_at: new Date().toISOString(),
  })
  .eq("id", "q-white-final-a-r09-15");
if (error) throw error;

console.log("updated q-white-final-a-r09-15");
