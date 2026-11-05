/** Execute every identified course analog case using the real application engine. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
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
    if (!dependency.startsWith("./")) throw new Error(`Unexpected reference dependency ${dependency}`);
    return load(dependency.slice(2));
  });
  return module.exports;
}
const { COURSE_ANALOG_CASES } = load("course-analog-fixtures");
const { measureCourseAnalogCase } = load("course-analog-verification");
const { COMPONENT_CATALOG } = load("catalog");
const { runSimulation } = load("simulation");
const directory = resolve("output/course-verification");
mkdirSync(directory, { recursive: true });
const selected = process.argv[2];
const results = [];
for (const testCase of COURSE_ANALOG_CASES.filter(item => !selected || item.id.startsWith(selected))) {
  const start = performance.now();
  let record;
  if (testCase.blockedReason) record = measureCourseAnalogCase(testCase);
  else {
    try {
      const result = runSimulation(testCase.circuit, COMPONENT_CATALOG, testCase.config);
      record = measureCourseAnalogCase(testCase, result);
      record.capture = { durationSeconds: testCase.config.durationSeconds, sampleCount: result.time.length, probeNets: testCase.probes };
    } catch (error) { record = measureCourseAnalogCase(testCase, undefined, error instanceof Error ? error.message : String(error)); }
  }
  record.elapsedMs = Math.round(performance.now() - start);
  results.push(record);
  console.log(JSON.stringify({ id: record.id, status: record.status, elapsedMs: record.elapsedMs, comparisons: record.metrics.filter(item => item.reference !== undefined).map(item => ({ metric: item.metric, actual: item.value, reference: item.reference, status: item.status })), ...(record.reason ? { reason: record.reason } : {}) }));
}
const summary = Object.fromEntries(["pass", "mismatch", "blocked", "reference-missing"].map(status => [status, results.filter(item => item.status === status).length]));
const name = selected ? `labs-0-4-${selected}.json` : "labs-0-4.json";
writeFileSync(resolve(directory, name), JSON.stringify({ generatedAt: new Date().toISOString(), engine: "src/lib/electronics/simulation.ts", mocked: false, scope: "실험 0~4 지정 보고서의 회로와 명시된 조건. 원문 수치, 실측값, 독립식 비교를 구분하며 하드웨어 검증은 포함하지 않음.", criteria: "기본 상대 5%, DC 전압 상대 2%+10mV, 독립 이상식 별도 엄격 기준. 비교 허용치는 부품 공차와 구분. 참조 없는 실행을 pass로 처리하지 않음.", summary, cases: results }, null, 2));
console.log(JSON.stringify({ file: resolve(directory, name), total: results.length, summary }));
