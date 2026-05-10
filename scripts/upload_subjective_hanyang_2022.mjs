// 2022년 한양대 편입수학 단답형 5문항 (Q22-26)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2022", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";

const PROBLEMS = [
  {n:22, subject:"적분학", unit:"정적분의 응용", concept:"파푸스 회전체 표면적",
    difficulty:"hard",
    question:"아래 그림에서 원 $(x-15)^2+y^2=5^2$의 호 $C$를 $y$축 중심으로 회전하여 얻은 곡면의 넓이가 $a\\pi+b\\pi^2$일 때, $a+b$의 값을 구하시오. (단, $a,b$는 정수이다.) 호 $C$는 1사분면에서 원의 중심으로부터 각도 $0$에서 $\\dfrac{\\pi}{6}$까지의 부분이다.",
    answer:"$50$",
    explanation:"호의 매개변수화: $\\vec{r}(\\theta)=(15+5\\cos\\theta,\\,5\\sin\\theta),\\,0\\le\\theta\\le\\dfrac{\\pi}{6}$, $ds=5\\,d\\theta$.\n$y$축 회전 표면적: $S=2\\pi\\!\\int_0^{\\pi/6}(15+5\\cos\\theta)\\cdot 5\\,d\\theta=10\\pi[15\\theta+5\\sin\\theta]_0^{\\pi/6}=10\\pi\\!\\left(\\dfrac{5\\pi}{2}+\\dfrac{5}{2}\\right)=25\\pi^2+25\\pi$.\n$a=25,\\,b=25$, $a+b=50$.",
  },
  {n:23, subject:"다변수함수", unit:"선적분과 면적분", concept:"보존벡터장 선적분",
    difficulty:"medium",
    question:"벡터장 $\\vec{F}(x,y,z)=\\langle\\sin y,\\,x\\cos y+\\cos z,\\,-y\\sin z\\rangle$와 곡선 $C:\\vec{r}(t)=\\langle\\sin t,\\,t,\\,2t\\rangle,\\,0\\le t\\le\\dfrac{\\pi}{2}$에 대하여 $\\displaystyle\\int_C\\vec{F}\\cdot d\\vec{r}$의 값이 $a+\\dfrac{\\pi}{b}$일 때, $a+b+12$의 값을 구하시오.",
    answer:"$11$",
    explanation:"$\\nabla\\times\\vec{F}=\\vec{0}$ 확인 ⇒ 보존. 포텐셜 $\\varphi=x\\sin y+y\\cos z$.\n$\\vec{r}(0)=(0,0,0),\\,\\vec{r}(\\pi/2)=(1,\\pi/2,\\pi)$.\n$\\varphi(\\vec{r}(\\pi/2))-\\varphi(\\vec{r}(0))=1\\cdot 1+\\dfrac{\\pi}{2}\\cdot(-1)-0=1-\\dfrac{\\pi}{2}$.\n$a=1,\\,b=-2$. $a+b+12=1-2+12=11$.",
  },
  {n:24, subject:"선형대수", unit:"행렬", concept:"트리디아고날 행렬식",
    difficulty:"medium",
    question:"행렬 $\\begin{pmatrix}2&-1&0&0&0\\\\-1&2&-1&0&0\\\\0&-1&2&-1&0\\\\0&0&-1&2&-1\\\\0&0&0&-1&2\\end{pmatrix}$의 행렬식을 구하시오.",
    answer:"$6$",
    explanation:"트리디아고날 행렬: $D_n=2D_{n-1}-D_{n-2}$, $D_1=2,\\,D_2=3$.\n$D_3=4,\\,D_4=5,\\,D_5=6$.",
  },
  {n:25, subject:"미분학", unit:"미분방정식", concept:"적분방정식 라플라스",
    difficulty:"hard",
    question:"$f(x)=x^4+\\displaystyle\\int_0^x\\sin(x-t)f(t)\\,dt$인 함수 $f(x)$에 대하여 $f(1)$의 값을 $\\dfrac{p}{q}$라 할 때, $p+q$의 값을 구하시오. (단, $p,q$는 서로소인 자연수이다.)",
    answer:"$61$",
    explanation:"라플라스 변환: $F(s)=\\dfrac{24}{s^5}+\\dfrac{F(s)}{s^2+1}\\Rightarrow F(s)\\cdot\\dfrac{s^2}{s^2+1}=\\dfrac{24}{s^5}$.\n$F(s)=\\dfrac{24(s^2+1)}{s^7}=\\dfrac{24}{s^5}+\\dfrac{24}{s^7}$.\n$f(x)=x^4+\\dfrac{x^6}{30}$. $f(1)=1+\\dfrac{1}{30}=\\dfrac{31}{30}$.\n$p+q=31+30=61$.",
  },
  {n:26, subject:"미분학", unit:"미분방정식", concept:"분리변수형 ODE",
    difficulty:"medium",
    question:"어떤 곤충의 개체수 $P(t)$가 미분방정식 $\\dfrac{dP}{dt}=1+t^2+P+t^2 P,\\,P(0)=10$을 만족한다고 하자. $P(3)$의 값이 $\\alpha e^\\beta+\\gamma$일 때, $\\alpha+\\beta+\\gamma$의 값을 구하시오. (단, $\\alpha,\\beta,\\gamma$는 정수이다.)",
    answer:"$22$",
    explanation:"$\\dfrac{dP}{dt}=(1+t^2)(1+P)$. 분리: $\\dfrac{dP}{1+P}=(1+t^2)\\,dt$.\n$\\ln|1+P|=t+\\dfrac{t^3}{3}+C$. $P(0)=10\\Rightarrow C=\\ln 11$.\n$P=11e^{t+t^3/3}-1$. $P(3)=11e^{12}-1$.\n$\\alpha=11,\\,\\beta=12,\\,\\gamma=-1$. $\\alpha+\\beta+\\gamma=22$.",
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
