// 2020년 인하대 편입수학 30문항 업로드.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2020";
const SCHOOL_KO = "인하대";
const SCHOOL_EN = "inha";
function opts5(...t){return t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));}

const PROBLEMS = [
  { n:1, subject:"미분학", unit:"극한과 연속", concept:"테일러 전개", difficulty:"medium",
    question:"$\\displaystyle\\lim_{x\\to 0}\\dfrac{\\sin^2 x}{e^{-x^2}-1}$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"), correct:"2",
    explanation:"$\\sin^2 x\\approx x^2$, $e^{-x^2}-1\\approx -x^2$이므로 비율은 $-1$로 수렴. 답: 2." },
  { n:2, subject:"공학수학", unit:"추가내용", concept:"독립사건", difficulty:"easyMedium",
    question:"두 사건 $A,B$는 독립이고 $P(A\\cap B^C)=\\dfrac{1}{3}$, $P(A\\cup B)=\\dfrac{2}{3}$을 만족할 때, 확률 $P(A)$는?",
    options:opts5("$\\dfrac{1}{3}$","$\\dfrac{5}{12}$","$\\dfrac{1}{2}$","$\\dfrac{7}{12}$","$\\dfrac{2}{3}$"), correct:"3",
    explanation:"독립이면 $P(A\\cap B^C)=P(A)P(B^C)=P(A)(1-P(B))=\\dfrac{1}{3}$. 또 $P(A\\cup B)=P(A)+P(B)-P(A)P(B)=\\dfrac{2}{3}$. 두 식을 빼면 $P(B)=\\dfrac{1}{3}$, 대입하면 $P(A)=\\dfrac{1}{2}$. 답: 3." },
  { n:3, subject:"적분학", unit:"정적분의 계산", concept:"치환적분", difficulty:"easy",
    question:"적분 $\\displaystyle\\int_0^{\\sqrt\\pi}2x^3\\sin(x^2)\\,dx$의 값은?",
    options:opts5("$\\dfrac{\\pi}{6}$","$\\dfrac{\\pi}{4}$","$\\dfrac{\\pi}{3}$","$\\dfrac{\\pi}{2}$","$\\pi$"), correct:"5",
    explanation:"$x^2=t$로 치환하면 $2x\\,dx=dt$, $\\int_0^{\\pi}t\\sin t\\,dt=[-t\\cos t+\\sin t]_0^{\\pi}=\\pi$. 답: 5." },
  { n:4, subject:"선형대수", unit:"추가내용", concept:"단위근", difficulty:"medium",
    question:"$x^3-1=0$의 1이 아닌 한 근을 $w$라고 할 때, $1+w+w^2+w^3+\\cdots+w^{2020}$을 간단히 하면?",
    options:opts5("$0$","$1$","$w$","$w+1$","$w^2$"), correct:"4",
    explanation:"$w^3=1$이고 $1+w+w^2=0$. $2021=3\\cdot 673+2$이므로 합 $=1+w$로 정리됨. 답: 4." },
  { n:5, subject:"공학수학", unit:"미분방정식", concept:"지수성장", difficulty:"easyMedium",
    question:"어떤 세균이 개체 수의 증가 속도가 현재 있는 개체 수에 비례한다고 한다. 이 세균 수가 $2$배로 되는데 $5$시간이 걸렸다면 $10$배로 되는 데는 몇 시간이 소요되겠는가?",
    options:opts5("$\\dfrac{5\\ln 10}{\\ln 2}$","$\\dfrac{10\\ln 10}{\\ln 2}$","$\\dfrac{15\\ln 10}{\\ln 2}$","$\\dfrac{20\\ln 10}{\\ln 2}$","$\\dfrac{25\\ln 10}{\\ln 2}$"), correct:"1",
    explanation:"$y=Ce^{kt}$, $y(5)=2y(0)$이므로 $k=\\dfrac{\\ln 2}{5}$. $y(t)=10y(0)$이려면 $kt=\\ln 10$, $t=\\dfrac{5\\ln 10}{\\ln 2}$. 답: 1." },
  { n:6, subject:"미분학", unit:"미분", concept:"음함수 미분", difficulty:"medium",
    question:"미분가능한 함수 $f$가 $-\\dfrac{\\pi}{2}<x<\\dfrac{\\pi}{2}$일 때 $f(\\sin x)=x^2+1$을 만족한다. $f'\\!\\left(\\dfrac{1}{2}\\right)$의 값은?",
    options:opts5("$-\\dfrac{2\\sqrt 3\\pi}{9}$","$-\\dfrac{\\sqrt 3\\pi}{9}$","$0$","$\\dfrac{\\sqrt 3\\pi}{9}$","$\\dfrac{2\\sqrt 3\\pi}{9}$"), correct:"5",
    explanation:"양변 미분: $f'(\\sin x)\\cos x=2x$. $x=\\pi/6$ 대입: $f'(1/2)\\cdot\\dfrac{\\sqrt 3}{2}=\\dfrac{\\pi}{3}$, $f'(1/2)=\\dfrac{2\\pi}{3\\sqrt 3}=\\dfrac{2\\sqrt 3\\pi}{9}$. 답: 5." },
  { n:7, subject:"적분학", unit:"정적분의 응용", concept:"곡선의 길이", difficulty:"easyMedium",
    question:"함수 $y=\\cosh x\\ (0\\le x\\le 1)$의 그래프로 주어지는 곡선의 길이는?",
    options:opts5("$1$","$\\dfrac{1}{2}\\!\\left(e-\\dfrac{1}{e}\\right)$","$\\dfrac{1}{2}\\!\\left(e+\\dfrac{1}{e}\\right)$","$\\dfrac{1}{4}\\!\\left(e^2-\\dfrac{1}{e^2}\\right)$","$\\dfrac{1}{4}\\!\\left(e^2+\\dfrac{1}{e^2}\\right)$"), correct:"2",
    explanation:"$y'=\\sinh x$, $1+(y')^2=\\cosh^2 x$. $L=\\int_0^1\\cosh x\\,dx=\\sinh 1=\\dfrac{1}{2}(e-1/e)$. 답: 2." },
  { n:8, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"변수축소", difficulty:"medium",
    question:"타원 $x^2+\\dfrac{y^2}{2}=1$ 위에서 정의된 함수 $f(x,y)=2x^2-y$의 최댓값은?",
    options:opts5("$\\dfrac{5}{4}$","$\\dfrac{7}{4}$","$\\dfrac{9}{4}$","$\\dfrac{11}{4}$","$\\dfrac{13}{4}$"), correct:"3",
    explanation:"$x^2=1-y^2/2$ 대입하면 $f=2-y^2-y=-(y+1/2)^2+9/4$. $|y|\\le\\sqrt 2$이므로 $y=-1/2$에서 최댓값 $9/4$. 답: 3." },
  { n:9, subject:"적분학", unit:"정적분과 응용", concept:"미적분 기본정리", difficulty:"medium",
    question:"실수에서 미분가능한 함수 $f$가 $f(x)=(x^2+1)^2-\\displaystyle\\int_0^x t^2 f'(t)\\,dt$를 만족할 때, $f(2)$의 값은?",
    options:opts5("$1$","$3$","$5$","$7$","$9$"), correct:"5",
    explanation:"양변 미분: $f'(x)=4x(x^2+1)-x^2 f'(x)$, $(1+x^2)f'(x)=4x(x^2+1)$, $f'(x)=4x$. $f(x)=2x^2+C$. $x=0$에서 $f(0)=1$이므로 $C=1$. $f(2)=9$. 답: 5." },
  { n:10, subject:"선형대수", unit:"벡터와 공간도형", concept:"내심", difficulty:"hard",
    question:"세 점 $(-1,0),\\ (0,1),\\ (2,-1)$을 꼭짓점으로 갖는 삼각형의 내심의 $y$좌표는?",
    options:opts5("$5-2\\sqrt 5$","$-2+\\sqrt 5$","$3-\\sqrt 5$","$-4+2\\sqrt 5$","$9-4\\sqrt 5$"), correct:"2",
    explanation:"세 변까지 거리가 같은 내심을 $(0,a)$로 가정. 세 변의 직선 방정식과 각각의 거리를 동일하게 두면 $\\sqrt{10}|a-1|=\\sqrt 2|3a+1|$ 등. 정리하면 $a=\\sqrt 5-2$. 답: 2." },
  { n:11, subject:"선형대수", unit:"벡터와 공간도형", concept:"평면과 직선의 교점", difficulty:"medium",
    question:"세 점 $(-1,1,2),\\ (0,3,5),\\ (-3,-1,-1)$을 지나는 평면과 원점을 지나는 직선이 수직으로 만날 때, 교점은?",
    options:opts5("$\\!\\left(0,-\\dfrac{1}{5},\\dfrac{1}{5}\\right)$","$\\!\\left(0,-\\dfrac{1}{7},\\dfrac{2}{7}\\right)$","$\\!\\left(0,-\\dfrac{3}{11},\\dfrac{1}{11}\\right)$","$\\!\\left(0,-\\dfrac{3}{13},\\dfrac{2}{13}\\right)$","$\\!\\left(0,-\\dfrac{3}{15},\\dfrac{3}{15}\\right)$"), correct:"4",
    explanation:"법선벡터 $(1,2,3)\\times(-2,-2,-3)=(0,-3,2)$. 평면 $-3y+2z=-1$. 원점 지나는 직선 방향이 평면 법선과 같으므로 $(0,-3t,2t)$. 평면 대입: $13t=-1$, $t=-1/13$. 답: 4." },
  { n:12, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"급수 전개", difficulty:"medium",
    question:"$0<x<1$인 모든 실수 $x$에 대하여 $\\dfrac{x}{e^x-1}=a_0+a_1 x+a_2 x^2+\\cdots$이 성립할 때 $a_0+a_1+a_2$의 값은?",
    options:opts5("$\\dfrac{1}{12}$","$\\dfrac{5}{12}$","$\\dfrac{7}{12}$","$\\dfrac{11}{12}$","$\\dfrac{13}{12}$"), correct:"3",
    explanation:"$x=(a_0+a_1 x+\\cdots)(x+x^2/2+x^3/6+\\cdots)$의 계수 비교. $a_0=1$, $a_0/2+a_1=0\\Rightarrow a_1=-1/2$, $a_0/6+a_1/2+a_2=0\\Rightarrow a_2=1/12$. 합 $=7/12$. 답: 3." },
  { n:13, subject:"적분학", unit:"극좌표와 응용", concept:"극곡선 면적", difficulty:"medium",
    question:"극방정식 $r=2+\\cos\\theta+\\sin\\theta$로 주어진 곡선으로 둘러싸인 영역의 넓이는?",
    options:opts5("$\\pi$","$2\\pi$","$3\\pi$","$4\\pi$","$5\\pi$"), correct:"5",
    explanation:"삼각함수 합성: $r=2+\\sqrt 2\\cos(\\theta-\\pi/4)$. $r=2+\\sqrt 2\\cos\\theta$의 면적과 같음. $S=\\dfrac{1}{2}\\int_0^{2\\pi}(2+\\sqrt 2\\cos\\theta)^2 d\\theta=\\dfrac{1}{2}(8\\pi+0+2\\pi)=5\\pi$. 답: 5." },
  { n:14, subject:"다변수함수", unit:"곡선과 곡면", concept:"교선의 접선", difficulty:"medium",
    question:"좌표공간에서 다음 두 곡면 $x+y^2+z^3=2,\\ xye^z=1$의 교선으로 주어진 곡선의 $(1,1,0)$에서의 접선과 평행인 벡터는?",
    options:opts5("$(2,-1,-1)$","$(1,-2,-2)$","$(1,-2,1)$","$(1,-1,0)$","$(2,-1,-3)$"), correct:"1",
    explanation:"두 곡면의 그래디언트 $\\nabla f_1=(1,2y,3z^2)|_{(1,1,0)}=(1,2,0)$, $\\nabla f_2=(ye^z,xe^z,xye^z)|_{(1,1,0)}=(1,1,1)$. 외적 $(2,-1,-1)$. 답: 1." },
  { n:15, subject:"적분학", unit:"특이적분", concept:"적분 순서 교환·감마함수", difficulty:"hard",
    question:"$\\displaystyle\\int_0^{\\infty}\\!\\int_x^{\\infty} y^{-3/2}\\,e^{-x}\\,dy\\,dx$의 값은?",
    options:opts5("$\\sqrt\\pi$","$2\\sqrt\\pi$","$3\\sqrt\\pi$","$4\\sqrt\\pi$","$5\\sqrt\\pi$"), correct:"2",
    explanation:"내부 적분 먼저: $\\int_x^{\\infty}y^{-3/2}dy=\\dfrac{2}{\\sqrt x}$. 따라서 원적분 $=\\int_0^{\\infty}\\dfrac{2}{\\sqrt x}e^{-x}dx=2\\Gamma(1/2)=2\\sqrt\\pi$. 답: 2." },
  { n:16, subject:"선형대수", unit:"벡터와 공간도형", concept:"평행육면체 부피", difficulty:"medium",
    question:"좌표공간의 네 점 $A(1,2,3),\\ B(-1,2,5),\\ C(0,1,2),\\ D(-1,0,4)$에 대하여 세 벡터 $\\vec{AB},\\vec{AC},\\vec{AD}$로 생성되는 평행육면체의 부피는?",
    options:opts5("$2$","$4$","$6$","$8$","$10$"), correct:"3",
    explanation:"$\\vec{AB}=(-2,0,2),\\ \\vec{AC}=(-1,-1,-1),\\ \\vec{AD}=(-2,-2,1)$. 스칼라삼중적 절대값 $=|{-2}\\cdot(-3)-0+2\\cdot 0|=6$. 답: 3." },
  { n:17, subject:"선형대수", unit:"벡터와 공간도형", concept:"공간도형 비율", difficulty:"hard",
    question:"좌표공간의 네 점 $A(2,-1,3),\\ B(1,1,1),\\ C(1,-2,1),\\ D(4,-1,2)$에 대하여 점 $A$에서 세 점 $B,C,D$를 지나는 평면에 내린 수선의 발을 $H$라고 하자. 두 점 $B,H$를 지나는 직선과 두 점 $C,D$를 지나는 직선의 교점을 $E$라고 할 때 $\\overline{CE}:\\overline{ED}$를 구하면?",
    options:opts5("$1:1$","$2:1$","$1:2$","$3:2$","$2:3$"), correct:"4",
    explanation:"$\\triangle BCD$의 평면을 구하고 $A$에서 수선의 발 $H$를 구한 뒤, $BH$ 직선과 $CD$ 직선의 교점 $E$를 매개변수로 풀면 $CE:ED=3:2$. 답: 4." },
  { n:18, subject:"선형대수", unit:"고유치와 대각화", concept:"닮음", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}1&-3\\\\-3&5\\end{pmatrix}$와 어떤 $2\\times 2$ 가역행렬 $U$에 대하여 $U^{-1}AU=\\begin{pmatrix}a&0\\\\0&b\\end{pmatrix}$일 때 $a^2+b^2$의 값은?",
    options:opts5("$11$","$22$","$33$","$44$","$55$"), correct:"4",
    explanation:"$A$의 고유치가 $a,b$. $a+b=\\text{tr}(A)=6$, $ab=\\det A=-4$. $a^2+b^2=(a+b)^2-2ab=36+8=44$. 답: 4." },
  { n:19, subject:"선형대수", unit:"고유치와 대각화", concept:"회전행렬 거듭제곱", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}\\cos\\dfrac{\\pi}{6}&-\\sin\\dfrac{\\pi}{6}\\\\\\sin\\dfrac{\\pi}{6}&\\cos\\dfrac{\\pi}{6}\\end{pmatrix}$에 대하여 $A^{1000}=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$일 때 $a+b+c+d$의 값은?",
    options:opts5("$-2$","$-1$","$0$","$1$","$2$"), correct:"2",
    explanation:"$A$는 $\\pi/6$ 회전행렬. $A^{1000}$는 $\\dfrac{1000\\pi}{6}$ 회전. $\\dfrac{1000\\pi}{6}=166\\pi+\\dfrac{4\\pi}{6}$이므로 실효 각도 $\\dfrac{2\\pi}{3}$. 모든 성분의 합 $=2\\cos(2\\pi/3)=-1$. 답: 2." },
  { n:20, subject:"선형대수", unit:"고유치와 대각화", concept:"trace 점근", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}0&2\\\\-3&5\\end{pmatrix}$에 대하여 $\\displaystyle\\lim_{n\\to\\infty}(\\text{tr}(A^n))^{1/n}$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"3",
    explanation:"$A$의 고유치는 특성방정식 $\\lambda^2-5\\lambda+6=0$, 즉 $2,3$. $\\text{tr}(A^n)=2^n+3^n$. 극한 $\\lim(2^n+3^n)^{1/n}=\\max(2,3)=3$. 답: 3." },
  { n:21, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE", difficulty:"medium",
    question:"$f(x)$가 미분방정식 $\\begin{cases}f''(x)+4f(x)=x^2\\\\ f(0)=0,\\ f'(0)=0\\end{cases}$의 해일 때, $f(\\pi)$의 값은?",
    options:opts5("$\\pi^2$","$\\dfrac{\\pi^2}{2}$","$\\dfrac{\\pi^2}{3}$","$\\dfrac{\\pi^2}{4}$","$\\dfrac{\\pi^2}{5}$"), correct:"4",
    explanation:"특수해 $f_p=\\dfrac{x^2}{4}-\\dfrac{1}{8}$. 동차해 $A\\cos 2x+B\\sin 2x$. 초기조건으로 $A=\\dfrac{1}{8},\\ B=0$. $f(\\pi)=\\dfrac{1}{8}+\\dfrac{\\pi^2}{4}-\\dfrac{1}{8}=\\dfrac{\\pi^2}{4}$. 답: 4." },
  { n:22, subject:"공학수학", unit:"미분방정식", concept:"코시-오일러", difficulty:"medium",
    question:"$f(x)$가 미분방정식 $\\begin{cases}x^2 f''(x)-4xf'(x)+6f(x)=0\\\\ f(1)=0,\\ f'(1)=1\\end{cases}$의 해일 때 $f(2)$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"4",
    explanation:"코시-오일러: $r(r-1)-4r+6=r^2-5r+6=0$, $r=2,3$. $f=c_1 x^2+c_2 x^3$. 초기조건으로 $c_1=-1,\\ c_2=1$. $f(2)=-4+8=4$. 답: 4." },
  { n:23, subject:"선형대수", unit:"고유치와 대각화", concept:"이차형식", difficulty:"medium",
    question:"함수 $f(x,y)$는 $f(x,y)=(x\\ y)\\begin{pmatrix}3&1\\\\1&3\\end{pmatrix}\\begin{pmatrix}x\\\\y\\end{pmatrix}$로 주어진다. $x^2+y^2=1$일 때 $f(x,y)$의 최댓값은 $M$이고 최솟값은 $m$이다. $M+m$의 값은?",
    options:opts5("$2$","$4$","$6$","$8$","$10$"), correct:"3",
    explanation:"행렬 $\\begin{pmatrix}3&1\\\\1&3\\end{pmatrix}$의 고유치는 $4,2$. 단위벡터 위에서 이차형식의 최대·최소는 고유치이므로 $M+m=4+2=6$. 답: 3." },
  { n:24, subject:"다변수함수", unit:"체적과 곡면적", concept:"구면 곡면적", difficulty:"hard",
    question:"좌표공간에서 $\\{(x,y,z)\\mid x^2+y^2+z^2=4,\\ z\\ge 0,\\ (x-1)^2+y^2\\le 1\\}$로 주어진 곡면의 넓이는?",
    options:opts5("$4\\pi-8$","$3\\pi-5$","$2\\pi-2$","$\\pi+1$","$2\\pi-1$"), correct:"1",
    explanation:"$z=\\sqrt{4-x^2-y^2}$의 곡면적. $dS=\\dfrac{2}{\\sqrt{4-x^2-y^2}}dA$. 극좌표 $r\\le 2\\cos\\theta$, 대칭으로 $\\times 2$. 적분 결과 $4\\pi-8$. 답: 1." },
  { n:25, subject:"다변수함수", unit:"체적과 곡면적", concept:"구·포물면 부피", difficulty:"hard",
    question:"구면 $x^2+y^2+z^2=2$와 포물면 $z=x^2+y^2$으로 둘러싸인 영역 중 $z\\ge 0$인 부분의 부피는?",
    options:opts5("$\\dfrac{(8\\sqrt 2-7)\\pi}{6}$","$\\dfrac{(7\\sqrt 2-6)\\pi}{6}$","$\\dfrac{(6\\sqrt 2-5)\\pi}{6}$","$\\dfrac{(5\\sqrt 2-4)\\pi}{6}$","$\\dfrac{(4\\sqrt 2-3)\\pi}{6}$"), correct:"1",
    explanation:"교선: $z=1$. 1사분면만 계산해 $\\times 4$. $V=\\iint_{x^2+y^2\\le 1}[\\sqrt{2-x^2-y^2}-(x^2+y^2)]\\,dA$. 극좌표 적분 결과 $\\dfrac{(8\\sqrt 2-7)\\pi}{6}$. 답: 1." },
  { n:26, subject:"다변수함수", unit:"선적분과 면적분", concept:"구면 면적분 대칭성", difficulty:"hard",
    question:"$S=\\{(x,y,z)\\in\\mathbb R^3\\mid x^2+y^2+z^2=4\\}$일 때, 곡면적분 $\\displaystyle\\iint_S z^2\\,dS$의 값은?",
    options:opts5("$\\dfrac{16\\pi}{3}$","$\\dfrac{32\\pi}{3}$","$16\\pi$","$\\dfrac{64\\pi}{3}$","$32\\pi$"), correct:"4",
    explanation:"대칭성으로 $\\iint x^2 dS=\\iint y^2 dS=\\iint z^2 dS$. 합 $=\\iint(x^2+y^2+z^2)dS=4\\cdot 16\\pi=64\\pi$. 따라서 $\\iint z^2 dS=\\dfrac{64\\pi}{3}$. 답: 4." },
  { n:27, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피 최적화", difficulty:"killer",
    question:"실수 $a\\ (0<a<1)$에 대하여 곡선 $y=x-x^3\\ (0\\le x\\le a),\\ x=a$ 및 $x$축으로 둘러싸인 영역을 직선 $x=a$를 중심으로 회전하여 얻은 입체의 부피를 $V_1$이라 하고, 곡선 $y=x-x^3\\ (a\\le x\\le 1),\\ x=a$ 및 $x$축으로 둘러싸인 영역을 직선 $x=a$를 중심으로 회전하여 얻은 입체의 부피를 $V_2$라 하자. $V_1+3V_2$가 최소가 되는 $a$의 값은?",
    options:opts5("$\\dfrac{\\sqrt 2}{6}$","$\\dfrac{\\sqrt 2}{5}$","$\\dfrac{\\sqrt 2}{4}$","$\\dfrac{\\sqrt 2}{3}$","$\\dfrac{\\sqrt 2}{2}$"), correct:"5",
    explanation:"$V_1+3V_2$를 $a$의 함수로 표현하고 라이프니츠 공식으로 미분 후 $0$이 되는 점을 찾으면 $4a^4-8a^2+3=0$, 즉 $(2a^2-1)(2a^2-3)=0$. $0<a<1$ 조건으로 $a=\\dfrac{\\sqrt 2}{2}$. 답: 5." },
  { n:28, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리", difficulty:"hard",
    question:"곡선 $C$가 반시계 방향으로 움직이는 타원 $x^2+4y^2=4$일 때 선적분 $\\displaystyle\\int_C(x+y^3+e^x)dx+(y+xe^y)dy$의 값은?",
    options:opts5("$-\\dfrac{3\\pi}{2}$","$-\\dfrac{\\pi}{2}$","$0$","$\\dfrac{\\pi}{2}$","$\\dfrac{3\\pi}{2}$"), correct:"1",
    explanation:"그린정리: $\\iint_D(Q_x-P_y)dA=\\iint(e^y-3y^2)dA$. 변환 $y=Y/2$로 영역을 단위원으로 펴면 $\\iint e^{Y/2}dA$의 비대칭 부분과 정칙 부분을 분리해 정리, $-\\dfrac{3}{2}\\pi$를 얻음. 답: 1." },
  { n:29, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리·그래디언트", difficulty:"hard",
    question:"포물면 $z=1-(x^2+y^2)$와 평면 $z=0$으로 둘러싸인 영역을 $D$, $D$의 경계면을 $S$라고 하자. 그리고 경계면 $S$에서 $D$에 대한 바깥 방향의 단위 법선 벡터장을 $\\vec n$이라고 하자. 이 때 함수 $f(x,y,z)=(x^2+y^2-4)e^z$의 그래디언트 벡터장 $\\nabla f$의 $S$에서의 유속 $\\displaystyle\\iint_S\\nabla f\\cdot\\vec n\\,dS$를 구하면?",
    options:opts5("$\\!\\left(e-\\dfrac{1}{2}\\right)\\pi$","$\\!\\left(e-\\dfrac{3}{2}\\right)\\pi$","$\\!\\left(e-\\dfrac{5}{2}\\right)\\pi$","$\\!\\left(e-\\dfrac{7}{2}\\right)\\pi$","$\\!\\left(e-\\dfrac{9}{2}\\right)\\pi$"), correct:"3",
    explanation:"$\\nabla\\cdot\\nabla f=\\Delta f=(x^2+y^2)e^z$. 발산정리로 $\\iiint_D(x^2+y^2)e^z dV$. 원기둥좌표계로 적분. 결과 $\\!\\left(e-\\dfrac{5}{2}\\right)\\pi$. 답: 3." },
  { n:30, subject:"다변수함수", unit:"선적분과 면적분", concept:"스톡스 정리", difficulty:"hard",
    question:"$\\vec n$을 구면 $S=\\{(x,y,z)\\in\\mathbb R^3\\mid x^2+y^2+z^2=1\\}$에서 바깥 방향의 단위법선 벡터장이라고 하고 $S$ 중 $z\\ge x$인 부분을 $P$라고 하자. 이 때, 벡터장 $F(x,y,z)=(-2\\sqrt 2 x^2 y,\\ y^2,\\ z^2)$에 대하여 $P$에서의 $\\nabla\\times F$의 유속 $\\displaystyle\\iint_P(\\nabla\\times F)\\cdot\\vec n\\,dS$를 구하면?",
    options:opts5("$\\dfrac{\\pi}{4}$","$\\dfrac{\\pi}{2}$","$\\dfrac{3\\pi}{4}$","$\\pi$","$\\dfrac{5\\pi}{4}$"), correct:"1",
    explanation:"스톡스 정리로 평면 $z=x$ 위 디스크에서 적분. $\\nabla\\times F=(0,0,2\\sqrt 2 x^2)$, 단위법선 $\\dfrac{(-1,0,1)}{\\sqrt 2}$. 디스크는 $2x^2+y^2\\le 1$. 변환 후 $\\iint X^2 dX dY$ = $\\pi/4$. 답: 1." },
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
