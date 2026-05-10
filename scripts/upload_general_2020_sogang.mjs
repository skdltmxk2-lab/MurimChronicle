// 2020년 서강대 편입수학 객관식 16문항 (5지선다) — Q17~20은 주관식이라 제외
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2020", SCHOOL_KO="서강대", SCHOOL_EN="sogang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {n:1, subject:"미분학", unit:"도함수의 활용", concept:"극값 차이",
    difficulty:"easy",
    question:"함수 $f(x)=5x+11+\\dfrac{20}{x}$가 $x=a$에서 극댓값을 갖고 $x=b$에서 극솟값을 가질 때 $f(a)-f(b)$의 값은?",
    options:opts5("$25$","$30$","$35$","$40$","$-40$"),
    correct:"5",
    explanation:"$f'(x)=5-\\dfrac{20}{x^2}=0\\Rightarrow x=\\pm 2$.\n$f''(x)=\\dfrac{40}{x^3}$. $f''(-2)<0$ (극대), $f''(2)>0$ (극소).\n$a=-2,\\,b=2$. $f(-2)=-10+11-10=-9,\\,f(2)=10+11+10=31$.\n$f(a)-f(b)=-9-31=-40$.",
  },
  {n:2, subject:"적분학", unit:"정적분의 응용", concept:"이중축 곡선 면적",
    difficulty:"medium",
    question:"좌표평면에서 곡선 $y^2=x^2-x^4$으로 둘러싸인 영역의 면적은?",
    options:opts5("$\\dfrac{3}{4}$","$\\dfrac{4}{3}$","$\\dfrac{3}{2}$","$\\dfrac{2}{3}$","$1$"),
    correct:"2",
    explanation:"$y=\\pm|x|\\sqrt{1-x^2},\\,x\\in[-1,1]$. 대칭이므로 1사분면 면적 $\\times 4$.\n$A=4\\!\\int_0^1 x\\sqrt{1-x^2}\\,dx=4\\!\\left[-\\dfrac{1}{3}(1-x^2)^{3/2}\\right]_0^1=4\\cdot\\dfrac{1}{3}=\\dfrac{4}{3}$.",
  },
  {n:3, subject:"적분학", unit:"급수의 수렴/발산", concept:"멱급수 수렴구간",
    difficulty:"medium",
    question:"멱급수 $x-\\dfrac{x^2}{2}+\\dfrac{x^3}{3}-\\cdots+(-1)^{n-1}\\dfrac{x^n}{n}+\\cdots$의 수렴구간은?",
    options:opts5("$0\\le x<1$","$-1<x\\le 1$","$-1\\le x\\le 1$","$-1\\le x<1$","$-1<x\\le 0$"),
    correct:"2",
    explanation:"$\\ln(1+x)=\\!\\sum_{n=1}^{\\infty}(-1)^{n-1}\\dfrac{x^n}{n}$. 수렴반경 $1$.\n$x=1$: 교대조화급수 수렴.\n$x=-1$: 조화급수 $-\\!\\sum\\dfrac{1}{n}$ 발산.\n수렴구간 $-1<x\\le 1$.",
  },
  {n:4, subject:"다변수함수", unit:"중적분", concept:"슈타인메츠 입체 부피",
    difficulty:"medium",
    question:"3차원 공간 위의 두 원기둥 $x^2+y^2\\le 1,\\,x^2+z^2\\le 1$이 만나는 부분 중 $z\\ge 0$인 부분의 부피는?",
    options:opts5("$2$","$\\dfrac{7}{3}$","$\\dfrac{9}{4}$","$\\dfrac{8}{3}$","$3$"),
    correct:"4",
    explanation:"두 원기둥 교차의 부피(슈타인메츠) $=\\dfrac{16}{3}$. $z\\ge 0$ 부분은 절반 $=\\dfrac{8}{3}$.\n또는 $V=\\!\\int_{-1}^1\\!\\!\\int_0^{\\sqrt{1-x^2}}2\\sqrt{1-x^2}\\,dz\\,dx$ 계산.\n$V=\\!\\int_{-1}^1 2(1-x^2)\\,dx=\\dfrac{8}{3}$.",
  },
  {n:5, subject:"적분학", unit:"정적분", concept:"치환 대칭 적분",
    difficulty:"easy",
    question:"함수 $f(x)$가 $[0,\\pi]$에서 연속이고 모든 $x\\in[0,\\pi]$에 대하여 $f(x)+f(\\pi-x)=\\sin x$를 만족할 때 $\\displaystyle\\int_0^{\\pi}f(x)\\,dx$의 값은?",
    options:opts5("$1$","$\\dfrac{4}{3}$","$\\dfrac{3}{2}$","$2$","$\\dfrac{\\pi}{2}$"),
    correct:"1",
    explanation:"$I=\\!\\int_0^{\\pi}f(x)\\,dx$. $u=\\pi-x$ 치환: $I=\\!\\int_0^{\\pi}f(\\pi-u)\\,du$.\n$2I=\\!\\int_0^{\\pi}[f(x)+f(\\pi-x)]\\,dx=\\!\\int_0^{\\pi}\\sin x\\,dx=2$.\n$I=1$.",
  },
  {n:6, subject:"미분학", unit:"극한과 연속", concept:"테일러 전개 극한",
    difficulty:"medium",
    question:"$\\displaystyle\\lim_{x\\to\\infty}\\!\\left[\\dfrac{x}{2}-x^2+x^3\\ln\\!\\left(\\dfrac{1+x}{x}\\right)\\right]$의 값은?",
    options:opts5("$1$","$\\dfrac{2}{3}$","$\\dfrac{1}{2}$","$\\dfrac{1}{3}$","$\\dfrac{1}{4}$"),
    correct:"4",
    explanation:"$\\ln\\!\\left(1+\\dfrac{1}{x}\\right)=\\dfrac{1}{x}-\\dfrac{1}{2x^2}+\\dfrac{1}{3x^3}-\\dfrac{1}{4x^4}+\\cdots$.\n$x^3\\ln\\!\\left(\\dfrac{1+x}{x}\\right)=x^2-\\dfrac{x}{2}+\\dfrac{1}{3}-\\dfrac{1}{4x}+\\cdots$.\n$\\dfrac{x}{2}-x^2+x^3\\ln\\!\\left(\\dfrac{1+x}{x}\\right)=\\dfrac{1}{3}-\\dfrac{1}{4x}+\\cdots\\to\\dfrac{1}{3}$.",
  },
  {n:7, subject:"적분학", unit:"정적분의 응용", concept:"매개곡선 길이",
    difficulty:"medium",
    question:"평면 위의 곡선이 다음과 같이 매개변수로 표현되었을 때 이 곡선의 길이는?\n$$x(t)=\\!\\int_t^{\\infty}\\dfrac{\\cos x}{x}\\,dx,\\;y(t)=\\!\\int_t^{\\infty}\\dfrac{\\sin x}{x}\\,dx\\;\\;(1\\le t\\le 2)$$",
    options:opts5("$\\sqrt{2}$","$\\sqrt{3}$","$\\ln 2$","$\\ln 3$","$\\sqrt{5}$"),
    correct:"3",
    explanation:"미적분학 기본정리: $x'(t)=-\\dfrac{\\cos t}{t},\\,y'(t)=-\\dfrac{\\sin t}{t}$.\n$\\sqrt{x'^2+y'^2}=\\sqrt{\\dfrac{\\cos^2 t+\\sin^2 t}{t^2}}=\\dfrac{1}{t}$.\n$L=\\!\\int_1^2\\dfrac{1}{t}\\,dt=\\ln 2$.",
  },
  {n:8, subject:"다변수함수", unit:"선적분과 면적분", concept:"벡터장 회전(curl)",
    difficulty:"easy",
    question:"오른 직교좌표계 $x,y,z$를 갖는 벡터 $\\vec{v}=(yz,3zx,z)$에 대하여 점 $P(1,1,1)$에서 $\\vec{v}$의 회전(curl)은?",
    options:opts5("$(3,-1,2)$","$(3,1,-2)$","$(-3,-1,2)$","$(3,-1,-2)$","$(-3,1,2)$"),
    correct:"5",
    explanation:"$\\nabla\\times\\vec{v}=(R_y-Q_z,\\,P_z-R_x,\\,Q_x-P_y)$. $P=yz,\\,Q=3zx,\\,R=z$.\n$R_y-Q_z=0-3x=-3x$.\n$P_z-R_x=y-0=y$.\n$Q_x-P_y=3z-z=2z$.\n$(1,1,1)$에서 $(-3,1,2)$.",
  },
  {n:9, subject:"선형대수", unit:"고유치와 대각화", concept:"상삼각 행렬 고윳값 거듭제곱",
    difficulty:"easy",
    question:"행렬 $A=\\begin{bmatrix}1&-1&1\\\\0&2&0\\\\0&0&3\\end{bmatrix}$에 대하여 $A^5$의 고윳값의 합은?",
    options:opts5("$156$","$198$","$235$","$269$","$276$"),
    correct:"5",
    explanation:"$A$는 상삼각행렬이므로 고윳값은 대각성분 $1,2,3$.\n$A^5$의 고윳값은 $1^5,\\,2^5,\\,3^5=1,\\,32,\\,243$.\n합 $=1+32+243=276$.",
  },
  {n:10, subject:"미분학", unit:"미분방정식", concept:"이계 ODE 초깃값",
    difficulty:"medium",
    question:"미분 방정식 $y''+4y'+4y=-4x+4$의 해 $y(x)$가 $y(0)=4,\\,y'(0)=-6$을 만족할 때 $y(2)$의 값은?",
    options:opts5("$3e^{-4}$","$-e^{-4}$","$3e^{-4}+1$","$0$","$2$"),
    correct:"4",
    explanation:"동차해 $y_h=(c_1+c_2 x)e^{-2x}$.\n특해 $y_p=ax+b$ 가정: $4a+4(ax+b)=-4x+4\\Rightarrow a=-1,\\,b=2$. $y_p=-x+2$.\n초기조건: $y(0)=c_1+2=4\\Rightarrow c_1=2$. $y'(0)=c_2-2c_1-1=-6\\Rightarrow c_2=-1$.\n$y(x)=(2-x)e^{-2x}-x+2$. $y(2)=0\\cdot e^{-4}+0=0$.",
  },
  {n:11, subject:"선형대수", unit:"선형변환", concept:"커널의 단위구 사영",
    difficulty:"hard",
    question:"선형변환 $T:\\mathbb{R}^4\\to\\mathbb{R}^3$가 $T(x,y,z,w)=(x+y,\\,z+w,\\,0)$으로 정의되었을 때 $T$의 핵(Kernel)에 속하며 $x^2+y^2+z^2+w^2=1$에 해당하는 부분을 각각 $xy$-평면과 $yz$-평면으로 사영시킨 집합은?",
    options:opts5("$y=-x\\;(-1/\\sqrt{2}\\le x\\le 1/\\sqrt{2}),\\;y^2+z^2=1/2$","$y=-x\\;(-1\\le x\\le 1),\\;y^2+z^2=1$","$y=x\\;(-1\\le x\\le 1),\\;y^2+z^2=1$","$y=x\\;(-1/\\sqrt{2}\\le x\\le 1/\\sqrt{2}),\\;y^2+z^2=1/2$","$y=-x\\;(-1/\\sqrt{2}\\le x\\le 1/\\sqrt{2}),\\;y^2+z^2=1$"),
    correct:"1",
    explanation:"커널: $x+y=0,\\,z+w=0\\Rightarrow y=-x,\\,w=-z$. 단위구 조건: $2x^2+2z^2=1\\Rightarrow x^2+z^2=\\dfrac{1}{2}$.\n$xy$-사영: $y=-x,\\,|x|\\le\\dfrac{1}{\\sqrt{2}}$.\n$yz$-사영: $y^2+z^2=x^2+z^2=\\dfrac{1}{2}$.",
  },
  {n:12, subject:"다변수함수", unit:"편도함수의 응용", concept:"이차곡선 거리 극값",
    difficulty:"hard",
    question:"좌표평면의 원점에서 곡선 $5x^2+6xy+5y^2-8=0$까지 거리의 최댓값에서 최솟값을 뺀 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"1",
    explanation:"이차형식 행렬 $\\begin{pmatrix}5&3\\\\3&5\\end{pmatrix}$의 고윳값 $\\lambda=2,\\,8$.\n주축 변환 후 $8u^2+2v^2=8\\Rightarrow\\dfrac{u^2}{1}+\\dfrac{v^2}{4}=1$. 반축 $a=2,\\,b=1$.\n원점 거리 최대 $2$, 최소 $1$. 차 $=1$.",
  },
  {n:13, subject:"선형대수", unit:"선형변환", concept:"선형변환에 의한 면적",
    difficulty:"medium",
    question:"평면 위의 선형변환 $T$가 $T(1,0)=(2,3),\\,T(0,1)=(1,-2)$을 만족한다. $T$에 의해서 평면 위의 세 점 $A(-1,0),\\,B(1,-1),\\,C(2,3)$이 옮겨지는 점을 $P,Q,R$이라 할 때 $\\triangle PQR$의 면적은?",
    options:opts5("$\\dfrac{67}{3}$","$\\dfrac{63}{2}$","$\\dfrac{91}{3}$","$\\dfrac{98}{3}$","$\\dfrac{67}{2}$"),
    correct:"2",
    explanation:"$T=\\begin{pmatrix}2&1\\\\3&-2\\end{pmatrix}$, $\\det T=-7$.\n$\\triangle ABC$ 면적: $\\dfrac{1}{2}|\\det((1,-1)-(-1,0),\\,(2,3)-(-1,0))|=\\dfrac{1}{2}|\\det((2,-1),(3,3))|=\\dfrac{9}{2}$.\n$\\triangle PQR$ 면적 $=|\\det T|\\cdot\\dfrac{9}{2}=7\\cdot\\dfrac{9}{2}=\\dfrac{63}{2}$.",
  },
  {n:14, subject:"미분학", unit:"미분방정식", concept:"라플라스 역변환 시간이동",
    difficulty:"hard",
    question:"$t\\ge 0$에서 정의된 함수 $f(t)$의 라플라스 변환(Laplace transform) $F(s)$가 다음과 같이 주어질 때 $f(1)+f(3)+f(4.5)+f(5.5)+f(7)$의 값은?\n$$F(s)=\\dfrac{\\pi(1-e^{-4s})}{s^2+(\\pi/2)^2}+\\dfrac{e^{-5s}}{s}\\!\\left(3-3e^{-s}+\\dfrac{e^{-s}}{s}\\right)$$",
    options:opts5("$1$","$\\dfrac{5}{2}$","$4$","$\\dfrac{9}{2}$","$6$"),
    correct:"3",
    explanation:"$L^{-1}\\!\\left\\{\\dfrac{\\pi}{s^2+(\\pi/2)^2}\\right\\}=2\\sin\\!\\left(\\dfrac{\\pi t}{2}\\right)$.\n$\\pi e^{-4s}/(\\cdots)$로 $t-4$ 이동: $0\\le t<4$에서 $f_1=2\\sin(\\pi t/2)$, $t\\ge 4$에서 $0$ (사인 주기 4).\n$3e^{-5s}/s\\to 3U(t-5),\\,-3e^{-6s}/s\\to-3U(t-6),\\,e^{-6s}/s^2\\to(t-6)U(t-6)$.\n$f(1)=2\\sin(\\pi/2)=2,\\,f(3)=2\\sin(3\\pi/2)=-2,\\,f(4.5)=0,\\,f(5.5)=3,\\,f(7)=3-3+1=1$.\n합 $=2-2+0+3+1=4$.",
  },
  {n:15, subject:"다변수함수", unit:"선적분과 면적분", concept:"보존벡터장 선적분",
    difficulty:"medium",
    question:"좌표평면에서 시작점 $\\gamma(0)=(1,1)$과 끝점 $\\gamma(1)=(2,2)$를 잇는 1사분면 위의 단순 곡선 $\\gamma$에 대하여 $\\displaystyle\\int_{\\gamma(0)}^{\\gamma(1)}\\!\\left(\\dfrac{1+y^2}{x^3}\\,dx-\\dfrac{1+x^2}{x^2}y\\,dy\\right)$의 값은?",
    options:opts5("$1$","$-\\dfrac{3}{4}$","$\\dfrac{3}{4}$","$\\dfrac{9}{8}$","$-\\dfrac{9}{8}$"),
    correct:"5",
    explanation:"$P=\\dfrac{1+y^2}{x^3},\\,Q=-\\dfrac{(1+x^2)y}{x^2}$. $P_y=Q_x=\\dfrac{2y}{x^3}$ ⇒ 보존.\n포텐셜: $\\varphi=-\\dfrac{1+y^2}{2x^2}-\\dfrac{y^2}{2}$.\n$\\varphi(2,2)=-\\dfrac{5}{8}-2=-\\dfrac{21}{8}$, $\\varphi(1,1)=-1-\\dfrac{1}{2}=-\\dfrac{12}{8}$.\n적분 $=\\varphi(2,2)-\\varphi(1,1)=-\\dfrac{9}{8}$.",
  },
  {n:16, subject:"적분학", unit:"급수의 수렴/발산", concept:"비율판정과 비교",
    difficulty:"medium",
    question:"다음 급수 ㄱ~ㄷ 중에서 수렴하는 것만을 고른 것은?\n(ㄱ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{n^n}{n!\\cdot 3^n}$\n(ㄴ) $\\displaystyle\\sum_{n=1}^{\\infty}\\sin\\dfrac{1}{n}$\n(ㄷ) $\\displaystyle\\sum_{n=2}^{\\infty}\\dfrac{1}{n\\ln n}$",
    options:opts5("ㄱ","ㄴ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ"),
    correct:"1",
    explanation:"(ㄱ) 비율판정: $\\dfrac{a_{n+1}}{a_n}=\\dfrac{(n+1)^n}{3n^n}\\to\\dfrac{e}{3}<1$. **수렴**.\n(ㄴ) $\\sin\\dfrac{1}{n}\\sim\\dfrac{1}{n}$, 조화급수 비교 발산. **발산**.\n(ㄷ) 적분판정 $\\!\\int\\dfrac{dx}{x\\ln x}=\\ln(\\ln x)\\to\\infty$. **발산**.\n따라서 (ㄱ).",
  },
];

const TOTAL=PROBLEMS.length;
console.log(`총 ${TOTAL}문제 준비됨`);

const rows = PROBLEMS.map(p => {
  const id = `q-${YEAR}-${SCHOOL_EN}-${String(p.n).padStart(2,"0")}`;
  return {
    id,
    subject: p.subject,
    unit: p.unit,
    concept: p.concept,
    difficulty: p.difficulty,
    source_type: "imported",
    pool: "general",
    question: p.question,
    content_type: "latex",
    question_image: null,
    options: p.options,
    correct_option_id: p.correct,
    explanation: p.explanation,
    explanation_content_type: "latex",
    explanation_image: null,
    tags: [`year:${YEAR}`, `school:${SCHOOL_KO}`, `school_slug:${SCHOOL_EN}`, "past_exam"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
});

const { data, error } = await sb.from("questions").upsert(rows, { onConflict: "id" }).select("id");
if (error) {
  console.error("업로드 실패:", error);
  process.exit(1);
}
console.log(`업로드 완료: ${data.length}건`);
