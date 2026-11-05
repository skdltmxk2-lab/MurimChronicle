import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", output)(module, module.exports, dependency => load(dependency.slice(2)));
  cache.set(name, module.exports); return module.exports;
}
const { runSimulation, defaultSimulationConfig, SimulationError } = load("simulation");
const { COMPONENT_CATALOG } = load("catalog");
const { IDEAL_CENTER_TAP_ID, IDEAL_CENTER_TAP_PACKAGE, IDEAL_CENTER_TAP_LABELS, parseTransformerRatio } = load("simulation-transformer");
const transformer = {
  id: IDEAL_CENTER_TAP_ID, name: "Explicit ideal CT", kind: "transformer", package: IDEAL_CENTER_TAP_PACKAGE,
  category: "Test schematic", description: "Not a physical footprint", mounting: "external", pinoutStatus: "generic",
  pins: IDEAL_CENTER_TAP_LABELS.map((label, index) => ({ id: String(index + 1), label })),
};
const definitions = [...COMPONENT_CATALOG.filter(def => def.id !== transformer.id), transformer];
const resistor = (id, value, a, b) => ({ id, definitionId: "resistor-axial", value, pinNets: { 1: a, 2: b } });
const make = (ratio = "1:1") => ({
  id: "ideal-transformer-audit", title: "Transformer audit", description: "", instruments: [], notes: [], reviewItems: [],
  netNames: { GND: "GND", IN: "IN", PRIMARY: "PRIMARY", SP: "SP", CT: "CT", SM: "SM" },
  components: [resistor("RS", "100 Ω", "IN", "PRIMARY"), resistor("RL", "1 kΩ", "SP", "SM"),
    { id: "T1", definitionId: transformer.id, value: ratio, pinNets: { 1: "PRIMARY", 2: "GND", 3: "SP", 4: "CT", 5: "SM" } }],
});
function configFor(circuit) {
  return { ...defaultSimulationConfig(circuit), source: { netId: "IN", waveform: "sine", frequencyHz: 1000, amplitudePeak: 1, offset: 0, phaseDegrees: 0 },
    extraSources: [], supplies: [{ netId: "CT", voltage: 2.5 }], durationSeconds: 0.002, sampleCount: 257, acStartHz: 100, acStopHz: 10000, acPoints: 3 };
}
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}, tol=${tolerance}`);

test("turns ratio is explicit primary:full-secondary, bounded and never inferred from a part label", () => {
  near(parseTransformerRatio("1:1"), 1); near(parseTransformerRatio(" 2 : 1 "), 2); near(parseTransformerRatio("1:10"), 0.1);
  for (const value of ["CS195", "600Ω:8Ω", "1", "0:1", "1:0", "-1:1", "1:1:1", "NaN:1", "1e3:1", "1001:1", "1:1001", null, 1]) assert.throws(() => parseTransformerRatio(value));
});

test("loaded 1:1 and 2:1 transformers reflect load to primary and conserve instantaneous power", () => {
  for (const ratio of [1, 2]) {
    const circuit = make(`${ratio}:1`), result = runSimulation(circuit, definitions, configFor(circuit));
    const primaryGain = ratio ** 2 * 1000 / (100 + ratio ** 2 * 1000);
    result.time.forEach((t, index) => {
      const input = Math.sin(2 * Math.PI * 1000 * t);
      const vp = result.nodeVoltages.PRIMARY[index], sp = result.nodeVoltages.SP[index], sm = result.nodeVoltages.SM[index];
      near(vp, input * primaryGain); near(sp, 2.5 + vp / (2 * ratio)); near(sm, 2.5 - vp / (2 * ratio));
      const primaryPower = vp * (input - vp) / 100;
      const secondaryPower = (sp - sm) ** 2 / 1000;
      near(primaryPower, secondaryPower, 1e-12);
    });
    for (let i = 0; i < result.ac.frequenciesHz.length; i++) {
      near(result.ac.nodeGainMagnitude.PRIMARY[i], primaryGain);
      near(result.ac.nodeGainMagnitude.SP[i], primaryGain / (2 * ratio));
      near(result.ac.nodeGainMagnitude.SM[i], primaryGain / (2 * ratio));
      near(result.ac.nodePhaseDegrees.SP[i], 0); near(Math.abs(result.ac.nodePhaseDegrees.SM[i]), 180);
    }
    assert.match(result.warnings.join(" "), /회로도 전용 이상 모델/);
  }
});

test("center-tap bias loads the divider and conserves DC terminal currents", () => {
  const circuit = make();
  circuit.components = circuit.components.filter(part => part.id !== "RL");
  circuit.components.push(resistor("RU", "2 kΩ", "SP", "GND"), resistor("RD", "2 kΩ", "SM", "GND"), resistor("RBIAS", "1 kΩ", "BIAS", "CT"));
  circuit.netNames.BIAS = "BIAS";
  const config = configFor(circuit); config.supplies = [{ netId: "BIAS", voltage: 5 }];
  const result = runSimulation(circuit, definitions, config);
  near(result.dc.nodeVoltages.CT, 2.5); near(result.dc.nodeVoltages.SP, 2.5); near(result.dc.nodeVoltages.SM, 2.5);
  const currents = result.dc.deviceCurrents.T1;
  near(currents["P+"], 0); near(currents["P−"], 0);
  near(currents["S+"], -0.00125); near(currents["S−"], -0.00125); near(currents.CT, 0.0025);
  near(Object.values(currents).reduce((sum, value) => sum + value, 0), 0);
  near(result.dc.sourceCurrents.BIAS, -0.0025);
});

test("a floating primary common mode is valid when referenced, with no galvanic CT-to-primary short", () => {
  const circuit = make("2:1");
  circuit.components[2].pinNets[2] = "PBIAS"; circuit.netNames.PBIAS = "PBIAS";
  const config = configFor(circuit); config.source.offset = 4;
  config.supplies.push({ netId: "PBIAS", voltage: 4 });
  // Keep an actual ground terminal in the modeled circuit without changing bias.
  circuit.components.push(resistor("GROUNDREF", "1 MΩ", "PBIAS", "GND"));
  const result = runSimulation(circuit, definitions, config);
  near(result.dc.nodeVoltages.PRIMARY, 4); near(result.dc.nodeVoltages.CT, 2.5);
  result.time.forEach((_, index) => near(result.nodeVoltages.SP[index] - result.nodeVoltages.SM[index], (result.nodeVoltages.PRIMARY[index] - 4) / 2));
});

test("nonzero DC primary voltage, shorted windings and truly floating secondary are rejected", () => {
  const circuit = make(), config = configFor(circuit);
  assert.throws(() => runSimulation(circuit, definitions, { ...config, source: { ...config.source, offset: 1 } }), error => error instanceof SimulationError && /DC 전압차/.test(error.message));
  const shorted = structuredClone(circuit); shorted.components[2].pinNets[3] = "CT";
  assert.throws(() => runSimulation(shorted, definitions, config), /단락/);
  assert.throws(() => runSimulation(circuit, definitions, { ...config, supplies: [] }), /특이|부유/);
});

test("unknown CS195 and changed ideal-terminal identities are not silently modeled", () => {
  const circuit = make(), config = configFor(circuit);
  const wrongPins = structuredClone(transformer); wrongPins.pins[2].label = "UNKNOWN";
  assert.throws(() => runSimulation(circuit, definitions.map(def => def.id === transformer.id ? wrongPins : def), config), /5단자 이상 변압기/);
  const unknown = structuredClone(circuit); unknown.components[2].definitionId = "ref-cs195-transformer-module";
  assert.throws(() => runSimulation(unknown, definitions, config), /외부 소자|정의/);
});

test("registered BC109C numerical simulation keeps its physical TO-18 mounting unresolved", () => {
  const circuit = { ...make(), components: [
    { id: "Q1", definitionId: "bjt-bc109c-philips-to18", value: "BC109C", pinNets: { 1: "GND", 2: "IN", 3: "OUT" } },
    resistor("RC", "10 kΩ", "VCC", "OUT"),
  ], netNames: { GND: "GND", IN: "IN", OUT: "OUT", VCC: "+9 V" } };
  const config = configFor(circuit); config.source = { ...config.source, waveform: "dc", offset: 0.62, amplitudePeak: 0 };
  config.supplies = [{ netId: "VCC", voltage: 9 }];
  const result = runSimulation(circuit, definitions, config), current = result.dc.deviceCurrents.Q1;
  near(current.C + current.B + current.E, 0, 1e-12); near(current.C / current.B, 677, 1e-4);
  assert.match(result.warnings.join(" "), /TO-18 원형 리드.*성형 프로필/);
  assert.equal(COMPONENT_CATALOG.find(def => def.id === "bjt-bc109c-philips-to18").mounting, "external");
});
