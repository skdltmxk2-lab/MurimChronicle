/** Execute the actual app modules without mocking its solver or component models. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const source = readFileSync(new URL(`../../src/lib/electronics/${name}.ts`, import.meta.url), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  cache.set(name, module.exports);
  new Function("module", "exports", "require", js)(module, module.exports, dependency => {
    if (!dependency.startsWith("./")) throw new Error(`Unsupported audit dependency ${dependency}`);
    return load(dependency.slice(2));
  });
  return module.exports;
}
const { COMPONENT_CATALOG } = load("catalog");
const { buildLab5ReferenceCase, lab5Measurements } = load("lab5-reference");
const { runSimulation } = load("simulation");
const out = resolve("tmp/lab5-reference");
mkdirSync(out, { recursive: true });
const cases = [];
for (const [caseId, ratio] of [["c1-dc", "1:1"], ["c1-drive", "1:1"], ["c2-dc", "1:1"], ["c2-drive", "1:1"], ["c2-drive", "2:1"], ["c3-mix", "1:1"], ["c3-mix", "2:1"]]) {
  const input = buildLab5ReferenceCase(caseId, ratio);
  const start = performance.now();
  const result = runSimulation(input.circuit, COMPONENT_CATALOG, input.config);
  const measurements = lab5Measurements(result, caseId);
  const milliseconds = performance.now() - start;
  cases.push({ caseId, ratio, ...input, result, measurements, milliseconds });
  console.log(JSON.stringify({ caseId, ratio, milliseconds, dcOut1: result.dc.nodeVoltages.OUT1, halfVpp: measurements.halfVpp.OUT1, tonePeak: measurements.tonePeak }));
}
writeFileSync(resolve(out, "app-results.json"), JSON.stringify({ engine: "actual src/lib/electronics/simulation.ts", numericalMethod: "app educational Ebers-Moll 300 K / backward Euler", mocked: false, cases }, null, 2));
