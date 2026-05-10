// 2021년 한양대 편입수학 단답형 5문항 (Q22-26)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2021", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:22, subject:"다변수함수", unit:"선적분과 면적분", concept:"매개곡면 넓이",
    difficulty:"medium",
    question:"곡면 $\\vec{F}(u,v)=(2u\\cos v,\\,2u\\sin v,\\,u^2)\\;(\\sqrt{3}\\le u\\le 2\\sqrt{2},\\,0\\le v\\le 3)$의 넓이를 구하시오.",
    answer:"$76$",
    explanation:"$\\vec{F}_u\\times\\vec{F}_v=(-4u^2\\cos v,-4u^2\\sin v,4u)$, $|\\vec{F}_u\\times\\vec{F}_v|=4u\\sqrt{u^2+1}$.\n$S=\\!\\int_0^3\\!\\!\\int_{\\sqrt{3}}^{2\\sqrt{2}}4u\\sqrt{u^2+1}\\,du\\,dv$.\n$w=u^2+1$ 치환: $\\!\\int 4u\\sqrt{w}\\cdot\\dfrac{dw}{2u}=2\\!\\int\\sqrt{w}\\,dw=\\dfrac{4}{3}w^{3/2}$.\n$\\dfrac{4}{3}(9^{3/2}-4^{3/2})=\\dfrac{4}{3}(27-8)=\\dfrac{76}{3}$. $\\times 3=76$.",
  },
  {n:23, subject:"다변수함수", unit:"편도함수의 응용", concept:"라그랑주 최댓값",
    difficulty:"hard",
    question:"실수 $x,y,z$가 $3x^2+y^2+z^2=20$을 만족할 때, $xyz^3$의 최댓값을 구하시오.",
    answer:"$96$",
    explanation:"라그랑주: $\\nabla(xyz^3)=\\lambda\\nabla(3x^2+y^2+z^2)$.\n$yz^3=6\\lambda x,\\,xz^3=2\\lambda y,\\,3xyz^2=2\\lambda z$.\n비교: $y^2=3x^2,\\,z^2=3y^2$. 즉 $z^2=9x^2$.\n$3x^2+3x^2+9x^2=15x^2=20\\Rightarrow x^2=\\dfrac{4}{3},\\,y^2=4,\\,z^2=12$.\n양수 선택: $x=\\dfrac{2}{\\sqrt{3}},\\,y=2,\\,z=2\\sqrt{3}$.\n$xyz^3=\\dfrac{2}{\\sqrt{3}}\\cdot 2\\cdot 24\\sqrt{3}=96$.",
  },
  {n:24, subject:"선형대수", unit:"선형변환", concept:"기저 변환 행렬표현",
    difficulty:"hard",
    question:"벡터공간 $V$의 기저 $\\{v_1,v_2,v_3,v_4\\}$에 대한 선형사상 $T:V\\to V$의 행렬표현이 $\\begin{pmatrix}2&0&0&0\\\\1&2&0&0\\\\0&1&2&0\\\\0&0&0&2\\end{pmatrix}$일 때, $V$의 기저 $\\{v_1,T(v_1),T^2(v_1),v_4\\}$에 대한 $T$의 행렬표현을 $A$라 하자. 행렬 $A$의 모든 성분들의 합을 구하시오.",
    answer:"$6$",
    explanation:"$T(v_1)=2v_1+v_2$, $T^2(v_1)=4v_1+4v_2+v_3$.\n새 기저 $u_1=v_1,\\,u_2=T(v_1),\\,u_3=T^2(v_1),\\,u_4=v_4$.\n$T(u_1)=u_2$, $T(u_2)=u_3$, $T(u_3)=8u_1-12u_2+6u_3$, $T(u_4)=2u_4$.\n$A=\\begin{pmatrix}0&0&8&0\\\\1&0&-12&0\\\\0&1&6&0\\\\0&0&0&2\\end{pmatrix}$. 성분 합 $=8+1-12+1+6+2=6$.",
  },
  {n:25, subject:"선형대수", unit:"고유치와 대각화", concept:"방데르몽드 행렬식",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}1&1&1&1\\\\1&2&4&8\\\\1&-2&4&-8\\\\1&-1&1&-1\\end{pmatrix}$의 복소수 범위의 서로 다른 네 고윳값을 $a,b,c,d$라 할 때, 네 수의 곱 $abcd$의 값을 구하시오.",
    answer:"$72$",
    explanation:"$abcd=\\det A$. $A$의 행은 $(1,t,t^2,t^3)$ 형식 ($t=1,2,-2,-1$). 즉 $A$는 $V(1,2,-2,-1)$ 방데르몽드 행렬.\n$\\det V=\\!\\prod_{i<j}(x_j-x_i)=(2-1)(-2-1)(-1-1)(-2-2)(-1-2)(-1+2)$\n$=1\\cdot(-3)\\cdot(-2)\\cdot(-4)\\cdot(-3)\\cdot 1=72$.",
  },
  {n:26, subject:"미분학", unit:"미분방정식", concept:"기하 응용 ODE",
    difficulty:"hard",
    question:"반지름의 비가 $2:3$인 구 모양의 두 개의 눈덩이로 큰 눈덩이 위에 작은 것을 올려놓아 눈사람을 만들었다. 두 눈덩이가 녹을 때 그 부피는 표면적에 정비례하는 비율로 감소하고, 비례 상수는 두 눈덩이에 대해 동일하며, 녹는 동안 두 눈덩이는 모두 구 모양으로 유지된다고 하자. 눈사람의 처음 부피는 $V_1$, 눈사람의 키가 처음의 $\\dfrac{1}{2}$이 되었을 때 눈사람의 부피를 $V_2$라 하자. $\\dfrac{V_2}{V_1}=\\dfrac{q}{p}$일 때, $p+q$의 값을 구하시오. (단, $p,q$는 서로소인 자연수이다.)",
    answer:"$261$",
    explanation:"$\\dfrac{dV}{dt}=-k\\cdot S$, $V=\\dfrac{4}{3}\\pi r^3,\\,S=4\\pi r^2$ ⇒ $\\dfrac{dr}{dt}=-k$ (상수).\n처음 반지름 $2r,3r$, 키 $10r$. $\\dfrac{1}{2}$ 키 $\\Rightarrow$ 새 키 $5r$, 새 반지름 합 $\\dfrac{5r}{2}$.\n$r_1+r_2=2r-kt+3r-kt=5r-2kt=\\dfrac{5r}{2}\\Rightarrow kt=\\dfrac{5r}{4}$.\n$r_1=\\dfrac{3r}{4},\\,r_2=\\dfrac{7r}{4}$.\n$V_2=\\dfrac{4\\pi}{3}\\!\\left(\\dfrac{27}{64}+\\dfrac{343}{64}\\right)r^3=\\dfrac{185}{24}\\pi r^3$, $V_1=\\dfrac{140}{3}\\pi r^3$.\n$\\dfrac{V_2}{V_1}=\\dfrac{37}{224}$. $p+q=224+37=261$.",
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
