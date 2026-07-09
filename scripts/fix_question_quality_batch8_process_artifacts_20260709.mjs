// Clean remaining process-artifact explanations found by direct phrase search.
//
// Usage:
//   node scripts/fix_question_quality_batch8_process_artifacts_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch8_process_artifacts_20260709.mjs
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
    id: "q-2024-hanyang-13",
    explanation: String.raw`$x^4-4x^3+5x^2-8x+6=(x-1)(x-3)(x^2+2)$이므로 $m(x)$는 이 다항식의 약수이다. ㉢에서 $A-3I$가 가역이므로 $3$은 고유값이 아니고 $m(x)$에는 $(x-3)$이 들어가지 않는다. ㉠ 때문에 $m(x)=x-1$이면 $A=I$가 되어 안 되고, $m(x)=x^2+2$이면 $A^2=-2I$가 되어 안 된다. 따라서 $m(x)=(x-1)(x^2+2)$이고 $m(3)=2\cdot11=22$이다.`,
  },
  {
    id: "q-2023-soongsil-23",
    difficulty: "mediumHard",
    explanation: String.raw`$z$부터 적분하면 $\int_0^{3x}(x^2+y^2+z^2)\,dz=3x^3+3xy^2+9x^3=12x^3+3xy^2$이다. 따라서 $\int_0^{\sqrt y}(12x^3+3xy^2)\,dx=3y^2+\dfrac32y^3$이고, 마지막으로 $\int_0^2(3y^2+\dfrac32y^3)\,dy=8+6=14$이다.`,
  },
  {
    id: "q-2025-dku-pm-23",
    explanation: String.raw`$[\langle5,-1,9\rangle]_B=\langle1,a,2\rangle$이므로 $1(1,2,1)+a(2,9,0)+2(3,3,4)=(5,-1,9)$이다. 왼쪽을 정리하면 $(7+2a,8+9a,9)$이고 첫 성분에서 $7+2a=5$이므로 $a=-1$이다. 이때 둘째 성분도 $8+9(-1)=-1$로 일치한다.`,
  },
  {
    id: "q-2025-hanyang-16",
    explanation: String.raw`특성방정식은 $(\lambda+1)(\lambda+4)=0$이고 우변 $6e^{-t}$가 제차해의 $e^{-t}$와 겹치므로 특수해를 $y_p=Cte^{-t}$로 둔다. 대입하면 $C=2$라서 $y_p=2te^{-t}$이다. 제차해 $Ae^{-t}+Be^{-4t}$에 초기조건을 넣으면 $A+B=2,\ -A-4B+2=3$이므로 $A=3,\ B=-1$이다. 따라서 $y(1)=3e^{-1}-e^{-4}+2e^{-1}=5e^{-1}-e^{-4}$이다.`,
  },
  {
    id: "q-2018-sogang-20",
    explanation: String.raw`먼저 $(1,3,7)=\alpha(1,2,3)+\beta(2,3,4)+\gamma(3,5,6)$으로 놓고 풀면 $\alpha=5,\ \beta=1,\ \gamma=-2$이다. 선형성을 이용하면 $T(1,3,7)=5T(1,2,3)+T(2,3,4)-2T(3,5,6)=(4,-1,-2)$이다. 따라서 $abc=4\cdot(-1)\cdot(-2)=8$이다.`,
  },
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} process-artifact explanation fixes.`);
for (const fix of fixes) console.log(`- ${fix.id}: ${Object.keys(fix).filter((key) => key !== "id").join(", ")}`);

if (!dryRun) {
  const changes = [];
  for (const fix of fixes) {
    const { id, ...patch } = fix;
    const { data: before, error: fetchError } = await sb
      .from("questions")
      .select("id, subject, unit, concept, difficulty, explanation")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const update = { ...patch, updated_at: new Date().toISOString() };
    const { error: updateError } = await sb.from("questions").update(update).eq("id", id);
    if (updateError) throw updateError;

    changes.push({
      id,
      subject: before.subject,
      unit: before.unit,
      concept: before.concept,
      previousDifficulty: before.difficulty,
      fields: Object.keys(patch),
    });
  }

  writeFileSync(
    resolve(outDir, "question_quality_manual_fixes_20260709_batch8_process_artifacts.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "remaining process-artifact explanations and one confirmed difficulty label",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Process-artifact explanation fixes applied.");
} else {
  console.log("No rows were changed.");
}
