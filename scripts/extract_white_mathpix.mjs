// Batch Mathpix extraction for Final A white PDFs.
// Writes MMD outputs under tmp/pdfs/white_mathpix without touching source folders.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

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

const APP_ID = env.MATHPIX_APP_ID;
const APP_KEY = env.MATHPIX_APP_KEY;
if (!APP_ID || !APP_KEY) {
  console.error("Missing MATHPIX_APP_ID / MATHPIX_APP_KEY in .env.local");
  process.exit(1);
}

const sourceDir =
  "C:\\Users\\yubin\\Desktop\\편입\\편수\\7_추가자료\\화이트 완\\화이트 완";
const outDir = resolve(root, "tmp", "pdfs", "white_mathpix");
mkdirSync(outDir, { recursive: true });

const files = [
  "Final A 1회(16~20번).pdf",
  "Final A 1회 해설.pdf",
  "Final A 2회(26~30번).pdf",
  "Final A 2회 해설.pdf",
  "Final A 3회(21~25번).pdf",
  "Final A 3회 해설.pdf",
  "Final A 4회(21~25번).pdf",
  "Final A 4회 해설.pdf",
  "Final A 5회(21~25번).pdf",
  "Final A 5회 해설.pdf",
  "Final A 6회(21~25번).pdf",
  "Final A 6회 해설.pdf",
  "Final A 7회(21~25번).pdf",
  "Final A 7회 해설.pdf",
  "Final A 8회(26~30번).pdf",
  "Final A 8회 해설.pdf",
  "Final A 9회(16~20번).pdf",
  "Final A 9회 해설.pdf",
  "Final A 10회(26~30번).pdf",
  "Final A 10회 해설.pdf",
  "Final A 11회(26~30번).pdf",
  "Final A 11회 해설.pdf",
  "Final A 12회(16~20번).pdf",
  "Final A 12회 해설.pdf",
  "Final A 13회(26~30번).pdf",
  "Final A 13회 해설.pdf",
  "Final A 14회(26~30번).pdf",
  "Final A 14회 해설.pdf",
];

const headers = { app_id: APP_ID, app_key: APP_KEY };
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

function outPathFor(file) {
  return join(outDir, file.replace(/\.pdf$/i, ".mmd"));
}

async function extract(file) {
  const pdfPath = join(sourceDir, file);
  const outPath = outPathFor(file);
  if (existsSync(outPath)) {
    console.log(`skip: ${file}`);
    return;
  }

  console.log(`upload: ${file}`);
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
    throw new Error(`Upload failed for ${file}: ${JSON.stringify(uploadJson)}`);
  }

  let status = "";
  for (let attempt = 0; attempt < 90; attempt += 1) {
    await sleep(2000);
    const statusRes = await fetch(`https://api.mathpix.com/v3/pdf/${uploadJson.pdf_id}`, {
      headers,
    });
    const statusJson = await statusRes.json();
    status = statusJson.status;
    process.stdout.write(
      `\r  ${file}: ${status} (${statusJson.percent_done ?? 0}%)      `,
    );
    if (status === "completed") break;
    if (status === "error") {
      throw new Error(`Mathpix error for ${file}: ${JSON.stringify(statusJson)}`);
    }
  }
  process.stdout.write("\n");
  if (status !== "completed") throw new Error(`Timed out: ${file}`);

  const mmdRes = await fetch(`https://api.mathpix.com/v3/pdf/${uploadJson.pdf_id}.mmd`, {
    headers,
  });
  const mmd = await mmdRes.text();
  writeFileSync(outPath, mmd, "utf8");
  console.log(`done: ${file} -> ${mmd.length} chars`);
}

for (const file of files) {
  await extract(file);
}
