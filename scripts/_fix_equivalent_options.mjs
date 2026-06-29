// 동치 선지 14건 수정 — 정답이 아닌 쪽 보기를 새 값으로 교체
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

// {질문ID: [{optionId, newText}, ...]}
const fixes = [
  // 1. q-2019-ewha-03 — (3) 2018·2020 → 2017·2021 (=4076357, 다른 값)
  ["q-2019-ewha-03", [{ id: "3", newText: "$2017\\cdot 2021$" }]],
  // 2. q-2021pm-ajou-33 — (5) 64π/5 → 64π/3
  ["q-2021pm-ajou-33", [{ id: "5", newText: "$\\dfrac{64\\pi}{3}$" }]],
  // 3. q-2024-hansung-16 — (3) 81 → 79
  ["q-2024-hansung-16", [{ id: "3", newText: "$79$" }]],
  // 4. q-2025-kw-09 — (5) 2(e+1) → 2(e-1)
  ["q-2025-kw-09", [{ id: "5", newText: "$2(e-1)$" }]],
  // 5. q-daily-eng-r14-2 — (3) 4e^-0.1+2e^-0.1 → 4e^-0.1+3e^-0.1 (=7e^-0.1)
  ["q-daily-eng-r14-2", [{ id: "3", newText: "$4e^{-0.1}+3e^{-0.1}$" }]],
  // 6. q-daily-eng-r26-6 — (4) 12π/3 → 15π/3
  ["q-daily-eng-r26-6", [{ id: "4", newText: "$\\dfrac{15\\pi}{3}$" }]],
  // 7. q-daily-eng-r3-4 — (5) ∛8 → ∛9
  ["q-daily-eng-r3-4", [{ id: "5", newText: "$\\sqrt[3]{9}$" }]],
  // 8. q-daily-int-r10-3 — (5) 99·100/2 → 100·101/2
  ["q-daily-int-r10-3", [{ id: "5", newText: "$\\dfrac{100\\cdot 101}{2}$" }]],
  // 9. q-daily-int-r11-3 — (4) 2·1007 → 2·1006
  ["q-daily-int-r11-3", [{ id: "4", newText: "$2\\cdot 1006$" }]],
  // 10. q-daily-int-r29-3 — (3) 10!/10 → 10!/9
  ["q-daily-int-r29-3", [{ id: "3", newText: "$\\dfrac{10!}{9}$" }]],
  // 11. q-daily-la-r24-4 — (4) -15/24 → -17/24
  ["q-daily-la-r24-4", [{ id: "4", newText: "$-\\dfrac{17}{24}$" }]],
  // 12. q-daily-la-r24-5 — (4) 152/108 → 152/109
  ["q-daily-la-r24-5", [{ id: "4", newText: "$\\dfrac{152}{109}$" }]],
  // 13. q-daily-r15-1 — (3) -1/3! → -1/4! (=-1/24)
  ["q-daily-r15-1", [{ id: "3", newText: "$-\\dfrac{1}{4!}$" }]],
  // 14. q-daily-r30-2 — (4) ∛(50/2π) → ∛(50/π) (=∛(2·25/π), 다른 값)
  ["q-daily-r30-2", [{ id: "4", newText: "$\\sqrt[3]{\\dfrac{50}{\\pi}}$" }]],
];

let ok = 0, fail = 0;
for (const [qId, edits] of fixes) {
  // 현재 옵션 가져오기
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
