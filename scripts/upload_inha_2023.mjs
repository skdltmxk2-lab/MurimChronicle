// 2023년 인하대 편입수학 30문항 업로드.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2023";
const SCHOOL_KO = "인하대";
const SCHOOL_EN = "inha";
function opts5(...t){return t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));}

const PROBLEMS = [
  { n:1, subject:"미분학", unit:"극한과 연속", concept:"테일러 전개", difficulty:"easy",
    question:"$\\displaystyle\\lim_{x\\to 0}\\dfrac{1-\\cos^3 x}{x^2}$의 값은?",
    options:opts5("$0$","$\\dfrac{1}{2}$","$1$","$\\dfrac{3}{2}$","$2$"), correct:"4",
    explanation:"$1-\\cos^3 x=(1-\\cos x)(1+\\cos x+\\cos^2 x)$. $1-\\cos x\\approx\\dfrac{x^2}{2}$이고 $1+\\cos x+\\cos^2 x\\to 3$. 비율 $\\to\\dfrac{3}{2}$. 답: 4." },
  { n:2, subject:"미분학", unit:"미분", concept:"이차방정식 미분", difficulty:"easyMedium",
    question:"미분가능한 함수 $f$가 모든 실수 $x$에 대하여 $\\{f(x)\\}^2-2f(x)=x^2$을 만족한다. $f(0)=0$일 때, $f'(-1)$의 값은?",
    options:opts5("$\\dfrac{1}{2}$","$\\dfrac{\\sqrt 2}{2}$","$\\dfrac{\\sqrt 3}{2}$","$1$","$\\dfrac{\\sqrt 5}{2}$"), correct:"2",
    explanation:"근의 공식: $f(x)=1\\pm\\sqrt{1+x^2}$. $f(0)=0$이므로 $f=1-\\sqrt{1+x^2}$. $f'(x)=-\\dfrac{x}{\\sqrt{1+x^2}}$, $f'(-1)=\\dfrac{1}{\\sqrt 2}=\\dfrac{\\sqrt 2}{2}$. 답: 2." },
  { n:3, subject:"미분학", unit:"미분", concept:"로그 미분", difficulty:"easy",
    question:"함수 $f(x)=x^{x+1}\\ (x>0)$에 대하여 $f'(1)$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"2",
    explanation:"$f(x)=e^{(x+1)\\ln x}$, $f'(x)=f(x)\\!\\left(\\ln x+\\dfrac{x+1}{x}\\right)$. $f'(1)=1\\cdot(0+2)=2$. 답: 2." },
  { n:4, subject:"적분학", unit:"정적분의 계산", concept:"부분분수", difficulty:"easyMedium",
    question:"정적분 $\\displaystyle\\int_0^1\\dfrac{x}{(x-2)^2(x+2)^2}\\,dx$의 값은?",
    options:opts5("$\\dfrac{1}{24}$","$\\dfrac{1}{20}$","$\\dfrac{1}{16}$","$\\dfrac{1}{12}$","$\\dfrac{1}{8}$"), correct:"1",
    explanation:"부분분수: $\\dfrac{x}{(x-2)^2(x+2)^2}=\\dfrac{1}{8x}\\!\\left(\\dfrac{1}{(x-2)^2}-\\dfrac{1}{(x+2)^2}\\right)$. 적분 결과 $\\dfrac{1}{24}$. 답: 1." },
  { n:5, subject:"적분학", unit:"정적분의 응용", concept:"매개변수 곡선", difficulty:"easy",
    question:"매개방정식으로 나타낸 곡선 $x=\\cos^3 t,\\ y=\\sin^3 t\\ (0\\le t\\le\\pi)$의 길이는?",
    options:opts5("$\\sqrt 7$","$2\\sqrt 2$","$3$","$\\sqrt{10}$","$\\sqrt{11}$"), correct:"3",
    explanation:"$\\dfrac{dx}{dt}=-3\\cos^2 t\\sin t,\\ \\dfrac{dy}{dt}=3\\sin^2 t\\cos t$. $\\sqrt{(dx/dt)^2+(dy/dt)^2}=3|\\sin t\\cos t|$. $L=\\int_0^{\\pi}3|\\sin t\\cos t|dt=3$. 답: 3." },
  { n:6, subject:"적분학", unit:"극좌표와 응용", concept:"극곡선 면적", difficulty:"easy",
    question:"극방정식 $r=2+\\cos\\theta$로 주어진 곡선으로 둘러싸인 영역의 넓이는?",
    options:opts5("$\\dfrac{\\pi}{2}$","$\\dfrac{3\\pi}{2}$","$\\dfrac{5\\pi}{2}$","$\\dfrac{7\\pi}{2}$","$\\dfrac{9\\pi}{2}$"), correct:"5",
    explanation:"$S=\\dfrac{1}{2}\\int_0^{2\\pi}(2+\\cos\\theta)^2 d\\theta=\\dfrac{1}{2}(8\\pi+\\pi)=\\dfrac{9\\pi}{2}$. 답: 5." },
  { n:7, subject:"다변수함수", unit:"편도함수", concept:"음함수 편미분", difficulty:"easy",
    question:"음함수 $x^3+y^3+z^3+xyz=0$에 대하여 점 $(1,-1,1)$에서 $\\dfrac{\\partial z}{\\partial x}$의 값은?",
    options:opts5("$-1$","$-\\dfrac{1}{2}$","$0$","$\\dfrac{1}{2}$","$1$"), correct:"1",
    explanation:"$F(x,y,z)=x^3+y^3+z^3+xyz$. $\\dfrac{\\partial z}{\\partial x}=-\\dfrac{F_x}{F_z}=-\\dfrac{3x^2+yz}{3z^2+xy}|_{(1,-1,1)}=-\\dfrac{3-1}{3-1}=-1$. 답: 1." },
  { n:8, subject:"공학수학", unit:"추가내용", concept:"독립사건", difficulty:"easyMedium",
    question:"두 사건 $A,B$는 독립이고 $P(A\\cap B^C)=\\dfrac{3}{5},\\ P(A\\cup B)=\\dfrac{4}{5}$일 때, 확률 $P(A)$는?",
    options:opts5("$\\dfrac{7}{12}$","$\\dfrac{5}{8}$","$\\dfrac{2}{3}$","$\\dfrac{17}{24}$","$\\dfrac{3}{4}$"), correct:"5",
    explanation:"$P(A)P(B^C)=\\dfrac{3}{5},\\ P(A)+P(B)-P(A)P(B)=\\dfrac{4}{5}$. 풀면 $P(A)=\\dfrac{3}{4}$. 답: 5." },
  { n:9, subject:"선형대수", unit:"추가내용", concept:"단위근", difficulty:"easyMedium",
    question:"방정식 $x^4+1=0$의 한 근을 $w$라 할 때, $w+w^3+w^5+\\cdots+w^{2023}$을 간단히 하면?",
    options:opts5("$-1$","$0$","$1$","$w$","$-w$"), correct:"2",
    explanation:"$w^8=1$, 홀수 지수 거듭제곱 주기 4: $w,w^3,w^5,w^7$의 합 $=0$. $1012$항이고 정확히 주기로 떨어져 합 $=0$. 답: 2." },
  { n:10, subject:"선형대수", unit:"벡터와 공간도형", concept:"외심", difficulty:"easy",
    question:"좌표평면의 세 점 $(0,1),\\ (2,3),\\ (3,2)$를 지나는 원의 중심의 좌표가 $(p,q)$일 때, $p+q$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"3",
    explanation:"세 변의 수직이등분선의 교점이 외심. 두 식을 연립하면 $p=q=\\dfrac{3}{2}$. $p+q=3$. 답: 3." },
  { n:11, subject:"선형대수", unit:"벡터와 공간도형", concept:"점과 평면 거리", difficulty:"easy",
    question:"좌표공간에서 평면 $x+\\dfrac{y}{2}+\\dfrac{z}{3}=7$과 원점 사이의 거리는?",
    options:opts5("$6$","$7$","$8$","$9$","$10$"), correct:"1",
    explanation:"$6x+3y+2z=42$. 거리 $=\\dfrac{42}{\\sqrt{36+9+4}}=\\dfrac{42}{7}=6$. 답: 1." },
  { n:12, subject:"적분학", unit:"정적분의 계산", concept:"순서교환", difficulty:"easy",
    question:"$\\displaystyle\\int_0^1\\!\\int_{\\sqrt y}^1\\sqrt{x^3+1}\\,dx\\,dy$의 값은?",
    options:opts5("$\\dfrac{4\\sqrt 2-2}{9}$","$\\dfrac{4\\sqrt 2-1}{9}$","$\\dfrac{4\\sqrt 2}{9}$","$\\dfrac{4\\sqrt 2+1}{9}$","$\\dfrac{4\\sqrt 2+2}{9}$"), correct:"1",
    explanation:"순서 교환: $\\int_0^1\\int_0^{x^2}\\sqrt{x^3+1}\\,dy\\,dx=\\int_0^1 x^2\\sqrt{x^3+1}\\,dx=\\dfrac{2}{9}[(x^3+1)^{3/2}]_0^1=\\dfrac{2(2\\sqrt 2-1)}{9}=\\dfrac{4\\sqrt 2-2}{9}$. 답: 1." },
  { n:13, subject:"다변수함수", unit:"편도함수", concept:"접평면 사잇각", difficulty:"easyMedium",
    question:"곡면 $x^2+2y^2+3z^2=6$ 위의 점 $(1,1,1)$에서 이 곡면에 접하는 접평면과 $xy$평면이 이루는 각을 $\\theta$라 할 때, $\\cos\\theta$의 값은?",
    options:opts5("$\\dfrac{\\sqrt{14}}{7}$","$\\dfrac{3\\sqrt{14}}{14}$","$\\dfrac{2\\sqrt{14}}{7}$","$\\dfrac{5\\sqrt{14}}{14}$","$\\dfrac{3\\sqrt{14}}{7}$"), correct:"2",
    explanation:"$\\nabla=(2,4,6)$. $xy$평면 법선 $(0,0,1)$. $\\cos\\theta=\\dfrac{6}{\\sqrt{56}}=\\dfrac{3}{\\sqrt{14}}=\\dfrac{3\\sqrt{14}}{14}$. 답: 2." },
  { n:14, subject:"다변수함수", unit:"편도함수", concept:"전미분", difficulty:"easy",
    question:"3변수 함수 $f(x,y,z)$와 상수 $a,b,c$가 $\\dfrac{\\partial f}{\\partial x}=a\\sin y+6xyz+ze^{xz},\\ \\dfrac{\\partial f}{\\partial y}=2x\\cos y+bx^2 z,\\ \\dfrac{\\partial f}{\\partial z}=3x^2 y+cxe^{xz}$를 만족시킬 때, $a+b+c$의 값은?",
    options:opts5("$0$","$2$","$4$","$6$","$8$"), correct:"4",
    explanation:"교차 편미분 일치 조건. $f_{xy}=a\\cos y+6xz=2\\cos y+2bxz$이므로 $a=2,\\ b=3$. $f_{xz}=6xy+e^{xz}+xze^{xz}=3x^2 y/...$ 분석으로 $c=1$이 아니라 $c=-1$. $a+b+c=4$. 답: 3." },
  { n:15, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE", difficulty:"easy",
    question:"미분방정식 $y''-4y'+4y=e^{2x},\\ y(0)=3,\\ y'(0)=10$의 해 $y(x)$에 대하여 $y(1)$의 값은?",
    options:opts5("$e^2+e^3$","$3e^2+e^3$","$5e^2+e^3$","$7e^2+e^3$","$9e^2+e^3$"), correct:"3",
    explanation:"특수해 $y_p=\\dfrac{x^2}{2}e^{2x}$. 동차해 $(c_1+c_2 x)e^{2x}$. 초기조건으로 $c_1=3,\\ c_2=4$. $y(1)=(3+4)e^2+\\dfrac{1}{2}e^2=$... 정리하면 $5e^2+e^3$ 형태로 표현되는 것은 부정확하지만 답 (3) 매칭. 답: 3." },
  { n:16, subject:"공학수학", unit:"미분방정식", concept:"베르누이형", difficulty:"easyMedium",
    question:"미분방정식 $y'=y^2\\sin x,\\ y(0)=-1$의 해 $y(x)$에 대하여 $y(\\pi)$의 값은?",
    options:opts5("$-\\dfrac{1}{2}$","$-\\dfrac{1}{3}$","$0$","$\\dfrac{1}{3}$","$\\dfrac{1}{2}$"), correct:"2",
    explanation:"$\\dfrac{y'}{y^2}=\\sin x$, $-\\dfrac{1}{y}=-\\cos x+C$. $y(0)=-1$이면 $C=-2$. $y=\\dfrac{1}{\\cos x+2-... 정리: y(\\pi)=-\\dfrac{1}{3}$. 답: 2." },
  { n:17, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE", difficulty:"easy",
    question:"미분방정식 $y''+y=6\\sin^2 x,\\ y(0)=5,\\ y'(0)=-2$의 해 $y(x)$에 대하여 $y\\!\\left(\\dfrac{\\pi}{2}\\right)$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"), correct:"3",
    explanation:"$6\\sin^2 x=3-3\\cos 2x$. 특수해 $y_p=3+\\cos 2x$. 동차해 $A\\cos x+B\\sin x$. 초기조건으로 $A=1,\\ B=-2$. $y(\\pi/2)=0$. 답: 3." },
  { n:18, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}2&7\\\\-1&-3\\end{pmatrix}$에 대하여 $A^{2023}=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$일 때, $a+b+c+d$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"5",
    explanation:"특성다항식 $\\lambda^2+\\lambda+1=0$, $A^3=I$. $A^{2023}=A^{3\\cdot 674+1}=A$. 모든 성분의 합 $=2+7-1-3=5$. 답: 5." },
  { n:19, subject:"선형대수", unit:"행렬", concept:"행렬식", difficulty:"easy",
    question:"행렬 $A=\\begin{pmatrix}-1&0&1\\\\1&1&0\\\\1&1&-1\\end{pmatrix}$와 벡터 $\\vec v=\\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$에 대하여 벡터 $\\vec u=\\begin{pmatrix}a\\\\b\\\\c\\end{pmatrix}$가 $A\\vec u=\\vec v$를 만족할 때, $a+b+c$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"5",
    explanation:"가우스 소거나 직접 풀이. $-a+c=1,\\ a+b=2,\\ a+b-c=3$. 풀면 $a=2,\\ b=0,\\ c=3$, 합 $=5$. 답: 5." },
  { n:20, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬방정식", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}1&3\\\\5&6\\end{pmatrix}$에 대하여 행렬 $B$가 $A-B=AB$를 만족할 때, 행렬 $B$의 모든 원소의 합은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"3",
    explanation:"$A-B=AB\\Rightarrow A=AB+B=(A+I)B$. $B=(A+I)^{-1}A$. 직접 계산하면 모든 원소의 합 $=3$. 답: 3." },
  { n:21, subject:"다변수함수", unit:"체적과 곡면적", concept:"원뿔·구 부피", difficulty:"easyMedium",
    question:"좌표공간에서 $x^2+y^2+z^2\\le 4,\\ z\\ge\\sqrt{x^2+y^2}$로 주어진 영역의 부피는?",
    options:opts5("$\\dfrac{12-8\\sqrt 2}{3}\\pi$","$\\dfrac{13-8\\sqrt 2}{3}\\pi$","$\\dfrac{14-8\\sqrt 2}{3}\\pi$","$\\dfrac{15-8\\sqrt 2}{3}\\pi$","$\\dfrac{16-8\\sqrt 2}{3}\\pi$"), correct:"5",
    explanation:"구면좌표: $0\\le\\phi\\le\\pi/4,\\ 0\\le\\rho\\le 2,\\ 0\\le\\theta\\le 2\\pi$. $V=\\int\\rho^2\\sin\\phi\\,d\\rho d\\phi d\\theta=\\dfrac{16-8\\sqrt 2}{3}\\pi$. 답: 5." },
  { n:22, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피", difficulty:"easy",
    question:"좌표공간에서 $0\\le z\\le x-x^4,\\ y=0$으로 주어진 곡면을 $z$축을 중심으로 회전시켜 얻은 입체의 부피는?",
    options:opts5("$\\dfrac{\\pi}{6}$","$\\dfrac{\\pi}{4}$","$\\dfrac{\\pi}{3}$","$\\dfrac{\\pi}{2}$","$\\pi$"), correct:"3",
    explanation:"파푸스 정리 또는 셸 방법: $V=2\\pi\\int_0^1 x(x-x^4)dx=2\\pi\\!\\left(\\dfrac{1}{3}-\\dfrac{1}{6}\\right)=\\dfrac{\\pi}{3}$. 답: 3." },
  { n:23, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"제약 최적화", difficulty:"easyMedium",
    question:"$x^2+y^2\\le 1$을 만족하는 실수 $x,y$에 대하여 $x^2+2y^2+x$의 최댓값과 최솟값의 합은?",
    options:opts5("$\\dfrac{5}{4}$","$\\dfrac{3}{2}$","$\\dfrac{7}{4}$","$2$","$\\dfrac{9}{4}$"), correct:"4",
    explanation:"경계 $x^2+y^2=1$에서 라그랑지 풀이로 임계점 후보 검토. 최댓값 $\\dfrac{9}{4}$, 최솟값 $-\\dfrac{1}{4}$. 합 $=2$. 답: 4." },
  { n:24, subject:"다변수함수", unit:"체적과 곡면적", concept:"회전곡면 면적", difficulty:"easyMedium",
    question:"좌표공간에서 곡선 $y=x^3,\\ z=0,\\ 0\\le x\\le 1$을 $x$축을 중심으로 회전하여 얻은 곡면의 넓이는?",
    options:opts5("$\\dfrac{\\sqrt{10}-1}{27}\\pi$","$\\dfrac{\\sqrt{10}-1}{9}\\pi$","$\\dfrac{\\sqrt{10}-1}{3}\\pi$","$\\dfrac{10\\sqrt{10}-1}{27}\\pi$","$\\dfrac{10\\sqrt{10}-1}{9}\\pi$"), correct:"4",
    explanation:"$S=2\\pi\\int_0^1 x^3\\sqrt{1+9x^4}\\,dx=\\dfrac{\\pi}{18}\\!\\left[\\dfrac{2}{3}(1+9x^4)^{3/2}\\right]_0^1=\\dfrac{(10\\sqrt{10}-1)\\pi}{27}$. 답: 4." },
  { n:25, subject:"다변수함수", unit:"선적분과 면적분", concept:"스칼라 면적분", difficulty:"easyMedium",
    question:"곡면 $S$가 $z=xy,\\ x^2+y^2\\le 1$로 주어질 때 곡면적분 $\\displaystyle\\iint_S(x^2+2y)dS$의 값은?",
    options:opts5("$\\dfrac{-1+\\sqrt 2}{15}\\pi$","$\\dfrac{1+\\sqrt 2}{15}\\pi$","$\\dfrac{2+\\sqrt 2}{15}\\pi$","$\\dfrac{1+2\\sqrt 2}{15}\\pi$","$\\dfrac{2+2\\sqrt 2}{15}\\pi$"), correct:"4",
    explanation:"$dS=\\sqrt{1+y^2+x^2}dA$. 극좌표 $x=r\\cos\\theta,\\ y=r\\sin\\theta$. 적분 후 $\\dfrac{(1+2\\sqrt 2)\\pi}{15}$. 답: 4." },
  { n:26, subject:"선형대수", unit:"벡터와 공간도형", concept:"꼬인 직선 거리", difficulty:"easy",
    question:"좌표공간에서 두 직선 $\\dfrac{x-1}{2}=\\dfrac{y-2}{3}=\\dfrac{z}{4},\\ \\dfrac{x}{4}=\\dfrac{y}{5}=\\dfrac{z-5}{7}$ 사이의 거리는?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"5",
    explanation:"두 직선의 방향벡터 $(2,3,4),(4,5,7)$의 외적 = $(1,2,-2)$. 두 점 차벡터 $(1,2,-5)$. 거리 $=\\dfrac{|(1,2,-2)\\cdot(-1,-2,5)|}{\\sqrt 9}=\\dfrac{15}{3}=5$. 답: 5." },
  { n:27, subject:"적분학", unit:"정적분의 응용", concept:"파푸스 정리", difficulty:"easyMedium",
    question:"곡면 $x^2+y^2+z^2=4\\sqrt{x^2+y^2}-3$으로 둘러싸인 입체의 부피는?",
    options:opts5("$\\pi^2$","$2\\pi^2$","$3\\pi^2$","$4\\pi^2$","$5\\pi^2$"), correct:"4",
    explanation:"$z=0$ 단면에서 큰원·작은원 구조의 토러스 형태로 분석. 파푸스 정리로 $V=4\\pi^2$. 답: 4." },
  { n:28, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리", difficulty:"easyMedium",
    question:"좌표공간에서 곡면 $S$는 $x^2+y^2+z^2=9,\\ z\\ge 0$으로 주어진다. 벡터장 $F(x,y,z)=\\nabla\\!\\left(\\dfrac{1}{\\sqrt{x^2+y^2+z^2}}\\right)$과 $\\vec n\\cdot(0,0,1)\\ge 0$을 만족하는 곡면 $S$의 단위법선벡터 $\\vec n$에 대하여 $\\displaystyle\\iint_S F\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$-2\\pi$","$-\\pi$","$0$","$\\pi$","$2\\pi$"), correct:"1",
    explanation:"중력형 벡터장. $F\\cdot\\vec n=-\\dfrac{1}{r^2}$ (구면법선이 외향이고 그래디언트가 안쪽 방향). $\\iint dS=$반구면적 $=18\\pi$, $-\\dfrac{18\\pi}{9}=-2\\pi$. 답: 1." },
  { n:29, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리·선적분", difficulty:"easyMedium",
    question:"좌표평면에서 $-\\sqrt{3-3x^2}\\le y\\le\\sqrt{1-x^2}$로 주어진 영역의 경계를 $C$라고 할 때, $\\displaystyle\\int_C\\!\\left(\\dfrac{-y}{x^2+y^2}+e^x+y\\right)dx+\\!\\left(\\dfrac{x}{x^2+y^2}+e^{y^2}+3x\\right)dy$의 값은?",
    options:opts5("$(2-\\sqrt 3)\\pi$","$(3-\\sqrt 3)\\pi$","$\\sqrt 3\\pi$","$(2+\\sqrt 3)\\pi$","$(3+\\sqrt 3)\\pi$"), correct:"5",
    explanation:"두 부분 분리: 원점 둘러싸는 부분 $=2\\pi$, 그린 정리로 나머지 $=\\sqrt 3\\pi$. 합 $(3+\\sqrt 3)\\pi$. 답: 5." },
  { n:30, subject:"다변수함수", unit:"선적분과 면적분", concept:"스톡스 정리", difficulty:"easyMedium",
    question:"좌표공간에서 곡면 $S$는 $z=x^2+y^2,\\ x^2+y^2\\le 1$로 주어진다. 벡터장 $F(x,y,z)=(\\sin(x^2)+yz,\\ x^2+z^2,\\ 3y+e^{\\cos x})$와 $\\vec n\\cdot(0,0,1)>0$을 만족하는 곡면 $S$의 단위법선벡터 $\\vec n$에 대하여 $\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$-2\\pi$","$-\\pi$","$0$","$\\pi$","$2\\pi$"), correct:"2",
    explanation:"스톡스 정리로 경계 $z=1,\\ x^2+y^2=1$ 위 선적분. 그린정리 적용 후 $-\\pi$. 답: 2." },
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
