import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const cache = new Map();
function load(relative) {
  if (cache.has(relative)) return cache.get(relative);
  const output = ts.transpileModule(readFileSync(new URL(`../${relative}`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith("./")) return load(`src/lib/electronics/${name.slice(2)}.ts`);
    return require(name);
  } }, { filename: relative });
  cache.set(relative, mod.exports);
  return mod.exports;
}

const { createLayout, moveComponentPinPlacement, moveComponentPlacement, validateLayout } = load("src/lib/electronics/engine.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { CIRCUIT_TEMPLATES } = load("src/lib/electronics/templates.ts");
const options = { boards: 1, railMode: "split" };
const serial = value => JSON.stringify(value);
const template = id => CIRCUIT_TEMPLATES.find(item => item.id === id);
const componentIn = (circuit, id) => circuit.components.find(item => item.id === id);
const definitionFor = component => definitions.find(item => item.id === component.definitionId);
const placementIn = (layout, id) => layout.placements.find(item => item.componentId === id);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(freeze);
  return value;
}

function preparedResistor(boardOptions = options) {
  const circuit = template("rc-lowpass");
  const layout = createLayout(circuit, definitions, boardOptions);
  const component = componentIn(circuit, "R1"), definition = definitionFor(component);
  const current = moveComponentPlacement(component, definition, placementIn(layout, "R1"), "B1:B40", "1", layout.board);
  const original = createLayout(circuit, definitions, boardOptions, { fixedPlacements: [current] });
  return { circuit, component, definition, original, current: placementIn(original, "R1") };
}

function movePin(fixture, target = "B1:D38", pinId = "1") {
  return moveComponentPinPlacement(fixture.component, fixture.definition, fixture.current, target, pinId, fixture.original.board);
}

function valid(circuit, layout) {
  const report = validateLayout(circuit, definitions, layout);
  assert.equal(report.valid, true, serial(report.issues));
  const contacts = [...layout.placements.flatMap(item => Object.values(item.pins)), ...layout.terminals.map(item => item.holeId), ...layout.jumpers.flatMap(item => [item.from, item.to])];
  assert.equal(new Set(contacts).size, contacts.length, "Automatic routing must not stack contacts in one physical hole");
  return report;
}

test("dragging either resistor lead changes only that lead and never rewrites the circuit", () => {
  const fixture = preparedResistor();
  const before = serial(fixture);
  const first = movePin(fixture);
  assert.equal(first.pins[1], "B1:D38");
  assert.equal(first.pins[2], "B1:B44");
  const second = movePin(fixture, "B1:C46", "2");
  assert.equal(second.pins[1], "B1:B40");
  assert.equal(second.pins[2], "B1:C46");
  assert.equal(serial(fixture), before);
  assert.notEqual(first, fixture.current);
  assert.notEqual(first.pins, fixture.current.pins);
});

test("automatic rerouting preserves a formed resistor's exact two lead anchors and remains electrically valid", () => {
  const fixture = preparedResistor(), changed = movePin(fixture);
  const before = serial({ circuit: fixture.circuit, original: fixture.original, changed });
  freeze(changed);
  const rerouted = createLayout(fixture.circuit, definitions, options, { fixedPlacements: [changed] });
  const report = valid(fixture.circuit, rerouted);
  assert.ok(report.issues.some(issue => issue.code === "LEAD_FORMING_REQUIRED" && issue.componentId === "R1"), "A nonstandard physical lead shape must retain its assembly warning");
  assert.equal(serial(placementIn(rerouted, "R1")), serial(changed));
  assert.equal(serial({ circuit: fixture.circuit, original: fixture.original, changed }), before);
});

test("manual one-lead movement keeps the existing wires and exposes a disconnected net", () => {
  const fixture = preparedResistor(), changed = movePin(fixture, "B1:D41");
  const targetGroup = fixture.original.board.holes.find(hole => hole.id === "B1:D41").group;
  const connectedHoles = [...fixture.original.placements.flatMap(item => Object.values(item.pins)), ...fixture.original.jumpers.flatMap(wire => [wire.from, wire.to]), ...fixture.original.terminals.map(item => item.holeId)];
  assert.ok(!connectedHoles.some(id => fixture.original.board.holes.find(hole => hole.id === id).group === targetGroup), "This manual move must target an electrically isolated strip");
  valid(fixture.circuit, fixture.original);
  const manual = { ...fixture.original, placements: fixture.original.placements.map(item => item.componentId === "R1" ? changed : item) };
  const report = validateLayout(fixture.circuit, definitions, manual);
  assert.equal(report.valid, false);
  assert.ok(report.issues.some(issue => issue.code === "OPEN_CIRCUIT" && issue.severity === "error"), serial(report.issues));
  assert.equal(manual.jumpers, fixture.original.jumpers);
  assert.equal(manual.terminals, fixture.original.terminals);
  assert.equal(placementIn(manual, "R1").pins[2], fixture.current.pins[2]);
});

test("invalid targets, absent pins, excessive lead span and same-strip shorts are rejected without mutation", () => {
  const fixture = preparedResistor({ boards: 2, railMode: "split" });
  const before = serial(fixture);
  freeze(fixture.current);
  for (const target of ["B1:B64", "B3:B40", "B2:B40", "B1:T+40", "B1:H40", "B1:B1", "B1:B43", "B1:A44", "B1:B44"]) {
    assert.throws(() => movePin(fixture, target), undefined, target);
  }
  assert.throws(() => movePin(fixture, "B1:C38", "99"));
  assert.equal(serial(fixture), before);
});

test("DIP pins cannot be detached or reshaped independently from their rigid package", () => {
  const circuit = template("ua741-inverting"), layout = createLayout(circuit, definitions, options);
  const component = componentIn(circuit, "U1"), definition = definitionFor(component), current = placementIn(layout, "U1");
  const before = serial(current);
  assert.throws(() => moveComponentPinPlacement(component, definition, current, "B1:F40", "1", layout.board));
  assert.throws(() => moveComponentPinPlacement(component, definition, current, "B1:E40", "8", layout.board));
  assert.equal(serial(current), before);
});

test("body dragging translates a formed lead shape instead of resetting it to the default footprint", () => {
  const fixture = preparedResistor(), formed = movePin(fixture);
  const translated = moveComponentPlacement(fixture.component, fixture.definition, formed, "B1:E48", "1", fixture.original.board);
  assert.equal(translated.pins[1], "B1:E48");
  assert.equal(translated.pins[2], "B1:C54");
  const holes = new Map(fixture.original.board.holes.map(hole => [hole.id, hole]));
  const vector = placement => {
    const a = holes.get(placement.pins[1]), b = holes.get(placement.pins[2]);
    return [b.x - a.x, b.y - a.y];
  };
  assert.deepEqual(vector(translated), vector(formed));
  valid(fixture.circuit, createLayout(fixture.circuit, definitions, options, { fixedPlacements: [translated] }));
});

test("whole-body moves can transfer a formed component to a second board without changing its lead geometry", () => {
  const boardOptions = { boards: 2, railMode: "split" }, fixture = preparedResistor(boardOptions), formed = movePin(fixture);
  const moved = moveComponentPlacement(fixture.component, fixture.definition, formed, "B2:D38", "1", fixture.original.board);
  assert.equal(moved.pins[1], "B2:D38");
  assert.equal(moved.pins[2], "B2:B44");
  valid(fixture.circuit, createLayout(fixture.circuit, definitions, boardOptions, { fixedPlacements: [moved] }));
});

test("frozen undo snapshots survive lead edits, automatic routing and further body moves", () => {
  const fixture = preparedResistor();
  const snapshot = serial(fixture.original);
  freeze(fixture.original);
  const formed = movePin(fixture);
  freeze(formed);
  const rerouted = createLayout(fixture.circuit, definitions, options, { fixedPlacements: [formed] });
  const bodyMoved = moveComponentPlacement(fixture.component, fixture.definition, formed, "B1:E48", "1", fixture.original.board);
  assert.equal(serial(fixture.original), snapshot);
  assert.equal(formed.pins[1], "B1:D38");
  assert.equal(formed.pins[2], "B1:B44");
  assert.notEqual(placementIn(rerouted, "R1"), formed);
  assert.notEqual(placementIn(rerouted, "R1").pins, formed.pins);
  assert.notEqual(bodyMoved.pins, formed.pins);
});

const { Breadboard } = load("src/components/electronics/Breadboard.tsx");
function renderBoard(circuit, layout, props = {}) {
  return renderToStaticMarkup(React.createElement(Breadboard, {
    circuit, definitions, layout, selection: null, onSelect() {}, labelsVisible: true, zoom: 1, onZoom() {}, ...props,
  }));
}
const renderedPins = html => [...html.matchAll(/<g\b(?=[^>]*data-component-pin="([^"]+)")([^>]*)>([\s\S]*?)<\/g>/g)].map(match => ({ id: match[1], attributes: match[2], content: match[3] }));

test("individual pin hit targets render at the actual formed lead holes without replacing body targets", () => {
  const fixture = preparedResistor(), formed = movePin(fixture);
  const layout = createLayout(fixture.circuit, definitions, options, { fixedPlacements: [formed] });
  const html = renderBoard(fixture.circuit, layout, { onMovePin() {}, onMoveComponent() {} });
  const pins = renderedPins(html);
  assert.equal(pins.length, layout.placements.reduce((sum, item) => sum + Object.keys(item.pins).length, 0));
  for (const [pinId, holeId] of Object.entries(formed.pins)) {
    const rendered = pins.find(pin => pin.id === `R1.${pinId}`);
    const hole = layout.board.holes.find(item => item.id === holeId);
    assert.ok(rendered, `Missing R1.${pinId} hit target`);
    assert.match(rendered.attributes, /aria-label="[^"]+"/);
    assert.ok(rendered.attributes.includes(holeId), "The accessible label must name the actual insertion hole");
    assert.ok(rendered.content.includes(`<circle cx="${hole.x}" cy="${hole.y}" r="7" fill="transparent"`), "The larger grab target must follow the moved pin");
  }
  assert.match(html, /data-board-layer="resistor"[^>]*role="button"/);
  assert.ok(renderedPins(renderBoard(fixture.circuit, layout)).every(pin => !pin.content.includes('fill="transparent"')), "Read-only rendering must not add interactive lead targets");
});

test("layer filtering removes hidden pin hit targets and retains all visible DIP pins for error feedback", () => {
  const circuit = template("ua741-inverting"), layout = createLayout(circuit, definitions, options);
  const resistorPins = renderedPins(renderBoard(circuit, layout, { visibleLayers: ["resistor"], onMovePin() {} }));
  assert.ok(resistorPins.length > 0);
  assert.ok(resistorPins.every(pin => definitionFor(componentIn(circuit, pin.id.split(".")[0])).kind === "resistor"));
  const dipPins = renderedPins(renderBoard(circuit, layout, { visibleLayers: ["opamp"], onMovePin() {} }));
  assert.equal(dipPins.length, 8);
  assert.ok(dipPins.every(pin => pin.id.startsWith("U1.")));
  assert.equal(renderedPins(renderBoard(circuit, layout, { visibleLayers: [], onMovePin() {} })).length, 0);
});

test("reversing electrolytic leads keeps its negative band, polarity labels and uncrossed leads aligned with the actual holes", () => {
  const source = template("rc-lowpass");
  const capacitor = { ...componentIn(source, "C1"), definitionId: "capacitor-electrolytic" };
  const circuit = { ...source, components: [capacitor], instruments: [] };
  const original = createLayout(circuit, definitions, options);
  const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
  for (const pins of [{ 1: "B1:B20", 2: "B1:C22" }, { 1: "B1:C22", 2: "B1:B20" }]) {
    const layout = { ...original, placements: [{ componentId: "C1", pins }] };
    const html = renderBoard(circuit, layout, { visibleLayers: ["capacitor"], onMovePin() {} });
    const positive = layout.board.holes.find(hole => hole.id === pins[1]);
    const negative = layout.board.holes.find(hole => hole.id === pins[2]);
    const centerX = (positive.x + negative.x) / 2;
    const bandTag = html.match(/<rect\b[^>]*data-negative-band="C1"[^>]*>/)?.[0];
    assert.ok(bandTag, "The electrolytic body needs an explicit negative stripe");
    const band = attributes(bandTag), bandCenterX = Number(band.x) + Number(band.width) / 2;
    assert.equal(Math.sign(bandCenterX - centerX), Math.sign(negative.x - centerX), "The body stripe must follow the actual negative lead, including when it is on the left");
    for (const [pinId, hole, polarity] of [["1", positive, "+"], ["2", negative, "−"]]) {
      const label = html.match(new RegExp(`<text\\b([^>]*data-pin-polarity="C1\\.${pinId}"[^>]*)>([^<]*)<\\/text>`));
      assert.ok(label, `Missing polarity label for C1.${pinId}`);
      const position = attributes(label[1]);
      assert.equal(Number(position.x), hole.x);
      assert.equal(Number(position.y), hole.y + 12);
      assert.equal(label[2], polarity);
    }
    const leads = [...html.matchAll(/<line\b[^>]*stroke="#9aa4a4"[^>]*>/g)].map(match => attributes(match[0]));
    assert.equal(leads.length, 2);
    for (const hole of [positive, negative]) {
      const lead = leads.find(item => Number(item.x1) === hole.x && Number(item.y1) === hole.y);
      assert.ok(lead, `Missing physical lead from ${hole.id}`);
      assert.equal(Math.sign(Number(lead.x2) - centerX), Math.sign(hole.x - centerX), "A radial lead must attach to its own side of the body instead of crossing the other lead");
    }
    const [left, right] = [...leads].sort((a, b) => Number(a.x1) - Number(b.x1));
    assert.ok(Number(left.x2) < Number(right.x2), "Reversed pin numbers must not reverse the left/right lead endpoints");
  }
});
