// 2019년 한양대 편입수학 단답형 5문항 (Q22-26)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2019", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:22, subject:"적분학", unit:"급수의 수렴/발산", concept:"멱급수 수렴구간",
    difficulty:"medium",
    question:"멱급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(n!)^3}{(3n)!}(x-30)^n$의 수렴반경이 $r$이고 수렴구간이 $(a,b)$일 때, $r+a+b$의 값을 구하시오.",
    answer:"$87$",
    explanation:"비율판정: $\\dfrac{a_{n+1}}{a_n}=\\dfrac{((n+1)!)^3}{(n!)^3}\\cdot\\dfrac{(3n)!}{(3n+3)!}=\\dfrac{(n+1)^3}{(3n+3)(3n+2)(3n+1)}\\to\\dfrac{1}{27}$.\n수렴반경 $r=27$. 중심 $30$이므로 수렴구간 $(3,57)$ (양 끝점 발산).\n$r+a+b=27+3+57=87$.",
  },
  {n:23, subject:"선형대수", unit:"선형변환", concept:"부분공간 정사영",
    difficulty:"medium",
    question:"벡터 $\\vec{v}=(1,1,1,1,1)$과 $\\vec{w}=(-2,-1,0,2,3)$이 생성하는 $\\mathbb{R}^5$의 부분공간을 $W$라 할 때, 벡터 $\\vec{u}=(4,2,1,1,1)$의 $W$ 위로의 정사영을 $P_W(\\vec{u})=(u_1,u_2,u_3,u_4,u_5)$라 하자. 이 때 $2(u_1^2+u_2^2+u_3^2+u_4^2+u_5^2)$의 값을 구하시오.",
    answer:"$41$",
    explanation:"$\\vec{v}\\cdot\\vec{v}=5,\\,\\vec{v}\\cdot\\vec{w}=2,\\,\\vec{w}\\cdot\\vec{w}=18$. $\\vec{u}\\cdot\\vec{v}=9,\\,\\vec{u}\\cdot\\vec{w}=-5$.\n$G^{-1}=\\dfrac{1}{86}\\begin{pmatrix}18&-2\\\\-2&5\\end{pmatrix}$. 계수 $(2,-1/2)$.\n$P_W=2\\vec{v}-\\dfrac{1}{2}\\vec{w}=(3,\\tfrac{5}{2},2,1,\\tfrac{1}{2})$.\n$|P_W|^2=9+\\dfrac{25}{4}+4+1+\\dfrac{1}{4}=\\dfrac{41}{2}$. $\\times 2=41$.",
  },
  {n:24, subject:"선형대수", unit:"고유치와 대각화", concept:"고유값·고유벡터",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}2&-2&2\\\\0&1&1\\\\-4&8&3\\end{pmatrix}$의 고윳값 $\\lambda_1,\\lambda_2,\\lambda_3$에 대응하는 고유벡터를 각각 $\\vec{a}=\\begin{pmatrix}a_1\\\\1\\\\a_3\\end{pmatrix},\\,\\vec{b}=\\begin{pmatrix}b_1\\\\b_2\\\\4\\end{pmatrix},\\,\\vec{c}=\\begin{pmatrix}2\\\\c_2\\\\c_3\\end{pmatrix}$이라 할 때, $\\lambda_1+\\lambda_2+\\lambda_3+a_1+b_2+c_3$의 값을 구하시오. (단, $\\lambda_1<\\lambda_2<\\lambda_3$)",
    answer:"$14$",
    explanation:"특성다항식 $-(\\lambda-1)(\\lambda-2)(\\lambda-3)$. 고윳값 $1,2,3$.\n$\\lambda_1=1$: $\\vec{v}=(2,1,0)\\Rightarrow a_1=2$.\n$\\lambda_2=2$: $\\vec{v}=(9,4,4)\\Rightarrow b_2=4$.\n$\\lambda_3=3$: $\\vec{v}=(2,1,2)\\Rightarrow c_3=2$.\n합 $=6+2+4+2=14$.",
  },
  {n:25, subject:"미분학", unit:"미분방정식", concept:"라플라스 역변환 시간이동",
    difficulty:"medium",
    question:"함수 $F(s)=\\dfrac{1}{s^2}-e^{-s}\\!\\left(\\dfrac{1}{s^2}+\\dfrac{2}{s}\\right)+e^{-4s}\\!\\left(\\dfrac{4}{s^3}+\\dfrac{1}{s}\\right)$의 역 라플라스 변환(inverse Laplace transform)을 $f(t)$라 할 때, $f(10)$의 값을 구하시오.",
    answer:"$72$",
    explanation:"$f(t)=t-(t+1)U(t-1)+\\!\\left(2(t-4)^2+1\\right)U(t-4)$.\n$t=10$: $10-11+(72+1)=10-11+73=72$.",
  },
  {n:26, subject:"적분학", unit:"이상적분", concept:"부분분수 + arctan",
    difficulty:"hard",
    question:"$\\displaystyle\\int_{1+\\sqrt{3}}^{\\infty}\\!\\left(\\dfrac{12}{x-1}-\\dfrac{12(x+2)}{x^2+x+1}\\right)dx=-\\sqrt{a}\\pi+b\\ln(2+\\sqrt{3})$일 때 $ab$의 값을 구하시오. (단, $a,b$는 자연수)",
    answer:"$18$",
    explanation:"$\\dfrac{12(x+2)}{x^2+x+1}=\\dfrac{6(2x+1)+18}{x^2+x+1}$ 분리.\n적분: $6\\ln\\dfrac{(x-1)^2}{x^2+x+1}-12\\sqrt{3}\\arctan\\dfrac{2x+1}{\\sqrt{3}}$.\n$x\\to\\infty$: $0-12\\sqrt{3}\\cdot\\dfrac{\\pi}{2}=-6\\sqrt{3}\\pi$.\n$x=1+\\sqrt{3}$: $\\arctan(2+\\sqrt{3})=\\dfrac{5\\pi}{12}$, $-6\\ln(2+\\sqrt{3})-5\\sqrt{3}\\pi$.\n적분 $=-\\sqrt{3}\\pi+6\\ln(2+\\sqrt{3})$. $a=3,\\,b=6$. $ab=18$.",
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
