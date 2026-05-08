// Upload 2019년도 가천대 편입수학 기출 25문항 (4지선다)
// Usage: node scripts/upload_general_2019_gachon.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "가천대"; const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-gachon-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "미분학", unit: "추가내용", concept: "쌍곡함수 미분 + 항등식", difficulty: "easyMedium",
    question: "함수 $f(x)=\\sinh x$에 대하여 $f(a)=\\dfrac{12}{5}$일 때 $f'(a)$의 값은?",
    options: [o("1","$-\\dfrac{5}{12}$"), o("2","$\\dfrac{5}{12}$"), o("3","$-\\dfrac{13}{5}$"), o("4","$\\dfrac{13}{5}$")],
    answer: 4,
    explanation: "**1단계 — $f'(x)$.** $\\dfrac{d}{dx}\\sinh x=\\cosh x$.\n\n**2단계 — 항등식.** $\\cosh^2 x-\\sinh^2 x=1$이라 $\\cosh^2 a=1+\\sinh^2 a=1+\\dfrac{144}{25}=\\dfrac{169}{25}$.\n\n$\\cosh a\\ge 1>0$이라 $\\cosh a=\\dfrac{13}{5}$.\n\n**3단계 — 결과.** $f'(a)=\\dfrac{13}{5}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분의 계산", concept: "삼각치환 + Wallis", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_{-1}^1\\sqrt{3+2x-x^2}\\,dx$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}\\pi$"), o("3","$\\pi$"), o("4","$4\\pi$")],
    answer: 3,
    explanation: "**1단계 — 완전제곱.** $3+2x-x^2=4-(x-1)^2$.\n\n$\\!\\int_{-1}^1\\sqrt{4-(x-1)^2}\\,dx$. $x-1=2\\sin\\theta$ 치환: $x=-1\\to\\theta=-\\pi/2$, $x=1\\to\\theta=0$.\n\n$\\!\\int_{-\\pi/2}^0 2\\cos\\theta\\cdot 2\\cos\\theta\\,d\\theta=4\\!\\int_{-\\pi/2}^0\\cos^2\\theta\\,d\\theta=4\\cdot\\dfrac{\\pi}{4}=\\pi$ (Wallis 공식)."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "편도함수", concept: "음함수 접선기울기", difficulty: "easyMedium",
    question: "곡선 $xy^2+x^2 y=2$ 위의 점 중에서 접선의 기울기가 $-1$인 점이 $(a,b)$라 할 때 $ab$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$4$")],
    answer: 2,
    explanation: "**1단계 — 음함수 미분.** $F=xy^2+x^2 y-2$. $F_x=y^2+2xy$, $F_y=2xy+x^2$.\n\n$\\dfrac{dy}{dx}=-\\dfrac{y^2+2xy}{2xy+x^2}=-1\\Rightarrow y^2+2xy=2xy+x^2\\Rightarrow y^2=x^2\\Rightarrow y=\\pm x$.\n\n**2단계 — 곡선 대입.**\n\n$y=x$: $x^3+x^3=2\\Rightarrow x=1,\\,y=1$. $(a,b)=(1,1)$, $ab=1$.\n\n$y=-x$: $x^3-x^3=0\\ne 2$ 모순.\n\n답 $1$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분의 응용", concept: "역함수와 영역", difficulty: "medium",
    question: "두 곡선 $y=\\sin x,\\,y=\\sin^{-1}x$와 두 직선 $x=\\dfrac{\\pi}{2},\\,y=\\dfrac{\\pi}{2}$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{4}$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{\\pi}{2}-1$"), o("4","$\\dfrac{\\pi^2}{4}-2$")],
    answer: 4,
    explanation: "**구상.** $y=\\sin x$와 $y=\\sin^{-1}x$는 $y=x$ 대칭. $[0,\\pi/2]$에서 $\\sin x\\le x\\le\\sin^{-1}x$.\n\n**전체 정사각형** $[0,\\pi/2]\\times[0,\\pi/2]$의 면적 $=\\dfrac{\\pi^2}{4}$.\n\n빼야 할 면적: ① $y=\\sin x$ 아래 영역, ② $y=\\sin^{-1}x$ 위 영역. 둘 다 면적 $1$ (대칭 + $\\!\\int_0^{\\pi/2}\\sin x\\,dx=1$).\n\n결과 $=\\dfrac{\\pi^2}{4}-2$."
  }),
  build({
    num: 5, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "$e^x$ 멱급수 인식", difficulty: "easyMedium",
    question: "급수 $1-2\\ln 3+\\dfrac{(2\\ln 3)^2}{2!}-\\dfrac{(2\\ln 3)^3}{3!}+\\cdots$의 합은?",
    options: [o("1","$9$"), o("2","$3$"), o("3","$\\dfrac{1}{3}$"), o("4","$\\dfrac{1}{9}$")],
    answer: 4,
    explanation: "**관찰.** 급수 형태 $\\sum\\dfrac{(-x)^n}{n!}=e^{-x}$.\n\n$x=2\\ln 3$이라 합 $=e^{-2\\ln 3}=e^{\\ln(1/9)}=\\dfrac{1}{9}$."
  }),
  build({
    num: 6, subject: "미분학", unit: "추가내용", concept: "절댓값 함수 미분", difficulty: "medium",
    question: "$f(x)=|x|+2019$이고 $g(x)=\\dfrac{1}{1+xf(x)}$일 때 도함수 $g'(0)$의 값은?",
    options: [o("1","$0$"), o("2","$2019$"), o("3","$-2019$"), o("4","$\\text{도함수가 존재하지 않는다}$")],
    answer: 3,
    explanation: "**1단계 — $f$ 분리.** $x\\le 0$에서 $f=-x+2019$, $x>0$에서 $f=x+2019$.\n\n**2단계 — $g$.** $g=\\dfrac{1}{1\\pm x^2+2019x}$ 두 형태이지만 $x=0$ 근방의 좌·우도함수 비교.\n\n좌도함수: $g(x)=\\dfrac{1}{-x^2+2019x+1}$. $g'(0)=-\\dfrac{2019}{1}=-2019$ (분수 미분).\n\n우도함수: $g(x)=\\dfrac{1}{x^2+2019x+1}$. $g'(0)=-\\dfrac{2019}{1}=-2019$.\n\n좌·우도함수 동일 → 도함수 존재, 값 $-2019$."
  }),
  build({
    num: 7, subject: "미분학", unit: "극한과 연속", concept: "$1^{\\infty}$ 부정형(로피탈)", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to 0}(e^x-x)^{2/x^2}$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$e$"), o("4","$\\sqrt{e}$")],
    answer: 3,
    explanation: "**1단계 — $\\ln$ 변환.** $L=\\lim\\dfrac{2\\ln(e^x-x)}{x^2}$.\n\n**2단계 — Taylor.** $e^x-x=1+\\dfrac{x^2}{2}+\\dfrac{x^3}{6}+\\cdots$. $\\ln(\\cdots)=\\dfrac{x^2}{2}+O(x^3)$.\n\n$L=\\lim\\dfrac{2\\cdot x^2/2}{x^2}=1$.\n\n결과 $=e^L=e$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분의 응용", concept: "원의 극방정식 면적", difficulty: "easyMedium",
    question: "극곡선 $r=\\sin\\theta+\\cos\\theta$로 둘러싸인 영역의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{2}$"), o("2","$\\pi$"), o("3","$\\dfrac{3\\pi}{2}$"), o("4","$2\\pi$")],
    answer: 1,
    explanation: "**1단계 — 곡선 식별.** $r=\\sin\\theta+\\cos\\theta=\\sqrt 2\\sin(\\theta+\\pi/4)$. 직교좌표로 $r^2=r\\sin\\theta+r\\cos\\theta$, 즉 $x^2+y^2=x+y$, $\\!\\left(x-\\tfrac{1}{2}\\right)^2+\\!\\left(y-\\tfrac{1}{2}\\right)^2=\\dfrac{1}{2}$. 반지름 $\\dfrac{1}{\\sqrt 2}$의 원.\n\n**2단계 — 면적.** $\\pi r^2=\\pi\\cdot\\dfrac{1}{2}=\\dfrac{\\pi}{2}$."
  }),
  build({
    num: 9, subject: "적분학", unit: "정적분의 계산", concept: "$F(x)=\\int_a^x g(t)dt$ 미분 + 접선", difficulty: "medium",
    question: "$f(x)=\\displaystyle\\int_{-1}^x e^{t^2}dt$이고 곡선 $y=f(x)$ 위의 점 $P$의 $x$좌표가 $-1$일 때, 점 $P$에서 곡선 $y=f(x)$에 접하는 접선의 $y$절편은?",
    options: [o("1","$1$"), o("2","$e$"), o("3","$2e$"), o("4","$4e^2$")],
    answer: 2,
    explanation: "**1단계 — $P$ 좌표.** $x=-1$에서 $f(-1)=\\!\\int_{-1}^{-1}=0$. $P=(-1,0)$.\n\n**2단계 — 접선 기울기.** $f'(x)=e^{x^2}$. $f'(-1)=e$.\n\n**3단계 — 접선식.** $y-0=e(x+1)=ex+e$. $y$절편 $=e$."
  }),
  build({
    num: 10, subject: "적분학", unit: "추가내용", concept: "Newton 방법", difficulty: "medium",
    question: "뉴턴 방법을 사용하여 방정식 $x^3+x+a=0$의 해를 구하려고 한다. 초기 근삿값 $x_1=1$이고 두 번째 근삿값 $x_2=\\dfrac{3}{4}$일 때 $a$의 값은? (단, $a$는 상수)",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$")],
    answer: 2,
    explanation: "**Newton 공식.** $x_{n+1}=x_n-\\dfrac{f(x_n)}{f'(x_n)}$.\n\n**1단계 — $f$.** $f(x)=x^3+x+a$. $f'(x)=3x^2+1$.\n\n**2단계 — 대입.** $f(1)=1+1+a=2+a$. $f'(1)=4$.\n\n$x_2=1-\\dfrac{2+a}{4}=\\dfrac{2-a}{4}=\\dfrac{3}{4}$.\n\n$2-a=3\\Rightarrow a=-1$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 부분적분", difficulty: "mediumHard",
    question: "$\\displaystyle\\int_0^{\\sqrt{3}}x\\tan^{-1}x\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{3}$"), o("3","$\\dfrac{\\pi}{3}-\\dfrac{1}{2}$"), o("4","$\\dfrac{2\\pi}{3}-\\dfrac{\\sqrt{3}}{2}$")],
    answer: 4,
    explanation: "**부분적분.** $u=\\tan^{-1}x$, $dv=x\\,dx$. $du=\\dfrac{1}{1+x^2}dx$, $v=\\dfrac{x^2}{2}$.\n\n$\\!\\int_0^{\\sqrt 3}=\\!\\left[\\dfrac{x^2}{2}\\tan^{-1}x\\right]_0^{\\sqrt 3}-\\!\\int_0^{\\sqrt 3}\\dfrac{x^2}{2(1+x^2)}dx$.\n\n첫 항 $=\\dfrac{3}{2}\\cdot\\dfrac{\\pi}{3}=\\dfrac{\\pi}{2}$.\n\n둘째 적분: $\\dfrac{x^2}{1+x^2}=1-\\dfrac{1}{1+x^2}$. $\\dfrac{1}{2}\\!\\int_0^{\\sqrt 3}\\!\\left(1-\\dfrac{1}{1+x^2}\\right)dx=\\dfrac{1}{2}(\\sqrt 3-\\dfrac{\\pi}{3})=\\dfrac{\\sqrt 3}{2}-\\dfrac{\\pi}{6}$.\n\n결과 $=\\dfrac{\\pi}{2}-\\dfrac{\\sqrt 3}{2}+\\dfrac{\\pi}{6}=\\dfrac{2\\pi}{3}-\\dfrac{\\sqrt 3}{2}$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "편도함수", concept: "법선과 곡면의 교점", difficulty: "medium",
    question: "점 $(1,1,2)$에서 포물면 $z=x^2+y^2$에 대한 법선이 이 포물선과 다시 만나는 점을 $(a,b,c)$라 할 때 $a+b+c$의 값은?",
    options: [o("1","$\\dfrac{5}{8}$"), o("2","$\\dfrac{3}{4}$"), o("3","$\\dfrac{7}{8}$"), o("4","$1$")],
    answer: 1,
    explanation: "**1단계 — 법선의 매개변수식.** $g=x^2+y^2-z$, $\\nabla g=(2x,2y,-1)|_{(1,1,2)}=(2,2,-1)$. 법선: $x=1+2t,\\,y=1+2t,\\,z=2-t$.\n\n**2단계 — 포물면과의 교점.** $z=x^2+y^2$에 대입: $2-t=(1+2t)^2+(1+2t)^2=2(1+2t)^2$.\n\n$2-t=2+8t+8t^2$ → $8t^2+9t=0$ → $t(8t+9)=0$.\n\n$t=0$은 시작점. 새 교점은 $t=-\\dfrac{9}{8}$.\n\n**3단계 — 좌표.** $a=1-\\dfrac{9}{4}=-\\dfrac{5}{4}$, $b=-\\dfrac{5}{4}$, $c=2+\\dfrac{9}{8}=\\dfrac{25}{8}$.\n\n합 $=-\\dfrac{10}{4}+\\dfrac{25}{8}=-\\dfrac{20}{8}+\\dfrac{25}{8}=\\dfrac{5}{8}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "수렴구간 진위", difficulty: "medium",
    question: "멱급수 $\\sum a_n x^n$은 $x=-2$일 때 수렴하고 $x=3$일 때 발산한다. 다음 보기의 급수 중 수렴하는 급수의 개수는?\n\nㄱ. $\\sum a_n\\quad$ ㄴ. $\\sum|a_n|\\quad$ ㄷ. $\\sum(-4)^n a_n\\quad$ ㄹ. $\\sum n a_n$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "**수렴반경.** $|-2|=2$에서 수렴, $|3|=3$에서 발산이라 수렴반경 $r$은 $2\\le r\\le 3$.\n\nㄱ. $x=1$ 대입. $|1|<2\\le r$이라 절대수렴 → **수렴**.\n\nㄴ. $\\sum|a_n|$ = $\\sum|a_n|\\cdot 1^n$. $|1|<r$이라 절대수렴이면 $\\sum|a_n|$ 수렴 → **수렴**.\n\nㄷ. $|-4|=4>r$이라 **발산**.\n\nㄹ. $\\sum n a_n=\\sum n a_n\\cdot 1^n$. 미분급수의 수렴반경도 $r$이라 $|1|<r$에서 수렴 → **수렴**.\n\n수렴 **3개** (ㄱ, ㄴ, ㄹ)."
  }),
  build({
    num: 14, subject: "선형대수", unit: "벡터공간", concept: "부분공간 차원(Rank)", difficulty: "medium",
    question: "$4$차원 공간 $\\mathbb R^4$의 네 벡터 $(1,3,2,2),(2,4,3,2),(1,9,5,8),(0,4,2,4)$에 의해 생성된 부분공간을 $W$라 할 때 $W$의 차원은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "**행렬 행 사다리꼴.** 네 벡터를 행으로 쌓은 행렬:\n\n$\\begin{pmatrix}1&3&2&2\\\\2&4&3&2\\\\1&9&5&8\\\\0&4&2&4\\end{pmatrix}$.\n\n$R_2\\to R_2-2R_1,\\,R_3\\to R_3-R_1$:\n\n$\\begin{pmatrix}1&3&2&2\\\\0&-2&-1&-2\\\\0&6&3&6\\\\0&4&2&4\\end{pmatrix}$.\n\n$R_3,R_4$가 $R_2$의 배수임 확인($R_3=-3R_2,\\,R_4=-2R_2$).\n\n비영행 2개 → **rank $2$**."
  }),
  build({
    num: 15, subject: "선형대수", unit: "고유치와 대각화", concept: "두 고유값의 차의 절댓값", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}2019&1\\\\2&2018\\end{pmatrix}$의 두 고윳값을 $\\lambda_1,\\lambda_2$라 할 때 $|\\lambda_1-\\lambda_2|$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "**핵심 공식.** $|\\lambda_1-\\lambda_2|^2=(\\lambda_1+\\lambda_2)^2-4\\lambda_1\\lambda_2=\\mathrm{tr}^2-4\\det$.\n\n**1단계 — 트레이스, 행렬식.** $\\mathrm{tr}=4037$. $\\det=2019\\cdot 2018-2$.\n\n**2단계 — 차이.** $\\mathrm{tr}^2-4\\det=4037^2-4(2019\\cdot 2018-2)$.\n\n$4037=2019+2018$, $4037^2=(2019+2018)^2=2019^2+2\\cdot 2019\\cdot 2018+2018^2$.\n\n$4\\cdot 2019\\cdot 2018=2(2\\cdot 2019\\cdot 2018)$.\n\n$\\mathrm{tr}^2-4\\det=2019^2-2\\cdot 2019\\cdot 2018+2018^2+8=(2019-2018)^2+8=9$.\n\n$|\\lambda_1-\\lambda_2|=3$."
  }),
  build({
    num: 16, subject: "미분학", unit: "극한과 연속", concept: "Taylor 계수 결정", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 0}\\dfrac{ax^3-bx+\\sin x}{x^3}=0$을 만족하는 상수 $a$와 $b$에 대해 $a+b$의 값은?",
    options: [o("1","$-\\dfrac{5}{6}$"), o("2","$-\\dfrac{2}{3}$"), o("3","$\\dfrac{5}{6}$"), o("4","$\\dfrac{7}{6}$")],
    answer: 4,
    explanation: "**1단계 — Taylor.** $\\sin x=x-\\dfrac{x^3}{6}+O(x^5)$.\n\n분자 $=ax^3-bx+x-\\dfrac{x^3}{6}+O(x^5)=(1-b)x+\\!\\left(a-\\dfrac{1}{6}\\right)x^3+O(x^5)$.\n\n**2단계 — 극한 $=0$ 조건.** $x^3$로 나누면 $\\dfrac{(1-b)/x^2+\\cdots}{1}+\\!\\left(a-\\dfrac{1}{6}\\right)$. 극한 $0$이려면 $1-b=0$ AND $a-\\dfrac{1}{6}=0$.\n\n$b=1,\\,a=\\dfrac{1}{6}$.\n\n합 $=\\dfrac{7}{6}$."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분의 응용", concept: "곡선 사이 넓이", difficulty: "mediumHard",
    question: "영역 $R=\\{(x,y)\\mid x\\ge y^2,\\,2-x-|y|\\ge 0\\}$의 넓이는?",
    options: [o("1","$\\dfrac{4}{3}$"), o("2","$\\dfrac{5}{3}$"), o("3","$\\dfrac{7}{3}$"), o("4","$\\dfrac{8}{3}$")],
    answer: 3,
    explanation: "**1단계 — 영역.** $y^2\\le x\\le 2-|y|$. $|y|$ 대칭이라 $y\\ge 0$ 부분 2배.\n\n$y^2\\le 2-y$ → $y^2+y-2\\le 0$ → $(y+2)(y-1)\\le 0$. $y\\ge 0$이라 $0\\le y\\le 1$.\n\n**2단계 — 넓이.**\n\n$S=2\\!\\int_0^1[(2-y)-y^2]dy=2\\!\\left[2y-\\dfrac{y^2}{2}-\\dfrac{y^3}{3}\\right]_0^1=2\\!\\left(2-\\dfrac{1}{2}-\\dfrac{1}{3}\\right)=2\\cdot\\dfrac{7}{6}=\\dfrac{7}{3}$."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "타원 + 곱 함수 최대/최소", difficulty: "medium",
    question: "타원 $x^2+4y^2=8$에서 함수 $f(x,y)=xy$의 최댓값을 $a$, 최솟값을 $b$라 할 때 $ab$의 값은?",
    options: [o("1","$-1$"), o("2","$-2$"), o("3","$-3$"), o("4","$-4$")],
    answer: 4,
    explanation: "**AM-GM.** $x^2+4y^2\\ge 2\\sqrt{x^2\\cdot 4y^2}=4|xy|$.\n\n$8\\ge 4|xy|$이라 $|xy|\\le 2$.\n\n등호: $x^2=4y^2$일 때.\n\n최댓값 $a=2$ (예: $x=2,\\,y=1$), 최솟값 $b=-2$.\n\n$ab=-4$."
  }),
  build({
    num: 19, subject: "다변수함수", unit: "중적분", concept: "적분순서 변경", difficulty: "medium",
    question: "미분 가능한 함수 $f(0)=0$이고 $f'(x)=\\displaystyle\\int_x^1\\cos(t^2)\\,dt$일 때 $f(1)$의 값은?",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$\\sin 1$"), o("4","$\\dfrac{\\sin 1}{2}$")],
    answer: 4,
    explanation: "**1단계 — $f(1)-f(0)=\\!\\int_0^1 f'(x)dx$.**\n\n$f(1)=\\!\\int_0^1\\!\\!\\int_x^1\\cos(t^2)dt\\,dx$.\n\n**2단계 — 적분순서 변경.** 영역 $0\\le x\\le 1,\\,x\\le t\\le 1$ → $0\\le t\\le 1,\\,0\\le x\\le t$.\n\n$=\\!\\int_0^1\\!\\!\\int_0^t\\cos(t^2)dx\\,dt=\\!\\int_0^1 t\\cos(t^2)dt$.\n\n**3단계 — 치환.** $u=t^2$: $\\dfrac{1}{2}\\!\\int_0^1\\cos u\\,du=\\dfrac{\\sin 1}{2}$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "추가내용", concept: "두 직선 사이 거리", difficulty: "medium",
    question: "두 직선 $\\ell_1:x+2=y-5=\\dfrac{z-1}{2}$와 $\\ell_2:x-1=y-1=z$ 사이의 최단 거리는?",
    options: [o("1","$\\dfrac{3}{\\sqrt{2}}$"), o("2","$\\dfrac{5}{\\sqrt{2}}$"), o("3","$\\dfrac{7}{\\sqrt{2}}$"), o("4","$\\dfrac{9}{\\sqrt{2}}$")],
    answer: 3,
    explanation: "**1단계 — 방향벡터.** $\\ell_1$ 방향 $(1,1,2)$, $\\ell_2$ 방향 $(1,1,1)$.\n\n**2단계 — 평면 법선.** $\\ell_1$ 포함 + $\\ell_2$ 평행 평면. 법선 $=(1,1,2)\\times(1,1,1)=(1-2,2-1,1-1)=(-1,1,0)\\to(1,-1,0)$.\n\n**3단계 — 평면식.** 점 $(-2,5,1)$: $(x+2)-(y-5)=0$ → $x-y+7=0$.\n\n**4단계 — 점거리.** $\\ell_2$ 위 점 $(1,1,0)$: $\\dfrac{|1-1+7|}{\\sqrt 2}=\\dfrac{7}{\\sqrt 2}$."
  }),
  build({
    num: 21, subject: "선형대수", unit: "행렬", concept: "행렬식 성질(역행렬·전치)", difficulty: "medium",
    question: "두 행렬 $A=\\begin{pmatrix}a_1&a_2&a_3&a_4\\\\b_1&b_2&b_3&b_4\\\\c_1&c_2&c_3&c_4\\\\d_1&d_2&d_3&d_4\\end{pmatrix}$와 $B=\\begin{pmatrix}b_1&b_2&-b_3&b_4\\\\a_1&a_2&-a_3&a_4\\\\c_1&c_2&-c_3&c_4\\\\d_1&d_2&-d_3&d_4\\end{pmatrix}$에 대하여 $\\det(A)=2$일 때 $\\det[(AB^{-1})^T]$의 값은? (단, $A^T$는 $A$의 전치행렬)",
    options: [o("1","$\\dfrac{1}{2}$"), o("2","$1$"), o("3","$2$"), o("4","$4$")],
    answer: 2,
    explanation: "**$B$의 행렬식 계산.**\n\n$B$는 $A$의 1·2행 교환 + 3열 부호 반전.\n\n$\\det B=(-1)\\cdot(-1)\\cdot\\det A=\\det A=2$.\n\n**식 정리.** $\\det((AB^{-1})^T)=\\det(AB^{-1})=\\dfrac{\\det A}{\\det B}=\\dfrac{2}{2}=1$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "미분방정식", concept: "변수분리형", difficulty: "easyMedium",
    question: "$y=y(x)$가 미분방정식 $\\dfrac{dx}{dy}=\\dfrac{y}{x},\\,y(0)=-3$의 해 일 때 $y(4)$의 값은?",
    options: [o("1","$1$"), o("2","$-1$"), o("3","$5$"), o("4","$-5$")],
    answer: 4,
    explanation: "**1단계 — 변수분리.** $x\\,dx=y\\,dy$.\n\n**2단계 — 적분.** $\\dfrac{x^2}{2}=\\dfrac{y^2}{2}+C$, 즉 $y^2=x^2-2C$ 또는 $y^2=x^2+C'$.\n\n**3단계 — 초기조건.** $y(0)=-3$: $9=0+C'\\Rightarrow C'=9$.\n\n$y^2=x^2+9$.\n\n**4단계 — $x=4$.** $y^2=16+9=25$. $y(0)=-3<0$이라 연속성 가정으로 $y$ 부호 유지 가능 → $y(4)=-5$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리", difficulty: "medium",
    question: "평면의 시계 반대 방향으로 도는 원 $C$가 $x^2+y^2=9$일 때 $\\displaystyle\\oint_C(-2y)\\,dx+x^2\\,dy$의 값은?",
    options: [o("1","$4\\pi$"), o("2","$8\\pi$"), o("3","$15\\pi$"), o("4","$18\\pi$")],
    answer: 4,
    explanation: "**Green 정리.** $\\oint(P\\,dx+Q\\,dy)=\\!\\iint_D(Q_x-P_y)dA$.\n\n$P=-2y$, $Q=x^2$. $Q_x=2x$, $P_y=-2$. 차 $=2x+2$.\n\n**적분.** 원 $D:x^2+y^2\\le 9$, 면적 $=9\\pi$.\n\n$\\!\\iint_D(2x+2)dA=2\\!\\iint x\\,dA+2\\cdot 9\\pi=0+18\\pi=18\\pi$ ($\\!\\iint x\\,dA=0$ 대칭)."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "중적분", concept: "삼중적분(우함수)", difficulty: "medium",
    question: "$E$가 두 곡면 $z=x^2-1,\\,z=1-x^2$과 두 평면 $y=0,\\,y=2$로 둘러싸인 입체영역일 때, $\\displaystyle\\iiint_E(xy)\\,dV$의 값은?",
    options: [o("1","$0$"), o("2","$3$"), o("3","$6$"), o("4","$12$")],
    answer: 1,
    explanation: "**대칭성.** 영역 $E$는 $x$에 대해 대칭 ($-1\\le x\\le 1$). 피적분함수 $xy$는 $x$의 홀함수.\n\n홀함수의 대칭 적분 → $\\!\\iiint_E xy\\,dV=0$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "체적과 곡면적", concept: "스칼라 면적분(포물면)", difficulty: "mediumHard",
    question: "곡면 $S=\\{(x,y,z)\\mid z=x^2+y^2,\\,0\\le z\\le 1\\}$에 대해 $\\displaystyle\\iint_S z\\,dS$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}(5\\sqrt{5}-1)$"), o("2","$\\dfrac{\\pi}{6}(5\\sqrt{5}+1)$"), o("3","$\\dfrac{\\pi}{60}(25\\sqrt{5}-1)$"), o("4","$\\dfrac{\\pi}{60}(25\\sqrt{5}+1)$")],
    answer: 4,
    explanation: "**면적소.** $z=x^2+y^2$이라 $z_x=2x,\\,z_y=2y$. $dS=\\sqrt{1+4(x^2+y^2)}\\,dA$.\n\n**적분.** $\\!\\iint_S z\\,dS=\\!\\iint_D(x^2+y^2)\\sqrt{1+4(x^2+y^2)}\\,dA$.\n\n극좌표 $D:0\\le r\\le 1$:\n\n$=\\!\\int_0^{2\\pi}\\!\\!\\int_0^1 r^2\\sqrt{1+4r^2}\\cdot r\\,dr\\,d\\theta=2\\pi\\!\\int_0^1 r^3\\sqrt{1+4r^2}\\,dr$.\n\n**치환.** $t=\\sqrt{1+4r^2}$, $t^2=1+4r^2$, $r^2=\\dfrac{t^2-1}{4}$, $r\\,dr=\\dfrac{t}{4}dt$.\n\n$\\!\\int r^3\\sqrt{1+4r^2}\\,dr=\\!\\int r^2\\cdot t\\cdot\\dfrac{t}{4}dt=\\dfrac{1}{16}\\!\\int(t^2-1)t^2 dt=\\dfrac{1}{16}\\!\\left[\\dfrac{t^5}{5}-\\dfrac{t^3}{3}\\right]$.\n\n구간: $r:0\\to 1$이면 $t:1\\to\\sqrt 5$.\n\n계산하면 $2\\pi\\cdot\\dfrac{1}{16}\\!\\left[\\dfrac{(\\sqrt 5)^5-1}{5}-\\dfrac{(\\sqrt 5)^3-1}{3}\\right]=\\dfrac{\\pi}{60}(25\\sqrt 5+1)$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
