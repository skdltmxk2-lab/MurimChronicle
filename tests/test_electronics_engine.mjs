import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/electronics/engine.ts", import.meta.url), "utf8");
const powerSource = readFileSync(new URL("../src/lib/electronics/power.ts", import.meta.url), "utf8");
const powerOutput = ts.transpileModule(powerSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const powerModule = { exports: {} };
vm.runInNewContext(powerOutput, { module: powerModule, exports: powerModule.exports, require(name) { throw new Error(`Unexpected dependency: ${name}`); } }, { filename: "electronics/power.ts" });
const profileModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/lib/electronics/physical-profiles.ts", import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { module: profileModule, exports: profileModule.exports });
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) { if (name === "./power") return powerModule.exports; if (name === "./physical-profiles") return profileModule.exports; throw new Error(`Unexpected dependency: ${name}`); } }, { filename: "electronics/engine.ts" });
const { createBoard, createLayout, validateLayout, createAssemblySteps } = mod.exports;

const options = { boards: 1, railMode: "split" };
const definition = (id, kind, count, changes = {}) => ({ id, name: id, category: "test", description: "fixture", package: count === 8 ? "DIP-8" : count === 3 ? "TO-92" : "Axial", kind,
  pins: Array.from({ length: count }, (_, i) => ({ id: String(i + 1), label: String(i + 1) })), mounting: "direct", pinoutStatus: "datasheet", ...changes });
const definitions = [definition("r", "resistor", 2), definition("c", "capacitor", 2), definition("op", "opamp", 8), definition("q", "transistor", 3)];
const component = (id, definitionId, nets) => ({ id, definitionId, value: "fixture", pinNets: Object.fromEntries(nets.map((net, i) => [String(i + 1), net])) });
const circuit = (components, instruments = []) => ({ id: "fixture", title: "fixture", description: "", components, netNames: { VCC: "+5 V", GND: "GND", OUT: "출력" }, instruments, notes: [], reviewItems: [] });
const terminal = (id, netId) => ({ id, instrument: "계측기", port: id, netId });
const divider = circuit([component("R1", "r", ["VCC", "OUT"]), component("R2", "r", ["OUT", "GND"])], [terminal("power", "VCC"), terminal("return", "GND"), terminal("measure", "OUT")]);
const errors = report => report.issues.filter(issue => issue.severity === "error").map(issue => issue.code);
function expectValid(input, layout) {
  const report = validateLayout(input, definitions, layout);
  assert.equal(report.valid, true, JSON.stringify(report.issues));
  return report;
}
function freeInGroup(layout, holeId) {
  const taken = new Set([...layout.placements.flatMap(p => Object.values(p.pins)), ...layout.terminals.map(t => t.holeId), ...layout.jumpers.flatMap(w => [w.from, w.to])]);
  const group = layout.board.holes.find(h => h.id === holeId).group;
  const hole = layout.board.holes.find(h => h.group === group && !taken.has(h.id));
  assert.ok(hole, "fixture needs a free contact");
  return hole.id;
}

test("830 contacts per board; five-hole strips, center trench and all four rail lines remain distinct", () => {
  const board = createBoard({ boards: 2, railMode: "split" });
  assert.equal(board.holes.length, 1660);
  assert.equal(new Set(board.holes.map(hole => hole.id)).size, 1660);
  const get = id => board.holes.find(hole => hole.id === id);
  assert.equal(get("B1:A1").group, get("B1:E1").group);
  assert.notEqual(get("B1:E1").group, get("B1:F1").group);
  assert.notEqual(get("B1:A1").group, get("B1:A2").group);
  assert.notEqual(get("B1:T+1").group, get("B1:T-1").group);
  assert.notEqual(get("B1:T+1").group, get("B2:T+1").group);
});

test("divider is reconstructed from real holes, every lead uses its own contact and terminal has an endpoint", () => {
  const layout = createLayout(divider, definitions, options);
  const report = expectValid(divider, layout);
  assert.equal(report.checkedPins, 4);
  assert.equal(report.checkedNets, 3);
  assert.equal(layout.terminals.length, 3);
  const occupied = [...layout.placements.flatMap(p => Object.values(p.pins)), ...layout.terminals.map(t => t.holeId), ...layout.jumpers.flatMap(w => [w.from, w.to])];
  assert.equal(new Set(occupied).size, occupied.length);
  assert.equal(createAssemblySteps(divider, definitions, layout).length, layout.placements.length + layout.jumpers.length + layout.terminals.length);
  assert.equal(JSON.stringify(layout), JSON.stringify(createLayout(divider, definitions, options)), "deterministic placement");
});

test("RC and a differential instrument measurement preserve separate positive and negative endpoints", () => {
  const input = circuit([component("R1", "r", ["IN", "OUT"]), component("C1", "c", ["OUT", "GND"])], [terminal("AO0", "IN"), terminal("AI0+", "IN"), terminal("AI0-", "OUT"), terminal("AI1+", "OUT"), terminal("AI1-", "GND")]);
  const layout = createLayout(input, definitions, options);
  expectValid(input, layout);
  assert.notEqual(layout.terminals.find(t => t.connectionId === "AI0+").holeId, layout.terminals.find(t => t.connectionId === "AI0-").holeId);
});

test("DIP spans the center trench, numbered pins wrap around and unspecified pins remain isolated", () => {
  const input = circuit([{ id: "U1", definitionId: "op", value: "741", pinNets: { 2: "NEG", 3: "POS", 4: "VEE", 6: "OUT", 7: "VCC" } }, component("R1", "r", ["OUT", "NEG"])], [terminal("supply", "VCC"), terminal("return", "VEE")]);
  const layout = createLayout(input, definitions, options);
  const report = expectValid(input, layout);
  const pins = layout.placements.find(p => p.componentId === "U1").pins;
  assert.match(pins[1], /^B1:F/);
  assert.match(pins[8], /^B1:E/);
  assert.equal(Number(pins[4].split("F")[1]) - Number(pins[1].split("F")[1]), 3);
  assert.equal(report.checkedPins, 10);
  assert.ok(!layout.jumpers.some(w => w.netId.startsWith("__unconnected:")));
});

test("three-lead direct packages preserve the supplied physical pin order on independent strips", () => {
  const input = circuit([component("Q1", "q", ["E", "B", "C"]), component("R1", "r", ["VCC", "C"])], [terminal("GND", "E")]);
  const layout = createLayout(input, definitions, options);
  expectValid(input, layout);
  const pins = layout.placements.find(p => p.componentId === "Q1").pins;
  const holes = [pins[1], pins[2], pins[3]].map(id => layout.board.holes.find(h => h.id === id));
  assert.equal(new Set(holes.map(h => h.group)).size, 3);
  assert.equal(holes[2].column - holes[0].column, 2);
  layout.placements.find(p => p.componentId === "Q1").pins[2] = "B1:C63";
  assert.ok(errors(validateLayout(input, definitions, layout)).includes("PIN_GEOMETRY"));
});

test("removing a tree jumper detects an open despite all net labels being unchanged", () => {
  const layout = createLayout(divider, definitions, options);
  layout.jumpers.shift();
  assert.ok(errors(validateLayout(divider, definitions, layout)).includes("OPEN_CIRCUIT"));
});

test("an extra physical jumper between different target nets detects a short independently of its netId label", () => {
  const layout = createLayout(divider, definitions, options);
  const r1 = layout.placements.find(p => p.componentId === "R1");
  layout.jumpers.push({ id: "bad", netId: "OUT", from: freeInGroup(layout, r1.pins[1]), to: freeInGroup(layout, r1.pins[2]), color: "red" });
  assert.ok(errors(validateLayout(divider, definitions, layout)).includes("SHORT_CIRCUIT"));
});

test("two leads in one hole fail even when their expected net is the same", () => {
  const layout = createLayout(divider, definitions, options);
  const wire = layout.jumpers[0];
  layout.jumpers.push({ ...wire, id: "duplicate-contact" });
  assert.ok(errors(validateLayout(divider, definitions, layout)).includes("OCCUPIED_HOLE"));
});

test("split power rails need a real bridge; continuous rails do not", () => {
  const input = circuit([], [terminal("a", "POWER"), terminal("b", "POWER")]);
  const layout = { board: createBoard(options), placements: [], jumpers: [], terminals: [{ connectionId: "a", holeId: "B1:T+1", netId: "POWER" }, { connectionId: "b", holeId: "B1:T+26", netId: "POWER" }], issues: [] };
  assert.ok(errors(validateLayout(input, definitions, layout)).includes("OPEN_CIRCUIT"));
  layout.jumpers.push({ id: "bridge", netId: "POWER", from: "B1:T+2", to: "B1:T+27", color: "red" });
  expectValid(input, layout);
  layout.jumpers = [];
  layout.board = createBoard({ boards: 1, railMode: "continuous" });
  expectValid(input, layout);
});

test("tampered board group data cannot conceal an open on split rails", () => {
  const input = circuit([], [terminal("a", "POWER"), terminal("b", "POWER")]);
  const layout = { board: createBoard(options), placements: [], jumpers: [], terminals: [{ connectionId: "a", holeId: "B1:T+1", netId: "POWER" }, { connectionId: "b", holeId: "B1:T+26", netId: "POWER" }], issues: [] };
  const left = layout.board.holes.find(h => h.id === "B1:T+1").group;
  for (const hole of layout.board.holes) if (hole.row === "T+") hole.group = left;
  const result = errors(validateLayout(input, definitions, layout));
  assert.ok(result.includes("BOARD_GEOMETRY"));
  assert.ok(result.includes("OPEN_CIRCUIT"));
});

test("unverified pinouts are visible; adapter and external parts are never silently placed as direct parts", () => {
  const custom = [definition("unknown", "transistor", 3, { pinoutStatus: "unverified" }), definition("adapter", "opamp", 8, { mounting: "adapter" }), definition("external", "transformer", 2, { mounting: "external" })];
  const input = circuit([component("Q1", "unknown", ["E", "B", "C"]), component("U1", "adapter", ["A", "B"]), component("T1", "external", ["A", "B"])]);
  const layout = createLayout(input, custom, options);
  const report = validateLayout(input, custom, layout);
  assert.equal(report.valid, false);
  assert.ok(report.issues.some(i => i.code === "PINOUT_UNVERIFIED" && i.componentId === "Q1" && i.severity === "error"));
  assert.equal(report.issues.filter(i => i.code === "UNSUPPORTED_MOUNTING").length, 2);
  assert.equal(layout.placements.length, 1);
});

test("high fanout is routed without reusing holes and excess board demand fails explicitly", () => {
  const input = circuit(Array.from({ length: 16 }, (_, i) => component(`R${i + 1}`, "r", ["VCC", `N${i}`])), [terminal("supply", "VCC")]);
  expectValid(input, createLayout(input, definitions, { boards: 2, railMode: "split" }));
  const oversized = circuit(Array.from({ length: 80 }, (_, i) => component(`R${i + 1}`, "r", ["VCC", `N${i}`])));
  const layout = createLayout(oversized, definitions, options);
  assert.ok(layout.issues.some(i => i.code === "PLACEMENT_CAPACITY"));
  assert.equal(validateLayout(oversized, definitions, layout).valid, false);
});

test("the 80-part limit routes shared buses on two boards without aliasing cached footprints", () => {
  const input = circuit(Array.from({ length: 80 }, (_, i) => component(`C${i + 1}`, "c", [i % 2 ? "BUS" : "VCC", i % 3 ? `N${i}` : "GND"])),
    [terminal("supply", "VCC"), terminal("return", "GND"), terminal("bus", "BUS")]);
  const settings = { boards: 2, railMode: "split" };
  const layout = createLayout(input, definitions, settings);
  const report = expectValid(input, layout);
  assert.equal(layout.placements.length, 80);
  assert.equal(report.checkedPins, 160);
  assert.equal(layout.issues.filter(issue => issue.severity === "error").length, 0);
  assert.equal(new Set(layout.placements.map(placement => placement.pins)).size, 80, "Every part owns its editable pin map");
  const snapshot = JSON.stringify(layout);
  layout.placements[0].pins[1] = "B1:A99";
  assert.equal(JSON.stringify(createLayout(input, definitions, settings)), snapshot, "Editing one project cannot mutate subsequent plans");
});

test("missing physical IC pins and unknown target pins cannot pass validation", () => {
  const input = circuit([component("U1", "op", ["A", "B", "C", "GND", "E", "OUT", "VCC", "H"])]);
  const layout = createLayout(input, definitions, options);
  delete layout.placements[0].pins[7];
  assert.ok(errors(validateLayout(input, definitions, layout)).includes("MISSING_PIN"));
  input.components[0].pinNets[99] = "VCC";
  assert.ok(errors(validateLayout(input, definitions, layout)).includes("UNKNOWN_PIN"));
});

test("a rigid 2.54 mm two-pin header occupies adjacent columns, not a formed radial footprint", () => {
  const part = definition("header", "connector", 2, { package: "Header 2.54mm 1x2" });
  const input = circuit([component("J1", "header", ["A", "B"])]);
  const layout = createLayout(input, [part], options);
  assert.equal(validateLayout(input, [part], layout).valid, true);
  const points = Object.values(layout.placements[0].pins).map(id => layout.board.holes.find(hole => hole.id === id));
  assert.equal(points[1].column - points[0].column, 1);
});

test("published educational templates route with the real catalog on a two-board configuration", () => {
  const load = name => {
    const text = readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8");
    const compiled = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(compiled, { module, exports: module.exports, require(id) { throw new Error(`Unexpected dependency ${id}`); } });
    return module.exports;
  };
  const { COMPONENT_CATALOG } = load("catalog");
  const { CIRCUIT_TEMPLATES } = load("templates");
  assert.ok(CIRCUIT_TEMPLATES.length >= 5);
  for (const input of CIRCUIT_TEMPLATES) {
    const layout = createLayout(input, COMPONENT_CATALOG, { boards: 2, railMode: "split" });
    const report = validateLayout(input, COMPONENT_CATALOG, layout);
    assert.equal(report.valid, true, `${input.id}: ${JSON.stringify(report.issues)}`);
  }
});
