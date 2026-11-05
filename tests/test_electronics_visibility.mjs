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
const visibility = load("src/lib/electronics/visibility.ts");
const { Breadboard } = load("src/components/electronics/Breadboard.tsx");
const { createLayout, createAssemblySteps, validateLayout } = load("src/lib/electronics/engine.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { CIRCUIT_TEMPLATES } = load("src/lib/electronics/templates.ts");
const { resistorMarking } = load("src/lib/electronics/resistor-marking.ts");
const circuit = CIRCUIT_TEMPLATES.find(item => item.id === "ua741-inverting");
const layout = createLayout(circuit, definitions, { boards: 1, railMode: "split" });
const render = (props = {}) => renderToStaticMarkup(React.createElement(Breadboard, {
  circuit, definitions, layout, selection: null, onSelect() {}, labelsVisible: true, zoom: 1, onZoom() {}, ...props,
}));
const layersIn = html => [...html.matchAll(/data-board-layer="([^"]+)"/g)].map(match => match[1]);

test("resistor markings preserve SI values and exact significant digits without inventing tolerance", () => {
  const black = "#202020", brown = "#75432a", red = "#bc292f", yellow = "#e2bd43", violet = "#7e539a", white = "#eee9d9", gold = "#b59b52", silver = "#b8bfc3";
  const examples = [
    ["1e3 Ω", [brown, black, red]],
    ["4.7 MOhm", [yellow, violet, "#50824b"]],
    ["999 Ω", [white, white, white, black]],
    ["9.99 Ω", [white, white, white, silver]],
    ["1000 mΩ", [brown, black, gold]],
    ["100 mΩ", [brown, black, silver]],
    ["0 Ω", [black]],
  ];
  for (const [value, colors] of examples) {
    const marking = resistorMarking(value);
    assert.deepEqual(Array.from(marking.colors), colors, value);
    assert.equal(marking.toleranceUnknown, value !== "0 Ω", value);
    if (value !== "0 Ω") assert.match(marking.label, /공차 미지정/);
  }
  for (const value of ["10 kΩ extra", "4k7", "1 nF", "not known", "-10 Ω", "1234 Ω", "1e309", "1 mΩ"]) {
    assert.equal(resistorMarking(value).colors.length, 0, value);
  }
});

test("rendered resistor bands use all three significant digits and mark unspecified tolerance", () => {
  const input = structuredClone(circuit);
  const resistor = input.components.find(component => definitions.find(definition => definition.id === component.definitionId)?.kind === "resistor");
  resistor.value = "999 Ω";
  const html = render({ circuit: input });
  const marking = html.match(new RegExp(`<g data-resistor-marking="${resistor.id}">([\\s\\S]*?)</g>`))?.[1];
  assert.ok(marking);
  assert.equal((marking.match(/<rect /g) || []).length, 4, "Three digits plus the multiplier are rendered");
  assert.match(marking, />\?<\/text>/, "The tolerance position is visibly unknown");
  assert.match(html, /공차 미지정/);
  resistor.value = "0 Ω";
  const zero = render({ circuit: input });
  assert.match(zero, /0 Ω 점퍼 · 검정 한 띠/);
});

test("resistor-only and opamp-only remove all other component leads, labels, wire and instrument targets", () => {
  for (const layer of ["resistor", "opamp", "jumper", "instrument"]) {
    const html = render({ visibleLayers: [layer] });
    const layers = layersIn(html);
    assert.ok(layers.length > 0);
    assert.deepEqual([...new Set(layers)], [layer]);
    if (layer !== "opamp") assert.ok(!html.includes('aria-label="U1 ·'), "hidden IC tooltip and body must not remain");
    if (layer !== "jumper") assert.ok(!html.includes("↔"), "hidden wires must not leave keyboard targets");
  }
});

test("visibility changes neither board geometry and framing nor physical occupancy and validation", () => {
  const before = JSON.stringify({ circuit, layout, report: validateLayout(circuit, definitions, layout) });
  const all = render();
  const empty = render({ visibleLayers: [] });
  assert.equal(layersIn(empty).length, 0);
  assert.equal(empty.match(/viewBox="([^"]+)"/)[1], all.match(/viewBox="([^"]+)"/)[1]);
  assert.equal((empty.match(/빈 구멍|사용 중/g) || []).length, (all.match(/빈 구멍|사용 중/g) || []).length);
  assert.equal((empty.match(/aria-label="B1:/g) || []).length, 830);
  assert.equal(JSON.stringify({ circuit, layout, report: validateLayout(circuit, definitions, layout) }), before);
});

test("a hidden selection or assembly step does not dim the remaining visible layer", () => {
  const opamp = circuit.components.find(item => definitions.find(d => d.id === item.definitionId)?.kind === "opamp");
  const step = createAssemblySteps(circuit, definitions, layout).find(item => item.componentId === opamp.id);
  const hiddenSelection = render({ visibleLayers: ["resistor"], selection: { type: "component", id: opamp.id } });
  const hiddenStep = render({ visibleLayers: ["resistor"], activeStep: step });
  for (const html of [hiddenSelection, hiddenStep]) {
    assert.ok(!html.includes('opacity="0.2"'));
    assert.ok(!html.includes('opacity="0.16"'));
    assert.deepEqual([...new Set(layersIn(html))], ["resistor"]);
  }
});

test("layer counts match rendered placements and group polarized capacitors and variable resistors", () => {
  const counts = visibility.countBoardLayers(circuit, definitions, layout);
  const rendered = layersIn(render());
  for (const id of visibility.ALL_BOARD_LAYERS) assert.equal(counts[id], rendered.filter(item => item === id).length);
  assert.equal(visibility.componentLayer("electrolytic"), "capacitor");
  assert.equal(visibility.componentLayer("potentiometer"), "resistor");
  assert.equal(visibility.componentLayer("mosfet"), "semiconductor");
  assert.equal(visibility.componentLayer("transformer"), "other");
});

test("assembly helper identifies the layer to reveal without overriding an explicit hidden filter", () => {
  for (const step of createAssemblySteps(circuit, definitions, layout)) {
    const layer = visibility.layerForAssemblyStep(step, circuit, definitions);
    assert.ok(visibility.ALL_BOARD_LAYERS.includes(layer));
    const hidden = visibility.ALL_BOARD_LAYERS.filter(item => item !== layer);
    assert.ok(!layersIn(render({ visibleLayers: hidden, activeStep: step })).includes(layer));
  }
  assert.equal(visibility.layerForAssemblyStep(undefined, circuit, definitions), null);
});
