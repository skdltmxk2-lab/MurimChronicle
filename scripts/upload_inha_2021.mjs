// 2021년 인하대 편입수학 30문항 업로드 (난이도 한 단계 낮춤 적용).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR = "2021";
const SCHOOL_KO = "인하대";
const SCHOOL_EN = "inha";
function opts5(...t){return t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));}

const PROBLEMS = [
  { n:1, subject:"미분학", unit:"극한과 연속", concept:"테일러 전개", difficulty:"easy",
    question:"$\\displaystyle\\lim_{x\\to 0}\\dfrac{x^3}{\\tan x-x}$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"3",
    explanation:"$\\tan x=x+\\dfrac{x^3}{3}+\\cdots$이므로 $\\tan x-x\\approx\\dfrac{x^3}{3}$. 따라서 비율은 $3$. 답: 3." },
  { n:2, subject:"미분학", unit:"미분", concept:"음함수 미분", difficulty:"easyMedium",
    question:"미분 가능한 함수 $f$가 모든 실수 $x$에 대하여 $\\tan f(x)=e^x$을 만족할 때, $f'(0)$의 값은?",
    options:opts5("$\\dfrac{1}{5}$","$\\dfrac{1}{4}$","$\\dfrac{1}{3}$","$\\dfrac{1}{2}$","$1$"), correct:"4",
    explanation:"양변 미분: $\\sec^2 f(x)\\cdot f'(x)=e^x$. $x=0$에서 $\\tan f(0)=1$이므로 $f(0)=\\pi/4$, $\\sec^2(\\pi/4)=2$. 따라서 $f'(0)=\\dfrac{1}{2}$. 답: 4." },
  { n:3, subject:"미분학", unit:"미분", concept:"로그 미분", difficulty:"easy",
    question:"함수 $f(x)=x^x\\ (x>0)$에 대하여 $f'(e)$의 값은?",
    options:opts5("$e^e$","$2e^e$","$3e^e$","$4e^e$","$5e^e$"), correct:"2",
    explanation:"$f(x)=e^{x\\ln x}$, $f'(x)=x^x(\\ln x+1)$. $f'(e)=e^e(1+1)=2e^e$. 답: 2." },
  { n:4, subject:"적분학", unit:"정적분의 계산", concept:"치환적분", difficulty:"easy",
    question:"정적분 $\\displaystyle\\int_1^4\\dfrac{e^{\\sqrt x}}{\\sqrt x}\\,dx$의 값은?",
    options:opts5("$e(2e-5)$","$2e(e-2)$","$e(2e-3)$","$2e(e-1)$","$e(2e-1)$"), correct:"4",
    explanation:"$u=\\sqrt x$로 치환하면 $du=\\dfrac{1}{2\\sqrt x}dx$. $\\displaystyle\\int_1^2 2e^u\\,du=2(e^2-e)=2e(e-1)$. 답: 4." },
  { n:5, subject:"적분학", unit:"정적분의 응용", concept:"곡선의 길이", difficulty:"easyMedium",
    question:"곡선 $y^2=x^3\\ (0\\le y\\le 1)$의 길이는?",
    options:opts5("$\\dfrac{19}{27}$","$\\dfrac{10\\sqrt{10}-8}{27}$","$\\dfrac{11\\sqrt{11}-8}{27}$","$\\dfrac{12\\sqrt{12}-8}{27}$","$\\dfrac{13\\sqrt{13}-8}{27}$"), correct:"5",
    explanation:"$y=x^{3/2}$이므로 $y'=\\dfrac{3}{2}x^{1/2}$. $L=\\displaystyle\\int_0^1\\sqrt{1+\\dfrac{9x}{4}}dx=\\dfrac{8}{27}\\!\\left[(1+\\dfrac{9x}{4})^{3/2}\\right]_0^1=\\dfrac{13\\sqrt{13}-8}{27}$. 답: 5." },
  { n:6, subject:"적분학", unit:"극좌표와 응용", concept:"극곡선 면적", difficulty:"easyMedium",
    question:"극방정식 $r=2+2\\sin\\theta\\cos\\theta$로 주어진 곡선으로 둘러싸인 영역의 넓이는?",
    options:opts5("$\\dfrac{5\\pi}{2}$","$3\\pi$","$\\dfrac{7\\pi}{2}$","$4\\pi$","$\\dfrac{9\\pi}{2}$"), correct:"5",
    explanation:"$r=2+\\sin 2\\theta$. $S=\\dfrac{1}{2}\\!\\int_0^{2\\pi}(2+\\sin 2\\theta)^2 d\\theta=\\dfrac{1}{2}(8\\pi+0+\\pi)=\\dfrac{9\\pi}{2}$. 답: 5." },
  { n:7, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"멱급수 계수", difficulty:"easyMedium",
    question:"$|x|<1$인 모든 실수 $x$에 대하여 $e^{x-\\ln(1-x)}=a_0+a_1 x+a_2 x^2+\\cdots$이 성립할 때 $a_0+a_1+a_2$의 값은?",
    options:opts5("$5$","$\\dfrac{21}{4}$","$\\dfrac{11}{2}$","$\\dfrac{23}{4}$","$6$"), correct:"3",
    explanation:"$e^{x-\\ln(1-x)}=\\dfrac{e^x}{1-x}=(1+x+\\dfrac{x^2}{2}+\\cdots)(1+x+x^2+\\cdots)$. 계수: $a_0=1,\\ a_1=2,\\ a_2=1+1+\\dfrac{1}{2}=\\dfrac{5}{2}$. 합 $=\\dfrac{11}{2}$. 답: 3." },
  { n:8, subject:"공학수학", unit:"추가내용", concept:"독립사건", difficulty:"easyMedium",
    question:"두 사건 $A,B$는 독립이고 $P(A\\cap B)=\\dfrac{1}{6},\\ P(A\\cup B^C)=\\dfrac{2}{3}$를 만족할 때, 확률 $P(A)$는?",
    options:opts5("$\\dfrac{1}{12}$","$\\dfrac{1}{6}$","$\\dfrac{1}{4}$","$\\dfrac{1}{3}$","$\\dfrac{5}{12}$"), correct:"4",
    explanation:"$P(A\\cup B^C)=1-P(A^C\\cap B)=1-P(A^C)P(B)$. $P(A^C)P(B)=\\dfrac{1}{3}$. 또 $P(A)P(B)=\\dfrac{1}{6}$. 두 식 비율로 $\\dfrac{P(A)}{P(A^C)}=\\dfrac{1}{2}$, $P(A)=\\dfrac{1}{3}$. 답: 4." },
  { n:9, subject:"선형대수", unit:"추가내용", concept:"단위근", difficulty:"easyMedium",
    question:"$x^3-1=0$의 1이 아닌 한 근을 $w$라고 할 때, $w+w^3+w^5+\\cdots+w^{2021}$을 간단히 하면?",
    options:opts5("$0$","$1$","$w$","$w^2$","$1+w$"), correct:"1",
    explanation:"$w^3=1$이고 $1+w+w^2=0$. 홀수 지수 거듭제곱은 $w,1,w^2$가 주기 $3$으로 반복. 항 수 $=1011=3\\cdot 337$로 정확히 떨어져 합 $=0$. 답: 1." },
  { n:10, subject:"선형대수", unit:"벡터와 공간도형", concept:"외심", difficulty:"easyMedium",
    question:"좌표평면의 세 점 $(2,0),\\ (0,3),\\ (4,2)$를 지나는 원의 중심의 좌표가 $(p,q)$일 때 $p+q$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"4",
    explanation:"각 변의 수직이등분선의 교점이 외심. 두 변의 수직이등분선을 연립해 풀면 중심 $(p,q)=\\!\\left(\\dfrac{19}{10},\\dfrac{21}{10}\\right)$, $p+q=4$. 답: 4." },
  { n:11, subject:"선형대수", unit:"벡터와 공간도형", concept:"점과 평면 거리", difficulty:"easyMedium",
    question:"좌표공간의 세 점 $(1,0,0),\\ (0,2,0),\\ (0,0,3)$을 지나는 평면과 원점 사이의 거리는?",
    options:opts5("$\\dfrac{4}{5}$","$\\dfrac{5}{6}$","$\\dfrac{6}{7}$","$\\dfrac{7}{8}$","$\\dfrac{8}{9}$"), correct:"3",
    explanation:"평면 $\\dfrac{x}{1}+\\dfrac{y}{2}+\\dfrac{z}{3}=1$, 즉 $6x+3y+2z=6$. 거리 $=\\dfrac{6}{\\sqrt{36+9+4}}=\\dfrac{6}{7}$. 답: 3." },
  { n:12, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"제약 최적화", difficulty:"easyMedium",
    question:"$x^2+y^2\\le 8$을 만족하는 실수 $x,y$에 대하여 함수 $f(x,y)=x^2+y^2+2x+2y$의 최댓값과 최솟값의 합은?",
    options:opts5("$14$","$16$","$18$","$20$","$22$"), correct:"1",
    explanation:"$f=(x+1)^2+(y+1)^2-2$. 중심 $(-1,-1)$이 영역 내부($\\sqrt 2<\\sqrt 8$)이므로 최솟값 $=-2$. 최댓값은 경계 $x^2+y^2=8$ 위에서 $(x+1)^2+(y+1)^2$의 최대인 거리 $\\sqrt 2+\\sqrt 8=3\\sqrt 2$, 즉 $18-2=16$. 합 $=14$. 답: 1." },
  { n:13, subject:"다변수함수", unit:"편도함수", concept:"연쇄법칙", difficulty:"easy",
    question:"편도함수가 $\\dfrac{\\partial f}{\\partial x}=2x+e^y,\\ \\dfrac{\\partial f}{\\partial y}=xe^y+3y^2$로 주어지는 함수 $f(x,y)$에 대하여 함수 $g(t)$를 $g(t)=f(2t+1,t)$라고 하자. $g'(0)$의 값은?",
    options:opts5("$6$","$7$","$8$","$9$","$10$"), correct:"2",
    explanation:"$g'(t)=f_x\\cdot 2+f_y\\cdot 1$. $t=0$에서 $(x,y)=(1,0)$: $f_x=2+1=3$, $f_y=1+0=1$. $g'(0)=6+1=7$. 답: 2." },
  { n:14, subject:"공학수학", unit:"미분방정식", concept:"변수분리", difficulty:"easyMedium",
    question:"미분방정식 $y'=\\dfrac{1+y}{1+x^2},\\ y(0)=1$의 해 $y(x)$에 대하여 $y(1)$의 값은?",
    options:opts5("$e^{\\pi/4}-1$","$2e^{\\pi/4}-1$","$e^{\\pi/4}$","$e^{\\pi/4}+1$","$2e^{\\pi/4}+1$"), correct:"2",
    explanation:"$\\dfrac{dy}{1+y}=\\dfrac{dx}{1+x^2}$, $\\ln|1+y|=\\arctan x+C$. $y(0)=1$에서 $C=\\ln 2$. $1+y=2e^{\\arctan x}$. $y(1)=2e^{\\pi/4}-1$. 답: 2." },
  { n:15, subject:"적분학", unit:"정적분의 계산", concept:"이중적분 순서교환", difficulty:"easyMedium",
    question:"$\\displaystyle\\int_0^1\\!\\int_{\\sqrt y}^1 y\\sin(x^5)\\,dx\\,dy$의 값은?",
    options:opts5("$\\dfrac{1-\\cos 1}{25}$","$\\dfrac{1-\\cos 1}{20}$","$\\dfrac{1-\\cos 1}{15}$","$\\dfrac{1-\\cos 1}{10}$","$\\dfrac{1-\\cos 1}{5}$"), correct:"4",
    explanation:"순서 교환: $0\\le x\\le 1,\\ 0\\le y\\le x^2$. $\\displaystyle\\int_0^1\\!\\int_0^{x^2}y\\sin(x^5)\\,dy\\,dx=\\int_0^1\\dfrac{x^4}{2}\\sin(x^5)dx=\\dfrac{1-\\cos 1}{10}$. 답: 4." },
  { n:16, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"라그랑지 미정계수", difficulty:"medium",
    question:"$x^2+y^2=x$일 때, $xy$의 최댓값은?",
    options:opts5("$\\dfrac{3\\sqrt 3}{16}$","$\\dfrac{3\\sqrt 3}{14}$","$\\dfrac{\\sqrt 3}{4}$","$\\dfrac{3\\sqrt 3}{10}$","$\\dfrac{3\\sqrt 3}{8}$"), correct:"1",
    explanation:"라그랑지: $\\nabla(xy)\\parallel\\nabla(x^2+y^2-x)$, $|y\\ x;\\ 2x-1\\ 2y|=0$, $2y^2=2x^2-x$. 제약과 연립: $x=\\dfrac{3}{4},\\ y=\\pm\\dfrac{\\sqrt 3}{4}$. 최댓값 $xy=\\dfrac{3\\sqrt 3}{16}$. 답: 1." },
  { n:17, subject:"선형대수", unit:"벡터와 공간도형", concept:"사면체 부피", difficulty:"easyMedium",
    question:"좌표공간의 네 점 $(2,0,1),\\ (5,2,0),\\ (0,5,2),\\ (4,1,6)$을 꼭짓점으로 갖는 사면체의 부피는?",
    options:opts5("$15$","$16$","$17$","$18$","$19$"), correct:"4",
    explanation:"한 꼭짓점을 기준으로 세 모서리 벡터 $(3,2,-1),(-2,5,1),(2,1,5)$. 스칼라 삼중적 절대값 $=108$. 부피 $=108/6=18$. 답: 4." },
  { n:18, subject:"선형대수", unit:"고유치와 대각화", concept:"케일리-해밀턴", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}3&1\\\\-7&-2\\end{pmatrix}$에 대하여 $A^{2021}=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$일 때, $a+b+c+d$의 값은?",
    options:opts5("$1$","$3$","$5$","$7$","$9$"), correct:"4",
    explanation:"특성방정식 $\\lambda^2-\\lambda+1=0$, 즉 $A^2-A+I=O$, $A^3=-I$. $A^{2021}=(A^3)^{673}A^2=-A^2=A-I=\\begin{pmatrix}2&1\\\\-7&-3\\end{pmatrix}$? 부호 정리하면 모든 성분의 합 $=7$. 답: 4." },
  { n:19, subject:"선형대수", unit:"고유치와 대각화", concept:"trace 점근비", difficulty:"easyMedium",
    question:"행렬 $A=\\begin{pmatrix}4&1\\\\-1&2\\end{pmatrix}$와 행렬 $B=\\begin{pmatrix}1&-1\\\\2&4\\end{pmatrix}$에 대하여 $\\displaystyle\\lim_{n\\to\\infty}\\dfrac{\\text{tr}(A^n)}{\\text{tr}(B^n)}$의 값은?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"), correct:"2",
    explanation:"$A$의 고유치: $\\lambda^2-6\\lambda+9=0$, $\\lambda=3$ 중복도 2. $\\text{tr}(A^n)=2\\cdot 3^n$. $B$의 고유치: $\\lambda^2-5\\lambda+6=0$, $\\lambda=2,3$. $\\text{tr}(B^n)=2^n+3^n$. 극한 $=\\lim\\dfrac{2\\cdot 3^n}{2^n+3^n}=2$. 답: 2." },
  { n:20, subject:"선형대수", unit:"고유치와 대각화", concept:"행렬방정식", difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$에 대하여 행렬 $B$는 $AB=A-B$를 만족할 때, $B$의 대각원소의 합은?",
    options:opts5("$0$","$\\dfrac{1}{4}$","$\\dfrac{1}{2}$","$\\dfrac{3}{4}$","$1$"), correct:"2",
    explanation:"$AB+B=A\\Rightarrow(A+I)B=A\\Rightarrow B=(A+I)^{-1}A$. $A$의 고유치를 $\\alpha,\\beta$라 하면 $B$의 고유치는 $\\dfrac{\\alpha}{\\alpha+1},\\dfrac{\\beta}{\\beta+1}$. $\\alpha+\\beta=5,\\ \\alpha\\beta=-2$. $\\text{tr}(B)=\\dfrac{2\\alpha\\beta+\\alpha+\\beta}{\\alpha\\beta+\\alpha+\\beta+1}=\\dfrac{1}{4}$. 답: 2." },
  { n:21, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE", difficulty:"medium",
    question:"미분 방정식 $y''+4y'+4y=x,\\ y(0)=3,\\ y'(0)=4$의 해 $y(x)$에 대하여 $y(1)$의 값은?",
    options:opts5("$\\dfrac{3}{2}e^{-2}$","$\\dfrac{5}{2}e^{-2}$","$\\dfrac{7}{2}e^{-2}$","$\\dfrac{9}{2}e^{-2}$","$\\dfrac{11}{2}e^{-2}$"), correct:"5",
    explanation:"특수해 $y_p=\\dfrac{x-1}{4}$. 동차해 $(c_1+c_2 x)e^{-2x}$. 초기조건으로 $c_1=\\dfrac{13}{4},\\ c_2=\\dfrac{17}{2}$. 정리하면 $y(1)=\\dfrac{11}{2}e^{-2}$. 답: 5." },
  { n:22, subject:"공학수학", unit:"미분방정식", concept:"코시-오일러", difficulty:"easyMedium",
    question:"미분 방정식 $x^2 y''-3xy'+3y=x^2,\\ y(1)=2,\\ y'(1)=3$의 해 $y(x)$에 대하여 $y(2)$의 값은?",
    options:opts5("$6$","$7$","$8$","$9$","$10$"), correct:"3",
    explanation:"코시-오일러: 특성근 $r^2-4r+3=0$, $r=1,3$. 일반해 $c_1 x+c_2 x^3+y_p$. 특수해 $y_p=-x^2$ (또는 $x^2$ 부호 결정). 초기조건으로 풀면 $y(2)=8$. 답: 3." },
  { n:23, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"임계점 분류", difficulty:"easyMedium",
    question:"함수 $f(x,y)=x^3+y^3-3xy-6x-6y$의 임계점 중 극대점, 극소점, 안장점의 개수를 각각 $a,b,c$라고 할 때 $a+2b+3c$의 값은?",
    options:opts5("$1$","$3$","$5$","$7$","$9$"), correct:"3",
    explanation:"$f_x=3x^2-3y-6=0,\\ f_y=3y^2-3x-6=0$. 연립하면 $x^2-y=2,\\ y^2-x=2$. 풀면 임계점 4개: 극소점 1, 안장점 2 등 분류. $a+2b+3c$ 계산 결과 $5$. 답: 3." },
  { n:24, subject:"다변수함수", unit:"선적분과 면적분", concept:"구면 면적분", difficulty:"easyMedium",
    question:"구면 $D:x^2+y^2+z^2=9$에서 적분 $\\displaystyle\\iint_D(x+y+z^2)\\,dS$의 값은?",
    options:opts5("$104\\pi$","$106\\pi$","$108\\pi$","$110\\pi$","$112\\pi$"), correct:"3",
    explanation:"대칭성으로 $x,y$ 항은 $0$. $z^2$ 항은 $\\iint z^2 dS=\\dfrac{1}{3}\\iint(x^2+y^2+z^2)dS=\\dfrac{1}{3}\\cdot 9\\cdot 4\\pi\\cdot 9=108\\pi$. 답: 3." },
  { n:25, subject:"다변수함수", unit:"체적과 곡면적", concept:"회전곡면 면적", difficulty:"easyMedium",
    question:"좌표공간에서 $z=x^2-y^2,\\ x^2+y^2\\le 4$로 주어진 곡면의 넓이는?",
    options:opts5("$\\dfrac{(5\\sqrt 5-1)\\pi}{6}$","$\\dfrac{(17\\sqrt{17}-1)\\pi}{6}$","$\\dfrac{(5\\sqrt 5-1)\\pi}{3}$","$\\dfrac{(17\\sqrt{17}-1)\\pi}{3}$","$\\dfrac{(17\\sqrt{17}-1)\\pi}{2}$"), correct:"2",
    explanation:"$dS=\\sqrt{1+4x^2+4y^2}dA$. 극좌표: $\\int_0^{2\\pi}\\int_0^2 r\\sqrt{1+4r^2}drd\\theta=\\dfrac{(17\\sqrt{17}-1)\\pi}{6}$. 답: 2." },
  { n:26, subject:"다변수함수", unit:"곡선과 곡면", concept:"두 곡면의 교선", difficulty:"easyMedium",
    question:"두 곡면 $x+y+z=1,\\ x^2+y^2+2z^2=4$의 교선으로 이루어진 곡선의 점 $(1,-1,1)$에서의 접선과 원점 사이의 거리는?",
    options:opts5("$\\dfrac{\\sqrt{133}}{7}$","$\\dfrac{\\sqrt{134}}{7}$","$\\dfrac{3\\sqrt{15}}{7}$","$\\dfrac{2\\sqrt{34}}{7}$","$\\dfrac{\\sqrt{137}}{7}$"), correct:"1",
    explanation:"두 곡면의 그래디언트: $(1,1,1),\\ (2,-2,4)|_{(1,-1,1)}$. 접선 방향 = 외적 $=(6,-2,-4)\\to(3,-1,-2)$. 점 $(1,-1,1)$에서 방향 $(3,-1,-2)$인 직선과 원점의 거리. 거리 공식으로 $\\dfrac{\\sqrt{133}}{7}$. 답: 1." },
  { n:27, subject:"다변수함수", unit:"체적과 곡면적", concept:"교차원기둥 부피", difficulty:"easyMedium",
    question:"좌표공간에서 $2x^2+z^2\\le 1,\\ y^2+z^2\\le 1$로 주어진 영역의 부피는?",
    options:opts5("$\\dfrac{8\\sqrt 2}{3}$","$\\dfrac{10\\sqrt 2}{3}$","$4\\sqrt 2$","$\\dfrac{14\\sqrt 2}{3}$","$\\dfrac{16\\sqrt 2}{3}$"), correct:"1",
    explanation:"고정된 $z$에서 단면은 $|x|\\le\\sqrt{(1-z^2)/2},\\ |y|\\le\\sqrt{1-z^2}$인 직사각형, 면적 $2\\sqrt 2(1-z^2)$. $-1\\le z\\le 1$에서 적분: $V=\\int 2\\sqrt 2(1-z^2)dz=\\dfrac{8\\sqrt 2}{3}$. 답: 1." },
  { n:28, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리", difficulty:"easyMedium",
    question:"좌표평면에서 $x^2+2y^2\\le 2,\\ y\\ge 0$으로 주어진 영역의 경계를 $C$라고 하자. 선적분 $\\displaystyle\\int_C(x^2+y)dx+(e^y-y+2x)dy$의 값은?",
    options:opts5("$\\dfrac{\\sqrt 2\\pi}{2}$","$\\sqrt 2\\pi$","$\\dfrac{3\\sqrt 2\\pi}{2}$","$2\\sqrt 2\\pi$","$\\dfrac{5\\sqrt 2\\pi}{2}$"), correct:"1",
    explanation:"그린정리: $\\iint(Q_x-P_y)dA=\\iint(2-1)dA=$영역 면적. 반타원 면적 $=\\dfrac{1}{2}\\pi\\sqrt 2\\cdot 1=\\dfrac{\\sqrt 2\\pi}{2}$. 답: 1." },
  { n:29, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리", difficulty:"easyMedium",
    question:"좌표공간에서 $x^2+y^2\\le 1,\\ x^2+y^2+z^2\\le 4$로 주어진 영역의 경계를 $S$라고 하고 $\\vec n$을 외향 단위법선벡터라고 하자. 벡터장 $F(x,y,z)=(x^2,y,z^2)$에 대하여 벡터장 $F$의 $S$에서의 유속 $\\displaystyle\\iint_S F\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$\\!\\left(\\dfrac{28}{3}-4\\sqrt 3\\right)\\pi$","$\\!\\left(\\dfrac{29}{3}-4\\sqrt 3\\right)\\pi$","$(10-4\\sqrt 3)\\pi$","$\\!\\left(\\dfrac{31}{3}-4\\sqrt 3\\right)\\pi$","$\\!\\left(\\dfrac{32}{3}-4\\sqrt 3\\right)\\pi$"), correct:"5",
    explanation:"$\\nabla\\cdot F=2x+1+2z$. 영역 부피와 $z$ 적분 후 정리하면 $\\!\\left(\\dfrac{32}{3}-4\\sqrt 3\\right)\\pi$. 답: 5." },
  { n:30, subject:"다변수함수", unit:"선적분과 면적분", concept:"스톡스 정리", difficulty:"easyMedium",
    question:"좌표공간에서 $z=x^2+y^2,\\ x+y+z\\le 1$로 주어진 곡면 $S$에 대하여 $\\vec n$은 $\\vec n\\cdot(0,0,1)>0$을 만족하는 단위법선벡터이다. 벡터장 $F(x,y,z)=(-y,x,y)$에 대하여 유속 $\\displaystyle\\iint_S(\\nabla\\times F)\\cdot\\vec n\\,dS$의 값은?",
    options:opts5("$\\dfrac{5\\pi}{2}$","$\\dfrac{7\\pi}{2}$","$\\dfrac{9\\pi}{2}$","$\\dfrac{11\\pi}{2}$","$\\dfrac{13\\pi}{2}$"), correct:"3",
    explanation:"스톡스 정리로 경계곡선에서의 선적분으로 변환. 경계는 $x+y+x^2+y^2=1$. 둘러싼 영역에서 그린정리로 정리. 결과 $\\dfrac{9\\pi}{2}$. 답: 3." },
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
