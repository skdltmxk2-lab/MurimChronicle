// Inline shared passages into confirmed dependent questions and synchronize snapshots.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  STANDALONE_VALIDATOR_VERSION,
  assertStandaloneQuestion,
} from "../src/lib/questions/standaloneCore.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase service-role credentials in .env.local");

const sb = createClient(url, key);
const validatedAt = new Date().toISOString();
const fixes = [
  {
    id: "q-2022-hanyang-13",
    update: {
      question:
        "벡터공간 $M_2(\\mathbb R)$에 내적 $\\langle A,B\\rangle=\\operatorname{tr}(A^TB)$를 정의하자. $T:M_2(\\mathbb R)\\to M_2(\\mathbb R)$를 행렬 $\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$과 $\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}$이 생성하는 부분공간 $W$로의 정사영(orthogonal projection)이라 하자. 행렬 $C=\\begin{pmatrix}4&2\\\\3&1\\end{pmatrix}$의 $W$ 위로의 정사영을 $T(C)=\\begin{pmatrix}\\alpha&\\beta\\\\\\gamma&\\delta\\end{pmatrix}$라 할 때, $\\alpha+\\beta+\\gamma+\\delta$의 값은?",
    },
  },
  {
    id: "q-2022-hanyang-14",
    update: {
      question:
        "벡터공간 $M_2(\\mathbb R)$에 내적 $\\langle A,B\\rangle=\\operatorname{tr}(A^TB)$를 정의하고, $W=\\operatorname{span}\\left\\{\\begin{pmatrix}1&0\\\\0&0\\end{pmatrix},\\begin{pmatrix}1&1\\\\1&0\\end{pmatrix}\\right\\}$라 하자. $T:M_2(\\mathbb R)\\to M_2(\\mathbb R)$가 $W$로의 정사영일 때, 순서기저 $\\{E_{11},E_{12},E_{21},E_{22}\\}$에 대한 $T$의 행렬표현을 $P=(p_{ij})_{4\\times 4}$라 하자. 이때 $p_{11}+p_{22}+p_{33}+p_{44}+\\det P$의 값은? (단, $\\det P$는 $P$의 행렬식이다.)",
    },
  },
  {
    id: "q-2023-hanyang-14",
    update: {
      question:
        "실대칭행렬 $A=\\begin{pmatrix}2&1&0\\\\1&2&0\\\\0&0&2\\end{pmatrix}$의 스펙트럼 분해 $A=\\lambda_1 P_1+\\lambda_2 P_2+\\lambda_3 P_3$ ($\\lambda_1<\\lambda_2<\\lambda_3$)와 $A^{2023}=\\mu_1 Q_1+\\mu_2 Q_2+\\mu_3 Q_3$ ($\\mu_1<\\mu_2<\\mu_3$)에 대하여, $\\det Q_1-\\lambda_2+\\mu_3$의 값은? (단, $\\det Q_1$은 $Q_1$의 행렬식이다.)",
    },
  },
  {
    id: "q-2024-hanyang-14",
    update: {
      question:
        "$5\\times 5$ 실수행렬 $A$가 다음 조건을 만족한다.\n㉠ $A$와 $A^2$은 항등행렬 $I$의 상수배가 아니다.\n㉡ $A^4-4A^3+5A^2-8A+6I$는 영행렬이다.\n㉢ $A-3I$는 가역행렬이다.\n또한 고유공간 $E(1)=\\{v\\in\\mathbb R^5\\mid(A-I)v=0\\}$의 차원이 $1$보다 클 때, $A$의 특성다항식 $f(x)$에 대하여 $f(2)$의 값은?",
      explanation:
        "$x^4-4x^3+5x^2-8x+6=(x-1)(x-3)(x^2+2)$이고 $A-3I$가 가역이므로 $3$은 $A$의 고윳값이 아니다. ㉠ 때문에 최소다항식은 $(x-1)(x^2+2)$이며 서로 다른 근만 가지므로 $A$는 $\\mathbb C$에서 대각화 가능하다.\n실수행렬이므로 고윳값 $i\\sqrt2$와 $-i\\sqrt2$의 대수적 중복도는 같다. 행렬의 크기가 $5$이고 $\\dim E(1)>1$이므로 $1$의 대수적 중복도는 $3$, 나머지 두 고윳값의 중복도는 각각 $1$이다. 따라서 $f(x)=(x-1)^3(x^2+2)$이고 $f(2)=1^3\\cdot6=6$.",
    },
  },
];

for (const fix of fixes) {
  assertStandaloneQuestion(fix.update);
  const { data, error } = await sb
    .from("questions")
    .update({
      ...fix.update,
      embedding: null,
      quality_status: "approved",
      quality_reasons: [],
      validated_at: validatedAt,
      validator_version: STANDALONE_VALIDATOR_VERSION,
      updated_at: validatedAt,
    })
    .eq("id", fix.id)
    .select("id")
    .single();
  if (error) throw new Error(`${fix.id}: ${error.message}`);
  if (!data) throw new Error(`${fix.id}: question not found`);
  console.log(`updated question ${fix.id}`);
}

function toSnapshot(row) {
  return {
    id: row.id,
    subject: row.subject,
    unit: row.unit,
    concept: row.concept,
    difficulty: row.difficulty,
    question: row.question,
    contentType: row.content_type,
    questionImage: row.question_image,
    questionType: row.question_type,
    options: row.options,
    correctOptionId: row.correct_option_id,
    answerText: row.answer_text,
    explanation: row.explanation,
    explanationContentType: row.explanation_content_type,
    explanationImage: row.explanation_image,
    tags: row.tags,
  };
}

const fixedIds = fixes.map((fix) => fix.id);
const { data: rows, error: rowsError } = await sb
  .from("questions")
  .select(
    "id, subject, unit, concept, difficulty, question, content_type, question_image, question_type, options, correct_option_id, answer_text, explanation, explanation_content_type, explanation_image, tags",
  )
  .in("id", fixedIds);
if (rowsError) throw rowsError;

const snapshots = new Map((rows ?? []).map((row) => [row.id, toSnapshot(row)]));
const { data: exams, error: examsError } = await sb
  .from("generated_exams")
  .select("id, problems")
  .limit(1000);
if (examsError) throw examsError;

let syncedExams = 0;
for (const exam of exams ?? []) {
  if (!Array.isArray(exam.problems)) continue;
  let changed = false;
  const problems = exam.problems.map((problem) => {
    const snapshot = snapshots.get(String(problem?.id ?? ""));
    if (!snapshot) return problem;
    changed = true;
    return snapshot;
  });
  if (!changed) continue;
  const { error } = await sb.from("generated_exams").update({ problems }).eq("id", exam.id);
  if (error) throw new Error(`${exam.id}: ${error.message}`);
  syncedExams += 1;
}

console.log(`done: ${fixes.length} questions, ${syncedExams} generated exams`);
