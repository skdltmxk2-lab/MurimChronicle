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
    if (dependency === "./power") return load("power");
    throw Error(`Unexpected dependency: ${dependency}`);
  } }, { filename: `electronics/${name}.ts` });
  cache.set(name, mod.exports); return mod.exports;
}
const { createLayout, moveComponentPlacement, validateLayout } = load("engine");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES } = load("templates");
const options = { boards: 1, railMode: "split" };
const template = id => CIRCUIT_TEMPLATES.find(item => item.id === id);
const serial = item => JSON.stringify(item);
const errorCodes = (input, layout) => validateLayout(input, definitions, layout).issues.filter(item => item.severity === "error").map(item => item.code);
function valid(input, layout) {
  assert.equal(validateLayout(input, definitions, layout).valid, true, serial(validateLayout(input, definitions, layout).issues));
  const contacts = [...layout.placements.flatMap(item => Object.values(item.pins)), ...layout.terminals.map(item => item.holeId), ...layout.jumpers.flatMap(item => [item.from, item.to])];
  assert.equal(new Set(contacts).size, contacts.length);
}
function moved(input, layout, componentId, target, pin = "1") {
  const component = input.components.find(item => item.id === componentId);
  const definition = definitions.find(item => item.id === component.definitionId);
  const placement = layout.placements.find(item => item.componentId === componentId);
  return moveComponentPlacement(component, definition, placement, target, pin, layout.board);
}

test("moving a resistor preserves its rigid footprint and rerouting keeps every requested placement", () => {
  const input = template("rc-lowpass"), original = createLayout(input, definitions, options);
  const before = serial(original);
  const changed = moved(input, original, "R1", "B1:B40");
  assert.equal(changed.pins[1], "B1:B40"); assert.equal(changed.pins[2], "B1:B44");
  const fixedPlacements = original.placements.map(item => item.componentId === "R1" ? changed : item);
  const layout = createLayout(input, definitions, options, { fixedPlacements });
  valid(input, layout);
  for (const fixed of fixedPlacements) assert.equal(serial(layout.placements.find(item => item.componentId === fixed.componentId)), serial(fixed));
  assert.equal(serial(original), before, "Planning a drag must not mutate the previous undo snapshot");
});

test("manual placement without rerouting leaves real opens visible instead of changing the declared circuit", () => {
  const input = template("rc-lowpass"), original = createLayout(input, definitions, options);
  const changed = moved(input, original, "R1", "B1:B40");
  const manual = { ...original, placements: original.placements.map(item => item.componentId === "R1" ? changed : item) };
  assert.equal(serial(manual.jumpers), serial(original.jumpers));
  assert.ok(errorCodes(input, manual).includes("OPEN_CIRCUIT"));
});

test("a passive part can move to another core row or second board without changing pin order", () => {
  const input = template("rc-lowpass"), boardOptions = { boards: 2, railMode: "split" };
  const original = createLayout(input, definitions, boardOptions);
  for (const [target, otherPin] of [["B1:D40", "B1:D44"], ["B2:I40", "B2:I44"]]) {
    const changed = moved(input, original, "R1", target);
    assert.equal(changed.pins[1], target); assert.equal(changed.pins[2], otherPin);
    const layout = createLayout(input, definitions, boardOptions, { fixedPlacements: [changed] });
    valid(input, layout);
    assert.equal(serial(layout.placements.find(item => item.componentId === "R1")), serial(changed));
  }
});

test("a transistor can move to a different row while its three lead order stays valid", () => {
  const input = template("ce-amplifier"), original = createLayout(input, definitions, options);
  const changed = moved(input, original, "Q1", "B1:A50");
  assert.equal(changed.pins[1], "B1:A50"); assert.equal(changed.pins[2], "B1:A51"); assert.equal(changed.pins[3], "B1:A52");
  const layout = createLayout(input, definitions, options, { fixedPlacements: [changed] });
  valid(input, layout);
});

test("DIP movement retains trench spanning and rejects placement on a single bank", () => {
  const input = template("ua741-inverting"), original = createLayout(input, definitions, options);
  const changed = moved(input, original, "U1", "B1:F40");
  assert.equal(changed.pins[1], "B1:F40"); assert.equal(changed.pins[8], "B1:E40");
  assert.equal(changed.pins[4], "B1:F43"); assert.equal(changed.pins[5], "B1:E43");
  valid(input, createLayout(input, definitions, options, { fixedPlacements: [changed] }));
  assert.throws(() => moved(input, original, "U1", "B1:B40"));
  const malformed = { ...changed, pins: { ...changed.pins, 1: "B1:A40", 2: "B1:A41", 3: "B1:A42", 4: "B1:A43" } };
  assert.throws(() => createLayout(input, definitions, options, { fixedPlacements: [malformed] }));
});

test("outside-board, rail-mounted and missing-anchor-pin component moves fail without mutation", () => {
  const input = template("rc-lowpass"), original = createLayout(input, definitions, options), before = serial(original);
  for (const target of ["B1:B62", "B1:B64", "B2:B10", "B1:T+10"]) assert.throws(() => moved(input, original, "R1", target), target);
  assert.throws(() => moved(input, original, "R1", "B1:B40", "99"));
  assert.equal(serial(original), before);
});

test("conflicting fixed parts and shared contacts are rejected instead of silently moving the anchors", () => {
  const input = template("divider"), original = createLayout(input, definitions, options);
  const first = moved(input, original, "R1", "B1:B40"), second = moved(input, original, "R2", "B1:B40");
  assert.throws(() => createLayout(input, definitions, options, { fixedPlacements: [first, second] }));
  const manual = { ...original, placements: [first, second] };
  const codes = errorCodes(input, manual);
  assert.ok(codes.includes("BODY_COLLISION")); assert.ok(codes.includes("OCCUPIED_HOLE"));
});

test("a fixed signal terminal stays on the chosen hole while the physical connection is rebuilt", () => {
  const input = template("rc-lowpass"), original = createLayout(input, definitions, options);
  const fixed = { ...original.terminals.find(item => item.connectionId === "osc-input"), holeId: "B1:A55" };
  const layout = createLayout(input, definitions, options, { fixedPlacements: original.placements, fixedTerminals: [fixed] });
  valid(input, layout);
  assert.equal(layout.terminals.find(item => item.connectionId === fixed.connectionId).holeId, "B1:A55");
  const hole = layout.board.holes.find(item => item.id === fixed.holeId);
  assert.ok(layout.jumpers.some(wire => wire.netId === fixed.netId && [wire.from, wire.to].some(id => layout.board.holes.find(item => item.id === id).group === hole.group)));
});

test("moving a supply terminal reassigns its bus without merging a separately anchored ground", () => {
  const input = template("divider"), original = createLayout(input, definitions, options);
  const positive = original.terminals.find(item => item.connectionId === "ps-positive");
  const ground = original.terminals.find(item => item.connectionId === "ps-ground");
  const good = { ...positive, holeId: "B1:T-40" };
  const layout = createLayout(input, definitions, options, { fixedTerminals: [good] }); valid(input, layout);
  assert.equal(layout.terminals.find(item => item.connectionId === good.connectionId).holeId, good.holeId);
  assert.ok(!/^B1:T-/.test(layout.terminals.find(item => item.connectionId === ground.connectionId).holeId), "GND must use a distinct conductive row after explicit reassignment");
  assert.throws(() => createLayout(input, definitions, options, { fixedTerminals: [good, { ...ground, holeId: "B1:T-41" }] }));
  assert.throws(() => createLayout(input, definitions, options, { fixedTerminals: [{ ...positive, holeId: "B1:A64" }] }));
});
