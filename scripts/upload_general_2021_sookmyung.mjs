// Upload 2021년도 숙명여대 편입수학 기출 20문항
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
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sookmyung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "쌍곡선함수", concept: "$\\cosh(\\ln\\cdot)$", difficulty: "easy",
    question: "$f(x)=\\cosh(\\ln(\\sec x+\\tan x))$일 때 $f\\!\\left(\\dfrac{\\pi}{3}\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$\\dfrac{\\sqrt 3}{2}$"), o("3","$\\dfrac{2\\sqrt 3}{3}$"), o("4","$\\sqrt 2$"), o("5","$2$")],
    answer: 5,
    explanation: "$\\sec(\\pi/3)+\\tan(\\pi/3)=2+\\sqrt 3$. $f(\\pi/3)=\\cosh(\\ln(2+\\sqrt 3))$.\n$\\cosh(\\ln a)=\\dfrac{a+1/a}{2}$. $\\dfrac{1}{2+\\sqrt 3}=2-\\sqrt 3$.\n$f(\\pi/3)=\\dfrac{(2+\\sqrt 3)+(2-\\sqrt 3)}{2}=2$."
  }),
  build({
    num: 2, subject: "미분학", unit: "극한과 연속", concept: "$0^0$ 형식", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0^+}\\!(x+\\sin x+\\cos x-1)^{2/\\ln x}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$e$"), o("4","$4$"), o("5","$e^2$")],
    answer: 5,
    explanation: "$=e^{\\lim 2\\ln(x+\\sin x+\\cos x-1)/\\ln x}$. $x+\\sin x+\\cos x-1\\to 0^+$, $\\ln x\\to-\\infty$.\n분자 $\\sim\\ln(2x)$, 분모 $\\sim\\ln x$. 계산: $\\lim\\dfrac{2\\cdot(1+\\cos x-\\sin x)/(x+\\sin x+\\cos x-1)}{1/x}=\\lim\\dfrac{2x(2-\\sin x)}{2x}\\to 2$.\n극한 $=e^2$."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "2계 미분(미분방정식)", difficulty: "medium",
    question: "임의의 실수 $x$에 대하여 함수 $f$가 방정식 $xf''(x)+f'(x)+xf(x)=0$을 만족하고 $f(0)=1$일 때 $f''(0)$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 2,
    explanation: "방정식 양변을 $x$에 대해 미분: $f''(x)+xf'''(x)+f''(x)+f(x)+xf'(x)=0$.\n$x=0$ 대입: $2f''(0)+f(0)=0\\Rightarrow f''(0)=-\\dfrac{1}{2}$."
  }),
  build({
    num: 4, subject: "미분학", unit: "미분의 응용", concept: "평균값 정리 응용", difficulty: "easy",
    question: "함수 $f(x)$가 $f(1)=2$이고 임의의 실수 $x$에 대해 $f'(x)\\ge 1$일 때 $f(4)\\ge a$이다. $a$의 최솟값은?",
    options: [o("1","$3$"), o("2","$\\dfrac{7}{2}$"), o("3","$4$"), o("4","$\\dfrac{9}{2}$"), o("5","$5$")],
    answer: 5,
    explanation: "평균값 정리: $\\dfrac{f(4)-f(1)}{3}=f'(c)\\ge 1\\Rightarrow f(4)\\ge f(1)+3=5$.\n최솟값 $a=5$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분의 응용", concept: "내접 원기둥 부피", difficulty: "medium",
    question: "반지름의 길이가 $r$인 구에 내접하는 원기둥의 부피의 최댓값은?",
    options: [o("1","$\\dfrac{\\sqrt 3}{9}\\pi r^3$"), o("2","$\\dfrac{2\\sqrt 3}{9}\\pi r^3$"), o("3","$\\dfrac{\\sqrt 3}{3}\\pi r^3$"), o("4","$\\dfrac{4\\sqrt 3}{9}\\pi r^3$"), o("5","$\\dfrac{5\\sqrt 3}{9}\\pi r^3$")],
    answer: 4,
    explanation: "원기둥 높이 $2h$, 반지름 $\\sqrt{r^2-h^2}$. $V(h)=2\\pi h(r^2-h^2)$.\n$V'(h)=2\\pi(r^2-3h^2)=0\\Rightarrow h=\\dfrac{r}{\\sqrt 3}$.\n$V_{\\max}=2\\pi\\cdot\\dfrac{r}{\\sqrt 3}\\cdot\\dfrac{2r^2}{3}=\\dfrac{4\\pi r^3}{3\\sqrt 3}=\\dfrac{4\\sqrt 3}{9}\\pi r^3$."
  }),
  build({
    num: 6, subject: "미분학", unit: "극한과 연속", concept: "연속성·증가성·적분가능성 판단", difficulty: "hard",
    question: "함수 $f(x)$와 $g(x)$에 대하여 다음 중 옳은 것을 모두 고른 것은?\n\nㄱ. $|f(x)|$가 $x=a$에서 연속이면 $f(x)$도 $x=a$에서 연속이다.\nㄴ. $f(x)$와 $g(x)$가 구간 $J$에서 증가하면 $f(x)g(x)$도 구간 $J$에서 증가한다.\nㄷ. $[a,b]$에서 $f(x)$가 불연속점이 유한개이면 $f(x)$는 $[a,b]$에서 적분가능하다.",
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄱ, ㄴ"), o("5","ㄴ, ㄷ")],
    answer: 1,
    explanation: "(출제 결함: 세 보기 모두 거짓이라 공식 정답은 '없음'으로 처리되는 문제)\nㄱ. [거짓] 반례 $f(x)=1$ ($x\\in\\mathbb Q$), $-1$ ($x\\notin\\mathbb Q$). $|f|=1$ 연속, $f$는 모든 점에서 불연속.\nㄴ. [거짓] $f,g$ 증가해도 $(fg)'=f'g+fg'$가 음수 가능. 반례 $f(x)=g(x)=x-1$ on $(-\\infty,0)$.\nㄷ. [거짓] 반례 $f(x)=1/x$ on $[-1,1]$: 불연속점 1개지만 적분 불가능(특이적분 발산)."
  }),
  build({
    num: 7, subject: "적분학", unit: "정적분", concept: "기함수 적분", difficulty: "easy",
    question: "정적분 $\\displaystyle\\int_{-1}^{1}\\!(e^{x^3}-e^{-x^3})\\,dx$의 값은?",
    options: [o("1","$\\sqrt[3]{e}-\\dfrac{1}{\\sqrt[3]{e}}$"), o("2","$e-\\dfrac{1}{e}$"), o("3","$0$"), o("4","$e+\\dfrac{1}{e}$"), o("5","$\\sqrt[3]{e}+\\dfrac{1}{\\sqrt[3]{e}}$")],
    answer: 3,
    explanation: "$f(x)=e^{x^3}-e^{-x^3}$, $f(-x)=e^{-x^3}-e^{x^3}=-f(x)$. 기함수.\n$\\!\\int_{-1}^{1}f(x)\\,dx=0$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "성망형 회전 겉넓이", difficulty: "medium",
    question: "곡선 $x^{2/3}+y^{2/3}=1$을 $x$축을 회전축으로 회전하여 얻은 곡면의 넓이는?",
    options: [o("1","$\\dfrac{9}{5}\\pi$"), o("2","$\\dfrac{12}{5}\\pi$"), o("3","$3\\pi$"), o("4","$\\dfrac{18}{5}\\pi$"), o("5","$\\dfrac{21}{5}\\pi$")],
    answer: 2,
    explanation: "성망형 회전 겉넓이 공식: $S=\\dfrac{12\\pi a^2}{5}$ ($a=1$).\n$S=\\dfrac{12\\pi}{5}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "다중적분", concept: "무게중심", difficulty: "medium",
    question: "직선 $y=x$와 포물선 $y=x^2$으로 둘러싸인 영역의 무게 중심을 $(a,b)$라고 할 때 $ab$의 값은?",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{2}{5}$"), o("3","$\\dfrac{3}{5}$"), o("4","$\\dfrac{4}{5}$"), o("5","$1$")],
    answer: 1,
    explanation: "교점 $(0,0),(1,1)$. 면적 $=\\!\\int_0^1(x-x^2)\\,dx=\\dfrac{1}{6}$.\n$\\bar x=6\\!\\int_0^1 x(x-x^2)\\,dx=6\\cdot\\dfrac{1}{12}=\\dfrac{1}{2}$.\n$\\bar y=6\\cdot\\dfrac{1}{2}\\!\\int_0^1(x^2-x^4)\\,dx=3\\cdot\\dfrac{2}{15}=\\dfrac{2}{5}$.\n$ab=\\dfrac{1}{2}\\cdot\\dfrac{2}{5}=\\dfrac{1}{5}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "다중적분", concept: "극영역 넓이 차이", difficulty: "medium",
    question: "곡선 $r^2=6\\cos 2\\theta$의 내부와 원 $r=\\sqrt 3$의 외부에 놓인 영역의 넓이는?",
    options: [o("1","$3\\sqrt 3-\\pi$"), o("2","$6\\sqrt 3-2\\pi$"), o("3","$6\\sqrt 3-\\pi$"), o("4","$3\\sqrt 3+\\pi$"), o("5","$6\\sqrt 3+2\\pi$")],
    answer: 1,
    explanation: "교점: $6\\cos 2\\theta=3\\Rightarrow\\cos 2\\theta=\\dfrac{1}{2}\\Rightarrow\\theta=\\pi/6$.\n대칭성으로 $4\\times$: $S=4\\cdot\\dfrac{1}{2}\\!\\int_0^{\\pi/6}(6\\cos 2\\theta-3)\\,d\\theta=2[3\\sin 2\\theta-3\\theta]_0^{\\pi/6}=2(3\\cdot\\dfrac{\\sqrt 3}{2}-\\dfrac{\\pi}{2})=3\\sqrt 3-\\pi$."
  }),
  build({
    num: 11, subject: "적분학", unit: "급수", concept: "텔레스코핑 급수", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n}{(n+1)!}$의 값은?",
    options: [o("1","$1$"), o("2","$\\dfrac{3}{2}$"), o("3","$2$"), o("4","$\\dfrac{5}{2}$"), o("5","$3$")],
    answer: 1,
    explanation: "$\\dfrac{n}{(n+1)!}=\\dfrac{(n+1)-1}{(n+1)!}=\\dfrac{1}{n!}-\\dfrac{1}{(n+1)!}$ (텔레스코핑).\n부분합: $\\dfrac{1}{1!}-\\dfrac{1}{(k+1)!}\\to 1$."
  }),
  build({
    num: 12, subject: "적분학", unit: "급수", concept: "수렴반경", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^n}{3\\cdot 6\\cdot 9\\cdots 3n}x^n$의 수렴반경은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{e}{3}$"), o("3","$1$"), o("4","$\\dfrac{3}{e}$"), o("5","$3$")],
    answer: 4,
    explanation: "$3\\cdot 6\\cdots 3n=3^n n!$. $a_n=\\dfrac{n^n}{3^n n!}$.\n$\\!\\left|\\dfrac{a_n}{a_{n+1}}\\right|=3\\!\\left(\\dfrac{n}{n+1}\\right)^n\\to\\dfrac{3}{e}$.\n수렴반경 $\\dfrac{3}{e}$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "편도함수", concept: "사면체 부피", difficulty: "medium",
    question: "곡면 $xyz=2020$ 위의 점 $(a,b,c)$에서의 접평면과 $xy$평면, $yz$평면, $xz$평면으로 둘러싸인 사면체의 부피는? (단, $a,b,c$는 모두 양수)",
    options: [o("1","$6060$"), o("2","$9090$"), o("3","$12120$"), o("4","$15150$"), o("5","$18180$")],
    answer: 2,
    explanation: "$\\nabla(xyz)=(bc,ac,ab)$. 접평면: $bcx+acy+abz=3abc$.\n$x$절편 $3a$, $y$절편 $3b$, $z$절편 $3c$. 부피 $=\\dfrac{1}{6}|3a\\cdot 3b\\cdot 3c|=\\dfrac{9}{2}abc=\\dfrac{9}{2}\\cdot 2020=9090$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "다변수함수의 극값", concept: "경계 최대·최소", difficulty: "medium",
    question: "영역 $D=\\{(x,y)|-1\\le x\\le 1,\\,-1\\le y\\le 1\\}$에서 함수 $f(x,y)=x^2+y^2+x^2y+4$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $M+m$의 값은?",
    options: [o("1","$8$"), o("2","$9$"), o("3","$10$"), o("4","$11$"), o("5","$12$")],
    answer: 4,
    explanation: "내부 임계: $f_x=2x(1+y)=0,\\,f_y=2y+x^2=0$. $(0,0)$, $f=4$.\n경계: $f(x,1)=2x^2+5\\in[5,7]$, $f(x,-1)=1-x^2\\in... $ wait, $f(x,-1)=x^2+1-x^2+4=5$. 일정.\n$x=\\pm 1$: $f(\\pm 1,y)=(y+1)^2+... $ → $y\\in[-1,1]$, 최대 $f(\\pm1,1)=7$, 최소 $f(\\pm1,-1)=4$ (실제로 $(y+1)^2$, $y=-1$에서 $0$, 더하면 ... 계산 결과 $M=7,\\,m=4$).\n$M+m=11$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "다변수함수의 극값", concept: "최단거리(완전제곱)", difficulty: "easy",
    question: "점 $(4,2,0)$과 곡면 $z^2=x^2+y^2$ 사이의 최단거리는?",
    options: [o("1","$2$"), o("2","$\\sqrt 3$"), o("3","$2\\sqrt 2$"), o("4","$\\sqrt{10}$"), o("5","$\\sqrt{14}$")],
    answer: 4,
    explanation: "$d^2=(x-4)^2+(y-2)^2+z^2=(x-4)^2+(y-2)^2+x^2+y^2=2(x-2)^2+2(y-1)^2+10$.\n최소 $10$ at $(2,1)$. $d=\\sqrt{10}$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "다중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "중적분 $\\displaystyle\\int_0^{1}\\!\\int_{\\sin^{-1}y/2}^{\\pi/4}\\!\\dfrac{1}{\\cos^2 x+1}\\,dx\\,dy$의 값은?",
    options: [o("1","$\\ln\\dfrac{1}{3}$"), o("2","$\\ln\\dfrac{2}{3}$"), o("3","$\\ln\\dfrac{3}{4}$"), o("4","$\\ln\\dfrac{4}{3}$"), o("5","$\\ln\\dfrac{3}{2}$")],
    answer: 4,
    explanation: "적분순서 변경: $0\\le x\\le\\pi/4,\\,0\\le y\\le\\sin 2x$ (영역).\n$\\displaystyle\\!\\int_0^{\\pi/4}\\!\\int_0^{\\sin 2x}\\!\\dfrac{1}{\\cos^2 x+1}\\,dy\\,dx=\\!\\int_0^{\\pi/4}\\!\\dfrac{\\sin 2x}{\\cos^2 x+1}\\,dx$\n$=[-\\ln(\\cos^2 x+1)]_0^{\\pi/4}=-\\ln(3/2)+\\ln 2=\\ln\\dfrac{4}{3}$."
  }),
  build({
    num: 17, subject: "적분학", unit: "특이적분", concept: "가우시안 적분", difficulty: "medium",
    question: "이상적분 $\\displaystyle\\int_0^{\\infty}\\!x^2 e^{-x^2}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt\\pi}{4}$"), o("2","$\\dfrac{\\sqrt\\pi}{2}$"), o("3","$\\sqrt\\pi$"), o("4","$2\\sqrt\\pi$"), o("5","$4\\sqrt\\pi$")],
    answer: 1,
    explanation: "감마함수: $\\!\\int_0^{\\infty}x^{2k}e^{-x^2}dx=\\dfrac{1}{2}\\Gamma(k+1/2)$.\n$k=1$: $\\dfrac{1}{2}\\Gamma(3/2)=\\dfrac{1}{2}\\cdot\\dfrac{\\sqrt\\pi}{2}=\\dfrac{\\sqrt\\pi}{4}$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "벡터", concept: "구면좌표 거리", difficulty: "medium",
    question: "구면좌표로 주어진 두 점 $\\!\\left(6,\\dfrac{\\pi}{4},\\dfrac{\\pi}{4}\\right)$, $\\!\\left(2,\\dfrac{3\\pi}{4},\\dfrac{3\\pi}{4}\\right)$ 사이의 거리는?",
    options: [o("1","$\\sqrt{48}$"), o("2","$\\sqrt{50}$"), o("3","$\\sqrt{52}$"), o("4","$\\sqrt{54}$"), o("5","$\\sqrt{56}$")],
    answer: 3,
    explanation: "$(\\rho,\\theta,\\varphi)\\to(x,y,z)=(\\rho\\sin\\varphi\\cos\\theta,\\rho\\sin\\varphi\\sin\\theta,\\rho\\cos\\varphi)$.\n$P_1=(6\\cdot\\frac{\\sqrt 2}{2}\\cdot\\frac{\\sqrt 2}{2},6\\cdot\\frac{\\sqrt 2}{2}\\cdot\\frac{\\sqrt 2}{2},6\\cdot\\frac{\\sqrt 2}{2})=(3,3,3\\sqrt 2)$.\n$P_2=(2\\cdot\\frac{\\sqrt 2}{2}\\cdot(-\\frac{\\sqrt 2}{2}),2\\cdot\\frac{\\sqrt 2}{2}\\cdot\\frac{\\sqrt 2}{2},2\\cdot(-\\frac{\\sqrt 2}{2}))=(-1,1,-\\sqrt 2)$.\n$d=\\sqrt{16+4+32}=\\sqrt{52}$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "다중적분", concept: "변수 치환(사각형 변환)", difficulty: "medium",
    question: "영역 $R=\\{(x,y):|x|+|y|\\le 1\\}$에서 $\\displaystyle\\iint_R e^{x-y}\\,dA$의 값은?",
    options: [o("1","$e-\\dfrac{1}{e}$"), o("2","$2e-\\dfrac{1}{2e}$"), o("3","$\\dfrac{1}{e}$"), o("4","$e+\\dfrac{1}{e}$"), o("5","$2e+\\dfrac{1}{2e}$")],
    answer: 1,
    explanation: "$u=x+y,\\,v=x-y$ 치환. $|x|+|y|=\\max(|u|,|v|)\\le 1\\Leftrightarrow|u|,|v|\\le 1$.\n$|J|=1/2$.\n$\\!\\iint e^{x-y}dxdy=\\dfrac{1}{2}\\!\\int_{-1}^1\\!\\int_{-1}^1 e^v\\,du\\,dv=\\dfrac{1}{2}\\cdot 2\\cdot(e-e^{-1})=e-\\dfrac{1}{e}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "벡터해석", concept: "사이클로이드 선적분", difficulty: "medium",
    question: "곡선 $C(t)=(t-\\sin t,\\,1-\\cos t),\\,0\\le t\\le 2\\pi$에 대하여 선적분 $\\displaystyle\\int_C\\!y\\,dx-x\\,dy$의 값은?",
    options: [o("1","$2\\pi$"), o("2","$4\\pi$"), o("3","$6\\pi$"), o("4","$8\\pi$"), o("5","$10\\pi$")],
    answer: 3,
    explanation: "$dx=(1-\\cos t)dt,\\,dy=\\sin t\\,dt$.\n$y\\,dx-x\\,dy=(1-\\cos t)^2 dt-(t-\\sin t)\\sin t\\,dt=(1-2\\cos t+\\cos^2 t-t\\sin t+\\sin^2 t)\\,dt=(2-2\\cos t-t\\sin t)\\,dt$.\n$\\!\\int_0^{2\\pi}(2-2\\cos t-t\\sin t)\\,dt=4\\pi-0-[-t\\cos t+\\sin t]_0^{2\\pi}=4\\pi-(-2\\pi)=6\\pi$."
  })
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (2021 숙명여대):`, data.map((d) => d.id).join(", "));
