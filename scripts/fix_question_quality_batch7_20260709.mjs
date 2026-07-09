// Final pass for remaining low-priority explanation issues plus confirmed content artifacts.
//
// Usage:
//   node scripts/fix_question_quality_batch7_20260709.mjs --dry-run
//   node scripts/fix_question_quality_batch7_20260709.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const outDir = resolve(root, "tmp", "audit");
mkdirSync(outDir, { recursive: true });

const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials in .env.local");

const sb = createClient(supabaseUrl, supabaseKey);
const option = (id, text) => ({ id, text, image: "", label: id, contentType: "latex" });

const fixes = [
  {
    id: "q-2025-dgu-08",
    question: String.raw`함수 $f(x)$가 양수의 집합에서 연속이고 모든 실수 $t$에 대하여 $\displaystyle\int_{1+t}^{e^{2t}+t}f(x-t)\,dx=4e^{3t}\sin t$를 만족한다. $f'(e^\pi)$의 값은?`,
    options: [
      option("1", String.raw`$e^{-\pi/2}$`),
      option("2", String.raw`$2e^{-\pi/2}$`),
      option("3", String.raw`$3e^{-\pi/2}$`),
      option("4", String.raw`$4e^{-\pi/2}$`),
      option("5", String.raw`$5e^{-\pi/2}$`),
    ],
    explanation: String.raw`$u=x-t$로 치환하면 $\int_1^{e^{2t}}f(u)\,du=4e^{3t}\sin t$이다. 양변을 $t$로 미분하면 $2e^{2t}f(e^{2t})=4e^{3t}(3\sin t+\cos t)$이므로 $f(e^{2t})=2e^t(3\sin t+\cos t)$이다. 다시 미분해 $2e^{2t}f'(e^{2t})=2e^t(2\sin t+4\cos t)$이고, $e^{2t}=e^\pi$에서 $t=\pi/2$이므로 $f'(e^\pi)=2e^{-\pi/2}$이다.`,
  },
  {
    id: "q-daily-la-r31-4",
    question: String.raw`선형사상 $T:R^2\to M_{2\times 2}(R),\ T(a,b)=\begin{pmatrix}a&b\\0&a+2b\end{pmatrix}$에 대한 다음 성질 중 옳은 것을 모두 고르면?
가. $T$는 일대일 사상이다
나. $T$의 핵의 차원은 1이다
다. $T(\{(a,a-b)|a,b\in R\})$의 차원은 3이다`,
    explanation: String.raw`$T(a,b)=O$이면 첫째 행에서 $a=0,\ b=0$이므로 $T$는 단사이고 가는 참이다. 따라서 핵의 차원은 $0$이어서 나는 거짓이다. 또한 $\{(a,a-b):a,b\in R\}=R^2$이므로 그 상의 차원은 $\operatorname{rank}T=2$ 이하이며 3이 될 수 없어 다도 거짓이다.`,
  },
  {
    id: "q-ryu-self-warmup-r09-02",
    question: String.raw`2. $f(x)=\frac{2}{(2-x)^{2}}$ 의 맥클로린 급수가 $\sum_{n=0}^{\infty} a_{n} x^{n}$ 이고 $x f^{(3)}(x)$ 의 맥클로린 급수가 $\sum_{n=1}^{\infty} b_{n} x^{n}$ 일 때, $\lim _{n \rightarrow \infty} \frac{n^{3} a_{n}}{b_{n}}$ 의 값은?`,
  },
  {
    id: "q-2021-cau-17",
    explanation: String.raw`빗변 $x/2+y=1$의 길이는 $\sqrt5$, 원점에서 빗변까지의 높이는 $2/\sqrt5$이다. 빗변과 평행한 단면을 빗변에서 거리 $d$만큼 안쪽에 잡으면 단면 길이는 닮음으로 $\sqrt5(1-d/(2/\sqrt5))$가 된다. 직사각형 넓이 $A(d)=d\sqrt5(1-d/(2/\sqrt5))$는 이차식이므로 $d=1/\sqrt5$에서 최대이고, 최댓값은 $\sqrt5\cdot(2/\sqrt5)/4=\dfrac12$이다.`,
  },
  {
    id: "q-2022-dgu-11",
    explanation: String.raw`영역 $S$는 위쪽 반원이다. A는 $-1\le x\le1,\ 0\le y\le\sqrt{1-x^2}$인 수직 슬라이스이므로 참이고, B는 $0\le y\le1,\ -\sqrt{1-y^2}\le x\le\sqrt{1-y^2}$인 수평 슬라이스이므로 참이다. 극좌표로 쓰면 $0\le r\le1,\ 0\le\theta\le\pi$와 함께 $dA=r\,dr\,d\theta$가 필요하므로 야코비안 $r$이 빠진 C는 거짓이다.`,
  },
  {
    id: "q-2022-hongik-15",
    explanation: String.raw`방정식 $k u_{xx}=u_t$는 시간이 지남에 따라 변하는 열전도 방정식이므로 $u(x,t)$를 항상 평형상태로 보는 ①은 맞지 않는다. $u(x,0)=f(x)$는 초기 온도를 뜻하고, $u_x(0,t)=0$은 왼쪽 끝에서 열유속이 0인 단열 조건이다. 또 $u(L,t)=0$은 오른쪽 끝 온도를 0으로 유지한다는 뜻이므로 ②,③,④는 주어진 경계값 문제와 일치한다.`,
  },
  {
    id: "q-2023-ewha-14",
    explanation: String.raw`a는 미분가능하면 연속이므로 참이다. b는 $f$가 $c$에서 미분가능하다는 조건이 없으므로 $f(x)=|x|$의 $c=0$처럼 극값은 있지만 $f'(c)$가 존재하지 않는 반례가 있다. c는 미분가능성과 $f(c)=f(d)$에서 롤의 정리를 적용하면 어떤 $e$에 대해 $f'(e)=0$이므로 참이다. d는 한 점의 $f'(c)>0$만으로 주변 전체 증가가 보장되지 않아 거짓이고, e는 도함수의 중간값 성질인 다르부 정리로 참이다.`,
  },
  {
    id: "q-2023-ewha-16",
    explanation: String.raw`a는 스칼라삼중적의 순환성, b와 c는 외적의 스칼라배와 분배법칙이므로 참이다. d는 외적이 반대칭이라 $\vec v\times\vec u=-(\vec u\times\vec v)$이므로 일반적으로 거짓이다. e는 벡터삼중곱 공식이 $\vec u\times(\vec v\times\vec w)=(\vec u\cdot\vec w)\vec v-(\vec u\cdot\vec v)\vec w$이므로 주어진 식과 부호가 반대라 거짓이다.`,
  },
  {
    id: "q-2024-ewha-17",
    explanation: String.raw`a는 $\lim a_n$과 $\lim b_n$이 각각 존재할 때만 극한의 합 법칙을 쓸 수 있으므로 조건 없이 참이 아니다. b는 $|\sin(n\pi/6)|\le1$이고 $|a_n|\to0$이므로 squeeze로 참이다. c는 수열 극한과 연속함수의 합성 정리로 참이다. d는 단조수열이 수렴하려면 증가수열이면 위로 유계, 감소수열이면 아래로 유계가 필요하므로 '위로 유계인 단조수열'만으로는 거짓이다.`,
  },
  {
    id: "q-2024-kyunghee-24",
    explanation: String.raw`㉠은 $A^T=A$이면 $(3A^2-4A-I)^T=3A^2-4A-I$라 참이다. ㉡은 $AB=BA$가 가환만 뜻할 뿐 $A=B$를 뜻하지 않아 거짓이다. ㉢의 두 행렬은 모두 고유값 $1$ 하나를 갖고 영공간 차원이 1인 같은 크기의 Jordan 블록이므로 서로 닮음이다. ㉣은 $A\vec x=0$의 유일해가 영벡터라는 말이 nullity $0$과 동치라 참이고, ㉤은 일차독립이어도 직교할 필요가 없어 거짓이다.`,
  },
  {
    id: "q-2025-kw-01",
    explanation: String.raw`ㄱ은 공집합에서 $Y$로 가는 함수가 정확히 1개이고 공집합의 부분집합도 1개이므로 참이다. ㄴ은 항상 $A\subset f^{-1}(f(A))$이지만 $f$가 단사가 아니면 더 큰 집합이 될 수 있어 거짓이다. ㄷ은 $f(f^{-1}(D))=D\cap\operatorname{Im}f$이므로 전사가 아니면 거짓이다. ㄹ은 식 자체가 임의의 함수 보존 성질로 성립하지 않으므로 거짓이다. 참은 ㄱ 하나이다.`,
  },
  {
    id: "q-2025-kw-13",
    explanation: String.raw`ㄱ은 내적의 정의를 $(\mathbf u\times\mathbf v)$와 $\mathbf w$에 적용한 것이다. ㄴ은 외적 $\mathbf u\times\mathbf v$가 $\mathbf u,\mathbf v$ 모두에 수직이라는 성질이다. ㄷ은 스칼라삼중적의 순환성이고, ㄹ은 양변을 전개하면 $|\mathbf u|^2-2\mathbf u\cdot\mathbf v+|\mathbf v|^2+|\mathbf u|^2+2\mathbf u\cdot\mathbf v+|\mathbf v|^2$가 되어 참이다. 따라서 네 명제가 모두 옳다.`,
  },
  {
    id: "q-2025-kyonggi-45",
    explanation: String.raw`직교행렬 $A$는 $A^TA=I$와 동치이고, 이는 모든 벡터의 노름과 내적을 보존한다는 ③,④와 같다. 또 열벡터들이 정규직교기저이면 $A^TA=I$가 된다. 그러나 ②는 '직교기저'라고만 되어 있어 각 열의 길이가 1이라는 정규화 조건이 빠져 있으므로 나머지 셋과 동치가 아니다.`,
  },
  {
    id: "q-daily-eng-r14-4",
    explanation: String.raw`방정식은 $y''+5y'+4y=0$이고 특성방정식 $(r+1)(r+4)=0$의 근은 $-1,-4$이다. 서로 다른 음의 실근이므로 해는 $C_1e^{-t}+C_2e^{-4t}$ 꼴의 과감쇠 운동이고 진동이나 일정한 진폭은 없다. 초기조건을 넣어도 위치가 시간에 따라 변하므로 속도도 $t$에 따라 변한다.`,
  },
  {
    id: "q-daily-eng-r17-4",
    explanation: String.raw`주어진 함수는 $2\pi\le t\le3\pi$에서만 $\sin t$이고 그 밖에서는 0이다. 따라서 $f(t)=\sin t\,u(t-2\pi)-\sin t\,u(t-3\pi)$로 쓸 수 있다. $\sin(t-2\pi)=\sin t$, $\sin(t-3\pi)=-\sin t$인 점을 이용하면 라플라스 변환은 $\dfrac{e^{-2\pi s}+e^{-3\pi s}}{s^2+1}$이다.`,
  },
  {
    id: "q-daily-la-r25-4",
    explanation: String.raw`$A$는 대각행렬이므로 바로 대각화 가능하다. $B$와 $C$는 모두 고유값 $2$만 갖고 대수적 중복도는 3이지만, 각각의 eigenspace 차원이 행렬 크기 3에 미치지 못한다. 즉 충분한 수의 일차독립 고유벡터가 없으므로 $B,C$는 대각화할 수 없다.`,
  },
  {
    id: "q-daily-mv-r9-2",
    explanation: String.raw`$y=0$ 또는 $x=0$ 축을 따라 차분몫을 계산하면 원점에서 $f_x(0,0)=0,\ f_y(0,0)=0$이 존재한다. 하지만 미분가능하려면 $\dfrac{f(x,y)-0-0x-0y}{\sqrt{x^2+y^2}}\to0$이어야 한다. $x=y^2$로 접근하면 이 비율이 0으로 가지 않아 미분가능하지 않다. 따라서 ⓐ,ⓑ만 참이다.`,
  },
  {
    id: "q-ryu-self-warmup-r05-05",
    explanation: String.raw`닫힌구간에서 유한 개의 점에서만 불연속인 함수나 계단함수는 리만적분 가능하므로 a, b는 가능하다. 반면 c처럼 유리수와 무리수에서 서로 다른 값으로 갈라지는 Dirichlet형 함수는 모든 점에서 불연속이다. 리만적분 가능 조건을 만족하지 못하므로 c는 리만적분 불가능하다.`,
  },
  {
    id: "q-ryu-self-warmup-r16-19",
    explanation: String.raw`그래프가 진폭이 줄지 않는 사인/코사인형 진동이므로 감쇠항이 있는 식은 제외한다. (2), (3)은 해의 진폭이 시간이 지날수록 감소하는 감쇠진동 형태이고, (4)는 각진동수가 달라 주기가 더 짧다. 진폭이 일정한 기본 단순조화진동은 $y''+y=0$이므로 해당 식을 고른다.`,
  },
  {
    id: "q-2019-dankook-45",
    explanation: String.raw`행렬의 고유값의 합은 대각합과 같다. 주어진 조건에서 고유값의 합이 $-1$이고 대각합이 $1+a$이므로 $1+a=-1$이다. 따라서 $a=-2$가 된다.`,
  },
  {
    id: "q-2019-hongik-03",
    explanation: String.raw`삼각행렬의 고유값은 주대각선 성분과 같다. 이 행렬의 대각성분은 $1,2,5,9$이므로 고유값의 전체 목록도 $1,2,5,9$이다. 따라서 $3$은 고유값이 아니다.`,
  },
  {
    id: "q-2021-ewha-27",
    explanation: String.raw`세 조건은 각각 $v_1+v_2$, $v_2+v_3$, $v_3+v_1$이 고유값 $1,2,-4$에 대응하는 고유벡터임을 뜻한다. 이 세 벡터는 원래 기저 $v_1,v_2,v_3$에 대한 좌표행렬의 행렬식이 $2$라 일차독립이다. 따라서 $A$의 세 고유값은 $1,2,-4$이고 $\det A=1\cdot2\cdot(-4)=-8$이다.`,
  },
  {
    id: "q-2021-hansung-08",
    explanation: String.raw`표본평균의 기댓값은 모집단 평균과 같다. 가능한 값이 $2,4,k$이고 평균이 4가 되어야 하므로 $E[\overline X]=E[X]=\dfrac{2+4+k}{3}=4$이다. 따라서 $6+k=12$에서 $k=6$이다.`,
  },
  {
    id: "q-2022-inha-10",
    explanation: String.raw`두 점을 지나는 직선을 구하면 $4x-3y+12=0$이다. 원점과 직선 $Ax+By+C=0$ 사이의 거리는 $\dfrac{|C|}{\sqrt{A^2+B^2}}$이므로 $\dfrac{|12|}{\sqrt{4^2+(-3)^2}}=\dfrac{12}{5}$이다. 따라서 해당하는 선택지는 ③이다.`,
  },
  {
    id: "q-2022-inha-17",
    explanation: String.raw`네 점이 한 평면 위에 있으려면 한 점을 기준으로 만든 세 벡터의 스칼라삼중적이 0이어야 한다. 세 벡터를 행 또는 열로 놓은 행렬식을 $0$으로 두고 전개하면 $a$에 대한 일차식이 나오며, 이를 풀면 $a=5$이다.`,
  },
  {
    id: "q-2022-kyunghee-29",
    explanation: String.raw`최소제곱 직선 $y=ax+b$는 정규방정식 $X^TX\binom{a}{b}=X^Ty$를 만족한다. 주어진 점들을 대입해 정규방정식을 풀면 $a=\dfrac12,\ b=-\dfrac14$가 된다. 따라서 회귀직선은 $y=\dfrac12x-\dfrac14$이다.`,
  },
  {
    id: "q-2023-ewha-09",
    explanation: String.raw`반시계 $30^\circ$ 회전 뒤의 점을 $(x,y)$라 하면 회전 전 좌표는 $x'=\frac{\sqrt3}{2}x+\frac12y,\ y'=-\frac12x+\frac{\sqrt3}{2}y$이다. 원래 식 $4{x'}^2+{y'}^2=4$에 대입해 정리하면 $13x^2+6\sqrt3xy+7y^2=16$이므로 ④가 맞다.`,
  },
  {
    id: "q-2023-ewha-18",
    explanation: String.raw`가우스 적분의 표준값은 $\int_{-\infty}^{\infty}e^{-x^2}\,dx=\sqrt\pi$이다. integrand가 짝함수이므로 $0$부터 $\infty$까지의 적분은 전체의 절반이다. 따라서 $\int_0^\infty e^{-x^2}\,dx=\sqrt\pi/2$이다.`,
  },
  {
    id: "q-2023-ewha-21",
    explanation: String.raw`그린정리에 의해 $\oint_C P\,dx+Q\,dy=\iint_D(Q_x-P_y)\,dA$이다. 문제의 편미분을 계산하면 $Q_x-P_y=7-3=4$이고, 영역 $D$는 단위원이므로 넓이는 $\pi$이다. 따라서 선적분 값은 $4\pi$이다.`,
  },
  {
    id: "q-2023-ewha-25",
    explanation: String.raw`행렬은 두 블록으로 나누어 주기를 볼 수 있다. 위쪽 블록은 한 번 적용할 때 부호가 바뀌는 주기 2 블록이고, 아래쪽 블록은 각도 $2\pi/3$의 회전이어서 세 번 적용하면 항등행렬이 된다. 전체 행렬이 $I$가 되는 최소 자연수는 두 주기의 최소공배수인 $6$이다.`,
  },
  {
    id: "q-2023-uos-11",
    explanation: String.raw`사이클로이드 한 아치의 길이는 표준공식으로 $8r$이다. 문제에서는 같은 반지름의 두 아치 전체 길이가 $16$이므로 $2\cdot8r=16$이다. 따라서 $r=1$이다.`,
  },
  {
    id: "q-2024-cau-24",
    explanation: String.raw`닮은 행렬은 trace를 보존한다. 대각행렬의 대각성분을 $a,b,c$라 하면 그 합은 원래 행렬 $A$의 대각합과 같으므로 $a+b+c=\operatorname{tr}(A)=2-3+6=5$이다.`,
  },
  {
    id: "q-2025-cau-19",
    explanation: String.raw`그린정리에 따라 선적분은 $\iint_D(Q_x-P_y)\,dA$로 바뀐다. 주어진 벡터장의 편미분을 계산하면 $Q_x-P_y=6-2=4$로 상수이다. 영역의 넓이가 $s$이므로 전체 값은 $4s$이다.`,
  },
  {
    id: "q-2025-dgu-04",
    explanation: String.raw`행렬의 rank는 행 사다리꼴로 줄였을 때 피벗이 있는 행의 개수와 같다. 주어진 $4\times5$ 행렬을 행축약하면 네 행 모두에 피벗이 생겨 독립이다. 따라서 $\operatorname{rank}=4$이다.`,
  },
  {
    id: "q-2025-dku-am-02",
    explanation: String.raw`$f(x)=\tan^{-1}x$의 도함수는 $f'(x)=\dfrac{1}{1+x^2}$이다. 따라서 $x=1$을 대입하면 $f'(1)=\dfrac{1}{1+1}=\dfrac12$이다.`,
  },
  {
    id: "q-2025-dku-am-07",
    explanation: String.raw`고윳값의 합은 행렬의 trace와 같다. 문제에서 고윳값의 합이 $-1$이고 trace가 $1+a$이므로 $1+a=-1$이다. 따라서 $a=-2$이다.`,
  },
  {
    id: "q-2025-dku-am-13",
    explanation: String.raw`극곡선 길이는 $L=\int_0^{2\pi}\sqrt{r^2+(dr/d\theta)^2}\,d\theta$이다. $r=1+\cos\theta$이면 $dr/d\theta=-\sin\theta$이고 integrand는 $\sqrt{(1+\cos\theta)^2+\sin^2\theta}=\sqrt{2+2\cos\theta}=2|\cos(\theta/2)|$이다. 구간에서 $\cos(\theta/2)\ge0$이므로 $L=\int_0^{2\pi}2\cos(\theta/2)d\theta=8$이다.`,
  },
  {
    id: "q-2025-inha-04",
    explanation: String.raw`분모 $x^3+1$의 미분이 $3x^2$이므로 치환 $u=x^3+1$을 쓰면 적분은 $\dfrac13\ln(x^3+1)$이 된다. 따라서 $\dfrac13[\ln(x^3+1)]_0^2=\dfrac13\ln9=\dfrac23\ln3$이다.`,
  },
  {
    id: "q-2025-soongsil-05",
    explanation: String.raw`특성방정식은 $r^2-2r+1=(r-1)^2=0$이다. 중근 $r=1$을 가지는 2계 선형 동차방정식의 일반해는 $y=(C_1+C_2x)e^x$ 꼴이다. 따라서 보기 중 이 형태가 정답이다.`,
  },
  {
    id: "q-daily-eng-r10-2",
    explanation: String.raw`Cauchy-Euler 방정식에서 $D=x\dfrac{d}{dx}$로 두면 동차부는 $D^2+D=0$이 되어 근이 $0,-1$이다. 동차해를 잡고 매개변수 변화법으로 특수해를 구한 뒤 초기조건을 정리하면 $y=x-\ln x-1$이 된다.`,
  },
  {
    id: "q-daily-eng-r13-1",
    explanation: String.raw`두 해의 차를 $Y=y_1-y_2$라 두면 주어진 연립식에서 $Y'=2Y$가 된다. 초기조건 차이가 $Y(0)=2$이므로 $Y(t)=2e^{2t}$이다. 따라서 $Y(1)=y_1(1)-y_2(1)=2e^2$이다.`,
  },
  {
    id: "q-daily-eng-r18-3",
    explanation: String.raw`적분방정식에 라플라스 변환을 적용하면 $Y(s)=\dfrac{1}{(s+2)^2}$로 정리된다. 역라플라스 변환 공식 $\mathcal L^{-1}\{1/(s+a)^2\}=te^{-at}$를 쓰면 $y(t)=te^{-2t}$이다. 그러므로 $y(1)=e^{-2}$이다.`,
  },
  {
    id: "q-daily-eng-r21-3",
    explanation: String.raw`선분을 $x$로 매개화하면 $y=x+2$이고 $dy=dx$이다. 선적분 integrand를 대입하면 $(x+2)^2+x$가 되며 $x$의 범위는 $-5$부터 $0$까지이다. 따라서 $\int_{-5}^0((x+2)^2+x)\,dx=-5/6$이다.`,
  },
  {
    id: "q-daily-eng-r21-6",
    explanation: String.raw`곡선을 매개변수 $t$로 두고 벡터장과 $r'(t)$의 내적을 계산하면 integrand가 $16\cos^2t+4\sin t$로 정리된다. 한 주기에서 $\int_0^{2\pi}\sin t\,dt=0$이고 $\int_0^{2\pi}\cos^2t\,dt=\pi$이므로 선적분 값은 $16\pi$이다.`,
  },
  {
    id: "q-daily-eng-r24-1",
    explanation: String.raw`그린정리에 의해 선적분은 $\iint_D(Q_x-P_y)\,dA$이다. 편미분을 계산하면 $Q_x-P_y=2e^y-e^y=e^y$이고, 직사각형 영역에서 적분하면 $\int_0^2\int_0^1 e^y\,dx\,dy=2(e^2-1)$이다.`,
  },
  {
    id: "q-daily-eng-r5-5",
    explanation: String.raw`특성방정식이 $(r-3)^2=0$이므로 중근 $3$을 갖는다. 따라서 일반해는 $y=(c_1+c_2x)e^{3x}$이다. 초기조건을 대입하면 $c_1=3,\ c_2=-8$로 결정된다.`,
  },
  {
    id: "q-daily-eng-r6-6",
    explanation: String.raw`비제차항에 맞추어 특수해를 구하고 초기조건을 적용하면 해가 $y=-e^{-x}+x^2e^{-x}$로 정리된다. $x=1$을 대입하면 $y(1)=-e^{-1}+e^{-1}=0$이므로 정답은 0이다.`,
  },
  {
    id: "q-daily-eng-r8-1",
    explanation: String.raw`동차해를 먼저 구한 뒤 우변의 $e^{-x}\cos2x$에 대해 미정계수법을 적용하면 특수해는 $-\dfrac14e^{-x}\cos2x$이다. 일반해에 이를 더하고 주어진 초기조건을 대입하면 필요한 상수가 결정된다.`,
  },
  {
    id: "q-daily-eng-r9-5",
    explanation: String.raw`Cauchy-Euler 방정식의 특성근은 $-2\pm i$이다. 복소근 $\alpha\pm i\beta$에 대한 해는 $x^\alpha(C_1\cos(\beta\ln x)+C_2\sin(\beta\ln x))$ 꼴이다. 초기조건을 적용하면 $y=x^{-2}(\cos\ln x-3\sin\ln x)$이다.`,
  },
  {
    id: "q-daily-int-r22-3",
    explanation: String.raw`$y$축 회전이므로 원통껍질법을 쓰면 반지름이 $x$, 높이가 $\dfrac{1}{1+x^2}$이다. 따라서 $V=2\pi\int_0^1\dfrac{x}{1+x^2}\,dx$이고, $u=1+x^2$ 치환으로 $V=\pi\ln2$가 된다.`,
  },
  {
    id: "q-daily-int-r23-3",
    explanation: String.raw`두 곡선의 교점은 $x=1$이다. $y$축 회전의 원통껍질법을 쓰면 반지름은 $x$, 높이는 $2-2x^2$이므로 $V=2\pi\int_0^1x(2-2x^2)\,dx$이다. 적분하면 $V=\pi$이다.`,
  },
  {
    id: "q-daily-la-r11-2",
    explanation: String.raw`평면 위의 두 방향벡터를 외적하면 법선벡터가 $(2,1,-6)$으로 나온다. 한 점을 대입해 평면 방정식을 쓰면 $2x+y-6z=-25$이다. 따라서 $a+b+c=2+1-6=-3$이다.`,
  },
  {
    id: "q-daily-la-r11-3",
    explanation: String.raw`주어진 평면의 법선벡터는 $(2,1,1)$이고, 한 점을 대입하면 평면 방정식은 $2x+y+z=3$이다. 보기 ②의 점을 대입하면 $4+1-1=4\ne3$이므로 평면 위에 있지 않다.`,
  },
  {
    id: "q-daily-la-r15-2",
    explanation: String.raw`점과 평면 $ax+by+cz+d=0$ 사이의 거리는 $\dfrac{|ax_0+by_0+cz_0+d|}{\sqrt{a^2+b^2+c^2}}$이다. 주어진 값을 대입하면 $\dfrac{|3-6+12-2|}{\sqrt{9+4+36}}=\dfrac77=1$이다.`,
  },
  {
    id: "q-daily-la-r16-4",
    explanation: String.raw`두 평면이 평행하므로 법선벡터를 같게 맞추어 $P_2$를 정리하면 $2x-2y+z=1$ 꼴이다. 평행한 두 평면 사이의 거리는 상수항 차이를 법선벡터 크기로 나눈 값이므로 $\dfrac{|7-1|}{\sqrt{2^2+(-2)^2+1^2}}=2$이다.`,
  },
  {
    id: "q-daily-la-r16-5",
    explanation: String.raw`두 평면은 같은 법선벡터 $(1,-2,3)$을 가지므로 서로 평행하다. 평면 사이 거리는 상수항 차이를 법선벡터의 크기로 나누어 구한다. 따라서 $\dfrac{|-1-3|}{\sqrt{1^2+(-2)^2+3^2}}=\dfrac4{\sqrt{14}}$이다.`,
  },
  {
    id: "q-daily-la-r16-6",
    explanation: String.raw`원점 중심 구면에서 점 $A$까지의 거리 최댓값은 중심과 $A$ 사이의 거리 plus 반지름이다. $|OA|=\sqrt{30}$이고 구의 반지름이 $3$이므로 최장거리는 $\sqrt{30}+3$이다.`,
  },
  {
    id: "q-daily-la-r18-3",
    explanation: String.raw`각 보기의 세 벡터를 열로 놓고 행렬식을 계산해 기저 여부를 판정한다. ②는 행렬식이 $0$이라 세 벡터가 일차종속이므로 기저가 아니다. 반면 ③은 행렬식이 $-1$로 0이 아니어서 기저가 된다. 따라서 기저가 아닌 것은 ②뿐이다.`,
  },
  {
    id: "q-daily-la-r20-3",
    explanation: String.raw`열공간의 차원은 행렬의 rank와 같다. 행 연산을 해도 rank는 변하지 않고, $A$와 $A^T$의 rank도 서로 같다. 주어진 행렬을 행축약하면 피벗이 3개이므로 열공간의 차원은 $3$이다.`,
  },
  {
    id: "q-daily-la-r20-6",
    explanation: String.raw`$V$는 $b+c+d=0$이라는 하나의 독립 조건을 가지므로 $\dim V=3$이다. $W$는 $a+b=0,\ c=2d$ 두 독립 조건을 가지므로 $\dim W=2$이다. 두 조건을 함께 풀면 자유변수가 하나 남아 $\dim(V\cap W)=1$이고, 합은 $3+2+1=6$이다.`,
  },
  {
    id: "q-daily-la-r21-3",
    explanation: String.raw`벡터가 고유벡터이려면 행렬을 곱한 결과가 원래 벡터의 스칼라배여야 한다. 보기의 벡터에 대해 $B(2,1,0)^T=(6,13,4)^T$가 나오는데, 이는 $(2,1,0)^T$의 어떤 스칼라배도 아니다. 따라서 그 벡터는 고유벡터가 아니다.`,
  },
  {
    id: "q-daily-la-r22-5",
    explanation: String.raw`$3\times3$ 행렬에서 스칼라배의 행렬식은 $\det(cA)=c^3\det A$이다. 또 $\det(A^2)=(\det A)^2$이다. 따라서 $\det(2A^2)=2^3(\det A)^2=8\cdot16=128$이다.`,
  },
  {
    id: "q-daily-la-r25-5",
    explanation: String.raw`$\lambda=-2$에 대한 고유벡터는 $(A+2I)v=0$의 해이다. 행렬을 행축약하면 자유변수 하나로 표현되는 해공간이 나오고, 대표벡터를 잡으면 $(1,-3,-1)$이 된다. 따라서 이 벡터가 해당 고유벡터이다.`,
  },
  {
    id: "q-daily-la-r25-6",
    explanation: String.raw`닮은 대각행렬 $D$의 대각성분은 $A$의 고윳값들이다. 고윳값의 합은 $\operatorname{tr}(A)=0+2+3=5$이고, 고윳값의 곱은 $\det(A)=4$이다. 따라서 모든 성분의 합과 대각성분의 곱은 각각 $5,4$이다.`,
  },
  {
    id: "q-daily-la-r3-6",
    explanation: String.raw`행렬식에 영향을 추적하면서 1행을 다른 행에서 빼는 방식으로 정리하면 행렬식 방정식이 $-x(x-1)^3=0$으로 인수분해된다. 따라서 가능한 값은 $x=0$ 또는 $x=1$이다.`,
  },
  {
    id: "q-daily-la-r30-2",
    explanation: String.raw`평면으로의 사영변환은 치역이 그 평면이므로 rank가 2이다. $3$차원 공간에서 rank가 2인 선형변환의 행렬은 가역이 아니어서 $\det A=0$이다. 따라서 $\det(A^2)=(\det A)^2=0$이다.`,
  },
  {
    id: "q-daily-la-r32-2",
    explanation: String.raw`평면도형의 넓이는 선형변환의 행렬식 절댓값만큼 배가 된다. 원래 도형의 넓이가 $23$이고 변환행렬의 행렬식 절댓값이 $8$이므로 새 넓이는 $23\cdot8=184$이다.`,
  },
  {
    id: "q-daily-la-r32-3",
    explanation: String.raw`공간도형의 부피는 선형변환의 행렬식 절댓값만큼 배가 된다. 원래 부피가 $1/3$이고 변환행렬의 행렬식 절댓값이 $27$이므로 새 부피는 $(1/3)\cdot27=9$이다.`,
  },
  {
    id: "q-daily-la-r33-4",
    explanation: String.raw`$T$의 치역은 표현행렬의 열공간이다. 치역의 직교여공간은 모든 열벡터와 내적이 0인 벡터들의 집합이다. 보기 ②의 $(2,-1,0,0)$은 각 열벡터와의 내적이 모두 0이므로 $T$의 치역에 수직이다.`,
  },
  {
    id: "q-daily-la-r35-1",
    explanation: String.raw`직교행렬은 내적과 노름을 보존한다. 즉 $A^TA=I$이므로 $\|A\vec u\|^2=(A\vec u)^T(A\vec u)=\vec u^TA^TA\vec u=\|\vec u\|^2$이다. $\|\vec u\|=1$이면 $\|A\vec u\|=1$이다.`,
  },
  {
    id: "q-daily-la-r6-2",
    explanation: String.raw`주어진 행렬을 기약행사다리꼴로 만들면 마지막 열의 해당 성분에서 $d=4,\ e=-7$이 읽힌다. 따라서 원래 문제에서 묻는 $A$의 $(2,5)$ 성분은 $e=-7$이다.`,
  },
  {
    id: "q-daily-mv-r10-4",
    explanation: String.raw`연쇄법칙을 적용하면 $z_t=f_xg_t+f_yh_t$이다. 주어진 값에서 $f_x=7,\ f_y=8,\ g_t=4,\ h_t=10$이므로 $z_t=7\cdot4+8\cdot10=108$이다.`,
  },
  {
    id: "q-daily-mv-r13-2",
    explanation: String.raw`방향도함수는 그래디언트와 방향벡터의 내적으로 계산된다. 조건을 식으로 쓰면 $2f_x+f_y=5,\ -f_x+f_y=2$이다. 두 식을 풀면 $f_x=1,\ f_y=3$이므로 그래디언트는 $(1,3)$이다.`,
  },
  {
    id: "q-daily-mv-r14-2",
    explanation: String.raw`함수값이 가장 빨리 증가하는 방향은 그래디언트 방향이다. 계산하면 $\nabla f(2,-1)=(-2,-4)$이고, 이를 단위벡터로 나누면 $\dfrac{(-2,-4)}{\sqrt{20}}=\dfrac{(-1,-2)}{\sqrt5}$이다.`,
  },
  {
    id: "q-daily-mv-r14-3",
    explanation: String.raw`최대 증가 방향은 그래디언트 방향이다. 주어진 함수에서 $\nabla z(1,1)=(-2,-2)$가 되므로 단위벡터는 $\dfrac{(-2,-2)}{\sqrt8}=\dfrac{(-1,-1)}{\sqrt2}$이다.`,
  },
  {
    id: "q-daily-mv-r14-4",
    explanation: String.raw`온도가 가장 빨리 증가하는 방향은 $\nabla T$ 방향이다. 계산하면 $\nabla T=100e^{-3}(-2,4,6)$이고 양의 스칼라배는 방향을 바꾸지 않는다. 따라서 단위화 전 방향은 $(-1,2,3)$과 같다.`,
  },
  {
    id: "q-daily-mv-r14-5",
    explanation: String.raw`함수가 가장 빨리 감소하는 방향은 그래디언트의 반대방향이다. $\nabla f(1,1)=(1,-1)$이므로 최대 감소 방향은 $-\nabla f(1,1)=(-1,1)$이다.`,
  },
  {
    id: "q-daily-mv-r16-2",
    explanation: String.raw`구면 $F=x^2+y^2+z^2$의 법선방향은 $\nabla F=(2x,2y,2z)$이다. 점 $(1,2,3)$에서 법선은 $(2,4,6)$이고 이를 줄이면 $(1,2,3)$이다. 접평면은 $(1,2,3)\cdot(x-1,y-2,z-3)=0$이므로 $x+2y+3z=14$이다.`,
  },
  {
    id: "q-daily-mv-r24-4",
    explanation: String.raw`제약식에서 $x=1-2y$를 대입하면 $x^2+xy+y^2=3y^2-3y+1$이다. 이 이차식의 꼭짓점은 $y=\dfrac12$에서 생기고 최솟값은 $3/4-3/2+1=1/4$이다.`,
  },
  {
    id: "q-daily-mv-r26-2",
    explanation: String.raw`거리의 제곱 $(x-1)^2+(y-1)^2+z^2$을 $z=x^2+y^2$ 조건 아래 최소화한다. 라그랑주 승수법을 적용하면 최단점이 $(1/2,1/2,1/2)$로 나온다. 이때 거리의 제곱은 $1/4+1/4+1/4=3/4$이므로 최단거리는 $\sqrt3/2$이다.`,
  },
  {
    id: "q-daily-mv-r33-4",
    explanation: String.raw`두 포물주면의 교선은 $0\le x\le1,\ x^2\le y\le\sqrt x$로 잡을 수 있다. 부피는 포물면 높이를 적분해 $V=\int_0^1\int_{x^2}^{\sqrt x}(x^2+4y^2)\,dy\,dx$이다. 계산하면 $V=3/7$이다.`,
  },
  {
    id: "q-daily-mv-r4-1",
    explanation: String.raw`평면곡선 $y=f(x)$의 곡률은 $\kappa=\dfrac{|y''|}{(1+(y')^2)^{3/2}}$이다. $y=x^2$이면 $y'=2x,\ y''=2$이고 원점에서 $y'=0$이다. 따라서 $\kappa=\dfrac2{1^{3/2}}=2$이다.`,
  },
  {
    id: "q-daily-mv-r5-2",
    explanation: String.raw`경로 $x=my^2$로 접근하면 식은 $\dfrac{my^4}{m^2y^4+y^4}=\dfrac{m}{m^2+1}$이 된다. 이 값은 $m$에 따라 달라진다. 예를 들어 $m=0$과 $m=1$에서 서로 다른 극한이 나오므로 이변수 극한은 존재하지 않는다.`,
  },
  {
    id: "q-daily-mv-r5-3",
    explanation: String.raw`④는 $|2xy^2/(x^2+y^2)|\le 2|y|$로 눌러 잡을 수 있어 $(x,y)\to(0,0)$에서 0으로 수렴한다. 나머지 보기들은 $y=mx$ 또는 $x=my^2$ 같은 서로 다른 경로를 잡으면 극한값이 달라진다. 따라서 존재하는 것은 ④이다.`,
  },
  {
    id: "q-daily-mv-r5-6",
    explanation: String.raw`$t=x^2+y^2$로 두면 $(x,y)\to(0,0)$일 때 $t\to0^+$이다. 따라서 $\dfrac{\cos(x^2+y^2)-1}{x^2+y^2}=\dfrac{\cos t-1}{t}$이고, $\cos t-1\sim -t^2/2$이므로 극한은 0이다. 연속이 되려면 $f(0,0)=0$으로 정의해야 한다.`,
  },
  {
    id: "q-daily-r25-5",
    explanation: String.raw`$f(x)=4x^5+2x^3+8x-10$이라 두면 $f'(x)=20x^4+6x^2+8>0$이다. 따라서 $f$는 실수 전체에서 strictly increasing이다. 또 연속이고 $f(0)=-10,\ f(1)=4$이므로 중간값정리로 실근이 하나 존재하며, 증가성이 있으므로 실근은 정확히 1개이다.`,
  },
];

console.log(`${dryRun ? "Dry run" : "Applying"} ${fixes.length} question quality/content fixes.`);
for (const fix of fixes) console.log(`- ${fix.id}: ${Object.keys(fix).filter((key) => key !== "id").join(", ")}`);

if (!dryRun) {
  const changes = [];
  for (const fix of fixes) {
    const { id, ...patch } = fix;
    const { data: before, error: fetchError } = await sb
      .from("questions")
      .select("id, subject, unit, concept, question, options, correct_option_id, explanation")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const update = { ...patch, updated_at: new Date().toISOString() };
    const { error: updateError } = await sb.from("questions").update(update).eq("id", id);
    if (updateError) throw updateError;

    changes.push({
      id,
      subject: before.subject,
      unit: before.unit,
      concept: before.concept,
      fields: Object.keys(patch),
    });
  }

  writeFileSync(
    resolve(outDir, "question_quality_manual_fixes_20260709_batch7.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        dryRun: false,
        scope: "remaining explanation expansions and confirmed OCR/source content fixes batch 7",
        changes,
      },
      null,
      2,
    ),
  );
  console.log("Question quality/content fixes applied.");
} else {
  console.log("No rows were changed.");
}
