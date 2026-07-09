// Sync DB rows with source-script fixes for remaining process artifacts and confirmed explanations.
//
// Usage:
//   node scripts/fix_question_quality_batch9_source_sync_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch9_source_sync_20260709.mjs
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
    id: "q-2021-sookmyung-14",
    explanation: String.raw`내부 임계점은 $f_x=2x(1+y)=0$, $f_y=2y+x^2=0$에서 $(0,0)$이고 이때 $f=4$이다. 경계 $y=1$에서는 $f(x,1)=2x^2+5$라서 범위가 $[5,7]$이고, $y=-1$에서는 $f(x,-1)=5$이다. 또 $x=\pm1$에서는 $f(\pm1,y)=y^2+y+5$이므로 $[-1,1]$에서 최댓값은 $7$, 최솟값은 $19/4$이다. 따라서 전체 최솟값은 $m=4$, 최댓값은 $M=7$이고 $M+m=11$이다.`,
  },
  {
    id: "q-2025-dku-am-20",
    explanation: String.raw`Stokes 정리를 쓴다. $\nabla\times\mathbf F=(0,0,-3x^2-3y^2)$이고, 원점에서 보아 시계 방향이 되도록 평면 $x+y+z=1$의 법선을 $(1,1,1)$ 방향으로 잡으면 벡터면적요소는 $(1,1,1)\,dA$이다. 따라서 선적분은 $\iint_{x^2+y^2\le1}-3(x^2+y^2)\,dA=-3\cdot\dfrac{\pi}{2}=-\dfrac{3\pi}{2}$이다.`,
  },
  {
    id: "q-daily-la-r15-1",
    explanation: String.raw`직선 위의 점을 $Q=(1,-1,-1)$, 방향벡터를 $\vec d=(1,2,3)$이라 두면 $\overrightarrow{QP}=(0,2,2)$이다. 점과 직선 사이의 거리는 $\dfrac{|\overrightarrow{QP}\times\vec d|}{|\vec d|}$이고, $\overrightarrow{QP}\times\vec d=(2,2,-2)$이므로 $\dfrac{2\sqrt3}{\sqrt{14}}=\sqrt{\dfrac67}$이다.`,
  },
  {
    id: "q-daily-mv-r17-2",
    explanation: String.raw`$F=x^2+2y^2-z^2-5$라 두면 $\nabla F(a,b,c)=(2a,4b,-2c)$이고 접평면의 법선은 $(1,4,2)$이다. 따라서 $(2a,4b,-2c)=\lambda(1,4,2)$라 놓으면 $a=\lambda/2,\ b=\lambda,\ c=-\lambda$이다. 곡면식에 대입하면 $\lambda^2/4+2\lambda^2-\lambda^2=5$이므로 $\lambda=\pm2$이고, $d=a+4b+2c=(5/2)\lambda>0$에서 $\lambda=2$이다. 따라서 $a+b+c+d=1+2-2+5=6$이다.`,
  },
  {
    id: "q-daily-int-r14-5",
    correct_option_id: "1",
    explanation: String.raw`$t=\sqrt{x}$로 치환하면 $x=t^2$, $dx=2t\,dt$이고 적분은 $\displaystyle\int_{2a}^{\infty}\dfrac{2}{t^2-a^2}\,dt$가 된다. 원시함수는 $\dfrac1a\ln\left|\dfrac{t-a}{t+a}\right|$이므로 적분값은 $0-\dfrac1a\ln\dfrac{a}{3a}=\dfrac{\ln3}{a}$이다. 이 값이 $1$이므로 $a=\ln3$이다.`,
  },
  {
    id: "q-2018-kwangwoon-15",
    explanation: String.raw`직선 위의 점을 $A=(1,-1,-1)$, 방향벡터를 $\vec d=(1,2,3)$이라 두면 $\vec{AP}=(0,2,2)$이다. 점과 직선 사이의 거리는 $\dfrac{|\vec{AP}\times\vec d|}{|\vec d|}$이고, $\vec{AP}\times\vec d=(2,2,-2)$이므로 $\dfrac{2\sqrt3}{\sqrt{14}}=\sqrt{\dfrac67}$이다.`,
  },
  {
    id: "q-2021-skku-20",
    explanation: String.raw`$y_p=e^t(A\cos 2t+B\sin 2t)$로 두고 대입하면 $y_p''-y_p'-2y_p=e^t[(-6A-2B)\cos2t+(2A-6B)\sin2t]$이다. 우변 $-8e^t\cos2t$와 비교하면 $A=\dfrac65,\ B=-\dfrac25$이다. 따라서 $y_p(\pi/2)=e^{\pi/2}\left(A\cos\pi+B\sin\pi\right)=-\dfrac65e^{\pi/2}$이다.`,
  },
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} source-sync quality fixes.`);
for (const fix of fixes) console.log(`- ${fix.id}: ${Object.keys(fix).filter((key) => key !== "id").join(", ")}`);

if (!dryRun) {
  const changes = [];
  for (const fix of fixes) {
    const { id, ...patch } = fix;
    const { data: before, error: fetchError } = await sb
      .from("questions")
      .select("id, subject, unit, concept, correct_option_id, explanation")
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
      previousCorrectOptionId: before.correct_option_id,
      fields: Object.keys(patch),
    });
  }

  writeFileSync(
    resolve(outDir, "question_quality_manual_fixes_20260709_batch9_source_sync.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "source-script sync for process artifacts, correct answer, and confirmed explanation fixes",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Source-sync quality fixes applied.");
} else {
  console.log("No rows were changed.");
}
