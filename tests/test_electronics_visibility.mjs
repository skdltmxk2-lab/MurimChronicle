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
const circuit = CIRCUIT_TEMPLATES.find(item => item.id === "ua741-inverting");
const layout = createLayout(circuit, definitions, { boards: 1, railMode: "split" });
const render = (props = {}) => renderToStaticMarkup(React.createElement(Breadboard, {
  circuit, definitions, layout, selection: null, onSelect() {}, labelsVisible: true, zoom: 1, onZoom() {}, ...props,
}));
const layersIn = html => [...html.matchAll(/data-board-layer="([^"]+)"/g)].map(match => match[1]);

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
