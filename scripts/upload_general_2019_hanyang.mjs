// 2019년 한양대(본교) 편입수학 객관식 20문항 (Q2~Q21, 5지선다)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2019", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:2, subject:"적분학", unit:"정적분의 응용", concept:"코시-슈바르츠 부등식",
    difficulty:"medium",
    question:"세 실수 $a,b,c$의 평균이 $\\dfrac{13}{12}$일 때, $8a^4+27b^4+64c^4$의 최솟값은?",
    options:opts5("$\\dfrac{13}{12}$","$\\dfrac{52}{3}$","$\\dfrac{351}{4}$","$\\dfrac{832}{3}$","$1404$"),
    correct:"3",
    explanation:"$a+b+c=\\dfrac{13}{4}$이라는 제약조건에서 $f(a,b,c)=8a^4+27b^4+64c^4$의 최솟값을 구한다.\n라그랑주 승수법: $\\nabla f=\\lambda\\nabla g$에서 $32a^3=\\lambda,\\,108b^3=\\lambda,\\,256c^3=\\lambda$.\n따라서 $32a^3=108b^3=256c^3$, 즉 $\\dfrac{a^3}{1/32}=\\dfrac{b^3}{1/108}=\\dfrac{c^3}{1/256}$.\n각 변수의 비례관계: $a^3:b^3:c^3=\\dfrac{1}{32}:\\dfrac{1}{108}:\\dfrac{1}{256}$. 양변의 세제곱근을 취하면 $a:b:c=\\dfrac{1}{2^{5/3}}:\\dfrac{1}{(108)^{1/3}}:\\dfrac{1}{2^{8/3}}$.\n실은 $32a^3=108b^3$에서 $\\dfrac{a}{b}=\\!\\left(\\dfrac{108}{32}\\right)^{1/3}=\\!\\left(\\dfrac{27}{8}\\right)^{1/3}=\\dfrac{3}{2}$이고, $108b^3=256c^3$에서 $\\dfrac{b}{c}=\\!\\left(\\dfrac{256}{108}\\right)^{1/3}=\\!\\left(\\dfrac{64}{27}\\right)^{1/3}=\\dfrac{4}{3}$.\n$a=\\dfrac{3}{2}b,\\,c=\\dfrac{3}{4}b$. 제약조건 $\\dfrac{3b}{2}+b+\\dfrac{3b}{4}=\\dfrac{13b}{4}=\\dfrac{13}{4}$이므로 $b=1$. 따라서 $a=\\dfrac{3}{2},\\,b=1,\\,c=\\dfrac{3}{4}$.\n$f=8\\!\\left(\\dfrac{3}{2}\\right)^4+27\\cdot 1^4+64\\!\\left(\\dfrac{3}{4}\\right)^4=8\\cdot\\dfrac{81}{16}+27+64\\cdot\\dfrac{81}{256}=\\dfrac{81}{2}+27+\\dfrac{81}{4}=\\dfrac{162+108+81}{4}=\\dfrac{351}{4}$.",
  },
  {
    n:3, subject:"다변수함수", unit:"곡선과 곡면", concept:"공간곡선의 곡률",
    difficulty:"easyMedium",
    question:"곡선 $r(t)=\\cosh t\\,\\mathbf{i}+\\sinh t\\,\\mathbf{j}+t\\,\\mathbf{k}$에서 $t=0$일 때의 곡률은?",
    options:opts5("$\\dfrac{1}{2}$","$\\dfrac{1}{\\sqrt 2}$","$1$","$\\sqrt 2$","$2$"),
    correct:"1",
    explanation:"$r'(t)=(\\sinh t,\\cosh t,1)$이므로 $r'(0)=(0,1,1)$, $|r'(0)|=\\sqrt 2$.\n$r''(t)=(\\cosh t,\\sinh t,0)$이므로 $r''(0)=(1,0,0)$.\n$r'(0)\\times r''(0)=(0,1,1)\\times(1,0,0)=(1\\cdot 0-1\\cdot 0,\\ 1\\cdot 1-0\\cdot 0,\\ 0\\cdot 0-1\\cdot 1)=(0,1,-1)$. 크기 $=\\sqrt 2$.\n$\\kappa=\\dfrac{|r'\\times r''|}{|r'|^3}=\\dfrac{\\sqrt 2}{(\\sqrt 2)^3}=\\dfrac{\\sqrt 2}{2\\sqrt 2}=\\dfrac{1}{2}$.",
  },
  {
    n:4, subject:"다변수함수", unit:"체적과 곡면적", concept:"곡면적",
    difficulty:"easyMedium",
    question:"곡면 $z=2-x^2-y^2,\\ z\\ge 0$의 넓이는?",
    options:opts5("$\\dfrac{13\\pi}{2}$","$\\dfrac{13\\pi}{3}$","$\\dfrac{13\\pi}{6}$","$\\dfrac{(17\\sqrt{17}-1)\\pi}{3}$","$\\dfrac{(17\\sqrt{17}-1)\\pi}{6}$"),
    correct:"2",
    explanation:"$z\\ge 0$에서 정의역은 $x^2+y^2\\le 2$. 곡면적 공식\n$S=\\displaystyle\\iint_D\\sqrt{1+z_x^2+z_y^2}\\,dA=\\iint_D\\sqrt{1+4x^2+4y^2}\\,dA$.\n극좌표 $x=r\\cos\\theta,\\,y=r\\sin\\theta$, $0\\le r\\le\\sqrt 2,\\,0\\le\\theta\\le 2\\pi$:\n$S=\\displaystyle\\int_0^{2\\pi}\\!\\!\\int_0^{\\sqrt 2}\\sqrt{1+4r^2}\\cdot r\\,dr\\,d\\theta=2\\pi\\cdot\\dfrac{1}{12}\\bigl[(1+4r^2)^{3/2}\\bigr]_0^{\\sqrt 2}=\\dfrac{\\pi}{6}(9^{3/2}-1)=\\dfrac{\\pi}{6}(27-1)=\\dfrac{26\\pi}{6}=\\dfrac{13\\pi}{3}$.",
  },
  {
    n:5, subject:"다변수함수", unit:"삼중적분과 극좌표계", concept:"두 구의 교집합 부피",
    difficulty:"hard",
    question:"좌표공간에서 영역 $D=\\!\\left\\{(x,y,z)\\,\\middle|\\,x^2+y^2+z^2\\ge 9,\\ x^2+\\!\\left(y-\\dfrac{9}{2}\\right)^2+z^2\\le\\dfrac{81}{4}\\right\\}$의 부피는?",
    options:opts5("$105\\pi$","$108\\pi$","$111\\pi$","$114\\pi$","$117\\pi$"),
    correct:"2",
    explanation:"큰 구 $S_1$: 중심 $(0,9/2,0)$, 반지름 $9/2$. 작은 구 $S_2$: 중심 $(0,0,0)$, 반지름 $3$.\n두 구를 표준형으로 펼치면 $S_1: x^2+y^2+z^2=9y$, $S_2: x^2+y^2+z^2=9$.\n구면좌표 $r^2=x^2+y^2+z^2$, $y=r\\cos\\phi$로 두면 $S_1$ 내부는 $r\\le 9\\cos\\phi$, $S_2$ 외부는 $r\\ge 3$.\n$D$ 영역: $3\\le r\\le 9\\cos\\phi$. 이 부등식이 성립하려면 $\\cos\\phi\\ge 1/3$, 즉 $0\\le\\phi\\le\\arccos(1/3)$.\n$V=\\displaystyle\\int_0^{2\\pi}\\!\\!\\int_0^{\\arccos(1/3)}\\!\\!\\int_3^{9\\cos\\phi} r^2\\sin\\phi\\,dr\\,d\\phi\\,d\\theta=2\\pi\\!\\int_0^{\\arccos(1/3)}\\sin\\phi\\cdot\\dfrac{(9\\cos\\phi)^3-27}{3}\\,d\\phi$.\n$u=\\cos\\phi$로 치환, $u:1\\to 1/3$:\n$V=\\dfrac{2\\pi}{3}\\!\\int_{1/3}^1(729u^3-27)du=\\dfrac{2\\pi}{3}\\!\\left[\\dfrac{729u^4}{4}-27u\\right]_{1/3}^1=\\dfrac{2\\pi}{3}\\!\\left[\\!\\left(\\dfrac{729}{4}-27\\right)-\\!\\left(\\dfrac{9}{4}-9\\right)\\right]=\\dfrac{2\\pi}{3}\\cdot 162=108\\pi$.",
  },
  {
    n:6, subject:"다변수함수", unit:"선적분과 면적분", concept:"닫힌곡선 적분",
    difficulty:"medium",
    question:"평면 $x+3y+z=2$와 원기둥면 $x^2+y^2=4$가 만나는 곡선을 $C$라 할 때, 선적분 $\\displaystyle\\oint_C-\\sqrt{1+x^2+y^2}\\,dx+x\\,dy-z^3\\,dz$의 값은? (단, $C$의 방향은 이 곡선을 $xy$평면으로 정사영하였을 때, 시계 반대 방향이 되도록 주어져 있다.)",
    options:opts5("$\\pi$","$2\\pi$","$3\\pi$","$4\\pi$","$5\\pi$"),
    correct:"4",
    explanation:"곡선 $C$ 위에서 $x^2+y^2=4$이므로 $\\sqrt{1+x^2+y^2}=\\sqrt 5$ (상수).\n①$\\displaystyle\\oint_C-\\sqrt 5\\,dx=-\\sqrt 5\\!\\oint_C dx=0$ (닫힌 곡선).\n②$\\displaystyle\\oint_C -z^3\\,dz=\\!\\oint_C-d\\!\\left(\\dfrac{z^4}{4}\\right)=0$ (전미분).\n③남은 항 $\\displaystyle\\oint_C x\\,dy$. 매개변수 $x=2\\cos t,\\,y=2\\sin t,\\,t:0\\to 2\\pi$:\n$\\displaystyle\\int_0^{2\\pi}2\\cos t\\cdot 2\\cos t\\,dt=4\\!\\int_0^{2\\pi}\\cos^2 t\\,dt=4\\pi$.\n총합 $=4\\pi$.",
  },
  {
    n:7, subject:"다변수함수", unit:"삼중적분과 극좌표계", concept:"적분 순서 변경",
    difficulty:"mediumHard",
    question:"적분 $\\displaystyle\\int_0^1\\!\\!\\int_0^{z^2}\\!\\!\\int_0^{\\sqrt y}\\sqrt{4y^{3/2}-3y^2}\\,dx\\,dy\\,dz$의 값은?",
    options:opts5("$\\dfrac{1}{18}$","$\\dfrac{1}{15}$","$\\dfrac{1}{12}$","$\\dfrac{1}{10}$","$\\dfrac{1}{9}$"),
    correct:"5",
    explanation:"가장 안쪽 $x$ 적분: $\\displaystyle\\int_0^{\\sqrt y}dx=\\sqrt y$. 따라서 적분은 $\\displaystyle\\int_0^1\\!\\!\\int_0^{z^2}\\sqrt y\\,\\sqrt{4y^{3/2}-3y^2}\\,dy\\,dz$.\n적분 영역 $\\{0\\le z\\le 1,\\,0\\le y\\le z^2\\}=\\{0\\le y\\le 1,\\,\\sqrt y\\le z\\le 1\\}$로 순서 교환.\n$z$ 적분: $\\displaystyle\\int_{\\sqrt y}^1 dz=1-\\sqrt y$. 결국 $\\displaystyle\\int_0^1(\\sqrt y-y)\\sqrt{4y^{3/2}-3y^2}\\,dy$.\n핵심 관찰: $\\dfrac{d}{dy}(4y^{3/2}-3y^2)=6\\sqrt y-6y=6(\\sqrt y-y)$.\n따라서 $\\displaystyle\\int(\\sqrt y-y)\\sqrt{4y^{3/2}-3y^2}\\,dy=\\dfrac{1}{6}\\!\\int\\sqrt{u}\\,du=\\dfrac{1}{9}u^{3/2}+C$ ($u=4y^{3/2}-3y^2$).\n$y=0$일 때 $u=0$, $y=1$일 때 $u=4-3=1$. 따라서 적분값 $=\\dfrac{1}{9}\\bigl[u^{3/2}\\bigr]_0^1=\\dfrac{1}{9}$.",
  },
  {
    n:8, subject:"다변수함수", unit:"극좌표와 응용", concept:"여러 적분의 비교",
    difficulty:"medium",
    question:"다음 중 나머지와 다른 값을 갖는 것은?\n(1) $4\\displaystyle\\sum_{n=0}^{\\infty}\\dfrac{(-1)^n}{2n+1}$\n(2) $\\displaystyle\\int_{-\\infty}^{\\infty}\\dfrac{1}{1+x^2}\\,dx$\n(3) $\\displaystyle\\int_{-\\infty}^{\\infty}\\!\\!\\int_{-\\infty}^{\\infty}\\dfrac{1}{(1+x^2+y^2)^2}\\,dx\\,dy$\n(4) $\\dfrac{1}{2}\\displaystyle\\oint_C-y\\,dx+x\\,dy$ (단, $C$는 시계 반대방향으로 주어진 곡선 $x^2+y^2=1$)\n(5) 극좌표로 나타낸 곡선 $r=\\dfrac{2\\sqrt 3}{3}(1+\\cos 2\\theta)$에 둘러싸인 영역의 넓이",
    options:opts5("(1)","(2)","(3)","(4)","(5)"),
    correct:"5",
    explanation:"(1)$=4\\cdot\\dfrac{\\pi}{4}=\\pi$ (라이프니츠 급수).\n(2)$=\\bigl[\\tan^{-1}x\\bigr]_{-\\infty}^{\\infty}=\\pi$.\n(3) 극좌표: $\\displaystyle\\int_0^{2\\pi}\\!\\!\\int_0^{\\infty}\\dfrac{r}{(1+r^2)^2}dr\\,d\\theta=2\\pi\\cdot\\dfrac{1}{2}=\\pi$.\n(4)$=\\dfrac{1}{2}\\cdot 2\\cdot(\\text{단위원의 면적})=\\pi$ (그린정리: $\\dfrac{1}{2}\\oint(-y\\,dx+x\\,dy)$는 영역의 면적).\n(5) $A=\\dfrac{1}{2}\\!\\int_0^{2\\pi}r^2\\,d\\theta=\\dfrac{1}{2}\\cdot\\dfrac{4}{3}\\!\\int_0^{2\\pi}(1+\\cos 2\\theta)^2 d\\theta=\\dfrac{2}{3}\\!\\int_0^{2\\pi}\\!\\left(\\dfrac{3}{2}+2\\cos 2\\theta+\\dfrac{\\cos 4\\theta}{2}\\right)d\\theta=\\dfrac{2}{3}\\cdot 3\\pi=2\\pi$.\n오직 (5)만 $2\\pi$로 다르다.",
  },
  {
    n:9, subject:"적분학", unit:"정적분과 무한급수", concept:"리만합",
    difficulty:"medium",
    question:"극한 $\\displaystyle\\lim_{n\\to\\infty}\\dfrac{1}{n^2}\\!\\prod_{k=1}^{n}(n^2+k^2)^{1/n}$의 값은?",
    options:opts5("$2e^{\\pi/2-3}$","$2e^{\\pi/2-2}$","$2e^{\\pi/2-1}$","$\\dfrac{5}{2}e^{\\pi/2+1}$","$\\dfrac{5}{2}e^{\\pi/2+2}$"),
    correct:"2",
    explanation:"로그를 취하면\n$\\ln L=\\displaystyle\\lim_{n\\to\\infty}\\!\\left[-2\\ln n+\\dfrac{1}{n}\\sum_{k=1}^{n}\\ln(n^2+k^2)\\right]=\\lim_{n\\to\\infty}\\dfrac{1}{n}\\sum_{k=1}^{n}\\ln\\!\\left[1+\\!\\left(\\dfrac{k}{n}\\right)^2\\right]$.\n이는 리만합으로 $\\displaystyle\\int_0^1\\ln(1+x^2)\\,dx$.\n부분적분 ($u=\\ln(1+x^2),\\,dv=dx$): $\\bigl[x\\ln(1+x^2)\\bigr]_0^1-\\!\\int_0^1\\dfrac{2x^2}{1+x^2}dx=\\ln 2-2\\!\\int_0^1\\!\\left(1-\\dfrac{1}{1+x^2}\\right)dx=\\ln 2-2(1-\\pi/4)=\\ln 2-2+\\dfrac{\\pi}{2}$.\n$L=e^{\\ln 2-2+\\pi/2}=2e^{\\pi/2-2}$.",
  },
  {
    n:10, subject:"선형대수", unit:"고유치와 대각화", concept:"대각화 + 거듭제곱",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}2&3\\\\1&0\\end{pmatrix}$에 대하여 $A^{2019}\\begin{pmatrix}1\\\\1\\end{pmatrix}=\\begin{pmatrix}a\\\\b\\end{pmatrix}$일 때, $a+b$의 값은?",
    options:opts5("$3^{2019}-1$","$3^{2019}$","$3^{2019}+1$","$2\\cdot 3^{2019}-1$","$2\\cdot 3^{2019}$"),
    correct:"5",
    explanation:"특성다항식 $\\lambda^2-2\\lambda-3=(\\lambda-3)(\\lambda+1)$. 고윳값 $3,-1$.\n$\\lambda=3$ 고유벡터: $-x+3y=0$에서 $v_1=(3,1)$. $\\lambda=-1$: $3x+3y=0$에서 $v_2=(1,-1)$.\n$(1,1)=\\alpha(3,1)+\\beta(1,-1)$: $3\\alpha+\\beta=1,\\,\\alpha-\\beta=1$이므로 $\\alpha=1/2,\\,\\beta=-1/2$.\n$A^{2019}(1,1)^T=\\dfrac{1}{2}\\cdot 3^{2019}(3,1)+(-\\dfrac{1}{2})(-1)^{2019}(1,-1)=\\dfrac{1}{2}\\cdot 3^{2019}(3,1)+\\dfrac{1}{2}(1,-1)$.\n$a+b=\\dfrac{1}{2}\\cdot 3^{2019}\\cdot 4+\\dfrac{1}{2}\\cdot 0=2\\cdot 3^{2019}$.",
  },
  {
    n:11, subject:"선형대수", unit:"고유치와 대각화", concept:"닮은 행렬 행렬식",
    difficulty:"easy",
    question:"$3\\times 3$ 행렬 $B$의 고유값이 $1,2,3$이고, 행렬 $A$는 $B$와 닮은행렬(similar matrix)일 때, $\\det(A-4I)$의 값은?",
    options:opts5("$-6$","$-3$","$0$","$6$","$37$"),
    correct:"1",
    explanation:"닮은 행렬은 같은 고유값을 가지므로 $A$의 고유값도 $1,2,3$.\n$\\det(A-4I)=\\prod(\\lambda_i-4)=(1-4)(2-4)(3-4)=(-3)(-2)(-1)=-6$.",
  },
  {
    n:12, subject:"선형대수", unit:"벡터와 공간도형", concept:"외적 평행육면체",
    difficulty:"medium",
    question:"공간벡터 $u,v,w$가 이루는 평행육면체의 부피가 $3$이고 $u\\cdot v=v\\cdot w=w\\cdot u=0$일 때, 세 벡터 $u\\times 2v,\\ 2v\\times 3w,\\ 3w\\times u$가 이루는 평행육면체의 부피는? (단, $a\\cdot b$는 $a$와 $b$의 내적이고, $a\\times b$는 $a$와 $b$의 외적이다.)",
    options:opts5("$108$","$144$","$216$","$324$","$648$"),
    correct:"4",
    explanation:"공식: $(a\\times b)\\cdot[(b\\times c)\\times(c\\times a)]=[a,b,c]^2$ (단, $[a,b,c]=a\\cdot(b\\times c)$는 평행육면체의 부호 부피).\n$u\\times 2v=2(u\\times v),\\ 2v\\times 3w=6(v\\times w),\\ 3w\\times u=3(w\\times u)$이므로 스칼라 인수 $2\\cdot 6\\cdot 3=36$.\n새 평행육면체 부피 $=36\\cdot[u,v,w]^2=36\\cdot 9=324$.",
  },
  {
    n:13, subject:"선형대수", unit:"행렬", concept:"영공간 기저",
    difficulty:"easyMedium",
    question:"행렬 $\\begin{pmatrix}1&3&0&3\\\\2&7&-1&5\\\\-1&0&2&-1\\end{pmatrix}$의 영공간(null space)의 기저가 벡터 $v=(a,b,c,d)$이면 $\\dfrac{b}{a}+\\dfrac{d}{c}$의 값은?",
    options:opts5("$-3$","$-2$","$-1$","$0$","$1$"),
    correct:"3",
    explanation:"행간소: R2$-2$R1$=(0,1,-1,-1)$. R3$+$R1$=(0,3,2,2)$. R3$-3$R2$=(0,0,5,5)$.\n$\\begin{pmatrix}1&3&0&3\\\\0&1&-1&-1\\\\0&0&5&5\\end{pmatrix}$. 후방 대입: $5c+5d=0\\Rightarrow c=-d$. $b-c-d=0\\Rightarrow b=c+d=0$. $a+3b+3d=0\\Rightarrow a=-3d$.\n$d=1$이면 $v=(-3,0,-1,1)$. $\\dfrac{b}{a}+\\dfrac{d}{c}=\\dfrac{0}{-3}+\\dfrac{1}{-1}=0-1=-1$.",
  },
  {
    n:14, subject:"선형대수", unit:"행렬", concept:"QR분해",
    difficulty:"medium",
    question:"행렬 $A=\\begin{pmatrix}5&2&5&2\\\\0&1&3&4\\\\0&0&1&0\\\\0&0&1&7\\end{pmatrix},\\ B=\\begin{pmatrix}2&0&0&0\\\\4&3&0&0\\\\5&3&1&2\\\\1&2&2&2\\end{pmatrix},\\ C=AB$가 주어져 있다. $C$의 열벡터들로부터 그람-슈미트(Gram-Schmidt) 과정을 사용하여 얻은 벡터들로 구성된 직교행렬(orthogonal matrix)을 $Q$라 할 때, $Q^{-1}C$의 대각성분들의 곱의 절댓값은?",
    options:opts5("$1$","$120$","$240$","$420$","$840$"),
    correct:"4",
    explanation:"그람-슈미트는 QR분해를 만든다: $C=QR$, $R$은 상삼각이고 양의 대각을 가진다 (또는 절댓값을 취한 같은 결과).\n$Q^{-1}C=Q^TC=R$이고 $R$은 상삼각. 대각성분의 곱 $=|\\det R|=|\\det C|=|\\det A\\cdot\\det B|$.\n상삼각 $A$: $\\det A=5\\cdot 1\\cdot 1\\cdot 7=35$. 하삼각 $B$: $\\det B=2\\cdot 3\\cdot 1\\cdot 2=12$.\n$|\\det C|=|35\\cdot 12|=420$.",
  },
  {
    n:15, subject:"선형대수", unit:"고유치와 대각화", concept:"직교 대각화",
    difficulty:"mediumHard",
    question:"이차형식 $x^2+4xz+2y^2+z^2$을 직교대각화(orthogonal diagonalization)하면 $a_1X^2+a_2Y^2+a_3Z^2$이다. 이 때, $Z=\\alpha x+\\beta y+\\gamma z$이면 $\\alpha+\\beta+\\gamma$의 값은? (단, $a_1<a_2<a_3$)",
    options:opts5("$0$","$1$","$\\sqrt 2$","$\\dfrac{3\\sqrt 2}{2}$","$2\\sqrt 2$"),
    correct:"3",
    explanation:"이차형식 행렬 $M=\\begin{pmatrix}1&0&2\\\\0&2&0\\\\2&0&1\\end{pmatrix}$.\n특성방정식: $\\det(M-\\lambda I)=(2-\\lambda)\\bigl[(1-\\lambda)^2-4\\bigr]=(2-\\lambda)(\\lambda-3)(\\lambda+1)$. 고윳값 $-1,2,3$.\n$a_1<a_2<a_3$ 조건에서 $a_3=3$이 $Z$에 대응. $\\lambda=3$의 고유벡터: $(M-3I)v=0$에서 $-2x+2z=0,\\,-y=0$이므로 $(1,0,1)$. 정규화 $(\\alpha,\\beta,\\gamma)=\\dfrac{1}{\\sqrt 2}(1,0,1)$.\n$\\alpha+\\beta+\\gamma=\\dfrac{2}{\\sqrt 2}=\\sqrt 2$.",
  },
  {
    n:16, subject:"공학수학", unit:"미분방정식", concept:"2계 ODE 최솟값",
    difficulty:"medium",
    question:"미분방정식 $x''-5x'-14x=0$의 해 $x=x(t)$가 초기조건 $x(0)=5,\\,x'(0)=-1$을 만족할 때, $x(t)$가 최소가 되는 $t$의 값은?",
    options:opts5("$\\dfrac{1}{3}\\ln 2-\\dfrac{1}{9}\\ln 7$","$\\dfrac{1}{9}\\ln 2-\\dfrac{1}{9}\\ln 7$","$0$","$\\dfrac{1}{5}\\ln 2-\\dfrac{1}{5}\\ln 7$","$\\dfrac{3}{5}\\ln 2-\\dfrac{1}{5}\\ln 7$"),
    correct:"1",
    explanation:"특성방정식 $\\lambda^2-5\\lambda-14=(\\lambda-7)(\\lambda+2)=0$이므로 $\\lambda=7,-2$.\n일반해 $x=Ae^{7t}+Be^{-2t}$. 초기조건: $A+B=5,\\,7A-2B=-1$. 풀면 $A=1,\\,B=4$.\n$x(t)=e^{7t}+4e^{-2t}$. 임계점 $x'(t)=7e^{7t}-8e^{-2t}=0$이면 $e^{9t}=\\dfrac{8}{7}$, $9t=\\ln 8-\\ln 7=3\\ln 2-\\ln 7$.\n$t=\\dfrac{1}{3}\\ln 2-\\dfrac{1}{9}\\ln 7$. (이 점에서 $x''>0$이므로 최소.)",
  },
  {
    n:17, subject:"공학수학", unit:"미분방정식", concept:"공명 비제차 ODE",
    difficulty:"medium",
    question:"미분방정식 $x''+5x'+6x=e^{-2t}$의 해 $x=x(t)$가 초기조건 $x(0)=1,\\,x'(0)=0$을 만족할 때, $x(1)$의 값은?",
    options:opts5("$0$","$e^{-2}-2e^{-3}$","$2e^{-2}-3e^{-3}$","$3e^{-2}-2e^{-3}$","$3e^{-2}-e^{-3}$"),
    correct:"5",
    explanation:"특성: $\\lambda^2+5\\lambda+6=(\\lambda+2)(\\lambda+3)$. 동차해 $x_h=Ae^{-2t}+Be^{-3t}$.\n$\\lambda=-2$가 동차해와 공명. 특수해 $x_p=Cte^{-2t}$ 시도. 대입하면 $Ce^{-2t}=e^{-2t}$이므로 $C=1$.\n일반해 $x=Ae^{-2t}+Be^{-3t}+te^{-2t}$. 초기조건:\n$x(0)=A+B=1$, $x'(0)=-2A-3B+1=0$이므로 $-2A-3B=-1$.\n첫 식의 $A=1-B$를 대입: $-2(1-B)-3B=-1$, $-B=1$, $B=-1$, $A=2$.\n$x(t)=2e^{-2t}-e^{-3t}+te^{-2t}$. $x(1)=2e^{-2}-e^{-3}+e^{-2}=3e^{-2}-e^{-3}$.",
  },
  {
    n:18, subject:"공학수학", unit:"미분방정식", concept:"3계 연립 미분방정식",
    difficulty:"hard",
    question:"연립미분방정식 $\\begin{cases}x'=y\\\\y'=z\\\\z'=-\\dfrac{11}{2}z-6y+\\dfrac{9}{2}x+9t^2-24t-22\\end{cases}$의 해 $x(t),y(t),z(t)$가 초기조건 $x(0)=5,\\,y(0)=0,\\,z(0)=0$을 만족할 때, $x(1)-2y(1)$의 값은?",
    options:opts5("$6e^{-3}+6$","$12e^{-3}+6$","$6e^{-3}+12$","$6\\sqrt e+12$","$12\\sqrt e+6$"),
    correct:"2",
    explanation:"$y=x',\\,z=x''$로 두면 $x'''+\\dfrac{11}{2}x''+6x'-\\dfrac{9}{2}x=9t^2-24t-22$.\n특성다항식 $2\\lambda^3+11\\lambda^2+12\\lambda-9=(2\\lambda-1)(\\lambda+3)^2$이므로 $\\lambda=1/2,-3$(중근).\n동차해 $x_h=Ae^{t/2}+Be^{-3t}+Cte^{-3t}$.\n특수해 $x_p=at^2+bt+c$ 시도: 미분 후 대입하면 $-\\dfrac{9a}{2}t^2+(12a-\\dfrac{9b}{2})t+(11a+6b-\\dfrac{9c}{2})=9t^2-24t-22$. 풀면 $a=-2,\\,b=0,\\,c=0$. $x_p=-2t^2$.\n$x=Ae^{t/2}+Be^{-3t}+Cte^{-3t}-2t^2$. 초기조건 세 개로 $A=4,\\,B=1,\\,C=1$ 결정.\n$x(1)=4\\sqrt e+e^{-3}+e^{-3}-2=4\\sqrt e+2e^{-3}-2$.\n$y(1)=x'(1)=2\\sqrt e+e^{-3}-3e^{-3}-3e^{-3}-4\\cdot 1=2\\sqrt e-5e^{-3}-4$ (직접 미분 후 정리).\n$x(1)-2y(1)=4\\sqrt e+2e^{-3}-2-4\\sqrt e+10e^{-3}+8=12e^{-3}+6$.",
  },
  {
    n:19, subject:"공학수학", unit:"미분방정식", concept:"1계 선형 ODE",
    difficulty:"mediumHard",
    question:"미분방정식 $x'=(1-t)x+(t-1)^3$의 해 $x=x(t)$가 초기조건 $x(0)=3$을 만족할 때, $x(2)$의 값은?",
    options:opts5("$-1$","$0$","$1$","$2$","$3$"),
    correct:"5",
    explanation:"표준형 $x'-(1-t)x=(t-1)^3=-(1-t)^3$. 적분인자 $\\mu=e^{-\\int(1-t)dt}=e^{t^2/2-t}$.\n$(\\mu x)'=\\mu(t-1)^3$. 부분적분으로\n$\\displaystyle\\int(t-1)^3 e^{t^2/2-t}dt=\\int(t-1)^2\\cdot d(e^{t^2/2-t})=(t-1)^2 e^{t^2/2-t}-\\!\\int 2(t-1)e^{t^2/2-t}dt=[(t-1)^2-2]e^{t^2/2-t}+C$.\n$\\mu x=[(t-1)^2-2]e^{t^2/2-t}+C$. 즉 $x(t)=(t-1)^2-2+Ce^{t-t^2/2}$.\n$x(0)=1-2+C=3\\Rightarrow C=4$.\n$x(2)=(2-1)^2-2+4e^{2-2}=1-2+4=3$.",
  },
  {
    n:20, subject:"공학수학", unit:"Laplace변환", concept:"이동·변조 정리",
    difficulty:"medium",
    question:"함수 $f(t)$의 라플라스 변환(Laplace transform)이 $\\mathcal L(f(t))=\\dfrac{1}{s^2+4}$이다. $G(s)=\\mathcal L\\bigl(e^{\\pi t}(f(t))^2\\bigr)$일 때, $G(2\\pi)$의 값은?",
    options:opts5("$\\dfrac{1}{8}\\!\\left(\\dfrac{4}{\\pi^2+16}-\\dfrac{1}{\\pi}\\right)$","$\\dfrac{1}{8}\\!\\left(\\dfrac{\\pi}{\\pi^2+16}-\\dfrac{1}{\\pi}\\right)$","$\\dfrac{1}{8}\\!\\left(\\dfrac{1}{\\pi}-\\dfrac{4}{\\pi^2+16}\\right)$","$\\dfrac{1}{8}\\!\\left(\\dfrac{1}{\\pi}-\\dfrac{\\pi}{\\pi^2+16}\\right)$","$\\dfrac{1}{8}\\!\\left(\\dfrac{1}{\\pi}-\\dfrac{1}{\\pi^2+16}\\right)$"),
    correct:"4",
    explanation:"$\\mathcal L^{-1}\\!\\left[\\dfrac{1}{s^2+4}\\right]=\\dfrac{1}{2}\\sin 2t$이므로 $f(t)=\\dfrac{1}{2}\\sin 2t$.\n$(f(t))^2=\\dfrac{1}{4}\\sin^2 2t=\\dfrac{1}{8}(1-\\cos 4t)$.\n$e^{\\pi t}(f(t))^2=\\dfrac{1}{8}e^{\\pi t}-\\dfrac{1}{8}e^{\\pi t}\\cos 4t$.\n변조정리 $\\mathcal L\\{e^{at}g(t)\\}=G(s-a)$:\n$\\mathcal L\\{e^{\\pi t}\\}=\\dfrac{1}{s-\\pi}$, $\\mathcal L\\{e^{\\pi t}\\cos 4t\\}=\\dfrac{s-\\pi}{(s-\\pi)^2+16}$.\n$G(s)=\\dfrac{1}{8}\\!\\left[\\dfrac{1}{s-\\pi}-\\dfrac{s-\\pi}{(s-\\pi)^2+16}\\right]$. $s=2\\pi$ 대입: $G(2\\pi)=\\dfrac{1}{8}\\!\\left(\\dfrac{1}{\\pi}-\\dfrac{\\pi}{\\pi^2+16}\\right)$.",
  },
  {
    n:21, subject:"공학수학", unit:"미분방정식", concept:"오일러-코시 중근",
    difficulty:"easyMedium",
    question:"미분방정식 $x^2y''+5xy'+4y=0,\\ x>0$의 해 $y=y(x)$가 $y(1)=e^2,\\,y'(1)=0$을 만족할 때, $y(e)$의 값은?",
    options:opts5("$0$","$e$","$3$","$e^2$","$e^4$"),
    correct:"3",
    explanation:"오일러-코시. $y=x^r$ 시도하면 $r(r-1)+5r+4=r^2+4r+4=(r+2)^2=0$이므로 $r=-2$ (중근).\n일반해 $y=c_1 x^{-2}+c_2 x^{-2}\\ln x$.\n$y(1)=c_1=e^2$. $y'(x)=-2c_1 x^{-3}+c_2(-2x^{-3}\\ln x+x^{-3})$이므로 $y'(1)=-2c_1+c_2=0$, $c_2=2e^2$.\n$y(e)=e^2\\cdot e^{-2}+2e^2\\cdot e^{-2}\\cdot 1=1+2=3$.",
  },
];

let okCount=0,failCount=0;
for (const p of PROBLEMS) {
  const num=String(p.n).padStart(2,"0");
  const id=`q-${YEAR}-${SCHOOL_EN}-${num}`;
  const tags=[YEAR,SCHOOL_KO,p.subject,p.unit,p.concept].filter(Boolean);
  const row={id,subject:p.subject,unit:p.unit,concept:p.concept,difficulty:p.difficulty,
    source_type:"imported",pool:"general",
    question:p.question,content_type:"latex",question_image:null,
    options:p.options,correct_option_id:p.correct,
    explanation:p.explanation,explanation_content_type:"latex",explanation_image:null,
    tags,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
  const{error}=await sb.from("questions").upsert(row,{onConflict:"id"});
  if(error){console.error(`❌ ${id}:`,error.message);failCount++;}
  else{console.log(`✓ ${id}`);okCount++;}
}
console.log(`\n총 ${okCount}건 업로드, ${failCount}건 실패 (대상 ${PROBLEMS.length}건)`);
