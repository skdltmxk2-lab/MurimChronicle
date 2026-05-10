// 2020년 한양대 편입수학 단답형 5문항 (Q22-26)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2020", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:22, subject:"미분학", unit:"극한과 연속", concept:"테일러 전개 극한",
    difficulty:"medium",
    question:"$\\displaystyle\\lim_{x\\to 0}\\dfrac{e^{-x^2/2}-\\cos x}{x^4}=\\dfrac{q}{p}$일 때, $p+q$의 값을 구하시오. (단, $p,q$는 서로소인 자연수이다.)",
    answer:"$13$",
    explanation:"$e^{-x^2/2}=1-\\dfrac{x^2}{2}+\\dfrac{x^4}{8}-\\cdots$, $\\cos x=1-\\dfrac{x^2}{2}+\\dfrac{x^4}{24}-\\cdots$.\n$e^{-x^2/2}-\\cos x=\\!\\left(\\dfrac{1}{8}-\\dfrac{1}{24}\\right)x^4+\\cdots=\\dfrac{x^4}{12}+\\cdots$.\n극한 $=\\dfrac{1}{12}$. $p=12,\\,q=1$. $p+q=13$.",
  },
  {n:23, subject:"다변수함수", unit:"중적분", concept:"3중적분 부피",
    difficulty:"medium",
    question:"좌표공간에서 곡면 $z=3\\sqrt{y}$와 세 평면 $x+2y=2,\\,x=0,\\,z=0$으로 둘러싸인 입체의 부피를 $a$라 할 때, $20a$의 값을 구하시오.",
    answer:"$32$",
    explanation:"영역: $y\\in[0,1],\\,x\\in[0,2-2y],\\,z\\in[0,3\\sqrt{y}]$.\n$a=\\!\\int_0^1\\!\\!\\int_0^{2-2y}3\\sqrt{y}\\,dx\\,dy=6\\!\\int_0^1(\\sqrt{y}-y^{3/2})\\,dy=6\\!\\left(\\dfrac{2}{3}-\\dfrac{2}{5}\\right)=\\dfrac{8}{5}$.\n$20a=32$.",
  },
  {n:24, subject:"선형대수", unit:"행렬", concept:"4x4 행렬식 (열전개)",
    difficulty:"easy",
    question:"행렬 $\\begin{pmatrix}3&-1&4&-2\\\\2&2&1&0\\\\0&1&2&-1\\\\0&3&1&1\\end{pmatrix}$의 행렬식(determinant)을 구하시오.",
    answer:"$24$",
    explanation:"1열 전개. $0$인 자리 활용:\n$\\det=3\\det\\!\\begin{pmatrix}2&1&0\\\\1&2&-1\\\\3&1&1\\end{pmatrix}-2\\det\\!\\begin{pmatrix}-1&4&-2\\\\1&2&-1\\\\3&1&1\\end{pmatrix}=3\\cdot 2-2\\cdot(-9)=6+18=24$.",
  },
  {n:25, subject:"다변수함수", unit:"이차곡선", concept:"이차곡선 표준형",
    difficulty:"hard",
    question:"이차곡선 $5x^2-4xy+8y^2+4\\sqrt{5}x-16\\sqrt{5}y+4=0$이 회전 및 평행이동에 의해 이차곡선 $\\dfrac{x^2}{A}+\\dfrac{y^2}{B}=1$이 될 때, $A\\times B$의 값을 구하시오. (단, $A$와 $B$는 상수이다.)",
    answer:"$36$",
    explanation:"이차형식 $\\begin{pmatrix}5&-2\\\\-2&8\\end{pmatrix}$의 고윳값 $\\lambda=4,\\,9$.\n주축회전 후: $9u^2+4v^2+36u-8v+4=0\\Rightarrow 9(u+2)^2+4(v-1)^2=36$.\n표준형 $\\dfrac{(u+2)^2}{4}+\\dfrac{(v-1)^2}{9}=1$. 평행이동 후 $A=4,\\,B=9$. $A\\cdot B=36$.",
  },
  {n:26, subject:"미분학", unit:"미분방정식", concept:"멱급수 해 (sin x 변계수)",
    difficulty:"hard",
    question:"두 급수 $y_1(x)=1-\\dfrac{x^3}{6}+\\dfrac{x^5}{a}+\\cdots,\\,y_2(x)=x-\\dfrac{x^4}{12}+\\dfrac{x^6}{b}+\\cdots$이 미분방정식 $y''+(\\sin x)y=0$의 해일 때, $a+b$의 값을 구하시오. (단, $a$와 $b$는 상수이다.)",
    answer:"$300$",
    explanation:"점화식: $(k+2)(k+1)c_{k+2}=-\\!\\left[c_{k-1}-\\dfrac{c_{k-3}}{6}+\\cdots\\right]$.\n$y_1$: $c_0=1$ ⇒ $c_5=\\dfrac{1}{120}$, 즉 $a=120$.\n$y_2$: $c_1=1$ ⇒ $c_6=\\dfrac{1}{180}$, 즉 $b=180$.\n$a+b=300$.",
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
