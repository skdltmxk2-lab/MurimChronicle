// Upload 2019년도 홍익대 편입수학 기출 15문항 (4지 선다, 70분, 원본 26~40번)
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
const YEAR = "2019";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hongik-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차(공명·미정계수)", difficulty: "mediumHard",
    question: "$x$에 관한 함수 $y$가 다음 조건 $y''-4y'+4y=ae^x,\\;y(0)=1,\\;y'(0)=4e,\\;y''(0)=0$을 만족할 때 상수 $a$의 값을 구하면?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 4,
    explanation: "특성: $(t-2)^2=0$ ⇒ $y_c=c_1 e^{2x}+c_2 xe^{2x}$.\n특수해 $y_p=\\dfrac{1}{(D-2)^2}\\{ae^x\\}=ae^x$.\n일반해 $y(x)=c_1 e^{2x}+c_2 xe^{2x}+ae^x$.\n초기값: $c_1+a=1,\\,2c_1+c_2+a=4e$ 형태 정리 후 $y''(0)=0$ 조건 ⇒ $a=4$."
  }),
  build({
    num: 2, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 미방", difficulty: "medium",
    question: "미분방정식 $-y\\,dx+x^2\\,dy=0,\\;y(1)=7$의 해 $y(x)$에 대하여 $y(2)$의 값을 구하면?",
    options: [o("1","$e$"), o("2","$7e$"), o("3","$14\\sqrt e$"), o("4","$7\\sqrt e$")],
    answer: 4,
    explanation: "$x^2\\dfrac{dy}{dx}=y$ ⇒ $y'-\\dfrac{1}{x^2}y=0$ 1계 선형.\n해 $y=ce^{-\\int(-1/x^2)dx}=ce^{-1/x}\\cdot e=\\dotsb$. 정리: $y(x)=7e^{1-1/x}$.\n$y(2)=7e^{1/2}=7\\sqrt e$."
  }),
  build({
    num: 3, subject: "선형대수", unit: "행렬", concept: "삼각행렬 고유값", difficulty: "easy",
    question: "다음 행렬 $\\!\\begin{pmatrix}1&0&0&0\\\\1&2&0&0\\\\0&2&5&0\\\\2&8&3&9\\end{pmatrix}$의 고유값이 아닌 것을 고르면?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$9$")],
    answer: 3,
    explanation: "하삼각행렬이므로 고유값은 대각성분 $1,2,5,9$. 따라서 $3$은 고유값이 아니다."
  }),
  build({
    num: 4, subject: "선형대수", unit: "행렬", concept: "행렬식 성질(전치·스칼라곱)", difficulty: "medium",
    question: "크기가 $2019\\times 2019$인 행렬 $A,B,C$는 $\\det A=2,\\,\\det B=2,\\,\\det C=3$을 만족한다. $\\det(A^{-1}B^t(-3C))$의 값을 구하면? (단, $B^t$는 $B$의 전치행렬)",
    options: [o("1","$9$"), o("2","$-3^{2020}$"), o("3","$3^{2019}$"), o("4","$-3^{2019}$")],
    answer: 2,
    explanation: "$\\det(A^{-1}B^t(-3C))=\\dfrac{1}{\\det A}\\det B\\cdot(-3)^{2019}\\det C=\\dfrac{1}{2}\\cdot 2\\cdot(-3)^{2019}\\cdot 3=-3^{2020}$."
  }),
  build({
    num: 5, subject: "선형대수", unit: "행렬", concept: "특수 행렬 행렬식(고유값)", difficulty: "mediumHard",
    question: "크기가 $12\\times 12$인 행렬 $A$가 대각성분 $0$, 나머지 성분 모두 $1$일 때 행렬식 $\\det A$의 값을 구하면?",
    options: [o("1","$0$"), o("2","$-11$"), o("3","$12$"), o("4","$-12$")],
    answer: 2,
    explanation: "$A=J-I$ ($J$=모두 1). 고유값: $11$(중복도 $1$), $-1$(중복도 $11$).\n$\\det A=11\\cdot(-1)^{11}=-11$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "극곡선(타원)·장축 길이", difficulty: "medium",
    question: "다음 극방정식 $r=\\dfrac{a}{3+\\cos\\theta}$이 정의하는 곡선은 장축의 길이가 $9$인 타원이다. 이때 양수 $a$의 값을 구하면?",
    options: [o("1","$1$"), o("2","$6$"), o("3","$9$"), o("4","$12$")],
    answer: 4,
    explanation: "$r(3+\\cos\\theta)=a$ ⇒ $3\\sqrt{x^2+y^2}+x=a$ ⇒ $3\\sqrt{x^2+y^2}=a-x$.\n제곱·정리: $8x^2+\\dotsb+9y^2=\\dfrac{9a^2}{8}$. 장축 길이 $=\\dfrac{6a}{8}=9$ ⇒ $a=12$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "중적분", concept: "고리(annulus) 영역 적분", difficulty: "medium",
    question: "원점이 중심이고 반지름이 $1$인 원과 원점이 중심이고 반지름이 $2$인 원에 의해 유계된 영역 중 1사분면과 2사분면에 있는 영역을 $R$이라 할 때 $\\!\\displaystyle\\iint_R(x+4y^2)dA$의 값을 구하면?",
    options: [o("1","$\\dfrac{15}{2}\\pi$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$10\\pi$"), o("4","$\\pi$")],
    answer: 1,
    explanation: "극좌표: $\\!\\int_0^\\pi\\!\\!\\int_1^2(r\\cos\\theta+4r^2\\sin^2\\theta)r\\,dr\\,d\\theta$.\n$\\!\\int_0^\\pi\\cos\\theta\\,d\\theta\\cdot\\!\\int_1^2 r^2 dr=0$. $\\!\\int_0^\\pi\\sin^2\\theta\\,d\\theta\\cdot 4\\!\\int_1^2 r^3 dr=\\dfrac{\\pi}{2}\\cdot 15=\\dfrac{15\\pi}{2}$."
  }),
  build({
    num: 8, subject: "공학수학", unit: "복소함수", concept: "복소 경로적분(공액)", difficulty: "medium",
    question: "$\\Gamma$가 복소평면에서 원점을 중심으로 하고 시계 반대 방향으로 돌아가는 반지름이 $1$인 원일 때 다음의 경로적분 $\\!\\displaystyle\\int_\\Gamma\\bar z\\,dz$의 값을 구하면?",
    options: [o("1","$0$"), o("2","$\\pi i$"), o("3","$2\\pi i$"), o("4","$-2\\pi i$")],
    answer: 3,
    explanation: "$z=\\cos\\theta+i\\sin\\theta$, $\\bar z=\\cos\\theta-i\\sin\\theta$, $\\dot z=(-\\sin\\theta+i\\cos\\theta)$.\n$\\!\\int_0^{2\\pi}(\\cos\\theta-i\\sin\\theta)(-\\sin\\theta+i\\cos\\theta)d\\theta=\\!\\int_0^{2\\pi}i\\,d\\theta=2\\pi i$."
  }),
  build({
    num: 9, subject: "공학수학", unit: "복소함수", concept: "코시 적분정리(해석함수)", difficulty: "easy",
    question: "복소평면 점 $1+2i$를 중심으로 하고 시계반대 방향으로 돌아가는 반지름이 $3$인 원 $C$에 대한 경로적분 $\\!\\displaystyle\\int_C\\sin(\\cos z)dz$의 값을 구하면?",
    options: [o("1","$0$"), o("2","$i$"), o("3","$\\pi i$"), o("4","$-2\\pi i$")],
    answer: 1,
    explanation: "$\\sin(\\cos z)$는 전체 평면에서 해석함수이므로 코시 적분정리에 의해 적분값 $=0$."
  }),
  build({
    num: 10, subject: "적분학", unit: "급수", concept: "급수 수렴·수렴반경 명제", difficulty: "medium",
    question: "다음 중 참인 명제만 고른 것은?\n\n㉠ 급수 $\\!\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{\\ln n}{n^2}$은 발산한다.\n㉡ 급수 $\\!\\displaystyle\\sum_{n=0}^{\\infty}n!x^n$의 수렴반지름을 $R$이라 할 때 $R=0$이다.\n㉢ 함수 $f(x)=\\ln x$의 $x=2$에서 테일러급수의 수렴반지름을 $R$이라 할 때 $R=2$이다.",
    options: [o("1","㉡"), o("2","㉡, ㉢"), o("3","㉠, ㉡"), o("4","㉠, ㉡, ㉢")],
    answer: 2,
    explanation: "㉠ 거짓: $\\dfrac{\\ln n}{n^2}\\le\\dfrac{1}{n^{3/2}}$ (충분히 큰 $n$) ⇒ 수렴.\n㉡ 참: $n!$ 증가 ⇒ $R=0$.\n㉢ 참: $\\ln x$ 정의역 $x>0$, $x=2$에서 가장 가까운 특이점 $0$까지 거리 $=2$."
  }),
  build({
    num: 11, subject: "공학수학", unit: "복소함수", concept: "복소 삼각함수 계산", difficulty: "medium",
    question: "$\\sin(i\\ln 3)$의 값을 구하면?",
    options: [o("1","$i$"), o("2","$-i$"), o("3","$-\\dfrac{4i}{3}$"), o("4","$\\dfrac{4i}{3}$")],
    answer: 4,
    explanation: "$\\sin(iz)=i\\sinh z$. $\\sin(i\\ln 3)=i\\sinh(\\ln 3)=i\\cdot\\dfrac{3-1/3}{2}=i\\cdot\\dfrac{4}{3}=\\dfrac{4i}{3}$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "쌍곡함수", concept: "쌍곡함수 합성", difficulty: "easy",
    question: "$\\cosh(\\sinh^{-1}(1))$의 값을 구하면?",
    options: [o("1","$\\sqrt 2$"), o("2","$1$"), o("3","$e$"), o("4","$\\sqrt e$")],
    answer: 1,
    explanation: "$\\sinh^{-1}1=a$ ⇒ $\\sinh a=1$. $\\cosh^2 a-\\sinh^2 a=1$ ⇒ $\\cosh a=\\sqrt 2$ ($\\cosh\\ge 1$)."
  }),
  build({
    num: 13, subject: "다변수함수", unit: "공간곡선", concept: "스프링 곡선 곡률", difficulty: "medium",
    question: "양수 $a$에 대하여 점 $(-3,0,\\pi a+1)$에서 곡선 $\\gamma(t)=(3\\cos t,3\\sin t,at+1)$의 곡률이 $\\dfrac{1}{6}$일 때 상수 $a$의 값을 구하면?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 3,
    explanation: "스프링 $(r\\cos t,r\\sin t,at+c)$의 곡률 $\\kappa=\\dfrac{r}{r^2+a^2}=\\dfrac{3}{9+a^2}=\\dfrac{1}{6}$ ⇒ $9+a^2=18$ ⇒ $a^2=9$ ⇒ $a=3$ ($a>0$)."
  }),
  build({
    num: 14, subject: "다변수함수", unit: "최댓값/최솟값", concept: "라그랑주 미정계수(타원체 위)", difficulty: "mediumHard",
    question: "곡면 $x^4+y^4+z^4=1$ 상에서 함수 $f(x,y,z)=x^2+y^2+z^2$의 최댓값을 구하면?",
    options: [o("1","$1$"), o("2","$\\sqrt 3$"), o("3","$3$"), o("4","$\\sqrt 6$")],
    answer: 2,
    explanation: "라그랑주: $x^3=\\lambda x,\\,y^3=\\lambda y,\\,z^3=\\lambda z$. $xyz\\ne 0$일 때 $x^2=y^2=z^2=\\lambda$. 제약조건 $3\\lambda^2=1$ ⇒ $\\lambda=\\dfrac{1}{\\sqrt 3}$. 최댓값 $=3\\cdot\\dfrac{1}{\\sqrt 3}=\\sqrt 3$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "확률/그래프", concept: "위치-시간 그래프 해석", difficulty: "easy",
    question: "어떤 입자의 위치 그래프 (시간 $t$ vs 위치 $s$)가 점 $(0,0)\\to(2,2)\\to(4,1)\\to(5,1)\\to(6,5)$를 잇는 꺾은선일 때 다음 중 옳은 것은?",
    options: [
      o("1","이 입자가 수평으로만 이동한다고 가정할 때, 2초 동안 오른쪽으로 2미터 이동 후 다음 2초간 왼쪽으로 2미터 이동했다가 그 다음 1초간 정지 후 1초간 오른쪽으로 3미터 이동했다."),
      o("2","이 입자가 수직으로만 이동한다고 가정할 때, 2초 동안 위로 2미터 이동 후 다음 2초간 아래로 1미터 떨어진 후 그 다음 1초간 공중 1미터 위에서 부양한 상태였다가 그 다음 1초간 지상 4미터 위에서 솟아 올랐다."),
      o("3","3초에서의 순간속도는 $-1$(미터/초)이다."),
      o("4","위의 그래프에 대한 속도 그래프는 보기 형태로 그릴 수 있다.")
    ],
    answer: 2,
    explanation: "위치 그래프의 기울기 변화 해석.\n$0\\to 2$구간: 위로 $2$미터 → $4\\to 5$구간: 위로 $1$미터 떨어진 후가 아니라 부양 의미.\n3초 순간속도: 기울기 $=\\dfrac{1-2}{4-2}=-\\dfrac{1}{2}$, $-1$ 아님."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 홍익대):`, data.map((d) => d.id).join(", "));
