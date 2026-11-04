import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", output)(module, module.exports, dependency => load(dependency.slice(2)));
  cache.set(name, module.exports); return module.exports;
}
const { runSimulation, defaultSimulationConfig, parseSimulationConfig, SimulationError } = load("simulation");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
const template = name => structuredClone(templates.find(circuit => circuit.id === name));
const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected} (tolerance ${tolerance})`);
function frequency(result, net = "OUT", start = 0.4) {
  const points = [], values = result.nodeVoltages[net];
  for (let i = Math.ceil(values.length * start); i < values.length; i++) if (values[i - 1] < 0 && values[i] >= 0) points.push(result.time[i - 1] + (result.time[i] - result.time[i - 1]) * -values[i - 1] / (values[i] - values[i - 1]));
  assert.ok(points.length > 3, "Several complete late-time oscillation cycles exist");
  return (points.length - 1) / (points.at(-1) - points[0]);
}

test("dynamic op-amp config is opt-in, bounded, and preserves the legacy ideal model", () => {
  const input = template("ua741-inverting"), config = defaultSimulationConfig(input);
  delete config.opampModel; delete config.startupPerturbationVolts;
  assert.equal(parseSimulationConfig(config).opampModel, "ideal");
  for (const change of [{ opampModel: "manufacturer-spice" }, { startupPerturbationVolts: -0.001 }, { startupPerturbationVolts: 0.011 }]) assert.throws(() => parseSimulationConfig({ ...config, ...change }), SimulationError);
  config.source = { ...config.source, waveform: "dc", offset: 2, amplitudePeak: 0 };
  const ideal = runSimulation(input, definitions, config);
  near(ideal.dc.nodeVoltages.OUT, -20);
  const bounded = runSimulation(input, definitions, { ...config, opampModel: "educational-dynamic" });
  near(bounded.dc.nodeVoltages.OUT, -7.5);
  assert.equal(bounded.model, "nonlinear-educational");
});

test("finite open-loop gain and the dominant pole match the analytic closed-loop transfer", () => {
  const input = template("ua741-inverting"), config = defaultSimulationConfig(input);
  config.opampModel = "educational-dynamic"; config.source = { ...config.source, waveform: "dc", offset: 0.1, amplitudePeak: 0 };
  config.acStartHz = 1000; config.acStopHz = 100000; config.acPoints = 3;
  const result = runSimulation(input, definitions, config), a = 1 + 11 / 200000;
  near(result.dc.nodeVoltages.OUT, -1 / a, 1e-8);
  for (let i = 0; i < result.ac.frequenciesHz.length; i++) {
    const b = 11 * result.ac.frequenciesHz[i] / 1e6;
    near(result.ac.nodeGainMagnitude.OUT[i], 10 / Math.hypot(a, b), 1e-8);
    near(result.ac.nodePhaseDegrees.OUT[i], 180 - Math.atan2(b, a) * 180 / Math.PI, 1e-8);
  }
});

test("slew and rail limits arise from the state equation during a square-wave transition", () => {
  const input = template("ua741-inverting"), config = defaultSimulationConfig(input);
  config.opampModel = "educational-dynamic"; config.durationSeconds = 0.001; config.sampleCount = 1025; config.acPoints = 2;
  config.source = { ...config.source, waveform: "square", amplitudePeak: 1, offset: 0 };
  const result = runSimulation(input, definitions, config), values = result.nodeVoltages.OUT;
  assert.ok(Math.min(...values) <= -7.499); assert.ok(Math.max(...values) >= 7.499);
  for (let i = 1; i < values.length; i++) {
    assert.ok(Math.abs(values[i]) <= 7.500001);
    assert.ok(Math.abs(values[i] - values[i - 1]) / (result.time[i] - result.time[i - 1]) <= 500000.1);
  }
  near(values[1], -500000 * result.time[1], 1e-8);
  assert.ok(result.warnings.some(message => /1.5 V.*headroom/.test(message)));
});

test("Schmitt switching retains hysteresis and refuses a misleading stable AC response", () => {
  const input = template("schmitt-inverting"), config = defaultSimulationConfig(input);
  config.durationSeconds = 0.002; config.sampleCount = 2049; config.acPoints = 2;
  const result = runSimulation(input, definitions, config), output = result.nodeVoltages.OUT, drive = result.nodeVoltages.IN;
  assert.equal(result.ac.frequenciesHz.length, 0); assert.match(result.acUnavailableReason, /안정성/);
  near(drive[512], 0, 1e-9); near(drive[1024], 0, 1e-9);
  assert.ok(output[512] < -7.4 && output[1024] > 7.4, "The same input voltage has different outputs depending on its history");
  const thresholds = [];
  for (let i = 2; i < output.length; i++) if (result.time[i] > 0.0005 && output[i] * output[i - 1] < 0) thresholds.push(Math.abs(drive[i]));
  assert.ok(thresholds.length >= 2);
  assert.ok(thresholds.every(value => value >= 2.49 && value <= 2.9), "The 2.5 V resistor-ratio threshold includes the modeled slew delay");
});

test("the RC relaxation oscillator runs autonomously and its frequency follows the timing capacitor", () => {
  const input = template("relaxation-oscillator"), config = defaultSimulationConfig(input);
  assert.equal(config.source.waveform, "dc"); assert.equal(config.source.amplitudePeak, 0);
  const first = runSimulation(input, definitions, config), f1 = frequency(first), ideal = 1 / (2 * 1000 * 100e-9 * Math.log(2));
  assert.ok(f1 > ideal * 0.65 && f1 < ideal, `${f1} Hz includes finite slew/bandwidth, below the ${ideal} Hz ideal-switch approximation`);
  input.components.find(component => component.id === "CT").value = "200 nF";
  const second = runSimulation(input, definitions, config), ratio = frequency(second) / f1;
  assert.ok(ratio > 0.45 && ratio < 0.65, `Doubling timing capacitance reduces frequency (${ratio})`);
});

test("Wien startup is explicit and deterministic, with sustained late-time oscillation and no external sine drive", () => {
  const input = template("wien-bridge"), config = defaultSimulationConfig(input);
  const result = runSimulation(input, definitions, config), values = result.nodeVoltages.OUT;
  assert.equal(config.source.waveform, "dc"); assert.equal(config.extraSources.length, 0);
  near(values[0], config.startupPerturbationVolts, 1e-10);
  const late = values.slice(Math.floor(values.length * 0.75));
  assert.ok(Math.max(...late) - Math.min(...late) > 5);
  const actual = frequency(result);
  assert.ok(actual > 10000 && actual < 20000, `${actual} Hz is consistent with the 10 kΩ/1 nF Wien network and finite bandwidth`);
  assert.ok(result.warnings.some(message => /결정적 외란/.test(message)));
  const silent = runSimulation(input, definitions, { ...config, startupPerturbationVolts: 0, durationSeconds: 0.0005, sampleCount: 1024 });
  assert.ok(silent.nodeVoltages.OUT.every(value => Math.abs(value) < 1e-12), "No random noise or fabricated sine wave is inserted at an exact zero equilibrium");
});

test("the single-supply UA741 and complementary BJT output stage converge together", () => {
  const input = template("ua741-push-pull"), config = defaultSimulationConfig(input);
  config.acPoints = 8;
  const result = runSimulation(input, definitions, config);
  assert.equal(result.model, "nonlinear-educational");
  assert.ok(Object.values(result.nodeVoltages).flat().every(Number.isFinite));
  assert.ok(result.nodeVoltages.DRIVE.every(value => value >= 1.499999 && value <= 7.500001));
  assert.ok(result.nodeVoltages.OUT.some(value => value > 0.5) && result.nodeVoltages.OUT.some(value => value < -0.5));
  assert.equal(result.ac.frequenciesHz.length, 8);
});
