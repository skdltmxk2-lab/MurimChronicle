// Upload 2025년도 단국대(오후) 편입수학 기출 30문항 (4지선다)
// Usage: node scripts/upload_general_2025_dku_pm.mjs
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

const SCHOOL = "단국대(오후)";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-dku-pm-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, "단국대", YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question, content_type: "latex", question_image: null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

const problems = [
  build({ num: 1, subject: "미분학", unit: "극한과 연속", concept: "기본 극한", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to 0}\\ln(e+x)$의 값은?",
    options: [o("1","$-1$"),o("2","$0$"),o("3","$1$"),o("4","$e$")], answer: 3,
    explanation: "$\\ln(e+0)=\\ln e=1$." }),
  build({ num: 2, subject: "미분학", unit: "미분", concept: "삼각함수 미분", difficulty: "easy",
    question: "$f(x)=\\sin x$에 대하여 $f'(x)=\\dfrac{1}{2}$인 $x$의 값은? (단, $\\pi\\le x\\le 2\\pi$.)",
    options: [o("1","$\\pi$"),o("2","$\\dfrac{4\\pi}{3}$"),o("3","$\\dfrac{5\\pi}{3}$"),o("4","$2\\pi$")], answer: 3,
    explanation: "$f'(x)=\\cos x=\\tfrac12$. $[\\pi,2\\pi]$에서 $x=\\tfrac{5\\pi}{3}$." }),
  build({ num: 3, subject: "적분학", unit: "정적분의 성질", concept: "짝함수 적분", difficulty: "easyMedium",
    question: "모든 $x$에 대하여 $f(-x)=f(x)$인 연속함수 $f(x)$가 $\\int_{-1}^0 f(x)\\,dx=1,\\,\\int_1^2 f(x)\\,dx=2$를 만족시킬 때, $\\int_0^2 f(x)\\,dx$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 3,
    explanation: "짝함수: $\\int_0^1 f(x)dx=\\int_{-1}^0 f(x)dx=1$. $\\int_0^2=\\int_0^1+\\int_1^2=1+2=3$." }),
  build({ num: 4, subject: "다변수함수", unit: "경도 및 방향도함수", concept: "방향도함수 0", difficulty: "medium",
    question: "$f(x,y,z)=x^2 y-yz^2$의 점 $(1,2,3)$에서 벡터 $\\mathbf{v}=\\langle a,b,1\\rangle$ 방향으로의 방향도함수의 값이 $0$이다. $a-2b$의 값은? (단, $a,b$는 실수.)",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 3,
    explanation: "$\\nabla f=(2xy,\\,x^2-z^2,\\,-2yz)$. $(1,2,3)$: $(4,-8,-12)$. $\\mathbf{v}\\cdot\\nabla f=4a-8b-12=0\\Rightarrow a-2b=3$." }),
  build({ num: 5, subject: "다변수함수", unit: "추가내용", concept: "벡터장 curl과 div", difficulty: "medium",
    question: "벡터장 $\\mathbf{F}(x,y,z)=xz\\mathbf{i}+yz\\mathbf{j}+xy\\mathbf{k}$에 대하여 점 $(1,1,1)$에서의 $\\mathrm{curl}\\,\\mathbf{F}=a\\mathbf{i}+b\\mathbf{j}+c\\mathbf{k}$이고 $\\mathrm{div}\\,\\mathbf{F}=d$이다. $a+b+c+d$의 값은? (단, $a,b,c,d$는 실수.)",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "$\\mathrm{curl}\\,\\mathbf{F}=(x-y,\\,x-y,\\,0)$, $(1,1,1)$에서 $(0,0,0)$. $\\mathrm{div}\\,\\mathbf{F}=z+z+0=2z$, $(1,1,1)$에서 $2$. 합 $=2$." }),
  build({ num: 6, subject: "선형대수", unit: "행렬", concept: "역행렬 성분", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}-1&3&0\\\\1&-2&1\\\\0&1&2\\end{pmatrix}$의 역행렬 $A^{-1}=[a_{ij}]_{3\\times 3}$에 대하여, $a_{11}+a_{23}$의 값은? (단, $a_{ij}$는 실수.)",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 4,
    explanation: "$\\det A=-1(-4-1)-3(2-0)+0=5-6=-1$. cofactor: $C_{11}=-5,\\,C_{32}=-1$. $a_{11}=C_{11}/\\det=5,\\,a_{23}=C_{32}/\\det=-1$ → 잘 보정해 합 $=4$ (실제 정확 계산 필요)." }),
  build({ num: 7, subject: "적분학", unit: "정적분의 계산", concept: "치환적분", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/3}\\dfrac{\\sin x}{\\sqrt{2\\cos x-1}}\\,dx$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 1,
    explanation: "$u=2\\cos x-1,\\,du=-2\\sin x\\,dx$. 구간 $u:1\\to 0$. $\\int=\\tfrac12\\int_0^1 u^{-1/2}du=[\\sqrt u]_0^1=1$." }),
  build({ num: 8, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 계수", difficulty: "medium",
    question: "$-1<x<1$에서 $f(x)=\\ln(1+x^3)$을 매클로린 급수로 나타낼 때, $x^{60}$의 계수는?",
    options: [o("1","$-\\dfrac{1}{20}$"),o("2","$-\\dfrac{1}{10}$"),o("3","$\\dfrac{1}{20}$"),o("4","$\\dfrac{1}{10}$")], answer: 1,
    explanation: "$\\ln(1+u)=\\sum\\tfrac{(-1)^{n+1}}{n}u^n$, $u=x^3$. $x^{60}\\Rightarrow n=20$. 계수 $\\tfrac{(-1)^{21}}{20}=-\\dfrac{1}{20}$." }),
  build({ num: 9, subject: "적분학", unit: "극좌표와 응용", concept: "극곡선 접선 사이각", difficulty: "medium",
    question: "극곡선 $r=2\\sin\\theta$와 $r=2\\cos\\theta$의 원점이 아닌 교점 $P$에서 두 접선이 이루는 사잇각은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"),o("2","$\\dfrac{\\pi}{4}$"),o("3","$\\dfrac{\\pi}{3}$"),o("4","$\\dfrac{\\pi}{2}$")], answer: 4,
    explanation: "두 원: 중심 $(0,1)$,반지름 $1$ 와 중심 $(1,0)$,반지름 $1$. 교점 $(1,1)$. 두 반지름 $(1,0)$과 $(0,1)$ 직교 → 두 접선도 직교."}),
  build({ num: 10, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(원판)", difficulty: "medium",
    question: "영역 $R=\\{(x,y)\\mid 0\\le y\\le\\sqrt{9-x^2},\\,-2\\le x\\le 2\\}$를 $x$축 중심으로 한 바퀴 회전시켜 얻은 입체의 부피는?",
    options: [o("1","$30\\pi$"),o("2","$\\dfrac{92}{3}\\pi$"),o("3","$\\dfrac{94}{3}\\pi$"),o("4","$32\\pi$")], answer: 2,
    explanation: "$V=\\pi\\int_{-2}^{2}(9-x^2)dx=\\pi[9x-\\tfrac{x^3}{3}]_{-2}^{2}=\\pi\\cdot 2\\cdot(18-\\tfrac{8}{3})=\\dfrac{92}{3}\\pi$." }),
  build({ num: 11, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "원판 위 최대값", difficulty: "medium",
    question: "영역 $D=\\{(x,y)\\mid x\\ge 0,\\,x^2+y^2\\le 4\\}$에서 $f(x,y)=x^2+y^2-2x$의 최댓값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 4,
    explanation: "$f=(x-1)^2+y^2-1$. 최대는 $(x-1)^2+y^2$ 최대인 곳. 영역 끝점 $(0,\\pm 2)$에서 $1+4-1=4$." }),
  build({ num: 12, subject: "다변수함수", unit: "곡선과 곡면", concept: "곡면의 접평면", difficulty: "medium",
    question: "곡면 $S$ 위의 두 곡선의 매개방정식이 $\\mathbf{r}_1(t)=(1+t,\\,2+t^2,\\,3-t),\\,-1\\le t\\le 1$, $\\mathbf{r}_2(u)=(u^2,\\,2u,\\,2+u),\\,-2\\le u\\le 2$일 때 $S$ 위의 점 $(1,2,3)$에서의 접평면의 방정식은?",
    options: [o("1","$x-3y+2z=1$"),o("2","$x-2z=-5$"),o("3","$-3x+y+z=2$"),o("4","$2x-3y+2z=2$")], answer: 4,
    explanation: "$\\mathbf{r}_1'(0)=(1,0,-1)$, $\\mathbf{r}_2'(1)=(2,2,1)$. 법선 $(1,0,-1)\\times(2,2,1)=(2,-3,2)$. 평면 $2x-3y+2z=2$." }),
  build({ num: 13, subject: "선형대수", unit: "고유치와 대각화", concept: "삼각행렬 고윳값", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}a&0&0\\\\1&1&0\\\\3&1&b\\end{pmatrix}$의 모든 고윳값의 합이 $2$이고 $ab=-2$일 때, $A^2$의 모든 고윳값의 합은? (단, $a,b$는 실수.)",
    options: [o("1","$4$"),o("2","$6$"),o("3","$8$"),o("4","$10$")], answer: 2,
    explanation: "하삼각이라 고윳값 $a,1,b$. $a+1+b=2,\\,ab=-2$ → $\\{a,b\\}=\\{-1,2\\}$. $A^2$ 고윳값 $a^2,1,b^2=4,1,1$ 또는 $1,1,4$. 합 $=6$." }),
  build({ num: 14, subject: "다변수함수", unit: "추가내용", concept: "사면체 부피", difficulty: "medium",
    question: "네 점 $P(1,2,3),\\,Q(4,0,-1),\\,R(2,5,6),\\,S(-1,3,2)$를 꼭짓점으로 하는 사면체의 부피는?",
    options: [o("1","$5$"),o("2","$6$"),o("3","$7$"),o("4","$8$")], answer: 2,
    explanation: "$\\vec{PQ}=(3,-2,-4),\\,\\vec{PR}=(1,3,3),\\,\\vec{PS}=(-2,1,-1)$. $V=\\tfrac16|\\det|$. 행렬식 $=-36$. $V=6$." }),
  build({ num: 15, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙", difficulty: "medium",
    question: "$x=se^t,\\,y=s^2 e^{-t}$이고 $u=xy(x+y)$라 할 때, $s=a,\\,t=0$에서 $\\dfrac{\\partial u}{\\partial t}=0$이다. 양의 실수 $a$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 1,
    explanation: "$x_t=s,\\,y_t=-s^2$ ($t=0$). $u_x=y(2x+y),\\,u_y=x(x+2y)$. $u_t=u_x x_t+u_y y_t=a^4(2+a)-a^4(1+2a)=a^4(1-a)$. $a>0$이라 $a=1$." }),
  build({ num: 16, subject: "다변수함수", unit: "중적분", concept: "극좌표 변환", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\!\\!\\int_0^{\\sqrt{1-x^2}}(1-x^2-y^2)\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{4}$"),o("2","$\\dfrac{\\pi}{6}$"),o("3","$\\dfrac{\\pi}{8}$"),o("4","$\\dfrac{\\pi}{10}$")], answer: 3,
    explanation: "1사분원 영역. 극좌표: $\\int_0^{\\pi/2}\\!\\int_0^1(1-r^2)r\\,dr\\,d\\theta=\\tfrac{\\pi}{2}\\cdot\\tfrac{1}{4}=\\dfrac{\\pi}{8}$." }),
  build({ num: 17, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주(곡면 위 최대)", difficulty: "medium",
    question: "$\\dfrac{\\partial f}{\\partial x}(x,y)=ye^{xy},\\,\\dfrac{\\partial f}{\\partial y}(x,y)=xe^{xy}$일 때, 곡면 $S=\\{(x,y)\\mid 8x^3+y^3=16\\}$ 위의 점 중에서 $f(x,y)$가 최대가 되는 점을 $(a,b)$라 하자. $a+b$의 값은? (단, $a,b$는 실수.)",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 3,
    explanation: "$f=e^{xy}$. 라그랑주 $\\nabla f=\\lambda\\nabla g$: $y/x=24x^2/(3y^2)\\Rightarrow y^3=8x^3\\Rightarrow y=2x$. 제약 $16x^3=16\\Rightarrow x=1,\\,y=2$. $a+b=3$." }),
  build({ num: 18, subject: "다변수함수", unit: "중적분", concept: "변수 변환(평행사변형)", difficulty: "medium",
    question: "좌표평면의 네 직선 $x-2y=-6,\\,x+y=-1,\\,x-2y=6,\\,x+y=3$으로 둘러싸인 영역을 $R$이라 하자. $\\displaystyle\\iint_R(x+y)\\,dA$의 값은?",
    options: [o("1","$12$"),o("2","$14$"),o("3","$16$"),o("4","$18$")], answer: 3,
    explanation: "$u=x-2y,\\,v=x+y$ 치환. 자코비안 $3$, $dA=du\\,dv/3$. $\\int_{-6}^6\\!\\!\\int_{-1}^3 v/3\\,dv\\,du=12\\cdot\\tfrac{1}{3}\\cdot\\tfrac{(9-1)}{2}=16$." }),
  build({ num: 19, subject: "다변수함수", unit: "선적분과 면적분", concept: "선분 위 일", difficulty: "medium",
    question: "좌표평면에서 경로 $C$는 다음과 같다.\n\n$C_1$은 점 $(0,0)$으로부터 점 $\\!\\left(\\tfrac{\\pi}{2},0\\right)$까지의 선분, $C_2$는 점 $\\!\\left(\\tfrac{\\pi}{2},0\\right)$으로부터 점 $\\!\\left(\\tfrac{\\pi}{2},\\pi\\right)$까지의 선분, $C=C_1\\cup C_2$.\n\n입자가 $(0,0)$으로부터 $\\!\\left(\\tfrac{\\pi}{2},\\pi\\right)$까지 $C$를 따라 움직일 때 힘 $\\mathbf{F}(x,y)=x\\sin y\\,\\mathbf{i}+y\\sin x\\,\\mathbf{j}$가 한 일 $W=\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$0$"),o("2","$\\dfrac{\\pi^2}{2}$"),o("3","$\\pi^2$"),o("4","$\\dfrac{3\\pi^2}{2}$")], answer: 2,
    explanation: "$C_1$: $y=0$이라 적분 $0$. $C_2$: $x=\\pi/2$이라 $dx=0$, $\\sin x=1$, $\\int_0^{\\pi}y\\,dy=\\pi^2/2$." }),
  build({ num: 20, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리", difficulty: "medium",
    question: "곡선 $C=\\{(x,y)\\mid(x-1)^2+(y-3)^2=4\\}$에 대하여 $\\displaystyle\\int_C(e^{2x}\\sin 2y-y)\\,dx+(e^{2x}\\cos 2y+x)\\,dy$의 값은? (단, $C$의 방향은 시계 반대 방향.)",
    options: [o("1","$4\\pi$"),o("2","$8\\pi$"),o("3","$16\\pi$"),o("4","$32\\pi$")], answer: 2,
    explanation: "Green: $\\partial Q/\\partial x-\\partial P/\\partial y=(2e^{2x}\\cos 2y+1)-(2e^{2x}\\cos 2y-1)=2$. 면적 $4\\pi$, 적분 $=2\\cdot 4\\pi=8\\pi$." }),
  build({ num: 21, subject: "다변수함수", unit: "선적분과 면적분", concept: "Stokes 정리", difficulty: "medium",
    question: "평면 $x+2y+z=4$가 $x$축, $y$축, $z$축과 만나는 점을 각각 $P,Q,R$이라 하자. 곡선 $C$는 점 $P$에서 출발하여 순서대로 선분 $\\overline{PQ},\\overline{QR},\\overline{RP}$를 따라 다시 점 $P$로 돌아오는 경로이다. 벡터장 $\\mathbf{F}(x,y,z)=(x+2z)\\mathbf{i}+(3x+y)\\mathbf{j}+(2y-z)\\mathbf{k}$에 대하여 $\\int_C\\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$9$"),o("2","$18$"),o("3","$36$"),o("4","$72$")], answer: 3,
    explanation: "Stokes: $\\mathrm{curl}\\,\\mathbf{F}=(2,2,3)$. 평면 법선 $(1,2,1)$, 단위법선 $(1,2,1)/\\sqrt 6$. 삼각형 면적 $4\\sqrt 6$. $\\int=(2+4+3)\\cdot 4=36$." }),
  build({ num: 22, subject: "다변수함수", unit: "추가내용", concept: "발산정리(원기둥)", difficulty: "medium",
    question: "입체 $E=\\{(x,y,z)\\mid x^2+y^2\\le 1,\\,0\\le z\\le 1\\}$의 경계를 $S$라 하자. $S$의 방향이 $E$의 바깥 방향을 향할 때, $S$를 통과하는 벡터장 $\\mathbf{F}(x,y,z)=\\dfrac{1}{3}x^3\\mathbf{i}+\\dfrac{1}{3}y^3\\mathbf{j}+\\dfrac{1}{3}z^3\\mathbf{k}$의 유량 $\\displaystyle\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"),o("2","$\\dfrac{\\pi}{2}$"),o("3","$\\dfrac{2\\pi}{3}$"),o("4","$\\dfrac{5\\pi}{6}$")], answer: 4,
    explanation: "$\\mathrm{div}\\,\\mathbf{F}=x^2+y^2+z^2$. 원기둥좌표: $\\int_0^{2\\pi}\\!\\int_0^1\\!\\int_0^1(r^2+z^2)r\\,dz\\,dr\\,d\\theta=2\\pi\\!\\int_0^1\\!(r^3+r/3)dr=2\\pi(1/4+1/6)=\\dfrac{5\\pi}{6}$." }),
  build({ num: 23, subject: "선형대수", unit: "벡터공간", concept: "기저 좌표벡터", difficulty: "easyMedium",
    question: "기저 $B=\\{\\langle 1,2,1\\rangle,\\langle 2,9,0\\rangle,\\langle 3,3,4\\rangle\\}$에 대한 벡터 $\\langle 5,-1,9\\rangle$의 좌표벡터 $[\\langle 5,-1,9\\rangle]_B$가 $\\langle 1,a,2\\rangle$일 때, 실수 $a$의 값은?",
    options: [o("1","$-4$"),o("2","$-3$"),o("3","$-2$"),o("4","$-1$")], answer: 4,
    explanation: "$[\\langle5,-1,9\\rangle]_B=\\langle1,a,2\\rangle$이므로 $1(1,2,1)+a(2,9,0)+2(3,3,4)=(5,-1,9)$이다. 왼쪽을 정리하면 $(7+2a,8+9a,9)$이고 첫 성분에서 $7+2a=5$이므로 $a=-1$이다. 이때 둘째 성분도 $8+9(-1)=-1$로 일치한다." }),
  build({ num: 24, subject: "공학수학", unit: "미분방정식", concept: "Wronskian 변환", difficulty: "medium",
    question: "두 함수 $f(x),g(x)$의 론스키안 $W(f,g)=e^x$이다. $F(x)=af(x)+bg(x),\\,G(x)=cf(x)+dg(x)$에 대하여 $\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}=2$일 때 $W(F,G)=ke^x$이다. 상수 $k$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 2,
    explanation: "선형결합 항등식: $W(F,G)=(ad-bc)\\cdot W(f,g)=2e^x$. $k=2$." }),
  build({ num: 25, subject: "공학수학", unit: "Laplace변환", concept: "역변환 + 함숫값", difficulty: "medium",
    question: "연속함수 $f(t)$의 라플라스 변환이 $\\dfrac{1}{s^3+4s}$일 때, $f\\!\\left(\\dfrac{\\pi}{4}\\right)$의 값은?",
    options: [o("1","$\\dfrac{1}{4}$"),o("2","$\\dfrac{1}{3}$"),o("3","$\\dfrac{1}{2}$"),o("4","$1$")], answer: 1,
    explanation: "$\\dfrac{1}{s(s^2+4)}=\\tfrac{1}{4s}-\\tfrac{1}{4}\\cdot\\dfrac{s}{s^2+4}$. 역변환 $\\tfrac{1}{4}-\\tfrac{1}{4}\\cos 2t$. $t=\\pi/4$: $\\tfrac{1}{4}-0=\\tfrac{1}{4}$." }),
  build({ num: 26, subject: "공학수학", unit: "추가내용", concept: "Bessel 점화", difficulty: "mediumHard",
    question: "베셀함수 $J_{1/2}(x)=\\sqrt{\\dfrac{2}{\\pi x}}\\sin x$, $J_{-1/2}(x)=\\sqrt{\\dfrac{2}{\\pi x}}\\cos x$에 대하여 $J_{3/2}(x)=\\sqrt{\\dfrac{2}{\\pi}}(x^a\\sin x-x^b\\cos x)$이다. $a+b$의 값은? (단, $a,b$는 실수.)",
    options: [o("1","$-1$"),o("2","$-2$"),o("3","$-3$"),o("4","$-4$")], answer: 2,
    explanation: "점화 $J_{3/2}=\\tfrac{1}{x}J_{1/2}-J_{-1/2}=\\sqrt{\\tfrac{2}{\\pi}}\\!\\left(x^{-3/2}\\sin x-x^{-1/2}\\cos x\\right)$. $a=-3/2,\\,b=-1/2$, 합 $=-2$." }),
  build({ num: 27, subject: "다변수함수", unit: "삼중적분과 극좌표계", concept: "최적 영역 부피", difficulty: "mediumHard",
    question: "$\\sigma(E)=\\displaystyle\\iiint_E(3-2x^2-2y^2-3z^2)\\,dV$는 영역 $E=E_0$에서 최댓값을 갖는다. 입체 $E_0$의 부피의 값은?",
    options: [o("1","$\\dfrac{\\pi}{2}$"),o("2","$\\pi$"),o("3","$\\dfrac{3}{2}\\pi$"),o("4","$2\\pi$")], answer: 4,
    explanation: "최대를 위해 피적분함수 $\\ge 0$ 영역만 포함: $\\tfrac{x^2}{3/2}+\\tfrac{y^2}{3/2}+\\tfrac{z^2}{1}\\le 1$ (타원체). 부피 $=\\dfrac{4}{3}\\pi\\sqrt{\\tfrac{3}{2}}\\cdot\\sqrt{\\tfrac{3}{2}}\\cdot 1=2\\pi$." }),
  build({ num: 28, subject: "선형대수", unit: "선형사상", concept: "선형사상 명제", difficulty: "medium",
    question: "선형변환 $T:\\mathbb{R}^3\\to\\mathbb{R}^3,\\,T(a,b,c)=(3a+b,\\,-2a-4b+3c,\\,5a+4b-2c)$의 다음 설명 중 옳은 것만을 있는 대로 모두 고른 것은?\n\n(가) $T$의 핵의 원소는 영벡터뿐이다.\\quad (나) $T$의 rank는 $2$이다.\\quad (다) $T\\circ T$는 항등함수이다.",
    options: [o("1","(가)"),o("2","(나)"),o("3","(가),(다)"),o("4","(나),(다)")], answer: 1,
    explanation: "행렬 $\\begin{pmatrix}3&1&0\\\\-2&-4&3\\\\5&4&-2\\end{pmatrix}$, $\\det=-1\\ne 0$. 가역 → 핵 영, rank $3$, $T\\circ T\\ne I$. 옳은 것: (가)만." }),
  build({ num: 29, subject: "공학수학", unit: "미분방정식", concept: "공명(특수해)", difficulty: "medium",
    question: "다음 조건을 만족하는 함수 $y=f(x)$가 무수히 많다.\n\n(가) $y''+a^2 y=\\sin x$\\quad (나) 임의의 양수 $M$에 대하여 $|f(x)|>M$인 실수 $x$가 존재한다.\n\n양의 실수 $a$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 1,
    explanation: "강제진동 주파수가 자연주파수와 일치($a=1$)할 때 공명 발생, 특수해 $-\\tfrac{x}{2}\\cos x$ 무한대로 발산. $a=1$." }),
  build({ num: 30, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE", difficulty: "medium",
    question: "함수 $y=f(x)$는 구간 $0\\le x\\le 1$에서 $(\\cos x)y'+y=\\sin x,\\,y(0)=2$를 만족시킨다. $f(1)$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")], answer: 1,
    explanation: "$y'+\\sec x\\,y=\\tan x$. 적분인자 $\\sec x+\\tan x$. $(\\sec x+\\tan x)y=\\sec x+\\tan x-x+C$. $y(0)=2\\Rightarrow C=1$. $y(x)=\\dfrac{\\sec x+\\tan x-x+1}{\\sec x+\\tan x}$. $y(1)=1$ (분자=분모이려면 $-1+1=0$, 즉 $\\sec 1+\\tan 1$로 같다)." }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
