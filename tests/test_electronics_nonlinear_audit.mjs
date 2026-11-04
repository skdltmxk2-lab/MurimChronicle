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
const { runSimulation, defaultSimulationConfig } = load("simulation");
const { COMPONENT_CATALOG: definitions } = load("catalog");
const { CIRCUIT_TEMPLATES: templates } = load("templates");
const vt = 8.617333262145e-5 * 300;
const near = (actual, expected, absolute = 2e-6, relative = 1e-6) => assert.ok(Math.abs(actual - expected) <= absolute + relative * Math.abs(expected), `${actual} != ${expected}`);
const bisect = (fn, lo, hi) => {
  assert.ok(fn(lo) * fn(hi) <= 0);
  for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2; if (fn(lo) * fn(mid) <= 0) hi = mid; else lo = mid; }
  return (lo + hi) / 2;
};
const solve = id => {
  const input = templates.find(item => item.id === id), config = defaultSimulationConfig(input);
  config.source.waveform = "dc"; config.extraSources?.forEach(source => { source.waveform = "dc"; });
  config.sampleCount = 32; config.acPoints = 2;
  return runSimulation(input, definitions, config);
};
const collectorBias = (vth, rth, re, is = 7.049e-15, beta = 493.2) => bisect(ic => vt * Math.log1p(ic / is) + ic * (1 + 1 / beta) * re + ic / beta * rth - vth, 1e-15, 0.1);

test("CE and CE+CC DC points agree with independent Thevenin and exponential bias equations", () => {
  const beta = 493.2, is = 7.049e-15;
  const ic1 = collectorBias(9 * 10 / 43, 33000 * 10000 / 43000, 10000);
  const ce = solve("ce-amplifier");
  near(ce.dc.nodeVoltages.BASE, 9 * 10 / 43 - ic1 / beta * (33000 * 10000 / 43000));
  near(ce.dc.nodeVoltages.EMITTER, ic1 * (1 + 1 / beta) * 10000);
  near(ce.dc.nodeVoltages.COLLECTOR, 9 - ic1 * 22000);
  const ic2 = bisect(current => vt * Math.log1p(current / is) + current * (1 + 1 / beta) * 2000 - (9 - (ic1 + current / beta) * 22000), 1e-15, 0.01);
  const cascade = solve("ce-cc-amplifier");
  near(cascade.dc.nodeVoltages.COLLECTOR, 9 - (ic1 + ic2 / beta) * 22000);
  near(cascade.dc.nodeVoltages.BUFFER, ic2 * (1 + 1 / beta) * 2000);
});

test("mirror and symmetric differential pair agree with independent square-law roots, including tail linear region", () => {
  const threshold = 2.474, beta = 0.296, lambda = 0.000267;
  const current = (gate, drain) => {
    const overdrive = gate - threshold;
    if (overdrive <= 0) return 0;
    return beta * (drain < overdrive ? overdrive * drain - drain * drain / 2 : overdrive * overdrive / 2) * (1 + lambda * drain);
  };
  const bias = bisect(gate => (6 - gate) / 220 - current(gate, gate), threshold, 6);
  const mirror = solve("mos-current-mirror");
  near(mirror.dc.nodeVoltages.BIAS, bias);
  near(mirror.dc.deviceCurrents.M2.D, current(bias, 3), 5e-9);
  const diff = solve("mos-differential");
  const tail = bisect(source => {
    const itail = current(bias, source), drain = 6 - 200 * itail / 2;
    return 2 * current(3 - source, drain - source) - itail;
  }, 0, 3 - threshold);
  near(diff.dc.nodeVoltages.TAIL, tail);
  near(diff.dc.nodeVoltages.D1, 6 - 200 * current(bias, tail) / 2);
  near(diff.dc.nodeVoltages.D2, diff.dc.nodeVoltages.D1, 1e-10);
});

test("mixer zero-LO DC current split accounts for all three transistors' base currents", () => {
  const beta = 493.2, alpha = beta / (beta + 1), is = 7.049e-15;
  const i3 = collectorBias(9 * 12 / 94, 82000 * 12000 / 94000, 1000), each = alpha * i3 / 2;
  const b1 = 9 * 30 / 92 - each / beta * (62000 * 30000 / 92000);
  const output = 9 - each * 10000, result = solve("bjt-mixer");
  near(result.dc.nodeVoltages.OUT1, output);
  near(result.dc.nodeVoltages.OUT2, output);
  near(result.dc.nodeVoltages.B1, b1);
  near(result.dc.nodeVoltages.TAIL, b1 - vt * Math.log1p(each / is));
  near(result.dc.deviceCurrents.Q3.C, i3, 1e-10);
});

test("push-pull quiescent current and DC midpoint agree with an independent scalar bias solution", () => {
  const betaN = 493.2, betaP = 306.5, diodeIs = 2e-9, diodeN = 1.9, resistance = 4.7;
  const quantities = ie => {
    const vn = vt * Math.log1p(ie * betaN / (betaN + 1) / 7.049e-15);
    const vp = vt * Math.log1p(ie * betaP / (betaP + 1) / 1.02e-15);
    const vd = ie * resistance + (vn + vp) / 2;
    const diode = diodeIs * Math.expm1(vd / (diodeN * vt));
    return { vn, vp, vd, diode };
  };
  const ie = bisect(current => { const { vd, diode } = quantities(current); return 2 * diode + current / (betaN + 1) + current / (betaP + 1) - (9 - 2 * vd) / 2200; }, 1e-12, 0.01);
  const { vp, diode } = quantities(ie), output = 2200 * (diode + ie / (betaP + 1)) + vp + ie * resistance;
  const result = solve("push-pull-stage");
  near(result.dc.nodeVoltages.POWER_OUT, output);
  near(result.dc.componentCurrents.REN, ie, 2e-10);
  near(result.dc.componentCurrents.REP, ie, 2e-10);
  near(result.dc.nodeVoltages.OUT, 0, 1e-12);
});

test("all six active course DC solutions satisfy full per-net current conservation including voltage sources", () => {
  for (const id of ["ce-amplifier", "ce-cc-amplifier", "mos-current-mirror", "mos-differential", "bjt-mixer", "push-pull-stage"]) {
    const input = templates.find(item => item.id === id), result = solve(id), sums = new Map();
    const add = (net, current) => sums.set(net, (sums.get(net) ?? 0) + current);
    for (const component of input.components) {
      const definition = definitions.find(item => item.id === component.definitionId);
      if (definition.kind === "resistor") {
        const current = result.dc.componentCurrents[component.id];
        add(component.pinNets[1], current); add(component.pinNets[2], -current);
      } else if (result.dc.deviceCurrents?.[component.id]) {
        for (const pin of definition.pins) add(component.pinNets[pin.id], result.dc.deviceCurrents[component.id][pin.label]);
      }
    }
    for (const [net, current] of Object.entries(result.dc.sourceCurrents)) { add(net, current); add("GND", -current); }
    for (const [net, imbalance] of sums) assert.ok(Math.abs(imbalance) < 1e-8, `${id}:${net} current residual ${imbalance}`);
  }
});

test("P-channel MOS loaded drain has the analytic DC point, gate derivative, and cutoff result", () => {
  const input = { id: "pmos-audit", title: "P MOS", description: "", netNames: { GND: "GND", VCC: "+5 V", IN: "IN", OUT: "OUT" }, instruments: [], notes: [], reviewItems: [], components: [
    { id: "M1", definitionId: "mosfet-irf9540n-infineon-to220", value: "IRF9540N", pinNets: { 1: "IN", 2: "OUT", 3: "VCC" } },
    { id: "RD", definitionId: "resistor-axial", value: "100 Ω", pinNets: { 1: "OUT", 2: "GND" } },
  ] };
  const config = { ...defaultSimulationConfig(input), sampleCount: 32, acPoints: 2 };
  config.source = { ...config.source, waveform: "dc", offset: 1.8, amplitudePeak: 0 };
  const result = runSimulation(input, definitions, config);
  const coefficient = 100 * 1.2 * 0.2 ** 2 / 2;
  const expected = coefficient * 1.025 / (1 + coefficient * 0.005);
  near(result.dc.nodeVoltages.OUT, expected);
  const coefficientDerivative = -100 * 1.2 * 0.2;
  const derivative = coefficientDerivative * 1.025 / (1 + coefficient * 0.005) ** 2;
  near(result.ac.nodeGainMagnitude.OUT[0], -derivative);
  near(Math.abs(result.ac.nodePhaseDegrees.OUT[0]), 180);
  near(result.dc.deviceCurrents.M1.D, -expected / 100, 1e-9);
  const off = runSimulation(input, definitions, { ...config, source: { ...config.source, offset: 5 } });
  near(off.dc.nodeVoltages.OUT, 0, 1e-8);
});
