import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const compiled = new Map(), libraries = new Map();
function source(name) {
  if (!compiled.has(name)) compiled.set(name, ts.transpileModule(readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8"), {
    fileName: name,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText.replaceAll("import.meta.url", JSON.stringify(new URL(`../src/${name}`, import.meta.url).href)));
  return compiled.get(name);
}
function library(name) {
  if (libraries.has(name)) return libraries.get(name);
  const module = { exports: {} };
  vm.runInNewContext(source(`lib/electronics/${name}.ts`), { module, exports: module.exports, require: dependency => library(dependency.replace("./", "")) });
  libraries.set(name, module.exports);
  return module.exports;
}
const { COMPONENT_CATALOG: definitions } = library("catalog");
const { CIRCUIT_TEMPLATES } = library("templates");
const { createLayout } = library("engine");
const { runSimulation } = library("simulation");
const { resolveSimulationProbes } = library("simulation-probes");
const circuit = CIRCUIT_TEMPLATES.find(item => item.id === "rc-lowpass");
const layout = createLayout(circuit, definitions, { boards: 1, railMode: "split" });
const resistor = layout.placements.find(item => item.componentId === "R1");
const probes = [{ holeId: resistor.pins[1], netId: "IN" }, { holeId: resistor.pins[2], netId: "OUT" }];
const serial = value => JSON.stringify(value);
const walk = function* (node) {
  if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; }
  if (!node || typeof node !== "object" || !node.props) return;
  yield node; yield* walk(node.props.children);
};
const textIn = node => Array.isArray(node) ? node.map(textIn).join("") : node && typeof node === "object" && node.props ? textIn(node.props.children) : typeof node === "string" || typeof node === "number" ? String(node) : "";
const select = (tree, predicate) => { const node = [...walk(tree)].find(predicate); assert.ok(node, "Expected rendered element exists"); return node; };
const paths = tree => [...walk(tree)].filter(node => node.type === "path" && node.props.vectorEffect === "non-scaling-stroke");

// Execute the real TSX handlers and child components. The harness replaces only
// React scheduling, browser worker transport, timers and the download boundary.
// Actual numerical results come from the real simulation engine below.
function harness(overrides = {}) {
  const frames = new Map(), effects = [], timers = new Map(), workers = [], downloads = [], blobs = new Map();
  let active, dirty = true, tree, timerId = 0, urlId = 0, uiId = 0;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    memo(fn) { return fn; },
    useId() { const index = active.cursor++; return (active.slots[index] ??= { value: `ui-${++uiId}` }).value; },
    useState(initial) {
      const frame = active, index = frame.cursor++;
      if (!frame.slots[index]) frame.slots[index] = { value: typeof initial === "function" ? initial() : initial };
      const slot = frame.slots[index];
      slot.set ??= value => { const next = typeof value === "function" ? value(slot.value) : value; if (!Object.is(slot.value, next)) { slot.value = next; dirty = true; } };
      return [slot.value, slot.set];
    },
    useRef(initial) { const index = active.cursor++; return active.slots[index] ??= { current: initial }; },
    useMemo(factory, deps) { const index = active.cursor++, previous = active.slots[index]; if (!previous || !same(previous.deps, deps)) active.slots[index] = { value: factory(), deps }; return active.slots[index].value; },
    useEffect(effect, deps) { const frame = active, index = frame.cursor++, previous = frame.slots[index]; if (!previous || !same(previous.deps, deps)) { const slot = { deps, cleanup: previous?.cleanup }; frame.slots[index] = slot; effects.push(() => { slot.cleanup?.(); slot.cleanup = effect(); }); } },
  };
  class MockWorker {
    constructor(url) { this.url = String(url); this.messages = []; this.terminated = false; workers.push(this); }
    postMessage(message) { this.messages.push(structuredClone(message)); }
    terminate() { this.terminated = true; }
    emit(message) { this.onmessage?.({ data: message }); }
  }
  class DownloadURL extends URL {
    static createObjectURL(blob) { const url = `blob:simulation-${++urlId}`; blobs.set(url, blob); return url; }
    static revokeObjectURL(url) { blobs.delete(url); }
  }
  const jsx = (type, props, key) => ({ type, props: props || {}, key });
  function componentModule(filename) {
  const module = { exports: {} };
  vm.runInNewContext(source(`components/electronics/${filename}.tsx`), {
    module, exports: module.exports, Worker: MockWorker, URL: DownloadURL, Blob, structuredClone,
    setTimeout(callback, delay) { const id = ++timerId; timers.set(id, { callback, delay }); return id; }, clearTimeout(id) { timers.delete(id); },
    document: { body: { appendChild() {} }, createElement() { return { click() { downloads.push({ filename: this.download, blob: blobs.get(this.href) }); }, remove() {} }; } },
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "test-fragment" };
      if (name.endsWith(".css")) return {};
      if (name.startsWith("./")) return componentModule(name.slice(2));
      if (name.startsWith("@/lib/electronics/")) return library(name.split("/").at(-1));
      throw Error(`Unexpected module ${name}`);
    },
  }, { filename: `${filename}.tsx` });
  return module.exports;
  }
  const module = { exports: componentModule("SimulationPanel") };
  let props = { circuit, layout, definitions, probes, onPickProbe() {}, onClearProbe() {}, pickingChannel: null, ...overrides };
  function component(fn, props, path) {
    const previous = active;
    active = frames.get(path) || { slots: [], cursor: 0 }; active.cursor = 0; frames.set(path, active);
    const output = fn(props); active = previous;
    return expand(output, path);
  }
  function expand(node, path) {
    if (Array.isArray(node)) return node.map((child, index) => expand(child, `${path}/${child?.key ?? index}`));
    if (!node || typeof node !== "object" || !node.props) return node;
    if (typeof node.type === "function") return component(node.type, node.props, `${path}/${node.type.name}`);
    const result = { ...node, props: { ...node.props, children: expand(node.props.children, `${path}/children`) } };
    if (result.props.ref) result.props.ref.current = { getBoundingClientRect: () => ({ width: 760, height: 270, left: 0, top: 0 }) };
    return result;
  }
  function flush(runEffects = true) {
    for (let count = 0; dirty || (runEffects && effects.length); count++) {
      assert.ok(count < 20, "React updates settle");
      if (dirty) { dirty = false; tree = component(module.exports.SimulationPanel, props, "root"); }
      if (!runEffects) break;
      for (const effect of effects.splice(0)) effect();
    }
    return tree;
  }
  const button = label => select(tree, node => node.type === "button" && textIn(node).trim().startsWith(label));
  flush();
  return {
    workers, timers, downloads, flush, button,
    wireProbeUpdates() { props = { ...props, onSetProbeHoles(holes) { props = { ...props, probes: resolveSimulationProbes(props.circuit, props.definitions, props.layout, holes) }; dirty = true; } }; dirty = true; flush(); },
    get tree() { return tree; }, get props() { return props; },
    click(label) { button(label).props.onClick(); return flush(); },
    numeric(label, value, runEffects = true) { const field = select(tree, node => node.type === "label" && node.props.className === "el-sim-field" && textIn(node).startsWith(label)); select(field, node => node.type === "input").props.onChange({ target: { value: String(value) } }); return flush(runEffects); },
    update(changes, runEffects = true) { props = { ...props, ...changes }; dirty = true; return flush(runEffects); },
    run() { this.click("시뮬레이션 실행"); return workers.at(-1); },
    complete(worker = workers.at(-1), result) { const request = worker.messages[0]; result ??= runSimulation(request.input.circuit, request.input.definitions, request.input.config); worker.emit({ type: "result", requestId: request.requestId, result }); flush(); return result; },
    timeout() { const entry = [...timers].find(([, timer]) => timer.delay === 20000); assert.ok(entry, "A 20-second calculation timeout exists"); timers.delete(entry[0]); entry[1].callback(); flush(); },
    unmount() { for (const frame of frames.values()) for (const slot of frame.slots) slot?.cleanup?.(); },
  };
}

test("assistant auto setup applies new config and actual probe holes before one run, then undo restores both", () => {
  const reports = [], contexts = [];
  const h = harness({ probes: [{ holeId: null, netId: null }, { holeId: null, netId: null }], onControlResult(id, message) { reports.push({ id, message }); }, onContextChange(context) { contexts.push(context); } });
  h.wireProbeUpdates();
  const before = structuredClone(contexts.at(-1));
  const action = { kind: "auto_setup", settings: { frequencyHz: 2000, amplitudePeak: 0.02, durationSeconds: 0.002, sampleCount: 256 }, run: true, resultTab: "time" };
  h.update({ controlRequest: { id: 1, action } });
  assert.equal(h.workers.length, 1);
  const request = h.workers[0].messages[0];
  assert.equal(request.input.config.source.frequencyHz, 2000); assert.equal(request.input.config.source.amplitudePeak, 0.02);
  assert.equal(request.input.config.sampleCount, 256); assert.equal(request.input.config.durationSeconds, 0.002);
  assert.equal(serial(h.props.probes.map(probe => probe.netId)), serial(["IN", "OUT"]));
  assert.equal(reports.length, 1); assert.match(reports[0].message, /계산을 시작/);
  h.update({ controlRequest: { id: 1, action: { kind: "run" } } });
  assert.equal(h.workers.length, 1, "Same id is never consumed twice");
  h.complete(); h.update({ controlRequest: { id: 2, action: { kind: "undo" } } });
  assert.equal(contexts.at(-1).config.source.amplitudePeak, before.config.source.amplitudePeak);
  assert.equal(serial(h.props.probes.map(probe => probe.holeId)), serial([null, null]));
  assert.equal(h.button("설정 되돌리기").props.disabled, true);
});

test("direct setting changes invalidate undo and invalid input clears chat context", () => {
  const contexts = [];
  const h = harness({ onContextChange(value) { contexts.push(value); } }); h.wireProbeUpdates();
  h.click("설정만 적용");
  assert.equal(h.button("설정 되돌리기").props.disabled, false);
  h.numeric("진폭", 0.123);
  assert.equal(h.button("설정 되돌리기").props.disabled, true);
  h.numeric("진폭", ""); assert.equal(contexts.at(-1), null);
  h.numeric("진폭", 0.2); assert.equal(contexts.at(-1).config.source.amplitudePeak, 0.2);
  const previous = contexts.length;
  h.update({ circuit: { ...circuit, components: circuit.components.map(part => part.id === "R1" ? { ...part, value: "22 kΩ" } : part) } });
  assert.ok(contexts.length > previous, "An idle circuit revision refreshes context even with identical config and probes");
});

test("scheduled run survives cleared request, but stop and unmatched probe application cannot launch it later", () => {
  const reports = []; let requestedHoles;
  const h = harness({ probes: [{ holeId: null, netId: null }, { holeId: null, netId: null }], onSetProbeHoles(holes) { requestedHoles = holes; }, onControlResult(id, message) { reports.push({ id, message }); } });
  h.update({ controlRequest: { id: 1, action: { kind: "auto_setup", run: true } } });
  assert.equal(h.workers.length, 0);
  h.update({ controlRequest: undefined, probes: resolveSimulationProbes(circuit, definitions, layout, requestedHoles) });
  assert.equal(h.workers.length, 1, "Clearing the parent request does not discard a legitimately queued run");
  h.update({ controlRequest: { id: 2, action: { kind: "stop" } } });
  assert.equal(h.workers[0].terminated, true);
  h.update({ probes: [{ holeId: null, netId: null }, { holeId: null, netId: null }], controlRequest: { id: 3, action: { kind: "auto_setup", run: true } } });
  const pendingTimer = [...h.timers].find(([, value]) => value.delay === 1500);
  assert.ok(pendingTimer); h.timers.delete(pendingTimer[0]); pendingTimer[1].callback(); h.flush();
  h.update({ probes: resolveSimulationProbes(circuit, definitions, layout, requestedHoles) });
  assert.equal(h.workers.length, 1, "An expired queue never launches when holes happen to match later");
  assert.ok(reports.some(report => report.id === 3 && /예약 실행을 취소/.test(report.message)));
  h.update({ probes: [{ holeId: null, netId: null }, { holeId: null, netId: null }], controlRequest: { id: 4, action: { kind: "auto_setup", run: true } } });
  h.numeric("진폭", 0.03);
  assert.ok(reports.some(report => report.id === 4 && /직접 설정.*취소/.test(report.message)), "Manual cancellation acknowledges the waiting chat request immediately");
  h.update({ probes: resolveSimulationProbes(circuit, definitions, layout, requestedHoles) });
  assert.equal(h.workers.length, 1);
});

test("auto setup may apply settings but never runs a BC109C circuit with missing physical placement", () => {
  const lab = library("lab5-reference").buildLab5ReferenceCircuit(1, "1:1");
  const labLayout = createLayout(lab, definitions, { boards: 1, railMode: "split" });
  const reports = [];
  const h = harness({ circuit: lab, layout: labLayout, probes: [{ holeId: null, netId: null }, { holeId: null, netId: null }], onControlResult(id, message) { reports.push({ id, message }); } });
  h.wireProbeUpdates(); h.update({ controlRequest: { id: 1, action: { kind: "auto_setup", run: true } } });
  assert.equal(h.workers.length, 0); assert.match(reports[0].message, /설정은 적용.*실행은 차단/);
  assert.equal(h.button("자동 설정 · 실행").props.disabled, true);
  assert.match(textIn(h.tree), /교육용 시작값/); assert.match(textIn(h.tree), /BC109C/);
});

test("a circuit change invalidates a contemporaneous old control request instead of running its stale intent", () => {
  const reports = []; const h = harness({ onControlResult(id, message) { reports.push({ id, message }); } });
  h.wireProbeUpdates();
  h.update({ circuit: { ...circuit, components: circuit.components.map(part => part.id === "R1" ? { ...part, value: "22 kΩ" } : part) }, controlRequest: { id: 5, action: { kind: "run" } } });
  assert.equal(h.workers.length, 0); assert.equal(reports[0].id, 5); assert.match(reports[0].message, /이전 파형 요청/);
  h.update({ controlRequest: { id: 6, action: { kind: "run" } } }); assert.equal(h.workers.length, 1);
});

test("run posts the current circuit, layout and edited settings; accepted numerical results render axes, cursor and CSV", async () => {
  const h = harness();
  assert.equal(paths(h.tree).length, 0, "No decorative waveform exists before a calculation");
  h.numeric("진폭", 0.25); h.numeric("표시 시간", 2); h.numeric("시간 샘플", 256);
  const worker = h.run(), request = worker.messages[0];
  assert.equal(request.type, "run"); assert.ok(Number.isSafeInteger(request.requestId));
  assert.equal(serial(request.input.circuit), serial(h.props.circuit));
  assert.equal(serial(request.input.layout), serial(h.props.layout));
  assert.equal(request.input.config.source.amplitudePeak, 0.25);
  assert.equal(request.input.config.durationSeconds, 0.002);
  assert.equal(request.input.config.sampleCount, 256);
  const result = runSimulation(request.input.circuit, request.input.definitions, request.input.config);
  worker.emit({ type: "result", requestId: request.requestId + 1, result }); h.flush();
  assert.equal(paths(h.tree).length, 0, "A different request ID cannot supply the result");
  h.complete(worker, result);
  assert.equal(worker.terminated, true); assert.equal(h.timers.size, 0);
  assert.equal(paths(h.tree).length, 2);
  assert.ok(paths(h.tree).every(path => !/NaN|Infinity/.test(path.props.d) && /L/.test(path.props.d)));
  const svg = select(h.tree, node => node.type === "svg" && node.props.className === "el-scope-screen");
  const toReact = (node, path = "svg") => Array.isArray(node) ? node.map((child, index) => toReact(child, `${path}/${index}`)) : node && typeof node === "object" && node.props ? React.createElement(node.type, { ...Object.fromEntries(Object.entries(node.props).filter(([name]) => name !== "children" && name !== "ref" && !name.startsWith("on"))), key: node.key ?? path }, toReact(node.props.children, `${path}/children`)) : node;
  const markup = renderToStaticMarkup(toReact(svg));
  assert.match(markup, /채널별 V\/div/); assert.match(markup, /2 ms/); assert.match(markup, /<path/);
  const slider = select(h.tree, node => node.type === "input" && node.props["aria-label"] === "커서 A 위치");
  slider.props.onChange({ target: { value: String(result.time[64]) } }); h.flush();
  const readout = select(h.tree, node => node.props.className === "el-scope-cursor-values");
  assert.match(textIn(readout), /CH1/); assert.match(textIn(readout), /CH2/);
  h.click("CSV 저장"); assert.equal(h.downloads.length, 1);
  const csv = await h.downloads[0].blob.text();
  assert.match(csv, /time_s/); assert.equal(csv.trim().split("\r\n").length, result.time.length + 1);
  assert.equal(Number(csv.split("\r\n")[65].split(",")[2]), result.nodeVoltages.OUT[64]);
});

test("cancel and replaced requests ignore late worker messages, including after a later run starts", () => {
  const h = harness(), first = h.run(), originalRequest = first.messages[0];
  const result = runSimulation(circuit, definitions, originalRequest.input.config);
  h.click("계산 취소"); assert.equal(first.terminated, true); assert.equal(h.timers.size, 0);
  first.emit({ type: "result", requestId: originalRequest.requestId, result }); h.flush();
  assert.equal(paths(h.tree).length, 0); assert.match(textIn(h.tree), /계산을 취소했습니다/);
  const second = h.run();
  first.emit({ type: "result", requestId: originalRequest.requestId, result }); h.flush();
  assert.equal(paths(h.tree).length, 0); assert.ok(h.button("계산 취소"));
  h.complete(second); assert.equal(paths(h.tree).length, 2);
});

test("config, circuit, physical layout and probe changes make results stale, block old CSV and cancel running work", () => {
  const change = {
    config: (h, step, effects = true) => h.numeric("진폭", 0.15 + step * 0.05, effects),
    circuit: (h, step, effects = true) => h.update({ circuit: { ...h.props.circuit, components: h.props.circuit.components.map(item => item.id === "R1" ? { ...item, value: `${47 + step} kΩ` } : item) } }, effects),
    layout: (h, step, effects = true) => h.update({ layout: { ...h.props.layout, placements: h.props.layout.placements.map(item => item.componentId === "R1" ? { ...item, pins: { ...item.pins, 1: `B1:D${20 + step}` } } : item) } }, effects),
    probes: (h, step, effects = true) => h.update({ probes: [{ holeId: `B1:A${20 + step}`, netId: "IN" }, h.props.probes[1]] }, effects),
  };
  for (const [name, mutate] of Object.entries(change)) {
    const h = harness(); h.complete(h.run());
    mutate(h, 1);
    assert.match(textIn(h.tree), /이전 조건의 결과입니다/, name);
    assert.ok(!textIn(h.tree).includes("현재 배선과 설정으로 계산했습니다."), `${name}: a stale result must not keep its current-condition success notice`);
    assert.equal(h.button("CSV 저장").props.disabled, true, name);
    h.button("CSV 저장").props.onClick(); assert.equal(h.downloads.length, 0, name);
    const worker = h.run(), request = worker.messages[0];
    mutate(h, 2, false); // A response can arrive after render but before effects.
    worker.emit({ type: "result", requestId: request.requestId, result: runSimulation(circuit, definitions, request.input.config) });
    h.flush();
    assert.equal(worker.terminated, true, name); assert.equal(h.timers.size, 0, name);
    assert.match(textIn(h.tree), /변경되어 계산을 중단했습니다/, name);
    assert.equal(h.button("CSV 저장").props.disabled, true, name);
    assert.ok(h.button("시뮬레이션 실행"));
  }
});

test("20-second timeout releases busy state, ignores delayed success and unmount terminates an active calculation", () => {
  const h = harness(), worker = h.run(), request = worker.messages[0];
  h.timeout();
  assert.equal(worker.terminated, true); assert.equal(h.timers.size, 0);
  assert.match(textIn(h.tree), /20초를 넘겨 중단/); assert.ok(h.button("시뮬레이션 실행"));
  h.complete(worker); assert.equal(paths(h.tree).length, 0);
  const next = h.run(); h.unmount();
  assert.equal(next.terminated, true); assert.equal(h.timers.size, 0);
  assert.ok(request.requestId < next.messages[0].requestId);
});

test("an unmodelled probe is explained and omitted rather than drawn as a zero waveform", () => {
  const h = harness(), worker = h.run(), request = worker.messages[0];
  const result = runSimulation(circuit, definitions, request.input.config);
  delete result.nodeVoltages.OUT;
  h.complete(worker, result);
  assert.equal(paths(h.tree).length, 1);
  assert.equal(paths(h.tree)[0].props.stroke, "#d49124");
  const missing = select(h.tree, node => node.props.className === "el-sim-missing");
  assert.match(textIn(missing), /CH2.*OUT.*계산 모델에 포함되지 않은/);
  const stats = select(h.tree, node => node.props.className === "el-scope-measurements");
  assert.ok(!textIn(stats).includes("CH2"));
  h.click("주파수 응답"); assert.equal(paths(h.tree).length, 1);
  h.click("위상"); assert.ok(!/NaN|Infinity/.test(paths(h.tree)[0].props.d));
});

test("invalid numeric inputs and disconnected probes never dispatch a worker; worker errors remain explicit", () => {
  const h = harness(); h.numeric("진폭", ""); h.run();
  assert.equal(h.workers.length, 0); assert.match(textIn(h.tree), /올바른 숫자/);
  h.numeric("진폭", 0.1);
  h.update({ probes: [{ holeId: "B1:A60", netId: null }, probes[1]] }); h.run();
  assert.equal(h.workers.length, 0); assert.match(textIn(h.tree), /연결되지 않았거나/);
  h.update({ probes }); const worker = h.run();
  worker.emit({ type: "error", requestId: worker.messages[0].requestId, message: "Q1: 이 트랜지스터 모델은 지원하지 않습니다." }); h.flush();
  assert.equal(worker.terminated, true); assert.equal(h.timers.size, 0);
  assert.match(textIn(h.tree), /Q1: 이 트랜지스터 모델은 지원하지 않습니다/);
  assert.equal(paths(h.tree).length, 0); assert.ok(h.button("시뮬레이션 실행"));
});

test("AC and DC exports retain computed values and distinguish component and source current directions", async () => {
  const h = harness(), worker = h.run(), result = h.complete(worker);
  h.click("주파수 응답"); h.click("CSV 저장");
  const acCsv = await h.downloads.at(-1).blob.text();
  assert.match(acCsv, /frequency_Hz/); assert.match(acCsv, /gain_ratio/); assert.match(acCsv, /phase_deg/);
  assert.equal(Number(acCsv.split("\r\n")[2].split(",")[3]), result.ac.nodeGainMagnitude.OUT[1]);
  h.click("DC 동작점"); h.click("CSV 저장");
  const dcCsv = await h.downloads.at(-1).blob.text();
  assert.match(dcCsv, /component_current_pin1_to_pin2/); assert.match(dcCsv, /source_current_node_to_source/);
  assert.match(textIn(h.tree), /1번 핀 → 2번 핀/);
});

test("Math subtracts the two measured waveforms and exports differential time and complex AC data", async () => {
  const h = harness(), result = h.complete(h.run());
  const checkbox = select(h.tree, node => node.type === "input" && node.props.type === "checkbox");
  checkbox.props.onChange({ target: { checked: true } }); h.flush();
  assert.equal(paths(h.tree).length, 3); assert.match(textIn(h.tree), /MATH/);
  h.click("CSV 저장"); const timeCsv = await h.downloads.at(-1).blob.text();
  assert.match(timeCsv, /CH1−CH2/);
  const sample=70;
  assert.equal(Number(timeCsv.split("\r\n")[sample+1].split(",")[3]), result.nodeVoltages.IN[sample]-result.nodeVoltages.OUT[sample]);
  h.click("주파수 응답"); h.click("CSV 저장");
  const acRow=(await h.downloads.at(-1).blob.text()).split("\r\n")[21].split(",");
  const mag=result.ac.nodeGainMagnitude.OUT[20], phase=result.ac.nodePhaseDegrees.OUT[20]*Math.PI/180;
  assert.ok(Math.abs(Number(acRow[5])-Math.hypot(1-mag*Math.cos(phase),-mag*Math.sin(phase)))<1e-12);
});

test("spectrum renders actual sampled data, exports amplitude units and blocks stale exports", async () => {
  const h=harness(), result=h.complete(h.run());
  h.click("주파수 성분"); assert.equal(paths(h.tree).length,2);
  assert.match(textIn(h.tree),/Hann 창.*평균 DC 제거/); assert.match(textIn(h.tree),/관측 분해능/);
  h.click("CSV 저장"); const csv=await h.downloads.at(-1).blob.text();
  assert.match(csv,/Vpeak_Hann_DC_removed/); assert.equal(csv.trim().split("\r\n").length,2**Math.ceil(Math.log2(result.time.length))/2+2);
  h.numeric("기본 입력 위상",90); assert.equal(h.button("CSV 저장").props.disabled,true);
  assert.match(textIn(h.tree),/이전 조건의 결과/);
});

test("extra sources retain phase, frequency and offsets in worker requests and are removable", () => {
  const h=harness(); h.click("+ 신호 발생기");
  h.numeric("추가 입력 1 위상",180); h.numeric("추가 입력 1 주파수",4000); h.numeric("추가 입력 1 진폭",0.005); h.numeric("추가 입력 1 오프셋",2);
  const worker=h.run(), config=worker.messages[0].input.config;
  assert.equal(config.extraSources.length,1); assert.equal(config.extraSources[0].phaseDegrees,180); assert.equal(config.extraSources[0].frequencyHz,4000); assert.equal(config.extraSources[0].amplitudePeak,0.005); assert.equal(config.extraSources[0].offset,2);
  const remove=select(h.tree,node=>node.props["aria-label"]==="추가 입력 1 제거"); remove.props.onClick(); h.flush();
  assert.ok(worker.terminated); assert.match(textIn(h.tree),/변경되어 계산을 중단/);
  const next=h.run(); assert.equal(next.messages[0].input.config.extraSources.length,0);
});

test("semiconductor terminal currents keep their own direction labels in UI and CSV", async () => {
  const h=harness(), worker=h.run(), result=runSimulation(circuit,definitions,worker.messages[0].input.config);
  result.dc.deviceCurrents={Q1:{C:0.001,B:0.00001,E:-0.00101}};
  h.complete(worker,result); h.click("DC 동작점");
  assert.match(textIn(h.tree),/반도체 단자 전류/); assert.match(textIn(h.tree),/각 단자로 들어가는 방향이 양수/);
  h.click("CSV 저장"); const csv=await h.downloads.at(-1).blob.text();
  assert.match(csv,/device_current_into_terminal.*Q1.C/); assert.match(csv,/Q1.E.*-0.00101/);
});

test("dynamic opamp settings reach the worker and an unavailable AC result cannot render or export a false response", () => {
  const oscillator = CIRCUIT_TEMPLATES.find(item => item.id === "wien-bridge");
  const oscillatorLayout = createLayout(oscillator, definitions, { boards: 2, railMode: "split" });
  const output = oscillatorLayout.placements.find(item => item.componentId === "U1");
  const h = harness({ circuit: oscillator, layout: oscillatorLayout, probes: [{ holeId: output.pins[6], netId: "OUT" }, { holeId: null, netId: null }] });
  assert.match(textIn(h.tree), /UA741 계산 모델/);
  h.numeric("시동 초기 변화", 2);
  const worker = h.run();
  assert.equal(worker.messages[0].input.config.opampModel, "educational-dynamic");
  assert.equal(worker.messages[0].input.config.startupPerturbationVolts, 0.002);
  const result = h.complete(worker);
  assert.ok(result.acUnavailableReason); assert.ok(paths(h.tree).length > 0);
  h.click("주파수 응답");
  assert.match(textIn(h.tree), /이 회로의 AC 응답은 제공하지 않습니다/);
  assert.equal(paths(h.tree).length, 0); assert.equal(h.button("CSV 저장").props.disabled, true);
  h.button("CSV 저장").props.onClick(); assert.equal(h.downloads.length, 0);
  h.click("주파수 성분"); assert.equal(h.button("CSV 저장").props.disabled, false); assert.ok(paths(h.tree).length > 0);
});

test("the multimeter tab can perform an unpowered test before a capture and blocks powered readings after edits", () => {
  const h = harness(); h.click("멀티미터");
  assert.match(textIn(h.tree), /시뮬레이션을 실행하면 회로 응답을 측정/);
  select(h.tree, node => node.type === "button" && textIn(node).endsWith("저항")).props.onClick(); h.flush();
  assert.match(textIn(h.tree), /무전원 시험/); assert.match(textIn(h.tree), /OL/);
  assert.equal(h.workers.length, 0);
  select(h.tree, node => node.type === "button" && textIn(node).endsWith("AC 전압")).props.onClick(); h.flush();
  h.complete(h.run());
  assert.match(textIn(h.tree), /TRUE RMS/); assert.equal(h.button("CSV 저장").props.disabled, true);
  const readout = () => select(h.tree, node => node.props["aria-label"] === "멀티미터 측정값");
  assert.ok(!textIn(readout()).includes("—"));
  h.numeric("진폭", 0.25); assert.match(textIn(readout()), /—/);
  assert.match(textIn(h.tree), /다시 실행한 후 측정/);
});
