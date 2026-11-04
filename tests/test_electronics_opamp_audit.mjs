import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  new Function("module", "exports", "require", ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText)(module, module.exports, dependency => load(dependency.slice(2)));
  cache.set(name, module.exports); return module.exports;
}
const { createEducationalOpamp } = load("simulation-opamp");
const { runSimulation, defaultSimulationConfig, parseSimulationValue, SimulationError } = load("simulation");
const { buildNonlinearDevices } = load("simulation-models");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
const near = (a, b, abs = 1e-9, rel = 1e-6) => assert.ok(Math.abs(a - b) <= abs + rel * Math.abs(b), `${a} != ${b}`);
const resistor = (id, a, b, value) => ({ id, definitionId: "resistor-axial", value, pinNets: { 1: a, 2: b } });
const capacitor = (id, a, b, value) => ({ id, definitionId: "capacitor-ceramic", value, pinNets: { 1: a, 2: b } });
const make = components => ({ id: "audit", title: "audit", description: "", components, netNames: { GND: "GND", VCC: "+9 V", VEE: "-9 V", IN: "IN", OUT: "OUT" }, instruments: [], notes: [], reviewItems: [] });

test("op-amp state Jacobian matches finite differences in DC, linear slew, slew clipping, and rail clipping regions", () => {
  const model = createEducationalOpamp("U1", "OUT", "PLUS", "MINUS", -9, 9, "ROW");
  const cases = [
    [() => model.dc(), [1, 0.000005, 0, 0]],
    [() => model.dc(), [7.5, 0.01, 0, 0]],
    [() => model.initial(0.001), [0.001, 0.2, 0, 0]],
    [() => model.transient(0, 1e-8), [0.001, 0.000001, 0, 0]],
    [() => model.transient(0, 1e-8), [0.005, 1, 0, 0]],
    [() => model.transient(7.499, 1e-8), [7.5, 1, 0, 0]],
  ];
  for (const [setMode, state] of cases) {
    setMode(); const result = model.device.evaluate(state);
    for (let j = 0; j < 4; j++) {
      const plus = [...state], minus = [...state], h = 1e-9;
      plus[j] += h; minus[j] -= h;
      const high = model.device.evaluate(plus), low = model.device.evaluate(minus);
      for (let i = 0; i < 4; i++) near(result.jacobian[i][j], (high.currents[i] - low.currents[i]) / (2 * h), 1e-6);
    }
  }
});

test("a small follower step equals the independently derived implicit Euler recurrence at every output sample", () => {
  const input = make([
    { id: "U1", definitionId: "opamp-ua741cn-st-dip8", value: "UA741CN", pinNets: { 1: "OPEN1", 2: "OUT", 3: "IN", 4: "VEE", 5: "OPEN5", 6: "OUT", 7: "VCC", 8: "OPEN8" } },
    resistor("RL", "OUT", "GND", "1 kΩ"),
  ]);
  const config = { ...defaultSimulationConfig(input), opampModel: "educational-dynamic", durationSeconds: 1e-5, sampleCount: 32, acPoints: 2 };
  config.source = { ...config.source, waveform: "square", amplitudePeak: 0.01, offset: 0, frequencyHz: 1000 };
  const result = runSimulation(input, definitions, config), h = 1e-5 / 31, pole = 2 * Math.PI * 1e6 / 200000;
  let expected = 0;
  near(result.nodeVoltages.OUT[0], 0);
  for (let i = 1; i < result.time.length; i++) {
    expected = (expected + h * pole * 200000 * 0.01) / (1 + h * pole * 200001);
    near(result.nodeVoltages.OUT[i], expected, 1e-10);
  }
});

test("op-amp plus complementary BJTs satisfy simultaneous resistor, capacitor and junction KCL during transition", () => {
  const input = structuredClone(templates.find(item => item.id === "ua741-push-pull"));
  const config = { ...defaultSimulationConfig(input), durationSeconds: 1e-5, sampleCount: 32, acPoints: 2 };
  config.source = { ...config.source, waveform: "square", amplitudePeak: 0.01, offset: 0 };
  const result = runSimulation(input, definitions, config), h = result.time[1];
  const devices = buildNonlinearDevices(input, definitions).devices;
  for (let at = 1; at <= 3; at++) {
    const sums = new Map(), add = (net, value) => sums.set(net, (sums.get(net) ?? 0) + value);
    for (const part of input.components) {
      const def = definitions.find(item => item.id === part.definitionId);
      if (!["resistor", "capacitor", "electrolytic"].includes(def.kind)) continue;
      const [a, b] = [part.pinNets[1], part.pinNets[2]], now = result.nodeVoltages[a][at] - result.nodeVoltages[b][at];
      const old = result.nodeVoltages[a][at - 1] - result.nodeVoltages[b][at - 1];
      const current = def.kind === "resistor" ? now / parseSimulationValue(part.value, "resistor") : parseSimulationValue(part.value, "capacitor") * (now - old) / h;
      add(a, current); add(b, -current);
    }
    for (const device of devices) {
      const currents = device.evaluate(device.pins.map(net => result.nodeVoltages[net][at])).currents;
      device.pins.forEach((net, pin) => add(net, currents[pin]));
    }
    for (const [net, residual] of sums) if (!["GND", "VCC", "IN", "DRIVE"].includes(net)) near(residual, 0, 1e-8);
  }
});

test("accepted results reject the exponential continuation region and an unstable cross-coupled BJT equilibrium", () => {
  const diode = make([{ id: "D1", definitionId: "diode-1n4148-vishay-do35", value: "1N4148", pinNets: { 1: "IN", 2: "GND" } }]);
  const dc = { ...defaultSimulationConfig(diode), sampleCount: 32, acPoints: 2 };
  dc.source = { ...dc.source, waveform: "dc", offset: 2.2, amplitudePeak: 0 };
  assert.throws(() => runSimulation(diode, definitions, dc), error => error instanceof SimulationError && /접선 연장/.test(error.message));
  const q = (id, c, b) => ({ id, definitionId: "bjt-bc549c-onsemi-to92", value: "BC549C", pinNets: { 1: c, 2: b, 3: "GND" } });
  const latch = make([resistor("RC1", "VCC", "C1", "10 kΩ"), resistor("RC2", "VCC", "C2", "10 kΩ"), resistor("RB1", "C2", "B1", "100 kΩ"), resistor("RB2", "C1", "B2", "100 kΩ"), q("Q1", "C1", "B1"), q("Q2", "C2", "B2"), capacitor("CC1", "C1", "GND", "10 nF"), capacitor("CC2", "C2", "GND", "10 nF")]);
  const settings = { ...defaultSimulationConfig(latch), sampleCount: 32, acPoints: 2 };
  assert.throws(() => runSimulation(latch, definitions, settings), error => error instanceof SimulationError && /순환 피드백/.test(error.message));
});
