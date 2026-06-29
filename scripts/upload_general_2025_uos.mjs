// Upload 2025년도 서울시립대 편입수학 기출 객관식 15문항 (5지선다)
// 16~25는 주관식이라 제외
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "서울시립대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-uos-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({
    num: 1, subject: "공학수학", unit: "미분방정식", concept: "코시-오일러 방정식", difficulty: "medium",
    question: "미분방정식 $x^2 y''-2xy'+2y=0$의 해 $y(x)$가 $y(1)=3,\\,y'(1)=4$를 만족시킬 때, $y(3)$의 값은?",
    options: [o("1","$15$"), o("2","$16$"), o("3","$17$"), o("4","$18$"), o("5","$19$")],
    answer: 1,
    explanation: "$x=e^t$ 치환으로 상수계수: $y''-3y'+2y=0$. 특성근 $r=1,2$. $y=2x+x^2$ ($y(1)=3,y'(1)=4$). $y(3)=6+9=15$."
  }),
  build({
    num: 2, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE", difficulty: "medium",
    question: "미분방정식 $(x^2+4)\\dfrac{dy}{dx}+4xy=2x$의 해 $y(x)$가 $y(0)=1$을 만족시킬 때, $y(2)$의 값은?",
    options: [o("1","$\\dfrac{5}{64}$"), o("2","$\\dfrac{5}{32}$"), o("3","$\\dfrac{5}{16}$"), o("4","$\\dfrac{5}{8}$"), o("5","$\\dfrac{5}{4}$")],
    answer: 4,
    explanation: "$y'+\\tfrac{4x}{x^2+4}y=\\tfrac{2x}{x^2+4}$. 적분인자 $(x^2+4)^2$. $((x^2+4)^2 y)'=2x(x^2+4)$ 적분: $(x^2+4)^2 y=\\tfrac{1}{2}x^4+4x^2+C$. $y(0)=1$ → $C=16$. $y(2)=\\tfrac{8+16+16}{64}=\\dfrac{5}{8}$."
  }),
  build({
    num: 3, subject: "공학수학", unit: "미분방정식", concept: "적분방정식(라플라스)", difficulty: "medium",
    question: "적분방정식 $f(t)+\\displaystyle\\int_0^t f(\\tau)e^{t-\\tau}d\\tau=\\sin 2t$를 만족시키는 $f(t)$에 대하여, $f(\\pi)$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$1$")],
    answer: 3,
    explanation: "라플라스: $Y+\\tfrac{1}{s-1}Y=\\tfrac{2}{s^2+4}$ → $\\tfrac{s}{s-1}Y=\\tfrac{2}{s^2+4}$ → $Y=\\tfrac{2(s-1)}{s(s^2+4)}=-\\tfrac{1}{2s}+\\tfrac{s/2+2}{s^2+4}$. 역변환: $f(t)=-\\tfrac{1}{2}+\\tfrac{1}{2}\\cos 2t+\\sin 2t$. $f(\\pi)=-\\tfrac{1}{2}+\\tfrac{1}{2}+0=0$."
  }),
  build({
    num: 4, subject: "공학수학", unit: "푸리에급수", concept: "복소 푸리에 계수", difficulty: "medium",
    question: "함수 $f(x)=x$ $(-\\pi<x<\\pi)$의 복소 푸리에(Fourier)급수가 $f(x)=\\displaystyle\\sum_{n=-\\infty}^{\\infty}c_n e^{inx}$일 때, $c_2$의 값은?",
    options: [o("1","$-\\dfrac{i}{2}$"), o("2","$-\\dfrac{i}{4}$"), o("3","$0$"), o("4","$\\dfrac{i}{4}$"), o("5","$\\dfrac{i}{2}$")],
    answer: 5,
    explanation: "$c_n=\\tfrac{1}{2\\pi}\\!\\int_{-\\pi}^{\\pi}xe^{-inx}dx=-\\tfrac{i}{\\pi}\\!\\int_0^{\\pi}x\\sin nx\\,dx=\\tfrac{i}{n}\\cos(n\\pi)=\\tfrac{i(-1)^n}{n}$. $n=2$: $c_2=\\dfrac{i}{2}$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "벡터공간", concept: "부분공간 판정", difficulty: "medium",
    question: "다음에서 차수가 $3$ 이하인 실수 계수 다항식으로 이루어진 벡터공간 $\\mathbb{P}_3$의 부분공간만을 모두 고른 것은?\n\n(가) $\\{x^3+a\\mid a\\text{는 실수}\\}$\n(나) $\\{f(x)\\in\\mathbb{P}_3\\mid f'(-1)=0\\}$\n(다) $\\{ax^2+bx+c\\mid a,b,c\\text{는 정수}\\}$",
    options: [o("1","(가)"), o("2","(나)"), o("3","(가), (나)"), o("4","(가), (다)"), o("5","(나), (다)")],
    answer: 2,
    explanation: "(가) 영성분 $0$을 포함하지 못함. **부분공간 아님**. (나) $f=0$이면 $f'(-1)=0$, 합·스칼라배에서도 $f'(-1)=0$ 보존. **부분공간**. (다) 정수 계수만 → 스칼라배 $k$가 임의 실수면 정수 보장 안 됨. **부분공간 아님**."
  }),
  build({
    num: 6, subject: "선형대수", unit: "고유치와 대각화", concept: "행렬 거듭제곱", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}-4 & 0 & 3\\\\ 0 & 4 & 0\\\\ -2 & 0 & 1\\end{pmatrix}$에 대하여 $A^{2025}$의 모든 성분의 합은?",
    options: [o("1","$4^{2024}-4$"), o("2","$4^{2024}-2$"), o("3","$4^{2025}-4$"), o("4","$4^{2025}-2$"), o("5","$4^{2025}$")],
    answer: 4,
    explanation: "$A$의 고유값 $4,-1,-2$. $\\lambda=4$ 고유벡터 $(0,1,0)$, $\\lambda=-1$ 고유벡터 $(1,0,1)$. $\\binom{1}{1}{1}=4\\text{고유}+(-1)\\text{고유}=(0,1,0)+(1,0,1)$. $A^{2025}\\binom{1}{1}{1}=4^{2025}(0,1,0)+(-1)^{2025}(1,0,1)=(-1,4^{2025},-1)$. 성분합 $4^{2025}-2$."
  }),
  build({
    num: 7, subject: "선형대수", unit: "고유치와 대각화", concept: "행렬 진위 판정", difficulty: "medium",
    question: "다음에서 행렬 $A=\\begin{pmatrix}1 & 0 & 0 & -2\\\\ 3 & 1 & 2 & 2\\\\ 1 & 0 & 3 & 1\\\\ 3 & 0 & 0 & 6\\end{pmatrix}$에 대한 설명 중 옳은 것만을 모두 고른 것은?\n\n(가) $\\mathrm{rank}(A)=4$\n(나) $\\det\\!\\left(\\dfrac{1}{3}A\\right)=12$\n(다) 행렬 $A$는 대각화 가능하다.",
    options: [o("1","(가)"), o("2","(나)"), o("3","(가), (나)"), o("4","(가), (다)"), o("5","(나), (다)")],
    answer: 4,
    explanation: "(가) RREF 결과 모든 행 독립 → rank 4. **참**. (나) $\\det(\\tfrac{1}{3}A)=(\\tfrac{1}{3})^4\\det A=\\tfrac{36}{81}=\\tfrac{4}{9}\\ne 12$. **거짓**. (다) 고유값 $1,3,3,4$이고 $\\lambda=3$의 기하적 중복도가 $2$이므로 대각화 가능. **참**."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(셸)", difficulty: "medium",
    question: "두 곡선 $y=\\sec^2 x,\\,y=\\tan^2 x$와 두 직선 $x=0,\\,x=1$로 둘러싸인 영역을 직선 $x=-1$을 축으로 회전시켜 얻은 입체의 부피는?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$\\dfrac{3\\pi}{2}$"), o("4","$2\\pi$"), o("5","$3\\pi$")],
    answer: 5,
    explanation: "$\\sec^2 x-\\tan^2 x=1$. 셸 방법(축 $x=-1$): $V=2\\pi\\!\\int_0^1(x+1)\\cdot 1\\,dx=2\\pi(\\tfrac{1}{2}+1)=3\\pi$."
  }),
  build({
    num: 9, subject: "적분학", unit: "이상적분", concept: "수렴/발산 판정", difficulty: "medium",
    question: "다음에서 이상적분이 수렴하는 것만을 모두 고른 것은?\n\n(가) $\\displaystyle\\int_1^{\\infty}\\dfrac{dx}{\\sqrt{x^4+x}}$\n(나) $\\displaystyle\\int_1^{\\infty}e^{-x^3}\\tan^{-1}x\\,dx$\n(다) $\\displaystyle\\int_0^1\\dfrac{e^x}{x\\sqrt{x}}dx$",
    options: [o("1","(가)"), o("2","(나)"), o("3","(가), (나)"), o("4","(가), (다)"), o("5","(나), (다)")],
    answer: 3,
    explanation: "(가) $\\sim 1/x^2$ 수렴. (나) $e^{-x^3}$ 매우 빠르게 감소 → 수렴. (다) $\\sim e^x/x^{3/2}$이고 $x\\to 0$에서 $1/x^{3/2}$이므로 발산."
  }),
  build({
    num: 10, subject: "미분학", unit: "극한과 연속", concept: "Taylor 전개", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\tan 2x-\\sin 2x}{\\sin^{-1}x-\\tan^{-1}x}$의 값은?",
    options: [o("1","$0$"), o("2","$2$"), o("3","$4$"), o("4","$6$"), o("5","$8$")],
    answer: 5,
    explanation: "$\\tan 2x-\\sin 2x=\\tfrac{(2x)^3}{2}\\cdot\\tfrac{1}{1}+\\cdots=4x^3+\\cdots$ (정확히 $\\tan u-\\sin u\\sim u^3/2$, $u=2x$이라 $4x^3$). $\\sin^{-1}x-\\tan^{-1}x=(x+x^3/6)-(x-x^3/3)=x^3/2$. 비 $4x^3/(x^3/2)=8$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "중적분", concept: "적분 영역 시각화", difficulty: "medium",
    question: "이중적분 $\\displaystyle\\int_{-1}^{1}\\!\\!\\int_{|y|}^{1}e^{1+x^2}dx\\,dy$의 값은?",
    options: [o("1","$e^2-e$"), o("2","$e^2+e$"), o("3","$2(e^2-e)$"), o("4","$2(e^2+e)$"), o("5","$4(e^2+e)$")],
    answer: 1,
    explanation: "영역은 $y$축에 대해 대칭이므로 1사분면 $\\times 2$: $2\\!\\int_0^1\\!\\!\\int_y^1 e^{1+x^2}dx\\,dy$. 적분 순서 변경: $2\\!\\int_0^1\\!\\!\\int_0^x e^{1+x^2}dy\\,dx=2\\!\\int_0^1 xe^{1+x^2}dx=[e^{1+x^2}]_0^1=e^2-e$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "편도함수", concept: "다변수 극한 존재", difficulty: "medium",
    question: "다음에서 극한이 존재하는 것만을 모두 고른 것은?\n\n(가) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy^2\\cos y}{x^2+y^4}$\n(나) $\\displaystyle\\lim_{(x,y)\\to(0,0)}x^2 y\\sin\\!\\left(\\dfrac{1}{x^2+y^2}\\right)$\n(다) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x\\sin^{-1}y}{\\sqrt{x^2+y^2}}$",
    options: [o("1","(가)"), o("2","(나)"), o("3","(가), (나)"), o("4","(가), (다)"), o("5","(나), (다)")],
    answer: 5,
    explanation: "(가) $x=y^2$ 따라서 극한 $1/2$, $x$축 따라서 $0$이라 **존재 X**. (나) $|x^2 y\\sin(\\cdot)|\\le x^2|y|\\to 0$. **존재**. (다) $\\sin^{-1}y/y\\to 1$이라 $xy/\\sqrt{x^2+y^2}\\to 0$ (Cauchy-Schwarz). **존재**."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리(대칭성)", difficulty: "medium",
    question: "극곡선 $r=1+\\cos\\theta$ $(0\\le\\theta\\le 2\\pi)$에서 벡터장 $\\mathbf{F}(x,y)=\\tan^{-1}y\\,\\mathbf{i}+\\!\\left(2xy+\\dfrac{x}{1+y^2}\\right)\\!\\mathbf{j}$의 선적분의 값은?",
    options: [o("1","$-\\dfrac{2}{3}$"), o("2","$0$"), o("3","$\\dfrac{2}{3}$"), o("4","$\\dfrac{4}{3}$"), o("5","$2$")],
    answer: 2,
    explanation: "그린정리: $Q_x-P_y=2y+\\tfrac{1}{1+y^2}-\\tfrac{1}{1+y^2}=2y$. $\\iint_D 2y\\,dA$. $D$가 $x$축에 대해 대칭이므로(cardioid 대칭) $0$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "선적분과 면적분", concept: "방사형 보존벡터장", difficulty: "medium",
    question: "점 $P$는 원점으로부터 거리가 $6$이고 점 $Q$는 원점으로부터 거리가 $8$인 점이다. 점 $P$에서 점 $Q$까지 연결하는 매끄러운 곡선 $C$와 벡터장 $\\mathbf{F}(x,y,z)=\\dfrac{x\\mathbf{i}+y\\mathbf{j}+z\\mathbf{k}}{(x^2+y^2+z^2)^{3/2}}$에 대하여 $\\displaystyle\\int_C \\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$-\\dfrac{7}{24}$"), o("2","$-\\dfrac{1}{24}$"), o("3","$0$"), o("4","$\\dfrac{1}{24}$"), o("5","$\\dfrac{7}{24}$")],
    answer: 4,
    explanation: "$\\mathbf{F}=\\nabla\\!\\left(-\\dfrac{1}{\\sqrt{x^2+y^2+z^2}}\\right)$ (방사형 그래디언트). 보존이므로 $\\int_C\\mathbf{F}\\cdot d\\mathbf{r}=\\!\\left[-\\tfrac{1}{r}\\right]_{r=6}^{r=8}=-\\tfrac{1}{8}+\\tfrac{1}{6}=\\dfrac{1}{24}$."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분의 계산", concept: "Weierstrass 치환", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{\\pi/2}\\dfrac{1}{2\\sin x+\\cos x+2}dx$의 값은?",
    options: [o("1","$\\ln\\dfrac{3}{2}$"), o("2","$\\ln\\dfrac{5}{3}$"), o("3","$\\ln\\dfrac{7}{4}$"), o("4","$\\ln\\dfrac{9}{5}$"), o("5","$\\ln\\dfrac{11}{6}$")],
    answer: 1,
    explanation: "$t=\\tan(x/2)$ Weierstrass 치환: $\\sin x=\\tfrac{2t}{1+t^2},\\cos x=\\tfrac{1-t^2}{1+t^2},dx=\\tfrac{2}{1+t^2}dt$. 적분 $=\\int_0^1\\tfrac{2}{t^2+4t+3}dt=\\int_0^1\\!\\left(\\tfrac{1}{t+1}-\\tfrac{1}{t+3}\\right)dt=\\ln\\tfrac{t+1}{t+3}\\big|_0^1=\\ln\\tfrac{1}{2}-\\ln\\tfrac{1}{3}=\\ln\\dfrac{3}{2}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
