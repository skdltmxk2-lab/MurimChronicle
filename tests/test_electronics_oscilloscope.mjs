import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";

const compile = name => ts.transpileModule(readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8"), { fileName: name, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const utility = { exports: {} };
vm.runInNewContext(compile("lib/electronics/simulation-scope.ts"), { module: utility, exports: utility.exports });
const { scopeMeasurements, scopeCoupledValues, scopeCrossings, scopeWindow, scopeValueAt, scopePath, scopeAutoVolts, scopeTimeInfo } = utility.exports;
const near = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const sample = (frequency = 1000, cycles = 6, count = 1201, wave = t => Math.sin(2 * Math.PI * frequency * t)) => {
  const time = Array.from({ length: count }, (_, i) => i * cycles / frequency / (count - 1));
  return { time, values: time.map(wave) };
};
const fixture = () => {
  const { time, values } = sample();
  return { time, traces: [{ label: "CH1", color: "#d49124", values: values.map(value => 3 + value) }, { label: "CH2", color: "#3c8ed4", values: values.map(value => -value) }], captureKey: "one", stale: false };
};

test("sine statistics, periodic frequency and midlevel duty use actual samples", () => {
  const { time, values } = sample(), stats = scopeMeasurements(time, values.map(value => 3 + 2 * value));
  near(stats.vpp, 4); near(stats.mean, 3);
  near(stats.rms, Math.sqrt(9 + 2 * 1200 / 1201));
  near(stats.frequency, 1000, 1e-7); near(stats.duty, 0.5, 1e-8);
  assert.ok(stats.cycles >= 3); assert.equal(stats.complete, true);
});

test("square-wave duty and noncoherent capture frequency are not mislabeled as missing periods", () => {
  for (const count of [1201, 1024]) {
    const { time, values } = sample(1000, 6, count, t => ((t * 1000) % 1) < 0.25 ? 1 : -1);
    const stats = scopeMeasurements(time, values);
    near(stats.frequency, 1000, 8); near(stats.duty, 0.25, 0.01);
  }
});

test("DC, insufficient cycles, undersampling, missing data, startup ramps and incommensurate tones do not receive a confident frequency", () => {
  const f = fixture();
  const cases = [
    { time: f.time, values: f.time.map(() => 3) },
    sample(1000, 2), sample(1000, 6, 49),
    { time: f.time, values: f.traces[0].values.map((value, i) => i === 300 ? NaN : value) },
    sample(1000, 8, 1601, t => (1 + t * 300) * Math.sin(2 * Math.PI * 1000 * t)),
    sample(1000, 8, 1601, t => Math.sin(2 * Math.PI * 1000 * t) + 0.6 * Math.sin(2 * Math.PI * 1730 * t)),
  ];
  for (const input of cases) assert.equal(scopeMeasurements(input.time, input.values).frequency, undefined);
  const brokenTime = f.time.map((value, i) => i >= 300 ? value + 0.001 : value);
  assert.equal(scopeMeasurements(brokenTime, f.traces[0].values).frequency, undefined);
});

test("AC coupling removes only the captured mean; DC and input arrays remain unchanged", () => {
  const values = [2, 3, 4], ac = scopeCoupledValues(values, "AC");
  assert.deepEqual(Array.from(ac), [-1, 0, 1]); assert.equal(scopeCoupledValues(values, "DC"), values);
  assert.deepEqual(values, [2, 3, 4]);
  assert.ok(Number.isNaN(scopeCoupledValues([2, NaN, 4], "AC")[1]));
});

test("rising and falling triggers interpolate crossings and normal mode never invents a frozen trace", () => {
  near(scopeCrossings([0, 1, 2], [-1, 1, -1], 0, "rising")[0], 0.5);
  near(scopeCrossings([0, 1, 2], [-1, 1, -1], 0, "falling")[0], 1.5);
  const { time, traces } = fixture(), trigger = { source: 0, slope: "rising", level: 3, mode: "normal" };
  const found = scopeWindow(time, traces, 0.0001, 0.5, trigger);
  assert.equal(found.status, "triggered"); assert.equal(found.showTrace, true);
  near(found.triggerTime - found.start, 0.0002);
  const absent = scopeWindow(time, traces, null, 0, { ...trigger, level: 99 });
  assert.equal(absent.status, "waiting"); assert.equal(absent.showTrace, false); assert.equal(absent.triggerTime, undefined);
  assert.equal(scopeWindow(time, traces, null, 0, { ...trigger, level: 99, mode: "auto" }).showTrace, true);
});

test("cursor interpolation and plot paths never bridge a missing sample or a time gap", () => {
  assert.equal(scopeValueAt([0, 1, 2], [1, NaN, 3], 0.5), undefined);
  assert.equal(scopeValueAt([0, 1, 2, 10], [0, 1, 2, 10], 7), undefined);
  near(scopeValueAt([0, 1, 2], [0, 2, 4], 0.25), 0.5);
  assert.equal(scopeValueAt([0, 1], [1, 2], 2), undefined);
  const window = { start: 0, end: 4, showTrace: true, secondsPerDivision: 0.4, status: "auto" };
  const path = scopePath([0, 1, 2, 3, 4], [0, 1, NaN, -1, 0], window, 1, 0, 760, 330);
  assert.equal((path.match(/M/g) || []).length, 2); assert.doesNotMatch(path, /NaN|Infinity/);
  assert.equal(scopePath([0, 1], [0, 1], window, 0, 0, 760, 330), "");
  assert.equal(scopePath([0, 1], [0, 1], { ...window, showTrace: false }, 1, 0, 760, 330), "");
  assert.equal(scopeTimeInfo([0, 0, 1]), null);
});

test("auto scale and time bounds remain finite for zero, tiny, clipped and invalid values", () => {
  near(scopeAutoVolts([0, 0]), 1e-9);
  assert.ok(scopeAutoVolts([1, -1]) >= 1 / 3.4);
  const f = fixture(), trigger = { source: 0, slope: "rising", level: NaN, mode: "normal" };
  assert.equal(scopeWindow(f.time, f.traces, null, 0, trigger).status, "invalid");
  assert.equal(scopeWindow(f.time, f.traces, -1, 0, { ...trigger, level: 0 }).status, "invalid");
});

const compiledScope = compile("components/electronics/Oscilloscope.tsx");
const walk = function* (node) { if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; } if (node && typeof node === "object" && node.props) { yield node; yield* walk(node.props.children); } };
const textIn = node => Array.isArray(node) ? node.map(textIn).join("") : node && typeof node === "object" && node.props ? textIn(node.props.children) : typeof node === "string" || typeof node === "number" ? String(node) : "";
const find = (tree, predicate) => { const node = [...walk(tree)].find(predicate); assert.ok(node, "Expected UI node"); return node; };
const tracesIn = tree => [...walk(tree)].filter(node => node.props["data-scope-trace"] !== undefined);

function harness(initial = fixture()) {
  const frames = new Map(), effects = []; let active, dirty = true, tree, unique = 0, props = initial;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    memo: fn => fn,
    useState(initial) { const frame = active, index = frame.cursor++; if (!frame.slots[index]) frame.slots[index] = { value: typeof initial === "function" ? initial() : initial }; const slot = frame.slots[index]; slot.set ??= next => { const value = typeof next === "function" ? next(slot.value) : next; if (!Object.is(value, slot.value)) { slot.value = value; dirty = true; } }; return [slot.value, slot.set]; },
    useRef(initial) { const i = active.cursor++; return active.slots[i] ??= { current: initial }; },
    useId() { const i = active.cursor++; return active.slots[i] ??= `scope-test-${++unique}`; },
    useMemo(factory, deps) { const i = active.cursor++, previous = active.slots[i]; if (!previous || !same(previous.deps, deps)) active.slots[i] = { value: factory(), deps }; return active.slots[i].value; },
    useEffect(effect, deps) { const i = active.cursor++, previous = active.slots[i]; if (!previous || !same(previous.deps, deps)) { active.slots[i] = { deps }; effects.push(effect); } },
  };
  const jsx = (type, props, key) => ({ type, props: props || {}, key }), module = { exports: {} };
  vm.runInNewContext(compiledScope, { module, exports: module.exports, require: name => name === "react" ? react : name === "react/jsx-runtime" ? { jsx, jsxs: jsx } : name === "./oscilloscope.css" ? {} : name === "@/lib/electronics/simulation-scope" ? utility.exports : (() => { throw Error(name); })() });
  function render(fn, props, path) { const before = active; active = frames.get(path) || { slots: [], cursor: 0 }; active.cursor = 0; frames.set(path, active); const output = fn(props); active = before; return expand(output, path); }
  function expand(node, path) { if (Array.isArray(node)) return node.map((child, i) => expand(child, `${path}/${child?.key ?? i}`)); if (!node || typeof node !== "object" || !node.props) return node; if (typeof node.type === "function") return render(node.type, node.props, `${path}/${node.type.name}`); const result = { ...node, props: { ...node.props, children: expand(node.props.children, `${path}/children`) } }; if (result.props.ref) result.props.ref.current = {}; return result; }
  function flush() { for (let loops = 0; loops < 30 && (dirty || effects.length); loops++) { if (dirty) { dirty = false; tree = render(module.exports.Oscilloscope, props, "scope"); } for (const effect of effects.splice(0)) effect(); } assert.equal(dirty, false, "UI converges"); return tree; }
  return { flush, change(label, value, checked) { const input = find(flush(), node => node.props["aria-label"] === label); input.props.onChange({ target: { value, checked } }); return flush(); }, update(next) { props = { ...props, ...next }; dirty = true; return flush(); } };
}

test("real scope controls hide channels, change coupling and manual scale, and keep physical measurement values independent of display offset", () => {
  const h = harness(); assert.equal(tracesIn(h.flush()).length, 2);
  assert.equal(tracesIn(h.change("CH1 표시", "", false)).length, 1);
  h.change("CH1 표시", "", true);
  h.change("CH1 커플링", "AC");
  const row = find(h.flush(), node => node.type === "tr" && textIn(node).startsWith("CH1"));
  assert.match(textIn(row), /2 V/); assert.doesNotMatch(textIn(row), /3 V/);
  h.change("CH1 자동 V/div", "", false);
  const before = tracesIn(h.flush())[0].props.d;
  h.change("CH1 V/div", "0.2"); assert.notEqual(tracesIn(h.flush())[0].props.d, before);
  const statistics = textIn(find(h.flush(), node => node.type === "table"));
  h.change("CH1 수직 위치", "5");
  assert.equal(textIn(find(h.flush(), node => node.type === "table")), statistics);
});

test("normal trigger with no crossing removes all trace paths; auto restores the current captured data", () => {
  const h = harness(); h.change("트리거 모드", "normal");
  assert.equal(tracesIn(h.change("트리거 레벨", "99")).length, 0);
  assert.match(textIn(h.flush()), /트리거 없음/);
  assert.equal(tracesIn(h.change("트리거 모드", "auto")).length, 2);
  assert.match(textIn(h.flush()), /Auto · 교차점 없음/);
});

test("timebase and position select a new recorded window; two cursor sliders report delta voltage and time", () => {
  const h = harness(); h.change("시간축 s/div", "0.0001");
  const before = tracesIn(h.flush())[0].props.d;
  h.change("시간 위치", "900"); assert.notEqual(tracesIn(h.flush())[0].props.d, before);
  const slider = find(h.flush(), node => node.props["aria-label"] === "커서 A 위치");
  h.change("커서 A 위치", String(slider.props.min)); h.change("커서 B 위치", String(slider.props.max));
  assert.match(textIn(h.flush()), /Δt 1 ms/); assert.match(textIn(h.flush()), /1\/\|Δt\| 1 kHz/); assert.match(textIn(h.flush()), /ΔV/);
});

test("invalid manual scales do not emit misleading traces or NaN SVG coordinates", () => {
  const h = harness(); h.change("CH1 자동 V/div", "", false);
  assert.equal(tracesIn(h.change("CH1 V/div", "")).length, 0);
  assert.match(textIn(h.flush()), /설정·표본 확인/);
  const svg = find(h.flush(), node => node.type === "svg");
  assert.doesNotMatch(JSON.stringify(svg.props), /NaN|Infinity/);
  find(h.flush(), node => node.type === "button" && textIn(node) === "자동 맞춤").props.onClick();
  assert.equal(tracesIn(h.flush()).length, 2);
});

test("new capture and stale state reset cursors without holding an old waveform", () => {
  const h = harness(); const original = tracesIn(h.flush())[0].props.d;
  const next = fixture(); next.traces[0].values = next.time.map(t => 3 + 0.1 * Math.cos(2 * Math.PI * 1000 * t));
  const tree = h.update({ ...next, captureKey: "two", stale: true });
  assert.notEqual(tracesIn(tree)[0].props.d, original); assert.match(textIn(tree), /이전 조건의 캡처/);
  const cursor = find(tree, node => node.props["aria-label"] === "커서 A 위치"); near(cursor.props.value, 0.0015);
});

test("pointer cursor follows real coordinates and pointer cancellation ends dragging", () => {
  const h = harness(); const target = { getBoundingClientRect: () => ({ left: 0, width: 760 }), setPointerCapture() {}, hasPointerCapture: () => true, releasePointerCapture() {} };
  let svg = find(h.flush(), node => node.type === "svg");
  svg.props.onPointerDown({ button: 0, pointerId: 1, clientX: 52, currentTarget: target });
  near(find(h.flush(), node => node.props["aria-label"] === "커서 A 위치").props.value, 0);
  svg = find(h.flush(), node => node.type === "svg"); svg.props.onPointerMove({ pointerId: 1, clientX: 742, currentTarget: target });
  near(find(h.flush(), node => node.props["aria-label"] === "커서 A 위치").props.value, 0.006);
  svg = find(h.flush(), node => node.type === "svg"); svg.props.onPointerCancel({ pointerId: 1, currentTarget: target }); svg.props.onPointerMove({ pointerId: 1, clientX: 52, currentTarget: target });
  near(find(h.flush(), node => node.props["aria-label"] === "커서 A 위치").props.value, 0.006);
});

test("actual React server rendering exposes labelled controls and scoped clipping with no external dependencies", () => {
  const module = { exports: {} };
  vm.runInNewContext(compiledScope, { module, exports: module.exports, require: name => name === "react" ? React : name === "react/jsx-runtime" ? jsxRuntime : name === "./oscilloscope.css" ? {} : utility.exports });
  const markup = renderToStaticMarkup(React.createElement(module.exports.Oscilloscope, fixture()));
  assert.match(markup, /가상 오실로스코프/); assert.match(markup, /트리거 레벨/); assert.match(markup, /clipPath/); assert.match(markup, /평균을 빼는 교육용 근사/);
  assert.doesNotMatch(markup, /NaN|Infinity/);
});

test("normalized DSP samples retain dimensionless labels and never acquire voltage units", () => {
  const h = harness({ ...fixture(), amplitudeUnit: "normalized" });
  const content = textIn(h.flush());
  assert.match(content, /정규화 진폭/);
  assert.match(content, /진폭 pp/);
  assert.match(content, /Δ진폭/);
  assert.doesNotMatch(content, /V\/div|ΔV|\d V/);
  h.change("CH1 자동 진폭/div", "", false);
  assert.equal(tracesIn(h.change("CH1 진폭/div", "0.5")).length, 2);
});

test("a dimensionless value is never rescaled without its SI prefix while unit-bearing values keep theirs", () => {
  const { scopeFormat } = utility.exports;
  for (const [value, expected] of [[0.5, "0.5"], [0.71, "0.71"], [0.001, "0.001"], [1.4, "1.4"], [1500, "1500"], [-0.25, "-0.25"], [12345.678, "12350"], [0, "0"]]) assert.equal(scopeFormat(value, ""), expected);
  assert.equal(scopeFormat(0.5), "0.5");
  assert.equal(scopeFormat(undefined), "—");
  assert.equal(scopeFormat(NaN, "V"), "—");
  assert.equal(scopeFormat(0.5, "V"), "500 mV");
  assert.equal(scopeFormat(0.0005, "s"), "500 µs");
  assert.equal(scopeFormat(1500, "Hz"), "1.5 kHz");
});

test("normalized samples below one are displayed at their true size in the measurement table", () => {
  const { time } = sample(), values = time.map(t => 0.25 * Math.sin(2 * Math.PI * 1000 * t));
  const h = harness({ time, traces: [{ label: "CH1", color: "#d49124", values }], captureKey: "small", stale: false, amplitudeUnit: "normalized" });
  const row = find(h.flush(), node => node.type === "tr" && textIn(node).startsWith("CH1"));
  const cells = [...walk(row)].filter(node => node.type === "td").map(textIn);
  assert.equal(cells[0], "0.5", "peak-to-peak is 0.5, not 500");
  assert.equal(cells[2], String(Number((0.25 * Math.sqrt(0.5 * 1200 / 1201)).toPrecision(4))), "rms keeps its decimal magnitude");
  assert.doesNotMatch(textIn(h.flush()), /V|ΔV/);
});
