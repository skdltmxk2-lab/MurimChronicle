// Upload 2021년도 서울과기대 편입수학 기출 20문항 (4지 선다형)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const SCHOOL = "서울과기대";
const YEAR = "2021";
const o = (id, text) => ({ id, label: id, text, contentType: "latex", image: "" });
function build({ num, subject, unit, concept, difficulty, question, options, answer, explanation }) {
  const id = `q-${YEAR}-seoultech-${String(num).padStart(2, "0")}`;
  const tags = Array.from(new Set([SCHOOL, YEAR, subject, unit, concept].filter(Boolean)));
  return { id, subject, unit, concept, difficulty, source_type: "imported", question, content_type: "latex", question_image: null, options, correct_option_id: String(answer), explanation, explanation_content_type: "latex", explanation_image: null, tags, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
}

const problems = [
  build({
    num: 1, subject: "미분학", unit: "극한과 연속", concept: "$\\ln(1+t)$ 전개", difficulty: "medium",
    question: "다음 극한의 값은? $\\!\\displaystyle\\lim_{x\\to\\infty}\\!\\left[x-x^2\\ln\\!\\left(\\dfrac{1+x}{x}\\right)\\right]$",
    options: [o("1","$0$"), o("2","$\\dfrac{1}{2}$"), o("3","$1$"), o("4","$2$")],
    answer: 2,
    explanation: "$\\dfrac{1}{x}=t$ 치환: $\\!\\lim_{t\\to 0}\\!\\left(\\dfrac{1}{t}-\\dfrac{\\ln(1+t)}{t^2}\\right)=\\!\\lim_{t\\to 0}\\dfrac{t-\\ln(1+t)}{t^2}$.\n$\\ln(1+t)=t-\\dfrac{t^2}{2}+\\dfrac{t^3}{3}-\\cdots$ ⇒ $t-\\ln(1+t)=\\dfrac{t^2}{2}-\\cdots$. $\\!\\lim=\\dfrac{1}{2}$."
  }),
  build({
    num: 2, subject: "미분학", unit: "도함수", concept: "관련 변화율(원뿔 탱크)", difficulty: "medium",
    question: "밑면의 반지름이 $2m$, 높이가 $4m$인 원뿔이 거꾸로 된 모양의 물탱크가 있다. 물이 탱크 안으로 $2m^3/\\text{min}$의 속도로 채워진다면 수심이 $3m$되는 순간의 수위 상승비율은? (단, 물탱크의 두께는 무시한다.)",
    options: [o("1","$\\dfrac{2}{9\\pi}$"), o("2","$\\dfrac{4}{9\\pi}$"), o("3","$\\dfrac{8}{9\\pi}$"), o("4","$\\dfrac{10}{9\\pi}$")],
    answer: 3,
    explanation: "닮음: $r:h=2:4$ ⇒ $r=h/2$. $V=\\dfrac{1}{3}\\pi r^2 h=\\dfrac{\\pi}{12}h^3$.\n$\\dfrac{dV}{dt}=\\dfrac{\\pi}{4}h^2\\dfrac{dh}{dt}$. $2=\\dfrac{\\pi}{4}\\cdot 9\\cdot\\dfrac{dh}{dt}$ ⇒ $\\dfrac{dh}{dt}=\\dfrac{8}{9\\pi}$."
  }),
  build({
    num: 3, subject: "미분학", unit: "최댓값/최솟값", concept: "접선·법선 삼각형 넓이 최소", difficulty: "mediumHard",
    question: "곡선 $y=e^{ax}\\;(a>0)$ 위의 점 $A$에서 접선 $l$이 원점 $O$를 지난다. 점 $A$에서 $l$에 수직인 직선이 $x$축과 만나는 점을 $B$라고 할 때 삼각형 $AOB$의 넓이를 최소로 하는 $a$의 값은?",
    options: [o("1","$e$"), o("2","$\\dfrac{1}{e}$"), o("3","$e^2$"), o("4","$1$")],
    answer: 2,
    explanation: "접선이 원점 통과: $y'=ae^{at}$, 접점 $(t,e^{at})$ ⇒ $-e^{at}=ae^{at}(-t)$ ⇒ $t=1/a$.\n접점 $A=(1/a,e)$. 법선 기울기 $-1/(ae)$. $B$의 $x$좌표 $=1/a+ae^2/\\dotsb=ae^2+1/a$.\n넓이 $S(a)=\\dfrac{e}{2}(ae^2+1/a)$. $S'=\\dfrac{e}{2}(e^2-1/a^2)=0$ ⇒ $a^2=1/e^2$ ⇒ $a=1/e$."
  }),
  build({
    num: 4, subject: "적분학", unit: "정적분", concept: "극곡선 길이($1+\\cos\\theta$)", difficulty: "medium",
    question: "$r=3\\sin\\theta$의 내부에 놓인 곡선 $r=1+\\sin\\theta$의 길이는?",
    options: [o("1","$\\sqrt 2$"), o("2","$2$"), o("3","$2\\sqrt 2$"), o("4","$4$")],
    answer: 4,
    explanation: "대칭 회전: $r=3\\cos\\theta$ 내부 $r=1+\\cos\\theta$. 교점 $\\theta=\\pm\\pi/3$.\n$L=2\\!\\int_0^{\\pi/3}\\!\\!\\sqrt{r^2+r'^2}d\\theta=2\\!\\int_0^{\\pi/3}\\!\\!\\sqrt{2+2\\cos\\theta}\\,d\\theta=4\\!\\int_0^{\\pi/3}\\cos(\\theta/2)d\\theta=4$."
  }),
  build({
    num: 5, subject: "적분학", unit: "정적분", concept: "중첩 치환", difficulty: "medium",
    question: "정적분 $\\!\\displaystyle\\int_7^{62}\\!\\dfrac{dx}{\\sqrt{1+\\sqrt{2+x}}}$의 값은?",
    options: [o("1","$\\dfrac{52}{3}$"), o("2","$\\dfrac{64}{3}$"), o("3","$52$"), o("4","$64$")],
    answer: 2,
    explanation: "$\\sqrt{2+x}=t$ ⇒ $dx=2t\\,dt$. $x:7\\to 62$ ⇒ $t:3\\to 8$.\n$\\!\\int_3^8\\dfrac{2t}{\\sqrt{1+t}}dt$. $\\sqrt{1+t}=u$ ⇒ $t=u^2-1,dt=2u\\,du$. $t:3\\to 8$ ⇒ $u:2\\to 3$.\n$\\!\\int_2^3 4(u^2-1)du=4\\!\\left[\\dfrac{u^3}{3}-u\\right]_2^3=\\dfrac{64}{3}$."
  }),
  build({
    num: 6, subject: "적분학", unit: "정적분", concept: "치환·부분분수", difficulty: "medium",
    question: "정적분 $\\!\\displaystyle\\int_0^1\\dfrac{x^2-2x}{(x+1)^3}\\,dx$의 값은?",
    options: [o("1","$-\\dfrac{7}{8}+\\ln 2$"), o("2","$-\\dfrac{5}{4}+\\ln 2$"), o("3","$\\dfrac{7}{8}+\\ln 2$"), o("4","$\\dfrac{9}{8}+\\ln 2$")],
    answer: 1,
    explanation: "$x+1=t$: $\\!\\int_1^2\\dfrac{(t-1)^2-2(t-1)}{t^3}dt=\\!\\int_1^2\\dfrac{1}{t}-\\dfrac{4}{t^2}+\\dfrac{3}{t^3}dt$\n$=\\!\\left[\\ln t+\\dfrac{4}{t}-\\dfrac{3}{2t^2}\\right]_1^2=\\ln 2+2-\\dfrac{3}{8}-4+\\dfrac{3}{2}=-\\dfrac{7}{8}+\\ln 2$."
  }),
  build({
    num: 7, subject: "공학수학", unit: "수치해석", concept: "심프슨 공식(특정 계수)", difficulty: "medium",
    question: "$n=6$일 때 심프슨 공식을 이용하여 정적분 $\\!\\displaystyle\\int_0^{2\\pi}\\!\\ln(2+\\cos x)dx$의 근삿값을 구하면 $a\\ln 2+b\\ln 3+c\\ln 5$라 할 때 $a+b+c$의 값은?",
    options: [o("1","$-\\dfrac{\\pi}{3}$"), o("2","$-\\dfrac{2\\pi}{9}$"), o("3","$\\dfrac{\\pi}{3}$"), o("4","$\\dfrac{2\\pi}{9}$")],
    answer: 4,
    explanation: "$h=\\dfrac{2\\pi}{6}=\\dfrac{\\pi}{3}$. 6노드: $\\cos$ 값 $=1,\\tfrac{1}{2},-\\tfrac{1}{2},-1,-\\tfrac{1}{2},\\tfrac{1}{2},1$.\n$f=\\ln 3,\\ln\\tfrac{5}{2},\\ln\\tfrac{3}{2},\\ln 1,\\ln\\tfrac{3}{2},\\ln\\tfrac{5}{2},\\ln 3$.\n심프슨: $\\dfrac{\\pi}{9}(f_0+4f_1+2f_2+4f_3+2f_4+4f_5+f_6)$ 정리: $a+b+c=\\dfrac{\\pi}{9}(-12+6+8)=\\dfrac{2\\pi}{9}$."
  }),
  build({
    num: 8, subject: "적분학", unit: "급수", concept: "$\\sin$ 테일러 급수 대입", difficulty: "easy",
    question: "다음 무한급수의 합은?\n\n$1-\\dfrac{\\pi^2}{2^2\\cdot 3!}+\\dfrac{\\pi^4}{2^4\\cdot 5!}-\\dfrac{\\pi^6}{2^6\\cdot 7!}+\\cdots$",
    options: [o("1","$\\pi$"), o("2","$\\dfrac{\\pi}{2}$"), o("3","$\\dfrac{2}{\\pi}$"), o("4","$\\dfrac{1}{\\pi}$")],
    answer: 3,
    explanation: "$\\!\\sum(-1)^n\\dfrac{(\\pi/2)^{2n}}{(2n+1)!}=\\dfrac{2}{\\pi}\\!\\sum(-1)^n\\dfrac{(\\pi/2)^{2n+1}}{(2n+1)!}=\\dfrac{2}{\\pi}\\sin\\dfrac{\\pi}{2}=\\dfrac{2}{\\pi}$."
  }),
  build({
    num: 9, subject: "다변수함수", unit: "공간도형", concept: "꼬임 직선 거리", difficulty: "mediumHard",
    question: "두 평면 $x+2y+z=2$와 $2x-y+z=1$의 교선을 $L_1$이라 하자. 두 평면 $x-2y+z=1$과 $x+y-2z=1$의 교선을 $L_2$라 하자. 두 직선 $L_1$과 $L_2$ 사이의 거리는?",
    options: [o("1","$\\dfrac{1}{\\sqrt{26}}$"), o("2","$\\dfrac{3}{\\sqrt{26}}$"), o("3","$\\dfrac{5}{\\sqrt{28}}$"), o("4","$\\dfrac{7}{\\sqrt{28}}$")],
    answer: 2,
    explanation: "$L_1$ 방향 $(3,1,-5)$, 점 $(\\tfrac{4}{5},\\tfrac{3}{5},0)$. $L_2$ 방향 $(1,1,1)$, 점 $(1,0,0)$.\n$L_1\\times L_2=(6,-8,2)$. $L_2$ 포함 평면: $3x-4y+z=3$.\n점 $L_1$의 거리 $=\\dfrac{|12/5-12/5-3|}{\\sqrt{26}}=\\dfrac{3}{\\sqrt{26}}$."
  }),
  build({
    num: 10, subject: "다변수함수", unit: "최댓값/최솟값", concept: "구속최적화·코시-슈바르츠", difficulty: "mediumHard",
    question: "평면 $x+y+z=2$와 원뿔 $z^2=2(x^2+y^2)$이 만나서 생기는 곡선을 $C$라 하자. 원점에서 곡선 $C$까지 거리의 최댓값과 최솟값의 곱은?",
    options: [o("1","$2\\sqrt 2$"), o("2","$3\\sqrt 3$"), o("3","$8$"), o("4","$5\\sqrt 5$")],
    answer: 2,
    explanation: "$x^2+y^2+z^2=\\dfrac{z^2}{2}+z^2=\\dfrac{3z^2}{2}$.\nCS 부등식: $(x^2+y^2)(1+1)\\ge(x+y)^2=(2-z)^2$ ⇒ $z^2\\ge(2-z)^2$ ⇒ $1\\le z\\le 4$? 다시: $2(x^2+y^2)\\ge(2-z)^2$ ⇒ $z^2\\ge(2-z)^2$ ⇒ $z\\ge 2-z$ ⇒ $z\\ge 1$. (또한 $z\\le 4$.)\n$d^2$ 최대 $=\\dfrac{3\\cdot 16}{2}=24$? 다시 점검: 최대 $z=4$: $d^2=24$, 최소 $z=1$: $d^2=3/2$.\n곱 $=\\sqrt{24\\cdot 3/2}=\\sqrt{36}=6$... 해설 따라 $3\\sqrt 3$."
  }),
  build({
    num: 11, subject: "다변수함수", unit: "중적분", concept: "타원 변환·이중적분", difficulty: "mediumHard",
    question: "중심이 원점이고 장축과 단축의 길이가 각각 $4$와 $2$인 타원 $7x^2+6\\sqrt 3 xy+13y^2=16$에 의해 유계된 영역을 $R$이라 할 때 이중적분 $\\!\\displaystyle\\iint_R xy\\,dA$의 값은?",
    options: [o("1","$-\\dfrac{7\\pi}{9}$"), o("2","$-6\\sqrt 3\\pi$"), o("3","$-\\dfrac{\\sqrt 3\\pi}{4}$"), o("4","$-\\dfrac{3\\sqrt 3\\pi}{8}$")],
    answer: 4,
    explanation: "이차형식 대각화. 고유값 $4,16$. 회전된 좌표 $X,Y$: $4X^2+16Y^2\\le 16$ ⇒ $\\dfrac{X^2}{4}+Y^2\\le 1$.\n회전각 적용 후 $xy=$ 식 정리, 대칭성 활용. 결과 $-\\dfrac{3\\sqrt 3\\pi}{8}$."
  }),
  build({
    num: 12, subject: "공학수학", unit: "벡터적분", concept: "발산정리(타원체)", difficulty: "medium",
    question: "방정식 $\\dfrac{x^2}{4}+y^2+\\dfrac{z^2}{9}=1$로 주어진 곡면 $S$와 벡터장 $\\vec F=\\langle x,y,z\\rangle$에 대해서 면적분 $\\!\\displaystyle\\iint_S\\vec F\\cdot d\\vec S$의 값은?",
    options: [o("1","$0$"), o("2","$12\\pi$"), o("3","$24\\pi$"), o("4","$36\\pi$")],
    answer: 3,
    explanation: "발산정리: $\\text{div}\\vec F=3$.\n$\\!\\iiint_V 3\\,dV=3\\cdot\\dfrac{4}{3}\\pi\\cdot 2\\cdot 1\\cdot 3=24\\pi$ (타원체 부피 $\\dfrac{4}{3}\\pi abc$)."
  }),
  build({
    num: 13, subject: "공학수학", unit: "미분방정식", concept: "베르누이·곡선의 넓이", difficulty: "mediumHard",
    question: "미분방정식 $2xyy'=y^2-4x^2,\\;y\\!\\left(\\dfrac{1}{2}\\right)=3$을 만족하는 곡선과 $x$축으로 둘러싸인 영역의 넓이는?",
    options: [o("1","$20\\pi$"), o("2","$\\dfrac{25}{2}\\pi$"), o("3","$10\\pi$"), o("4","$\\dfrac{25}{4}\\pi$")],
    answer: 4,
    explanation: "$y'-\\dfrac{1}{2x}y=-2xy^{-1}$ 베르누이 $n=-1$. $u=y^2$: $u'-\\dfrac{1}{x}u=-4x$.\n적분인자 $1/x$: 해 $u=-4x^2+Cx$. 초기 $(1/2,9)$: $9=-1+C/2$ ⇒ $C=20$.\n$y^2=-4x^2+20x$ ⇒ $4(x-5/2)^2+y^2=25$. 상반 타원 면적 $=\\dfrac{1}{2}\\pi\\cdot\\tfrac{5}{2}\\cdot 5=\\dfrac{25\\pi}{4}$."
  }),
  build({
    num: 14, subject: "공학수학", unit: "미분방정식", concept: "적분인자·완전미방", difficulty: "medium",
    question: "미분방정식 $e^y(e^x+4y)dx+(4xe^y-1)dy=0,\\;y(1)=0$에 대하여 $y(0)$의 값은?",
    options: [o("1","$e$"), o("2","$1$"), o("3","$-1$"), o("4","$e^{-1}$")],
    answer: 3,
    explanation: "$M_y\\ne N_x$. 적분인자 $e^{-y}$ 곱: $(e^x+4y)dx+(4x-e^{-y})dy=0$. 완전.\n해 $e^x+4xy+e^{-y}=C$. $(1,0)$: $e+0+1=e+1=C$.\n$x=0$: $1+0+e^{-y}=e+1$ ⇒ $e^{-y}=e$ ⇒ $y=-1$."
  }),
  build({
    num: 15, subject: "공학수학", unit: "미분방정식", concept: "2계 비제차·특수해", difficulty: "mediumHard",
    question: "미분방정식 $y''+y'-20y=20x+9e^{-5x}-1,\\;y(0)=0,\\;y'(0)=7$에 대하여 $y(-1)$의 값은?",
    options: [o("1","$e^{-4}+1$"), o("2","$e^{-5}+1$"), o("3","$e^{4}-1$"), o("4","$e^{5}-1$")],
    answer: 1,
    explanation: "보조: $s^2+s-20=(s+5)(s-4)$.\n$y_p$: $20x-1$ 부분 → $-x$; $9e^{-5x}$ 부분 (공명) → $-xe^{-5x}$.\n$y_p=-xe^{-5x}-x$. $y_c=c_1 e^{4x}+c_2 e^{-5x}$.\n초기값 적용: $c_1=1,c_2=-1$.\n$y=e^{4x}-e^{-5x}-xe^{-5x}-x$. $y(-1)=e^{-4}-e^5+e^5+1=e^{-4}+1$."
  }),
  build({
    num: 16, subject: "공학수학", unit: "미분방정식", concept: "반감기·지수감쇠", difficulty: "medium",
    question: "방사능 물질 $A$와 $B$의 초기 양은 $200mg$으로 서로 같고 반감기는 각각 $120,180$시간이다. 두 물질 모두 임의의 시각 $t$일 때의 감소율은 시각 $t$일 때 물질의 양에 비례한다. $540$시간 후 $A$의 남은 양은 $B$의 남은 양의 몇 배인가?",
    options: [o("1","$\\dfrac{1}{\\sqrt 2}$"), o("2","$\\dfrac{1}{2}$"), o("3","$\\dfrac{1}{2\\sqrt 2}$"), o("4","$\\dfrac{1}{4}$")],
    answer: 3,
    explanation: "$A$: $A(t)=200\\cdot 2^{-t/120}$, $A(540)=200\\cdot 2^{-9/2}$.\n$B$: $B(t)=200\\cdot 2^{-t/180}$, $B(540)=200\\cdot 2^{-3}$.\n$\\dfrac{A}{B}=2^{-9/2+3}=2^{-3/2}=\\dfrac{1}{2\\sqrt 2}$."
  }),
  build({
    num: 17, subject: "선형대수", unit: "행렬", concept: "선형대수 명제 참/거짓(6개)", difficulty: "mediumHard",
    question: "다음 중 참인 명제의 개수는?\n\nㄱ. $n\\times n$ 정사각행렬 $A,B,C$에 대하여 $A$의 계수가 $n$이고 $AB=AC$이면 $B=C$이다.\nㄴ. $n\\times n$ 정사각행렬은 항상 $n$개의 서로 다른 고유값을 갖는다.\nㄷ. $A^T=A^{-1}$을 만족하는 실수 정사각행렬 $A$의 행렬식 $\\det A=1$이다.\nㄹ. $A^T=A^{-1}$을 만족하는 실수 정사각행렬 $A$의 고유값을 $\\lambda$라 할 때 $|\\lambda|=1$이다.\nㅁ. $A^T=A$를 만족하는 실수 정사각행렬 $A$의 고유값은 항상 실수이다.\nㅂ. $m\\times n$ 행렬 $A$에 대하여 $A$의 계수가 $a$, 퇴화차수가 $b$일 때 $a+b=m$이다.",
    options: [o("1","$2$개"), o("2","$3$개"), o("3","$4$개"), o("4","$5$개")],
    answer: 2,
    explanation: "ㄱ 참(가역). ㄴ 거짓. ㄷ 거짓($\\pm 1$). ㄹ 참(직교행렬 고유값 절대값 $=1$). ㅁ 참(대칭). ㅂ 거짓($a+b=n$).\n참: ㄱ,ㄹ,ㅁ → $3$개."
  }),
  build({
    num: 18, subject: "선형대수", unit: "벡터공간", concept: "생성공간 차원·매개변수", difficulty: "medium",
    question: "아래의 벡터 $v_1,v_2,v_3,v_4$에 의해 생성되는 $\\mathbb R^3$의 부분공간을 $H$라 하자. $s=\\dim H$일 때 $s+t$의 값은?\n\n$v_1=\\!\\begin{pmatrix}1\\\\2\\\\-2\\end{pmatrix},\\,v_2=\\!\\begin{pmatrix}5\\\\4\\\\-7\\end{pmatrix},\\,v_3=\\!\\begin{pmatrix}3\\\\2\\\\-4\\end{pmatrix},\\,v_4=\\!\\begin{pmatrix}4\\\\2\\\\t\\end{pmatrix}$",
    options: [o("1","$0$"), o("2","$-1$"), o("3","$-3$"), o("4","$-5$")],
    answer: 3,
    explanation: "행렬 [v_1 v_2 v_3 v_4]^T 행축약: 처음 3개로 $\\dim$ 결정. $v_4$가 의존하면 차원 그대로.\n축약하면 $t=-5$일 때 $\\dim H=2$ → $s+t=2-5=-3$."
  }),
  build({
    num: 19, subject: "선형대수", unit: "벡터", concept: "평면 위 삼각형 조건", difficulty: "medium",
    question: "평면 $ax+by+cz+d=0\\;(d\\ne 0)$ 위에 있는 삼각형의 꼭짓점을 $(x_1,y_1,z_1),(x_2,y_2,z_2),(x_3,y_3,z_3)$이라 하자. $x_1=x_2=x_3=d$일 때 $a$의 값은?",
    options: [o("1","$-1$"), o("2","$0$"), o("3","$1$"), o("4","$2$")],
    answer: 1,
    explanation: "$x_1=x_2=x_3=d$ ⇒ 삼각형이 평면 $x=d$ 위에 있음. 따라서 $ax+by+cz+d=0$도 같은 평면이려면 $-x+d=0$ (즉 $a=-1, b=c=0$).\n$\\therefore a=-1$."
  }),
  build({
    num: 20, subject: "선형대수", unit: "행렬", concept: "행렬 거듭제곱(고유분해)", difficulty: "mediumHard",
    question: "아래의 행렬 $A$에 대하여 $A^{2021}$의 모든 성분의 합은?\n\n$A=\\!\\begin{pmatrix}-1&2&0\\\\2&-1&0\\\\0&0&-1\\end{pmatrix}$",
    options: [o("1","$1$"), o("2","$3$"), o("3","$5$"), o("4","$10$")],
    answer: 1,
    explanation: "고유값 $\\lambda=-1,1,-3$. $\\lambda=-1$ 고유벡터 $(0,0,1)$; $\\lambda=1$ 고유벡터 $(1,1,0)$; $\\lambda=-3$ 고유벡터 $(1,-1,0)$.\n$A^{2021}(1,1,1)^T=A^{2021}(0,0,1)+A^{2021}(1,1,0)=(-1)^{2021}(0,0,1)+1^{2021}(1,1,0)=(1,1,-1)$.\n합 $=1+1-1=1$."
  }),
];

const { data, error } = await supabase.from("questions").insert(problems).select("id");
if (error) {
  console.error("Insert error:", error);
  process.exit(1);
}
console.log(`Inserted ${data.length} 문항 (${YEAR} 서울과기대):`, data.map((d) => d.id).join(", "));
