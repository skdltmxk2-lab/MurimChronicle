// 다른 Claude/AI에 프로젝트 컨텍스트를 한꺼번에 전달하기 위한 번들 생성기.
// 실행: node scripts/_export_context.mjs > project_context.md
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const MEMORY_DIR = "C:/Users/yubin/.claude/projects/c--Users-yubin-???? CBT/memory";

function readSafe(p) {
  try { return readFileSync(p, "utf8"); } catch { return null; }
}

function section(title, body) {
  if (!body) return;
  console.log(`\n\n## ${title}\n`);
  console.log("```");
  console.log(body.trim());
  console.log("```");
}

console.log(`# 루트매쓰 CBT (???? CBT) — 프로젝트 컨텍스트 번들`);
console.log(`\n생성 시각: ${new Date().toISOString()}`);
console.log(`\n이 문서는 다른 Claude/AI 어시스턴트에게 프로젝트 전체를 빠르게 이해시키기 위한 번들입니다.`);

// === 1. 메모리 (사용자 정책·프로젝트 개요) ===
console.log(`\n\n# 📌 1. 사용자 메모리 (정책·이력)\n`);
if (existsSync(MEMORY_DIR)) {
  const files = readdirSync(MEMORY_DIR);
  // MEMORY.md 먼저
  const idx = readSafe(join(MEMORY_DIR, "MEMORY.md"));
  if (idx) section("MEMORY.md (인덱스)", idx);
  for (const f of files) {
    if (f === "MEMORY.md" || !f.endsWith(".md")) continue;
    const c = readSafe(join(MEMORY_DIR, f));
    if (c) section(`memory/${f}`, c);
  }
} else {
  console.log(`(메모리 폴더 없음: ${MEMORY_DIR})`);
}

// === 2. 핵심 정의 ===
console.log(`\n\n# 📌 2. 핵심 타입·정책 파일\n`);
const CORE = [
  "package.json",
  "src/lib/taxonomy.ts",
  "src/types/exam.ts",
  "src/types/question.ts",
  "src/types/auth.ts",
  "src/lib/auth/tierGuard.ts",
];
for (const rel of CORE) {
  const c = readSafe(join(ROOT, rel));
  if (c) section(rel, c);
}

// === 3. DB 스키마 ===
console.log(`\n\n# 📌 3. Supabase 마이그레이션 (DB 스키마)\n`);
const MIG_DIR = join(ROOT, "supabase/migrations");
if (existsSync(MIG_DIR)) {
  const sqls = readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const f of sqls) {
    const c = readSafe(join(MIG_DIR, f));
    if (c) section(`supabase/migrations/${f}`, c);
  }
}

// === 4. 주요 화면 ===
console.log(`\n\n# 📌 4. 주요 UI 화면 (학생·관리자 진입점)\n`);
const SCREENS = [
  "app/student/exams/page.tsx",
  "app/admin/page.tsx",
  "src/components/admin/AdminHomeClient.tsx",
  "src/components/student/PricingClient.tsx",
  "src/components/exam/ExamRunner.tsx",
];
for (const rel of SCREENS) {
  const c = readSafe(join(ROOT, rel));
  if (c) section(rel, c);
}

// === 5. 핵심 비즈니스 로직 ===
console.log(`\n\n# 📌 5. 핵심 비즈니스 로직\n`);
const LOGIC = [
  "src/lib/weakness/select.ts",
  "src/lib/exam/grading.ts",
  "src/lib/questions/SupabaseQuestionRepository.ts",
  "src/lib/questions/IQuestionRepository.ts",
];
for (const rel of LOGIC) {
  const c = readSafe(join(ROOT, rel));
  if (c) section(rel, c);
}

// === 6. 디렉토리 구조 ===
console.log(`\n\n# 📌 6. 디렉토리 트리 (depth 2)\n\n\`\`\``);
function tree(dir, prefix = "", depth = 0, max = 2) {
  if (depth > max) return;
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  const skip = new Set(["node_modules", ".next", ".git", ".vercel"]);
  const filtered = entries.filter((e) => !skip.has(e.name) && !e.name.startsWith("."));
  filtered.sort((a, b) => a.name.localeCompare(b.name));
  for (const e of filtered) {
    console.log(`${prefix}${e.isDirectory() ? "📁" : "📄"} ${e.name}`);
    if (e.isDirectory()) tree(join(dir, e.name), prefix + "  ", depth + 1, max);
  }
}
tree(ROOT);
console.log("```");

console.log(`\n\n---\n_번들 끝._`);
