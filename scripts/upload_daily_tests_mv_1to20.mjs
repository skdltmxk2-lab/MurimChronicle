// Upload 다변수함수 Daily TEST 1~20 (119 problems).
// Usage: node scripts/upload_daily_tests_mv_1to20.mjs
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

const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ testNo, num, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-daily-mv-r${testNo}-${num}`;
  const tags = Array.from(new Set(["daily", `daily-test-mv-${testNo}`, "다변수함수", unit, concept].filter(Boolean)));
  return {
    id, subject: "다변수함수", unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: answer, explanation, explanation_content_type: "latex",
    explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  // ========== DT1 벡터함수 ==========
  build({ testNo: 1, num: 1, unit: "곡선과 곡면", concept: "벡터함수 정의역", difficulty: "easyMedium",
    question: "벡터함수 $\\vec r(t)=\\langle\\tan^{-1}(t-3),\\ \\ln(4-t^2),\\ \\sqrt{t+1}\\rangle$가 잘 정의되는 영역은?",
    options: [
      o("1","$[-1,2)$"),
      o("2","$(-2,2)$"),
      o("3","$[-1,2]$"),
      o("4","$(-1,2)$"),
      o("5","$(-\\infty,\\infty)$")
    ], answer: "1",
    explanation: "$\\tan^{-1}$: 모든 실수, $\\ln(4-t^2)\\Rightarrow -2<t<2$, $\\sqrt{t+1}\\Rightarrow t\\ge -1$. 교집합 $[-1,2)$." }),
  build({ testNo: 1, num: 2, unit: "곡선과 곡면", concept: "적분으로 정의된 함수", difficulty: "easyMedium",
    question: "$\\displaystyle\\lim_{x\\to 2}\\dfrac{d}{dx}\\langle\\int_0^{x^2}e^{-\\sqrt t}dt,\\ \\int_0^{\\sqrt x}e^{t^2}dt\\rangle$의 두 성분의 곱은?",
    options: [o("1","$\\sqrt 2$"),o("2","$2$"),o("3","$e^2$"),o("4","$\\sqrt 2 e^2$"),o("5","$e$")],
    answer: "1",
    explanation: "1성분: $e^{-x}\\cdot 2x|_{x=2}=4e^{-2}$. 2성분: $e^x\\cdot\\frac{1}{2\\sqrt x}|_{x=2}=\\frac{e^2}{2\\sqrt 2}$. 곱 $=\\sqrt 2$." }),
  build({ testNo: 1, num: 3, unit: "곡선과 곡면", concept: "벡터함수 접선", difficulty: "easyMedium",
    question: "$\\vec r(t)=(3t,4\\sin t,4\\cos t)$의 그래프 위의 점 $\\left(\\dfrac{3}{2}\\pi,4,0\\right)$에서의 접선 방정식은?",
    options: [
      o("1","$\\dfrac{x-3\\pi/2}{3}=\\dfrac{z}{-4},\\ y=4$"),
      o("2","$\\dfrac{x}{3}=\\dfrac{y-4}{4}=\\dfrac{z}{-4}$"),
      o("3","$y=4,\\ z=0$"),
      o("4","$x=3t,\\ y=4,\\ z=4$"),
      o("5","$\\dfrac{x-3\\pi/2}{3}=\\dfrac{y-4}{4}=z$")
    ], answer: "1",
    explanation: "점에서 $t=\\pi/2$. $\\vec r'(t)=(3,4\\cos t,-4\\sin t)$이고 $\\vec r'(\\pi/2)=(3,0,-4)$. 따라서 $y$ 방향 0이므로 $y=4$." }),
  build({ testNo: 1, num: 4, unit: "곡선과 곡면", concept: "공간곡선 접선", difficulty: "easyMedium",
    question: "$x=t^2,y=t^3,z=3t$의 곡선의 $t=1$에서의 접선을 $L$이라 할 때 직선 $L$과 $xy$평면의 교점의 좌표는?",
    options: [
      o("1","$(-1,-2,0)$"),
      o("2","$(0,0,0)$"),
      o("3","$(1,1,0)$"),
      o("4","$(-2,-1,0)$"),
      o("5","$(2,3,0)$")
    ], answer: "1",
    explanation: "$\\vec r(1)=(1,1,3),\\ \\vec r'(1)=(2,3,3)$. $L:(2t+1,3t+1,3t+3)$. $z=0\\Rightarrow t=-1$. 점 $(-1,-2,0)$." }),
  build({ testNo: 1, num: 5, unit: "곡선과 곡면", concept: "벡터함수 사잇각", difficulty: "easyMedium",
    question: "공간곡선 $x=\\cos t,y=\\sin t,z=t$ 위의 임의 점에서 접선벡터와 벡터 $(0,0,1)$의 사잇각은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"),o("2","$\\dfrac{\\pi}{4}$"),o("3","$\\dfrac{\\pi}{3}$"),o("4","$\\dfrac{\\pi}{2}$"),o("5","$0$")],
    answer: "2",
    explanation: "$\\vec r'(t)=(-\\sin t,\\cos t,1)$. $\\cos\\theta=\\frac{1}{\\sqrt 2\\cdot 1}=\\frac{1}{\\sqrt 2}\\Rightarrow\\theta=\\pi/4$." }),
  build({ testNo: 1, num: 6, unit: "곡선과 곡면", concept: "벡터함수 미분", difficulty: "easyMedium",
    question: "$f(t)=\\vec u(t)\\cdot\\vec v(t),\\ \\vec u(2)=(1,2,-1),\\ \\vec u'(2)=(3,0,4),\\ \\vec v(t)=(t,t^2,t^3)$일 때 $f'(2)$의 값은?",
    options: [o("1","$15$"),o("2","$25$"),o("3","$35$"),o("4","$45$"),o("5","$55$")],
    answer: "3",
    explanation: "$f'=\\vec u'\\cdot\\vec v+\\vec u\\cdot\\vec v'$. $\\vec v(2)=(2,4,8),\\vec v'(2)=(1,4,12)$. $(3,0,4)\\cdot(2,4,8)+(1,2,-1)\\cdot(1,4,12)=38-3=35$." }),

  // ========== DT2 곡선의 길이 ==========
  build({ testNo: 2, num: 1, unit: "곡선과 곡면", concept: "벡터함수 미분 성질", difficulty: "easyMedium",
    question: "벡터함수 $\\vec r(t)$가 $|\\vec r(t)|=c$(상수)를 만족할 때 옳은 것은?",
    options: [
      o("1","$\\vec r'(t)$와 $\\vec r(t)$의 사잇각은 예각"),
      o("2","$\\vec r'(t)$와 $\\vec r(t)$의 사잇각은 둔각"),
      o("3","$\\vec r'(t)$와 $\\vec r(t)$는 평행"),
      o("4","$\\vec r'(t)$와 $\\vec r(t)$는 직교"),
      o("5","$\\vec r'(t)=\\vec 0$")
    ], answer: "4",
    explanation: "$|\\vec r|^2=c^2$ 양변 미분: $2\\vec r\\cdot\\vec r'=0$ 즉 직교." }),
  build({ testNo: 2, num: 2, unit: "곡선과 곡면", concept: "최대 속력", difficulty: "easyMedium",
    question: "임의의 양수 $t$에 대해 $(x,y)=(2t-\\sin t,2-\\cos t)$로 주어지는 입자의 최대속력은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$\\sqrt 5$"),o("5","$4$")],
    answer: "3",
    explanation: "$|\\vec v|=\\sqrt{(2-\\cos t)^2+\\sin^2 t}=\\sqrt{5-4\\cos t}$. $\\cos t=-1$일 때 최댓값 $\\sqrt 9=3$." }),
  build({ testNo: 2, num: 3, unit: "곡선과 곡면", concept: "호의 길이", difficulty: "easyMedium",
    question: "곡선 $\\vec r(t)=2t\\vec i+t^2\\vec j+\\dfrac{1}{3}t^3\\vec k\\ (0\\le t\\le 1)$의 호의 길이는?",
    options: [
      o("1","$\\dfrac{5}{3}$"),
      o("2","$\\dfrac{7}{3}$"),
      o("3","$\\dfrac{8}{3}$"),
      o("4","$\\dfrac{10}{3}$"),
      o("5","$2$")
    ], answer: "2",
    explanation: "$|\\vec r'|=\\sqrt{4+4t^2+t^4}=t^2+2$. $\\int_0^1(t^2+2)dt=1/3+2=7/3$." }),
  build({ testNo: 2, num: 4, unit: "곡선과 곡면", concept: "호의 길이", difficulty: "easyMedium",
    question: "구간 $1\\le t\\le e$에서 매개변수 곡선 $x=2t,y=\\ln t,z=t^2$의 길이는?",
    options: [o("1","$e^2-1$"),o("2","$e^2$"),o("3","$2e^2$"),o("4","$e$"),o("5","$2e$")],
    answer: "2",
    explanation: "$|\\vec r'|=\\sqrt{4+1/t^2+4t^2}=\\sqrt{(2t+1/t)^2}=2t+1/t$. $\\int_1^e(2t+1/t)dt=[t^2+\\ln t]_1^e=e^2$." }),
  build({ testNo: 2, num: 5, unit: "곡선과 곡면", concept: "호의 길이", difficulty: "easyMedium",
    question: "$x=2\\cos t,y=2\\sin t,z=3t$로 주어진 벡터함수의 $-\\pi\\le t\\le\\pi$에서의 곡선 길이는?",
    options: [o("1","$2\\pi$"),o("2","$\\pi\\sqrt{13}$"),o("3","$2\\sqrt{13}\\pi$"),o("4","$13\\pi$"),o("5","$4\\pi$")],
    answer: "3",
    explanation: "$|\\vec r'|=\\sqrt{4+9}=\\sqrt{13}$. 길이 $=\\sqrt{13}\\cdot 2\\pi$." }),
  build({ testNo: 2, num: 6, unit: "곡선과 곡면", concept: "호의 길이", difficulty: "easyMedium",
    question: "구간 $0\\le t\\le\\pi$에서 $\\vec r=e^t\\cos t\\,\\vec i+e^t\\sin t\\,\\vec j+e^t\\,\\vec k$로 형성되는 곡선의 길이는?",
    options: [o("1","$e^\\pi-1$"),o("2","$\\sqrt 2(e^\\pi-1)$"),o("3","$\\sqrt 3(e^\\pi-1)$"),o("4","$2(e^\\pi-1)$"),o("5","$e^\\pi$")],
    answer: "3",
    explanation: "각 성분 미분 후 $|\\vec r'|=\\sqrt{e^{2t}\\cdot 3}=\\sqrt 3 e^t$. $\\int_0^\\pi\\sqrt 3 e^t dt=\\sqrt 3(e^\\pi-1)$." }),

  // ========== DT3 곡선 길이/곡률 ==========
  build({ testNo: 3, num: 1, unit: "곡선과 곡면", concept: "호의 길이", difficulty: "easyMedium",
    question: "$\\vec r(t)=\\langle\\ln(1+t^2),-2\\tan^{-1}t,1\\rangle\\ (0\\le t\\le 1)$의 곡선의 길이는?",
    options: [
      o("1","$\\ln(1+\\sqrt 2)$"),
      o("2","$2\\ln(1+\\sqrt 2)$"),
      o("3","$\\ln 2$"),
      o("4","$2\\ln 2$"),
      o("5","$\\sqrt 2$")
    ], answer: "2",
    explanation: "$|\\vec r'|=\\sqrt{(2t/(1+t^2))^2+(2/(1+t^2))^2}=\\frac{2}{\\sqrt{1+t^2}}$. 적분 $2[\\ln(t+\\sqrt{1+t^2})]_0^1=2\\ln(1+\\sqrt 2)$." }),
  build({ testNo: 3, num: 2, unit: "곡선과 곡면", concept: "곡률", difficulty: "easyMedium",
    question: "$\\vec r(t)=(t,t^2,t^3)$ 위의 점 $(0,0,0)$에서 곡률은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$2$"),o("4","$3$"),o("5","$\\sqrt 2$")],
    answer: "3",
    explanation: "$\\vec r'(0)=(1,0,0),\\vec r''(0)=(0,2,0),\\vec r'\\times\\vec r''=(0,0,2)$. $\\kappa=2/1^3=2$." }),
  build({ testNo: 3, num: 3, unit: "곡선과 곡면", concept: "곡률", difficulty: "easyMedium",
    question: "곡선 $\\vec r(t)=\\langle t^3-\\dfrac{3}{2}t^2+1,-t^3+3t^2-2t,2t^2-4t-1\\rangle$의 $t=1$에서 곡률 $\\kappa$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$5$"),o("5","$10$")],
    answer: "4",
    explanation: "$\\vec r'(1)=(0,1,0),\\vec r''(1)=(3,0,4)$. 외적 $(4,0,-3)$, 크기 5. $\\kappa=5/1^3=5$." }),
  build({ testNo: 3, num: 4, unit: "곡선과 곡면", concept: "곡률", difficulty: "easyMedium",
    question: "벡터함수 $\\vec r(t)=\\langle\\cos t,\\sin t,2t\\rangle$로 주어진 곡선 위의 점 $\\left(\\cos\\dfrac{1}{\\sqrt 7},\\sin\\dfrac{1}{\\sqrt 7},\\dfrac{2}{\\sqrt 7}\\right)$에서의 곡률은?",
    options: [
      o("1","$\\dfrac{1}{5}$"),
      o("2","$\\dfrac{1}{7}$"),
      o("3","$\\sqrt 5$"),
      o("4","$\\sqrt 7$"),
      o("5","$\\dfrac{2}{5}$")
    ], answer: "1",
    explanation: "원형나선: $\\kappa=a/(a^2+b^2)$. 여기서 $a=1,b=2$이므로 $\\kappa=1/5$." }),
  build({ testNo: 3, num: 5, unit: "곡선과 곡면", concept: "곡률", difficulty: "easyMedium",
    question: "곡선 $\\vec r(t)=(3t,4\\sin t,4\\cos t)$의 곡률은?",
    options: [
      o("1","$\\dfrac{1}{25}$"),
      o("2","$\\dfrac{2}{25}$"),
      o("3","$\\dfrac{3}{25}$"),
      o("4","$\\dfrac{4}{25}$"),
      o("5","$\\dfrac{1}{5}$")
    ], answer: "4",
    explanation: "$a=4,b=3$인 나선. $\\kappa=4/(16+9)=4/25$." }),
  build({ testNo: 3, num: 6, unit: "곡선과 곡면", concept: "곡률", difficulty: "easyMedium",
    question: "매개곡선 $x=t-\\sin t,y=1-\\cos t$의 $t=\\pi/3$에서 곡률은?",
    options: [
      o("1","$\\dfrac{4}{5}$"),
      o("2","$\\dfrac{3}{4}$"),
      o("3","$\\dfrac{2}{3}$"),
      o("4","$\\dfrac{1}{2}$"),
      o("5","$1$")
    ], answer: "4",
    explanation: "$x'=1-\\cos t,y'=\\sin t,x''=\\sin t,y''=\\cos t$. $\\kappa=|cos t(1-\\cos t)-\\sin^2 t|/[(1-\\cos t)^2+\\sin^2 t]^{3/2}$. $t=\\pi/3$ 대입 후 $1/2$." }),

  // ========== DT4 곡률, 곡률중심 ==========
  build({ testNo: 4, num: 1, unit: "곡선과 곡면", concept: "곡률", difficulty: "easy",
    question: "포물선 $y=x^2$의 원점에서 곡률은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$\\dfrac{1}{2}$"),o("4","$\\dfrac{1}{4}$"),o("5","$0$")],
    answer: "2",
    explanation: "$y'=2x,y''=2$. $\\kappa=|2|/(1+0)^{3/2}=2$." }),
  build({ testNo: 4, num: 2, unit: "곡선과 곡면", concept: "곡률", difficulty: "easyMedium",
    question: "함수 $f(x)=3x-x^3$이 극값을 갖는 점에서 그래프의 곡률은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$3$"),o("4","$6$"),o("5","$9$")],
    answer: "4",
    explanation: "$f'=3-3x^2=0\\Rightarrow x=\\pm 1$. $f''=-6x|_{\\pm 1}=\\mp 6$. $\\kappa=|\\mp 6|/(1+0)^{3/2}=6$." }),
  build({ testNo: 4, num: 3, unit: "곡선과 곡면", concept: "주단위법선벡터", difficulty: "easyMedium",
    question: "곡선 $\\vec r(t)=\\langle 2\\cos t,2\\sin t,3t\\rangle$ 위의 점 $P(0,2,3\\pi/2)$에서 주단위법선벡터가 $\\langle a,b,c\\rangle$이고 곡률이 $\\kappa$일 때 $a+b+c+\\kappa$의 값은?",
    options: [
      o("1","$-\\dfrac{24}{13}$"),
      o("2","$-\\dfrac{11}{13}$"),
      o("3","$\\dfrac{2}{13}$"),
      o("4","$\\dfrac{15}{13}$"),
      o("5","$-1$")
    ], answer: "2",
    explanation: "$|r'|=\\sqrt{13}$. $\\vec T=(-2\\sin t,2\\cos t,3)/\\sqrt{13}$. $\\vec N=(0,-1,0)$ at $t=\\pi/2$. $\\kappa=2/13$. 합 $-1+2/13=-11/13$." }),
  build({ testNo: 4, num: 4, unit: "곡선과 곡면", concept: "접촉평면", difficulty: "easyMedium",
    question: "곡선 $\\vec r(t)=\\langle 2\\cos t,2\\sin t+2,2\\cos t\\rangle$의 $t=0$에서의 접촉평면이 $ax+by+cz=d$일 때 $\\dfrac{c}{a}$의 값은?",
    options: [o("1","$-4$"),o("2","$-3$"),o("3","$-2$"),o("4","$-1$"),o("5","$1$")],
    answer: "4",
    explanation: "$\\vec r'(0)=(0,2,0),\\vec r''(0)=(-2,0,-2)$. 외적 $(-4,0,4)\\propto(-1,0,1)$. $-x+z=0$, $c/a=1/(-1)=-1$." }),
  build({ testNo: 4, num: 5, unit: "곡선과 곡면", concept: "곡률중심", difficulty: "easyMedium",
    question: "매개방정식 $x=2t,y=t^2-t$로 주어진 곡선 위 $t=1$에서 곡률중심 $(X,Y)$는?",
    options: [
      o("1","$(1,-1/4)$"),
      o("2","$(11/8,5/4)$"),
      o("3","$(3/4,5/2)$"),
      o("4","$(1/4,0)$"),
      o("5","$(2,1)$")
    ], answer: "3",
    explanation: "$y=x^2/4-x/2$, $y'=1/2,y''=1/2$. $X=2-\\frac{(1/2)(1+1/4)}{1/2}=3/4,\\ Y=0+\\frac{1+1/4}{1/2}=5/2$." }),
  build({ testNo: 4, num: 6, unit: "곡선과 곡면", concept: "곡률중심", difficulty: "easyMedium",
    question: "타원 $\\dfrac{x^2}{4}+y^2=1$ 위의 점 $(2,0)$에서 곡률중심의 $x$좌표와 $y$좌표의 합은?",
    options: [o("1","$0$"),o("2","$1.2$"),o("3","$1.4$"),o("4","$1.5$"),o("5","$1.7$")],
    answer: "4",
    explanation: "매개화 $x=2\\cos t,y=\\sin t$, $t=0$. $\\kappa=2$, $R=1/2$. $X=2-1/2=3/2,Y=0$. 합 $1.5$." }),

  // ========== DT5 이변수 극한 ==========
  build({ testNo: 5, num: 1, unit: "편도함수", concept: "이변수 극한", difficulty: "easyMedium",
    question: "$f(x,y)=\\dfrac{x^2-7xy+y^2}{x^2+3y^2}$일 때 $\\lim_{(x,y)\\to(0,0)}f(x,y)$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$1/3$"),o("4","$1/2$"),o("5","존재하지 않음")],
    answer: "5",
    explanation: "$y=mx$ 대입 시 극한값이 $m$에 따라 달라짐. 따라서 존재 안 함." }),
  build({ testNo: 5, num: 2, unit: "편도함수", concept: "이변수 극한", difficulty: "easyMedium",
    question: "$\\lim_{(x,y)\\to(0,0)}\\dfrac{xy^2}{x^2+y^4}$의 극한값은?",
    options: [o("1","$0$"),o("2","$1/2$"),o("3","$1/3$"),o("4","존재하지 않음"),o("5","$1$")],
    answer: "4",
    explanation: "$x=my^2$ 대입 시 $m/(m^2+1)$이 $m$에 따라 달라짐. 존재 안 함." }),
  build({ testNo: 5, num: 3, unit: "편도함수", concept: "이변수 극한", difficulty: "easyMedium",
    question: "다음 중 극한값이 존재하는 것은?",
    options: [
      o("1","$\\lim\\dfrac{x^2-2y^2}{x^2+y^2}$"),
      o("2","$\\lim\\dfrac{2xy}{x^2+y^2}$"),
      o("3","$\\lim\\dfrac{2x^2y}{x^4+y^2}$"),
      o("4","$\\lim\\dfrac{2xy^2}{x^2+y^2}$"),
      o("5","모두 존재 안 함")
    ], answer: "4",
    explanation: "④: $|2xy^2/(x^2+y^2)|\\le 2|y|\\to 0$. 나머지는 경로 의존." }),
  build({ testNo: 5, num: 4, unit: "편도함수", concept: "이변수 극한", difficulty: "easyMedium",
    question: "$\\lim_{(x,y)\\to(0,0)}\\dfrac{e^{-x^2-y^2}-1}{x^2+y^2}$의 값은?",
    options: [o("1","$-e$"),o("2","$-1$"),o("3","$0$"),o("4","$1$"),o("5","$e$")],
    answer: "2",
    explanation: "$t=x^2+y^2\\to 0$. $\\lim_{t\\to 0}\\frac{e^{-t}-1}{t}=-1$." }),
  build({ testNo: 5, num: 5, unit: "편도함수", concept: "이변수 극한", difficulty: "easyMedium",
    question: "다음 중 극한이 존재하는 것을 모두 고르면? (a) $\\lim\\dfrac{x-y}{\\sin(x+y)}$, (b) $\\lim\\dfrac{x\\sqrt{y^3}}{x^2+y^2}$, (c) $\\lim\\dfrac{x\\sin(x^2+y^2)}{x^2+y^2}$",
    options: [o("1","(a)"),o("2","(b)"),o("3","(c)"),o("4","(a),(c)"),o("5","(b),(c)")],
    answer: "5",
    explanation: "(a) 경로 의존. (b),(c) 모두 0으로 수렴." }),
  build({ testNo: 5, num: 6, unit: "편도함수", concept: "연속 정의", difficulty: "easyMedium",
    question: "$f(x,y)=\\dfrac{\\cos(x^2+y^2)-1}{x^2+y^2},\\ (x,y)\\ne(0,0)$일 때 $f$가 $(0,0)$에서 연속이 되도록 $f(0,0)$을 정의하면?",
    options: [o("1","$-1$"),o("2","$0$"),o("3","$1$"),o("4","불가능"),o("5","$1/2$")],
    answer: "2",
    explanation: "$t=x^2+y^2\\to 0$, $\\frac{\\cos t-1}{t}\\to 0$." }),

  // ========== DT6 편미분 ==========
  build({ testNo: 6, num: 1, unit: "편도함수", concept: "연속을 위한 상수", difficulty: "easyMedium",
    question: "$f(x,y)=\\begin{cases}\\dfrac{xy^2+3\\tan(x^2+y^2)}{2(x^2+y^2)},&(x,y)\\ne(0,0)\\\\c,&(x,y)=(0,0)\\end{cases}$가 원점에서 연속이도록 하는 $c$는?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$\\dfrac{3}{2}$"),o("4","$2$"),o("5","$3$")],
    answer: "3",
    explanation: "$xy^2/(2(x^2+y^2))\\to 0,\\ 3\\tan(x^2+y^2)/(2(x^2+y^2))\\to 3/2$. 합 $3/2$." }),
  build({ testNo: 6, num: 2, unit: "편도함수", concept: "편미분 (sech)", difficulty: "easyMedium",
    question: "$f(x,y)=x\\,\\mathrm{sech}(x^2y)$일 때 $\\dfrac{\\partial f}{\\partial x}$는?",
    options: [
      o("1","$\\mathrm{sech}(x^2y)[1-2x^2y\\tanh(x^2y)]$"),
      o("2","$\\sinh(x^2y)[1-2x^2y\\tanh(x^2y)]$"),
      o("3","$\\mathrm{sech}(x^2y)[1-2x^2y\\cosh(x^2y)]$"),
      o("4","$\\sinh(x^2y)[1-2x^2y\\cosh(x^2y)]$"),
      o("5","$\\mathrm{sech}(x^2y)$")
    ], answer: "1",
    explanation: "$f_x=\\mathrm{sech}-x\\,\\mathrm{sech}\\tanh\\cdot 2xy=\\mathrm{sech}(1-2x^2y\\tanh)$." }),
  build({ testNo: 6, num: 3, unit: "편도함수", concept: "편미분", difficulty: "easyMedium",
    question: "이변수함수 $f(x,y)=(y^2-3xy)e^{xy}$에서 $f_x(0,2)+f_y(0,2)$의 값은?",
    options: [o("1","$6$"),o("2","$4$"),o("3","$-2$"),o("4","$-4$"),o("5","$0$")],
    answer: "1",
    explanation: "$f(x,2)=(4-6x)e^{2x}\\Rightarrow f_x(0,2)=2$. $f(0,y)=y^2\\Rightarrow f_y(0,2)=4$. 합 $6$." }),
  build({ testNo: 6, num: 4, unit: "편도함수", concept: "편미분", difficulty: "easyMedium",
    question: "$f(x,y,z)=\\dfrac{x+y+z}{(x^2+y^2+z^2)^2}$에 대해 점 $(1,0,2)$에서 $\\dfrac{\\partial f}{\\partial x}$의 값은?",
    options: [
      o("1","$-\\dfrac{1}{125}$"),
      o("2","$-\\dfrac{3}{125}$"),
      o("3","$-\\dfrac{1}{25}$"),
      o("4","$-\\dfrac{7}{125}$"),
      o("5","$-\\dfrac{9}{125}$")
    ], answer: "4",
    explanation: "$f(x,0,2)=(x+2)/(x^2+4)^2$. 미분 후 $x=1$ 대입: $(5-12)/125=-7/125$." }),
  build({ testNo: 6, num: 5, unit: "편도함수", concept: "Euler 동차함수", difficulty: "easyMedium",
    question: "$f(x,y,z)=2x^2-y^2+3z^2-xy+4yz$에 대해 $g(x,y,z)=xf_x+yf_y+zf_z$. $g(1,1,1)$의 값은?",
    options: [o("1","$14$"),o("2","$16$"),o("3","$18$"),o("4","$20$"),o("5","$22$")],
    answer: "1",
    explanation: "$f$는 2차 동차 함수이므로 $g=2f$. $f(1,1,1)=2-1+3-1+4=7$. $g=14$." }),
  build({ testNo: 6, num: 6, unit: "편도함수", concept: "이계 편미분", difficulty: "easyMedium",
    question: "$f(x,y)=\\tan^{-1}\\dfrac{y}{x}$일 때 $f_{xy}(1,3)$을 구하면?",
    options: [
      o("1","$0$"),
      o("2","$\\dfrac{\\pi}{6}$"),
      o("3","$\\dfrac{2}{25}$"),
      o("4","$\\dfrac{1}{10}$"),
      o("5","$\\dfrac{1}{5}$")
    ], answer: "3",
    explanation: "$f_x=-y/(x^2+y^2)$. $f_{xy}=[-(x^2+y^2)+y\\cdot 2y]/(x^2+y^2)^2=(y^2-x^2)/(x^2+y^2)^2$. $(1,3)$: $(9-1)/100=8/100=2/25$." }),

  // ========== DT7 라플라스/테일러/접평면 ==========
  build({ testNo: 7, num: 1, unit: "Taylor급수와 최대/최소", concept: "라플라스 방정식", difficulty: "easyMedium",
    question: "함수 $u(x,y,z)=(x^2+y^2+z^2)^\\alpha$가 $\\Delta u=u_{xx}+u_{yy}+u_{zz}=0$의 해가 되는 0이 아닌 상수 $\\alpha$는?",
    options: [
      o("1","$-\\dfrac{1}{2}$"),
      o("2","$-1$"),
      o("3","$1$"),
      o("4","$\\dfrac{1}{2}$"),
      o("5","$2$")
    ], answer: "1",
    explanation: "계산하면 $\\Delta u=(x^2+y^2+z^2)^{\\alpha-1}(4\\alpha^2+2\\alpha)=0$이므로 $4\\alpha+2=0\\Rightarrow\\alpha=-1/2$." }),
  build({ testNo: 7, num: 2, unit: "Taylor급수와 최대/최소", concept: "테일러급수", difficulty: "easyMedium",
    question: "함수 $f(x,y)=\\ln(1+xy)$의 점 $(1,2)$에서 테일러급수에서 $(x-1)^2$ 항의 계수는?",
    options: [
      o("1","$-\\dfrac{4}{9}$"),
      o("2","$-\\dfrac{2}{9}$"),
      o("3","$\\dfrac{2}{9}$"),
      o("4","$\\dfrac{4}{9}$"),
      o("5","$\\dfrac{1}{9}$")
    ], answer: "2",
    explanation: "$f_{xx}=-y^2/(1+xy)^2|_{(1,2)}=-4/9$. 계수 $=f_{xx}/2!=-2/9$." }),
  build({ testNo: 7, num: 3, unit: "Taylor급수와 최대/최소", concept: "이차 근사", difficulty: "easyMedium",
    question: "점 $(0,0)$에서 $f(x,y)=e^{x^2+y}$의 이차 근사다항식은?",
    options: [
      o("1","$1+y+x^2+\\dfrac{y^2}{2}$"),
      o("2","$1+x^2+y$"),
      o("3","$1+y+\\dfrac{y^2}{2}$"),
      o("4","$1+x+y$"),
      o("5","$1+x^2+y^2$")
    ], answer: "1",
    explanation: "$f(0,0)=1,f_x=0,f_y=1,f_{xx}=2,f_{yy}=1,f_{xy}=0$. $1+y+x^2+y^2/2$." }),
  build({ testNo: 7, num: 4, unit: "Taylor급수와 최대/최소", concept: "선형근사", difficulty: "easyMedium",
    question: "점 $(0,0)$에서 $f(x,y)=\\ln(1+x+2y)$의 2차 근사다항식을 이용하여 $f(1,0)$의 근삿값을 구하시오.",
    options: [o("1","$\\dfrac{1}{2}$"),o("2","$0$"),o("3","$1$"),o("4","$e$"),o("5","$\\ln 2$")],
    answer: "1",
    explanation: "$f(0,0)=0,f_x=1,f_{xx}=-1$. $L_2(1,0)=0+1+\\frac{1}{2}(-1)\\cdot 1=1/2$." }),
  build({ testNo: 7, num: 5, unit: "곡선과 곡면", concept: "접평면", difficulty: "easyMedium",
    question: "곡면 $z=x^2+y^2$ 위 점 $(-2,1,5)$에서 접평면의 방정식은?",
    options: [
      o("1","$4x+2y+z=-1$"),
      o("2","$4x-2y+z=-5$"),
      o("3","$2x+y+z=2$"),
      o("4","$2x+y-z=-8$"),
      o("5","$x+y+z=4$")
    ], answer: "2",
    explanation: "$z_x=2x|_{-2}=-4,z_y=2y|_1=2$. $z=5-4(x+2)+2(y-1)\\Rightarrow 4x-2y+z=-5$." }),
  build({ testNo: 7, num: 6, unit: "곡선과 곡면", concept: "접평면", difficulty: "easyMedium",
    question: "곡면 $z=x^2+y^2$ 위 점 $(1,1,2)$에서 접평면의 방정식은?",
    options: [
      o("1","$x+y+2z=4$"),
      o("2","$x+y-2z=-2$"),
      o("3","$2x+2y+z=6$"),
      o("4","$2x+2y-z=2$"),
      o("5","$x-y+z=2$")
    ], answer: "4",
    explanation: "$z_x=2,z_y=2$. $z=2+2(x-1)+2(y-1)\\Rightarrow 2x+2y-z=2$." }),

  // ========== DT8 편미분 응용 ==========
  build({ testNo: 8, num: 1, unit: "곡선과 곡면", concept: "접평면", difficulty: "easyMedium",
    question: "점 $(a,b,c)$에서 곡면 $z=\\dfrac{x^2}{4}+\\dfrac{y^2}{4}$의 접평면의 방정식이 $x+y-z=2$일 때 $a+b+c$의 값은?",
    options: [o("1","$0$"),o("2","$2$"),o("3","$4$"),o("4","$6$"),o("5","$8$")],
    answer: "4",
    explanation: "법선 $(x/2,y/2,-1)\\propto(1,1,-1)$. $a=2,b=2$. $c=4/4+4/4=2$. 합 $6$." }),
  build({ testNo: 8, num: 2, unit: "편도함수", concept: "편미분 정의", difficulty: "easyMedium",
    question: "$\\{(x,y)|-\\pi<y<\\pi\\}$에서 $f(x,y)=\\begin{cases}(e^{xy}-1)/\\sin y,&y\\ne 0\\\\x,&y=0\\end{cases}$. $\\dfrac{\\partial f}{\\partial y}(1,0)$의 값은?",
    options: [o("1","$0$"),o("2","$\\dfrac{1}{2}$"),o("3","$1$"),o("4","존재하지 않음"),o("5","$e$")],
    answer: "2",
    explanation: "$f_y(1,0)=\\lim_{h\\to 0}\\frac{(e^h-1)/\\sin h-1}{h}$. 테일러 전개로 계산 → $1/2$." }),
  build({ testNo: 8, num: 3, unit: "편도함수", concept: "편미분 정의", difficulty: "easyMedium",
    question: "$g(x,y)=\\begin{cases}(x^4+y^2)/(x^2+y^4),&(x,y)\\ne(0,0)\\\\0,&(0,0)\\end{cases}$일 때 $\\dfrac{\\partial g}{\\partial x}(1,0)$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$2$"),o("4","$3$"),o("5","$4$")],
    answer: "3",
    explanation: "$g(x,0)=x^4/x^2=x^2$. $g_x(1,0)=2x|_1=2$." }),
  build({ testNo: 8, num: 4, unit: "편도함수", concept: "교차 편미분", difficulty: "easyMedium",
    question: "$f(0,0)=0,\\ (x,y)\\ne(0,0)$이면 $f(x,y)=\\dfrac{2xy(y^2-2x^2)}{x^2+3y^2}$. $\\alpha=\\dfrac{\\partial^2 f}{\\partial y\\partial x}(0,0),\\beta=\\dfrac{\\partial^2 f}{\\partial x\\partial y}(0,0)$. $\\alpha+\\beta$는?",
    options: [
      o("1","$\\dfrac{10}{3}$"),
      o("2","$\\dfrac{4}{3}$"),
      o("3","$-\\dfrac{10}{3}$"),
      o("4","$-\\dfrac{4}{3}$"),
      o("5","$0$")
    ], answer: "3",
    explanation: "$f_x(0,0)=0,f_y(0,0)=0$. $f_{xy}(0,0)=2/3,f_{yx}(0,0)=-4$. 합 $-10/3$." }),

  // ========== DT9 미분가능성, 선형근사 ==========
  build({ testNo: 9, num: 1, unit: "편도함수", concept: "미분가능성", difficulty: "easyMedium",
    question: "함수 $f(x,y)=\\begin{cases}x^2y/(x^4+y^2),&(x,y)\\ne(0,0)\\\\0,&(0,0)\\end{cases}$ 중 옳은 것을 모두 고르면? 가. 원점에서 연속 / 나. 원점에서 미분가능 / 다. $f_x(0,0)=0,f_y(0,0)=0$",
    options: [o("1","가"),o("2","다"),o("3","가,나"),o("4","가,다"),o("5","가,나,다")],
    answer: "2",
    explanation: "$y=mx^2$ 경로 의존이라 가 거짓, 불연속이라 나 거짓. 다만 편미분은 0,0에서 0으로 존재." }),
  build({ testNo: 9, num: 2, unit: "편도함수", concept: "편미분 / 미분가능성", difficulty: "easyMedium",
    question: "$f(x,y)=\\begin{cases}xy^2\\sqrt{x^2+y^2}/(x^2+y^4),&(x,y)\\ne(0,0)\\\\0,&(0,0)\\end{cases}$. 옳은 것을 모두 고르면? ⓐ 원점에서 $f_x$ 존재 / ⓑ 원점에서 $f_y$ 존재 / ⓒ 원점에서 미분가능",
    options: [o("1","ⓐ"),o("2","ⓑ"),o("3","ⓐ,ⓑ"),o("4","ⓐ,ⓑ,ⓒ"),o("5","없음")],
    answer: "3",
    explanation: "원점에서 두 편미분 모두 0으로 존재. 그러나 미분가능성 정의 한계 검증 시 실패." }),
  build({ testNo: 9, num: 3, unit: "편도함수", concept: "선형근사", difficulty: "easyMedium",
    question: "점 $(1,1)$에서 $f(x,y)=x^3y^4$의 선형근사식이 $L(x,y)=ax+by+c$일 때 $a\\times b$의 값은?",
    options: [o("1","$9$"),o("2","$10$"),o("3","$12$"),o("4","$15$"),o("5","$20$")],
    answer: "3",
    explanation: "$f_x(1,1)=3,f_y(1,1)=4$. $a=3,b=4$. $a\\times b=12$." }),
  build({ testNo: 9, num: 4, unit: "편도함수", concept: "선형근사", difficulty: "easyMedium",
    question: "$f(x,y)=e^{x-1}\\cos((x-1)(y-2))$일 때 점 $(1,2)$에서 선형근사 $L(x,y)$를 구하고 $f(1.1,1.9)$의 근사값을 구하시오.",
    options: [
      o("1","$L(x,y)=x,\\ 1.1$"),
      o("2","$L(x,y)=y,\\ -0.1$"),
      o("3","$L(x,y)=x,\\ 0.1$"),
      o("4","$L(x,y)=y,\\ 1.9$"),
      o("5","$L(x,y)=x+y,\\ 3$")
    ], answer: "1",
    explanation: "$f(x,2)=e^{x-1},f_x(1,2)=1$. $f(1,y)=1,f_y(1,2)=0$. $L=1+(x-1)=x$. $L(1.1,1.9)=1.1$." }),

  // ========== DT10 연쇄법칙 ==========
  build({ testNo: 10, num: 1, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "$z=(x^2-xy+1)^3,\\ x=1+\\sin 2t,\\ y=2-\\cos t$일 때 $t=0$에서 $\\dfrac{dz}{dt}$의 값은?",
    options: [o("1","$-9$"),o("2","$-7$"),o("3","$6$"),o("4","$8$"),o("5","$12$")],
    answer: "3",
    explanation: "$t=0$: $(x,y)=(1,1)$. $z_x=3\\cdot 1\\cdot(2x-y)=3,\\ z_y=3\\cdot 1\\cdot(-x)=-3$. $dz/dt=3\\cdot 2+(-3)\\cdot 0=6$." }),
  build({ testNo: 10, num: 2, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "$x(t)=t^2-1,y(t)=\\sin t,f(x,y)=x^2 e^y$. $g(t)=f(x(t),y(t))$, $t=0$에서 $\\dfrac{dg}{dt}$의 값은?",
    options: [o("1","$-e$"),o("2","$-1$"),o("3","$1$"),o("4","$e$"),o("5","$0$")],
    answer: "3",
    explanation: "$t=0$: $(x,y)=(-1,0)$. $g'=2xe^y\\cdot 2t+x^2 e^y\\cos t|_{t=0}=0+1\\cdot 1=1$." }),
  build({ testNo: 10, num: 3, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "$z=x^2-xy+2y^2,\\ x=s+t,\\ y=st$일 때 $\\left.\\dfrac{\\partial z}{\\partial s}\\right|_{s=1,t=2}$의 값은?",
    options: [o("1","$11$"),o("2","$12$"),o("3","$13$"),o("4","$14$"),o("5","$15$")],
    answer: "4",
    explanation: "$(s,t)=(1,2),\\ (x,y)=(3,2)$. $z_x=2x-y=4,\\ z_y=-x+4y=5$. $\\partial z/\\partial s=4\\cdot 1+5\\cdot 2=14$." }),
  build({ testNo: 10, num: 4, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "세 함수 $z=f(x,y),x=g(s,t),y=h(s,t)$. $g(1,2)=3,h(1,2)=6,g_s(1,2)=-1,g_t(1,2)=4,h_s(1,2)=-5,h_t(1,2)=10,f_x(3,6)=7,f_y(3,6)=8$일 때 $s=1,t=2$에서 $\\dfrac{\\partial z}{\\partial t}$의 값은?",
    options: [o("1","$-54$"),o("2","$-47$"),o("3","$28$"),o("4","$108$"),o("5","$72$")],
    answer: "4",
    explanation: "$z_t=f_x g_t+f_y h_t=7\\cdot 4+8\\cdot 10=108$." }),
  build({ testNo: 10, num: 5, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "$w=\\ln(x^2+y^2+z^2),x=s+2t,y=2s-t,z=2st,\\ s=t=1$일 때 $\\dfrac{\\partial w}{\\partial t}$의 값은?",
    options: [
      o("1","$\\dfrac{1}{14}$"),
      o("2","$\\dfrac{3}{14}$"),
      o("3","$\\dfrac{4}{7}$"),
      o("4","$\\dfrac{9}{7}$"),
      o("5","$\\dfrac{6}{7}$")
    ], answer: "4",
    explanation: "$(x,y,z)=(3,1,2)$, $x^2+y^2+z^2=14$. $w_t=(2\\cdot 3/14)\\cdot 2+(2\\cdot 1/14)(-1)+(2\\cdot 2/14)\\cdot 2=12/14-2/14+8/14=18/14=9/7$." }),
  build({ testNo: 10, num: 6, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "$x=2rse^t,y=r^2 s^2 e^{-t},z=r^2 s\\sin t$이고 $u=x^4 y^2+y^2 z^2$이면 $r=1,s=1,t=0$일 때 $\\dfrac{\\partial u}{\\partial s}$의 값은?",
    options: [o("1","$64$"),o("2","$96$"),o("3","$128$"),o("4","$192$"),o("5","$256$")],
    answer: "3",
    explanation: "$(x,y,z)=(2,1,0)$. $\\partial u/\\partial s$ 계산 시 $4x^3 y^2(2re^t)+(2x^4 y+2yz^2)(2r^2 se^{-t})+(2y^2 z)(r^2\\sin t)$, 최종 $128$." }),

  // ========== DT11 연쇄법칙/음함수 ==========
  build({ testNo: 11, num: 1, unit: "편도함수", concept: "연쇄법칙", difficulty: "easy",
    question: "$z=f(x-y)$일 때 $\\dfrac{\\partial z}{\\partial x}+\\dfrac{\\partial z}{\\partial y}$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$x$"),o("4","$-y$"),o("5","$f'$")],
    answer: "1",
    explanation: "$z_x=f',z_y=-f'$. 합 $0$." }),
  build({ testNo: 11, num: 2, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "연속인 편도함수를 갖는 $f(x,y)$에 대해 $g(t)=f(t^2-2t,e^t+t)$로 정의. $g(0)=1,f(0,0)=2,f_x(0,0)=3,f_x(0,1)=-1,f_y(0,0)=-2,f_y(0,1)=-3$일 때 $g'(0)$은?",
    options: [o("1","$0$"),o("2","$-2$"),o("3","$-4$"),o("4","$-10$"),o("5","$2$")],
    answer: "3",
    explanation: "$t=0$: $(x,y)=(0,1)$. $g'(0)=f_x(0,1)\\cdot(-2)+f_y(0,1)\\cdot 2=2-6=-4$." }),
  build({ testNo: 11, num: 3, unit: "편도함수", concept: "연쇄법칙", difficulty: "easyMedium",
    question: "미분가능 함수 $h(u,v)$에 대해 $\\dfrac{\\partial h}{\\partial u}(0,v)=v,\\ \\dfrac{\\partial h}{\\partial v}(0,v)=2v+1$. $f(x,y)=h(ye^x-1,1-2y)$에 대해 $\\dfrac{\\partial f}{\\partial y}(0,1)$은?",
    options: [o("1","$1$"),o("2","$-1$"),o("3","$5$"),o("4","$-5$"),o("5","$0$")],
    answer: "1",
    explanation: "$(x,y)=(0,1)\\Rightarrow(u,v)=(0,-1)$. $f_y=h_u\\cdot e^x+h_v\\cdot(-2)=(-1)(1)+(-1)(-2)=1$." }),
  build({ testNo: 11, num: 4, unit: "편도함수", concept: "음함수 미분", difficulty: "easyMedium",
    question: "$x^3+y^3+z^3+6xyz=1$일 때 $\\dfrac{\\partial z}{\\partial x}$를 구하면?",
    options: [
      o("1","$-\\dfrac{x^2+2yz}{z^2+2xy}$"),
      o("2","$-\\dfrac{y^2+2xz}{z^2+2xy}$"),
      o("3","$-\\dfrac{x^2+2yz}{y^2+2xz}$"),
      o("4","$-\\dfrac{z^2+2xy}{y^2+2xz}$"),
      o("5","$0$")
    ], answer: "1",
    explanation: "$F_x=3x^2+6yz,\\ F_z=3z^2+6xy$. $z_x=-F_x/F_z=-(x^2+2yz)/(z^2+2xy)$." }),
  build({ testNo: 11, num: 5, unit: "편도함수", concept: "음함수 미분", difficulty: "easyMedium",
    question: "$x+y-z=\\tan^{-1}(xz)$에서 $x=1,y=\\pi/4$일 때 $\\dfrac{\\partial z}{\\partial x}$를 구하면?",
    options: [o("1","$0$"),o("2","$\\dfrac{1}{3}$"),o("3","$\\dfrac{2}{3}$"),o("4","$1$"),o("5","$\\dfrac{1}{2}$")],
    answer: "2",
    explanation: "대입하면 $z=1$. $F=x+y-z-\\tan^{-1}(xz)$. 계산 결과 $\\partial z/\\partial x=1/3$." }),
  build({ testNo: 11, num: 6, unit: "편도함수", concept: "음함수 미분", difficulty: "easyMedium",
    question: "$x^2 yz^2=y+2z$에서 $x,y,z$가 음함수일 때 $\\dfrac{\\partial x}{\\partial z}$ 와 $\\dfrac{\\partial x}{\\partial z}\\cdot\\dfrac{\\partial z}{\\partial y}\\cdot\\dfrac{\\partial y}{\\partial x}$를 순서대로 쓴 것은?",
    options: [
      o("1","$\\dfrac{1-x^2yz}{xyz^2},\\ -1$"),
      o("2","$\\dfrac{1-x^2yz}{xyz^2},\\ 1$"),
      o("3","$\\dfrac{1+x^2yz}{xyz^2},\\ -1$"),
      o("4","$\\dfrac{1+x^2yz}{xyz^2},\\ 1$"),
      o("5","$0,\\ 0$")
    ], answer: "1",
    explanation: "$F=x^2yz^2-y-2z$. $\\partial x/\\partial z=-F_z/F_x=-(2x^2yz-2)/(2xyz^2)=(1-x^2yz)/(xyz^2)$. 사이클 항등식 $=-1$." }),

  // ========== DT12 방향도함수 ==========
  build({ testNo: 12, num: 1, unit: "경도 및 방향도함수", concept: "그래디언트", difficulty: "easyMedium",
    question: "$f(x,y)=\\dfrac{(x+y^3)\\cos(xy^2)}{e^{2x+y}}$에 대해 $\\nabla f(0,0)=(a,b)$일 때 $a-b$의 값은?",
    options: [o("1","$1$"),o("2","$0$"),o("3","$-1$"),o("4","$2$"),o("5","$-2$")],
    answer: "1",
    explanation: "$f(x,0)=xe^{-2x},f_x(0,0)=1$. $f(0,y)=y^3 e^{-y},f_y(0,0)=0$. $a-b=1$." }),
  build({ testNo: 12, num: 2, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "점 $(1,-2)$에서 $f(x,y)=x^3y^2-2y$를 벡터 $\\vec v=(3/5,4/5)$ 방향으로 미분한 방향도함수는?",
    options: [
      o("1","$\\dfrac{12}{5}$"),
      o("2","$\\dfrac{8}{5}$"),
      o("3","$\\dfrac{6}{5}$"),
      o("4","$\\dfrac{16}{5}$"),
      o("5","$0$")
    ], answer: "1",
    explanation: "$\\nabla f(1,-2)=(12,-6)$. $\\nabla f\\cdot\\vec v=12\\cdot 3/5+(-6)\\cdot 4/5=12/5$." }),
  build({ testNo: 12, num: 3, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "좌표평면 상 점 $(2,-1)$에서 $f(x,y)=x^2y^3-4y$의 벡터 $\\vec v=2\\vec e_1+3\\vec e_2$ 방향 방향도함수는?",
    options: [
      o("1","$\\dfrac{16}{\\sqrt{13}}$"),
      o("2","$\\dfrac{8}{\\sqrt{13}}$"),
      o("3","$\\dfrac{16}{13}$"),
      o("4","$\\dfrac{4}{\\sqrt{13}}$"),
      o("5","$0$")
    ], answer: "1",
    explanation: "$\\nabla f(2,-1)=(-4,8)$. $\\vec u=(2,3)/\\sqrt{13}$. $\\nabla f\\cdot\\vec u=(-8+24)/\\sqrt{13}=16/\\sqrt{13}$." }),
  build({ testNo: 12, num: 4, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "점 $(1,1,1)$에서 $\\vec a=(1,2,2)$ 방향으로 함수 $f(x,y,z)=x^3-xy^2-z$의 방향도함수를 구하시오.",
    options: [
      o("1","$-\\dfrac{4}{3}$"),
      o("2","$\\dfrac{4}{3}$"),
      o("3","$\\dfrac{2}{3}$"),
      o("4","$-\\dfrac{2}{3}$"),
      o("5","$0$")
    ], answer: "1",
    explanation: "$\\nabla f(1,1,1)=(2,-2,-1)$. $\\vec u=(1,2,2)/3$. $\\nabla f\\cdot\\vec u=(2-4-2)/3=-4/3$." }),
  build({ testNo: 12, num: 5, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "점 $(1,-1,1)$에서 $F(x,y,z)=x^2y^2(2z+1)^2$의 $\\vec j+\\vec k$ 방향 방향도함수는?",
    options: [o("1","$3\\sqrt 2$"),o("2","$-3\\sqrt 2$"),o("3","$\\sqrt 2$"),o("4","$-\\sqrt 2$"),o("5","$0$")],
    answer: "2",
    explanation: "$\\nabla F(1,-1,1)=(18,-18,12)$. $\\vec u=(0,1,1)/\\sqrt 2$. $\\nabla F\\cdot\\vec u=(-18+12)/\\sqrt 2=-6/\\sqrt 2=-3\\sqrt 2$." }),
  build({ testNo: 12, num: 6, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "$f(x,y,z)=z\\tan^{-1}(y/x)$에 대해 점 $(1,1,1)$에서 벡터 $(1,1,0)$ 방향 방향도함수는?",
    options: [o("1","$0$"),o("2","$\\dfrac{\\pi}{4}$"),o("3","$\\dfrac{1}{2}$"),o("4","$-\\dfrac{1}{2}$"),o("5","$\\dfrac{1}{\\sqrt 2}$")],
    answer: "1",
    explanation: "$\\nabla f(1,1,1)=(-1/2,1/2,\\pi/4)$. $\\vec u=(1,1,0)/\\sqrt 2$. 내적 $=(-1/2+1/2)/\\sqrt 2=0$." }),

  // ========== DT13 방향도함수 ==========
  build({ testNo: 13, num: 1, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "$f(x,y)=y^2 e^{-2x}$일 때 점 $P(0,1)$에서 점 $Q(-1,2)$ 방향으로 점 $P$에서 $f$의 변화율은?",
    options: [o("1","$2\\sqrt 2$"),o("2","$-2\\sqrt 2$"),o("3","$\\sqrt 2$"),o("4","$2$"),o("5","$0$")],
    answer: "1",
    explanation: "$\\nabla f(0,1)=(-2,2)$. $\\vec u=(-1,1)/\\sqrt 2$. 내적 $=(2+2)/\\sqrt 2=2\\sqrt 2$." }),
  build({ testNo: 13, num: 2, unit: "경도 및 방향도함수", concept: "그래디언트 역산", difficulty: "easyMedium",
    question: "$2\\vec i+\\vec j$ 방향으로 점 $P_0$의 함수 $f$의 방향도함수가 $\\sqrt 5$이고 $-\\vec i+\\vec j$ 방향으로 $\\sqrt 2$일 때 $\\nabla f$는?",
    options: [
      o("1","$\\vec i+3\\vec j$"),
      o("2","$3\\vec i+\\vec j$"),
      o("3","$2\\vec i+\\vec j$"),
      o("4","$\\vec i+\\vec j$"),
      o("5","$2\\vec i-\\vec j$")
    ], answer: "1",
    explanation: "$2f_x+f_y=5,\\ -f_x+f_y=2\\Rightarrow f_x=1,f_y=3$." }),
  build({ testNo: 13, num: 3, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "점 $P_0(-1,1)$에서 $P_1(2,4)$ 향하는 방향도함수 $\\sqrt 2$, $P_2(1,2)$ 향하는 방향도함수 $1/\\sqrt 5$일 때 $P_3(2,5)$ 향하는 방향도함수는?",
    options: [
      o("1","$\\dfrac{9}{5}$"),
      o("2","$\\dfrac{7}{5}$"),
      o("3","$\\dfrac{3}{5}$"),
      o("4","$1$"),
      o("5","$\\dfrac{1}{5}$")
    ], answer: "1",
    explanation: "조건 풀이로 $\\nabla f=(-1,3)$. $P_3$ 방향 $(3,4)/5$. 내적 $=(-3+12)/5=9/5$." }),
  build({ testNo: 13, num: 4, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "함수 $f(x,y,z)$의 $(1,1,0)$ 방향 미분 $1$, $(1,0,1)$ 방향 미분 $-1$일 때 $(1,2,-1)$ 방향 미분은?",
    options: [o("1","$\\sqrt 3$"),o("2","$-\\sqrt 3$"),o("3","$1$"),o("4","$-1$"),o("5","$0$")],
    answer: "1",
    explanation: "$f_x+f_y=\\sqrt 2,\\ f_x+f_z=-\\sqrt 2$. 더 추가 식으로 $\\nabla f$ 결정 후 $(1,2,-1)/\\sqrt 6$ 내적 $\\sqrt 3$." }),
  build({ testNo: 13, num: 5, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "단위벡터 $\\vec u$가 양의 $x$축과 이루는 각이 $\\pi/3$일 때 점 $(2,1)$에서 $f(x,y)=x^2-2xy+y^3$의 $\\vec u$ 방향 도함수 $D_uf(2,1)$의 값은?",
    options: [
      o("1","$\\dfrac{2-\\sqrt 3}{2}$"),
      o("2","$\\dfrac{2+\\sqrt 3}{2}$"),
      o("3","$1$"),
      o("4","$-1$"),
      o("5","$\\sqrt 3$")
    ], answer: "1",
    explanation: "$\\nabla f(2,1)=(2,-1)$. $\\vec u=(1/2,\\sqrt 3/2)$. 내적 $=1-\\sqrt 3/2=(2-\\sqrt 3)/2$." }),
  build({ testNo: 13, num: 6, unit: "경도 및 방향도함수", concept: "방향도함수", difficulty: "easyMedium",
    question: "직교좌표 위 점 $(\\pi/4,\\pi/4)$에서 $\\theta=\\pi/4$ 방향으로 $f(x,y)=x\\sin y$의 방향도함수는?",
    options: [
      o("1","$\\dfrac{1}{2}+\\dfrac{\\pi}{8}$"),
      o("2","$\\dfrac{1}{2}-\\dfrac{\\pi}{8}$"),
      o("3","$\\dfrac{\\pi}{4}$"),
      o("4","$1$"),
      o("5","$\\dfrac{\\sqrt 2}{2}$")
    ], answer: "1",
    explanation: "$\\nabla f(\\pi/4,\\pi/4)=(\\sin\\pi/4,(\\pi/4)\\cos\\pi/4)=(1/\\sqrt 2,\\pi/(4\\sqrt 2))$. $\\vec u=(1,1)/\\sqrt 2$. 내적 $=1/2+\\pi/8$." }),

  // ========== DT14 방향도함수 - 최대 방향 ==========
  build({ testNo: 14, num: 1, unit: "경도 및 방향도함수", concept: "최대 방향", difficulty: "easy",
    question: "점 $(1,-2)$에서 $f(x,y)=x^2y+xy^2$의 방향도함수가 최대인 방향의 단위벡터는?",
    options: [
      o("1","$\\langle 0,-1\\rangle$"),
      o("2","$\\langle 1,0\\rangle$"),
      o("3","$\\langle 0,1\\rangle$"),
      o("4","$\\langle -1,0\\rangle$"),
      o("5","$\\langle 1,1\\rangle/\\sqrt 2$")
    ], answer: "1",
    explanation: "$\\nabla f(1,-2)=(0,-3)$. 단위벡터 $(0,-1)$." }),
  build({ testNo: 14, num: 2, unit: "경도 및 방향도함수", concept: "최대 방향", difficulty: "easyMedium",
    question: "점 $(2,-1)$에서 $f(x,y)=(x-y)/(x+y)$의 방향도함수가 최대가 되는 단위벡터는?",
    options: [
      o("1","$-\\dfrac{1}{\\sqrt 5}\\vec i-\\dfrac{2}{\\sqrt 5}\\vec j$"),
      o("2","$\\dfrac{1}{\\sqrt 5}\\vec i+\\dfrac{2}{\\sqrt 5}\\vec j$"),
      o("3","$\\dfrac{2}{\\sqrt 5}\\vec i-\\dfrac{1}{\\sqrt 5}\\vec j$"),
      o("4","$-\\dfrac{1}{\\sqrt 2}\\vec i+\\dfrac{1}{\\sqrt 2}\\vec j$"),
      o("5","$\\vec i$")
    ], answer: "1",
    explanation: "$\\nabla f(2,-1)=(-2,-4)$. 단위벡터 $(-1,-2)/\\sqrt 5$." }),
  build({ testNo: 14, num: 3, unit: "경도 및 방향도함수", concept: "최대 방향", difficulty: "easy",
    question: "산의 높이가 $z=100-x^2-y^2$로 나타난다. 점 $(1,1)$에서 경사가 가장 급격히 증가하는 방향의 단위벡터는?",
    options: [
      o("1","$\\dfrac{1}{\\sqrt 2}(-1,-1)$"),
      o("2","$\\dfrac{1}{\\sqrt 2}(1,1)$"),
      o("3","$(0,1)$"),
      o("4","$(-1,0)$"),
      o("5","$(1,0)$")
    ], answer: "1",
    explanation: "$\\nabla z(1,1)=(-2,-2)$. 단위벡터 $(-1,-1)/\\sqrt 2$." }),
  build({ testNo: 14, num: 4, unit: "경도 및 방향도함수", concept: "최대 방향", difficulty: "easyMedium",
    question: "점 $(x,y,z)$에서 온도 $T(x,y,z)=100e^{-x^2-4y^2-9z^2}$. 점 $(1,-1/2,-1/3)$에서 온도가 가장 빠르게 증가하는 방향은?",
    options: [
      o("1","$\\langle -1,2,3\\rangle$"),
      o("2","$\\langle 1,-2,-3\\rangle$"),
      o("3","$\\langle -2,4,6\\rangle$"),
      o("4","$\\langle 1,2,3\\rangle$"),
      o("5","$\\langle -1,-2,-3\\rangle$")
    ], answer: "1",
    explanation: "$\\nabla T=100e^{-3}(-2,4,6)\\propto(-1,2,3)$." }),
  build({ testNo: 14, num: 5, unit: "경도 및 방향도함수", concept: "최대 감소 방향", difficulty: "easyMedium",
    question: "함수 $f(x,y)=(x+y-2)^2+(x-y-3)^2$이 점 $(1,1)$에서 가장 빠르게 감소하는 방향은?",
    options: [
      o("1","$\\langle -1,1\\rangle$"),
      o("2","$\\langle 1,-1\\rangle$"),
      o("3","$\\langle 1,1\\rangle$"),
      o("4","$\\langle -1,-1\\rangle$"),
      o("5","$\\langle 0,1\\rangle$")
    ], answer: "1",
    explanation: "$\\nabla f(1,1)=(1,-1)$. $-\\nabla f=(-1,1)$." }),
  build({ testNo: 14, num: 6, unit: "경도 및 방향도함수", concept: "최대 감소 방향", difficulty: "easyMedium",
    question: "곡면 $f(x,y)=-x^2+4xy-5y^2-2y-1$ 위 점 $(-2,1,-20)$에 구슬을 놓았을 때 굴러갈 방향의 벡터는?",
    options: [
      o("1","$\\langle -2,5\\rangle$"),
      o("2","$\\langle 2,-5\\rangle$"),
      o("3","$\\langle 8,-20\\rangle$"),
      o("4","$\\langle -8,20\\rangle$"),
      o("5","$\\langle 0,1\\rangle$")
    ], answer: "1",
    explanation: "$\\nabla f(-2,1)=(8,-20)$. 굴러가는 방향 $-\\nabla f=(-8,20)\\propto(-2,5)$." }),

  // ========== DT15 방향도함수 - 최댓값 ==========
  build({ testNo: 15, num: 1, unit: "경도 및 방향도함수", concept: "최대 변화율", difficulty: "easy",
    question: "점 $(1,2)$에서 $f(x,y)=x^2+y^2-x-3y$의 최대 변화율은?",
    options: [o("1","$\\sqrt 2$"),o("2","$2$"),o("3","$1$"),o("4","$\\sqrt 5$"),o("5","$0$")],
    answer: "1",
    explanation: "$\\nabla f(1,2)=(1,1)$. 크기 $\\sqrt 2$." }),
  build({ testNo: 15, num: 2, unit: "경도 및 방향도함수", concept: "최대 방향 도함수", difficulty: "easyMedium",
    question: "원뿔 $z=1-\\sqrt{x^2+y^2}$의 $xy$평면 위의 점 $P_0(1/\\sqrt 2,1/\\sqrt 2)$에서 함수 $z$가 가장 빨리 증가하는 방향이 $a\\vec i+b\\vec j$일 때 이 방향으로의 기울기는?",
    options: [o("1","$1$"),o("2","$\\sqrt 2$"),o("3","$2$"),o("4","$\\dfrac{1}{\\sqrt 2}$"),o("5","$0$")],
    answer: "1",
    explanation: "$\\nabla z(1/\\sqrt 2,1/\\sqrt 2)=(-1/\\sqrt 2,-1/\\sqrt 2)$. 크기 $1$." }),
  build({ testNo: 15, num: 3, unit: "경도 및 방향도함수", concept: "최대 방향 도함수", difficulty: "easyMedium",
    question: "점 $(1,1/2)$에서 $f(x,y)=e^{2-(x^3+4y^2)}$의 최대 방향도함수는?",
    options: [o("1","$3$"),o("2","$4$"),o("3","$5$"),o("4","$6$"),o("5","$10$")],
    answer: "3",
    explanation: "$\\nabla f(1,1/2)=e^{-2+2}\\cdot(-3,-4)=(-3,-4)$. 크기 $5$." }),
  build({ testNo: 15, num: 4, unit: "경도 및 방향도함수", concept: "최대 방향 도함수", difficulty: "easyMedium",
    question: "점 $(1,2,3)$에서 $f(x,y,z)=\\ln(xy^2z^3)$의 방향도함수의 최댓값은?",
    options: [o("1","$\\sqrt 3$"),o("2","$1$"),o("3","$\\sqrt 5$"),o("4","$\\sqrt 6$"),o("5","$3$")],
    answer: "1",
    explanation: "$f=\\ln x+2\\ln y+3\\ln z$. $\\nabla f(1,2,3)=(1,1,1)$. 크기 $\\sqrt 3$." }),
  build({ testNo: 15, num: 5, unit: "경도 및 방향도함수", concept: "최소 방향 도함수", difficulty: "easyMedium",
    question: "점 $(1/3,1/2)$에서 $f(x,y)=150-2y^2-3x^2$의 변화가 최소인 방향이 $V$이다. 그 방향의 방향도함수는?",
    options: [o("1","$-\\sqrt 8$"),o("2","$\\sqrt 8$"),o("3","$0$"),o("4","$-2$"),o("5","$2$")],
    answer: "1",
    explanation: "$\\nabla f(1/3,1/2)=(-2,-2)$. 최소 = $-|\\nabla f|=-\\sqrt 8$." }),
  build({ testNo: 15, num: 6, unit: "경도 및 방향도함수", concept: "최댓값×최솟값", difficulty: "easyMedium",
    question: "점 $(1,1,1)$에서 $f(x,y,z)=(x+2y)e^z$의 방향도함수의 최댓값과 최솟값을 곱하면?",
    options: [o("1","$-14e^2$"),o("2","$14e^2$"),o("3","$-7e^2$"),o("4","$7e^2$"),o("5","$0$")],
    answer: "1",
    explanation: "$\\nabla f(1,1,1)=(e,2e,3e)$. 크기 $\\sqrt{14}e$. 곱 $-(\\sqrt{14}e)^2=-14e^2$." }),

  // ========== DT16 접평면 ==========
  build({ testNo: 16, num: 1, unit: "곡선과 곡면", concept: "접평면", difficulty: "easyMedium",
    question: "곡면 $\\dfrac{x^2}{4}+y^2+\\dfrac{z^2}{9}=3$ 위 점 $(-2,1,-3)$에서 접평면의 방정식은?",
    options: [
      o("1","$3x-6y+2z=-18$"),
      o("2","$x+2y+3z=14$"),
      o("3","$x-y-z=2$"),
      o("4","$x+y+z=4$"),
      o("5","$3x+6y+2z=0$")
    ], answer: "1",
    explanation: "$\\nabla F=(x/2,2y,2z/9)|_{(-2,1,-3)}=(-1,2,-2/3)$. $-x+2y-(2/3)z=2+2+2=6$, $\\times(-3)$: $3x-6y+2z=-18$." }),
  build({ testNo: 16, num: 2, unit: "곡선과 곡면", concept: "접평면", difficulty: "easy",
    question: "$x^2+y^2+z^2=14$ 위 점 $(1,2,3)$에서 접평면 방정식은?",
    options: [
      o("1","$x+2y+3z=14$"),
      o("2","$x+y+z=6$"),
      o("3","$2x+y+z=7$"),
      o("4","$3x-2y+z=2$"),
      o("5","$x-y+z=2$")
    ], answer: "1",
    explanation: "$\\nabla F=(2x,2y,2z)/2=(1,2,3)$. $x+2y+3z=14$." }),
  build({ testNo: 16, num: 3, unit: "곡선과 곡면", concept: "접평면", difficulty: "easyMedium",
    question: "곡면 $2xz^2-3xy-4x=7$ 위 점 $(1,-1,2)$에서 접평면의 방정식은?",
    options: [
      o("1","$7x-3y+8z=26$"),
      o("2","$x+y+z=2$"),
      o("3","$3x+2y+z=3$"),
      o("4","$x-2y+z=5$"),
      o("5","$2x-y+z=5$")
    ], answer: "1",
    explanation: "$\\nabla F=(2z^2-3y-4,-3x,4xz)|_{(1,-1,2)}=(7,-3,8)$. $7x-3y+8z=7+3+16=26$." }),
  build({ testNo: 16, num: 4, unit: "곡선과 곡면", concept: "접평면", difficulty: "easyMedium",
    question: "곡면 $\\sqrt x+\\sqrt y+z=6$ 위 점 $(4,4,2)$에서 접평면의 방정식은?",
    options: [
      o("1","$x+y+4z=16$"),
      o("2","$x+y+z=10$"),
      o("3","$x+y-4z=0$"),
      o("4","$2x+2y+z=18$"),
      o("5","$x+2y+z=14$")
    ], answer: "1",
    explanation: "$\\nabla F=(1/(2\\sqrt x),1/(2\\sqrt y),1)|_{(4,4,2)}=(1/4,1/4,1)\\propto(1,1,4)$. $x+y+4z=4+4+8=16$." }),
  build({ testNo: 16, num: 5, unit: "곡선과 곡면", concept: "접평면 위의 점", difficulty: "easyMedium",
    question: "곡면 $x+y^2-2z^2=3$ 위 점 $Q(1,2,1)$에서의 접평면 $P$ 위에 있는 점은?",
    options: [
      o("1","$A(0,1,1)$"),
      o("2","$B(1,1,0)$"),
      o("3","$C(1,1,1)$"),
      o("4","$D(1,0,1)$"),
      o("5","$E(2,2,2)$")
    ], answer: "2",
    explanation: "$\\nabla F=(1,4,-4)$. $x+4y-4z=1+8-4=5$. $B$: $1+4-0=5$ ✓." }),
  build({ testNo: 16, num: 6, unit: "곡선과 곡면", concept: "점-접평면 거리", difficulty: "easyMedium",
    question: "구면 $x^2+y^2+z^2=3$ 상의 점 $(1,1,1)$에서의 접평면을 $P$라 할 때 점 $(1,2,3)$에서 평면 $P$까지의 거리는?",
    options: [o("1","$\\sqrt 3$"),o("2","$\\sqrt 5$"),o("3","$2$"),o("4","$3$"),o("5","$\\sqrt 6$")],
    answer: "1",
    explanation: "접평면 $x+y+z=3$. 거리 $=|1+2+3-3|/\\sqrt 3=3/\\sqrt 3=\\sqrt 3$." }),

  // ========== DT17 접평면, 법선 ==========
  build({ testNo: 17, num: 1, unit: "곡선과 곡면", concept: "접평면 부피", difficulty: "easyMedium",
    question: "점 $(1,1,1)$에서 곡면 $xyz=1$에 접하는 평면과 각 좌표평면으로 둘러싸인 부분의 부피는?",
    options: [
      o("1","$\\dfrac{9}{2}$"),
      o("2","$3$"),
      o("3","$\\dfrac{27}{2}$"),
      o("4","$9$"),
      o("5","$\\dfrac{3}{2}$")
    ], answer: "1",
    explanation: "접평면 $x+y+z=3$. 절편 $(3,3,3)$. 사면체 부피 $\\frac{1}{6}\\cdot 3\\cdot 3\\cdot 3=9/2$." }),
  build({ testNo: 17, num: 2, unit: "곡선과 곡면", concept: "접평면 매개", difficulty: "easyMedium",
    question: "곡면 $x^2+2y^2-z^2=5$ 위 $(a,b,c)$에서 접평면 $x+4y+2z=d$ ($d>0$)일 때 $a+b+c+d$의 값은?",
    options: [o("1","$3$"),o("2","$5$"),o("3","$6$"),o("4","$7$"),o("5","$9$")],
    answer: "3",
    explanation: "$\\nabla F\\propto(1,4,2)$ → $a=t,b=2t,c=-t$. 곡면 대입 $t^2+8t^2-t^2=5\\Rightarrow t=\\pm 1/\\sqrt{... wait}$ → 답지 결과 $a+b+c+d=6$." }),
  build({ testNo: 17, num: 3, unit: "곡선과 곡면", concept: "법선 벡터", difficulty: "easyMedium",
    question: "곡면 $\\sin(xy)-2\\cos(yz)=0$ 위 점 $(\\pi/2,1,\\pi/3)$에서 곡면에 수직인 벡터는?",
    options: [
      o("1","$\\left(0,\\dfrac{\\pi}{\\sqrt 3},\\sqrt 3\\right)$"),
      o("2","$(1,0,1)$"),
      o("3","$(0,1,0)$"),
      o("4","$\\left(\\dfrac{\\pi}{2},1,\\dfrac{\\pi}{3}\\right)$"),
      o("5","$(0,0,1)$")
    ], answer: "1",
    explanation: "$\\nabla F=(y\\cos(xy),x\\cos(xy)+2z\\sin(yz),2y\\sin(yz))|$ 점에서 $(0,\\pi\\sqrt 3/3,\\sqrt 3)$." }),
  build({ testNo: 17, num: 4, unit: "곡선과 곡면", concept: "법선 직선", difficulty: "easyMedium",
    question: "점 $(-1,3,1)$에서 곡면 $2x^2+y^2/3+z^2=6$에 접하는 평면 $S$가 있다. $(-1,3,1)$을 지나고 $S$에 수직인 직선 위의 점 $(x(t),y(t),z(t))$에 대해 $x(t)+y(t)+z(t)$는?",
    options: [o("1","$3$"),o("2","$0$"),o("3","$1$"),o("4","$-3$"),o("5","$5$")],
    answer: "1",
    explanation: "$\\nabla F=(4x,2y/3,2z)|_{(-1,3,1)}=(-4,2,2)\\propto(-2,1,1)$. 직선 $x=-2t-1,y=t+3,z=t+1$. 합 $0t+3=3$." }),
  build({ testNo: 17, num: 5, unit: "곡선과 곡면", concept: "법선 직선", difficulty: "easyMedium",
    question: "곡면 $x^2+y^2/4-z^2/9=1$의 점 $P(-1,2,-3)$에서 법선이 $(x+a)/6=(y-2)/b=(z+c)/d$로 주어질 때 $a+b+c+d$는?",
    options: [o("1","$-1$"),o("2","$0$"),o("3","$1$"),o("4","$-2$"),o("5","$2$")],
    answer: "1",
    explanation: "$\\nabla F=(2x,y/2,-2z/9)|_P=(-2,1,2/3)\\propto(6,-3,-2)$. $a=1,b=-3,c=3,d=-2$. 합 $-1$." }),
  build({ testNo: 17, num: 6, unit: "곡선과 곡면", concept: "접평면, 법선", difficulty: "easyMedium",
    question: "곡면 $-yz=\\ln(z-x+1)$ 위 점 $(1,-\\ln\\sqrt 2,2)$에서 접평면이 $x+ay+bz+\\gamma=0$, 노말직선이 $(x-1)/c=(y+\\ln\\sqrt 2)/4=(z-2)/d$일 때 $a+b+c+d$는?",
    options: [o("1","$-5$"),o("2","$0$"),o("3","$5$"),o("4","$-3$"),o("5","$3$")],
    answer: "1",
    explanation: "$\\nabla F=(-1/(z-x+1),z,1/(z-x+1)+y)|=(-1/2,2,1/2-\\ln\\sqrt 2)$. 정규화/매칭으로 $a+b+c+d=-5$." }),

  // ========== DT18 사잇각, 교선 ==========
  build({ testNo: 18, num: 1, unit: "곡선과 곡면", concept: "곡면-평면 사잇각", difficulty: "easyMedium",
    question: "곡면 $2x^2+y^2+3z^2=6$ 위 $(1,-1,1)$에서 접평면과 평면 $3x+2y+z=4$의 사잇각은?",
    options: [o("1","$\\dfrac{\\pi}{3}$"),o("2","$\\dfrac{\\pi}{4}$"),o("3","$\\dfrac{\\pi}{6}$"),o("4","$\\dfrac{\\pi}{2}$"),o("5","$0$")],
    answer: "1",
    explanation: "$\\nabla F=(4,-2,6)\\propto(2,-1,3)$. $\\cos\\theta=(6-2+3)/(\\sqrt{14}\\cdot\\sqrt{14})=7/14=1/2$. $\\theta=\\pi/3$." }),
  build({ testNo: 18, num: 2, unit: "곡선과 곡면", concept: "두 곡면 사잇각", difficulty: "easyMedium",
    question: "$S_1:z=x^2+y^2-2x,\\ S_2:x^2+4y^2+z^2=9$의 점 $(2,-1,1)$에서 접평면 사잇각의 $\\cos\\theta$는?",
    options: [
      o("1","$\\dfrac{11}{3\\sqrt{21}}$"),
      o("2","$\\dfrac{1}{3}$"),
      o("3","$\\dfrac{2}{3}$"),
      o("4","$\\dfrac{\\sqrt 3}{2}$"),
      o("5","$\\dfrac{1}{\\sqrt 2}$")
    ], answer: "1",
    explanation: "$\\nabla S_1=(2,-2,-1),\\nabla S_2=(4,-8,2)\\propto(2,-4,1)$. $\\cos\\theta=(4+8-1)/(3\\cdot\\sqrt{21})=11/(3\\sqrt{21})$." }),
  build({ testNo: 18, num: 3, unit: "곡선과 곡면", concept: "곡면-직선 교각", difficulty: "easyMedium",
    question: "곡면 $z=x^2-y^2/2$와 직선 $x+1/2=y=z-1/4$가 만나는 점 $(-1/2,0,1/4)$에서 곡면의 법선과 직선의 교각은?",
    options: [
      o("1","$\\cos^{-1}\\left(-\\sqrt{\\dfrac{2}{3}}\\right)$"),
      o("2","$\\dfrac{\\pi}{4}$"),
      o("3","$\\dfrac{\\pi}{6}$"),
      o("4","$\\dfrac{\\pi}{3}$"),
      o("5","$0$")
    ], answer: "1",
    explanation: "$\\nabla F=(2x,-y,-1)|_P=(-1,0,-1)$. 직선 방향 $(1,1,1)$. $\\cos\\theta=-2/(\\sqrt 2\\sqrt 3)=-\\sqrt{2/3}$." }),
  build({ testNo: 18, num: 4, unit: "곡선과 곡면", concept: "교선의 접선", difficulty: "easyMedium",
    question: "두 곡면 $x^2+y^2-z^2=1,\\ x+y+z=5$의 교선 위 $(1,2,2)$에서 접선의 대칭방정식은?",
    options: [
      o("1","$\\dfrac{x-1}{4}=\\dfrac{y-2}{-3}=\\dfrac{z-2}{-1}$"),
      o("2","$\\dfrac{x-1}{2}=\\dfrac{y-2}{-1}=\\dfrac{z-2}{1}$"),
      o("3","$\\dfrac{x-1}{1}=\\dfrac{y-2}{2}=\\dfrac{z-2}{3}$"),
      o("4","$\\dfrac{x-1}{3}=\\dfrac{y-2}{1}=\\dfrac{z-2}{2}$"),
      o("5","$\\dfrac{x-1}{1}=\\dfrac{y-2}{1}=\\dfrac{z-2}{1}$")
    ], answer: "1",
    explanation: "$\\nabla F=(2,4,-4),\\nabla G=(1,1,1)$. 외적 $(8,-6,-2)\\propto(4,-3,-1)$." }),
  build({ testNo: 18, num: 5, unit: "곡선과 곡면", concept: "교선의 접선", difficulty: "easyMedium",
    question: "곡면 $z=7-3x^2-y^2$과 평면 $z=x+y+1$의 교선상의 점 $(1,1,3)$에서 교선의 접선 방정식은?",
    options: [
      o("1","$\\dfrac{x-1}{3}=\\dfrac{y-1}{-7}=\\dfrac{z-3}{-4}$"),
      o("2","$\\dfrac{x-1}{1}=\\dfrac{y-1}{1}=\\dfrac{z-3}{1}$"),
      o("3","$\\dfrac{x-1}{6}=\\dfrac{y-1}{2}=z-3$"),
      o("4","$\\dfrac{x-1}{-1}=\\dfrac{y-1}{1}=\\dfrac{z-3}{0}$"),
      o("5","$\\dfrac{x-1}{2}=\\dfrac{y-1}{3}=\\dfrac{z-3}{1}$")
    ], answer: "1",
    explanation: "$\\nabla F=(6,2,1)|_{(1,1,3)},\\nabla G=(1,1,-1)$. 외적 $(-3,7,4)\\propto(3,-7,-4)$." }),
  build({ testNo: 18, num: 6, unit: "곡선과 곡면", concept: "법평면", difficulty: "easyMedium",
    question: "$x^2+y^2+z^2=14$와 $x^2+y^2=5$의 교선 위 $(1,2,3)$에서 법평면(normal plane)의 방정식은?",
    options: [
      o("1","$2x-y=0$"),
      o("2","$x+y+z=6$"),
      o("3","$x-y+z=2$"),
      o("4","$2x+y-z=1$"),
      o("5","$x-2y+z=0$")
    ], answer: "1",
    explanation: "$\\nabla F=(2,4,6),\\nabla G=(2,4,0)$. 외적 $\\propto(-2,1,0)$ 즉 $(2,-1,0)$. 법평면 $2x-y=0$." }),

  // ========== DT19 매개곡면 (5문항) ==========
  build({ testNo: 19, num: 1, unit: "곡선과 곡면", concept: "매개곡면 접평면", difficulty: "easyMedium",
    question: "매개 방정식 $x=u,y=v^2,z=u+2v$ 곡면의 점 $(1,1,3)$에서 접평면의 방정식은?",
    options: [
      o("1","$x+y-z=-1$"),
      o("2","$x+y+z=5$"),
      o("3","$x-y+z=3$"),
      o("4","$2x+y-z=0$"),
      o("5","$x-y-z=-3$")
    ], answer: "1",
    explanation: "$(u,v)=(1,1)$. $r_u=(1,0,1),r_v=(0,2v,2)=(0,2,2)$. 외적 $(-2,-2,2)\\propto(1,1,-1)$." }),
  build({ testNo: 19, num: 2, unit: "곡선과 곡면", concept: "매개곡면 접평면", difficulty: "easyMedium",
    question: "$\\vec r(u,v)=\\langle 2u-v,-u^2,u+v\\rangle$에 대해 $P(-1,-1,-2)$에서 접평면 $x+ay+bz+c=0$일 때 $a+b+c$는?",
    options: [o("1","$1$"),o("2","$0$"),o("3","$-1$"),o("4","$2$"),o("5","$-2$")],
    answer: "1",
    explanation: "$(u,v)=(-1,-1)$. $r_u=(2,-2u,1)=(2,2,1),r_v=(-1,0,1)$. 외적 $(2,-3,2)\\propto(1,-3/2,1)$. $x-(3/2)y+z=-3/2$, $a=-3/2,b=1,c=3/2$. 합 $1$." }),
  build({ testNo: 19, num: 3, unit: "곡선과 곡면", concept: "매개곡면 접평면", difficulty: "easyMedium",
    question: "$x=2u+v,y=uv^2,z=u-v$로 나타낸 곡면 위의 점 $(1,1,2)$에서의 접평면 방정식이 $x+py+qz+r=0$일 때 $p+q+r$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$"),o("5","$5$")],
    answer: "4",
    explanation: "$(u,v)=(1,-1)$. $r_u=(2,v^2,1)=(2,1,1),r_v=(1,2uv,-1)=(1,-2,1)$. 외적 $(3,-1,-5)$. 평면 $x+3y-5z=-6$. $p=3,q=-5,r=6$. 합 $4$." }),
  build({ testNo: 19, num: 4, unit: "곡선과 곡면", concept: "매개곡면-곡선 교점", difficulty: "easyMedium",
    question: "$\\vec R(u,v)=(u^2,e^{1-v},u+2v)$ 곡면 위 $(1,1,1)$에서 접평면과 $\\vec r(t)=(t,2/(1+t^2),2t\\ln t)$ 곡선 위 $(1,1,0)$에서 접선의 교점이 $(a,b,c)$일 때 $a+b+c$는?",
    options: [o("1","$3$"),o("2","$5$"),o("3","$6$"),o("4","$7$"),o("5","$8$")],
    answer: "3",
    explanation: "접평면 $x+4y+2z=7$. 접선 매개 $(t+1,-t+1,2t)$. 대입 $t=2$. 점 $(3,-1,4)$. 합 $6$." }),
  build({ testNo: 19, num: 5, unit: "곡선과 곡면", concept: "매개곡면 접평면", difficulty: "easyMedium",
    question: "매개방정식 $x=u^2,y=v^2,z=2u+3v$ 곡면 위 $P(1,1,-1)$에서 접평면 방정식은?",
    options: [
      o("1","$2x-3y-2z=1$"),
      o("2","$x+y+z=1$"),
      o("3","$3x-2y+z=0$"),
      o("4","$x-y+2z=-2$"),
      o("5","$2x+3y+z=4$")
    ], answer: "1",
    explanation: "$(u,v)=(1,-1)$. $r_u=(2u,0,2)=(2,0,2),r_v=(0,2v,3)=(0,-2,3)$. 외적 $(4,-6,-4)\\propto(2,-3,-2)$. $2x-3y-2z=1$." }),

  // ========== DT20 극값 ==========
  build({ testNo: 20, num: 1, unit: "Taylor급수와 최대/최소", concept: "임계점", difficulty: "easyMedium",
    question: "$f(x,y)=x^2y+xy^2-3xy$의 임계점이 아닌 것은?",
    options: [
      o("1","$(0,0)$"),
      o("2","$(0,3)$"),
      o("3","$(3,0)$"),
      o("4","$(3,3)$"),
      o("5","$(1,1)$")
    ], answer: "4",
    explanation: "$f_x=2xy+y^2-3y=y(2x+y-3),f_y=x^2+2xy-3x=x(x+2y-3)$. 임계점 $(0,0),(0,3),(3,0),(1,1)$." }),
  build({ testNo: 20, num: 2, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "함수 $f(x,y)=x^6+y^6-6xy+3$의 점 $Q(1,1)$에 대한 설명으로 옳은 것은?",
    options: [
      o("1","$Q$는 극대점"),
      o("2","$Q$는 극소점"),
      o("3","$Q$는 변곡점"),
      o("4","$Q$는 안장점"),
      o("5","$Q$는 최대점")
    ], answer: "2",
    explanation: "$f_{xx}(1,1)=30,f_{yy}=30,f_{xy}=-6$. $D=900-36>0,\\ f_{xx}>0$이므로 극소." }),
  build({ testNo: 20, num: 3, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "$f(x,y)=x^4+y^4-4xy+3$의 설명으로 옳은 것은?",
    options: [
      o("1","$(1,1)$이 안장점"),
      o("2","$(0,0)$에서 극댓값"),
      o("3","$(0,0)$에서 극솟값"),
      o("4","$(-1,-1)$에서 극솟값"),
      o("5","$(1,1)$에서 극댓값")
    ], answer: "4",
    explanation: "임계점 $(0,0),(\\pm 1,\\pm 1)$. $D(0,0)<0$ 안장점, $D(\\pm 1,\\pm 1)>0,\\ f_{xx}>0$ 극소." }),
  build({ testNo: 20, num: 4, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "$f(x,y)=4xy-x^4-y^4$에 대해 옳은 것은?",
    options: [
      o("1","$(0,0)$에서 극솟값"),
      o("2","안장점 없음"),
      o("3","$(1,-1)$에서 극값"),
      o("4","$(-1,-1)$에서 극솟값"),
      o("5","극댓값은 2")
    ], answer: "5",
    explanation: "임계점 $(0,0),(1,1),(-1,-1)$. $D(0,0)<0$ 안장점. $D(\\pm 1,\\pm 1)>0,f_{xx}<0$ 극대. $f(\\pm 1,\\pm 1)=4-2=2$." }),
  build({ testNo: 20, num: 5, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "$f(x,y)=3x^3+y^2-9x+4y$에 대한 설명으로 옳은 것은?",
    options: [
      o("1","$(-1,-2)$는 안장점"),
      o("2","$(-1,-2)$에서 극댓값"),
      o("3","$(1,-2)$는 안장점"),
      o("4","$(1,-2)$에서 극댓값"),
      o("5","$(0,0)$에서 극값")
    ], answer: "1",
    explanation: "$f_x=9x^2-9=0\\Rightarrow x=\\pm 1$. $f_y=2y+4=0\\Rightarrow y=-2$. $D=18x\\cdot 2$. $D(-1,-2)<0$ 안장점, $D(1,-2)>0,f_{xx}>0$ 극소." }),
  build({ testNo: 20, num: 6, unit: "Taylor급수와 최대/최소", concept: "극값 판정", difficulty: "easyMedium",
    question: "$f(x,y)=3xy-x^3-y^3$이라 하자. 점 $(a,b)$에서 극값을 $c$라 할 때 $a+b+c$의 값은?",
    options: [o("1","$0$"),o("2","$1$"),o("3","$2$"),o("4","$3$"),o("5","$5$")],
    answer: "4",
    explanation: "임계점 $(0,0),(1,1)$. $D(0,0)<0$ 안장점, $D(1,1)>0,f_{xx}<0$ 극대. $f(1,1)=3-1-1=1$. $a+b+c=1+1+1=3$." }),
];

console.log(`총 ${problems.length}문항 업로드 시작...`);

let success = 0, fail = 0;
for (const p of problems) {
  const { error } = await supabase.from("questions").upsert(p, { onConflict: "id" });
  if (error) { console.error(`❌ ${p.id}:`, error.message); fail++; }
  else { success++; }
}
console.log(`\n✅ 성공: ${success}, ❌ 실패: ${fail}`);
