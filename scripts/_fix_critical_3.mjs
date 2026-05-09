// 즉시 수정 가능 3건: $짝 안맞음 1건, 빈 \sqrt{} 1건.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const FIXES = [
  {
    id: "q-daily-eng-r23-1",
    explanation:
      "보존장이므로 $\\int_C\\nabla f\\cdot d\\mathbf r=f(0,1,1)-f(1,1,0)$. " +
      "$f(1,1,0)=e^{0}\\{\\cos(\\pi/4)+\\sin 0\\}=\\dfrac{\\sqrt 2}{2}$, " +
      "$f(0,1,1)=e^{0}\\{\\cos 0+\\sin(\\pi/4)\\}=1+\\dfrac{\\sqrt 2}{2}$. " +
      "차는 $1$. 답: 1."
  },
  {
    id: "q-2019-kyonggi-30",
    explanation:
      "$x'=3\\sin^2 t\\cos t$, $y'=-3\\cos^2 t\\sin t+3\\sin t=3\\sin t(1-\\cos^2 t)=3\\sin^3 t$. " +
      "$(x')^2+(y')^2=9\\sin^4 t\\cos^2 t+9\\sin^6 t=9\\sin^4 t(\\cos^2 t+\\sin^2 t)=9\\sin^4 t$. " +
      "$\\sqrt{9\\sin^4 t}=3\\sin^2 t$ ($\\sin t\\ge 0$). " +
      "호의 길이 $=\\int_0^{\\pi}3\\sin^2 t\\,dt=3\\cdot\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{2}$."
  }
];

for (const f of FIXES) {
  const { error } = await sb.from("questions").update({
    explanation: f.explanation,
    updated_at: new Date().toISOString()
  }).eq("id", f.id);
  if (error) { console.error(`❌ ${f.id}:`, error.message); continue; }
  console.log(`✓ ${f.id} 해설 수정`);
}
