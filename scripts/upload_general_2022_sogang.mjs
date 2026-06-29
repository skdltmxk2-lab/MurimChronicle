// 2022년 서강대 편입수학 객관식 16문항 (5지선다) — Q17~20은 주관식이라 제외
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2022", SCHOOL_KO="서강대", SCHOOL_EN="sogang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {n:1, subject:"미분학", unit:"극한과 연속", concept:"역함수 멱급수 극한",
    difficulty:"hard",
    question:"함수 $f(x)=x-\\cos x+1$의 역함수를 $g(x)$라고 할 때, 극한 $\\displaystyle\\lim_{x\\to 0}\\dfrac{\\{g(x)\\}^2}{x-g(x)}$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"),
    correct:"5",
    explanation:"$f(x)=x+\\dfrac{x^2}{2}-\\dfrac{x^4}{24}+\\cdots$, $f(0)=0$이므로 $g(0)=0$.\n역함수 멱급수: $g(y)=y-\\dfrac{y^2}{2}+\\dfrac{y^3}{2}+\\cdots$.\n$\\{g(x)\\}^2=x^2+\\cdots$, $x-g(x)=\\dfrac{x^2}{2}-\\dfrac{x^3}{2}+\\cdots$.\n극한 $=\\dfrac{x^2}{x^2/2}=2$.",
  },
  {n:2, subject:"미분학", unit:"극한과 연속", concept:"연속 결정 극한 비",
    difficulty:"medium",
    question:"함수 $f(x)=\\begin{cases}(1-x)^{1/x}&(x\\ne 0)\\\\a&(x=0)\\end{cases}$가 구간 $(-\\infty,1]$에서 연속이고 $\\displaystyle\\lim_{x\\to-\\infty}f(x)=b$라고 할 때, $\\dfrac{b}{a}$의 값은?",
    options:opts5("$0$","$\\dfrac{1}{e}$","$1$","$e$","$\\infty$"),
    correct:"4",
    explanation:"$\\!\\lim_{x\\to 0}(1-x)^{1/x}$: $\\ln L=\\!\\lim\\dfrac{\\ln(1-x)}{x}=-1$이므로 $L=e^{-1}=\\dfrac{1}{e}=a$.\n$\\!\\lim_{x\\to-\\infty}(1-x)^{1/x}$: $\\ln=\\dfrac{\\ln(1-x)}{x}\\to 0$ ($\\ln/x\\to 0$). $b=1$.\n$\\dfrac{b}{a}=e$.",
  },
  {n:3, subject:"적분학", unit:"급수의 수렴/발산", concept:"수렴판정 종합",
    difficulty:"medium",
    question:"다음 \\<보기\\>의 급수 중에서 수렴하는 것만을 있는 대로 고른 것은?\n(ㄱ) $\\displaystyle\\sum_{n=2}^{\\infty}\\!\\left(\\dfrac{n}{n-1}\\right)^{n^2}$\n(ㄴ) $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{1}{n}\\sin\\dfrac{1}{\\sqrt{n}}$\n(ㄷ) $\\displaystyle\\sum_{n=1}^{\\infty}(-1)^n\\dfrac{\\ln n}{n}$",
    options:opts5("ㄱ","ㄷ","ㄱ, ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"4",
    explanation:"(ㄱ) $\\!\\left(\\dfrac{n}{n-1}\\right)^{n^2}=\\!\\left[\\!\\left(\\dfrac{n}{n-1}\\right)^n\\right]^n\\to e^n\\to\\infty$. **발산**.\n(ㄴ) $\\dfrac{1}{n}\\sin\\dfrac{1}{\\sqrt{n}}\\sim\\dfrac{1}{n^{3/2}}$. **수렴** ($p>1$).\n(ㄷ) 교대급수, $\\dfrac{\\ln n}{n}\\downarrow 0$ ($n\\ge 3$). 조건부 **수렴**.\n따라서 (ㄴ), (ㄷ).",
  },
  {n:4, subject:"적분학", unit:"급수의 수렴/발산", concept:"멱급수 수렴구간",
    difficulty:"medium",
    question:"멱급수 $\\displaystyle\\sum_{n=1}^{\\infty}\\dfrac{(-1)^n}{3^n\\sqrt{3n-1}}(x-2)^n$의 수렴구간은?",
    options:opts5("$(-1,5)$","$(-1,5]$","$(-\\infty,\\infty)$","$\\!\\left(\\dfrac{5}{3},\\dfrac{7}{3}\\right)$","$\\!\\left[\\dfrac{5}{3},\\dfrac{7}{3}\\right]$"),
    correct:"2",
    explanation:"수렴반경 $R=3$ (비율판정), 중심 $x=2$.\n경계 $x=5$: $\\!\\sum\\dfrac{(-1)^n}{\\sqrt{3n-1}}$ 교대급수 수렴.\n경계 $x=-1$: $\\!\\sum\\dfrac{1}{\\sqrt{3n-1}}\\sim\\dfrac{1}{n^{1/2}}$ 발산.\n수렴구간 $(-1,5]$.",
  },
  {n:5, subject:"다변수함수", unit:"편도함수", concept:"편도함수 정의 직접 계산",
    difficulty:"medium",
    question:"함수 $f(x,y)=\\begin{cases}x^2+y-xe^y&(x\\ne 0)\\\\0&(x=0)\\end{cases}$에 대하여 $\\nabla f(0,0)=(\\alpha,\\beta)$라고 할 때, $\\alpha+\\beta$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"),
    correct:"2",
    explanation:"$f_x(0,0)=\\!\\lim_{h\\to 0}\\dfrac{f(h,0)-f(0,0)}{h}=\\!\\lim\\dfrac{h^2+0-h\\cdot 1}{h}=\\!\\lim(h-1)=-1$.\n$f_y(0,0)=\\!\\lim_{k\\to 0}\\dfrac{f(0,k)-f(0,0)}{k}=\\!\\lim\\dfrac{0-0}{k}=0$.\n$\\alpha+\\beta=-1+0=-1$.",
  },
  {n:6, subject:"다변수함수", unit:"극한과 연속", concept:"이변수 극한",
    difficulty:"medium",
    question:"다음 \\<보기\\>에서 옳은 것만을 있는 대로 고른 것은?\n(ㄱ) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy}{\\sqrt{x^2+y^2}}=0$\n(ㄴ) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{xy^2}{x^2+y^4}=0$\n(ㄷ) $\\displaystyle\\lim_{(x,y)\\to(0,0)}\\dfrac{\\sin(xy)}{|x|+|y|}=0$",
    options:opts5("ㄱ","ㄷ","ㄱ, ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"),
    correct:"3",
    explanation:"(ㄱ) 극좌표 $r\\cos\\theta\\sin\\theta\\to 0$. **참**.\n(ㄴ) 경로 $x=y^2$에서 $\\dfrac{y^4}{2y^4}=\\dfrac{1}{2}\\ne 0$. **거짓**.\n(ㄷ) $\\dfrac{|xy|}{|x|+|y|}\\le\\dfrac{|x|+|y|}{4}\\to 0$ (AM-GM). $\\sin(xy)\\sim xy$. **참**.\n따라서 (ㄱ), (ㄷ).",
  },
  {n:7, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"타원체 접평면",
    difficulty:"easyMedium",
    question:"곡면 $x^2+4y^2+4z^2=9$ 위의 점 $(1,-1,1)$에서의 접평면의 방정식을 $ax+by+cz=1$이라고 할 때, $a+b+c$의 값은?",
    options:opts5("$-\\dfrac{1}{9}$","$0$","$\\dfrac{1}{9}$","$-1$","$1$"),
    correct:"3",
    explanation:"$\\nabla F=(2x,8y,8z)$, $(1,-1,1)$에서 $(2,-8,8)$.\n접평면: $2(x-1)-8(y+1)+8(z-1)=0\\Rightarrow 2x-8y+8z=18$.\n$\\dfrac{1}{9}x-\\dfrac{4}{9}y+\\dfrac{4}{9}z=1$. $a+b+c=\\dfrac{1-4+4}{9}=\\dfrac{1}{9}$.",
  },
  {n:8, subject:"다변수함수", unit:"편도함수의 응용", concept:"제약영역 최대최소",
    difficulty:"hard",
    question:"영역 $D=\\{(x,y)\\in\\mathbb{R}^2\\,|\\,x\\ge 0,\\,x^2+y^2\\le 4\\}$에서 정의된 함수 $f(x,y)=x^2-y^2-2x$의 최댓값과 최솟값의 합은?",
    options:opts5("$-\\dfrac{9}{2}$","$-4$","$-1$","$0$","$\\dfrac{1}{2}$"),
    correct:"1",
    explanation:"내부 임계점: $(1,0)$, $f(1,0)=-1$.\n경계 $x=0,\\,|y|\\le 2$: $f=-y^2$, max $0$, min $-4$.\n경계 $x^2+y^2=4$: $f=2x^2-2x-4$, $x\\in[0,2]$, 최소 $f(1/2)=-\\dfrac{9}{2}$, 최대 $f(0)=-4$ 또는 $f(2)=0$.\n전체 max $=0$, min $=-\\dfrac{9}{2}$. 합 $=-\\dfrac{9}{2}$.",
  },
  {n:9, subject:"미분학", unit:"미분방정식", concept:"복소근 ODE 초깃값",
    difficulty:"medium",
    question:"$y(x)$가 초깃값 문제 $y''+2y'+\\!\\left(\\dfrac{\\pi^2}{4}+1\\right)y=0,\\,y(1)=1,\\,y'(1)=-1$의 해일 때, $y(-1)$의 값은?",
    options:opts5("$0$","$e$","$-e$","$e^2$","$-e^2$"),
    correct:"5",
    explanation:"특성방정식 $r^2+2r+\\dfrac{\\pi^2}{4}+1=0$, $r=-1\\pm i\\dfrac{\\pi}{2}$.\n$y=e^{-x}\\!\\left[c_1\\cos\\dfrac{\\pi x}{2}+c_2\\sin\\dfrac{\\pi x}{2}\\right]$.\n$y(1)=\\dfrac{c_2}{e}=1\\Rightarrow c_2=e$. $y'(1)=-\\dfrac{c_2+c_1\\pi/2}{e}=-1\\Rightarrow c_1=0$.\n$y(x)=e^{1-x}\\sin\\dfrac{\\pi x}{2}$. $y(-1)=e^2\\cdot(-1)=-e^2$.",
  },
  {n:10, subject:"선형대수", unit:"고유치와 대각화", concept:"고유벡터 비",
    difficulty:"medium",
    question:"벡터 $(x,y,z)$가 행렬 $A=\\begin{bmatrix}1&0&0\\\\2&3&-1\\\\0&2&0\\end{bmatrix}$의 가장 큰 고윳값에 대응하는 고유벡터라고 할 때, $\\dfrac{y}{z}$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"),
    correct:"4",
    explanation:"특성다항식 $-(\\lambda-1)^2(\\lambda-2)$. 고윳값 $1,1,2$. 가장 큰 $\\lambda=2$.\n$(A-2I)v=0$: $-x=0,\\,2x+y-z=0,\\,2y-2z=0$. $x=0,\\,y=z$.\n$\\dfrac{y}{z}=1$.",
  },
  {n:11, subject:"적분학", unit:"이상적분", concept:"치환 이상적분",
    difficulty:"medium",
    question:"이상적분 $\\displaystyle\\int_0^{\\infty}\\dfrac{1}{\\sqrt{x}(1+2x)}\\,dx$의 값은?",
    options:opts5("$1$","$\\dfrac{\\pi}{2}$","$\\dfrac{\\pi}{\\sqrt{2}}$","$\\pi$","$\\infty$"),
    correct:"3",
    explanation:"$u=\\sqrt{x}$ 치환, $dx=2u\\,du$:\n$\\!\\int_0^{\\infty}\\dfrac{2}{1+2u^2}\\,du$. $v=u\\sqrt{2}$ 치환: $=\\!\\int_0^{\\infty}\\dfrac{\\sqrt{2}}{1+v^2}\\,dv=\\sqrt{2}\\cdot\\dfrac{\\pi}{2}=\\dfrac{\\pi}{\\sqrt{2}}$.",
  },
  {n:12, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"사면체 부피 최대",
    difficulty:"medium",
    question:"$O(0,0,0),\\,A(x,1,0),\\,B(0,x,3),\\,C(-1,1,x)$를 꼭짓점으로 갖는 사면체의 부피의 최댓값은? (단, $-2\\le x\\le 2$)",
    options:opts5("$\\dfrac{1}{6}$","$\\dfrac{1}{3}$","$\\dfrac{5}{6}$","$1$","$\\dfrac{5}{3}$"),
    correct:"3",
    explanation:"$V=\\dfrac{1}{6}|\\det(\\vec{OA},\\vec{OB},\\vec{OC})|=\\dfrac{1}{6}|x^3-3x-3|$.\n$g(x)=x^3-3x-3$. $g(-2)=-5,\\,g(-1)=-1,\\,g(1)=-5,\\,g(2)=-1$.\n최대 $|g|=5$이므로 $V_{\\max}=\\dfrac{5}{6}$.",
  },
  {n:13, subject:"다변수함수", unit:"중적분", concept:"치환적분 이중적분",
    difficulty:"hard",
    question:"직선 $x=1,\\,x=2$와 곡선 $y=x^2,\\,y=2x^2$으로 둘러싸인 영역 $R$에 대하여, $\\displaystyle\\iint_R\\dfrac{x^4}{y^3}\\exp\\!\\left(\\dfrac{x^2}{y}\\right)dx\\,dy$의 값은? (단, $\\exp(x)=e^x$)",
    options:opts5("$\\dfrac{1}{2}e^{1/2}$","$e^2$","$e-\\dfrac{1}{2}e^{1/2}$","$e-e^{1/2}$","$\\dfrac{3}{2}(e-e^{1/2})$"),
    correct:"1",
    explanation:"$y$ 적분 먼저, 치환 $u=\\dfrac{x^2}{y}$: $dy=-\\dfrac{x^2}{u^2}\\,du$, $y$ 경계 $u\\in\\!\\left[\\dfrac{1}{2},1\\right]$.\n$\\dfrac{x^4}{y^3}\\exp\\!\\left(\\dfrac{x^2}{y}\\right)dy=-u\\,e^u\\,du$ (정리).\n$\\!\\int_{1/2}^1 u e^u\\,du=[ue^u-e^u]_{1/2}^1=0-\\!\\left(-\\dfrac{1}{2}e^{1/2}\\right)=\\dfrac{1}{2}e^{1/2}$.\n$x$ 무관이므로 $\\!\\int_1^2\\dfrac{1}{2}e^{1/2}\\,dx=\\dfrac{1}{2}e^{1/2}$.",
  },
  {n:14, subject:"다변수함수", unit:"선적분과 면적분", concept:"원점 둘러싼 회전 벡터장",
    difficulty:"hard",
    question:"곡선 $C$가 $P(1,0)$에서 $Q(0,1)$까지의 선분, $Q$에서 $R(-1,0)$까지의 선분, $R$에서 $P$까지의 선분으로 이루어진 곡선일 때, $C$ 위에서 벡터 $\\vec{F}(x,y)=-\\dfrac{y}{x^2+y^2}\\vec{i}+\\dfrac{x}{x^2+y^2}\\vec{j}$의 선적분의 값은?",
    options:opts5("$-\\pi$","$-\\dfrac{\\pi}{2}$","$0$","$\\dfrac{\\pi}{2}$","$\\pi$"),
    correct:"5",
    explanation:"$\\vec{F}$는 원점 회전벡터장. 폐곡선이 원점을 한 번 반시계방향으로 둘러싸면 $\\!\\oint=2\\pi$. 그러나 $R\\to P$ 변이 $x$축이고 원점을 통과 — 그 변에서 적분기는 $\\dfrac{x}{x^2}\\cdot 0=0$.\n$P\\to Q,\\,Q\\to R$ 각 변 적분 $\\dfrac{\\pi}{2}$ ($\\arctan$ 식으로 계산).\n총합 $=\\dfrac{\\pi}{2}+\\dfrac{\\pi}{2}+0=\\pi$.",
  },
  {n:15, subject:"미분학", unit:"미분방정식", concept:"치환에 의한 ODE",
    difficulty:"medium",
    question:"$y(x)$가 초깃값 문제 $y'=(x-y+1)^2,\\,y(0)=1$의 해일 때, $y(1)$의 값은?",
    options:opts5("$\\dfrac{e^2}{e^2+1}$","$\\dfrac{e^2+3}{e^2+1}$","$\\dfrac{e^2-1}{e^2+1}$","$\\dfrac{e^2+1}{e^2-1}$","$\\dfrac{e^2+1}{e^2}$"),
    correct:"2",
    explanation:"$u=x-y+1$ 치환: $u'=1-y'=1-u^2$. 분리: $\\dfrac{du}{1-u^2}=dx$.\n$\\dfrac{1}{2}\\ln\\!\\left|\\dfrac{1+u}{1-u}\\right|=x+C$. $u(0)=0\\Rightarrow C=0$.\n$u=\\dfrac{e^{2x}-1}{e^{2x}+1}$.\n$y=x-u+1$. $y(1)=2-\\dfrac{e^2-1}{e^2+1}=\\dfrac{e^2+3}{e^2+1}$.",
  },
  {n:16, subject:"선형대수", unit:"행렬", concept:"역행렬 성분 (cofactor)",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}1&2&0&-2\\\\0&4&3&0\\\\0&3&0&0\\\\-2&1&-1&3\\end{bmatrix}$의 역행렬 $A^{-1}$의 $(4,1)$ 성분은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"),
    correct:"1",
    explanation:"$(A^{-1})_{4,1}=\\dfrac{(-1)^{1+4}\\det(M_{1,4})}{\\det A}$ ($M_{1,4}$: 1행 4열 제거).\n$M_{1,4}=\\det\\!\\begin{pmatrix}0&4&3\\\\0&3&0\\\\-2&1&-1\\end{pmatrix}=18$. 부호 $(-1)^5=-1$.\n$\\det A=9$ (1열 전개).\n$(A^{-1})_{4,1}=-\\dfrac{18}{9}=-2$.",
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
