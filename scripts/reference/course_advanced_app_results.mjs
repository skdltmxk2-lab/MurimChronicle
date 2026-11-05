/** Run production project circuits and source equations without substituting solver/model code. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const text = readFileSync(new URL(`../../src/lib/electronics/${name}.ts`, import.meta.url), "utf8");
  const code = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  cache.set(name, module.exports);
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    if (!dependency.startsWith("./")) throw new Error(`Unsupported reference dependency ${dependency}`);
    return load(dependency.slice(2));
  });
  return module.exports;
}

const { COMPONENT_CATALOG } = load("catalog");
const { ADVANCED_ANALOG_CASES, buildAdvancedAnalogCase, measureAdvancedAnalogCase } = load("course-advanced-fixtures");
const { runSimulation } = load("simulation");
const { sourceVoltage } = load("simulation-source");
const output = resolve("tmp/course-advanced-reference");
mkdirSync(output, { recursive: true });
const cases = [];
for (const definition of ADVANCED_ANALOG_CASES) {
  const input = buildAdvancedAnalogCase(definition.id);
  const start = performance.now();
  try {
    const result = runSimulation(input.circuit, COMPONENT_CATALOG, input.config);
    const entry = { ...input, result, metrics: measureAdvancedAnalogCase(definition, result), milliseconds: performance.now() - start };
    cases.push(entry);
    console.log(JSON.stringify({ id: definition.id, status: "executed", milliseconds: entry.milliseconds }));
  } catch (error) {
    cases.push({ ...input, error: error instanceof Error ? error.message : "Unknown analysis error", milliseconds: performance.now() - start });
    console.log(JSON.stringify({ id: definition.id, status: "rejected", error: cases.at(-1).error }));
  }
}
const generatedInputs = [2025, 2023, 2022].map(year => {
  const input = buildAdvancedAnalogCase(`project-${year}-modulated`);
  const time = Array.from({ length: 2000 }, (_, i) => i / 100000);
  try { return { year, time, values: time.map(t => sourceVoltage(input.config.source, t)), source: input.config.source }; }
  catch (error) { return { year, error: error instanceof Error ? error.message : "Input error" }; }
});
writeFileSync(resolve(output, "app-results.json"), JSON.stringify({ engine: "src/lib/electronics/simulation.ts", mocked: false, cases, generatedInputs }));
