import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const compiled = new Map();
function source(name) {
  if (!compiled.has(name)) compiled.set(name, ts.transpileModule(readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText);
  return compiled.get(name);
}
const modules = new Map();
function library(name) {
  if (modules.has(name)) return modules.get(name);
  const module = { exports: {} };
  vm.runInNewContext(source(`lib/electronics/${name}.ts`), { module, exports: module.exports, require: dependency => library(dependency.replace("./", "")) });
  modules.set(name, module.exports);
  return module.exports;
}
const { createBoard } = library("engine");
const definition = { id: "r", name: "Resistor", category: "test", description: "fixture", package: "Axial", kind: "resistor", mounting: "direct", pinoutStatus: "generic", pins: [{ id: "1", label: "1" }, { id: "2", label: "2" }] };
const circuit = { id: "fixture", title: "Pointer fixture", description: "", components: [{ id: "R1", definitionId: "r", value: "10k", pinNets: { 1: "IN", 2: "OUT" } }], instruments: [], netNames: { IN: "IN", OUT: "OUT" }, notes: [], reviewItems: [] };
const fixture = () => ({ board: createBoard({ boards: 1, railMode: "split" }), placements: [{ componentId: "R1", pins: { 1: "B1:B10", 2: "B1:B14" } }], jumpers: [], terminals: [], issues: [] });
const walk = function* (node) {
  if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; }
  if (!node || typeof node !== "object" || !node.props) return;
  yield node;
  yield* walk(node.props.children);
};
const select = (tree, predicate) => {
  const result = [...walk(tree)].find(predicate);
  assert.ok(result, "Expected element exists in rendered JSX tree");
  return result;
};

// This executes real component handlers and rendered JSX, not a browser. Only
// React scheduling, SVG coordinate APIs, pointer capture, and animation frames
// are replaced; no app implementation is copied into the harness.
function harness() {
  const slots = [], effects = [], frames = new Map(), listeners = new Map();
  let cursor = 0, dirty = true, tree, frameId = 0, renderCount = 0;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { value: typeof initial === "function" ? initial() : initial };
      const slot = slots[index];
      if (!slot.set) slot.set = value => {
        const next = typeof value === "function" ? value(slot.value) : value;
        if (!Object.is(next, slot.value)) { slot.value = next; dirty = true; }
      };
      return [slot.value, slot.set];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useMemo(factory, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || !same(previous.deps, deps)) slots[index] = { value: factory(), deps };
      return slots[index].value;
    },
    useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
    useEffect(effect, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || !same(previous.deps, deps)) {
        slots[index] = { deps, cleanup: previous?.cleanup };
        effects.push(() => { slots[index].cleanup?.(); slots[index].cleanup = effect(); });
      }
    },
  };
  const captures = new Set();
  const captureTarget = {
    setPointerCapture(id) { captures.add(id); }, hasPointerCapture(id) { return captures.has(id); }, releasePointerCapture(id) { captures.delete(id); },
  };
  const nativeSvg = { ...captureTarget, getScreenCTM: () => ({ inverse: () => ({}) }), createSVGPoint: () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }) };
  const nativeScroller = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 1000, height: 800 }), scrollTo() {}, scrollLeft: 0, scrollTop: 0 };
  const calls = { pin: [], component: [], selection: [] };
  let props = { circuit, definitions: [definition], layout: fixture(), selection: null, labelsVisible: true, zoom: 1,
    onSelect: value => calls.selection.push(value), onZoom() {}, onMovePin: (...args) => calls.pin.push(args), onMoveComponent: (...args) => calls.component.push(args) };
  const jsx = (type, props, key) => ({ type, props, key });
  const module = { exports: {} };
  vm.runInNewContext(source("components/electronics/Breadboard.tsx"), {
    module, exports: module.exports,
    requestAnimationFrame(callback) { const id = ++frameId; frames.set(id, callback); return id; }, cancelAnimationFrame(id) { frames.delete(id); },
    window: { addEventListener(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); }, removeEventListener(name, callback) { listeners.get(name)?.delete(callback); } },
    require(name) {
      if (name === "react") return react;
      if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
      if (name.startsWith("@/lib/electronics/")) return library(name.split("/").at(-1));
      throw Error(`Unexpected dependency ${name}`);
    },
  }, { filename: "Breadboard.tsx" });
  const flush = () => {
    for (let count = 0; dirty; count++) {
      assert.ok(count < 10, "Hook updates settle");
      dirty = false; cursor = 0; renderCount++;
      tree = module.exports.Breadboard(props);
      for (const node of walk(tree)) if (node.props.ref) node.props.ref.current = node.type === "svg" ? nativeSvg : nativeScroller;
      for (const effect of effects.splice(0)) effect();
    }
    return tree;
  };
  const event = (holeId = "B1:B10", extra = {}) => {
    const point = props.layout.board.holes.find(hole => hole.id === holeId);
    assert.ok(point);
    return { button: 0, pointerId: 1, clientX: point.x, clientY: point.y, currentTarget: captureTarget, stopped: false, prevented: false,
      stopPropagation() { this.stopped = true; }, preventDefault() { this.prevented = true; }, ...extra };
  };
  flush();
  return {
    calls, captures, frames, event, flush,
    get tree() { return tree; }, get props() { return props; }, get renderCount() { return renderCount; },
    svg: () => select(tree, node => node.type === "svg"),
    pin: (id = "R1.1") => select(tree, node => node.props["data-component-pin"] === id),
    body: () => select(tree, node => node.props["data-board-layer"] === "resistor"),
    hole: id => select(tree, node => node.type === "g" && node.props["aria-label"]?.startsWith(`${id} ·`)),
    update(changes) { props = { ...props, ...changes }; dirty = true; return flush(); },
    frame() { const pending = [...frames.values()]; frames.clear(); for (const callback of pending) callback(); return flush(); },
    windowEvent(name, value) { for (const callback of listeners.get(name) ?? []) callback(value); flush(); },
    start(node) {
      const down = event();
      this.svg().props.onPointerDownCapture(down);
      node.props.onPointerDown(down);
      if (!down.stopped && node !== this.body()) this.body().props.onPointerDown(down);
      flush(); return down;
    },
    move(holeId, extra) { const value = event(holeId, extra); this.svg().props.onPointerMove(value); return value; },
    up(holeId = "B1:B10") { this.svg().props.onPointerUp(event(holeId)); flush(); },
    click(node) { const value = event(); this.svg().props.onClickCapture(value); if (!value.stopped) node.props.onClick?.(value); flush(); return value; },
  };
}

test("pin and body pointer targets stop bubbling and dispatch different movement callbacks", () => {
  const h = harness();
  const pinDown = h.start(h.pin());
  assert.equal(pinDown.stopped, true);
  assert.equal(h.captures.has(1), true);
  h.move("B1:C11"); h.up("B1:C11");
  assert.deepEqual(h.calls.pin, [["R1", "B1:C11", "1"]]);
  assert.deepEqual(h.calls.component, []);
  assert.equal(h.captures.size, 0);
  const bodyDown = h.start(h.body());
  assert.equal(bodyDown.stopped, true);
  h.move("B1:D20"); h.up("B1:D20");
  assert.deepEqual(h.calls.component, [["R1", "B1:D20", "1"]]);
  assert.equal(h.calls.pin.length, 1);
});

test("single-pin preview moves only its endpoint while the other lead and saved layout stay fixed", () => {
  const h = harness();
  const original = JSON.stringify(h.props.layout);
  const dot = id => select(h.pin(id), node => node.type === "circle" && node.props.r === 4);
  const other = dot("R1.2");
  const anchor = dot("R1.1");
  h.start(h.pin()); h.move("B1:C11"); h.frame();
  const moved = dot("R1.1"), unchanged = dot("R1.2");
  assert.equal(moved.props.cx, anchor.props.cx + 18);
  assert.equal(moved.props.cy, anchor.props.cy + 18);
  assert.equal(unchanged.props.cx, other.props.cx);
  assert.equal(unchanged.props.cy, other.props.cy);
  assert.equal(h.body().props.transform, undefined, "The body group does not translate the untouched endpoint");
  assert.equal(JSON.stringify(h.props.layout), original);
  assert.equal(h.calls.pin.length, 0, "A preview is not committed before pointerup");
});

test("rapid pointer moves share one animation frame and pointerup commits the latest move before that frame", () => {
  const h = harness();
  h.start(h.pin());
  const renders = h.renderCount;
  h.move("B1:B11"); h.move("B1:C12"); h.move("B1:D13");
  assert.equal(h.frames.size, 1);
  h.flush();
  assert.equal(h.renderCount, renders, "No preview render before the scheduled frame");
  h.up("B1:D13");
  assert.deepEqual(h.calls.pin, [["R1", "B1:D13", "1"]]);
  assert.equal(h.frames.size, 0, "Pointerup cancels a pending obsolete preview");
  h.frame();
  assert.equal(h.calls.pin.length, 1);
});

test("Escape, blur, pointercancel and lost capture cancel the edit and suppress only the trailing click", () => {
  for (const reason of ["escape", "blur", "cancel", "lost"]) {
    const h = harness();
    h.start(h.pin()); h.move("B1:C11");
    if (reason === "escape") h.windowEvent("keydown", h.event("B1:C11", { key: "Escape" }));
    if (reason === "blur") h.windowEvent("blur", h.event());
    if (reason === "cancel") h.svg().props.onPointerCancel(h.event());
    if (reason === "lost") { h.captures.clear(); h.svg().props.onLostPointerCapture(h.event()); }
    h.flush(); h.up("B1:C11"); h.frame();
    assert.equal(h.calls.pin.length, 0, reason);
    assert.equal(h.calls.component.length, 0, reason);
    assert.equal(h.frames.size, 0, reason);
    assert.equal(h.captures.size, 0, reason);
    const trailing = h.click(h.body());
    assert.equal(trailing.stopped, true, reason);
    assert.equal(trailing.prevented, true, reason);
    assert.equal(h.calls.selection.length, 0, reason);
    h.click(h.body());
    assert.equal(h.calls.selection.length, 1, "The next intentional click still selects the component");
  }
});

test("hover and drag reuse all contact elements, while selection and occupancy changes refresh their visible state", () => {
  const h = harness();
  const contacts = () => [...walk(h.tree)].filter(node => node.type === "g" && /^B1:[A-JTB+-]+\d+ ·/.test(node.props["aria-label"] ?? ""));
  const initial = contacts();
  assert.equal(initial.length, 830);
  h.hole("B1:A1").props.onMouseMove(h.event("B1:A1")); h.frame();
  assert.ok(select(h.tree, node => node.props.className === "el-board-tooltip"));
  assert.ok(contacts().every((node, index) => node === initial[index]), "Hover preserves all 830 contact elements");
  h.start(h.pin()); h.move("B1:C11"); h.frame();
  assert.ok(contacts().every((node, index) => node === initial[index]), "Drag preview preserves all 830 contact elements");
  h.svg().props.onPointerCancel(h.event()); h.flush();
  h.update({ selection: { type: "hole", id: "B1:A1" } });
  const selected = h.hole("B1:A1");
  assert.notEqual(selected, initial[0]);
  assert.ok([...walk(selected)].some(node => node.type === "circle" && node.props.r === 8), "Selected conductive group is highlighted");
  const oldContact = h.hole("B1:B10");
  assert.match(oldContact.props["aria-label"], /사용 중/);
  h.update({ layout: { ...h.props.layout, placements: [{ componentId: "R1", pins: { 1: "B1:B11", 2: "B1:B14" } }] } });
  assert.notEqual(h.hole("B1:B10"), oldContact);
  assert.match(h.hole("B1:B10").props["aria-label"], /빈 구멍/);
  assert.match(h.hole("B1:B11").props["aria-label"], /사용 중/);
});

test("probe picking selects a component contact without moving the lead or selecting its body", () => {
  const h = harness(), picked = [];
  h.update({ onHolePick: holeId => picked.push(holeId), holePickLabel: "CH1 측정 위치 선택" });
  h.start(h.pin()); h.move("B1:C11"); h.up("B1:C11");
  const click = h.click(h.pin());
  assert.equal(click.stopped, true);
  assert.deepEqual(picked, ["B1:B10"]);
  assert.equal(h.calls.pin.length, 0); assert.equal(h.calls.component.length, 0);
  assert.equal(h.calls.selection.length, 0); assert.equal(h.captures.size, 0);
  const key = h.event("B1:B14", { key: "Enter" });
  h.pin("R1.2").props.onKeyDown(key);
  assert.equal(key.stopped, true); assert.equal(key.prevented, true);
  assert.deepEqual(picked, ["B1:B10", "B1:B14"]);
});

test("external instrument contacts can be probed by mouse or keyboard without dragging the terminal", () => {
  const h = harness(), picked = [], moved = [];
  h.update({ circuit: { ...circuit, instruments: [{ id: "probe", instrument: "scope", port: "CH1", netId: "OUT" }] },
    layout: { ...h.props.layout, terminals: [{ connectionId: "probe", netId: "OUT", holeId: "B1:A14" }] },
    onHolePick: holeId => picked.push(holeId), onMoveTerminal: (...args) => moved.push(args) });
  const terminal = () => select(h.tree, node => node.props["data-board-layer"] === "instrument");
  terminal().props.onPointerDown(h.event("B1:A14"));
  h.move("B1:A20"); h.up("B1:A20"); h.click(terminal());
  terminal().props.onKeyDown(h.event("B1:A14", { key: "Enter" }));
  assert.deepEqual(picked, ["B1:A14", "B1:A14"]);
  assert.equal(moved.length, 0); assert.equal(h.calls.selection.length, 0);
});

test("board buttons activate on Space and prevent page scrolling", () => {
  const h = harness();
  const bodyKey = h.event("B1:B10", { key: " " });
  h.body().props.onKeyDown(bodyKey);
  assert.equal(bodyKey.prevented, true);
  assert.equal(h.calls.selection.at(-1).type, "component");
  const picked = [];
  h.update({ onHolePick: holeId => picked.push(holeId) });
  const holeKey = h.event("B1:A14", { key: " " });
  h.hole("B1:A14").props.onKeyDown(holeKey);
  assert.equal(holeKey.prevented, true);
  assert.deepEqual(picked, ["B1:A14"]);
});

test("channel markers follow their physical holes without blocking contact clicks", () => {
  const h = harness();
  h.update({ probeMarkers: [{ holeId: "B1:B10", label: "CH1", color: "#d49124" }, { holeId: "B1:B14", label: "CH2", color: "#3c8ed4" }] });
  const marker = select(h.tree, node => node.props["data-probe-marker"] === "CH2");
  const hole = h.props.layout.board.holes.find(hole => hole.id === "B1:B14");
  assert.equal(marker.props.pointerEvents, "none");
  const ring = select(marker, node => node.type === "circle");
  assert.equal(ring.props.cx, hole.x); assert.equal(ring.props.cy, hole.y);
});


test("TO-18 formed pin contacts stop pointer propagation and preserve body dragging", () => {
  const h = harness();
  const { COMPONENT_CATALOG: definitions } = library("catalog");
  const { BC109C_DEFINITION_ID, BC109C_FORMED_PROFILE } = library("physical-profiles");
  const formed = { ...circuit, components: [{ id: "Q1", definitionId: BC109C_DEFINITION_ID, value: "BC109C", physicalProfile: BC109C_FORMED_PROFILE, pinNets: { 1: "E", 2: "B", 3: "C" } }], netNames: { E: "E", B: "B", C: "C" } };
  const layout = library("engine").createLayout(formed, definitions, { boards: 1, railMode: "split" });
  h.update({ circuit: formed, definitions, layout });
  const pin = h.pin("Q1.1"), event = h.event(layout.placements[0].pins["1"]);
  pin.props.onPointerDown(event);
  assert.equal(event.stopped, true);
  h.up();
  assert.equal(h.calls.pin.length, 0);
  assert.equal(h.calls.component.length, 0);
  const body = select(h.tree, node => node.props["data-board-layer"] === "semiconductor");
  body.props.onPointerDown(h.event(layout.placements[0].pins["1"]));
  h.flush();
  h.move("B1:C20");
  h.up("B1:C20");
  assert.equal(h.calls.component.length, 1);
});
