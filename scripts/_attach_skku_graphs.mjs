import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function pngToDataUrl(path) {
  const buf = readFileSync(path);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const imgQ06 = pngToDataUrl(resolve(here, "_tmp_pdf_imgs", "_opt__crop_s23_q06_graph.png"));
const imgQ04 = pngToDataUrl(resolve(here, "_tmp_pdf_imgs", "_opt__crop_s24_q04_dirfield.png"));

const newQ_2023_06 = "다음 그래프는 도함수 $f'(x)$의 그래프이다. 주어진 $f(x)$값들 중에서 가장 큰 값은?";
const newQ_2024_04 = "다음과 같은 방향장(direction field)을 가질 수 있는 미분방정식은?";

const updates = [
  { id: "q-2023-skku-06", question: newQ_2023_06, question_image: imgQ06 },
  { id: "q-2024-skku-04", question: newQ_2024_04, question_image: imgQ04 },
];

for (const u of updates) {
  const { error } = await sb.from("questions").update({
    question: u.question,
    question_image: u.question_image,
    updated_at: new Date().toISOString(),
  }).eq("id", u.id);
  if (error) { console.error("FAIL", u.id, error.message); continue; }
  const { data } = await sb.from("questions").select("question,question_image").eq("id", u.id).single();
  console.log(`OK ${u.id} | q.len=${data.question.length} | img.len=${data.question_image.length}`);
}
