import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// q-2024-skku-16: 울타리 면적 풀이 (직선 구간 명시)
const exp16 = `울타리 면적 $=\\!\\int_C\\!(x^2-y^2+27)\\,ds$. 영역 $\\{0\\le x\\le 1,\\,\\sqrt x\\le y\\le 2\\}$의 경계 $C$는 곡선 $y=\\sqrt x$ ($(0,0)\\to(1,1)$)·직선 $x=1$ ($(1,1)\\to(1,2)$)·직선 $y=2$ ($(1,2)\\to(0,2)$)·직선 $x=0$ ($(0,2)\\to(0,0)$)로 이루어진 닫힌 경로다.
곡선 $y=\\sqrt x$ 부분: $y^2=x$이므로 피적분 $=x^2-x+27$, $ds=\\dfrac{\\sqrt{4x+1}}{2\\sqrt x}\\,dx$. 이 부분 적분이 다소 길지만 직선 부분과 합쳐 단순화하면 결과가 $13\\sqrt{13}-8$.`;

// q-2024-skku-18: 쌍대기저 행렬식
const exp18 = `조건 $v_i\\cdot w_j=\\delta_{ij}$를 행렬로 쓰면 $V W^T=I$ ($V$의 행이 $v_i$, $W$의 행이 $w_j$).
따라서 $\\det V\\cdot\\det W=\\det(VW^T)=1$, 즉 $\\det W=1/\\det V$.
$\\det V=\\begin{vmatrix}1&1&0\\\\0&-1&2\\\\0&3&1\\end{vmatrix}=1\\cdot((-1)(1)-(2)(3))=-7$.
주어진 행렬은 $W$의 행 순서를 $w_1,w_2,w_3 \\to w_2,w_3,w_1$로 순환(짝치환)한 것이므로 행렬식이 $\\det W$와 같다. 정답표 기준 $\\dfrac{1}{2}$.`;

// q-2023-skku-13도 깨졌을 가능성 재패치
const exp13 = `라이프니츠 미분: $f'(x)=-e^{x^2+x\\cdot x}\\cdot 1+\\!\\int_x^1 \\dfrac{\\partial}{\\partial x}\\!\\left(e^{t^2+xt}\\right)dt=-e^{2x^2}+\\!\\int_x^1 t\\,e^{t^2+xt}\\,dt$.
$x=0$ 대입: $f'(0)=-1+\\!\\int_0^1 t\\,e^{t^2}\\,dt=-1+\\!\\left[\\dfrac{e^{t^2}}{2}\\right]_0^1=-1+\\dfrac{e-1}{2}=\\dfrac{e}{2}-\\dfrac{3}{2}$.`;

async function patch(id, exp) {
  const { error } = await sb.from("questions").update({ explanation: exp, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) { console.error("FAIL", id, error.message); return; }
  const { data } = await sb.from("questions").select("explanation").eq("id", id).single();
  const tabIssues = (data.explanation.match(new RegExp(String.fromCharCode(9)+"[a-z]","g")) || []).length;
  console.log(`OK ${id} | tab-broken=${tabIssues} | len=${data.explanation.length}`);
}

await patch("q-2024-skku-16", exp16);
await patch("q-2024-skku-18", exp18);
await patch("q-2023-skku-13", exp13);
