// Detect duplicate questions (same question text) and remove the newer import,
// merging any unique tags into the survivor first (e.g. "daily").
// Usage: node scripts/dedupe_questions.mjs
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

const { data, error } = await supabase
  .from("questions")
  .select("id, question, tags, created_at")
  .order("created_at", { ascending: true });

if (error) {
  console.error("Fetch error:", error);
  process.exit(1);
}

const groups = new Map();
for (const q of data) {
  const key = (q.question || "").trim();
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(q);
}

let merged = 0;
let deleted = 0;
const failures = [];

for (const group of groups.values()) {
  if (group.length <= 1) continue;
  // Keep the oldest (first in sorted order); delete the rest.
  const [survivor, ...victims] = group;

  // Collect unique tags from victims that aren't already in survivor.
  const tagSet = new Set(survivor.tags ?? []);
  let tagsChanged = false;
  for (const v of victims) {
    for (const t of v.tags ?? []) {
      if (!tagSet.has(t)) {
        tagSet.add(t);
        tagsChanged = true;
      }
    }
  }

  if (tagsChanged) {
    const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ko"));
    const { error: upErr } = await supabase
      .from("questions")
      .update({ tags, updated_at: new Date().toISOString() })
      .eq("id", survivor.id);
    if (upErr) {
      failures.push({ id: survivor.id, op: "merge tags", reason: upErr.message });
      continue;
    }
    merged += 1;
    console.log(`[MERGE] ${survivor.id} ← tags from ${victims.length} dup(s)`);
  }

  for (const v of victims) {
    const { error: delErr } = await supabase.from("questions").delete().eq("id", v.id);
    if (delErr) {
      failures.push({ id: v.id, op: "delete", reason: delErr.message });
      continue;
    }
    deleted += 1;
    console.log(`[DELETE] ${v.id}`);
  }
}

console.log(`\nDone. merged=${merged}, deleted=${deleted}, failures=${failures.length}`);
if (failures.length) {
  for (const f of failures) console.log(` - ${f.id} (${f.op}): ${f.reason}`);
}
