/** Audit physical pin-net equivalence separately from numerical simulation. */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const modules = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name);
  const module = { exports: {} };
  modules.set(name, module.exports);
  const source = readFileSync(new URL(`../../src/lib/electronics/${name}.ts`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    if (!dependency.startsWith("./")) throw new Error(`Unexpected dependency ${dependency}`);
    return load(dependency.slice(2));
  });
  return module.exports;
}

const { COURSE_ANALOG_CASES } = load("course-analog-fixtures");
const { LAB5_REFERENCE_CASES, buildLab5ReferenceCase } = load("lab5-reference");
const { ADVANCED_ANALOG_CASES, buildAdvancedAnalogCase } = load("course-advanced-fixtures");
const { COMPONENT_CATALOG } = load("catalog");
const { BC109C_DEFINITION_ID, BC109C_FORMED_PROFILE } = load("physical-profiles");
const { createLayout, validateLayout } = load("engine");
const definitions = new Map(COMPONENT_CATALOG.map(item => [item.id, item]));
const cases = [
  ...COURSE_ANALOG_CASES.map(item => ({ id: item.id, group: "labs-0-4", circuit: item.circuit, config: item.config, scopeIncomplete: item.id.includes("microphone") })),
  ...LAB5_REFERENCE_CASES.flatMap(item => (item.id === "c2-drive" || item.id === "c3-mix" ? ["1:1", "2:1"] : ["1:1"]).map(ratio => ({ id: `lab5-${item.id}-${ratio}`, group: "lab5", ...buildLab5ReferenceCase(item.id, ratio) }))),
  ...ADVANCED_ANALOG_CASES.map(item => ({ id: item.id, group: "projects", ...buildAdvancedAnalogCase(item.id) })),
];
if (cases.length !== 151) throw new Error(`Expected all 151 analog conditions, received ${cases.length}`);

// The independent graph derives strips directly from canonical hole IDs. It never
// reads the engine's hole.group, cached issues, jumper.netId, or terminal.netId.
function groupForHole(id, options) {
  const match = /^B([12]):([A-J]|[TB][+-])([1-9]\d?)$/.exec(id);
  if (!match) return undefined;
  const board = Number(match[1]), row = match[2], column = Number(match[3]);
  if (board > options.boards || column > (row.length === 1 ? 63 : 50)) return undefined;
  if (row.length === 1) return `${board}/strip/${row <= "E" ? "upper" : "lower"}/${column}`;
  return `${board}/rail/${row}/${options.railMode === "continuous" ? "all" : column <= 25 ? "left" : "right"}`;
}

function allHoleIds(options) {
  const holes = [];
  for (let board = 1; board <= options.boards; board++) {
    for (const row of "ABCDEFGHIJ") for (let column = 1; column <= 63; column++) holes.push(`B${board}:${row}${column}`);
    for (const row of ["T+", "T-", "B+", "B-"]) for (let column = 1; column <= 50; column++) holes.push(`B${board}:${row}${column}`);
  }
  return holes;
}

function independentConnectivity(circuit, layout) {
  const parents = new Map(), occupied = new Map(), faults = [], endpoints = [];
  function root(group) {
    let current = group;
    while (parents.has(current) && parents.get(current) !== current) current = parents.get(current);
    return current;
  }
  function occupy(hole, owner) {
    const group = groupForHole(hole, layout.board.options);
    if (!group) faults.push({ code: "invalid-hole", hole, owner });
    if (occupied.has(hole)) faults.push({ code: "occupied-hole", hole, owners: [occupied.get(hole), owner] });
    occupied.set(hole, owner);
    return group;
  }
  const placements = new Map();
  for (const placement of layout.placements) {
    if (placements.has(placement.componentId)) faults.push({ code: "duplicate-placement", id: placement.componentId });
    placements.set(placement.componentId, placement);
  }
  for (const component of circuit.components) {
    const definition = definitions.get(component.definitionId), placement = placements.get(component.id);
    if (!definition || !placement) { faults.push({ code: "missing-component", id: component.id }); continue; }
    for (const pin of definition.pins) {
      const hole = placement.pins[pin.id];
      if (!hole) { faults.push({ code: "missing-pin", id: `${component.id}.${pin.id}` }); continue; }
      const group = occupy(hole, `${component.id}.${pin.id}`);
      const net = component.pinNets[pin.id] ?? `unconnected/${component.id}/${pin.id}`;
      if (group) endpoints.push({ owner: `${component.id}.${pin.id}`, hole, group, net });
    }
    for (const pinId of Object.keys(placement.pins)) if (!definition.pins.some(pin => pin.id === pinId)) faults.push({ code: "extra-pin", id: `${component.id}.${pinId}` });
  }
  for (const placement of layout.placements) if (!circuit.components.some(component => component.id === placement.componentId)) faults.push({ code: "extra-component", id: placement.componentId });
  const terminals = new Map();
  for (const terminal of layout.terminals) {
    if (terminals.has(terminal.connectionId)) faults.push({ code: "duplicate-terminal", id: terminal.connectionId });
    terminals.set(terminal.connectionId, terminal);
  }
  for (const connection of circuit.instruments) {
    const terminal = terminals.get(connection.id);
    if (!terminal) { faults.push({ code: "missing-terminal", id: connection.id }); continue; }
    const group = occupy(terminal.holeId, `terminal/${connection.id}`);
    if (group) endpoints.push({ owner: `terminal/${connection.id}`, hole: terminal.holeId, group, net: connection.netId });
  }
  for (const terminal of layout.terminals) if (!circuit.instruments.some(connection => connection.id === terminal.connectionId)) faults.push({ code: "extra-terminal", id: terminal.connectionId });
  for (const wire of layout.jumpers) {
    const from = occupy(wire.from, `${wire.id}/from`), to = occupy(wire.to, `${wire.id}/to`);
    if (from && to) parents.set(root(from), root(to));
  }
  let checkedPairs = 0, opens = 0, shorts = 0;
  const mismatches = [];
  for (let a = 0; a < endpoints.length; a++) for (let b = a + 1; b < endpoints.length; b++) {
    checkedPairs++;
    const intendedSame = endpoints[a].net === endpoints[b].net;
    const actualSame = root(endpoints[a].group) === root(endpoints[b].group);
    if (intendedSame === actualSame) continue;
    const code = intendedSame ? "open" : "short";
    if (intendedSame) opens++; else shorts++;
    if (mismatches.length < 20) mismatches.push({ code, a: endpoints[a], b: endpoints[b] });
  }
  return { valid: !faults.length && !opens && !shorts, checkedPairs, opens, shorts, faults, mismatches, endpoints, occupied, root };
}

function formedCircuit(original) {
  const circuit = structuredClone(original);
  for (const component of circuit.components) if (component.definitionId === BC109C_DEFINITION_ID) component.physicalProfile = BC109C_FORMED_PROFILE;
  return circuit;
}

function structuralKey(circuit) {
  return JSON.stringify({ components: circuit.components.map(({ id, definitionId, pinNets, physicalProfile }) => ({ id, definitionId, pinNets, physicalProfile })), instruments: circuit.instruments.map(({ id, netId }) => ({ id, netId })), netNames: circuit.netNames });
}

function mutationAudit(circuit, layout) {
  const removal = { tried: 0, critical: 0, redundant: 0, caught: 0, falsePass: [] };
  const shorting = { tried: 0, caught: 0, unavailablePairs: 0, falsePass: [] };
  for (let index = 0; index < layout.jumpers.length; index++) {
    const damaged = { ...layout, jumpers: layout.jumpers.filter((_, other) => other !== index) };
    const independent = independentConnectivity(circuit, damaged);
    removal.tried++;
    if (!independent.opens) { removal.redundant++; continue; }
    removal.critical++;
    const validation = validateLayout(circuit, COMPONENT_CATALOG, damaged);
    if (!validation.valid && validation.issues.some(issue => issue.code === "OPEN_CIRCUIT")) removal.caught++;
    else removal.falsePass.push({ wire: layout.jumpers[index], valid: validation.valid, codes: validation.issues.map(issue => issue.code), pairs: independent.mismatches });
  }
  const base = independentConnectivity(circuit, layout);
  const nets = [...new Set(base.endpoints.map(endpoint => endpoint.net))];
  const spareByNet = new Map();
  for (const hole of allHoleIds(layout.board.options)) {
    if (base.occupied.has(hole)) continue;
    const group = groupForHole(hole, layout.board.options);
    const endpoint = base.endpoints.find(item => base.root(item.group) === base.root(group));
    if (endpoint && !spareByNet.has(endpoint.net)) spareByNet.set(endpoint.net, hole);
  }
  for (let a = 0; a < nets.length; a++) for (let b = a + 1; b < nets.length; b++) {
    const from = spareByNet.get(nets[a]), to = spareByNet.get(nets[b]);
    if (!from || !to) { shorting.unavailablePairs++; continue; }
    const wire = { id: "AUDIT_SHORT", from, to, netId: nets[a], color: "#000000" };
    const damaged = { ...layout, jumpers: [...layout.jumpers, wire] };
    const independent = independentConnectivity(circuit, damaged);
    if (!independent.shorts) throw new Error("Independent mutation did not introduce the intended short");
    shorting.tried++;
    const validation = validateLayout(circuit, COMPONENT_CATALOG, damaged);
    if (!validation.valid && validation.issues.some(issue => issue.code === "SHORT_CIRCUIT")) shorting.caught++;
    else shorting.falsePass.push({ wire, valid: validation.valid, codes: validation.issues.map(issue => issue.code), pairs: independent.mismatches });
  }
  return { removal, shorting };
}

const boardOptions = [{ boards: 2, railMode: "split" }, { boards: 1, railMode: "split" }, { boards: 2, railMode: "continuous" }, { boards: 1, railMode: "continuous" }];
const results = [], cache = new Map(), representatives = [];
for (const options of boardOptions) {
  for (const testCase of cases) {
    const circuit = formedCircuit(testCase.circuit);
    const key = JSON.stringify(options) + structuralKey(circuit);
    let audit = cache.get(key);
    if (!audit) {
      const layout = createLayout(circuit, COMPONENT_CATALOG, options);
      const validation = validateLayout(circuit, COMPONENT_CATALOG, layout);
      const independent = independentConnectivity(circuit, layout);
      const referenceId = createHash("sha256").update(key).digest("hex").slice(0, 12);
      const mutations = validation.valid && independent.valid && circuit.components.length ? mutationAudit(circuit, layout) : undefined;
      audit = {
        referenceId, engineValid: validation.valid, electricalValid: independent.valid,
        componentCount: circuit.components.length, pinCount: independent.endpoints.filter(item => !item.owner.startsWith("terminal/")).length,
        terminalCount: layout.terminals.length, wireCount: layout.jumpers.length, checkedPairs: independent.checkedPairs,
        formedBc109c: circuit.components.filter(item => item.physicalProfile === BC109C_FORMED_PROFILE).length,
        errors: validation.issues.filter(item => item.severity === "error"),
        warningCodes: [...new Set(validation.issues.filter(item => item.severity === "warning").map(item => item.code))],
        independent: { opens: independent.opens, shorts: independent.shorts, faults: independent.faults, mismatches: independent.mismatches },
        mutations,
      };
      cache.set(key, audit);
      representatives.push({ firstCaseId: testCase.id, options, ...audit });
    }
    const intendedPorts = [...new Set([testCase.config.groundNetId, testCase.config.source.netId, ...testCase.config.supplies.map(item => item.netId), ...(testCase.config.extraSources ?? []).map(item => item.netId)])];
    const missingStimulusTerminals = intendedPorts.filter(net => !circuit.instruments.some(connection => connection.netId === net));
    let status = "pass";
    if (!circuit.components.length) status = "no-breadboard-circuit";
    else if (testCase.scopeIncomplete) status = "source-scope-incomplete";
    else if (!audit.engineValid || !audit.electricalValid) status = audit.errors.some(issue => issue.code === "UNSUPPORTED_MOUNTING") ? "unsupported-mounting" : "failure";
    results.push({ id: testCase.id, group: testCase.group, options, status, referenceId: audit.referenceId, engineValid: audit.engineValid, electricalValid: audit.electricalValid, missingStimulusTerminals });
  }
  console.log(JSON.stringify({ options, completed: cases.length, uniqueLayouts: representatives.filter(item => JSON.stringify(item.options) === JSON.stringify(options)).length }));
}

const summaries = boardOptions.map(options => {
  const selected = results.filter(item => JSON.stringify(item.options) === JSON.stringify(options));
  const unique = representatives.filter(item => JSON.stringify(item.options) === JSON.stringify(options));
  const mutationTotals = { removalTried: 0, removalCritical: 0, removalCaught: 0, removalRedundant: 0, shortingTried: 0, shortingCaught: 0, falsePass: 0 };
  for (const item of unique) if (item.mutations) {
    mutationTotals.removalTried += item.mutations.removal.tried;
    mutationTotals.removalCritical += item.mutations.removal.critical;
    mutationTotals.removalCaught += item.mutations.removal.caught;
    mutationTotals.removalRedundant += item.mutations.removal.redundant;
    mutationTotals.shortingTried += item.mutations.shorting.tried;
    mutationTotals.shortingCaught += item.mutations.shorting.caught;
    mutationTotals.falsePass += item.mutations.removal.falsePass.length + item.mutations.shorting.falsePass.length;
  }
  const KNOWN_STATUS = new Set(["pass", "no-breadboard-circuit", "source-scope-incomplete", "unsupported-mounting"]);
  return { options, cases: selected.length, uniqueLayouts: unique.length, status: Object.fromEntries([...new Set(selected.map(item => item.status))].map(status => [status, selected.filter(item => item.status === status).length])), engineFalsePass: selected.filter(item => item.engineValid && !item.electricalValid).length, missingStimulusTerminals: selected.filter(item => item.missingStimulusTerminals.length).length,
    // A case that reports pass must also expose every drive, COM and ground terminal its numerical setup uses.
    passWithMissingStimulus: selected.filter(item => item.status === "pass" && item.missingStimulusTerminals.length).map(item => item.id),
    unexpectedStatus: [...new Set(selected.map(item => item.status))].filter(status => !KNOWN_STATUS.has(status) && status !== "failure"), mutationTotals };
});
const rawBc109cControls = [], rawKeys = new Set();
for (const testCase of cases) {
  const circuit = structuredClone(testCase.circuit);
  const targets = circuit.components.filter(item => item.definitionId === BC109C_DEFINITION_ID);
  if (!targets.length) continue;
  for (const component of targets) delete component.physicalProfile;
  const key = structuralKey(circuit);
  if (rawKeys.has(key)) continue;
  rawKeys.add(key);
  const layout = createLayout(circuit, COMPONENT_CATALOG, boardOptions[0]);
  const validation = validateLayout(circuit, COMPONENT_CATALOG, layout);
  const blocked = !validation.valid && targets.every(component =>
    !layout.placements.some(item => item.componentId === component.id) &&
    validation.issues.some(issue => issue.componentId === component.id && issue.code === "UNSUPPORTED_MOUNTING"));
  rawBc109cControls.push({ firstCaseId: testCase.id, targets: targets.map(item => item.id), blocked });
}
const directory = resolve("output/course-verification");
mkdirSync(directory, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(), scope: "151 source conditions; BC109C uses explicit application-defined formed profile on cloned circuits only.",
  method: "Independent canonical hole-ID strip/rail graph, jumper union, all component-pin and instrument-terminal pair equivalence. Every distinct baseline layout removes each jumper and shorts every pair of nets having spare holes. Numeric tolerances are irrelevant to this exact connectivity comparison.",
  limitations: ["Pin-net equivalence is relative to fixture netlists. Physical pin numbering and clearances are separately checked by the real layout validator against catalog/profile data.", "Pass does not confirm real hardware, power-source wiring absent from a fixture, polarity of an unspecified physical capacitor, or the source schematic itself.", "Generic board geometry is 830 contacts per board, selected rail continuity is an explicit assumption. Actual board rail continuity requires physical identification.", "External transformer packages remain blocked. Empty DAQ loopback circuits and microphone placeholders are excluded from a full-circuit pass."],
  summaries, rawBc109cControls, cases: results, representatives,
};
writeFileSync(resolve(directory, "physical-summary.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ summaries, file: resolve(directory, "physical-summary.json") }));
// Beyond false passes: an unknown status, a pass without its stimulus terminals, or an oracle that generated no mutants at all
// would otherwise leave this script green while proving nothing.
const oracleProblems = summaries.flatMap(item => [
  ...item.unexpectedStatus.map(status => `unexpected status ${status}`),
  ...item.passWithMissingStimulus.map(id => `${id} passes without a required stimulus terminal`),
  !item.mutationTotals.removalTried ? "no open-circuit mutants were generated" : null,
  !item.mutationTotals.shortingTried ? "no short-circuit mutants were generated" : null,
].filter(Boolean).map(problem => `${JSON.stringify(item.options)}: ${problem}`));
for (const problem of oracleProblems) console.error(problem);
if (oracleProblems.length || summaries.some(item => item.engineFalsePass || item.mutationTotals.falsePass || item.status.failure) || rawBc109cControls.some(item => !item.blocked)) process.exitCode = 1;
