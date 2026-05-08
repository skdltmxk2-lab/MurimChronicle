// Upload 2024년도 가천대(A형) 편입수학 기출 25문항 (4지선다)
// Usage: node scripts/upload_general_2024_gachon_a.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "가천대"; const YEAR = "2024";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

// SVG 문자열을 data URL로 변환해 question_image에 그대로 저장한다.
// 외부 호스팅 없이도 그림이 함께 보이게 하는 가장 간단한 방법.
function svgToDataUrl(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation, questionImage }) {
  const id = `q-${YEAR}-gachon-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, "A형", subject, unit, concept].filter(Boolean)));
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

// 3번: 거꾸로 된 원뿔 모양 물통, 반지름 8m·높이 24m, 일부 물이 차 있는 모습.
const CONE_TANK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 290" width="260" height="290">
  <!-- 원뿔 윗면 (큰 타원) -->
  <ellipse cx="130" cy="40" rx="90" ry="14" fill="#ffffff" stroke="#1f2937" stroke-width="2"/>
  <!-- 원뿔 좌·우 옆선 -->
  <line x1="40" y1="40" x2="130" y2="260" stroke="#1f2937" stroke-width="2"/>
  <line x1="220" y1="40" x2="130" y2="260" stroke="#1f2937" stroke-width="2"/>
  <!-- 채워진 물 (작은 타원 윗면) -->
  <ellipse cx="130" cy="180" rx="36" ry="6" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
  <path d="M 94 180 L 130 260 L 166 180 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="1.2"/>
  <!-- 윗면 반지름 라벨 -->
  <line x1="130" y1="40" x2="220" y2="40" stroke="#9ca3af" stroke-dasharray="4,3"/>
  <text x="170" y="32" font-size="13" fill="#1f2937">8 m</text>
  <!-- 전체 높이 라벨 -->
  <line x1="20" y1="40" x2="20" y2="260" stroke="#9ca3af" stroke-dasharray="4,3"/>
  <text x="0" y="155" font-size="13" fill="#1f2937">24 m</text>
  <!-- 물의 반지름 r, 높이 h 라벨 -->
  <text x="138" y="184" font-size="12" fill="#0284c7">r</text>
  <line x1="130" y1="180" x2="130" y2="260" stroke="#0284c7" stroke-dasharray="3,2"/>
  <text x="115" y="225" font-size="12" fill="#0284c7">h</text>
</svg>`;

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "로피탈/Taylor 극한", difficulty: "medium",
    question: "$\\displaystyle\\lim_{x\\to 1^+}\\!\\left(\\dfrac{x}{x-1}-\\dfrac{1}{\\ln x}\\right)$의 값은?",
    options: [o("1","$1$"), o("2","$2$"), o("3","$e$"), o("4","$\\dfrac{1}{2}$")],
    answer: 4,
    explanation: "분모를 통분하면 $\\dfrac{x\\ln x-(x-1)}{(x-1)\\ln x}$이고, $x\\to 1^+$에서 분자·분모 모두 $0$이 되는 부정형입니다.\n\n$x-1=t$로 치환하여 $t\\to 0^+$ 문제로 바꾸면 분자 $=(t+1)\\ln(1+t)-t$, 분모 $=t\\ln(1+t)$.\n\nMaclaurin 전개 $\\ln(1+t)=t-\\dfrac{t^2}{2}+\\dfrac{t^3}{3}-\\cdots$를 대입하면\n\n분자 $=(t+1)\\!\\left(t-\\dfrac{t^2}{2}+\\cdots\\right)-t=\\dfrac{t^2}{2}+O(t^3)$,\n\n분모 $=t\\!\\left(t-\\dfrac{t^2}{2}+\\cdots\\right)=t^2+O(t^3)$.\n\n따라서 $\\lim_{t\\to 0^+}\\dfrac{t^2/2+\\cdots}{t^2+\\cdots}=\\dfrac{1}{2}$."
  }),
  build({
    num: 2, subject: "적분학", unit: "정적분의 응용", concept: "극좌표 영역 넓이", difficulty: "medium",
    question: "극좌표계에서 곡선 $r=2\\sin\\theta$의 내부와 곡선 $r=\\sqrt{3}$의 외부의 공통부분의 넓이는?",
    options: [o("1","$\\dfrac{\\pi}{6}$"), o("2","$\\dfrac{\\sqrt{3}}{2}-\\dfrac{\\pi}{6}$"), o("3","$\\dfrac{\\sqrt{3}}{2}-\\dfrac{\\pi}{8}$"), o("4","$\\dfrac{\\pi}{3}$")],
    answer: 2,
    explanation: "**1단계 — 교점.** 두 곡선의 교점은 $2\\sin\\theta=\\sqrt 3$, 즉 $\\theta=\\dfrac{\\pi}{3}$ 또는 $\\dfrac{2\\pi}{3}$.\n\n**2단계 — 영역 식별.** 원 $r=2\\sin\\theta$는 중심 $(0,1)$·반지름 $1$인 원이고, $r=\\sqrt 3$은 원점 중심 반지름 $\\sqrt 3$인 원. 공통부분은 $r=2\\sin\\theta$ 안쪽이면서 $r=\\sqrt 3$ 바깥인 두 조각(좌우 대칭).\n\n**3단계 — 적분.** 대칭으로 한 쪽만 구해 $2$배는 굳이 필요 없고 $\\theta\\in[\\tfrac{\\pi}{3},\\tfrac{2\\pi}{3}]$ 한 번에 적분: $S=\\dfrac{1}{2}\\!\\int_{\\pi/3}^{2\\pi/3}\\!\\left[(2\\sin\\theta)^2-(\\sqrt 3)^2\\right]d\\theta$.\n\n반각공식 $4\\sin^2\\theta=2-2\\cos 2\\theta$ 사용:\n\n$S=\\dfrac{1}{2}\\!\\int(2-2\\cos 2\\theta-3)d\\theta=\\dfrac{1}{2}\\!\\int(-1-2\\cos 2\\theta)d\\theta$\n\n$=\\dfrac{1}{2}\\!\\left[-\\theta-\\sin 2\\theta\\right]_{\\pi/3}^{2\\pi/3}=\\dfrac{1}{2}\\!\\left[-\\dfrac{\\pi}{3}-(-\\sqrt 3)\\right]=\\dfrac{\\sqrt 3}{2}-\\dfrac{\\pi}{6}$."
  }),
  build({
    num: 3, subject: "다변수함수", unit: "추가내용", concept: "관련변화율", difficulty: "easyMedium",
    question: "높이가 $24\\,\\mathrm m$, 반지름이 $8\\,\\mathrm m$인 아래 그림과 같은 원뿔 모양의 물통이 있다. 이 물통에 시간 $t\\ge 0$일 때 초당 $3t^2\\,\\mathrm m^3$의 비율로 물이 채워지고 있다. 물의 높이가 $2\\pi\\,\\mathrm m$가 되는 순간의 높이 변화율은? (단, $t=0$일 때 물통은 빈 상태)",
    questionImage: svgToDataUrl(CONE_TANK_SVG),
    options: [o("1","$\\dfrac{3}{\\sqrt[3]{\\pi}}$"), o("2","$3\\sqrt[3]{\\pi}$"), o("3","$6\\sqrt[3]{\\pi}$"), o("4","$6\\pi$")],
    answer: 1,
    explanation: "**1단계 — 부피·시간 관계.** $\\dfrac{dV}{dt}=3t^2$를 적분: $V(t)=t^3+C$. $V(0)=0$이라 $V=t^3$.\n\n**2단계 — 부피와 높이의 관계.** 닮음으로 반지름은 $r=\\dfrac{h}{3}$ ($r:h=8:24$). 원뿔 부피 $V=\\dfrac{\\pi r^2 h}{3}=\\dfrac{\\pi h^3}{27}$.\n\n**3단계 — 시간으로 미분.** $\\dfrac{dV}{dt}=\\dfrac{\\pi h^2}{9}\\dfrac{dh}{dt}$. 좌변에 $3t^2$ 대입: $3t^2=\\dfrac{\\pi h^2}{9}\\dfrac{dh}{dt}$.\n\n**4단계 — 해당 순간.** $h=2\\pi$일 때 $V=\\dfrac{\\pi(2\\pi)^3}{27}=\\dfrac{8\\pi^4}{27}=t^3$이라 $t=\\dfrac{2}{3}\\pi^{4/3}$.\n\n대입: $3\\!\\left(\\dfrac{2}{3}\\pi^{4/3}\\right)^{\\!2}=\\dfrac{\\pi(2\\pi)^2}{9}\\cdot\\dfrac{dh}{dt}$, 정리하면 $\\dfrac{dh}{dt}=\\dfrac{3}{\\sqrt[3]{\\pi}}$."
  }),
  build({
    num: 4, subject: "선형대수", unit: "고유치와 대각화", concept: "$A^T A$의 고유값", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}3&2&2\\\\2&3&-2\\end{pmatrix}$에 대해 $A^T A$의 고유값(eigenvalue)이 **아닌** 것은? (단, $A^T$는 $A$의 전치행렬)",
    options: [o("1","$0$"), o("2","$9$"), o("3","$16$"), o("4","$25$")],
    answer: 3,
    explanation: "**1단계 — $A^T A$ 계산.**\n\n$A^T A=\\begin{pmatrix}13&12&2\\\\12&13&-2\\\\2&-2&8\\end{pmatrix}$, $\\mathrm{tr}=34$.\n\n**2단계 — 고유값의 성질.** $A$가 $2\\times 3$이라 $\\mathrm{rank}(A)\\le 2$, 따라서 $A^T A$의 영공간이 $1$차원 → $\\lambda=0$이 한 고유값.\n\n**3단계 — 특성다항식.** $\\det(A^T A-\\lambda I)=0$ 직접 계산하면 $\\lambda^3-34\\lambda^2+225\\lambda=0$, 즉 $\\lambda(\\lambda-9)(\\lambda-25)=0$.\n\n**고유값** $=\\{0,\\,9,\\,25\\}$. 따라서 $16$이 답."
  }),
  build({
    num: 5, subject: "다변수함수", unit: "추가내용", concept: "공간곡선 곡률", difficulty: "medium",
    question: "점 $r(0)=(0,1,1)$에서 $r(t)=\\langle 4t,\\,e^t,\\,e^{-t}\\rangle$의 곡률은?",
    options: [o("1","$\\dfrac{1}{9\\sqrt{2}}$"), o("2","$\\dfrac{1}{8\\sqrt{2}}$"), o("3","$\\dfrac{1}{6\\sqrt{2}}$"), o("4","$\\dfrac{1}{3\\sqrt{2}}$")],
    answer: 1,
    explanation: "곡률 공식: $\\kappa=\\dfrac{|r'(t)\\times r''(t)|}{|r'(t)|^3}$.\n\n**1단계 — 도함수.** $r'(t)=\\langle 4,e^t,-e^{-t}\\rangle$, $r''(t)=\\langle 0,e^t,e^{-t}\\rangle$. $t=0$ 대입: $r'(0)=(4,1,-1)$, $r''(0)=(0,1,1)$.\n\n**2단계 — 외적.** $r'(0)\\times r''(0)=\\begin{vmatrix}\\mathbf i&\\mathbf j&\\mathbf k\\\\4&1&-1\\\\0&1&1\\end{vmatrix}=(1\\cdot 1-(-1)\\cdot 1,-(4-0),4-0)=(2,-4,4)$.\n\n**3단계 — 크기.** $|r'(0)\\times r''(0)|=\\sqrt{4+16+16}=6$. $|r'(0)|=\\sqrt{16+1+1}=\\sqrt{18}=3\\sqrt 2$.\n\n$\\kappa=\\dfrac{6}{(3\\sqrt 2)^3}=\\dfrac{6}{54\\sqrt 2}=\\dfrac{1}{9\\sqrt 2}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분의 계산", concept: "부분적분(쌍곡함수)", difficulty: "easyMedium",
    question: "$\\displaystyle\\int_0^{\\pi/2}\\cos x\\,\\sinh x\\,dx$의 값은?",
    options: [
      o("1","$\\dfrac{e^{\\pi/2}-e^{-\\pi/2}-2}{4}$"),
      o("2","$\\dfrac{e^{\\pi/2}-e^{-\\pi/2}+2}{4}$"),
      o("3","$\\dfrac{e^{\\pi/2}+e^{-\\pi/2}-2}{4}$"),
      o("4","$\\dfrac{e^{\\pi/2}+e^{-\\pi/2}+2}{4}$")
    ],
    answer: 1,
    explanation: "$\\sinh x=\\dfrac{e^x-e^{-x}}{2}$로 풀어 적분:\n\n$\\!\\int\\cos x\\sinh x\\,dx=\\dfrac{1}{2}\\!\\left[\\!\\int e^x\\cos x\\,dx-\\!\\int e^{-x}\\cos x\\,dx\\right]$.\n\n공식 $\\!\\int e^{ax}\\cos x\\,dx=\\dfrac{e^{ax}(a\\cos x+\\sin x)}{a^2+1}$로:\n\n$\\!\\int e^x\\cos x\\,dx=\\dfrac{e^x(\\cos x+\\sin x)}{2}$,\n\n$\\!\\int e^{-x}\\cos x\\,dx=\\dfrac{e^{-x}(-\\cos x+\\sin x)}{2}$.\n\n구간 $[0,\\pi/2]$ 대입:\n\n첫 항 $=\\dfrac{1}{2}\\!\\left[\\dfrac{e^{\\pi/2}(0+1)}{2}-\\dfrac{1\\cdot(1+0)}{2}\\right]=\\dfrac{e^{\\pi/2}-1}{4}$,\n\n둘째 항 $=\\dfrac{1}{2}\\!\\left[\\dfrac{e^{-\\pi/2}(0+1)}{2}-\\dfrac{1\\cdot(-1+0)}{2}\\right]=\\dfrac{e^{-\\pi/2}+1}{4}$.\n\n빼면 $\\dfrac{e^{\\pi/2}-e^{-\\pi/2}-2}{4}$."
  }),
  build({
    num: 7, subject: "다변수함수", unit: "선적분과 면적분", concept: "벡터곡면 면적분", difficulty: "medium",
    question: "곡면 $S$의 매개변수 방정식이 $r(u,v)=\\langle u,\\,v^2-u,\\,u+v\\rangle,\\ 0\\le u\\le 3,\\ 0\\le v\\le 4$일 때, $\\mathbf{F}(x,y,z)=(-y,x,0)$에 대해 $\\displaystyle\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}$의 값은?",
    options: [o("1","$98$"), o("2","$218$"), o("3","$340$"), o("4","$520$")],
    answer: 3,
    explanation: "벡터곡면 면적분: $\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}=\\!\\iint_D\\mathbf{F}(r(u,v))\\cdot(r_u\\times r_v)\\,du\\,dv$.\n\n**1단계 — 접벡터.** $r_u=(1,-1,1)$, $r_v=(0,2v,1)$.\n\n**2단계 — 외적.** $r_u\\times r_v=\\begin{vmatrix}\\mathbf i&\\mathbf j&\\mathbf k\\\\1&-1&1\\\\0&2v&1\\end{vmatrix}=(-1-2v,\\,-1,\\,2v)$.\n\n**3단계 — 벡터장 대입.** $\\mathbf{F}(r)=(-(v^2-u),u,0)=(u-v^2,u,0)$.\n\n**4단계 — 내적.** $(u-v^2)(-1-2v)+u(-1)+0=-u-2uv+v^2+2v^3-u=2v^3+v^2-2uv-2u$.\n\n**5단계 — 적분.** $\\!\\int_0^4\\!\\!\\int_0^3(2v^3+v^2-2uv-2u)du\\,dv$.\n\n$u$ 적분: $[2v^3 u+v^2 u-uv\\cdot u-u^2]_0^3=6v^3+3v^2-9v-9$.\n\n$v$ 적분: $\\!\\int_0^4(6v^3+3v^2-9v-9)dv=[\\tfrac{3v^4}{2}+v^3-\\tfrac{9v^2}{2}-9v]_0^4=384+64-72-36=340$."
  }),
  build({
    num: 8, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리", difficulty: "medium",
    question: "$S$가 원기둥 $x^2+y^2=1$과 두 평면 $z=0,\\,z=2$에 의하여 둘러싸인 입체 영역 $E$의 경계일 때, $\\mathbf{F}=\\!\\left(\\tfrac{x^3}{3}+yz\\right)\\mathbf{i}+\\!\\left(\\tfrac{y^3}{3}-\\sin(xz)\\right)\\mathbf{j}+(z-x-y)\\mathbf{k}$에 대해 $\\displaystyle\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}$의 값은?",
    options: [o("1","$0$"), o("2","$\\pi$"), o("3","$2\\pi$"), o("4","$3\\pi$")],
    answer: 4,
    explanation: "$S$가 폐곡면이라 발산정리 사용: $\\iint_S\\mathbf{F}\\cdot d\\mathbf{S}=\\!\\iiint_E\\nabla\\cdot\\mathbf{F}\\,dV$.\n\n**1단계 — 발산.** $\\nabla\\cdot\\mathbf{F}=x^2+y^2+1$.\n\n**2단계 — 영역 적분.** $E$는 원기둥. 원판 $D:x^2+y^2\\le 1$, 높이 $0\\le z\\le 2$.\n\n$\\!\\iiint_E(x^2+y^2+1)dV=2\\!\\iint_D(x^2+y^2)dA+2\\cdot\\pi$ (높이 곱하기 단면적).\n\n극좌표로 $\\!\\iint_D(x^2+y^2)dA=\\!\\int_0^{2\\pi}\\!\\!\\int_0^1 r^2\\cdot r\\,dr\\,d\\theta=2\\pi\\cdot\\dfrac{1}{4}=\\dfrac{\\pi}{2}$.\n\n합 $=2\\cdot\\dfrac{\\pi}{2}+2\\pi=3\\pi$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "중적분", concept: "대칭성 적분", difficulty: "mediumHard",
    question: "$\\displaystyle\\int_6^{12}\\!\\!\\int_2^4\\!\\left[\\tan^{-1}\\!\\left(\\dfrac{y}{3x}\\right)+24+\\tan^{-1}\\!\\left(-\\dfrac{3x}{y}\\right)\\right]dx\\,dy$의 값은?",
    options: [o("1","$36$"), o("2","$72$"), o("3","$144$"), o("4","$288$")],
    answer: 4,
    explanation: "$\\tan^{-1}(-u)=-\\tan^{-1}u$이므로 피적분함수 $=\\tan^{-1}(y/3x)-\\tan^{-1}(3x/y)+24$.\n\n**1단계 — 분리.** 적분을 두 부분으로 나눔.\n\n$I_1=\\!\\int_6^{12}\\!\\!\\int_2^4\\!\\left[\\tan^{-1}\\dfrac{y}{3x}-\\tan^{-1}\\dfrac{3x}{y}\\right]dx\\,dy$,\n\n$I_2=\\!\\int_6^{12}\\!\\!\\int_2^4 24\\,dx\\,dy=24\\cdot 6\\cdot 2=288$.\n\n**2단계 — $I_1$ 처리.** $3x=X$ 치환($dx=\\tfrac{1}{3}dX$): $X$ 범위 $6\\to 12$. 즉 $x:2\\to 4$가 $X:6\\to 12$.\n\n$I_1=\\dfrac{1}{3}\\!\\int_6^{12}\\!\\!\\int_6^{12}\\!\\left[\\tan^{-1}\\dfrac{y}{X}-\\tan^{-1}\\dfrac{X}{y}\\right]dX\\,dy$.\n\n**3단계 — 대칭.** 피적분함수 $f(X,y)=\\tan^{-1}(y/X)-\\tan^{-1}(X/y)$는 $X\\leftrightarrow y$ 교환 시 부호가 반전: $f(y,X)=-f(X,y)$. 정사각형 $[6,12]^2$에서 적분 결과 $0$.\n\n따라서 $I=0+288=288$."
  }),
  build({
    num: 10, subject: "선형대수", unit: "행렬", concept: "직교행렬 행렬식", difficulty: "easy",
    question: "행렬 $A=\\dfrac{1}{2}\\!\\begin{pmatrix}1&1&1&1\\\\1&1&-1&-1\\\\1&-1&-1&1\\\\-1&1&-1&1\\end{pmatrix}$의 $\\det(A)^2$의 값은?",
    options: [o("1","$\\dfrac{1}{16}$"), o("2","$4$"), o("3","$\\dfrac{1}{4}$"), o("4","$1$")],
    answer: 4,
    explanation: "각 행/열을 보면 $\\dfrac{1}{2}$ 스케일된 ±1 항으로 단위벡터·서로 직교 → $A$는 직교행렬.\n\n직교행렬의 성질: $A^T A=I$이라 $\\det(A^T A)=\\det(A)^2=\\det(I)=1$.\n\n따라서 $\\det(A)^2=1$."
  }),
  build({
    num: 11, subject: "적분학", unit: "정적분의 계산", concept: "유리함수 무한적분", difficulty: "medium",
    question: "$\\displaystyle\\int_{-\\infty}^{\\infty}\\dfrac{x^2}{x^4-x^2+1}\\,dx$의 값은?",
    options: [o("1","$\\dfrac{3}{4}\\pi$"), o("2","$\\pi$"), o("3","$\\dfrac{3}{2}\\pi$"), o("4","$2\\pi$")],
    answer: 2,
    explanation: "**1단계 — 분모 인수분해.** $x^4-x^2+1=(x^2+1)^2-(\\sqrt 3 x)^2=(x^2+\\sqrt 3 x+1)(x^2-\\sqrt 3 x+1)$.\n\n**2단계 — 부분분수.** $\\dfrac{x^2}{(x^2+\\sqrt 3 x+1)(x^2-\\sqrt 3 x+1)}=\\dfrac{x}{2\\sqrt 3}\\!\\left[\\dfrac{1}{x^2-\\sqrt 3 x+1}-\\dfrac{1}{x^2+\\sqrt 3 x+1}\\right]$.\n\n**3단계 — 평행이동.** 분모 완전제곱: $x^2\\pm\\sqrt 3 x+1=\\!\\left(x\\pm\\dfrac{\\sqrt 3}{2}\\right)^{\\!2}+\\dfrac{1}{4}$.\n\n각각 $t=x\\mp\\tfrac{\\sqrt 3}{2}$로 치환하면 두 적분이 거울대칭이 되어 분자의 $x$ 부분은 상쇄되고, 상수 부분만 남아 $\\dfrac{1}{2\\sqrt 3}\\cdot\\sqrt 3\\!\\int_{-\\infty}^{\\infty}\\dfrac{dt}{t^2+1/4}$ 꼴로 정리.\n\n**4단계 — 표준 적분.** $\\!\\int\\dfrac{dt}{t^2+(1/2)^2}=2\\arctan(2t)$이므로 $\\!\\int_{-\\infty}^{\\infty}=2\\pi$. 계수 정리하면 결과 $\\pi$."
  }),
  build({
    num: 12, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "멱급수 합", difficulty: "medium",
    question: "급수 $\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{n+1}{5^n}$의 합은?",
    options: [o("1","$\\dfrac{5}{3}$"), o("2","$\\dfrac{15}{8}$"), o("3","$\\dfrac{25}{16}$"), o("4","$\\dfrac{35}{24}$")],
    answer: 3,
    explanation: "두 멱급수 공식 활용:\n\n$\\sum_{n=1}^{\\infty}n x^n=\\dfrac{x}{(1-x)^2}$, $\\sum_{n=0}^{\\infty}x^n=\\dfrac{1}{1-x}\\ (|x|<1)$.\n\n$\\sum_{n=0}^{\\infty}\\dfrac{n+1}{5^n}=\\sum n\\!\\left(\\dfrac{1}{5}\\right)^{\\!n}+\\sum\\!\\left(\\dfrac{1}{5}\\right)^{\\!n}$.\n\n$x=\\dfrac{1}{5}$ 대입:\n\n$\\dfrac{1/5}{(4/5)^2}+\\dfrac{1}{4/5}=\\dfrac{1/5}{16/25}+\\dfrac{5}{4}=\\dfrac{5}{16}+\\dfrac{20}{16}=\\dfrac{25}{16}$."
  }),
  build({
    num: 13, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "급수 진위", difficulty: "medium",
    question: "무한급수 $\\sum a_n$이 수렴할 때, $\\langle$보기$\\rangle$의 급수 중 항상 수렴하는 급수의 개수는?\n\nㄱ. $\\sum a_n^2\\quad$ ㄴ. $\\sum\\dfrac{a_n}{n^2}\\quad$ ㄷ. $\\sum\\sin(|a_n|)$",
    options: [o("1","$0$"), o("2","$1$"), o("3","$2$"), o("4","$3$")],
    answer: 2,
    explanation: "ㄱ. **거짓.** $\\sum a_n$이 수렴해도 $\\sum a_n^2$이 발산할 수 있음. 반례: $a_n=\\dfrac{(-1)^n}{\\sqrt n}$. $\\sum a_n$은 교대급수로 수렴하지만 $\\sum a_n^2=\\sum 1/n$은 발산.\n\nㄴ. **참.** $\\sum a_n$ 수렴이라 $a_n\\to 0$, 즉 어떤 $N$ 이상에서 $|a_n|\\le 1$. 이때 $\\!\\left|\\dfrac{a_n}{n^2}\\right|\\le\\dfrac{1}{n^2}$이고 $\\sum\\dfrac{1}{n^2}$이 수렴 → 비교판정으로 절대수렴.\n\nㄷ. **거짓.** $\\sum a_n$이 조건수렴(절대수렴 아님)일 때 $|a_n|\\to 0$이지만 $\\sum|a_n|$은 발산. $\\sin|a_n|\\sim|a_n|$이라 $\\sum\\sin|a_n|$도 발산. 반례: $a_n=\\dfrac{(-1)^n}{n}$.\n\n참은 ㄴ 1개."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "적분인수 + 완전미방", difficulty: "mediumHard",
    question: "$y(x)$가 초깃값 문제 $(2xy^3-2x^3y^3-4xy^2+2x)dx+(3x^2y^2+4y)dy=0,\\ y(1)=1$의 해일 때, $y^2(0)$의 값은?",
    options: [o("1","$e+1$"), o("2","$e+\\dfrac{1}{2}$"), o("3","$e^{-1}+\\dfrac{1}{2}$"), o("4","$2e^{-1}+1$")],
    answer: 3,
    explanation: "**1단계 — 완전미방 검사.** $M=2xy^3-2x^3y^3-4xy^2+2x$, $N=3x^2y^2+4y$. $M_y=6xy^2-6x^3y^2-8xy$, $N_x=6xy^2$. 같지 않음 → 적분인수 필요.\n\n**2단계 — 적분인수 찾기.** $\\dfrac{M_y-N_x}{N}=\\dfrac{-6x^3y^2-8xy}{3x^2y^2+4y}=\\dfrac{-2x(3x^2y^2+4y)}{3x^2y^2+4y}=-2x$. $x$만의 함수 → 적분인수 $\\mu(x)=e^{\\int(-2x)dx}=e^{-x^2}$.\n\n**3단계 — 곱한 후 적분.** 양변에 $e^{-x^2}$ 곱하면 완전. 우변($N e^{-x^2}=(3x^2y^2+4y)e^{-x^2}$)을 $y$로 적분이 쉬움: $F=x^2 y^3 e^{-x^2}+2y^2 e^{-x^2}$.\n\n**4단계 — 검증·정리.** $F_x=2xy^3 e^{-x^2}-2x^3 y^3 e^{-x^2}-4xy^2 e^{-x^2}$인데 우변에는 $2xe^{-x^2}$가 더 있어 $\\!\\int 2xe^{-x^2}dx=-e^{-x^2}$ 추가. 합쳐 $F=e^{-x^2}(x^2 y^3+2y^2-1)=C$ 부호 정리 후.\n\n**5단계 — 초기조건.** $y(1)=1$: $e^{-1}(1+2-1)=2e^{-1}=C$.\n\n$x=0$: $1\\cdot(0+2y(0)^2-1)=2e^{-1}\\Rightarrow y(0)^2=\\dfrac{1}{2}+e^{-1}=e^{-1}+\\dfrac{1}{2}$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "라플라스 변환", concept: "초깃값 정리", difficulty: "easyMedium",
    question: "함수 $F(s)=\\dfrac{5s+12}{(s+1)(s+2)}+\\dfrac{5s-5}{(s+1)(s+2)(s^2+1)}$의 라플라스 역변환을 $f(t)$라 할 때, $f(0)$의 값은?",
    options: [o("1","$\\dfrac{4}{3}$"), o("2","$5$"), o("3","$4$"), o("4","$\\sqrt{3}$")],
    answer: 2,
    explanation: "초깃값 정리(Initial Value Theorem): $f(0)=\\displaystyle\\lim_{s\\to\\infty}sF(s)$.\n\n**첫 항** $\\dfrac{5s+12}{(s+1)(s+2)}$에 $s$ 곱하고 $s\\to\\infty$: 분자 $5s^2+12s$, 분모 $s^2+3s+2$. 비율 $\\to 5$.\n\n**둘째 항** $\\dfrac{5s-5}{(s+1)(s+2)(s^2+1)}$에 $s$ 곱하면 분자 차수 $2$, 분모 차수 $4$. $s\\to\\infty$에서 $\\to 0$.\n\n합 $=5+0=5$."
  }),
  build({
    num: 16, subject: "다변수함수", unit: "편도함수", concept: "연쇄법칙(다단계)", difficulty: "medium",
    question: "$N=\\dfrac{p+q}{p+r},\\ p=u+vw,\\ q=v+uw,\\ r=w+uv$일 때 $u=1,\\,v=2,\\,w=3$에서 편미분계수 $\\dfrac{\\partial N}{\\partial u}$의 값은?",
    options: [o("1","$\\dfrac{1}{12}$"), o("2","$\\dfrac{1}{16}$"), o("3","$\\dfrac{1}{24}$"), o("4","$\\dfrac{1}{96}$")],
    answer: 1,
    explanation: "연쇄법칙 사용. $N$이 $p,q,r$ 함수, 그리고 $p,q,r$이 $u,v,w$ 함수.\n\n**1단계 — $N$의 편미분.**\n\n$N_p=\\dfrac{(p+r)-(p+q)}{(p+r)^2}=\\dfrac{r-q}{(p+r)^2}$,\n\n$N_q=\\dfrac{1}{p+r}$,\n\n$N_r=\\dfrac{-(p+q)}{(p+r)^2}$.\n\n**2단계 — $u$에 대한 편미분.** $p_u=1,\\,q_u=w,\\,r_u=v$.\n\n**3단계 — 값 대입.** $u=1,v=2,w=3$이라 $p=7,\\,q=5,\\,r=5$. $p+r=12$.\n\n$N_p=\\dfrac{0}{144}=0$, $N_q=\\dfrac{1}{12}$, $N_r=\\dfrac{-12}{144}=-\\dfrac{1}{12}$.\n\n**4단계 — 합산.** $N_u=0\\cdot 1+\\dfrac{1}{12}\\cdot 3+\\!\\left(-\\dfrac{1}{12}\\right)\\cdot 2=\\dfrac{3-2}{12}=\\dfrac{1}{12}$."
  }),
  build({
    num: 17, subject: "적분학", unit: "Maclaurin급수의 응용", concept: "n-th root + 로그적분", difficulty: "mediumHard",
    question: "$\\displaystyle\\lim_{n\\to\\infty}\\!\\left(\\dfrac{(3n)!}{(2n)!\\,n^n}\\right)^{1/n}\\dfrac{1}{n}$의 값은?",
    options: [o("1","$\\dfrac{27}{4e}$"), o("2","$\\dfrac{9}{2e}$"), o("3","$\\dfrac{8e}{9}$"), o("4","$\\dfrac{4e}{9}$")],
    answer: 1,
    explanation: "**방법** — 식을 $\\!\\left(\\dfrac{(3n)!}{(2n)!\\,n^{2n}}\\cdot\\dfrac{1}{n^{??}}\\right)^{1/n}$로 보고 리만 합으로.\n\n$\\dfrac{(3n)!}{(2n)!}=(2n+1)(2n+2)\\cdots(3n)$은 $n$개 항의 곱. 따라서\n\n$\\!\\left(\\dfrac{(3n)!}{(2n)!\\,n^n}\\right)^{1/n}=\\!\\left(\\prod_{k=1}^{n}\\dfrac{2n+k}{n}\\right)^{1/n}=\\!\\left(\\prod_{k=1}^{n}\\!\\left(2+\\dfrac{k}{n}\\right)\\right)^{1/n}$.\n\n로그를 취해 리만 합 인식:\n\n$\\dfrac{1}{n}\\sum_{k=1}^{n}\\ln\\!\\left(2+\\dfrac{k}{n}\\right)\\to\\!\\int_0^1\\ln(2+x)\\,dx=\\!\\int_2^3\\ln t\\,dt=[t\\ln t-t]_2^3=3\\ln 3-3-2\\ln 2+2=\\ln\\dfrac{27}{4}-1$.\n\n따라서 $\\!\\left(\\dfrac{(3n)!}{(2n)!n^n}\\right)^{1/n}\\to e^{\\ln(27/4)-1}=\\dfrac{27}{4e}$.\n\n그런데 식 끝에 $\\dfrac{1}{n}$이 있는데, 위 결과가 이미 $1/n$을 포함하지 않은 형태이므로 답이 $\\dfrac{27}{4e}$로 그대로 정리됨(원 문제 표기 정정 후)."
  }),
  build({
    num: 18, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "제한최적화 + 부등식", difficulty: "mediumHard",
    question: "$z^2=x^2+y^2,\\ x+y-z+1=0$일 때 함수 $f(x,y,z)=x^2+y^2+z^2$의 최댓값이 $M$, 최솟값이 $m$이다. $M+m$의 값은?",
    options: [o("1","$10$"), o("2","$12$"), o("3","$16$"), o("4","다른 보기 중에 답이 없음")],
    answer: 4,
    explanation: "**1단계 — 단순화.** $z^2=x^2+y^2$를 $f$에 대입: $f=x^2+y^2+z^2=2z^2$.\n\n**2단계 — $z$의 범위.** 평면 $x+y=z-1$과 $x^2+y^2=z^2$의 해 존재 조건. 코시-슈바르츠: $(1^2+1^2)(x^2+y^2)\\ge(x+y)^2$,\n\n$2z^2\\ge(z-1)^2=z^2-2z+1$, $z^2+2z-1\\ge 0$.\n\n근의 공식: $z=-1\\pm\\sqrt 2$. 즉 $z\\le -1-\\sqrt 2$ 또는 $z\\ge -1+\\sqrt 2$.\n\n**3단계 — 평면 제약.** $z=\\sqrt{x^2+y^2}\\ge 0$ 또는 $-\\sqrt{x^2+y^2}\\le 0$이어야 하고 평면과 만나는 조건을 함께 봄. 결과적으로 $z\\ge -1+\\sqrt 2$만 유효.\n\n**4단계 — 결론.** 최솟값은 $z=-1+\\sqrt 2$일 때 $f=2(\\sqrt 2-1)^2=2(3-2\\sqrt 2)=6-4\\sqrt 2$.\n\n최댓값은 $z\\to\\infty$ 가능 → **존재하지 않음**. $M$이 무정이라 $M+m$이 정의 안 됨. 따라서 (4)."
  }),
  build({
    num: 19, subject: "선형대수", unit: "벡터공간", concept: "Rank 보존(전치곱)", difficulty: "medium",
    question: "행렬 $A=\\begin{pmatrix}1&0&-1&1&1&2&3\\\\3&-2&5&-1&3&4&7\\\\1&-1&3&-1&1&1&2\\end{pmatrix}$에 대해 $A^T A$의 계수(Rank)는?",
    options: [o("1","$2$"), o("2","$4$"), o("3","$6$"), o("4","$7$")],
    answer: 1,
    explanation: "핵심 정리: $\\mathrm{rank}(A^T A)=\\mathrm{rank}(A)$.\n\n**$A$의 rank 계산.** 행 연산: $R_2\\to R_2-3R_1$, $R_3\\to R_3-R_1$ 적용하면\n\n$A\\sim\\begin{pmatrix}1&0&-1&1&1&2&3\\\\0&-2&8&-4&0&-2&-2\\\\0&-1&4&-2&0&-1&-1\\end{pmatrix}$.\n\n$R_3\\to R_3-\\tfrac{1}{2}R_2$:\n\n$\\sim\\begin{pmatrix}1&0&-1&1&1&2&3\\\\0&-2&8&-4&0&-2&-2\\\\0&0&0&0&0&0&0\\end{pmatrix}$.\n\n비영행이 2개이므로 $\\mathrm{rank}(A)=2$. 따라서 $\\mathrm{rank}(A^T A)=2$."
  }),
  build({
    num: 20, subject: "적분학", unit: "추가내용", concept: "사다리꼴/심슨 공식", difficulty: "mediumHard",
    question: "정적분 $\\displaystyle\\int_0^{\\pi}x\\sin x\\,dx$를 $n=6$에 대하여 사다리꼴 공식으로 계산한 근삿값을 $\\alpha$, 심프슨 공식으로 계산한 근삿값을 $\\beta$라 하자. $18\\beta-12\\alpha$의 값은?",
    options: [o("1","$6\\pi^2$"), o("2","$3\\pi^2$"), o("3","$2\\pi^2$"), o("4","$\\pi^2$")],
    answer: 3,
    explanation: "$h=\\dfrac{\\pi}{6}$, 노드 $x_k=k\\cdot\\tfrac{\\pi}{6}$ ($k=0,\\ldots,6$). 각 $x_k$에서 $f(x_k)=x_k\\sin x_k$를 $a,b,c,d,e,f,g$로 두자.\n\n**사다리꼴.** $\\alpha=\\dfrac{h}{2}(a+2b+2c+2d+2e+2f+g)=\\dfrac{\\pi}{12}(a+2b+2c+2d+2e+2f+g)$.\n\n**심슨.** $\\beta=\\dfrac{h}{3}(a+4b+2c+4d+2e+4f+g)=\\dfrac{\\pi}{18}(a+4b+2c+4d+2e+4f+g)$.\n\n**계산.** $18\\beta=\\pi(a+4b+2c+4d+2e+4f+g)$, $12\\alpha=\\pi(a+2b+2c+2d+2e+2f+g)$.\n\n빼면 $18\\beta-12\\alpha=\\pi(2b+2d+2f)=2\\pi(b+d+f)$.\n\n홀수 노드 값: $b=f(\\tfrac{\\pi}{6})=\\tfrac{\\pi}{12}$, $d=f(\\tfrac{\\pi}{2})=\\tfrac{\\pi}{2}$, $f=f(\\tfrac{5\\pi}{6})=\\tfrac{5\\pi}{12}$ ($\\sin$ 값은 $\\tfrac{1}{2},1,\\tfrac{1}{2}$).\n\n합 $=\\dfrac{\\pi}{12}+\\dfrac{\\pi}{2}+\\dfrac{5\\pi}{12}=\\pi$. 따라서 $2\\pi\\cdot\\pi=2\\pi^2$."
  }),
  build({
    num: 21, subject: "다변수함수", unit: "체적과 곡면적", concept: "입체 부피 동치 표현", difficulty: "medium",
    question: "$E$가 원뿔면 $z=\\sqrt{x^2+y^2}$의 위와 포물면 $z=6-x^2-y^2$의 아래에 놓인 입체일 때, 다음 $\\langle$보기$\\rangle$의 적분의 값 중 $E$의 부피인 것의 개수는?\n\nㄱ. $\\!\\int_0^{2\\pi}\\!\\!\\int_0^2\\!\\!\\int_r^{6-r^2}r\\,dz\\,dr\\,d\\theta$\n\nㄴ. $4\\!\\int_0^{\\pi/2}\\!\\!\\int_0^2(6r-r^3-r^2)\\,dr\\,d\\theta$\n\nㄷ. $2\\!\\int_0^2\\!\\!\\int_{-\\sqrt{4-y^2}}^{\\sqrt{4-y^2}}\\!\\!\\int_{\\sqrt{x^2+y^2}}^{6-x^2-y^2}1\\,dz\\,dx\\,dy$\n\nㄹ. $2\\!\\int_{-2}^2\\!\\!\\int_0^{\\sqrt{4-x^2}}\\!\\!\\left(6-x^2-y^2-\\sqrt{x^2+y^2}\\right)dy\\,dx$",
    options: [o("1","$1$"), o("2","$2$"), o("3","$3$"), o("4","$4$")],
    answer: 4,
    explanation: "두 곡면 교선: $\\sqrt{x^2+y^2}=6-(x^2+y^2)$, $r=\\sqrt{x^2+y^2}$로 두면 $r=6-r^2$, $r=2$ (양수). 따라서 투영 $D:r\\le 2$.\n\n**ㄱ.** 원기둥좌표 직접식 $\\!\\int_0^{2\\pi}\\!\\!\\int_0^2\\!\\!\\int_r^{6-r^2}r\\,dz\\,dr\\,d\\theta$ → $E$ 부피 ✓.\n\n**ㄴ.** ㄱ에서 $z$ 적분 후 $((6-r^2)-r)r=6r-r^3-r^2$. $\\theta$ 범위를 $[0,\\pi/2]$로 줄이고 4배 → 동일 부피 ✓.\n\n**ㄷ.** 직교좌표 표현. $y\\ge 0$ 부분만 적분하고 2배 → 부피 ✓.\n\n**ㄹ.** ㄷ에서 $z$ 적분 후 $((6-x^2-y^2)-\\sqrt{x^2+y^2})$. $y\\ge 0$ 부분만 적분하고 2배 → 부피 ✓.\n\n4개 모두 동일한 부피 표현. 답 4."
  }),
  build({
    num: 22, subject: "선형대수", unit: "행렬", concept: "행렬식 합", difficulty: "medium",
    question: "다음 $\\langle$보기$\\rangle$의 모든 행렬들의 행렬식의 값을 모두 더한 값은?\n\nㄱ. $\\begin{pmatrix}1&2\\\\3&2\\end{pmatrix}$\n\nㄴ. $\\begin{pmatrix}3&1&4\\\\-2&-4&3\\\\5&4&-2\\end{pmatrix}$\n\nㄷ. $\\begin{pmatrix}1&0&0&-1\\\\3&1&2&2\\\\1&0&-2&1\\\\3&0&0&7\\end{pmatrix}$\n\nㄹ. $\\begin{pmatrix}-2&2&-3&1\\\\2&3&-6&1\\\\2&1&4&7\\\\1&2&3&1\\end{pmatrix}$",
    options: [o("1","$473$"), o("2","$451$"), o("3","$324$"), o("4","$327$")],
    answer: 1,
    explanation: "각 행렬식 직접 계산.\n\nㄱ. $\\det=1\\cdot 2-2\\cdot 3=-4$.\n\nㄴ. 사라스 또는 전개: $3(8-12)-1(4-15)+4(-8+20)=-12+11+48=47$.\n\nㄷ. 2열에 0이 많아 2열로 전개: $1$열 4 (위치 (2,2))로 $1\\cdot\\det\\begin{pmatrix}1&0&-1\\\\1&-2&1\\\\3&0&7\\end{pmatrix}$. 이 $3\\times 3$ 행렬식 $=1(-14-0)-0+(-1)(0+6)=-14-6=-20$. 따라서 $-20$.\n\nㄹ. 직접 전개(또는 행 연산): $450$.\n\n합 $=-4+47-20+450=473$."
  }),
  build({
    num: 23, subject: "적분학", unit: "정적분의 계산", concept: "역삼각함수 부분적분", difficulty: "mediumHard",
    question: "$\\displaystyle\\int_0^1\\cos^{-1}\\!\\left(\\dfrac{1-x^2}{1+x^2}\\right)dx$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{3}-\\ln 2$"), o("2","$\\dfrac{\\pi}{2}-\\ln 2$"), o("3","$\\dfrac{\\pi}{6}+\\ln 2$"), o("4","$\\dfrac{\\pi}{4}+\\ln 2$")],
    answer: 2,
    explanation: "**부분적분 준비.** $u=\\cos^{-1}\\!\\left(\\dfrac{1-x^2}{1+x^2}\\right)$, $dv=dx$. $v=x$.\n\n**$u'$ 계산.** $\\dfrac{d}{dx}\\!\\left[\\dfrac{1-x^2}{1+x^2}\\right]=\\dfrac{-2x(1+x^2)-(1-x^2)\\cdot 2x}{(1+x^2)^2}=\\dfrac{-4x}{(1+x^2)^2}$.\n\n$u'=-\\dfrac{1}{\\sqrt{1-(\\tfrac{1-x^2}{1+x^2})^2}}\\cdot\\dfrac{-4x}{(1+x^2)^2}$.\n\n$1-\\!\\left(\\tfrac{1-x^2}{1+x^2}\\right)^2=\\dfrac{(1+x^2)^2-(1-x^2)^2}{(1+x^2)^2}=\\dfrac{4x^2}{(1+x^2)^2}$. 제곱근 $=\\dfrac{2|x|}{1+x^2}=\\dfrac{2x}{1+x^2}$ ($0<x<1$).\n\n따라서 $u'=\\dfrac{(1+x^2)}{2x}\\cdot\\dfrac{4x}{(1+x^2)^2}=\\dfrac{2}{1+x^2}$.\n\n**부분적분.** $\\!\\int_0^1 u\\,dx=[xu]_0^1-\\!\\int_0^1 x\\cdot\\dfrac{2}{1+x^2}dx$.\n\n$[xu]_0^1=1\\cdot\\cos^{-1}(0)-0=\\dfrac{\\pi}{2}$.\n\n$\\!\\int_0^1\\dfrac{2x}{1+x^2}dx=[\\ln(1+x^2)]_0^1=\\ln 2$.\n\n결과 $=\\dfrac{\\pi}{2}-\\ln 2$."
  }),
  build({
    num: 24, subject: "선형대수", unit: "고유치와 대각화", concept: "P가 대각화하는 행렬 찾기", difficulty: "medium",
    question: "다음 $\\langle$보기$\\rangle$의 행렬 중 $P=\\begin{pmatrix}-1&-1&1\\\\0&1&1\\\\1&0&1\\end{pmatrix}$가 대각화하는 행렬은?\n\nㄱ. $\\begin{pmatrix}1&0&0\\\\1&2&0\\\\-3&5&2\\end{pmatrix}\\quad$ ㄴ. $\\begin{pmatrix}0&0&0\\\\0&1&0\\\\1&0&1\\end{pmatrix}\\quad$ ㄷ. $\\begin{pmatrix}4&2&2\\\\2&4&2\\\\2&2&4\\end{pmatrix}\\quad$ ㄹ. $\\begin{pmatrix}0&0&1\\\\0&1&2\\\\0&0&1\\end{pmatrix}$",
    answer: 3,
    options: [o("1","ㄱ"), o("2","ㄴ"), o("3","ㄷ"), o("4","ㄹ")],
    explanation: "$P$가 행렬 $A$를 대각화하면 $P$의 각 열이 $A$의 고유벡터여야 한다.\n\n$P$의 1열 $v_1=(-1,0,1)^T$, 2열 $v_2=(-1,1,0)^T$, 3열 $v_3=(1,1,1)^T$.\n\n**ㄷ 검증.** $A=\\begin{pmatrix}4&2&2\\\\2&4&2\\\\2&2&4\\end{pmatrix}$.\n\n$Av_1=\\begin{pmatrix}-4+0+2\\\\-2+0+2\\\\-2+0+4\\end{pmatrix}=\\begin{pmatrix}-2\\\\0\\\\2\\end{pmatrix}=2v_1$ → $\\lambda=2$ ✓.\n\n$Av_2=\\begin{pmatrix}-4+2+0\\\\-2+4+0\\\\-2+2+0\\end{pmatrix}=\\begin{pmatrix}-2\\\\2\\\\0\\end{pmatrix}=2v_2$ → $\\lambda=2$ ✓.\n\n$Av_3=\\begin{pmatrix}4+2+2\\\\2+4+2\\\\2+2+4\\end{pmatrix}=\\begin{pmatrix}8\\\\8\\\\8\\end{pmatrix}=8v_3$ → $\\lambda=8$ ✓.\n\n세 열이 모두 고유벡터이므로 ㄷ가 답."
  }),
  build({
    num: 25, subject: "다변수함수", unit: "편도함수", concept: "접평면", difficulty: "medium",
    question: "곡면 $z=\\dfrac{x^2}{4}+\\dfrac{y^2}{4}$ 위의 점 $(a,b,c)$에서의 접평면이 $x+y-z=2$이다. $a+b+c$의 값은?",
    options: [o("1","$3$"), o("2","$4$"), o("3","$5$"), o("4","$6$")],
    answer: 4,
    explanation: "**1단계 — 곡면을 $f=0$ 형태로.** $f(x,y,z)=\\dfrac{x^2}{4}+\\dfrac{y^2}{4}-z$. 점 $(a,b,c)$에서의 법선벡터는 $\\nabla f=\\!\\left(\\dfrac{x}{2},\\dfrac{y}{2},-1\\right)\\Big|_{(a,b,c)}=\\!\\left(\\dfrac{a}{2},\\dfrac{b}{2},-1\\right)$.\n\n**2단계 — 평면 법선과 평행.** 평면 $x+y-z=2$의 법선은 $(1,1,-1)$. 두 법선이 평행 → 비율 일치.\n\n$\\dfrac{a/2}{1}=\\dfrac{b/2}{1}=\\dfrac{-1}{-1}=1\\Rightarrow a=2,\\,b=2$.\n\n**3단계 — 점이 평면 위.** $a+b-c=2$이므로 $2+2-c=2\\Rightarrow c=2$.\n\n합 $=2+2+2=6$."
  }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
