// Final cleanup for remaining answer-only/source-artifact explanations.
//
// Usage:
//   node scripts/fix_question_quality_batch5_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch5_20260709.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "tmp", "audit");
mkdirSync(outDir, { recursive: true });

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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials in .env.local");

const sb = createClient(supabaseUrl, supabaseKey);

const fixes = [
  {
    id: "q-white-final-a-r13-11",
    rationale: "정답만 있던 행렬식 명제 해설 보강",
    patch: {
      explanation:
        "ㄱ은 거짓이다. $\\det(AB)=\\det A\\det B=\\det B\\det A=\\det(BA)$는 항상 성립하지만, 이것만으로 $AB=BA$가 되지는 않는다. ㄴ도 거짓이다. $\\det A=0$은 $A$가 특이행렬이라는 뜻이지 영행렬이라는 뜻은 아니다. ㄷ은 $\\det(-A)=(-1)^n\\det A$이므로 $n$이 짝수이면 $\\det A$가 되어 항상 $-\\det A$라고 할 수 없다. ㄹ은 $\\det A\\ne0$이면 가역행렬이라는 표준 정리이므로 참이다. 따라서 틀린 것은 ㄱ, ㄴ, ㄷ이다.",
    },
  },
  {
    id: "q-white-final-a-r14-27",
    rationale: "해설 앞 문제번호 제거 및 사영 설명 정리",
    patch: {
      explanation:
        "$A$의 세 열벡터는 $(1,1,1)^T$, $(1,2,3)^T$, $(2,3,4)^T$이다. 사영하려는 벡터 $(1,1,1)^T$가 이미 $A$의 첫 번째 열벡터이므로 $T$의 치역, 즉 열공간 위에 놓여 있다. 열공간 위의 벡터를 그 열공간에 정사영하면 자기 자신이므로 사영점은 $(a,b,c)=(1,1,1)$이다. 따라서 $a+b+c=3$이다.",
    },
  },
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} final quality cleanup fixes.`);
for (const fix of fixes) {
  console.log(`- ${fix.id}: ${fix.rationale}`);
}

if (!dryRun) {
  const changes = [];
  for (const fix of fixes) {
    const { data: before, error: fetchError } = await sb
      .from("questions")
      .select("id, subject, unit, concept")
      .eq("id", fix.id)
      .single();
    if (fetchError) throw fetchError;

    const { error: updateError } = await sb
      .from("questions")
      .update({ ...fix.patch, updated_at: new Date().toISOString() })
      .eq("id", fix.id);
    if (updateError) throw updateError;

    changes.push({
      id: fix.id,
      rationale: fix.rationale,
      subject: before.subject,
      unit: before.unit,
      concept: before.concept,
      fields: Object.keys(fix.patch),
    });
  }

  writeFileSync(
    resolve(outDir, "question_quality_manual_fixes_20260709_batch5.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "manual final quality cleanup batch 5",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Final quality cleanup fixes applied.");
} else {
  console.log("No rows were changed.");
}
