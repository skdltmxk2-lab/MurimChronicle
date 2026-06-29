// Mathpix PDF API로 PDF → mmd(Mathpix Markdown) 추출
// 사용: node scripts/_mathpix_extract.mjs <pdf경로>
// 출력: <같은이름>.mmd

import { readFileSync, writeFileSync, createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, basename } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);

const APP_ID = env.MATHPIX_APP_ID;
const APP_KEY = env.MATHPIX_APP_KEY;
if (!APP_ID || !APP_KEY) {
  console.error("ERROR: .env.local에 MATHPIX_APP_ID, MATHPIX_APP_KEY 필요");
  process.exit(1);
}

const pdfPath = process.argv[2];
if (!pdfPath) { console.error("사용: node scripts/_mathpix_extract.mjs <pdf>"); process.exit(1); }

const headers = { "app_id": APP_ID, "app_key": APP_KEY };

console.log(`업로드: ${basename(pdfPath)}`);
const fd = new FormData();
const buf = readFileSync(pdfPath);
fd.append("file", new Blob([buf], { type: "application/pdf" }), basename(pdfPath));
fd.append("options_json", JSON.stringify({
  math_inline_delimiters: ["$", "$"],
  math_display_delimiters: ["$$", "$$"],
  rm_spaces: true,
  enable_tables_fallback: true,
}));

const up = await fetch("https://api.mathpix.com/v3/pdf", { method: "POST", headers, body: fd });
const upJson = await up.json();
if (!upJson.pdf_id) { console.error("업로드 실패:", upJson); process.exit(1); }
console.log(`pdf_id: ${upJson.pdf_id}`);

// 폴링
let status = "split";
for (let i = 0; i < 60; i++) {
  await new Promise((r) => setTimeout(r, 2000));
  const st = await fetch(`https://api.mathpix.com/v3/pdf/${upJson.pdf_id}`, { headers });
  const stJson = await st.json();
  status = stJson.status;
  process.stdout.write(`\r[${i+1}] ${status} (${stJson.percent_done ?? 0}%)`);
  if (status === "completed") break;
  if (status === "error") { console.error("\n오류:", stJson); process.exit(1); }
}
console.log("");
if (status !== "completed") { console.error("타임아웃"); process.exit(1); }

// mmd 다운로드
const mmdRes = await fetch(`https://api.mathpix.com/v3/pdf/${upJson.pdf_id}.mmd`, { headers });
const mmd = await mmdRes.text();
const outPath = pdfPath.replace(/\.pdf$/i, "") + ".mmd";
writeFileSync(outPath, mmd, "utf8");
console.log(`✓ 저장: ${outPath} (${mmd.length} chars)`);
