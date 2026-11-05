import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const source = readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(dependency) {
    if (["./power", "./physical-profiles"].includes(dependency)) return load(dependency.slice(2));
    throw Error(`Unexpected dependency: ${dependency}`);
  } }, { filename: `electronics/${name}.ts` });
  cache.set(name, mod.exports); return mod.exports;
}
const { createLayout, validateLayout } = load("engine");
const { getPowerNetRole, getRailUsage } = load("power");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES } = load("templates");
const options = { boards: 1, railMode: "split" };
const template = id => CIRCUIT_TEMPLATES.find(item => item.id === id);
const resistor = (id, a, b) => ({ id, definitionId: "resistor-axial", value: "10 kΩ", pinNets: { 1: a, 2: b } });
const terminal = (id, netId, port = id) => ({ id, netId, port, instrument: "test instrument" });
function circuit(components, instruments = [], names = {}) {
  const nets = [...new Set([...components.flatMap(item => Object.values(item.pinNets)), ...instruments.map(item => item.netId)])];
  return { id: "power-test", title: "Power routing fixture", description: "", components, instruments,
    netNames: Object.fromEntries(nets.map(id => [id, names[id] ?? id])), notes: [], reviewItems: [] };
}
function check(input, layout) {
  const report = validateLayout(input, definitions, layout);
  assert.equal(report.valid, true, JSON.stringify(report.issues));
  const contacts = [...layout.placements.flatMap(item => Object.values(item.pins)), ...layout.terminals.map(item => item.holeId), ...layout.jumpers.flatMap(item => [item.from, item.to])];
  assert.equal(new Set(contacts).size, contacts.length, "Every physical lead needs a distinct contact");
  return report;
}
const holeMap = layout => new Map(layout.board.holes.map(hole => [hole.id, hole]));
const isRail = hole => /^(?:T|B)[+-]$/.test(hole.row);
function assertDirectRailBranches(input, layout) {
  const holes = holeMap(layout);
  for (const placement of layout.placements) {
    const component = input.components.find(item => item.id === placement.componentId);
    for (const [pin, id] of Object.entries(placement.pins)) {
      const net = component.pinNets[pin];
      if (!net || !getPowerNetRole(input, net)) continue;
      const group = holes.get(id).group;
      assert.ok(layout.jumpers.some(wire => {
        const from = holes.get(wire.from), to = holes.get(wire.to);
        return wire.netId === net && ((from.group === group && isRail(to)) || (to.group === group && isRail(from)));
      }), `${component.id}.${pin} (${net}) must branch to a rail instead of a strip-only chain`);
    }
  }
}
function splitBridges(layout) {
  const holes = holeMap(layout);
  return layout.jumpers.filter(wire => {
    const a = holes.get(wire.from), b = holes.get(wire.to);
    return isRail(a) && isRail(b) && a.board === b.board && a.row === b.row && a.group !== b.group;
  });
}

test("passive RC connects ground to a real rail and never invents a positive supply", () => {
  const input = template("rc-lowpass");
  const layout = createLayout(input, definitions, options); check(input, layout);
  const usage = getRailUsage(input, layout);
  assert.ok(usage.length > 0);
  assert.ok(usage.every(item => item.netIds.length === 1 && item.netIds[0] === "GND" && item.row === "T-"));
  assertDirectRailBranches(input, layout);
  for (const terminal of layout.terminals.filter(item => item.netId === "GND")) assert.match(terminal.holeId, /^B1:T-/);
  assert.equal(splitBridges(layout).length, 0, "An unused right half must not force a long bridge");
});

test("single-supply circuit uses separate positive and GND buses including equipment endpoints", () => {
  const input = template("divider");
  const layout = createLayout(input, definitions, options); check(input, layout); assertDirectRailBranches(input, layout);
  assert.match(layout.terminals.find(item => item.connectionId === "ps-positive").holeId, /^B1:T\+/);
  assert.match(layout.terminals.find(item => item.connectionId === "ps-ground").holeId, /^B1:T-/);
  const usage = getRailUsage(input, layout);
  assert.ok(usage.some(item => item.row === "T+" && item.netIds[0] === "VCC"));
  assert.ok(usage.some(item => item.row === "T-" && item.netIds[0] === "GND"));
  assert.ok(usage.every(item => item.netIds.length === 1));
});

test("bipolar 741 keeps negative supply distinct from GND and preserves isolated offset pins", () => {
  const input = template("ua741-inverting");
  const layout = createLayout(input, definitions, options); check(input, layout); assertDirectRailBranches(input, layout);
  const usage = getRailUsage(input, layout);
  const expected = { VCC: "T+", GND: "T-", VEE: "B-" };
  for (const [net, row] of Object.entries(expected)) {
    const selected = usage.filter(item => item.netIds.includes(net));
    assert.ok(selected.length > 0, `${net} needs a real bus`);
    assert.ok(selected.every(item => item.row === row && item.netIds.length === 1));
  }
  assert.match(layout.terminals.find(item => item.connectionId === "ps-negative").holeId, /^B1:B-/);
  assert.ok(!layout.jumpers.some(item => item.netId.startsWith("U1_OPEN")));
});

test("split supply rails use physical bridges only where needed; removing a bridge opens the circuit", () => {
  const input = circuit(Array.from({ length: 20 }, (_, i) => resistor(`R${i + 1}`, "VCC", "GND")), [terminal("positive", "VCC"), terminal("ground", "GND")]);
  const layout = createLayout(input, definitions, options); check(input, layout);
  const bridges = splitBridges(layout);
  assert.ok(bridges.length >= 1, "Fixture must reach both electrically isolated rail halves");
  const broken = { ...layout, jumpers: layout.jumpers.filter(item => item.id !== bridges[0].id) };
  assert.ok(validateLayout(input, definitions, broken).issues.some(item => item.code === "OPEN_CIRCUIT"));
  const continuous = createLayout(input, definitions, { boards: 1, railMode: "continuous" }); check(input, continuous);
  assert.equal(splitBridges(continuous).length, 0);
  assert.ok(continuous.jumpers.length < layout.jumpers.length, "Continuous rails must omit redundant split bridges");
});

test("two-board supply and ground have real cross-board jumpers and distinct contacts", () => {
  const input = circuit(Array.from({ length: 28 }, (_, i) => resistor(`R${i + 1}`, "VCC", "GND")), [terminal("positive", "VCC"), terminal("ground", "GND")]);
  const layout = createLayout(input, definitions, { boards: 2, railMode: "split" }); check(input, layout); assertDirectRailBranches(input, layout);
  const holes = holeMap(layout);
  assert.ok(layout.placements.some(item => Object.values(item.pins).some(id => holes.get(id).board === 2)), "Fixture must use the second board");
  for (const net of ["VCC", "GND"]) {
    const bridge = layout.jumpers.find(item => item.netId === net && holes.get(item.from).board !== holes.get(item.to).board);
    assert.ok(bridge, `${net} needs a physical cross-board jumper`);
    const broken = { ...layout, jumpers: layout.jumpers.filter(item => item.id !== bridge.id) };
    assert.ok(validateLayout(input, definitions, broken).issues.some(item => item.code === "OPEN_CIRCUIT"));
  }
});

test("separate analog/digital grounds and different positive supplies never share conductive buses", () => {
  const input = circuit([resistor("RA", "VCC", "AGND"), resistor("RD", "VDD", "DGND")], [terminal("p5", "VCC"), terminal("gA", "AGND"), terminal("p3", "VDD"), terminal("gD", "DGND")]);
  const layout = createLayout(input, definitions, options); check(input, layout); assertDirectRailBranches(input, layout);
  const usage = getRailUsage(input, layout);
  assert.equal(new Set(usage.map(item => item.row)).size, 4);
  assert.ok(usage.every(item => item.netIds.length === 1));
});

test("differential signal names, minus instrument ports and ambiguous VSS do not imply supply rails", () => {
  const input = circuit([resistor("R1", "OUT_MINUS", "VSS"), resistor("R2", "LO_MINUS", "VREF")], [terminal("AI0-", "OUT_MINUS", "AI0-"), terminal("LO-", "LO_MINUS", "−phase")]);
  for (const net of ["OUT_MINUS", "LO_MINUS", "VSS", "VREF"]) assert.equal(getPowerNetRole(input, net), null, net);
  const layout = createLayout(input, definitions, options); check(input, layout);
  assert.equal(getRailUsage(input, layout).length, 0);
});

test("a fifth independent supply domain falls back explicitly rather than shorting another rail", () => {
  const input = circuit([resistor("RA", "VCC", "AGND"), resistor("RD", "VDD", "DGND"), resistor("R12", "VCC_12V", "LOAD")],
    [terminal("p5", "VCC"), terminal("p3", "VDD"), terminal("p12", "VCC_12V"), terminal("gA", "AGND"), terminal("gD", "DGND")]);
  const layout = createLayout(input, definitions, options); const report = check(input, layout);
  assert.ok(report.issues.some(item => item.code === "POWER_RAIL_CAPACITY" && item.severity === "warning"));
  const usage = getRailUsage(input, layout);
  assert.equal(new Set(usage.map(item => item.row)).size, 4);
  assert.ok(usage.every(item => item.netIds.length === 1));
});

test("a rail short is detected from wire endpoints even when its label pretends to be GND", () => {
  const input = template("divider"); const layout = createLayout(input, definitions, options); check(input, layout);
  const occupied = new Set([...layout.placements.flatMap(item => Object.values(item.pins)), ...layout.terminals.map(item => item.holeId), ...layout.jumpers.flatMap(item => [item.from, item.to])]);
  const free = row => layout.board.holes.find(hole => hole.row === row && hole.column <= 25 && !occupied.has(hole.id)).id;
  layout.jumpers.push({ id: "mislabelled-short", netId: "GND", from: free("T+"), to: free("T-"), color: "#334155" });
  assert.ok(validateLayout(input, definitions, layout).issues.some(item => item.code === "SHORT_CIRCUIT"));
  assert.ok(getRailUsage(input, layout).some(item => item.netIds.includes("VCC") && item.netIds.includes("GND")), "Rail legend must expose the physical conflict, not trust wire labels");
});

test("all published templates retain electrically valid power routing on two boards", () => {
  for (const input of CIRCUIT_TEMPLATES) {
    const layout = createLayout(input, definitions, { boards: 2, railMode: "split" });
    check(input, layout); assertDirectRailBranches(input, layout);
  }
});
