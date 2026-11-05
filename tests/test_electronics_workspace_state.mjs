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
const { mergeProjects } = load("src/lib/electronics/storage.ts");
const { componentLayer } = load("src/lib/electronics/visibility.ts");
const physicalProfiles = load("src/lib/electronics/physical-profiles.ts");
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
const actions = ["openProject", "saveCloud", "loadCloud", "importAssistantDesign", "applyManualJson", "openTemplate", "applyPositionChange", "dragPin", "movePin", "undoPositionChange", "redoEdit", "restoreEdit", "verifyChanges", "editSnapshot", "rememberEdit", "finishTextEdit", "persistCurrentProject", "preserveBeforeSwitch", "duplicateProject", "removeComponent", "addComponent", "changePinNet", "changePhysicalProfile", "exportProject", "setStepCompleted", "setReviewResolved", "openCloudCopy"].map(name => body.statements.find(node => ts.isFunctionDeclaration(node) && node.name.text === name).getText(ast)).join("\n");
const applyCircuitNode = body.statements.flatMap(node => ts.isVariableStatement(node) ? [...node.declarationList.declarations] : []).find(node => node.name.getText(ast) === "applyCircuit");
const applyCircuitAction = `var applyCircuit = ${applyCircuitNode.initializer.arguments[0].getText(ast)};`;
const effectCallbacks = body.statements.filter(node => ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && node.expression.expression.getText(ast) === "useEffect").map(node => node.expression.arguments[0]);
const ownerEffect = effectCallbacks.find(node => node.getText(ast).includes("const authorized ="));
const leaveEffect = effectCallbacks.find(node => node.getText(ast).includes("flushOnLeave.current()"));
const lifecycleActions = `var runOwnerEffect = ${ownerEffect.getText(ast)}; var runLeaveEffect = ${leaveEffect.getText(ast)};`;
function harness(project = makeProject()) {
  const state = { ...project, projectId: project.id, projectSource: project.source, undoStack: [], redoStack: [], projects: [], cloudProjects: [], localSaveStatus: "pending", workspaceOwner: "owner-A" };
  const writes = [];
  const owner = "owner-A";
  const env = { ...engine, ...physicalProfiles, ...project, projectSource: project.source, experimentId: project.experimentId ?? "lab-0", projectId: project.id, projectUser: owner, workspaceOwner: owner, user: { id: owner }, isAdminUser: () => true, initial: circuit, defaultBoard: boardOptions, COMPONENT_CATALOG: definitions, CIRCUIT_TEMPLATES: templates, parseProjectForWorkspace, parseProjectSource, getSourceLabel, parseCircuit, mergeProjects, componentLayer, crypto: { randomUUID }, cloneCircuit: value => structuredClone(value), ALL_BOARD_LAYERS: [], autoRearrange: false, pickingPin: null, undoStack: [], redoStack: [], loadingProjects: false,
    readyUser: { current: owner }, analysisVersion: { current: 0 }, cancelAnalyze: { current: null },
    textEditStart: { current: null }, lastLocalSaved: { current: null }, lastExternalSaved: { current: null }, cloudRequest: { current: 0 },
    currentProjectState: { current: { circuit: project.circuit, layout: project.layout, boardOptions: project.boardOptions, completedSteps: project.completedSteps, source: project.source, experimentId: project.experimentId ?? "lab-0", projectId: project.id } },
    saveLocalProject(user, snapshot) { assert.equal(user, owner); state.stored = snapshot; writes.push(snapshot); return [snapshot]; },
    readLocalProjects() { return state.stored ? [state.stored] : []; },
    readLocalProjectState() { return { projects: state.stored ? [state.stored] : [], error: null, skipped: 0 }; },
  };
  for (const key of ["BoardOptions", "Circuit", "Layout", "Selection", "StepIndex", "CompletedSteps", "UndoStack", "RedoStack", "PickingPin", "ManualCheck", "ChecksOpen", "Busy", "ProjectId", "ProjectSource", "ProjectFilter", "Drawer", "JsonOpen", "ExperimentId", "Saving", "Projects", "VisibleLayers", "DetailsOpen", "View", "Message", "Error", "LocalSaveStatus", "LocalSaveError", "CloudOffset", "CloudLoaded", "LoadingProjects", "CloudProjects", "Pasting", "Files", "SourceText", "SourceChannel", "ProjectSearch", "JsonText", "AutoRearrange", "WorkspaceOwner"]) {
    env[`set${key}`] = value => { const field = key[0].toLowerCase() + key.slice(1); state[field] = typeof value === "function" ? value(state[field]) : value; };
  }
  vm.createContext(env);
  vm.runInContext(ts.transpileModule(`${actions}\n${applyCircuitAction}\n${lifecycleActions}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, env);
  env.flushOnLeave = { current: env.persistCurrentProject };
  function render() {
    for (const key of ["circuit", "layout", "boardOptions", "completedSteps", "projectId", "projectSource", "undoStack", "redoStack", "loadingProjects", "workspaceOwner"]) env[key] = state[key];
    if (state.experimentId) env.experimentId = state.experimentId;
    env.currentProjectState.current = { circuit: state.circuit, layout: state.layout, boardOptions: state.boardOptions, completedSteps: state.completedSteps, source: state.projectSource, experimentId: env.experimentId, projectId: state.projectId };
  }
  return { env, state, writes, render };
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
  assert.equal(h.state.undoStack[0].layout, project.layout);
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


test("switching before the autosave debounce preserves the latest draft", () => {
  const h = harness();
  h.state.circuit = { ...h.state.circuit, title: "Final keystroke before switching" }; h.render();
  h.env.openTemplate("ua741-inverting");
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].circuit.title, "Final keystroke before switching");
  assert.notEqual(h.state.projectId, h.writes[0].id);
});

test("storage failure blocks switching and a download attempt does not claim durable backup", () => {
  const h = harness(), original = h.state.circuit;
  h.env.saveLocalProject = () => { throw Error("Storage full"); };
  h.env.downloadText = () => {};
  h.env.exportProject();
  h.env.openTemplate("ua741-inverting");
  assert.equal(h.state.circuit, original);
  assert.equal(h.state.localSaveStatus, "error");
  assert.equal(h.env.lastExternalSaved.current, null);
});

test("a late original-project save cannot adopt the new duplicate identity", async () => {
  const h = harness(); let respond;
  h.env.electronicsAdminFetch = () => new Promise(resolve => { respond = resolve; });
  const pending = h.env.saveCloud();
  h.env.duplicateProject(); h.render();
  const duplicateId = h.state.projectId;
  respond({ ok: true, json: async () => ({ ok: true }) }); await pending;
  assert.equal(h.state.projectId, duplicateId);
  assert.notEqual(duplicateId, h.writes[0].id);
  assert.match(h.state.circuit.title, /사본/);
  assert.match(h.state.message, /사본/);
});

test("removing a component supports full circuit/layout undo and redo", () => {
  const project = makeProject(), h = harness(project);
  h.env.removeComponent("R1"); h.render();
  assert.ok(!h.state.circuit.components.some(item => item.id === "R1"));
  const removed = h.state.circuit;
  h.env.undoPositionChange(); h.render();
  assert.equal(h.state.circuit, project.circuit);
  assert.equal(h.state.layout, project.layout);
  h.env.redoEdit(); h.render();
  assert.equal(h.state.circuit, removed);
});

test("pending text edits can be undone before blur and checkbox edits clear stale redo", () => {
  const h = harness(), previous = h.env.editSnapshot();
  h.env.textEditStart.current = previous;
  h.state.circuit = { ...h.state.circuit, title: "Editing" }; h.render();
  h.env.undoPositionChange(); h.render();
  assert.equal(h.state.circuit, previous.circuit);
  assert.equal(h.state.redoStack.length, 1);
  h.env.setStepCompleted("step-1", true); h.render();
  assert.equal(h.state.redoStack.length, 0);
  assert.ok(h.state.completedSteps.includes("step-1"));
  h.env.undoPositionChange(); h.render();
  assert.equal(h.state.completedSteps.length, 0);
});

test("project JSON undo restores the previous experiment association", () => {
  const project = { ...makeProject(), experimentId: "lab-0" }, h = harness(project);
  h.env.jsonText = JSON.stringify({ ...project, experimentId: "lab-5" });
  h.env.applyManualJson(); h.render();
  assert.equal(h.state.experimentId, "lab-5");
  h.env.undoPositionChange(); h.render();
  assert.equal(h.state.experimentId, "lab-0");
});

test("autosave retains cloud-only cards and cloud versions can open as separate copies", async () => {
  const h = harness();
  const remote = { ...makeProject(), id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", title: "Cloud only" };
  h.env.electronicsAdminFetch = async () => ({ ok: true, json: async () => ({ ok: true, projects: [remote], nextOffset: 30 }) });
  await h.env.loadCloud();
  assert.equal(h.state.cloudOffset, 30);
  h.env.persistCurrentProject();
  assert.equal(h.state.projects.length, 2);
  const remoteSameId = { ...makeProject(), circuit: { ...h.state.circuit, title: "Remote version" } };
  h.env.openCloudCopy(remoteSameId);
  assert.notEqual(h.state.projectId, remoteSameId.id);
  assert.match(h.state.circuit.title, /Remote version.*클라우드 사본/);
});

test("the mount owner effect restores the first valid local draft with its manual layout and source", () => {
  const saved = { ...makeProject(), source: assistantSource, experimentId: "lab-5" };
  saved.circuit.title = "Last working circuit";
  saved.layout.placements.find(item => item.componentId === "R1").pins = { "1": "B1:B8", "2": "B1:B12" };
  const unreadable = structuredClone(saved);
  unreadable.id = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  unreadable.layout.placements = [null];
  const h = harness();
  h.env.readyUser.current = null;
  h.state.workspaceOwner = null;
  h.render();
  let reads = 0;
  h.env.readLocalProjectState = owner => {
    assert.equal(owner, "owner-A"); reads++;
    return { projects: [unreadable, saved], error: null, skipped: 0 };
  };
  h.env.runOwnerEffect(); h.render();
  assert.equal(h.state.projectId, saved.id);
  assert.equal(h.state.circuit.title, "Last working circuit");
  assert.deepEqual(JSON.parse(JSON.stringify(h.state.layout.placements)), saved.layout.placements);
  assert.deepEqual(JSON.parse(JSON.stringify(h.state.projectSource)), assistantSource);
  assert.equal(h.state.experimentId, "lab-5");
  assert.equal(h.state.localSaveStatus, "saved");
  assert.equal(h.writes.length, 0, "mount must not replace the restored draft with the default circuit");
  assert.equal(h.env.persistCurrentProject(), true);
  assert.equal(h.writes.length, 0, "an unchanged restored snapshot is already durable");
  h.env.runOwnerEffect();
  assert.equal(reads, 1, "the workspaceOwner state update must not restore again");
});

test("mount restore preserves a readable draft while surfacing damaged browser storage", () => {
  const saved = makeProject(), h = harness();
  h.env.readyUser.current = null;
  h.state.workspaceOwner = null;
  h.render();
  h.env.readLocalProjectState = () => ({ projects: [saved], error: "Damaged browser storage", skipped: 1 });
  h.env.runOwnerEffect(); h.render();
  assert.equal(h.state.projectId, saved.id);
  assert.equal(h.state.localSaveStatus, "error");
  assert.equal(h.state.localSaveError, "Damaged browser storage");
  assert.equal(h.writes.length, 0);
});

test("the owner effect flushes a pending edit only to its previous owner before account switch or logout", () => {
  for (const nextOwner of ["owner-B", null]) {
    const h = harness();
    h.state.circuit = { ...h.state.circuit, title: "Last edit before leaving owner A" };
    h.state.projectSource = assistantSource;
    h.render();
    const writes = [];
    const otherProject = { ...makeProject(), id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", circuit: { ...circuit, title: "Owner B private draft" } };
    h.env.saveLocalProject = (owner, snapshot) => {
      assert.equal(h.env.readyUser.current, "owner-A", "flush must happen before resetting the owner boundary");
      writes.push({ owner, snapshot });
      return [snapshot];
    };
    h.env.readLocalProjectState = owner => {
      assert.equal(owner, "owner-B");
      return { projects: [otherProject], error: null, skipped: 0 };
    };
    h.env.projectUser = nextOwner || "";
    h.env.user = nextOwner ? { id: nextOwner } : null;
    h.env.isAdminUser = value => !!value;
    h.env.runOwnerEffect(); h.render();
    assert.equal(writes.length, 1);
    assert.equal(writes[0].owner, "owner-A");
    assert.equal(writes[0].snapshot.circuit.title, "Last edit before leaving owner A");
    assert.deepEqual(JSON.parse(JSON.stringify(writes[0].snapshot.source)), assistantSource);
    assert.equal(h.env.readyUser.current, nextOwner);
    assert.equal(h.state.workspaceOwner, nextOwner);
    assert.equal(h.state.projectSource, undefined, "previous owner's image must not remain in the next workspace");
    assert.equal(h.state.projectId, nextOwner ? otherProject.id : "");
    if (nextOwner) assert.equal(h.state.circuit.title, "Owner B private draft");
    const cleanup = h.env.runLeaveEffect(); cleanup();
    assert.equal(writes.length, 1, "a later unmount must not write owner A data into owner B storage");
  }
});

test("the unmount cleanup flushes the latest edit before its debounce fires", () => {
  const h = harness();
  h.env.lastLocalSaved.current = h.env.currentProjectState.current;
  const cleanup = h.env.runLeaveEffect();
  h.state.circuit = { ...h.state.circuit, title: "Last keystroke before SPA navigation" };
  h.render();
  assert.equal(h.writes.length, 0);
  cleanup();
  assert.equal(h.writes.length, 1);
  assert.equal(h.writes[0].circuit.title, "Last keystroke before SPA navigation");
  assert.equal(h.writes[0].id, h.state.projectId);
  assert.equal(h.state.localSaveStatus, "saved");
});

function drawerHarness() {
  const events = [], effects = [];
  const document = { activeElement: null, body: null };
  class Element {
    isConnected = true;
    focus(options) { events.push(["focus", options]); document.activeElement = this; }
  }
  const opener = new Element(), field = new Element();
  document.body = new Element();
  document.activeElement = opener;
  const dialog = {
    open: false,
    showModal() { events.push(["show"]); this.open = true; document.activeElement = field; },
    close() { if (this.open) { events.push(["close"]); this.open = false; if (document.activeElement === field) document.activeElement = document.body; } },
    contains(element) { return element === field; },
  };
  const module = { exports: {} };
  const jsx = (type, props) => ({ type, props });
  const source = ts.transpileModule(readFileSync("src/components/electronics/WorkspaceDrawer.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, document, HTMLElement: Element, require(name) {
    if (name === "react") return { useRef: () => ({ current: dialog }), useEffect: effect => effects.push(effect) };
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    throw Error(`Unexpected drawer dependency ${name}`);
  } });
  const tree = module.exports.WorkspaceDrawer({ title: "JSON", children: "editor", onClose: () => events.push(["unmount-request"]) });
  const cleanup = effects[0]();
  return { tree, cleanup, opener, field, document, dialog, events, Element };
}

test("drawer Escape closes the native modal before requesting React unmount and restores its opener", () => {
  const h = drawerHarness();
  let prevented = false;
  h.tree.props.onCancel({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.deepEqual(h.events.map(event => event[0]), ["show", "close", "unmount-request"]);
  h.cleanup();
  assert.equal(h.document.activeElement, h.opener);
  assert.equal(h.events.at(-1)[1].preventScroll, true);
});

test("drawer teardown restores a detached modal's opener without stealing focus from another control", () => {
  const h = drawerHarness();
  h.document.activeElement = h.document.body;
  h.cleanup();
  assert.equal(h.document.activeElement, h.opener);
  const moved = drawerHarness(), newFocus = new moved.Element();
  moved.document.activeElement = newFocus;
  moved.cleanup();
  assert.equal(moved.document.activeElement, newFocus);
  const disconnected = drawerHarness();
  disconnected.opener.isConnected = false;
  disconnected.cleanup();
  assert.equal(disconnected.document.activeElement, disconnected.document.body);
  assert.ok(!disconnected.events.some(event => event[0] === "focus"));
});


test("explicit BC109C forming applies to selected instances, keeps history and is reversible", () => {
  const project = makeProject();
  const original = { id: "Q1", definitionId: physicalProfiles.BC109C_DEFINITION_ID, value: "BC109C", pinNets: { 1: "GND", 2: "VIN", 3: "VOUT" } };
  project.circuit = { ...project.circuit, components: [original, { ...original, id: "Q2" }], netNames: { GND: "GND", VIN: "VIN", VOUT: "VOUT" }, instruments: [] };
  project.layout = engine.createLayout(project.circuit, definitions, boardOptions);
  const h = harness(project);
  h.state.visibleLayers = [];
  h.env.changePhysicalProfile(["Q1"], true);
  assert.equal(h.state.circuit.components[0].physicalProfile, physicalProfiles.BC109C_FORMED_PROFILE);
  assert.equal(h.state.circuit.components[1].physicalProfile, undefined);
  assert.equal(h.state.circuit.components[0].definitionId, original.definitionId);
  assert.equal(h.state.layout.placements.length, 1);
  assert.equal(h.state.selection.id, "Q1");
  assert.ok(h.state.visibleLayers.includes("semiconductor"));
  assert.equal(h.state.undoStack.length, 1);
  h.render();
  h.env.changePhysicalProfile(["Q1", "Q2"], true);
  assert.equal(h.state.layout.placements.length, 2);
  assert.equal(engine.validateLayout(h.state.circuit, definitions, h.state.layout).valid, true);
  h.render();
  h.env.changePhysicalProfile(["Q1"], false);
  assert.equal(h.state.circuit.components[0].physicalProfile, undefined);
  assert.equal(h.state.layout.placements.length, 1);
  h.render();
  h.env.undoPositionChange();
  assert.equal(h.state.layout.placements.length, 2);
  assert.equal(h.state.circuit.components[0].physicalProfile, physicalProfiles.BC109C_FORMED_PROFILE);
});

test("catalog adds BC109C only through an explicit formed-profile action", () => {
  const h = harness();
  h.state.visibleLayers = [];
  const count = h.state.circuit.components.length;
  h.env.addComponent(physicalProfiles.BC109C_DEFINITION_ID);
  assert.equal(h.state.circuit.components.length, count);
  h.env.addComponent(physicalProfiles.BC109C_DEFINITION_ID, true);
  assert.equal(h.state.circuit.components.length, count + 1);
  const component = h.state.circuit.components.at(-1);
  assert.equal(component.physicalProfile, physicalProfiles.BC109C_FORMED_PROFILE);
  assert.ok(h.state.layout.placements.some(p => p.componentId === component.id));
});
