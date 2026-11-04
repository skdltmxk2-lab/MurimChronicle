import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const cache = new Map();
function load(name, globals = {}) {
  if (cache.has(name) && !Object.keys(globals).length) return cache.get(name);
  const output = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, { module, exports: module.exports, ...globals, require(dependency) {
    if (!dependency.startsWith("./")) throw Error(`Unexpected dependency ${dependency}`);
    return load(dependency.slice(2));
  } }, { filename: name });
  if (!Object.keys(globals).length) cache.set(name, module.exports);
  return module.exports;
}
const { createLayout } = load("engine");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
const { defaultSimulationConfig } = load("simulation");
const { defaultProbeHoles, resolveSimulationProbes } = load("simulation-probes");
const circuit = templates.find(circuit => circuit.id === "rc-lowpass");
const layout = createLayout(circuit, definitions, { boards: 1, railMode: "split" });
function worker() {
  const messages = [];
  const self = { postMessage(message) { messages.push(message); } };
  load("simulation.worker", { self });
  return { messages, send(data) { self.onmessage({ data }); } };
}

test("default probes resolve the real input and output contacts", () => {
  const holes = defaultProbeHoles(circuit, layout);
  const probes = resolveSimulationProbes(circuit, definitions, layout, holes);
  assert.equal(probes[0].netId, "IN"); assert.equal(probes[1].netId, "OUT");
  assert.equal(probes[0].holeId, holes[0]); assert.equal(probes[1].holeId, holes[1]);
});

test("an isolated, missing, or disconnected probe never silently reads zero volts", () => {
  for (const holes of [[null, "B1:B63"], ["B2:B3", null]]) {
    const probes = resolveSimulationProbes(circuit, definitions, layout, holes);
    assert.ok(probes.every(probe => probe.netId === null));
  }
  const holes = defaultProbeHoles(circuit, layout);
  const broken = { ...layout, jumpers: [] };
  const probes = resolveSimulationProbes(circuit, definitions, broken, holes);
  assert.ok(probes.every(probe => probe.netId === null));
  assert.equal(probes[0].holeId, holes[0], "An edited board keeps physical probe coordinates");
});

test("the worker runs a physically validated circuit and tags its numeric response", () => {
  const h = worker(), config = defaultSimulationConfig(circuit);
  h.send({ type: "run", requestId: 17, input: { circuit, definitions, layout, config } });
  assert.equal(h.messages.length, 1);
  assert.equal(h.messages[0].type, "result", h.messages[0].message);
  assert.equal(h.messages[0].requestId, 17);
  assert.equal(h.messages[0].result.time.length, config.sampleCount);
  assert.ok(h.messages[0].result.nodeVoltages.OUT.every(Number.isFinite));
});

test("the worker refuses broken wiring and unsupported devices instead of returning waveforms", () => {
  const h = worker(), config = defaultSimulationConfig(circuit);
  h.send({ type: "run", requestId: 18, input: { circuit, definitions, layout: { ...layout, jumpers: [] }, config } });
  assert.equal(h.messages[0].type, "error"); assert.equal(h.messages[0].result, undefined);
  const nonlinear = templates.find(circuit => circuit.id === "led-series");
  const nonlinearLayout = createLayout(nonlinear, definitions, { boards: 1, railMode: "split" });
  h.send({ type: "run", requestId: 19, input: { circuit: nonlinear, definitions, layout: nonlinearLayout, config: defaultSimulationConfig(nonlinear) } });
  assert.equal(h.messages[1].type, "error"); assert.equal(h.messages[1].result, undefined);
});

test("unrelated worker messages are ignored and malformed runs return a recoverable error", () => {
  const h = worker();
  h.send({ type: "unknown", requestId: 1 }); h.send({ type: "run", requestId: "1" });
  assert.equal(h.messages.length, 0);
  h.send({ type: "run", requestId: 20, input: null });
  assert.equal(h.messages[0].type, "error"); assert.equal(h.messages[0].requestId, 20);
});
