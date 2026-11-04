import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const output = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", output)(module, module.exports, dependency => {
    assert.ok(dependency.startsWith("./")); return load(dependency.slice(2));
  });
  cache.set(name, module.exports); return module.exports;
}
const { NONLINEAR_MODEL_REGISTRY: registry, NONLINEAR_THERMAL_VOLTAGE: vt, getNonlinearModel, buildNonlinearDevices } = load("simulation-models");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const ids = { npn: "bjt-2n3904-onsemi-to92", pnp: "bjt-2n3906-onsemi-to92", diode: "diode-1n4148-vishay-do35", nmos: "mosfet-2n7000ta-onsemi-to92", pmos: "mosfet-irf9540n-infineon-to220" };
const fixture = (id, pinNets = { 1: "ONE", 2: "TWO", 3: "THREE" }) => ({ id: "fixture", title: "model", description: "", components: [{ id: "X1", definitionId: id, value: "", pinNets }], netNames: {}, instruments: [], notes: [], reviewItems: [] });
const device = id => buildNonlinearDevices(fixture(id), definitions).devices[0];
const near = (actual, expected, absolute = 1e-12, relative = 1e-8) => assert.ok(Math.abs(actual - expected) <= absolute + relative * Math.abs(expected), `${actual} != ${expected}`);
const modelFor = id => registry.find(model => model.definitionId === id);

test("every registered model matches the manufacturer catalog pin map and discloses its educational parameter source", () => {
  assert.ok(registry.length >= 12);
  assert.equal(new Set(registry.map(model => model.definitionId)).size, registry.length);
  for (const model of registry) {
    const definition = definitions.find(item => item.id === model.definitionId);
    assert.ok(definition, model.definitionId);
    assert.equal(getNonlinearModel(definition), model);
    assert.equal(model.educational, true);
    assert.ok(model.parameterBasis.length > 30);
    assert.ok(model.limitations.length);
    assert.ok(model.pinoutSources.every(source => source.url?.startsWith("https:") || source.file));
    assert.ok(model.rolePinIds.every(pinId => definition.pins.some(pin => pin.id === pinId)));
  }
});

test("physical pin orders EBC/CBE/SGD/DGS/GDS are translated to solver terminal roles", () => {
  assert.deepEqual(device(ids.npn).pins, ["THREE", "TWO", "ONE"]);
  assert.deepEqual(device("bjt-bc549c-onsemi-to92").pins, ["ONE", "TWO", "THREE"]);
  assert.deepEqual(device(ids.nmos).pins, ["THREE", "TWO", "ONE"]);
  assert.deepEqual(device("mosfet-bs170-onsemi-to92").pins, ["ONE", "TWO", "THREE"]);
  assert.deepEqual(device("mosfet-irf540n-infineon-to220").pins, ["TWO", "ONE", "THREE"]);
  assert.deepEqual(device(ids.pmos).pinLabels, ["D", "G", "S"]);
  assert.deepEqual(device(ids.npn).pinLabels, ["C", "B", "E"]);
  assert.deepEqual(device(ids.diode).pinLabels, ["A", "K"]);
});

test("Shockley diode forward voltage and reverse leakage follow the declared education parameters", () => {
  const p = modelFor(ids.diode).parameters, diode = device(ids.diode);
  const forwardVoltage = p.emissionCoefficient * vt * Math.log1p(0.001 / p.saturationCurrent);
  near(diode.evaluate([forwardVoltage, 0]).currents[0], 0.001);
  near(diode.evaluate([-5, 0]).currents[0], -p.saturationCurrent);
  assert.ok(forwardVoltage > 0.64 && forwardVoltage < 0.65);
  near(diode.evaluate([0.2, 0.2]).currents[0], 0);
});

test("Ebers–Moll has the declared active beta, reverse beta, saturation, and PNP sign symmetry", () => {
  const npn = device(ids.npn), pnp = device(ids.pnp), p = modelFor(ids.npn).parameters;
  const active = npn.evaluate([3, 0.65, 0]).currents;
  near(active[0] / active[1], p.betaForward, 1e-6);
  assert.ok(active[0] > 0 && active[1] > 0 && active[2] < 0);
  const reverse = npn.evaluate([0, 0.65, 3]).currents;
  near(reverse[2] / reverse[1], p.betaReverse, 1e-6);
  const saturated = npn.evaluate([0.1, 0.7, 0]).currents;
  assert.ok(saturated[0] / saturated[1] < p.betaForward / 2);
  for (const voltages of [[3, 0.65, 0], [0.1, 0.7, 0], [0, 0.65, 3], [3, -1, 0]]) {
    const a = npn.evaluate(voltages), b = pnp.evaluate(voltages.map(value => -value));
    a.currents.forEach((value, i) => near(b.currents[i], -value));
    a.jacobian.forEach((row, i) => row.forEach((value, j) => near(b.jacobian[i][j], value)));
  }
});

test("Level-1 MOS uses cutoff, linear and saturation equations with declared lambda", () => {
  const mos = device(ids.nmos), p = modelFor(ids.nmos).parameters;
  const gate = p.thresholdVoltage + 1;
  near(mos.evaluate([5, 0, 0]).currents[0], p.bodySaturationCurrent);
  for (const drain of [0.2, 0.8, 2, 5]) {
    const channel = p.beta * (drain < 1 ? drain - drain * drain / 2 : 0.5) * (1 + p.channelLengthModulation * drain);
    near(mos.evaluate([drain, gate, 0]).currents[0], channel + p.bodySaturationCurrent);
  }
  near(mos.evaluate([2, gate, 0]).currents[1], 0);
});

test("MOS body diode retains physical source polarity even when channel direction reverses, for both polarities", () => {
  for (const [id, sign] of [[ids.nmos, 1], [ids.pmos, -1]]) {
    const mos = device(id), p = modelFor(id).parameters;
    const voltage = 0.65;
    const expected = p.bodySaturationCurrent * Math.expm1(voltage / (p.bodyEmissionCoefficient * vt));
    const body = mos.evaluate([-sign * voltage, -sign * 5, 0]);
    near(body.currents[0], -sign * expected);
    const reversedChannel = mos.evaluate([-sign * 0.1, sign * (p.thresholdVoltage + 1), 0]).currents[0];
    assert.ok(sign * reversedChannel < 0);
    const normalChannel = mos.evaluate([sign * 2, sign * (p.thresholdVoltage + 1), 0]).currents[0];
    assert.ok(sign * normalChannel > 0);
  }
});

test("analytic Jacobians match independent central differences, KCL, and common-mode invariance", () => {
  for (const model of registry) {
    const part = device(model.definitionId);
    const sign = ["pnp", "pmos"].includes(model.parameters.polarity) ? -1 : 1;
    const cases = model.parameters.family === "shockley" ? [[0.5, 0], [-2, 0]] : model.parameters.family === "ebers-moll" ? [[3, 0.65, 0], [0.1, 0.7, 0], [0, 0.65, 3]] : [[3, 4, 0], [0.1, 4, 0], [-0.3, -5, 0], [3, 0, 0]];
    for (const raw of cases) {
      const voltages = raw.map(value => sign * value), result = part.evaluate(voltages), n = voltages.length;
      near(result.currents.reduce((a, b) => a + b, 0), 0, 1e-10);
      const shifted = part.evaluate(voltages.map(value => value + 7.3));
      result.currents.forEach((value, i) => near(shifted.currents[i], value, 1e-10));
      for (let j = 0; j < n; j++) {
        const plus = [...voltages], minus = [...voltages], h = 1e-6;
        plus[j] += h; minus[j] -= h;
        const high = part.evaluate(plus), low = part.evaluate(minus);
        for (let i = 0; i < n; i++) near(result.jacobian[i][j], (high.currents[i] - low.currents[i]) / (2 * h), 1e-8, 2e-6);
        near(result.jacobian.reduce((sum, row) => sum + row[j], 0), 0, 1e-10);
      }
      result.jacobian.forEach(row => near(row.reduce((a, b) => a + b, 0), 0, 1e-10));
    }
  }
});

test("exponential continuation remains finite and differentiable at extreme trial voltages", () => {
  for (const model of registry) {
    const part = device(model.definitionId);
    const voltages = model.parameters.family === "shockley" ? [200, -200] : [200, -200, 150];
    const result = part.evaluate(voltages);
    assert.ok(result.currents.every(Number.isFinite));
    assert.ok(result.jacobian.flat().every(Number.isFinite));
    assert.throws(() => part.evaluate(voltages.map(() => NaN)), /전압/);
    assert.throws(() => part.evaluate([1]), /전압/);
  }
  const diode = device(ids.diode), p = modelFor(ids.diode).parameters;
  const voltage = 45 * p.emissionCoefficient * vt, h = 1e-6;
  near(diode.evaluate([voltage, 0]).jacobian[0][0], (diode.evaluate([voltage + h, 0]).currents[0] - diode.evaluate([voltage - h, 0]).currents[0]) / (2 * h), 1, 1e-7);
});

test("final-state validation rejects continuation-only answers for diodes, both BJT polarities and MOS body diodes", () => {
  for (const model of registry) {
    const part = device(model.definitionId), p = model.parameters;
    const sign = ["pnp", "pmos"].includes(p.polarity) ? -1 : 1;
    const extreme = p.family === "shockley" ? [2.2, 0] : p.family === "ebers-moll" ? [sign * 3, sign * 1.2, 0] : [-sign * 2, -sign * 5, 0];
    assert.ok(part.evaluate(extreme).currents.every(Number.isFinite), "Newton trial evaluations must remain usable");
    assert.throws(() => part.validateFinal(extreme), /접선 연장/);
    const normal = p.family === "shockley" ? [0.65, 0] : p.family === "ebers-moll" ? [sign * 3, sign * 0.65, 0] : [sign * 3, sign * 4, 0];
    assert.doesNotThrow(() => part.validateFinal(normal));
    if (p.family === "ebers-moll") assert.throws(() => part.validateFinal([0, sign * 1.2, sign * 3]), /접선 연장/, "reverse base-collector junction must also be checked");
  }
});

test("unknown parts, generic LED, and altered pin maps never silently substitute a model", () => {
  const genericLed = definitions.find(item => item.kind === "led");
  assert.throws(() => buildNonlinearDevices(fixture(genericLed.id), definitions), /등록되지/);
  const unverified = definitions.find(item => item.kind === "transistor" && item.pinoutStatus === "unverified");
  assert.throws(() => buildNonlinearDevices(fixture(unverified.id), definitions), /등록되지/);
  const copy = structuredClone(definitions.find(item => item.id === ids.nmos));
  [copy.pins[0].label, copy.pins[2].label] = [copy.pins[2].label, copy.pins[0].label];
  assert.throws(() => buildNonlinearDevices(fixture(ids.nmos), [copy]), /핀맵/);
  assert.throws(() => buildNonlinearDevices(fixture(ids.npn, { 1: "E", 2: "B" }), definitions), /누락/);
  assert.equal(buildNonlinearDevices(fixture("resistor-axial", { 1: "A", 2: "B" }), definitions).devices.length, 0);
});

test("BC109C keeps its TO-18 case pin and independent numerical model without claiming direct placement", () => {
  const definition = definitions.find(item => item.id === "bjt-bc109c-philips-to18"), model = getNonlinearModel(definition);
  assert.equal(definition.mounting, "external");
  assert.equal(definition.pins[2].label, "C / CASE");
  assert.equal(model.physicalPlacement, "external-only");
  assert.equal(model.parameters.betaForward, 677);
  assert.match(buildNonlinearDevices(fixture(definition.id), definitions).warnings.join(" "), /TO-18/);
});
