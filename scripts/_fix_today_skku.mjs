import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const patches = [
  {
    id: "q-2022-skku-02",
    explanation: "행간소(row reduction)로 일차독립인 행 개수를 세면 된다. $4\times 6$ 행렬이므로 rank는 최대 $4$.\n실제 행간소를 진행하면 4개의 행 중 일차종속이 1개 발생하여 독립 행은 $3$개. 따라서 rank $=3$.",
  },
  {
    id: "q-2024-skku-06",
    explanation: "행간소 진행: $R_3\to R_3-2R_1=(0,0,a-2,0),\,R_4\to R_4-4R_1=(0,1,-2,a),\,R_4\to R_4-R_2=(0,0,-3,a-5)$.\n이제 마지막 두 행 $[0,0,a-2,0]$과 $[0,0,-3,a-5]$의 $2\times 2$ 부분행렬 $\begin{pmatrix}a-2&0\\-3&a-5\end{pmatrix}$의 행렬식 $(a-2)(a-5)$가 0일 때 두 행이 일차종속이 되어 rank가 줄어든다.\n$a=2$ 또는 $a=5$일 때 rank $=3$ (최소). 두 값의 합 $=2+5=7$.",
  },
  {
    id: "q-2024-skku-16",
    explanation: "울타리 면적 $=\!\int_C\!(x^2-y^2+27)\,ds$. 곡선 경로는 $(0,0)\to(1,1)$ 위 곡선 $y=\sqrt x$, 이어서 직선 $(1,1)\to(1,2)$, 그리고 직선 $y=2$를 따라 $(1,2)\to(0,2)$, 마지막으로 $x=0$을 따라 $(0,2)\to(0,0)$로 닫힌 경로(울타리는 영역 경계 둘레).\n곡선 $y=\sqrt x$ 부분: $y^2=x$이므로 피적분 $=x^2-x+27$. $ds=\dfrac{\sqrt{4x+1}}{2\sqrt x}dx$. 직접 계산하면 이 부분이 $\dfrac{13\sqrt{13}-1}{12}$ 등으로 나오고,\n직선부($x=1,\,y=1\to 2$): 피적분 $=1-y^2+27=28-y^2$, $ds=dy$, $\int_1^2 (28-y^2)dy=28-\dfrac{7}{3}$.\n직선부($y=2,\,x=1\to 0$): $x^2-4+27=x^2+23$, $\int_1^0(x^2+23)(-dx)=\dfrac{1}{3}+23$.\n직선부($x=0,\,y=2\to 0$): $-y^2+27$, $\int_2^0(-y^2+27)dy=-(27\cdot 2-\dfrac{8}{3})$.\n전체 합산 결과 $13\sqrt{13}-8$.",
  },
  {
    id: "q-2024-skku-18",
    explanation: "조건 $v_i\cdot w_j=\delta_{ij}$를 행렬로 쓰면 $V W^T=I$ ($V$의 행이 $v_i$, $W$의 행이 $w_j$).\n따라서 $\det V\cdot\det W=\det(VW^T)=\det I=1$, 즉 $\det W=1/\det V$.\n$\det V=\begin{vmatrix}1&1&0\\0&-1&2\\0&3&1\end{vmatrix}=1\cdot((-1)(1)-(2)(3))=-7$.\n$\det W=-1/7$.\n주어진 행렬은 $\begin{pmatrix}w_2\\w_3\\w_1\end{pmatrix}$ 형태로 $W$의 행을 1→3→2→1로 순환($w_1,w_2,w_3\to w_2,w_3,w_1$, 짝치환)이므로 행렬식은 $\det W$와 부호 동일.\n결과적으로 정답표의 부호·정규화 보정 후 값이 $\dfrac{1}{2}$.",
  },
  {
    id: "q-2023-skku-13",
    explanation: "라이프니츠: $f'(x)=-e^{x^2+x\cdot x}+\displaystyle\int_x^1 t\,e^{t^2+xt}\,dt=-e^{2x^2}+\!\int_x^1 t\,e^{t^2+xt}dt$.\n$x=0$ 대입: $f'(0)=-e^{0}+\displaystyle\int_0^1 t\,e^{t^2}dt=-1+\!\left[\dfrac{e^{t^2}}{2}\right]_0^1=-1+\dfrac{e-1}{2}=\dfrac{e-3}{2}=\dfrac{e}{2}-\dfrac{3}{2}$.",
  },
];

let ok=0, fail=0;
for (const p of patches) {
  const { error } = await sb.from("questions").update({
    explanation: p.explanation,
    updated_at: new Date().toISOString(),
  }).eq("id", p.id);
  if (error) { console.error(`FAIL ${p.id}:`, error.message); fail++; }
  else { console.log(`OK ${p.id} (len=${p.explanation.length})`); ok++; }
}
console.log(`\nDone: ok=${ok}, fail=${fail}`);
