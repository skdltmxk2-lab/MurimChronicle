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

for (const pattern of ['khu', 'kyunghee', 'kyunghi', 'kh-']) {
  const { data } = await sb.from('questions').select('id, tags').like('id', `%${pattern}%`).limit(5);
  console.log(`id LIKE %${pattern}%:`, data?.length ?? 0, data?.slice(0,3));
}
for (const tag of ['경희대']) {
  const { data, count } = await sb.from('questions').select('id, tags', { count: 'exact' }).contains('tags', [tag]).limit(50);
  console.log(`tag ${tag}: total=${count}, samples:`, data?.slice(0,10).map(d => d.id));
  if (data && data.length) {
    const years = new Set();
    for (const d of data) {
      const m = d.id.match(/q-(\d{4})/);
      if (m) years.add(m[1]);
      const yt = (d.tags || []).find(t => /^\d{4}$/.test(t));
      if (yt) years.add(yt);
    }
    console.log(`  unique years (from sample):`, [...years].sort());
  }
}
