import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url), cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function("module", "exports", "require", output)(module, module.exports, name => {
    if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`);
    if (name.startsWith(".")) return load(path.join(path.dirname(file), `${name}.ts`));
    return require(name);
  });
  cache.set(file, module.exports);
  return module.exports;
}
const { BC109C_FORMED_PROFILE: profile, BC109C_DEFINITION_ID: id } = load("src/lib/electronics/physical-profiles.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { createLayout, validateLayout, moveComponentPlacement, moveComponentPinPlacement, createAssemblySteps } = load("src/lib/electronics/engine.ts");
const { parseCircuit } = load("src/lib/electronics/schema.ts");
const { parseProjectForWorkspace } = load("src/lib/electronics/project-input.ts");
const { getNonlinearModel, buildNonlinearDevices } = load("src/lib/electronics/simulation-models.ts");
const { Breadboard } = load("src/components/electronics/Breadboard.tsx");
const options = { boards: 1, railMode: "split" }, definition = definitions.find(d => d.id === id);
const circuit = (formed = true) => ({ id: "to18-test", title: "BC109C", description: "", components: [
  { id: "Q1", definitionId: id, value: "BC109C", pinNets: { 1: "E", 2: "B", 3: "C" }, ...(formed ? { physicalProfile: profile } : {}) },
], netNames: { E: "E", B: "B", C: "C" }, instruments: [], notes: [], reviewItems: [] });
const errors = (c, layout) => validateLayout(c, definitions, layout).issues.filter(i => i.severity === "error");

test("original TO-18 remains explicit and unplaced, formed instances keep the exact catalog/model identity", () => {
  const legacy = circuit(false), original = JSON.stringify(legacy), layout = createLayout(legacy, definitions, options);
  assert.equal(layout.placements.length, 0);
  assert.ok(errors(legacy, layout).some(i => i.code === "UNSUPPORTED_MOUNTING"));
  // The error tells the user how to proceed instead of calling a formable part "external".
  const advice = errors(legacy, layout).find(i => i.code === "UNSUPPORTED_MOUNTING").message;
  assert.match(advice, /원형 BC109C 리드는 빵판에 직접 꽂지 않습니다/);
  assert.match(advice, /BC109C 성형 적용/);
  assert.doesNotMatch(advice, /외부 연결/);
  assert.equal(JSON.stringify(legacy), original);
  assert.equal(definition.mounting, "external");
  assert.equal(getNonlinearModel(definition).definitionId, id);
  const formed = circuit(), placed = createLayout(formed, definitions, options);
  assert.equal(placed.placements.length, 1);
  assert.deepEqual(errors(formed, placed), []);
  assert.equal(formed.components[0].definitionId, id);
  assert.deepEqual(buildNonlinearDevices(formed, definitions).devices[0].pins, ["C", "B", "E"]);
  assert.match(buildNonlinearDevices(formed, definitions).warnings.join(" "), /성형/);
});

test("formed E1/B2/C3 use three independent columns and the base is one row below the emitter/collector", () => {
  const c = circuit(), layout = createLayout(c, definitions, options), pins = layout.placements[0].pins;
  const points = [1, 2, 3].map(pin => layout.board.holes.find(hole => hole.id === pins[pin]));
  assert.equal(new Set(points.map(p => p.group)).size, 3);
  assert.equal(points[1].column, points[0].column + 1);
  assert.equal(points[2].column, points[0].column + 2);
  assert.equal(points[1].y, points[0].y + 18);
  assert.equal(points[2].y, points[0].y);
  assert.ok(validateLayout(c, definitions, layout).issues.some(i => i.code === "LEAD_FORMING_REQUIRED"));
});

test("mirrors, swapped E/C, inline pins and a centre-gap crossing are rejected by validation and fixed placement", () => {
  const c = circuit(), layout = createLayout(c, definitions, options);
  for (const pins of [
    { 1: "B1:C12", 2: "B1:D11", 3: "B1:C10" },
    { 1: "B1:C10", 2: "B1:B11", 3: "B1:C12" },
    { 1: "B1:C10", 2: "B1:C11", 3: "B1:C12" },
    { 1: "B1:E10", 2: "B1:F11", 3: "B1:E12" },
  ]) {
    const placement = { componentId: "Q1", pins };
    assert.ok(errors(c, { ...layout, placements: [placement] }).some(i => i.code === "PIN_GEOMETRY"));
    assert.throws(() => createLayout(c, definitions, options, { fixedPlacements: [placement] }), /핀 순서/);
  }
});

test("body translation preserves the pattern, including the second board, while pin-only moves are rejected", () => {
  const c = circuit(), layout = createLayout(c, definitions, { ...options, boards: 2 });
  const moved = moveComponentPlacement(c.components[0], definition, layout.placements[0], "B2:H20", "1", layout.board);
  assert.deepEqual(moved.pins, { 1: "B2:H20", 2: "B2:I21", 3: "B2:H22" });
  assert.deepEqual(errors(c, createLayout(c, definitions, layout.board.options, { fixedPlacements: [moved] })), []);
  assert.throws(() => moveComponentPinPlacement(c.components[0], definition, moved, "B2:I19", "1", layout.board), /몸통/);
  assert.throws(() => moveComponentPlacement(c.components[0], definition, moved, "B2:J20", "1", layout.board), /범위|간격/);
});

test("can and tab clearance excludes other bodies and wire contacts, and automatic routing leaves it exposed", () => {
  const c = circuit(), layout = createLayout(c, definitions, options);
  const placement = moveComponentPlacement(c.components[0], definition, layout.placements[0], "B1:C10", "1", layout.board);
  const fixed = createLayout(c, definitions, options, { fixedPlacements: [placement] });
  const blockedWire = { id: "W1", netId: "B", from: "B1:B11", to: "B1:A11", color: "#000" };
  assert.ok(errors(c, { ...fixed, jumpers: [blockedWire] }).some(i => i.code === "BODY_CLEARANCE"));
  c.components.push({ id: "R1", definitionId: "resistor-axial", value: "10k", pinNets: { 1: "E", 2: "C" } });
  const resistor = definitions.find(d => d.kind === "resistor" && d.mounting === "direct");
  c.components[1].definitionId = resistor.id;
  const colliding = { componentId: "R1", pins: { 1: "B1:B10", 2: "B1:B14" } };
  assert.ok(errors(c, { ...fixed, placements: [placement, colliding] }).some(i => i.code === "BODY_COLLISION"));
  const routed = createLayout(c, definitions, options, { fixedPlacements: [placement] });
  assert.deepEqual(errors(c, routed), []);
});

test("JSON/project roundtrip preserves the instance profile and schema rejects unsupported/forged profiles", () => {
  const c = circuit(), layout = createLayout(c, definitions, options);
  assert.deepEqual(parseCircuit(JSON.parse(JSON.stringify(c)), definitions), c);
  const project = { version: 1, id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", title: c.title, updatedAt: "2026-11-05T00:00:00.000Z", circuit: c, boardOptions: options, layout, completedSteps: [] };
  const parsed = parseProjectForWorkspace(JSON.parse(JSON.stringify(project)), definitions);
  assert.equal(parsed.circuit.components[0].physicalProfile, profile);
  assert.deepEqual(parsed.layout.placements, layout.placements);
  assert.throws(() => parseCircuit({ ...c, components: [{ ...c.components[0], physicalProfile: "mirror" }] }, definitions), /프로필/);
  assert.throws(() => parseCircuit(c, definitions.map(d => d.id === id ? { ...d, pins: [...d.pins].reverse().map((pin, i) => ({ ...pin, id: String(i + 1) })) } : d)), /프로필/);
  const invalid = { ...c, components: [{ ...c.components[0], physicalProfile: "unknown" }] };
  assert.ok(errors(invalid, createLayout(invalid, definitions, options)).some(i => i.code === "INVALID_PHYSICAL_PROFILE"));
});

test("assembly instructions and SVG exports retain forming, top-view tab and metal collector annotations", () => {
  const c = circuit(), layout = createLayout(c, definitions, options), steps = createAssemblySteps(c, definitions, layout);
  assert.match(steps[0].description, /왼쪽 위/);
  assert.match(steps[0].description, /5\.08 mm/);
  assert.match(steps[0].description, /3번 C\(금속 캔\)/);
  assert.match(steps[0].description, /1번 E는 왼쪽/);
  const markup = renderToStaticMarkup(React.createElement(Breadboard, { circuit: c, definitions, layout, selection: null, onSelect() {}, labelsVisible: false, zoom: 1, onZoom() {}, onMovePin() {} }));
  assert.match(markup, /data-physical-profile="bc109c-to18-formed-v1"/);
  assert.match(markup, /data-to18-tab="upper-left"/);
  for (const pin of [1, 2, 3]) assert.match(markup, new RegExp(`data-to18-pin="Q1\\.${pin}"`));
  // The board labels are bare letters: the pin number lives in the instructions, and adjacent parts stay apart.
  for (const [pin, letter] of [[1, "E"], [2, "B"], [3, "C"]]) assert.match(markup, new RegExp(`data-to18-pin="Q1\\.${pin}"[^>]*>${letter}</text>`));
  assert.match(markup, /성형 · C 캔/);
  assert.doesNotMatch(markup, /이 다리만 끌어서 이동/);
});

test("normal physical simulation gate accepts formed BC109C and maps probes to the original numerical model", () => {
  const { createSimulationLayoutIndex } = load("src/lib/electronics/simulation-layout.ts");
  const { runSimulation, defaultSimulationConfig } = load("src/lib/electronics/simulation.ts");
  const c = circuit();
  c.components[0].pinNets = { 1: "GND", 2: "IN", 3: "OUT" };
  c.components.push({ id: "RC", definitionId: "resistor-axial", value: "10kΩ", pinNets: { 1: "VCC", 2: "OUT" } });
  c.netNames = { GND: "GND", IN: "IN", OUT: "OUT", VCC: "+9 V" };
  const restored = parseCircuit(JSON.parse(JSON.stringify(c)), definitions);
  const layout = createLayout(restored, definitions, options);
  const index = createSimulationLayoutIndex(restored, definitions, layout);
  const q = layout.placements.find(p => p.componentId === "Q1");
  assert.equal(index.netForHole(q.pins["1"]), "GND");
  assert.equal(index.netForHole(q.pins["2"]), "IN");
  assert.equal(index.netForHole(q.pins["3"]), "OUT");
  const config = { ...defaultSimulationConfig(restored), source: { netId: "IN", waveform: "dc", frequencyHz: 1000, amplitudePeak: 0, offset: 0.62, phaseDegrees: 0 },
    extraSources: [], supplies: [{ netId: "VCC", voltage: 9 }], durationSeconds: 0.002, sampleCount: 257, acStartHz: 100, acStopHz: 10000, acPoints: 3 };
  const result = runSimulation(restored, definitions, config);
  const current = result.dc.deviceCurrents.Q1;
  assert.ok(Math.abs(current.C / current.B - 677) < 1e-4);
  assert.ok(Math.abs(current.C + current.B + current.E) < 1e-12);
  assert.throws(() => createSimulationLayoutIndex({ ...restored, components: restored.components.map(component => { const { physicalProfile, ...legacy } = component; return legacy; }) }, definitions, layout), /빵판 연결/);
});

test("formed placements remain valid at both board edges and every supported half-row translation", () => {
  const c = circuit(), layout = createLayout(c, definitions, { ...options, boards: 2 });
  for (const board of [1, 2]) for (const row of ["A", "D", "F", "I"]) for (const column of [1, 31, 61]) {
    const moved = moveComponentPlacement(c.components[0], definition, layout.placements[0], `B${board}:${row}${column}`, "1", layout.board);
    const routed = createLayout(c, definitions, layout.board.options, { fixedPlacements: [moved] });
    assert.deepEqual(errors(c, routed), [], `${board}/${row}/${column}`);
    assert.equal(new Set(Object.values(moved.pins).map(id => routed.board.holes.find(hole => hole.id === id).group)).size, 3);
  }
});

test("same-column E/B short survives forged hole metadata and invalid saved drafts cannot pass the physical simulation gate", () => {
  const { createSimulationLayoutIndex } = load("src/lib/electronics/simulation-layout.ts");
  const c = circuit(), layout = createLayout(c, definitions, options);
  layout.placements[0].pins = { 1: "B1:C10", 2: "B1:D10", 3: "B1:C12" };
  layout.board.holes = layout.board.holes.map(hole => ({ ...hole, group: `fake-independent-${hole.id}` }));
  assert.ok(errors(c, layout).some(issue => issue.code === "SHORT_CIRCUIT"));
  assert.ok(errors(c, layout).some(issue => issue.code === "PIN_GEOMETRY"));
  assert.throws(() => createSimulationLayoutIndex(c, definitions, layout), /빵판 연결/);
  const project = { version: 1, id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", title: c.title, updatedAt: "2026-11-05T00:00:00.000Z", circuit: c, boardOptions: options, layout, completedSteps: [] };
  const draft = parseProjectForWorkspace(JSON.parse(JSON.stringify(project)), definitions);
  assert.ok(draft.layout.issues.some(issue => issue.code === "SHORT_CIRCUIT"));
  assert.throws(() => createSimulationLayoutIndex(draft.circuit, definitions, draft.layout), /빵판 연결/);
});

test("unverified pin maps are blocking even for plausible direct three-pin geometry, while general source reviews remain warnings", () => {
  const { createSimulationLayoutIndex } = load("src/lib/electronics/simulation-layout.ts");
  const c = circuit(false);
  c.components[0].definitionId = "bjt-2n3904-onsemi-to92";
  const unchecked = definitions.map(d => d.id === c.components[0].definitionId ? { ...d, pinoutStatus: "unverified" } : d);
  const layout = createLayout(c, unchecked, options);
  assert.equal(layout.placements.length, 1);
  const report = validateLayout(c, unchecked, layout);
  assert.equal(report.valid, false);
  assert.ok(report.issues.some(issue => issue.code === "PINOUT_UNVERIFIED" && issue.severity === "error"));
  assert.throws(() => createSimulationLayoutIndex(c, unchecked, layout), /빵판 연결/);
  c.reviewItems = [{ id: "course-target", message: "과제 목표 이득 실측 비교", resolved: false }];
  const verified = validateLayout(c, definitions, createLayout(c, definitions, options));
  assert.equal(verified.valid, true);
  assert.ok(verified.issues.some(issue => issue.code === "REVIEW_REQUIRED" && issue.severity === "warning"));
});

test("the forming guidance cannot be mistaken for hole IDs and names the datasheet's pin-side view", () => {
  const { BC109C_FORMED_GUIDANCE } = load("src/lib/electronics/physical-profiles.ts");
  assert.doesNotMatch(BC109C_FORMED_GUIDANCE, /\b[EBC][123]\b/, "E1, B2 and C3 are also valid hole IDs");
  assert.match(BC109C_FORMED_GUIDANCE, /행 A가 위쪽, 열 1이 왼쪽/);
  assert.match(BC109C_FORMED_GUIDANCE, /데이터시트의 핀 쪽 그림과는 거울상/);
  for (const part of [/탭은 왼쪽 위/, /1번 E는 왼쪽/, /3번 C\(금속 캔\)는 오른쪽/, /2번 B는 가운데 한 행 아래/, /5\.08 mm/, /2\.54 mm/, /앱이 정한 성형 패턴/]) assert.match(BC109C_FORMED_GUIDANCE, part);
});
