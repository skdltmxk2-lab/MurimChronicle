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
  const nativeSvg = { ...captureTarget, getScreenCTM: () => ({ inverse: () => ({}) }), createSVGPoint: () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }),
    querySelector(selector) {
      const id = selector.match(/^\[data-board-hole="(.+)"\]$/)?.[1];
      const node = [...walk(tree)].find(item => item.props["data-board-hole"] === id);
      return node ? { focus: () => node.props.onFocus() } : null;
    },
  };
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

const elements = (tree, attribute) => [...walk(tree)].filter(node => node.props[attribute] !== undefined);
const highlighted = h => elements(h.tree, "data-connected-hole").map(node => node.props["data-connected-hole"]);
const textIn = node => Array.isArray(node) ? node.map(textIn).join(" ") : node?.props ? textIn(node.props.children) : typeof node === "string" || typeof node === "number" ? String(node) : "";
const hover = (h, id) => { h.hole(id).props.onMouseMove(h.event(id)); h.frame(); };

test("every signal column has two coordinate labels located on the engine's actual holes", () => {
  const h = harness();
  const labels = elements(h.tree, "data-signal-column");
  assert.equal(labels.length, 126);
  for (const row of ["A", "J"]) for (let column = 1; column <= 63; column++) {
    const label = labels.find(node => node.props["data-signal-column"] === `1:${row}:${column}`);
    assert.ok(label);
    const hole = h.props.layout.board.holes.find(item => item.id === `B1:${row}${column}`);
    assert.equal(label.props.x, hole.x);
    assert.equal(label.props.children, column);
  }
});

test("rail numbers use their own 50-contact coordinates including the five-hole spacing gaps", () => {
  const h = harness();
  const labels = elements(h.tree, "data-rail-column");
  assert.equal(labels.length, 100);
  for (const row of ["T+", "B+"]) for (let column = 1; column <= 50; column++) {
    const label = labels.find(node => node.props["data-rail-column"] === `1:${row}:${column}`);
    const hole = h.props.layout.board.holes.find(item => item.id === `B1:${row}${column}`);
    assert.equal(label.props.x, hole.x);
    assert.equal(label.props.children, column);
  }
  assert.notEqual(labels[0].props.x, elements(h.tree, "data-signal-column")[0].props.x);
  const rail5 = labels.find(node => node.props["data-rail-column"] === "1:T+:5");
  const rail6 = labels.find(node => node.props["data-rail-column"] === "1:T+:6");
  assert.equal(rail6.props.x - rail5.props.x, 36);
});

test("signal hover highlights exactly its five-hole internal strip and preserves contact elements", () => {
  const h = harness();
  const original = elements(h.tree, "data-board-hole");
  hover(h, "B1:C7");
  assert.deepEqual(highlighted(h), ["B1:A7", "B1:B7", "B1:C7", "B1:D7", "B1:E7"]);
  assert.ok(elements(h.tree, "data-board-hole").every((node, index) => node === original[index]));
  const tooltip = select(h.tree, node => node.props.className === "el-board-tooltip");
  assert.match(textIn(tooltip), /B1:C7.*빵판 내부 연결 5홀/s);
  for (const id of highlighted(h)) assert.ok(textIn(tooltip).includes(id));
  h.hole("B1:C7").props.onMouseLeave(); h.flush();
  assert.equal(highlighted(h).length, 0);
});

test("split rails retain separate 25-hole groups and visible break marks", () => {
  const h = harness();
  assert.equal(elements(h.tree, "data-rail-break").length, 4);
  hover(h, "B1:T+25");
  assert.equal(highlighted(h).length, 25);
  assert.ok(highlighted(h).includes("B1:T+1"));
  assert.ok(!highlighted(h).includes("B1:T+26"));
  assert.match(textIn(select(h.tree, node => node.props.className === "el-board-connection")), /B1:T\+1 ~ B1:T\+25/);
  hover(h, "B1:T+26");
  assert.deepEqual(highlighted(h), Array.from({ length: 25 }, (_, index) => `B1:T+${index + 26}`));
});

test("continuous rails show the actual fifty-hole group without split-boundary marks", () => {
  const h = harness();
  h.update({ layout: { ...h.props.layout, board: createBoard({ boards: 1, railMode: "continuous" }) } });
  assert.equal(elements(h.tree, "data-rail-break").length, 0);
  hover(h, "B1:B-26");
  assert.equal(highlighted(h).length, 50);
  assert.deepEqual(highlighted(h), Array.from({ length: 50 }, (_, index) => `B1:B-${index + 1}`));
});

test("focus and arrow navigation inspect adjacent actual holes and Enter preserves selection", () => {
  const h = harness();
  // The one Tab stop is the first hole the crop shows (column 7 here), not a hidden hole 1.
  const stops = elements(h.tree, "data-board-hole").filter(node => node.props.tabIndex === 0).map(node => node.props["data-board-hole"]);
  assert.deepEqual(stops, ["B1:A7"]);
  assert.equal(h.hole("B1:A8").props.tabIndex, -1);
  h.hole("B1:A7").props.onFocus(); h.flush();
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], "B1:A7");
  const down = h.event("B1:A7", { key: "ArrowDown" });
  h.hole("B1:A7").props.onKeyDown(down); h.flush();
  assert.equal(down.prevented, true);
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], "B1:B7");
  h.hole("B1:B7").props.onKeyDown(h.event("B1:B7", { key: "ArrowRight" })); h.flush();
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], "B1:B8");
  h.hole("B1:B8").props.onKeyDown(h.event("B1:B8", { key: "Enter" })); h.flush();
  assert.deepEqual(JSON.parse(JSON.stringify(h.calls.selection)), [{ type: "hole", id: "B1:B8" }]);
  h.hole("B1:B8").props.onBlur(); h.flush();
  assert.equal(highlighted(h).length, 0);
  // On the whole board Tab enters at hole 1 as before.
  select(h.tree, node => node.type === "button" && textIn(node) === "전체 빵판").props.onClick(); h.flush();
  assert.deepEqual(elements(h.tree, "data-board-hole").filter(node => node.props.tabIndex === 0).map(node => node.props["data-board-hole"]), ["B1:A1"]);
});

test("two boards isolate identically numbered strips and expose both complete coordinate axes", () => {
  const h = harness();
  h.update({ layout: { ...h.props.layout, board: createBoard({ boards: 2, railMode: "split" }) } });
  assert.equal(elements(h.tree, "data-signal-column").length, 252);
  assert.equal(elements(h.tree, "data-rail-column").length, 200);
  hover(h, "B2:A7");
  assert.deepEqual(highlighted(h), ["B2:A7", "B2:B7", "B2:C7", "B2:D7", "B2:E7"]);
});

test("jumper endpoints are listed separately while internal-strip highlighting excludes remote endpoints", () => {
  const h = harness();
  h.update({ layout: { ...h.props.layout, jumpers: [{ id: "J1", netId: "IN", from: "B1:A10", to: "B1:F12", color: "#777" }] } });
  hover(h, "B1:B10");
  assert.deepEqual(highlighted(h), ["B1:A10", "B1:B10", "B1:C10", "B1:D10", "B1:E10"]);
  const detail = select(h.tree, node => node.props.className === "el-board-connection");
  assert.match(textIn(detail), /빵판 내부 연결 5홀/);
  assert.match(textIn(detail), /꽂힌 소자·단자.*R1\.1/s);
  assert.match(textIn(detail), /점퍼 연결.*J1.*B1:A10 ↔ B1:F12/s);
  h.update({ wiresVisible: false });
  hover(h, "B1:A10");
  assert.match(textIn(select(h.tree, node => node.props.className === "el-board-connection")), /점퍼 연결.*B1:F12/s);
});

test("occupied pin hover inspects its physical hole without selecting or moving the component", () => {
  const h = harness();
  h.pin().props.onMouseMove(h.event()); h.frame();
  assert.deepEqual(highlighted(h), ["B1:A10", "B1:B10", "B1:C10", "B1:D10", "B1:E10"]);
  assert.equal(h.calls.selection.length, 0);
  assert.equal(h.calls.pin.length, 0);
  assert.equal(h.calls.component.length, 0);
});

test("board replacement clears hover and focus before displaying a different connectivity profile", () => {
  const h = harness();
  hover(h, "B1:T+25");
  h.hole("B1:T+25").props.onFocus(); h.flush();
  h.update({ layout: { ...h.props.layout, board: createBoard({ boards: 1, railMode: "continuous" }) } });
  assert.equal(highlighted(h).length, 0);
  hover(h, "B1:T+25");
  assert.equal(highlighted(h).length, 50);
});

test("leaving a hovered rail restores the selected strip and exposes GND only on its assigned rail", () => {
  const h = harness();
  h.update({ circuit: { ...circuit, components: [{ ...circuit.components[0], pinNets: { 1: "IN", 2: "GND" } }], netNames: { ...circuit.netNames, GND: "GND" } },
    layout: { ...h.props.layout, placements: [{ componentId: "R1", pins: { 1: "B1:B10", 2: "B1:F10" } }], jumpers: [{ id: "JG", netId: "GND", from: "B1:T-2", to: "B1:F10", color: "#555" }] },
    selection: { type: "hole", id: "B1:A3" } });
  hover(h, "B1:T-2");
  assert.equal(highlighted(h).length, 25);
  assert.match(h.hole("B1:T-2").props["aria-label"], /GND 기준/);
  assert.ok(!h.hole("B1:T-27").props["aria-label"].includes("GND 기준"));
  h.hole("B1:T-2").props.onMouseLeave(); h.flush();
  assert.deepEqual(highlighted(h), ["B1:A3", "B1:B3", "B1:C3", "B1:D3", "B1:E3"]);
});

// ---- Reading aids: hole numbers stay legible under captions, terminal tags, part names and the cropped view ----
const { layoutRailCaptions, terminalLabelOffset, partLabelBaseline } = library("board-label-layout");
const electrolytic = { id: "e", name: "Electrolytic", category: "test", description: "fixture", package: "Radial", kind: "electrolytic", mounting: "direct", pinoutStatus: "generic", pins: [{ id: "1", label: "+" }, { id: "2", label: "−" }] };
const attr = (node, name) => node.props[name];
const textNodes = tree => [...walk(tree)].filter(node => node.type === "text");
// Conservative text box in SVG units; text-anchor is "middle" for every number and terminal tag.
const textBox = node => {
  const size = Number(attr(node, "fontSize")), length = String(textIn(node.props.children)).length;
  return { x1: attr(node, "x") - length * size * 0.31, x2: attr(node, "x") + length * size * 0.31, y1: attr(node, "y") - size, y2: attr(node, "y") + 1 };
};
const rectOf = group => { const rect = [...walk(group)].find(node => node.type === "rect"); return { x1: rect.props.x, x2: rect.props.x + rect.props.width, y1: rect.props.y, y2: rect.props.y + rect.props.height }; };
const intersects = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

function railScene() {
  const scene = { ...circuit, components: [{ id: "R1", definitionId: "r", value: "10k", pinNets: { 1: "VCC", 2: "GND" } }],
    instruments: [{ id: "X1", instrument: "dc", port: "COM", netId: "GND", setting: "" }, { id: "X2", instrument: "dc", port: "+", netId: "VCC", setting: "" }, { id: "X3", instrument: "dc", port: "+", netId: "VCC", setting: "" }],
    netNames: { VCC: "+9V", GND: "GND" } };
  const layout = { ...fixture(), placements: [{ componentId: "R1", pins: { 1: "B1:B10", 2: "B1:B14" } }],
    jumpers: [{ id: "J1", netId: "VCC", from: "B1:T+3", to: "B1:A10", color: "#c33" }, { id: "J2", netId: "GND", from: "B1:T-3", to: "B1:A14", color: "#333" }],
    terminals: [{ connectionId: "X1", holeId: "B1:T-8", netId: "GND" }, { connectionId: "X2", holeId: "B1:J20", netId: "VCC" }, { connectionId: "X3", holeId: "B1:A30", netId: "VCC" }] };
  return { circuit: scene, layout };
}

test("coordinate numbers and letters are the topmost layer and never intercept the pointer", () => {
  const h = harness(); h.update(railScene());
  const order = [...walk(h.tree)];
  const first = (predicate) => order.findIndex(predicate), last = predicate => order.findLastIndex(predicate);
  const overlay = first(node => attr(node, "data-board-labels") !== undefined);
  assert.ok(overlay > 0);
  assert.equal(attr(order[overlay], "pointerEvents"), "none");
  for (const [name, predicate] of [["jumpers", node => attr(node, "data-board-layer") === "jumper"], ["parts", node => attr(node, "data-board-layer") === "resistor"],
    ["rail captions", node => attr(node, "data-rail-label") !== undefined], ["instrument terminals", node => attr(node, "data-board-layer") === "instrument"]]) {
    assert.ok(last(predicate) >= 0, `${name} are rendered`);
    assert.ok(last(predicate) < overlay, `${name} are drawn before the coordinate overlay`);
  }
  for (const label of ["data-signal-column", "data-rail-column"]) for (const node of order.filter(item => attr(item, label) !== undefined)) assert.equal(attr(node, "stroke"), "#fafafa", "numbers carry a halo so they stay legible over wires");
  assert.equal(elements(h.tree, "data-signal-column").length, 126);
  assert.equal(elements(h.tree, "data-rail-column").length, 100);
});

test("rail captions sit in the lane between their two rail rows and never cover a hole number or terminal tag", () => {
  const h = harness(); h.update(railScene());
  const tree = h.flush(), captions = elements(tree, "data-rail-label");
  assert.deepEqual(captions.map(node => attr(node, "data-rail-caption-row")).sort(), ["1:T+", "1:T-"]);
  const holes = h.props.layout.board.holes, rowY = id => holes.find(hole => hole.id === id).y;
  const numbers = [...elements(tree, "data-signal-column"), ...elements(tree, "data-rail-column")].map(textBox);
  const tags = textNodes(tree).filter(node => /^T\d$/.test(String(textIn(node.props.children)))).map(textBox);
  assert.equal(tags.length, 3, "every instrument terminal has its tag");
  const boxes = captions.map(rectOf);
  for (const box of boxes) {
    assert.ok(box.y1 > rowY("B1:T+1") + 2 && box.y2 < rowY("B1:T-1") - 2, "the caption fits between the two rail rows");
    for (const number of numbers) assert.equal(intersects(box, number), false, "caption covers a hole number");
    for (const tag of tags) assert.equal(intersects(box, tag), false, "caption covers a terminal tag");
  }
  assert.equal(intersects(boxes[0], boxes[1]), false, "the two captions do not overlap");
  const text = captions.map(node => textIn([...walk(node)].find(item => item.type === "text").props.children));
  assert.ok(text.some(value => /^T\+ · .*9V/.test(value)) && text.some(value => /^T- · GND · 0V/.test(value)), `captions name their own rail row: ${text}`);
});

test("terminal tags move off the hole-number lines: rail tags into the lane, row J upward, row A downward", () => {
  const h = harness(); h.update(railScene());
  const tree = h.flush(), at = id => holes => holes.find(hole => hole.id === id), holes = h.props.layout.board.holes;
  const tag = reference => textNodes(tree).find(node => String(textIn(node.props.children)) === reference);
  assert.equal(attr(tag("T1"), "y"), at("B1:T-8")(holes).y + terminalLabelOffset("T-"));
  assert.equal(attr(tag("T2"), "y"), at("B1:J20")(holes).y + terminalLabelOffset("J"));
  assert.equal(attr(tag("T3"), "y"), at("B1:A30")(holes).y + terminalLabelOffset("A"));
  const numbers = [...elements(tree, "data-signal-column"), ...elements(tree, "data-rail-column")].map(textBox);
  for (const reference of ["T1", "T2", "T3"]) for (const number of numbers) assert.equal(intersects(textBox(tag(reference)), number), false, `${reference} lands on a hole number`);
});

test("the cropped view repeats off-screen row letters, with their board, at the visible edges", () => {
  const h = harness();
  h.update({ layout: { ...fixture(), placements: [{ componentId: "R1", pins: { 1: "B1:B40", 2: "B1:B44" } }] } });
  const view = () => String(attr(h.svg(), "viewBox")).split(" ").map(Number);
  let [x, , width] = view();
  assert.ok(x > 500, "the crop starts far from the board's left edge");
  const edges = elements(h.tree, "data-row-letter-edge");
  assert.equal(edges.length, 28, "10 signal rows + 4 rail rows, on both sides");
  for (const node of edges) { const box = rectOf(node); assert.ok(box.x1 >= x && box.x2 <= x + width, "the edge letter is inside the visible crop"); }
  assert.equal(edges.map(node => textIn([...walk(node)].find(item => item.type === "text").props.children)).filter(value => /^[A-J]$/.test(value)).length, 20);
  // The full board shows the real letters at the board edges instead.
  select(h.tree, node => node.type === "button" && textIn(node) === "전체 빵판").props.onClick(); h.flush();
  assert.equal(elements(h.tree, "data-row-letter-edge").length, 0);
  assert.equal(textNodes(h.tree).filter(node => textIn(node.props.children) === "A" && attr(node, "fontSize") === 10).length, 2);
  // A crop that already includes the board edge keeps its own left letters and only repeats the right side.
  h.update({ layout: { ...fixture(), placements: [{ componentId: "R1", pins: { 1: "B1:B1", 2: "B1:B5" } }] } });
  select(h.tree, node => node.type === "button" && textIn(node) === "사용 영역").props.onClick(); h.flush();
  [x, , width] = view();
  assert.equal(x, 0);
  const remaining = elements(h.tree, "data-row-letter-edge").map(node => attr(node, "data-row-letter-edge"));
  assert.ok(remaining.length === 14 && remaining.every(value => value.endsWith(":right")), remaining.join());
});

test("with two boards every repeated edge letter names its board", () => {
  const h = harness();
  h.update({ layout: { ...fixture(), board: createBoard({ boards: 2, railMode: "split" }), placements: [{ componentId: "R1", pins: { 1: "B1:B40", 2: "B1:B44" } }] } });
  const labels = elements(h.tree, "data-row-letter-edge").map(node => textIn([...walk(node)].find(item => item.type === "text").props.children));
  assert.ok(labels.includes("B1·A") && labels.includes("B2·J") && labels.includes("B1·T+") && labels.includes("B2·B-"), labels.join());
});

test("a part name that would land on the column numbers rests on row A instead", () => {
  const h = harness();
  const base = { ...circuit, components: [{ id: "C1", definitionId: "e", value: "10u", pinNets: { 1: "IN", 2: "OUT" } }] };
  const place = pins => ({ ...fixture(), placements: [{ componentId: "C1", pins }] });
  const nameY = () => attr(textNodes(h.flush()).find(node => String(textIn(node.props.children)) === "C1" && attr(node, "fontSize") === 10.5), "y");
  h.update({ circuit: base, definitions: [electrolytic], layout: place({ 1: "B1:B10", 2: "B1:B12" }) });
  assert.equal(nameY(), 68, "the 30-unit offset would be 60, inside the number band (A row 72)");
  h.update({ layout: place({ 1: "B1:C10", 2: "B1:C12" }) });
  assert.equal(nameY(), 78, "a part one row lower keeps its normal offset");
  h.update({ layout: place({ 1: "B1:H10", 2: "B1:H12" }) });
  assert.equal(nameY(), 204, "bottom-half parts are untouched");
});

test("label layout helpers: captions queue without overlap and avoid blocked spans, tags and part names follow their rules", () => {
  const placed = layoutRailCaptions([
    { id: "plus", lane: "1:T", order: 0, startX: 66, width: 60 }, { id: "minus", lane: "1:T", order: 1, startX: 66, width: 80 },
    { id: "bottom", lane: "1:B", order: 0, startX: 66, width: 60 },
  ], { "1:T": [[140, 170]] });
  assert.equal(placed.get("plus"), 66);
  assert.ok(placed.get("minus") >= 170 + 6, "skips the blocked terminal tag and keeps a gap");
  const tight = layoutRailCaptions([{ id: "plus", lane: "1:T", order: 0, startX: 66, width: 60 }], { "1:T": [[130, 160]] });
  assert.equal(tight.get("plus"), 160 + 6, "a caption that would end within the gap of a tag is moved beyond it");
  assert.equal(placed.get("bottom"), 66, "lanes are independent");
  // Property check over deterministic pseudo-random scenes: never overlap each other or any obstacle, never move left.
  let seed = 7; const random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let scene = 0; scene < 300; scene++) {
    const requests = Array.from({ length: 1 + Math.floor(random() * 5) }, (_, index) => ({ id: `c${index}`, lane: "L", order: index % 2, startX: Math.floor(random() * 400), width: 40 + Math.floor(random() * 90) }));
    const obstacles = Array.from({ length: Math.floor(random() * 5) }, () => { const from = Math.floor(random() * 600); return [from, from + 16 + Math.floor(random() * 20)]; });
    const result = layoutRailCaptions(requests, { L: obstacles }), spans = requests.map(item => [result.get(item.id), result.get(item.id) + item.width]);
    requests.forEach((item, index) => {
      assert.ok(result.get(item.id) >= item.startX);
      for (const [from, to] of obstacles) assert.ok(spans[index][1] <= from || spans[index][0] >= to, `scene ${scene}: caption ${item.id} overlaps an obstacle`);
      for (let other = index + 1; other < requests.length; other++) assert.ok(spans[index][1] <= spans[other][0] || spans[index][0] >= spans[other][1], `scene ${scene}: captions overlap`);
    });
  }
  assert.deepEqual(["A", "B", "J", "T+", "T-", "B+", "B-"].map(terminalLabelOffset), [13, 13, -8, 13, -8, 13, -8]);
  assert.deepEqual([[60, 72], [56, 72], [68, 72], [54, 72], [55, 72], [67, 72], [72, 72], [10, undefined]].map(([wanted, row]) => partLabelBaseline(wanted, row)), [68, 68, 68, 54, 55, 68, 72, 10]);
});

test("every connection statement names the generic 830-hole model it is computed from", () => {
  const { describeHoleGroup } = library("board-label-layout");
  const holes = createBoard({ boards: 1, railMode: "split" }).holes;
  assert.equal(describeHoleGroup(holes, "B1:C7"), "내부 연결 5홀: B1:A7 · B1:B7 · B1:C7 · B1:D7 · B1:E7");
  assert.equal(describeHoleGroup(holes, "B1:T-30"), "내부 연결 25홀: B1:T-26 ~ B1:T-50");
  assert.equal(describeHoleGroup(createBoard({ boards: 1, railMode: "continuous" }).holes, "B1:B+7"), "내부 연결 50홀: B1:B+1 ~ B1:B+50");
  assert.equal(describeHoleGroup(holes, "B9:Z99"), "");
  const h = harness();
  hover(h, "B1:C7");
  assert.match(textIn(select(h.tree, node => node.props.className === "el-board-tooltip")), /빵판 내부 연결 5홀 \(일반 830홀 모델\)/);
  assert.match(textIn(select(h.tree, node => node.props.className === "el-board-connection")), /빵판 내부 연결 5홀 \(일반 830홀 모델\)/);
  h.hole("B1:C7").props.onMouseLeave(); h.flush();
  const idle = textIn(select(h.tree, node => node.props.className === "el-board-connection"));
  assert.match(idle, /일반 830홀 모델 기준/); assert.match(idle, /실물 빵판 구조 미확인/);
  hover(h, "B1:T+25");
  const rail = [...walk(h.tree)].find(node => node.type === "title" && /^빵판 내부 연결 B1:T\+1 ~ B1:T\+25/.test(textIn(node.props.children)));
  assert.ok(rail && /일반 830홀 모델/.test(textIn(rail.props.children)), "the rail bar's own tooltip carries the same scope");
});

test("arrow keys stay inside the visible crop, and a keyboard move beats a resting pointer", () => {
  const h = harness();
  // R1 sits at columns 10-14, so the crop shows roughly columns 7-25 of this board.
  const [x, , width] = String(h.svg().props.viewBox).split(" ").map(Number);
  const lastVisible = h.props.layout.board.holes.filter(hole => hole.row === "B" && hole.board === 1 && hole.x <= x + width + 4).at(-1);
  h.hole(lastVisible.id).props.onFocus(); h.flush();
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], lastVisible.id);
  h.hole(lastVisible.id).props.onKeyDown(h.event(lastVisible.id, { key: "ArrowRight" })); h.flush();
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], lastVisible.id, "the next hole is outside the crop, so focus stays");
  // The full board has no such limit.
  select(h.tree, node => node.type === "button" && textIn(node) === "전체 빵판").props.onClick(); h.flush();
  h.hole(lastVisible.id).props.onKeyDown(h.event(lastVisible.id, { key: "ArrowRight" })); h.flush();
  const next = h.props.layout.board.holes.find(hole => hole.board === 1 && hole.row === "B" && hole.column === lastVisible.column + 1);
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], next.id);
  // A pointer resting on one hole does not keep the ring there after the keyboard moves on.
  hover(h, "B1:E40");
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], "B1:E40");
  h.hole("B1:C12").props.onFocus(); h.flush();
  assert.equal(elements(h.tree, "data-inspected-hole")[0].props["data-inspected-hole"], "B1:C12");
  assert.deepEqual(highlighted(h), ["B1:A12", "B1:B12", "B1:C12", "B1:D12", "B1:E12"]);
});
