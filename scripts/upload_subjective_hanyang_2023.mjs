// 2023년 한양대 편입수학 단답형 5문항 (Q22-26)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2023", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:22, subject:"적분학", unit:"부정적분", concept:"부분적분 / 삼각함수 적분",
    difficulty:"medium",
    question:"$\\displaystyle\\int_0^\\pi e^x\\sin^2 x\\,dx=ae^\\pi-b$일 때, $(a^2+b^2)\\times 100$의 값을 구하시오. (단, $a,b$는 유리수이다.)",
    answer:"$32$",
    explanation:"$\\sin^2 x=\\dfrac{1-\\cos 2x}{2}$. $\\!\\int e^x\\cos 2x\\,dx=\\dfrac{e^x(\\cos 2x+2\\sin 2x)}{5}$.\n$\\!\\int_0^\\pi e^x\\sin^2 x\\,dx=\\dfrac{1}{2}\\!\\left[(e^\\pi-1)-\\dfrac{e^\\pi-1}{5}\\right]=\\dfrac{2(e^\\pi-1)}{5}=\\dfrac{2}{5}e^\\pi-\\dfrac{2}{5}$.\n$a=\\dfrac{2}{5},\\,b=\\dfrac{2}{5}$, $a^2+b^2=\\dfrac{8}{25}$. $\\times 100=32$.",
  },
  {n:23, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리",
    difficulty:"hard",
    question:"곡면 $z=1-x^2$과 세 평면 $z=0,\\,y=0,\\,z=2-y$에 의해 둘러싸인 유한한 입체의 경계면 $S$와 벡터장 $\\vec{F}(x,y,z)=\\langle 2xy^2,\\,y^3+e^{xz},\\,\\cos(xy)\\rangle$에 대해 $\\displaystyle\\iint_S\\vec{F}\\cdot d\\vec{S}=\\dfrac{q}{p}$라 하자. $p,q$가 서로소인 자연수일 때 $p$의 값을 구하시오.",
    answer:"$189$",
    explanation:"$\\nabla\\cdot\\vec{F}=2y^2+3y^2+0=5y^2$. 발산정리.\n영역: $-1\\le x\\le 1,\\,0\\le z\\le 1-x^2,\\,0\\le y\\le 2-z$.\n$\\!\\iiint 5y^2\\,dV=\\dfrac{5}{3}\\!\\int_{-1}^1\\!\\!\\int_0^{1-x^2}(2-z)^3\\,dz\\,dx=\\dfrac{5}{12}\\!\\int_{-1}^1[16-(1+x^2)^4]\\,dx$.\n$\\!\\int_{-1}^1(1+x^2)^4\\,dx=\\dfrac{2656}{315}$. 결과 $=\\dfrac{5}{12}\\!\\left(32-\\dfrac{2656}{315}\\right)=\\dfrac{1856}{189}$.\n$p=189,\\,q=1856$. $p=189$.",
  },
  {n:24, subject:"선형대수", unit:"고유치와 대각화", concept:"닮음 행렬 특성다항식",
    difficulty:"easy",
    question:"$4\\times 4$행렬 $A,\\,B=\\begin{pmatrix}2&0&0&0\\\\0&-1&0&0\\\\0&0&1&0\\\\0&0&0&3\\end{pmatrix},\\,P=\\begin{pmatrix}1&0&0&0\\\\1&1&0&0\\\\0&1&1&0\\\\0&0&1&1\\end{pmatrix}$가 $B=P^{-1}AP$를 만족한다. $f(x)$를 행렬 $A+2I$의 특성다항식(characteristic polynomial)이라 할 때, $f(2)$의 절댓값을 구하시오.",
    answer:"$6$",
    explanation:"$A$와 $B$가 닮음이므로 $A+2I$와 $B+2I$도 닮음 ⇒ 특성다항식 동일.\n$B+2I=\\mathrm{diag}(4,1,3,5)$, $f(x)=(x-4)(x-1)(x-3)(x-5)$.\n$f(2)=(-2)(1)(-1)(-3)=-6$. $|f(2)|=6$.",
  },
  {n:25, subject:"선형대수", unit:"고유치와 대각화", concept:"고유벡터 → 행렬 복원",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}a&b&c\\\\d&e&f\\\\g&h&i\\end{pmatrix}$의 고윳값 $1,2,3$에 대응하는 고유벡터를 각각 $v_1=\\begin{pmatrix}1\\\\0\\\\0\\end{pmatrix},\\,v_2=\\begin{pmatrix}1\\\\1\\\\0\\end{pmatrix},\\,v_3=\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix}$이라 할 때, $c+f+i$의 값을 구하시오.",
    answer:"$5$",
    explanation:"$Av_1=v_1\\Rightarrow$ 1열 $=(1,0,0)$. $a=1,d=0,g=0$.\n$Av_2=2v_2\\Rightarrow$ 1열+2열 $=(2,2,0)$. $b=1,e=2,h=0$.\n$Av_3=3v_3\\Rightarrow$ 1열+2열+3열 $=(3,3,3)$. $c=1,f=1,i=3$.\n$c+f+i=1+1+3=5$.",
  },
  {n:26, subject:"미분학", unit:"미분방정식", concept:"연립ODE 고유값 분해",
    difficulty:"hard",
    question:"연립미분방정식 $\\begin{cases}x'(t)=7x(t)-y(t)+6z(t)\\\\y'(t)=-10x(t)+4y(t)-12z(t)\\\\z'(t)=-2x(t)+y(t)-z(t)\\end{cases}$의 해 $\\begin{pmatrix}x(t)\\\\y(t)\\\\z(t)\\end{pmatrix}$가 초기조건 $\\begin{pmatrix}x(0)\\\\y(0)\\\\z(0)\\end{pmatrix}=\\begin{pmatrix}-1\\\\4\\\\2\\end{pmatrix}$를 만족할 때 $x(1)+y(1)+z(1)$의 값은 $ae^l+be^m+ce^n$이다. $a+b+c+l+m+n$의 값을 구하시오. (단, $a,b,c,d,l,m,n$은 모두 정수이다.)",
    answer:"$15$",
    explanation:"행렬 $A=\\begin{pmatrix}7&-1&6\\\\-10&4&-12\\\\-2&1&-1\\end{pmatrix}$의 고윳값 $\\lambda^3-10\\lambda^2+31\\lambda-30=0\\Rightarrow\\lambda=2,3,5$.\n고유벡터: $(-1,1,1),(-1,2,1),(-3,6,2)$.\n초기조건으로 계수 $c_2=-2,c_3=6,c_5=-1$.\n$x+y+z=-2e^{2t}+12e^{3t}-5e^{5t}$.\n$t=1$: $-2e^2+12e^3-5e^5$. $a=-2,b=12,c=-5,l=2,m=3,n=5$. 합 $=15$.",
  },
];

const TOTAL=PROBLEMS.length;
console.log(`총 ${TOTAL}문제 (단답형) 준비됨`);

const rows = PROBLEMS.map(p => {
  const id = `q-${YEAR}-${SCHOOL_EN}-${String(p.n).padStart(2,"0")}`;
  return {
    id,
    subject: p.subject,
    unit: p.unit,
    concept: p.concept,
    difficulty: p.difficulty,
    source_type: "imported",
    pool: "general",
    question: p.question,
    content_type: "latex",
    question_image: null,
    question_type: "subjective",
    options: [],
    correct_option_id: "",
    answer_text: p.answer,
    explanation: p.explanation,
    explanation_content_type: "latex",
    explanation_image: null,
    tags: [YEAR, SCHOOL_KO, "past_exam", "subjective", p.subject, p.unit, p.concept],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
});

const { data, error } = await sb.from("questions").upsert(rows, { onConflict: "id" }).select("id");
if (error) { console.error("업로드 실패:", error); process.exit(1); }
console.log(`업로드 완료: ${data.length}건`);
