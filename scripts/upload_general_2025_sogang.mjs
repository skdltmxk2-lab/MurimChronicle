// Upload 2025년도 서강대 편입수학 기출 객관식 16문항 (5지선다)
// 17~20번은 주관식(서답형)이라 업로드에서 제외
// Usage: node scripts/upload_general_2025_sogang.mjs
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

const SCHOOL = "서강대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-sogang-${String(num).padStart(2, "0")}`;
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
    num: 1, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 적분", difficulty: "easyMedium",
    question: "적분 $\\displaystyle\\int_{-2}^{3}\\dfrac{1}{x^2+36}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{36}$"), o("2","$\\dfrac{\\pi}{24}$"), o("3","$\\dfrac{\\pi}{12}$"), o("4","$\\dfrac{\\pi}{6}$"), o("5","$\\dfrac{\\pi}{4}$")],
    answer: 2,
    explanation: "$\\int\\dfrac{dx}{x^2+a^2}=\\tfrac{1}{a}\\tan^{-1}(x/a)$. $a=6$. $\\big[\\tfrac{1}{6}\\tan^{-1}(x/6)\\big]_{-2}^{3}=\\tfrac{1}{6}\\!\\left[\\tan^{-1}(\\tfrac{1}{2})-\\tan^{-1}(-\\tfrac{1}{3})\\right]$. $\\tan^{-1}\\tfrac{1}{2}+\\tan^{-1}\\tfrac{1}{3}=\\tfrac{\\pi}{4}$이므로 합 $=\\dfrac{\\pi}{24}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "급수", concept: "수렴 판정", difficulty: "medium",
    question: "다음 $\\langle$보기$\\rangle$의 수열 또는 급수 중에서 수렴하는 것만을 있는 대로 고른 것은?\n\n$\\text{ㄱ. } \\displaystyle\\lim_{n\\to\\infty}\\dfrac{1}{\\sqrt{n}}\\sum_{k=1}^{2n}\\dfrac{1}{k}\\quad \\text{ㄴ. } \\sum_{n=3}^{\\infty}\\dfrac{1}{n(\\ln n)\\ln(\\ln n)}\\quad \\text{ㄷ. } \\sum_{n=2}^{\\infty}\\!\\left(1-\\dfrac{1}{\\sqrt{n}}\\right)^{n^2}$",
    options: [o("1","ㄱ"), o("2","ㄱ, ㄴ"), o("3","ㄱ, ㄷ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 3,
    explanation: "ㄱ. 조화수 $H_{2n}\\sim \\ln(2n)+\\gamma$이므로 $\\dfrac{H_{2n}}{\\sqrt n}\\to 0$. **수렴**. ㄴ. $\\ln\\ln n=t$ 치환하면 $\\sim\\sum 1/t$ 형태이므로 **발산**. ㄷ. $\\big(1-\\tfrac{1}{\\sqrt n}\\big)^{n^2}=\\big(1-\\tfrac{1}{\\sqrt n}\\big)^{\\sqrt n\\cdot n^{3/2}}\\sim e^{-n^{3/2}}\\to 0$ 매우 빠르게. **수렴**."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "벡터", concept: "평면 대칭과 거리 최소", difficulty: "medium",
    question: "공간에 두 점 $P(1,1,1)$와 $Q\\!\\left(\\dfrac{\\sqrt{2}+1}{3},\\dfrac{1}{3},\\dfrac{5}{3}\\right)$가 있다. 점 $R$이 평면 $x-y+2z=0$ 위를 움직일 때, $\\overline{PR}+\\overline{QR}$의 최솟값은?",
    options: [o("1","$\\sqrt{2}$"), o("2","$\\sqrt{3}$"), o("3","$\\sqrt{6}$"), o("4","$2\\sqrt{2}$"), o("5","$2\\sqrt{3}$")],
    answer: 3,
    explanation: "$P$의 평면에 대한 대칭점 $P'$를 구하면 $\\overline{PR}=\\overline{P'R}$이므로 $\\overline{PR}+\\overline{QR}\\ge \\overline{P'Q}$. $P=(1,1,1)$를 평면 $x-y+2z=0$에 대해 대칭: 직선 $r(t)=(1+t,1-t,1+2t)$가 평면과 $t=-\\tfrac{1}{3}$에서 만나므로 발자국 $(\\tfrac{2}{3},\\tfrac{4}{3},\\tfrac{1}{3})$, 대칭점 $P'=(\\tfrac{1}{3},\\tfrac{5}{3},-\\tfrac{1}{3})$. $|P'Q|=\\sqrt{(\\tfrac{\\sqrt 2}{3})^2+(\\tfrac{4}{3})^2+(\\tfrac{6}{3})^2}=\\sqrt{6}$."
  }),
  build({
    num: 4, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법", difficulty: "medium",
    question: "집합 $\\{(x,y)\\in\\mathbb{R}^2\\mid x^4+4y^4=1\\}$에서 정의된 함수 $f(x,y)=x^4+8x^2 y^2+16y^4$의 최댓값과 최솟값의 합은?",
    options: [o("1","$5$"), o("2","$6$"), o("3","$7$"), o("4","$8$"), o("5","$9$")],
    answer: 2,
    explanation: "$y=\\tfrac{1}{\\sqrt 2}Y$로 치환 → 제약 $x^4+Y^4=1$, 함수 $x^4+4x^2 Y^2+4Y^4=(x^2+2Y^2)^2$. $a=x^2,b=Y^2$ ($a,b\\ge 0$)로 두면 제약 $a^2+b^2=1$ 위 $(a+2b)^2$의 최댓값/최솟값. $a+2b$의 범위는 $[1,\\sqrt 5]$이므로 $f$의 범위 $[1,5]$. 합 $=6$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙(전미분)", difficulty: "medium",
    question: "두 함수 $f(x,y)=\\sinh(x^2 y)$와 $g(x)=\\displaystyle\\int_{x^2}^{x^2-2x+2}e^{t^3 x}\\,dt$에 대하여 $h(x)=f(x,g(x))$일 때, $h'(1)$의 값은?",
    options: [o("1","$-2e$"), o("2","$1-e$"), o("3","$0$"), o("4","$1+e$"), o("5","$2e$")],
    answer: 1,
    explanation: "$h'(x)=f_x+f_y g'(x)$. $x=1$에서 $g(1)=\\int_1^1 e^{t^3}dt=0$. ① $f_x(1,0)=\\cosh(0)\\cdot 2xy\\big|_{x=1,y=0}=0$. ② $f_y(1,0)=\\cosh(0)\\cdot x^2\\big|_{x=1,y=0}=1$. ③ Leibniz: $g'(x)=e^{(x^2-2x+2)^3 x}(2x-2)-e^{(x^2)^3 x}\\cdot 2x+\\!\\int x^3 \\cdot e^{t^3 x}dt$. $x=1$ 대입 시 첫째 항 $=0$, 둘째 항 $=-2e$, 셋째 항 $=0$ (적분 구간 $\\!=0$). $g'(1)=-2e$. $h'(1)=0+1\\cdot(-2e)=-2e$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "선적분과 면적분", concept: "선적분(매개화)", difficulty: "medium",
    question: "곡선 $C$는 $\\mathbf{r}(t)=t^3\\mathbf{i}+t^2\\mathbf{j}-2t\\mathbf{k}$ $(0\\le t\\le 1)$로 주어지고 $(0,0,0)$에서 출발하여 $(1,1,-2)$에서 끝난다. 벡터장 $\\mathbf{F}(x,y,z)=(x^2-y^3)\\mathbf{i}+yz\\mathbf{j}+(x+z)\\mathbf{k}$에 대하여, 적분 $\\displaystyle\\int_C \\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options: [o("1","$\\dfrac{7}{10}$"), o("2","$\\dfrac{4}{5}$"), o("3","$\\dfrac{9}{10}$"), o("4","$1$"), o("5","$\\dfrac{11}{10}$")],
    answer: 1,
    explanation: "$\\mathbf{F}(\\mathbf{r}(t))=(t^6-t^6,\\,-2t^3,\\,t^3-2t)$, $\\mathbf{r}'(t)=(3t^2,2t,-2)$. $\\mathbf{F}\\cdot\\mathbf{r}'=0-4t^4-2t^4+4t=-6t^4+4t$. 잠깐, 다시: $\\int_0^1(0\\cdot 3t^2+(-2t^3)(2t)+(t^3-2t)(-2))dt=\\int_0^1(-4t^4-2t^3+4t)dt=-\\tfrac{4}{5}-\\tfrac{1}{2}+2=\\dfrac{7}{10}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "선적분과 면적분", concept: "면적분(스칼라)", difficulty: "medium",
    question: "$S$가 매개변수방정식 $x=u+v$, $y=2u-v+1$, $z=-2u+4v$ $(0\\le u\\le 1,\\,0\\le v\\le 2)$으로 주어진 면일 때, 적분 $\\displaystyle\\iint_S(x+y+z)\\,dS$의 값은?",
    options: [o("1","$8$"), o("2","$11$"), o("3","$24$"), o("4","$72$"), o("5","$99$")],
    answer: 5,
    explanation: "$\\mathbf{r}_u\\times\\mathbf{r}_v=\\langle 1,2,-2\\rangle\\times\\langle 1,-1,4\\rangle=\\langle 6,-6,-3\\rangle$, 크기 $9$. $x+y+z=(u+v)+(2u-v+1)+(-2u+4v)=u+4v+1$. $\\iint_S(x+y+z)dS=\\int_0^2\\!\\int_0^1(u+4v+1)\\cdot 9\\,du\\,dv=9\\!\\left[\\!\\int_0^2(\\tfrac{1}{2}+4v+1)dv\\right]=9\\!\\left[\\tfrac{1}{2}\\cdot 2+8+2\\right]=9\\cdot 11=99$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬", concept: "행렬 다항식", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}0 & 0 & 1\\\\ 1 & 0 & -1\\\\ 0 & 1 & 3\\end{pmatrix}$에 대하여 $(A^2+I)^{-1}=aA+bI$일 때, $a+b$의 값은? (단, $a,b$는 실수이고 $I$는 $3\\times 3$ 단위행렬이다.)",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$\\dfrac{1}{2}$")],
    answer: 4,
    explanation: "양변에 $A^2+I$ 곱: $I=(A^2+I)(aA+bI)=aA^3+bA^2+aA+bI$. 정리: $aA^3+bA^2+aA+(b-1)I=O$. $A$의 특성다항식 $A^3-3A^2+A-I=O$ → $A^3=3A^2-A+I$. 양변 $a$배: $aA^3=3aA^2-aA+aI$. 두 식 비교 $b=-3a$ 등으로 부터 $a=-\\tfrac{1}{2},b=\\tfrac{3}{2}$. $a+b=1$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "고유치와 대각화", concept: "행렬 거듭제곱 극한", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}\\dfrac{11}{20} & \\dfrac{3}{20}\\\\ \\dfrac{3}{20} & \\dfrac{19}{20}\\end{pmatrix}$에 대하여 $\\displaystyle\\lim_{n\\to\\infty}A^n$의 모든 성분의 합은?",
    options: [o("1","$\\dfrac{2}{5}$"), o("2","$\\dfrac{7}{10}$"), o("3","$1$"), o("4","$\\dfrac{13}{10}$"), o("5","$\\dfrac{8}{5}$")],
    answer: 5,
    explanation: "$A$의 고윳값: $\\tfrac{1}{2},1$. 고유벡터: $\\lambda=\\tfrac{1}{2}$일 때 $\\binom{3}{-1}$, $\\lambda=1$일 때 $\\binom{1}{3}$. $A^n\\to$ $\\lambda=1$ 성분 영사 행렬. 임의 $\\binom{1}{1}$ 분해: $\\binom{1}{1}=\\tfrac{1}{5}\\binom{3}{-1}+\\tfrac{2}{5}\\binom{1}{3}$, 같은 분해를 $\\binom{1}{0}, \\binom{0}{1}$에 적용해 $\\lim A^n=\\tfrac{1}{10}\\begin{pmatrix}1 & 3\\\\3 & 9\\end{pmatrix}$. 모든 성분의 합 $=\\dfrac{1+3+3+9}{10}=\\dfrac{8}{5}$."
  }),
  build({
    num: 10, subject: "공학수학", unit: "미분방정식", concept: "베르누이 미분방정식", difficulty: "medium",
    question: "$y(x)$가 초깃값 문제 $x^2+8xyy'-4y^2=0$, $y(4)=2$의 해일 때, $y(2)$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$\\sqrt{2}$"), o("4","$\\sqrt{3}$"), o("5","$2$")],
    answer: 4,
    explanation: "$8xy\\,y'-4y^2=-x^2$. 양변 $8xy$로 나눔: $y'-\\tfrac{1}{2x}y=-\\tfrac{x}{8}y^{-1}$ (베르누이, $n=-1$). $u=y^2$ 치환: $u'-\\tfrac{1}{x}u=-\\tfrac{x}{4}$. 적분인자 $\\tfrac{1}{x}$: $(u/x)'=-\\tfrac{1}{4}$ → $u/x=-\\tfrac{x}{4}+C$ → $y^2=-\\tfrac{x^2}{4}+Cx$. $y(4)=2$ → $C=2$. $y(2)^2=-1+4=3$ → $y(2)=\\sqrt{3}$."
  }),
  build({
    num: 11, subject: "미분학", unit: "도함수", concept: "역함수 도함수", difficulty: "medium",
    question: "구간 $(-1,\\infty)$에서 정의된 함수 $f(x)=(x+1)e^{2x}$의 역함수를 $g(x)$라고 할 때, $g'(1)+g''(1)$의 값은?",
    options: [o("1","$\\dfrac{1}{81}$"), o("2","$\\dfrac{1}{27}$"), o("3","$\\dfrac{1}{9}$"), o("4","$\\dfrac{1}{3}$"), o("5","$1$")],
    answer: 2,
    explanation: "$f(0)=1$, $f'(x)=e^{2x}+2(x+1)e^{2x}=(2x+3)e^{2x}$이므로 $f'(0)=3$. $f''(x)=2e^{2x}+2e^{2x}+4(x+1)e^{2x}=(4x+8)e^{2x}$, $f''(0)=8$. 역함수 미분: $g'(1)=\\tfrac{1}{f'(0)}=\\tfrac{1}{3}$, $g''(1)=-\\dfrac{f''(0)}{(f'(0))^3}=-\\dfrac{8}{27}$. 합 $=\\dfrac{1}{3}-\\dfrac{8}{27}=\\dfrac{1}{27}$."
  }),
  build({
    num: 12, subject: "적분학", unit: "정적분의 응용", concept: "극곡선 길이", difficulty: "medium",
    question: "극방정식 $r=1+\\sin\\theta$ $(0\\le\\theta\\le 2\\pi)$로 주어진 곡선에서 $r\\le 1$인 부분의 길이가 $a+b\\sqrt{2}$일 때, $a+b$의 값은? (단, $a$와 $b$는 유리수이다.)",
    options: [o("1","$3$"), o("2","$\\dfrac{7}{2}$"), o("3","$4$"), o("4","$\\dfrac{9}{2}$"), o("5","$5$")],
    answer: 3,
    explanation: "$r\\le 1$ ⇔ $\\sin\\theta\\le 0$ ⇔ $\\pi\\le\\theta\\le 2\\pi$ (cardioid의 아래쪽 반). cardioid $r=a(1+\\cos\\theta)$의 한 쪽 길이는 $a(4-2\\sqrt 2)$이며, $r=1+\\sin\\theta$도 회전이라 같은 공식 적용. 전체 길이 공식 $L=8$의 절반에서 발자국 보정: $L=2\\cdot(4-2\\sqrt{2})=8-4\\sqrt 2$. $a=8,\\,b=-4$, $a+b=4$."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "중적분", concept: "이상적분(가우스적분)", difficulty: "mediumHard",
    question: "임의의 양수 $t$에 대하여 $f(t)=\\displaystyle\\iint_{T(t)}e^{2y-x^2}\\,dA$라고 하자. 여기서 $T(t)$는 꼭짓점이 $(-t,-t),(t,-t),(t,t)$인 삼각형으로 둘러싸인 영역이다. 극한 $\\displaystyle\\lim_{t\\to\\infty}f(t)$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{\\pi}}{2e}$"), o("2","$\\dfrac{\\sqrt{\\pi}}{e}$"), o("3","$\\sqrt{\\pi}$"), o("4","$\\dfrac{e\\sqrt{\\pi}}{2}$"), o("5","$e\\sqrt{\\pi}$")],
    answer: 4,
    explanation: "$T(t)=\\{-t\\le x\\le t,\\,-t\\le y\\le x\\}$. $\\int_{-t}^{t}\\!\\int_{-t}^{x}e^{2y-x^2}\\,dy\\,dx=\\tfrac{1}{2}\\!\\int_{-t}^t e^{-x^2}(e^{2x}-e^{-2t})dx=\\tfrac{1}{2}\\!\\left(\\!\\int_{-t}^t e^{-x^2+2x}dx-e^{-2t}\\!\\int_{-t}^t e^{-x^2}dx\\right)$. ① $\\int_{-\\infty}^{\\infty}e^{-(x-1)^2+1}dx=e\\sqrt{\\pi}$. ② $e^{-2t}\\cdot\\sqrt{\\pi}\\to 0$. 극한 $=\\dfrac{e\\sqrt{\\pi}}{2}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "중적분", concept: "적분 순서 변경", difficulty: "medium",
    question: "적분 $\\displaystyle\\int_0^9\\!\\!\\int_{\\sqrt{x}}^{3}\\!\\!\\int_0^{3-y}\\cos((3-z)^4)\\,dz\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\sin 81}{2}$"), o("2","$\\dfrac{\\sin 81}{3}$"), o("3","$\\dfrac{\\sin 81}{4}$"), o("4","$\\dfrac{\\sin 81}{6}$"), o("5","$\\dfrac{\\sin 81}{12}$")],
    answer: 5,
    explanation: "$dy\\,dx\\to dx\\,dy$로 변경: $0\\le y\\le 3$, $0\\le x\\le y^2$. $\\int_0^3\\!\\!\\int_0^{y^2}\\!\\!\\int_0^{3-y}\\cos((3-z)^4)dz\\,dx\\,dy=\\int_0^3\\!\\!\\int_0^{3-y}y^2\\cos((3-z)^4)dz\\,dy$. 적분 순서 다시 변경 후 $u=3-z$ 치환: $\\tfrac{1}{12}\\int_0^3 4z^3\\cos(z^4)dz=\\tfrac{1}{12}\\sin(z^4)\\big|_0^3=\\dfrac{\\sin 81}{12}$."
  }),
  build({
    num: 15, subject: "선형대수", unit: "추가내용", concept: "행렬론 진위판정", difficulty: "medium",
    question: "$A$가 $n\\times n$ 행렬일 때, 다음 $\\langle$보기$\\rangle$에서 옳은 것만을 있는 대로 고른 것은? (단, $n$은 자연수, $A^T$는 $A$의 전치행렬, 그리고 $I$는 $n\\times n$ 단위행렬이다.)\n\n$\\text{ㄱ. } A^T A$의 계급수(rank)는 $A$의 계급수와 같다.\n$\\text{ㄴ. } A$가 대각화 가능하면 $A^T$도 대각화 가능하다.\n$\\text{ㄷ. } AX-XA=I$인 $n\\times n$ 행렬 $X$가 존재한다.",
    options: [o("1","ㄱ"), o("2","ㄱ, ㄴ"), o("3","ㄱ, ㄷ"), o("4","ㄴ, ㄷ"), o("5","ㄱ, ㄴ, ㄷ")],
    answer: 2,
    explanation: "ㄱ. **참**(rank 정리). ㄴ. $D=P^{-1}AP$ → 양변 transpose: $D^T=P^T A^T (P^T)^{-1}$이므로 $A^T$ 도 대각화 가능. **참**. ㄷ. 양변에 $\\mathrm{tr}$ 취하면 $\\mathrm{tr}(AX-XA)=0=\\mathrm{tr}(I)=n$ 모순. **거짓**."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "라플라스 역변환", difficulty: "medium",
    question: "$\\mathcal{L}$을 라플라스 변환이라고 하고, $\\mathcal{L}^{-1}$를 $\\mathcal{L}$의 역변환이라고 하자. $f(t)=\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{4s}{(s+1)(s^2+4s+5)}\\right\\}\\!(t)$일 때, $f(\\pi)$의 값은?",
    options: [o("1","$-2e^{-\\pi}-2e^{-2\\pi}$"), o("2","$-2^{-\\pi}+2e^{-2\\pi}$"), o("3","$-2e^{-\\pi}+e^{-2\\pi}$"), o("4","$-e^{-\\pi}-e^{-2\\pi}$"), o("5","$-e^{-\\pi}+e^{-2\\pi}$")],
    answer: 1,
    explanation: "부분분수: $\\dfrac{4s}{(s+1)(s^2+4s+5)}=\\dfrac{-2}{s+1}+\\dfrac{2s+10}{s^2+4s+5}=\\dfrac{-2}{s+1}+\\dfrac{2(s+2)+6}{(s+2)^2+1}$. 역변환: $f(t)=-2e^{-t}+e^{-2t}(2\\cos t+6\\sin t)$. $t=\\pi$: $-2e^{-\\pi}+e^{-2\\pi}(-2+0)=-2e^{-\\pi}-2e^{-2\\pi}$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) {
  console.error("Insert failed:", error);
  process.exit(1);
}
console.log("Inserted:");
for (const row of data ?? []) {
  console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
}
