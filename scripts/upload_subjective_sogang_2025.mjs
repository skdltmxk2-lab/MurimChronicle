// 2025년 서강대 편입수학 단답형 4문항 (Q17-20)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2025", SCHOOL_KO="서강대", SCHOOL_EN="sogang";

const PROBLEMS = [
  {n:17, subject:"미분학", unit:"극한과 연속", concept:"멱급수 전개",
    difficulty:"hard",
    question:"연속함수 $f(x)$가 모든 실수 $x$에 대하여 $x^2=(1-x-e^{-x})f(x)$를 만족시킨다고 하자. $f''(0)-f(0)=\\dfrac{q}{p}$일 때, $p+q$의 값을 구하시오. (단, $p$와 $q$는 서로소인 자연수이다.)",
    answer:"$26$",
    explanation:"$1-x-e^{-x}=-\\dfrac{x^2}{2!}+\\dfrac{x^3}{3!}-\\dfrac{x^4}{4!}+\\cdots$. $x\\ne 0$일 때 $f(x)=\\dfrac{x^2}{-\\frac{x^2}{2}+\\frac{x^3}{6}-\\frac{x^4}{24}+\\cdots}=\\dfrac{1}{-\\frac{1}{2}+\\frac{x}{6}-\\frac{x^2}{24}+\\cdots}$.\n직접 나누기로 전개: $f(x)=-2-\\dfrac{2}{3}x-\\dfrac{1}{18}x^2-\\cdots$.\n연속성에서 $f(0)=-2$. $f''(0)=2!\\cdot(x^2\\text{ 계수})=2\\cdot\\!\\left(-\\dfrac{1}{18}\\right)=-\\dfrac{1}{9}$.\n$f''(0)-f(0)=-\\dfrac{1}{9}-(-2)=\\dfrac{17}{9}$. $p=9,\\,q=17$. $p+q=26$.",
  },
  {n:18, subject:"다변수함수", unit:"선적분과 면적분", concept:"가우스 발산정리",
    difficulty:"hard",
    question:"$S$를 영역 $\\{(x,y,z)\\in\\mathbb{R}^3\\mid x^2+y^2+(z-1)^2\\le 1\\text{ 이고 }z\\ge\\sqrt{x^2+y^2}\\}$의 경계곡면이라고 하자. 벡터장 $\\vec{F}(x,y,z)=x\\,\\vec{i}+y\\,\\vec{j}+z^2\\,\\vec{k}$에 대하여 적분 $\\displaystyle\\iint_S\\vec{F}\\cdot d\\vec{S}$의 값이 $\\dfrac{q}{p}\\pi$일 때, $p+q$의 값을 구하시오. (단, $S$는 바깥으로 향하는 방향을 갖는 곡면이고 $p$와 $q$는 서로소인 자연수이다.)",
    answer:"$16$",
    explanation:"발산정리: $\\nabla\\!\\cdot\\!\\vec{F}=1+1+2z=2z+2$.\n영역의 구면좌표: 구 $x^2+y^2+(z-1)^2=1\\Leftrightarrow\\rho=2\\cos\\phi$, 원뿔 $z=\\sqrt{x^2+y^2}\\Leftrightarrow\\phi=\\dfrac{\\pi}{4}$.\n$\\displaystyle\\iiint_T(2z+2)\\,dV=2\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/4}\\!\\!\\int_0^{2\\cos\\phi}(\\rho\\cos\\phi+1)\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=\\dfrac{13}{3}\\pi$.\n$p=3,\\,q=13$. $p+q=16$.",
  },
  {n:19, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴 (행렬 멱승)",
    difficulty:"medium",
    question:"3차원 공간에 있는 임의의 벡터 $\\langle x_1,x_2,x_3\\rangle$에 대하여, $\\langle y_1,y_2,y_3\\rangle=\\langle x_1,x_2,x_3\\rangle\\times\\langle 1,1,1\\rangle$이라고 하자. 여기서 $\\times$는 두 벡터의 외적(cross product)을 나타낸다. $\\begin{pmatrix}y_1\\\\y_2\\\\y_3\\end{pmatrix}=A\\begin{pmatrix}x_1\\\\x_2\\\\x_3\\end{pmatrix}$을 만족하는 $3\\times 3$ 행렬 $A$에 대하여 $(A^T)^9$의 $(3,2)$ 성분을 $a$라고 할 때, $a+100$의 값을 구하시오. (단, $A^T$는 $A$의 전치행렬이다.)",
    answer:"$181$",
    explanation:"$\\langle x_1,x_2,x_3\\rangle\\times\\langle 1,1,1\\rangle=\\langle x_2-x_3,\\,x_3-x_1,\\,x_1-x_2\\rangle$이므로\n$A=\\begin{pmatrix}0&1&-1\\\\-1&0&1\\\\1&-1&0\\end{pmatrix},\\quad B=A^T=\\begin{pmatrix}0&-1&1\\\\1&0&-1\\\\-1&1&0\\end{pmatrix}$.\n$B$의 특성다항식 $\\lambda^3+3\\lambda=0$. 고윳값에 허수가 있으므로 케일리-해밀턴: $B^3=-3B$.\n$B^9=(B^3)^3=(-3)^3 B^3=(-27)(-3B)=81B$.\n$81B=\\begin{pmatrix}0&-81&81\\\\81&0&-81\\\\-81&81&0\\end{pmatrix}$의 $(3,2)$ 성분 $=81$. $a=81$. $a+100=181$.",
  },
  {n:20, subject:"미분학", unit:"미분방정식", concept:"비동차 이계 ODE (공명항)",
    difficulty:"medium",
    question:"$y(x)$가 초깃값 문제 $y''-y=4xe^x,\\,y(0)=-1,\\,y'(1)=13(e+e^{-1})$의 해일 때, $y'(0)$의 값을 구하시오.",
    answer:"$24$",
    explanation:"보조방정식 $r^2-1=0$, $y_c=c_1 e^x+c_2 e^{-x}$. $r=1$이 동차근이므로 특수해를 $y_p=(Ax^2+Bx)e^x$로 놓고 대입: $A=1,\\,B=-1$. $y_p=(x^2-x)e^x$.\n일반해 $y=c_1 e^x+c_2 e^{-x}+(x^2-x)e^x$.\n$y(0)=c_1+c_2=-1$. $y'(x)=c_1 e^x-c_2 e^{-x}+(x^2+x-1)e^x$.\n$y'(1)=c_1 e-\\dfrac{c_2}{e}+e=13(e+e^{-1})\\Rightarrow c_1=12,\\,c_2=-13$.\n$y'(0)=c_1-c_2+(-1)=12-(-13)-1=24$.",
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
