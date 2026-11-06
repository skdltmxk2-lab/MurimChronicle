import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const cache = new Map();
function load(file) {
  file = path.normalize(file); if (cache.has(file)) return cache.get(file);
  const mod = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (!name.startsWith(".")) throw Error(`Unexpected dependency: ${name}`);
    return load(path.join(path.dirname(file), `${name}.ts`));
  } }, { filename: file });
  cache.set(file, mod.exports); return mod.exports;
}
const engine = load("src/lib/electronics/engine.ts");
const simulation = load("src/lib/electronics/simulation.ts");
const recommendations = load("src/lib/electronics/simulation-recommendations.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { CIRCUIT_TEMPLATES: templates } = load("src/lib/electronics/templates.ts");
const { EXPERIMENTS: experiments, COURSE_SUPPORT_SCOPE: scope } = load("src/lib/electronics/experiments.ts");
const ids = ["discrete-opamp-noninverting", "discrete-opamp-comparator", "discrete-opamp-sallen-key"];
const template = id => { const circuit = templates.find(item => item.id === id); assert.ok(circuit, id); return circuit; };

// Pin-net table of the shared core, written independently of templates.ts.
const CORE = {
  Q1: { C: "C1", B: "INM", E: "E12" }, Q2: { C: "C2", B: "INP", E: "E12" }, Q3: { C: "E12", B: "B3", E: "E3" },
  Q4: { C: "N5", B: "C2", E: "VCC" }, Q5: { C: "VCC", B: "N5", E: "E5" }, Q6: { C: "VEE", B: "N6", E: "E6" },
  D1: { A: "N5", K: "NM" }, D2: { A: "NM", K: "N6" },
};

test("2026 project experiment lists the three discrete op-amp templates and a scope entry", () => {
  const experiment = experiments.find(item => item.id === "project-2026");
  assert.deepEqual(Array.from(experiment.templateIds), ids);
  assert.ok(scope.some(item => item.id === "project-2026"));
  for (const id of ids) template(id);
});

test("core transistor and diode roles match the schematic through the catalog pin labels", () => {
  const defs = new Map(definitions.map(item => [item.id, item]));
  for (const id of ids) {
    const circuit = template(id);
    for (const [ref, roles] of Object.entries(CORE)) {
      const component = circuit.components.find(item => item.id === ref);
      const definition = defs.get(component.definitionId);
      for (const [role, net] of Object.entries(roles)) {
        const pin = definition.pins.find(item => item.label === role || item.label.startsWith(`${role} /`));
        assert.ok(pin, `${ref} ${role}`);
        assert.equal(component.pinNets[pin.id], net, `${id} ${ref}.${role}`);
      }
      if (component.definitionId === "bjt-bc109c-philips-to18") assert.equal(component.physicalProfile, "bc109c-to18-formed-v1");
    }
  }
});

test("every template places on one 830-hole board and passes the connection check in both rail modes", () => {
  for (const id of ids) for (const railMode of ["split", "continuous"]) {
    const circuit = template(id);
    const layout = engine.createLayout(circuit, definitions, { boards: 1, railMode });
    const report = engine.validateLayout(circuit, definitions, layout);
    assert.equal(report.valid, true, `${id} ${railMode}: ${report.issues.filter(i => i.severity === "error").map(i => i.code).join(",")}`);
    const pins = circuit.components.reduce((sum, item) => sum + Object.keys(item.pinNets).length, 0);
    assert.equal(report.checkedPins, pins);
  }
});

test("default configuration opts into the damped fast-RC step policy only for these templates", () => {
  for (const id of ids) assert.equal(simulation.defaultSimulationConfig(template(id)).timeStepPolicy, "damp-fast-rc");
  assert.equal(simulation.defaultSimulationConfig(templates.find(item => item.id === "ce-amplifier")).timeStepPolicy, undefined);
  assert.throws(() => simulation.parseSimulationConfig({ ...simulation.defaultSimulationConfig(template(ids[0])), timeStepPolicy: "fast" }), /시간 간격 정책/);
});

const window = (result, values, start) => values.filter((_, i) => result.time[i] >= start);
const tone = (result, values, frequency, start) => {
  let re = 0, im = 0; const t = result.time, v = values;
  for (let i = 1; i < t.length; i++) if (t[i] >= start) { const dt = t[i] - t[i - 1]; re += v[i] * Math.cos(2 * Math.PI * frequency * t[i]) * dt; im += v[i] * Math.sin(2 * Math.PI * frequency * t[i]) * dt; }
  return 2 * Math.hypot(re, im) / (t.at(-1) - start);
};

test("non-inverting ×11 closes the loop: gain near 1+RF/RG within the educational model", () => {
  const circuit = template("discrete-opamp-noninverting");
  const result = simulation.runSimulation(circuit, definitions, simulation.defaultSimulationConfig(circuit));
  const out = window(result, result.nodeVoltages.OUT, 0.002), input = window(result, result.nodeVoltages.INP, 0.002);
  const gain = (Math.max(...out) - Math.min(...out)) / (Math.max(...input) - Math.min(...input));
  assert.ok(gain > 10.6 && gain < 11.05, `gain ${gain}`);
  assert.ok(Math.abs(result.dc.nodeVoltages.OUT) < 0.3, `offset ${result.dc.nodeVoltages.OUT}`);
  const ac = result.ac.nodeGainMagnitude.OUT, f = result.ac.frequenciesHz;
  assert.ok(Math.abs(ac[0] - 11) < 0.4);
  assert.ok(ac[f.findIndex(x => x >= 1e6)] < 3, "closed-loop gain falls well below 11 by 1 MHz");
  assert.ok(result.warnings.some(text => text.includes("damp-fast-rc")));
});

test("comparator saturates near both rails around the 0.21 V reference", () => {
  const circuit = template("discrete-opamp-comparator");
  const result = simulation.runSimulation(circuit, definitions, simulation.defaultSimulationConfig(circuit));
  const out = window(result, result.nodeVoltages.OUT, 0.001);
  assert.ok(Math.max(...out) > 7.5 && Math.min(...out) < -7.5);
  const reference = result.dc.nodeVoltages.INM;
  assert.ok(Math.abs(reference - 9 * 2 / 84) < 0.01, `reference ${reference}`);
});

test("Sallen-Key low-pass keeps 500 Hz and suppresses 8 kHz", () => {
  const circuit = template("discrete-opamp-sallen-key");
  const result = simulation.runSimulation(circuit, definitions, simulation.defaultSimulationConfig(circuit));
  const low = tone(result, result.nodeVoltages.OUT, 500, 0.002), high = tone(result, result.nodeVoltages.OUT, 8000, 0.002);
  assert.ok(low > 0.42 && low < 0.5, `500 Hz ${low}`);
  assert.ok(high > 0.01 && high < 0.03, `8 kHz ${high}`);
  assert.ok(20 * Math.log10((high / 0.3) / (low / 0.3)) < -25);
});

test("automatic VIN·VOUT setup picks the primary generator input and the op-amp output", () => {
  const expected = { "discrete-opamp-noninverting": "INP", "discrete-opamp-comparator": "INP", "discrete-opamp-sallen-key": "VIN" };
  for (const id of ids) {
    const recommendation = recommendations.deriveSimulationRecommendation(template(id), definitions);
    assert.equal(recommendation.sourceNetId, expected[id], `${id} source`);
    assert.equal(recommendation.inputNetId, expected[id], `${id} VIN`);
    assert.equal(recommendation.outputNetId, "OUT", `${id} VOUT`);
    assert.equal(recommendation.groundNetId, "GND");
    assert.equal(recommendation.config.timeStepPolicy, "damp-fast-rc");
  }
  const lowpass = recommendations.deriveSimulationRecommendation(template("discrete-opamp-sallen-key"), definitions).config;
  assert.equal(lowpass.source.frequencyHz, 500);
  assert.deepEqual(Array.from(lowpass.extraSources, source => `${source.netId}@${source.frequencyHz}`), ["VNOISE@8000"]);
});

test("the recommended Sallen-Key configuration runs and still separates the two tones", () => {
  const circuit = template("discrete-opamp-sallen-key");
  const config = recommendations.deriveSimulationRecommendation(circuit, definitions).config;
  const result = simulation.runSimulation(circuit, definitions, config);
  const start = config.durationSeconds / 2;
  const low = tone(result, result.nodeVoltages.OUT, 500, start), high = tone(result, result.nodeVoltages.OUT, 8000, start);
  assert.ok(low > 0.42 && low < 0.5, `500 Hz ${low}`);
  assert.ok(high > 0.01 && high < 0.03, `8 kHz ${high}`);
});
