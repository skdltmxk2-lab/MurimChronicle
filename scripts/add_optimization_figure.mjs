// Attach a generated SVG figure to the rectangle+semicircle optimization problem.
// Usage: node scripts/add_optimization_figure.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(here, "..", ".env.local");
const envText = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [k, ...rest] = line.split("=");
      return [k.trim(), rest.join("=").trim()];
    })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// SVG: rectangle (width a, height b) with a semicircle on top.
// Total bbox: 320 wide × 220 tall (60px padding for labels).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220" width="320" height="220">
  <defs>
    <style>
      .stroke { stroke: #0f172a; stroke-width: 2; fill: none; }
      .label { font-family: 'Cambria','Times New Roman',serif; font-style: italic; font-size: 18px; fill: #0f172a; }
      .dim { stroke: #475569; stroke-width: 1; fill: none; }
    </style>
  </defs>

  <!-- Semicircle on top: center (160,120), radius 80, opens upward -->
  <path class="stroke" d="M 80 120 A 80 80 0 0 1 240 120" />

  <!-- Rectangle below: from (80,120) to (240,200) -->
  <rect class="stroke" x="80" y="120" width="160" height="80" />

  <!-- Width label 'a' (top of rectangle, just above the rectangle inside the semicircle area) -->
  <text class="label" x="160" y="115" text-anchor="middle">a</text>

  <!-- Height label 'b' (right side of rectangle) -->
  <text class="label" x="248" y="165" text-anchor="start">b</text>

  <!-- Dimension tick marks (small lines at endpoints of width) -->
  <line class="dim" x1="80" y1="125" x2="80" y2="115" />
  <line class="dim" x1="240" y1="125" x2="240" y2="115" />

  <!-- Dimension marks for height -->
  <line class="dim" x1="245" y1="120" x2="235" y2="120" />
  <line class="dim" x1="245" y1="200" x2="235" y2="200" />
</svg>`;

// data URL with URL-encoded SVG
const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const targets = [
  "q-import-1778062406488-7-0omj",
  "q-import-1778062408507-7-07z3"
];

for (const id of targets) {
  const { error } = await supabase
    .from("questions")
    .update({
      question_image: dataUrl,
      content_type: "mixed",
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error(`[FAIL] ${id}: ${error.message}`);
  } else {
    console.log(`[OK]   ${id}`);
  }
}

console.log("\nDone.");
