import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", output)(module, module.exports, dependency => {
    assert.ok(dependency.startsWith("./")); return load(dependency.slice(2));
  });
  cache.set(name, module.exports); return module.exports;
}
const { measureMultimeter, parseMultimeterSettings } = load("simulation-instruments");
const { runSimulation, defaultSimulationConfig } = load("simulation");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Number.isFinite(actual) && Math.abs(actual - expected) <= tolerance, `${actual} should equal ${expected} ± ${tolerance}`);
const part = (id, definitionId, value, a, b) => ({ id, definitionId, value, pinNets: { 1: a, 2: b } });
const resistor = (id, value, a, b) => part(id, "resistor-axial", value, a, b);
const capacitor = (id, value, a, b) => part(id, "capacitor-ceramic", value, a, b);
const diode = (a = "A", k = "K") => part("D1", "diode-1n4148-vishay-do35", "1N4148", a, k);
const circuit = components => ({ id: "meter-fixture", title: "Meter fixture", description: "", components, netNames: {}, instruments: [], notes: [], reviewItems: [] });
const base = circuit([resistor("R1", "1 kΩ", "IN", "GND")]);
const rawCapture = (time, nodeVoltages) => ({ time, nodeVoltages, dc: { nodeVoltages: { IN: 999 }, componentCurrents: {}, sourceCurrents: {} }, model: "linear-ideal", transientMethod: "backward-euler", ac: { frequenciesHz: [], nodeGainMagnitude: {}, nodePhaseDegrees: {} }, warnings: [] });
const volts = (mode = "dc-voltage", overrides = {}) => ({ mode, power: "on", redNetId: "IN", blackNetId: "GND", ...overrides });
const current = (mode = "dc-current", terminal = "1", componentId = "R1", overrides = {}) => ({ mode, power: "on", branch: { componentId, terminal }, ...overrides });
const offline = (mode = "resistance", redNetId = "A", blackNetId = "B", overrides = {}) => ({ mode, power: "off", redNetId, blackNetId, ...overrides });
const measure = (settings, result, input = base, extra = {}) => measureMultimeter({ circuit: input, definitions, settings, result, ...extra });
const ok = reading => { assert.equal(reading.status, "ok", reading.message); return reading; };
const dcConfig = (input, overrides = {}) => ({ ...defaultSimulationConfig(input), sampleCount: 64, acPoints: 2, durationSeconds: 0.001, ...overrides });

test("strict meter settings reject unknown keys, coercion, missing connections and invalid windows", () => {
  const valid = volts("ac-voltage", { startTimeSeconds: 0, endTimeSeconds: 0.01 });
  assert.deepEqual(parseMultimeterSettings(valid), valid);
  for (const bad of [null, [], { ...valid, surprise: true }, { ...valid, mode: "frequency" }, { ...valid, power: true }, { ...valid, redNetId: " IN" },
    { ...valid, startTimeSeconds: "0" }, { ...valid, endTimeSeconds: NaN }, { ...valid, endTimeSeconds: Infinity }, { ...valid, endTimeSeconds: 61 }, { ...valid, startTimeSeconds: 0.1 },
    { mode: "dc-current", power: "on" }, { ...current(), branch: { componentId: "R1", terminal: "1", gain: 1 } },
    { ...offline(), continuityThresholdOhms: -1 }, { ...offline(), continuityThresholdOhms: 1001 }]) {
    assert.throws(() => parseMultimeterSettings(bad));
    assert.equal(measure(bad).status, "invalid");
  }
});

test("DC voltage is time-weighted window mean, distinct from the bias table, with red-minus-black polarity", () => {
  const result = rawCapture([0, 1, 3], { IN: [2, 3, 5], GND: [2, 2, 2] });
  const reading = ok(measure(volts(), result));
  near(reading.value, 1.5); near(reading.statistics.totalRms, Math.sqrt(3));
  near(ok(measure(volts("dc-voltage", { redNetId: "GND", blackNetId: "IN" }), result)).value, -1.5);
  near(ok(measure(volts("dc-voltage", { startTimeSeconds: 0.5, endTimeSeconds: 2.5 }), result)).value, 1.5);
  near(ok(measure(volts("ac-voltage", { startTimeSeconds: 0.5, endTimeSeconds: 2.5 }), result)).value, 2 / Math.sqrt(12));
  assert.match(reading.warnings.join(" "), /입력 임피던스.*무한대/);
});

test("AC true-RMS removes DC and integrates sine and triangle power rather than inferring RMS from peaks", () => {
  const time = Array.from({ length: 4097 }, (_, i) => i / 4096);
  const result = rawCapture(time, { IN: time.map(t => 8 + 3 * Math.sin(2 * Math.PI * t)), GND: time.map(() => 0) });
  near(ok(measure(volts(), result)).value, 8);
  const sine = ok(measure(volts("ac-voltage"), result));
  near(sine.value, 3 / Math.sqrt(2), 5e-7); near(sine.statistics.totalRms, Math.sqrt(64 + 4.5), 5e-7);
  const triangle = rawCapture([0, 0.5, 1], { IN: [-3, 3, -3], GND: [0, 0, 0] });
  near(ok(measure(volts("ac-voltage"), triangle)).value, Math.sqrt(3));
  const offsetTriangle = rawCapture([0, 0.5, 1], { IN: [1e6 - 0.001, 1e6 + 0.001, 1e6 - 0.001], GND: [0, 0, 0] });
  near(ok(measure(volts("ac-voltage"), offsetTriangle)).value, 0.001 / Math.sqrt(3), 1e-10);
});

test("resistor current equals branch voltage/R and changes sign with the selected terminal", () => {
  const result = rawCapture([0, 1, 2], { IN: [0, 4, 0], GND: [1, 1, 1] });
  const positive = ok(measure(current(), result)), negative = ok(measure(current("dc-current", "2"), result));
  near(positive.value, 0.001); near(negative.value, -0.001);
  near(ok(measure(current("ac-current"), result)).value, 0.004 / Math.sqrt(12));
  assert.match(positive.warnings.join(" "), /가상 전류 프로브/);
  assert.match(positive.warnings.join(" "), /burden/);
  assert.equal(measure(current("dc-current", "missing"), result).status, "invalid");
});

test("capacitor current conserves charge and uses interval averages on a nonuniform grid", () => {
  const input = circuit([capacitor("C1", "2 uF", "IN", "GND")]);
  const result = rawCapture([0, 1, 3], { IN: [0, 1, 5], GND: [0, 0, 0] });
  const reading = ok(measure(current("dc-current", "1", "C1"), result, input));
  near(reading.value, 2e-6 * 5 / 3); near(reading.statistics.totalRms, Math.sqrt((4 + 2 * 16) / 3) * 1e-6);
  near(reading.statistics.acRms, Math.sqrt(8 / 9) * 1e-6);
  assert.equal(reading.waveform.interpolation, "step"); assert.deepEqual(reading.waveform.values, [2e-6, 4e-6, 4e-6]);
  near(ok(measure(current("dc-current", "1", "C1", { startTimeSeconds: 0.5, endTimeSeconds: 2 }), result, input)).value, (0.5 * 2e-6 + 4e-6) / 1.5);
  near(ok(measure(current("dc-current", "2", "C1"), result, input)).value, -reading.value);
  assert.match(reading.warnings.join(" "), /구간의 평균 전류/);
  const polarized = circuit([part("C1", "capacitor-electrolytic", "2 uF", "IN", "GND")]);
  near(ok(measure(current("dc-current", "−", "C1"), result, polarized)).value, -reading.value);
});

test("real NPN and MOS captures reconstruct each physical terminal current with correct pin maps and KCL", () => {
  const inputs = [
    [circuit([{ id: "Q1", definitionId: "bjt-2n3904-onsemi-to92", value: "2N3904", pinNets: { 1: "GND", 2: "IN", 3: "OUT" } }, resistor("RC", "1 kΩ", "OUT", "VCC")]), "Q1", 0.65, ["C", "B", "E"]],
    [circuit([{ id: "Q1", definitionId: "mosfet-2n7000ta-onsemi-to92", value: "2N7000TA", pinNets: { 1: "GND", 2: "IN", 3: "OUT" } }, resistor("RD", "1 kΩ", "OUT", "VCC")]), "Q1", 2.6, ["D", "G", "S"]],
  ];
  for (const [input, id, bias, labels] of inputs) {
    const config = dcConfig(input); config.source = { ...config.source, netId: "IN", waveform: "dc", offset: bias, amplitudePeak: 0 };
    const result = runSimulation(input, definitions, config);
    const readings = labels.map(label => ok(measure(current("dc-current", label, id), result, input, { config })));
    labels.forEach((label, i) => near(readings[i].value, result.dc.deviceCurrents[id][label], 1e-11));
    for (let i = 0; i < result.time.length; i++) near(readings.reduce((sum, item) => sum + item.waveform.values[i], 0), 0, 1e-12);
    near(ok(measure(current("dc-current", "1", id), result, input, { config })).value, readings.at(-1).value, 1e-11);
    assert.ok(readings[0].value > 0); assert.ok(readings.at(-1).value < 0);
  }
});

test("diode current is reconstructed from captured junction voltage; unmodeled op-amp currents are unavailable", () => {
  const input = circuit([diode("IN", "GND")]), time = [0, 1, 2], voltage = [0.4, 0.5, 0.6];
  const result = rawCapture(time, { IN: voltage, GND: [0, 0, 0] });
  const a = ok(measure(current("dc-current", "A", "D1"), result, input));
  const k = ok(measure(current("dc-current", "K", "D1"), result, input));
  const vt = 8.617333262145e-5 * 300;
  a.waveform.values.forEach((value, i) => near(value, 2e-9 * Math.expm1(voltage[i] / (1.9 * vt)), 1e-15));
  near(a.value, -k.value);
  const amplifier = structuredClone(templates.find(item => item.id === "ua741-inverting"));
  const opamp = amplifier.components.find(item => item.definitionId === "opamp-ua741cn-st-dip8");
  assert.equal(measure(current("dc-current", "OUT", opamp.id), result, amplifier).status, "unsupported");
});

test("unpowered resistance is solved by an independent test current through parallel, series and bridge networks", () => {
  const input = circuit([
    resistor("R1", "100 Ω", "A", "X"), resistor("R2", "200 Ω", "X", "B"),
    resistor("R3", "200 Ω", "A", "Y"), resistor("R4", "100 Ω", "Y", "B"), resistor("R5", "100 Ω", "X", "Y"),
  ]);
  // With A=1 V, B=0 V, KCL gives X=4/7 and Y=3/7: I=1/140 A.
  near(ok(measure(offline(), undefined, input)).value, 140);
  near(ok(measure(offline("resistance", "B", "A"), undefined, input)).value, 140);
  const shunted = circuit([...input.components, resistor("R6", "140 Ω", "A", "B"), capacitor("C1", "100 uF", "A", "B")]);
  const reading = ok(measure(offline(), undefined, shunted)); near(reading.value, 70); near(reading.testCurrentAmps, 0.001);
  assert.match(reading.warnings.join(" "), /외부 전압원.*개방/);
  const disconnectedActive = circuit([...input.components, diode("Z", "W")]);
  near(ok(measure(offline(), undefined, disconnectedActive)).value, 140);
});

test("continuity uses an explicit inclusive threshold, and no-path/unknown probes never pretend to be zero ohms", () => {
  const input = circuit([resistor("R1", "50 Ω", "A", "B"), capacitor("C1", "1 uF", "B", "C")]);
  assert.equal(ok(measure(offline("continuity"), undefined, input)).continuity, true);
  assert.equal(ok(measure(offline("continuity", "A", "B", { continuityThresholdOhms: 49.9 }), undefined, input)).continuity, false);
  const same = ok(measure(offline("continuity", "A", "A"), undefined, input)); near(same.value, 0); assert.equal(same.continuity, true);
  const open = measure(offline("continuity", "A", "C"), undefined, input); assert.equal(open.status, "open"); assert.equal(open.value, null); assert.equal(open.continuity, false);
  assert.equal(measure(offline("resistance", "UNKNOWN", "UNKNOWN"), undefined, input).status, "open");
});

test("resistance rejects connected active devices and powered tests rather than inventing resistance values", () => {
  const input = circuit([resistor("R1", "1 kΩ", "A", "B"), diode("B", "Z")]);
  assert.equal(measure(offline(), undefined, input).status, "unsupported");
  assert.equal(measure({ ...offline(), power: "on" }, undefined, input).status, "invalid");
  assert.equal(measure({ ...volts(), power: "off" }, rawCapture([0, 1], { IN: [1, 1], GND: [0, 0] })).status, "invalid");
  const badValue = circuit([resistor("R1", "0 Ω", "A", "B")]);
  assert.equal(measure(offline(), undefined, badValue).status, "invalid");
});

test("isolated diode mode solves a 1 mA forward test and explicitly reports reverse/open/unsupported configurations", () => {
  const input = circuit([diode("A", "B")]);
  const reading = ok(measure(offline("diode"), undefined, input));
  near(reading.value, 1.9 * 8.617333262145e-5 * 300 * Math.log1p(0.001 / 2e-9));
  assert.ok(reading.value > 0.64 && reading.value < 0.65); near(reading.testCurrentAmps, 0.001);
  assert.equal(measure(offline("diode", "B", "A"), undefined, input).status, "open");
  assert.equal(measure(offline("diode", "A", "Z"), undefined, input).status, "open");
  assert.equal(measure(offline("diode"), undefined, circuit([...input.components, resistor("R1", "1 kΩ", "B", "C")])).status, "unsupported");
  assert.equal(measure(offline("diode"), undefined, circuit([part("D1", "led-5mm", "red", "A", "B")])).status, "unsupported");
  assert.equal(measure(offline("diode"), undefined, circuit([diode("A", "A")])).status, "open");
});

test("missing, stale, non-finite or out-of-window capture data is refused and inputs stay immutable", () => {
  const result = rawCapture([0, 1], { IN: [1, 2], GND: [0, 0] });
  for (const bad of [undefined, { ...result, time: [0, 0] }, { ...result, time: [0, Infinity] }, { ...result, nodeVoltages: { GND: [0, 0] } }, { ...result, nodeVoltages: { IN: [1], GND: [0, 0] } }, { ...result, nodeVoltages: { IN: [1, NaN], GND: [0, 0] } }]) assert.equal(measure(volts(), bad).status, "invalid");
  assert.equal(measure(volts("dc-voltage", { endTimeSeconds: 2 }), result).status, "invalid");
  assert.equal(measure(volts(), result, base, { config: { sampleCount: 3, durationSeconds: 1 } }).status, "invalid");
  const enormous = rawCapture([0, 1], { IN: [1e300, -1e300], GND: [0, 0] });
  assert.equal(measure(volts("ac-voltage"), enormous).status, "invalid");
  const args = { circuit: structuredClone(base), definitions: structuredClone(definitions), settings: volts(), result: structuredClone(result) };
  const before = JSON.stringify(args); ok(measureMultimeter(args)); assert.equal(JSON.stringify(args), before);
});
