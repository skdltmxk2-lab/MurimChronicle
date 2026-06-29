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
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

for (const p of ['ewha','ewa','ewu']) {
  const { data } = await sb.from('questions').select('id, tags').like('id', `%${p}%`).limit(5);
  console.log(`id LIKE %${p}%:`, data?.length ?? 0, data?.slice(0,3));
}
const { data, count } = await sb.from('questions').select('id, tags', { count: 'exact' }).contains('tags', ['이화여대']).limit(50);
console.log(`tag 이화여대: total=${count}, samples:`, data?.slice(0,10).map(d=>d.id));
