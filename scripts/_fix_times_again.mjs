import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const TIMES = String.fromCharCode(0x5c) + "times";
const NL = "\n";

const exp02 =
  "행간소(row reduction)로 일차독립인 행 개수를 세면 된다. $4" + TIMES + " 6$ 행렬이므로 rank는 최대 $4$." + NL +
  "실제 행간소를 진행하면 4개의 행 중 일차종속이 1개 발생하여 독립 행은 $3$개. 따라서 rank $=3$.";

const exp06 =
  "행간소 진행: $R_3" + String.fromCharCode(0x5c) + "to R_3-2R_1=(0,0,a-2,0),\\,R_4" + String.fromCharCode(0x5c) + "to R_4-4R_1=(0,1,-2,a),\\,R_4" + String.fromCharCode(0x5c) + "to R_4-R_2=(0,0,-3,a-5)$." + NL +
  "이제 마지막 두 행 $[0,0,a-2,0]$과 $[0,0,-3,a-5]$의 $2" + TIMES + " 2$ 부분행렬 $\\begin{pmatrix}a-2&0\\\\-3&a-5\\end{pmatrix}$의 행렬식 $(a-2)(a-5)$가 0일 때 두 행이 일차종속이 되어 rank가 줄어든다." + NL +
  "$a=2$ 또는 $a=5$일 때 rank $=3$ (최소). 두 값의 합 $=2+5=7$.";

async function patch(id, exp) {
  const { error } = await sb.from("questions").update({ explanation: exp, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) { console.error("FAIL", id, error.message); return false; }
  // verify
  const { data } = await sb.from("questions").select("explanation").eq("id", id).single();
  const hasTabImes = data.explanation.includes(String.fromCharCode(0x09) + "imes");
  const hasBackslashTimes = data.explanation.includes(TIMES);
  console.log(`OK ${id} | tabImes=${hasTabImes} | backslashTimes=${hasBackslashTimes} | len=${data.explanation.length}`);
  return true;
}

await patch("q-2022-skku-02", exp02);
await patch("q-2024-skku-06", exp06);
