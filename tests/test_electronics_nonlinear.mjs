import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
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
const resistor = (id, value, a, b) => ({ id, definitionId: "resistor-axial", value, pinNets: { 1: a, 2: b } });
const circuit = components => ({ id: "nonlinear-test", title: "Nonlinear fixture", description: "", components, instruments: [], netNames: { GND: "GND", VCC: "+5 V", IN: "IN", OUT: "OUT" }, notes: [], reviewItems: [] });
const configFor = input => ({ ...defaultSimulationConfig(input), sampleCount: 257, acPoints: 8, durationSeconds: 0.001 });
const near = (actual, expected, absolute = 1e-8) => assert.ok(Math.abs(actual - expected) <= absolute, `${actual} != ${expected} (tolerance ${absolute})`);
const bjt = (pnp = false) => circuit([
  { id: "Q1", definitionId: pnp ? "bjt-bc556b-onsemi-to92" : "bjt-bc549c-onsemi-to92", value: pnp ? "BC556B" : "BC549C", pinNets: { 1: "OUT", 2: "IN", 3: pnp ? "VCC" : "GND" } },
  resistor("RC", "1 kΩ", "OUT", pnp ? "GND" : "VCC"),
]);
const mos = () => circuit([
  { id: "M1", definitionId: "mosfet-2n7000ta-onsemi-to92", value: "2N7000TA", pinNets: { 1: "GND", 2: "IN", 3: "OUT" } }, resistor("RD", "1 kΩ", "OUT", "VCC"),
]);

test("legacy config stays compatible while phased extra sources are strictly bounded and isolated", () => {
  const input = circuit([resistor("R1", "1 kΩ", "IN", "GND")]), config = configFor(input);
  delete config.extraSources; delete config.source.phaseDegrees;
  const parsed = parseSimulationConfig(config);
  assert.equal(parsed.source.phaseDegrees, 0); assert.equal(parsed.extraSources.length, 0);
  for (const value of [{ ...config, extraSources: Array(4).fill(config.source) }, { ...config, extraSources: [{ ...config.source, netId: "IN" }] }, { ...config, extraSources: [{ ...config.source, netId: "GND" }] }, { ...config, source: { ...config.source, phaseDegrees: Infinity } }]) assert.throws(() => parseSimulationConfig(value), SimulationError);
});

test("multiple phase-controlled sources preserve Kirchhoff sums and only the primary source excites AC", () => {
  const input = circuit([resistor("R1", "1 kΩ", "IN", "OUT"), resistor("R2", "1 kΩ", "IN2", "OUT"), resistor("RG", "1 kΩ", "OUT", "GND")]);
  const config = configFor(input); config.source = { ...config.source, amplitudePeak: 1, offset: 0, phaseDegrees: 0 };
  config.extraSources = [{ ...config.source, netId: "IN2", phaseDegrees: 180 }];
  const result = runSimulation(input, definitions, config);
  assert.equal(result.model, "linear-ideal");
  result.time.forEach((_, i) => near(result.nodeVoltages.OUT[i], 0));
  for (const gain of result.ac.nodeGainMagnitude.OUT) near(gain, 1 / 3);
  for (const gain of result.ac.nodeGainMagnitude.IN2) near(gain, 0);
});

test("NPN and PNP operating points conserve terminal currents and have the expected current polarity and beta", () => {
  for (const pnp of [false, true]) {
    const input = bjt(pnp), config = configFor(input);
    config.source = { ...config.source, waveform: "dc", offset: pnp ? 4.35 : 0.65, amplitudePeak: 0 };
    const result = runSimulation(input, definitions, config), currents = result.dc.deviceCurrents.Q1;
    assert.equal(result.model, "nonlinear-educational");
    near(currents.C + currents.B + currents.E, 0, 1e-12);
    assert.ok(pnp ? currents.C < 0 && currents.B < 0 && currents.E > 0 : currents.C > 0 && currents.B > 0 && currents.E < 0);
    near(currents.C / currents.B, pnp ? 306.5 : 493.2, 0.02);
    const out = result.dc.nodeVoltages.OUT;
    near(currents.C + (out - (pnp ? 0 : 5)) / 1000, 0, 1e-10);
    assert.ok(out > 0 && out < 5);
    assert.equal(result.dc.componentCurrents.Q1, undefined, "BJT currents must not be mislabeled as pin1-to-pin2 resistor current");
  }
});

test("bias-Jacobian BJT and MOS AC gains agree with independently perturbed DC operating points", () => {
  for (const [input, bias, id, pin] of [[bjt(), 0.65, "Q1", "C"], [bjt(true), 4.35, "Q1", "C"], [mos(), 2.6, "M1", "D"]]) {
    const config = configFor(input); config.source = { ...config.source, waveform: "dc", offset: bias, amplitudePeak: 0 };
    const center = runSimulation(input, definitions, config);
    const up = runSimulation(input, definitions, { ...config, source: { ...config.source, offset: bias + 1e-5 } });
    const down = runSimulation(input, definitions, { ...config, source: { ...config.source, offset: bias - 1e-5 } });
    const derivative = (up.dc.nodeVoltages.OUT - down.dc.nodeVoltages.OUT) / 2e-5;
    assert.ok(derivative < 0, `${id} common-emitter/source gain is inverted`);
    near(center.ac.nodeGainMagnitude.OUT[0], -derivative, Math.abs(derivative) * 0.002 + 1e-5);
    near(Math.abs(center.ac.nodePhaseDegrees.OUT[0]), 180, 1e-6);
    assert.ok(Number.isFinite(center.dc.deviceCurrents[id][pin]));
  }
});

test("MOS square-law saturation current and KCL agree with the documented reduced educational model", () => {
  const input = mos(), config = configFor(input); config.source = { ...config.source, waveform: "dc", offset: 2.6, amplitudePeak: 0 };
  const result = runSimulation(input, definitions, config), voltage = result.dc.nodeVoltages.OUT, current = result.dc.deviceCurrents.M1.D;
  assert.ok(voltage > 2.6 - 2.474, "Fixture operates in the saturation region");
  const analytic = 0.5 * 0.296 * (2.6 - 2.474) ** 2 * (1 + 0.000267 * voltage);
  near(current, analytic, 1e-9);
  near(current + (voltage - 5) / 1000, 0, 1e-10);
  near(result.dc.deviceCurrents.M1.G, 0, 1e-18);
});

test("large BJT excitation produces physical cutoff/saturation instead of an unclipped linear-gain waveform", () => {
  const input = bjt(), config = configFor(input); config.source = { ...config.source, waveform: "sine", offset: 0.65, amplitudePeak: 0.2 };
  const result = runSimulation(input, definitions, config), values = result.nodeVoltages.OUT;
  assert.ok(Math.min(...values) < 0.3); assert.ok(Math.max(...values) > 4.9);
  assert.ok(values.every(value => value > -0.1 && value < 5.001));
  assert.ok(result.warnings.some(message => /교육용/.test(message)));
});

test("a floating MOS gate is rejected even when zero bias initially satisfies KCL", () => {
  const floating = mos(); floating.components[0].pinNets[2] = "FLOAT";
  const config = configFor(floating); config.source = { ...config.source, netId: "VCC", waveform: "dc", offset: 5, amplitudePeak: 0 }; config.supplies = [];
  assert.throws(() => runSimulation(floating, definitions, config), SimulationError);
});

test("Newton exponential trial continuation is never accepted as a physical diode result", () => {
  const input = circuit([{ id: "D1", definitionId: "diode-1n4148-vishay-do35", value: "1N4148", pinNets: { 1: "IN", 2: "GND" } }]);
  const config = configFor(input); config.source = { ...config.source, waveform: "dc", offset: 2.2, amplitudePeak: 0 };
  assert.throws(() => runSimulation(input, definitions, config), error => error instanceof SimulationError && /범위|접선|지수/.test(error.message));
});

test("cross-coupled transistor latch equilibria are not presented as stable operating waveforms", () => {
  const transistor = (id, collector, base) => ({ id, definitionId: "bjt-bc549c-onsemi-to92", value: "BC549C", pinNets: { 1: collector, 2: base, 3: "GND" } });
  const input = circuit([transistor("Q1", "C1", "B1"), transistor("Q2", "C2", "B2"), resistor("RC1", "10 kΩ", "VCC", "C1"), resistor("RC2", "10 kΩ", "VCC", "C2"), resistor("RB1", "100 kΩ", "C2", "B1"), resistor("RB2", "100 kΩ", "C1", "B2")]);
  const config = configFor(input);
  assert.throws(() => runSimulation(input, definitions, config), error => error instanceof SimulationError && /순환 피드백/.test(error.message));
});

test("course CE, CE+CC, push-pull, current mirror, differential pair and mixer examples produce bounded finite results", context => {
  const start = performance.now();
  for (const name of ["ce-amplifier", "ce-cc-amplifier", "push-pull-stage", "mos-current-mirror", "mos-differential", "bjt-mixer"]) {
    const input = templates.find(circuit => circuit.id === name), config = defaultSimulationConfig(input);
    config.sampleCount = 1024; config.acPoints = 12;
    const result = runSimulation(input, definitions, config);
    assert.equal(result.model, "nonlinear-educational", name);
    assert.ok(Object.values(result.nodeVoltages).flat().every(Number.isFinite), name);
    if (name === "bjt-mixer") {
      assert.equal(config.source.netId, "RF"); assert.equal(config.extraSources.length, 2);
      result.time.slice(1).forEach((_, i) => near(result.nodeVoltages.LO_PLUS[i + 1], -result.nodeVoltages.LO_MINUS[i + 1], 1e-9));
    }
    if (name === "mos-current-mirror") assert.ok(result.warnings.some(message => /3 V.*시작 설정/.test(message)));
  }
  context.diagnostic(`Six nonlinear course examples: ${(performance.now() - start).toFixed(1)} ms (informational)`);
});

test("CE+CC clipping transitions converge through smaller BE steps without changing the requested output grid", () => {
  const input = templates.find(circuit => circuit.id === "ce-cc-amplifier"), config = defaultSimulationConfig(input);
  config.source = { ...config.source, waveform: "sine", amplitudePeak: 0.025, frequencyHz: 1000 };
  config.durationSeconds = 0.003; config.sampleCount = 256; config.acStartHz = config.acStopHz = 1000; config.acPoints = 2;
  const result = runSimulation(input, definitions, config);
  assert.equal(result.time.length, 256); near(result.time.at(-1), 0.003);
  assert.ok(result.nodeVoltages.OUT.every(Number.isFinite));
  assert.ok(Math.max(...result.nodeVoltages.COLLECTOR) - Math.min(...result.nodeVoltages.COLLECTOR) > 1);
});
