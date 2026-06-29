// Converts placeholder multiple-choice subjective rows to true subjective rows.
// Usage: node scripts/fix_audit_subjective_placeholders.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const fixes = [
  ["q-2023-uos-29", "240"],
  ["q-2023-uos-30", "16"],
  ["q-2024-uos-26", "131"],
  ["q-2024-uos-27", "600"],
  ["q-2024-uos-28", "11"],
  ["q-2024-uos-29", "10"],
  ["q-2024-uos-30", "153"],
];

const ids = fixes.map(([id]) => id);
const { data, error: fetchError } = await supabase
  .from("questions")
  .select("id, question, options")
  .in("id", ids);
if (fetchError) throw fetchError;

const rows = new Map(data.map((row) => [row.id, row]));
for (const [id] of fixes) {
  const row = rows.get(id);
  if (!row) throw new Error(`Missing question row: ${id}`);
  if (!String(row.question ?? "").includes("[주관식]")) {
    throw new Error(`${id}: expected [주관식] marker before converting`);
  }
}

for (const [id, answerText] of fixes) {
  const { error } = await supabase
    .from("questions")
    .update({
      question_type: "subjective",
      options: [],
      correct_option_id: "",
      answer_text: answerText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(`${id}: ${error.message}`);
  console.log(`converted ${id} -> subjective (${answerText})`);
}

console.log(`Converted ${fixes.length} placeholder rows.`);
