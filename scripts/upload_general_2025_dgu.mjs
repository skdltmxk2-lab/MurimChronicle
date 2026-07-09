// Upload 2025년도 동국대 편입수학 기출 20문항 (5지선다)
// Usage: node scripts/upload_general_2025_dgu.mjs
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

const SCHOOL = "동국대";
const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });

function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-dgu-${String(num).padStart(2, "0")}`;
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
  build({ num: 1, subject: "미분학", unit: "극한과 연속", concept: "수렴 영역별 함수", difficulty: "medium",
    question: "함수 $f(x)=\\displaystyle\\lim_{n\\to\\infty}\\dfrac{x^{2n}+3\\sin(\\pi x)}{x^{2n+2}+\\sin^{2n}(\\pi x)+1}$가 불연속인 점의 개수는?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$"),o("5","$5$")], answer: 4,
    explanation: "$|x|<1,\\,|x|=1,\\,|x|>1$ 구분. $|\\sin\\pi x|=1$인 경우 등 분기 분석. 불연속점 개수 $=4$." }),
  build({ num: 2, subject: "미분학", unit: "극한과 연속", concept: "표준 극한들", difficulty: "easyMedium",
    question: "극한값이 $\\displaystyle\\lim_{x\\to 1^+}\\!\\left(\\dfrac{1}{x-1}-\\dfrac{1}{\\ln x}\\right)=\\alpha,\\,\\lim_{x\\to\\infty}(1+2^x)^{1/x}=\\beta,\\,\\lim_{x\\to 0^+}x^x=\\gamma$일 때, $\\alpha+\\beta+\\gamma$의 값은?",
    options: [o("1","$\\dfrac{3}{2}$"),o("2","$2$"),o("3","$\\dfrac{5}{2}$"),o("4","$\\dfrac{7}{2}$"),o("5","$4$")], answer: 3,
    explanation: "$\\alpha=-\\tfrac12$ (Taylor), $\\beta=2$, $\\gamma=1$. 합 $=\\dfrac{5}{2}$." }),
  build({ num: 3, subject: "미분학", unit: "최대/최소", concept: "곡선 위 점-점 거리 최소", difficulty: "medium",
    question: "곡선 $y=\\dfrac{x^2}{2}+1$ 위의 점과 점 $(0,4)$ 사이의 거리의 최솟값은?",
    options: [o("1","$\\sqrt 3$"),o("2","$2$"),o("3","$\\sqrt 5$"),o("4","$\\sqrt 6$"),o("5","$\\sqrt 7$")], answer: 3,
    explanation: "$d^2=x^2+(\\tfrac{x^2}{2}+1-4)^2=x^2+(\\tfrac{x^2}{2}-3)^2$. 미분 $=0$: $x^2=4$, $d^2=4+1=5$, $d=\\sqrt 5$." }),
  build({ num: 4, subject: "선형대수", unit: "행렬", concept: "행렬의 계수(rank)", difficulty: "easyMedium",
    question: "행렬 $\\begin{pmatrix}1&-1&0&0&1\\\\2&-2&2&0&0\\\\0&2&0&1&3\\\\0&1&1&0&1\\end{pmatrix}$의 계수(rank)는?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$"),o("5","$5$")], answer: 4,
    explanation: "행축약하면 4개 행이 모두 독립적이므로 $\\mathrm{rank}=4$." }),
  build({ num: 5, subject: "다변수함수", unit: "선적분과 면적분", concept: "곡선의 질량(선적분)", difficulty: "medium",
    question: "매개방정식 $x=\\cos 2t,\\,y=\\sin 2t,\\,z=1\\!\\left(0\\le t\\le\\dfrac{\\pi}{4}\\right)$로 나타낸 곡선의 밀도함수가 $\\delta(x,y,z)=xy^2 z$일 때, 곡선의 질량은?",
    options: [o("1","$1$"),o("2","$\\dfrac{1}{2}$"),o("3","$\\dfrac{1}{3}$"),o("4","$\\dfrac{1}{4}$"),o("5","$\\dfrac{1}{5}$")], answer: 3,
    explanation: "$ds=2dt$. $m=\\int_0^{\\pi/4}\\cos 2t\\sin^2 2t\\cdot 1\\cdot 2\\,dt=2[\\tfrac{\\sin^3 2t}{6}]_0^{\\pi/4}=\\dfrac{1}{3}$." }),
  build({ num: 6, subject: "미분학", unit: "미분", concept: "고차도함수 존재", difficulty: "medium",
    question: "함수 $f(x)=\\begin{cases}x^n\\cos\\!\\left(\\dfrac{1}{x^3}\\right) & x\\ne 0\\\\ 0 & x=0\\end{cases}$에 대하여 $2$계 도함수 $f''(x)$가 실수 전체의 집합에서 존재하도록 하는 자연수 $n$의 최솟값은?",
    options: [o("1","$2$"),o("2","$4$"),o("3","$6$"),o("4","$8$"),o("5","$10$")], answer: 3,
    explanation: "$x=0$에서 $f''(0)$ 존재하려면 $n$이 충분히 커야. 분석으로 $n\\ge 6$ 필요. 최솟값 $6$." }),
  build({ num: 7, subject: "미분학", unit: "접선의 방정식", concept: "매개변수 곡선 접선", difficulty: "medium",
    question: "매개방정식 $x=t+3e^t,\\,y=e^{2t}+2e^t-3$으로 주어진 곡선과 $x$축이 만나는 점에서 이 곡선에 그은 접선의 방정식을 $y=ax+b$라 하자. $a+b$의 값은? (단, $a,b$는 상수.)",
    options: [o("1","$-2$"),o("2","$-1$"),o("3","$0$"),o("4","$1$"),o("5","$2$")], answer: 1,
    explanation: "$y=0$: $e^{2t}+2e^t-3=0\\Rightarrow e^t=1\\Rightarrow t=0$, $x=3$. $\\dfrac{dy}{dx}=\\dfrac{2e^{2t}+2e^t}{1+3e^t}=\\dfrac{4}{4}=1$. 접선 $y-0=1(x-3)$, $a=1,\\,b=-3$. $a+b=-2$." }),
  build({ num: 8, subject: "적분학", unit: "정적분의 계산", concept: "Leibniz 미분", difficulty: "medium",
    question: "함수 $f(x)$가 양수의 집합에서 연속이고 모든 실수 $t$에 대하여 $\\displaystyle\\int_{1+t}^{e^{2t}+t}f(x-t)\\,dx=4e^{3t}\\sin t$를 만족한다. $f'(e^\\pi)$의 값은?",
    options: [o("1","$e^{-\\pi/2}$"),o("2","$2e^{-\\pi/2}$"),o("3","$3e^{-\\pi/2}$"),o("4","$4e^{-\\pi/2}$"),o("5","$5e^{-\\pi/2}$")], answer: 2,
    explanation: "$u=x-t$로 치환하면 $\\int_1^{e^{2t}}f(u)\\,du=4e^{3t}\\sin t$. 미분하면 $f(e^{2t})=2e^t(3\\sin t+\\cos t)$. 다시 미분해 $2e^{2t}f'(e^{2t})=2e^t(2\\sin t+4\\cos t)$이고, $t=\\pi/2$를 대입하면 $f'(e^\\pi)=2e^{-\\pi/2}$." }),
  build({ num: 9, subject: "다변수함수", unit: "곡선과 곡면", concept: "접평면과 점-평면 거리", difficulty: "medium",
    question: "곡면 $z=y^3 e^x$ 위의 점 $(0,1,1)$에서 접평면과 점 $(2,3,-2)$ 사이의 거리는?",
    options: [o("1","$\\sqrt{11}$"),o("2","$\\sqrt{13}$"),o("3","$\\sqrt{15}$"),o("4","$\\sqrt{17}$"),o("5","$\\sqrt{19}$")], answer: 1,
    explanation: "$z_x=y^3e^x,\\,z_y=3y^2e^x$, $(0,1,1)$에서 $1,\\,3$. 접평면 $z=1+(x-0)+3(y-1)$ → $x+3y-z=2$. 거리 $=\\dfrac{|2+9+2-2|}{\\sqrt{1+9+1}}=\\dfrac{11}{\\sqrt{11}}=\\sqrt{11}$." }),
  build({ num: 10, subject: "다변수함수", unit: "Taylor급수와 최대/최소", concept: "타원 위 함숫값", difficulty: "medium",
    question: "원기둥 $x^2+y^2=1$과 평면 $x-y+z=2$의 교선인 타원 위에서 $f(x,y,z)=x^2+y^2+z^2$의 최댓값과 최솟값의 곱은?",
    options: [o("1","$17$"),o("2","$18$"),o("3","$19$"),o("4","$20$"),o("5","$21$")], answer: 1,
    explanation: "$z=2-x+y$ 대입: $f=1+(2-x+y)^2$. 라그랑주 풀면 $\\max\\cdot\\min=17$." }),
  build({ num: 11, subject: "선형대수", unit: "행렬", concept: "행렬방정식 + 행렬식", difficulty: "medium",
    question: "행렬 $A,B$가 $BA=A^2+3A^3$을 만족하고 $A^{-1}=\\begin{pmatrix}-2&-3&6\\\\2&1&0\\\\-1&-1&3\\end{pmatrix}$일 때, $\\det(B)$의 값은?",
    options: [o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$"),o("5","$5$")], answer: 2,
    explanation: "$BA=A^2+3A^3\\Rightarrow B=A+3A^2$. $\\det B=\\det A\\cdot\\det(I+3A)$. $\\det A^{-1}=\\dots$ 계산하여 $\\det B=2$." }),
  build({ num: 12, subject: "공학수학", unit: "미분방정식", concept: "1계 선형 ODE", difficulty: "medium",
    question: "$f(0)=2$인 함수 $f(x)$가 $x>-1$인 모든 실수 $x$에 대하여 $(x+1)^2 f'(x)=-2(x+1)f(x)+3(x+1)^2$을 만족한다. $f(1)$의 값은?",
    options: [o("1","$\\dfrac{1}{4}$"),o("2","$\\dfrac{3}{4}$"),o("3","$\\dfrac{5}{4}$"),o("4","$\\dfrac{7}{4}$"),o("5","$\\dfrac{9}{4}$")], answer: 5,
    explanation: "$f'+\\tfrac{2}{x+1}f=3$. 적분인자 $(x+1)^2$. $((x+1)^2 f)'=3(x+1)^2$. 적분 후 $f(0)=2$로 상수 결정. $f(1)=\\dfrac{9}{4}$." }),
  build({ num: 13, subject: "적분학", unit: "정적분과 무한급수", concept: "Riemann sum", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{(1+2^2+3^2+\\cdots+n^2)^4}{n^2(1+2^4+3^4+\\cdots+n^4)^2}$의 값은?",
    options: [o("1","$\\dfrac{16}{25}$"),o("2","$\\dfrac{25}{64}$"),o("3","$\\dfrac{49}{64}$"),o("4","$\\dfrac{25}{81}$"),o("5","$\\dfrac{25}{49}$")], answer: 4,
    explanation: "$\\sum k^2\\sim n^3/3$, $\\sum k^4\\sim n^5/5$. 비 $=\\dfrac{(n^3/3)^4}{n^2\\cdot(n^5/5)^2}=\\dfrac{n^{12}/81}{n^{12}/25}=\\dfrac{25}{81}$." }),
  build({ num: 14, subject: "적분학", unit: "정적분의 계산", concept: "Leibniz 규칙", difficulty: "medium",
    question: "함수 $f(x)=\\displaystyle\\int_0^{x^2}(x^2+t)\\tan t\\,dt$에 대하여 $f'\\!\\left(\\dfrac{\\sqrt\\pi}{2}\\right)$의 값은?",
    options: [o("1","$\\dfrac{\\sqrt\\pi}{2}(\\pi+\\ln 2)$"),o("2","$\\dfrac{\\sqrt\\pi}{2}(\\pi+2\\ln 2)$"),o("3","$\\dfrac{\\sqrt\\pi}{2}(2\\pi+\\ln 2)$"),o("4","$\\dfrac{\\sqrt\\pi}{2}(3\\pi+\\ln 2)$"),o("5","$\\dfrac{\\sqrt\\pi}{2}(3\\pi+2\\ln 2)$")], answer: 1,
    explanation: "$f(x)=x^2\\!\\int_0^{x^2}\\tan t\\,dt+\\!\\int_0^{x^2}t\\tan t\\,dt$. Leibniz 규칙으로 미분 후 $x=\\tfrac{\\sqrt\\pi}{2}$ 대입하면 $\\dfrac{\\sqrt\\pi}{2}(\\pi+\\ln 2)$." }),
  build({ num: 15, subject: "적분학", unit: "정적분의 응용", concept: "역함수 적분(평행사변형 보조)", difficulty: "medium",
    question: "함수 $f(x)=x^3+x-2$의 역함수를 $g(x)$라 할 때 $\\displaystyle\\int_0^2 g(x-2)\\,dx$의 값은?",
    options: [o("1","$\\dfrac{5}{4}$"),o("2","$\\dfrac{7}{4}$"),o("3","$\\dfrac{9}{4}$"),o("4","$\\dfrac{11}{4}$"),o("5","$\\dfrac{13}{4}$")], answer: 1,
    explanation: "$\\int_0^2 g(x-2)dx=\\int_{-2}^0 g(u)du$. 역함수 적분 공식: $\\int_a^b g(y)dy=bg(b)-ag(a)-\\int_{g(a)}^{g(b)}f(x)dx$. 계산하면 $\\dfrac{5}{4}$." }),
  build({ num: 16, subject: "다변수함수", unit: "선적분과 면적분", concept: "Green 정리", difficulty: "medium",
    question: "꼭짓점 $(0,0),(3,0),(0,6)$인 삼각형의 선분 위를 원점을 출발하여 반시계 방향으로 움직여 원점으로 되돌아오는 곡선 $C$에 대하여 선적분 $\\int_C xy\\,dx+(xy^2-e^{\\cos y})dy$의 값은?",
    options: [o("1","$34$"),o("2","$36$"),o("3","$40$"),o("4","$42$"),o("5","$45$")], answer: 5,
    explanation: "Green: $\\partial Q/\\partial x-\\partial P/\\partial y=y^2-x$. $\\iint_T(y^2-x)dA$. 삼각형 위 적분 계산하면 $45$." }),
  build({ num: 17, subject: "적분학", unit: "정적분과 무한급수", concept: "Riemann sum 변환", difficulty: "medium",
    question: "극한 $\\displaystyle\\lim_{n\\to\\infty}\\sum_{k=1}^n\\dfrac{2k}{n^2}\\sin^{-1}\\!\\left(\\dfrac{k}{n}\\right)$의 값은?",
    options: [o("1","$\\dfrac{\\pi}{8}$"),o("2","$\\dfrac{\\pi}{4}$"),o("3","$\\dfrac{3\\pi}{8}$"),o("4","$\\dfrac{\\pi}{2}$"),o("5","$\\dfrac{5\\pi}{8}$")], answer: 2,
    explanation: "Riemann sum: $\\int_0^1 2x\\sin^{-1}x\\,dx$. 부분적분으로 $\\dfrac{\\pi}{4}$." }),
  build({ num: 18, subject: "다변수함수", unit: "중적분", concept: "극좌표 변환", difficulty: "medium",
    question: "$\\displaystyle\\int_0^1\\!\\!\\int_{\\sqrt{4-x^2}}^{\\sqrt{9-x^2}}6xy\\sqrt{x^2+y^2}\\,dy\\,dx$의 값은?",
    options: [o("1","$18$"),o("2","$19$"),o("3","$20$"),o("4","$21$"),o("5","$22$")], answer: 2,
    explanation: "극좌표 영역 $2\\le r\\le 3$ 일부. $6r^2\\cos\\theta\\sin\\theta\\cdot r=6r^4\\cos\\theta\\sin\\theta=3r^4\\sin 2\\theta$. 정리하면 $19$." }),
  build({ num: 19, subject: "다변수함수", unit: "선적분과 면적분", concept: "발산정리", difficulty: "medium",
    question: "원뿔 $z=\\sqrt{x^2+y^2}$에서 $x^2+y^2\\le 2$인 곡면과 평면 $z=\\sqrt 2$ 위의 원판 $x^2+y^2\\le 2$로 구성된 닫힌 곡면을 $\\Sigma$라 하자. 벡터장 $\\mathbf{F}(x,y,z)=x^2\\mathbf{i}+y^2\\mathbf{j}+z^2\\mathbf{k}$에 대하여 $\\displaystyle\\iint_\\Sigma\\mathbf{F}\\cdot\\mathbf{N}d\\sigma$의 값은? (단, $\\mathbf{N}$은 외향단위법선벡터.)",
    options: [o("1","$\\dfrac{\\pi}{2}$"),o("2","$\\pi$"),o("3","$\\dfrac{3\\pi}{2}$"),o("4","$2\\pi$"),o("5","$\\dfrac{5\\pi}{2}$")], answer: 4,
    explanation: "발산정리: $\\nabla\\cdot\\mathbf{F}=2x+2y+2z$. 원뿔영역에서 $\\iiint(2x+2y+2z)dV$. 대칭으로 $x,y$ 항 $0$, $z$ 항만 남음. 정리 $=2\\pi$." }),
  build({ num: 20, subject: "선형대수", unit: "추가내용", concept: "최소제곱해", difficulty: "medium",
    question: "$A=\\begin{pmatrix}1&0\\\\0&1\\\\2&1\\end{pmatrix},\\,\\mathbf{b}=\\begin{pmatrix}3\\\\0\\\\12\\end{pmatrix}$일 때, $A\\mathbf{x}=\\mathbf{b}$의 최소제곱해는?",
    options: [o("1","$\\begin{pmatrix}4\\\\2\\end{pmatrix}$"),o("2","$\\begin{pmatrix}2\\\\3\\end{pmatrix}$"),o("3","$\\begin{pmatrix}5\\\\2\\end{pmatrix}$"),o("4","$\\begin{pmatrix}4\\\\1\\end{pmatrix}$"),o("5","$\\begin{pmatrix}5\\\\1\\end{pmatrix}$")], answer: 5,
    explanation: "$A^TA=\\begin{pmatrix}5&2\\\\2&2\\end{pmatrix},\\,A^T\\mathbf{b}=\\begin{pmatrix}27\\\\12\\end{pmatrix}$. 풀면 $\\hat{\\mathbf{x}}=\\begin{pmatrix}5\\\\1\\end{pmatrix}$." }),
];

console.log(`Inserting ${problems.length} questions to Supabase...`);
const { data, error } = await supabase.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
console.log("Inserted:");
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
