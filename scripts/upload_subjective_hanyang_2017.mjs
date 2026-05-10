// 2017년 한양대 편입수학 단답형 3문항 (Q24-26)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2017", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:24, subject:"적분학", unit:"부정적분", concept:"부분분수 + arctan",
    difficulty:"medium",
    question:"적분 $\\displaystyle\\int_0^1\\dfrac{9}{1+x^3}\\,dx$의 값이 $\\ln a+\\sqrt{3}\\pi$일 때, $a$의 값을 구하시오.",
    answer:"$8$",
    explanation:"$\\dfrac{9}{1+x^3}=\\dfrac{3}{1+x}+\\dfrac{-3x+6}{x^2-x+1}$.\n적분: $3\\ln|1+x|-\\dfrac{3}{2}\\ln|x^2-x+1|+3\\sqrt{3}\\arctan\\dfrac{2x-1}{\\sqrt{3}}$.\n$x=1$: $3\\ln 2+\\dfrac{\\sqrt{3}\\pi}{2}$. $x=0$: $-\\dfrac{\\sqrt{3}\\pi}{2}$.\n차 $=3\\ln 2+\\sqrt{3}\\pi=\\ln 8+\\sqrt{3}\\pi$. $a=8$.",
  },
  {n:25, subject:"미분학", unit:"극한과 연속", concept:"멱급수 전개",
    difficulty:"medium",
    question:"함수 $f(x)=\\ln(1+\\sin x)$를 멱급수로 전개하면 $f(x)=ax+bx^2+cx^3+\\cdots$로 나타낼 수 있다. 이 때 $3(a+b+c)$의 값은? (단, $a,b,c$는 상수, $0\\le x\\le\\pi$)",
    answer:"$2$",
    explanation:"$\\sin x=x-\\dfrac{x^3}{6}+\\cdots$, $\\ln(1+u)=u-\\dfrac{u^2}{2}+\\dfrac{u^3}{3}-\\cdots$.\n계수: $x^1$: $1$, $x^2$: $-\\dfrac{1}{2}$, $x^3$: $-\\dfrac{1}{6}+\\dfrac{1}{3}=\\dfrac{1}{6}$.\n$3(a+b+c)=3\\!\\left(1-\\dfrac{1}{2}+\\dfrac{1}{6}\\right)=3\\cdot\\dfrac{4}{6}=2$.",
  },
  {n:26, subject:"미분학", unit:"미분방정식", concept:"비동차 연립ODE 특수해",
    difficulty:"hard",
    question:"연립미분방정식 $\\begin{pmatrix}x'(t)\\\\y'(t)\\end{pmatrix}=\\begin{pmatrix}-3&1\\\\2&-4\\end{pmatrix}\\!\\begin{pmatrix}x(t)\\\\y(t)\\end{pmatrix}+\\begin{pmatrix}3t\\\\e^{-t}\\end{pmatrix}$에 대한 특수해 (particular Solution) $\\begin{pmatrix}x_p(t)\\\\y_p(t)\\end{pmatrix}$에 대하여 $100x_p'(0)+100y_p'(0)$의 값을 구하시오.",
    answer:"$105$",
    explanation:"$3t$ 부분 ($x_{p1},y_{p1}$): 다항식 형태로 풀면 $x_{p1}=\\dfrac{6t}{5}-\\dfrac{27}{50}$, $y_{p1}=\\dfrac{3t}{5}-\\dfrac{21}{50}$. $x_{p1}'(0)=\\dfrac{6}{5},\\,y_{p1}'(0)=\\dfrac{3}{5}$.\n$e^{-t}$ 부분 ($x_{p2},y_{p2}$): $(A,B)e^{-t}$ 가정 ⇒ $A=\\dfrac{1}{4},\\,B=\\dfrac{1}{2}$. $x_{p2}'(0)=-\\dfrac{1}{4},\\,y_{p2}'(0)=-\\dfrac{1}{2}$.\n$x_p'(0)=\\dfrac{19}{20},\\,y_p'(0)=\\dfrac{1}{10}$. $100\\cdot\\dfrac{19}{20}+100\\cdot\\dfrac{1}{10}=95+10=105$.",
  },
];

const TOTAL=PROBLEMS.length;
console.log(`총 ${TOTAL}문제 (단답형) 준비됨`);

const rows = PROBLEMS.map(p => {
  const id = `q-${YEAR}-${SCHOOL_EN}-${String(p.n).padStart(2,"0")}`;
  return {
    id, subject: p.subject, unit: p.unit, concept: p.concept, difficulty: p.difficulty,
    source_type: "imported", pool: "general", question: p.question, content_type: "latex",
    question_image: null, question_type: "subjective", options: [], correct_option_id: "",
    answer_text: p.answer, explanation: p.explanation, explanation_content_type: "latex",
    explanation_image: null,
    tags: [YEAR, SCHOOL_KO, "past_exam", "subjective", p.subject, p.unit, p.concept],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
});

const { data, error } = await sb.from("questions").upsert(rows, { onConflict: "id" }).select("id");
if (error) { console.error("업로드 실패:", error); process.exit(1); }
console.log(`업로드 완료: ${data.length}건`);
