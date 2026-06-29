// Fix 2024 숙명여대 #7 — 그림 의존 표현 제거
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

const newQuestion = "반지름의 길이가 $1$인 원이 곡선 $y=x^2$과 서로 다른 두 점에서 접한다. 두 접점 사이에서 곡선 $y=x^2$과 원의 아래쪽 호로 둘러싸인 영역의 넓이는? (즉, $y=x^2$ 위쪽이며 원의 내부에 있는 부분)";

const { data, error } = await supabase
  .from("questions")
  .update({ question: newQuestion, updated_at: new Date().toISOString() })
  .eq("id", "q-2024-sookmyung-07")
  .select("id, question");

if (error) {
  console.error("Update error:", error);
  process.exit(1);
}
console.log("Updated:", JSON.stringify(data, null, 2));
