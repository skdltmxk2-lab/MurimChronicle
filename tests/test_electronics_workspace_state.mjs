import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { randomUUID } from "node:crypto";

const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const mod = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (!name.startsWith(".")) throw Error(`Unexpected dependency: ${name}`);
    return load(path.join(path.dirname(file), `${name}.ts`));
  } }, { filename: file });
  cache.set(file, mod.exports);
  return mod.exports;
}
const engine = load("src/lib/electronics/engine.ts");
const { parseProjectForWorkspace } = load("src/lib/electronics/project-input.ts");
const { parseProjectSource, getSourceLabel } = load("src/lib/electronics/project-source.ts");
const { parseCircuit } = load("src/lib/electronics/schema.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { CIRCUIT_TEMPLATES: templates } = load("src/lib/electronics/templates.ts");
const circuit = templates.find(item => item.id === "rc-lowpass");
const boardOptions = { boards: 1, railMode: "split" };
const makeProject = () => JSON.parse(JSON.stringify({ version: 1, id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", title: circuit.title, updatedAt: "2026-01-01T00:00:00Z", circuit, boardOptions, completedSteps: [], layout: engine.createLayout(circuit, definitions, boardOptions) }));

// Execute the actual UI actions with deterministic setters and a deferred network
// response so the persistence race is covered without a browser/server dependency.
const file = "src/components/electronics/ElectronicsWorkspace.tsx";
const ast = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);
const body = ast.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === "ElectronicsWorkspace").body;
const actions = ["openProject", "saveCloud", "importAssistantDesign", "applyManualJson", "openTemplate", "applyPositionChange", "dragPin", "movePin", "undoPositionChange", "verifyChanges"].map(name => body.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === name).getText(ast)).join("\n");
function harness(project = makeProject()) {
  const state = { ...project, projectId: project.id, projectSource: project.source, undoStack: [] };
  const writes = [];
  const owner = "owner-A";
  const env = { ...engine, ...project, projectSource: project.source, experimentId: project.experimentId ?? "lab-0", projectId: project.id, projectUser: owner, COMPONENT_CATALOG: definitions, CIRCUIT_TEMPLATES: templates, parseProjectForWorkspace, parseProjectSource, getSourceLabel, parseCircuit, crypto: { randomUUID }, cloneCircuit: value => structuredClone(value), ALL_BOARD_LAYERS: [], autoRearrange: false, pickingPin: null,
    readyUser: { current: owner }, analysisVersion: { current: 0 }, cancelAnalyze: { current: null },
    currentProjectState: { current: { ...project, experimentId: project.experimentId ?? "lab-0", projectId: project.id } },
    saveLocalProject(user, snapshot) { assert.equal(user, owner); state.stored = snapshot; writes.push(snapshot); return [snapshot]; },
    applyCircuit(next) { state.circuit = next; state.layout = engine.createLayout(next, definitions, project.boardOptions); },
  };
  for (const key of ["BoardOptions", "Circuit", "Layout", "Selection", "StepIndex", "CompletedSteps", "UndoStack", "PickingPin", "ManualCheck", "ChecksOpen", "Busy", "ProjectId", "ProjectSource", "ProjectFilter", "Drawer", "JsonOpen", "ExperimentId", "Saving", "Projects", "VisibleLayers", "DetailsOpen", "View", "Message", "Error"]) {
    env[`set${key}`] = value => { const field = key[0].toLowerCase() + key.slice(1); state[field] = typeof value === "function" ? value(state[field]) : value; };
  }
  vm.createContext(env);
  vm.runInContext(ts.transpileModule(actions, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, env);
  return { env, state, writes };
}

test("a rejected project import leaves the previous circuit, layout and project ID intact", () => {
  for (const mutate of [p => { p.layout.placements = [null]; }, p => { p.layout.jumpers = [null]; }, p => { p.layout.terminals = [null]; }, p => { p.layout.placements[0].pins = {}; }, p => { p.layout.placements[0].pins["1"] = "B1:X999"; }]) {
    const previous = makeProject(), candidate = makeProject();
    candidate.id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    candidate.circuit.title = "Must not replace active project";
    mutate(candidate);
    const h = harness(previous);
    assert.equal(h.env.openProject(candidate), false);
    assert.equal(h.state.projectId, previous.id);
    assert.equal(h.state.circuit, previous.circuit);
    assert.equal(h.state.layout, previous.layout);
    assert.match(h.state.error, /프로젝트 형식/);
    assert.equal(h.env.analysisVersion.current, 0);
  }
});

test("import reconstructs canonical geometry and accepts an electrically incorrect editing draft", () => {
  const project = makeProject();
  project.layout.board.holes[0].group = "forged-short";
  project.layout.board.holes[0].x = -999;
  project.layout.jumpers = [];
  project.layout.issues = [{ severity: "warning", code: "FAKE", message: "Old success" }];
  const result = parseProjectForWorkspace(project, definitions);
  assert.notEqual(result.layout.board.holes[0].group, "forged-short");
  assert.notEqual(result.layout.board.holes[0].x, -999);
  assert.ok(result.layout.issues.some(issue => issue.severity === "error"));
  assert.ok(!result.layout.issues.some(issue => issue.code === "FAKE"));
  assert.deepEqual(JSON.parse(JSON.stringify(result.layout.placements)), project.layout.placements);
  project.layout.placements[0].pins["1"] = "B1:X999";
  assert.notEqual(result.layout.placements[0].pins["1"], "B1:X999");
});

test("project without saved layout is fully prepared before import commits state", () => {
  const project = makeProject(); delete project.layout;
  const h = harness();
  assert.equal(h.env.openProject(project), true);
  assert.ok(h.state.layout.placements.length);
  assert.equal(h.state.projectId, project.id);
});

test("a late cloud response cannot overwrite edits saved while the request is in flight", async () => {
  const h = harness();
  let respond;
  h.env.electronicsAdminFetch = () => new Promise(resolve => { respond = resolve; });
  const pending = h.env.saveCloud();
  assert.equal(h.writes.length, 1);
  const edited = { ...h.env.circuit, title: "Edited while saving" };
  h.env.currentProjectState.current = { ...h.env.currentProjectState.current, circuit: edited };
  const newer = { ...h.state.stored, title: edited.title, circuit: edited, updatedAt: "2026-01-01T00:00:10Z" };
  h.state.stored = newer; // Browser autosave completes before the cloud response.
  respond({ ok: true, json: async () => ({ ok: true }) });
  await pending;
  assert.equal(h.writes.length, 1);
  assert.equal(h.state.stored, newer);
  assert.match(h.state.message, /이후 변경/);
  assert.equal(h.state.saving, false);
});

test("a failed cloud request retains the local snapshot without claiming cloud success", async () => {
  const h = harness();
  h.env.electronicsAdminFetch = async () => ({ ok: false, json: async () => ({ message: "저장소 오류" }) });
  await h.env.saveCloud();
  assert.equal(h.writes.length, 1);
  assert.equal(h.state.stored.circuit.title, circuit.title);
  assert.match(h.state.error, /저장소 오류/);
  assert.equal(h.state.message, undefined);
});

test("a save failure from a departed project does not replace the new workspace notice", async () => {
  const h = harness();
  let respond;
  h.env.electronicsAdminFetch = () => new Promise(resolve => { respond = resolve; });
  const pending = h.env.saveCloud();
  h.env.analysisVersion.current += 1;
  h.state.message = "Opened a different project";
  respond({ ok: false, json: async () => ({ message: "Old project failed" }) });
  await pending;
  assert.equal(h.state.error, "");
  assert.equal(h.state.message, "Opened a different project");
});

test("single-pin movement with rearrangement off preserves the other pins and existing wires, with undo and fresh validation", () => {
  const project = makeProject();
  const placement = project.layout.placements.find(item => item.componentId === "R1");
  const pinId = Object.keys(placement.pins)[0];
  const origin = project.layout.board.holes.find(hole => hole.id === placement.pins[pinId]);
  const target = project.layout.board.holes.find(hole => hole.board === origin.board && hole.row === "C" && hole.column === origin.column);
  const h = harness(project);
  h.env.dragPin("R1", target.id, pinId);
  const moved = h.state.layout.placements.find(item => item.componentId === "R1");
  assert.equal(moved.pins[pinId], target.id);
  for (const otherPin of Object.keys(placement.pins).filter(id => id !== pinId)) assert.equal(moved.pins[otherPin], placement.pins[otherPin]);
  assert.equal(h.state.layout.jumpers, project.layout.jumpers);
  assert.equal(h.state.layout.terminals, project.layout.terminals);
  assert.equal(h.state.undoStack[0], project.layout);
  assert.equal(placement.pins[pinId], origin.id);
  h.env.layout = h.state.layout;
  h.env.verifyChanges();
  assert.equal(h.state.manualCheck.layout, h.state.layout);
  h.env.undoStack = h.state.undoStack;
  h.env.undoPositionChange();
  assert.equal(h.state.layout, project.layout);
  assert.notEqual(h.state.manualCheck.layout, h.state.layout, "the verification snapshot becomes stale after undo");
});

test("single-pin movement with rearrangement on fixes the changed placement and regenerates a connected layout", () => {
  const project = makeProject();
  const placement = project.layout.placements.find(item => item.componentId === "R1");
  const pinId = Object.keys(placement.pins)[0];
  const origin = project.layout.board.holes.find(hole => hole.id === placement.pins[pinId]);
  const target = project.layout.board.holes.find(hole => hole.board === origin.board && hole.row === "C" && hole.column === origin.column);
  const h = harness(project); h.env.autoRearrange = true;
  h.env.dragPin("R1", target.id, pinId);
  const moved = h.state.layout.placements.find(item => item.componentId === "R1");
  assert.equal(moved.pins[pinId], target.id);
  for (const otherPin of Object.keys(placement.pins).filter(id => id !== pinId)) assert.equal(moved.pins[otherPin], placement.pins[otherPin]);
  assert.notEqual(h.state.layout.jumpers, project.layout.jumpers);
  assert.equal(engine.validateLayout(project.circuit, definitions, h.state.layout).valid, true);
});

test("the inspector uses single-pin movement and fixed IC pins reject without changing layout", () => {
  const project = makeProject();
  const placement = project.layout.placements.find(item => item.componentId === "R1");
  const pinId = Object.keys(placement.pins)[0];
  const origin = project.layout.board.holes.find(hole => hole.id === placement.pins[pinId]);
  const target = project.layout.board.holes.find(hole => hole.board === origin.board && hole.row === "C" && hole.column === origin.column);
  const h = harness(project); h.env.pickingPin = { componentId: "R1", pinId };
  h.env.movePin(target.id);
  assert.equal(h.state.layout.placements.find(item => item.componentId === "R1").pins[pinId], target.id);
  assert.equal(h.state.pickingPin, null);

  const opamp = JSON.parse(JSON.stringify(templates.find(item => item.id === "ua741-inverting")));
  const rigidProject = { ...makeProject(), circuit: opamp, layout: engine.createLayout(opamp, definitions, boardOptions) };
  const rigid = harness(rigidProject);
  const ic = rigidProject.layout.placements.find(item => item.componentId === "U1");
  const icPin = Object.keys(ic.pins)[0];
  const icOrigin = rigidProject.layout.board.holes.find(hole => hole.id === ic.pins[icPin]);
  const icTarget = rigidProject.layout.board.holes.find(hole => hole.board === icOrigin.board && hole.row === icOrigin.row && hole.column === icOrigin.column + 1);
  rigid.env.dragPin("U1", icTarget.id, icPin);
  assert.equal(rigid.state.layout, rigidProject.layout);
  assert.equal(rigid.state.undoStack.length, 0);
  assert.ok(rigid.state.error);
});

const originalImage = { name: "reference.png", mimeType: "image/png", data: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString("base64") };
const assistantSource = { channel: "assistant", provider: "chatgpt", attachment: originalImage };

test("opening saved sources restores the original image and a legacy project clears the previous source", () => {
  const saved = { ...makeProject(), source: assistantSource };
  const h = harness();
  assert.equal(h.env.openProject(saved), true);
  assert.deepEqual(JSON.parse(JSON.stringify(h.state.projectSource)), assistantSource);
  assert.notEqual(h.state.projectSource, saved.source, "source is validated before it becomes workspace state");
  assert.equal(h.env.openProject(makeProject()), true);
  assert.equal(h.state.projectSource, undefined);
});

test("assistant import always creates a new identity and does not overwrite a Gemini project", () => {
  const previous = { ...makeProject(), source: { channel: "gemini", provider: "gemini" } };
  const incoming = structuredClone(previous);
  const h = harness(previous);
  assert.equal(h.env.importAssistantDesign(incoming, assistantSource), true);
  assert.notEqual(h.state.projectId, previous.id);
  assert.notEqual(h.state.projectId, incoming.id);
  assert.deepEqual(JSON.parse(JSON.stringify(h.state.projectSource)), assistantSource);
  assert.equal(previous.source.channel, "gemini"); assert.equal(incoming.source.channel, "gemini");
  assert.equal(h.state.projectFilter, "assistant"); assert.equal(h.state.drawer, null);
  assert.match(h.state.message, /새 프로젝트/);
});

test("assistant bare circuit imports validate first and malformed imports leave the previous workspace intact", () => {
  const h = harness();
  assert.equal(h.env.importAssistantDesign(structuredClone(circuit), { channel: "assistant", provider: "claude" }), true);
  assert.equal(h.state.projectSource.provider, "claude");
  const before = h.state.circuit, id = h.state.projectId;
  const invalid = structuredClone(circuit); invalid.components[0].definitionId = "not-listed";
  assert.throws(() => h.env.importAssistantDesign(invalid, assistantSource));
  assert.throws(() => h.env.importAssistantDesign(circuit, { channel: "gemini", provider: "gemini" }));
  assert.equal(h.state.circuit, before); assert.equal(h.state.projectId, id);
});

test("manual circuit and project JSON edits retain current source, image and identity", () => {
  for (const fullProject of [false, true]) {
    const previous = { ...makeProject(), source: assistantSource };
    const h = harness(previous);
    const replacement = { ...makeProject(), id: randomUUID(), source: { channel: "gemini", provider: "gemini" } };
    replacement.circuit.title = "Edited circuit";
    h.env.jsonText = JSON.stringify(fullProject ? replacement : replacement.circuit);
    h.env.applyManualJson();
    assert.equal(h.state.projectId, previous.id);
    assert.deepEqual(JSON.parse(JSON.stringify(h.state.projectSource)), assistantSource);
    assert.equal(h.state.circuit.title, "Edited circuit");
    assert.equal(h.state.jsonOpen, false);
  }
});

test("cloud save captures the source image and reports a source change while the request is pending", async () => {
  const h = harness({ ...makeProject(), source: assistantSource });
  let respond, sent;
  h.env.electronicsAdminFetch = (_owner, _url, options) => { sent = JSON.parse(options.body); return new Promise(resolve => { respond = resolve; }); };
  const pending = h.env.saveCloud();
  assert.deepEqual(sent.source, assistantSource);
  assert.deepEqual(JSON.parse(JSON.stringify(h.state.stored.source)), assistantSource);
  h.env.currentProjectState.current = { ...h.env.currentProjectState.current, source: { channel: "assistant", provider: "claude" } };
  respond({ ok: true, json: async () => ({ ok: true }) });
  await pending;
  assert.equal(h.writes.length, 1); assert.match(h.state.message, /이후 변경/);
});

test("opening a template clears imported source metadata", () => {
  const h = harness({ ...makeProject(), source: assistantSource });
  h.env.openTemplate("rc-lowpass");
  assert.equal(h.state.projectSource, undefined);
  assert.notEqual(h.state.projectId, h.env.projectId);
});
