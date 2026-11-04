import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function library(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    if (!dependency.startsWith("./")) throw Error(`Unexpected dependency ${dependency}`);
    return library(dependency.slice(2));
  });
  cache.set(name, module.exports); return module.exports;
}
const { COMPONENT_CATALOG: definitions } = library("catalog");
const { CIRCUIT_TEMPLATES: templates } = library("templates");
const { createLayout } = library("engine");
const { runSimulation, defaultSimulationConfig } = library("simulation");
const { createSimulationLayoutIndex } = library("simulation-layout");
const circuit = structuredClone(templates.find(item => item.id === "divider"));
const layout = createLayout(circuit, definitions, { boards: 1, railMode: "split" });
const config = { ...defaultSimulationConfig(circuit), sampleCount: 256, acPoints: 2 };
const result = runSimulation(circuit, definitions, config);
const componentCode = ts.transpileModule(readFileSync(new URL("../src/components/electronics/Multimeter.tsx", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const near = (actual, expected, tolerance = 1e-6) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const textIn = node => Array.isArray(node) ? node.map(textIn).join("") : node?.props ? textIn(node.props.children) : typeof node === "string" || typeof node === "number" ? String(node) : "";
function* walk(node) {
  if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; }
  if (!node || typeof node !== "object" || !node.props) return;
  yield node; yield* walk(node.props.children);
}
const select = (tree, predicate) => { const node = [...walk(tree)].find(predicate); assert.ok(node, "Expected rendered element exists"); return node; };

// Real Multimeter TSX, wiring validation and measurement engine. Only React's
// scheduler is replaced so stale/HOLD transitions can be inspected before effects.
function harness(overrides = {}) {
  const slots = [], effects = [];
  let cursor = 0, dirty = true, tree, props = { circuit, layout, definitions, config, result, stale: false, captureKey: "capture-1", probeNets: ["OUT", "GND"], ...overrides };
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) {
      const index = cursor++;
      slots[index] ??= { value: typeof initial === "function" ? initial() : initial };
      const slot = slots[index];
      slot.set ??= value => { const next = typeof value === "function" ? value(slot.value) : value; if (!Object.is(next, slot.value)) { slot.value = next; dirty = true; } };
      return [slot.value, slot.set];
    },
    useMemo(factory, deps) { const index = cursor++, previous = slots[index]; if (!previous || !same(previous.deps, deps)) slots[index] = { value: factory(), deps }; return slots[index].value; },
    useEffect(effect, deps) { const index = cursor++, previous = slots[index]; if (!previous || !same(previous.deps, deps)) { const slot = { deps, cleanup: previous?.cleanup }; slots[index] = slot; effects.push(() => { slot.cleanup?.(); slot.cleanup = effect(); }); } },
  };
  const module = { exports: {} }, jsx = (type, props, key) => ({ type, props: props ?? {}, key });
  new Function("module", "exports", "require", componentCode)(module, module.exports, name => {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
    if (name === "./multimeter.css") return {};
    if (name.startsWith("@/lib/electronics/")) return library(name.split("/").at(-1));
    throw Error(`Unexpected dependency ${name}`);
  });
  function flush(runEffects = true) {
    for (let count = 0; dirty || runEffects && effects.length; count++) {
      assert.ok(count < 20, "React updates settle");
      if (dirty) { dirty = false; cursor = 0; tree = module.exports.Multimeter(props); }
      if (!runEffects) break;
      for (const effect of effects.splice(0)) effect();
    }
    return tree;
  }
  flush();
  const button = label => select(tree, node => node.type === "button" && textIn(node).includes(label));
  return {
    get tree() { return tree; }, get props() { return props; }, flush, button,
    get display() { return select(tree, node => node.props["aria-label"] === "멀티미터 측정값"); },
    get raw() { return textIn(select(this.display, node => node.type === "strong")); },
    get value() { const line = select(this.display, node => node.type === "p"), unit = textIn(select(line, node => node.type === "span")); return Number(this.raw) * (unit.startsWith("µ") ? 1e-6 : unit.startsWith("m") ? 1e-3 : unit.startsWith("k") ? 1e3 : unit.startsWith("M") ? 1e6 : 1); },
    get held() { return button("HOLD").props["aria-pressed"]; },
    click(label) { const node = button(label); assert.ok(!node.props.disabled, `Button ${label} enabled`); node.props.onClick(); return flush(); },
    field(label, value) { const field = select(tree, node => node.type === "label" && node.props.className === "el-sim-field" && textIn(node).startsWith(label)); select(field, node => node.type === "select" || node.type === "input").props.onChange({ target: { value: String(value) } }); return flush(); },
    update(changes, runEffects = true) { props = { ...props, ...changes }; dirty = true; return flush(runEffects); },
    mode(label) { return this.click(label); },
  };
}

test("DMM DC/AC modes use capture mean and true AC RMS over the selected time interval", () => {
  const c = { ...config, source: { ...config.source, waveform: "sine", amplitudePeak: 2, offset: 4, frequencyHz: 1000 }, durationSeconds: 0.00125, sampleCount: 1024 };
  const h = harness({ config: c, result: runSimulation(circuit, definitions, c) });
  const mean = (a, b) => 2 + (Math.cos(2 * Math.PI * 1000 * a) - Math.cos(2 * Math.PI * 1000 * b)) / (2 * Math.PI * 1000 * (b - a));
  const rms = (a, b) => {
    const omega = 2 * Math.PI * 1000, avg = mean(a, b) - 2;
    return Math.sqrt(0.5 - (Math.sin(2 * omega * b) - Math.sin(2 * omega * a)) / (4 * omega * (b - a)) - avg * avg);
  };
  near(h.value, mean(0, c.durationSeconds), 1e-5);
  h.mode("AC 전압"); near(h.value, rms(0, c.durationSeconds), 1e-5); assert.match(textIn(h.display), /TRUE RMS/);
  h.field("측정 시간 구간", "last-half"); near(h.value, rms(c.durationSeconds / 2, c.durationSeconds), 1e-5);
  h.mode("DC 전압"); near(h.value, mean(c.durationSeconds / 2, c.durationSeconds), 1e-5);
  h.field("측정 시간 구간", "last-fifth"); near(h.value, mean(c.durationSeconds * 0.8, c.durationSeconds), 1e-5);
  assert.match(textIn(h.display), /후반 20%/);
});

test("manual range produces OL and disables HOLD; mode change resets range", () => {
  const h = harness(); near(h.value, 2.5);
  h.field("측정 범위", 2); assert.equal(h.raw, "OL"); assert.equal(h.button("HOLD").props.disabled, true);
  h.field("측정 범위", 20); near(h.value, 2.5); assert.equal(h.button("HOLD").props.disabled, false);
  h.click("HOLD"); assert.equal(h.held, true);
  h.mode("AC 전압"); assert.equal(h.held, false); near(h.value, 0); assert.match(textIn(h.display), /AUTO RANGE/);
  h.mode("DC 전압"); h.field("검정 프로브", "VCC"); near(h.value, -2.5);
  h.field("측정 범위", 2); assert.equal(h.raw, "OL", "negative over-range uses magnitude");
});

test("HOLD clears on settings, ranges, windows and a new accepted capture", () => {
  const h = harness();
  for (const change of [() => h.field("측정 범위", 20), () => h.field("측정 시간 구간", "last-half"), () => h.field("빨강 프로브", "VCC"), () => h.update({ captureKey: "capture-2" })]) {
    h.click("HOLD"); assert.equal(h.held, true); change(); assert.equal(h.held, false);
  }
  h.click("HOLD"); h.click("HOLD 해제"); assert.equal(h.held, false);
});

test("stale/running captures cannot display held powered readings, including before effect cleanup", () => {
  const h = harness(); h.click("HOLD"); assert.equal(h.held, true);
  const nextConfig = { ...config, source: { ...config.source, offset: 6 } };
  h.update({ stale: true, config: nextConfig }, false);
  assert.equal(h.raw, "—", "synchronous display guard rejects stale HOLD"); assert.equal(h.held, false);
  assert.equal(h.button("HOLD").props.disabled, true); assert.match(textIn(h.tree), /다시 실행/);
  h.flush(); h.update({ stale: false, config });
  near(h.value, 2.5); assert.equal(h.held, false, "stale HOLD cannot reappear after unchanged capture returns");
  h.click("HOLD"); h.update({ result: undefined }, false); assert.equal(h.raw, "—");
});

test("missing or stale captures still permit explicitly labeled offline resistance/continuity tests", () => {
  const h = harness({ result: undefined, stale: true });
  assert.equal(h.raw, "—"); h.mode("저항"); near(h.value, 10000); assert.match(textIn(h.tree), /무전원 시험/);
  assert.match(textIn(h.tree), /전원과 신호원을 제거하고 커패시터를 개방/);
  h.mode("도통"); assert.doesNotMatch(textIn(h.display), /● 도통/);
  h.field("빨강 프로브", "GND"); near(h.value, 0); assert.match(textIn(h.display), /● 도통/);
  h.field("도통 기준", ""); assert.equal(h.raw, "—"); assert.ok([...walk(h.tree)].some(node => node.props.role === "alert"));
  h.mode("DC 전압"); assert.equal(h.raw, "—", "powered mode never reuses an offline reading");
});

function shortedTerminal() {
  const invalid = structuredClone(layout), first = invalid.terminals[0]; assert.ok(first);
  const differentPin = invalid.placements.flatMap(placement => {
    const component = circuit.components.find(item => item.id === placement.componentId);
    return Object.entries(placement.pins).map(([pin, hole]) => ({ hole, net: component.pinNets[pin] }));
  }).find(pin => pin.net !== first.netId);
  first.holeId = differentPin.hole; assert.throws(() => createSimulationLayoutIndex(circuit, definitions, invalid));
  return invalid;
}
test("current wiring errors block powered and offline readings and permanently release HOLD", () => {
  const invalid = shortedTerminal(), h = harness(); h.click("HOLD");
  h.update({ layout: invalid }, false); assert.equal(h.raw, "—"); assert.equal(h.held, false);
  assert.ok([...walk(h.tree)].some(node => node.props.role === "alert" && /빵판|연결/.test(textIn(node))));
  h.flush(); h.mode("저항"); assert.equal(h.raw, "—"); assert.equal(h.button("HOLD").props.disabled, true);
  h.update({ layout }); near(h.value, 10000); assert.equal(h.held, false);
});

test("branch current terminal selection changes sign and AC current measures ripple only", () => {
  const h = harness(); h.mode("DC 전류");
  h.field("전류 측정 소자", "R1"); h.field("전류 유입 단자", "1"); near(h.value, 0.00025);
  h.field("전류 유입 단자", "2"); near(h.value, -0.00025);
  assert.match(textIn(h.tree), /선택한 단자로 들어가는 전류가 양수/);
  h.mode("AC 전류"); near(h.value, 0);
  h.mode("DC 전류"); h.field("전류 측정 소자", "R2"); near(h.value, 0.00025, 1e-10);
});

test("BJT branch selection uses the selected transistor's real B/C/E terminal labels", () => {
  const bjt = structuredClone(templates.find(item => item.id === "ce-amplifier")); assert.ok(bjt);
  const base = defaultSimulationConfig(bjt), c = { ...base, source: { ...base.source, waveform: "dc", amplitudePeak: 0 }, sampleCount: 32, durationSeconds: 0.001, acPoints: 2 };
  const h = harness({ circuit: bjt, layout: createLayout(bjt, definitions, { boards: 1, railMode: "split" }), config: c, result: runSimulation(bjt, definitions, c) });
  const transistor = bjt.components.find(item => definitions.find(def => def.id === item.definitionId)?.kind === "transistor");
  h.mode("DC 전류"); h.field("전류 측정 소자", transistor.id);
  const values = {};
  for (const terminal of ["B", "C", "E"]) { h.field("전류 유입 단자", terminal); values[terminal] = h.value; }
  assert.ok(values.B > 0 && values.C > values.B && values.E < 0); near(values.B + values.C + values.E, 0, 1e-8);
});

test("CH1/CH2 copying maps red/COM and clears HOLD; absent probe disables copy", () => {
  const h = harness({ probeNets: ["GND", "OUT"] }); h.click("HOLD");
  h.click("CH1 → 빨강"); near(h.value, -2.5); assert.equal(h.held, false);
  h.update({ probeNets: [null, "OUT"] }); assert.equal(h.button("CH1 → 빨강").props.disabled, true);
  h.mode("DC 전류"); assert.ok(![...walk(h.tree)].some(node => node.type === "button" && /CH1 → 빨강/.test(textIn(node))));
});

test("isolated diode mode displays forward test voltage and reverse OL without a powered capture", () => {
  const diode = { id: "diode-ui", title: "Isolated diode", description: "", components: [{ id: "D1", definitionId: "diode-1n4148-vishay-do35", value: "1N4148", pinNets: { 1: "OUT", 2: "GND" } }], instruments: [], netNames: { OUT: "Anode", GND: "Cathode" }, notes: [], reviewItems: [] };
  const h = harness({ circuit: diode, layout: createLayout(diode, definitions, { boards: 1, railMode: "split" }), config: defaultSimulationConfig(diode), result: undefined, stale: true });
  h.mode("다이오드"); assert.ok(h.value > 0.5 && h.value < 0.9, String(h.value));
  assert.match(textIn(h.tree), /1 mA|1mA/);
  h.field("빨강 프로브", "GND"); h.field("검정 프로브", "OUT"); assert.equal(h.raw, "OL"); assert.equal(h.button("HOLD").props.disabled, true);
});
