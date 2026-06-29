// 1차 수정 후 발견된 동치 4건 추가 처리
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
  // q-daily-int-r10-3: 정답(1)=5050, (5) 100·101/2도 5050 — (5)를 99·100/2(=4950)로
  ["q-daily-int-r10-3", [{ id: "5", newText: "$\\dfrac{99\\cdot 100}{2}$" }]],
  // q-daily-r30-2: 정답(1)=∛(50/π), (4) 동일 — (4)를 ∛(25/π)로
  ["q-daily-r30-2", [{ id: "4", newText: "$\\sqrt[3]{\\dfrac{25}{\\pi}}$" }]],
  // q-daily-r31-5: (2) 27/10, (4) 81/30 동일 — (4)를 81/40로
  ["q-daily-r31-5", [{ id: "4", newText: "$\\dfrac{81}{40}$" }]],
  // q-daily-r7-2: 정답(3)=-2+√2, (1) √2-2 동일 — (1)을 √2-1로
  ["q-daily-r7-2", [{ id: "1", newText: "$\\sqrt 2-1$" }]],
];

// 잠깐 — q-daily-int-r10-3의 (5)를 99·100/2로 되돌리면 또 다른 4950과 동치가 될까?
// 정답(1)이 5050이고 99·100/2=4950이라 안 겹침. OK.
// q-daily-r30-2의 (4)를 ∛(25/π)로 되돌리면 — 1차 수정 전 상태로 돌아감.
//   다른 옵션들이 ∛(25/π)인지 확인 필요. report 보니 (3)이 ∛(25/π)였음.
// 따라서 (4)를 ∛(25/π)로 하면 (3)과 충돌. 다른 값 필요.
// (4)를 ∛(100/π)로 변경.
fixes[1] = ["q-daily-r30-2", [{ id: "4", newText: "$\\sqrt[3]{\\dfrac{100}{\\pi}}$" }]];

let ok = 0, fail = 0;
for (const [qId, edits] of fixes) {
  const { data, error: fetchErr } = await sb.from("questions").select("options").eq("id", qId).maybeSingle();
  if (fetchErr || !data) { console.error(`FAIL fetch ${qId}: ${fetchErr?.message}`); fail++; continue; }
  const options = (data.options || []).map((o) => {
    const edit = edits.find((e) => String(e.id) === String(o.id));
    if (!edit) return o;
    return { ...o, text: edit.newText };
  });
  const { error: upErr } = await sb.from("questions").update({ options, updated_at: new Date().toISOString() }).eq("id", qId);
  if (upErr) { console.error(`FAIL update ${qId}: ${upErr.message}`); fail++; continue; }
  ok++;
  console.log(`✓ ${qId} — ${edits.length}개 선지 수정`);
}
console.log(`\n수정 완료: ${ok}건, 실패: ${fail}건`);
