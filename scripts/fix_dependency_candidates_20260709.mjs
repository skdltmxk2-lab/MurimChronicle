// Fix confirmed dependency-audit candidates in the questions table.
//
// Usage:
//   node scripts/fix_dependency_candidates_20260709.mjs --dry-run
//   node scripts/fix_dependency_candidates_20260709.mjs
//
// This script only updates rows whose current text still contains the
// reviewed source fragments below. It does not change difficulty labels.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const root = resolve(import.meta.dirname, "..");

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

const replacements = [
  {
    id: "q-2023-ajou-49",
    reason: "문항이 누락된 오른쪽 그림에 의존하고, 해설도 48번 문항을 참조함",
    patch(row) {
      const originalQuestion =
        "오른쪽 그림처럼 두 개의 반원(반지름 $4$, $2$)과 두 개의 선분으로 이루어진 단일폐곡선 $C_2$가 있다. $C_2$의 방향은 시계 반대 방향이고 원점을 포함한다. 다음 선적분의 값은? $\\displaystyle\\int_{C_2}\\!\\dfrac{((x^2-y^2)-y(x^2+y^2)+y(x^2+y^2)^2)\\,dx+(2xy+x(x^2+y^2))\\,dy}{(x^2+y^2)^2}$";
      const originalExplanation =
        "벡터장을 셋으로 분해:\n①$\\dfrac{(x^2-y^2)dx+2xy\\,dy}{(x^2+y^2)^2}$: 위(48번)와 같은 형태로 닫힌 경로 적분 $0$.\n②$\\dfrac{-y\\,dx+x\\,dy}{x^2+y^2}$: 원점 포함 폐곡선이라 $2\\pi$ (그놈 와인딩).\n③$y\\,dx+0\\cdot dy$: 그린정리로 $\\!\\iint_R(-1)\\,dA=-(R\\,\\text{면적})$. $R$ 면적 $=\\dfrac{1}{2}\\pi\\cdot 4^2+\\dfrac{1}{2}\\pi\\cdot 2^2=8\\pi+2\\pi=10\\pi$.\n$0+2\\pi-10\\pi=-8\\pi$.";
      if (row.question !== originalQuestion || row.explanation !== originalExplanation) {
        throw new Error("reviewed q-2023-ajou-49 text does not match current DB row");
      }

      return {
        question:
          "두 개의 반원(반지름 $4$, $2$)과 두 개의 선분으로 이루어진 단일폐곡선 $C_2$가 있다. $C_2$의 방향은 시계 반대 방향이고 원점을 한 번 감싸며, $C_2$가 둘러싸는 영역의 넓이는 $10\\pi$이다. 다음 선적분의 값은? $\\displaystyle\\int_{C_2}\\!\\dfrac{((x^2-y^2)-y(x^2+y^2)+y(x^2+y^2)^2)\\,dx+(2xy+x(x^2+y^2))\\,dy}{(x^2+y^2)^2}$",
        explanation:
          "벡터장을 세 부분으로 분해한다.\n① $\\dfrac{(x^2-y^2)dx+2xy\\,dy}{(x^2+y^2)^2}=d\\!\\left(-\\dfrac{x}{x^2+y^2}\\right)$이므로 원점을 지나지 않는 닫힌 경로 $C_2$에서 적분값은 $0$이다.\n② $\\dfrac{-y\\,dx+x\\,dy}{x^2+y^2}$는 원점을 한 번 양의 방향으로 감싸므로 적분값은 $2\\pi$이다.\n③ 그린 정리에 의해 $\\displaystyle\\oint_{C_2} y\\,dx=-\\iint_R 1\\,dA=-\\operatorname{Area}(R)=-10\\pi$이다.\n따라서 $0+2\\pi-10\\pi=-8\\pi$.",
      };
    },
  },
  {
    id: "q-2024-mju-25",
    reason: "문항 안에 필요한 단면 정보가 모두 있으므로 '그림처럼' 표현 제거",
    patch(row) {
      const before = "(그림처럼 단면은 사다리꼴: 길이 방향으로 처음 $3\\text m$ 구간은 깊이 $1.5\\text m$ 일정, 다음 $6\\text m$ 구간은 직선적으로 깊어져 $3\\text m$, 마지막 $3\\text m$ 구간은 깊이 $3\\text m$ 일정.)";
      const after = "(단면은 사다리꼴이며, 길이 방향으로 처음 $3\\text m$ 구간은 깊이 $1.5\\text m$ 일정, 다음 $6\\text m$ 구간은 직선적으로 깊어져 $3\\text m$, 마지막 $3\\text m$ 구간은 깊이 $3\\text m$ 일정.)";
      if (!row.question.includes(before)) throw new Error("reviewed q-2024-mju-25 fragment not found");
      return { question: row.question.replace(before, after) };
    },
  },
  {
    id: "q-ryu-self-warmup-r02-06",
    reason: "해설의 그래프 언급을 식 기반 설명으로 교체",
    patch(row) {
      const before =
        "$F(x)=\\int_0^xf(t)\\,dt$는 $x=1$에서 좌우 정의가 이어져 연속이지만, $F'(x)=f(x)$의 좌우값이 달라 미분은 안 된다. 그래프를 보면 $F$는 $0\\le x\\le2$에서 증가하고 $x=2$에서 최대이므로, $[1,3]$에서 감소한다는 설명이 틀리다.";
      const after =
        "$F(x)=\\int_0^xf(t)\\,dt$는 $x=1$에서 좌우 정의가 이어져 연속이지만, $F'(x)=f(x)$의 좌우값이 달라 미분은 안 된다. 또한 $F'(x)=f(x)$이고 $f(x)>0$은 $0<x<2$, $f(x)<0$은 $2<x<3$에서 성립하므로 $F$는 $0\\le x\\le2$에서 증가하고 $x=2$에서 최대가 된다. 따라서 $[1,3]$에서 감소한다는 설명이 틀리다.";
      if (row.explanation !== before) throw new Error("reviewed q-ryu-self-warmup-r02-06 explanation does not match");
      return { explanation: after };
    },
  },
  {
    id: "q-white-final-a-r07-9",
    reason: "해설의 아래 그림 참조를 대수적 영역 설명으로 교체",
    patch(row) {
      const before =
        "따라서 구하는 부피를 $x y$ 평면에 정사영하면 아래 그림과 같이 나온다. 해당 영역을 $D$ 라 하면 그 중 1 사분면 영역을 $D_{1}$ 이라 하자.";
      const after =
        "따라서 구하는 부피를 $xy$ 평면에 정사영한 영역을 $D$라 하고, 그중 1사분면 영역을 $D_{1}$이라 하자.";
      if (!row.explanation.includes(before)) throw new Error("reviewed q-white-final-a-r07-9 fragment not found");
      return { explanation: row.explanation.replace(before, after) };
    },
  },
  {
    id: "q-white-final-a-r08-25",
    reason: "해설의 아래 그림 참조를 대칭성 설명으로 교체",
    patch(row) {
      const before = "영역을 그려보면 아래와 같다.\n따라서 아래 그림의 영역 넓이를 구한 후 16 배를 적용하면 된다.";
      const after = "대칭성에 의해 한 조각의 넓이를 구한 후 16배를 적용하면 된다.";
      if (!row.explanation.includes(before)) throw new Error("reviewed q-white-final-a-r08-25 fragment not found");
      return { explanation: row.explanation.replace(before, after) };
    },
  },
  {
    id: "q-white-final-a-r10-10",
    reason: "해설의 아래 그림 참조를 매개화 설명으로 교체",
    patch(row) {
      const before = "매개화를 그려보면 아래 그림과 같이 나온다.";
      const after = "매개화를 이용해 둘러싸인 영역을 확인할 수 있다.";
      const before2 = "$\\Rightarrow x^{2}=4(1+y)(1-y)^{3}$\n을 그려봐도 위와 동일하다.";
      const after2 = "$\\Rightarrow x^{2}=4(1+y)(1-y)^{3}$ 이므로 같은 영역을 얻는다.";
      if (!row.explanation.includes(before) || !row.explanation.includes(before2)) {
        throw new Error("reviewed q-white-final-a-r10-10 fragment not found");
      }
      return {
        explanation: row.explanation.replace(before, after).replace(before2, after2),
      };
    },
  },
];

const ids = replacements.map((replacement) => replacement.id);
const { data: rows, error: fetchError } = await sb
  .from("questions")
  .select("id, question, explanation")
  .in("id", ids);
if (fetchError) throw fetchError;

const rowsById = new Map((rows ?? []).map((row) => [row.id, row]));
const missingIds = ids.filter((id) => !rowsById.has(id));
if (missingIds.length) throw new Error(`Missing DB rows: ${missingIds.join(", ")}`);

const updates = [];
for (const replacement of replacements) {
  const row = rowsById.get(replacement.id);
  const patch = replacement.patch(row);
  updates.push({ id: replacement.id, reason: replacement.reason, patch });
}

console.log(`${dryRun ? "Dry run" : "Applying"} ${updates.length} dependency text fixes.`);
for (const update of updates) {
  console.log(`- ${update.id}: ${update.reason}`);
  if (dryRun) continue;

  const { error: updateError } = await sb
    .from("questions")
    .update({ ...update.patch, updated_at: new Date().toISOString() })
    .eq("id", update.id);
  if (updateError) throw updateError;
}

console.log(dryRun ? "No rows were changed." : "Dependency text fixes applied.");
