// Sets explanation_content_type to mixed for rows that have both typed explanation text and an explanation image.
// Usage: node scripts/fix_audit_explanation_image_content_type.mjs
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

const { data, error: fetchError } = await supabase
  .from("questions")
  .select("id, explanation_image, explanation_content_type")
  .not("explanation_image", "is", null)
  .neq("explanation_image", "")
  .eq("explanation_content_type", "latex");
if (fetchError) throw fetchError;

console.log(`Rows to update: ${data.length}`);

for (const row of data) {
  const { error } = await supabase
    .from("questions")
    .update({ explanation_content_type: "mixed", updated_at: new Date().toISOString() })
    .eq("id", row.id);
  if (error) throw new Error(`${row.id}: ${error.message}`);
  console.log(`updated ${row.id}`);
}

console.log(`Updated ${data.length} rows.`);
