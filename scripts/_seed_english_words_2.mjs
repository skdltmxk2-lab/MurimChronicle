// 두 번째 단어장 업로드.
// 원본: c:/Users/yubin/Desktop/단어장2.txt (정상 UTF-8)
// 파싱 규칙은 app/api/admin/english/words/route.ts 와 동일하게 맞춘다.
//   - 영문 단어 줄: /^[A-Za-z][A-Za-z'-]*$/ 한 토큰
//   - 그 외 비어있지 않은 줄: 직전 단어의 뜻 (여러 줄이면 " / "로 합침)
// 기존 영단어와 word 컬럼이 같은 행은 upsert(onConflict: "word") 되어 뜻만 갱신되고
// id는 유지된다. 새 단어는 id가 뒤에 붙어 등록 순서대로 day/세트 끝에 추가된다.

import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SOURCE = "C:/Users/yubin/Desktop/단어장2.txt";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const text = fs.readFileSync(SOURCE, "utf8");
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
console.log("sample:");
for (const r of rows.slice(0, 5)) console.log("  ", r.word, "→", r.meaning);

if (process.argv.includes("--dry-run")) {
  console.log("dry-run: skipping upsert");
  process.exit(0);
}

const beforeQ = await sb.from("english_words").select("id", { count: "exact", head: true });
console.log("english_words before:", beforeQ.count ?? "?");

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

const afterQ = await sb.from("english_words").select("id", { count: "exact", head: true });
console.log("DONE. english_words total =", afterQ.count);
