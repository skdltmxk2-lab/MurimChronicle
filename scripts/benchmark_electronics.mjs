// CPU benchmark only: this does not measure browser painting or Gemini latency.
// node scripts/benchmark_electronics.mjs [--baseline <commit SHA>]
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import assert from "node:assert/strict";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const baseline = process.argv.includes("--baseline") ? process.argv[process.argv.indexOf("--baseline") + 1] : null;
if (process.argv.includes("--baseline") && !/^[a-f0-9]{7,40}$/i.test(baseline || "")) throw new Error("Provide a commit SHA after --baseline.");
function load(name, dependencies = {}, commit = null) {
  const file = `src/lib/electronics/${name}.ts`;
  const source = commit ? execFileSync("git", ["-c", `safe.directory=${root.replaceAll("\\", "/").replace(/\/$/, "")}`, "show", `${commit}:${file}`], { cwd: root, encoding: "utf8" }) : readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function("module", "exports", "require", compiled)(module, module.exports, name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency ${name}`);
    return dependencies[name];
  });
  return module.exports;
}
function implementation(commit) {
  const power = load("power", {}, commit);
  return { ...load("engine", { "./power": power }, commit), ...power };
}
const current = implementation(null), previous = baseline && implementation(baseline);
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
function synthetic(count, definitionId = "resistor-axial") {
  const components = Array.from({ length: count }, (_, i) => ({ id: `R${i + 1}`, definitionId, value: "10k", pinNets: { 1: i % 2 ? "BUS" : "VCC", 2: i % 3 ? `N${i}` : "GND" } }));
  return { id: `benchmark-${count}-${definitionId}`, title: "Benchmark", description: "",
    components, netNames: Object.fromEntries(components.flatMap(c => Object.values(c.pinNets)).map(net => [net, net])),
    instruments: ["VCC", "GND", "BUS"].map(netId => ({ id: netId, instrument: "bench", port: netId, netId })), notes: [], reviewItems: [] };
}
const cases = [...templates, synthetic(40), synthetic(80, "capacitor-ceramic"), synthetic(80)];
const options = { boards: 2, railMode: "split" };
const median = times => times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
function measure(impl, circuit) {
  const layout = impl.createLayout(circuit, definitions, options);
  const result = { layout, report: impl.validateLayout(circuit, definitions, layout), rails: impl.getRailUsage(circuit, layout) };
  const samples = { placement: [], validation: [], rails: [] };
  for (let round = -3; round < 7; round++) {
    for (const [name, run] of Object.entries({ placement: () => impl.createLayout(circuit, definitions, options), validation: () => impl.validateLayout(circuit, definitions, layout), rails: () => impl.getRailUsage(circuit, layout) })) {
      const start = performance.now(); const output = run(); const elapsed = performance.now() - start;
      if (round >= 0) samples[name].push(elapsed);
      if (name === "placement") assert.deepEqual(output, layout, `${circuit.id}: deterministic placement`);
    }
  }
  return { result, times: Object.fromEntries(Object.entries(samples).map(([name, values]) => [name, +median(values).toFixed(2)])) };
}
const rows = cases.map(circuit => {
  const before = previous && measure(previous, circuit), after = measure(current, circuit);
  if (before) assert.deepEqual(after.result, before.result, `${circuit.id}: placement, validation and rails remain unchanged`);
  return { circuit: circuit.id, parts: circuit.components.length, placed: after.result.layout.placements.length, valid: after.result.report.valid,
    ...(before && { beforeMs: before.times.placement }), placementMs: after.times.placement, validationMs: after.times.validation, railsMs: after.times.rails };
});
console.log("2 boards, split rails; 3 warmups then median of 7 runs. Milliseconds, local Node CPU only.");
if (previous) console.log("All 19 baseline placements, reports and rail-usage results match.");
console.table(rows);
