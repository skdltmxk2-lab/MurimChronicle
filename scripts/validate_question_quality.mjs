// Audit pending questions with the same validator used by the application.
// Dry run: node scripts/validate_question_quality.mjs
// Apply pending rows: node scripts/validate_question_quality.mjs --apply
// Revalidate all rows: node scripts/validate_question_quality.mjs --apply --all

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  STANDALONE_VALIDATOR_VERSION,
  getStandaloneQuestionIssue,
} from "../src/lib/questions/standaloneCore.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const env = Object.fromEntries(
  readFileSync(resolve(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase service-role credentials in .env.local");

const apply = process.argv.includes("--apply");
const includeAll = process.argv.includes("--all");
const sb = createClient(url, key);
const PAGE = 1000;
const UPDATE_CHUNK = 100;
const rows = [];

for (let from = 0; ; from += PAGE) {
  let query = sb
    .from("questions")
    .select("id, concept, question, explanation, tags, quality_status")
    .order("id", { ascending: true })
    .range(from, from + PAGE - 1);
  if (!includeAll) query = query.eq("quality_status", "pending");
  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) break;
  rows.push(...data);
  if (data.length < PAGE) break;
}

const approvedIds = [];
const quarantinedByCode = new Map();
const issues = [];

for (const row of rows) {
  const issue = getStandaloneQuestionIssue(row);
  if (!issue) {
    approvedIds.push(row.id);
    continue;
  }
  const ids = quarantinedByCode.get(issue.code) ?? [];
  ids.push(row.id);
  quarantinedByCode.set(issue.code, ids);
  issues.push({
    id: row.id,
    code: issue.code,
    message: issue.message,
    question: String(row.question ?? "").slice(0, 240),
  });
}

async function updateChunks(ids, update) {
  for (let index = 0; index < ids.length; index += UPDATE_CHUNK) {
    const chunk = ids.slice(index, index + UPDATE_CHUNK);
    const { error } = await sb.from("questions").update(update).in("id", chunk);
    if (error) throw error;
  }
}

if (apply) {
  const validatedAt = new Date().toISOString();
  await updateChunks(approvedIds, {
    quality_status: "approved",
    quality_reasons: [],
    validated_at: validatedAt,
    validator_version: STANDALONE_VALIDATOR_VERSION,
  });
  for (const [code, ids] of quarantinedByCode) {
    await updateChunks(ids, {
      quality_status: "quarantined",
      quality_reasons: [code],
      validated_at: validatedAt,
      validator_version: STANDALONE_VALIDATOR_VERSION,
    });
  }
}

console.log(
  JSON.stringify(
    {
      mode: apply ? "apply" : "dry-run",
      scope: includeAll ? "all" : "pending",
      checked: rows.length,
      approved: approvedIds.length,
      quarantined: issues.length,
      issues,
    },
    null,
    2,
  ),
);
