// Upload 2022년도 숙명여대 편입수학 기출 20문항
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

const SCHOOL = "숙명여대";
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sookmyung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "적분학", unit: "급수", concept: "다항식 인수분해", difficulty: "easy",
    question: "$\\dfrac{10^9+3\\cdot 10^6+2\\cdot 10^3-6}{10^3-1}$의 각 자리수의 합은?",
    options: [o("1","$9$"), o("2","$11$"), o("3","$13$"), o("4","$15$"), o("5","$17$")],
    answer: 2,
    explanation: "$10^3=x$로 두면 $\\dfrac{x^3+3x^2+2x-6}{x-1}=\\dfrac{(x-1)(x^2+4x+6)}{x-1}=x^2+4x+6=10^6+4\\cdot 10^3+6=1004006$.\n각 자리수 합 $=1+0+0+4+0+0+6=11$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "함수방정식·3차함수 추정", difficulty: "medium",
    question: "다항식 $f(x)$가 임의의 실수 $x$에 대하여 $f(x+1)-f(x-1)=6x^2+4$를 만족시킨다. $f(0)=2$일 때 $f(1)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 4,
    explanation: "$f(x)=ax^3+bx^2+cx+d$로 두자. $f(x+1)-f(x-1)=6ax^2+4bx+(2a+2c)$.\n비교: $6a=6,\\,4b=0,\\,2a+2c=4\\Rightarrow a=1,b=0,c=1$. $f(0)=d=2$.\n$f(x)=x^3+x+2$. $f(1)=4$."
  }),
  build({
    num: 3, subject: "미분학", unit: "극한과 연속", concept: "절댓값 함수 극한", difficulty: "easy",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}\\!\\dfrac{|2x-1|-|2x+1|}{x}$의 값은?",
    options: [o("1","$-4$"), o("2","$-2$"), o("3","$0$"), o("4","$2$"), o("5","$4$")],
    answer: 1,
    explanation: "$x\\to 0$ 근방: $|2x-1|=1-2x,\\,|2x+1|=2x+1$.\n$\\dfrac{(1-2x)-(2x+1)}{x}=\\dfrac{-4x}{x}=-4$."
  }),
  build({
    num: 4, subject: "미분학", unit: "극한과 연속", concept: "테일러 급수 계수 비교", difficulty: "medium",
    question: "상수 $a,b,c$에 대하여 극한 $\\displaystyle\\lim_{x\\to 0}\\!\\dfrac{ax^2+\\sin(bx)+\\sin(cx)}{3x^2+5x^4+7x^6}=8$일 때 $a+b+c$의 값은?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$8$"), o("4","$16$"), o("5","$24$")],
    answer: 5,
    explanation: "분모의 최저차 $3x^2$. 분자: $\\sin(bx)+\\sin(cx)=(b+c)x+O(x^3)$, $ax^2$.\n극한이 유한하려면 1차항 $=0$: $b+c=0$.\n$\\dfrac{ax^2+O(x^3)}{3x^2}\\to\\dfrac{a}{3}=8\\Rightarrow a=24$.\n$a+b+c=24+0=24$."
  }),
  build({
    num: 5, subject: "미분학", unit: "도함수", concept: "함수방정식 미분", difficulty: "medium",
    question: "미분가능한 함수 $f$가 모든 실수 $x,y$에 대하여 $f(x+y)=f(x)+f(y)+xy$를 만족시킨다. $f'(0)=-2$일 때 $f(-2)$의 값은?",
    options: [o("1","$-6$"), o("2","$-3$"), o("3","$0$"), o("4","$3$"), o("5","$6$")],
    answer: 5,
    explanation: "$x$로 편미분: $f'(x+y)=f'(x)+y$. $x=0$ 대입: $f'(y)=-2+y$.\n$f(y)=-2y+\\dfrac{y^2}{2}+C$. $f(0)=0$ (식에 $x=y=0$ 대입)이므로 $C=0$.\n$f(-2)=4+2=6$."
  }),
  build({
    num: 6, subject: "미분학", unit: "쌍곡선함수", concept: "역함수·쌍곡선", difficulty: "medium",
    question: "$x=\\ln(\\sec y+\\tan y)$일 때 $\\cosh x$의 값은?",
    options: [o("1","$\\sin y$"), o("2","$\\tan y$"), o("3","$\\cot y$"), o("4","$\\sec y$"), o("5","$\\csc y$")],
    answer: 4,
    explanation: "$e^x=\\sec y+\\tan y$. $e^{-x}=\\dfrac{1}{\\sec y+\\tan y}=\\dfrac{\\sec y-\\tan y}{\\sec^2 y-\\tan^2 y}=\\sec y-\\tan y$.\n$\\cosh x=\\dfrac{e^x+e^{-x}}{2}=\\sec y$."
  }),
  build({
    num: 7, subject: "적분학", unit: "부정적분", concept: "부분분수(유리함수 적분)", difficulty: "medium",
    question: "이차함수 $f(x)$에 대하여 부정적분 $\\displaystyle\\int\\!\\dfrac{f(x)}{x^2(x+1)^3}\\,dx$가 유리함수이다. $f(0)=1$일 때 $f'(0)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 3,
    explanation: "$\\dfrac{f(x)}{x^2(x+1)^3}=\\dfrac{A}{x}+\\dfrac{B}{x^2}+\\dfrac{C}{x+1}+\\dfrac{D}{(x+1)^2}+\\dfrac{E}{(x+1)^3}$.\n유리함수가 되려면 $A=C=0$.\n$f(x)=B(x+1)^3+Dx^2(x+1)+Ex^2$. $f(0)=B=1$, $f'(x)$의 상수항 $=3B=3$.\n$f'(0)=3$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "역함수 적분(대칭)", difficulty: "medium",
    question: "정적분 $\\displaystyle\\int_0^{1}\\!(\\sqrt[3]{1-x^5}-\\sqrt[5]{1-x^3}+1)\\,dx$의 값은?",
    options: [o("1","$\\sqrt[3]{3}-1$"), o("2","$\\sqrt[3]{5}-1$"), o("3","$1$"), o("4","$\\sqrt[3]{3}+1$"), o("5","$\\sqrt[3]{5}+1$")],
    answer: 3,
    explanation: "$f(x)=\\sqrt[3]{1-x^5}$이면 $f^{-1}(y)=\\sqrt[5]{1-y^3}$ (감소함수, $f(0)=1,\\,f(1)=0$).\n역함수 적분 대칭으로 $\\!\\int_0^1 f(x)dx=\\!\\int_0^1 f^{-1}(y)dy$.\n$\\!\\int_0^1(\\sqrt[3]{1-x^5}-\\sqrt[5]{1-x^3}+1)dx=0+1=1$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "라플라스변환", concept: "합성곱 적분방정식", difficulty: "hard",
    question: "미분가능한 함수 $f$가 임의의 실수 $x$에 대하여 $\\displaystyle\\int_0^{x}\\!f(t)\\,dt+\\int_0^{x}\\!tf(x-t)\\,dt=e^{-x}-1$을 만족시킬 때 $f(2)$의 값은?",
    options: [o("1","$e^{-2}$"), o("2","$e^{-1}$"), o("3","$1$"), o("4","$e$"), o("5","$e^2$")],
    answer: 1,
    explanation: "합성곱: $\\int_0^x f(t)dt+(f*x)(x)=e^{-x}-1$.\n라플라스: $\\dfrac{F}{s}+F\\cdot\\dfrac{1}{s^2}=\\dfrac{1}{s+1}-\\dfrac{1}{s}=-\\dfrac{1}{s(s+1)}$.\n$F\\cdot\\dfrac{s+1}{s^2}=-\\dfrac{1}{s(s+1)}\\Rightarrow F=-\\dfrac{s}{(s+1)^2}=-\\dfrac{1}{s+1}+\\dfrac{1}{(s+1)^2}$.\n$f(x)=-e^{-x}+xe^{-x}=(x-1)e^{-x}$. $f(2)=e^{-2}$."
  }),
  build({
    num: 10, subject: "미분학", unit: "도함수", concept: "오목/단조성 분석", difficulty: "hard",
    question: "두 함수 $f,g$가 실수 전체에서 $f'',g''$ 연속이고 열린구간 $(a,b)$에서 $f''(x)<g''(x)$이다. $f(b)=g(b),\\,f'(a)=g'(a)$일 때 다음 중 옳은 것을 모두 고른 것은?\n\nㄱ. 열린구간 $(a,b)$에서 $f(x)>g(x)$이다.\nㄴ. 열린구간 $(a,b)$에서 $f'(x)<g'(x)$이다.\nㄷ. 열린구간 $(a,b)$에서 $f$는 증가한다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄱ, ㄴ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 3,
    explanation: "$h=f-g$. $h''<0$ (위로 볼록), $h'(a)=0,\\,h(b)=0$.\n$h''<0\\Rightarrow h'$ 감소, $h'(a)=0$이므로 $(a,b)$에서 $h'<0$, 즉 $f'<g'$ → ㄴ 참.\n$h'<0\\Rightarrow h$ 감소, $h(b)=0$이므로 $(a,b)$에서 $h>0$, 즉 $f>g$ → ㄱ 참.\nㄷ: $g$ 정보 없이 $f$의 증감 판단 불가 → 거짓.\n답: ㄱ, ㄴ."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "다중적분", concept: "심장형(loop) 넓이", difficulty: "medium",
    question: "곡선 $r=1+2\\cos\\theta$의 큰 고리와 작은 고리 사이의 영역의 넓이는?",
    options: [o("1","$\\dfrac{1}{4}(\\pi+3\\sqrt 3)$"), o("2","$\\dfrac{1}{2}(\\pi+3\\sqrt 3)$"), o("3","$\\pi+3\\sqrt 3$"), o("4","$2(\\pi+3\\sqrt 3)$"), o("5","$4(\\pi+3\\sqrt 3)$")],
    answer: 3,
    explanation: "$r=0$: $\\cos\\theta=-1/2,\\,\\theta=2\\pi/3,4\\pi/3$.\n큰 고리(외부) 면적: $\\dfrac{1}{2}\\!\\int_{-2\\pi/3}^{2\\pi/3}(1+2\\cos\\theta)^2 d\\theta=2\\pi+\\dfrac{3\\sqrt 3}{2}$.\n작은 고리(내부) 면적: $\\dfrac{1}{2}\\!\\int_{2\\pi/3}^{4\\pi/3}(1+2\\cos\\theta)^2 d\\theta=\\pi-\\dfrac{3\\sqrt 3}{2}$.\n사이: $(2\\pi+\\dfrac{3\\sqrt 3}{2})-(\\pi-\\dfrac{3\\sqrt 3}{2})=\\pi+3\\sqrt 3$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이(원 형태)", difficulty: "medium",
    question: "곡선 $r=3\\sin\\theta+4\\cos\\theta$ ($0\\le\\theta\\le 2\\pi$)의 길이는?",
    options: [o("1","$9\\pi$"), o("2","$10\\pi$"), o("3","$11\\pi$"), o("4","$12\\pi$"), o("5","$13\\pi$")],
    answer: 2,
    explanation: "$r=5\\sin(\\theta+\\alpha)$ (직경 5인 원, 0~2π에서 2바퀴 그려짐).\n$L=\\!\\int_0^{2\\pi}\\sqrt{r^2+(r')^2}d\\theta=\\!\\int_0^{2\\pi}\\sqrt{25(\\sin^2+\\cos^2)}d\\theta=\\!\\int_0^{2\\pi}5\\,d\\theta=10\\pi$."
  }),
  build({
    num: 13, subject: "적분학", unit: "급수", concept: "지수함수 급수", difficulty: "easy",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n e^n}{n!}$의 합은?",
    options: [o("1","$-e^{-e}-1$"), o("2","$-e^{-e}$"), o("3","$-e^{-e}+1$"), o("4","$e^{-e}$"), o("5","$e^{-e}-1$")],
    answer: 4,
    explanation: "$e^x=\\sum\\dfrac{x^n}{n!}$, $x=-e$ 대입: $e^{-e}=\\sum\\dfrac{(-e)^n}{n!}=\\sum\\dfrac{(-1)^n e^n}{n!}$."
  }),
  build({
    num: 14, subject: "적분학", unit: "급수", concept: "테일러·고계도함수", difficulty: "medium",
    question: "$f(x)=e^{x^2}$일 때 $f^{(2n)}(0)$의 값은?",
    options: [o("1","$\\dfrac{(2n-1)!}{n!}$"), o("2","$\\dfrac{(2n)!}{(n+1)!}$"), o("3","$\\dfrac{(2n)!}{(n-1)!}$"), o("4","$\\dfrac{(2n)!}{n!}$"), o("5","$\\dfrac{(2n+1)!}{n!}$")],
    answer: 4,
    explanation: "$e^{x^2}=\\sum\\dfrac{x^{2n}}{n!}$. $x^{2n}$의 계수 $=\\dfrac{1}{n!}$.\n$f^{(2n)}(0)=(2n)!\\cdot\\dfrac{1}{n!}=\\dfrac{(2n)!}{n!}$."
  }),
  build({
    num: 15, subject: "미분학", unit: "도함수", concept: "곡률 최댓값(암기)", difficulty: "medium",
    question: "곡선 $y=e^x$의 곡률이 최대인 점의 $y$좌표는?",
    options: [o("1","$\\dfrac{1}{e}$"), o("2","$\\dfrac{1}{\\sqrt 2}$"), o("3","$\\sqrt 2$"), o("4","$2$"), o("5","$e$")],
    answer: 2,
    explanation: "$y=\\ln x$ 최대 곡률점은 $\\!\\left(\\dfrac{1}{\\sqrt 2},-\\dfrac{\\ln 2}{2}\\right)$, 곡률 $\\dfrac{2\\sqrt 3}{9}$.\n$y=e^x$는 $y=\\ln x$의 역함수($y=x$ 대칭)이므로 $y$좌표 $=\\dfrac{1}{\\sqrt 2}$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "편도함수", concept: "방향도함수 최댓값", difficulty: "easy",
    question: "점 $(2,1)$에서 함수 $f(x,y)=x^2y+\\sqrt y$의 변화율의 최댓값은?",
    options: [o("1","$\\dfrac{\\sqrt{145}}{2}$"), o("2","$\\dfrac{5\\sqrt 3}{2}$"), o("3","$\\dfrac{\\sqrt{155}}{2}$"), o("4","$\\dfrac{4\\sqrt{10}}{2}$"), o("5","$\\dfrac{\\sqrt{165}}{2}$")],
    answer: 1,
    explanation: "$f_x=2xy,\\,f_y=x^2+\\dfrac{1}{2\\sqrt y}$. $(2,1)$: $f_x=4,\\,f_y=4+\\dfrac{1}{2}=\\dfrac{9}{2}$.\n$|\\nabla f|=\\sqrt{16+\\dfrac{81}{4}}=\\sqrt{\\dfrac{145}{4}}=\\dfrac{\\sqrt{145}}{2}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "다변수함수의 극값", concept: "구면 최댓값(산술기하)", difficulty: "medium",
    question: "구면 $x^2+y^2+z^2=4$ 상에서 함수 $f(x,y,z)=xy^2z$의 최댓값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$"), o("5","$5$")],
    answer: 2,
    explanation: "산술기하: $x^2+\\dfrac{y^2}{2}+\\dfrac{y^2}{2}+z^2\\ge 4\\!\\left(\\dfrac{x^2y^4z^2}{4}\\right)^{1/4}$.\n$4\\ge 4\\cdot\\dfrac{|xy^2z|^{1/2}}{\\sqrt 2}\\Rightarrow |xy^2z|\\le 2$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "다중적분", concept: "구·원기둥 사이 부피", difficulty: "medium",
    question: "좌표공간에서 부등식 $x^2+z^2\\ge 9$와 $x^2+y^2+z^2\\le 25$를 만족시키는 영역의 부피는?",
    options: [o("1","$\\dfrac{128\\pi}{3}$"), o("2","$\\dfrac{160\\pi}{3}$"), o("3","$64\\pi$"), o("4","$\\dfrac{224\\pi}{3}$"), o("5","$\\dfrac{256\\pi}{3}$")],
    answer: 5,
    explanation: "원기둥 $x^2+z^2=9$ 안쪽의 구 부피: $\\!\\int_0^{2\\pi}\\!\\int_0^3 2\\sqrt{25-r^2}\\cdot r\\,dr\\,d\\theta=4\\pi\\cdot\\dfrac{61}{3}=\\dfrac{244\\pi}{3}$.\n구 전체 부피 $\\dfrac{500\\pi}{3}$.\n구하는 부피 $=\\dfrac{500\\pi}{3}-\\dfrac{244\\pi}{3}=\\dfrac{256\\pi}{3}$."
  }),
  build({
    num: 19, subject: "적분학", unit: "정적분의 응용", concept: "파푸스(이격축)", difficulty: "easy",
    question: "곡선 $x^2+(y-1)^2=1$을 $x$축을 회전축으로 회전하여 생기는 곡면의 넓이는?",
    options: [o("1","$8\\pi$"), o("2","$4\\pi+2\\pi^2$"), o("3","$4\\pi^2$"), o("4","$8\\pi+2\\pi^2$"), o("5","$8\\pi^2$")],
    answer: 3,
    explanation: "파푸스 정리: $S=2\\pi\\cdot d\\cdot L$. $d=$ 중심에서 회전축까지 $=1$, $L=$ 원 둘레 $=2\\pi$.\n$S=2\\pi\\cdot 1\\cdot 2\\pi=4\\pi^2$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "벡터해석", concept: "그린정리(시계방향)", difficulty: "medium",
    question: "곡선 $C$가 원 $x^2+y^2=4$를 따라 시계방향으로 $1$회전하는 곡선일 때 선적분 $\\displaystyle\\int_C\\!x^2y\\,dx-xy^2\\,dy$의 값은?",
    options: [o("1","$-8\\pi$"), o("2","$-4\\pi$"), o("3","$0$"), o("4","$4\\pi$"), o("5","$8\\pi$")],
    answer: 5,
    explanation: "반시계 기준 그린정리: $\\!\\oint=\\!\\iint(\\partial Q/\\partial x-\\partial P/\\partial y)dA=\\!\\iint(-y^2-x^2)dA=-\\!\\iint(x^2+y^2)dA$.\n$=-\\!\\int_0^{2\\pi}\\!\\int_0^2 r^3 dr d\\theta=-2\\pi\\cdot 4=-8\\pi$.\n시계방향이므로 부호 반전: $8\\pi$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2022 숙명여대):`, data.map((d) => d.id).join(", "));
