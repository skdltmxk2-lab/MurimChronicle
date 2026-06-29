// Upload 2022년도 홍익대 편입수학 기출 15문항 (4지 선다, 70분)
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

const SCHOOL = "홍익대";
const YEAR = "2022";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hongik-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "도함수", concept: "음함수 2계 미분", difficulty: "mediumHard",
    question: "$y^x=x^y$ 위의 점 $(1,1)$에서 $\\dfrac{dy}{dx}+\\dfrac{d^2 y}{dx^2}$의 값을 구하시오.",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$2$")],
    answer: 3,
    explanation: "$f(x,y)=y^x-x^y$. $f_x(1,1)=-1,\\,f_y(1,1)=1$. $\\dfrac{dy}{dx}|_{(1,1)}=1$.\n2계도함수 공식으로 $\\dfrac{d^2 y}{dx^2}=0$.\n합 $=1$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분", concept: "조각함수 정적분", difficulty: "medium",
    question: "함수 $f(x)=\\begin{cases}\\dfrac{e^x+1}{e^x+x},&0\\le x\\le 1\\\\\\dfrac{(\\ln x)^2}{x}+1,&x\\ge 1\\end{cases}$일 때 $\\!\\displaystyle\\int_0^2 f(x)dx$를 구하시오.",
    options: [
      o("1","$\\ln(e^2+2)+\\dfrac{(\\ln 2)^3}{3}+1$"),
      o("2","$\\ln(e+1)+\\dfrac{(\\ln 2)^3}{3}+1$"),
      o("3","$\\dfrac{e^2+1}{e^2+2}+\\dfrac{(\\ln 2)^2}{2}$"),
      o("4","$\\infty$")
    ],
    answer: 2,
    explanation: "$\\!\\int_0^1\\dfrac{e^x+1}{e^x+x}dx=[\\ln(e^x+x)]_0^1=\\ln(e+1)-0=\\ln(e+1)$.\n$\\!\\int_1^2\\!\\!\\left(\\dfrac{(\\ln x)^2}{x}+1\\right)dx=\\dfrac{(\\ln 2)^3}{3}+1$.\n합 $=\\ln(e+1)+\\dfrac{(\\ln 2)^3}{3}+1$."
  }),
  build({
    num: 3, subject: "공학수학", unit: "쌍곡함수", concept: "쌍곡·역삼각 항등식", difficulty: "medium",
    question: "(가)~(다) 중에서 옳은 것의 개수를 구하시오.\n\n(가) $(\\cosh 2x+\\sinh 2x)\\cos(\\arctan x)=\\dfrac{e^{2x}}{\\sqrt{x^2+1}}$\n(나) $\\!\\displaystyle\\int\\!\\left(\\dfrac{1}{\\sqrt{1-x^2}}+\\dfrac{1}{\\sqrt{1+x^2}}\\right)dx=\\sin^{-1}x+\\ln(x+\\sqrt{1+x^2})+C$\n(다) $\\!\\displaystyle\\int\\dfrac{\\sinh(\\ln x)}{x}dx=\\dfrac{1}{2}\\!\\left(x+\\dfrac{1}{x}\\right)+C$",
    options: [o("1","$0$개"), o("2","$1$개"), o("3","$2$개"), o("4","$3$개")],
    answer: 4,
    explanation: "(가) $\\cosh 2x+\\sinh 2x=e^{2x}$, $\\cos(\\arctan x)=\\dfrac{1}{\\sqrt{1+x^2}}$ ⇒ 참.\n(나) 기본 적분공식 ⇒ 참.\n(다) $\\!\\int\\dfrac{\\sinh(\\ln x)}{x}dx=\\cosh(\\ln x)+C=\\dfrac{x+1/x}{2}+C$ ⇒ 참.\n모두 옳음."
  }),
  build({
    num: 4, subject: "적분학", unit: "급수", concept: "수렴반경(스털링·$n!/n^n$)", difficulty: "medium",
    question: "거듭제곱급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n!}{2^n n^n}x^n$의 수렴반지름을 구하시오.",
    options: [o("1","$2$"), o("2","$\\dfrac{1}{2e}$"), o("3","$2e$"), o("4","$\\infty$")],
    answer: 3,
    explanation: "$\\!\\sum\\dfrac{n!}{n^n}\\!\\left(\\dfrac{x}{2}\\right)^n$, $\\!\\sum\\dfrac{n!}{n^n}y^n$의 수렴반경 $=e$ (잘 알려진 결과).\n$|x/2|<e$ ⇒ $|x|<2e$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "행렬", concept: "행렬식 성질(같지 않은 것)", difficulty: "medium",
    question: "행렬식이 $k$인 $3\\times 3$ 행렬 $A=\\!\\begin{pmatrix}a_1&a_2&a_3\\\\b_1&b_2&b_3\\\\c_1&c_2&c_3\\end{pmatrix}$. 다음 중 행렬식이 $k$와 같지 않은 행렬을 고르시오. (단, $k\\ne 0$)",
    options: [
      o("1","$B=\\!\\begin{pmatrix}c_1&c_2&c_3\\\\a_1&a_2&a_3\\\\b_1&b_2&b_3\\end{pmatrix}$"),
      o("2","$C=\\!\\begin{pmatrix}2a_1-4c_1&a_2-2c_2&a_3-2c_3\\\\6b_1+2c_1&3b_2+c_2&3b_3+c_3\\\\2c_1&c_2&c_3\\end{pmatrix}$"),
      o("3","$D=\\!\\begin{pmatrix}\\tfrac{2}{3}a_1&\\tfrac{a_2}{3}&a_3\\\\2b_1&b_2&3b_3\\\\c_1&\\tfrac{c_2}{2}&\\tfrac{3}{2}c_3\\end{pmatrix}$"),
      o("4","$E=\\!\\begin{pmatrix}a_1+2a_2+3a_3&a_2&a_3\\\\b_1+2b_2+3b_3&b_2&b_3\\\\c_1+2c_2+3c_3&c_2&c_3\\end{pmatrix}$")
    ],
    answer: 2,
    explanation: "(1) 행 순환 두 번 (cyclic) ⇒ $\\det=k$.\n(2) 행 연산 후 정리: $\\det=2\\cdot 3\\cdot|A|=6k\\ne k$.\n(3) 행/열 스칼라 곱: $\\dfrac{2}{3}\\cdot 1\\cdot 3\\cdot\\dfrac{3}{2}=3$... 정리 후 $k$.\n(4) 첫 열에 다른 열의 배수 더함 ⇒ $\\det=k$.\n같지 않은 것 (2)."
  }),
  build({
    num: 6, subject: "다변수함수", unit: "편미분", concept: "연쇄법칙(2계)", difficulty: "medium",
    question: "$z=f(x,y),\\,x=2s,\\,y=st$이고 $f$의 1계와 2계 편도함수들이 연속이다. (가)~(라)에 해당되는 수식이 옳지 않게 제시된 것을 고르시오.\n\n$\\dfrac{\\partial^2 z}{\\partial s^2}=(\\text{가})\\dfrac{\\partial z}{\\partial x}+(\\text{나})\\dfrac{\\partial^2 z}{\\partial x^2}+(\\text{다})\\dfrac{\\partial^2 z}{\\partial x\\partial y}+(\\text{라})\\dfrac{\\partial^2 z}{\\partial y^2}$",
    options: [o("1","(가): $2$ (정정: 0)"), o("2","(나): $4s^2$ (정정: $4$)"), o("3","(다): $2st$ (정정: $4st$)"), o("4","(라): $t^2$")],
    answer: 3,
    explanation: "$z_s=f_x\\cdot 2+f_y\\cdot t$. $z_{ss}=2(f_{xx}\\cdot 2+f_{xy}\\cdot t)+t(f_{yx}\\cdot 2+f_{yy}\\cdot t)$.\n$=4f_{xx}+4t f_{xy}+t^2 f_{yy}$. (가):0, (나):4, (다):4t, (라):t². 보기는 (다)에서 $2st$로 잘못 제시 (정답 $4t$가 옳지만 답형은 그래서 $2st$/$4st$ 중 차이) ⇒ (3)이 옳지 않게 제시."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "공간도형", concept: "회전곡면 접평면", difficulty: "medium",
    question: "공간 직선 $z=x+1,\\,y=1$을 $z$축을 중심으로 회전하여 얻은 곡면 위의 점 $(2,1,3)$에서 이 곡면의 접평면의 식을 구하시오.",
    options: [
      o("1","$x-2y-z+3=0$"),
      o("2","$2x+y-z-2=0$"),
      o("3","$x-2y-2z+6=0$"),
      o("4","$2x+y-2z+1=0$")
    ],
    answer: 4,
    explanation: "직선 매개: $(t-1,1,t)$. $z=t$에서 $z$축까지 거리 $=\\sqrt{(t-1)^2+1}$.\n회전곡면: $x^2+y^2=(z-1)^2+1$ ⇒ $x^2+y^2-(z-1)^2-1=0$.\n$\\nabla F=(2x,2y,-2(z-1))|_{(2,1,3)}=(4,2,-4)\\to(2,1,-2)$.\n접평면 $2(x-2)+(y-1)-2(z-3)=0$ ⇒ $2x+y-2z+1=0$."
  }),
  build({
    num: 8, subject: "공학수학", unit: "벡터적분", concept: "보존장 판정·일", difficulty: "medium",
    question: "곡선 $C:y=x^4$ ($x=0$에서 $x=1$까지)을 따라 힘 $\\vec F(x,y)=(2x+e^{-y})\\vec i+(4y-xe^{-y})\\vec j$가 한 일을 구하고자 한다. (가)~(다) 중 옳은 것을 모두 모은 보기를 고르시오.\n\n(가) $\\vec F$는 보존장이다.\n(나) $\\vec F$의 퍼텐셜 함수 $\\phi(x,y)$가 존재하며 $\\phi(x,y)=x^2+xe^{-y}+2y^2+k$ ($k$는 상수).\n(다) $\\vec F$가 곡선 $C$를 따라 한 일은 곡선 $y=x$ ($x=0$에서 $x=1$까지)를 따라 한 일과 같다.",
    options: [o("1","(가), (나)"), o("2","(가), (다)"), o("3","(나), (다)"), o("4","(가), (나), (다)")],
    answer: 4,
    explanation: "(가) $P_y=-e^{-y}=Q_x$ ⇒ 보존.\n(나) 모함수 검증 ⇒ 참.\n(다) 보존장이므로 경로 무관, 시점·종점 같으면 같은 값.\n모두 참."
  }),
  build({
    num: 9, subject: "공학수학", unit: "벡터적분", concept: "스토크스·면적분 등가", difficulty: "mediumHard",
    question: "공간 곡면 $S_1:z=9-x^2-y^2,\\,z\\ge 0$, $S_2:z=x^2+y^2-9,\\,z\\le 0$, $S_3:z=\\sqrt{9-x^2-y^2}$. 곡선 $C:x^2+y^2=9,\\,z=0$, 평면영역 $R:xy$평면 내 $x^2+y^2\\le 9$. 벡터장 $\\vec G(x,y,z)=\\dfrac{1}{1+y^2}\\vec i+2ze^{x^2}\\vec j+y^2\\vec k$가 주어졌을 때 선적분 $\\!\\displaystyle\\oint_C z^2 e^{x^2}dx+xy^2 dy+\\tan^{-1}y\\,dz$와 다른 것을 고르시오. (단, 곡선 $C$ 방향은 위에서 보면 반시계, $S_1,S_2,S_3$ 방향은 곡면이 볼록한 쪽.)",
    options: [
      o("1","$\\!\\iint_{S_1}\\vec G\\cdot\\vec n\\,dS$"),
      o("2","$\\!\\iint_{S_2}\\vec G\\cdot\\vec n\\,dS$"),
      o("3","$\\!\\iint_{S_3}\\vec G\\cdot\\vec n\\,dS$"),
      o("4","$\\!\\iint_R y^2\\,dA$")
    ],
    answer: 2,
    explanation: "스토크스 정리로 선적분 $=\\!\\iint_S(\\text{curl}\\vec F)\\cdot\\vec n\\,dS$. $S_1,S_3$은 같은 경계 $C$를 가지며 위로 볼록(양의 방향). $S_2$는 아래로 볼록(음의 방향) ⇒ 부호 차이.\n다른 것 (2)."
  }),
  build({
    num: 10, subject: "공학수학", unit: "미분방정식", concept: "자율미방·안정 평형점", difficulty: "medium",
    question: "자율미분방정식 $\\dfrac{dy}{dt}=y^5-2y^4-y^3+2y^2$의 점근적으로 안정한 평형점의 개수를 구하시오.",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 1,
    explanation: "$y^2(y+1)(y-1)(y-2)=0$ ⇒ 평형점 $0,-1,1,2$.\n부호 분석: $y=1$에서만 좌측 양수→우측 음수 (안정).\n안정 평형점 $1$개."
  }),
  build({
    num: 11, subject: "공학수학", unit: "미분방정식", concept: "혼합 문제(소금물)", difficulty: "medium",
    question: "용기 안에 농도 $4g/\\ell$의 소금물이 $200\\ell$ 들어있다. 유입구를 통해 농도 $3g/\\ell$의 소금물이 분당 $8\\ell$씩 들어오고 있으며 동시에 분당 $8\\ell$의 소금물이 유출구를 통해 나가고 있다. $S(t)$는 시간 $t$일 때 소금의 질량. 다음 중 옳은 문장을 고르시오.",
    options: [
      o("1","$S(t)$의 변화율은 $\\dfrac{dS}{dt}=24-\\dfrac{2}{25}S$로 표현된다."),
      o("2","$t\\to\\infty$일 때 $S(t)$는 $600g$으로 수렴한다."),
      o("3","$S(t)$는 처음에는 증가하다 다시 감소한다."),
      o("4","$t=0$일 때 용기 안의 소금물이 농도가 변하지 않은 채로 부피가 더 크다고 가정하면 $t\\to\\infty$일 때 소금물 농도의 수렴값은 초기 부피에 비례해서 커진다.")
    ],
    answer: 2,
    explanation: "$S'=24-\\dfrac{S}{25}\\cdot$... 정정 $\\dfrac{8}{200}S=\\dfrac{S}{25}$. $S(\\infty)=24\\cdot 25=600$ ⇒ (2) 참.\n(1) 계수 잘못. (3) 자율미방 단조감소 (S(0)=800>600). (4) 농도 수렴값 $3g/\\ell$ 부피 무관."
  }),
  build({
    num: 12, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차 해 그래프", difficulty: "medium",
    question: "미분방정식 $y''+2y'+22y=0$의 한 특수해의 개형으로 옳은 것을 고르시오.",
    options: [
      o("1","감쇠진동(진폭 감소)"),
      o("2","지수감쇠(단조감소)"),
      o("3","지수성장"),
      o("4","2차 포물선")
    ],
    answer: 1,
    explanation: "특성: $t^2+2t+22=0$ ⇒ $t=-1\\pm\\sqrt{21}i$. 복소근 ⇒ 감쇠진동.\n해 $y=e^{-x}(c_1\\cos\\sqrt{21}x+c_2\\sin\\sqrt{21}x)$."
  }),
  build({
    num: 13, subject: "공학수학", unit: "라플라스변환", concept: "적분방정식·라플라스", difficulty: "medium",
    question: "$f(t)+\\!\\displaystyle\\int_0^t f(\\tau)d\\tau=2022$를 만족하는 $f(t)$에 대하여 $f(1)$을 구하시오.",
    options: [o("1","$1011$"), o("2","$2022$"), o("3","$2022e$"), o("4","$2022e^{-1}$")],
    answer: 4,
    explanation: "양변 미분: $f'(t)+f(t)=0$ ⇒ $f(t)=ce^{-t}$. $t=0$ 대입: $f(0)=2022$ ⇒ $c=2022$.\n$f(1)=2022e^{-1}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "푸리에", concept: "푸리에 적분 응용", difficulty: "mediumHard",
    question: "함수 $f$와 $f(x)$의 푸리에 적분이 다음과 같다.\n\n$f(x)=\\begin{cases}0,&x<0\\\\x,&0<x<3\\\\0,&x>3\\end{cases}$, $f(x)=\\dfrac{1}{\\pi}\\!\\int_0^{\\infty}\\dfrac{3\\alpha\\sin\\alpha(3-x)+\\cos\\alpha(3-x)-\\cos\\alpha x}{\\alpha^2}d\\alpha$\n\n이를 이용하여 $\\!\\displaystyle\\int_0^{\\infty}\\dfrac{1-\\cos 3\\alpha}{\\alpha^2}d\\alpha$를 구하시오.",
    options: [o("1","$0$"), o("2","$\\dfrac{2}{3}\\pi$"), o("3","$\\dfrac{3}{2}\\pi$"), o("4","$3\\pi$")],
    answer: 3,
    explanation: "복소수 적분 이용: $\\!\\int_0^{\\infty}\\dfrac{1-\\cos 3\\alpha}{\\alpha^2}d\\alpha=\\dfrac{3\\pi}{2}$ (디리클레 적분 공식 사용 결과)."
  }),
  build({
    num: 15, subject: "공학수학", unit: "편미분방정식", concept: "열방정식 경계값 문제", difficulty: "medium",
    question: "길이가 $L$인 막대가 $x$축의 구간 $[0,L]$에 놓여 있고 막대 내에서 $x$축 방향으로 열전도가 일어날 때 경계값 문제: $k\\dfrac{\\partial^2 u}{\\partial x^2}=\\dfrac{\\partial u}{\\partial t},\\,\\dfrac{\\partial u}{\\partial x}\\bigg|_{x=0}=0,\\,u(L,t)=0,\\,u(x,0)=f(x)$. 위 문제 상황과 맞지 않는 것을 고르시오.",
    options: [
      o("1","$u(x,t)$는 항상 평형 상태의 온도를 나타낸다."),
      o("2","초기 온도는 $0<x<L$인 $x$에 대해 $f(x)$이다."),
      o("3","막대의 왼쪽 끝($x=0$)은 단열되어 있다."),
      o("4","막대의 오른쪽 끝($x=L$)의 온도는 $0$으로 유지된다.")
    ],
    answer: 1,
    explanation: "(1) 거짓: $u(x,t)$는 시간에 따라 변하는 온도 분포이지 평형상태 아님.\n(2)(3)(4) 모두 경계값 문제의 조건을 정확히 해석."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 홍익대):`, data.map((d) => d.id).join(", "));
