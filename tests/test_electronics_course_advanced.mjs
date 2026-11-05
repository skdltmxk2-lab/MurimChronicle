import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const source = readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => load(dependency.slice(2)));
  cache.set(name, module.exports);
  return module.exports;
}
const { ADVANCED_ANALOG_CASES, buildAdvancedAnalogCase, measureAdvancedAnalogCase } = load("course-advanced-fixtures");
const { sourceVoltage } = load("simulation-source");
const { runSimulation } = load("simulation");
const { COMPONENT_CATALOG } = load("catalog");
const publishedReport = JSON.parse(readFileSync(new URL("../src/lib/electronics/course-verification-report.json", import.meta.url), "utf8"));
const advancedExperiments = new Set(["lab-6", "lab-7", "lab-8", "lab-9", "lab-10", "project-2022", "project-2023", "project-2024", "project-2025"]);
const report = {
  cases: publishedReport.cases.filter(entry => advancedExperiments.has(entry.experimentId)),
  summary: { mismatch: 13, pass: 29, "reference-missing": 10, blocked: 7 },
};
const near = (actual, reference, tolerance) => assert.ok(Math.abs(actual - reference) <= tolerance, `${actual} vs ${reference}, tolerance ${tolerance}`);

test("ten year-specific cases retain original BC109C circuits and explicit implementation choices", () => {
  assert.equal(ADVANCED_ANALOG_CASES.length, 10);
  for (const definition of ADVANCED_ANALOG_CASES) {
    const { circuit, config } = buildAdvancedAnalogCase(definition.id);
    const parts = Object.fromEntries(circuit.components.map(part => [part.id, part]));
    assert.deepEqual(parts.Q1.pinNets, { 1: "TAIL", 2: "B1", 3: "OUT1" });
    assert.equal(parts.Q1.definitionId, "bjt-bc109c-philips-to18");
    assert.equal(parts.RBB3.value, "82 kΩ");
    assert.equal(parts.RBB4.value, "12 kΩ");
    assert.equal(parts.RB11.value, "62 kΩ");
    assert.equal(parts.CLO1.value, "1 µF");
    assert.match(circuit.notes.join(" "), /구현 선택/);
    assert.match(circuit.notes.join(" "), /수치 계산용/);
    assert.ok(circuit.reviewItems.some(item => !item.resolved));
    assert.equal(config.extraSources[0].amplitudePeak, .005);
    assert.equal(config.extraSources[1].phaseDegrees - config.extraSources[0].phaseDegrees, 180);
    assert.equal(config.extraSources[0].frequencyHz, { 2025: 4000, 2023: 7000, 2022: 5000 }[definition.year]);
  }
  assert.throws(() => buildAdvancedAnalogCase("unknown"));
  for (const value of [NaN, Infinity, 0, -.1, .101]) assert.throws(() => buildAdvancedAnalogCase("project-2025-rf-10mv", value));
});

test("all historical modulation equations use the actual source function with cosine carrier phase", () => {
  for (const year of [2025, 2023, 2022]) {
    const { config } = buildAdvancedAnalogCase(`project-${year}-modulated`);
    const frequency = { 2025: 200, 2023: 300, 2022: 100 }[year];
    for (let sample = 0; sample < 2000; sample++) {
      const time = sample / 100000;
      const modulation = year === 2023 ? 1 + .2 * Math.cos(2 * Math.PI * frequency * time) : Math.cos(2 * Math.PI * frequency * time);
      near(sourceVoltage(config.source, time), .01 * modulation * Math.cos(2 * Math.PI * 1000 * time), 1e-12);
    }
  }
});

test("project measurements independently recover peak and sidebands over the specified complete-cycle window", () => {
  const definition = ADVANCED_ANALOG_CASES.find(item => item.id === "project-2023-modulated");
  const time = Array.from({ length: 15001 }, (_, index) => index / 1000000);
  const output = time.map(t => .2 * Math.cos(2 * Math.PI * 6000 * t) + .02 * Math.cos(2 * Math.PI * 5700 * t) + .03 * Math.cos(2 * Math.PI * 6300 * t));
  const lo = time.map(t => .01 * Math.sin(2 * Math.PI * 7000 * t));
  const result = { time, dc: { nodeVoltages: { OUT1: 6, OUT2: 6, TAIL: 2, B1: 3, B2: 3, B3: 1 } }, nodeVoltages: { OUT1: output, OUT2: time.map(() => 0), B1: lo, B2: time.map(() => 0) } };
  const metrics = measureAdvancedAnalogCase(definition, result);
  near(metrics.if_output_peak_V, .2, 1e-10);
  near(metrics.if_lower_peak_V, .02, 1e-10);
  near(metrics.if_upper_peak_V, .03, 1e-10);
  near(metrics.lo_base_peak_V, .01, 1e-10);
  assert.equal(metrics.dc_OUT1_V, 6);
  assert.throws(() => measureAdvancedAnalogCase(definition, { ...result, time: time.slice(0, 100) }));
});

test("actual project engine matches the independent reduced ngspice reference while full-course differences remain visible", () => {
  const input = buildAdvancedAnalogCase("project-2025-rf-10mv");
  const result = runSimulation(input.circuit, COMPONENT_CATALOG, input.config);
  const metrics = measureAdvancedAnalogCase(input.definition, result);
  const entry = report.cases.find(item => item.id === input.definition.id);
  for (const reference of entry.reducedSolverMetrics) near(metrics[reference.key], reference.reference, reference.tolerance);
  assert.equal(entry.status, "mismatch");
  const gain = entry.metrics.find(item => item.key === "if_gain_V_per_V");
  assert.ok(gain.reference > 15 && gain.reference < 16);
  assert.ok(Math.abs(metrics.if_gain_V_per_V - gain.reference) > gain.tolerance);
  assert.match(gain.basis, /전체모델/);
});

test("public audit statuses follow independent comparisons and bounded generated waveform data", () => {
  assert.equal(new Set(report.cases.map(item => item.id)).size, report.cases.length);
  const totals = {};
  for (const entry of report.cases) {
    totals[entry.status] = (totals[entry.status] ?? 0) + 1;
    const compared = entry.metrics.filter(metric => Number.isFinite(metric.reference) && Number.isFinite(metric.tolerance));
    if (entry.status === "pass") {
      assert.ok(compared.length > 0, entry.id);
      assert.ok(compared.every(metric => Math.abs(metric.value - metric.reference) <= metric.tolerance), entry.id);
    }
    if (entry.status === "mismatch") assert.ok(compared.some(metric => Math.abs(metric.value - metric.reference) > metric.tolerance), entry.id);
    for (const source of entry.sources) assert.ok(typeof source.label === "string" && !/[\\/]/.test(source.label), `${entry.id} has a private source path`);
    if (entry.waveform) {
      assert.ok(entry.waveform.time.length <= 1024);
      assert.ok(entry.waveform.time.every(Number.isFinite));
      for (const series of entry.waveform.series) {
        assert.equal(series.values.length, entry.waveform.time.length);
        assert.ok(series.values.every(Number.isFinite));
      }
      assert.ok(!entry.id.includes("historical"), "Captured audio stays outside public previews");
    }
  }
  assert.deepEqual(totals, report.summary);
});
