// 2024년 한양대 편입수학 단답형 5문항 (Q56-60)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2024", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:21, subject:"다변수함수", unit:"선적분과 면적분", concept:"3차원 곡선 선적분",
    difficulty:"hard",
    question:"곡선 $r(t)=\\langle\\cos t,\\sin t,4-\\cos t\\rangle$와 벡터장 $F(x,y,z)=\\langle y^6,x^5,z^3\\rangle$에 대한 $\\displaystyle\\int_0^{2\\pi}F(r(t))\\cdot r'(t)\\,dt$의 값이 $\\dfrac{b}{a}\\pi$일 때, $a+b$의 값은? (단, $a$와 $b$는 서로소인 자연수이다.)",
    answer:"$13$",
    explanation:"$r'(t)=\\langle-\\sin t,\\cos t,\\sin t\\rangle$. $F(r(t))=\\langle\\sin^6 t,\\cos^5 t,(4-\\cos t)^3\\rangle$.\n$F\\cdot r'=-\\sin^7 t+\\cos^6 t+(4-\\cos t)^3\\sin t$.\n$\\!\\int_0^{2\\pi}\\sin^7 t\\,dt=0$ (주기·홀함수). $\\!\\int_0^{2\\pi}(4-\\cos t)^3\\sin t\\,dt=0$ (치환 $u=4-\\cos t$, 폐곡 적분).\n$\\!\\int_0^{2\\pi}\\cos^6 t\\,dt=\\dfrac{5!!}{6!!}\\cdot 2\\pi=\\dfrac{15}{48}\\cdot 2\\pi=\\dfrac{5\\pi}{8}$.\n$\\dfrac{b}{a}=\\dfrac{5}{8}$, $a+b=13$.",
  },
  {n:22, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리 구면",
    difficulty:"medium",
    question:"구면 $x^2+y^2+z^2=1$을 통과하는 $F(x,y,z)=\\langle 2x^3+y,2y^3,e^x+2z^3\\rangle$의 유량(flux)이 $\\dfrac{b}{a}\\pi$일 때, $a+b$의 값은? (단, $a$와 $b$는 서로소인 자연수이다.)",
    answer:"$29$",
    explanation:"$\\nabla\\cdot F=6x^2+6y^2+6z^2=6(x^2+y^2+z^2)$. 발산정리:\n$\\!\\iiint_V 6\\rho^2\\,dV=6\\cdot 2\\pi\\cdot 2\\cdot\\dfrac{1}{5}=\\dfrac{24\\pi}{5}$ ($\\!\\int_0^1\\rho^4\\,d\\rho\\cdot\\!\\int_0^\\pi\\sin\\varphi\\,d\\varphi\\cdot 2\\pi$).\n$\\dfrac{b}{a}=\\dfrac{24}{5}$, $a+b=29$.",
  },
  {n:23, subject:"선형대수", unit:"행렬", concept:"adj(adj A) 행렬식",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}2&-4&6\\\\1&-1&-2\\\\4&-8&14\\end{pmatrix}$에 대하여 $\\mathrm{adj}(\\mathrm{adj}A)$의 행렬식을 구하시오. (단, $\\mathrm{adj}B$는 행렬 $B$의 여인자 행렬의 전치행렬인데, 수반행렬이라고도 한다.)",
    answer:"$256$",
    explanation:"$3\\times 3$ 행렬에서 $\\mathrm{adj}(\\mathrm{adj}A)=(\\det A)^{n-2}A=(\\det A)\\cdot A$.\n$\\det A=2(-30)+4(22)+6(-4)=-60+88-24=4$.\n$\\mathrm{adj}(\\mathrm{adj}A)=4A$이고 $\\det(4A)=4^3\\cdot\\det A=64\\cdot 4=256$.",
  },
  {n:24, subject:"다변수함수", unit:"이차곡선", concept:"이차형식 주축 변환",
    difficulty:"medium",
    question:"타원 $4x^2-2\\sqrt{2}xy+3y^2-20=0$의 장축의 길이를 $a$, 단축의 길이를 $b$라고 할 때, $a^2+b^2$의 값을 구하시오.",
    answer:"$56$",
    explanation:"이차형식 행렬 $\\begin{pmatrix}4&-\\sqrt{2}\\\\-\\sqrt{2}&3\\end{pmatrix}$의 고윳값: $\\lambda^2-7\\lambda+10=0\\Rightarrow\\lambda=2,5$.\n주축 좌표: $5u^2+2v^2=20\\Rightarrow\\dfrac{u^2}{4}+\\dfrac{v^2}{10}=1$.\n반축 $2,\\sqrt{10}$. 길이 $4,\\,2\\sqrt{10}$ (장축 $2\\sqrt{10}$, 단축 $4$).\n$a^2+b^2=40+16=56$.",
  },
  {n:25, subject:"미분학", unit:"미분방정식", concept:"3계 ODE 라플라스",
    difficulty:"hard",
    question:"미분방정식 $y'''-7y'+6y=0$의 해 $y(t)$가 초기조건 $y(0)=1,\\,y'(0)=2,\\,y''(0)=3$을 만족한다. $Y'(t)=AY(t)$라 하면, 등식 $20\\times y(1)\\times\\det A=pe+qe^2+re^{-3}$이 성립한다. $|p+q+r|$의 값을 구하시오. (단, $p,q,r$은 정수이고 $\\det A$는 $3\\times 3$ 행렬 $A$의 행렬식, $Y(t)=\\begin{pmatrix}y(t)\\\\y'(t)\\\\y''(t)\\end{pmatrix}$이다.)",
    answer:"$120$",
    explanation:"특성 $r^3-7r+6=0\\Rightarrow(r-1)(r-2)(r+3)=0$. $y(t)=c_1 e^t+c_2 e^{2t}+c_3 e^{-3t}$.\n초기조건: $c_1+c_2+c_3=1,\\,c_1+2c_2-3c_3=2,\\,c_1+4c_2+9c_3=3$. 풀면 $c_1=\\dfrac{1}{4},\\,c_2=\\dfrac{4}{5},\\,c_3=-\\dfrac{1}{20}$.\n$y(1)=\\dfrac{1}{4}e+\\dfrac{4}{5}e^2-\\dfrac{1}{20}e^{-3}$.\n행렬 $A=\\begin{pmatrix}0&1&0\\\\0&0&1\\\\-6&7&0\\end{pmatrix}$, $\\det A=-6$.\n$20\\cdot y(1)\\cdot(-6)=-30e-96e^2+6e^{-3}$. $p=-30,\\,q=-96,\\,r=6$. $|p+q+r|=|-120|=120$.",
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
if (error) {
  console.error("업로드 실패:", error);
  process.exit(1);
}
console.log(`업로드 완료: ${data.length}건`);
