// Find any LaTeX commands ('\xxx') sitting outside $...$ math mode.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&!l.startsWith("#")&&l.includes("="))
  .map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function splitMath(s) {
  const parts = []; let i = 0;
  while (i < s.length) {
    if (s[i] === "$" && (i === 0 || s[i-1] !== "\\")) {
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

const { data } = await sb.from("questions").select("id, question, options, explanation").like("id", "q-2025-%").order("id");

const issues = [];
for (const q of data) {
  const fields = [
    ["question", q.question],
    ["explanation", q.explanation || ""],
    ...(q.options || []).map((o,i) => [`opt${i}`, o.text || ""]),
  ];
  for (const [name, text] of fields) {
    if (!text) continue;
    const parts = splitMath(text);
    for (const p of parts) {
      if (p.math) continue;
      // Find any \word
      const m = p.text.match(/\\[A-Za-z]+/g);
      if (m) issues.push({ id: q.id, field: name, commands: m });
    }
  }
}
console.log("Issues found:", issues.length);
const byCmd = {};
for (const i of issues) {
  for (const c of i.commands) byCmd[c] = (byCmd[c] || 0) + 1;
}
console.log("By command:");
for (const [c, n] of Object.entries(byCmd).sort((a,b)=>b[1]-a[1])) console.log(`  ${c}: ${n}`);
console.log("\nExamples (first 10):");
for (const i of issues.slice(0, 10)) console.log(` ${i.id} [${i.field}] ${i.commands.join(",")}`);
