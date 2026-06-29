// Fix 2024 오전 단국대 #46 — 그림 의존 정보(변환행렬)를 텍스트로 명시
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
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const newQuestion = "일차변환 $T:\\mathbb{R}^2\\to\\mathbb{R}^2$이 다음과 같이 정의된다: $x$성분을 $3$배, $y$성분을 $2$배 한 후 반시계 방향으로 $\\dfrac{\\pi}{4}$만큼 회전. (이는 단위원을 적절한 타원으로 대응시키고 표준 단위 삼각형을 어떤 삼각형으로 대응시키는 일차변환이다.) $T\\!\\left(\\!\\left\\langle\\dfrac{1}{3},\\dfrac{2\\sqrt{2}}{3}\\right\\rangle\\!\\right)=\\langle a,b\\rangle$일 때, $a+b$의 값은?";

const { data, error } = await supabase
  .from("questions")
  .update({ question: newQuestion, updated_at: new Date().toISOString() })
  .eq("id", "q-2024am-dankook-46")
  .select("id, question");

if (error) {
  console.error("Update error:", error);
  process.exit(1);
}
console.log("Updated:", JSON.stringify(data, null, 2));
