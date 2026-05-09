// content_type=mixed인데 question_image가 비어있는 41건을 latex로 정정.
// 사전 확인: 본문에 그림/도형/그래프 참조 없는 순수 LaTeX 문제임을 확인.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// 안전: content_type이 mixed/image이고 question_image가 null/빈문자인 모든 행을 찾아 latex로 변경.
// 그림이 진짜 있는 q-import-7은 question_image에 SVG가 들어있으므로 자동 제외됨.
const PAGE = 1000;
let fixed = 0;
let scanned = 0;
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb.from("questions")
    .select("id, content_type, question_image, question")
    .in("content_type", ["mixed","image"])
    .order("id")
    .range(from, from + PAGE - 1);
  if (error) { console.error(error); process.exit(1); }
  if (!data || data.length === 0) break;
  scanned += data.length;
  for (const q of data) {
    if (q.question_image && q.question_image.length > 0) continue; // 진짜 그림 있으면 패스
    // 안전장치: 본문에 명시적 "그림" 참조가 있으면 skip (사람이 봐야 함)
    if (/\[그림\]|<그림|그림과 같이|다음 그림|다음과 같은 그림/.test(q.question || "")) {
      console.log(`  ⚠️ ${q.id}: 본문에 그림 참조 있음 — 자동 변환 스킵`);
      continue;
    }
    const { error: upErr } = await sb.from("questions").update({
      content_type: "latex",
      question_image: null,
      updated_at: new Date().toISOString()
    }).eq("id", q.id);
    if (upErr) console.error(`  ❌ ${q.id}:`, upErr.message);
    else { console.log(`  ✓ ${q.id} content_type → latex`); fixed++; }
  }
  if (data.length < PAGE) break;
}
console.log(`\n총 ${fixed}건 수정 (${scanned}건 검사)`);
