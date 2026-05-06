// Fix rows where tags contain duplicates (concept == unit caused "미분" twice).
// Usage: node scripts/fix_duplicate_tags.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [k, ...rest] = line.split("=");
      return [k.trim(), rest.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Concept relabel: more specific names for problems where concept previously equaled unit "미분".
const conceptFixes = {
  // DT7-2: d/dx [(1 - sec x)/tan x] at π/4 → 삼각함수 미분
  "q-daily-r7-2": "삼각함수 미분",
  // DT24-4: f'(0) for sin x/x with f(0)=1 → 미분 정의
  "q-daily-r24-4": "미분 정의"
};

for (const [id, newConcept] of Object.entries(conceptFixes)) {
  const { data: existing, error: fetchErr } = await supabase
    .from("questions")
    .select("id, unit, tags")
    .eq("id", id)
    .single();
  if (fetchErr || !existing) {
    console.error(`[FAIL] ${id}: ${fetchErr?.message ?? "not found"}`);
    continue;
  }
  // Replace duplicate "미분" entry with new concept; dedupe via Set.
  const tagSet = new Set(existing.tags ?? []);
  // tagSet may already have "미분" once (the unit). We add the new specific concept tag.
  tagSet.add(newConcept);
  const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ko"));

  const { error: upErr } = await supabase
    .from("questions")
    .update({
      concept: newConcept,
      tags,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (upErr) {
    console.error(`[FAIL] ${id}: ${upErr.message}`);
  } else {
    console.log(`[OK]   ${id} → concept="${newConcept}", tags=[${tags.join(", ")}]`);
  }
}

console.log("\nDone.");
