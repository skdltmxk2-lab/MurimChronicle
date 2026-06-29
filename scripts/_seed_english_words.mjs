import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const text = fs.readFileSync("scripts/_english_words_seed.txt", "utf8");
const isWord = (line) => /^[A-Za-z][A-Za-z'-]*$/.test(line);
const out = [];
let cur = null;
for (const raw of text.split(/\r?\n/)) {
  const line = raw.trim();
  if (!line) continue;
  if (isWord(line)) {
    if (cur && cur.meaning.length) out.push({ word: cur.word, meaning: cur.meaning.join(" / ") });
    cur = { word: line, meaning: [] };
  } else if (cur) {
    cur.meaning.push(line);
  }
}
if (cur && cur.meaning.length) out.push({ word: cur.word, meaning: cur.meaning.join(" / ") });

const map = new Map();
for (const e of out) map.set(e.word, e.meaning);
const rows = Array.from(map, ([word, meaning]) => ({ word, meaning }));
console.log("parsed unique words:", rows.length);

let done = 0;
for (let i = 0; i < rows.length; i += 500) {
  const chunk = rows.slice(i, i + 500);
  const { error } = await sb.from("english_words").upsert(chunk, { onConflict: "word" });
  if (error) {
    console.log("ERROR at chunk", i, ":", error.message);
    process.exit(1);
  }
  done += chunk.length;
  console.log("upserted", done, "/", rows.length);
}

const { count } = await sb.from("english_words").select("id", { count: "exact", head: true });
console.log("DONE. english_words total =", count);
