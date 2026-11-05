import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const source = readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    assert.ok(dependency.startsWith("./"));
    return load(dependency.slice(2));
  });
  cache.set(name, module.exports);
  return module.exports;
}
const { ensureReferenceConnections } = load("reference-connections");
const { COURSE_ANALOG_CASES } = load("course-analog-fixtures");
const { LAB5_REFERENCE_CASES, buildLab5ReferenceCase } = load("lab5-reference");
const { ADVANCED_ANALOG_CASES, buildAdvancedAnalogCase } = load("course-advanced-fixtures");
const { getVerificationInput } = load("course-verification");
const { COMPONENT_CATALOG } = load("catalog");
const { runSimulation } = load("simulation");
const fixtures = [
  ...COURSE_ANALOG_CASES,
  ...LAB5_REFERENCE_CASES.flatMap(item => (item.id === "c2-drive" || item.id === "c3-mix" ? ["1:1", "2:1"] : ["1:1"]).map(ratio => ({ id: `lab-5-${item.id}-${ratio.replace(":", "to")}`, ...buildLab5ReferenceCase(item.id, ratio) }))),
  ...ADVANCED_ANALOG_CASES.map(item => ({ id: item.id, ...buildAdvancedAnalogCase(item.id) })),
];
function connection(circuit, suffix) {
  return circuit.instruments.find(item => item.id === `reference-connection-${suffix}`);
}

test("all 149 component-bearing conditions expose every configured drive and return at the real registry entry", () => {
  assert.equal(fixtures.length, 151);
  let checked = 0;
  for (const fixture of fixtures) {
    const input = getVerificationInput(fixture.id);
    assert.ok(input, fixture.id);
    const { circuit, config } = input;
    if (!circuit.components.length) continue;
    checked++;
    assert.equal(connection(circuit, "ground").netId, config.groundNetId, fixture.id);
    const componentNets = new Set(circuit.components.flatMap(item => Object.values(item.pinNets)));
    for (const [index, source] of [config.source, ...(config.extraSources ?? [])].entries()) {
      if (source.netId === config.groundNetId && source.offset === 0 && source.amplitudePeak === 0) continue;
      assert.equal(connection(circuit, `source-${index}-output`).netId, source.netId, fixture.id);
      assert.equal(connection(circuit, `source-${index}-return`).netId, config.groundNetId, fixture.id);
    }
    config.supplies.forEach((supply, index) => {
      assert.equal(connection(circuit, `supply-${index}-output`).netId, supply.netId, fixture.id);
      assert.equal(connection(circuit, `supply-${index}-output`).setting, `${supply.voltage} V DC`, fixture.id);
      assert.equal(connection(circuit, `supply-${index}-return`).netId, config.groundNetId, fixture.id);
    });
    assert.equal(new Set(circuit.instruments.map(item => item.id)).size, circuit.instruments.length);
    for (const port of circuit.instruments) assert.ok(componentNets.has(port.netId), `${fixture.id}/${port.id} adds a node`);
    assert.deepEqual(circuit, fixture.circuit, fixture.id);
  }
  assert.equal(checked, 149);
});

test("reconstruction preserves source objects, parts, measurements and repeated-call identity", () => {
  const original = structuredClone(COURSE_ANALOG_CASES.find(item => item.id === "l0-rc-100hz"));
  const snapshot = structuredClone(original);
  const rebuilt = ensureReferenceConnections(original.circuit, original.config);
  assert.deepEqual(original, snapshot);
  assert.notEqual(rebuilt, original.circuit);
  assert.deepEqual(rebuilt.components, original.circuit.components);
  assert.deepEqual(rebuilt, ensureReferenceConnections(rebuilt, original.config));
  for (const port of original.circuit.instruments.filter(item => /오실로|DMM/.test(item.instrument))) {
    assert.deepEqual(rebuilt.instruments.find(item => item.id === port.id), port);
  }
  const changed = structuredClone(original.config);
  changed.source.frequencyHz = 2345;
  changed.source.amplitudePeak = 0.012;
  const revised = ensureReferenceConnections(rebuilt, changed);
  assert.match(connection(revised, "source-0-output").setting, /2\.345 kHz.*12 mV peak/);
  assert.equal(revised.instruments.length, rebuilt.instruments.length);
});

test("independent three-channel mixer outputs retain phase, separate nets and declared hardware requirements", () => {
  const { circuit } = buildAdvancedAnalogCase("project-2025-rf-10mv");
  for (const [index, net] of ["RF", "LO_PLUS", "LO_MINUS"].entries()) {
    assert.equal(connection(circuit, `source-${index}-output`).netId, net);
    assert.match(connection(circuit, `source-${index}-output`).instrument, new RegExp(`FG${index + 1}`));
    assert.equal(connection(circuit, `source-${index}-return`).netId, "GND");
  }
  assert.match(connection(circuit, "source-1-output").setting, /위상 90°/);
  assert.match(connection(circuit, "source-2-output").setting, /위상 270°/);
  assert.match(circuit.notes.join(" "), /myDAQ.*AO0·AO1.*추가 동기 출력/);
});

test("DC common-mode and negative-supply outputs cannot be replaced by measurement or ground terminals", () => {
  const common = COURSE_ANALOG_CASES.find(item => item.id === "l3-common-3").circuit;
  assert.equal(connection(common, "source-0-output").netId, "CM");
  assert.equal(connection(common, "source-0-output").setting, "3 V DC");
  const negative = COURSE_ANALOG_CASES.find(item => item.id === "l4-wien-rf-22000").circuit;
  assert.equal(connection(negative, "supply-0-output").netId, "VEE");
  assert.equal(connection(negative, "supply-0-output").setting, "-9 V DC");
  assert.equal(connection(negative, "supply-0-return").netId, "GND");
  assert.equal(connection(negative, "source-0-output").netId, "VCC");
});

test("direct DAQ loopbacks retain empty breadboard scope and blocked reason", () => {
  for (const fixture of COURSE_ANALOG_CASES.filter(item => item.id.startsWith("l0-loopback-"))) {
    assert.equal(fixture.circuit.components.length, 0);
    assert.equal(fixture.circuit.instruments.length, 0);
    assert.ok(getVerificationInput(fixture.id).blockedReason);
  }
});

test("connection declarations leave actual numerical results exactly identical for representative circuits", () => {
  const ids = ["l0-dc--15v-10000ohm", "l1-frequency-1000", "l2-pushpull-dc", "l3-common-3", "l4-wien-rf-22000", "lab-5-c1-dc-1to1", "project-2025-rf-10mv"];
  for (const id of ids) {
    const fixture = getVerificationInput(id);
    assert.ok(fixture, id);
    const original = { ...fixture.circuit, instruments: [] };
    const before = runSimulation(original, COMPONENT_CATALOG, fixture.config);
    const after = runSimulation(fixture.circuit, COMPONENT_CATALOG, fixture.config);
    assert.deepEqual(after.dc, before.dc, id);
    assert.deepEqual(after.time, before.time, id);
    assert.deepEqual(after.nodeVoltages, before.nodeVoltages, id);
    assert.deepEqual(after.ac, before.ac, id);
  }
});
