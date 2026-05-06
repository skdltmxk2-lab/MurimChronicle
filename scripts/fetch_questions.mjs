// Fetch all questions from Supabase and dump to scripts/questions_dump.json
// Usage: node scripts/fetch_questions.mjs
import { readFileSync, writeFileSync } from "node:fs";
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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Supabase URL/KEY missing in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const { data, error } = await supabase
  .from("questions")
  .select("id, subject, unit, concept, difficulty, question, tags")
  .order("created_at", { ascending: true });

if (error) {
  console.error("Fetch error:", error);
  process.exit(1);
}

const outPath = resolve(here, "questions_dump.json");
writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");
console.log(`Fetched ${data.length} questions → ${outPath}`);
