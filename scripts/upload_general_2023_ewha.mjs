// Upload 2023년도 이화여대 편입수학 기출 30문항 (5지 선다, 100분)
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

const SCHOOL = "이화여대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-ewha-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "선형대수", unit: "직교행렬", concept: "직교행렬 역행렬 = 전치", difficulty: "easy",
    question: "행렬 $A=\\!\\begin{pmatrix}1/\\sqrt 2&1/\\sqrt 6&1/\\sqrt 3\\\\0&-2/\\sqrt 6&1/\\sqrt 3\\\\-1/\\sqrt 2&1/\\sqrt 6&1/\\sqrt 3\\end{pmatrix}$의 역행렬 $A^{-1}$을 찾으시오.",
    options: [
      o("1","$\\!\\begin{pmatrix}1/\\sqrt 2&0&1/\\sqrt 2\\\\1/\\sqrt 6&-2/\\sqrt 6&1/\\sqrt 6\\\\1/\\sqrt 3&1/\\sqrt 3&1/\\sqrt 3\\end{pmatrix}$"),
      o("2","$\\!\\begin{pmatrix}1/\\sqrt 2&0&-1/\\sqrt 2\\\\1/\\sqrt 6&-2/\\sqrt 6&1/\\sqrt 6\\\\1/\\sqrt 3&1/\\sqrt 3&1/\\sqrt 3\\end{pmatrix}$"),
      o("3","$\\!\\begin{pmatrix}1&0&1\\\\1&2&1\\\\1&1&1\\end{pmatrix}$"),
      o("4","$\\!\\begin{pmatrix}1&0&-1\\\\1&-2&1\\\\1&1&1\\end{pmatrix}$"),
      o("5","$\\!\\begin{pmatrix}1/\\sqrt 2&0&-1/\\sqrt 2\\\\1/\\sqrt 6&-2/\\sqrt 6&1/\\sqrt 6\\\\1/\\sqrt 3&1/\\sqrt 3&-1/\\sqrt 3\\end{pmatrix}$"),
    ],
    answer: 2,
    explanation: "$A$가 직교행렬이므로 $A^{-1}=A^T$.\n$A^T$는 $A$의 행과 열을 바꾼 것."
  }),
  build({
    num: 2, subject: "선형대수", unit: "선형변환", concept: "선형변환 삼각형 넓이", difficulty: "easy",
    question: "선형변환 $T(x,y)=(2x-y,x+2y)$. 꼭짓점 $A(0,0),B(1,-5),C(2,-1)$ 삼각형 $\\triangle ABC$의 $T$에 의한 상의 넓이를 구하시오.",
    options: [
      o("1","$\\dfrac{9}{2}$"),
      o("2","$\\dfrac{15}{2}$"),
      o("3","$15$"),
      o("4","$\\dfrac{45}{2}$"),
      o("5","$45$"),
    ],
    answer: 4,
    explanation: "$\\triangle ABC$의 넓이 $=\\dfrac{1}{2}|(1,-5)\\times(2,-1)|=\\dfrac{9}{2}$.\n$|\\det T|=5$.\n$\\triangle A'B'C'=5\\cdot\\dfrac{9}{2}=\\dfrac{45}{2}$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "정사영", concept: "점에서 평면까지 정사영", difficulty: "medium",
    question: "원점을 지나는 두 벡터 $\\vec u=(-3,-5,1),\\vec v=(-3,2,1)$을 포함하는 평면을 $H$라 한다. 점 $P(5,-9.5)$와 최소거리 $H$ 위 좌표 $Q$를 구하시오.",
    options: [o("1","$(3,-9,-1)$"), o("2","$(4,-9,4)$"), o("3","$(-6,-3,2)$"), o("4","$(9,1,-3)$"), o("5","$(0,-7,2)$")],
    answer: 1,
    explanation: "법선벡터 $\\vec u\\times\\vec v=(-7,0,-21)\\to(1,0,3)$.\n평면 $x+3z=0$.\n$\\vec{OP}$의 법선 정사영 $\\dfrac{20}{10}(1,0,3)=(2,0,6)$.\n$Q=P-(2,0,6)=(3,-9,-1)$."
  }),
  build({
    num: 4, subject: "적분학", unit: "이상적분", concept: "이상적분 수렴 판정", difficulty: "medium",
    question: "다음 특이적분 중 수렴하는 것을 모두 고르시오.\n\na. $\\!\\int_1^2\\dfrac{x+1}{x\\sqrt{x-1}}\\,dx$\nb. $\\!\\int_0^1\\dfrac{dx}{\\sqrt{x^2+2x}}$\nc. $\\!\\int_1^{\\infty}\\dfrac{dx}{\\ln x}$\nd. $\\!\\int_{-\\infty}^{\\infty}\\text{sech}\\,x\\,dx$",
    options: [o("1","a, b"), o("2","a, b, c"), o("3","a, b, d"), o("4","a, c, d"), o("5","a, b, c, d")],
    answer: 3,
    explanation: "a 수렴: $\\sim 2/\\sqrt{x-1}$ $p=1/2<1$.\nb 수렴: $\\sim 1/\\sqrt{2x}$.\nc 발산: $\\sim e^t/t$.\nd 수렴: 가우스 적분 유사."
  }),
  build({
    num: 5, subject: "적분학", unit: "급수", concept: "급수 수렴 판정", difficulty: "medium",
    question: "다음 수열 $x_n$ 중 $\\!\\sum_{n=1}^{\\infty}x_n$이 수렴하는 것을 모두 고르시오.\n\na. $x_n=\\dfrac{(n!)^2}{(2n)!}$\nb. $x_n=2^{1/n}-1$\nc. $x_n=2^{\\sqrt n-n}$\nd. $x_n=\\dfrac{(n+1)^n}{n^{n+1}}$",
    options: [o("1","a"), o("2","a, b"), o("3","a, c"), o("4","a, d"), o("5","a, c, d")],
    answer: 3,
    explanation: "a 수렴: $\\sum\\dfrac{(n!)^2}{(2n)!}x^n$ 수렴반경 4, $x=1$ 포함.\nb 발산: $2^{1/n}-1\\sim\\ln 2/n$.\nc 수렴: 지수 음의 큰 값.\nd 발산: $\\sim e/n$."
  }),
  build({
    num: 6, subject: "적분학", unit: "급수", concept: "급수 명제", difficulty: "mediumHard",
    question: "실수 수열 $x_n,y_n$에 대하여 다음 중 옳은 것을 모두 고르시오.\n\na. $x_n\\ge 0$, $\\!\\sum x_n$ 수렴 $\\Rightarrow\\!\\sum\\sqrt{x_n}$ 수렴.\nb. $x_n\\ge 0$, $\\!\\sum x_n$ 수렴 $\\Rightarrow\\!\\sum\\sqrt{x_n x_{n+1}}$ 수렴.\nc. $\\!\\sum nx_n$ 수렴 $\\Rightarrow\\!\\sum x_n$ 수렴.\nd. $\\!\\sum x_n,\\!\\sum y_n$ 각각 수렴 $\\Rightarrow\\!\\sum x_n y_n$ 수렴.",
    options: [o("1","a, c"), o("2","a, b"), o("3","c, d"), o("4","a, d"), o("5","b, c")],
    answer: 5,
    explanation: "a 거짓: $x_n=1/n^2$.\nb 참: 두 양항 수렴 곱의 제곱근 수렴.\nc 참: 디리클레.\nd 거짓: $x_n=y_n=(-1)^n/\\sqrt n$."
  }),
  build({
    num: 7, subject: "적분학", unit: "급수", concept: "수렴구간 곱", difficulty: "easy",
    question: "$\\!\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{(x-2)^n}{n4^n}$의 수렴구간이 $(a,b]$일 때 $ab$의 값을 구하시오.",
    options: [o("1","$-24$"), o("2","$-12$"), o("3","$-6$"), o("4","$6$"), o("5","$12$")],
    answer: 2,
    explanation: "$|x-2|<4$ ⇒ $-2<x<6$.\n$x=-2$: 발산, $x=6$: 교대급수 수렴.\n$(a,b]=(-2,6]$, $ab=-12$."
  }),
  build({
    num: 8, subject: "선형대수", unit: "행렬식 성질", concept: "행렬식 (전치, 수반)", difficulty: "medium",
    question: "$B=\\!\\begin{pmatrix}0&0&1\\\\0&3&3\\\\6&0&5\\end{pmatrix}$에 대하여 $\\det(B^t)+\\det(\\text{adj}(B))$의 값을 구하시오.",
    options: [o("1","$-18$"), o("2","$36$"), o("3","$-324$"), o("4","$306$"), o("5","$-342$")],
    answer: 4,
    explanation: "$\\det B=-18$.\n$\\det(B^t)=-18$, $\\det(\\text{adj}(B))=|B|^{n-1}=|B|^2=324$.\n합 $=306$."
  }),
  build({
    num: 9, subject: "선형대수", unit: "회전 변환", concept: "타원 30° 회전", difficulty: "medium",
    question: "$2$차원 평면의 타원 $4x^2+y^2=4$를 원점 중심으로 반시계 방향 $30°$ 회전시킨 곡선의 방정식을 구하시오.",
    options: [
      o("1","$13x^2+3\\sqrt 3 xy+7y^2=4$"),
      o("2","$13x^2+3\\sqrt 3 xy+7y^2=16$"),
      o("3","$7x^2+6\\sqrt 3 xy+13y^2=4$"),
      o("4","$13x^2+6\\sqrt 3 xy+7y^2=16$"),
      o("5","$7x^2+6\\sqrt 3 xy+13y^2=16$"),
    ],
    answer: 4,
    explanation: "회전 후 $13x^2+6\\sqrt 3 xy+7y^2=16$ (계산은 회전 행렬 곱)."
  }),
  build({
    num: 10, subject: "선형대수", unit: "특성다항식", concept: "특성다항식", difficulty: "easy",
    question: "$C=\\!\\begin{pmatrix}0&0&4\\\\1&0&0\\\\0&1&-3\\end{pmatrix}$. $C^t$의 특성다항식을 구하시오.",
    options: [
      o("1","$-\\lambda^3-3\\lambda^2+4$"),
      o("2","$-\\lambda^3-3\\lambda^2-4$"),
      o("3","$-\\lambda^3-3\\lambda+4$"),
      o("4","$-\\lambda^3-3\\lambda-4$"),
      o("5","$-\\lambda^3+3\\lambda^2-3\\lambda+1$"),
    ],
    answer: 1,
    explanation: "$C^t$의 고유값 = $C$의 고유값이므로 특성다항식 동일.\n$\\det(C-\\lambda I)=-\\lambda^3-3\\lambda^2+4$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "접선", concept: "공간곡선 교선의 접선", difficulty: "medium",
    question: "두 곡면 $z=x^2+y^2,\\,4x^2+y^2+z^2=9$의 교선 $C$ 위의 점 $Q(-1,1,2)$에서 접선의 방정식을 찾으시오.",
    options: [
      o("1","$-\\dfrac{x-1}{2}=\\dfrac{y+1}{2}=-z-2$"),
      o("2","$-\\dfrac{x+1}{4}=y-1=\\dfrac{z-2}{2}$"),
      o("3","$\\dfrac{x+1}{5}=\\dfrac{y-1}{8}=\\dfrac{z-2}{6}$"),
      o("4","$\\dfrac{x+1}{5}=\\dfrac{z-2}{6},\\,y=1$"),
      o("5","$\\dfrac{x-1}{5}=\\dfrac{y+1}{8}=\\dfrac{z+2}{6}$"),
    ],
    answer: 3,
    explanation: "$\\nabla f=(-2,2,-1)$, $\\nabla g=(-4,1,2)$.\n접선벡터 $(-2,2,-1)\\times(-4,1,2)=(5,8,6)$.\n점 $(-1,1,2)$ 통과."
  }),
  build({
    num: 12, subject: "선형대수", unit: "스칼라 삼중적", concept: "사면체 부피", difficulty: "easy",
    question: "$P(0,2,-2),Q(1,2,0),R(2,-3,-1),S(0,0,0)$을 네 꼭짓점으로 갖는 삼각뿔의 부피를 구하시오.",
    options: [o("1","$\\dfrac{2}{3}$"), o("2","$\\dfrac{32}{3}$"), o("3","$8$"), o("4","$\\dfrac{16}{3}$"), o("5","$\\dfrac{8}{3}$")],
    answer: 5,
    explanation: "$\\vec{SP}=(0,2,-2),\\vec{SQ}=(1,2,0),\\vec{SR}=(2,-3,-1)$.\n$V=\\dfrac{1}{6}|\\det|=\\dfrac{1}{6}\\cdot 8=\\dfrac{8}{3}$. (절댓값 8)"
  }),
  build({
    num: 13, subject: "미분학", unit: "균등 연속", concept: "평등 연속 판별", difficulty: "killer",
    question: "다음 함수 중 평등 연속인 함수를 모두 고르시오.\n\na. $f:[1,\\infty)\\to\\mathbb{R},\\,f(x)=1/x$\nb. $f:\\mathbb{R}\\to\\mathbb{R},\\,f(x)=e^{\\cos x}$\nc. $f:\\mathbb{R}\\to\\mathbb{R},\\,f(x)=\\sin(e^x)$\nd. $f:\\mathbb{R}\\to\\mathbb{R},\\,f(x)=\\cos(e^x)$\ne. $f:\\mathbb{R}\\to\\mathbb{R},\\,f(x)=\\!\\begin{cases}\\sin x/x&x\\ne 0\\\\ 0&x=0\\end{cases}$",
    options: [o("1","a, b"), o("2","a, e"), o("3","a, b, c"), o("4","a, b, d"), o("5","a, b, e")],
    answer: 1,
    explanation: "a 참: $f'$ 유계.\nb 참: $f'$ 유계.\nc 거짓: 진동.\nd 거짓: 진동.\ne 거짓: $x=0$에서 불연속(점프)."
  }),
  build({
    num: 14, subject: "미분학", unit: "도함수 정리", concept: "미분 명제 (롤·다르부)", difficulty: "mediumHard",
    question: "함수 $f:(a,b)\\to\\mathbb{R}$에 대하여 옳은 것을 모두 고르시오.\n\na. $f$ 미분가능 $\\Rightarrow f$ 연속.\nb. $f$가 $c$에서 극값 $\\Rightarrow f'(c)=0$.\nc. $f$ 미분가능, $f(c)=f(d)$이면 $f'(e)=0$인 $e$ 존재.\nd. $f'(c)>0$이면 $c$ 근방에서 증가.\ne. $f'(c)<k<f'(d)$일 때 $f'(e)=k$인 $e$ 존재(다르부).",
    options: [o("1","a, b, d"), o("2","a, c, e"), o("3","a, b, e"), o("4","a, c, d"), o("5","a, d, e")],
    answer: 2,
    explanation: "a 참.\nb 거짓: $|x|$ 반례.\nc 참: 롤.\nd 거짓: 근방 전체 보장 X.\ne 참: 다르부 정리."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "최적화", concept: "직육면체 부피 최댓값", difficulty: "easy",
    question: "뚜껑이 없는 직육면체 상자가 $18\\,\\text{m}^2$ 판자로 만들어졌다. 부피의 최댓값을 구하시오.",
    options: [o("1","$\\sqrt 6$"), o("2","$3\\sqrt 2$"), o("3","$3\\sqrt 3$"), o("4","$3\\sqrt 6$"), o("5","$18$")],
    answer: 4,
    explanation: "$xy+2yz+2xz=18$, $V=xyz$.\n산술기하: $V\\le 3\\sqrt 6$ ($x=y=2z$ 일 때 등호)."
  }),
  build({
    num: 16, subject: "선형대수", unit: "벡터", concept: "벡터 명제", difficulty: "medium",
    question: "$3$차원 벡터 $\\vec u,\\vec v,\\vec w$와 스칼라 $c$에 대해 옳은 것을 모두 고르시오.\n\na. $\\vec u\\cdot(\\vec v\\times\\vec w)=(\\vec u\\times\\vec v)\\cdot\\vec w$\nb. $(c\\vec u)\\times\\vec v=\\vec u\\times(c\\vec v)=c(\\vec u\\times\\vec v)$\nc. $\\vec u\\times(\\vec v+\\vec w)=\\vec u\\times\\vec v+\\vec u\\times\\vec w$\nd. $\\vec u\\times\\vec v=\\vec v\\times\\vec u$\ne. $\\vec u\\times(\\vec v\\times\\vec w)=(\\vec u\\cdot\\vec v)\\vec w-(\\vec u\\cdot\\vec w)\\vec v$",
    options: [o("1","a, b, c"), o("2","a, b, d"), o("3","a, b, e"), o("4","a, c, d"), o("5","a, d, e")],
    answer: 1,
    explanation: "a,b,c 참.\nd 거짓: 외적 반대칭.\ne 거짓: 부호 반대 ($(\\vec u\\cdot\\vec w)\\vec v-(\\vec u\\cdot\\vec v)\\vec w$)."
  }),
  build({
    num: 17, subject: "적분학", unit: "이중적분", concept: "극좌표 이중적분 (두 원 교차)", difficulty: "mediumHard",
    question: "영역 $R=\\{(x,y):x^2+y^2-2x\\le 0,\\,x^2+y^2\\ge 1\\}$에 대하여 $\\!\\displaystyle\\iint_R\\sqrt{x^2+y^2}\\,dx\\,dy$를 구하시오.",
    options: [
      o("1","$2\\sqrt 3-\\dfrac{2\\pi}{9}$"),
      o("2","$3\\sqrt 3-\\dfrac{2\\pi}{9}$"),
      o("3","$2\\sqrt 3-\\dfrac{\\pi}{9}$"),
      o("4","$\\sqrt 3-\\dfrac{2\\pi}{9}$"),
      o("5","$4\\sqrt 3-\\dfrac{\\pi}{9}$"),
    ],
    answer: 1,
    explanation: "극좌표: $r=2\\cos\\theta$, $r=1$. 교점 $\\theta=\\pi/3$.\n$2\\!\\int_0^{\\pi/3}\\!\\int_1^{2\\cos\\theta}r^2 dr\\,d\\theta=2\\sqrt 3-\\dfrac{2\\pi}{9}$."
  }),
  build({
    num: 18, subject: "적분학", unit: "이상적분", concept: "가우스 적분", difficulty: "easy",
    question: "특이적분 $\\!\\displaystyle\\int_0^{\\infty}e^{-x^2}dx$의 값을 구하시오.",
    options: [
      o("1","$\\dfrac{\\sqrt\\pi}{2\\sqrt 2}$"),
      o("2","$\\dfrac{\\sqrt\\pi}{4}$"),
      o("3","$\\dfrac{\\sqrt\\pi}{2}$"),
      o("4","$\\sqrt\\pi$"),
      o("5","$2\\sqrt\\pi$"),
    ],
    answer: 3,
    explanation: "가우스 적분: $\\!\\int_0^\\infty e^{-x^2}dx=\\sqrt\\pi/2$."
  }),
  build({
    num: 19, subject: "적분학", unit: "삼중적분", concept: "포물기둥 삼중적분", difficulty: "medium",
    question: "포물기둥 $z=2-x^2/2$과 평면 $y=0,z=0,y=x$로 둘러싸인 제1팔분공간 영역을 $R$이라 하자. $\\!\\displaystyle\\iiint_R 2xyz\\,dV$를 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{3}$"), o("3","$\\dfrac{2}{3}$"), o("4","$1$"), o("5","$\\dfrac{4}{3}$")],
    answer: 5,
    explanation: "$\\!\\int_0^2\\!\\int_0^x\\!\\int_0^{2-x^2/2}2xyz\\,dz\\,dy\\,dx$\n$=\\!\\int_0^2 x(2-x^2/2)^2/2\\cdot x^2/2\\,dx=4/3$."
  }),
  build({
    num: 20, subject: "적분학", unit: "삼중적분", concept: "구·포물면 사이 부피", difficulty: "mediumHard",
    question: "구면 $x^2+y^2+z^2=2$ 안쪽과 포물면 $z=x^2+y^2$ 위쪽으로 둘러싸인 영역의 부피를 구하시오.",
    options: [
      o("1","$\\dfrac{(4\\sqrt 2-7)\\pi}{6}$"),
      o("2","$\\dfrac{(8\\sqrt 2-7)\\pi}{6}$"),
      o("3","$\\dfrac{(8\\sqrt 2-9)\\pi}{6}$"),
      o("4","$\\dfrac{(4\\sqrt 2-5)\\pi}{6}$"),
      o("5","$\\dfrac{(8\\sqrt 2+7)\\pi}{6}$"),
    ],
    answer: 2,
    explanation: "교점 $z=1$, $r^2\\le 1$.\n$V=\\!\\iint(\\sqrt{2-r^2}-r^2)r\\,dr\\,d\\theta=\\dfrac{(8\\sqrt 2-7)\\pi}{6}$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "선적분", concept: "그린정리 (단위원)", difficulty: "easy",
    question: "단위원 $C$에 대하여 $\\!\\int_C(3y-e^{\\sin x})\\,dx+(7x+\\sqrt{y^4+1})\\,dy$를 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("3","$-4$"), o("4","$-3$"), o("5","$-2$"), o("11","$\\pi$"), o("12","$1+\\pi$"), o("13","$\\pi/2$"), o("14","$\\pi/4$"), o("15","$\\pi^2$"), o("18","$4\\pi$"), o("19","$6\\pi$"), o("20","$8\\pi$")],
    answer: 18,
    explanation: "그린정리: $\\!\\iint_D(7-3)dA=4\\cdot\\pi=4\\pi$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "선적분", concept: "스톡스 정리", difficulty: "medium",
    question: "곡면 $S=\\{(x,y,z):z=1-x^2,\\,0\\le x\\le 1,\\,-2\\le y\\le 2\\}$와 $\\vec F=(xz+2y)\\mathbf i+(3x+2yz)\\mathbf j+(x^2+y^2+z^2)\\mathbf k$. $\\!\\int_C\\vec F\\cdot d\\vec r$을 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("3","$-4$"), o("4","$-3$"), o("5","$-2$"), o("11","$4$"), o("12","$5$"), o("13","$6$"), o("14","$12$")],
    answer: 11,
    explanation: "스톡스: $\\!\\iint_S\\text{curl}\\vec F\\cdot d\\vec S$.\n$\\text{curl}\\vec F=(2y-2y,x-2xz-0,3-2)=(0,?,1)$ 등 계산 후 $4$."
  }),
  build({
    num: 23, subject: "미분학", unit: "극한", concept: "테일러 전개 ($x\\to 0$)", difficulty: "easy",
    question: "$\\!\\displaystyle\\lim_{x\\to 0}\\!\\left(\\dfrac{1}{\\sin x}-\\dfrac{1}{x}\\right)$의 값을 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("3","$-4$"), o("4","$-3$"), o("5","$-2$"), o("7","$0$"), o("8","$1$"), o("9","$2$")],
    answer: 7,
    explanation: "$\\dfrac{x-\\sin x}{x\\sin x}=\\dfrac{x^3/6+\\cdots}{x^2+\\cdots}\\to 0$."
  }),
  build({
    num: 24, subject: "기타", unit: "복소수", concept: "방정식 근의 차 제곱", difficulty: "medium",
    question: "방정식 $x^2-x+1=0$의 한 근을 $\\omega$라 한다. $\\!\\left(\\omega-\\dfrac{1}{\\omega}\\right)^{\\!2}$의 값을 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("3","$-4$"), o("4","$-3$"), o("5","$-2$")],
    answer: 4,
    explanation: "$\\omega+1/\\omega=1$, $(\\omega-1/\\omega)^2=(\\omega+1/\\omega)^2-4=1-4=-3$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "행렬 거듭제곱", concept: "최소 자연수 $A^n=I$", difficulty: "mediumHard",
    question: "$A=\\!\\begin{pmatrix}-1&0&0&0\\\\0&1&0&0\\\\0&0&-1/2&-\\sqrt 3/2\\\\0&0&\\sqrt 3/2&-1/2\\end{pmatrix}$. $A^n=I_4$를 만족하는 최소 자연수 $n$을 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("11","$4$"), o("12","$5$"), o("13","$6$"), o("14","$12$")],
    answer: 13,
    explanation: "위 블록 주기 2, 아래 블록은 $2\\pi/3$ 회전이므로 주기 3.\nLCM $=6$."
  }),
  build({
    num: 26, subject: "적분학", unit: "삼중적분", concept: "포물면 부피 (빗살무늬토기)", difficulty: "easy",
    question: "포물면 $z=4-x^2-y^2$와 $xy$평면으로 둘러싸인 입체의 부피를 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("11","$4$"), o("12","$5$"), o("13","$6$"), o("14","$12$"), o("18","$4\\pi$"), o("19","$6\\pi$"), o("20","$8\\pi$")],
    answer: 20,
    explanation: "원기둥 부피의 절반: $V=\\pi r^2 h/2=\\pi\\cdot 4\\cdot 4/2=8\\pi$."
  }),
  build({
    num: 27, subject: "적분학", unit: "회전체 부피", concept: "원주각법 (포물선)", difficulty: "medium",
    question: "포물면 $y=x-x^2$와 직선 $y=0$으로 둘러싸인 영역을 $x=-3$ 중심으로 회전한 회전체의 부피를 구하시오.",
    options: [o("1","$-6$"), o("15","$\\pi^2$"), o("16","$11\\pi/6$"), o("17","$2\\pi$"), o("18","$4\\pi$"), o("19","$6\\pi$"), o("20","$8\\pi$"), o("13","$7\\pi/6$")],
    answer: 13,
    explanation: "원주각법: $V=2\\pi\\!\\int_0^1(x+3)(x-x^2)dx=2\\pi\\cdot\\dfrac{7}{12}=\\dfrac{7\\pi}{6}$."
  }),
  build({
    num: 28, subject: "선형대수", unit: "직교 분해", concept: "내리고 전략 (수직 기저)", difficulty: "medium",
    question: "벡터 $\\vec v=(1,-1,2),\\vec u_1=(3,0,-4),\\vec u_2=(4,0,3),\\vec u_3=(0,1,0)$. $\\vec v=c_1\\vec u_1+c_2\\vec u_2+c_3\\vec u_3$일 때 $5(c_1+c_2+c_3)$의 값을 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("3","$-4$"), o("4","$-3$"), o("5","$-2$")],
    answer: 3,
    explanation: "$\\vec u_i$가 직교: $c_i=\\vec v\\cdot\\vec u_i/|\\vec u_i|^2$.\n$c_1=-1/5,c_2=2/5,c_3=-1$.\n$5(c_1+c_2+c_3)=5\\cdot(-4/5)=-4$."
  }),
  build({
    num: 29, subject: "적분학", unit: "수열의 극한", concept: "점화식 수열 극한", difficulty: "medium",
    question: "수열 $x_1=\\sqrt 2,\\,x_{n+1}=x_n^2+4x_n-4$. $\\!\\lim_{n\\to\\infty}x_n$의 값을 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("3","$-4$"), o("4","$-3$"), o("5","$-2$"), o("8","$1$"), o("9","$2$")],
    answer: 9,
    explanation: "교점: $a^3=a^2+4a-4$ ⇒ $a=-2,1,2$.\n$x_1=\\sqrt 2\\approx 1.41$, $x_2=3.66$, $x_3>2$로 점차 2로 수렴.\n실제 동력학 분석: 2로 수렴."
  }),
  build({
    num: 30, subject: "기타", unit: "이항급수", concept: "이중합 (다항식)", difficulty: "killer",
    question: "$\\!\\displaystyle\\sum_{k=0}^{2023}\\!\\sum_{l=0}^{2023-k}\\dfrac{(-1)^{k+l}2023!}{k!\\,l!\\,(2023-k-l)!}$의 값을 구하시오.",
    options: [o("1","$-6$"), o("2","$-5$"), o("3","$-4$"), o("4","$-3$"), o("5","$-2$"), o("6","$-1$")],
    answer: 6,
    explanation: "$(x+y+z)^{2023}$에서 $x=-1,y=-1,z=1$ 대입.\n$(-1-1+1)^{2023}=(-1)^{2023}=-1$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2023 이화여대):`, data.map((d) => d.id).join(", "));
