// Remove stale figure references from questions that already describe the geometry in text.
// Updates both canonical questions and generated exam snapshots.
// Usage:
//   node scripts/fix_missing_figure_references.mjs --dry-run
//   node scripts/fix_missing_figure_references.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const dryRun = process.argv.includes("--dry-run");

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
const PAGE = 1000;

const questionFixes = new Map([
  [
    "q-2019-dankook-42",
    String.raw`경로 $C$는 원점 $O(0,0,0)$부터 점 $A(2,1,1)$까지 직육면체의 변을 따라 움직이는 경로이다. 벡터장 $\vec{F}(x,y,z)=\langle e^y,xe^y-e^z,-ye^z\rangle$일 때 선적분 $\displaystyle\int_C\vec{F}\cdot d\vec{r}$의 값은?`,
  ],
  [
    "q-2019-hongik-07",
    String.raw`원점이 중심이고 반지름이 $1$인 원과 원점이 중심이고 반지름이 $2$인 원에 의해 유계된 영역 중 1사분면과 2사분면에 있는 영역을 $R$이라 할 때 $\!\displaystyle\iint_R(x+4y^2)dA$의 값을 구하면?`,
  ],
  [
    "q-2020-dankook-44",
    String.raw`곡선 $C$는 육면체의 변을 따라 꼭짓점 $(3,2,3)$에서 $(0,7,5)$까지 연결되는 네 개의 선분으로 구성된다. 벡터장 $\vec{F}(x,y,z)=\langle y^2,2xy+e^{3z},3ye^{3z}\rangle$일 때, 선적분 $\displaystyle\int_C\vec{F}\cdot d\vec{r}$의 값은?`,
  ],
  [
    "q-2021-sogang-07",
    String.raw`곡선 $C$가 $P(1,0)$에서 $Q(2,0)$까지의 선분, $Q$에서 $R(0,2)$까지의 중심이 원점이고 반지름이 $2$인 원의 호, $R$에서 $S(0,1)$까지의 선분, 그리고 $S$에서 $P$까지의 중심이 원점이고 반지름이 $1$인 원의 호로 이루어진 곡선일 때, 선적분 $\displaystyle\int_C(2x^2y^2+y^4)\,dx+(ye^{-2y})\,dy$의 값은?`,
  ],
  [
    "q-2021am-dankook-32",
    String.raw`삼차함수 $f(x)$의 도함수 $f'(x)$의 영점이 $-1,1$이다. 함수 $f(x)$의 극솟값이 $-4$이고 극댓값이 $0$일 때, $f(3)$의 값은?`,
  ],
  [
    "q-2021pm-dankook-42",
    String.raw`곡선 $C$는 (i) 점 $(0,0)$에서 점 $(1,e)$까지 선분 $C_1$, (ii) 곡선 $y=e^x$ 위의 점 $(1,e)$에서 점 $(2,e^2)$까지 호 $C_2$, (iii) 곡선 $y=\dfrac{e^2}{4}(x-4)^2$ 위의 점 $(2,e^2)$에서 점 $(4,0)$까지 호 $C_3$로 이루어져 있다. 벡터장 $\vec{F}(x,y)=\langle 3+2xy,\,x^2-3y^2+\cos y^2\rangle$에 대하여 선적분 $\displaystyle\int_C\vec{F}\cdot d\vec{r}$의 값은?`,
  ],
  [
    "q-2022-hanyang-22",
    String.raw`원 $(x-15)^2+y^2=5^2$에서 1사분면에 있고 원의 중심으로부터 각도 $0$에서 $\dfrac{\pi}{6}$까지인 호 $C$를 $y$축 중심으로 회전하여 얻은 곡면의 넓이가 $a\pi+b\pi^2$일 때, $a+b$의 값을 구하시오. (단, $a,b$는 정수이다.)`,
  ],
  [
    "q-2022-sogang-14",
    String.raw`곡선 $C$가 $P(1,0)$에서 $Q(0,1)$까지의 선분, $Q$에서 $R(-1,0)$까지의 선분, $R$에서 $P$까지의 선분으로 이루어진 곡선일 때, $C$ 위에서 벡터 $\vec{F}(x,y)=-\dfrac{y}{x^2+y^2}\vec{i}+\dfrac{x}{x^2+y^2}\vec{j}$의 선적분의 값은?`,
  ],
  [
    "q-2022am-dankook-42",
    String.raw`곡선 $C$는 세 점 $(0,0),(0,1),(1,0)$을 꼭짓점으로 하는 삼각형의 경계일 때, 벡터장 $\vec{F}(x,y)=\langle 3x^4,xy\rangle$에 대하여 선적분 $\displaystyle\int_C\vec{F}\cdot d\vec{r}$의 값은? (시계방향)`,
  ],
  [
    "q-2024-mju-22",
    String.raw`관측 장비가 직선 $l$에서 $1\text m$만큼 떨어진 점 $P$에 위치하고 있다. 두 물체 $A,B$가 점 $P$에서 가장 가까운 직선 위의 점 $S$에서 같은 방향으로 동시에 출발하여 직선 $l$을 따라 움직인다. $A$의 속도가 $1\text{m/min}$이고 $B$의 속도가 $3\text{m/min}$으로 일정할 때 각 $\angle APB$의 크기 $\theta$의 최댓값은? (단, $0\le\theta\le\dfrac{\pi}{2}$)`,
  ],
  [
    "q-2024pm-dankook-43",
    String.raw`곡선 $C$는 영역 $y=e^{x^2}$, $x$축, $x=1$로 둘러싸인 부분의 경계를 점 $(0,1)$에서 출발하여 시계 반대 방향으로 한 바퀴 돈 뒤 다시 점 $(0,1)$로 돌아오는 경로이다. 벡터장 $\vec{F}(x,y)=\langle\sin y,\,x^2+x\cos y\rangle$에 대하여, 선적분 $\displaystyle\int_C\vec{F}\cdot d\vec{r}$의 값은?`,
  ],
  [
    "q-2025-ajou-25",
    String.raw`$xy$평면의 곡선 $C$가 점 $(-1,0)$에서 출발하여 선분을 따라 점 $(0,0)$까지 진행한 뒤, 원 $x^2+(y-1)^2=1$의 오른쪽 반원을 따라 점 $(0,2)$까지 진행한다. 이때, 선적분 $\displaystyle\int_C(xy+1)dx+x\,dy$를 구하세요.`,
  ],
  [
    "q-2025-mju-03",
    String.raw`실수 $a$가 $0<a<2$일 때, 포물선 $y=(x-2)^2$ 위의 점 $(a,(a-2)^2)$에서의 접선과 포물선 및 $x$축과 $y$축으로 둘러싸인 부분의 넓이를 $S(a)$라 하자. $S(a)$의 값이 최소가 되도록 하는 $a$의 값은?`,
  ],
  [
    "q-2025-mju-07",
    String.raw`두 직선도로가 한 지점 $O$에서 만나고, 점 $O$에서 두 도로가 이루는 각의 크기는 $60°$이다. 두 자동차 $A,B$가 점 $O$에서 동시에 출발하여 두 도로를 따라 달리고 있다. 자동차 $A$의 속도는 $80\,\mathrm{km/h}$이고 자동차 $B$의 속도는 $60\,\mathrm{km/h}$일 때, $30$분 후 두 자동차 $A,B$ 사이의 거리의 변화율은? (단, 변화율의 단위는 $\mathrm{km/h}$이고, 도로의 폭은 무시한다.)`,
  ],
]);

async function fetchAll(table, select) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await sb
      .from(table)
      .select(select)
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

const ids = [...questionFixes.keys()];
const updatedAt = new Date().toISOString();

console.log("Fetching target questions...");
const { data: questionRows, error: questionError } = await sb
  .from("questions")
  .select("id, question")
  .in("id", ids);
if (questionError) throw questionError;

let questionChanged = 0;
const questionExamples = [];
const foundIds = new Set();

for (const row of questionRows ?? []) {
  foundIds.add(row.id);
  const question = questionFixes.get(row.id);
  if (row.question === question) continue;
  questionChanged += 1;
  questionExamples.push(row.id);
  if (!dryRun) {
    const { error } = await sb
      .from("questions")
      .update({ question, updated_at: updatedAt })
      .eq("id", row.id);
    if (error) throw error;
  }
}

const missingQuestions = ids.filter((id) => !foundIds.has(id));

console.log("Fetching generated exams...");
const exams = await fetchAll("generated_exams", "id, problems");

let examChanged = 0;
const examExamples = [];

for (const exam of exams) {
  if (!Array.isArray(exam.problems)) continue;
  let changed = false;
  const problems = exam.problems.map((problem) => {
    const id = problem?.id ?? problem?.question_id ?? problem?.questionId;
    const question = questionFixes.get(id);
    if (!question || problem.question === question) return problem;
    changed = true;
    return { ...problem, question };
  });

  if (!changed) continue;
  examChanged += 1;
  examExamples.push(exam.id);
  if (!dryRun) {
    const { error } = await sb
      .from("generated_exams")
      .update({ problems })
      .eq("id", exam.id);
    if (error) throw error;
  }
}

console.log("\n=== Missing Figure Reference Fix ===");
console.log(JSON.stringify({
  dryRun,
  questionChanged,
  examChanged,
  questionExamples,
  examExamples,
  missingQuestions,
}, null, 2));
