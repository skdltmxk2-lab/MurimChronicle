// Fix \quad and \\ usage outside math mode (KaTeX renders them as literal text).
// Strategy: replace any standalone "\quad" outside $...$ with three spaces.
// Also replace standalone "\\" outside $...$ with newline.
// Then re-upload modified rows.

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

// Splits text by $...$ math segments. Returns [{math:bool, text:string}].
function splitMath(s) {
  const parts = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === "$" && (i === 0 || s[i-1] !== "\\")) {
      // find closing $
      let j = i + 1;
      while (j < s.length && !(s[j] === "$" && s[j-1] !== "\\")) j++;
      parts.push({ math: true, text: s.slice(i, j+1) });
      i = j + 1;
    } else {
      let j = i;
      while (j < s.length && !(s[j] === "$" && (j === 0 || s[j-1] !== "\\"))) j++;
      parts.push({ math: false, text: s.slice(i, j) });
      i = j;
    }
  }
  return parts;
}

function fixOutsideMath(s) {
  if (!s) return s;
  const parts = splitMath(s);
  return parts.map(p => {
    if (p.math) return p.text;
    let t = p.text;
    // \quad -> three spaces
    t = t.replace(/\\quad\s*/g, "   ");
    // standalone \\ at end of word (line break in latex) -> newline
    t = t.replace(/\\\\(?!\\)/g, "\n");
    return t;
  }).join("");
}

const prefixes = ["q-2025-sogang-", "q-2025-seoultech-", "q-2025-uos-", "q-2025-skku-", "q-2025-sejong-",
                  "q-2025-mju-", "q-2025-gachon-", "q-2025-konkuk-", "q-2025-kyonggi-", "q-2025-kyunghee-",
                  "q-2025-kw-", "q-2025-dku_am-", "q-2025-dku_pm-", "q-2025-dgu-",
                  "q-2025-cau-", "q-2025-soongsil-", "q-2025-ajou-", "q-2025-inha-",
                  "q-2025-sookmyung-", "q-2025-hansung-"];

let totalFixed = 0;
for (const prefix of prefixes) {
  const { data, error } = await sb.from("questions").select("id, question, options, explanation").like("id", `${prefix}%`);
  if (error) { console.error(error); continue; }
  for (const q of data) {
    const newQuestion = fixOutsideMath(q.question);
    const newExplanation = fixOutsideMath(q.explanation || "");
    const newOptions = (q.options || []).map(o => ({ ...o, text: fixOutsideMath(o.text || "") }));
    const changed =
      newQuestion !== q.question ||
      newExplanation !== (q.explanation || "") ||
      JSON.stringify(newOptions) !== JSON.stringify(q.options || []);
    if (changed) {
      const { error: upErr } = await sb.from("questions")
        .update({ question: newQuestion, explanation: newExplanation, options: newOptions, updated_at: new Date().toISOString() })
        .eq("id", q.id);
      if (upErr) console.error(`Failed to update ${q.id}:`, upErr);
      else { console.log(`fixed ${q.id}`); totalFixed++; }
    }
  }
}
console.log(`\nTotal fixed: ${totalFixed}`);
