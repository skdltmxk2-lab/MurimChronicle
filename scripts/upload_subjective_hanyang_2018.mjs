// 2018년 한양대 편입수학 단답형 3문항 (Q24-26)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2018", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:24, subject:"적분학", unit:"정적분의 응용", concept:"실린더 셸 회전체",
    difficulty:"medium",
    question:"곡선 $y=f(x)=\\begin{cases}\\dfrac{\\tanh x}{x}&,x\\ne 0\\\\1&,x=0\\end{cases}$와 세 직선 $x=\\ln 2,\\,x=0,\\,y=0$으로 둘러싸인 영역을 $y$축 둘레로 회전시킨 부피가 $2\\pi\\ln a$일 때, $20a$의 값을 구하시오.",
    answer:"$25$",
    explanation:"실린더 셸: $V=\\!\\int_0^{\\ln 2}2\\pi x\\cdot\\dfrac{\\tanh x}{x}\\,dx=2\\pi\\!\\int_0^{\\ln 2}\\tanh x\\,dx=2\\pi[\\ln\\cosh x]_0^{\\ln 2}$.\n$\\cosh(\\ln 2)=\\dfrac{2+1/2}{2}=\\dfrac{5}{4}$.\n$V=2\\pi\\ln\\dfrac{5}{4}$. $a=\\dfrac{5}{4}$, $20a=25$.",
  },
  {n:25, subject:"선형대수", unit:"고유치와 대각화", concept:"닮음 행렬 / 최소다항식",
    difficulty:"hard",
    question:"행렬 $B$는 행렬 $A=\\begin{pmatrix}3&1&-5\\\\0&2&6\\\\0&0&a\\end{pmatrix}$의 닮은행렬(Similar matrix)이고 행렬 $B$의 고유다항식(Characteristic polynomial)은 $f(x)=x^3+bx^2+cx-12$이다. 행렬 $B$의 최소다항식(Minimal polynomial)의 차수(degree)를 $d$라 할 때 $a+b+c+d$의 값을 구하시오.",
    answer:"$14$",
    explanation:"$A$의 char poly $=(x-3)(x-2)(x-a)=x^3-(5+a)x^2+(6+5a)x-6a$.\n$-6a=-12\\Rightarrow a=2$. $b=-7,\\,c=16$.\n$A$ ($a=2$)에서 고윳값 $3$ (단순), $2$ (중복도 $2$). $(A-2I)$의 rank $2$ ⇒ 고유공간 차원 $1$, 대각화 X.\n최소다항식 $(x-3)(x-2)^2$, 차수 $d=3$.\n$a+b+c+d=2-7+16+3=14$.",
  },
  {n:26, subject:"미분학", unit:"미분방정식", concept:"연립ODE 일계 선형",
    difficulty:"medium",
    question:"$\\begin{cases}2\\dfrac{dx}{dt}+\\dfrac{dy}{dt}-y=t\\\\\\dfrac{dx}{dt}+\\dfrac{dy}{dt}=t^2\\end{cases},\\,x(0)=1,\\,y(0)=0$을 만족하는 함수 $x(t),\\,y(t)$에 대하여 $x(1)+y(1)=\\dfrac{p}{q}$ (단, $p$와 $q$는 서로소) 일 때 $p+q$의 값을 구하시오.",
    answer:"$7$",
    explanation:"두 식 차로 $y'=-y+2t^2-t$. 적분인자 $e^t$:\n$y\\,e^t=e^t(2t^2-5t+5)+C$, $y(0)=0\\Rightarrow C=-5$.\n$y=2t^2-5t+5-5e^{-t}$.\n$x'=t^2-y'=t^2-4t+5-5e^{-t}$, $x(0)=1\\Rightarrow x=\\dfrac{t^3}{3}-2t^2+5t+5e^{-t}-4$.\n$x(1)+y(1)=\\!\\left(-\\dfrac{2}{3}+\\dfrac{5}{e}\\right)+\\!\\left(2-\\dfrac{5}{e}\\right)=\\dfrac{4}{3}$.\n$p+q=4+3=7$.",
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
