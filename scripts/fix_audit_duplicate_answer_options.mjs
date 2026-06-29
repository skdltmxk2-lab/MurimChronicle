// Converts duplicate-answer-option rows to subjective rows when the original choices are unreliable.
// Usage: node scripts/fix_audit_duplicate_answer_options.mjs
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import katex from "katex";

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
  {
    id: "q-2021pm-sejong-04",
    patch: {
      question_type: "subjective",
      options: [],
      correct_option_id: "",
      answer_text: "$(0,-3)$",
    },
  },
  {
    id: "q-2022pm-dankook-50",
    patch: {
      question_type: "subjective",
      options: [],
      correct_option_id: "",
      answer_text: "$(10e^{-3},6e^{-3})$",
      explanation: `$A=\\begin{pmatrix}-1&-2\\\\2&-5\\end{pmatrix}=-3I+N$으로 두면 $N=\\begin{pmatrix}2&-2\\\\2&-2\\end{pmatrix}$이고 $N^2=O$이다.
따라서 $e^{At}=e^{-3t}e^{Nt}=e^{-3t}(I+tN)$.
초기벡터 $X(0)=\\begin{pmatrix}2\\\\-2\\end{pmatrix}$에 대해 $NX(0)=\\begin{pmatrix}8\\\\8\\end{pmatrix}$이므로
$X(1)=e^{-3}(I+N)X(0)=e^{-3}\\begin{pmatrix}10\\\\6\\end{pmatrix}$.
즉 $X(1)=\\begin{pmatrix}10e^{-3}\\\\6e^{-3}\\end{pmatrix}$.`,
    },
  },
];

function countDollars(text) {
  return (String(text ?? "").match(/(?<!\\)\$/g) ?? []).length;
}

function splitMath(content) {
  const segments = [];
  const text = String(content ?? "");
  const pattern = /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const token = match[0];
    const display = token.startsWith("$$");
    segments.push({ display, text: display ? token.slice(2, -2) : token.slice(1, -1) });
  }
  return segments;
}

for (const { id, patch } of fixes) {
  for (const field of ["answer_text", "explanation"]) {
    const value = patch[field];
    if (!value) continue;
    if (countDollars(value) % 2 !== 0) throw new Error(`${id} ${field}: odd dollar count`);
    for (const segment of splitMath(value)) {
      katex.renderToString(segment.text, {
        displayMode: segment.display,
        throwOnError: true,
        strict: false,
      });
    }
  }
}

for (const { id, patch } of fixes) {
  const { error } = await supabase
    .from("questions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`${id}: ${error.message}`);
  console.log(`converted ${id}`);
}

console.log(`Converted ${fixes.length} rows.`);
