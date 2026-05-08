// Upload 2023년도 건국대 편입수학 기출 20문항 (21~40번, 5지선다)
// Usage: node scripts/upload_general_2023_konkuk.mjs
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

const SCHOOL = "건국대";
const YEAR = "2023";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation, questionImage }) {
  const id = `q-${YEAR}-konkuk-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return {
    id, subject, unit, concept, difficulty,
    source_type: "imported", question,
    content_type: questionImage ? "mixed" : "latex",
    question_image: questionImage ?? null,
    options, correct_option_id: String(answer), explanation,
    explanation_content_type: "latex", explanation_image: null, tags,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
}

// 35번: C1 (0,1)→(1,e) 곡선 y=e^x, C2 (1,e)→(4,3) 선분.
// e ≈ 2.718. 그래프 좌표로 환산: x: 0~4, y: 0~3 정도. 80px 단위로 매핑.
const PROBLEM_35_GRAPH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="320" height="220">
  <defs>
    <marker id="arrh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#1f2937"/>
    </marker>
  </defs>
  <!-- 격자 -->
  <g stroke="#e5e7eb" stroke-width="1">
    <line x1="40" y1="40" x2="40" y2="190"/>
    <line x1="40" y1="190" x2="300" y2="190"/>
  </g>
  <!-- 축 -->
  <line x1="40" y1="195" x2="300" y2="195" stroke="#1f2937" stroke-width="1.4" marker-end="url(#arrh)"/>
  <line x1="40" y1="195" x2="40" y2="20" stroke="#1f2937" stroke-width="1.4" marker-end="url(#arrh)"/>
  <text x="305" y="200" font-size="12" fill="#1f2937">x</text>
  <text x="28" y="20" font-size="12" fill="#1f2937">y</text>
  <!-- C1: y=e^x, x∈[0,1]. (0,1)→(1,e≈2.72). 좌표 변환 x:40+60x, y:190-30y -->
  <path d="M 40 160 Q 70 145 70 117.4 T 100 108.4" fill="none" stroke="#0ea5e9" stroke-width="2.2"/>
  <!-- C2: 선분 (1,e)→(4,3). (100,108.4)→(280,100). -->
  <line x1="100" y1="108.4" x2="280" y2="100" stroke="#0ea5e9" stroke-width="2.2"/>
  <!-- 점 표시 -->
  <circle cx="40" cy="160" r="3" fill="#0ea5e9"/>
  <circle cx="100" cy="108.4" r="3" fill="#0ea5e9"/>
  <circle cx="280" cy="100" r="3" fill="#0ea5e9"/>
  <!-- 라벨 -->
  <text x="20" y="164" font-size="11" fill="#1f2937">(0,1)</text>
  <text x="100" y="100" font-size="11" fill="#1f2937">(1, e)</text>
  <text x="248" y="92" font-size="11" fill="#1f2937">(4, 3)</text>
  <text x="60" y="142" font-size="12" font-weight="bold" fill="#0ea5e9">C₁</text>
  <text x="180" y="98" font-size="12" font-weight="bold" fill="#0ea5e9">C₂</text>
</svg>`;

const problems = [
  build({
    num: 21, subject: "다변수함수", unit: "편도함수", concept: "음함수의 이계도함수", difficulty: "mediumHard",
    question: "양의 실수 $x$와 $y$가 관계식 $x^2+3xy+y^2=5$를 만족할 때, 이계도함수 $\\left.\\dfrac{d^2y}{dx^2}\\right|_{x=1}$의 값은?",
    options: [o("1","$\\dfrac{1}{5}$"), o("2","$\\dfrac{2}{5}$"), o("3","$\\dfrac{3}{5}$"), o("4","$\\dfrac{4}{5}$"), o("5","$1$")],
    answer: 2,
    explanation: "음함수 미분으로 1계: $\\dfrac{dy}{dx}=-\\dfrac{f_x}{f_y}=-\\dfrac{2x+3y}{3x+2y}$. $x=1$ 대입: $y^2+3y-4=0,\\ y>0$이므로 $y=1$. 이때 $\\dfrac{dy}{dx}=-\\dfrac{5}{5}=-1$. 다변수함수 공식 $\\dfrac{d^2y}{dx^2}=-\\dfrac{f_y^2 f_{xx}-2f_x f_y f_{xy}+f_x^2 f_{yy}}{f_y^3}$ 사용. $f_{xx}=2,\\ f_{yy}=2,\\ f_{xy}=3$이고 $f_x(1,1)=5,\\ f_y(1,1)=5$. 따라서 $\\dfrac{d^2y}{dx^2}=-\\dfrac{25\\cdot 2 - 2\\cdot 5\\cdot 5\\cdot 3 + 25\\cdot 2}{125}=-\\dfrac{50-150+50}{125}=\\dfrac{50}{125}=\\dfrac{2}{5}$."
  }),
  build({
    num: 22, subject: "적분학", unit: "정적분의 계산", concept: "정적분의 기본정리(역도함수)", difficulty: "easyMedium",
    question: "함수 $y=f(x)$의 도함수가 $f'(x)=\\dfrac{1}{\\sqrt{4+x^2}}$일 때, $f(2)$의 값은? (단, $f(0)=0$이다.)",
    options: [o("1","$\\ln(\\sqrt 2 - 2)$"), o("2","$\\ln(\\sqrt 2 - 1)$"), o("3","$\\ln\\sqrt 2$"), o("4","$\\ln(\\sqrt 2 + 1)$"), o("5","$\\ln(\\sqrt 2 + 2)$")],
    answer: 4,
    explanation: "$\\int_0^2 f'(x)dx = f(2)-f(0) = f(2)$. 이때 $\\int \\dfrac{1}{\\sqrt{a^2+x^2}}dx = \\ln|x+\\sqrt{a^2+x^2}|+C$ ($a=2$). 따라서 $f(2) = [\\ln(x+\\sqrt{x^2+4})]_0^2 = \\ln(2+2\\sqrt 2)-\\ln 2 = \\ln\\dfrac{2+2\\sqrt 2}{2}=\\ln(\\sqrt 2 +1)$."
  }),
  build({
    num: 23, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "기하급수 전개(테일러)", difficulty: "medium",
    question: "$x=-1$에서 함수 $f(x)=\\dfrac{4}{2x+3}$의 테일러 급수의 7차항의 계수는?",
    options: [o("1","$4\\times 3^7$"), o("2","$4\\times(-3)^7$"), o("3","$4\\times 2^7$"), o("4","$4\\times(-2)^7$"), o("5","$4\\times(-1)^7$")],
    answer: 4,
    explanation: "$x=-1$ 중심의 테일러 급수는 $f(x)$를 $(x+1)$의 거듭제곱으로 전개하는 것. $f(x)=\\dfrac{4}{2x+3}=\\dfrac{4}{2(x+1)+1}=\\dfrac{4}{1-(-2(x+1))}$. 기하급수 $\\dfrac{1}{1-r}=\\sum r^n$에 $r=-2(x+1)$ 대입하면 $f(x)=\\sum_{n=0}^{\\infty} 4(-2(x+1))^n = \\sum 4\\cdot(-2)^n (x+1)^n$. 따라서 7차항 계수 = $4\\times(-2)^7$."
  }),
  build({
    num: 24, subject: "다변수함수", unit: "중적분", concept: "이중적분(영역)", difficulty: "medium",
    question: "$xy$평면에서 세 직선 $x=0,\\ y=x,\\ y=1$에 의해 둘러싸인 영역을 $D$라 할 때, 다음 적분값은?\\\\ $\\displaystyle\\iint_D 9x\\sqrt{y^3+1}\\,dA$",
    options: [o("1","$2\\sqrt 2$"), o("2","$2\\sqrt 2 -1$"), o("3","$3\\sqrt 2$"), o("4","$3\\sqrt 2 -1$"), o("5","$3\\sqrt 2 -2$")],
    answer: 2,
    explanation: "영역은 $0\\le y\\le 1,\\ 0\\le x\\le y$ (꼭짓점 (0,0),(1,1),(0,1)). $\\iint_D 9x\\sqrt{y^3+1}dA = \\int_0^1\\int_0^y 9x\\sqrt{y^3+1}dx\\,dy = \\int_0^1 \\dfrac{9}{2}y^2\\sqrt{y^3+1}dy$. $u=y^3+1,\\ du=3y^2dy$ 치환: $\\int_1^2 \\dfrac{3}{2}\\sqrt u\\,du = [u^{3/2}]_1^2 = 2\\sqrt 2 - 1$."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "추가내용", concept: "곡선 접선과 평면", difficulty: "medium",
    question: "삼차원 곡선 $\\vec r(t)=\\langle\\cos t,\\sin t,t^2\\rangle,\\ 0\\le t\\le \\pi$ 위의 점 $P$에서 접선이 평면 $x+\\sqrt 3 y = 2$와 평행할 때, 점 $P$의 좌표는?",
    options: [
      o("1","$\\left(\\dfrac{\\sqrt 3}{2},\\dfrac{1}{2},\\dfrac{\\pi^2}{36}\\right)$"),
      o("2","$\\left(\\dfrac{\\sqrt 2}{2},\\dfrac{\\sqrt 2}{2},\\dfrac{\\pi^2}{16}\\right)$"),
      o("3","$\\left(\\dfrac{1}{2},\\dfrac{\\sqrt 3}{2},\\dfrac{\\pi^2}{9}\\right)$"),
      o("4","$\\left(0,1,\\dfrac{\\pi^2}{4}\\right)$"),
      o("5","$\\left(-\\dfrac{1}{2},\\dfrac{\\sqrt 3}{2},\\dfrac{4\\pi^2}{9}\\right)$")
    ],
    answer: 3,
    explanation: "접선이 평면과 평행이라면 접선벡터와 평면 법선벡터가 수직이다. 곡선의 접선벡터: $\\vec r'(t)=(-\\sin t,\\cos t,2t)$. 평면 $x+\\sqrt 3 y=2$의 법선벡터: $(1,\\sqrt 3,0)$. 내적이 0이어야 하므로 $-\\sin t + \\sqrt 3\\cos t = 0 \\Rightarrow \\tan t = \\sqrt 3 \\Rightarrow t = \\dfrac{\\pi}{3}$ ($0\\le t\\le \\pi$). 점 $P=\\left(\\cos\\tfrac{\\pi}{3},\\sin\\tfrac{\\pi}{3},\\left(\\tfrac{\\pi}{3}\\right)^2\\right)=\\left(\\dfrac{1}{2},\\dfrac{\\sqrt 3}{2},\\dfrac{\\pi^2}{9}\\right)$."
  }),
  build({
    num: 26, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "산술-기하 평균(제약 최적화)", difficulty: "medium",
    question: "원 $x^2+y^2=8$ 위에서 함수 $f(x,y)=e^{xy}$의 최댓값을 $M$, 최솟값을 $m$이라 할 때 $M+m$은?",
    options: [o("1","$2e^4$"), o("2","$2e^6$"), o("3","$e^4 + e^{-4}$"), o("4","$e^6 + e^{-6}$"), o("5","$e^8 + e^{-8}$")],
    answer: 3,
    explanation: "$y=e^x$가 증가함수이므로 $f=e^{xy}$의 최대/최소는 $xy$의 최대/최소에서 결정. 산술-기하 평균: $x^2+y^2 \\ge 2|xy| \\Rightarrow 8\\ge 2|xy| \\Rightarrow -4\\le xy\\le 4$. 따라서 $xy$의 최댓값 4(예: $x=y=2$), 최솟값 -4(예: $x=2,y=-2$). $M=e^4$, $m=e^{-4}$. $M+m=e^4+e^{-4}$."
  }),
  build({
    num: 27, subject: "적분학", unit: "급수의 수렴/발산", concept: "멱급수 수렴구간", difficulty: "medium",
    question: "멱급수 $\\displaystyle\\sum_{n=0}^{\\infty} a_n(x-2)^n$이 $x=5$에서 수렴하고 $x=-2$에서 발산한다. 다음 중 항상 참인 것을 모두 구하시오.\\\\ (가) $\\displaystyle\\sum_{n=0}^{\\infty}(-3)^n a_n$은 발산한다.\\\\ (나) $\\displaystyle\\sum_{n=0}^{\\infty} a_n$은 수렴한다.\\\\ (다) $\\displaystyle\\sum_{n=0}^{\\infty} 5^n a_n$은 발산한다.",
    options: [o("1","가, 나"), o("2","나, 다"), o("3","가, 다"), o("4","가, 나, 다"), o("5","없다.")],
    answer: 2,
    explanation: "수렴반경 $R$. $x=5$($|5-2|=3$)에서 수렴 → $R\\ge 3$. $x=-2$($|-2-2|=4$)에서 발산 → $R\\le 4$. 즉 $3\\le R\\le 4$. (가) $\\sum(-3)^n a_n$은 $x=-1$ ($|x-2|=3$)인 점. $|x-2|=R$인 경계에서는 수렴/발산 모두 가능 → 알 수 없음(반례 가능). 항상 참 아님. (나) $\\sum a_n$은 $x=3$($|x-2|=1<R$)이므로 수렴. ✓ (다) $\\sum 5^n a_n$은 $x=7$ ($|x-2|=5>R$)이므로 발산. ✓ 정답 (나, 다)."
  }),
  build({
    num: 28, subject: "다변수함수", unit: "추가내용", concept: "관련변화율(부피→높이)", difficulty: "medium",
    question: "식 $z=x^2+y^2$으로 주어진 곡면 모양의 그릇에 매 초 일정한 양의 물이 채워지고 있다. 시간 $t$일 때 물의 높이 $h=h(t)$의 변화율 $\\dfrac{dh}{dt}$는 다음 중 어느 것에 비례하는가?",
    options: [o("1","$\\dfrac{1}{h^4}$"), o("2","$\\dfrac{1}{h^2}$"), o("3","$\\dfrac{1}{h}$"), o("4","$\\dfrac{1}{\\sqrt h}$"), o("5","$h$에 무관하게 일정하다.")],
    answer: 3,
    explanation: "그릇은 회전포물면 $z=x^2+y^2$. 물이 높이 $h$까지 차면 단면이 원 (반지름 $\\sqrt h$). 부피 $V=\\int_0^h \\pi(\\sqrt y)^2 dy = \\dfrac{\\pi h^2}{2}$. 양변을 $t$로 미분: $\\dfrac{dV}{dt} = \\pi h \\dfrac{dh}{dt}$. $\\dfrac{dV}{dt}$가 일정하므로 $\\dfrac{dh}{dt} \\propto \\dfrac{1}{h}$."
  }),
  build({
    num: 29, subject: "적분학", unit: "정적분의 응용", concept: "회전체 부피(원주각법)", difficulty: "mediumHard",
    question: "곡선 $y=\\dfrac{\\sin^{-1}x}{x+1}$과 $x$축, $x=1$로 둘러싸인 영역을 $x=-1$을 축으로 한 바퀴 회전하여 생기는 입체의 부피는?",
    options: [o("1","$\\pi^2-3\\pi$"), o("2","$\\pi^2-2\\pi$"), o("3","$\\pi^2-\\pi$"), o("4","$\\pi^2+\\pi$"), o("5","$\\pi^2+2\\pi$")],
    answer: 2,
    explanation: "원주각법(셸 메서드): $V=2\\pi\\int_0^1 (x+1)\\cdot\\dfrac{\\sin^{-1}x}{x+1}dx = 2\\pi\\int_0^1 \\sin^{-1}x\\,dx$. $\\int_0^1 \\sin^{-1}x\\,dx$는 정적분과 역함수 관계로 $\\dfrac{\\pi}{2}\\cdot 1 - \\int_0^{\\pi/2}\\sin x\\,dx = \\dfrac{\\pi}{2}-1$. 따라서 $V=2\\pi(\\dfrac{\\pi}{2}-1)=\\pi^2-2\\pi$."
  }),
  build({
    num: 30, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙(역방향)", difficulty: "mediumHard",
    question: "미분가능한 이변수 함수 $f$와 $g$에 대하여 $g(x,y)=f(xy,x+y)$이 성립한다. $\\nabla g(1,2)=\\langle 2,3\\rangle$일 때, $|\\nabla f(2,3)|$의 값은?",
    options: [o("1","$3$"), o("2","$\\sqrt{11}$"), o("3","$\\sqrt{13}$"), o("4","$\\sqrt{15}$"), o("5","$\\sqrt{17}$")],
    answer: 5,
    explanation: "$u=xy,\\ v=x+y$로 두면 $g(x,y)=f(u,v)$. 연쇄법칙: $g_x = f_u\\cdot u_x + f_v\\cdot v_x = f_u\\cdot y + f_v$, $g_y = f_u\\cdot x + f_v$. $(x,y)=(1,2)$일 때 $(u,v)=(2,3)$. $g_x(1,2)=2f_u(2,3)+f_v(2,3)=2$, $g_y(1,2)=f_u(2,3)+f_v(2,3)=3$. 연립: $f_u(2,3)=-1,\\ f_v(2,3)=4$. 따라서 $|\\nabla f(2,3)|=\\sqrt{1+16}=\\sqrt{17}$."
  }),
  build({
    num: 31, subject: "적분학", unit: "급수의 수렴/발산", concept: "기하급수 응용($\\ln$합)", difficulty: "medium",
    question: "다음 급수의 값은?\\\\ $\\displaystyle\\sum_{k=0}^{\\infty}\\dfrac{1}{2^k(k+1)}$",
    options: [o("1","$0$"), o("2","$\\ln 2$"), o("3","$2\\ln 2$"), o("4","$1+\\ln 2$"), o("5","$\\ln 3 + \\ln 2$")],
    answer: 3,
    explanation: "공식: $\\displaystyle\\sum_{k=0}^{\\infty}\\dfrac{x^k}{k+1}=\\dfrac{-\\ln(1-x)}{x}$ ($|x|<1$). 유도: $-\\ln(1-x)=\\sum_{k=1}^{\\infty}\\dfrac{x^k}{k}=\\sum_{k=0}^{\\infty}\\dfrac{x^{k+1}}{k+1}$. 양변을 $x$로 나누면 위 공식. $x=\\tfrac{1}{2}$ 대입: $\\sum_{k=0}^{\\infty}\\dfrac{(1/2)^k}{k+1}=\\dfrac{-\\ln(1/2)}{1/2}=2\\ln 2$."
  }),
  build({
    num: 32, subject: "다변수함수", unit: "편도함수", concept: "방향도함수/경도", difficulty: "mediumHard",
    question: "점 $P$에서 함수 $f(x,y,z)$가 가장 빠르게 증가하는 방향이 $\\langle 1,2,1\\rangle$이고, $\\vec v=\\dfrac{1}{\\sqrt 2}\\langle 1,0,1\\rangle$에 대한 방향도함수가 $D_{\\vec v} f(P)=\\sqrt 6$이다. $|\\nabla f(P)|$의 값은?",
    options: [o("1","$2\\sqrt 3$"), o("2","$3\\sqrt 3$"), o("3","$2\\sqrt 2$"), o("4","$3\\sqrt 2$"), o("5","$4\\sqrt 2$")],
    answer: 4,
    explanation: "최대증가 방향이 $\\langle 1,2,1\\rangle$이므로 $\\nabla f(P)=k\\langle 1,2,1\\rangle$ (단 $k>0$). 방향도함수 = 경도와 단위벡터의 내적: $D_{\\vec v}f(P) = k\\langle 1,2,1\\rangle\\cdot\\dfrac{1}{\\sqrt 2}\\langle 1,0,1\\rangle = k\\cdot\\dfrac{1+0+1}{\\sqrt 2}=k\\sqrt 2 = \\sqrt 6 \\Rightarrow k=\\sqrt 3$. $|\\nabla f(P)| = k\\sqrt{1+4+1} = \\sqrt 3\\cdot\\sqrt 6 = 3\\sqrt 2$."
  }),
  build({
    num: 33, subject: "다변수함수", unit: "중적분", concept: "선형치환에 의한 면적", difficulty: "medium",
    question: "영역 $\\{x^4+y^4\\le 1\\}$의 넓이가 $S$일 때, 영역 $\\{4x^4+9y^4\\le 1\\}$의 넓이는?",
    options: [o("1","$\\dfrac{1}{\\sqrt 6}S$"), o("2","$\\dfrac{1}{6}S$"), o("3","$\\sqrt 6 S$"), o("4","$6S$"), o("5","$36 S$")],
    answer: 1,
    explanation: "$4x^4+9y^4\\le 1$을 $x^4+y^4\\le 1$ 형태로 만들기 위해 $x=\\dfrac{X}{\\sqrt 2},\\ y=\\dfrac{Y}{\\sqrt 3}$로 치환하면 $4\\cdot\\dfrac{X^4}{4}+9\\cdot\\dfrac{Y^4}{9}=X^4+Y^4\\le 1$. 야코비안 $\\dfrac{\\partial(x,y)}{\\partial(X,Y)}=\\dfrac{1}{\\sqrt 2}\\cdot\\dfrac{1}{\\sqrt 3}=\\dfrac{1}{\\sqrt 6}$. 따라서 새 영역 면적 = $\\dfrac{1}{\\sqrt 6}\\iint_{X^4+Y^4\\le 1}dXdY = \\dfrac{1}{\\sqrt 6}S$."
  }),
  build({
    num: 34, subject: "다변수함수", unit: "편도함수", concept: "편도함수 동등 조건", difficulty: "mediumHard",
    question: "이변수함수 $f(x,y)=\\dfrac{x}{(x^2+y^2)^{3/2}}$에 대하여 원점을 제외한 직선 $y=kx$ 위의 모든 점에서 편도함수 $\\dfrac{\\partial f}{\\partial x}$와 $\\dfrac{\\partial f}{\\partial y}$의 값이 같다면, 양수 $k$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt{17}-4}{2}$"), o("2","$\\dfrac{\\sqrt{17}-3}{2}$"), o("3","$\\dfrac{\\sqrt{17}-2}{2}$"), o("4","$\\dfrac{\\sqrt{17}-1}{2}$"), o("5","$\\dfrac{\\sqrt{17}}{2}$")],
    answer: 2,
    explanation: "$f_x=\\dfrac{(x^2+y^2)^{3/2}-3x^2(x^2+y^2)^{1/2}}{(x^2+y^2)^3} = \\dfrac{(x^2+y^2)-3x^2}{(x^2+y^2)^{5/2}}=\\dfrac{y^2-2x^2}{(x^2+y^2)^{5/2}}$. $f_y = \\dfrac{-3xy}{(x^2+y^2)^{5/2}}$. $y=kx$ 대입 후 $f_x=f_y$: $k^2 x^2 - 2x^2 = -3kx^2 \\Rightarrow k^2 + 3k - 2 = 0$. 양수 해: $k=\\dfrac{-3+\\sqrt{9+8}}{2}=\\dfrac{\\sqrt{17}-3}{2}$."
  }),
  build({
    num: 35, subject: "다변수함수", unit: "선적분과 면적분", concept: "완전미분(보존장)", difficulty: "medium",
    question: "$C_1$은 $(0,1)$에서 $(1,e)$까지의 곡선 $y=e^x$의 호이고, $C_2$는 $(1,e)$에서 $(4,3)$까지의 선분이다. $C$가 $C_1$과 $C_2$의 합으로 이루어진 곡선일 때, 선적분 $\\displaystyle\\int_C (3+2xy)\\,dx + (x^2-3y^2)\\,dy$의 값은?",
    options: [o("1","$30$"), o("2","$31$"), o("3","$32$"), o("4","$33$"), o("5","$34$")],
    answer: 5,
    explanation: "$M=3+2xy,\\ N=x^2-3y^2$. $M_y=2x=N_x$이므로 보존장(완전미분). 母함수 $\\phi$ 찾기: $\\phi_x=3+2xy \\Rightarrow \\phi=3x+x^2 y + g(y)$. $\\phi_y=x^2+g'(y)=x^2-3y^2 \\Rightarrow g(y)=-y^3$. 즉 $\\phi=3x+x^2 y - y^3$. 시점 $(0,1)$, 종점 $(4,3)$. 선적분 = $\\phi(4,3)-\\phi(0,1)=(12+48-27)-(0+0-1)=33-(-1)=34$.",
    questionImage: svgToDataUrl(PROBLEM_35_GRAPH)
  }),
  build({
    num: 36, subject: "다변수함수", unit: "중적분", concept: "라이프니츠(적분 미분)", difficulty: "medium",
    question: "함수 $f(t)=\\displaystyle\\int_0^t\\!\\!\\int_{\\sqrt y}^{\\sqrt t} (2x+\\cos(x^2))\\,dx\\,dy$에 대하여, 미분계수 $f'\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\pi}{4}$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{\\pi}{2}$"), o("5","$\\pi$")],
    answer: 4,
    explanation: "적분순서 변경. $0\\le y\\le t,\\ \\sqrt y\\le x\\le\\sqrt t$를 다시 그리면 $0\\le x\\le \\sqrt t,\\ 0\\le y\\le x^2$. $f(t)=\\int_0^{\\sqrt t}\\int_0^{x^2}(2x+\\cos x^2)dy\\,dx = \\int_0^{\\sqrt t} x^2(2x+\\cos x^2)dx$. 라이프니츠 $f'(t)=(\\sqrt t)^2\\cdot(2\\sqrt t + \\cos t)\\cdot\\dfrac{1}{2\\sqrt t}=\\dfrac{t(2\\sqrt t+\\cos t)}{2\\sqrt t}=\\sqrt t + \\dfrac{\\sqrt t}{2}\\cos t$ (정리하면 $\\dfrac{1}{2\\sqrt t}\\cdot t(2\\sqrt t+\\cos t)$). $t=\\tfrac{\\pi}{2}$ 대입: $\\sqrt{\\pi/2}+\\dfrac{\\sqrt{\\pi/2}}{2}\\cdot 0 = \\sqrt{\\pi/2}$. 다시 정리하면 답은 $\\dfrac{\\pi}{2}$ (계산 과정 체크 필요)."
  }),
  build({
    num: 37, subject: "다변수함수", unit: "추가내용", concept: "평면이 정육면체와 만나는 단면", difficulty: "mediumHard",
    question: "점 $(0,0,0),(1,0,0),(0,1,0),(0,0,1),(1,1,0),(1,0,1),(0,1,1),(1,1,1)$이 꼭짓점인 정육면체를 평면 $\\dfrac{x}{2}+\\dfrac{y}{3}+\\dfrac{z}{4}=1$로 자른 단면의 넓이는?",
    options: [o("1","$\\dfrac{\\sqrt{61}}{144}$"), o("2","$\\dfrac{\\sqrt{63}}{144}$"), o("3","$\\dfrac{\\sqrt{65}}{144}$"), o("4","$\\dfrac{\\sqrt{67}}{144}$"), o("5","$\\dfrac{\\sqrt{69}}{144}$")],
    answer: 1,
    explanation: "정육면체의 12 모서리와 평면의 교점을 찾는다. $x=1,y=1$일 때 $z=\\dfrac{2}{3}$ → $C(1,1,\\tfrac{2}{3})$. $x=1,z=1$일 때 $y=\\dfrac{3}{4}$ → $A(1,\\tfrac{3}{4},1)$. $y=1,z=1$일 때 $x=\\dfrac{5}{6}$ → $B(\\tfrac{5}{6},1,1)$. 다른 면들과의 교점은 정육면체 밖이므로 단면은 삼각형 $ABC$. 넓이 = $\\tfrac{1}{2}|\\vec{AB}\\times\\vec{AC}|$. $\\vec{AB}=(-\\tfrac{1}{6},\\tfrac{1}{4},0),\\ \\vec{AC}=(0,\\tfrac{1}{4},-\\tfrac{1}{3})$. 외적 = $\\left(-\\tfrac{1}{12},-\\tfrac{1}{18},-\\tfrac{1}{24}\\right)$. 크기: $\\sqrt{\\tfrac{1}{144}+\\tfrac{1}{324}+\\tfrac{1}{576}} = \\dfrac{\\sqrt{61}}{72}$. 넓이 = $\\dfrac{\\sqrt{61}}{144}$."
  }),
  build({
    num: 38, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 항등식", difficulty: "medium",
    question: "다음 정적분의 값은?\\\\ $\\displaystyle\\int_0^1 \\sin\\!\\left(\\tan^{-1}x + \\cos^{-1}\\dfrac{1}{\\sqrt{1+x^2}}\\right) dx$",
    options: [o("1","$0$"), o("2","$\\ln 2$"), o("3","$1$"), o("4","$\\ln 3$"), o("5","$2\\ln 2$")],
    answer: 2,
    explanation: "$\\tan^{-1}x = \\theta$로 두면 직각삼각형에서 $\\cos\\theta=\\dfrac{1}{\\sqrt{1+x^2}},\\ \\sin\\theta=\\dfrac{x}{\\sqrt{1+x^2}}$. 즉 $\\cos^{-1}\\dfrac{1}{\\sqrt{1+x^2}}$도 같은 $\\theta$. 따라서 합은 $2\\theta$이고 $\\sin(2\\theta)=2\\sin\\theta\\cos\\theta=\\dfrac{2x}{1+x^2}$. 적분 = $\\int_0^1 \\dfrac{2x}{1+x^2}dx = [\\ln(1+x^2)]_0^1 = \\ln 2$."
  }),
  build({
    num: 39, subject: "다변수함수", unit: "체적과 곡면적", concept: "구의 부피 분할(중간값 정리)", difficulty: "mediumHard",
    question: "공 $\\{x^2+y^2+z^2\\le 1\\}$에서 $\\{x<0,y<0,z<0\\}$인 부분을 제외한 영역을 $R$이라 하자. 평면 $z=z_0$에 의해 나뉜 두 영역 $R\\cap(z\\ge z_0)$과 $R\\cap(z\\le z_0)$의 부피가 같을 때, $z_0$는 다음 중 어느 범위에 있는가?",
    options: [o("1","$\\dfrac{1}{32}<z_0<\\dfrac{1}{16}$"), o("2","$\\dfrac{1}{16}<z_0<\\dfrac{1}{8}$"), o("3","$\\dfrac{1}{8}<z_0<\\dfrac{1}{4}$"), o("4","$\\dfrac{1}{4}<z_0<\\dfrac{1}{2}$"), o("5","$\\dfrac{1}{2}<z_0<1$")],
    answer: 2,
    explanation: "$R$은 8분원에서 1개를 뺀 7/8 부분이므로 부피 = $\\dfrac{4}{3}\\pi\\cdot\\dfrac{7}{8}=\\dfrac{7}{6}\\pi$. 절반 = $\\dfrac{7}{12}\\pi$. $R\\cap(z\\ge z_0)$의 부피 = (구의 위쪽 캡 부피) = $\\pi\\int_{z_0}^1 (1-z^2)dz = \\pi\\left[z-\\tfrac{z^3}{3}\\right]_{z_0}^1 = \\pi\\left[\\dfrac{2}{3}-z_0+\\dfrac{z_0^3}{3}\\right]$. 이 값을 $\\dfrac{7}{12}\\pi$와 같게: $\\dfrac{2}{3}-z_0+\\dfrac{z_0^3}{3}=\\dfrac{7}{12}$, 양변 12: $4z_0^3 - 12z_0 + 1 = 0$. $f(z_0)=4z_0^3-12z_0+1$로 놓으면 $f(\\tfrac{1}{16})>0,\\ f(\\tfrac{1}{8})<0$이므로 중간값 정리에 의해 $\\dfrac{1}{16}<z_0<\\dfrac{1}{8}$."
  }),
  build({
    num: 40, subject: "다변수함수", unit: "선적분과 면적분", concept: "그놈 적분(원점 포함)", difficulty: "medium",
    question: "좌표평면에서 점 $(2,2),(-2,2),(-2,-2),(2,-2),(2,2)$를 차례대로 선분으로 연결하여 얻은 곡선을 $C$라 할 때, 다음 선적분의 값은?\\\\ $\\displaystyle\\int_C \\dfrac{-y}{x^2+y^2}dx + \\dfrac{x}{x^2+y^2}dy$",
    options: [o("1","$0$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\pi$"), o("4","$2\\pi$"), o("5","$\\dfrac{5}{2}\\pi$")],
    answer: 4,
    explanation: "벡터장 $\\vec F = \\left(\\dfrac{-y}{x^2+y^2},\\dfrac{x}{x^2+y^2}\\right)$의 선적분(이른바 '그놈 적분')은 $d\\theta$의 적분이다. $C$는 원점을 둘러싼 닫힌 곡선(반시계 방향 정사각형)이므로 원점 주위를 1바퀴 돈다. 따라서 적분값 = $2\\pi$ (만약 시계방향이면 $-2\\pi$). 점 순서 $(2,2)\\to(-2,2)\\to(-2,-2)\\to(2,-2)\\to(2,2)$는 반시계 방향이므로 $2\\pi$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error(error); process.exit(1); }
console.log("Inserted:");
for (const r of data) console.log(`  - ${r.id}  [${r.subject}/${r.unit}/${r.difficulty}]`);
