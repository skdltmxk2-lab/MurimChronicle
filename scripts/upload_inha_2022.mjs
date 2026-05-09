// 2022년 인하대 편입수학 30문항 업로드 (난이도 한 단계 낮춤 적용).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2022";
const SCHOOL_KO = "인하대";
const SCHOOL_EN = "inha";
function opts5(...t){return t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));}

const PROBLEMS = [
  { n:1, subject:"미분학", unit:"극한과 연속", concept:"로피탈 정리", difficulty:"easy",
    question:"$\\displaystyle\\lim_{x\\to 0}\\dfrac{x^2}{\\sec x-1}$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"2",
    explanation:"$\\sec x-1\\approx\\dfrac{x^2}{2}$ (테일러)이므로 비율 $=2$. 답: 2." },
  { n:2, subject:"미분학", unit:"미분", concept:"음함수 미분", difficulty:"easy",
    question:"미분가능한 함수 $f$가 $-\\dfrac{\\pi}{2}<x<\\dfrac{\\pi}{2}$일 때 $f(\\tan x)=\\sin x$를 만족한다. $f'(1)$의 값은?",
    options:opts5("$\\dfrac{1}{4}$","$\\dfrac{\\sqrt 2}{4}$","$\\dfrac{1}{2}$","$\\dfrac{\\sqrt 2}{2}$","$1$"), correct:"2",
    explanation:"양변 미분 $f'(\\tan x)\\sec^2 x=\\cos x$. $\\tan x=1$이면 $x=\\pi/4$. $f'(1)\\cdot 2=\\dfrac{\\sqrt 2}{2}$, $f'(1)=\\dfrac{\\sqrt 2}{4}$. 답: 2." },
  { n:3, subject:"미분학", unit:"미분", concept:"로그 미분", difficulty:"easy",
    question:"함수 $f(x)=(x+1)^x$에 대하여 $f'(1)$의 값은?",
    options:opts5("$1$","$\\ln 2$","$2\\ln 2$","$1+\\ln 2$","$1+2\\ln 2$"), correct:"5",
    explanation:"$f(x)=e^{x\\ln(x+1)}$, $f'(x)=f(x)\\!\\left(\\ln(x+1)+\\dfrac{x}{x+1}\\right)$. $f'(1)=2\\!\\left(\\ln 2+\\dfrac{1}{2}\\right)=1+2\\ln 2$. 답: 5." },
  { n:4, subject:"적분학", unit:"정적분의 계산", concept:"부분분수", difficulty:"easy",
    question:"정적분 $\\displaystyle\\int_1^2\\dfrac{x^2-1}{x^3+x}\\,dx$의 값은?",
    options:opts5("$\\ln\\!\\left(\\dfrac{5}{4}\\right)$","$\\ln\\!\\left(\\dfrac{3}{2}\\right)$","$\\ln\\!\\left(\\dfrac{7}{4}\\right)$","$\\ln 2$","$\\ln\\!\\left(\\dfrac{9}{4}\\right)$"), correct:"1",
    explanation:"$\\dfrac{x^2-1}{x^3+x}=\\dfrac{x^2-1}{x(x^2+1)}=\\dfrac{-1}{x}+\\dfrac{2x}{x^2+1}$. 적분 $[-\\ln x+\\ln(x^2+1)]_1^2=\\ln\\dfrac{5}{4}$. 답: 1." },
  { n:5, subject:"적분학", unit:"정적분의 응용", concept:"곡선의 길이", difficulty:"easy",
    question:"곡선 $y=\\dfrac{x^4}{16}+\\dfrac{1}{2x^2}\\ (1\\le x\\le 2)$의 길이는?",
    options:opts5("$\\dfrac{5}{4}$","$\\dfrac{21}{16}$","$\\dfrac{11}{8}$","$\\dfrac{23}{16}$","$\\dfrac{3}{2}$"), correct:"2",
    explanation:"$y'=\\dfrac{x^3}{4}-\\dfrac{1}{x^3}$, $1+(y')^2=\\!\\left(\\dfrac{x^3}{4}+\\dfrac{1}{x^3}\\right)^2$. $L=\\int_1^2\\!\\left(\\dfrac{x^3}{4}+\\dfrac{1}{x^3}\\right)dx=\\dfrac{21}{16}$. 답: 2." },
  { n:6, subject:"적분학", unit:"극좌표와 응용", concept:"극곡선 면적", difficulty:"medium",
    question:"극방정식 $r=2+\\sin\\theta+\\cos\\theta$로 주어진 곡선으로 둘러싸인 영역의 넓이는?",
    options:opts5("$\\pi$","$2\\pi$","$3\\pi$","$4\\pi$","$5\\pi$"), correct:"5",
    explanation:"합성하면 $r=2+\\sqrt 2\\cos(\\theta-\\pi/4)$. $r=2+\\sqrt 2\\cos\\theta$의 면적과 같음. $\\dfrac{1}{2}\\int_0^{2\\pi}(2+\\sqrt 2\\cos\\theta)^2 d\\theta=5\\pi$. 답: 5." },
  { n:7, subject:"적분학", unit:"특이적분", concept:"감마함수", difficulty:"easy",
    question:"적분 $\\displaystyle\\int_0^{\\infty}\\dfrac{e^{-x}}{\\sqrt x}dx$의 값은?",
    options:opts5("$\\dfrac{1}{\\pi}$","$\\dfrac{1}{\\sqrt\\pi}$","$1$","$\\sqrt\\pi$","$\\pi$"), correct:"4",
    explanation:"감마함수 정의에서 $\\Gamma(1/2)=\\sqrt\\pi$. 답: 4." },
  { n:8, subject:"공학수학", unit:"추가내용", concept:"독립사건", difficulty:"easy",
    question:"두 사건 $A,B$는 독립이고 $P(A\\cap B^C)=\\dfrac{1}{2},\\ P(A\\cup B)=\\dfrac{3}{4}$를 만족할 때, 확률 $P(A)$는?",
    options:opts5("$\\dfrac{13}{24}$","$\\dfrac{7}{12}$","$\\dfrac{5}{8}$","$\\dfrac{2}{3}$","$\\dfrac{17}{24}$"), correct:"4",
    explanation:"$P(A)P(B^C)=\\dfrac{1}{2},\\ P(A)+P(B)-P(A)P(B)=\\dfrac{3}{4}$. 풀면 $P(A)=\\dfrac{2}{3}$. 답: 4." },
  { n:9, subject:"선형대수", unit:"추가내용", concept:"단위근", difficulty:"easyMedium",
    question:"방정식 $x^2-x+1=0$의 한 근을 $w$라 할 때, $1+w^2+w^4+\\cdots+w^{2022}$를 간단히 하면?",
    options:opts5("$-1$","$0$","$1$","$w$","$w^2$"), correct:"3",
    explanation:"$w^6=1$. $w^{2k}$ 수열의 주기 6이고 한 주기 합은 0. $2022$를 잘 묶어 정리하면 합 $=1$. 답: 3." },
  { n:10, subject:"선형대수", unit:"벡터와 공간도형", concept:"점과 직선의 거리", difficulty:"easy",
    question:"좌표평면의 두 점 $(-3,0),\\ (0,4)$을 지나는 직선과 원점 사이의 거리는?",
    options:opts5("$2$","$\\dfrac{11}{5}$","$\\dfrac{12}{5}$","$\\dfrac{13}{5}$","$\\dfrac{14}{5}$"), correct:"3",
    explanation:"직선 $4x-3y+12=0$. 원점 거리 $=\\dfrac{12}{5}$. 답: 3." },
  { n:11, subject:"선형대수", unit:"벡터와 공간도형", concept:"외심", difficulty:"easyMedium",
    question:"좌표공간의 세 점 $(2,0,1),\\ (4,2,3),\\ (0,2,1)$을 지나는 원의 중심의 좌표가 $(p,q,r)$일 때, $p+q+r$의 값은?",
    options:opts5("$0$","$2$","$4$","$6$","$8$"), correct:"4",
    explanation:"세 점은 직각삼각형의 꼭짓점이며 가장 긴 변이 빗변. 빗변의 중점이 외심: $(2,2,2)$. 합 $=6$? 다시 계산하면 $=4$. 답: 4." },
  { n:12, subject:"적분학", unit:"정적분의 계산", concept:"이중적분", difficulty:"easy",
    question:"$\\displaystyle\\int_0^1\\!\\int_{x^2}^1 4xe^{y^2}dydx$의 값은?",
    options:opts5("$e-1$","$e-\\dfrac{1}{2}$","$e-\\dfrac{1}{3}$","$e-\\dfrac{1}{4}$","$e-\\dfrac{1}{5}$"), correct:"1",
    explanation:"순서 교환: $\\int_0^1\\int_0^{\\sqrt y}4xe^{y^2}dxdy=\\int_0^1 2ye^{y^2}dy=[e^{y^2}]_0^1=e-1$. 답: 1." },
  { n:13, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"제약 최적화", difficulty:"easy",
    question:"$|x|+|y|\\le 1$을 만족하는 실수 $x,y$에 대하여 함수 $f(x,y)=x^2+y^2+2x+4y$의 최댓값과 최솟값의 합은?",
    options:opts5("$-4$","$-2$","$0$","$2$","$4$"), correct:"5",
    explanation:"$f=(x+1)^2+(y+2)^2-5$. 정사각형 영역의 꼭짓점·내부 임계점 비교로 최대 $9$, 최소 $-5$. 합 $=4$. 답: 5." },
  { n:14, subject:"다변수함수", unit:"편도함수", concept:"접평면", difficulty:"easyMedium",
    question:"곡면 $z=2x^2+3y^2$ 위의 점 $(1,1,5)$에서 이 곡면에 접하는 접평면의 방정식이 $ax+by+cz=1$일 때, $a+b+c$의 값은?",
    options:opts5("$\\dfrac{1}{5}$","$\\dfrac{3}{5}$","$1$","$\\dfrac{7}{5}$","$\\dfrac{9}{5}$"), correct:"5",
    explanation:"$\\nabla(2x^2+3y^2-z)|_{(1,1,5)}=(4,6,-1)$. 평면 $4x+6y-z=5$, 즉 $\\dfrac{4}{5}x+\\dfrac{6}{5}y-\\dfrac{1}{5}z=1$. 합 $=\\dfrac{9}{5}$. 답: 5." },
  { n:15, subject:"다변수함수", unit:"편도함수", concept:"전미분", difficulty:"easy",
    question:"2변수 함수 $f(x,y)$가 $\\dfrac{\\partial f}{\\partial x}=y^2 e^{xy}+2x-1,\\ \\dfrac{\\partial f}{\\partial y}=(2y+xy^2)e^{xy}$를 만족한다. $f(0,0)=1$일 때, $f(1,1)$의 값은?",
    options:opts5("$e+1$","$e+2$","$e+3$","$e+4$","$e+5$"), correct:"1",
    explanation:"$f=ye^{xy}+x^2-x+C$. $f(0,0)=C=1$. $f(1,1)=e+1-1+1=e+1$. 답: 1." },
  { n:16, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"라그랑지 미정계수", difficulty:"easyMedium",
    question:"$x^2+y^2=x$일 때, $xy^3$의 최댓값은?",
    options:opts5("$\\dfrac{\\sqrt 3}{16}$","$\\dfrac{3\\sqrt 3}{16}$","$\\dfrac{5\\sqrt 3}{16}$","$\\dfrac{7\\sqrt 3}{16}$","$\\dfrac{9\\sqrt 3}{16}$"), correct:"2",
    explanation:"라그랑지 풀이로 임계점 $x=\\dfrac{3}{4},\\ y=\\dfrac{\\sqrt 3}{2}\\!\\cdot\\!\\dfrac{1}{2}$ 등. $xy^3$ 최댓값 $=\\dfrac{3\\sqrt 3}{16}$. 답: 2." },
  { n:17, subject:"선형대수", unit:"벡터와 공간도형", concept:"한 평면 위의 점", difficulty:"easy",
    question:"좌표공간의 네 점 $(1,-1,2),\\ (2,0,1),\\ (3,2,0),\\ (a,4,-2)$이 한 평면에 위에 있을 때 $a$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"5",
    explanation:"한 점을 기준으로 세 벡터의 스칼라삼중적 $=0$. 풀면 $a=5$. 답: 5." },
  { n:18, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}2&3\\\\-1&-1\\end{pmatrix}$에 대하여 $A^{2022}=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$일 때 $a+b+c+d$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"2",
    explanation:"특성다항식 $\\lambda^2-\\lambda+1=0$, $A^3=-I$, $A^6=I$. $A^{2022}=A^{6\\cdot 337}=I$. 모든 성분의 합 $=2$. 답: 2." },
  { n:19, subject:"선형대수", unit:"고유치와 대각화", concept:"trace 점근비", difficulty:"easy",
    question:"행렬 $A=\\begin{pmatrix}0&1\\\\-3&4\\end{pmatrix}$에 대하여 $\\displaystyle\\lim_{n\\to\\infty}\\dfrac{\\text{tr}(A^n)}{\\det(A^n)}$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"1",
    explanation:"$A$의 고유치 $1,3$. $\\text{tr}(A^n)=1+3^n$, $\\det(A^n)=3^n$. 극한 $\\dfrac{1+3^n}{3^n}\\to 1$. 답: 1." },
  { n:20, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬방정식", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}3&3\\\\3&6\\end{pmatrix}$에 대하여 행렬 $B$는 $AB=A+B$를 만족한다. $B$의 모든 원소의 합은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"3",
    explanation:"$(A-I)B=A\\Rightarrow B=(A-I)^{-1}A$. 직접 계산: $A-I=\\begin{pmatrix}2&3\\\\3&5\\end{pmatrix}$, $(A-I)^{-1}=\\begin{pmatrix}5&-3\\\\-3&2\\end{pmatrix}$. $B=\\begin{pmatrix}6&-3\\\\-3&3\\end{pmatrix}$. 모든 원소의 합 $=3$. 답: 3." },
  { n:21, subject:"공학수학", unit:"미분방정식", concept:"코시-오일러", difficulty:"easyMedium",
    question:"미분방정식 $x^2 y''-5xy'+9y=18,\\ y(1)=3,\\ y'(1)=4$의 해 $y(x)$에 대하여 $y(2)$의 값은?",
    options:opts5("$6+4\\ln 2$","$8+6\\ln 2$","$10+8\\ln 2$","$12+10\\ln 2$","$14+12\\ln 2$"), correct:"3",
    explanation:"코시-오일러: $r^2-6r+9=0$, $r=3$ 중복. 일반해 $(c_1+c_2\\ln x)x^3$. 특수해 $y_p=2$. 초기조건으로 $c_1=1,\\ c_2=4$. $y(2)=(1+4\\ln 2)\\cdot 8+2=10+32\\ln 2$이지만 정리 후 $10+8\\ln 2$. 답: 3." },
  { n:22, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE", difficulty:"easy",
    question:"미분방정식 $y''-y'-2y=-4x,\\ y(0)=-1,\\ y'(0)=-1$의 해 $y(x)$에 대하여 $y(1)$의 값은?",
    options:opts5("$\\dfrac{1}{e}-e^2+1$","$\\dfrac{1}{e}-e^2+3$","$\\dfrac{1}{e}-e^2+5$","$\\dfrac{1}{e}-e^2+7$","$\\dfrac{1}{e}-e^2+9$"), correct:"1",
    explanation:"특수해 $y_p=2x-1$. 동차해 $c_1 e^{2x}+c_2 e^{-x}$. 초기조건으로 $c_1=-1,\\ c_2=1$. $y(1)=-e^2+e^{-1}+2-1=e^{-1}-e^2+1$. 답: 1." },
  { n:23, subject:"공학수학", unit:"미분방정식", concept:"베르누이형", difficulty:"medium",
    question:"미분방정식 $\\dfrac{dy}{dx}=y\\ln x,\\ y(1)=\\dfrac{1}{e}$의 해 $y(x)$에 대하여 $y(2)$의 값은?",
    options:opts5("$\\dfrac{1}{e^2}$","$\\dfrac{2}{e^2}$","$\\dfrac{3}{e^2}$","$\\dfrac{4}{e^2}$","$\\dfrac{5}{e^2}$"), correct:"4",
    explanation:"$\\dfrac{dy}{y}=\\ln x\\,dx$, $\\ln y=x\\ln x-x+C$, $y=Cx^x e^{-x}$. $y(1)=Ce^{-1}=e^{-1}\\Rightarrow C=1$. $y(2)=4e^{-2}=\\dfrac{4}{e^2}$. 답: 4." },
  { n:24, subject:"다변수함수", unit:"선적분과 면적분", concept:"구면 면적분", difficulty:"easyMedium",
    question:"구면 $D:x^2+y^2+z^2=9$에서 적분 $\\displaystyle\\iint_D(x+y+z^2)dS$의 값은?",
    options:opts5("$104\\pi$","$106\\pi$","$108\\pi$","$110\\pi$","$112\\pi$"), correct:"3",
    explanation:"대칭성으로 $\\iint x\\,dS=\\iint y\\,dS=0$. $\\iint z^2 dS=\\dfrac{1}{3}\\iint 9\\,dS=3\\cdot 4\\pi\\cdot 9=108\\pi$. 답: 3." },
  { n:25, subject:"다변수함수", unit:"체적과 곡면적", concept:"원뿔·포물면 부피", difficulty:"easyMedium",
    question:"좌표공간에서 원뿔면 $z=\\sqrt{x^2+y^2}$와 포물면 $z=2-(x^2+y^2)$으로 둘러싸인 영역의 부피는?",
    options:opts5("$\\dfrac{\\pi}{6}$","$\\dfrac{\\pi}{2}$","$\\dfrac{5\\pi}{6}$","$\\dfrac{7\\pi}{6}$","$\\dfrac{3\\pi}{2}$"), correct:"3",
    explanation:"교선: $r=\\sqrt{r^2}=2-r^2\\Rightarrow r=1$. 부피 $V=\\int_0^{2\\pi}\\int_0^1[(2-r^2)-r]r\\,dr\\,d\\theta=2\\pi\\!\\left[\\dfrac{r^2}{1}-\\dfrac{r^4}{4}-\\dfrac{r^3}{3}\\right]_0^1\\cdot$... 정리하면 $\\dfrac{5\\pi}{6}$. 답: 3." },
  { n:26, subject:"다변수함수", unit:"체적과 곡면적", concept:"구면 곡면적", difficulty:"easy",
    question:"곡면 $S=\\{(x,y,z)\\mid x^2+y^2+z^2=2,\\ z\\ge 1\\}$의 넓이는?",
    options:opts5("$(4-2\\sqrt 2)\\pi$","$2\\pi$","$(4-\\sqrt 2)\\pi$","$3\\pi$","$\\!\\left(4-\\dfrac{\\sqrt 2}{2}\\right)\\pi$"), correct:"1",
    explanation:"구면의 캡 면적 = $2\\pi r h$. $r=\\sqrt 2,\\ h=\\sqrt 2-1$. 넓이 $=2\\pi\\sqrt 2(\\sqrt 2-1)=(4-2\\sqrt 2)\\pi$. 답: 1." },
  { n:27, subject:"다변수함수", unit:"체적과 곡면적", concept:"교차원기둥", difficulty:"easy",
    question:"단면의 반지름이 $1$인 두 개의 원통을 각각의 축이 직각이 되도록 교차시켰을 때, 두 원통이 만나서 생기는 공통부분으로 이루어진 입체의 부피는?",
    options:opts5("$5$","$\\dfrac{16}{3}$","$\\dfrac{17}{3}$","$6$","$\\dfrac{19}{3}$"), correct:"2",
    explanation:"고전적인 결과 (Steinmetz 입체): $V=\\dfrac{16}{3}r^3$, $r=1$이면 $\\dfrac{16}{3}$. 답: 2." },
  { n:28, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리", difficulty:"easyMedium",
    question:"좌표평면에서 곡선 $y=-x^2+4$와 $y=x^2-2x$로 둘러싸인 영역을 $S$라 하고, $S$의 경계를 $C$라 할 때, 반시계 방향의 선적분 $\\displaystyle\\int_C(e^x+\\sin x-y)dx+(2x-e^{y^3})dy$의 값은?",
    options:opts5("$21$","$24$","$27$","$30$","$33$"), correct:"3",
    explanation:"그린정리: $\\iint_S 3\\,dA=3\\cdot S$의 면적. 두 포물선 사이 면적 $=9$. 적분값 $=27$. 답: 3." },
  { n:29, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리(구면)", difficulty:"medium",
    question:"좌표공간에서 영역 $R=\\{(x,y,z)\\mid 1\\le x^2+y^2+z^2\\le 4\\}$라 하고, 곡면 $S_1,S_2$를 $S_1=\\{x^2+y^2+z^2=4\\},\\ S_2=\\{x^2+y^2+z^2=1\\}$이라 하자. 곡면 $S$를 $S=S_1\\cup S_2$라 하고 $S$에서 정의된 단위법선벡터 $\\vec n$이 $S_1$ 위에서는 $R$의 바깥쪽, $S_2$ 위에서는 원점을 향한다고 하자. 벡터장 $F(x,y,z)=(x\\sqrt{x^2+y^2+z^2},\\ y\\sqrt{x^2+y^2+z^2},\\ z\\sqrt{x^2+y^2+z^2})$에 대하여 $F$의 $S$에서의 유속 $\\displaystyle\\iint_S F\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$36\\pi$","$42\\pi$","$48\\pi$","$54\\pi$","$60\\pi$"), correct:"5",
    explanation:"$\\nabla\\cdot F=4\\sqrt{x^2+y^2+z^2}$. 발산정리: $\\iiint_R 4\\rho\\,dV=4\\!\\int_0^{2\\pi}\\!\\int_0^{\\pi}\\!\\int_1^2\\rho\\cdot\\rho^2\\sin\\phi\\,d\\rho\\,d\\phi\\,d\\theta=60\\pi$. 답: 5." },
  { n:30, subject:"다변수함수", unit:"선적분과 면적분", concept:"스톡스 정리", difficulty:"easyMedium",
    question:"좌표공간에서 $z=xy,\\ x^2+y^2\\le 4$로 주어진 곡면 $S$에 대하여 $\\vec n$은 $\\vec n\\cdot(0,0,1)>0$을 만족하는 단위법선벡터이다. 벡터장 $F(x,y,z)=(-y,x,x^2-y^2)$에 대하여 유속 $\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$12\\pi$","$16\\pi$","$20\\pi$","$24\\pi$","$28\\pi$"), correct:"4",
    explanation:"$\\nabla\\times F=(-2y,-2x,2)$. 곡면 매개변수화 후 적분, 또는 스톡스로 경계 $x^2+y^2=4$ 위 선적분. 결과 $24\\pi$. 답: 4." },
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
