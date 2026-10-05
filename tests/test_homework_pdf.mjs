import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nativeRequire = createRequire(import.meta.url);
process.chdir(root);

// Compile the actual TypeScript parser, preserving its native dynamic imports.
// Only the application error class is isolated: importing server.ts would pull
// unrelated database and route code into this parser test.
async function loadSourceParser() {
  const types = ts.transpileModule(readFileSync(path.join(root, "src/types/homework.ts"), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const typesUrl = `data:text/javascript;base64,${Buffer.from(types).toString("base64")}`;
  const source = readFileSync(path.join(root, "src/lib/homework/pdf-server.ts"), "utf8");
  let output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  output = output.replace(/import\s*\{\s*HomeworkError\s*\}\s*from\s*["']@\/lib\/homework\/server["'];?/, "class HomeworkError extends Error { constructor(status, message) { super(message); this.status = status; } }");
  output = output.replace(/["']@\/types\/homework["']/g, JSON.stringify(typesUrl));
  assert.ok(!output.includes("@/"), "Parser has a new application dependency; update the test loader explicitly.");
  const module = await import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
  return module.inspectHomeworkPdf;
}

// Build a real PDF with a catalog, page tree, cross-reference table and trailer.
// Fixtures stay in memory and contain no student files or external resources.
function pdfFixture(pageCount = 1) {
  const pages = Array.from({ length: pageCount }, (_, index) => `${index + 3} 0 R`).join(" ");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pages}] /Count ${pageCount} >>`,
    ...Array.from({ length: pageCount }, () => "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>"),
  ];
  let text = "%PDF-1.7\n%Homework parser fixture\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(text));
    text += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(text);
  text += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  text += offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  text += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Uint8Array.from(Buffer.from(text));
}

async function runParserCases(inspect, label) {
  const onePage = pdfFixture(1);
  assert.equal(await inspect(onePage, 1), 1, `${label}: valid one-page PDF`);
  assert.equal(await inspect(pdfFixture(2), 2), 2, `${label}: valid two-page PDF`);
  await assert.rejects(inspect(onePage, 2), error => error.status === 400 && /페이지/.test(error.message), `${label}: declared page count must match the real PDF`);
  await assert.rejects(inspect(Uint8Array.from(Buffer.from("%PDF-1.7\ninvalid PDF structure\n")), 1), error => error.status === 400 && /PDF를 읽을 수 없습니다/.test(error.message), `${label}: a magic header alone is not a valid PDF`);
  await assert.rejects(inspect(Uint8Array.from(Buffer.from("not a PDF file")), 1), error => error.status === 400, `${label}: invalid header`);
  await assert.rejects(inspect(new Uint8Array(), 1), error => error.status === 400, `${label}: empty file`);
  const oversized = new Uint8Array(15 * 1024 * 1024 + 1);
  oversized.set(Buffer.from("%PDF-1.7"));
  await assert.rejects(inspect(oversized, 1), error => error.status === 400, `${label}: size limit`);
  assert.equal(await inspect(pdfFixture(50), 50), 50, `${label}: 50 pages allowed`);
  await assert.rejects(inspect(pdfFixture(51), 51), error => error.status === 400 && /최대 50페이지/.test(error.message), `${label}: 51 pages rejected`);
  console.log(`${label}: 9 PDF parser cases passed`);
}

// Exercise the actual production function rather than merely checking source.
// Webpack can incorrectly compile createRequire(...) to undefined, which a
// transpiled-source test cannot detect. Expose the otherwise private function
// from its unchanged factory closure; all runtime dependencies remain real.
function loadProductionParser() {
  // Route entrypoints register Node externals that are not in shared chunks.
  nativeRequire(path.join(root, ".next/server/app/api/admin/homework/materials/route.js"));
  const runtime = nativeRequire(path.join(root, ".next/server/webpack-runtime.js"));
  let match;
  for (const filename of readdirSync(path.join(root, ".next/server/chunks")).filter(name => name.endsWith(".js"))) {
    const chunk = nativeRequire(path.join(root, ".next/server/chunks", filename));
    if (!chunk.modules) continue;
    runtime.C(chunk);
    for (const [id, factory] of Object.entries(chunk.modules)) {
      const text = factory.toString();
      if (!text.includes("pdfjs-dist/legacy/build/pdf.mjs") || !text.includes("%PDF-")) continue;
      const parsed = ts.createSourceFile(filename, `const factory = ${text};`, ts.ScriptTarget.ESNext, true, ts.ScriptKind.JS);
      let parserName;
      function find(node) {
        if (ts.isFunctionDeclaration(node) && node.name && node.body?.getText(parsed).includes("pdfjs-dist/legacy/build/pdf.mjs")) parserName = node.name.text;
        ts.forEachChild(node, find);
      }
      find(parsed);
      const factoryNode = parsed.statements[0]?.declarationList?.declarations[0]?.initializer;
      const exportName = factoryNode?.parameters[1]?.name?.getText(parsed);
      assert.ok(parserName && exportName, "Production parser closure could not be located.");
      const exposed = text.replace(/}\s*$/, `;${exportName}.__homeworkPdfInspector = ${parserName};}`);
      match = { id, factory: vm.runInThisContext(`(${exposed})`, { filename: "homework-pdf-production-test.js", importModuleDynamically: vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER }) };
    }
  }
  assert.ok(match, "Build the project before running the production parser test.");
  const module = { exports: {} };
  match.factory(module, module.exports, runtime);
  assert.equal(typeof module.exports.__homeworkPdfInspector, "function");
  return module.exports.__homeworkPdfInspector;
}

function inspectProductionTracing() {
  const routes = ["admin/homework/materials", "student/homework/[id]/submit"];
  for (const route of routes) {
    const trace = JSON.parse(readFileSync(path.join(root, ".next/server/app/api", route, "route.js.nft.json"), "utf8"));
    const files = trace.files.map(file => file.replaceAll("\\", "/"));
    for (const suffix of ["pdfjs-dist/legacy/build/pdf.mjs", "pdfjs-dist/legacy/build/pdf.worker.mjs", "@napi-rs/canvas/index.js", "@napi-rs/canvas/js-binding.js"]) {
      assert.ok(files.some(file => file.endsWith(suffix)), `${route}: missing traced ${suffix}`);
    }
    assert.ok(files.some(file => /@napi-rs\/canvas[^/]+\/[^/]+\.node$/.test(file)), `${route}: missing native canvas binary`);
    console.log(`${route}: parser, worker and native canvas tracing present`);
  }
}

try {
  await runParserCases(await loadSourceParser(), "source");
  if (process.argv.includes("--production")) {
    inspectProductionTracing();
    await runParserCases(loadProductionParser(), "production bundle");
  }
} catch (error) {
  console.error(`${error.name}: ${error.message}`);
  process.exitCode = 1;
}
