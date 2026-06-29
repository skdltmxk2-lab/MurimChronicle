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

// 주관식 문제는 보기 1개만 있는 경우 → 4개의 dummy("(주관식)") 옵션 추가
const ids = [
  "q-2023-uos-29",
  "q-2023-uos-30",
  "q-2024-uos-26",
  "q-2024-uos-27",
  "q-2024-uos-28",
  "q-2024-uos-29",
  "q-2024-uos-30",
];

for (const id of ids) {
  const { data, error: ferr } = await sb.from("questions").select("options").eq("id", id).single();
  if (ferr) { console.error(id, ferr); continue; }
  const existing = data.options || [];
  if (existing.length >= 4) { console.log(`${id}: already ${existing.length} options, skip`); continue; }
  const pad = [];
  for (let i = existing.length + 1; i <= 5; i++) {
    pad.push({ id: String(i), label: String(i), text: "(주관식 — 해당 없음)", contentType: "latex", image: "" });
  }
  const newOptions = [...existing, ...pad];
  const { error: uerr } = await sb.from("questions").update({
    options: newOptions,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (uerr) { console.error(id, uerr); continue; }
  console.log(`${id}: padded to ${newOptions.length} options`);
}
