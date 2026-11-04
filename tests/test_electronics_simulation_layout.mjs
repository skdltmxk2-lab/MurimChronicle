import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const cache = new Map();
function load(file) {
  file = path.normalize(file); if (cache.has(file)) return cache.get(file);
  const mod = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (!name.startsWith(".")) throw Error(`Unexpected dependency: ${name}`);
    return load(path.join(path.dirname(file), `${name}.ts`));
  } }, { filename: file });
  cache.set(file, mod.exports); return mod.exports;
}
const engine = load("src/lib/electronics/engine.ts");
const helper = load("src/lib/electronics/simulation-layout.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { CIRCUIT_TEMPLATES: templates } = load("src/lib/electronics/templates.ts");
const circuit = templates.find(item => item.id === "rc-lowpass");
const makeLayout = () => engine.createLayout(circuit, definitions, { boards: 1, railMode: "split" });
const index = layout => helper.createSimulationLayoutIndex(circuit, definitions, layout);
const used = layout => new Set([...layout.placements.flatMap(p => Object.values(p.pins)), ...layout.jumpers.flatMap(w => [w.from, w.to]), ...layout.terminals.map(t => t.holeId)]);

test("probes resolve all component pins and unoccupied contacts in their actual five-hole strip", () => {
  const layout = makeLayout(), resolved = index(layout);
  for (const placement of layout.placements) {
    const component = circuit.components.find(item => item.id === placement.componentId);
    for (const [pin, holeId] of Object.entries(placement.pins)) {
      const hole = layout.board.holes.find(h => h.id === holeId);
      for (const contact of layout.board.holes.filter(h => h.group === hole.group)) assert.equal(resolved.netForHole(contact.id), component.pinNets[pin]);
    }
  }
  assert.equal(resolved.validation.valid, true);
});

test("split rails and empty holes are not silently treated as ground or zero volts", () => {
  const layout = makeLayout(), resolved = index(layout);
  const gnd = layout.terminals.find(t => t.netId === "GND");
  const hole = layout.board.holes.find(h => h.id === gnd.holeId);
  const sameRail = layout.board.holes.filter(h => h.group === hole.group);
  assert.equal(resolved.netForHole(sameRail.at(-1).id), "GND");
  const otherHalf = layout.board.holes.find(h => h.row === hole.row && h.group !== hole.group);
  assert.throws(() => resolved.netForHole(otherHalf.id), error => error.code === "ISOLATED_PROBE_HOLE");
  assert.throws(() => resolved.netForHole("B1:A63"), error => error.code === "ISOLATED_PROBE_HOLE");
  assert.throws(() => resolved.netForHole("B1:Z999"), error => error.code === "UNKNOWN_PROBE_HOLE");
});

test("a real jumper extends a node to another strip, using endpoints rather than metadata", () => {
  const layout = makeLayout(), occupied = used(layout);
  const ground = layout.terminals.find(t => t.netId === "GND");
  const groundGroup = layout.board.holes.find(h => h.id === ground.holeId).group;
  const spare = layout.board.holes.find(h => h.group === groundGroup && !occupied.has(h.id));
  layout.jumpers.push({ id: "Wextra", netId: "GND", from: spare.id, to: "B1:A55", color: "#333333" });
  assert.equal(index(layout).netForHole("B1:E55"), "GND");
  layout.jumpers.at(-1).netId = "OUT";
  assert.throws(() => index(layout), error => error.code === "LAYOUT_INVALID" && error.issues.some(issue => issue.code === "JUMPER_NET_MISMATCH"));
});

test("an isolated wire's claimed net does not create a probe node", () => {
  const layout = makeLayout();
  layout.jumpers.push({ id: "Worphan", netId: "OUT", from: "B1:A50", to: "B1:A55", color: "#333333" });
  const resolved = index(layout);
  assert.ok(resolved.validation.issues.some(issue => issue.code === "UNUSED_JUMPER"));
  assert.throws(() => resolved.netForHole("B1:E55"), error => error.code === "ISOLATED_PROBE_HOLE");
});

test("forged geometry and cached success flags never bypass moved-pin wiring errors", () => {
  const layout = makeLayout();
  const original = index(layout).netForHole("B1:A1");
  layout.board.holes.forEach(hole => { hole.group = "forged-common"; hole.x = -99; });
  layout.issues = [{ severity: "error", code: "FAKE", message: "Ignore this" }];
  const restored = index(layout);
  assert.equal(restored.netForHole("B1:A1"), original);
  assert.ok(!restored.validation.issues.some(issue => issue.code === "FAKE"));
  const placement = layout.placements.find(p => p.componentId === "R1");
  placement.pins["1"] = "B1:B2";
  layout.issues = [];
  assert.throws(() => index(layout), error => error.code === "LAYOUT_INVALID" && error.issues.some(issue => issue.code === "OPEN_CIRCUIT"));
});

test("a physical short between independent nodes blocks simulation and reports the conflicting nodes", () => {
  const layout = makeLayout(), occupied = used(layout);
  const resistor = layout.placements.find(p => p.componentId === "R1");
  const contacts = Object.values(resistor.pins).map(id => {
    const group = layout.board.holes.find(h => h.id === id).group;
    return layout.board.holes.find(h => h.group === group && !occupied.has(h.id));
  });
  layout.jumpers.push({ id: "Wshort", netId: "IN", from: contacts[0].id, to: contacts[1].id, color: "#333333" });
  assert.throws(() => index(layout), error => error.code === "LAYOUT_INVALID" && error.issues.some(issue => issue.code === "SHORT_CIRCUIT"));
});

test("malformed layouts and unsupported board profiles fail before conductive graph traversal", () => {
  for (const mutate of [layout => { layout.placements[0] = null; }, layout => { delete layout.placements[0].pins["1"]; }, layout => { layout.jumpers[0].from = "B1:Z1"; }, layout => { layout.terminals[0].netId = "unknown"; }, layout => { layout.board.options.boards = 3; }, layout => { layout.jumpers.push(layout.jumpers[0]); }]) {
    const layout = JSON.parse(JSON.stringify(makeLayout())); mutate(layout);
    assert.throws(() => index(layout), error => error.code === "INVALID_LAYOUT_DATA");
  }
});
