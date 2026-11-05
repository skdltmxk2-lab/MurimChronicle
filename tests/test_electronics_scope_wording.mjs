import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = name => readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8");
const workspace = source("components/electronics/ElectronicsWorkspace.tsx");
const board = source("components/electronics/Breadboard.tsx");
const engine = source("lib/electronics/engine.ts");

// A passing check is a statement about the selected generic board model and the stated schematic, never about the
// physical board, its manufacturer, its rail break structure, lead forming or part ratings. These guards keep the
// wording that carries that scope from being shortened back into a physical claim.
test("a passing connection check is always stated against the generic 830-hole model", () => {
  assert.match(workspace, /모델 기준 연결 검사 통과/);
  assert.match(workspace, /일반 830홀 모델 기준 연결·배치 검사 통과/);
  assert.match(workspace, /배선 검사\(일반 830홀 모델 기준\)/);
  assert.match(workspace, /title="선택한 빵판 모델\(일반 830홀\) 기준 판정입니다\./);
  assert.match(workspace, /실제 부품·빵판 제품·레일 구조·정격과 동작 성능은 확인하지 않았습니다/);
  assert.doesNotMatch(workspace, /"연결 검사 통과"/, "the bare physical-sounding pill text is gone");
  assert.doesNotMatch(workspace, /"연결·배치 검사 통과"/);
});

test("the board is never described as a photographed or identified product", () => {
  assert.doesNotMatch(workspace, /사진형/);
  assert.match(workspace, /일반 단일판 · 830홀/);
  assert.match(workspace, /실물 빵판 제품명과 레일 구조는 확인되지 않았습니다/);
});

test("rail structure statements are marked as the model's, with a continuity check before assembly", () => {
  assert.match(engine, /일반 830홀 모델에서는 이 점퍼가 없으면 레일 구간이 서로 연결되지 않습니다/);
  assert.match(engine, /실물 빵판의 레일이 중간에서 끊겨 있는지 조립 전에 도통을 확인하세요/);
  assert.match(board, /\(일반 830홀 모델\)/);
  assert.match(board, /전원 레일 구간 경계\(모델 기준\)/);
  assert.match(board, /일반 830홀 모델 기준 · 실물 빵판 구조 미확인/);
});

test("an unformed BC109C is told to apply the forming profile, not that an external connection is needed", () => {
  assert.match(engine, /원형 BC109C 리드는 빵판에 직접 꽂지 않습니다/);
  assert.doesNotMatch(engine, /"외부 연결"\}가/, "the wrong particle after 외부 연결 is gone");
});
