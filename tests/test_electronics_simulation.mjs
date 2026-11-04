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
  new Function("module", "exports", "require", output)(module, module.exports, dependency => {
    if (!dependency.startsWith("./")) throw Error(`Unexpected dependency ${dependency}`);
    return load(dependency.slice(2));
  });
  cache.set(name, module.exports); return module.exports;
}
const { runSimulation, parseSimulationConfig, parseSimulationValue, defaultSimulationConfig, SimulationError } = load("simulation");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
const template = id => structuredClone(templates.find(item => item.id === id));
const part = (id, definitionId, value, a, b) => ({ id, definitionId, value, pinNets: { 1: a, 2: b } });
const resistor = (id, value, a, b) => part(id, "resistor-axial", value, a, b);
const capacitor = (id, value, a, b) => part(id, "capacitor-ceramic", value, a, b);
const circuit = components => ({ id: "fixture", title: "Numerical fixture", description: "", components, instruments: [], netNames: { GND: "GND", IN: "IN", OUT: "OUT" }, notes: [], reviewItems: [] });
const rc = () => circuit([resistor("R1", "1 kΩ", "IN", "OUT"), capacitor("C1", "1 uF", "OUT", "GND")]);
const configFor = input => ({ ...defaultSimulationConfig(input), sampleCount: 256, acPoints: 16 });
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`);
const reject = (action, pattern) => assert.throws(action, error => error instanceof SimulationError && (!pattern || pattern.test(error.message)));

test("SI parsing distinguishes milli/mega and rejects partial, mislabeled or out-of-range values", () => {
  for (const [text, kind, expected] of [["62 kΩ", "resistor", 62000], ["4.7 MOhm", "resistor", 4.7e6], ["1 mΩ", "resistor", 0.001], ["1e3", "resistor", 1000], ["100 nF", "capacitor", 1e-7], ["2.2 µF", "capacitor", 2.2e-6], ["1 μF", "capacitor", 1e-6], ["10 pF", "capacitor", 1e-11]]) near(parseSimulationValue(text, kind), expected, Math.max(1e-18, expected * 1e-12));
  for (const [text, kind] of [["10k garbage", "resistor"], ["0 Ω", "resistor"], ["-1 kΩ", "resistor"], ["NaN", "resistor"], ["Infinity", "capacitor"], ["1e309", "resistor"], ["1e-99 F", "capacitor"], ["1mF", "resistor"], ["10kΩ", "capacitor"], ["4k7", "resistor"]]) reject(() => parseSimulationValue(text, kind));
});

test("strict config validation rejects duplicate drives, ground drives, coercion and unbounded work settings", () => {
  const good = configFor(rc());
  assert.deepEqual(parseSimulationConfig(good), good);
  const variants = [{ ...good, extra: true }, { ...good, sampleCount: "256" }, { ...good, sampleCount: 4097 }, { ...good, sampleCount: 32.5 }, { ...good, acPoints: 513 }, { ...good, durationSeconds: NaN }, { ...good, acStopHz: good.acStartHz / 2 },
    { ...good, source: { ...good.source, netId: good.groundNetId } }, { ...good, supplies: [{ netId: good.source.netId, voltage: 5 }] }, { ...good, supplies: [{ netId: "VCC", voltage: 5 }, { netId: "VCC", voltage: 5 }] }, { ...good, source: { ...good.source, frequencyHz: Infinity } }];
  for (const value of variants) reject(() => parseSimulationConfig(value));
});

test("default settings share explicit generator units, convert Vpp to peak, and never parse trailing prose", () => {
  const lowpass = template("rc-lowpass"), preset = defaultSimulationConfig(lowpass);
  near(preset.source.amplitudePeak, 0.5); near(preset.source.frequencyHz, 1000);
  lowpass.instruments.find(connection => connection.id === "fg-signal").setting = "2 kHz · 20 mV peak";
  const millivolts = defaultSimulationConfig(lowpass);
  near(millivolts.source.amplitudePeak, 0.02); near(millivolts.source.frequencyHz, 2000); near(millivolts.durationSeconds, 0.0025);
  lowpass.instruments.find(connection => connection.id === "fg-signal").setting = "2 kHz · 20 mV peak부터 저진폭 확인";
  near(defaultSimulationConfig(lowpass).source.amplitudePeak, 0.1);
});

test("a divider matches DC voltages, signed resistor/source currents, AC gain, and constant time samples", () => {
  const input = template("divider"), config = configFor(input);
  assert.equal(config.source.netId, "VCC"); assert.equal(config.source.offset, 5); assert.equal(config.supplies.length, 0);
  const result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.OUT, 2.5);
  near(result.dc.componentCurrents.R1, 0.00025); near(result.dc.componentCurrents.R2, 0.00025);
  near(result.dc.sourceCurrents.VCC, -0.00025);
  assert.equal(result.time.length, 256);
  assert.ok(result.nodeVoltages.OUT.every(value => Math.abs(value - 2.5) < 1e-12));
  assert.ok(result.ac.nodeGainMagnitude.OUT.every(value => Math.abs(value - 0.5) < 1e-12));
  assert.ok(result.ac.nodePhaseDegrees.OUT.every(value => value === 0));
  assert.equal(result.model, "linear-ideal"); assert.equal(result.transientMethod, "backward-euler");
});

test("RC step response follows 1-exp(-t/RC) with bounded backward-Euler error and preserves the DC initial condition", () => {
  const input = rc(), config = configFor(input);
  config.source = { ...config.source, waveform: "square", frequencyHz: 10, amplitudePeak: 1, offset: 0 };
  config.durationSeconds = 0.005;
  const before = JSON.stringify({ input, config }), result = runSimulation(input, definitions, config);
  near(result.nodeVoltages.OUT[0], 0); near(result.nodeVoltages.IN[0], 0); near(result.dc.componentCurrents.C1, 0);
  for (let i = 1; i < result.time.length; i++) near(result.nodeVoltages.OUT[i], 1 - Math.exp(-result.time[i] / 0.001), 0.002);
  near(result.nodeVoltages.IN[1], 1);
  assert.equal(JSON.stringify({ input, config }), before, "Numerical analysis must not mutate saved circuit/config");
});

test("RC AC cutoff is exactly -3.0103 dB and -45 degrees, independently of transient amplitude", () => {
  const input = rc(), config = configFor(input), cutoff = 1 / (2 * Math.PI * 1000 * 1e-6);
  config.acStartHz = cutoff; config.acStopHz = cutoff; config.acPoints = 2;
  config.source.amplitudePeak = 2;
  const result = runSimulation(input, definitions, config);
  near(result.ac.nodeGainMagnitude.OUT[0], 1 / Math.sqrt(2));
  near(20 * Math.log10(result.ac.nodeGainMagnitude.OUT[0]), -3.01029995664);
  near(result.ac.nodePhaseDegrees.OUT[0], -45);
  near(result.ac.nodeGainMagnitude.IN[0], 1); near(result.ac.nodeGainMagnitude.GND[0], 0);
});

test("high-pass AC response has positive cutoff phase and zero DC output", () => {
  const input = circuit([capacitor("C1", "1 uF", "IN", "OUT"), resistor("R1", "1 kΩ", "OUT", "GND")]);
  const config = configFor(input); config.source.offset = 3;
  config.acStartHz = config.acStopHz = 1 / (2 * Math.PI * 0.001); config.acPoints = 2;
  const result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.OUT, 0);
  near(result.ac.nodeGainMagnitude.OUT[0], 1 / Math.sqrt(2)); near(result.ac.nodePhaseDegrees.OUT[0], 45);
});

test("sine, square, triangle and DC source samples use documented peak amplitude and offset", () => {
  const input = template("divider");
  for (const waveform of ["sine", "square", "triangle", "dc"]) {
    const config = { ...configFor(input), sampleCount: 1025, durationSeconds: 0.01 };
    config.source = { ...config.source, waveform, frequencyHz: 100, amplitudePeak: 0.5, offset: 1 };
    const result = runSimulation(input, definitions, config);
    near(result.nodeVoltages.VCC[0], 1);
    near(result.nodeVoltages.VCC[256], waveform === "dc" ? 1 : 1.5, 1e-12);
    near(result.nodeVoltages.VCC[768], waveform === "dc" ? 1 : 0.5, 1e-12);
    near(result.nodeVoltages.OUT[256], waveform === "dc" ? 0.5 : 0.75, 1e-12);
  }
});

test("verified UA741 inverting feedback yields ideal -10 gain and reports its model limits", () => {
  const input = template("ua741-inverting"), config = configFor(input);
  config.source.offset = 0.1;
  const result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.OUT, -1);
  near(result.dc.nodeVoltages.SUM, 0);
  near(result.ac.nodeGainMagnitude.OUT[0], 10); near(Math.abs(result.ac.nodePhaseDegrees.OUT[0]), 180);
  for (let i = 0; i < result.time.length; i++) near(result.nodeVoltages.OUT[i], -10 * result.nodeVoltages.IN[i], 1e-8);
  assert.ok(result.warnings.some(message => /슬루율/.test(message)));
  assert.equal(result.nodeVoltages.U1_OPEN_1, undefined, "Isolated offset/NC pins are not falsely reported as zero volts");
});

test("op-amp rail exceed is reported without inventing saturation or clipping", () => {
  const input = template("ua741-inverting"), config = configFor(input);
  config.source = { ...config.source, waveform: "dc", offset: 2, amplitudePeak: 0 };
  const result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.OUT, -20);
  assert.ok(result.warnings.some(message => /전원 레일.*벗어/.test(message)));
});

test("an ideal voltage follower handles direct feedback without treating the input as a load", () => {
  const input = template("ua741-inverting");
  input.components = input.components.filter(component => !["RIN", "RF"].includes(component.id));
  const amplifier = input.components.find(component => component.id === "U1");
  amplifier.pinNets[2] = "OUT"; amplifier.pinNets[3] = "IN";
  const config = configFor(input); config.source.offset = 0.4;
  const result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.OUT, 0.4); near(result.dc.sourceCurrents.IN, 0);
  for (const gain of result.ac.nodeGainMagnitude.OUT) near(gain, 1);
});

test("gigaohm resistors remain a real DC path and electrolytic reverse polarity is disclosed", () => {
  const input = circuit([resistor("R1", "1 GΩ", "IN", "OUT"), resistor("R2", "1 GΩ", "OUT", "GND"), part("C1", "capacitor-electrolytic", "1 nF", "GND", "OUT")]);
  const config = configFor(input); config.source = { ...config.source, waveform: "dc", offset: 2, amplitudePeak: 0 };
  const result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.OUT, 1); near(result.dc.componentCurrents.R1, 1e-9, 1e-18);
  assert.ok(result.warnings.some(message => /C1.*역극성/.test(message)));
});

test("feed-forward amplifier cascades work but a loop through locally stable amplifiers is rejected", () => {
  const amplifier = (id, plus, minus, out) => ({ id, definitionId: "opamp-ua741cn-st-dip8", value: "UA741CN", pinNets: { 2: minus, 3: plus, 4: "VEE", 6: out, 7: "VCC" } });
  const input = circuit([amplifier("U1", "P1", "M1", "O1"), amplifier("U2", "O1", "M2", "O2"),
    resistor("RF1", "10 kΩ", "O1", "M1"), resistor("RG1", "10 kΩ", "M1", "GND"),
    resistor("RF2", "10 kΩ", "O2", "M2"), resistor("RG2", "10 kΩ", "M2", "GND"), resistor("RIN", "10 kΩ", "IN", "P1")]);
  const config = configFor(input); config.source.offset = 0.1;
  const result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.O1, 0.2); near(result.dc.nodeVoltages.O2, 0.4);
  near(result.ac.nodeGainMagnitude.O2[0], 4);
  input.components.push(resistor("GLOBAL_FEEDBACK", "10 kΩ", "O2", "P1"));
  reject(() => runSimulation(input, definitions, config), /순환 피드백/);
});

test("unsupported nonlinear devices, forged pin maps, positive feedback and open-loop amplifiers return errors", () => {
  for (const name of ["led-series", "ce-amplifier", "schmitt-inverting", "schmitt-noninverting", "wien-bridge"]) {
    const input = template(name); reject(() => runSimulation(input, definitions, configFor(input)));
  }
  const input = template("ua741-inverting"), config = configFor(input);
  const changed = structuredClone(definitions); changed.find(definition => definition.id === "opamp-ua741cn-st-dip8").pins[1].label = "IN+";
  reject(() => runSimulation(input, changed, config), /핀맵/);
  input.components = input.components.filter(component => component.id !== "RF");
  reject(() => runSimulation(input, definitions, config), /음의 피드백/);
});

test("floating capacitor-only DC paths and unknown drive/reference nets are rejected rather than grounded silently", () => {
  const floating = circuit([capacitor("C1", "1 uF", "IN", "OUT"), capacitor("C2", "1 uF", "OUT", "GND")]);
  reject(() => runSimulation(floating, definitions, configFor(floating)), /부유|특이/);
  const input = rc(), config = configFor(input);
  reject(() => runSimulation(input, definitions, { ...config, groundNetId: "not-a-net" }), /기준 접지/);
  reject(() => runSimulation(input, definitions, { ...config, source: { ...config.source, netId: "not-a-net" } }), /실제 소자 핀/);
});

test("sample aliasing, fast unresolved RC dynamics and excessive combined solver work are rejected", () => {
  const input = rc(), config = configFor(input);
  reject(() => runSimulation(input, definitions, { ...config, durationSeconds: 1 }), /표본/);
  input.components[1].value = "1 pF";
  reject(() => runSimulation(input, definitions, config), /빠른 RC/);
  const ladder = circuit(Array.from({ length: 80 }, (_, i) => resistor(`R${i}`, "1 kΩ", i === 0 ? "IN" : `N${i}`, i === 79 ? "GND" : `N${i + 1}`)));
  const large = { ...configFor(ladder), sampleCount: 4096, acPoints: 512 };
  reject(() => runSimulation(ladder, definitions, large), /계산량/);
});

test("an 80-resistor ladder preserves its analytic division at scale within the bounded solver budget", context => {
  const input = circuit(Array.from({ length: 80 }, (_, i) => resistor(`R${i}`, "1 kΩ", i === 0 ? "IN" : `N${i}`, i === 79 ? "GND" : `N${i + 1}`)));
  const config = { ...configFor(input), source: { netId: "IN", waveform: "dc", frequencyHz: 1000, amplitudePeak: 0, offset: 8 }, acPoints: 8, sampleCount: 256 };
  const start = performance.now(), result = runSimulation(input, definitions, config);
  near(result.dc.nodeVoltages.N40, 4, 1e-9);
  near(result.dc.componentCurrents.R0, 0.0001, 1e-12);
  near(result.ac.nodeGainMagnitude.N40[0], 0.5, 1e-10);
  assert.ok(Object.values(result.nodeVoltages).flat().every(Number.isFinite));
  context.diagnostic(`80 resistors / 256 time samples / 8 AC frequencies: ${(performance.now() - start).toFixed(1)} ms (reported, not a timing assertion)`);
});
