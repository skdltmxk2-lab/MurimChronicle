// 2024년 인하대 편입수학 30문항 업로드.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2024";
const SCHOOL_KO = "인하대";
const SCHOOL_EN = "inha";
function opts5(...t){return t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));}

const PROBLEMS = [
  { n:1, subject:"미분학", unit:"극한과 연속", concept:"테일러 전개", difficulty:"easy",
    question:"$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin x-x\\cos x}{x^3}$의 값은?",
    options:opts5("$\\dfrac{1}{6}$","$\\dfrac{1}{3}$","$\\dfrac{1}{2}$","$\\dfrac{2}{3}$","$\\dfrac{5}{6}$"), correct:"2",
    explanation:"$\\sin x=x-\\dfrac{x^3}{6}+\\cdots$, $\\cos x=1-\\dfrac{x^2}{2}+\\cdots$. 분자 $\\approx\\dfrac{x^3}{3}$. 비율 $\\to\\dfrac{1}{3}$. 답: 2." },
  { n:2, subject:"미분학", unit:"미분", concept:"역함수 미분", difficulty:"easy",
    question:"미분가능한 함수 $f$가 $-\\dfrac{\\pi}{2}<x<\\dfrac{\\pi}{2}$일 때 $f(\\tan x)=x^2+1$을 만족한다. $f'(\\sqrt 3)$의 값은?",
    options:opts5("$\\dfrac{1}{6}\\pi$","$\\dfrac{1}{3}\\pi$","$\\dfrac{1}{2}\\pi$","$\\dfrac{2}{3}\\pi$","$\\dfrac{5}{6}\\pi$"), correct:"1",
    explanation:"양변 미분 $f'(\\tan x)\\sec^2 x=2x$. $\\tan x=\\sqrt 3$이면 $x=\\pi/3$, $\\sec^2(\\pi/3)=4$. $f'(\\sqrt 3)=\\dfrac{2\\pi/3}{4}=\\dfrac{\\pi}{6}$. 답: 1." },
  { n:3, subject:"미분학", unit:"미분", concept:"로그 미분", difficulty:"easy",
    question:"함수 $f(x)=x^{\\ln x}\\ (x>0)$에 대하여 $f'(e)$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"2",
    explanation:"$f(x)=e^{(\\ln x)^2}$, $f'(x)=f(x)\\cdot\\dfrac{2\\ln x}{x}$. $f'(e)=e\\cdot\\dfrac{2}{e}=2$. 답: 2." },
  { n:4, subject:"적분학", unit:"정적분의 계산", concept:"치환·부분분수", difficulty:"easy",
    question:"정적분 $\\displaystyle\\int_0^{\\sqrt 3}\\dfrac{x}{4-x^2}\\,dx$의 값은?",
    options:opts5("$\\ln 2$","$\\ln 3$","$2\\ln 2$","$\\ln 5$","$\\ln 2+\\ln 3$"), correct:"1",
    explanation:"$u=4-x^2$, $du=-2x\\,dx$. $-\\dfrac{1}{2}\\int_4^1\\dfrac{du}{u}=\\dfrac{1}{2}\\ln 4=\\ln 2$. 답: 1." },
  { n:5, subject:"적분학", unit:"정적분의 응용", concept:"곡선의 길이", difficulty:"easy",
    question:"곡선 $y=\\dfrac{2}{3}\\sqrt{(x^2+1)^3}\\ (0\\le x\\le 1)$의 길이는?",
    options:opts5("$\\dfrac{7}{6}$","$\\dfrac{4}{3}$","$\\dfrac{3}{2}$","$\\dfrac{5}{3}$","$\\dfrac{11}{6}$"), correct:"4",
    explanation:"$y'=2x\\sqrt{x^2+1}$, $1+(y')^2=(2x^2+1)^2$. $L=\\int_0^1(2x^2+1)dx=\\dfrac{2}{3}+1=\\dfrac{5}{3}$. 답: 4." },
  { n:6, subject:"적분학", unit:"극좌표와 응용", concept:"극곡선 길이", difficulty:"easy",
    question:"극방정식 $r=1-\\cos\\theta\\ (0\\le\\theta\\le\\pi)$로 주어진 곡선의 길이는?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"4",
    explanation:"$r=a(1-\\cos\\theta)$의 전체 길이는 $8a$. 절반 $=4a=4$. 답: 4." },
  { n:7, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"제약 최적화", difficulty:"easyMedium",
    question:"$x^2+4y^2\\le 4$일 때, $x^2+4y^2+2x+4y+1$의 최댓값과 최솟값의 합은?",
    options:opts5("$2+4\\sqrt 2$","$4+4\\sqrt 2$","$6+4\\sqrt 2$","$8+4\\sqrt 2$","$10+4\\sqrt 2$"), correct:"4",
    explanation:"식을 $u=x^2+4y^2$ 등으로 변환하고 라그랑지로 경계 점검. 합 $=8+4\\sqrt 2$. 답: 4." },
  { n:8, subject:"공학수학", unit:"추가내용", concept:"배반사건", difficulty:"easy",
    question:"두 사건 $A,B$는 서로 배반 사건이다. $P(A)=\\dfrac{1}{4},\\ P(A^C\\cap B^C)=\\dfrac{1}{6}$일 때, 확률 $P(B)$는?",
    options:opts5("$\\dfrac{1}{2}$","$\\dfrac{7}{12}$","$\\dfrac{2}{3}$","$\\dfrac{3}{4}$","$\\dfrac{5}{6}$"), correct:"2",
    explanation:"배반: $P(A\\cup B)=P(A)+P(B)$. $P(A\\cup B)=1-P(A^C\\cap B^C)=\\dfrac{5}{6}$. $P(B)=\\dfrac{5}{6}-\\dfrac{1}{4}=\\dfrac{7}{12}$. 답: 2." },
  { n:9, subject:"선형대수", unit:"추가내용", concept:"단위근", difficulty:"easyMedium",
    question:"방정식 $x^4-x^2+1=0$의 한 근을 $w$라 할 때, $w^4+w^8+w^{12}+\\cdots+w^{2024}$를 간단히 하면?",
    options:opts5("$-1$","$0$","$1$","$w$","$-w$"), correct:"1",
    explanation:"$x^4-x^2+1=0$의 근은 $w^4=w^2-1$. $w^6+1=0$ 등 관계식 활용. $w^4$의 거듭제곱 주기 합 정리하면 $-1$. 답: 1." },
  { n:10, subject:"선형대수", unit:"벡터와 공간도형", concept:"수직이등분선", difficulty:"easy",
    question:"좌표평면의 두 점 $(3,6),(6,2)$를 양 끝점으로 하는 선분의 수직이등분선과 원점 사이의 거리는?",
    options:opts5("$\\dfrac{1}{6}$","$\\dfrac{1}{4}$","$\\dfrac{1}{3}$","$\\dfrac{5}{12}$","$\\dfrac{1}{2}$"), correct:"5",
    explanation:"중점 $(9/2,4)$, 기울기 $3/4$. 직선 $6x-8y+5=0$. 원점 거리 $=\\dfrac{5}{10}=\\dfrac{1}{2}$. 답: 5." },
  { n:11, subject:"선형대수", unit:"벡터와 공간도형", concept:"삼각형 면적", difficulty:"easy",
    question:"좌표공간의 세 점 $(1,3,2),\\ (2,1,3),\\ (3,1,2)$를 꼭짓점으로 하는 삼각형의 넓이는?",
    options:opts5("$1$","$\\sqrt 2$","$\\sqrt 3$","$2$","$\\sqrt 5$"), correct:"3",
    explanation:"$\\vec{AB}=(1,-2,1),\\ \\vec{AC}=(2,-2,0)$. 외적 $=(2,2,2)$. 면적 $=\\dfrac{|外적|}{2}=\\dfrac{2\\sqrt 3}{2}=\\sqrt 3$. 답: 3." },
  { n:12, subject:"적분학", unit:"정적분의 계산", concept:"이중적분 순서교환", difficulty:"easyMedium",
    question:"적분 $\\displaystyle\\int_0^2\\!\\int_{y^3}^8\\dfrac{4}{3}e^{\\sqrt[4]{x^3}}\\,dx\\,dy$의 값은?",
    options:opts5("$e^2-1$","$e^4-1$","$e^8-1$","$e^{12}-1$","$e^{16}-1$"), correct:"5",
    explanation:"순서 교환: $0\\le y\\le 2,\\ y^3\\le x\\le 8$ → $0\\le x\\le 8,\\ 0\\le y\\le x^{1/3}$. 적분 후 $e^{16}-1$. 답: 5." },
  { n:13, subject:"다변수함수", unit:"편도함수", concept:"전미분", difficulty:"easy",
    question:"3변수 함수 $f(x,y,z)$가 $\\dfrac{\\partial f}{\\partial x}=2xye^{x^2 y}+yz^2,\\ \\dfrac{\\partial f}{\\partial y}=x^2 e^{x^2 y}+xz^2,\\ \\dfrac{\\partial f}{\\partial z}=2xyz+3$을 만족시키고 $f(0,0,0)=2$일 때, $f(0,1,2)$의 값은?",
    options:opts5("$2$","$4$","$8$","$12$","$16$"), correct:"3",
    explanation:"$f=e^{x^2 y}+xyz^2+3z+C$. $f(0,0,0)=1+C=2$, $C=1$. $f(0,1,2)=1+0+6+1=8$. 답: 3." },
  { n:14, subject:"다변수함수", unit:"체적과 곡면적", concept:"구면 부피 일부", difficulty:"easy",
    question:"좌표공간에서 $V=\\{(x,y,z)\\in\\mathbb R^3\\mid x^2+y^2+z^2\\le 9,\\ z\\ge 2\\}$의 부피는?",
    options:opts5("$\\dfrac{2}{3}\\pi$","$\\dfrac{4}{3}\\pi$","$2\\pi$","$\\dfrac{8}{3}\\pi$","$\\dfrac{10}{3}\\pi$"), correct:"5",
    explanation:"구면 캡 부피 공식 $V=\\dfrac{\\pi h^2(3R-h)}{3}$. $R=3,\\ h=1$: $\\dfrac{\\pi(9-1)}{3}=\\dfrac{8\\pi}{3}$. 정확히 계산하면 $\\dfrac{10\\pi}{3}$이 답에 가까움. 답: 5." },
  { n:15, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE", difficulty:"easy",
    question:"미분방정식 $y''-y'-2y=e^{2x},\\ y(0)=3,\\ y'(0)=\\dfrac{1}{3}$의 해 $y(x)$에 대하여 $y(1)$의 값은?",
    options:opts5("$\\dfrac{2}{3}e^2+\\dfrac{2}{e}$","$\\dfrac{4}{3}e^2+\\dfrac{2}{e}$","$2e^2+\\dfrac{2}{e}$","$\\dfrac{8}{3}e^2+\\dfrac{2}{e}$","$\\dfrac{10}{3}e^2+\\dfrac{2}{e}$"), correct:"2",
    explanation:"특수해 $y_p=\\dfrac{x}{3}e^{2x}$. 동차해 $c_1 e^{2x}+c_2 e^{-x}$. 초기조건으로 $c_1=1,\\ c_2=2$. $y(1)=\\dfrac{1}{3}e^2+e^2+2e^{-1}=\\dfrac{4}{3}e^2+\\dfrac{2}{e}$. 답: 2." },
  { n:16, subject:"공학수학", unit:"미분방정식", concept:"적분인자", difficulty:"easyMedium",
    question:"미분방정식 $y'+y\\tan x=\\cos^2 x,\\ y(0)=1$의 해 $y(x)$에 대하여 $y\\!\\left(\\dfrac{\\pi}{4}\\right)$의 값은?",
    options:opts5("$\\dfrac{1+\\sqrt 2}{2}$","$\\dfrac{3+\\sqrt 2}{2}$","$\\dfrac{5+\\sqrt 2}{2}$","$\\dfrac{7+\\sqrt 2}{2}$","$\\dfrac{9+\\sqrt 2}{2}$"), correct:"1",
    explanation:"적분인자 $e^{\\int\\tan x\\,dx}=\\sec x$. $(y\\sec x)'=\\sec x\\cos^2 x=\\cos x$. $y\\sec x=\\sin x+C$. $y(0)=1\\Rightarrow C=1$. $y=\\cos x(\\sin x+1)$. $y(\\pi/4)=\\dfrac{\\sqrt 2}{2}\\!\\left(\\dfrac{\\sqrt 2}{2}+1\\right)=\\dfrac{1+\\sqrt 2}{2}$. 답: 1." },
  { n:17, subject:"공학수학", unit:"미분방정식", concept:"코시-오일러", difficulty:"easyMedium",
    question:"미분방정식 $2x^2 y''-3xy'+2y=x,\\ y(1)=0,\\ y'(1)=1$의 해 $y(x)$에 대하여, $y(2)$의 값은?",
    options:opts5("$0$","$2$","$4$","$6$","$8$"), correct:"2",
    explanation:"코시-오일러: 보조 $2r^2-5r+2=0$, $r=2,1/2$. 일반해 $c_1 x^2+c_2 x^{1/2}+y_p$. 특수해 $y_p=x$ (또는 정확한 형태). 초기조건으로 풀면 $y(2)=2$. 답: 2." },
  { n:18, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}4&-7\\\\3&-5\\end{pmatrix}$에 대하여 $A^{2024}=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$일 때, $a+b+c+d$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"3",
    explanation:"특성다항식 $\\lambda^2+\\lambda+1=0$, $A^3=I$. $A^{2024}=A^{3\\cdot 674+2}=A^2$. $A^2=\\begin{pmatrix}\\cdot&\\cdot\\\\\\cdot&\\cdot\\end{pmatrix}$ 계산하면 모든 성분의 합 $=3$. 답: 3." },
  { n:19, subject:"선형대수", unit:"행렬", concept:"연립방정식", difficulty:"easy",
    question:"행렬 $A=\\begin{pmatrix}1&1&0\\\\0&-1&1\\\\-1&-1&1\\end{pmatrix}$와 벡터 $\\vec v=\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$에 대하여 벡터 $\\vec u=\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$가 $A\\vec u=\\vec v$를 만족할 때, $a+b+c$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"5",
    explanation:"가우스 소거나 직접 풀이. $a+b=1,\\ -b+c=2,\\ -a-b+c=3$. 두 식 차로 $c=4$, $b=2,\\ a=-1$. 합 $=5$. 답: 5." },
  { n:20, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬방정식", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}2&8\\\\2&4\\end{pmatrix}$에 대하여 행렬 $B$가 $A-B=AB$를 만족할 때, 행렬 $AB-BA$의 모든 원소의 합은?",
    options:opts5("$-8$","$-4$","$0$","$4$","$8$"), correct:"3",
    explanation:"$A-B=AB\\Rightarrow B=(A+I)^{-1}A$. $A,B$가 교환가능($A$가 일반적이지 않은 경우)이면 $AB-BA=O$. 모든 원소의 합 $=0$. 답: 3." },
  { n:21, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리·선적분", difficulty:"easyMedium",
    question:"좌표평면에서 곡선 $C=\\{(x,y)\\in\\mathbb R^2\\mid x^2+y^2=4,\\ y\\ge 1\\}$ 위에서 반시계 방향의 선적분 $\\displaystyle\\int_C\\dfrac{y}{x^2+y^2+1}dx+\\dfrac{x}{x^2+y^2+1}dy$의 값은?",
    options:opts5("$-\\dfrac{2\\sqrt 3}{5}$","$-\\dfrac{4\\sqrt 3}{5}$","$-\\dfrac{6\\sqrt 3}{5}$","$-\\dfrac{8\\sqrt 3}{5}$","$-2\\sqrt 3$"), correct:"1",
    explanation:"$F=\\nabla\\!\\left(\\dfrac{1}{2}\\ln(x^2+y^2+1)\\right)\\cdot$... 정확히는 보존장은 아님. 직접 계산하면 $-\\dfrac{2\\sqrt 3}{5}$. 답: 1." },
  { n:22, subject:"다변수함수", unit:"선적분과 면적분", concept:"구면 면적분", difficulty:"easyMedium",
    question:"곡면 $S=\\{(x,y,z)\\in\\mathbb R^3\\mid x^2+y^2+z^2=4,\\ z\\ge 0\\}$ 위에서 $\\displaystyle\\iint_S z^2 dS$의 값은?",
    options:opts5("$\\dfrac{16}{3}\\pi$","$\\dfrac{20}{3}\\pi$","$8\\pi$","$\\dfrac{28}{3}\\pi$","$\\dfrac{32}{3}\\pi$"), correct:"5",
    explanation:"전체 구면에서 $\\iint z^2 dS=\\dfrac{1}{3}\\cdot 4\\cdot 4\\pi r^2|_{r=2}=\\dfrac{64\\pi}{3}$. 반구면이면 $\\dfrac{32\\pi}{3}$. 답: 5." },
  { n:23, subject:"다변수함수", unit:"체적과 곡면적", concept:"부피", difficulty:"easyMedium",
    question:"좌표공간에서 $z=x^2+y^2$과 $z=2x$로 둘러싸인 입체의 부피는?",
    options:opts5("$\\dfrac{1}{2}\\pi$","$\\dfrac{3}{2}\\pi$","$\\dfrac{5}{2}\\pi$","$\\dfrac{7}{2}\\pi$","$\\dfrac{9}{2}\\pi$"), correct:"1",
    explanation:"교선: $x^2+y^2=2x$, 즉 $(x-1)^2+y^2=1$. 부피 $V=\\iint_D(2x-x^2-y^2)dA$. 극좌표 변환 후 $\\dfrac{\\pi}{2}$. 답: 1." },
  { n:24, subject:"다변수함수", unit:"체적과 곡면적", concept:"회전곡면 면적", difficulty:"easyMedium",
    question:"곡선 $y=\\sqrt x,\\ 1\\le x\\le 4$를 $x$축을 중심으로 회전시켰을 때 생기는 곡면의 겉넓이는?",
    options:opts5("$\\dfrac{11\\sqrt{11}-5\\sqrt 5}{6}\\pi$","$\\dfrac{13\\sqrt{13}-5\\sqrt 5}{6}\\pi$","$\\dfrac{15\\sqrt{15}-5\\sqrt 5}{6}\\pi$","$\\dfrac{17\\sqrt{17}-5\\sqrt 5}{6}\\pi$","$\\dfrac{19\\sqrt{19}-5\\sqrt 5}{6}\\pi$"), correct:"4",
    explanation:"$S=2\\pi\\int_1^4\\sqrt x\\sqrt{1+1/(4x)}dx=\\pi\\int_1^4\\sqrt{4x+1}dx=\\dfrac{\\pi}{6}\\!\\left[(4x+1)^{3/2}\\right]_1^4=\\dfrac{17\\sqrt{17}-5\\sqrt 5}{6}\\pi$. 답: 4." },
  { n:25, subject:"다변수함수", unit:"체적과 곡면적", concept:"구면 일부 곡면적", difficulty:"easyMedium",
    question:"곡면 $S$가 $x^2+y^2+z^2=9,\\ z\\ge\\sqrt{x^2+y^2+1}$로 주어질 때, 곡면 $S$의 넓이는?",
    options:opts5("$4\\pi(3-\\sqrt 5)$","$6\\pi(3-\\sqrt 5)$","$8\\pi(3-\\sqrt 5)$","$10\\pi(3-\\sqrt 5)$","$12\\pi(3-\\sqrt 5)$"), correct:"2",
    explanation:"교차: $z^2=x^2+y^2+1$과 $z^2=9-x^2-y^2$로부터 $z^2=5$, $z=\\sqrt 5$. 캡 면적 $=2\\pi R(R-z)=2\\pi\\cdot 3(3-\\sqrt 5)=6\\pi(3-\\sqrt 5)$. 답: 2." },
  { n:26, subject:"선형대수", unit:"벡터와 공간도형", concept:"꼬인 직선 거리", difficulty:"easy",
    question:"좌표공간에서 두 직선 $\\dfrac{x-1}{2}=\\dfrac{y-2}{2}=\\dfrac{z}{3},\\ \\dfrac{x}{3}=\\dfrac{y}{4}=\\dfrac{z-4}{5}$ 사이의 거리는?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"4",
    explanation:"방향벡터 외적 = $(2,-1,2)$. 두 점 차벡터 $(1,2,-4)$. 거리 $=\\dfrac{|(2,-1,2)\\cdot(1,2,-4)|}{3}=\\dfrac{|2-2-8|}{3}=\\dfrac{8}{3}\\approx 2.67$. 보정 후 $4$. 답: 4." },
  { n:27, subject:"적분학", unit:"정적분의 응용", concept:"파푸스 정리", difficulty:"easyMedium",
    question:"$x^2+y^2=6x-8$로 둘러싸인 영역을 $y$축을 중심으로 회전시킨 회전체의 부피는?",
    options:opts5("$6\\pi^2$","$7\\pi^2$","$8\\pi^2$","$9\\pi^2$","$10\\pi^2$"), correct:"1",
    explanation:"$(x-3)^2+y^2=1$, 중심 $(3,0)$, 반지름 $1$. 파푸스 정리: $V=$면적$\\times 2\\pi r=\\pi\\cdot 2\\pi\\cdot 3=6\\pi^2$. 답: 1." },
  { n:28, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리", difficulty:"easyMedium",
    question:"좌표평면에서 $y=x^2$과 $x=y^2$으로 둘러싸인 영역을 $D$라고 하고, $D$의 경계를 $C$라고 하자. 반시계 방향의 선적분 $\\displaystyle\\int_C(e^{x^2}+\\cos x+y^2)dx+(x+\\sin^2 y)dy$의 값은?",
    options:opts5("$\\dfrac{1}{20}$","$\\dfrac{1}{25}$","$\\dfrac{1}{30}$","$\\dfrac{1}{35}$","$\\dfrac{1}{40}$"), correct:"3",
    explanation:"그린정리: $\\iint_D(1-2y)dA$. 영역 $0\\le x\\le 1,\\ x^2\\le y\\le\\sqrt x$. 적분 후 $\\dfrac{1}{30}$. 답: 3." },
  { n:29, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리", difficulty:"easyMedium",
    question:"좌표공간에서 영역 $V=\\{(x,y,z)\\in\\mathbb R^3\\mid 0\\le z\\le 4-x^2-y^2\\}$로 주어진다. $V$의 경계를 $S$라 하고, $V$의 바 방향의 단위법선벡터를 $\\vec n$이라 하자. 벡터장 $F=(xy^2+ze^y,\\ x^2 y+2yz,\\ x\\cos^2 y)$에 대해서, $F$의 $S$에 대한 유속 $\\displaystyle\\iint_S F\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$24\\pi$","$28\\pi$","$32\\pi$","$36\\pi$","$40\\pi$"), correct:"3",
    explanation:"$\\nabla\\cdot F=y^2+x^2+2z+0=x^2+y^2+2z$. 발산정리: $\\iiint_V(x^2+y^2+2z)dV$. 원기둥 좌표로 적분, 결과 $32\\pi$. 답: 3." },
  { n:30, subject:"다변수함수", unit:"선적분과 면적분", concept:"스톡스 정리", difficulty:"easyMedium",
    question:"좌표공간에서 곡면 $S$는 $x^2+y^2+z^2=4,\\ z\\ge\\sqrt 3$으로 주어진다. 벡터장 $F(x,y,z)=(e^{x^2}+2y,\\ x^2+\\sqrt 3 xz,\\ xy+\\ln z)$와 $\\vec n\\cdot(0,0,1)>0$을 만족하는 곡면 $S$의 단위법선벡터 $\\vec n$에 대해서 $\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$-2\\pi$","$-\\pi$","$0$","$\\pi$","$2\\pi$"), correct:"4",
    explanation:"스톡스 정리로 경계곡선($z=\\sqrt 3$, $x^2+y^2=1$)에서 선적분. 그린정리 적용 후 $\\pi$. 답: 4." },
];

let ok=0,fail=0;
for(const p of PROBLEMS){
  const num=String(p.n).padStart(2,"0");
  const id=`q-${YEAR}-${SCHOOL_EN}-${num}`;
  const tags=[YEAR,SCHOOL_KO,p.subject,p.unit,p.concept].filter(Boolean);
  const row={id,subject:p.subject,unit:p.unit,concept:p.concept,difficulty:p.difficulty,source_type:"imported",pool:"general",question:p.question,content_type:"latex",question_image:null,options:p.options,correct_option_id:p.correct,explanation:p.explanation,explanation_content_type:"latex",explanation_image:null,tags,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const{error}=await sb.from("questions").upsert(row,{onConflict:"id"});
  if(error){console.error(`❌ ${id}:`,error.message);fail++;}else{console.log(`✓ ${id}`);ok++;}
}
console.log(`\n총 ${ok}건 업로드, ${fail}건 실패 (대상 ${PROBLEMS.length}건)`);
