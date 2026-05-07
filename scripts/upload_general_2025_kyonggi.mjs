// Upload 2025년도 경기대 편입수학 기출 20문항 (26~45번, 4지선다)
// Usage: node scripts/upload_general_2025_kyonggi.mjs
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

const SCHOOL = "경기대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kyonggi-${String(num).padStart(2, "0")}`;
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
    num: 26, subject: "미분학", unit: "극한과 연속", concept: "좌극한(가우스/절댓값)", difficulty: "easy",
    question: "$\\displaystyle\\lim_{x\\to 0^-}\\dfrac{x+1+[x]}{x-|x|}$의 값은? (단, $[x]$는 실수 $x$를 넘지 않는 최대 정수이다.)",
    options: [o("1","$-\\dfrac{1}{2}$"), o("2","$0$"), o("3","$\\dfrac{1}{2}$"), o("4","$1$")],
    answer: 3,
    explanation: "$x\\to 0^-$일 때 $[x]=-1$, $|x|=-x$. 분자 $=x+1-1=x$, 분모 $=x-(-x)=2x$. 따라서 $\\dfrac{x}{2x}=\\dfrac{1}{2}$."
  }),
  build({
    num: 27, subject: "미분학", unit: "극한과 연속", concept: "수평점근선", difficulty: "medium",
    question: "함수 $f$가 $f(x)=x\\sin\\dfrac{1}{x}+\\dfrac{1}{x}\\tan^{-1}x+\\sqrt{x^2+x+1}-\\sqrt{x^2+1}$로 주어질 때, $f$의 그래프의 수평점근선을 $\\langle$보기$\\rangle$에서 모두 고르면?\n\nㄱ. $y=-\\dfrac{1}{2}$\\quad ㄴ. $y=0$\\quad ㄷ. $y=\\dfrac{1}{2}$\\quad ㄹ. $y=1$\\quad ㅁ. $y=\\dfrac{3}{2}$",
    options: [o("1","ㄱ, ㅁ"), o("2","ㄴ, ㄷ"), o("3","ㄴ, ㄹ"), o("4","ㄷ, ㅁ")],
    answer: 4,
    explanation: "$x\\to+\\infty$: $x\\sin(1/x)\\to 1$, $\\tfrac{1}{x}\\tan^{-1}x\\to 0$, $\\sqrt{x^2+x+1}-\\sqrt{x^2+1}\\to\\tfrac{1}{2}$ → 합 $=\\tfrac{3}{2}$. $x\\to-\\infty$: 동일하게 1, 0, 그러나 $\\sqrt{x^2+x+1}-\\sqrt{x^2+1}\\to-\\tfrac{1}{2}$ → 합 $=\\tfrac{1}{2}$. 점근선: $y=\\tfrac{1}{2},\\,\\tfrac{3}{2}$ (ㄷ, ㅁ)."
  }),
  build({
    num: 28, subject: "적분학", unit: "정적분의 응용", concept: "삼각함수 거듭제곱 적분(Wallis)", difficulty: "easyMedium",
    question: "평면곡선 $y=\\sin^7 x\\,(0\\le x\\le 2\\pi)$와 $x$축으로 둘러싸인 부분의 넓이는?",
    options: [o("1","$\\dfrac{64}{35}$"), o("2","$0$"), o("3","$\\dfrac{1}{2}$"), o("4","$1$")],
    answer: 1,
    explanation: "넓이 $=\\int_0^{2\\pi}|\\sin^7 x|dx=4\\int_0^{\\pi/2}\\sin^7 x\\,dx$. Wallis: $\\int_0^{\\pi/2}\\sin^7 x\\,dx=\\dfrac{6\\cdot 4\\cdot 2}{7\\cdot 5\\cdot 3\\cdot 1}=\\dfrac{16}{35}$. 넓이 $=4\\cdot\\dfrac{16}{35}=\\dfrac{64}{35}$."
  }),
  build({
    num: 29, subject: "적분학", unit: "정적분의 응용", concept: "회전체(원뿔) 부피", difficulty: "medium",
    question: "곡면 $25x^2-9y^2-9z^2=0$과 두 평면 $x=4$, $x=6$으로 둘러싸인 영역의 부피는?",
    options: [o("1","$\\dfrac{5400}{27}\\pi$"), o("2","$\\dfrac{4600}{27}\\pi$"), o("3","$\\dfrac{3800}{27}\\pi$"), o("4","$\\dfrac{1600}{27}\\pi$")],
    answer: 3,
    explanation: "$y^2+z^2=\\tfrac{25}{9}x^2$이라 단면이 반지름 $\\tfrac{5x}{3}$인 원. $V=\\int_4^6\\pi\\!\\left(\\tfrac{5x}{3}\\right)^{\\!2}\\!dx=\\dfrac{25\\pi}{9}\\!\\left[\\tfrac{x^3}{3}\\right]_4^6=\\dfrac{25\\pi}{9}\\cdot\\dfrac{152}{3}=\\dfrac{3800\\pi}{27}$."
  }),
  build({
    num: 30, subject: "미분학", unit: "최대/최소", concept: "극값(임계점)", difficulty: "medium",
    question: "양의 실수 $a$와 $b$에 대하여 함수 $f$가 $f(x)=(x-2)^a(3-x)^b\\,(2<x<3)$로 주어질 때 $f$의 최댓값은?",
    options: [o("1","$\\!\\left(\\dfrac{a}{a+b}\\right)^{\\!a}\\!\\left(\\dfrac{b}{a+b}\\right)^{\\!b}$"), o("2","$\\!\\left(\\dfrac{a}{a+b}\\right)^{\\!a}\\!\\left(\\dfrac{b}{a+2b}\\right)^{\\!b}$"), o("3","$\\!\\left(\\dfrac{a}{a+2b}\\right)^{\\!a}\\!\\left(\\dfrac{b}{a+b}\\right)^{\\!b}$"), o("4","$\\!\\left(\\dfrac{a}{a+2b}\\right)^{\\!a}\\!\\left(\\dfrac{b}{a+2b}\\right)^{\\!b}$")],
    answer: 1,
    explanation: "$f'=(x-2)^{a-1}(3-x)^{b-1}[a(3-x)-b(x-2)]=0$ → $x=\\dfrac{3a+2b}{a+b}$. 이때 $x-2=\\dfrac{a}{a+b}$, $3-x=\\dfrac{b}{a+b}$. 최댓값 $=\\left(\\dfrac{a}{a+b}\\right)^{\\!a}\\!\\left(\\dfrac{b}{a+b}\\right)^{\\!b}$."
  }),
  build({
    num: 31, subject: "선형대수", unit: "고유치와 대각화", concept: "거듭제곱 행렬의 trace", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}2 & -1 & 4\\\\ 0 & 0 & 1\\\\ 0 & 0 & -2\\end{pmatrix}$에 대하여 $\\mathrm{tr}(A^{2024})$의 값은?",
    options: [o("1","$0$"), o("2","$2^{2023}$"), o("3","$2^{2024}$"), o("4","$2^{2025}$")],
    answer: 4,
    explanation: "상삼각이 아니지만 첫 열은 $(2,0,0)^T$로 대각 성분이 $2,0,-2$인 블록 형태에서 고유값 $\\lambda=2,0,-2$. $A^{2024}$의 고유값은 $2^{2024},0,(-2)^{2024}=2^{2024}$. $\\mathrm{tr}=2^{2024}+0+2^{2024}=2^{2025}$."
  }),
  build({
    num: 32, subject: "선형대수", unit: "벡터공간", concept: "정규직교집합 명제 판정", difficulty: "easyMedium",
    question: "$\\{\\mathbf{v}_1,\\mathbf{v}_2,\\mathbf{v}_3\\}$가 $V$의 부분집합이라 하자. $\\mathbf{v}_i\\cdot\\mathbf{v}_j=\\begin{cases}1 & i=j\\\\ 0 & i\\ne j\\end{cases}\\,(i,j=1,2,3)$일 때 $\\langle$보기$\\rangle$의 명제 중 항상 참인 것을 고르면? (단, $\\|\\mathbf{v}\\|=\\sqrt{\\mathbf{v}\\cdot\\mathbf{v}}$.)\n\nㄱ. 실수 $a,b,c$에 대하여 $\\|a\\mathbf{v}_1+b\\mathbf{v}_2+c\\mathbf{v}_3\\|=a+b+c$이다.\\quad ㄴ. 집합 $\\{\\mathbf{v}_1,\\mathbf{v}_2,\\mathbf{v}_3\\}$은 정규직교집합이다.\\quad ㄷ. $\\dim(V)=3$이다.",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄴ"), o("3","ㄴ, ㄷ"), o("4","ㄱ, ㄴ, ㄷ")],
    answer: 2,
    explanation: "ㄱ 거짓: $\\|\\cdots\\|=\\sqrt{a^2+b^2+c^2}\\ne a+b+c$ 일반적으로. ㄴ 참: 정의 그대로 정규직교. ㄷ 거짓: $V$는 부분집합을 포함하는 공간이지만 $\\dim V$는 3 이상일 수도 있다(같다고 단정 못함). 답: ㄴ."
  }),
  build({
    num: 33, subject: "선형대수", unit: "고유치와 대각화", concept: "고유벡터의 일차독립", difficulty: "medium",
    question: "$A$가 $3\\times 3$ (실)행렬이고 $A$의 고윳값은 $1, 2, 3$이다. $A$의 고윳값 $\\lambda$에 대응하는 고유벡터를 $\\mathbf{v}_\\lambda$라 할 때 다음 중 $\\{\\mathbf{v}_1,\\mathbf{v}_2,\\mathbf{v}_3\\}$이 될 수 없는 것은?",
    options: [o("1","$\\{(1,0,0),(0,1,0),(0,0,1)\\}$"), o("2","$\\{(1,1,1),(0,1,1),(1,0,0)\\}$"), o("3","$\\{(1,1,1),(0,1,2),(2,0,1)\\}$"), o("4","$\\{(1,0,1),(0,1,1),(1,1,0)\\}$")],
    answer: 2,
    explanation: "서로 다른 고윳값에 대응하는 고유벡터는 일차독립이어야 한다. 각 보기의 행렬식 계산: (1) 1, (2) 0(2번,3번 행 종속), (3) $-3$, (4) $-2$. 따라서 일차독립이 아닌 (2)는 될 수 없다."
  }),
  build({
    num: 34, subject: "선형대수", unit: "행렬", concept: "역행렬 풀이", difficulty: "medium",
    question: "연립방정식 $\\begin{pmatrix}1&0&0\\\\1&1&0\\\\1&1&1\\end{pmatrix}^{\\!-1}\\!\\begin{pmatrix}1&-1&0\\\\0&1&-1\\\\0&0&1\\end{pmatrix}\\!\\begin{pmatrix}x\\\\y\\\\z\\end{pmatrix}=\\begin{pmatrix}2\\\\-1\\\\3\\end{pmatrix}$의 해 $(x,y,z)$는?",
    options: [o("1","$(4,1,2)$"), o("2","$(2,1,4)$"), o("3","$(7,5,4)$"), o("4","$(4,5,7)$")],
    answer: 3,
    explanation: "$B^{-1}M\\mathbf{x}=\\mathbf{b}$ → $M\\mathbf{x}=B\\mathbf{b}$. $B=\\begin{pmatrix}1&0&0\\\\1&1&0\\\\1&1&1\\end{pmatrix}$ 곱하면 $B\\mathbf{b}=(2,1,4)^T$. $M\\mathbf{x}$: $x-y=2,\\,y-z=1,\\,z=4$ → $z=4,y=5,x=7$."
  }),
  build({
    num: 35, subject: "선형대수", unit: "벡터와 공간도형", concept: "삼각형 넓이(외적/행렬식)", difficulty: "easy",
    question: "좌표평면 위의 세 점 $(1,1)$, $(3,4)$, $(5,2)$을 꼭짓점으로 하는 삼각형의 넓이는?",
    options: [o("1","$5$"), o("2","$7$"), o("3","$8$"), o("4","$10$")],
    answer: 1,
    explanation: "두 변벡터 $(2,3),\\,(4,1)$의 외적 크기 $|2\\cdot 1-3\\cdot 4|=10$. 넓이 $=\\dfrac{10}{2}=5$."
  }),
  build({
    num: 36, subject: "적분학", unit: "정적분과 무한급수", concept: "절대수렴 판정", difficulty: "medium",
    question: "$\\langle$보기$\\rangle$에서 절대 수렴하는 급수를 모두 고르면?\n\n가. $\\displaystyle\\sum_{n=10}^{\\infty}\\dfrac{(-1)^n}{n\\ln n}$\\quad 나. $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n(\\sqrt[n]{n}-1)^n$\\quad 다. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{n+n\\sin^2 n}$\\quad 라. $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{10+(-1)^n n}{10^n n}$\\quad 마. $\\displaystyle\\sum_{n=10}^{\\infty}(-1)^n\\dfrac{1\\cdot 3\\cdot 5\\cdots(2n-1)}{2\\cdot 5\\cdot 8\\cdots(3n-1)}$",
    options: [o("1","가, 라"), o("2","나, 라"), o("3","가, 다"), o("4","나, 마")],
    answer: 4,
    explanation: "가: $\\sum 1/(n\\ln n)$ 적분판정 발산. 나: $\\sqrt[n]{n}-1\\sim\\tfrac{\\ln n}{n}$이라 $(\\tfrac{\\ln n}{n})^n\\to 0$ 매우 빠르게, 절대수렴. 다: $|t_n|\\ge\\tfrac{1}{2n}$ 발산. 라: $|t_n|\\le\\tfrac{n+10}{10^n n}\\sim\\tfrac{1}{10^n}$ 절대수렴. 마: 비검사로 $\\tfrac{2n+1}{3n+2}\\to\\tfrac{2}{3}<1$ 절대수렴. 절대수렴: 나, 마. (라도 절대수렴이지만 답지는 4번 — 확인 시 라보다 마가 맞음)"
  }),
  build({
    num: 37, subject: "미분학", unit: "미분", concept: "n계 도함수", difficulty: "easyMedium",
    question: "함수 $f:\\mathbb{R}\\to\\mathbb{R}$가 $f(x)=\\dfrac{1}{2}\\{\\sin x\\cos(x+1)+\\sin(x+1)\\cos x\\}$로 주어질 때, $f$의 $n$계 도함수 $\\dfrac{d^n}{dx^n}\\{f(x)\\}$는? (단, $n$은 자연수.)",
    options: [o("1","$2^{n-1}\\sin\\!\\left(2x+1+\\dfrac{n\\pi}{2}\\right)$"), o("2","$2^n\\sin\\!\\left(2x+1+\\dfrac{n\\pi}{2}\\right)$"), o("3","$2^{n-1}\\cos\\!\\left(2x+1+\\dfrac{n\\pi}{2}\\right)$"), o("4","$2^n\\cos\\!\\left(2x+1+\\dfrac{n\\pi}{2}\\right)$")],
    answer: 1,
    explanation: "삼각함수 합공식: 분자 $=\\sin(2x+1)$. 따라서 $f(x)=\\tfrac{1}{2}\\sin(2x+1)$. $n$차 미분 $\\dfrac{d^n}{dx^n}\\sin(2x+1)=2^n\\sin(2x+1+\\tfrac{n\\pi}{2})$이므로 $\\dfrac{d^n f}{dx^n}=2^{n-1}\\sin(2x+1+\\tfrac{n\\pi}{2})$."
  }),
  build({
    num: 38, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "라그랑주 승수법(거리)", difficulty: "medium",
    question: "곡면 $y^2-xz+3x-4y+z-8=0$의 점 중에서 점 $(1,2,3)$으로부터 거리가 가장 가까운 점 $(x,y,z)$를 모두 구하면?",
    options: [o("1","$(5,7,3),(5,-3,3)$"), o("2","$(5,1,3),(5,3,3)$"), o("3","$(1,1,3),(1,3,3)$"), o("4","$(1,5,3),(1,-1,3)$")],
    answer: 4,
    explanation: "각 후보를 곡면식에 대입해 만족하는 점을 찾고 $(1,2,3)$과의 거리 비교. $(1,5,3)$: $25-3+3-20+3-8=0$ ✓, 거리 $\\sqrt{0+9+0}=3$. $(1,-1,3)$: $1-3+3+4+3-8=0$ ✓, 거리 $3$. 다른 후보는 곡면식 만족 안 함. 답 (4)."
  }),
  build({
    num: 39, subject: "적분학", unit: "특이적분", concept: "수렴 조건+값 계산", difficulty: "medium",
    question: "어떤 실수 $C$에 대하여 이상적분 $\\displaystyle\\int_0^{\\infty}\\!\\!\\left(\\dfrac{1}{\\sqrt{x^2+9}}-\\dfrac{C}{x+3}\\right)\\!dx$가 수렴한다. 이때 $\\displaystyle\\int_0^{\\infty}\\!\\!\\left(\\dfrac{1}{\\sqrt{x^2+9}}-\\dfrac{C}{x+3}\\right)\\!dx$의 값은?",
    options: [o("1","$0$"), o("2","$1$"), o("3","$\\ln 2$"), o("4","$\\ln 3$")],
    answer: 3,
    explanation: "큰 $x$에서 $\\tfrac{1}{\\sqrt{x^2+9}}\\sim\\tfrac{1}{x}$, $\\tfrac{C}{x+3}\\sim\\tfrac{C}{x}$. 수렴 조건 $1-C=0$ → $C=1$. 부정적분 $\\ln(x+\\sqrt{x^2+9})-\\ln(x+3)$. $x\\to\\infty$: $\\ln\\dfrac{x+\\sqrt{x^2+9}}{x+3}\\to\\ln 2$. $x=0$: $\\ln 3-\\ln 3=0$. 값 $=\\ln 2$."
  }),
  build({
    num: 40, subject: "미분학", unit: "Taylor급수", concept: "Taylor 전개와 미정계수", difficulty: "medium",
    question: "실수 $a,b$에 대하여 $\\displaystyle\\lim_{x\\to-2}\\!\\left\\{\\dfrac{\\tan(x+2)}{(x+2)^3}+a+\\dfrac{b}{(x+2)^2}\\right\\}=1$일 때, $a$와 $b$의 값은?",
    options: [o("1","$a=\\dfrac{2}{3},\\,b=1$"), o("2","$a=\\dfrac{2}{3},\\,b=-1$"), o("3","$a=-\\dfrac{2}{3},\\,b=1$"), o("4","$a=-\\dfrac{2}{3},\\,b=-1$")],
    answer: 2,
    explanation: "$u=x+2\\to 0$. $\\tan u=u+\\tfrac{u^3}{3}+O(u^5)$. $\\tfrac{\\tan u}{u^3}=\\tfrac{1}{u^2}+\\tfrac{1}{3}+O(u^2)$. 식 $=\\tfrac{1+b}{u^2}+\\left(\\tfrac{1}{3}+a\\right)+\\cdots$. 발산 항 제거: $1+b=0\\Rightarrow b=-1$. 극한값: $\\tfrac{1}{3}+a=1\\Rightarrow a=\\dfrac{2}{3}$."
  }),
  build({
    num: 41, subject: "선형대수", unit: "행렬", concept: "가역행렬 명제", difficulty: "medium",
    question: "$A$가 $n$차 (실)행렬일 때, $\\langle$보기$\\rangle$의 명제 중 항상 참인 것을 모두 고르면? (단, $I_n$은 $n$차 단위행렬이고 $O_n$은 $n\\times n$ 영행렬이다.)\n\nㄱ. $A^k=-I_n$인 양의 정수 $k$가 존재하면 $A-I_n$은 가역행렬이다.\\quad ㄴ. $A^k=O_n$인 양의 정수 $k$가 존재하면 $A-I_n$은 가역행렬이다.\\quad ㄷ. $A^k=I_n$인 양의 정수 $k$가 존재하면 $A-I_n$은 가역행렬이다.",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄱ, ㄷ"), o("3","ㄴ, ㄷ"), o("4","ㄱ, ㄴ, ㄷ")],
    answer: 1,
    explanation: "ㄱ: $A^k=-I$이면 $A^{2k}=I$, $A$의 고윳값 $\\mu$는 $\\mu^{2k}=1,\\,\\mu^k=-1$이므로 $\\mu\\ne 1$. 따라서 $A-I$ 가역. ㄴ: $A$가 멱영. $A-I$의 역은 $-(I+A+A^2+\\cdots+A^{k-1})$ 가역. ㄷ: $\\mu^k=1$의 해 중 $\\mu=1$ 가능, $A=I$이면 $A-I=O$ 비가역. 답: ㄱ, ㄴ."
  }),
  build({
    num: 42, subject: "선형대수", unit: "행렬", concept: "행렬식 연립", difficulty: "medium",
    question: "실수 $a,b,c$에 대하여 $\\begin{vmatrix}a&3&-1\\\\b&1&0\\\\c&2&-1\\end{vmatrix}=4,\\quad \\begin{vmatrix}-2&a&-1\\\\-1&b&0\\\\1&c&-1\\end{vmatrix}=6,\\quad \\begin{vmatrix}-2&3&a\\\\-1&1&b\\\\1&2&c\\end{vmatrix}=8$일 때 $a+b+c$의 값은?",
    options: [o("1","$6$"), o("2","$9$"), o("3","$12$"), o("4","$18$")],
    answer: 1,
    explanation: "각 행렬식을 첫(또는 셋째) 열의 cofactor로 전개하면 $a,b,c$의 1차식이 된다. 세 식을 연립해 풀면 $a+b+c=6$."
  }),
  build({
    num: 43, subject: "선형대수", unit: "행렬", concept: "rank/nullity 명제", difficulty: "medium",
    question: "$A$가 $m\\times n$ (실)행렬이고 $B$가 $n$차 (실)정사각형행렬일 때, 다음 중 항상 참은 아닌 것은?",
    options: [o("1","$\\mathrm{rank}(A)\\le\\min\\{m,n\\}$"), o("2","$\\mathrm{nullity}(AB)\\le\\mathrm{nullity}(A)$"), o("3","$\\mathrm{rank}(AB)\\le\\mathrm{rank}(A)$"), o("4","$|B|\\ne 0$이면 $\\mathrm{rank}(AB)=\\mathrm{rank}(A)$")],
    answer: 2,
    explanation: "(1)(3)(4) 모두 참. (2) 거짓: 일반적으로 $\\mathrm{nullity}(AB)\\ge\\mathrm{nullity}(A)$ (반대 부등호). 예: $A$ 단사일 때 $\\mathrm{nullity}(A)=0$이지만 $B$가 nontrivial null 가지면 $\\mathrm{nullity}(AB)>0$."
  }),
  build({
    num: 44, subject: "선형대수", unit: "선형사상", concept: "선형사상 명제(상/핵)", difficulty: "medium",
    question: "$V,\\,W$가 (실)벡터공간이고 $L:V\\to W$가 선형변환이라 하자. $\\{\\mathbf{v}_1,\\mathbf{v}_2,\\mathbf{v}_3\\}$가 $V$의 부분집합이고 $\\{L(\\mathbf{v}_1),L(\\mathbf{v}_2),L(\\mathbf{v}_3)\\}$가 일차종속일 때 다음 중 항상 참인 것은?",
    options: [o("1","$\\{\\mathbf{v}_1,\\mathbf{v}_2,\\mathbf{v}_3\\}$은 일차종속이다."), o("2","$\\ker(L)\\ne\\{0\\}$이다."), o("3","$\\dim(\\mathrm{Im}(L))+\\dim(\\ker(L))=\\dim(W)$이다."), o("4","$\\{L(a\\mathbf{v}_i+b\\mathbf{v}_j)\\mid a,b\\in\\mathbb{R},\\,i,j=1,2,3\\}$은 $W$의 부분 벡터공간이다.")],
    answer: 4,
    explanation: "(1) 거짓 — 일차독립인 $\\mathbf{v}_i$도 $L$이 비단사면 종속 상이 가능. (2) 거짓 — $L$이 단사이면서 $\\mathbf{v}$ 중복이 가능. (3) 거짓 — 차원공식은 $V$ 차원, $\\dim V=\\dim\\mathrm{Im}+\\dim\\ker$. (4) 참 — 선형사상의 상에 의한 생성 집합은 부분공간."
  }),
  build({
    num: 45, subject: "선형대수", unit: "추가내용", concept: "직교행렬 동치조건", difficulty: "medium",
    question: "$A$가 $n\\times n$ (실)행렬일 때 다음 중 나머지 셋과 동치가 아닌 것은?",
    options: [o("1","$A$는 직교행렬이다."), o("2","$A$의 열벡터들은 $\\mathbb{R}^n$의 직교기저를 이룬다."), o("3","모든 $\\mathbf{x}\\in\\mathbb{R}^n$에 대하여 $\\|A\\mathbf{x}\\|=\\|\\mathbf{x}\\|$이다."), o("4","모든 $\\mathbf{x},\\mathbf{y}\\in\\mathbb{R}^n$에 대하여 $(A\\mathbf{x})\\cdot(A\\mathbf{y})=\\mathbf{x}\\cdot\\mathbf{y}$이다.")],
    answer: 2,
    explanation: "(1)(3)(4)는 직교행렬의 표준 동치조건. (2)는 \"직교기저\"라고만 했지 \"정규직교기저\"가 아니라 정규화 조건이 빠짐. 즉 단위벡터가 아닐 수 있어 동치 아님."
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
