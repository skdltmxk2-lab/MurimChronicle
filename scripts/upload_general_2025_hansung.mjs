// Upload 2025년도 한성대 편입수학 기출 20문항 (4지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "한성대"; const YEAR = "2025";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-hansung-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({ num:1, subject:"선형대수", unit:"행렬", concept:"행렬식 최댓값", difficulty:"medium",
    question:"$A=\\begin{pmatrix}1 & 2 & 3 & 0 & 2\\\\ 0 & 1 & 1 & 0 & 1\\\\ 0 & 0 & 1 & 0 & 3\\\\ 0 & 0 & 0 & 2 & 0\\\\ 0 & 0 & 0 & 0 & x\\end{pmatrix}$일 경우, 실수 $x$에 대한 $\\det(2A)-\\det(A^2)$의 최댓값은?",
    options:[o("1","$32$"),o("2","$64$"),o("3","$128$"),o("4","$256$")],
    answer:4,
    explanation:"$|A|=2x$. $\\det(2A)=2^5|A|=64x$, $\\det(A^2)=4x^2$. $64x-4x^2=-4(x-8)^2+256$, $x=8$에서 최댓값 256."
  }),
  build({ num:2, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬다항식 행렬식", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}2 & 0 & 1\\\\ 4 & 2 & 3\\\\ 3 & 0 & 0\\end{pmatrix}$에 대하여 $\\det(A^2-A)$의 값은?",
    options:[o("1","$16$"),o("2","$20$"),o("3","$24$"),o("4","$28$")],
    answer:3,
    explanation:"$A$의 고유값 $-1,3,2$. $A^2-A$의 고유값 $2,6,2$. 행렬식 $=2\\cdot 6\\cdot 2=24$."
  }),
  build({ num:3, subject:"미분학", unit:"극한과 연속", concept:"다항식 결정", difficulty:"medium",
    question:"$x$에 대한 다항식 $f(x)$가 $\\displaystyle\\lim_{x\\to 4}\\dfrac{f(x)}{x-4}=2$와 $\\displaystyle\\lim_{x\\to\\infty}\\dfrac{f(x)}{\\sqrt{x^4+x^2+1}}=2$를 만족시킬 때, $f(x)=0$의 실근의 합은?",
    options:[o("1","$7$"),o("2","$-7$"),o("3","$14$"),o("4","$-14$")],
    answer:1,
    explanation:"$\\lim_{x\\to\\infty}f(x)/x^2=2$이라 $f$ 최고차 $2x^2$. $\\lim_{x\\to 4}$ → $f(4)=0$, $f'(4)=2$. $f=2x^2+ax+b$, $f(4)=32+4a+b=0$, $f'(4)=16+a=2$ → $a=-14,b=24$. 근 $3,4$, 합 $7$."
  }),
  build({ num:4, subject:"미분학", unit:"극한과 연속", concept:"삼각함수", difficulty:"easyMedium",
    question:"$\\cos(\\pi+\\theta)-\\sin\\!\\left(\\dfrac{\\pi}{2}+\\theta\\right)=1$이고 $\\tan\\theta>0$일 때, $\\sin(-\\theta)$의 값은?",
    options:[o("1","$-\\dfrac{\\sqrt{3}}{2}$"),o("2","$\\dfrac{\\sqrt{3}}{2}$"),o("3","$-\\dfrac{\\sqrt{3}}{3}$"),o("4","$\\dfrac{\\sqrt{3}}{3}$")],
    answer:2,
    explanation:"$-\\cos\\theta-\\cos\\theta=1$ → $\\cos\\theta=-1/2$. $\\tan\\theta>0$이므로 $\\theta=4\\pi/3$, $\\sin\\theta=-\\sqrt 3/2$. $\\sin(-\\theta)=\\sqrt 3/2$."
  }),
  build({ num:5, subject:"적분학", unit:"급수", concept:"텔레스코핑", difficulty:"medium",
    question:"수열 $\\{a_n\\}$에 대하여 $a_1=2$이고 급수 $\\displaystyle\\sum_{n=1}^{\\infty}(na_n-3)$이 수렴할 때, $\\displaystyle\\sum_{n=1}^{\\infty}\\{(n+1)a_{n+1}-na_n\\}$의 값은?",
    options:[o("1","$1$"),o("2","$-1$"),o("3","$2$"),o("4","$-2$")],
    answer:1,
    explanation:"$na_n-3=b_n$이라 하면 $\\sum b_n$ 수렴 → $b_n\\to 0$ → $na_n\\to 3$. 텔레스코핑: $\\sum=\\lim na_n-a_1=3-2=1$."
  }),
  build({ num:6, subject:"미분학", unit:"극한과 연속", concept:"분수함수 극한", difficulty:"easyMedium",
    question:"$\\displaystyle\\lim_{x\\to 1}\\dfrac{x^{10}+3x-4}{x-1}$의 값은?",
    options:[o("1","$11$"),o("2","$12$"),o("3","$13$"),o("4","$14$")],
    answer:3,
    explanation:"로피탈: $\\lim\\dfrac{10x^9+3}{1}=13$."
  }),
  build({ num:7, subject:"선형대수", unit:"고유치와 대각화", concept:"대각화", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}2 & 1 & 0\\\\ 1 & 2 & 0\\\\ 0 & 0 & 2\\end{pmatrix}$에 대해 행렬 $K=\\begin{pmatrix}a & 1 & 0\\\\ -1 & b & 0\\\\ 0 & 0 & 1\\end{pmatrix}$가 $K^{-1}AK=\\begin{pmatrix}1 & 0 & 0\\\\ 0 & c & 0\\\\ 0 & 0 & d\\end{pmatrix}$를 만족시킬 경우 $a^2+b^2+c^2+d^2$의 값은?",
    options:[o("1","$11$"),o("2","$15$"),o("3","$19$"),o("4","$26$")],
    answer:2,
    explanation:"$A$ 고유값 1,3,2. $\\lambda=1$ 고유벡터 $(1,-1,0)$ → $a=1,b=-1$이지만 행렬 $K$에서 $a=1,b=1$로 두 번째 열 정규화. $D=\\mathrm{diag}(1,3,2)$ → $c=3,d=2$. $a^2+b^2+c^2+d^2=1+1+9+4=15$."
  }),
  build({ num:8, subject:"다변수함수", unit:"벡터", concept:"회전변환", difficulty:"medium",
    question:"$xy$좌표평면에서 직선 $y=1$을 원점을 중심으로 시계 방향으로 $60°$ 회전시켜 얻은 직선을 $m$이라고 하자. 직선 $m$과 직선 $y=1$의 교점의 $x$좌표는?",
    options:[o("1","$1$"),o("2","$\\dfrac{\\sqrt{3}}{2}$"),o("3","$\\dfrac{\\sqrt{3}}{3}$"),o("4","$\\dfrac{\\sqrt{3}}{4}$")],
    answer:3,
    explanation:"회전식 후 직선 $m:y=\\tfrac{\\sqrt 3}{2}x+\\tfrac{1}{2}y'$ 변환. 결과 $\\tfrac{\\sqrt 3}{2}x+\\tfrac{1}{2}y=1$ 직선. $y=1$ 대입 시 $x=\\dfrac{\\sqrt 3}{3}$."
  }),
  build({ num:9, subject:"선형대수", unit:"고유치와 대각화", concept:"역행렬 고유값", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}2 & 0\\\\ 1 & 1\\end{pmatrix}$에 대한 역행렬 $A^{-1}$의 고윳값의 합은?",
    options:[o("1","$-\\dfrac{1}{2}$"),o("2","$\\dfrac{1}{2}$"),o("3","$-\\dfrac{3}{2}$"),o("4","$\\dfrac{3}{2}$")],
    answer:4,
    explanation:"$A$ 고유값 $1,2$. $A^{-1}$ 고유값 $1,1/2$. 합 $\\dfrac{3}{2}$."
  }),
  build({ num:10, subject:"선형대수", unit:"행렬", concept:"행렬 진위", difficulty:"medium",
    question:"$n$차 정방행렬 $A,B$에 대해 다음 중 옳은 것의 개수는?\n\n가. $(A-B^T)^T=B-A^T$\n나. $(kAB)^{-1}=\\dfrac{1}{k}A^{-1}B^{-1}$ ($k$는 $0$이 아닌 실수)\n다. $A$와 $B$가 대칭행렬인 경우 $BA$도 대칭행렬이다.\n라. $A$와 $B$가 직교행렬인 경우 $A^T(A+B)B^T=A^T+B^T$",
    options:[o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")],
    answer:1,
    explanation:"가. $(A-B^T)^T=A^T-B$ ≠ $B-A^T$. **거짓**. 나. $(kAB)^{-1}=\\tfrac{1}{k}B^{-1}A^{-1}$ ≠ $\\tfrac{1}{k}A^{-1}B^{-1}$. **거짓**. 다. $(BA)^T=A^T B^T=AB\\ne BA$. **거짓**. 라. $A^T A=I,B^T B=I$이라 $A^T(A+B)B^T=B^T+A^T BB^T=B^T+A^T$. **참**. 옳은 것 1개."
  }),
  build({ num:11, subject:"공학수학", unit:"미분방정식", concept:"2계 비동차 ODE", difficulty:"medium",
    question:"미분방정식 $y''+2y'+2y=0,\\,y(0)=2,\\,y(\\pi/2)=0$의 해가 $y(x)$라고 할 때, $y'(0)$의 값은?",
    options:[o("1","$-2$"),o("2","$0$"),o("3","$2$"),o("4","$\\pi$")],
    answer:1,
    explanation:"특성근 $-1\\pm i$. $y=e^{-x}(c_1\\cos x+c_2\\sin x)$. $y(0)=c_1=2$. $y(\\pi/2)=e^{-\\pi/2}c_2=0$ → $c_2=0$. $y=2e^{-x}\\cos x$, $y'(x)=-2e^{-x}\\cos x-2e^{-x}\\sin x$. $y'(0)=-2$."
  }),
  build({ num:12, subject:"미분학", unit:"도함수의 응용", concept:"점-곡선 거리", difficulty:"medium",
    question:"점 $P$는 곡선 $y=x^2+2$ 위의 한 점이고, 점 $Q$는 직선 $y=2x-4$ 위의 한 점일 때, 두 점 $P$와 $Q$ 사이 거리의 최솟값은?",
    options:[o("1","$2$"),o("2","$\\sqrt{5}$"),o("3","$\\dfrac{\\sqrt{15}}{5}$"),o("4","$\\sqrt{10}$")],
    answer:2,
    explanation:"접선 기울기 2: $2x=2,\\,x=1,\\,y=3$. $(1,3)$과 직선 $2x-y-4=0$ 거리 $=\\dfrac{|2-3-4|}{\\sqrt 5}=\\sqrt 5$."
  }),
  build({ num:13, subject:"미분학", unit:"도함수", concept:"라이프니츠 정리", difficulty:"medium",
    question:"$f(x)=(x^2+2)\\displaystyle\\int_0^{2x}\\cos t\\,dt$일 때, $f'(0)$의 값은?",
    options:[o("1","$1$"),o("2","$2$"),o("3","$3$"),o("4","$4$")],
    answer:4,
    explanation:"$f'(x)=2x\\!\\int_0^{2x}\\cos t\\,dt+(x^2+2)\\cdot 2\\cos(2x)$. $f'(0)=0+2\\cdot 2=4$."
  }),
  build({ num:14, subject:"적분학", unit:"정적분의 응용", concept:"넓이비", difficulty:"medium",
    question:"곡선 $y=-x^2+2x$ $(0\\le x\\le 2)$와 직선 $y=ax$ 사이 영역의 넓이가 $\\dfrac{9}{16}$일 때, 양수 $a$의 값은?",
    options:[o("1","$\\dfrac{1}{3}$"),o("2","$\\dfrac{1}{2}$"),o("3","$1$"),o("4","$\\dfrac{3}{2}$")],
    answer:2,
    explanation:"교점 $x=2-a$. 넓이 $=\\dfrac{(2-a)^3}{6}=\\dfrac{9}{16}$. $(2-a)^3=27/8$ → $2-a=3/2$ → $a=\\dfrac{1}{2}$."
  }),
  build({ num:15, subject:"공학수학", unit:"확률과 통계", concept:"조건부 확률(베이즈)", difficulty:"medium",
    question:"두 개의 특수한 동전 $A$와 $B$가 있다. 동전 $A$를 던졌을 때 앞면이 나올 확률이 $\\dfrac{3}{10}$이고, 동전 $B$를 던졌을 때 앞면이 나올 확률이 $\\dfrac{3}{5}$이다. 임의의 동전을 선택하여 던졌을 때 앞면이 나온다면, 그 동전이 $A$동전일 확률은? (단, 각 동전이 선택될 확률은 $\\dfrac{1}{2}$로 같다.)",
    options:[o("1","$\\dfrac{1}{4}$"),o("2","$\\dfrac{1}{3}$"),o("3","$\\dfrac{1}{2}$"),o("4","$\\dfrac{2}{3}$")],
    answer:2,
    explanation:"베이즈: $P(A|\\text{앞})=\\dfrac{(1/2)(3/10)}{(1/2)(3/10)+(1/2)(3/5)}=\\dfrac{3/10}{9/10}=\\dfrac{1}{3}$."
  }),
  build({ num:16, subject:"미분학", unit:"도함수", concept:"역함수 도함수", difficulty:"medium",
    question:"함수 $f(x)=x^3+x-2$에 대하여, $f^{-1}(x)=g(x-8)$일 때, $g'(0)$의 값은?",
    options:[o("1","$\\sqrt{\\dfrac{7}{3}}$"),o("2","$\\sqrt{3}$"),o("3","$\\dfrac{1}{13}$"),o("4","$\\dfrac{1}{4}$")],
    answer:3,
    explanation:"$g'(0)=(f^{-1})'(8)$. $f(2)=8$이라 $g'(0)=\\dfrac{1}{f'(2)}=\\dfrac{1}{13}$."
  }),
  build({ num:17, subject:"공학수학", unit:"확률과 통계", concept:"기하확률", difficulty:"medium",
    question:"좌표평면 위 영역 $0\\le x\\le 2,\\,0\\le y\\le 2$ 위에 균일하게 점을 찍을 때, 찍힌 점이 $y=-x^2+2x+1$과 $x$축 사이에 존재할 확률은?",
    options:[o("1","$\\dfrac{5}{12}$"),o("2","$\\dfrac{1}{2}$"),o("3","$\\dfrac{2}{3}$"),o("4","$\\dfrac{5}{6}$")],
    answer:4,
    explanation:"$y=-x^2+2x+1=-(x-1)^2+2$. $0\\le y\\le 2$ 영역과 $0\\le x\\le 2$의 곡선 아래 면적: $0\\le y\\le 1$ 부분 $2$ + $1<y\\le 2$ 부분 $\\!\\int_0^2(-x^2+2x+1-1)dx=4/3$. 합 $=10/3$. 확률 $\\dfrac{10/3}{4}=\\dfrac{5}{6}$."
  }),
  build({ num:18, subject:"다변수함수", unit:"선적분과 면적분", concept:"선적분", difficulty:"medium",
    question:"경로 $C$가 점 $(1,0)$에서 점 $(0,1)$까지 제1사분면에서 반시계 방향으로 진행하는 원호일 때, 벡터함수 $\\mathbf{F}(\\mathbf{r})=[-y,-xy]$에 대해 선적분 $\\displaystyle\\int_C \\mathbf{F}\\cdot d\\mathbf{r}$의 값은?",
    options:[o("1","$\\dfrac{\\pi}{4}-\\dfrac{1}{3}$"),o("2","$\\dfrac{\\pi}{4}+\\dfrac{1}{3}$"),o("3","$\\dfrac{\\pi}{4}-\\dfrac{7}{12}$"),o("4","$\\dfrac{\\pi}{4}+\\dfrac{1}{12}$")],
    answer:1,
    explanation:"매개화 $r(t)=(\\cos t,\\sin t),\\,0\\le t\\le\\pi/2$. $\\!\\int_0^{\\pi/2}\\sin^2 t-\\cos^2 t\\sin t\\,dt=\\pi/4-1/3$."
  }),
  build({ num:19, subject:"다변수함수", unit:"중적분", concept:"부피 적분", difficulty:"easyMedium",
    question:"$z=4x^2+9y^2$인 곡면의 아래 공간 중 $xy$평면에서 $(0,0),(3,0),(3,2),(0,2)$를 꼭짓점으로 하는 직사각형 위 영역의 부피는?",
    options:[o("1","$36$"),o("2","$72$"),o("3","$144$"),o("4","$194$")],
    answer:3,
    explanation:"$\\!\\int_0^2\\!\\!\\int_0^3(4x^2+9y^2)dx\\,dy=\\!\\int_0^2(36+27y^2)dy=72+72=144$."
  }),
  build({ num:20, subject:"공학수학", unit:"미분방정식", concept:"라플라스 변환(연립ODE)", difficulty:"medium",
    question:"연립 방정식 $y_1'-2y_1+3y_2=0$과 $y_2'-y_1+2y_2=0$에 대해 $y_1(0)=1,\\,y_2(0)=0$이 성립할 때, $\\displaystyle\\int_0^{\\infty}e^{-3t}y_2(t)dt$의 값은?",
    options:[o("1","$\\dfrac{1}{8}$"),o("2","$\\dfrac{3}{8}$"),o("3","$\\dfrac{5}{8}$"),o("4","$\\dfrac{7}{8}$")],
    answer:1,
    explanation:"라플라스: $sY_2-y_2(0)=Y_1-2Y_2$, $sY_1-y_1(0)=2Y_1-3Y_2$. 풀면 $Y_2=\\dfrac{1}{s^2-1}$. $s=3$ 대입: $\\dfrac{1}{8}$."
  }),
];

console.log(`Inserting ${problems.length} questions...`);
const { data, error } = await sb.from("questions").insert(problems).select("id, subject, unit, difficulty");
if (error) { console.error("Insert failed:", error); process.exit(1); }
for (const row of data ?? []) console.log(`  - ${row.id}  [${row.subject}/${row.unit}/${row.difficulty}]`);
