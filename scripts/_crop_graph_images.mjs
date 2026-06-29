import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const imgDir = resolve(here, "_tmp_pdf_imgs");

// First-pass crop guesses; we'll inspect results then refine.
const jobs = [
  {
    src: resolve(imgDir, "s23q_p1_TR.png"),
    out: resolve(imgDir, "_crop_s23_q06_graph.png"),
    crop: { left: 280, top: 700, width: 660, height: 430 },
  },
  {
    src: resolve(imgDir, "s24q_p1_BL.png"),
    out: resolve(imgDir, "_crop_s24_q04_dirfield.png"),
    crop: { left: 200, top: 230, width: 860, height: 540 },
  },
];

for (const j of jobs) {
  await sharp(j.src).extract(j.crop).toFile(j.out);
  const meta = await sharp(j.out).metadata();
  console.log(`${j.out} -> ${meta.width}x${meta.height}`);
}
