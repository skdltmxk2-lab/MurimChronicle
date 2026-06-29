// Upload 2021년도 국민대 편입수학 기출 25문항 (수학과/나노물리학과, 4지 선다, 60분)
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

const SCHOOL = "국민대";
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-kookmin-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "연속이 되는 상수 결정", difficulty: "easy",
    question: "$f(x)$가 연속함수일 때 $a$의 값은? $f(x)=\\!\\begin{cases}a&x=0\\\\ \\dfrac{\\sqrt{x^2+16}-4}{x^2}+\\dfrac{\\sin x}{3x}&x\\ne 0\\end{cases}$",
    options: [o("1","$\\dfrac{11}{24}$"), o("2","$\\dfrac{13}{24}$"), o("3","$\\dfrac{17}{24}$"), o("4","$\\dfrac{19}{24}$")],
    answer: 1,
    explanation: "$\\lim_{x\\to 0}\\dfrac{\\sqrt{x^2+16}-4}{x^2}=\\dfrac{1}{8}$.\n$\\lim_{x\\to 0}\\dfrac{\\sin x}{3x}=\\dfrac{1}{3}$.\n$a=\\dfrac{1}{8}+\\dfrac{1}{3}=\\dfrac{11}{24}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "최적화", concept: "최단시간 경로 최적화", difficulty: "medium",
    question: "쿠민이는 폭이 $2\\,\\text{km}$인 강둑의 $A$지점에서 수영을 시작하여 반대편 강둑으로 건너가서 $10\\,\\text{km}$ 우측에 위치한 $B$지점에 가려고 한다. $C$에서 $B$까지 직선거리. 수영 속력은 $4\\,\\text{km/h}$, 뛰는 속력은 $7\\,\\text{km/h}$. 최단시간 경로로 이동하기 위하여 쿠민이는 $C$에서 우측으로 몇 $\\text{km}$ 떨어진 거리까지 수영해야 할까?",
    options: [
      o("1","$\\dfrac{\\sqrt{31}}{33}$"),
      o("2","$\\dfrac{7\\sqrt{31}}{33}$"),
      o("3","$\\dfrac{8\\sqrt{33}}{33}$"),
      o("4","$\\dfrac{10\\sqrt{33}}{33}$"),
    ],
    answer: 3,
    explanation: "시간 $T=\\dfrac{\\sqrt{4+x^2}}{4}+\\dfrac{10-x}{7}$.\n$T'=\\dfrac{x}{4\\sqrt{4+x^2}}-\\dfrac{1}{7}=0$ ⇒ $7x=4\\sqrt{4+x^2}$.\n$49x^2=16(4+x^2)$ ⇒ $x^2=\\dfrac{64}{33}$ ⇒ $x=\\dfrac{8}{\\sqrt{33}}=\\dfrac{8\\sqrt{33}}{33}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "역삼각·역쌍곡 함수", concept: "역함수 항등식 판별", difficulty: "easy",
    question: "다음 중 옳은 것을 모두 고르면?\n\nㄱ. 모든 실수 $x$에 대하여 $\\tan^{-1}x+\\cot^{-1}x=\\dfrac{\\pi}{2}$\nㄴ. $0<x<1$인 임의의 실수 $x$에 대하여 $2\\sin^{-1}x=\\cos^{-1}(1-2x^2)$\nㄷ. $x>1$인 임의의 실수 $x$에 대하여 $\\cosh^{-1}x=\\ln(x+\\sqrt{x^2-1})$\nㄹ. $|x|<1$인 임의의 실수 $x$에 대하여 $\\tanh^{-1}x=\\ln\\!\\left(\\dfrac{1+x}{1-x}\\right)$",
    options: [o("1","ㄱ, ㄴ"), o("2","ㄷ, ㄹ"), o("3","ㄱ, ㄴ, ㄷ"), o("4","ㄴ, ㄷ, ㄹ")],
    answer: 3,
    explanation: "ㄱ,ㄴ,ㄷ 모두 표준 항등식.\nㄹ. 거짓: $\\tanh^{-1}x=\\dfrac{1}{2}\\ln\\!\\left(\\dfrac{1+x}{1-x}\\right)$."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "멱급수 수렴구간", difficulty: "easy",
    question: "멱급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{n(x+3)^n}{5^{n+1}}$의 수렴구간은?",
    options: [o("1","$(-8,2)$"), o("2","$[-8,2)$"), o("3","$(-5,5)$"), o("4","$[-5,5)$")],
    answer: 1,
    explanation: "$R=5$, $|x+3|<5$ ⇒ $-8<x<2$.\n끝점: $x=-8$ ⇒ $\\sum(-1)^n n/5$ 발산, $x=2$ ⇒ $\\sum n/5$ 발산.\n수렴구간 $(-8,2)$."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "음함수 미분", concept: "음함수 2계 미분", difficulty: "medium",
    question: "곡선 $x^4+y^4=16$ 위의 점 $(\\sqrt[4]{8},-\\sqrt[4]{8})$에서 $y''$의 값은?",
    options: [o("1","$\\sqrt 2$"), o("2","$2\\sqrt 2$"), o("3","$3\\sqrt[4]{2}$"), o("4","$4\\sqrt 2$")],
    answer: 3,
    explanation: "$y'=-x^3/y^3|_{(\\sqrt[4]8,-\\sqrt[4]8)}=1$.\n$y''=-\\dfrac{3x^2 y^3-3x^3 y^2 y'}{y^6}$.\n$a=\\sqrt[4]8$ 대입 후 $y''=\\dfrac{6}{a}=3\\sqrt[4]2$."
  }),
  build({
    num: 6, subject: "미분학", unit: "뉴턴의 방법", concept: "뉴턴 반복 한 단계", difficulty: "easy",
    question: "뉴턴의 방법을 이용하여 $\\sqrt[4]{2}$의 근삿값을 구하고자 한다. 초기 근삿값을 $x_1=1$로 할 때, 두 번째 근삿값 $x_2$는?",
    options: [o("1","$\\dfrac{4}{3}$"), o("2","$\\dfrac{5}{4}$"), o("3","$\\dfrac{6}{5}$"), o("4","$\\dfrac{7}{6}$")],
    answer: 2,
    explanation: "$f(x)=x^4-2$, $f'(x)=4x^3$.\n$x_2=x_1-\\dfrac{f(x_1)}{f'(x_1)}=1-\\dfrac{-1}{4}=\\dfrac{5}{4}$."
  }),
  build({
    num: 7, subject: "적분학", unit: "수열", concept: "수열 수렴성과 단조성", difficulty: "mediumHard",
    question: "다음 중 옳은 것의 개수는?\n\nㄱ. $a_1=\\sqrt 2,\\;a_{n+1}=\\sqrt{2+a_n}$으로 정의한 수열 $\\{a_n\\}$은 $2$로 수렴하는 증가수열이다.\nㄴ. $a_1=2,\\;a_{n+1}=\\dfrac{1}{3-a_n}$으로 정의한 수열 $\\{a_n\\}$은 $0$으로 수렴하는 감소수열이다.\nㄷ. $a_1=2,\\;a_{n+1}=\\dfrac{1}{2}(a_n+6)$으로 정의한 수열 $\\{a_n\\}$은 발산하는 증가수열이다.\nㄹ. $\\!\\displaystyle\\lim_{n\\to\\infty}a_{2n}=L$이고 $\\!\\displaystyle\\lim_{n\\to\\infty}a_{2n+1}=L$이면 수열 $\\{a_n\\}$은 수렴하고 $\\!\\displaystyle\\lim_{n\\to\\infty}a_n=L$이다.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 2,
    explanation: "ㄱ. 참: $2$ 수렴.\nㄴ. 거짓: $\\dfrac{3-\\sqrt 5}{2}$로 수렴.\nㄷ. 거짓: $6$으로 수렴.\nㄹ. 참.\n총 2개."
  }),
  build({
    num: 8, subject: "미분학", unit: "테일러 급수", concept: "테일러 계수 비교", difficulty: "medium",
    question: "$\\!\\displaystyle\\lim_{x\\to 0}\\dfrac{5!\\!\\left(e^x\\sin x-x-x^2-\\dfrac{1}{3}x^3\\right)}{x^5}$의 값은?",
    options: [o("1","$-1$"), o("2","$-2$"), o("3","$-3$"), o("4","$-4$")],
    answer: 4,
    explanation: "$e^x\\sin x$의 $x^5$ 계수: $5!\\!\\left(\\dfrac{1}{5!}-\\dfrac{1}{2!\\cdot 3!}+\\dfrac{1}{4!}\\right)=1-10+5=-4$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "1계 미분방정식", concept: "1계 선형(쌍곡함수)", difficulty: "medium",
    question: "$y'=\\dfrac{2y+y\\sinh x}{2x+\\cosh x},\\;y(1)=1$일 때, $y(2)$의 값은?",
    options: [
      o("1","$\\dfrac{e^4+5e^2+1}{e^2+3e+1}$"),
      o("2","$\\dfrac{e^4+7e^2+1}{e^3+3e^2+e}$"),
      o("3","$\\dfrac{e^4+8e^2+1}{e^3+4e^2+e}$"),
      o("4","$\\dfrac{e^4+7e^3+1}{e^4+4e+1}$"),
    ],
    answer: 3,
    explanation: "변수분리: $\\dfrac{dy}{y}=\\dfrac{2+\\sinh x}{2x+\\cosh x}dx$.\n$\\ln y=\\ln(2x+\\cosh x)+C$ ⇒ $y=c(2x+\\cosh x)$.\n$y(1)=1$ ⇒ $c=\\dfrac{2e}{e^2+4e+1}$.\n$y(2)=c(4+\\cosh 2)=\\dfrac{e^4+8e^2+1}{e^3+4e^2+e}$."
  }),
  build({
    num: 10, subject: "선형대수", unit: "행렬 거듭제곱", concept: "순환 행렬 $A^{2021}$", difficulty: "mediumHard",
    question: "다음 행렬 $A$에 대하여 $A^{2021}$은? $A=\\!\\begin{pmatrix}0&0&0&0&1\\\\0&0&0&1&0\\\\1&0&0&0&0\\\\0&1&0&0&0\\\\0&0&1&0&0\\end{pmatrix}$",
    options: [
      o("1","$\\!\\begin{pmatrix}0&0&1&0&0\\\\0&1&0&0&0\\\\0&0&0&0&1\\\\0&0&0&1&0\\\\1&0&0&0&0\\end{pmatrix}$"),
      o("2","$\\!\\begin{pmatrix}1&0&0&0&0\\\\0&1&0&0&0\\\\0&0&1&0&0\\\\0&0&0&1&0\\\\0&0&0&0&1\\end{pmatrix}$"),
      o("3","$\\!\\begin{pmatrix}0&0&1&0&0\\\\0&0&0&1&0\\\\0&0&0&0&1\\\\0&1&0&0&0\\\\1&0&0&0&0\\end{pmatrix}$"),
      o("4","$\\!\\begin{pmatrix}0&0&0&0&1\\\\0&1&0&0&0\\\\1&0&0&0&0\\\\0&0&0&1&0\\\\0&0&1&0&0\\end{pmatrix}$"),
    ],
    answer: 3,
    explanation: "$A^6=I$이므로 $A^{2021}=A^{6\\cdot 336+5}=A^5$.\n$\\det A=-1$, $\\det A^{2021}=-1$인 것이 보기 중 (3)."
  }),
  build({
    num: 11, subject: "선형대수", unit: "행렬 계수", concept: "행렬 계수 (rank)", difficulty: "easy",
    question: "다음 행렬 $A$의 계수(rank)는? $A=\\!\\begin{pmatrix}2&3&3&1&1\\\\3&4&3&1&1\\\\2&2&0&4&0\\\\1&2&3&3&1\\end{pmatrix}$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "행 축약: 3개의 일차독립 행 → rank $=3$."
  }),
  build({
    num: 12, subject: "기타", unit: "정수론", concept: "일차합동식 개수", difficulty: "medium",
    question: "다음을 만족하는 정수 $X$의 개수는? $7X\\equiv 22\\pmod{31},\\;0<X\\le 2021$",
    options: [o("1","$0$"), o("2","$63$"), o("3","$64$"), o("4","$65$")],
    answer: 4,
    explanation: "$22+62=84=7\\cdot 12$, $7X\\equiv 84\\pmod{31}$ ⇒ $X\\equiv 12\\pmod{31}$.\n$X=12,43,\\ldots$ 마지막 $\\le 2021$: $X=31q+12\\le 2021$ ⇒ $q\\le 64.8$, $q=0..64$, 총 65개."
  }),
  build({
    num: 13, subject: "기타", unit: "정수론", concept: "선형 디오판투스 (베주)", difficulty: "medium",
    question: "방정식 $12X+19Y=1$을 만족하는 정수해를 $X=m,\\;Y=n$이라 할 때, $|m|+|n|$의 최솟값은?",
    options: [o("1","$11$"), o("2","$13$"), o("3","$15$"), o("4","$17$")],
    answer: 2,
    explanation: "특수해: $12\\cdot 8+19\\cdot(-5)=96-95=1$.\n$m=8,n=-5$일 때 $|m|+|n|=13$, 최솟값."
  }),
  build({
    num: 14, subject: "기타", unit: "정수론", concept: "팩토리얼 mod 16", difficulty: "medium",
    question: "$\\!\\displaystyle\\sum_{k=1}^{50}(2k-1)!\\bmod 16$의 값은?",
    options: [o("1","$12$"), o("2","$13$"), o("3","$14$"), o("4","$15$")],
    answer: 4,
    explanation: "$7!=5040$이 $16$의 배수($2^4$ 인수 포함).\n$\\sum=1!+3!+5!+(7!+\\cdots)$ mod 16 $=1+6+120 \\bmod 16+0=1+6+8=15$."
  }),
  build({
    num: 15, subject: "적분학", unit: "정적분", concept: "치환을 통한 정적분", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^{\\pi/4}\\dfrac{2e^{\\tan x}}{1+\\cos 2x}\\,dx$의 값은?",
    options: [o("1","$e-1$"), o("2","$e$"), o("3","$\\pi-1$"), o("4","$\\pi$")],
    answer: 1,
    explanation: "$1+\\cos 2x=2\\cos^2 x$ ⇒ $\\dfrac{2}{1+\\cos 2x}=\\sec^2 x$.\n$\\!\\int_0^{\\pi/4}\\sec^2 x\\cdot e^{\\tan x}dx=[e^{\\tan x}]_0^{\\pi/4}=e-1$."
  }),
  build({
    num: 16, subject: "적분학", unit: "회전체 부피", concept: "원주각법", difficulty: "easy",
    question: "$y=0$과 $y=10x^2-5x^3$으로 둘러싸인 영역을 $y$축 중심으로 회전하여 생기는 입체의 부피는?",
    options: [o("1","$10\\pi$"), o("2","$12\\pi$"), o("3","$14\\pi$"), o("4","$16\\pi$")],
    answer: 4,
    explanation: "교점 $x=0,2$.\n$V=2\\pi\\!\\int_0^2 x(10x^2-5x^3)dx=2\\pi[2.5x^4-x^5]_0^2=2\\pi(40-32)=16\\pi$."
  }),
  build({
    num: 17, subject: "적분학", unit: "정적분", concept: "역탄젠트 + 가우스 적분 결합", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_0^1\\dfrac{2+\\pi xe^{x^2}(x^2+1)}{2(x^2+1)}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{e\\pi}{4}$"), o("2","$\\dfrac{e\\pi}{2}$"), o("3","$e$"), o("4","$\\pi$")],
    answer: 1,
    explanation: "$=\\!\\int_0^1\\dfrac{1}{x^2+1}dx+\\dfrac{\\pi}{2}\\!\\int_0^1 xe^{x^2}dx$\n$=\\dfrac{\\pi}{4}+\\dfrac{\\pi}{4}(e-1)=\\dfrac{e\\pi}{4}$."
  }),
  build({
    num: 18, subject: "적분학", unit: "직교다항식", concept: "르장드르 다항식 성질", difficulty: "mediumHard",
    question: "구간 $(-1,1)$에서 정의한 함수 $P_0(x)=1,\\;P_1(x)=x,\\;P_2(x)=\\dfrac{1}{2}(3x^2-1)$에 대하여 다음 중 옳은 것의 개수는?\n\nㄱ. $2P_0(x)-3xP_1(x)+2P_2(x)=0$이다.\nㄴ. $\\!\\int_{-1}^1 P_1(x)P_2(x)dx=0$이다.\nㄷ. $\\!\\int_{-1}^1 P_2(x)^2 dx=\\dfrac{2}{5}$이다.\nㄹ. $y=P_2(x)$는 $(1-x^2)y''-2xy'+6y=0$을 만족한다.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "ㄱ. 거짓: $2-3x^2+(3x^2-1)=1$.\nㄴ. 참: $xP_2$는 기함수.\nㄷ. 참.\nㄹ. 참: 르장드르 방정식.\n총 3개."
  }),
  build({
    num: 19, subject: "선형대수", unit: "공간직선", concept: "수직조건으로 방향벡터 결정", difficulty: "medium",
    question: "공간 상의 점 $(0,1,2)$를 지나고 평면 $x+y+z=2$와 평행이며 직선 $x=1+t$, $y=1-t$, $z=2t$에 수직인 직선이 $x=3t$, $y=1+at$, $z=2+bt$일 때 $ab$의 값은?",
    options: [o("1","$-2$"), o("2","$-1$"), o("3","$1$"), o("4","$2$")],
    answer: 4,
    explanation: "방향 $(3,a,b)$.\n평면 평행: $(1,1,1)\\cdot(3,a,b)=3+a+b=0$.\n직선 수직: $(1,-1,2)\\cdot(3,a,b)=3-a+2b=0$.\n해: $a=-1,b=-2$, $ab=2$."
  }),
  build({
    num: 20, subject: "다변수함수", unit: "다변수 극한", concept: "이변수 극한 판정", difficulty: "medium",
    question: "다음 중 옳은 것의 개수는?\n\nㄱ. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{x^2-y^2}{x^2+y^2}=0$이다.\nㄴ. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy}{x^2+y^2}=0$이다.\nㄷ. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{3x^2 y}{x^2+y^2}=0$이다.\nㄹ. $\\!\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy^2}{x^2+y^4}=0$이다.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "ㄱ,ㄴ 동차 2/2 ⇒ 발산.\nㄷ 3/2 ⇒ 0.\nㄹ $x=my^2$ 경로 ⇒ $\\dfrac{m}{m^2+1}\\ne 0$ 발산.\n1개."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "편미분", concept: "병렬 저항 편미분 합", difficulty: "mediumHard",
    question: "세 저항 $R_1,R_2,R_3$을 병렬로 연결할 때, 총 저항 $R$은 $\\dfrac{1}{R}=\\dfrac{1}{R_1}+\\dfrac{1}{R_2}+\\dfrac{1}{R_3}$을 만족한다. $R_1=30\\Omega,R_2=45\\Omega,R_3=90\\Omega$일 때 $\\dfrac{\\partial R}{\\partial R_1}+\\dfrac{\\partial R}{\\partial R_2}+\\dfrac{\\partial R}{\\partial R_3}$의 값은?",
    options: [o("1","$\\dfrac{1}{3}$"), o("2","$\\dfrac{7}{18}$"), o("3","$\\dfrac{5}{12}$"), o("4","$\\dfrac{4}{9}$")],
    answer: 2,
    explanation: "$R=15$ 계산. $\\dfrac{\\partial R}{\\partial R_i}=\\dfrac{R^2}{R_i^2}$.\n합 $=R^2\\!\\left(\\dfrac{1}{R_1^2}+\\dfrac{1}{R_2^2}+\\dfrac{1}{R_3^2}\\right)=225\\cdot\\dfrac{14}{8100}=\\dfrac{7}{18}$."
  }),
  build({
    num: 22, subject: "다변수함수", unit: "음함수 미분", concept: "음함수 편미분 합", difficulty: "medium",
    question: "$z^3-xy+yz+y^3=2$일 때, $(1,1,1)$에서 $\\dfrac{\\partial z}{\\partial x}+\\dfrac{\\partial z}{\\partial y}$의 값은?",
    options: [o("1","$-1$"), o("2","$-\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{2}$"), o("4","$1$")],
    answer: 2,
    explanation: "$F=z^3-xy+yz+y^3-2$, $F_x=-y$, $F_y=-x+z+3y^2$, $F_z=3z^2+y$.\n$(1,1,1)$: $z_x=1/4$, $z_y=-3/4$.\n합 $=-1/2$."
  }),
  build({
    num: 23, subject: "다변수함수", unit: "극값", concept: "이변수 극값 판별", difficulty: "medium",
    question: "이변수 함수 $f(x,y)=-3x^2+6xy+3y^2-2y^3$에 대하여 다음 중 옳은 것은?",
    options: [
      o("1","$f$는 $3$개의 임계점을 갖는다."),
      o("2","$f$는 $(0,0)$에서 극솟값을 갖는다."),
      o("3","$(1,1)$은 $f$의 안장점이다."),
      o("4","$f$는 $(2,2)$에서 극댓값을 갖는다."),
    ],
    answer: 4,
    explanation: "$f_x=-6x+6y=0,f_y=6x+6y-6y^2=0$ ⇒ 임계점 $(0,0),(2,2)$.\n$f_{xx}=-6,f_{yy}=6-12y,f_{xy}=6$.\n$(0,0)$: $D=-72<0$ 안장.\n$(2,2)$: $D=108>0,f_{xx}<0$ 극대."
  }),
  build({
    num: 24, subject: "적분학", unit: "이중적분", concept: "극좌표 변환 이중적분", difficulty: "medium",
    question: "$\\!\\displaystyle\\int_1^2\\!\\int_0^{\\sqrt{2x-x^2}}\\dfrac{1}{(x^2+y^2)^2}\\,dy\\,dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{16}$"), o("2","$\\dfrac{\\pi}{8}$"), o("3","$\\dfrac{\\pi}{4}$"), o("4","$\\dfrac{\\pi}{2}$")],
    answer: 1,
    explanation: "영역: $1\\le x\\le 2,\\,0\\le y\\le\\sqrt{2x-x^2}$ → 원 $x^2+y^2=2x$ ($r=2\\cos\\theta$) 안 + $r\\ge\\sec\\theta$ ($x\\ge 1$).\n극좌표: $0\\le\\theta\\le\\pi/4,\\,\\sec\\theta\\le r\\le 2\\cos\\theta$.\n$\\!\\int_0^{\\pi/4}\\!\\int_{\\sec\\theta}^{2\\cos\\theta}\\dfrac{r}{r^4}dr\\,d\\theta=\\dfrac{\\pi}{16}$."
  }),
  build({
    num: 25, subject: "적분학", unit: "이중적분", concept: "치환적분 (사다리꼴)", difficulty: "medium",
    question: "네 직선 $y=-2x+4,\\;y=-2x+7,\\;y=x-2,\\;y=x+1$로 둘러싸인 영역 $R$에 대하여 $\\!\\displaystyle\\iint_R(2x^2-xy-y^2)\\,dx\\,dy$의 값은?",
    options: [o("1","$\\dfrac{7}{4}$"), o("2","$\\dfrac{13}{4}$"), o("3","$\\dfrac{23}{4}$"), o("4","$\\dfrac{33}{4}$")],
    answer: 4,
    explanation: "$u=2x+y,v=x-y$ 치환: $4\\le u\\le 7,-1\\le v\\le 2$.\n$|J|=1/3$, $2x^2-xy-y^2=(2x+y)(x-y)=uv$.\n$\\dfrac{1}{3}\\!\\int_{-1}^2\\!\\int_4^7 uv\\,du\\,dv=\\dfrac{1}{3}\\cdot\\dfrac{33}{2}\\cdot\\dfrac{3}{2}=\\dfrac{33}{4}$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) { console.error("ERROR:", error); process.exit(1); }
console.log(`Inserted ${data.length} 문항 (2021 국민대):`, data.map((d) => d.id).join(", "));
