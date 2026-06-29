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

for (const pattern of ['seoultech', 'snut', '과기']) {
  const { data } = await sb.from('questions').select('id, tags').like('id', `%${pattern}%`).limit(3);
  console.log(`${pattern}:`, data?.length ?? 0, data);
}
const { data: tagSearch } = await sb.from('questions').select('id, tags').contains('tags', ['서울과기대']).limit(3);
console.log('tag 서울과기대:', tagSearch?.length, tagSearch);
const { data: tagSearch2 } = await sb.from('questions').select('id, tags').contains('tags', ['과기대']).limit(3);
console.log('tag 과기대:', tagSearch2?.length, tagSearch2);
