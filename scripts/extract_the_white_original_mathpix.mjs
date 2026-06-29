// Extract the scanned THE 앤드 화이트 source PDF with Mathpix.
// Writes tmp/pdfs/white_mathpix/THE 앤드 화이트.mmd.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const root = resolve(".");
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

const APP_ID = env.MATHPIX_APP_ID;
const APP_KEY = env.MATHPIX_APP_KEY;
if (!APP_ID || !APP_KEY) {
  console.error("Missing MATHPIX_APP_ID / MATHPIX_APP_KEY in .env.local");
  process.exit(1);
}

const pdfPath = "C:\\Users\\yubin\\Desktop\\편입\\편수\\7_추가자료\\THE 앤드 화이트.pdf";
const outDir = resolve(root, "tmp", "pdfs", "white_mathpix");
const outPath = resolve(outDir, "THE 앤드 화이트.mmd");
mkdirSync(outDir, { recursive: true });

if (existsSync(outPath)) {
  console.log(`skip: ${outPath}`);
  process.exit(0);
}

const headers = { app_id: APP_ID, app_key: APP_KEY };
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

console.log(`upload: ${pdfPath}`);
const fd = new FormData();
const buf = readFileSync(pdfPath);
fd.append("file", new Blob([buf], { type: "application/pdf" }), basename(pdfPath));
fd.append(
  "options_json",
  JSON.stringify({
    math_inline_delimiters: ["$", "$"],
    math_display_delimiters: ["$$", "$$"],
    rm_spaces: true,
    enable_tables_fallback: true,
  }),
);

const upload = await fetch("https://api.mathpix.com/v3/pdf", {
  method: "POST",
  headers,
  body: fd,
});
const uploadJson = await upload.json();
if (!uploadJson.pdf_id) {
  throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`);
}

let status = "";
for (let attempt = 0; attempt < 300; attempt += 1) {
  await sleep(2000);
  const statusRes = await fetch(`https://api.mathpix.com/v3/pdf/${uploadJson.pdf_id}`, {
    headers,
  });
  const statusJson = await statusRes.json();
  status = statusJson.status;
  process.stdout.write(
    `\r  ${status} (${statusJson.percent_done ?? 0}%)      `,
  );
  if (status === "completed") break;
  if (status === "error") {
    throw new Error(`Mathpix error: ${JSON.stringify(statusJson)}`);
  }
}
process.stdout.write("\n");
if (status !== "completed") throw new Error("Timed out waiting for Mathpix");

const mmdRes = await fetch(`https://api.mathpix.com/v3/pdf/${uploadJson.pdf_id}.mmd`, {
  headers,
});
const mmd = await mmdRes.text();
writeFileSync(outPath, mmd, "utf8");
console.log(`done: ${outPath} (${mmd.length} chars)`);
