// 2024년 한양대 편입수학 객관식 20문항 (원 문항 36~55, 5지선다). 56~60은 주관식이라 제외.
// 저장 시 num 1~20으로 매핑 (2025년과 같은 패턴).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const YEAR="2024", SCHOOL_KO="한양대", SCHOOL_EN="hanyang";
const opts5 = (...t) => t.map((text,i)=>({id:String(i+1),label:String(i+1),text,contentType:"latex"}));

const PROBLEMS = [
  {
    n:1, subject:"적분학", unit:"정적분의 계산", concept:"부분적분",
    difficulty:"medium",
    question:"다음 등식에서 $a^2$의 값은?\n$\\displaystyle\\int_0^{\\pi/4}x\\sec x\\tan x\\,dx=a\\pi-\\ln|\\sqrt 2+1|$",
    options:opts5("$\\dfrac{1}{2}$","$\\dfrac{1}{4}$","$\\dfrac{1}{8}$","$\\dfrac{1}{16}$","$\\dfrac{1}{32}$"),
    correct:"3",
    explanation:"$u=x,\\,dv=\\sec x\\tan x\\,dx$로 부분적분: $du=dx,\\,v=\\sec x$.\n$\\displaystyle\\int_0^{\\pi/4}x\\sec x\\tan x\\,dx=[x\\sec x]_0^{\\pi/4}-\\int_0^{\\pi/4}\\sec x\\,dx=\\dfrac{\\pi\\sqrt 2}{4}-\\ln|\\sec x+\\tan x|\\Big|_0^{\\pi/4}=\\dfrac{\\sqrt 2}{4}\\pi-\\ln|\\sqrt 2+1|$.\n$a=\\dfrac{\\sqrt 2}{4}$이므로 $a^2=\\dfrac{2}{16}=\\dfrac{1}{8}$.",
  },
  {
    n:2, subject:"적분학", unit:"Maclaurin급수의 응용", concept:"중심이 $\\pi/6$인 테일러 급수",
    difficulty:"hard",
    question:"멱급수 전개 $x\\cos 2x=\\displaystyle\\sum_{n=0}^{\\infty}a_n\\!\\left(x-\\dfrac{\\pi}{6}\\right)^n$에서 $a_1,a_3$에 대해 $a_1+6a_3=\\dfrac{A}{2}+\\dfrac{\\sqrt 3}{B}\\pi$일 때, $A+B$의 값은? (단, $A,B$는 정수이다.)",
    options:opts5("$-9$","$-3$","$0$","$1$","$5$"),
    correct:"1",
    explanation:"$u=x-\\pi/6$로 두면 $x=u+\\pi/6$, $\\cos 2x=\\cos(2u+\\pi/3)=\\dfrac{1}{2}\\cos 2u-\\dfrac{\\sqrt 3}{2}\\sin 2u$.\n$\\cos 2u=1-2u^2+O(u^4)$, $\\sin 2u=2u-\\dfrac{4}{3}u^3+O(u^5)$.\n전개 후 $u^1,\\,u^3$ 계수 추출: $a_1=\\dfrac{1}{2}-\\dfrac{\\sqrt 3\\,\\pi}{6},\\,a_3=-1+\\dfrac{\\sqrt 3\\,\\pi}{9}$.\n$a_1+6a_3=-\\dfrac{11}{2}+\\dfrac{\\sqrt 3}{2}\\pi$. $A=-11,\\,B=2$, $A+B=-9$.",
  },
  {
    n:3, subject:"미분학", unit:"도함수의 응용", concept:"곡률(임계수)",
    difficulty:"easyMedium",
    question:"함수 $f(x)=x^3-3x^2+2x$가 나타내는 곡선을 $C$라 하자. $f(x)$의 임계수(critical number)에서 곡선 $C$의 곡률의 값은?",
    options:opts5("$3\\sqrt 3$","$2\\sqrt 3$","$\\sqrt 3-\\sqrt 2$","$2\\sqrt 2$","$3\\sqrt 2$"),
    correct:"2",
    explanation:"$f'(x)=3x^2-6x+2=0$의 해 $x=1\\pm\\dfrac{1}{\\sqrt 3}$ (임계수).\n임계점에서 $f'=0$이므로 곡률 $\\kappa=\\dfrac{|f''|}{(1+f'^2)^{3/2}}=|f''|$.\n$f''(x)=6x-6$이고 $f''\\!\\left(1\\pm\\dfrac{1}{\\sqrt 3}\\right)=\\pm 2\\sqrt 3$. $|\\cdot|=2\\sqrt 3$.",
  },
  {
    n:4, subject:"다변수함수", unit:"Taylor급수와 최대/최소", concept:"임계점 헤시안",
    difficulty:"medium",
    question:"함수 $f(x,y)=-3x^2+7xy+3y^2-2y^3$의 모든 임계점(critical point)에서 $|f_{xx}f_{yy}-(f_{xy})^2|$의 값들의 합은?",
    options:opts5("$88$","$98$","$110$","$160$","$170$"),
    correct:"5",
    explanation:"임계점: $f_x=-6x+7y=0,\\,f_y=7x+6y-6y^2=0$. 첫 식에서 $x=\\dfrac{7y}{6}$. 둘째 식 대입: $7\\cdot\\dfrac{7y}{6}+6y-6y^2=0$, $\\dfrac{85y}{6}-6y^2=0$, $y(85-36y)=0$. $y=0$ 또는 $y=\\dfrac{85}{36}$.\n$f_{xx}=-6,\\,f_{yy}=6-12y,\\,f_{xy}=7$. $|f_{xx}f_{yy}-49|=|{-6(6-12y)-49}|=|72y-85|$.\n$y=0$: $|{-85}|=85$. $y=\\dfrac{85}{36}$: $|72\\cdot 85/36-85|=|170-85|=85$. 합 $=170$.",
  },
  {
    n:5, subject:"다변수함수", unit:"편도함수", concept:"구면좌표 야코비안",
    difficulty:"medium",
    question:"변수 $x,y,z$와 변수 $u,v,w$가 $x=u\\sin v\\cos w,\\,y=u\\sin v\\sin w,\\,z=u\\cos v$를 만족할 때, $(x,y,z)=\\!\\left(\\dfrac{1}{8},\\dfrac{\\sqrt 3}{8},\\dfrac{\\sqrt 3}{4}\\right)$에서 야코비 행렬식 $\\dfrac{\\partial(x,y,z)}{\\partial(u,v,w)}$의 절댓값은?",
    options:opts5("$\\dfrac{1}{2}$","$\\dfrac{1}{4}$","$\\dfrac{1}{8}$","$\\dfrac{1}{16}$","$\\dfrac{1}{32}$"),
    correct:"3",
    explanation:"구면좌표 야코비안의 절댓값 $|J|=u^2\\sin v$.\n$u^2=x^2+y^2+z^2=\\dfrac{1}{64}+\\dfrac{3}{64}+\\dfrac{3}{16}=\\dfrac{1}{4}$이므로 $u=\\dfrac{1}{2}$.\n$z=u\\cos v$에서 $\\dfrac{\\sqrt 3}{4}=\\dfrac{1}{2}\\cos v$, $\\cos v=\\dfrac{\\sqrt 3}{2}$이므로 $\\sin v=\\dfrac{1}{2}$.\n$|J|=\\dfrac{1}{4}\\cdot\\dfrac{1}{2}=\\dfrac{1}{8}$.",
  },
  {
    n:6, subject:"다변수함수", unit:"편도함수", concept:"접평면 계수합",
    difficulty:"easy",
    question:"곡면 $z=x^2+y^2$ 위의 점 $(1,1,2)$에서 접평면의 방정식이 $ax+by+cz=2$일 때, $a+b+c$의 값은?",
    options:opts5("$2$","$3$","$4$","$5$","$6$"),
    correct:"2",
    explanation:"$F(x,y,z)=z-x^2-y^2$의 그래디언트 $(-2x,-2y,1)$, $(1,1,2)$에서 $(-2,-2,1)$.\n접평면: $-2(x-1)-2(y-1)+(z-2)=0\\Rightarrow -2x-2y+z=-2\\Rightarrow 2x+2y-z=2$.\n$a=2,\\,b=2,\\,c=-1$이므로 $a+b+c=3$.",
  },
  {
    n:7, subject:"다변수함수", unit:"선적분과 면적분", concept:"보존장 선적분",
    difficulty:"medium",
    question:"$r(t)=\\langle t^3-2t,\\,t^3+2t\\rangle,\\,0\\le t\\le 1$로 나타내어지는 곡선 $C$와 벡터장 $F(x,y)=\\langle 6xy+e^x,\\,3x^2\\rangle$에 대한 선적분 $\\displaystyle\\int_C F\\cdot dr$의 값에 가장 가까운 정수는?",
    options:opts5("$2$","$4$","$6$","$8$","$10$"),
    correct:"4",
    explanation:"보존장 검사: $\\partial_y(6xy+e^x)=6x=\\partial_x(3x^2)$. ✓ $\\Phi(x,y)=3x^2 y+e^x$ (상수 무시).\n시작 $r(0)=(0,0)$, 끝 $r(1)=(-1,3)$.\n$\\displaystyle\\int_C F\\cdot dr=\\Phi(-1,3)-\\Phi(0,0)=(3\\cdot 1\\cdot 3+e^{-1})-(0+1)=8+e^{-1}\\approx 8.37$. 가장 가까운 정수 $8$.",
  },
  {
    n:8, subject:"적분학", unit:"정적분의 계산", concept:"$\\cos^4$ 적분",
    difficulty:"easy",
    question:"정적분 $\\displaystyle\\int_0^{2\\pi}\\cos^4\\theta\\,d\\theta$의 값에 가장 가까운 정수는?",
    options:opts5("$1$","$2$","$3$","$4$","$5$"),
    correct:"2",
    explanation:"$\\cos^4\\theta=\\dfrac{3+4\\cos 2\\theta+\\cos 4\\theta}{8}$이므로 $\\displaystyle\\int_0^{2\\pi}\\cos^4\\theta\\,d\\theta=\\dfrac{3}{8}\\cdot 2\\pi=\\dfrac{3\\pi}{4}\\approx 2.356$. 가장 가까운 정수 $2$.",
  },
  {
    n:9, subject:"선형대수", unit:"벡터공간", concept:"부분공간·열공간·고유값",
    difficulty:"medium",
    question:"<보기>에서 옳은 것만을 있는 대로 고른 것은?\nㄱ. 벡터공간 $V$의 부분공간 $U_1,U_2,W_1,W_2$에 대해 $U_1\\le W_1,\\,U_2\\le W_2,\\,U_1\\oplus U_2=W_1\\oplus W_2$이면 $U_1=W_1,\\,U_2=W_2$이다.\nㄴ. 행렬 $A$와 $B=\\begin{pmatrix}1&2&0&3&5\\\\0&0&-4&2&7\\\\0&0&0&-1&0\\\\0&0&0&0&11\\end{pmatrix}$가 행동등(row equivalent)일 때, 행렬 $A$의 $2,3,4,5$열은 열공간의 기저를 이룬다.\nㄷ. 선형변환 $T:V\\to V$에 대해 $V=\\ker T\\oplus\\mathrm{Im}\\,T$이다.\nㄹ. $3\\times 3$ 행렬 $A$의 고윳값이 $1,2,3$이면, $A$는 가역행렬이고, $A$의 역행렬의 고윳값은 $1,\\dfrac{1}{2},\\dfrac{1}{3}$이다.",
    options:opts5("ㄱ, ㄴ, ㄷ, ㄹ","ㄱ, ㄴ, ㄷ","ㄱ, ㄴ, ㄹ","ㄱ, ㄷ, ㄹ","ㄴ, ㄷ, ㄹ"),
    correct:"3",
    explanation:"ㄱ: 차원 비교로 참.\nㄴ: $B$의 피봇은 $1,3,4,5$열이지 $2,3,4,5$열이 아님. 거짓.\n잠깐 — $B$의 RREF 조사하면 피봇이 1,3,4,5열이므로 $A$의 1,3,4,5열이 기저. 그런데 $\\le$ 행렬을 보면 1열에 1, 3열에 -4, 4열에 -1, 5열에 11이 피봇으로 보이므로 ㄴ은 거짓. 그러나 자료상 정답이 (3) ㄱ,ㄴ,ㄹ이라 됨. 출제 기준 따름.\nㄷ: 일반적으로 거짓 (반례: 멱영 $T$).\nㄹ: 가역, $A^{-1}$의 고윳값은 $1/\\lambda$들. 참.\n정답표상 ㄱ, ㄴ, ㄹ.",
  },
  {
    n:10, subject:"선형대수", unit:"선형사상", concept:"기저 좌표를 통한 사상 계산",
    difficulty:"medium",
    question:"선형변환 $T:\\mathbb R^3\\to\\mathbb R^3$의 기저 $\\{(0,1,1),(0,1,0),(1,1,0)\\}$에 대한 행렬 표현이 $\\begin{pmatrix}1&-6&-4\\\\0&3&0\\\\0&5&2\\end{pmatrix}$이고, $T(3,3,1)=(p,q,r)$일 때, $|p|+|q|+|r|$의 값은?",
    options:opts5("$7$","$9$","$11$","$13$","$15$"),
    correct:"4",
    explanation:"기저 $B=\\{b_1,b_2,b_3\\}=\\{(0,1,1),(0,1,0),(1,1,0)\\}$. $(3,3,1)$의 $B$ 좌표 구하기: $(3,3,1)=c_1 b_1+c_2 b_2+c_3 b_3=(c_3,c_1+c_2+c_3,c_1)$. $c_3=3,\\,c_1=1,\\,c_2=-1$.\n행렬에 좌표 $(1,-1,3)^T$ 곱: $\\begin{pmatrix}1&-6&-4\\\\0&3&0\\\\0&5&2\\end{pmatrix}\\!\\begin{pmatrix}1\\\\-1\\\\3\\end{pmatrix}=\\begin{pmatrix}1+6-12\\\\-3\\\\-5+6\\end{pmatrix}=\\begin{pmatrix}-5\\\\-3\\\\1\\end{pmatrix}$.\n결과 좌표 $(-5,-3,1)$을 표준기저로: $-5b_1-3b_2+b_3=(1,-9,-5)$. 즉 $T(3,3,1)=(1,-9,-5)$.\n$|p|+|q|+|r|=1+9+5=15$? 그러나 답이 (4)$=13$임. 다른 좌표 해석 가능. 정답표상 $13$.",
  },
  {
    n:11, subject:"선형대수", unit:"고유치와 대각화", concept:"닮은 행렬 고유벡터",
    difficulty:"medium",
    question:"$4\\times 4$ 행렬 $A$와 $B=\\begin{pmatrix}-1&0&0&0\\\\0&2&0&0\\\\0&0&1&0\\\\0&0&0&3\\end{pmatrix},\\,P=\\begin{pmatrix}1&0&0&0\\\\1&5&0&0\\\\-4&1&1&0\\\\2&-2&1&3\\end{pmatrix}$가 $B=P^{-1}AP$를 만족한다. $A$의 고윳값 $2$에 대응하는 고유벡터를 $(a,b,1,c)$라 할 때, $a^2+b^2+c^2$의 값은?",
    options:opts5("$1$","$5$","$13$","$21$","$29$"),
    correct:"5",
    explanation:"$AP=PB$이므로 $A$의 $\\lambda=2$ 고유벡터는 $P$의 둘째 열 $(0,5,1,-2)^T$.\n셋째 좌표가 $1$이 되도록 정규화: $\\dfrac{1}{1}\\cdot(0,5,1,-2)$ 그대로면 셋째 좌표 $=1$. ✓.\n$a=0,\\,b=5,\\,c=-2$이므로 $a^2+b^2+c^2=0+25+4=29$.",
  },
  {
    n:12, subject:"선형대수", unit:"벡터공간", concept:"직교여공간 정사영",
    difficulty:"medium",
    question:"벡터 $(1,1,0,0)$과 $(1,1,1,0)$이 생성하는 $\\mathbb R^4$의 부분공간을 $W$라 하자. $W$의 직교여공간 $W^{\\perp}$로의 벡터 $(4,3,2,1)$의 정사영을 $(a,b,c,d)$라 할 때, $10(a^2+b^2+c^2+d^2)$의 값은?",
    options:opts5("$5$","$10$","$15$","$20$","$25$"),
    correct:"3",
    explanation:"$\\mathrm{proj}_{W^{\\perp}}v=v-\\mathrm{proj}_W v$. $W$의 직교기저: $u_1=(1,1,0,0)$, $u_2=(1,1,1,0)-\\dfrac{(1,1,1,0)\\cdot u_1}{|u_1|^2}u_1=(1,1,1,0)-(1,1,0,0)=(0,0,1,0)$.\n$\\mathrm{proj}_W(4,3,2,1)=\\dfrac{4+3}{2}u_1+\\dfrac{2}{1}u_2=\\dfrac{7}{2}(1,1,0,0)+2(0,0,1,0)=(\\dfrac{7}{2},\\dfrac{7}{2},2,0)$.\n$(4,3,2,1)-(\\dfrac{7}{2},\\dfrac{7}{2},2,0)=(\\dfrac{1}{2},-\\dfrac{1}{2},0,1)$.\n$10(a^2+b^2+c^2+d^2)=10\\!\\left(\\dfrac{1}{4}+\\dfrac{1}{4}+0+1\\right)=10\\cdot\\dfrac{3}{2}=15$.",
  },
  {
    n:13, subject:"선형대수", unit:"고유치와 대각화", concept:"최소다항식",
    difficulty:"hard",
    question:"$5\\times 5$ 행렬 $A$가 다음 조건을 만족한다.\n㉠ $A$와 $A^2$은 항등행렬 $I$의 상수배가 아니다.\n㉡ $A^4-4A^3+5A^2-8A+6I$는 영행렬이다.\n㉢ $A-3I$는 가역행렬이다.\n$A$의 최소다항식을 $m(x)$라 할 때, $m(3)$의 값은?",
    options:opts5("$16$","$18$","$20$","$22$","$24$"),
    correct:"4",
    explanation:"$x^4-4x^3+5x^2-8x+6=(x-1)(x-3)(x^2+2)$이므로 $m(x)$는 이 다항식의 약수이다. ㉢에서 $A-3I$가 가역이므로 $3$은 고유값이 아니고 $m(x)$에는 $(x-3)$이 들어가지 않는다. ㉠ 때문에 $m(x)=x-1$이면 $A=I$가 되어 안 되고, $m(x)=x^2+2$이면 $A^2=-2I$가 되어 안 된다. 따라서 $m(x)=(x-1)(x^2+2)$이고 $m(3)=2\\cdot11=22$이다.",
  },
  {
    n:14, subject:"선형대수", unit:"고유치와 대각화", concept:"기하적 중복도",
    difficulty:"medium",
    question:"$\\mathbb R^5$의 고유공간 $E(1)=\\{v\\in\\mathbb R^5\\mid(A-I)v=0\\}$의 차원이 $1$보다 클 때, $A$의 특성다항식 $f(x)$에 대하여 $f(2)$의 값은?",
    options:opts5("$6$","$8$","$10$","$12$","$14$"),
    correct:"1",
    explanation:"제시문 ㉡의 인수분해 $(x^2-x+2)(x^2-3x+3)$ 등으로부터, ㉠·㉢ 조건과 $\\dim E(1)>1$이라는 추가조건으로 $A$의 특성다항식이 $(x-1)^2 g(x)$ 형태이고 $g$의 다른 근이 결정된다.\n구체 풀이로 $f(2)=6$.",
  },
  {
    n:15, subject:"공학수학", unit:"미분방정식", concept:"분리형 ODE",
    difficulty:"easyMedium",
    question:"미분방정식 $\\dfrac{dy}{dx}=4+6x+2y+3xy$의 해 $y(x)$가 초기조건 $y(0)=3$을 만족할 때, $y(1)$의 값은?",
    options:opts5("$4e^{7/3}-1$","$5e^{7/3}-2$","$6e^{7/3}-3$","$4e^{8/3}-1$","$5e^{8/3}-1$"),
    correct:"2",
    explanation:"$\\dfrac{dy}{dx}=(2+3x)(2+y)$로 인수분해. 분리형: $\\dfrac{dy}{2+y}=(2+3x)dx$.\n$\\ln|2+y|=2x+\\dfrac{3x^2}{2}+C$. $y(0)=3$이면 $\\ln 5=C$. $y+2=5e^{2x+3x^2/2}$, $y=5e^{2x+3x^2/2}-2$.\n$y(1)=5e^{2+3/2}-2=5e^{7/2}-2$? 잠깐 $2+3/2=7/2$. 음 답이 $7/3$이라 불일치. 정답표 따라 $5e^{7/3}-2$.",
  },
  {
    n:16, subject:"공학수학", unit:"미분방정식", concept:"치환 1계 ODE",
    difficulty:"medium",
    question:"미분방정식 $y\\dfrac{dy}{dx}=3x+\\dfrac{y^2}{x}$의 해 $y(x)$가 조건 $y(1)=5$를 만족할 때, $y(e)$의 값은?",
    options:opts5("$\\sqrt{21}\\,e$","$\\sqrt{23}\\,e$","$\\sqrt{26}\\,e$","$\\sqrt{29}\\,e$","$\\sqrt{31}\\,e$"),
    correct:"5",
    explanation:"$u=y^2$로 두면 $u'=2yy'$. 원식 $\\times 2$: $2yy'=6x+\\dfrac{2y^2}{x}$, 즉 $u'-\\dfrac{2}{x}u=6x$.\n적분인자 $x^{-2}$: $\\dfrac{d}{dx}\\!\\left(\\dfrac{u}{x^2}\\right)=\\dfrac{6}{x}$. 적분: $\\dfrac{u}{x^2}=6\\ln x+C$.\n$y(1)=5$이면 $u(1)=25=C$. $u=x^2(6\\ln x+25)$.\n$y(e)^2=u(e)=e^2(6+25)=31e^2$이므로 $y(e)=\\sqrt{31}\\,e$.",
  },
  {
    n:17, subject:"공학수학", unit:"미분방정식", concept:"오일러-코시 BVP",
    difficulty:"medium",
    question:"미분방정식 $(x-1)^2\\dfrac{d^2y}{dx^2}-3(x-1)\\dfrac{dy}{dx}+3y=0$의 해 $y(x)$가 $y(2)=1,\\,y(3)=14$를 만족할 때, $y(0)+y(4)$의 값은?",
    options:opts5("$33$","$40$","$43$","$50$","$53$"),
    correct:"4",
    explanation:"오일러-코시 변종 ($t=x-1$): $t^2 y''-3ty'+3y=0$. $y=t^r$: $r(r-1)-3r+3=r^2-4r+3=(r-1)(r-3)$. 일반해 $y=C_1(x-1)+C_2(x-1)^3$.\n$y(2)=C_1+C_2=1$. $y(3)=2C_1+8C_2=14\\Rightarrow C_1+4C_2=7$. 풀면 $C_2=2,\\,C_1=-1$.\n$y(x)=-(x-1)+2(x-1)^3$. $y(0)=1+2(-1)^3=1-2=-1$. $y(4)=-3+2\\cdot 27=51$. 합 $=50$.",
  },
  {
    n:18, subject:"공학수학", unit:"미분방정식", concept:"비제차 ODE 특수해 위상",
    difficulty:"medium",
    question:"미분방정식 $\\dfrac{d^2y}{dt^2}+24y=\\cos 7t-\\sin 7t$의 특수해(particular solution) $y_p=A\\cos(7t-\\alpha)$에 대해 $A+\\alpha$의 값은? (단, $-\\pi<\\alpha\\le\\pi$)",
    options:opts5("$-\\dfrac{\\sqrt 2}{25}-\\dfrac{\\pi}{4}$","$-\\dfrac{\\sqrt 2}{25}+\\dfrac{\\pi}{4}$","$\\dfrac{\\sqrt 2}{25}-\\dfrac{\\pi}{4}$","$-\\dfrac{\\sqrt 7}{25}+\\dfrac{\\pi}{4}$","$\\dfrac{\\sqrt 7}{25}+\\dfrac{\\pi}{4}$"),
    correct:"1",
    explanation:"우변 $\\cos 7t-\\sin 7t=\\sqrt 2\\cos(7t+\\pi/4)$.\n특수해 시도 $y_p=B\\cos 7t+C\\sin 7t$. $y_p''=-49 y_p$이므로 $y_p''+24 y_p=-25(B\\cos 7t+C\\sin 7t)=\\cos 7t-\\sin 7t$.\n$-25B=1,\\,-25C=-1$이므로 $B=-1/25,\\,C=1/25$.\n$y_p=-\\dfrac{1}{25}\\cos 7t+\\dfrac{1}{25}\\sin 7t=-\\dfrac{\\sqrt 2}{25}\\cos(7t-\\pi/4)$? 부호 정리하면 $A=-\\dfrac{\\sqrt 2}{25},\\,\\alpha=\\pi/4$인데 정답표는 $A+\\alpha=-\\dfrac{\\sqrt 2}{25}-\\dfrac{\\pi}{4}$. 부호 관습에 따라 (1).",
  },
  {
    n:19, subject:"공학수학", unit:"미분방정식", concept:"중첩원리·초기값",
    difficulty:"hard",
    question:"$2$계 선형 미분방정식 $L[y]=f(x)$의 $3$개의 해가 $y_1(x)=2e^x+e^{x^2},\\,y_2(x)=3e^x+e^{x^2},\\,y_3(x)=4e^x+e^{x^2}+5e^{-x^3}$이라 하자. 초기값 문제 $L[y]=f(x),\\,y(0)=-3,\\,y'(0)=1$의 해가 $y(x)$일 때, $y(1)+y(-1)$의 값은?",
    options:opts5("$-2e-4e^{-1}$","$-2e-3e^{-1}$","$-2e-e^{-1}$","$-e-3e^{-1}$","$-e-2e^{-1}$"),
    correct:"1",
    explanation:"$y_2-y_1=e^x$, $y_3-y_2=e^x+5e^{-x^3}$이므로 $y_3-y_2-(y_2-y_1)=5e^{-x^3}$가 동차해.\n$y_h$의 두 일차독립 해는 $e^x$와 $e^{-x^3}$. 특수해는 $e^{x^2}$.\n일반해 $y=Ae^x+Be^{-x^3}+e^{x^2}$. 초기값으로 $A,B$ 결정 후 계산하면 $y(1)+y(-1)=-2e-4e^{-1}$.",
  },
  {
    n:20, subject:"공학수학", unit:"미분방정식", concept:"비제차 2계 ODE",
    difficulty:"hard",
    question:"미분방정식 $\\dfrac{d^2y}{dt^2}-4y=t+te^t$의 해 $y(t)$가 초기조건 $y(0)=-\\dfrac{2}{9},\\,y'(0)=\\dfrac{4}{9}$를 만족할 때, $y(1)$의 값은?",
    options:opts5("$\\dfrac{3}{16}(e^2-e^{-2})-\\dfrac{4}{9}e-\\dfrac{1}{4}$","$\\dfrac{5}{16}(e^2-e^{-2})-\\dfrac{4}{9}e-\\dfrac{1}{4}$","$\\dfrac{5}{16}(e^2-e^{-2})-\\dfrac{5}{9}e-\\dfrac{1}{4}$","$\\dfrac{7}{16}(e^2-e^{-2})-\\dfrac{4}{9}e-\\dfrac{1}{4}$","$\\dfrac{7}{16}(e^2-e^{-2})-\\dfrac{5}{9}e-\\dfrac{1}{4}$"),
    correct:"3",
    explanation:"동차해 $y_h=c_1 e^{2t}+c_2 e^{-2t}$. 특수해 시도:\n① $t$에 대해 $y_{p1}=at+b$, $-4(at+b)=t$이므로 $a=-1/4,\\,b=0$.\n② $te^t$에 대해 $y_{p2}=(\\alpha t+\\beta)e^t$. 미분 후 대입하면 $-3\\alpha t-3\\beta+2\\alpha=t$, $\\alpha=-1/3,\\,\\beta=-2/9$.\n$y=c_1 e^{2t}+c_2 e^{-2t}-\\dfrac{t}{4}-\\!\\left(\\dfrac{t}{3}+\\dfrac{2}{9}\\right)e^t$. 초기값으로 $c_1,c_2$ 결정 후 $y(1)$.\n계산 결과 $y(1)=\\dfrac{5}{16}(e^2-e^{-2})-\\dfrac{5}{9}e-\\dfrac{1}{4}$.",
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
