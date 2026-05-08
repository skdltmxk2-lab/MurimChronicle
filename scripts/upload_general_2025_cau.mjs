// Upload 2025년도 중앙대 편입수학 기출 30문항 (4지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "중앙대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-cau-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({ num:1, subject:"미분학", unit:"도함수", concept:"로그미분", difficulty:"medium",
    question:"$\\dfrac{d}{dx}\\!\\left\\{\\dfrac{x^4(x-1)}{(x+2)(x^2+1)}\\right\\}\\bigg|_{x=2}$의 값은?",
    options:[o("1","$\\dfrac{16}{25}$"),o("2","$\\dfrac{11}{5}$"),o("3","$\\dfrac{19}{25}$"),o("4","$\\dfrac{39}{25}$")],
    answer:4,
    explanation:"로그미분: $\\dfrac{f'}{f}=\\dfrac{4}{x}+\\dfrac{1}{x-1}-\\dfrac{1}{x+2}-\\dfrac{2x}{x^2+1}$. $x=2$에서 $f(2)=\\tfrac{16}{4\\cdot 5}=\\tfrac{4}{5}$, $\\tfrac{f'(2)}{f(2)}=2+1-\\tfrac{1}{4}-\\tfrac{4}{5}=\\tfrac{39}{20}$. $f'(2)=\\tfrac{39}{20}\\cdot\\tfrac{4}{5}=\\dfrac{39}{25}$."
  }),
  build({ num:2, subject:"적분학", unit:"급수", concept:"수렴반경(스털링)", difficulty:"medium",
    question:"멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{n^n}x^n$의 수렴반경은?",
    options:[o("1","$\\dfrac{1}{e}$"),o("2","$1$"),o("3","$e$"),o("4","$+\\infty$")],
    answer:3,
    explanation:"비율: $\\!\\left|\\dfrac{a_{n+1}}{a_n}\\right|=\\dfrac{(n+1)!\\,n^n}{n!(n+1)^{n+1}}=\\dfrac{n^n}{(n+1)^n}\\to\\tfrac{1}{e}$. 수렴반경 $=e$."
  }),
  build({ num:3, subject:"미분학", unit:"도함수", concept:"수치2계 도함수 정의", difficulty:"medium",
    question:"$f(x)=\\arctan x$일 때, $\\displaystyle\\lim_{h\\to 0}\\dfrac{f(1+h)-2f(1)+f(1-h)}{h^2}$의 값은?",
    options:[o("1","$-1$"),o("2","$-\\dfrac{1}{2}$"),o("3","$0$"),o("4","$\\dfrac{1}{2}$")],
    answer:2,
    explanation:"수치 2계 도함수: 극한 $=f''(1)$. $f'(x)=\\tfrac{1}{1+x^2}$, $f''(x)=-\\tfrac{2x}{(1+x^2)^2}$. $f''(1)=-\\tfrac{2}{4}=-\\dfrac{1}{2}$."
  }),
  build({ num:4, subject:"선형대수", unit:"고유치와 대각화", concept:"고유값 판정", difficulty:"easyMedium",
    question:"행렬 $B=\\begin{pmatrix}1 & 1 & 0\\\\ 1 & -1 & 0\\\\ 0 & 0 & 0\\end{pmatrix}$의 고윳값(eigenvalue)이 아닌 것은?",
    options:[o("1","$-\\sqrt{2}$"),o("2","$0$"),o("3","$\\dfrac{\\sqrt{2}}{2}$"),o("4","$\\sqrt{2}$")],
    answer:3,
    explanation:"고유다항식 $\\lambda(\\lambda^2-2)=0$ → $\\lambda=0,\\pm\\sqrt 2$. $\\sqrt 2/2$는 아님."
  }),
  build({ num:5, subject:"다변수함수", unit:"벡터", concept:"스칼라 삼중곱", difficulty:"easyMedium",
    question:"공간상의 벡터 $a,b,c$를 $a=(1,1,1),\\,b=(2,3,4),\\,c=(4,9,16)$이라고 할 때, $a\\cdot(b\\times c)$의 값은?",
    options:[o("1","$2$"),o("2","$6$"),o("3","$12$"),o("4","$16$")],
    answer:1,
    explanation:"$\\det\\!\\begin{pmatrix}1&1&1\\\\2&3&4\\\\4&9&16\\end{pmatrix}=$ Vandermonde-like. $-(2-3)(2-4)(3-4)=-1\\cdot(-2)\\cdot(-1)=-2$ 절댓값 $2$. 부호 검토하면 $+2$."
  }),
  build({ num:6, subject:"미분학", unit:"도함수", concept:"역함수 도함수", difficulty:"easyMedium",
    question:"실수 전체에서 정의된 함수 $f(x)=x^3+\\dfrac{1}{2}x$의 역함수를 $f^{-1}(x)$라 할 때, $\\dfrac{d}{dx}\\{f^{-1}(x)\\}\\big|_{x=9}$의 값은?",
    options:[o("1","$\\dfrac{1}{25}$"),o("2","$\\dfrac{2}{25}$"),o("3","$\\dfrac{4}{25}$"),o("4","$\\dfrac{8}{25}$")],
    answer:2,
    explanation:"$f(2)=9$. $f'(x)=3x^2+\\tfrac{1}{2}$, $f'(2)=\\tfrac{25}{2}$. 역함수 미분 $=\\dfrac{1}{f'(2)}=\\dfrac{2}{25}$."
  }),
  build({ num:7, subject:"다변수함수", unit:"편도함수", concept:"음함수 2계 미분", difficulty:"medium",
    question:"함수 $y=y(x)$가 $y^3-x^2=4$를 만족할 때, 이계도함수 $\\dfrac{d^2y}{dx^2}$를 구하면?",
    options:[o("1","$\\dfrac{6y-8}{9y^5}$"),o("2","$\\dfrac{6y^2-8x}{9y^5}$"),o("3","$\\dfrac{6y^3-8x^2}{9y^5}$"),o("4","$\\dfrac{6y^4-8x^3}{9y^5}$")],
    answer:3,
    explanation:"음함수 미분: $\\dfrac{dy}{dx}=\\tfrac{2x}{3y^2}$. 두 번째 미분 후 정리하면 $\\dfrac{6y^3-8x^2}{9y^5}$."
  }),
  build({ num:8, subject:"선형대수", unit:"벡터공간", concept:"선형사상 치역", difficulty:"medium",
    question:"$Tx=\\begin{pmatrix}1 & 2 & 1\\\\ 0 & 1 & 1\\\\ -1 & 3 & 4\\end{pmatrix}x,\\,x\\in\\mathbb{R}^3$일 때, $T$의 치역(range)에 속하지 않는 벡터는?",
    options:[o("1","$(-1,0,1)$"),o("2","$(5,1,0)$"),o("3","$(4,1,1)$"),o("4","$(-3,1,3)$")],
    answer:4,
    explanation:"치역의 기저: 열공간 $\\{(1,0,-1),(2,1,3)\\}$ (rank 2). 치역 평면 $x-5y+z=0$. $(-3,1,3)$ 대입: $-3-5+3=-5\\ne 0$."
  }),
  build({ num:9, subject:"미분학", unit:"도함수의 응용", concept:"함수 최솟값", difficulty:"medium",
    question:"폐구간 $\\!\\left[-\\dfrac{\\pi}{2},\\dfrac{\\pi}{2}\\right]$에서 다음과 같이 정의되는 함수 $S(x)$의 최솟값은?\n\n$S(x)=\\begin{cases}\\dfrac{\\sin x}{x}, & x\\ne 0\\\\ 1, & x=0\\end{cases}$",
    options:[o("1","$\\dfrac{2\\sqrt{3}}{2\\pi}$"),o("2","$\\dfrac{2\\sqrt{2}}{\\pi}$"),o("3","$\\dfrac{2}{\\pi}$"),o("4","$1$")],
    answer:3,
    explanation:"$S(x)$ 우함수, $[0,\\pi/2]$에서 감소. 최솟값 $S(\\pi/2)=\\dfrac{2}{\\pi}$."
  }),
  build({ num:10, subject:"선형대수", unit:"행렬", concept:"행렬식(블록패턴)", difficulty:"medium",
    question:"임의의 실수 $a,b$에 대하여 행렬 $M$을 $M=\\begin{pmatrix}a & b & b & b\\\\ a & a & b & a\\\\ a & b & a & a\\\\ b & b & b & a\\end{pmatrix}$이라고 할 때, $M$의 행렬식을 구하면?",
    options:[o("1","$a(a-b)^3$"),o("2","$-b(a-b)^3$"),o("3","$(a-b)^4$"),o("4","$-(a-b)^4$")],
    answer:3,
    explanation:"행 연산 후 라플라스 전개로 $(a-b)^4$."
  }),
  build({ num:11, subject:"적분학", unit:"정적분의 응용", concept:"극곡선 넓이", difficulty:"medium",
    question:"$\\mathbb{R}^2$에서의 극좌표 $(r,\\theta)$로 나타낸 곡선 $r=\\dfrac{16}{5+3\\cos\\theta},\\,0\\le\\theta\\le 2\\pi$이 둘러싸고 있는 영역의 면적은?",
    options:[o("1","$5\\pi$"),o("2","$10\\pi$"),o("3","$15\\pi$"),o("4","$20\\pi$")],
    answer:4,
    explanation:"극방정식 $\\to$ 직교: $5r+3r\\cos\\theta=16$ → $5\\sqrt{x^2+y^2}=16-3x$. 제곱 후 $16x^2+25y^2+96x=256$ → $16(x+3)^2+25y^2=400$ 타원. 면적 $\\pi\\cdot 5\\cdot 4=20\\pi$."
  }),
  build({ num:12, subject:"미분학", unit:"극한과 연속", concept:"$L^p$ 노름 극한", difficulty:"medium",
    question:"$0<a<b$일 때 $\\displaystyle\\lim_{n\\to\\infty}(a^n+b^n)^{1/n}$의 값은?",
    options:[o("1","$1$"),o("2","$a$"),o("3","$b$"),o("4","$a+b$")],
    answer:3,
    explanation:"$=b\\lim(1+(a/b)^n)^{1/n}=b\\cdot 1=b$."
  }),
  build({ num:13, subject:"적분학", unit:"정적분의 계산", concept:"치환적분", difficulty:"medium",
    question:"함수 $g(x)$의 도함수가 연속이고 $g(1)=\\sqrt{3},\\,g(0)=1$일 때, $\\displaystyle\\int_0^1\\dfrac{g(x)g'(x)}{\\sqrt{1+\\{g(x)\\}^2}}dx$의 값은?",
    options:[o("1","$\\dfrac{2-\\sqrt{2}}{2}$"),o("2","$2-\\sqrt{2}$"),o("3","$\\dfrac{2+\\sqrt{2}}{2}$"),o("4","$2+\\sqrt{2}$")],
    answer:2,
    explanation:"$u=g(x)$ 치환: $\\!\\int_1^{\\sqrt 3}\\dfrac{u}{\\sqrt{1+u^2}}du=[\\sqrt{1+u^2}]_1^{\\sqrt 3}=2-\\sqrt 2$."
  }),
  build({ num:14, subject:"적분학", unit:"정적분의 계산", concept:"부분적분", difficulty:"medium",
    question:"$\\displaystyle\\int_0^{\\pi/2}t^2\\sin(2t)\\,dt$의 값은?",
    options:[o("1","$\\dfrac{\\pi^2-4}{8}$"),o("2","$\\dfrac{\\pi^2-2}{8}$"),o("3","$\\dfrac{\\pi^2+2}{8}$"),o("4","$\\dfrac{\\pi^2+4}{8}$")],
    answer:1,
    explanation:"부분적분 두 번: $\\!\\left[-\\tfrac{t^2}{2}\\cos 2t+\\tfrac{t}{2}\\sin 2t+\\tfrac{1}{4}\\cos 2t\\right]_0^{\\pi/2}=\\dfrac{\\pi^2-4}{8}$."
  }),
  build({ num:15, subject:"적분학", unit:"정적분의 계산", concept:"치환적분(분수)", difficulty:"medium",
    question:"$\\displaystyle\\int_{-1}^{1}\\dfrac{6x+7}{(x+2)^2}dx$의 값은?",
    options:[o("1","$6\\ln 3-\\dfrac{10}{3}$"),o("2","$6\\ln 3-\\dfrac{5}{3}$"),o("3","$6\\ln 3+\\dfrac{5}{3}$"),o("4","$6\\ln 3+\\dfrac{10}{3}$")],
    answer:1,
    explanation:"$x+2=t$ 치환: $\\!\\int_1^3\\tfrac{6t-5}{t^2}dt=[6\\ln t+\\tfrac{5}{t}]_1^3=6\\ln 3-\\tfrac{10}{3}$."
  }),
  build({ num:16, subject:"다변수함수", unit:"중적분", concept:"구좌표 적분", difficulty:"medium",
    question:"$\\Omega=\\{(x,y,z)\\in\\mathbb{R}^3\\mid z>0,\\,x^2+y^2+z^2\\le 1\\}$이라 할 때, $\\displaystyle\\iiint_{\\Omega}(x^2+y^2)z\\,dx\\,dy\\,dz$의 값은?",
    options:[o("1","$\\dfrac{\\pi}{21}$"),o("2","$\\dfrac{\\pi}{18}$"),o("3","$\\dfrac{\\pi}{15}$"),o("4","$\\dfrac{\\pi}{12}$")],
    answer:4,
    explanation:"구좌표: $\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/2}\\!\\!\\int_0^1\\rho^4\\sin^3\\phi\\cos\\phi\\,d\\rho\\,d\\phi\\,d\\theta=2\\pi\\cdot\\tfrac{1}{4}\\cdot\\tfrac{1}{5}=\\dfrac{\\pi}{12}$."
  }),
  build({ num:17, subject:"적분학", unit:"정적분의 계산", concept:"역삼각함수 적분", difficulty:"medium",
    question:"$\\dfrac{1}{\\pi}\\displaystyle\\int_0^{3/4}\\dfrac{dx}{\\sqrt{x(1-x)}}$의 값은?",
    options:[o("1","$\\dfrac{1}{6}$"),o("2","$\\dfrac{1}{3}$"),o("3","$\\dfrac{1}{2}$"),o("4","$\\dfrac{2}{3}$")],
    answer:4,
    explanation:"$x-1/2=t$ 치환: $\\dfrac{1}{\\pi}[2\\sin^{-1}(2x-1)]_0^{3/4}=\\dfrac{1}{\\pi}\\cdot\\dfrac{2\\pi}{3}=\\dfrac{2}{3}$."
  }),
  build({ num:18, subject:"공학수학", unit:"미분방정식", concept:"1계 선형 ODE", difficulty:"medium",
    question:"$(x^2+1)f'(x)+4xf(x)=x,\\,f(2)=1$을 만족하는 함수 $f(x)$에 대하여 $f(0)$의 값은?",
    options:[o("1","$1$"),o("2","$\\dfrac{79}{4}$"),o("3","$19$"),o("4","$25$")],
    answer:3,
    explanation:"적분인자 $(x^2+1)^2$. $f(x)=\\tfrac{1}{(x^2+1)^2}\\!\\left(\\tfrac{x^4}{4}+\\tfrac{x^2}{2}+19\\right)$. $f(0)=19$."
  }),
  build({ num:19, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리", difficulty:"easyMedium",
    question:"$\\mathbb{R}^2$ 상의 부드러운 폐곡선 $C$가 둘러싸고 있는 영역의 넓이를 $s$라 할 때, $\\displaystyle\\int_C(2y+3)dx+(6x-11)dy$의 값은?",
    options:[o("1","$4s$"),o("2","$6s$"),o("3","$8s$"),o("4","$12s$")],
    answer:1,
    explanation:"그린정리: $\\!\\iint(Q_x-P_y)dA=\\!\\iint(6-2)dA=4s$."
  }),
  build({ num:20, subject:"적분학", unit:"정적분의 계산", concept:"부분적분(반복)", difficulty:"easyMedium",
    question:"$\\displaystyle\\int_1^e(\\ln x)^2 dx$의 값은?",
    options:[o("1","$e-2$"),o("2","$e$"),o("3","$e+2$"),o("4","$2e$")],
    answer:1,
    explanation:"$\\ln x=t$ 치환: $\\!\\int_0^1 t^2 e^t dt=[t^2 e^t-2te^t+2e^t]_0^1=e-2$."
  }),
  build({ num:21, subject:"선형대수", unit:"행렬", concept:"반대칭행렬 진위", difficulty:"medium",
    question:"$n\\times n$ 행렬 $A$가 $A^T=-A$를 만족할 때, $A$를 반대칭행렬이라고 한다. 반대칭행렬 $A$에 관한 다음의 설명 중 옳은 것을 모두 고르면? (단, $A^T$는 $A$의 전치행렬을, $\\det(A)$는 $A$의 행렬식을 나타낸다.)\n\n(가) $A-A^T$는 반대칭행렬이다.\n(나) $n$이 홀수면 $\\det(A)=0$이다.\n(다) $n$이 짝수면 $\\det(A)<0$이다.\n(라) 대각성분의 합은 $0$이다.",
    options:[o("1","(가), (나), (다)"),o("2","(가), (나), (라)"),o("3","(가), (다), (라)"),o("4","(나), (다), (라)")],
    answer:2,
    explanation:"(가) $A^T=-A$이라 $A-A^T=2A$ 반대칭. **참**. (나) $\\det A=(-1)^n\\det A$, $n$ 홀수 $\\Rightarrow\\det A=0$. **참**. (다) $n$ 짝수면 $\\det A$의 부호 결정 안 됨. **거짓**. (라) 대각성분 0이라 합 0. **참**."
  }),
  build({ num:22, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"Taylor 계수", difficulty:"medium",
    question:"$\\ln\\!\\left(\\dfrac{1+x}{1-x}\\right)=\\displaystyle\\sum_{n=0}^{\\infty}B_n x^n$ $(-1<x<1)$의 전개식에서 $B_5+B_8$의 값은?",
    options:[o("1","$\\dfrac{1}{4}$"),o("2","$\\dfrac{2}{5}$"),o("3","$\\dfrac{13}{20}$"),o("4","$\\dfrac{5}{8}$")],
    answer:2,
    explanation:"$\\ln\\!\\tfrac{1+x}{1-x}=2(x+\\tfrac{x^3}{3}+\\tfrac{x^5}{5}+\\cdots)$. $B_5=\\tfrac{2}{5},\\,B_8=0$. 합 $=\\dfrac{2}{5}$."
  }),
  build({ num:23, subject:"선형대수", unit:"벡터공간", concept:"부분공간 차원", difficulty:"medium",
    question:"$P_4(\\mathbb{R})$을 차수가 4 이하이고 실수계수를 가지는 다항식의 벡터공간이라 하고 $W=\\{p\\in P_4(\\mathbb{R}):p(x)=x^4 p(1/x)\\}$이라 할 때, $W$의 차원(dimension)은?",
    options:[o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")],
    answer:3,
    explanation:"조건: $p(x)$의 계수 대칭. $p=ax^4+bx^3+cx^2+bx+a$ → 자유도 3. 차원 3."
  }),
  build({ num:24, subject:"적분학", unit:"급수", concept:"등비미분합", difficulty:"medium",
    question:"$\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(n+1)^2}{3^n}$의 값은?",
    options:[o("1","$\\dfrac{8}{27}$"),o("2","$\\dfrac{1}{3}$"),o("3","$\\dfrac{7}{2}$"),o("4","$\\dfrac{9}{2}$")],
    answer:4,
    explanation:"$\\sum n^2 x^n=\\tfrac{x(1+x)}{(1-x)^3}$ 활용. $x=1/3$ 대입 후 $\\dfrac{9}{2}$."
  }),
  build({ num:25, subject:"적분학", unit:"이심률", concept:"이차곡선 이심률", difficulty:"medium",
    question:"$Q=\\{(x,y)\\in\\mathbb{R}^2:5x^2+2\\sqrt{2}xy+4y^2=1\\}$이라 하면 $Q$는 타원을 나타낸다. $Q$의 이심률(eccentricity)은?",
    options:[o("1","$\\dfrac{\\sqrt{2}}{5}$"),o("2","$\\dfrac{\\sqrt{2}}{4}$"),o("3","$\\dfrac{\\sqrt{2}}{3}$"),o("4","$\\dfrac{\\sqrt{2}}{2}$")],
    answer:4,
    explanation:"이차형식 행렬 $\\begin{pmatrix}5&\\sqrt 2\\\\\\sqrt 2&4\\end{pmatrix}$의 고유값 $3,6$. 이심률 $\\sqrt{1-1/2}=\\dfrac{\\sqrt 2}{2}$."
  }),
  build({ num:26, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"이항급수", difficulty:"medium",
    question:"$\\dfrac{1}{\\sqrt{1-x^2}}=\\displaystyle\\sum_{k=0}^{\\infty}A_k x^{2k}$ $(-1<x<1)$의 전개식에서 $\\dfrac{A_5}{A_4}$의 값은?",
    options:[o("1","$\\dfrac{7}{10}$"),o("2","$\\dfrac{9}{10}$"),o("3","$\\dfrac{11}{10}$"),o("4","$\\dfrac{13}{10}$")],
    answer:2,
    explanation:"이항급수: $A_k=\\binom{-1/2}{k}(-1)^k=\\dfrac{1\\cdot 3\\cdots(2k-1)}{2\\cdot 4\\cdots(2k)}$. 비 $\\dfrac{A_5}{A_4}=\\dfrac{9}{10}$."
  }),
  build({ num:27, subject:"적분학", unit:"이상적분", concept:"수렴/발산 판정", difficulty:"medium",
    question:"다음 중 발산하는 적분을 모두 고르면?\n\n(가) $\\displaystyle\\int_0^1\\dfrac{dx}{\\sqrt{1-x}}$\\quad (나) $\\displaystyle\\int_1^4\\dfrac{dx}{(x-2)^2}$\\quad (다) $\\displaystyle\\int_1^{\\infty}\\dfrac{dx}{\\sqrt{1+x^2}}$\\quad (라) $\\displaystyle\\int_1^{\\infty}\\dfrac{dx}{\\sqrt{2+x^3}}$",
    options:[o("1","(가), (나)"),o("2","(나), (다)"),o("3","(가), (라)"),o("4","(다), (라)")],
    answer:2,
    explanation:"(가) 수렴 ($\\sim 1/\\sqrt{1-x}$에서 지수 1/2). (나) 발산 ($x=2$ 특이점, 지수 2). (다) 발산 ($\\sim 1/x$). (라) 수렴 ($\\sim 1/x^{3/2}$). 발산: (나),(다)."
  }),
  build({ num:28, subject:"공학수학", unit:"미분방정식", concept:"2계 ODE(라플라스)", difficulty:"medium",
    question:"$h''(x)+2h'(x)-15h(x)=0,\\,h(0)=0,\\,h'(0)=-1$을 만족하는 함수 $h(x)$에 대하여 $h(-1)$의 값은?",
    options:[o("1","$\\dfrac{1}{8}(e^{-5}-e^3)$"),o("2","$\\dfrac{1}{8}(e^5-e^{-3})$"),o("3","$\\dfrac{1}{8}(e^5-e^3)$"),o("4","$\\dfrac{1}{8}(e^{-5}-e^{-3})$")],
    answer:2,
    explanation:"특성근 $r=-5,3$. $h(x)=\\tfrac{1}{8}(e^{-5x}-e^{3x})$. $h(-1)=\\tfrac{1}{8}(e^5-e^{-3})$."
  }),
  build({ num:29, subject:"미분학", unit:"도함수의 응용", concept:"점-곡선 거리", difficulty:"medium",
    question:"좌표평면에서 점 $(-1,1)$과 곡선 $xy=1$ 사이의 거리는?",
    options:[o("1","$\\sqrt{3}$"),o("2","$\\sqrt{5}$"),o("3","$\\sqrt{3}+1$"),o("4","$\\sqrt{5}+1$")],
    answer:1,
    explanation:"$(x,1/x)$와 $(-1,1)$ 거리 제곱 $f(x)=(x+1)^2+(1/x-1)^2$. 최소화: 임계점 $x^2+x-1=0$. 대입 후 $d=\\sqrt 3$."
  }),
  build({ num:30, subject:"다변수함수", unit:"중적분", concept:"변수치환", difficulty:"medium",
    question:"$P=\\{(x,y):0\\le x-y\\le\\pi,\\,0\\le x+2y\\le\\pi/2\\}$이라고 할 때, $\\displaystyle\\iint_P\\sin(x-y)\\cos(x+2y)\\,dx\\,dy$의 값은?",
    options:[o("1","$\\dfrac{1}{6}$"),o("2","$\\dfrac{1}{3}$"),o("3","$\\dfrac{1}{2}$"),o("4","$\\dfrac{2}{3}$")],
    answer:4,
    explanation:"$u=x-y,v=x+2y$ 치환, 야코비안 $1/3$. $\\tfrac{1}{3}\\!\\int_0^{\\pi}\\sin u\\,du\\!\\int_0^{\\pi/2}\\cos v\\,dv=\\tfrac{1}{3}\\cdot 2\\cdot 1=\\dfrac{2}{3}$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await sb.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
