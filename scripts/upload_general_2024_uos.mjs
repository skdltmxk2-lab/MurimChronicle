// Upload 2024년도 서울시립대 편입수학 기출 30문항 (25 객관식 + 5 주관식, 90분)
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

const SCHOOL = "서울시립대";
const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation, questionType = "multiple_choice", answerText = "" }) {
  const id = `q-${YEAR}-uos-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  const isSubjective = questionType === "subjective";
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options: isSubjective ? [] : options, correct_option_id: isSubjective ? "" : String(answer), answer_text: isSubjective ? answerText : null, question_type: questionType, explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "공학수학", unit: "쌍곡함수", concept: "쌍곡함수 항등식", difficulty: "easy",
    question: "$\\text{sech}\\,x=\\dfrac{2}{3}$일 때 $\\tanh x$의 값은? (단, $x>0$)",
    options: [o("1","$\\dfrac{\\sqrt 5}{3}$"), o("2","$\\dfrac{\\sqrt 5}{2}$"), o("3","$\\dfrac{\\sqrt{13}}{2}$"), o("4","$\\dfrac{2\\sqrt 5}{5}$"), o("5","$\\dfrac{3\\sqrt 5}{5}$")],
    answer: 1,
    explanation: "$-\\tanh^2 x+1=\\text{sech}^2 x$. $\\text{sech}\\,x=\\dfrac{2}{3}$ ⇒ $\\tanh^2 x=1-\\dfrac{4}{9}=\\dfrac{5}{9}$.\n$x>0$이므로 $\\tanh x=\\dfrac{\\sqrt 5}{3}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "음함수 미분", difficulty: "easy",
    question: "곡선 $\\ln(x^2+y^2)-xy^2=0$ 위의 점 $(0,1)$에서 접선의 기울기는?",
    options: [o("1","$-\\dfrac{3}{2}$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$\\dfrac{3}{2}$")],
    answer: 4,
    explanation: "$F=\\ln(x^2+y^2)-xy^2$. $F_x=\\dfrac{2x}{x^2+y^2}-y^2,\\,F_y=\\dfrac{2y}{x^2+y^2}-2xy$.\n$(0,1)$에서 $F_x=-1,F_y=2$. 기울기 $=-\\dfrac{-1}{2}=\\dfrac{1}{2}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "도함수", concept: "매개곡선 수평접선", difficulty: "medium",
    question: "곡선 $x=2e^{\\cos t},\\,y=e^{\\sin 3t}\\;(\\dfrac{\\pi}{2}<t<\\pi)$이 수평접선을 가지는 $t$의 값은?",
    options: [o("1","$\\dfrac{11\\pi}{12}$"), o("2","$\\dfrac{5\\pi}{6}$"), o("3","$\\dfrac{3\\pi}{4}$"), o("4","$\\dfrac{2\\pi}{3}$"), o("5","$\\dfrac{7\\pi}{12}$")],
    answer: 2,
    explanation: "$\\dfrac{dy}{dx}=\\dfrac{3\\cos 3t\\,e^{\\sin 3t}}{-2\\sin t\\,e^{\\cos t}}=0$ ⇒ $\\cos 3t=0$.\n$3t=\\dfrac{\\pi}{2},\\dfrac{3\\pi}{2},\\dfrac{5\\pi}{2}$ ⇒ $t=\\dfrac{\\pi}{6},\\dfrac{\\pi}{2},\\dfrac{5\\pi}{6}$.\n구간 $\\dfrac{\\pi}{2}<t<\\pi$ 만족: $t=\\dfrac{5\\pi}{6}$."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "테일러 급수·수렴반경", difficulty: "medium",
    question: "급수가 다음을 만족할 때 $a+10b$의 값은?\n\n(가) $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n\\pi^{2n+1}}{6^{2n-1}(2n+1)!}=a$\n(나) $\\!\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{\\sqrt{n+5}(3x-1)^n}{21^n\\ln n}$의 수렴 반지름은 $b$.",
    options: [o("1","$78$"), o("2","$88$"), o("3","$92$"), o("4","$96$"), o("5","$98$")],
    answer: 2,
    explanation: "(가) 양변에 $1/36$ 곱: $\\!\\sum\\dfrac{(-1)^n}{(2n+1)!}(\\pi/6)^{2n+1}=\\sin(\\pi/6)=1/2=a/36$ ⇒ $a=18$.\n(나) $|3x-1|<21$ ⇒ $|x-1/3|<7$ ⇒ $b=7$.\n$a+10b=88$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "삼각치환", difficulty: "medium",
    question: "정적분 $\\!\\displaystyle\\int_0^1\\dfrac{3x^2}{\\sqrt{4-x^2}}dx$의 값은?",
    options: [
      o("1","$\\dfrac{\\pi}{2}-\\dfrac{3\\sqrt 3}{2}$"),
      o("2","$\\dfrac{\\pi}{2}+\\dfrac{3\\sqrt 3}{2}$"),
      o("3","$\\pi-\\dfrac{3\\sqrt 3}{2}$"),
      o("4","$\\pi+\\dfrac{\\sqrt 3}{2}$"),
      o("5","$\\pi+\\dfrac{3\\sqrt 3}{2}$")
    ],
    answer: 3,
    explanation: "$x=2\\sin\\theta$ 치환: $\\!\\int_0^{\\pi/6}12\\sin^2\\theta\\,d\\theta=12\\!\\left[\\dfrac{\\theta}{2}-\\dfrac{\\sin 2\\theta}{4}\\right]_0^{\\pi/6}=12\\!\\left(\\dfrac{\\pi}{12}-\\dfrac{\\sqrt 3}{8}\\right)=\\pi-\\dfrac{3\\sqrt 3}{2}$."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "편미분", concept: "선형근사", difficulty: "medium",
    question: "점 $\\!\\left(1,\\dfrac{1}{2}\\right)$에서 함수 $f(x,y)=\\dfrac{1}{4}-x^2 y\\cos(\\pi x+\\pi y)$의 선형화를 $L(x,y)=ax+by+c$라 할 때 $a+b+c$의 값은?",
    options: [
      o("1","$\\dfrac{1-\\pi}{8}$"),
      o("2","$\\dfrac{1-\\pi}{4}$"),
      o("3","$\\dfrac{1-\\pi}{2}$"),
      o("4","$\\dfrac{1+\\pi}{4}$"),
      o("5","$\\dfrac{1+\\pi}{8}$")
    ],
    answer: 2,
    explanation: "$f(1,1/2)=1/4-\\tfrac{1}{2}\\cos(3\\pi/2)=1/4$. $f_x=-2xy\\cos+x^2 y\\pi\\sin$ ⇒ $f_x(1,1/2)=-\\pi/2$. $f_y(1,1/2)=-\\pi/2$.\n$L=\\dfrac{1}{4}-\\dfrac{\\pi}{2}(x-1)-\\dfrac{\\pi}{2}(y-1/2)$. $a+b+c=-\\dfrac{\\pi}{2}-\\dfrac{\\pi}{2}+\\dfrac{1+3\\pi}{4}=\\dfrac{1-\\pi}{4}$."
  }),
  build({
    num: 7, subject: "미분학", unit: "극한과 연속", concept: "변수상한 적분 극한", difficulty: "medium",
    question: "극한 $\\!\\displaystyle\\lim_{x\\to 0}\\dfrac{\\!\\int_0^{2x^2}\\sin\\!\\left(\\dfrac{t^2}{3}\\right)dt}{x^6}$의 값은?",
    options: [o("1","$0$"), o("2","$\\dfrac{2}{3}$"), o("3","$\\dfrac{8}{9}$"), o("4","$\\dfrac{8}{3}$"), o("5","$\\infty$")],
    answer: 3,
    explanation: "로피탈: $\\!\\lim\\dfrac{\\sin(4x^4/3)\\cdot 4x}{6x^5}=\\dfrac{2}{3}\\!\\lim\\dfrac{\\sin(4x^4/3)}{x^4}=\\dfrac{2}{3}\\cdot\\dfrac{4}{3}=\\dfrac{8}{9}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "정적분", concept: "부분적분(역삼각)", difficulty: "medium",
    question: "정적분 $\\!\\displaystyle\\int_0^{\\sqrt 3}2x\\tan^{-1}x\\,dx$의 값은?",
    options: [
      o("1","$\\dfrac{2\\pi}{3}-\\sqrt 3$"),
      o("2","$\\dfrac{2\\pi}{3}-\\dfrac{\\sqrt 3}{2}$"),
      o("3","$\\dfrac{2\\pi}{3}+\\sqrt 3$"),
      o("4","$\\dfrac{4\\pi}{3}-\\sqrt 3$"),
      o("5","$\\dfrac{5\\pi}{3}-\\sqrt 3$")
    ],
    answer: 4,
    explanation: "$u=\\tan^{-1}x,\\,v'=2x$: $[x^2\\tan^{-1}x]_0^{\\sqrt 3}-\\!\\int_0^{\\sqrt 3}\\dfrac{x^2}{1+x^2}dx=3\\cdot\\dfrac{\\pi}{3}-(\\sqrt 3-\\dfrac{\\pi}{3})=\\dfrac{4\\pi}{3}-\\sqrt 3$."
  }),
  build({
    num: 9, subject: "적분학", unit: "정적분", concept: "매개곡선 길이", difficulty: "easy",
    question: "곡선 $x=3+2t^{3/2},\\,y=3t\\;(0\\le t\\le 3)$의 호의 길이는?",
    options: [o("1","$14$"), o("2","$15$"), o("3","$16$"), o("4","$17$"), o("5","$18$")],
    answer: 1,
    explanation: "$x'=3\\sqrt t,\\,y'=3$. $L=\\!\\int_0^3\\sqrt{9t+9}dt=3\\!\\int_0^3\\sqrt{t+1}dt=3\\cdot\\dfrac{2}{3}[(t+1)^{3/2}]_0^3=2(8-1)=14$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "공간도형", concept: "평면 방정식", difficulty: "medium",
    question: "직선 $l$과 평면 $P$의 방정식: $l:4-x=\\dfrac{y+1}{3}=\\dfrac{z-2}{2},\\;P:3x+y-2z=3$. 평면 $Q$가 (가) 방정식 $ax+by+cz=1$, (나) 직선 $l$ 포함, (다) 평면 $P$에 수직일 때 $a+b+c$의 값은?",
    options: [o("1","$-\\dfrac{1}{4}$"), o("2","$-\\dfrac{1}{2}$"), o("3","$0$"), o("4","$\\dfrac{1}{2}$"), o("5","$\\dfrac{1}{4}$")],
    answer: 5,
    explanation: "$l$의 방향벡터 $(-1,3,2)$, $P$의 법선 $(3,1,-2)$. $Q$의 법선 $=l$ 방향$\\times P$ 법선 $=(-8,4,-10)\\to(4,-2,5)$.\n$Q:4x-2y+5z=4\\cdot 4-2(-1)+5\\cdot 2=28$. 정규화: $\\dfrac{1}{7}x-\\dfrac{1}{14}y+\\dfrac{5}{28}z=1$. $a+b+c=\\dfrac{1}{4}$."
  }),
  build({
    num: 11, subject: "공학수학", unit: "벡터적분", concept: "완전 벡터장 선적분", difficulty: "medium",
    question: "$C$가 점 $\\!\\left(1,e,\\dfrac{1}{e}\\right)$로부터 점 $(e,1,0)$까지의 선분일 때 벡터장 $\\vec F=\\!\\left\\langle\\dfrac{y^3}{x}-2xyz,\\,3y^2\\ln x-x^2 z,\\,-x^2 y\\right\\rangle$의 선적분 $\\!\\displaystyle\\int_C\\vec F\\cdot d\\vec r$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$-\\dfrac{1}{2}$"), o("4","$\\dfrac{1}{2}$"), o("5","$2$")],
    answer: 5,
    explanation: "$\\text{curl}\\vec F=\\vec 0$ ⇒ 완전. 포텐셜 $f=y^3\\ln x-x^2 yz$.\n$\\!\\int_C\\vec F\\cdot d\\vec r=f(e,1,0)-f(1,e,1/e)=(1-0)-(0-1)=2$."
  }),
  build({
    num: 12, subject: "다변수함수", unit: "편미분", concept: "연쇄법칙", difficulty: "medium",
    question: "함수 $f(x,y)=e^{\\sqrt x}\\ln(y^2+1)$이고 $2x-y=s,\\,x+y=t$라 하자. $s=1,\\,t=2$일 때 편도함수 $\\dfrac{\\partial f}{\\partial t}$의 값은?",
    options: [
      o("1","$\\dfrac{e}{6}(\\ln 2-4)$"),
      o("2","$\\dfrac{e}{6}(\\ln 2+4)$"),
      o("3","$\\dfrac{e}{6}(\\ln 2-2)$"),
      o("4","$\\dfrac{e}{6}(\\ln 2+2)$"),
      o("5","$\\dfrac{e}{3}(\\ln 2+4)$")
    ],
    answer: 2,
    explanation: "$x=\\dfrac{s+t}{3},\\,y=\\dfrac{-s+2t}{3}$. $(s,t)=(1,2)$ ⇒ $(x,y)=(1,1)$.\n$f_t=f_x\\cdot\\dfrac{1}{3}+f_y\\cdot\\dfrac{2}{3}$. $f_x=\\dfrac{e}{2}\\ln 2,\\,f_y=e\\cdot\\dfrac{2}{2}=e$.\n$f_t=\\dfrac{e\\ln 2}{6}+\\dfrac{2e}{3}=\\dfrac{e(\\ln 2+4)}{6}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "정적분", concept: "회전체 부피·파푸스", difficulty: "medium",
    question: "곡선 $y=x^2$과 직선 $y=2$로 둘러싸인 영역을 직선 $x=2$를 축으로 회전시켜 얻은 입체의 부피는?",
    options: [
      o("1","$\\dfrac{16\\pi}{3}$"),
      o("2","$\\dfrac{16\\sqrt 2\\pi}{3}$"),
      o("3","$\\dfrac{32\\pi}{3}$"),
      o("4","$\\dfrac{32\\sqrt 2\\pi}{3}$"),
      o("5","$4\\pi(2\\sqrt 2-1)$")
    ],
    answer: 4,
    explanation: "면적 $=\\!\\int_{-\\sqrt 2}^{\\sqrt 2}(2-x^2)dx=\\dfrac{8\\sqrt 2}{3}$. 중심 $\\bar x=0$, 회전축 $x=2$로 이동 $4\\pi$.\n파푸스: $V=\\dfrac{8\\sqrt 2}{3}\\cdot 4\\pi=\\dfrac{32\\sqrt 2\\pi}{3}$."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "편미분", concept: "곱 함수의 방향도함수", difficulty: "medium",
    question: "함수 $f,g$가 (가) $f(x,y,z)=x+y^2+z-6$, (나) $g$는 미분가능, (다) $g(1,2,1)=2$를 만족할 때 점 $(1,2,1)$에서 벡터 $\\vec u=\\!\\left\\langle 0,\\dfrac{1}{\\sqrt 2},\\dfrac{1}{\\sqrt 2}\\right\\rangle$ 방향에 대한 함수 $fg$의 방향도함수의 값은?",
    options: [o("1","$\\dfrac{5\\sqrt 2}{2}$"), o("2","$5$"), o("3","$5\\sqrt 2$"), o("4","$10\\sqrt 2$"), o("5","$15$")],
    answer: 3,
    explanation: "$h=fg$. $f(1,2,1)=0$. $h_y=f_y g+fg_y=2yg+0=8$. $h_z=g+0=2$.\n$\\nabla h\\cdot\\vec u=0\\cdot 0+8\\cdot\\tfrac{1}{\\sqrt 2}+2\\cdot\\tfrac{1}{\\sqrt 2}=5\\sqrt 2$."
  }),
  build({
    num: 15, subject: "다변수함수", unit: "중적분", concept: "입체 겉넓이(여러 면)", difficulty: "mediumHard",
    question: "원기둥 $x^2+y^2\\le 1$과 두 평면 $z\\le\\sqrt 3 y,\\,z\\ge 0$으로 둘러싸인 입체의 겉넓이는?",
    options: [
      o("1","$\\dfrac{\\pi}{2}+2\\sqrt 3$"),
      o("2","$\\pi+\\sqrt 3$"),
      o("3","$\\pi+2\\sqrt 3$"),
      o("4","$\\dfrac{3\\pi}{2}+\\sqrt 3$"),
      o("5","$\\dfrac{3\\pi}{2}+2\\sqrt 3$")
    ],
    answer: 5,
    explanation: "윗면 $z=\\sqrt 3 y$ ($y\\ge 0$): $S=\\!\\iint 2\\,dA=2\\cdot\\dfrac{\\pi}{2}=\\pi$.\n옆면(원기둥): $\\!\\int_0^\\pi\\!\\int_0^{\\sqrt 3\\sin\\theta}dzd\\theta=2\\sqrt 3$.\n밑면(반원): $\\dfrac{\\pi}{2}$.\n합 $=\\pi+2\\sqrt 3+\\dfrac{\\pi}{2}=\\dfrac{3\\pi}{2}+2\\sqrt 3$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "벡터적분", concept: "발산정리(곡면 적분)", difficulty: "mediumHard",
    question: "벡터장 $\\vec F=\\langle 2xz,\\,4xy,\\,-z^2\\rangle$이고 $S$는 두 곡면 $y=\\sqrt x,\\,y=2\\sqrt x$와 평면 $z=0,\\,z=1-y$에 의하여 유계된 영역의 곡면일 때 면적분 $\\!\\displaystyle\\iint_S\\vec F\\cdot d\\vec S$의 값은?",
    options: [o("1","$\\dfrac{1}{16}$"), o("2","$\\dfrac{1}{32}$"), o("3","$0$"), o("4","$-\\dfrac{1}{32}$"), o("5","$-\\dfrac{1}{16}$")],
    answer: 1,
    explanation: "$\\text{div}\\vec F=2z+4x-2z=4x$.\n$E$: $y^2/4\\le x\\le y^2,\\,0\\le z\\le 1-y,\\,0\\le y\\le 1$.\n$\\!\\iiint 4x\\,dV=\\!\\int_0^1\\!\\!\\int_{y^2/4}^{y^2}4x(1-y)dx\\,dy=\\dfrac{15}{8}\\!\\int_0^1(y^4-y^5)dy=\\dfrac{1}{16}$."
  }),
  build({
    num: 17, subject: "다변수함수", unit: "중적분", concept: "반복적분 통합(극좌표)", difficulty: "mediumHard",
    question: "다음 반복적분의 값을 구하시오.\n\n$\\!\\displaystyle\\int_{1/\\sqrt 2}^1\\!\\!\\int_{\\sqrt{1-x^2}}^x e^{x^2+y^2}dy\\,dx+\\!\\int_1^{\\sqrt 2}\\!\\!\\int_0^x e^{x^2+y^2}dy\\,dx+\\!\\int_{\\sqrt 2}^2\\!\\!\\int_0^{\\sqrt{4-x^2}}e^{x^2+y^2}dy\\,dx$",
    options: [
      o("1","$\\dfrac{\\pi}{8}(e^4-e^2)$"),
      o("2","$\\dfrac{\\pi}{8}(e^4-e)$"),
      o("3","$\\dfrac{\\pi}{6}(e^4-e^2)$"),
      o("4","$\\dfrac{\\pi}{6}(e^4-e)$"),
      o("5","$\\dfrac{\\pi}{4}(e^4-e^2)$")
    ],
    answer: 2,
    explanation: "통합 영역: $1\\le r\\le 2,\\,0\\le\\theta\\le\\pi/4$.\n$\\!\\int_0^{\\pi/4}\\!\\!\\int_1^2 re^{r^2}dr\\,d\\theta=\\dfrac{\\pi}{4}\\cdot\\dfrac{e^4-e}{2}=\\dfrac{\\pi}{8}(e^4-e)$."
  }),
  build({
    num: 18, subject: "선형대수", unit: "행렬", concept: "역행렬 성분 합(수반행렬)", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}2&1&0\\\\-1&0&1\\\\4&2&1\\end{pmatrix}$의 역행렬을 $A^{-1}=\\!\\begin{pmatrix}a&b&c\\\\d&e&f\\\\g&h&i\\end{pmatrix}$라 할 때 $b+d+f+h$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 5,
    explanation: "$|A|=1$. 여인수: $b=-(1-0)=-1$, $d=-(1-0)=5$, $f=-2-(-4)$... 직접 계산하면 $b=-1,d=5,f=-2,h=0$.\n합 $=-1+5-2+0=2$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "행렬", concept: "대각화·고유공간", difficulty: "medium",
    question: "행렬 $\\!\\begin{pmatrix}4&0&-2\\\\2&5&4\\\\0&0&5\\end{pmatrix}$에 대하여 옳은 것을 모두 고르시오.\n\n(가) 서로 다른 세 개의 고유값을 갖는다.\n(나) 대각화 가능하다.\n(다) 가역행렬이다.\n(라) 고유공간들 차원의 합은 $3$이다.",
    options: [o("1","(가)"), o("2","(나), (다)"), o("3","(가), (나), (다)"), o("4","(나), (다), (라)"), o("5","(가), (나), (다), (라)")],
    answer: 4,
    explanation: "고유값 $5,5,4$ → (가) 거짓.\n$\\lambda=5$의 기하학적 중복도 $=2$ → 대각화 가능, 차원 합 3.\n$\\det A=100\\ne 0$ → 가역. (나)(다)(라) 참."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "수반행렬의 행렬식", difficulty: "medium",
    question: "행렬 $A=\\!\\begin{pmatrix}1&3&1\\\\-4&-13&2\\\\0&-1&5\\end{pmatrix}$에 대하여 $\\det(\\text{adj}(A))$의 값은? (단, $\\text{adj}(A)$는 수반행렬)",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$2$")],
    answer: 4,
    explanation: "$\\det(\\text{adj}A)=|A|^{n-1}=|A|^2$. $|A|=1$ (스칼라 삼중적). $\\det(\\text{adj}A)=1$."
  }),
  build({
    num: 21, subject: "공학수학", unit: "미분방정식", concept: "변수분리", difficulty: "medium",
    question: "초깃값 문제 $y\\dfrac{dy}{dx}=x\\sin x,\\,y(0)=2$의 해에 대하여 $\\{y(\\pi)\\}^2$의 값은?",
    options: [o("1","$\\pi$"), o("2","$\\pi+2$"), o("3","$2\\pi$"), o("4","$2\\pi+2$"), o("5","$2\\pi+4$")],
    answer: 5,
    explanation: "$\\dfrac{1}{2}y^2=-x\\cos x+\\sin x+C$. $y(0)=2$ ⇒ $2=0+0+C$ ⇒ $C=2$.\n$y^2=-2x\\cos x+2\\sin x+4$. $y(\\pi)^2=2\\pi+0+4=2\\pi+4$."
  }),
  build({
    num: 22, subject: "공학수학", unit: "미분방정식", concept: "특수해(공명)", difficulty: "medium",
    question: "함수 $y_p=(ax^b+cx^d)e^x$가 미분방정식 $y''-2y'+y=(2x+1)e^x$의 특수해일 때 $ab+cd$의 값은?",
    options: [o("1","$2$"), o("2","$3$"), o("3","$4$"), o("4","$5$"), o("5","$6$")],
    answer: 1,
    explanation: "특성: $(s-1)^2$ ⇒ $y_p=x^2(Ax+B)e^x$ 형태. 정리: $y_p=\\!\\left(\\dfrac{x^3}{3}+\\dfrac{x^2}{2}\\right)e^x$.\n$a=1/3,b=3,c=1/2,d=2$. $ab+cd=1+1=2$."
  }),
  build({
    num: 23, subject: "공학수학", unit: "라플라스변환", concept: "역라플라스(단위계단함수)", difficulty: "medium",
    question: "$\\mathcal{L}$을 라플라스 변환, $\\mathcal{L}^{-1}$을 역변환이라 하자. 함수 $F(s)=\\dfrac{s}{s^2+4}e^{-\\pi s}$에 대해 $\\mathcal{L}^{-1}\\{F(s)\\}=f(t)$라 할 때 $f(2\\pi)$의 값은?",
    options: [o("1","$-\\pi$"), o("2","$-1$"), o("3","$0$"), o("4","$1$"), o("5","$\\pi$")],
    answer: 4,
    explanation: "$f(t)=\\cos(2(t-\\pi))u(t-\\pi)=\\cos(2t-2\\pi)u(t-\\pi)$.\n$f(2\\pi)=\\cos(2\\pi)=1$."
  }),
  build({
    num: 24, subject: "공학수학", unit: "푸리에", concept: "푸리에 급수($2x$)", difficulty: "mediumHard",
    question: "함수 $f(x)=2x\\;(-1<x<1)$의 푸리에 급수는?",
    options: [
      o("1","$\\!\\sum_{n=1}^{\\infty}\\dfrac{2(-1)^{n+1}}{n\\pi}\\sin n\\pi x$"),
      o("2","$\\!\\sum_{n=1}^{\\infty}\\dfrac{4(-1)^n}{n\\pi}\\sin n\\pi x$"),
      o("3","$\\!\\sum_{n=1}^{\\infty}\\dfrac{4(-1)^{n+1}}{n\\pi}\\sin n\\pi x$"),
      o("4","$\\!\\sum_{n=1}^{\\infty}\\dfrac{4(-1)^{n+1}}{n\\pi}\\cos n\\pi x$"),
      o("5","$\\!\\sum_{n=1}^{\\infty}\\dfrac{2(-1)^{n+1}}{n\\pi}\\cos n\\pi x$")
    ],
    answer: 3,
    explanation: "$2L=2,L=1$. 우함수 X(기함수). $b_n=\\dfrac{2}{1}\\!\\int_0^1 2x\\sin n\\pi x\\,dx$ 부분적분: $b_n=\\dfrac{4(-1)^{n+1}}{n\\pi}$."
  }),
  build({
    num: 25, subject: "선형대수", unit: "행렬", concept: "대각화 $A=PDP^{-1}$", difficulty: "mediumHard",
    question: "행렬 $A=\\!\\begin{pmatrix}4&2&-1\\\\-1&1&3\\\\1&1&2\\end{pmatrix}$를 $A=PDP^{-1}$ 형태로 대각화하자. $D=\\!\\begin{pmatrix}\\lambda_1&0&0\\\\0&\\lambda_2&0\\\\0&0&\\lambda_3\\end{pmatrix}$($\\lambda_1<\\lambda_2<\\lambda_3$), $P=\\!\\begin{pmatrix}a&b&c\\\\d&e&f\\\\g&h&i\\end{pmatrix}$에서 $a=3,b=1,c=3$일 때 $d^2+e^2+f^2+g^2+h^2+i^2$의 값은?",
    options: [o("1","$19$"), o("2","$20$"), o("3","$21$"), o("4","$22$"), o("5","$23$")],
    answer: 5,
    explanation: "고유값 $\\lambda=1,2,4$. 고유벡터: $\\lambda=1$: $(3,-4,1)$, $\\lambda=2$: $(1,-1,0)$, $\\lambda=4$: $(3,1,2)$.\n$d=-4,e=-1,f=1,g=1,h=0,i=2$. 합 $=16+1+1+1+0+4=23$."
  }),
  build({
    num: 26, subject: "공학수학", unit: "벡터적분", concept: "[주관식] 그린정리·다각형", difficulty: "mediumHard",
    question: "[주관식] 점 $(0,0),(1,1),(1,2),(0,3),(-1,3),(-2,2),(-2,1),(-1,0)$을 순서대로 연결한 곡선을 $C$라 하자. 벡터장 $\\vec F(x,y)=\\langle e^x-y,\\,x-e^{y^2}\\rangle$의 선적분 $\\!\\displaystyle\\int_C\\vec F\\cdot d\\vec r=a+\\dfrac{b}{e}$일 때 $10a+b$의 값은? (단, $a,b$는 정수, $e$는 자연상수)",
    options: [], answer: "", questionType: "subjective", answerText: "131",
    explanation: "$(-1,0)$과 $(0,0)$을 잇는 선분으로 닫고 그린정리.\n$\\!\\oint\\vec F\\cdot d\\vec r=\\!\\iint(1-(-1))dA=2\\cdot\\text{면적}=2\\cdot 7=14$.\n닫는 선분 $\\!\\int_{-1}^0(e^t-0)dt=1-e^{-1}$.\n$\\!\\int_C=14-(1-e^{-1})=13+e^{-1}$. $a=13,b=1$. $10a+b=131$."
  }),
  build({
    num: 27, subject: "적분학", unit: "정적분", concept: "[주관식] 부분적분", difficulty: "medium",
    question: "[주관식] 정적분 $\\!\\displaystyle\\int_0^{\\pi/2}t^2\\sin t\\,dt=a\\pi+b$일 때 $120(a^2+b^2)$의 값은? (단, $a,b$는 유리수)",
    options: [], answer: "", questionType: "subjective", answerText: "600",
    explanation: "부분적분 두 번: $[-t^2\\cos t+2t\\sin t+2\\cos t]_0^{\\pi/2}=0+\\pi+0-2=\\pi-2$.\n$a=1,b=-2$. $120(1+4)=600$."
  }),
  build({
    num: 28, subject: "적분학", unit: "정적분", concept: "[주관식] 극곡선 차집합 넓이", difficulty: "mediumHard",
    question: "[주관식] 극곡선 $r=-3\\cos\\theta$의 내부와 극곡선 $r=1-\\cos\\theta$의 외부에 놓인 영역의 넓이가 $a\\pi+b$일 때 $11a^2+b^2$의 값은? (단, $a,b$는 유리수)",
    options: [], answer: "", questionType: "subjective", answerText: "11",
    explanation: "변형: $r=3\\cos\\theta$ 내부 $-r=1+\\cos\\theta$ 외부 영역. 팩맨이 $\\pi$를 먹는 형태 ⇒ 넓이 $=\\pi$.\n$a=1,b=0$. $11(1)+0=11$."
  }),
  build({
    num: 29, subject: "다변수함수", unit: "중적분", concept: "[주관식] 구면좌표 부피", difficulty: "mediumHard",
    question: "[주관식] 두 곡면 $\\rho=1-\\cos\\phi$와 $\\rho=\\cos\\phi\\;(0\\le\\phi\\le\\dfrac{\\pi}{2})$로 둘러싸인 입체 $E$에 대해 $\\!\\displaystyle\\iiint_E\\dfrac{480}{\\pi}dV$의 값은? (단, 두 곡면은 구면좌표계)",
    options: [], answer: "", questionType: "subjective", answerText: "10",
    explanation: "$\\phi=\\pi/3$에서 교점. 두 영역 분할: $0\\le\\phi\\le\\pi/3,\\rho\\le 1-\\cos\\phi$; $\\pi/3\\le\\phi\\le\\pi/2,\\rho\\le\\cos\\phi$.\n$\\!\\iiint dV=\\dfrac{\\pi}{48}$. $\\dfrac{480}{\\pi}\\cdot\\dfrac{\\pi}{48}=10$."
  }),
  build({
    num: 30, subject: "공학수학", unit: "미분방정식", concept: "[주관식] 연립 1계 ODE", difficulty: "mediumHard",
    question: "[주관식] $y_1(t),y_2(t)$를 초깃값 문제 $\\!\\begin{pmatrix}y_1'\\\\y_2'\\end{pmatrix}=\\!\\begin{pmatrix}4&1\\\\1&4\\end{pmatrix}\\!\\begin{pmatrix}y_1\\\\y_2\\end{pmatrix},\\,y_1(0)=3,\\,y_2(0)=1$의 해라 하자. $y_1(1)y_2(1)=ae^b+ce^d$일 때 $a^2+b^2+c^2+d^2$의 값은? (단, $a,b,c,d$는 정수)",
    options: [], answer: "", questionType: "subjective", answerText: "153",
    explanation: "고유값 $5,3$, 고유벡터 $(1,1),(-1,1)$.\n$(y_1,y_2)=(2e^{5t}+e^{3t},\\,2e^{5t}-e^{3t})$. 곱 $=4e^{10}-e^6$.\n$a=4,b=10,c=-1,d=6$. $16+100+1+36=153$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울시립대):`, data.map((d) => d.id).join(", "));
