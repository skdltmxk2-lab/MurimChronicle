// A+B 처리: import 재실행 중복, sample 잔재 제거
// 정책:
//  - 같은 정규화-질문+정답인 그룹에서 정식 학교 ID(q-YYYY-...)가 존재하면 q-import-*, q-sample-* 모두 삭제
//  - 정식 ID가 없고 q-import-* 만 여러 개면 가장 오래된 1개만 남기고 나머지 삭제
// 실행: node scripts/_dedupe_ab.mjs --apply
//   (apply 플래그 없으면 dry-run으로 어떤 ID가 지워질지 출력만)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");
const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const all = [];
let from = 0;
const PAGE = 1000;
while (true) {
  const { data, error } = await sb.from("questions")
    .select("id, question, options, correct_option_id, tags, created_at")
    .order("created_at", { ascending: true })
    .range(from, from + PAGE - 1);
  if (error) { console.error(error); process.exit(1); }
  if (!data?.length) break;
  all.push(...data);
  if (data.length < PAGE) break;
  from += PAGE;
}

function normalize(s) {
  return (s || "")
    .replace(/\s+/g, "")
    .replace(/[\(\)\[\]{}]/g, "")
    .replace(/\\!/g, "")
    .replace(/\\,/g, "")
    .replace(/\\;/g, "")
    .replace(/\\\\/g, "")
    .replace(/\\displaystyle/g, "")
    .replace(/\\dfrac/g, "\\frac")
    .replace(/[\.,;:`'"]/g, "")
    .toLowerCase();
}
function ans(q) {
  const op = (q.options || []).find((o) => String(o.id) === String(q.correct_option_id));
  return op ? normalize(op.text || op.label || "") : "";
}

const groups = new Map();
for (const q of all) {
  const k = normalize(q.question) + "||" + ans(q);
  if (!k || k.length < 20) continue;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(q);
}

const toDelete = [];
for (const g of groups.values()) {
  if (g.length <= 1) continue;
  // A+B 대상만: q-import- 또는 q-sample- 포함된 그룹
  const hasImportOrSample = g.some((q) => q.id.startsWith("q-import-") || q.id.startsWith("q-sample-"));
  if (!hasImportOrSample) continue;

  // 정식 학교 ID 후보
  const proper = g.filter((q) => !q.id.startsWith("q-import-") && !q.id.startsWith("q-sample-"));
  if (proper.length > 0) {
    // 정식이 있으면 q-import-*, q-sample-* 모두 삭제
    for (const q of g) {
      if (q.id.startsWith("q-import-") || q.id.startsWith("q-sample-")) {
        toDelete.push({ id: q.id, reason: `정식 ID 존재: ${proper.map((p) => p.id).join(",")}` });
      }
    }
  } else {
    // 정식 없고 import만 여러 개 → 가장 오래된 것 1개만 남김
    const sorted = [...g].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const survivor = sorted[0];
    for (const q of sorted.slice(1)) {
      toDelete.push({ id: q.id, reason: `import 재실행 중복, 생존: ${survivor.id}` });
    }
  }
}

console.log(`총 ${all.length}문항, 삭제 대상: ${toDelete.length}개`);
for (const d of toDelete) {
  console.log(`  - ${d.id}  // ${d.reason}`);
}

if (!APPLY) {
  console.log(`\n[DRY-RUN] 실제 삭제하려면 --apply 추가`);
  process.exit(0);
}

let ok = 0, fail = 0;
for (const d of toDelete) {
  const { error } = await sb.from("questions").delete().eq("id", d.id);
  if (error) { console.error(`FAIL ${d.id}: ${error.message}`); fail++; }
  else { ok++; }
}
console.log(`\n삭제 완료: ${ok}건, 실패: ${fail}건`);
