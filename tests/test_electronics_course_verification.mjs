import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const module = { exports: {} }, file = `src/lib/electronics/${name}.ts`;
  const code = ts.transpileModule(readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", code)(module, module.exports, dependency => {
    assert.ok(dependency.startsWith("./"));
    return load(dependency.slice(2));
  });
  cache.set(name, module.exports);
  return module.exports;
}
const verification = load("course-verification");
const { getVerificationInput, measureVerificationResult, verificationTraces, verificationWaveform } = verification;
const { COURSE_ANALOG_CASES } = load("course-analog-fixtures");
const { measureCourseAnalogCase } = load("course-analog-verification");
const { COMPONENT_CATALOG } = load("catalog");
const { runSimulation } = load("simulation");
const { niceTicks, sequenceChartModel } = load("sample-sequence");
const runnableCases = COURSE_ANALOG_CASES.filter(item => item.id.startsWith("l0-dc-")).slice(0, 2);
const blockedCase = COURSE_ANALOG_CASES.find(item => item.blockedReason);
const results = new Map();
function resultFor(id) {
  if (!results.has(id)) {
    const input = getVerificationInput(id);
    results.set(id, runSimulation(input.circuit, COMPONENT_CATALOG, input.config));
  }
  return results.get(id);
}
function reportFixture() {
  const rows = runnableCases.map(item => {
    const measured = measureCourseAnalogCase(item, resultFor(item.id));
    return { ...measured, sources: item.source, waveform: { time: [0, 1], series: [{ label: "saved baseline", values: [0, 0] }], unit: "V" } };
  });
  const blocked = { ...measureCourseAnalogCase(blockedCase), sources: blockedCase.source };
  const dsp = { id: "dsp-offline-fixture", experimentId: "lab-6", title: "DSP offline", kind: "dsp", status: "reference-missing", sources: [], conditions: [], metrics: [], notes: ["offline numeric trace"], waveform: { time: [0, .1], series: [{ label: "normalized signal", values: [0, .5] }], unit: "normalized" } };
  return { schemaVersion: 1, generatedAt: "2026-11-05T00:00:00.000Z", scope: "Reviewed fixture", cases: [rows[0], blocked, rows[1], dsp] };
}

test("registry resolves reviewed analog and Lab5 inputs and identifies blocked and unknown cases", () => {
  assert.equal(getVerificationInput("arbitrary-user-circuit"), null);
  assert.match(getVerificationInput(blockedCase.id).blockedReason, /./);
  assert.equal(getVerificationInput(runnableCases[0].id).circuit.id, runnableCases[0].id);
  const lab5 = getVerificationInput("lab-5-c1-dc-1to1");
  assert.ok(lab5.circuit.components.some(item => item.definitionId === "bjt-bc109c-philips-to18"));
  assert.deepEqual(lab5.probes, ["OUT1", "OUT2", "OUT1-OUT2"]);
  assert.equal(getVerificationInput("lab-5-c1-dc-99to1"), null);
});

test("live measurement recomputes analog metrics and clears obsolete baseline failure and waveform", () => {
  const baseline = { ...reportFixture().cases[0], status: "blocked", reason: "old engine failure" };
  const measured = measureVerificationResult(baseline, resultFor(baseline.id));
  assert.equal(measured.status, "pass");
  assert.equal(measured.reason, undefined);
  assert.equal(measured.waveform, undefined);
  assert.deepEqual(measured.sources, baseline.sources);
  assert.ok(measured.metrics.some(metric => metric.basis === "independent-equation" && metric.status === "pass"));
  assert.ok(measured.metrics.some(metric => metric.basis === "engine-result"));
  assert.equal(baseline.reason, "old engine failure");
});

test("Lab5 comparison applies reference tolerances and preserves independently labelled offline metrics", () => {
  const id = "lab-5-c1-dc-1to1", result = resultFor(id), value = result.dc.nodeVoltages.OUT1;
  const offline = { label: "Independent solver", key: "offline_spice_out1", value: 6.529, reference: 6.529, tolerance: .001, basis: "independent-spice", status: "pass" };
  const reference = { id, experimentId: "lab-5", title: "Lab5 DC", kind: "analog", status: "blocked", reason: "old failure", conditions: [], sources: [], notes: [], metrics: [
    { label: "OUT1 DC", key: "dc_OUT1", value: null, reference: value + .05, tolerance: { relative: .01, absolute: 0 }, basis: "pdf-simulation" }, offline,
  ] };
  const measured = measureVerificationResult(reference, result);
  assert.equal(measured.status, "pass");
  assert.equal(measured.reason, undefined);
  assert.equal(measured.metrics[0].value, value);
  assert.ok(measured.metrics[0].relativeErrorPercent > 0);
  assert.deepEqual(measured.metrics[1], offline);
  const mismatch = measureVerificationResult({ ...reference, metrics: [{ ...reference.metrics[0], reference: 0, tolerance: 0 }] }, result);
  assert.equal(mismatch.status, "mismatch");
  assert.equal(mismatch.metrics[0].relativeErrorPercent, undefined);
  const noReference = measureVerificationResult({ ...reference, metrics: [{ ...reference.metrics[0], reference: undefined }] }, result);
  assert.equal(noReference.status, "reference-missing");
  assert.equal(noReference.metrics[0].status, "reported");
  assert.throws(() => measureVerificationResult({ ...reference, id: "unknown" }, result), /지원/);
});

test("waveform selection resolves direct and differential probes without mutating simulation samples", () => {
  const input = { probes: ["A", "A-B", "MISSING", "B"] };
  const result = { nodeVoltages: { A: [3, 5], B: [1, 2] } }, original = JSON.stringify(result);
  const traces = verificationTraces(input, result);
  assert.deepEqual(traces.map(trace => trace.label), ["A", "A-B"]);
  assert.deepEqual(traces[1].values, [2, 3]);
  assert.equal(JSON.stringify(result), original);
});

test("course worker executes only registered runnable inputs and correlates result/error messages", () => {
  const messages = [], self = { onmessage: null, postMessage: message => messages.push(message) };
  const file = "src/lib/electronics/course-verification.worker.ts", module = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("module", "exports", "require", "self", code)(module, module.exports, dependency => load(dependency.slice(2)), self);
  for (const data of [null, {}, { type: "cancel", requestId: 1, caseId: runnableCases[0].id }, { type: "run", requestId: .5, caseId: runnableCases[0].id }, { type: "run", requestId: 1, caseId: 5 }]) self.onmessage({ data });
  assert.equal(messages.length, 0);
  self.onmessage({ data: { type: "run", requestId: 4, caseId: "unknown" } });
  assert.equal(messages.at(-1).type, "error");
  assert.equal(messages.at(-1).caseId, "unknown");
  self.onmessage({ data: { type: "run", requestId: 5, caseId: blockedCase.id } });
  assert.equal(messages.at(-1).message, blockedCase.blockedReason);
  const id = runnableCases[0].id;
  self.onmessage({ data: { type: "run", requestId: 6, caseId: id, circuit: "untrusted override", config: null } });
  assert.equal(messages.at(-1).type, "result");
  assert.equal(messages.at(-1).requestId, 6);
  assert.equal(messages.at(-1).caseId, id);
  assert.deepEqual(messages.at(-1).result.dc.nodeVoltages, resultFor(id).dc.nodeVoltages);
});

const textIn = node => Array.isArray(node) ? node.map(textIn).join("") : node?.props ? textIn(node.props.children) : typeof node === "string" || typeof node === "number" ? String(node) : "";
function* walk(node) { if (Array.isArray(node)) { for (const child of node) yield* walk(child); return; } if (!node?.props) return; yield node; yield* walk(node.props.children); }

// Run the real component and comparison functions. Only React scheduling,
// browser workers, timeout clocks, downloads and the scope renderer are mocked.
function uiHarness({ initialUser = { id: "admin-1", admin: true }, checked = true, report = reportFixture(), workerFails = false } = {}) {
  const slots = [], effects = [], workers = [], timers = new Map(), downloads = [];
  let user = initialUser, authChecked = checked, cursor = 0, dirty = true, tree, timerId = 0;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
  const react = {
    useState(initial) { const index = cursor++; slots[index] ??= { value: typeof initial === "function" ? initial() : initial }; const slot = slots[index]; slot.set ??= value => { const next = typeof value === "function" ? value(slot.value) : value; if (!Object.is(next, slot.value)) { slot.value = next; dirty = true; } }; return [slot.value, slot.set]; },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useMemo(factory, deps) { const index = cursor++, previous = slots[index]; if (!previous || !same(previous.deps, deps)) slots[index] = { value: factory(), deps }; return slots[index].value; },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useEffect(effect, deps) { const index = cursor++, previous = slots[index]; if (!previous || !same(previous.deps, deps)) { const slot = { deps, cleanup: previous?.cleanup }; slots[index] = slot; effects.push(() => { slot.cleanup?.(); slot.cleanup = effect(); }); } },
  };
  class WorkerMock {
    constructor() { if (workerFails) throw new Error("worker construction failed"); workers.push(this); this.terminated = false; }
    postMessage(message) { this.request = message; }
    terminate() { this.terminated = true; }
    emit(message) { this.onmessage?.({ data: message }); }
    result() { this.emit({ ...this.request, type: "result", result: resultFor(this.request.caseId) }); }
  }
  const module = { exports: {} }, jsx = (type, props, key) => ({ type, props: props ?? {}, key });
  const file = "src/components/electronics/CourseVerificationPanel.tsx";
  const code = ts.transpileModule(readFileSync(file, "utf8"), { fileName: file, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText.replaceAll("import.meta.url", JSON.stringify(import.meta.url));
  new Function("module", "exports", "require", "Worker", "URL", "setTimeout", "clearTimeout", code)(module, module.exports, name => {
    if (name === "react") return react;
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx, Fragment: "fragment" };
    if (name === "next/link") return { default: "a" };
    if (name === "@/lib/auth/AuthContext") return { useAuth: () => ({ user, authChecked }) };
    if (name === "@/lib/auth/mockAuth") return { isAdminUser: value => Boolean(value?.admin) };
    if (name === "@/lib/electronics/storage") return { downloadText: (...args) => downloads.push(args) };
    if (name.startsWith("@/lib/electronics/")) return load(name.split("/").at(-1));
    if (name === "./Oscilloscope") return { Oscilloscope: "scope" };
    if (name === "./SampleSequenceChart") return { SampleSequenceChart: "sample-chart" };
    if (name.endsWith(".css")) return {};
    throw new Error(`Unexpected module ${name}`);
  }, WorkerMock, URL, (fn, delay) => { timers.set(++timerId, { fn, delay }); return timerId; }, id => timers.delete(id));
  const flush = () => { for (let count = 0; dirty || effects.length; count++) { assert.ok(count < 20); if (dirty) { dirty = false; cursor = 0; tree = module.exports.CourseVerificationPanel({ report }); } for (const effect of effects.splice(0)) effect(); } return tree; };
  const find = predicate => { const node = [...walk(tree)].find(predicate); assert.ok(node, "Expected UI node"); return node; };
  flush();
  return { workers, timers, downloads, report, get tree() { return tree; }, flush, find,
    click(label) { const node = find(node => node.type === "button" && textIn(node).includes(label)); assert.ok(!node.props.disabled, `Button disabled: ${label}`); node.props.onClick(); flush(); },
    choose(id) { this.click(report.cases.find(row => row.id === id).title); },
    search(value) { find(node => node.type === "input" && node.props.type === "search").props.onChange({ target: { value } }); flush(); },
    changeUser(next, checked = true) { user = next; authChecked = checked; dirty = true; flush(); },
    exportRows() { this.click("검증 결과 JSON"); return JSON.parse(downloads.at(-1)[1]).cases; },
    unmount() { slots.forEach(slot => slot.cleanup?.()); },
  };
}

test("UI gates authorization and cancels on user switch, role revocation and authentication recheck", () => {
  for (const options of [{ initialUser: null }, { checked: false }]) {
    const denied = uiHarness(options);
    assert.equal([...walk(denied.tree)].some(node => node.type === "button"), false);
    assert.equal(denied.workers.length, 0);
  }
  for (const [user, checked] of [[{ id: "admin-1", admin: false }, true], [{ id: "admin-2", admin: true }, true], [{ id: "admin-1", admin: true }, false]]) {
    const h = uiHarness(); h.click("이 조건 다시 계산"); const first = h.workers[0];
    h.changeUser(user, checked);
    assert.equal(first.terminated, true);
    assert.equal(h.timers.size, 0);
    first.emit({ ...first.request, type: "error", message: "late revoked result" }); h.flush();
    assert.doesNotMatch(textIn(h.tree), /late revoked result/);
    assert.equal(h.workers.length, 1);
  }
});

test("batch executes runnable visible cases sequentially and ignores completed worker duplicate messages/errors", () => {
  const h = uiHarness(); h.click("검색된 조건 재검증");
  assert.equal(h.workers.length, 1);
  const first = h.workers[0];
  assert.equal(first.request.caseId, runnableCases[0].id);
  first.result(); h.flush();
  assert.equal(first.terminated, true);
  assert.equal(h.workers.length, 2);
  const second = h.workers[1];
  assert.equal(second.request.caseId, runnableCases[1].id);
  first.emit({ ...first.request, type: "error", message: "duplicate old response" }); first.onerror?.(); h.flush();
  assert.equal(second.terminated, false);
  assert.equal(h.workers.length, 2);
  assert.doesNotMatch(textIn(h.tree), /duplicate old response/);
  second.result(); h.flush();
  assert.equal(second.terminated, true);
  assert.equal(h.timers.size, 0);
  assert.match(textIn(h.tree), /2개 조건 재검증 완료/);
  const rows = h.exportRows();
  assert.equal(rows[0].status, "pass"); assert.equal(rows[2].status, "pass");
  assert.equal(rows[1].reason, blockedCase.blockedReason);
  assert.equal(rows[3].id, "dsp-offline-fixture");
});

test("wrong request and case IDs are ignored while live scope and JSON export match the accepted capture", () => {
  const h = uiHarness(); h.click("이 조건 다시 계산"); const worker = h.workers[0];
  for (const change of [{ requestId: worker.request.requestId + 1 }, { caseId: runnableCases[1].id }]) {
    worker.emit({ ...worker.request, ...change, type: "error", message: "unrelated message" }); h.flush();
  }
  assert.equal(worker.terminated, false); assert.equal(h.timers.size, 1);
  worker.result(); h.flush();
  const scope = h.find(node => node.type === "scope");
  assert.equal(scope.props.time, resultFor(worker.request.caseId).time);
  assert.deepEqual(scope.props.traces[0].values, resultFor(worker.request.caseId).nodeVoltages.IN);
  assert.match(textIn(h.tree), /이번 브라우저에서 다시 계산/);
  const rows = h.exportRows(); assert.equal(rows[0].metrics[0].value, resultFor(worker.request.caseId).dc.nodeVoltages.IN);
  h.click("회로 JSON"); const input = JSON.parse(h.downloads.at(-1)[1]);
  assert.equal(input.id, worker.request.caseId);
  assert.equal(load("schema").parseCircuit(input, COMPONENT_CATALOG).id, worker.request.caseId);
  h.click("계산 설정 JSON"); const config = JSON.parse(h.downloads.at(-1)[1]);
  assert.deepEqual(config, getVerificationInput(worker.request.caseId).config);
});

test("selection changes, cancellation and unmount reject late results and clear timeout handles", () => {
  const h = uiHarness(); h.click("이 조건 다시 계산"); const first = h.workers[0];
  h.choose(runnableCases[1].id); assert.equal(first.terminated, true); assert.equal(h.timers.size, 0);
  first.emit({ ...first.request, type: "error", message: "old selected error" }); h.flush(); assert.doesNotMatch(textIn(h.tree), /old selected error/);
  h.click("이 조건 다시 계산"); const second = h.workers[1]; h.click("계산 중단");
  assert.equal(second.terminated, true); assert.equal(h.timers.size, 0);
  second.result(); h.flush(); assert.doesNotMatch(textIn(h.tree), /이번 브라우저에서 다시 계산/);
  h.click("이 조건 다시 계산"); const third = h.workers[2]; h.unmount();
  assert.equal(third.terminated, true); assert.equal(h.timers.size, 0);
  third.emit({ ...third.request, type: "error", message: "unmounted error" }); h.flush(); assert.doesNotMatch(textIn(h.tree), /unmounted error/);
});

test("timeout blocks only the timed-out case, continues the batch and ignores its late result", () => {
  const h = uiHarness(); h.click("검색된 조건 재검증"); const first = h.workers[0];
  const timeout = [...h.timers.values()][0]; assert.equal(timeout.delay, 30000);
  timeout.fn(); h.flush(); assert.equal(first.terminated, true);
  const second = h.workers[1]; assert.ok(second); assert.equal(second.terminated, false);
  first.result(); timeout.fn(); h.flush(); assert.equal(second.terminated, false); assert.equal(h.workers.length, 2);
  second.result(); h.flush();
  const rows = h.exportRows(); assert.equal(rows[0].status, "blocked"); assert.match(rows[0].reason, /30초/); assert.equal(rows[2].status, "pass");
});

test("cancelling a partially completed batch preserves completed measurements and leaves pending baselines intact", () => {
  const h = uiHarness(); h.click("검색된 조건 재검증"); h.workers[0].result(); h.flush();
  const pending = h.workers[1]; h.click("계산 중단");
  assert.equal(pending.terminated, true); pending.result(); h.flush();
  const rows = h.exportRows();
  assert.equal(rows[0].waveform.series[0].label, "IN");
  assert.deepEqual(rows[2].waveform, h.report.cases[2].waveform);
  assert.match(textIn(h.tree), /완료된 항목의 결과는 보관/);
});

test("search limits batch execution and blocked/offline rows keep accurate controls", () => {
  const h = uiHarness(); h.search(runnableCases[1].title); h.click("검색된 조건 재검증");
  assert.equal(h.workers.length, 1); assert.equal(h.workers[0].request.caseId, runnableCases[1].id);
  h.workers[0].result(); h.flush(); assert.equal(h.workers.length, 1); assert.match(textIn(h.tree), /1개 조건 재검증 완료/);
  h.search(""); h.choose(blockedCase.id);
  assert.equal(h.find(node => node.type === "button" && textIn(node) === "이 조건 다시 계산").props.disabled, true);
  h.choose("dsp-offline-fixture");
  assert.equal([...walk(h.tree)].some(node => node.type === "button" && textIn(node) === "이 조건 다시 계산"), false);
  assert.match(textIn(h.tree), /정규화된 신호/);
});

test("worker creation failure becomes a recoverable blocked record without leaving a timer or busy action", () => {
  const h = uiHarness({ workerFails: true }); h.click("이 조건 다시 계산");
  assert.equal(h.workers.length, 0); assert.equal(h.timers.size, 0);
  const rows = h.exportRows(); assert.equal(rows[0].status, "blocked"); assert.match(rows[0].reason, /worker construction failed/);
  assert.equal(h.find(node => node.type === "button" && textIn(node) === "이 조건 다시 계산").props.disabled, false);
});


test("completed batch waveforms survive case navigation and retain their measured values in JSON", () => {
  const h = uiHarness(); h.click("검색된 조건 재검증");
  h.workers[0].result(); h.flush(); h.workers[1].result(); h.flush();
  for (const testCase of [runnableCases[1], runnableCases[0]]) {
    h.choose(testCase.id);
    const scope = h.find(node => node.type === "scope"), result = resultFor(testCase.id);
    assert.deepEqual(scope.props.time, result.time.slice(-1024));
    assert.deepEqual(scope.props.traces[0].values, result.nodeVoltages.IN.slice(-1024));
    const row = h.exportRows().find(row => row.id === testCase.id);
    assert.deepEqual(row.waveform.time, result.time.slice(-1024));
    assert.deepEqual(row.waveform.series[0].values, result.nodeVoltages.IN.slice(-1024));
  }
});

test("saved waveform uses a bounded contiguous tail without dropping alternate samples or changing the original capture", () => {
  const time = Array.from({ length: 4096 }, (_, i) => i / 10000);
  const result = { time, nodeVoltages: { OUT: time.map((_, i) => i % 2 ? 1 : -1), IN: time.map(value => value * 2) } };
  const original = JSON.stringify(result), waveform = verificationWaveform({ probes: ["OUT", "IN", "OUT-IN"] }, result);
  assert.equal(waveform.time.length, 1024);
  assert.equal(waveform.time[0], time[3072]);
  assert.equal(waveform.time.at(-1), time.at(-1));
  assert.equal(waveform.unit, "V");
  assert.deepEqual(waveform.series[0].values, result.nodeVoltages.OUT.slice(-1024));
  assert.deepEqual(waveform.series[2].values, time.slice(-1024).map((value, index) => result.nodeVoltages.OUT[index + 3072] - value * 2));
  assert.equal(JSON.stringify(result), original);
});

test("current worker runtime failure advances the batch and a retry can replace its blocked record", () => {
  const h = uiHarness(); h.click("검색된 조건 재검증"); const first = h.workers[0];
  first.onerror(); h.flush(); assert.equal(first.terminated, true); assert.equal(h.workers.length, 2);
  h.workers[1].result(); h.flush();
  assert.equal(h.exportRows()[0].status, "blocked");
  h.click("이 조건 다시 계산"); h.workers[2].result(); h.flush();
  const recovered = h.exportRows()[0]; assert.equal(recovered.status, "pass"); assert.equal(recovered.reason, undefined);
});

test("published verification report has unique known runnable analog cases and well-formed finite plot samples", () => {
  const report = JSON.parse(readFileSync("src/lib/electronics/course-verification-report.json", "utf8"));
  assert.equal(report.schemaVersion, 1); assert.ok(Number.isFinite(Date.parse(report.generatedAt)));
  assert.equal(new Set(report.cases.map(row => row.id)).size, report.cases.length);
  const experiments = new Set(report.cases.map(row => row.experimentId));
  for (const id of [...Array.from({ length: 11 }, (_, index) => `lab-${index}`), "project-2022", "project-2023", "project-2025"]) assert.ok(experiments.has(id), id);
  for (const row of report.cases) {
    assert.ok(["pass", "mismatch", "blocked", "reference-missing"].includes(row.status), row.id);
    if (row.kind === "analog" && !getVerificationInput(row.id)) { assert.equal(row.status, "blocked", row.id); assert.ok(row.reason || row.notes.length, row.id); }
    for (const metric of row.metrics) if (typeof metric.value === "number") assert.ok(Number.isFinite(metric.value), `${row.id} ${metric.label}`);
    if (!row.waveform) continue;
    assert.ok(["V", "normalized"].includes(row.waveform.unit), row.id);
    assert.ok(row.waveform.time.length > 1, row.id);
    assert.ok(row.waveform.time.every((time, index, array) => Number.isFinite(time) && (index === 0 || time > array[index - 1])), row.id);
    for (const series of row.waveform.series) {
      assert.equal(series.values.length, row.waveform.time.length, row.id);
      assert.ok(series.values.every(Number.isFinite), row.id);
    }
  }
});

test("a discrete sample axis is drawn on the sample chart and never reaches the time-based scope", () => {
  const base = reportFixture();
  const sampleRow = { id: "dsp-sample-fixture", experimentId: "lab-8", title: "Sample sequence fixture", kind: "dsp", status: "pass", sources: [], conditions: [], notes: [],
    metrics: [{ label: "tiny residual", key: "residual", value: 4.44089e-16, reference: 0, unit: "normalized", tolerance: 1e-13, basis: "independent-equation", status: "pass" }],
    waveform: { time: [0, 1, 2, 3], series: [{ label: "filtered", values: [0, .5, 1, .5] }, { label: "direct_sum", values: [0, .5, 1, .5] }], unit: "normalized", timeUnit: "sample" } };
  const unknownRow = { ...sampleRow, id: "dsp-unknown-axis", title: "Unknown axis fixture", waveform: { ...sampleRow.waveform, timeUnit: "ms" } };
  const h = uiHarness({ report: { ...base, cases: [...base.cases, sampleRow, unknownRow] } });
  h.choose(sampleRow.id);
  const chart = h.find(node => node.type === "sample-chart");
  assert.deepEqual(chart.props.index, [0, 1, 2, 3]);
  assert.deepEqual(chart.props.series.map(item => item.label), ["filtered", "direct_sum"]);
  assert.equal(chart.props.unit, "normalized");
  assert.equal([...walk(h.tree)].some(node => node.type === "scope"), false);
  assert.match(textIn(h.tree), /시간\(초\)이 아니라 표본 번호/);
  assert.match(textIn(h.tree), /4\.44089e-16/, "a tiny residual is shown as an exponent");
  assert.doesNotMatch(textIn(h.tree), /0\.0000000/, "never as a run of zeros");
  // A saved seconds waveform keeps using the scope.
  h.choose(base.cases[3].id);
  assert.equal(h.find(node => node.type === "scope").props.amplitudeUnit, "normalized");
  assert.equal([...walk(h.tree)].some(node => node.type === "sample-chart"), false);
  // An axis unit the viewer does not know is drawn on no axis at all.
  h.choose(unknownRow.id);
  assert.equal([...walk(h.tree)].some(node => node.type === "scope" || node.type === "sample-chart"), false);
  assert.match(textIn(h.tree), /시간축 단위를 알 수 없어/);
});

test("sequence geometry accepts only consecutive integer sample axes with matching finite series", () => {
  assert.deepEqual(niceTicks(0, 55, 11), [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  assert.deepEqual(niceTicks(-0.3, 0.3, 6), [-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3], "fractional steps keep an exact zero");
  assert.ok(niceTicks(-0.3, 0.3, 6).every(tick => Object.is(tick, 0) || Math.abs(tick) > 1e-9));
  assert.deepEqual(niceTicks(3, 3), [3]);
  assert.deepEqual(niceTicks(NaN, 1), []);
  assert.deepEqual(niceTicks(2, 1), []);
  const index = Array.from({ length: 56 }, (_, i) => i), values = index.map(i => Math.sin(i / 5));
  const model = sequenceChartModel(index, [{ label: "a", values }, { label: "b", values }]);
  assert.equal(model.count, 56); assert.equal(model.xMin, 0); assert.equal(model.xMax, 55);
  assert.ok(model.xTicks.length > 1 && model.xTicks.every(Number.isInteger));
  assert.ok(model.yMin < Math.min(...values) && model.yMax > Math.max(...values));
  assert.ok(model.yTicks.some(tick => Object.is(tick, 0)), "the zero baseline is a tick");
  assert.equal(sequenceChartModel([5, 6, 7], [{ label: "a", values: [1, 2, 3] }]).xMin, 5, "the axis may start anywhere if it counts by one");
  // Seconds, gaps, repeats, wrong step, fractions, too few points, ragged or non-finite series are rejected, not relabelled.
  for (const bad of [[0, .1, .2], [0, 1, 3], [0, 1, 1], [0, 2, 4], [1.5, 2.5], [0], []]) assert.equal(sequenceChartModel(bad, [{ label: "a", values: bad.map(() => 0) }]), null, JSON.stringify(bad));
  assert.equal(sequenceChartModel([0, 1], [{ label: "a", values: [0] }]), null);
  assert.equal(sequenceChartModel([0, 1], [{ label: "a", values: [0, NaN] }]), null);
  assert.equal(sequenceChartModel([0, 1], []), null);
  const flat = sequenceChartModel([0, 1], [{ label: "z", values: [0, 0] }]);
  assert.ok(flat.yMin < 0 && flat.yMax > 0, "an all-zero sequence still has a finite range around zero");
});

test("published waveforms name their time axis: a counting index is a sample axis, never seconds", () => {
  const published = JSON.parse(readFileSync("src/lib/electronics/course-verification-report.json", "utf8"));
  const counting = time => time.length > 2 && time.every((value, i) => Number.isInteger(value) && (i === 0 || value === time[i - 1] + 1));
  for (const row of published.cases.filter(item => item.waveform)) {
    const { time, timeUnit } = row.waveform;
    assert.ok(timeUnit === undefined || timeUnit === "s" || timeUnit === "sample", `${row.id}: unknown time unit ${timeUnit}`);
    if (counting(time)) assert.equal(timeUnit, "sample", `${row.id}: a counting axis would be shown as seconds`);
    if (timeUnit === "sample") assert.ok(counting(time), `${row.id}: a sample axis must count by one`);
  }
  const samples = published.cases.filter(item => item.waveform?.timeUnit === "sample");
  assert.deepEqual(samples.map(item => item.id), ["lab8-moving-average"]);
  const lab8 = samples[0];
  assert.equal(lab8.waveform.time.length, 56);
  assert.deepEqual(lab8.waveform.series.map(item => item.values.length), [56, 56]);
  assert.ok(lab8.notes.some(note => /시간\(초\)이 아니라/.test(note)), "the row explains that its axis is not seconds");
  assert.equal(sequenceChartModel(lab8.waveform.time, lab8.waveform.series).count, 56);
});

test("a row that compared only part of its metrics says so, and every row names its kind of comparison", () => {
  const base = reportFixture();
  const metric = (label, extra = {}) => ({ label, value: 1, basis: "independent-equation", status: "reported", ...extra });
  const partial = { id: "analog-partial", experimentId: "lab-1", title: "Partial comparison fixture", kind: "analog", status: "pass", sources: [], conditions: [], notes: [],
    metrics: [metric("compared", { reference: 1, tolerance: 1, status: "pass" }), metric("reported only A"), metric("reported only B")] };
  const full = { ...partial, id: "analog-full", title: "Full comparison fixture", metrics: [metric("compared", { reference: 1, tolerance: 1, status: "pass" })] };
  const external = { ...partial, id: "external-row", title: "External hardware fixture", kind: "external", status: "blocked", metrics: [] };
  const h = uiHarness({ report: { ...base, cases: [...base.cases, partial, full, external] } });
  const listed = id => textIn(h.find(node => node.type === "button" && textIn(node).includes(base.cases.concat(partial, full, external).find(row => row.id === id).title)));
  assert.match(listed("analog-partial"), /기준 충족 · 비교 1\/3/);
  assert.doesNotMatch(listed("analog-full"), /비교 \d\/\d/, "a fully compared row needs no qualifier");
  h.choose("analog-partial");
  assert.match(textIn(h.tree), /회로 계산/);
  assert.match(textIn(h.tree), /비교 1\/3/);
  h.choose("external-row");
  assert.match(textIn(h.tree), /외부 장비/);
  h.choose("dsp-offline-fixture");
  assert.match(textIn(h.tree), /신호처리 계산/);
  assert.match(textIn(h.tree), /일반 830홀 모델로 실험실에서 별도 점검/, "the scope paragraph states the layout check's model and exclusions");
  assert.match(textIn(h.tree), /실물 조립과 측정은 수행하지 않았습니다/);
});
