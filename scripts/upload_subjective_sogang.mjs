// 서강대 2019-2024 주관식 (단답형) 24문항 업로드 — Q17~20 (2021은 Q17~20 중 17까지 답지에 있고 객관식 옵션 없음, 모두 주관식 처리)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SCHOOL_KO="서강대", SCHOOL_EN="sogang";
// 주관식 단일 옵션 helper
const subj = (ans) => [{id:"1", label:"정답", text: ans, contentType:"latex"}];

const PROBLEMS = [
  // ===== 2019 =====
  {y:2019, n:17, subject:"적분학", unit:"극한과 연속", concept:"적분 극한 (테일러)",
    difficulty:"medium",
    question:"$\\displaystyle\\lim_{x\\to 0}\\dfrac{1}{x^3}\\!\\int_0^{\\sin x}\\tan(t^2)\\,dt=\\dfrac{n}{m}$이라고 할 때, $m+n$의 값은? (단, $m,n$은 서로 소인 자연수이다.)",
    answer:"$4$",
    explanation:"$\\tan(t^2)\\sim t^2$이므로 $\\!\\int_0^{\\sin x}\\tan(t^2)\\,dt\\sim\\dfrac{(\\sin x)^3}{3}$.\n$(\\sin x)^3=x^3-\\dfrac{x^5}{2}+\\cdots$이므로 극한 $=\\dfrac{x^3/3}{x^3}=\\dfrac{1}{3}$.\n$m=3,\\,n=1$. $m+n=4$.",
  },
  {y:2019, n:18, subject:"다변수함수", unit:"선적분과 면적분", concept:"보존벡터장 조건",
    difficulty:"easy",
    question:"세 실수 $\\alpha,\\beta,\\gamma$에 대하여 공간 $\\mathbb{R}^3$에서 정의된 벡터장 $\\vec{F}(x,y,z)=(2xz^3+\\alpha y)\\vec{i}+(3x+\\beta yz)\\vec{j}+(\\gamma x^2 z^2+y^2)\\vec{k}$가 보존벡터장(conservative vector field)이 될 때, $\\alpha+\\beta+\\gamma$의 값은?",
    answer:"$8$",
    explanation:"보존 조건 $\\nabla\\times\\vec{F}=\\vec{0}$:\n$P_y=Q_x:\\,\\alpha=3$.\n$P_z=R_x:\\,6xz^2=2\\gamma x z^2\\Rightarrow\\gamma=3$.\n$Q_z=R_y:\\,\\beta y=2y\\Rightarrow\\beta=2$.\n$\\alpha+\\beta+\\gamma=3+2+3=8$.",
  },
  {y:2019, n:19, subject:"미분학", unit:"미분방정식", concept:"이계 ODE 경곗값",
    difficulty:"medium",
    question:"경곗값 문제 $y''-4y'+5y=e^{2x},\\,y(0)=5,\\,y'(\\pi)=-10e^{2\\pi}$의 해 $y(x)$에 대하여 $y'(0)$의 값은?",
    answer:"$14$",
    explanation:"특성 $r^2-4r+5=0\\Rightarrow r=2\\pm i$. 동차해 $y_h=e^{2x}(c_1\\cos x+c_2\\sin x)$.\n특해 $y_p=Ae^{2x}$: 대입 $A=1$. $y=e^{2x}(c_1\\cos x+c_2\\sin x+1)$.\n$y(0)=c_1+1=5\\Rightarrow c_1=4$. $y'(\\pi)=-6e^{2\\pi}-c_2 e^{2\\pi}=-10e^{2\\pi}\\Rightarrow c_2=4$.\n$y'(0)=2(c_1+1)+c_2=2\\cdot 5+4=14$.",
  },
  {y:2019, n:20, subject:"선형대수", unit:"선형변환", concept:"영공간 정사영",
    difficulty:"medium",
    question:"행렬 $A=\\begin{bmatrix}1&6&3&1\\\\1&4&2&1\\\\0&2&1&0\\end{bmatrix}$의 영공간(nullspace)을 $V$라고 하자. 벡터 $\\vec{x}=(2,0,5,0)$의 $V$ 위로의 정사영을 $\\vec{p}=(p_1,p_2,p_3,p_4)$라고 할 때, $p_1+p_2+p_3+p_4$의 값은?",
    answer:"$2$",
    explanation:"행축약: rank $=2$. 영공간 기저 $u_1=(0,1,-2,0),\\,u_2=(-1,0,0,1)$. 직교 ($u_1\\cdot u_2=0$).\n$\\vec{x}\\cdot u_1=-10,\\,\\vec{x}\\cdot u_2=-2$. $|u_1|^2=5,\\,|u_2|^2=2$.\n$\\vec{p}=-2u_1-u_2=(0,-2,4,0)+(1,0,0,-1)=(1,-2,4,-1)$.\n합 $=1-2+4-1=2$.",
  },

  // ===== 2020 =====
  {y:2020, n:17, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"두 평면 사잇각",
    difficulty:"medium",
    question:"타원체 $x^2+4y^2+z^2=18$ 위의 점 $P(1,2,1)$에서 타원체의 접평면과 $xy$-평면이 만드는 예각을 $\\theta$라 할 때 $\\sec^2\\theta$의 값은?",
    answer:"$66$",
    explanation:"$\\nabla F=(2x,8y,2z)\\big|_{(1,2,1)}=(2,16,2)\\parallel(1,8,1)$. $|\\vec{n}|=\\sqrt{66}$.\n$xy$-평면 법선 $(0,0,1)$. $\\cos\\theta=\\dfrac{1}{\\sqrt{66}}$.\n$\\sec^2\\theta=66$.",
  },
  {y:2020, n:18, subject:"선형대수", unit:"행렬", concept:"행렬식 도함수 (자코비)",
    difficulty:"hard",
    question:"행렬식의 제곱에 대한 자연로그로 정의된 함수 $f(x)=\\ln\\!\\left(\\det\\!\\begin{bmatrix}0&x&x^2&x^3\\\\x&0&x^3&x^2\\\\x^2&x^3&0&x\\\\x^3&x^2&x&0\\end{bmatrix}^2\\right)$에 대하여 $f'(1)$의 값은?",
    answer:"$16$",
    explanation:"자코비 공식: $f(x)=2\\ln|\\det A|$, $f'(x)=2\\,\\mathrm{tr}(A^{-1}A')$.\n$x=1$: $A=J-I$ (4×4, 모두 1, 대각 0). $A^{-1}=\\dfrac{J}{3}-I$.\n$A'(1)$은 지수행렬 $E$ ($E_{ii}=0$, 비대각 $|i-j|$ 등). $JE$의 각 행은 $(6,6,6,6)$.\n$A^{-1}E=\\dfrac{1}{3}JE-E$. 대각합: $\\dfrac{1}{3}\\cdot 4\\cdot 6-0=8$.\n$f'(1)=2\\cdot 8=16$.",
  },
  {y:2020, n:19, subject:"미분학", unit:"미분방정식", concept:"비선형 ODE 분리변수",
    difficulty:"hard",
    question:"함수 $f(x)$가 $x<\\dfrac{1}{2}$일 때 $f''(x)[f(x)]^3=-1$을 만족하고 $f(0)=1,\\,f'(0)=-1$이면 $f(-60)$의 값은?",
    answer:"$11$",
    explanation:"$p=f'$ 두면 $p\\dfrac{dp}{df}f^3=-1$. 분리: $p\\,dp=-\\dfrac{df}{f^3}$ ⇒ $\\dfrac{p^2}{2}=\\dfrac{1}{2f^2}+C$.\n초기조건: $C=0$. $p^2=\\dfrac{1}{f^2}\\Rightarrow p=-\\dfrac{1}{f}$ (부호 결정).\n$ff'=-1$ ⇒ $\\dfrac{f^2}{2}=-x+\\dfrac{1}{2}$ ⇒ $f^2=1-2x$. $f=\\sqrt{1-2x}$.\n$f(-60)=\\sqrt{121}=11$.",
  },
  {y:2020, n:20, subject:"다변수함수", unit:"중적분", concept:"치환적분 분수형",
    difficulty:"hard",
    question:"$\\displaystyle\\int_0^1\\!\\!\\int_0^{1-x}(y-2x)^2\\sqrt{x+y}\\,dy\\,dx=\\dfrac{n}{m}$이고 $m,n$이 서로 소인 자연수일 때, $m+n$은?",
    answer:"$11$",
    explanation:"치환 $u=x+y,\\,v=y-2x$. $x=\\dfrac{u-v}{3},\\,y=\\dfrac{2u+v}{3}$. 자코비안 $\\dfrac{1}{3}$.\n영역: $u\\in[0,1],\\,v\\in[-2u,u]$.\n$\\!\\int_0^1\\!\\!\\int_{-2u}^u v^2\\sqrt{u}\\cdot\\dfrac{1}{3}\\,dv\\,du=\\dfrac{1}{9}\\!\\int_0^1\\sqrt{u}(u^3+8u^3)\\,du=\\!\\int_0^1 u^{7/2}\\,du=\\dfrac{2}{9}$.\n$m=9,\\,n=2$. $m+n=11$.",
  },

  // ===== 2021 =====
  {y:2021, n:17, subject:"미분학", unit:"극한과 연속", concept:"미분가능 부등식",
    difficulty:"hard",
    question:"함수 $f(x),\\,g(x)$가 구간 $(-1,1)$에서 미분가능하고, $f(0)=0$이며, 모든 $x\\in(-1,1)$에 대하여 $|g(x)-1+x-2x^2|\\le f(x)$일 때, $f'(0)-g'(0)$의 값은?",
    answer:"$1$",
    explanation:"$x=0$ 대입: $|g(0)-1|\\le f(0)=0\\Rightarrow g(0)=1$.\n$f(x)\\ge 0$이고 $f(0)=0$이므로 $f$는 $0$에서 최소, $f'(0)=0$.\n$g(x)=1-x+2x^2+\\varepsilon(x)$, $|\\varepsilon(x)|\\le f(x)=o(x)$. 따라서 $g'(0)=-1$.\n$f'(0)-g'(0)=0-(-1)=1$.",
  },
  {y:2021, n:18, subject:"다변수함수", unit:"선적분과 면적분", concept:"평면 삼각형 면적분",
    difficulty:"medium",
    question:"$S$가 $A(1,0,0),\\,B(0,2,0),\\,C(0,0,3)$을 꼭짓점으로 갖는 삼각형으로 위로의 방향을 가지고 있는 면이라고 하자. $S$ 위에서 벡터장 $\\vec{F}(x,y,z)=(x-y)\\vec{i}+z\\vec{j}+y\\vec{k}$의 면적분의 값을 $\\dfrac{q}{p}$라고 할 때, $p+q$의 값은? (단, $p,q$는 서로소인 자연수)",
    answer:"$13$",
    explanation:"평면 매개화 $\\vec{r}(x,y)=(x,y,3-3x-3y/2)$, $\\vec{r}_x\\times\\vec{r}_y=(3,3/2,1)$.\n$\\vec{F}\\cdot(\\vec{r}_x\\times\\vec{r}_y)=-\\dfrac{3x}{2}-\\dfrac{17y}{4}+\\dfrac{9}{2}$.\n$\\!\\int_0^1\\!\\!\\int_0^{2-2x}(\\cdots)\\,dy\\,dx=\\!\\int_0^1(3x^2-12x+9)\\,dx-\\dfrac{17}{6}=4-\\dfrac{17}{6}=\\dfrac{7}{6}$.\n$p=6,\\,q=7$. $p+q=13$.",
  },
  {y:2021, n:19, subject:"미분학", unit:"미분방정식", concept:"비동차 연립 ODE 비율",
    difficulty:"hard",
    question:"$\\begin{bmatrix}y_1(t)\\\\y_2(t)\\end{bmatrix}$가 초깃값 문제 $\\begin{bmatrix}y_1'\\\\y_2'\\end{bmatrix}=\\begin{bmatrix}-2&-1\\\\1&-2\\end{bmatrix}\\!\\begin{bmatrix}y_1\\\\y_2\\end{bmatrix}+e^{-2t}\\!\\begin{bmatrix}1\\\\-3\\end{bmatrix},\\,\\begin{bmatrix}y_1(0)\\\\y_2(0)\\end{bmatrix}=\\begin{bmatrix}8\\\\1\\end{bmatrix}$의 해일 때, $\\dfrac{y_1(2\\pi)}{y_2(2\\pi)}$의 값은?",
    answer:"$8$",
    explanation:"동차해: 고윳값 $-2\\pm i$. $y_h=e^{-2t}[c_1(\\cos t,\\sin t)+c_2(\\sin t,-\\cos t)]$.\n특해 $y_p=e^{-2t}(3,1)$ (대입 검증).\n초기조건 $\\Rightarrow c_1=5,\\,c_2=0$.\n$y_1(t)=e^{-2t}(5\\cos t+3),\\,y_2(t)=e^{-2t}(5\\sin t+1)$.\n$t=2\\pi$: $\\dfrac{y_1}{y_2}=\\dfrac{5+3}{0+1}=8$.",
  },
  {y:2021, n:20, subject:"선형대수", unit:"선형변환", concept:"영공간 정사영 크기",
    difficulty:"hard",
    question:"행렬 $A=\\begin{bmatrix}1&2&3&4\\\\2&3&4&5\\\\3&4&5&6\\end{bmatrix}$에 대하여, 벡터 $\\vec{x}=(-7,-5,1,1)$을 $A$의 영공간(nullspace)과 행공간(row space)에 들어가는 두 벡터 $\\vec{x}_n,\\,\\vec{x}_r$의 합으로 나타낼 때, 영공간에 들어가는 벡터인 $\\vec{x}_n$의 크기의 제곱은?",
    answer:"$6$",
    explanation:"영공간 기저 $u_1=(1,-2,1,0),\\,u_2=(2,-3,0,1)$. 비직교.\n$U^TU=\\begin{pmatrix}6&8\\\\8&14\\end{pmatrix}$, $(U^TU)^{-1}=\\dfrac{1}{20}\\begin{pmatrix}14&-8\\\\-8&6\\end{pmatrix}$.\n$U^T\\vec{x}=(4,2)$. 계수 $(2,-1)$. $\\vec{x}_n=2u_1-u_2=(0,-1,2,-1)$.\n$|\\vec{x}_n|^2=0+1+4+1=6$.",
  },

  // ===== 2022 =====
  {y:2022, n:17, subject:"적분학", unit:"극좌표", concept:"극곡선 호의 길이",
    difficulty:"medium",
    question:"극좌표로 표현된 곡선 $r=1+\\cos\\theta$에서 원 $r=\\sqrt{3}\\sin\\theta$ 안에 있는 부분의 길이를 $L$이라고 할 때, $6L$의 값은?",
    answer:"$12$",
    explanation:"교점: $1+\\cos\\theta=\\sqrt{3}\\sin\\theta\\Rightarrow\\theta=\\dfrac{\\pi}{3},\\pi$.\n$r^2+r'^2=2(1+\\cos\\theta)=4\\cos^2(\\theta/2)$, $\\sqrt{}=2\\cos(\\theta/2)$.\n$L=\\!\\int_{\\pi/3}^{\\pi}2\\cos(\\theta/2)\\,d\\theta=[4\\sin(\\theta/2)]_{\\pi/3}^{\\pi}=4-2=2$.\n$6L=12$.",
  },
  {y:2022, n:18, subject:"다변수함수", unit:"선적분과 면적분", concept:"발산정리 타원체",
    difficulty:"hard",
    question:"바깥으로 향하는 방향을 갖는 곡면 $x^2+2y^2+3z^2=6$을 $S$라고 하자. 곡면 $S$ 위에서 벡터장 $\\vec{F}(x,y,z)=(x^3-xy^2)\\vec{i}-2x^2y\\vec{j}+(3y^2z+z^3)\\vec{k}$의 면적분의 값을 $\\dfrac{q}{p}\\pi$라고 할 때, $p+q$의 값은? (단, $p,q$는 서로 소인 자연수)",
    answer:"$149$",
    explanation:"$\\nabla\\cdot\\vec{F}=x^2+2y^2+3z^2$.\n발산정리: $\\!\\iiint_V(x^2+2y^2+3z^2)\\,dV$. 영역 $V:x^2+2y^2+3z^2\\le 6$.\n치환 $x=\\sqrt{6}u,\\,y=\\sqrt{3}v,\\,z=\\sqrt{2}w$ (자코비안 $6$). 적분 $=36\\!\\iiint_B(u^2+v^2+w^2)\\,dV$ ($B$: 단위구).\n$=36\\cdot\\dfrac{4\\pi}{5}=\\dfrac{144\\pi}{5}$.\n$p=5,\\,q=144$. $p+q=149$.",
  },
  {y:2022, n:19, subject:"미분학", unit:"미분방정식", concept:"라플라스 역변환 분수",
    difficulty:"medium",
    question:"$\\mathcal{L}$을 라플라스 변환이라고 하고 $\\mathcal{L}^{-1}$을 $\\mathcal{L}$의 역변환이라고 하자. $f(t)=\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{1}{s^4+5s^2+4}\\right\\}\\!(t)$에 대하여 $f\\!\\left(\\dfrac{\\pi}{2}\\right)=\\dfrac{q}{p}$라고 할 때, $p+q$의 값은? (단, $p,q$는 서로 소인 자연수)",
    answer:"$4$",
    explanation:"부분분수: $\\dfrac{1}{(s^2+1)(s^2+4)}=\\dfrac{1/3}{s^2+1}-\\dfrac{1/3}{s^2+4}$.\n$f(t)=\\dfrac{1}{3}\\sin t-\\dfrac{1}{6}\\sin 2t$.\n$f(\\pi/2)=\\dfrac{1}{3}\\cdot 1-\\dfrac{1}{6}\\cdot 0=\\dfrac{1}{3}$.\n$p=3,\\,q=1$. $p+q=4$.",
  },
  {y:2022, n:20, subject:"선형대수", unit:"선형변환", concept:"부분공간 정사영",
    difficulty:"medium",
    question:"$\\mathbb{R}^4$의 부분공간 $V=\\{(x_1,x_2,x_3,x_4)\\in\\mathbb{R}^4\\,|\\,x_1+x_2-x_4=0\\}$에 대하여 벡터 $(3,-4,1,5)$의 $V$ 위로의 정사영을 $(a,b,c,d)$라고 할 때, $a+b+c+d$의 값은?",
    answer:"$7$",
    explanation:"$V$의 법선 $\\vec{n}=(1,1,0,-1)$. $\\vec{x}\\cdot\\vec{n}=-6,\\,|\\vec{n}|^2=3$.\n$\\vec{x}$의 $\\vec{n}$ 정사영 $=-2\\vec{n}=(-2,-2,0,2)$.\n$V$ 정사영 $=\\vec{x}-(-2,-2,0,2)=(5,-2,1,3)$.\n$5-2+1+3=7$.",
  },

  // ===== 2023 =====
  {y:2023, n:17, subject:"적분학", unit:"정적분의 응용", concept:"회전체 부피",
    difficulty:"hard",
    question:"좌표평면에서 $x$축, $y$축, $y=\\cos 2x-\\sin x$의 그래프로 둘러싸인 부분 중 1사분면에 있는 영역을 $x$축을 중심으로 회전하여 생기는 입체의 부피가 $\\pi(a\\pi+b\\sqrt{3}+c)$일 때, $96(a+b+c)$의 값은? (단, $a,b,c$는 유리수)",
    answer:"$26$",
    explanation:"$\\cos 2x=\\sin x\\Rightarrow x=\\dfrac{\\pi}{6}$ (1사분면).\n$V=\\pi\\!\\int_0^{\\pi/6}(\\cos 2x-\\sin x)^2\\,dx=\\pi\\!\\left(\\dfrac{\\pi}{6}-\\dfrac{9\\sqrt{3}}{16}+\\dfrac{2}{3}\\right)$.\n$a=\\dfrac{1}{6},\\,b=-\\dfrac{9}{16},\\,c=\\dfrac{2}{3}$. $a+b+c=\\dfrac{13}{48}$.\n$96\\cdot\\dfrac{13}{48}=26$.",
  },
  {y:2023, n:18, subject:"다변수함수", unit:"편도함수의 응용", concept:"라그랑주 거리 최소",
    difficulty:"hard",
    question:"3차원 공간에서 원점과 곡면 $xy^2z=8$ 위의 점 사이의 거리의 최솟값이 $d$일 때, $d^2$의 값은?",
    answer:"$8$",
    explanation:"라그랑주: $2x=\\lambda y^2 z,\\,2y=2\\lambda xyz,\\,2z=\\lambda xy^2$.\n관계: $x^2=z^2,\\,y^2=2x^2$ (정렬). $x=z$ 일치.\n$xy^2z=2x^4=8\\Rightarrow x^2=2,\\,y^2=4$.\n$d^2=x^2+y^2+z^2=2+4+2=8$.",
  },
  {y:2023, n:19, subject:"다변수함수", unit:"선적분과 면적분", concept:"그린정리 폐로 보강",
    difficulty:"hard",
    question:"$C$가 벡터방정식 $\\vec{r}(t)=t\\vec{i}-\\sin t\\vec{j},\\,0\\le t\\le\\pi$로 주어진 곡선이라고 하자. $C$ 위에서 벡터장 $\\vec{F}(x,y)=\\!\\left(\\dfrac{1}{\\pi^2}x-y\\sin x\\right)\\vec{i}+(x-\\sin y^2+\\cos x)\\vec{j}$의 선적분의 값이 $\\dfrac{q}{p}$일 때, $p+q$의 값은? (단, $p$와 $q$는 서로소인 자연수)",
    answer:"$5$",
    explanation:"$Q_x-P_y=1$. 폐로 만들기: $C+$ ($x$축으로 $(\\pi,0)\\to(0,0)$ 선분) = 시계방향 폐곡선, 영역 $D=\\{0<x<\\pi,\\,-\\sin x<y<0\\}$ 둘러쌈.\n그린: $\\!\\oint_{cw}=-\\!\\iint_D 1\\,dA=-2$. 선분 적분 $=-\\dfrac{1}{2}$.\n$\\!\\int_C=-2-(-\\dfrac{1}{2})=-\\dfrac{3}{2}$.\n절댓값으로 $\\dfrac{q}{p}=\\dfrac{3}{2}$, $p=2,\\,q=3$. $p+q=5$.",
  },
  {y:2023, n:20, subject:"미분학", unit:"미분방정식", concept:"라플라스 역변환 시간이동",
    difficulty:"hard",
    question:"$\\mathcal{L}$을 라플라스 변환이라고 하고 $\\mathcal{L}^{-1}$를 $\\mathcal{L}$의 역변환이라고 하자. $f(t)=\\mathcal{L}^{-1}\\!\\left\\{\\dfrac{s+2}{s^2+1}+\\dfrac{3se^{-\\pi s}}{(s^2+4)(s^2+1)}\\right\\}\\!(t)$일 때, $5f\\!\\left(\\dfrac{\\pi}{2}\\right)-f(2\\pi)$의 값은?",
    answer:"$11$",
    explanation:"첫째 항: $\\cos t+2\\sin t$.\n둘째 항: $\\dfrac{3s}{(s^2+4)(s^2+1)}=\\dfrac{s}{s^2+1}-\\dfrac{s}{s^2+4}$. 역변환 $\\cos t-\\cos 2t$. 시간이동 $U(t-\\pi)(-\\cos t-\\cos 2t)$.\n$f(\\pi/2)=0+2=2$. $f(2\\pi)=1+0-1-1=-1$.\n$5\\cdot 2-(-1)=11$.",
  },

  // ===== 2024 =====
  {y:2024, n:17, subject:"다변수함수", unit:"공간의 직선과 평면", concept:"사면체 부피 극값",
    difficulty:"hard",
    question:"네 점 $(0,3,6),\\,\\!\\left(\\dfrac{x}{3},7,7\\right),\\,(0,x,5),\\,(0,9,x)$를 꼭짓점으로 갖는 사면체의 부피의 최댓값과 최솟값의 합은? (단, $1\\le x\\le 5$)",
    answer:"$2$",
    explanation:"$V(x)=\\dfrac{x(x^2-9x+24)}{18}$, $g(x)=x^3-9x^2+24x$, $g'(x)=3(x-2)(x-4)$.\n$g(1)=16,\\,g(2)=20,\\,g(4)=16,\\,g(5)=20$.\n$V_{\\max}=\\dfrac{20}{18}=\\dfrac{10}{9},\\,V_{\\min}=\\dfrac{16}{18}=\\dfrac{8}{9}$.\n합 $=2$.",
  },
  {y:2024, n:18, subject:"다변수함수", unit:"선적분과 면적분", concept:"스토크스 정리 극한",
    difficulty:"hard",
    question:"중심이 $(1,1,1)$이고 반지름이 $a$인 구면 $(x-1)^2+(y-1)^2+(z-1)^2=a^2$과 평면 $x+y+z=3$이 만나는 곡선을 $C_a$라고 하자. 벡터장 $\\vec{F}(x,y,z)=(y^3-x^3)\\vec{i}+x^2\\vec{j}+xy\\vec{k}$에 대하여 극한 $\\displaystyle\\lim_{a\\to 0}\\dfrac{1}{\\pi a^2}\\!\\int_{C_a}\\vec{F}\\cdot d\\vec{r}$의 값은? (단, $C_a$는 위에서 볼 때 시계 반대 방향을 가진다.)",
    answer:"$-\\dfrac{\\sqrt{3}}{3}$",
    explanation:"스토크스: $\\!\\int_{C_a}\\vec{F}\\cdot d\\vec{r}=\\!\\iint_S(\\nabla\\times\\vec{F})\\cdot d\\vec{S}$.\n$\\nabla\\times\\vec{F}=(x,-y,2x-3y^2)\\big|_{(1,1,1)}=(1,-1,-1)$.\n평면 단위법선 $\\vec{n}=(1,1,1)/\\sqrt{3}$. $(\\nabla\\times\\vec{F})\\cdot\\vec{n}=-\\dfrac{1}{\\sqrt{3}}$.\n극한 $=-\\dfrac{1}{\\sqrt{3}}=-\\dfrac{\\sqrt{3}}{3}$.",
  },
  {y:2024, n:19, subject:"미분학", unit:"미분방정식", concept:"멱급수 점화식",
    difficulty:"medium",
    question:"$y(x)=\\displaystyle\\sum_{n=0}^{\\infty}c_n x^n$이 초깃값 문제 $y''+xy=0,\\,y(0)=2,\\,y'(0)=-1$의 해일 때, $110c_{11}$의 값은?",
    answer:"$0$",
    explanation:"점화식: $c_{n+2}=-\\dfrac{c_{n-1}}{(n+2)(n+1)}$ ($n\\ge 1$), $c_2=0$.\n$c_2=0\\Rightarrow c_5=0\\Rightarrow c_8=0\\Rightarrow c_{11}=0$.\n$110c_{11}=0$.",
  },
  {y:2024, n:20, subject:"선형대수", unit:"선형변환", concept:"멱영행렬 특성다항식 합",
    difficulty:"medium",
    question:"선형변환 $T:\\mathbb{R}^3\\to\\mathbb{R}^3$의 특성다항식(characteristic polynomial)을 $\\Delta_T(\\lambda)$라고 하자. $T(x,y,z)=(0,x,y)$로 정의된 선형변환 $T$에 대하여 극한 $\\displaystyle\\lim_{\\lambda\\to 0}\\!\\left|\\dfrac{\\Delta_T(\\lambda)+\\Delta_{T^2}(\\lambda)+\\Delta_{T^3}(\\lambda)}{\\lambda^3}\\right|$의 값은? (단, $T^2=T\\circ T,\\,T^3=T^2\\circ T$)",
    answer:"$3$",
    explanation:"$T,T^2,T^3$ 모두 멱영(eigenvalues 모두 0).\n$\\Delta_T(\\lambda)=\\lambda^3,\\,\\Delta_{T^2}(\\lambda)=\\lambda^3,\\,\\Delta_{T^3}(\\lambda)=\\lambda^3$ ($T^3=0$).\n합 $=3\\lambda^3$, 극한 $=|3|=3$.",
  },
];

const TOTAL=PROBLEMS.length;
console.log(`총 ${TOTAL}문제 (주관식) 준비됨`);

const rows = PROBLEMS.map(p => {
  const id = `q-${p.y}-${SCHOOL_EN}-${String(p.n).padStart(2,"0")}`;
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
    options: subj(p.answer),
    correct_option_id: "1",
    explanation: p.explanation,
    explanation_content_type: "latex",
    explanation_image: null,
    tags: [`year:${p.y}`, `school:${SCHOOL_KO}`, `school_slug:${SCHOOL_EN}`, "past_exam", "subjective"],
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
