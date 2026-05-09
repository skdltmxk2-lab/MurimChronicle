// 2019년 인하대 편입수학 30문항 업로드.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2019";
const SCHOOL_KO = "인하대";
const SCHOOL_EN = "inha";

// 5지선다 헬퍼
function opts5(...texts) {
  return texts.map((text, i) => ({
    id: String(i + 1),
    label: String(i + 1),
    text,
    contentType: "latex",
  }));
}

const PROBLEMS = [
  {
    n: 1,
    subject: "미분학", unit: "도함수의 응용", concept: "극값",
    difficulty: "easy",
    question: "함수 $f(x)=x^4-4x^3+2x^2+20x+20$의 최솟값은?",
    options: opts5("$6$","$7$","$8$","$9$","$10$"),
    correct: "2",
    explanation: "$f'(x)=4x^3-12x^2+4x+20=4(x^3-3x^2+x+5)=4(x+1)(x^2-4x+5)$이고, $x^2-4x+5>0$이므로 임계점은 $x=-1$ 하나뿐이며 극솟값을 가진다. $f(-1)=1+4+2-20+20=7$. 답: 2.",
  },
  {
    n: 2,
    subject: "선형대수", unit: "벡터와 공간도형", concept: "벡터의 외적",
    difficulty: "medium",
    question: "공간 상의 두 벡터 $\\vec a,\\ \\vec b$는 $|\\vec a|=1,\\ |\\vec b|=2,\\ \\vec a\\cdot\\vec b=1$을 만족한다. $|(\\vec a-\\vec b)\\times(\\vec a\\times\\vec b)|$의 값은?",
    options: opts5("$\\dfrac{1}{3}$","$\\dfrac{1}{\\sqrt 3}$","$1$","$\\sqrt 3$","$3$"),
    correct: "5",
    explanation: "$(\\vec a-\\vec b)\\times(\\vec a\\times\\vec b)=\\vec a\\times(\\vec a\\times\\vec b)-\\vec b\\times(\\vec a\\times\\vec b)$. 벡터 삼중적 공식으로 각각 $(\\vec a\\cdot\\vec b)\\vec a-(\\vec a\\cdot\\vec a)\\vec b=\\vec a-\\vec b$, $(\\vec b\\cdot\\vec b)\\vec a-(\\vec a\\cdot\\vec b)\\vec b=4\\vec a-\\vec b$. 따라서 결과는 $-3\\vec a$이고 크기는 $3$. 답: 5.",
  },
  {
    n: 3,
    subject: "미분학", unit: "극한과 연속", concept: "로피탈 정리",
    difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\pi/2}\\dfrac{\\ln\\sin x}{1-\\sin x}$의 값은?",
    options: opts5("$-2$","$-\\dfrac{3}{2}$","$-1$","$-\\dfrac{1}{2}$","$0$"),
    correct: "3",
    explanation: "$x\\to\\pi/2$에서 $\\dfrac{0}{0}$ 꼴이므로 로피탈 정리. $\\displaystyle\\lim_{x\\to\\pi/2}\\dfrac{\\cos x/\\sin x}{-\\cos x}=\\lim_{x\\to\\pi/2}-\\dfrac{1}{\\sin x}=-1$. 답: 3.",
  },
  {
    n: 4,
    subject: "미분학", unit: "도함수의 응용", concept: "극값",
    difficulty: "medium",
    question: "구간 $(0,\\infty)$에서 함수 $f(x)=\\dfrac{\\ln x}{\\sqrt x}$의 최댓값은?",
    options: opts5("$\\dfrac{1}{e}$","$\\dfrac{2}{e}$","$e$","$2e$","$e^2$"),
    correct: "2",
    explanation: "$f'(x)=\\dfrac{\\frac{1}{\\sqrt x}-\\frac{\\ln x}{2\\sqrt x}}{x}=\\dfrac{1-\\frac{1}{2}\\ln x}{x\\sqrt x}$. 임계점은 $1-\\frac{1}{2}\\ln x=0$, 즉 $x=e^2$이고 극대. $f(e^2)=\\dfrac{2}{e}$. 답: 2.",
  },
  {
    n: 5,
    subject: "공학수학", unit: "추가내용", concept: "독립사건",
    difficulty: "easy",
    question: "독립 사건 $A$와 $B$의 확률이 $P(A)=\\dfrac{1}{3},\\ P(B)=\\dfrac{1}{2}$일 때 $P(A^C\\cap B^C)$는?",
    options: opts5("$\\dfrac{1}{6}$","$\\dfrac{1}{5}$","$\\dfrac{1}{4}$","$\\dfrac{1}{3}$","$\\dfrac{1}{2}$"),
    correct: "4",
    explanation: "$A,B$가 독립이면 $A^C,B^C$도 독립. $P(A^C\\cap B^C)=P(A^C)P(B^C)=\\dfrac{2}{3}\\cdot\\dfrac{1}{2}=\\dfrac{1}{3}$. 답: 4.",
  },
  {
    n: 6,
    subject: "적분학", unit: "정적분의 계산", concept: "치환적분",
    difficulty: "easy",
    question: "적분 $\\displaystyle\\int_1^e (\\ln x)^2\\,dx$의 값은?",
    options: opts5("$e-2$","$e-1$","$e$","$e+1$","$e+2$"),
    correct: "1",
    explanation: "$\\ln x=t$로 치환하면 $x=e^t$, $dx=e^t\\,dt$이고 $x:1\\to e$일 때 $t:0\\to 1$. $\\displaystyle\\int_0^1 t^2 e^t\\,dt=[t^2 e^t-2te^t+2e^t]_0^1=e-2$. 답: 1.",
  },
  {
    n: 7,
    subject: "미분학", unit: "함수", concept: "역함수",
    difficulty: "mediumHard",
    question: "함수 $f$가 실수 $0<x<\\pi$에 대하여 $f(\\cot x)=x$를 만족할 때 $f\\!\\left(\\dfrac{1}{3}\\right)+f(3)+f(1)$의 값은?",
    options: opts5("$\\dfrac{1}{2}\\pi$","$\\dfrac{2}{3}\\pi$","$\\dfrac{3}{4}\\pi$","$\\dfrac{4}{5}\\pi$","$\\dfrac{5}{6}\\pi$"),
    correct: "3",
    explanation: "$f(\\cot x)=x$이므로 $f=\\cot^{-1}$. 항등식 $\\cot^{-1}x+\\cot^{-1}(1/x)=\\pi/2$ ($x>0$)에서 $\\cot^{-1}(1/3)+\\cot^{-1}3=\\pi/2$. $\\cot^{-1}1=\\pi/4$. 합 $=\\pi/2+\\pi/4=3\\pi/4$. 답: 3.",
  },
  {
    n: 8,
    subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑지 미정계수",
    difficulty: "medium",
    question: "조건 $x^2+y^2=4$를 만족하는 $x,y$에 대하여 $2x-y$의 최댓값은?",
    options: opts5("$2$","$2\\sqrt 2$","$2\\sqrt 3$","$4$","$2\\sqrt 5$"),
    correct: "5",
    explanation: "코시-슈바르츠 부등식: $(2^2+1^2)(x^2+y^2)\\ge(2x-y)^2$, $5\\cdot 4\\ge(2x-y)^2$, $|2x-y|\\le 2\\sqrt 5$. 최댓값 $2\\sqrt 5$. 답: 5.",
  },
  {
    n: 9,
    subject: "미분학", unit: "도함수의 응용", concept: "쌍곡함수",
    difficulty: "easyMedium",
    question: "다음 서술 중 옳은 것을 모두 고른 것은?\nㄱ. $\\sinh^2 x-\\cosh^2 x=1$\nㄴ. $\\dfrac{d}{dx}\\sinh x=\\cosh x$\nㄷ. $\\dfrac{d}{dx}\\sinh^{-1}x=\\dfrac{1}{\\sqrt{x^2+1}}$",
    options: opts5("ㄱ","ㄴ","ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct: "4",
    explanation: "ㄱ: $\\cosh^2x-\\sinh^2x=1$이므로 부호가 반대, 거짓. ㄴ: 정의에서 바로 참. ㄷ: $\\sinh^{-1}x=\\ln(x+\\sqrt{x^2+1})$의 도함수, 참. 답: 4.",
  },
  {
    n: 10,
    subject: "미분학", unit: "접선의 방정식", concept: "라이프니츠 적분",
    difficulty: "medium",
    question: "함수 $f(x)=x-\\displaystyle\\int_0^x\\ln(x-t)\\,dt$에 대하여 점 $(1,f(1))$에서 곡선 $y=f(x)$의 접선의 방정식은?",
    options: opts5("$y=x+1$","$y=x+2$","$y=x+3$","$y=2x+1$","$y=2x+2$"),
    correct: "1",
    explanation: "$x-t=u$로 치환하면 $\\int_0^x\\ln(x-t)dt=\\int_0^x\\ln u\\,du$. 따라서 $f(x)=x-\\int_0^x\\ln u\\,du$. $f(1)=1-\\int_0^1\\ln u\\,du=1-(-1)=2$. $f'(x)=1-\\ln x$, $f'(1)=1$. 접선: $y-2=1\\cdot(x-1)$, $y=x+1$. 답: 1.",
  },
  {
    n: 11,
    subject: "선형대수", unit: "벡터와 공간도형", concept: "평면의 방정식",
    difficulty: "medium",
    question: "공간상의 점 $(5,-1,4)$과 $(-3,7,-2)$에서 같은 거리에 있는 점들이 모두 $ax+by+cz=1$을 만족한다고 할 때 $a+b+c$의 값은?",
    options: opts5("$0$","$-\\dfrac{1}{5}$","$-\\dfrac{2}{5}$","$-\\dfrac{3}{5}$","$-\\dfrac{4}{5}$"),
    correct: "4",
    explanation: "두 점에서 거리가 같은 점들의 집합은 두 점의 중점을 지나고 두 점을 잇는 벡터에 수직인 평면. 중점 $(1,3,1)$, 법선벡터 $(8,-8,6)\\to(4,-4,3)$. 평면: $4(x-1)-4(y-3)+3(z-1)=0$, $4x-4y+3z=-5$. $-\\dfrac{4}{5}x+\\dfrac{4}{5}y-\\dfrac{3}{5}z=1$. 합 $=-\\dfrac{3}{5}$. 답: 4.",
  },
  {
    n: 12,
    subject: "적분학", unit: "급수의 수렴/발산", concept: "수렴반경",
    difficulty: "medium",
    question: "멱급수 $f(x)=\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{1\\cdot 3\\cdot 5\\cdots(2n+1)}x^n$의 수렴반경은?",
    options: opts5("$0$","$\\dfrac{1}{2}$","$1$","$2$","$\\infty$"),
    correct: "4",
    explanation: "$a_n=\\dfrac{n!}{1\\cdot3\\cdots(2n+1)}$. $\\displaystyle\\lim_{n\\to\\infty}\\left|\\dfrac{a_n}{a_{n+1}}\\right|=\\lim_{n\\to\\infty}\\dfrac{2n+3}{n+1}=2$. 수렴반경 $R=2$. 답: 4.",
  },
  {
    n: 13,
    subject: "공학수학", unit: "미분방정식", concept: "변수분리",
    difficulty: "easyMedium",
    question: "미분방정식 $f'(t)=2tf(t),\\ f(1)=1$의 해 $f(t)$에 대하여 $f(0)$의 값은?",
    options: opts5("$0$","$\\dfrac{1}{e^2}$","$\\dfrac{1}{e}$","$1$","$e$"),
    correct: "3",
    explanation: "변수분리: $\\dfrac{df}{f}=2t\\,dt$, $\\ln|f|=t^2+C$, $f(t)=Ae^{t^2}$. $f(1)=Ae=1$이므로 $A=e^{-1}$. $f(0)=e^{-1}=\\dfrac{1}{e}$. 답: 3.",
  },
  {
    n: 14,
    subject: "적분학", unit: "정적분의 응용", concept: "회전체의 부피",
    difficulty: "medium",
    question: "두 곡선 $y=\\sqrt x,\\ y=x^2$으로 둘러싸인 영역을 $x$축을 중심으로 회전시킬 때 생기는 회전체의 부피는?",
    options: opts5("$\\dfrac{3}{10}\\pi$","$\\dfrac{2}{5}\\pi$","$\\dfrac{1}{2}\\pi$","$\\dfrac{3}{5}\\pi$","$\\dfrac{7}{10}\\pi$"),
    correct: "1",
    explanation: "교점은 $x=0,1$. 부피 $V=\\pi\\displaystyle\\int_0^1[(\\sqrt x)^2-(x^2)^2]dx=\\pi\\int_0^1(x-x^4)dx=\\pi\\!\\left(\\dfrac{1}{2}-\\dfrac{1}{5}\\right)=\\dfrac{3}{10}\\pi$. 답: 1.",
  },
  {
    n: 15,
    subject: "다변수함수", unit: "편도함수", concept: "접평면",
    difficulty: "medium",
    question: "곡면 $x^2+y^4+z^6=26$ 위의 점 $(3,2,1)$에서 접평면의 방정식을 $ax+by+cz=1$이라고 할 때 $a+b+c$의 값은?",
    options: opts5("$0$","$1$","$\\dfrac{1}{2}$","$\\dfrac{1}{3}$","$\\dfrac{1}{4}$"),
    correct: "3",
    explanation: "$f=x^2+y^4+z^6-26$의 그래디언트는 $(2x,4y^3,6z^5)|_{(3,2,1)}=(6,32,6)$. 접평면 $6(x-3)+32(y-2)+6(z-1)=0$, $6x+32y+6z=88$. 양변을 $88$로 나누면 $\\dfrac{3}{44}x+\\dfrac{16}{44}y+\\dfrac{3}{44}z=1$, 합 $=\\dfrac{22}{44}=\\dfrac{1}{2}$. 답: 3.",
  },
  {
    n: 16,
    subject: "적분학", unit: "극좌표와 응용", concept: "극좌표 접선",
    difficulty: "hard",
    question: "극방정식 $r=1+2\\cos\\theta$의 그래프를 생각하자. 직교좌표로 표시된 이 곡선 위의 점 $(1,\\sqrt 3)$에서의 접선의 방정식의 기울기는?",
    options: opts5("$\\dfrac{1}{9}$","$\\dfrac{\\sqrt 3}{9}$","$\\dfrac{1}{3}$","$\\dfrac{\\sqrt 3}{3}$","$1$"),
    correct: "2",
    explanation: "점 $(1,\\sqrt 3)$의 극좌표는 $r=2,\\theta=\\pi/3$. $\\dfrac{dy}{dx}=\\dfrac{r'\\sin\\theta+r\\cos\\theta}{r'\\cos\\theta-r\\sin\\theta}$, $r'=-2\\sin\\theta$. $\\theta=\\pi/3$ 대입: 분자 $=-2\\sin\\theta\\sin\\theta+r\\cos\\theta=-3/2+1=-1/2$, 분모 $=-2\\sin\\theta\\cos\\theta-r\\sin\\theta=-\\sqrt 3/2-\\sqrt 3=-3\\sqrt 3/2$. 비율 $=\\dfrac{1}{3\\sqrt 3}=\\dfrac{\\sqrt 3}{9}$. 답: 2.",
  },
  {
    n: 17,
    subject: "적분학", unit: "Maclaurin급수의 응용", concept: "역삼각함수 급수",
    difficulty: "hard",
    question: "$0<x<1$일 때 $\\tan^{-1}(x^2)=\\displaystyle\\sum_{n=0}^{\\infty}a_n x^n$으로 표현할 때 $\\displaystyle\\sum_{n=0}^{10}a_n$의 값은?",
    options: opts5("$\\dfrac{1}{3}$","$\\dfrac{7}{15}$","$\\dfrac{3}{5}$","$\\dfrac{11}{15}$","$\\dfrac{13}{15}$"),
    correct: "5",
    explanation: "$\\tan^{-1}(x^2)=x^2-\\dfrac{x^6}{3}+\\dfrac{x^{10}}{5}-\\cdots$. 즉 $a_2=1,\\ a_6=-\\dfrac{1}{3},\\ a_{10}=\\dfrac{1}{5}$, 그 외 $a_n=0$. 합 $=1-\\dfrac{1}{3}+\\dfrac{1}{5}=\\dfrac{15-5+3}{15}=\\dfrac{13}{15}$. 답: 5.",
  },
  {
    n: 18,
    subject: "공학수학", unit: "미분방정식", concept: "비제차 2계 ODE",
    difficulty: "hard",
    question: "미분방정식 $f''(t)-4f(t)=e^t,\\ f(0)=1,\\ f'(0)=3$의 해 $f(t)$에 대하여 $\\displaystyle\\lim_{t\\to\\infty}\\dfrac{f(t)}{e^{2t}}$의 값은?",
    options: opts5("$\\dfrac{6}{5}$","$\\dfrac{5}{4}$","$\\dfrac{4}{3}$","$\\dfrac{3}{2}$","$2$"),
    correct: "4",
    explanation: "특수해 $f_p=-\\dfrac{1}{3}e^t$. 동차해 $c_1 e^{2t}+c_2 e^{-2t}$. 초기조건으로 $c_1=\\dfrac{3}{2},\\ c_2=-\\dfrac{1}{6}$. $t\\to\\infty$에서 $e^{2t}$ 항이 지배하므로 $\\dfrac{f(t)}{e^{2t}}\\to c_1=\\dfrac{3}{2}$. 답: 4.",
  },
  {
    n: 19,
    subject: "다변수함수", unit: "체적과 곡면적", concept: "이중적분 부피",
    difficulty: "hard",
    question: "포물면 $z=20-2x^2-3y^2$과 $z=3x^2+2y^2$으로 둘러싸인 영역의 부피는?",
    options: opts5("$8\\pi$","$16\\pi$","$24\\pi$","$32\\pi$","$40\\pi$"),
    correct: "5",
    explanation: "두 곡면의 교선: $20-2x^2-3y^2=3x^2+2y^2$ → $x^2+y^2=4$. 부피 $V=\\displaystyle\\iint_{x^2+y^2\\le 4}[20-2x^2-3y^2-(3x^2+2y^2)]dA=\\iint(20-5x^2-5y^2)dA$. 극좌표: $\\int_0^{2\\pi}\\int_0^2(20-5r^2)r\\,dr\\,d\\theta=2\\pi[10r^2-\\dfrac{5r^4}{4}]_0^2=2\\pi(40-20)=40\\pi$. 답: 5.",
  },
  {
    n: 20,
    subject: "적분학", unit: "특이적분", concept: "감마함수",
    difficulty: "hard",
    question: "$\\displaystyle\\int_0^{\\infty}\\sqrt t\\,e^{-t}\\,dt$의 값은?",
    options: opts5("$\\sqrt\\pi$","$\\dfrac{\\sqrt\\pi}{2}$","$\\dfrac{\\sqrt\\pi}{3}$","$\\dfrac{\\sqrt\\pi}{4}$","$\\dfrac{\\sqrt\\pi}{5}$"),
    correct: "2",
    explanation: "$\\Gamma(s)=\\displaystyle\\int_0^{\\infty}t^{s-1}e^{-t}dt$. 여기서 $s-1=1/2$, 즉 $s=3/2$. $\\Gamma(3/2)=\\dfrac{1}{2}\\Gamma(1/2)=\\dfrac{\\sqrt\\pi}{2}$. 답: 2.",
  },
  {
    n: 21,
    subject: "다변수함수", unit: "삼중적분과 극좌표계", concept: "구면좌표계",
    difficulty: "hard",
    question: "적분 $\\displaystyle\\int_{-\\infty}^{\\infty}\\!\\int_{-\\infty}^{\\infty}\\!\\int_{-\\infty}^{\\infty}\\dfrac{e^{-\\sqrt{x^2+y^2+z^2}}}{\\sqrt{x^2+y^2+z^2}}\\,dx\\,dy\\,dz$의 값은?",
    options: opts5("$4\\pi$","$5\\pi$","$6\\pi$","$7\\pi$","$8\\pi$"),
    correct: "1",
    explanation: "구면좌표 $\\rho=\\sqrt{x^2+y^2+z^2}$로 변환: $\\displaystyle\\int_0^{2\\pi}\\!\\int_0^{\\pi}\\!\\int_0^{\\infty}\\dfrac{e^{-\\rho}}{\\rho}\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=2\\pi\\cdot 2\\cdot\\int_0^{\\infty}\\rho e^{-\\rho}d\\rho=4\\pi\\cdot 1=4\\pi$. 답: 1.",
  },
  {
    n: 22,
    subject: "다변수함수", unit: "체적과 곡면적", concept: "곡면적",
    difficulty: "hard",
    question: "영역 $D=\\{(x,y)\\mid x^2+y^2\\le 1\\}$에서 정의된 함수 $f(x,y)=xy$의 그래프로 표시되는 곡면의 면적은?",
    options: opts5("$\\dfrac{2\\pi}{3}(2\\sqrt 2-1)$","$\\dfrac{4\\pi}{3}(\\sqrt 2-1)$","$\\dfrac{2\\pi}{3}(2\\sqrt 2+1)$","$\\dfrac{4\\pi}{3}(\\sqrt 2+1)$","$\\dfrac{4\\sqrt 2}{3}\\pi$"),
    correct: "1",
    explanation: "곡면적 $S=\\iint_D\\sqrt{1+y^2+x^2}\\,dA$. 극좌표: $\\int_0^{2\\pi}\\int_0^1\\sqrt{1+r^2}\\,r\\,dr\\,d\\theta=2\\pi\\cdot\\dfrac{1}{3}[(1+r^2)^{3/2}]_0^1=\\dfrac{2\\pi}{3}(2\\sqrt 2-1)$. 답: 1.",
  },
  {
    n: 23,
    subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리·면적",
    difficulty: "hard",
    question: "$C$의 반시계 방향의 타원 $\\{(x,y)\\mid 4x^2+9y^2=25\\}$라고 할 때 선적분 $\\displaystyle\\int_C x\\,dy-y\\,dx$의 값은?",
    options: opts5("$\\dfrac{23}{3}\\pi$","$8\\pi$","$\\dfrac{25}{3}\\pi$","$\\dfrac{26}{3}\\pi$","$9\\pi$"),
    correct: "3",
    explanation: "$\\dfrac{1}{2}\\oint_C(x\\,dy-y\\,dx)$는 영역의 면적. 즉 $\\oint=2\\cdot$면적. 타원의 반축 $a=\\dfrac{5}{2},b=\\dfrac{5}{3}$, 면적 $=\\pi ab=\\dfrac{25\\pi}{6}$. 따라서 적분값 $=\\dfrac{25\\pi}{3}$. 답: 3.",
  },
  {
    n: 24,
    subject: "다변수함수", unit: "선적분과 면적분", concept: "그린정리",
    difficulty: "hard",
    question: "$D$는 $y=x^2$과 $y=1$로 둘러싸인 영역이고 $C$는 $D$의 경계이다. 곡선 $C$를 따라서 반시계 방향으로 움직일 때 선적분 $\\displaystyle\\int_C(2x^2y+\\sin(x^2))dx+(x^3+e^{y^3})dy$의 값은?",
    options: opts5("$0$","$\\dfrac{2}{15}$","$\\dfrac{4}{15}$","$\\dfrac{2}{5}$","$\\dfrac{8}{15}$"),
    correct: "3",
    explanation: "그린 정리: $\\iint_D(Q_x-P_y)dA=\\iint_D(3x^2-2x^2)dA=\\iint_D x^2\\,dA$. $\\displaystyle\\int_{-1}^1\\int_{x^2}^1 x^2\\,dy\\,dx=\\int_{-1}^1 x^2(1-x^2)dx=\\dfrac{2}{3}-\\dfrac{2}{5}=\\dfrac{4}{15}$. 답: 3.",
  },
  {
    n: 25,
    subject: "다변수함수", unit: "삼중적분과 극좌표계", concept: "원기둥좌표",
    difficulty: "hard",
    question: "$V=\\{(x,y,z)\\mid (x+1)^2+y^2\\le 1,\\ y\\ge 0,\\ 0\\le z\\le 2\\}$에서 적분 $\\displaystyle\\iiint_V xyz\\,dx\\,dy\\,dz$의 값은?",
    options: opts5("$0$","$-\\dfrac{1}{3}$","$-\\dfrac{2}{3}$","$-1$","$-\\dfrac{4}{3}$"),
    correct: "5",
    explanation: "중심 $(-1,0)$인 반원. $x=-1+r\\cos\\theta,\\ y=r\\sin\\theta$, $0\\le r\\le 1$, $0\\le\\theta\\le\\pi$, $0\\le z\\le 2$. $\\iiint xyz\\,dV=\\int_0^2 z\\,dz\\int_0^{\\pi}\\int_0^1(-1+r\\cos\\theta)(r\\sin\\theta)\\,r\\,dr\\,d\\theta=2\\int_0^{\\pi}\\sin\\theta\\,d\\theta\\int_0^1(-r^2+r^3\\cos\\theta)dr$. 정리하면 $-\\dfrac{4}{3}$. 답: 5.",
  },
  {
    n: 26,
    subject: "적분학", unit: "정적분의 응용", concept: "라이프니츠 미분",
    difficulty: "killer",
    question: "양의 실수 $x$에서 미분가능한 함수 $f(x)$에 대하여 $\\displaystyle\\int_0^x(x^2-t^2)f(t)\\,dt=x^4\\ln\\!\\left(\\dfrac{x^4}{e}\\right)$이 성립할 때 $f(1)$의 값은?",
    options: opts5("$2$","$4$","$6$","$8$","$10$"),
    correct: "4",
    explanation: "좌변을 $x$에 대해 미분: $2x\\!\\int_0^x f(t)dt$. 우변 미분: $4x^3(4\\ln x-1)+4x^3=16x^3\\ln x$. 다시 미분 후 $x=1$ 대입: $2\\!\\int_0^1 f(t)dt+2f(1)=16$. $\\int_0^1 f(t)dt=0$ (원식에 $x=1$ 대입하면 $\\int_0^1(1-t^2)f(t)dt=-1$이지만 라이프니츠 두 번 미분 결과에서 $f(1)=8$). 답: 4.",
  },
  {
    n: 27,
    subject: "다변수함수", unit: "선적분과 면적분", concept: "스칼라 면적분",
    difficulty: "hard",
    question: "함수 $f:\\mathbb R^2\\to\\mathbb R$와 곡면 $S$는 다음과 같다. $f(x,y)=\\dfrac{1}{2}(x^2+y^2)$, $S=\\{(x,y,z)\\mid x^2+y^2\\le 1,\\ z=f(x,y)\\}$. 곡면적분 $\\displaystyle\\iint_S z\\,dS$의 값은?",
    options: opts5("$\\dfrac{(1+\\sqrt 2)\\pi}{15}$","$\\dfrac{2(1+\\sqrt 2)\\pi}{15}$","$\\dfrac{(1+\\sqrt 2)\\pi}{5}$","$\\dfrac{4(1+\\sqrt 2)\\pi}{15}$","$\\dfrac{(1+\\sqrt 2)\\pi}{3}$"),
    correct: "2",
    explanation: "$dS=\\sqrt{1+x^2+y^2}\\,dA$. 극좌표: $\\displaystyle\\iint_D\\dfrac{r^2}{2}\\sqrt{1+r^2}\\,r\\,dr\\,d\\theta=\\pi\\!\\int_0^1 r^3\\sqrt{1+r^2}\\,dr$. $u=1+r^2$ 치환: $\\dfrac{\\pi}{2}\\int_1^2(u-1)\\sqrt u\\,du=\\dfrac{\\pi}{2}\\!\\left[\\dfrac{2u^{5/2}}{5}-\\dfrac{2u^{3/2}}{3}\\right]_1^2=\\dfrac{2(1+\\sqrt 2)\\pi}{15}$. 답: 2.",
  },
  {
    n: 28,
    subject: "선형대수", unit: "고유치와 대각화", concept: "닮은 행렬",
    difficulty: "hard",
    question: "행렬 $A=\\begin{pmatrix}1&2\\\\3&0\\end{pmatrix}$에 대하여 행렬 $B$는 $6B-A=AB$를 만족할 때 행렬 $B$의 대각원소의 합은?",
    options: opts5("$\\dfrac{1}{2}$","$\\dfrac{3}{4}$","$1$","$\\dfrac{5}{4}$","$\\dfrac{3}{2}$"),
    correct: "2",
    explanation: "$6B-A=AB$ → $(6I-A)B=A$ → $B=(6I-A)^{-1}A$. $6I-A=\\begin{pmatrix}5&-2\\\\-3&6\\end{pmatrix}$, 역행렬 $\\dfrac{1}{24}\\begin{pmatrix}6&2\\\\3&5\\end{pmatrix}$. $B=\\dfrac{1}{24}\\begin{pmatrix}12&12\\\\18&6\\end{pmatrix}$. 대각합 $=\\dfrac{18}{24}=\\dfrac{3}{4}$. 답: 2.",
  },
  {
    n: 29,
    subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리",
    difficulty: "hard",
    question: "$S$는 구면 $x^2+y^2+z^2=1$이라고 할 때 $S$ 위에서 벡터장 $F=\\langle x^3+e^{y^2},\\ 3yz^2+\\sin z,\\ 3y^2z\\rangle$의 유속 $\\displaystyle\\iint_S F\\cdot\\hat n\\,dS$의 값은? ($\\hat n$은 $S$에서 외부로 향하는 단위벡터.)",
    options: opts5("$\\dfrac{4}{5}\\pi$","$\\dfrac{6}{5}\\pi$","$\\dfrac{8}{5}\\pi$","$2\\pi$","$\\dfrac{12}{5}\\pi$"),
    correct: "5",
    explanation: "$\\nabla\\cdot F=3x^2+3z^2+3y^2=3(x^2+y^2+z^2)$. 발산정리: $\\iiint_V 3\\rho^2\\,dV=3\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi}\\!\\int_0^1\\rho^2\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=3\\cdot 2\\pi\\cdot 2\\cdot\\dfrac{1}{5}=\\dfrac{12\\pi}{5}$. 답: 5.",
  },
  {
    n: 30,
    subject: "다변수함수", unit: "선적분과 면적분", concept: "스톡스 정리",
    difficulty: "hard",
    question: "$S$를 포물면 $z=3-x^2-y^2$의 부분 중에서 평면 $z=2x$의 윗부분이라고 할 때 $S$ 위에서 벡터장 $F=\\langle z^2,\\ x^2,\\ y^2\\rangle$의 유속 $\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\hat n\\,dS$의 값은? ($\\hat n$은 포물면 위로 향하는 단위법선벡터.)",
    options: opts5("$-8\\pi$","$-6\\pi$","$-4\\pi$","$-2\\pi$","$0$"),
    correct: "1",
    explanation: "스톡스 정리로 평면 $z=2x$ 위의 디스크에서 적분. $\\nabla\\times F=(2y,2z,2x)$. 디스크 정의역 $(x+1)^2+y^2\\le 4$, 법선 $(-2,0,1)$. $\\iint_D(2y,2z,2x)\\cdot(-2,0,1)\\,dA=\\iint_D(-4y+2x)dA$. $y$ 적분은 대칭으로 $0$. $\\iint 2x\\,dA=2\\cdot\\pi\\cdot 4\\cdot(-1)=-8\\pi$ (중심 $x=-1$). 답: 1.",
  },
];

// 업로드
let okCount = 0, failCount = 0;
for (const p of PROBLEMS) {
  const num = String(p.n).padStart(2, "0");
  const id = `q-${YEAR}-${SCHOOL_EN}-${num}`;
  const tags = [YEAR, SCHOOL_KO, p.subject, p.unit, p.concept].filter(Boolean);
  const row = {
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
    options: p.options,
    correct_option_id: p.correct,
    explanation: p.explanation,
    explanation_content_type: "latex",
    explanation_image: null,
    tags,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await sb.from("questions").upsert(row, { onConflict: "id" });
  if (error) { console.error(`❌ ${id}:`, error.message); failCount++; }
  else { console.log(`✓ ${id}`); okCount++; }
}
console.log(`\n총 ${okCount}건 업로드, ${failCount}건 실패 (대상 ${PROBLEMS.length}건)`);
