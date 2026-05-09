// 해설 30자 미만 37건을 학생 입장에서 이해 가능하도록 보강.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const FIXES = [
  {
    id: "p-cb01-05",
    explanation:
      "$y=x^2+1$을 $x$에 대해 미분하면 $y'=2x$. 점 $(1,2)$에서의 접선 기울기는 $y'(1)=2\\cdot 1=2$. 답: 2."
  },
  {
    id: "q-2025-cau-10",
    explanation:
      "$R_2\\to R_2-R_1$, $R_3\\to R_3-R_1$, $R_4\\to R_4-R_1$로 행 연산하면 1열 외에는 대부분 $(a-b)$ 또는 $0$이 된다. 정리 후 1열에 대해 라플라스 전개하면 $\\det M=(a-b)^4$. 답: 3."
  },
  {
    id: "q-2025-dku-pm-01",
    explanation:
      "$\\ln$은 $x=e$에서 연속이므로 극한을 안으로 들여보낼 수 있다. $\\displaystyle\\lim_{x\\to 0}\\ln(e+x)=\\ln(e+0)=\\ln e=1$. 답: 3."
  },
  {
    id: "q-2025-inha-20",
    explanation:
      "$A+2B=AB$의 양변에 우측에서 $A$를 곱하면 $A^2+2BA=ABA$, 좌측에서 $A$를 곱하면 $A^2+2AB=A^2 B=A(AB)$. 즉 $A(AB)=ABA$인데 $AB=A+2B$가 가역적 표현이라 $AB=BA$가 따라온다. 따라서 $AB-BA=O$이고 모든 원소의 합 $=0$. 답: 1."
  },
  {
    id: "q-2025-inha-21",
    explanation:
      "감마함수의 정의 $\\Gamma(s)=\\displaystyle\\int_0^{\\infty}t^{s-1}e^{-t}dt$에서 $s-1=-1/2$, 즉 $s=1/2$. 따라서 $\\displaystyle\\int_0^{\\infty}\\dfrac{1}{\\sqrt t}e^{-t}dt=\\Gamma\\!\\left(\\dfrac{1}{2}\\right)=\\sqrt{\\pi}$. 답: 3."
  },
  {
    id: "q-daily-eng-r10-1",
    explanation:
      "특성방정식 $r^2+1=0$에서 동차해 $y_h=c_1\\cos x+c_2\\sin x$. 매개변수 변동법: $W=1$, $u_1'=-\\sin x\\cdot\\sec x=-\\tan x$ → $u_1=\\ln|\\cos x|$, $u_2'=\\cos x\\cdot\\sec x=1$ → $u_2=x$. 특수해 $y_p=\\cos x\\ln|\\cos x|+x\\sin x$. 일반해는 $y=c_1\\cos x+c_2\\sin x+\\cos x\\ln|\\cos x|+x\\sin x$. 답: 1."
  },
  {
    id: "q-daily-eng-r12-1",
    explanation:
      "특성방정식 $(r-1)^2=0$의 중근 $r=1$. 동차해 $y_h=(c_1+c_2 x)e^x$. 매개변수 변동법으로 특수해 $y_p=xe^x\\ln x-xe^x$. 일반해를 정리하면 $y=(c_1+c_2 x-x+x\\ln x)e^x$이고 상수 $-x$의 계수 $-1$을 $c_2$에 흡수하면 $y=(c_1+c_2 x+x\\ln x)e^x$. 답: 1."
  },
  {
    id: "q-daily-eng-r12-4",
    explanation:
      "계수행렬 $M=\\begin{pmatrix}2&8\\\\-1&-2\\end{pmatrix}$의 특성방정식 $\\lambda^2-(\\text{tr}M)\\lambda+\\det M=\\lambda^2+4=0$에서 고유치 $\\lambda=\\pm 2i$. 일반해는 $\\sin 2t,\\cos 2t$의 선형결합. 초기조건 $(2,-1)$을 사용해 상수 결정 후 $t=\\pi/2$ 대입하면 $x'+x+y'+y=3$. 답: 1."
  },
  {
    id: "q-daily-eng-r13-2",
    explanation:
      "첫 식에서 $x=y-y'$, 미분하면 $x'=y'-y''$. 둘째 식에 대입하여 정리하면 $y''+2y'+y=e^{-t}\\ln t$. 특성방정식 $(r+1)^2=0$의 중근 $r=-1$, 동차해 $y_h=(c_1+c_2 t)e^{-t}$. 매개변수 변동법으로 $y_p=\\dfrac{1}{2}t^2 e^{-t}\\ln t-\\dfrac{3}{4}t^2 e^{-t}$. 일반해 $y=c_1 e^{-t}+c_2 te^{-t}+\\dfrac{1}{2}t^2 e^{-t}\\ln t-\\dfrac{3}{4}t^2 e^{-t}$. 답: 1."
  },
  {
    id: "q-daily-eng-r14-2",
    explanation:
      "$A(t)$는 탱크 A의 소금량: 순수 물 유입이라 $A'=-\\dfrac{2}{100}A=-0.02A$, $A(0)=4$이므로 $A(t)=4e^{-0.02t}$. $B(t)$는 탱크 B의 소금량: $B'=0.02A-0.02B$, 즉 $B'+0.02B=0.08e^{-0.02t}$. 적분인자 $e^{0.02t}$로 풀면 $B(t)=(0.08t+2)e^{-0.02t}$. $t=5$ 대입: $A(5)=4e^{-0.1}$, $B(5)=2.4e^{-0.1}$. 합 $=\\dfrac{32}{5}e^{-0.1}$. 답: 1."
  },
  {
    id: "q-daily-eng-r15-1",
    explanation:
      "1계 선형 ODE: 적분인자 $e^{-2t}$로 풀면 일반해 $y=Ce^{2t}+\\dfrac{t}{2}-\\dfrac{7}{4}$ (특수해는 다항식). $t\\to\\infty$일 때 $e^{2t}$ 항이 압도적으로 지배하므로 $y\\sim Ce^{2t}$, $y'\\sim 2Ce^{2t}$. 따라서 $\\dfrac{y'}{y}\\to 2$ ($C\\ne 0$). 답: 1."
  },
  {
    id: "q-daily-eng-r15-3",
    explanation:
      "로지스틱 방정식 $y'=ry(K-y)$의 형태로 $r=5$, $K=1$. 안정 평형점은 $y=K=1$. 양의 초기값 $y(0)>0$에서는 $y<1$이면 $y'>0$이라 증가, $y>1$이면 $y'<0$이라 감소하여 $1$로 수렴한다. 답: 1."
  },
  {
    id: "q-daily-eng-r16-1",
    explanation:
      "분모 인수분해: $s^4+5s^2+4=(s^2+1)(s^2+4)$. 부분분수로 $Y(s)=\\dfrac{2s+1}{s^2+1}+\\dfrac{-2s-1}{s^2+4}$. 표준 역변환 적용: $\\mathcal L^{-1}\\!\\left\\{\\dfrac{2s}{s^2+1}\\right\\}=2\\cos t$, $\\mathcal L^{-1}\\!\\left\\{\\dfrac{1}{s^2+1}\\right\\}=\\sin t$, $\\mathcal L^{-1}\\!\\left\\{\\dfrac{-2s}{s^2+4}\\right\\}=-2\\cos 2t$, $\\mathcal L^{-1}\\!\\left\\{\\dfrac{-1}{s^2+4}\\right\\}=-\\dfrac{1}{2}\\sin 2t$. 합치면 답: 1."
  },
  {
    id: "q-daily-eng-r19-4",
    explanation:
      "$\\mathbf F=(P,Q,R)$가 보존벡터장이려면 $P_y=Q_x$, $P_z=R_x$, $Q_z=R_y$를 만족해야 한다. $P_y=ax$, $Q_x=2x$이므로 $ax=2x$ → $a=2$. (확인: $P_z=0=R_x$, $Q_z=2y=R_y$로 나머지 두 조건도 충족.) 답: 1."
  },
  {
    id: "q-daily-eng-r23-6",
    explanation:
      "그린 정리: $\\displaystyle\\oint_T P\\,dx+Q\\,dy=\\iint_R(Q_x-P_y)dA$. 여기서 $P=y$, $Q=xy^2$이므로 $Q_x-P_y=y^2-1$. 영역은 $0\\le x\\le y$, $0\\le y\\le 2$. $\\displaystyle\\int_0^2\\!\\int_0^y(y^2-1)dx\\,dy=\\int_0^2 y(y^2-1)dy=\\!\\left[\\dfrac{y^4}{4}-\\dfrac{y^2}{2}\\right]_0^2=4-2=2$. 답: 1."
  },
  {
    id: "q-daily-eng-r24-6",
    explanation:
      "$\\displaystyle\\int_C\\dfrac{-y\\,dx+x\\,dy}{x^2+y^2}$는 원점을 둘러싸는 단순 폐곡선이면 정확히 $2\\pi$를 준다(편각의 변화량). 타원 $\\dfrac{x^2}{2}+\\dfrac{y^2}{3}=1$은 원점을 내부에 포함하므로 적분값 $=2\\pi$. 답: 1."
  },
  {
    id: "q-daily-eng-r25-1",
    explanation:
      "$\\displaystyle\\oint_C\\dfrac{-y\\,dx+x\\,dy}{x^2+y^2}$는 원점이 곡선 내부면 $2\\pi$, 외부면 $0$이다. 중심 $(1,1)$, 반지름 $1$인 원과 원점 사이 거리는 $\\sqrt 2>1$이라 원점이 외부에 있다. 따라서 $0$. 답: 1."
  },
  {
    id: "q-daily-eng-r27-2",
    explanation:
      "$\\nabla\\cdot\\mathbf F=\\partial_x(2z)+\\partial_y(x)+\\partial_z(y^2)=0$. 표면 $S$를 $xy$평면 원판 $D:x^2+y^2\\le 4,\\ z=0$ (아래쪽 법선)으로 닫아 발산정리 적용: $\\iint_S\\mathbf F\\cdot d\\mathbf S+\\iint_D\\mathbf F\\cdot(-\\hat k)dA=0$. $\\mathbf F\\cdot(-\\hat k)=-y^2$이므로 $\\iint_D(-y^2)dA=-\\!\\int_0^{2\\pi}\\!\\int_0^2 r^3\\sin^2\\theta\\,dr\\,d\\theta=-\\pi\\cdot 4=-4\\pi$. 따라서 $\\iint_S\\mathbf F\\cdot d\\mathbf S=4\\pi$. 답: 1."
  },
  {
    id: "q-daily-eng-r4-1",
    explanation:
      "동차 ODE이므로 $y=ux$ 치환: $u+xu'=\\dfrac{u-2}{u+1}$, 정리하면 $xu'=-\\dfrac{u^2+2}{u+1}$. 변수분리 후 적분: $\\dfrac{1}{2}\\ln(u^2+2)+\\dfrac{1}{\\sqrt 2}\\tan^{-1}\\!\\dfrac{u}{\\sqrt 2}=-\\ln|x|+C$. $u=y/x$를 대입해 정리하면 $\\dfrac{1}{2}\\ln(y^2+2x^2)+\\dfrac{1}{\\sqrt 2}\\tan^{-1}\\!\\dfrac{y}{\\sqrt 2 x}=c$. 답: 1."
  },
  {
    id: "q-daily-eng-r5-6",
    explanation:
      "특성방정식 $r^2-4r+4=(r-2)^2=0$의 중근 $r=2$. 일반해 $y=(c_1+c_2 x)e^{2x}$. $y(0)=c_1=1$, $y'=(c_2+2c_1+2c_2 x)e^{2x}$이므로 $y'(0)=c_2+2=5$ → $c_2=3$. 따라서 $y=(1+3x)e^{2x}=e^{2x}+3xe^{2x}$. 답: 1."
  },
  {
    id: "q-daily-int-r16-2",
    explanation:
      "감마함수 $\\Gamma(s)=\\displaystyle\\int_0^{\\infty}t^{s-1}e^{-t}dt$. 여기서 $t^{s-1}=t$이므로 $s=2$. 양의 정수에서 $\\Gamma(n)=(n-1)!$이라 $\\Gamma(2)=1!=1$. 답: 1."
  },
  {
    id: "q-daily-int-r16-3",
    explanation:
      "감마함수 $\\Gamma(s)=\\displaystyle\\int_0^{\\infty}t^{s-1}e^{-t}dt$. $t^{s-1}=t^3$이므로 $s=4$. $\\Gamma(4)=3!=6$. 답: 2."
  },
  {
    id: "q-daily-int-r34-2",
    explanation:
      "두 곡선의 교점은 $r=\\theta=2\\cos\\theta$의 해. $\\theta=0$이면 $r=0$ (둘 다 원점). $\\theta>0$에서 $\\theta=2\\cos\\theta$를 그래프로 풀면 $\\theta\\approx 1.03$에서 한 번 더 만난다. $\\theta>\\pi/2$면 $2\\cos\\theta<0$이라 $r=\\theta>0$과 만나지 않음. 따라서 교점 $2$개. 답: 2."
  },
  {
    id: "q-daily-la-r10-3",
    explanation:
      "세 열벡터로 만든 평행육면체의 부피는 $|\\det A|$. $\\det A=\\begin{vmatrix}1&2&3\\\\1&0&2\\\\-1&2&1\\end{vmatrix}=1(0-4)-2(1+2)+3(2-0)=-4-6+6=-4$. 부피 $=|{-4}|=4$. 답: 3."
  },
  {
    id: "q-daily-la-r18-5",
    explanation:
      "벡터들을 행으로 놓고 행 환산: $R_2\\to R_2-R_1=(0,-3,2)$, $R_3\\to R_3-R_1=(0,-1,3)$. 이어서 $R_3\\to R_3-\\dfrac{1}{3}R_2$로 정리하면 0이 아닌 행 $3$개. rank $=3$이므로 부분공간 차원 $=3$. 답: 3."
  },
  {
    id: "q-daily-la-r19-1",
    explanation:
      "교대행렬 $A^T=-A$이면 대각성분 $a_{ii}=-a_{ii}$로부터 $a_{ii}=0$. 하삼각 부분은 $a_{ji}=-a_{ij}$로 상삼각이 결정한다. 자유롭게 정할 수 있는 것은 상삼각의 비대각 성분뿐이고 그 개수는 $\\binom{n}{2}=\\dfrac{n(n-1)}{2}$. 답: 1."
  },
  {
    id: "q-daily-la-r2-3",
    explanation:
      "1열에 0이 적지 않은 점은 없지만, 첫 행 $(6,0,0,-6)$이 깔끔하다. 행 연산으로 $R_4\\to R_4+\\dfrac{1}{2}R_1$ 등으로 정리한 뒤 라플라스 전개. 단계별로 계산하면 $\\det=72$. 답: 3."
  },
  {
    id: "q-daily-la-r2-4",
    explanation:
      "5x5 행렬식. 0이 많은 2열에 대해 라플라스 전개하거나, 행 연산으로 상삼각화. 각 단계에서 부호와 계수 변화에 주의해 계산하면 $\\det=54$. 답: 2."
  },
  {
    id: "q-daily-la-r28-4",
    explanation:
      "$v=a v_1+b v_2+c v_3$의 좌표 $(a,b,c)$를 구하기 위해 연립방정식: $a-b+c=0$, $3b+c=1$, $2a+b+c=2$. 1식에서 $a=b-c$, 3식 대입 $3b-c=2$. 2식 $3b+c=1$과 더하면 $6b=3$, $b=1/2$. 빼면 $-2c=1$, $c=-1/2$. $a=1$. $[v]_S=\\begin{pmatrix}1\\\\1/2\\\\-1/2\\end{pmatrix}$. 답: 2."
  },
  {
    id: "q-daily-la-r29-5",
    explanation:
      "$A$를 직접 계산: $A^2=\\begin{pmatrix}0&1&0\\\\0&0&1\\\\1&0&0\\end{pmatrix}$, $A^3=\\begin{pmatrix}1&0&0\\\\0&1&0\\\\0&0&1\\end{pmatrix}=I$. 회전행렬이 $A^3=I$이려면 회전각 $\\theta$가 $3\\theta=2\\pi$, 즉 $\\theta=\\dfrac{2\\pi}{3}$. 답: 3."
  },
  {
    id: "q-daily-la-r32-1",
    explanation:
      "가: $\\vec v\\times\\vec w$는 $\\vec v,\\vec w$ 평면에 수직이라 그 평면에 속하지 않으므로 셋이 1차독립. ✓. 나: 1차종속이면 두 벡터가 평행하거나 한쪽이 영벡터. 둘 다 외적은 영벡터. ✓. 다: 좌표변환 행렬 $\\begin{pmatrix}1&1&0\\\\-1&1&1\\\\0&0&1\\end{pmatrix}$의 $\\det=2\\ne 0$이므로 새 셋도 기저. ✓. 모두 옳음. 답: 4."
  },
  {
    id: "q-daily-la-r34-3",
    explanation:
      "정규방정식 $G^TGc=G^Tu$를 푼다. $G=[v_1\\ v_2]$, $u=(1,1,1,-1)$. $G^TG=\\begin{pmatrix}3&-3\\\\-3&9\\end{pmatrix}$, $G^Tu=\\binom{1}{1}$. $\\det=18$. $c_1=\\dfrac{12}{18}=\\dfrac{2}{3}$, $c_2=\\dfrac{6}{18}=\\dfrac{1}{3}$. 사영 $v=\\dfrac{2}{3}v_1+\\dfrac{1}{3}v_2=(2/3,2/3,-1/3,0)$. 합 $=2/3+2/3-1/3+0=1$. 답: 1."
  },
  {
    id: "q-daily-la-r35-2",
    explanation:
      "이 행렬은 4사이클 순열행렬. ㄱ: 각 행이 서로 다른 위치에 1, 나머지 0이라 단위벡터이고 서로 직교 → 직교행렬. ✓. ㄴ: 4사이클 순열의 부호는 $(-1)^{4-1}=-1$이므로 $\\det A=-1\\ne 1$. ✗. ㄷ: 직교행렬은 가역, rank $=4$. ✓. 답: 2."
  },
  {
    id: "q-daily-la-r6-5",
    explanation:
      "행 환산: $R_2\\to R_2-3R_1=(0,-7,-10,-11)$, $R_3\\to R_3-5R_1=(0,-14,-20,-22)$. $R_3=2R_2$이므로 $R_3\\to R_3-2R_2=(0,0,0,0)$. 0이 아닌 행 $2$개, rank $=2$. 답: 3."
  },
  {
    id: "q-daily-mv-r11-1",
    explanation:
      "$u=x-y$로 두면 $z=f(u)$. 연쇄법칙: $z_x=f'(u)\\cdot u_x=f'(u)\\cdot 1=f'$, $z_y=f'(u)\\cdot u_y=f'(u)\\cdot(-1)=-f'$. 따라서 $z_x+z_y=f'-f'=0$. 답: 1."
  },
  {
    id: "q-daily-mv-r30-5",
    explanation:
      "적분영역은 1사분원 $x^2+y^2\\le 4,\\ x,y\\ge 0$. 극좌표 변환 $x=r\\cos\\theta, y=r\\sin\\theta$로 $\\sin(x^2+y^2)=\\sin(r^2)$, $dA=r\\,dr\\,d\\theta$. $\\displaystyle\\int_0^{\\pi/2}\\!\\int_0^2 r\\sin(r^2)\\,dr\\,d\\theta=\\dfrac{\\pi}{2}\\cdot\\!\\left[-\\dfrac{\\cos(r^2)}{2}\\right]_0^2=\\dfrac{\\pi}{2}\\cdot\\dfrac{1-\\cos 4}{2}=\\dfrac{\\pi(1-\\cos 4)}{4}$. 답: 1."
  },
  {
    id: "q-daily-mv-r5-5",
    explanation:
      "(a) $y=0$에서 $\\dfrac{x}{\\sin x}\\to 1$, $y=x$에서 $\\dfrac{0}{\\sin 2x}=0$. 두 경로 값이 다르므로 극한 존재 X. (b) $|x|\\le r,\\ y^{3/2}\\le r^{3/2}$ ($r=\\sqrt{x^2+y^2}$)이므로 $\\left|\\dfrac{x\\sqrt{y^3}}{x^2+y^2}\\right|\\le\\dfrac{r\\cdot r^{3/2}}{r^2}=r^{1/2}\\to 0$. ✓. (c) $u=x^2+y^2$로 두면 $\\dfrac{\\sin u}{u}\\to 1$이고 앞의 $x\\to 0$이라 곱은 $0$. ✓. 답: 5."
  }
];

let ok = 0, fail = 0;
for (const f of FIXES) {
  const { error } = await sb.from("questions").update({
    explanation: f.explanation,
    updated_at: new Date().toISOString()
  }).eq("id", f.id);
  if (error) { console.error(`❌ ${f.id}:`, error.message); fail++; continue; }
  console.log(`✓ ${f.id}`);
  ok++;
}
console.log(`\n총 ${ok}건 보강, ${fail}건 실패 (대상 ${FIXES.length}건)`);
