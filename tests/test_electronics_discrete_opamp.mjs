import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const cache = new Map();
function load(file) {
  file = path.normalize(file); if (cache.has(file)) return cache.get(file);
  const mod = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (!name.startsWith(".")) throw Error(`Unexpected dependency: ${name}`);
    return load(path.join(path.dirname(file), `${name}.ts`));
  } }, { filename: file });
  cache.set(file, mod.exports); return mod.exports;
}
const engine = load("src/lib/electronics/engine.ts");
const simulation = load("src/lib/electronics/simulation.ts");
const recommendations = load("src/lib/electronics/simulation-recommendations.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { CIRCUIT_TEMPLATES: templates } = load("src/lib/electronics/templates.ts");
const { EXPERIMENTS: experiments, COURSE_SUPPORT_SCOPE: scope } = load("src/lib/electronics/experiments.ts");
const ids = ["discrete-opamp-noninverting", "discrete-opamp-comparator", "discrete-opamp-sallen-key"];
const supplyId = "discrete-opamp-mydaq-supply";
const allIds = [supplyId, ...ids];
const template = id => { const circuit = templates.find(item => item.id === id); assert.ok(circuit, id); return circuit; };

// Pin-net table of the shared core, written independently of templates.ts.
const CORE = {
  Q1: { C: "C1", B: "INM", E: "E12" }, Q2: { C: "C2", B: "INP", E: "E12" }, Q3: { C: "E12", B: "B3", E: "E3" },
  Q4: { C: "N5", B: "C2", E: "VCC" }, Q5: { C: "VCC", B: "N5", E: "E5" }, Q6: { C: "VEE", B: "N6", E: "E6" },
  D1: { A: "N5", K: "NM" }, D2: { A: "NM", K: "N6" },
};

test("2026 project experiment lists the myDAQ supply and the three discrete op-amp templates", () => {
  const experiment = experiments.find(item => item.id === "project-2026");
  assert.deepEqual(Array.from(experiment.templateIds), allIds);
  assert.ok(scope.some(item => item.id === "project-2026"));
  for (const id of ids) template(id);
});

test("core transistor and diode roles match the schematic through the catalog pin labels", () => {
  const defs = new Map(definitions.map(item => [item.id, item]));
  for (const id of ids) {
    const circuit = template(id);
    for (const [ref, roles] of Object.entries(CORE)) {
      const component = circuit.components.find(item => item.id === ref);
      const definition = defs.get(component.definitionId);
      for (const [role, net] of Object.entries(roles)) {
        const pin = definition.pins.find(item => item.label === role || item.label.startsWith(`${role} /`));
        assert.ok(pin, `${ref} ${role}`);
        assert.equal(component.pinNets[pin.id], net, `${id} ${ref}.${role}`);
      }
      if (component.definitionId === "bjt-bc109c-philips-to18") assert.equal(component.physicalProfile, "bc109c-to18-formed-v1");
    }
  }
});

test("every template places on one 830-hole board and passes the connection check in both rail modes", () => {
  for (const id of allIds) for (const railMode of ["split", "continuous"]) {
    const circuit = template(id);
    const layout = engine.createLayout(circuit, definitions, { boards: 1, railMode });
    const report = engine.validateLayout(circuit, definitions, layout);
    assert.equal(report.valid, true, `${id} ${railMode}: ${report.issues.filter(i => i.severity === "error").map(i => i.code).join(",")}`);
    const pins = circuit.components.reduce((sum, item) => sum + Object.keys(item.pinNets).length, 0);
    assert.equal(report.checkedPins, pins);
  }
});

test("myDAQ supply block: emitter followers on the ±15 V terminals with a 12 kΩ/22 kΩ divider", () => {
  const circuit = template(supplyId), defs = new Map(definitions.map(item => [item.id, item]));
  const roles = { QRP: { C: "VCC", B: "BRP", E: "VP9" }, QRN: { C: "VEE", B: "BRN", E: "VN9" } };
  for (const [ref, map] of Object.entries(roles)) {
    const component = circuit.components.find(item => item.id === ref), definition = defs.get(component.definitionId);
    for (const [role, net] of Object.entries(map)) assert.equal(component.pinNets[definition.pins.find(pin => pin.label === role || pin.label.startsWith(`${role} /`)).id], net, `${ref}.${role}`);
  }
  assert.equal(defs.get(circuit.components.find(item => item.id === "QRP").definitionId).id, "bjt-bc109c-philips-to18");
  assert.equal(defs.get(circuit.components.find(item => item.id === "QRN").definitionId).id, "bjt-bc556b-onsemi-to92");
  const value = ref => circuit.components.find(item => item.id === ref);
  assert.deepEqual([value("RRP1").value, Object.values(value("RRP1").pinNets).sort().join()], ["12 kΩ", "BRP,VCC"]);
  assert.deepEqual([value("RRP2").value, Object.values(value("RRP2").pinNets).sort().join()], ["22 kΩ", "BRP,GND"]);
  assert.deepEqual([value("RRN1").value, Object.values(value("RRN1").pinNets).sort().join()], ["22 kΩ", "BRN,GND"]);
  assert.deepEqual([value("RRN2").value, Object.values(value("RRN2").pinNets).sort().join()], ["12 kΩ", "BRN,VEE"]);
  const ports = Object.fromEntries(circuit.instruments.map(port => [port.id, port]));
  assert.deepEqual([ports["mydaq-p15"].netId, ports["mydaq-p15"].setting, ports["mydaq-n15"].netId, ports["mydaq-n15"].setting], ["VCC", "+15 V", "VEE", "−15 V"]);
  assert.deepEqual([circuit.netNames.VCC, circuit.netNames.VEE], ["+15 V", "−15 V"]);
  const result = simulation.runSimulation(circuit, definitions, simulation.defaultSimulationConfig(circuit));
  assert.ok(Math.abs(result.dc.nodeVoltages.VP9 - 9) < 0.15, `VP9 ${result.dc.nodeVoltages.VP9}`);
  assert.ok(Math.abs(result.dc.nodeVoltages.VN9 + 9) < 0.15, `VN9 ${result.dc.nodeVoltages.VN9}`);
  const recommendation = recommendations.deriveSimulationRecommendation(circuit, definitions);
  assert.deepEqual([recommendation.inputNetId, recommendation.outputNetId, recommendation.groundNetId], ["VP9", "VN9", "GND"]);
});

test("op-amp boards take ±9 V from the supply block and use only myDAQ AO and AI terminals", () => {
  const drives = { "discrete-opamp-noninverting": [["AO0", "INP"]], "discrete-opamp-comparator": [["AO0", "INP"]], "discrete-opamp-sallen-key": [["AO0", "VIN"], ["AO1", "VNOISE"]] };
  for (const id of ids) {
    const circuit = template(id), ports = circuit.instruments;
    assert.deepEqual([circuit.netNames.VCC, circuit.netNames.VEE], ["+9 V", "−9 V"], id);
    assert.ok(ports.every(port => /myDAQ|전원부/.test(port.instrument)), `${id}: ${ports.map(port => port.instrument).join()}`);
    assert.deepEqual(Array.from(ports.filter(port => /^AO\d$/.test(port.port)), port => [port.port, port.netId]), drives[id], id);
    const input = id.endsWith("sallen-key") ? "VIN" : "INP";
    assert.equal(ports.find(port => port.port.startsWith("AI0+")).netId, input, id);
    assert.equal(ports.find(port => port.port.startsWith("AI1+")).netId, "OUT", id);
    assert.ok(ports.filter(port => /^AI\d−/.test(port.port)).every(port => port.netId === "GND"), id);
    assert.deepEqual(Array.from(ports.filter(port => port.instrument === "±9 V 전원부"), port => `${port.netId}=${port.setting}`), ["VCC=+9 V", "GND=0 V", "VEE=−9 V"], id);
    const config = simulation.defaultSimulationConfig(circuit);
    assert.deepEqual(Array.from(config.supplies, supply => `${supply.netId}=${supply.voltage}`), ["VCC=9", "VEE=-9"], id);
  }
});

// Course parts list (실험 부품 목록, 2022 edition) per kit; the team has two kits.
const KIT = { resistor: { 4.7: 2, 8.2: 1, 50: 1, 100: 1, 200: 2, 1e3: 2, 2e3: 1, 2.2e3: 2, 5.1e3: 1, 6.8e3: 1, 10e3: 4, 12e3: 1, 22e3: 2, 30e3: 2, 33e3: 1, 62e3: 2, 82e3: 1, 100e3: 1 },
  capacitor: { 1e-9: 2, 1e-7: 1, 2.2e-7: 1, 1e-6: 2, 1e-5: 2, 1e-4: 4 },
  part: { "bjt-bc109c-philips-to18": 5, "bjt-bc556b-onsemi-to92": 2, "bjt-bc549c-onsemi-to92": 3, "diode-1n4148-vishay-do35": 3 } };
const KITS = 2;
const quantity = text => { const m = /^([\d.]+)\s*([kMmµn]?)\s*(Ω|F)$/.exec(text.trim()); assert.ok(m, `value ${text}`); return Number((Number(m[1]) * { "": 1, k: 1e3, M: 1e6, m: 1e-3, "µ": 1e-6, n: 1e-9 }[m[2]]).toPrecision(6)); };
test("the myDAQ supply plus each op-amp board fits within two course part kits", () => {
  for (const id of ids) {
    const used = new Map();
    for (const component of [...template(supplyId).components, ...template(id).components]) {
      const key = component.definitionId === "resistor-axial" ? `resistor:${quantity(component.value)}` : component.definitionId === "capacitor-ceramic" ? `capacitor:${quantity(component.value)}` : `part:${component.definitionId}`;
      used.set(key, (used.get(key) ?? 0) + 1);
    }
    for (const [key, count] of used) {
      const [kind, value] = key.split(/:(.*)/s);
      const stock = (KIT[kind][kind === "part" ? value : Number(value)] ?? 0) * KITS;
      assert.ok(count <= stock, `${id}: ${key} needs ${count}, kits have ${stock}`);
    }
  }
});

test("default configuration opts into the damped fast-RC step policy only for these templates", () => {
  for (const id of allIds) assert.equal(simulation.defaultSimulationConfig(template(id)).timeStepPolicy, "damp-fast-rc");
  assert.equal(simulation.defaultSimulationConfig(templates.find(item => item.id === "ce-amplifier")).timeStepPolicy, undefined);
  assert.throws(() => simulation.parseSimulationConfig({ ...simulation.defaultSimulationConfig(template(ids[0])), timeStepPolicy: "fast" }), /시간 간격 정책/);
});

const window = (result, values, start) => values.filter((_, i) => result.time[i] >= start);
const tone = (result, values, frequency, start) => {
  let re = 0, im = 0; const t = result.time, v = values;
  for (let i = 1; i < t.length; i++) if (t[i] >= start) { const dt = t[i] - t[i - 1]; re += v[i] * Math.cos(2 * Math.PI * frequency * t[i]) * dt; im += v[i] * Math.sin(2 * Math.PI * frequency * t[i]) * dt; }
  return 2 * Math.hypot(re, im) / (t.at(-1) - start);
};

test("non-inverting ×11 closes the loop: gain near 1+RF/RG within the educational model", () => {
  const circuit = template("discrete-opamp-noninverting");
  const result = simulation.runSimulation(circuit, definitions, simulation.defaultSimulationConfig(circuit));
  const out = window(result, result.nodeVoltages.OUT, 0.002), input = window(result, result.nodeVoltages.INP, 0.002);
  const gain = (Math.max(...out) - Math.min(...out)) / (Math.max(...input) - Math.min(...input));
  assert.ok(gain > 10.6 && gain < 11.05, `gain ${gain}`);
  assert.ok(Math.abs(result.dc.nodeVoltages.OUT) < 0.3, `offset ${result.dc.nodeVoltages.OUT}`);
  const ac = result.ac.nodeGainMagnitude.OUT, f = result.ac.frequenciesHz;
  assert.ok(Math.abs(ac[0] - 11) < 0.4);
  assert.ok(ac[f.findIndex(x => x >= 1e6)] < 3, "closed-loop gain falls well below 11 by 1 MHz");
  assert.ok(result.warnings.some(text => text.includes("damp-fast-rc")));
});

test("comparator saturates near both rails around the 0.21 V reference, inside the myDAQ AI range and the BC109C VCEO", () => {
  const circuit = template("discrete-opamp-comparator");
  const result = simulation.runSimulation(circuit, definitions, simulation.defaultSimulationConfig(circuit));
  const out = window(result, result.nodeVoltages.OUT, 0.001);
  assert.ok(Math.max(...out) > 7.5 && Math.min(...out) < -7.5);
  assert.ok(Math.max(...out.map(Math.abs)) < 10, "AI1 ±10 V range");
  assert.ok(9 - Math.min(...window(result, result.nodeVoltages.E5, 0.001)) < 20, "Q5 VCE below 20 V");
  const reference = result.dc.nodeVoltages.INM;
  assert.ok(Math.abs(reference - 9 * 2 / 84) < 0.01, `reference ${reference}`);
});

test("Sallen-Key low-pass keeps 500 Hz and suppresses 8 kHz", () => {
  const circuit = template("discrete-opamp-sallen-key");
  const result = simulation.runSimulation(circuit, definitions, simulation.defaultSimulationConfig(circuit));
  const low = tone(result, result.nodeVoltages.OUT, 500, 0.002), high = tone(result, result.nodeVoltages.OUT, 8000, 0.002);
  assert.ok(low > 0.42 && low < 0.5, `500 Hz ${low}`);
  assert.ok(high > 0.01 && high < 0.03, `8 kHz ${high}`);
  assert.ok(20 * Math.log10((high / 0.3) / (low / 0.3)) < -25);
  for (const [net, node] of [["VIN", "LPA"], ["VNOISE", "LPA"]]) {
    const current = Math.max(...result.nodeVoltages[net].map((value, i) => Math.abs(value - result.nodeVoltages[node][i]) / 2000));
    assert.ok(current < 0.002, `${net} AO current ${current}`);
  }
});

test("automatic VIN·VOUT setup picks the primary generator input and the op-amp output", () => {
  const expected = { "discrete-opamp-noninverting": "INP", "discrete-opamp-comparator": "INP", "discrete-opamp-sallen-key": "VIN" };
  for (const id of ids) {
    const recommendation = recommendations.deriveSimulationRecommendation(template(id), definitions);
    assert.equal(recommendation.sourceNetId, expected[id], `${id} source`);
    assert.equal(recommendation.inputNetId, expected[id], `${id} VIN`);
    assert.equal(recommendation.outputNetId, "OUT", `${id} VOUT`);
    assert.equal(recommendation.groundNetId, "GND");
    assert.equal(recommendation.config.timeStepPolicy, "damp-fast-rc");
  }
  const lowpass = recommendations.deriveSimulationRecommendation(template("discrete-opamp-sallen-key"), definitions).config;
  assert.equal(lowpass.source.frequencyHz, 500);
  assert.deepEqual(Array.from(lowpass.extraSources, source => `${source.netId}@${source.frequencyHz}`), ["VNOISE@8000"]);
});

test("the recommended Sallen-Key configuration runs and still separates the two tones", () => {
  const circuit = template("discrete-opamp-sallen-key");
  const config = recommendations.deriveSimulationRecommendation(circuit, definitions).config;
  const result = simulation.runSimulation(circuit, definitions, config);
  const start = config.durationSeconds / 2;
  const low = tone(result, result.nodeVoltages.OUT, 500, start), high = tone(result, result.nodeVoltages.OUT, 8000, start);
  assert.ok(low > 0.42 && low < 0.5, `500 Hz ${low}`);
  assert.ok(high > 0.01 && high < 0.03, `8 kHz ${high}`);
});
