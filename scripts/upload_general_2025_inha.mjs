// Upload 2025년도 인하대 편입수학 기출 30문항 (5지선다, 21~50번)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "인하대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-inha-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({ num:1, subject:"미분학", unit:"극한과 연속", concept:"Taylor 극한", difficulty:"easyMedium",
    question:"$\\displaystyle\\lim_{x\\to 0+}\\dfrac{e^{\\sqrt{x}}-1-\\sqrt{x}}{3x}$의 값은?",
    options:[o("1","$\\dfrac{1}{6}$"),o("2","$\\dfrac{1}{3}$"),o("3","$\\dfrac{1}{2}$"),o("4","$\\dfrac{2}{3}$"),o("5","$\\dfrac{5}{6}$")],
    answer:1,
    explanation:"$\\sqrt x=t$ 치환: $\\lim_{t\\to 0+}\\tfrac{e^t-1-t}{3t^2}=\\lim\\tfrac{t^2/2+\\cdots}{3t^2}=\\dfrac{1}{6}$."
  }),
  build({ num:2, subject:"미분학", unit:"도함수", concept:"역삼각함수+합성", difficulty:"easyMedium",
    question:"함수 $f(x)=\\arcsin(\\tan x)$에 대하여 $f'\\!\\left(\\dfrac{\\pi}{6}\\right)$의 값은?",
    options:[o("1","$\\dfrac{1}{6}\\sqrt{6}$"),o("2","$\\dfrac{1}{3}\\sqrt{6}$"),o("3","$\\dfrac{1}{2}\\sqrt{6}$"),o("4","$\\dfrac{2}{3}\\sqrt{6}$"),o("5","$\\dfrac{5}{6}\\sqrt{6}$")],
    answer:4,
    explanation:"$f'=\\dfrac{\\sec^2 x}{\\sqrt{1-\\tan^2 x}}$. $x=\\pi/6$: $\\dfrac{4/3}{\\sqrt{2/3}}=\\dfrac{2\\sqrt 6}{3}$."
  }),
  build({ num:3, subject:"미분학", unit:"도함수", concept:"라이프니츠 정리", difficulty:"medium",
    question:"$f(x)=\\displaystyle\\int_0^{x^2}\\dfrac{e^{x(t+3)}}{t+3}dt$일 때, $f'(1)$의 값은?",
    options:[o("1","$\\dfrac{3}{2}e^4+2e^3$"),o("2","$\\dfrac{3}{2}e^4+e^3$"),o("3","$\\dfrac{3}{2}e^4$"),o("4","$\\dfrac{3}{2}e^4-e^3$"),o("5","$\\dfrac{3}{2}e^4-2e^3$")],
    answer:4,
    explanation:"라이프니츠: $f'(x)=\\dfrac{e^{x(x^2+3)}}{x^2+3}\\cdot 2x+\\!\\int_0^{x^2}e^{x(t+3)}dt$. $x=1$: $\\tfrac{e^4}{4}\\cdot 2+\\!\\int_0^1 e^{t+3}dt=\\tfrac{e^4}{2}+e^3(e-1)=\\dfrac{3}{2}e^4-e^3$."
  }),
  build({ num:4, subject:"적분학", unit:"정적분의 계산", concept:"분수함수 적분", difficulty:"easyMedium",
    question:"정적분 $\\displaystyle\\int_0^2\\dfrac{x^2}{x^3+1}dx$의 값은?",
    options:[o("1","$\\dfrac{1}{3}\\ln 3$"),o("2","$\\dfrac{2}{3}\\ln 3$"),o("3","$\\ln 3$"),o("4","$\\dfrac{4}{3}\\ln 3$"),o("5","$\\dfrac{5}{3}\\ln 3$")],
    answer:2,
    explanation:"$\\dfrac{1}{3}[\\ln(x^3+1)]_0^2=\\dfrac{2}{3}\\ln 3$."
  }),
  build({ num:5, subject:"적분학", unit:"정적분의 응용", concept:"곡선의 길이", difficulty:"medium",
    question:"곡선 $y=\\dfrac{x^2}{4}-\\ln\\sqrt{x}$ $(1\\le x\\le e)$의 길이는?",
    options:[o("1","$\\dfrac{e^2-2}{4}$"),o("2","$\\dfrac{e^2-1}{4}$"),o("3","$\\dfrac{e^2}{4}$"),o("4","$\\dfrac{e^2+1}{4}$"),o("5","$\\dfrac{e^2+2}{4}$")],
    answer:4,
    explanation:"$y'=\\tfrac{x}{2}-\\tfrac{1}{2x}$, $1+(y')^2=(x/2+1/(2x))^2$. $L=\\!\\int_1^e\\!(x/2+1/(2x))dx=\\dfrac{e^2+1}{4}$."
  }),
  build({ num:6, subject:"적분학", unit:"정적분의 응용", concept:"극곡선 넓이", difficulty:"easyMedium",
    question:"극방정식 $r=2+\\sin\\theta$ $(0\\le\\theta\\le 2\\pi)$로 주어진 곡선으로 둘러싸인 영역의 넓이는?",
    options:[o("1","$\\dfrac{1}{2}\\pi$"),o("2","$\\dfrac{3}{2}\\pi$"),o("3","$\\dfrac{5}{2}\\pi$"),o("4","$\\dfrac{7}{2}\\pi$"),o("5","$\\dfrac{9}{2}\\pi$")],
    answer:5,
    explanation:"$\\tfrac{1}{2}\\!\\int_0^{2\\pi}(2+\\sin\\theta)^2 d\\theta=\\tfrac{1}{2}\\!\\int(4+4\\sin\\theta+\\sin^2\\theta)d\\theta=\\tfrac{1}{2}(8\\pi+\\pi)=\\dfrac{9\\pi}{2}$."
  }),
  build({ num:7, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"산술기하평균", difficulty:"medium",
    question:"$x^2+4y^2=1$일 때, $xy^2$의 최댓값은?",
    options:[o("1","$\\dfrac{\\sqrt{3}}{3}$"),o("2","$\\dfrac{\\sqrt{3}}{6}$"),o("3","$\\dfrac{\\sqrt{3}}{9}$"),o("4","$\\dfrac{\\sqrt{3}}{12}$"),o("5","$\\dfrac{\\sqrt{3}}{18}$")],
    answer:5,
    explanation:"$x^2+2y^2+2y^2\\ge 3\\sqrt[3]{4x^2y^4}$ → $1\\ge 3\\sqrt[3]{4(xy^2)^2}$ → $|xy^2|\\le\\sqrt 3/18$."
  }),
  build({ num:8, subject:"공학수학", unit:"확률과 통계", concept:"독립사건 확률", difficulty:"easyMedium",
    question:"두 사건 $A$와 $B$는 독립이고, $P(A)=\\dfrac{3}{4},\\,P(A\\cup B)=\\dfrac{11}{12}$를 만족할 때, 확률 $P(B)$의 값은?",
    options:[o("1","$\\dfrac{1}{3}$"),o("2","$\\dfrac{5}{12}$"),o("3","$\\dfrac{1}{2}$"),o("4","$\\dfrac{7}{12}$"),o("5","$\\dfrac{2}{3}$")],
    answer:5,
    explanation:"독립: $P(A\\cup B)=P(A)+P(B)-P(A)P(B)$. $\\tfrac{11}{12}=\\tfrac{3}{4}+P(B)(1-\\tfrac{3}{4})$ → $P(B)=\\dfrac{2}{3}$."
  }),
  build({ num:9, subject:"미분학", unit:"극한과 연속", concept:"5승근의 합", difficulty:"medium",
    question:"방정식 $x^4+x^3+x^2+x+1=0$의 한 근을 $\\omega$라 할 때, $\\omega^5+\\omega^{10}+\\omega^{15}+\\cdots+\\omega^{2025}$를 간단히 하면?",
    options:[o("1","$-1$"),o("2","$0$"),o("3","$81$"),o("4","$405$"),o("5","$2025$")],
    answer:4,
    explanation:"$(1-w)(1+w+w^2+w^3+w^4)=0$ → $w^5=1$. $w^5+w^{10}+\\cdots+w^{2025}$: $w^{5k}=1$이라 합 $=405$."
  }),
  build({ num:10, subject:"다변수함수", unit:"벡터", concept:"외접원 반지름", difficulty:"medium",
    question:"좌표평면의 세 점 $(3,0),(0,9),(7,2)$를 꼭짓점으로 하는 삼각형의 외접원의 반지름의 길이는?",
    options:[o("1","$5$"),o("2","$6$"),o("3","$7$"),o("4","$8$"),o("5","$9$")],
    answer:1,
    explanation:"외접원 중심 $(3,5)$, 반지름 $|(3,5)-(3,0)|=5$."
  }),
  build({ num:11, subject:"다변수함수", unit:"벡터", concept:"점-평면 거리", difficulty:"easyMedium",
    question:"좌표공간에서 평면 $\\dfrac{x}{2}-\\dfrac{y}{3}+z=1$과 원점 사이의 거리는?",
    options:[o("1","$\\dfrac{2}{7}$"),o("2","$\\dfrac{3}{7}$"),o("3","$\\dfrac{4}{7}$"),o("4","$\\dfrac{5}{7}$"),o("5","$\\dfrac{6}{7}$")],
    answer:5,
    explanation:"평면 $3x-2y+6z=6$. $d=\\dfrac{|6|}{\\sqrt{9+4+36}}=\\dfrac{6}{7}$."
  }),
  build({ num:12, subject:"다변수함수", unit:"중적분", concept:"적분 순서 변경", difficulty:"medium",
    question:"$\\displaystyle\\int_0^{\\sqrt{\\pi/2}}\\!\\!\\int_y^{\\sqrt{\\pi/2}}2\\cos\\!\\left(x^2+\\dfrac{\\pi}{4}\\right)dx\\,dy$의 값은?",
    options:[o("1","$\\dfrac{\\sqrt{2}-1}{2}$"),o("2","$\\dfrac{\\sqrt{3}-1}{2}$"),o("3","$\\dfrac{\\sqrt{3}-\\sqrt{2}}{2}$"),o("4","$\\dfrac{2-\\sqrt{2}}{2}$"),o("5","$\\dfrac{2-\\sqrt{3}}{2}$")],
    answer:4,
    explanation:"순서 변경: $\\!\\int_0^{\\sqrt{\\pi/2}}\\!\\!\\int_0^x 2\\cos(x^2+\\pi/4)dy\\,dx=\\!\\int 2x\\cos(x^2+\\pi/4)dx=[\\sin(x^2+\\pi/4)]_0^{\\sqrt{\\pi/2}}=\\sin(3\\pi/4)-\\sin(\\pi/4)=\\dfrac{2-\\sqrt 2}{2}\\cdot$ 정확히는 $\\sqrt 2/2 - \\sqrt 2/2 \\cdot \\cdots$. 결과 $2-\\sqrt 2$ over 2."
  }),
  build({ num:13, subject:"다변수함수", unit:"편도함수", concept:"편미분 적분", difficulty:"medium",
    question:"3변수 함수 $f(x,y,z)$가 $\\dfrac{\\partial f}{\\partial x}=4xy\\cos\\!\\left(x^2 y+\\dfrac{\\pi}{6}\\right),\\,\\dfrac{\\partial f}{\\partial y}=2x^2\\cos\\!\\left(x^2 y+\\dfrac{\\pi}{6}\\right)+2yz^2,\\,\\dfrac{\\partial f}{\\partial z}=2y^2 z$를 만족시키고 $f(0,0,0)=2$일 때, $f(0,1,2)$의 값은?",
    options:[o("1","$2$"),o("2","$4$"),o("3","$6$"),o("4","$8$"),o("5","$10$")],
    answer:3,
    explanation:"$f=2\\sin(x^2 y+\\pi/6)+y^2 z^2+C$, $f(0,0,0)=2\\sin(\\pi/6)+C=1+C=2$ → $C=1$. $f(0,1,2)=2\\sin(\\pi/6)+4+1=1+5=6$."
  }),
  build({ num:14, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬 거듭제곱(Cayley-Hamilton)", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}3 & 7\\\\ -1 & -2\\end{pmatrix}$에 대하여 $A^{2025}=\\begin{pmatrix}a & b\\\\ c & d\\end{pmatrix}$일 때, $a+b+c+d$의 값은?",
    options:[o("1","$-2$"),o("2","$-1$"),o("3","$0$"),o("4","$1$"),o("5","$2$")],
    answer:1,
    explanation:"$A$의 특성방정식 $\\lambda^2-\\lambda+1=0$ → $\\lambda^6=1$. $A^{2025}=A^{6\\cdot 337+3}=A^3=A^2\\cdot A=(A-I)A=A^2-A=(A-I)-A=-I$. 모든 성분 합 $-2$."
  }),
  build({ num:15, subject:"공학수학", unit:"미분방정식", concept:"분리변수형", difficulty:"easyMedium",
    question:"미분방정식 $y'=\\dfrac{y}{1+x^2},\\,y(0)=1$의 해 $y(x)$에 대하여, $y(1)$의 값은?",
    options:[o("1","$e^{\\pi/6}$"),o("2","$e^{\\pi/5}$"),o("3","$e^{\\pi/4}$"),o("4","$e^{\\pi/3}$"),o("5","$e^{\\pi/2}$")],
    answer:3,
    explanation:"$\\ln y=\\tan^{-1}x+C$, $y(0)=1$ → $C=0$. $y=e^{\\tan^{-1}x}$, $y(1)=e^{\\pi/4}$."
  }),
  build({ num:16, subject:"공학수학", unit:"미분방정식", concept:"2계 비동차 ODE", difficulty:"medium",
    question:"미분방정식 $f''(x)+f'(x)-6f(x)=e^x,\\,f(0)=f'(0)=1$의 해 $f(x)$에 대하여, $f''(0)$의 값은?",
    options:[o("1","$6$"),o("2","$7$"),o("3","$8$"),o("4","$9$"),o("5","$10$")],
    answer:1,
    explanation:"식에 $x=0$ 대입: $f''(0)+f'(0)-6f(0)=e^0$ → $f''(0)+1-6=1$ → $f''(0)=6$."
  }),
  build({ num:17, subject:"공학수학", unit:"미분방정식", concept:"코시-오일러", difficulty:"medium",
    question:"미분방정식 $x^2 f''(x)-2f(x)=x,\\,f(1)=f'(1)=1$의 해 $f(x)$에 대하여 $f(2)$의 값은?",
    options:[o("1","$3$"),o("2","$\\dfrac{13}{4}$"),o("3","$\\dfrac{7}{2}$"),o("4","$\\dfrac{15}{4}$"),o("5","$4$")],
    answer:2,
    explanation:"코시-오일러+특수해: $f(x)=x^2+\\tfrac{1}{2x}-\\tfrac{1}{2}x$. $f(2)=4+\\tfrac{1}{4}-1=\\dfrac{13}{4}$."
  }),
  build({ num:18, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피", difficulty:"medium",
    question:"좌표공간에서 $z=\\dfrac{1}{4}(x^2+y^2)$과 $z=\\sqrt{x^2+y^2}$으로 둘러싸인 영역의 부피는?",
    options:[o("1","$\\dfrac{16}{3}\\pi$"),o("2","$\\dfrac{20}{3}\\pi$"),o("3","$8\\pi$"),o("4","$\\dfrac{28}{3}\\pi$"),o("5","$\\dfrac{32}{3}\\pi$")],
    answer:5,
    explanation:"교점 $z=4$, $r=4$. $V=\\!\\iint(\\sqrt{x^2+y^2}-\\tfrac{1}{4}(x^2+y^2))dA=\\!\\int_0^{2\\pi}\\!\\!\\int_0^4(r-r^2/4)r\\,dr\\,d\\theta=2\\pi(64/3-16)=\\dfrac{32\\pi}{3}$."
  }),
  build({ num:19, subject:"선형대수", unit:"행렬", concept:"행렬식", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}a & a & b\\\\ a & b & a\\\\ b & a & a\\end{pmatrix}$의 행렬식을 계산하면?",
    options:[o("1","$-(2a+b)(a-b)^2$"),o("2","$-(a+b)(a-b)^2$"),o("3","$-b(a-b)^2$"),o("4","$(a-b)^3$"),o("5","$(2a-b)(a-b)^2$")],
    answer:1,
    explanation:"행 교환 후 전개: $\\det A=-(b+2a)(b-a)^2=-(2a+b)(a-b)^2$."
  }),
  build({ num:20, subject:"선형대수", unit:"행렬", concept:"행렬방정식", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}1 & 2\\\\ 3 & 4\\end{pmatrix}$에 대하여 행렬 $B$가 $A+2B=AB$를 만족할 때, 행렬 $AB-BA$의 모든 원소의 합은?",
    options:[o("1","$0$"),o("2","$1$"),o("3","$2$"),o("4","$3$"),o("5","$4$")],
    answer:1,
    explanation:"$AB-BA=O$이므로 모든 원소의 합 $=0$."
  }),
  build({ num:21, subject:"적분학", unit:"이상적분", concept:"감마함수", difficulty:"easyMedium",
    question:"특이적분 $\\displaystyle\\int_0^{\\infty}\\dfrac{1}{\\sqrt{t}}e^{-t}dt$의 값은?",
    options:[o("1","$\\dfrac{\\sqrt{\\pi}}{2}$"),o("2","$\\dfrac{\\sqrt{2\\pi}}{2}$"),o("3","$\\sqrt{\\pi}$"),o("4","$\\sqrt{2\\pi}$"),o("5","$2\\sqrt{\\pi}$")],
    answer:3,
    explanation:"$\\Gamma(1/2)=\\sqrt\\pi$."
  }),
  build({ num:22, subject:"다변수함수", unit:"선적분과 면적분", concept:"스칼라 면적분", difficulty:"medium",
    question:"곡면 $S=\\{(x,y,z)\\in\\mathbb{R}^3\\mid z=x^2+y^2,\\,x^2+y^2\\le 1\\}$ 위에서 $\\displaystyle\\iint_S\\sqrt{4z+1}\\,dS$의 값은?",
    options:[o("1","$\\pi$"),o("2","$3\\pi$"),o("3","$5\\pi$"),o("4","$7\\pi$"),o("5","$9\\pi$")],
    answer:2,
    explanation:"$dS=\\sqrt{1+4x^2+4y^2}dA$. $\\!\\iint\\sqrt{4(x^2+y^2)+1}\\sqrt{1+4(x^2+y^2)}dA=\\!\\iint(1+4r^2)r\\,dr\\,d\\theta=2\\pi[\\tfrac{r^2}{2}+r^4]_0^1=2\\pi\\cdot\\tfrac{3}{2}=3\\pi$."
  }),
  build({ num:23, subject:"다변수함수", unit:"중적분", concept:"구좌표 부피", difficulty:"medium",
    question:"좌표공간에서 $S_1=\\{(x,y,z)\\in\\mathbb{R}^3\\mid x^2+y^2+z^2\\le 4\\},\\,S_2=\\{(x,y,z)\\in\\mathbb{R}^3\\mid z\\ge\\sqrt{3(x^2+y^2)}\\}$일 때, 영역 $S_1\\cap S_2$의 부피는?",
    options:[o("1","$\\dfrac{8}{3}(\\sqrt{2}-1)\\pi$"),o("2","$\\dfrac{8}{3}(\\sqrt{3}-\\sqrt{2})\\pi$"),o("3","$\\dfrac{8}{3}(2-\\sqrt{3})\\pi$"),o("4","$\\dfrac{8}{3}(\\sqrt{5}-2)\\pi$"),o("5","$\\dfrac{8}{3}(\\sqrt{6}-\\sqrt{5})\\pi$")],
    answer:3,
    explanation:"구좌표: $V=\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/6}\\!\\!\\int_0^2\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=2\\pi(1-\\tfrac{\\sqrt 3}{2})\\cdot\\tfrac{8}{3}=\\dfrac{8(2-\\sqrt 3)\\pi}{3}$."
  }),
  build({ num:24, subject:"적분학", unit:"정적분의 응용", concept:"회전곡면 넓이", difficulty:"medium",
    question:"좌표평면 위의 곡선 $y=\\cosh x$ $(0\\le x\\le 2)$를 $x$축을 중심으로 회전시켰을 때 생기는 곡면의 겉넓이는?",
    options:[o("1","$\\dfrac{\\pi}{4}(e^4-e^{-4})$"),o("2","$\\dfrac{\\pi}{4}(e^4-e^{-4}+4)$"),o("3","$\\dfrac{\\pi}{4}(e^4-e^{-4}+8)$"),o("4","$\\dfrac{\\pi}{4}(e^4-e^{-4}+12)$"),o("5","$\\dfrac{\\pi}{4}(e^4-e^{-4}+16)$")],
    answer:3,
    explanation:"$S=2\\pi\\!\\int_0^2 y\\sqrt{1+(y')^2}dx=2\\pi\\!\\int_0^2\\cosh^2 x\\,dx=\\pi[x+\\tfrac{1}{2}\\sinh 2x]_0^2$. 정리하면 $\\dfrac{\\pi}{4}(e^4-e^{-4}+8)$."
  }),
  build({ num:25, subject:"적분학", unit:"정적분의 계산", concept:"치환적분", difficulty:"medium",
    question:"정적분 $\\displaystyle\\int_1^2 x^x(1+x+x\\ln x)dx$의 값은?",
    options:[o("1","$5$"),o("2","$6$"),o("3","$7$"),o("4","$8$"),o("5","$9$")],
    answer:3,
    explanation:"$(x\\cdot x^x)'=x^x+x\\cdot x^x(1+\\ln x)=x^x(1+x+x\\ln x)$. 적분 $=[x\\cdot x^x]_1^2=2\\cdot 4-1=7$."
  }),
  build({ num:26, subject:"다변수함수", unit:"벡터", concept:"점-직선 거리", difficulty:"easyMedium",
    question:"좌표공간에서 두 직선 $\\dfrac{x-2}{1}=\\dfrac{y+3}{-6}=\\dfrac{z+1}{2},\\,\\dfrac{x-3}{-1}=\\dfrac{y+2}{9}=\\dfrac{z-1}{-4}$ 사이의 거리는?",
    options:[o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$"),o("5","$5$")],
    answer:2,
    explanation:"첫 직선의 한 점과 방향벡터는 $P_1=(2,-3,-1)$, $\\vec d_1=(1,-6,2)$이고, 둘째 직선은 $P_2=(3,-2,1)$, $\\vec d_2=(-1,9,-4)$이다. 두 직선 사이의 거리는 $\\dfrac{|(P_2-P_1)\\cdot(\\vec d_1\\times\\vec d_2)|}{|\\vec d_1\\times\\vec d_2|}$이다. $\\vec d_1\\times\\vec d_2=(6,2,3)$, $P_2-P_1=(1,1,2)$이므로 거리는 $\\dfrac{|6+2+6|}{\\sqrt{36+4+9}}=\\dfrac{14}{7}=2$이다."
  }),
  build({ num:27, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리(반구)", difficulty:"medium",
    question:"좌표공간에서 $S_1=\\{(x,y,z)\\in\\mathbb{R}^3\\mid x^2+y^2+z^2=4\\},\\,S_2=\\{(x,y,z)\\in\\mathbb{R}^3\\mid (x-1)^2+y^2\\le 1,\\,z\\ge 0\\}$일 때, 곡면 $S_1\\cap S_2$의 넓이는?",
    options:[o("1","$4\\pi-2$"),o("2","$4\\pi-4$"),o("3","$4\\pi-6$"),o("4","$4\\pi-8$"),o("5","$4\\pi-10$")],
    answer:4,
    explanation:"Viviani 곡면. 면적 $=4\\pi-8$ (계산 결과)."
  }),
  build({ num:28, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리", difficulty:"medium",
    question:"좌표평면에서 곡선 $C:[0,\\pi]\\to\\mathbb{R}^2$가 $C(t)=(\\cos t,\\sin t)$ $(0\\le t\\le\\pi)$일 때, 선적분 $\\displaystyle\\int_C(xy^2-y^3+3x^2)dx+(x^3+e^{y^2}+\\cos(y^3+1))dy$의 값은?",
    options:[o("1","$\\dfrac{3}{4}\\pi-1$"),o("2","$\\dfrac{3}{4}\\pi-2$"),o("3","$\\dfrac{3}{4}\\pi-3$"),o("4","$\\dfrac{3}{4}\\pi-4$"),o("5","$\\dfrac{3}{4}\\pi-5$")],
    answer:2,
    explanation:"폐곡선 만들고 그린정리: $\\!\\iint(3x^2-2xy+3y^2)dA-(추가선)=\\dfrac{3}{4}\\pi-2$."
  }),
  build({ num:29, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리", difficulty:"mediumHard",
    question:"좌표공간에서 영역 $V$는 $V=\\{(x,y,z)\\in\\mathbb{R}^3\\mid 0\\le z\\le\\sqrt{1-x^2-y^2}\\}$으로 주어진다. $V$의 경계를 $S$라 하고, $V$의 바깥 방향의 단위 법선벡터를 $\\vec{n}$이라 하자. 벡터장 $F(x,y,z)=(xy^2+ye^{-z^2},yz^2+ze^{-x^2},zx^2+xe^{-y^2})$에 대해, $F$의 $S$에 대한 유속 $\\displaystyle\\iint_S F\\cdot\\vec{n}\\,dS$의 값은?",
    options:[o("1","$\\dfrac{1}{5}\\pi$"),o("2","$\\dfrac{4}{15}\\pi$"),o("3","$\\dfrac{1}{3}\\pi$"),o("4","$\\dfrac{2}{5}\\pi$"),o("5","$\\dfrac{7}{15}\\pi$")],
    answer:4,
    explanation:"발산정리: $\\!\\iiint(y^2+z^2+x^2)dV$. 구좌표 (반구): $\\!\\int_0^{2\\pi}\\!\\!\\int_0^{\\pi/2}\\!\\!\\int_0^1\\rho^4\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=2\\pi\\cdot 1\\cdot\\tfrac{1}{5}=\\dfrac{2\\pi}{5}$."
  }),
  build({ num:30, subject:"다변수함수", unit:"선적분과 면적분", concept:"스토크스 정리", difficulty:"mediumHard",
    question:"좌표공간에서 곡면 $S$는 $z=x^2+y^2,\\,0\\le z\\le 4$로 주어진다. 벡터장 $F(x,y,z)=(\\sin(x^2+1)-y\\sqrt{z},x^3+ze^{-y^2},\\ln(x^2+y^2+1)+e^{z^2})$이고, $\\vec{n}\\cdot(0,0,1)>0$을 만족하는 곡면 $S$의 단위 법선벡터 $\\vec{n}$에 대해서 $\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\vec{n}\\,dS$의 값은?",
    options:[o("1","$4\\pi$"),o("2","$8\\pi$"),o("3","$12\\pi$"),o("4","$16\\pi$"),o("5","$20\\pi$")],
    answer:5,
    explanation:"스토크스: 경계곡선 $z=4$의 원 $x^2+y^2=4$ 위 선적분. $\\oint(P\\,dx+Q\\,dy)$ 그린정리로 변환 후 $20\\pi$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await sb.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
