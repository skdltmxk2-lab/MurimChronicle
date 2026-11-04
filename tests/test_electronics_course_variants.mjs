import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Sources and conditions: docs/electronics-course-coverage.md (L1P, L3P).
// These are reduced-model electrical regressions, not fits to submitted student
// measurements or verification of the physical 1600-hole board and real parts.
const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(`../src/lib/electronics/${name}.ts`, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    if (!dependency.startsWith("./")) throw new Error(`Unexpected dependency ${dependency}`);
    return load(dependency.slice(2));
  });
  cache.set(name, module.exports); return module.exports;
}
const { runSimulation, defaultSimulationConfig } = load("simulation");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
const { NONLINEAR_MODEL_REGISTRY: models, NONLINEAR_THERMAL_VOLTAGE: vt } = load("simulation-models");
const definitionById = new Map(definitions.map(definition => [definition.id, definition]));
const template = id => structuredClone(templates.find(item => item.id === id));
const near = (actual, expected, absolute = 1e-8, relative = 0) => assert.ok(Math.abs(actual - expected) <= absolute + Math.abs(expected) * relative, `${actual} != ${expected} (absolute ${absolute}, relative ${relative})`);
const parallel = (a, b) => a * b / (a + b);
const setValue = (circuit, id, value) => { const component = circuit.components.find(item => item.id === id); assert.ok(component, id); component.value = String(value); };
function dcConfig(circuit) {
  const config = defaultSimulationConfig(circuit);
  return { ...config, source: { ...config.source, waveform: "dc", amplitudePeak: 0 },
    extraSources: (config.extraSources ?? []).map(source => ({ ...source, waveform: "dc", amplitudePeak: 0 })),
    sampleCount: 32, acPoints: 2, acStartHz: 1000, acStopHz: 1000, durationSeconds: 0.001 };
}
function assertKcl(circuit, result) {
  const balance = new Map();
  const add = (net, current) => { assert.ok(Number.isFinite(current), `current at ${net}`); balance.set(net, (balance.get(net) ?? 0) + current); };
  for (const component of circuit.components) {
    const definition = definitionById.get(component.definitionId);
    if (definition.kind === "resistor") {
      add(component.pinNets[1], result.dc.componentCurrents[component.id]);
      add(component.pinNets[2], -result.dc.componentCurrents[component.id]);
    } else if (result.dc.deviceCurrents?.[component.id]) {
      let terminalSum = 0;
      for (const pin of definition.pins) {
        const current = result.dc.deviceCurrents[component.id][pin.label];
        terminalSum += current; add(component.pinNets[pin.id], current);
      }
      near(terminalSum, 0, 1e-10);
    }
  }
  for (const [net, current] of Object.entries(result.dc.sourceCurrents)) { add(net, current); add("GND", -current); }
  for (const [net, residual] of balance) near(residual, 0, 1e-8);
}
function acFixture(id, load, bypass = true) {
  const circuit = template(id); setValue(circuit, "RL", load);
  if (!bypass) circuit.components = circuit.components.filter(component => component.id !== "CE");
  const result = runSimulation(circuit, definitions, dcConfig(circuit)); assertKcl(circuit, result);
  return { circuit, result, gain: result.ac.nodeGainMagnitude.OUT[0] };
}
function harmonic(result, net, order) {
  // 256 samples include endpoints of exactly three periods: 85 intervals/period.
  // [85,255) contains two complete periods without duplicating the final endpoint.
  const values = result.nodeVoltages[net].slice(85, 255), mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  let real = 0, imaginary = 0;
  values.forEach((value, index) => { const phase = 2 * Math.PI * 1000 * order * result.time[index + 85]; real += (value - mean) * Math.cos(phase); imaginary += (value - mean) * Math.sin(phase); });
  return { amplitude: 2 * Math.hypot(real, imaginary) / values.length, real, imaginary };
}

test("course transistor metadata preserves reduced-model provenance and omitted effects", () => {
  for (const id of ["bjt-bc549c-onsemi-to92", "mosfet-2n7000ta-onsemi-to92"]) {
    const model = models.find(item => item.definitionId === id);
    assert.equal(model.educational, true); assert.match(model.parameterBasis, /Transistors\.lib/);
    assert.ok(model.limitations.some(text => /제조사 SPICE.*아닙니다/.test(text)));
  }
  assert.ok(models.find(item => item.definitionId === "bjt-bc549c-onsemi-to92").limitations.some(text => /Early/.test(text)));
  assert.ok(models.find(item => item.definitionId === "mosfet-2n7000ta-onsemi-to92").limitations.some(text => /직렬 저항.*서브스레시홀드/.test(text)));
});

test("Lab1 CE bypass removal preserves DC and changes gain according to emitter degeneration for all three loads", () => {
  const beta = models.find(item => item.definitionId === "bjt-bc549c-onsemi-to92").parameters.betaForward;
  for (const load of [100000, 10000, 1000]) {
    const bypass = acFixture("ce-amplifier", load), unbypassed = acFixture("ce-amplifier", load, false);
    for (const net of ["BASE", "EMITTER", "COLLECTOR"]) near(bypass.result.dc.nodeVoltages[net], unbypassed.result.dc.nodeVoltages[net], 1e-8);
    const gm = bypass.result.dc.deviceCurrents.Q1.C / vt;
    // Midband hybrid-pi equations, independent of the solver. At 1 kHz the
    // 100 uF bypass and coupling impedances are small but not assumed zero.
    const loadResistance = parallel(22000, load);
    near(bypass.gain, gm * loadResistance, 0, 0.02);
    near(unbypassed.gain, gm * loadResistance / (1 + gm * (1 + 1 / beta) * 10000), 0, 0.02);
    assert.ok(bypass.gain > 30 * unbypassed.gain);
    near(bypass.result.dc.nodeVoltages.OUT, 0, 1e-10, 0);
    assert.ok(Math.abs(bypass.result.ac.nodePhaseDegrees.OUT[0]) > 175, "CE output is inverted");
  }
});

test("Lab1 CE load attenuation follows RC parallel RL and capacitively isolated loads do not change bias", () => {
  const loads = [100000, 10000, 1000], results = loads.map(load => acFixture("ce-amplifier", load));
  for (let index = 1; index < results.length; index++) {
    assert.ok(results[index].gain < results[index - 1].gain);
    near(results[index].gain / results[0].gain, parallel(22000, loads[index]) / parallel(22000, loads[0]), 0, 0.002);
    near(results[index].result.dc.nodeVoltages.COLLECTOR, results[0].result.dc.nodeVoltages.COLLECTOR);
  }
});

test("Lab1 CE+CC retains gain into lower loads while AC load current grows and DC bias remains isolated", () => {
  const loads = [100000, 10000, 1000, 100], results = loads.map(load => acFixture("ce-cc-amplifier", load));
  let previousLoadCurrent = 0;
  for (let index = 0; index < results.length; index++) {
    const { result, gain } = results[index], loadCurrent = gain * 0.01 / loads[index];
    assert.ok(loadCurrent > previousLoadCurrent); previousLoadCurrent = loadCurrent;
    near(result.dc.nodeVoltages.BUFFER, results[0].result.dc.nodeVoltages.BUFFER);
    near(result.dc.nodeVoltages.OUT, 0, 1e-10);
    const followerGain = gain / result.ac.nodeGainMagnitude.COLLECTOR[0];
    assert.ok(followerGain > 0.7 && followerGain < 1, "CC voltage gain remains below unity");
    if (index) assert.ok(gain < results[index - 1].gain);
  }
  const bufferedRetention = results[2].gain / results[0].gain;
  const ceRetention = acFixture("ce-amplifier", 1000).gain / acFixture("ce-amplifier", 100000).gain;
  assert.ok(bufferedRetention > 0.9 && bufferedRetention > 10 * ceRetention);
  assert.ok(results[3].gain / results[0].gain > 0.5, "100 ohm load is materially different from open circuit but the buffer still helps");
});

for (const id of ["ce-amplifier", "ce-cc-amplifier"]) {
  test(`Lab1 ${id} 25/50/100 mV inputs reveal saturation and gain compression without artificial rail clipping`, () => {
    const results = [0.025, 0.05, 0.1].map(amplitude => {
      const circuit = template(id), config = dcConfig(circuit);
      config.source = { ...config.source, waveform: "sine", frequencyHz: 1000, amplitudePeak: amplitude, offset: 0 };
      config.durationSeconds = 0.003; config.sampleCount = 256;
      const result = runSimulation(circuit, definitions, config); assertKcl(circuit, result);
      const fundamental = harmonic(result, "OUT", 1);
      assert.ok(fundamental.imaginary < 0, "fundamental output inverts the sine input");
      assert.ok(fundamental.amplitude > 0);
      result.nodeVoltages.COLLECTOR.forEach((voltage, index) => {
        assert.ok(voltage <= 9.001 && voltage >= result.nodeVoltages.EMITTER[index] - 0.02, "physical collector bounds arise from transistor junctions");
      });
      return { result, gain: fundamental.amplitude / amplitude };
    });
    assert.ok(results[2].gain < 0.9 * results[1].gain, "100 mV input compresses the fundamental gain relative to 50 mV");
    assert.ok(results[2].result.nodeVoltages.COLLECTOR.some((value, index) => value < results[2].result.nodeVoltages.BASE[index]), "large input enters B-C forward bias / saturation");
    assert.ok(harmonic(results[2].result, "OUT", 2).amplitude > 0.03 * harmonic(results[2].result, "OUT", 1).amplitude, "nonlinearity generates an actual harmonic");
  });
}

function mirror(referenceResistance, outputVoltage) {
  const circuit = template("mos-current-mirror"); setValue(circuit, "RREF", referenceResistance);
  const config = dcConfig(circuit);
  config.source = { ...config.source, netId: "DRAIN", offset: outputVoltage };
  config.supplies = [{ netId: "VCC", voltage: 6 }]; config.extraSources = [];
  const result = runSimulation(circuit, definitions, config); assertKcl(circuit, result);
  return result;
}

test("Lab3 RREF 50..450 ohms decreases reference current and matched saturated MOS devices mirror it", () => {
  let previousReference = Infinity;
  const targets = [];
  for (let resistance = 50; resistance <= 450; resistance += 50) {
    const result = mirror(resistance, 3), current = result.dc.deviceCurrents.M1.D, output = result.dc.deviceCurrents.M2.D;
    assert.ok(current > 0 && current < previousReference); previousReference = current;
    near(current, (6 - result.dc.nodeVoltages.BIAS) / resistance, 1e-8);
    near(output, current, 1e-10, 0.002);
    near(result.dc.deviceCurrents.M1.G, 0, 1e-18); near(result.dc.deviceCurrents.M2.G, 0, 1e-18);
    if (current >= 0.018 && current <= 0.022) targets.push(resistance);
  }
  assert.ok(targets.includes(150), "150 ohms reaches 20±2 mA in this reduced model, not a guarantee for physical 2N7000s");
});

test("Lab3 VX 0..1 V in 0.1 V steps and higher voltages reveal compliance, plateau and finite output resistance", () => {
  const voltages = [...Array.from({ length: 11 }, (_, index) => index / 10), 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6];
  const points = voltages.map(voltage => ({ voltage, result: mirror(150, voltage) }));
  const currentAt = voltage => points.find(point => point.voltage === voltage).result.dc.deviceCurrents.M2.D;
  near(currentAt(0), 0, 1e-10);
  for (let index = 1; index < points.length; index++) assert.ok(points[index].result.dc.deviceCurrents.M2.D > points[index - 1].result.dc.deviceCurrents.M2.D);
  assert.ok(currentAt(0.1) < 0.5 * currentAt(1), "insufficient VDS cannot sustain the mirror current");
  assert.ok(currentAt(0.3) < 0.98 * currentAt(0.4), "transition into saturation is visible below 0.4 V for this bias");
  assert.ok((currentAt(6) - currentAt(1)) / currentAt(1) < 0.002, "saturated current varies little across 1..6 V");
  const lowVoltageSlope = (currentAt(0.2) - currentAt(0.1)) / 0.1;
  const saturationSlope = currentAt(3.5) - currentAt(2.5);
  assert.ok(lowVoltageSlope > 1000 * saturationSlope);
  assert.ok(1 / saturationSlope > 100000, "channel-length modulation leaves a large, finite output resistance near 3 V");
  for (const point of points) near(point.result.dc.nodeVoltages.BIAS, points[0].result.dc.nodeVoltages.BIAS, 1e-7);
});

function commonMode(voltage) {
  // L3 circuit 2: four MOS devices, 200-ohm drains and directly tied gates.
  // Remove circuit 3's input/output capacitors and bias dividers; changing the
  // source before CIN would leave the gates at their divider DC voltage.
  const circuit = template("mos-differential");
  circuit.components = circuit.components.filter(component => ["RREF", "MREF", "MTAIL", "M1", "M2", "RD1", "RD2"].includes(component.id));
  setValue(circuit, "RREF", 150);
  for (const component of circuit.components) if (["M1", "M2"].includes(component.id)) component.pinNets[2] = "CM";
  circuit.instruments = [];
  circuit.netNames = Object.fromEntries([...new Set(circuit.components.flatMap(component => Object.values(component.pinNets)))].map(net => [net, net]));
  const config = dcConfig(circuit);
  config.source = { netId: "CM", waveform: "dc", frequencyHz: 1000, amplitudePeak: 0, offset: voltage };
  config.supplies = [{ netId: "VCC", voltage: 6 }]; config.extraSources = [];
  const result = runSimulation(circuit, definitions, config); assertKcl(circuit, result);
  return result;
}

test("Lab3 common mode 0..6 V preserves symmetry and shows tail-current loss below the usable input range", () => {
  const voltages = [0, 1, 2, 2.5, 3, 4, 5, 6], points = new Map(voltages.map(voltage => [voltage, commonMode(voltage)]));
  for (const [voltage, result] of points) {
    const current1 = result.dc.deviceCurrents.M1.D, current2 = result.dc.deviceCurrents.M2.D, tail = result.dc.deviceCurrents.MTAIL.D;
    near(current1, current2, 1e-9); near(result.dc.nodeVoltages.D1, result.dc.nodeVoltages.D2, 1e-7);
    near(current1 + current2, tail, 1e-8);
    near(result.dc.nodeVoltages.D1, 6 - current1 * 200, 1e-7);
    near(result.dc.deviceCurrents.MREF.D, points.get(4).dc.deviceCurrents.MREF.D, 1e-8);
    if (voltage <= 2) { assert.ok(tail < 1e-7); near(result.dc.nodeVoltages.D1, 6, 1e-5); }
    if (voltage >= 4) near(tail, result.dc.deviceCurrents.MREF.D, 1e-8, 0.002);
  }
  assert.ok(points.get(3).dc.deviceCurrents.MTAIL.D < 0.97 * points.get(3).dc.deviceCurrents.MREF.D);
  near(points.get(5).dc.nodeVoltages.TAIL - points.get(4).dc.nodeVoltages.TAIL, 1, 0.002);
  near(points.get(6).dc.nodeVoltages.D1, points.get(4).dc.nodeVoltages.D1, 0.002);
});
