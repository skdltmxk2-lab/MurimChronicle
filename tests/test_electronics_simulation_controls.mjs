import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} }; cache.set(name, module.exports);
  const js = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", js)(module, module.exports, path => load(path.slice(2)));
  return module.exports;
}
const { parseSimulationAction, parseSimulationContext, applySimulationSettings, SimulationControlError } = load("simulation-controls");
const { deriveSimulationRecommendation, fitSimulationSampling, resolveSimulationProbeHoles, simulationSamplingWarning } = load("simulation-recommendations");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES } = load("templates");
const { createLayout } = load("engine");
const { createSimulationLayoutIndex } = load("simulation-layout");
const { defaultSimulationConfig } = load("simulation");
const { buildLab5ReferenceCircuit } = load("lab5-reference");
const rc = CIRCUIT_TEMPLATES.find(c => c.id === "rc-lowpass");
const clone = value => structuredClone(value);

test("action boundary accepts only known nets, supported fields and finite bounded numbers", () => {
  const action = parseSimulationAction({ kind: "auto_setup", settings: { sourceNetId: "IN", outputNetId: "OUT", frequencyHz: 2000, amplitudePeak: 0.02, waveform: "sine", sampleCount: 1024 }, run: true, resultTab: "spectrum" }, rc);
  assert.equal(action.settings.frequencyHz, 2000); assert.equal(action.run, true);
  for (const raw of [null, { kind: "execute", code: "x" }, { kind: "run", settings: {} }, { kind: "run", run: true }, { kind: "stop", resultTab: "time" }, { kind: "undo", settings: {} }, { kind: "configure" }, { kind: "configure", settings: {} }, { kind: "auto_setup", extra: 1 }, { kind: "auto_setup", run: "true" }, { kind: "run", resultTab: "console" }, { kind: "configure", settings: { sourceNetId: "UNKNOWN" } }, { kind: "configure", settings: { sourceNetId: "GND", groundNetId: "GND" } }, { kind: "configure", settings: { frequencyHz: "1000" } }, { kind: "configure", settings: { amplitudePeak: -1 } }, { kind: "configure", settings: { offset: Infinity } }, { kind: "configure", settings: { sampleCount: 100.5 } }, { kind: "configure", settings: { sampleCount: 4097 } }, { kind: "configure", settings: { duty: 50 } }, JSON.parse('{"kind":"auto_setup","__proto__":{}}')]) assert.throws(() => parseSimulationAction(raw, rc), SimulationControlError, JSON.stringify(raw));
});

test("final patched config preserves other drives and rejects supply/ground collisions", () => {
  const config = defaultSimulationConfig(rc);
  const changed = applySimulationSettings(config, { frequencyHz: 2300, durationSeconds: 0.002 });
  assert.equal(changed.source.frequencyHz, 2300); assert.equal(changed.durationSeconds, 0.002);
  assert.equal(config.source.frequencyHz, 1000);
  assert.throws(() => applySimulationSettings(config, { groundNetId: config.source.netId }));
  const withSupply = { ...config, supplies: [{ netId: "OUT", voltage: 2 }] };
  assert.throws(() => applySimulationSettings(withSupply, { sourceNetId: "OUT" }));
});

test("context validates actual circuit nets and has bounded status text", () => {
  const context = { config: defaultSimulationConfig(rc), probeNetIds: ["IN", "OUT"], status: "complete", message: "계산 완료" };
  assert.equal(parseSimulationContext(context, rc).probeNetIds[1], "OUT");
  for (const raw of [{ ...context, probeNetIds: ["IN"] }, { ...context, probeNetIds: ["IN", "removed"] }, { ...context, status: "success" }, { ...context, message: "x".repeat(801) }, { ...context, config: { ...context.config, supplies: [{ netId: "removed", voltage: 3 }] } }, { ...context, result: {} }]) assert.throws(() => parseSimulationContext(raw, rc), SimulationControlError);
});

function renamedLab() {
  const c = buildLab5ReferenceCircuit(1, "1:1");
  const mapping = Object.fromEntries(Object.keys(c.netNames).map((net, index) => [net, `n${index + 40}`]));
  c.components.forEach(part => { part.pinNets = Object.fromEntries(Object.entries(part.pinNets).map(([pin, net]) => [pin, mapping[net]])); });
  c.netNames = Object.fromEntries(Object.keys(mapping).map(net => [mapping[net], net === "VCC" ? "+9 V" : net === "GND" ? "0 V" : `연결 ${mapping[net]}`]));
  c.id = "arbitrary-import-id";
  c.instruments = [{ id: "a824", instrument: "Function Generator", port: "CH1+", netId: mapping.RF, setting: "Sine wave, 1 kHz, 20 mV peak (40 mVpp), 0 V DC Offset" }, { id: "a825", instrument: "Function Generator", port: "COM", netId: mapping.GND }, { id: "probe-left", instrument: "Oscilloscope", port: "CH1+", netId: mapping.B3 }, { id: "probe-right", instrument: "Oscilloscope", port: "CH2+", netId: mapping.OUT1 }];
  return { c, mapping };
}
test("instrument roles identify arbitrary VIN/VOUT/GND IDs and preserve peak vs pp", () => {
  const { c, mapping } = renamedLab(), r = deriveSimulationRecommendation(c, definitions);
  assert.equal(r.sourceNetId, mapping.RF); assert.equal(r.groundNetId, mapping.GND);
  assert.equal(r.inputNetId, mapping.B3); assert.equal(r.outputNetId, mapping.OUT1);
  assert.equal(r.config.source.amplitudePeak, 0.02); assert.equal(r.config.source.frequencyHz, 1000); assert.equal(r.config.source.offset, 0);
  assert.deepEqual(r.config.supplies, [{ netId: mapping.VCC, voltage: 9 }]);
  assert.ok(r.reasons.some(reason => reason.includes("발생기")));
});

test("terminal topology recommends a coupling-cap input and loaded collector without familiar net IDs", () => {
  const { c, mapping } = renamedLab(); c.instruments = [];
  const r = deriveSimulationRecommendation(c, definitions);
  assert.equal(r.sourceNetId, mapping.RF); assert.equal(r.groundNetId, mapping.GND);
  assert.ok([mapping.OUT1, mapping.OUT2].includes(r.outputNetId));
  assert.equal(r.config.source.amplitudePeak, 0.01); assert.equal(r.config.source.frequencyHz, 1000);
  assert.ok(r.assumptions.some(note => /10 mV.*원자료/.test(note)));
  assert.ok(r.assumptions.some(note => /1 kHz.*원자료/.test(note)));
});

test("mixer automatic setup retains RF as the primary drive and both differential LO sources", () => {
  const mixer = CIRCUIT_TEMPLATES.find(item => item.id === "bjt-mixer");
  const recommendation = deriveSimulationRecommendation(mixer, definitions);
  assert.equal(recommendation.sourceNetId, "RF");
  assert.equal(recommendation.config.source.frequencyHz, 1000);
  assert.deepEqual(recommendation.config.extraSources.map(source => source.netId), ["LO_PLUS", "LO_MINUS"]);
  assert.deepEqual(recommendation.config.extraSources.map(source => source.phaseDegrees), [0, 180]);
  assert.equal(simulationSamplingWarning(recommendation.config), "");
});

test("decimal/scientific SI numbers and peak-to-peak are read completely, not suffix-matched", () => {
  const { c } = renamedLab();
  const settings = [
    [".5 V peak, 1e3 Hz, 1e-3 V offset", 0.5, 1000, 0.001],
    ["10 mV peak-to-peak, 2 kHz, -0.25 V DC offset", 0.005, 2000, -0.25],
    ["20 mV peak (40 mVpp), .5 kHz, 0 V offset", 0.02, 500, 0],
  ];
  for (const [setting, amplitude, frequency, offset] of settings) {
    c.instruments[0].setting = setting;
    const r = deriveSimulationRecommendation(c, definitions);
    assert.equal(r.config.source.amplitudePeak, amplitude, setting); assert.equal(r.config.source.frequencyHz, frequency); assert.equal(r.config.source.offset, offset);
  }
});

test("missing and conflicting source conditions remain explicit educational assumptions", () => {
  const { c } = renamedLab();
  for (const setting of ["이미지에 진폭·주파수 미기재. 예: 20 mV peak, 1 kHz", "10 mV peak 또는 20 mV peak; 1 kHz 또는 2 kHz", "1.2.3 V peak; 1e Hz"]) {
    c.instruments[0].setting = setting;
    const r = deriveSimulationRecommendation(c, definitions);
    assert.equal(r.config.source.amplitudePeak, 0.01); assert.equal(r.config.source.frequencyHz, 1000);
    assert.ok(r.assumptions.some(note => note.includes("교육용 시작값")));
  }
  c.netNames = Object.fromEntries(Object.keys(c.netNames).map(net => [net, "알 수 없는 연결"])); c.instruments = [];
  assert.equal(deriveSimulationRecommendation(c, definitions).config, null, "No arbitrary ground is silently invented");
});

test("automatic probes resolve real validated holes and cannot bypass missing BC109C placements", () => {
  const layout = createLayout(rc, definitions, { boards: 1, railMode: "split" });
  const resolved = resolveSimulationProbeHoles(rc, definitions, layout, ["IN", "OUT"]);
  assert.equal(resolved.blockedReason, ""); assert.ok(resolved.holes.every(Boolean));
  const index = createSimulationLayoutIndex(rc, definitions, layout);
  assert.deepEqual(resolved.holes.map(hole => index.netForHole(hole)), ["IN", "OUT"]);
  const bad = { ...layout, placements: [] };
  assert.ok(resolveSimulationProbeHoles(rc, definitions, bad, ["IN", "OUT"]).blockedReason);
  const lab = buildLab5ReferenceCircuit(1, "1:1"), labLayout = createLayout(lab, definitions, { boards: 1, railMode: "split" });
  const blocked = resolveSimulationProbeHoles(lab, definitions, labLayout, ["RF", "OUT1"]);
  assert.deepEqual(blocked.holes, [null, null]); assert.ok(blocked.blockedReason);
});

test("sampling warnings compare duration and samples to the highest dynamic source", () => {
  const config = defaultSimulationConfig(rc);
  assert.equal(simulationSamplingWarning(config), "");
  assert.match(simulationSamplingWarning({ ...config, extraSources: [{ ...config.source, netId: "OUT", frequencyHz: 1e6 }] }), /샘플이 부족/);
  assert.match(simulationSamplingWarning({ ...config, durationSeconds: 0.0001 }), /두 주기/);
});

test("capture fitting respects AM sidebands and narrow pulses while retaining the configured source", () => {
  const original = defaultSimulationConfig(rc);
  for (const source of [
    { ...original.source, waveform: "sine", frequencyHz: 1e6 },
    { ...original.source, waveform: "am", frequencyHz: 10000, modulationFrequencyHz: 100, modulationDepth: 0.7 },
    { ...original.source, waveform: "pulse", frequencyHz: 1000, dutyCyclePercent: 1 },
  ]) {
    const config = { ...original, source }, before = clone(config);
    const timing = fitSimulationSampling(config);
    assert.deepEqual(config, before);
    const fitted = { ...config, durationSeconds: timing.durationSeconds, sampleCount: timing.sampleCount };
    assert.ok(timing.sampleCount >= 32 && timing.sampleCount <= 4096);
    assert.doesNotMatch(simulationSamplingWarning(fitted), /샘플이 부족/);
    if (source.waveform === "am") assert.match(timing.note, /5주기보다 짧게/);
  }
});

test("capture fitting repairs blank capture fields but rejects invalid source inputs and preserves DC capture settings", () => {
  const config = defaultSimulationConfig(rc);
  const fitted = fitSimulationSampling({ ...config, durationSeconds: NaN, sampleCount: NaN });
  assert.ok(Number.isFinite(fitted.durationSeconds)); assert.ok(Number.isInteger(fitted.sampleCount));
  assert.throws(() => fitSimulationSampling({ ...config, source: { ...config.source, frequencyHz: NaN } }));
  const dc = { ...config, source: { ...config.source, waveform: "dc" }, durationSeconds: 0.02, sampleCount: 4096 };
  assert.equal(fitSimulationSampling(dc).durationSeconds, 0.02); assert.equal(fitSimulationSampling(dc).sampleCount, 4096);
});
