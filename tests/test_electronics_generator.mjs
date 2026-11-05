import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    if (!dependency.startsWith("./")) throw Error(`Unexpected dependency ${dependency}`);
    return load(dependency.slice(2));
  });
  cache.set(name, module.exports); return module.exports;
}
const { sourceVoltage, sourceSamplingLimits } = load("simulation-source");
const { runSimulation, parseSimulationConfig, defaultSimulationConfig, SimulationError } = load("simulation");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const near = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const source = patch => ({ netId: "IN", waveform: "sine", frequencyHz: 1000, amplitudePeak: 1, offset: 0, phaseDegrees: 0, ...patch });
const divider = { id: "generator-test", title: "Generator divider", description: "", components: [
  { id: "R1", definitionId: "resistor-axial", value: "1 kΩ", pinNets: { 1: "IN", 2: "OUT" } },
  { id: "R2", definitionId: "resistor-axial", value: "1 kΩ", pinNets: { 1: "OUT", 2: "GND" } },
], instruments: [], netNames: { IN: "IN", OUT: "OUT", GND: "GND" }, notes: [], reviewItems: [] };
const config = patch => ({ ...defaultSimulationConfig(divider), source: source(), durationSeconds: 0.001, sampleCount: 1024, acPoints: 2, ...patch });
const reject = (action, pattern) => assert.throws(action, error => error instanceof SimulationError && (!pattern || pattern.test(error.message)));

test("legacy generator waveforms retain phase, offset and symmetric RF/LO behavior", () => {
  for (const waveform of ["sine", "square", "triangle", "dc"]) for (const phaseDegrees of [-180, 0, 90, 180]) {
    const s = source({ waveform, phaseDegrees, amplitudePeak: 0.005, offset: 0.02 });
    for (const t of [0, 0.000123, 0.000249, 0.000701, 0.001501]) {
      const cycle = ((t * 1000 + phaseDegrees / 360) % 1 + 1) % 1;
      const expected = waveform === "dc" ? 0.02 : 0.02 + 0.005 * (waveform === "sine" ? Math.sin(2 * Math.PI * cycle) : waveform === "square" ? cycle < 0.5 ? 1 : -1 : 2 / Math.PI * Math.asin(Math.sin(2 * Math.PI * cycle)));
      near(sourceVoltage(s, t), expected);
      if (waveform === "sine") near(sourceVoltage({ ...s, phaseDegrees: 0 }, t) - s.offset, -(sourceVoltage({ ...s, phaseDegrees: 180 }, t) - s.offset));
    }
  }
  near(sourceVoltage(source({ waveform: "dc", amplitudePeak: 100, offset: 3 }), 5), 3);
});

test("pulse high/low width, duty extremes and sawtooth slope are explicit", () => {
  for (const dutyCyclePercent of [1, 25, 50, 99]) {
    const s = source({ waveform: "pulse", dutyCyclePercent, offset: 2, amplitudePeak: 3 });
    near(sourceVoltage(s, dutyCyclePercent / 100 / 1000 / 2), 5);
    near(sourceVoltage(s, (dutyCyclePercent / 100 + 1) / 2 / 1000), -1);
    near(sourceVoltage({ ...s, phaseDegrees: 180 }, 0.0006), sourceVoltage(s, 0.0001));
  }
  for (const t of [0.0001, 0.0003, 0.0007]) near(sourceVoltage(source({ waveform: "pulse", dutyCyclePercent: 50 }), t), sourceVoltage(source({ waveform: "square" }), t));
  const ramp = source({ waveform: "sawtooth", offset: 2, amplitudePeak: 3 });
  near(sourceVoltage(ramp, 0), -1); near(sourceVoltage(ramp, 0.00025), 0.5); near(sourceVoltage(ramp, 0.00075), 3.5); near(sourceVoltage(ramp, 0.001), -1);
});

test("2023 project AM equation and its 700/1000/1300 Hz spectral amplitudes are reproduced", () => {
  // Supplied 2023 project: 0.01(1+0.2 cos(2π300t))cos(2π1000t).
  // The carrier phase is 90 degrees; the envelope has zero cosine phase.
  const s = source({ waveform: "am", amplitudePeak: 0.01, frequencyHz: 1000, modulationFrequencyHz: 300, modulationDepth: 0.2, phaseDegrees: 90 });
  for (let i = 0; i < 1024; i++) {
    const t = i / 102400;
    near(sourceVoltage(s, t), 0.01 * (1 + 0.2 * Math.cos(2 * Math.PI * 300 * t)) * Math.cos(2 * Math.PI * 1000 * t), 1e-15);
  }
  const amplitude = hz => {
    let re = 0, im = 0;
    for (let i = 0; i < 1024; i++) { const t = i / 102400, value = sourceVoltage(s, t); re += value * Math.cos(2 * Math.PI * hz * t); im += value * Math.sin(2 * Math.PI * hz * t); }
    return 2 * Math.hypot(re, im) / 1024;
  };
  near(amplitude(1000), 0.01, 1e-14); near(amplitude(700), 0.001, 1e-14); near(amplitude(1300), 0.001, 1e-14); near(amplitude(300), 0, 1e-14);
  for (const t of [0, 0.0001, 0.0031]) near(sourceVoltage({ ...s, modulationDepth: 0 }, t), sourceVoltage({ ...s, waveform: "sine" }, t));
});

test("strict JSON boundary validates optional settings without coercion and includes AM envelope voltage", () => {
  const legacy = config(); assert.deepEqual(parseSimulationConfig(legacy), legacy);
  const pulse = parseSimulationConfig(config({ source: source({ waveform: "pulse" }) })).source;
  assert.equal(pulse.dutyCyclePercent, 50);
  const am = parseSimulationConfig(config({ source: source({ waveform: "am" }) })).source;
  assert.equal(am.modulationDepth, 0.2); assert.equal(am.modulationFrequencyHz, 100);
  for (const dutyCyclePercent of [0, 100, NaN, Infinity, "25", null]) reject(() => parseSimulationConfig(config({ source: source({ waveform: "pulse", dutyCyclePercent }) })));
  for (const modulationDepth of [-0.1, 1.1, NaN, "0.2", null]) reject(() => parseSimulationConfig(config({ source: source({ waveform: "am", modulationDepth }) })));
  for (const modulationFrequencyHz of [0, -1, 1e8, NaN, "300", null]) reject(() => parseSimulationConfig(config({ source: source({ waveform: "am", modulationFrequencyHz }) })));
  reject(() => parseSimulationConfig(config({ source: source({ waveform: "am", amplitudePeak: 6000, modulationDepth: 1 }) })), /AM 포락선/);
  reject(() => parseSimulationConfig(config({ source: source({ waveform: "sine", dutyCyclePercent: 0 }) })), /듀티/);
  reject(() => parseSimulationConfig(config({ source: source({ waveform: "arbitrary" }) })));
  reject(() => parseSimulationConfig(config({ source: { ...source(), gain: 4 } })));
  parseSimulationConfig(config({ source: source({ waveform: "am", amplitudePeak: 5000, modulationDepth: 1 }) }));
});

test("AM sideband and narrow pulse sampling limits govern output and internal integration", () => {
  const am = source({ waveform: "am", modulationFrequencyHz: 9000, modulationDepth: 0.2 });
  const limits = sourceSamplingLimits(am);
  near(limits.maximumFrequencyHz, 10000); near(limits.maximumOutputStepSeconds, 1 / 320000); near(limits.maximumInternalStepSeconds, 1 / 1280000);
  near(sourceSamplingLimits({ ...am, modulationDepth: 0 }).maximumFrequencyHz, 1000);
  for (const dutyCyclePercent of [1, 99]) {
    const pulse = source({ waveform: "pulse", dutyCyclePercent });
    const limits = sourceSamplingLimits(pulse);
    near(limits.shortestPulseSeconds, 0.00001); near(limits.maximumOutputStepSeconds, 0.0000025); near(limits.maximumInternalStepSeconds, 0.000000625);
    reject(() => runSimulation(divider, definitions, config({ source: pulse, sampleCount: 256 })), /표본.*4개/);
    const result = runSimulation(divider, definitions, config({ source: pulse }));
    assert.ok(result.nodeVoltages.IN.slice(1).some(v => v > 0)); assert.ok(result.nodeVoltages.IN.slice(1).some(v => v < 0));
    assert.ok(result.warnings.some(text => /무한 고조파/.test(text)));
  }
  reject(() => runSimulation(divider, definitions, config({ source: am, sampleCount: 256 })), /반송파\+변조/);
  assert.equal(runSimulation(divider, definitions, config({ source: am, sampleCount: 512 })).time.length, 512);
  for (const s of [source({ waveform: "dc" }), source({ waveform: "am", amplitudePeak: 0 })]) assert.equal(sourceSamplingLimits(s).maximumInternalStepSeconds, Infinity);
});

test("every new waveform reaches circuit nodes through the same source function, with DC initialization retained", () => {
  for (const waveform of ["pulse", "sawtooth", "am", "dsb"]) {
    const s = source({ waveform, phaseDegrees: 41, dutyCyclePercent: 10, modulationFrequencyHz: 300, modulationDepth: 0.2, amplitudePeak: 0.01, offset: 0.002 });
    const input = config({ source: s }), before = JSON.stringify(input);
    const result = runSimulation(divider, definitions, input);
    near(result.nodeVoltages.IN[0], s.offset); near(result.nodeVoltages.OUT[0], s.offset / 2);
    for (let i = 1; i < result.time.length; i++) {
      near(result.nodeVoltages.IN[i], sourceVoltage(s, result.time[i]), 1e-12);
      near(result.nodeVoltages.OUT[i], sourceVoltage(s, result.time[i]) / 2, 1e-12);
    }
    assert.equal(JSON.stringify(input), before);
  }
});

test("new source settings apply to additional inputs without changing the primary AC excitation", () => {
  const dual = structuredClone(divider); dual.components[1].pinNets[2] = "SECOND";
  dual.components.push({ id: "R3", definitionId: "resistor-axial", value: "1 kΩ", pinNets: { 1: "SECOND", 2: "GND" } });
  const extra = source({ netId: "SECOND", waveform: "am", frequencyHz: 700, modulationFrequencyHz: 300, amplitudePeak: 0.5 });
  const result = runSimulation(dual, definitions, config({ extraSources: [extra] }));
  for (let i = 1; i < result.time.length; i++) near(result.nodeVoltages.OUT[i], (sourceVoltage(source(), result.time[i]) + sourceVoltage(extra, result.time[i])) / 2);
  result.ac.nodeGainMagnitude.OUT.forEach(value => near(value, 0.5));
  reject(() => runSimulation(dual, definitions, config({ extraSources: [{ ...extra, modulationFrequencyHz: 1e6 }] })), /SECOND: 파형 표본/);
});

function component() {
  const module = { exports: {} }, jsx = (type, props) => ({ type, props: props ?? {} });
  const code = ts.transpileModule(readFileSync(new URL("../src/components/electronics/FunctionGenerator.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    if (dependency === "react") return { useMemo: factory => factory() };
    if (dependency === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
    if (dependency.startsWith("@/lib/electronics/")) return load(dependency.split("/").at(-1));
    throw Error(`Unexpected dependency ${dependency}`);
  });
  return module.exports.FunctionGenerator;
}
const Generator = component();
function* walk(node) {
  if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; }
  if (!node || typeof node !== "object" || !node.props) return;
  if (typeof node.type === "function") { yield* walk(node.type(node.props)); return; }
  yield node; yield* walk(node.props.children);
}
const textIn = node => Array.isArray(node) ? node.map(textIn).join("") : node?.props ? textIn(node.props.children) : typeof node === "string" || typeof node === "number" ? String(node) : "";
test("generator controls edit the selected source and preview is explicitly separate from a circuit result", () => {
  const changes = [], s = source({ waveform: "am", phaseDegrees: 90, modulationFrequencyHz: 300 });
  const tree = Generator({ source: s, onChange: patch => changes.push(patch), label: "추가 입력 1" }), nodes = [...walk(tree)];
  assert.match(textIn(tree), /발생기 설정 미리보기/); assert.match(textIn(tree), /회로 결과는 시뮬레이션 실행 후/);
  const field = nodes.find(node => node.type === "label" && textIn(node).startsWith("추가 입력 1 변조 깊이"));
  [...walk(field)].find(node => node.type === "input").props.onChange({ target: { value: "0.7" } });
  assert.deepEqual(changes.pop(), { modulationDepth: 0.7 });
  nodes.find(node => node.type === "select").props.onChange({ target: { value: "pulse" } });
  // Leaving AM drops the AM-only depth (and the modulation frequency pulse never uses) instead of keeping a hidden value.
  assert.deepEqual(changes.pop(), { waveform: "pulse", modulationDepth: undefined, modulationFrequencyHz: undefined });
  assert.equal(nodes.filter(node => node.type === "option").length, 8);
  assert.ok(nodes.some(node => node.type === "path" && !/NaN|Infinity/.test(node.props.d)));
  for (const patch of [{ amplitudePeak: NaN }, { waveform: "pulse", dutyCyclePercent: 0 }, { modulationDepth: 2 }]) {
    const invalid = [...walk(Generator({ source: { ...s, ...patch }, onChange() {} }))];
    assert.ok(invalid.some(node => node.props.role === "alert")); assert.ok(!invalid.some(node => node.type === "path"));
  }
});

test("DSB-SC keeps the two product sidebands while suppressing the carrier through the normal generator path", () => {
  const s = source({ waveform: "dsb", amplitudePeak: 0.01, frequencyHz: 1000, modulationFrequencyHz: 300, phaseDegrees: 90 });
  const parsed = parseSimulationConfig(config({ source: s })).source;
  assert.equal(parsed.waveform, "dsb");
  assert.equal(parsed.modulationFrequencyHz, 300);
  const amplitudes = new Map([700, 1000, 1300].map(hz => [hz, [0, 0]]));
  for (let i = 0; i < 2048; i++) {
    const t = i / 204800;
    const value = sourceVoltage(parsed, t);
    near(value, 0.005 * Math.cos(2 * Math.PI * 700 * t) + 0.005 * Math.cos(2 * Math.PI * 1300 * t), 1e-15);
    for (const [hz, projection] of amplitudes) {
      projection[0] += value * Math.cos(2 * Math.PI * hz * t);
      projection[1] += value * Math.sin(2 * Math.PI * hz * t);
    }
  }
  for (const [hz, projection] of amplitudes) near(2 * Math.hypot(...projection) / 2048, hz === 1000 ? 0 : 0.005, 1e-14);
  near(sourceSamplingLimits(parsed).maximumFrequencyHz, 1300);
  const tree = Generator({ source: s, onChange() {} });
  assert.match(textIn(tree), /DSB-SC/);
  assert.ok(![...walk(tree)].some(node => node.type === "label" && textIn(node).includes("변조 깊이")));
});

test("a stale invalid AM depth cannot block a DSB-SC source whose form has no depth field", () => {
  const changes = [], stale = source({ waveform: "am", modulationDepth: NaN });
  const select = [...walk(Generator({ source: stale, onChange: patch => changes.push(patch) }))].find(node => node.type === "select");
  select.props.onChange({ target: { value: "dsb" } });
  const next = { ...stale, ...changes.pop() };
  assert.equal(next.waveform, "dsb");
  assert.equal(next.modulationDepth, undefined, "the AM-only value is gone");
  assert.equal(next.modulationFrequencyHz, stale.modulationFrequencyHz ?? undefined, "DSB-SC keeps the modulation frequency it shares with AM");
  const shown = [...walk(Generator({ source: next, onChange() {} }))];
  assert.ok(!shown.some(node => node.props.role === "alert"), "no hidden invalid field blocks the run");
  assert.ok(shown.some(node => node.type === "path"), "the preview is drawn");
});

test("a DSB-SC modulation frequency at or above the carrier is called out because the lower sideband folds", () => {
  const warn = frequency => runSimulation(divider, definitions, config({ source: source({ waveform: "dsb", frequencyHz: 1000, modulationFrequencyHz: frequency, amplitudePeak: 0.01 }) })).warnings;
  assert.ok(warn(1000).some(text => /DSB-SC의 변조 주파수가 반송파 이상/.test(text)));
  assert.ok(warn(1500).some(text => /하측파대 fc−fm/.test(text)));
  assert.ok(!warn(300).some(text => /변조 주파수가 반송파 이상/.test(text)));
});
