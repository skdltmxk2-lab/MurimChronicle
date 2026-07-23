import assert from "node:assert/strict";
import {
  ALL_UNIT_VALUE,
  balancedUnitTargets,
  difficultyFallbackOrder,
  prioritizedUnitsForSubject,
  selectUnitMockCandidates,
} from "../src/lib/admin/unitMockSelectionCore.mjs";

function question(id, unit, difficulty) {
  return { id, unit, difficulty };
}

assert.deepEqual(difficultyFallbackOrder("mediumHard"), [
  "mediumHard",
  "medium",
  "easyMedium",
  "easy",
]);
assert.deepEqual(difficultyFallbackOrder("easy"), ["easy"]);
assert.deepEqual(difficultyFallbackOrder("all"), []);

const calculusUnits = ["함수", "Taylor급수", "최대/최소", "추가내용"];
assert.deepEqual(prioritizedUnitsForSubject("미분학", calculusUnits), [
  "최대/최소",
  "Taylor급수",
  "함수",
  "추가내용",
]);
assert.deepEqual(
  prioritizedUnitsForSubject("적분학", [
    "부정적분",
    "정적분의 계산",
    "Maclaurin급수의 응용",
    "정적분의 응용",
    "극좌표와 응용",
    "특이적분",
  ]),
  [
    "정적분의 응용",
    "극좌표와 응용",
    "정적분의 계산",
    "부정적분",
    "Maclaurin급수의 응용",
    "특이적분",
  ]
);
assert.deepEqual(
  prioritizedUnitsForSubject("선형대수", ["행렬", "벡터공간", "고유치와 대각화", "선형사상"]),
  ["고유치와 대각화", "벡터공간", "선형사상", "행렬"]
);
assert.deepEqual(
  prioritizedUnitsForSubject("공학수학", ["복소수", "미분방정식", "Laplace변환", "벡터해석"]),
  ["미분방정식", "Laplace변환", "복소수", "벡터해석"]
);
assert.deepEqual(balancedUnitTargets("미분학", calculusUnits, 2), {
  "최대/최소": 1,
  Taylor급수: 1,
  함수: 0,
  추가내용: 0,
});
assert.deepEqual(balancedUnitTargets("미분학", calculusUnits, 6), {
  "최대/최소": 2,
  Taylor급수: 2,
  함수: 1,
  추가내용: 1,
});

const prioritySelection = selectUnitMockCandidates(
  [
    question("function", "함수", "medium"),
    question("taylor", "Taylor급수", "medium"),
    question("max", "최대/최소", "medium"),
    question("extra", "추가내용", "medium"),
  ],
  {
    subject: "미분학",
    unit: ALL_UNIT_VALUE,
    units: calculusUnits,
    count: 2,
    difficulty: "medium",
  }
);
assert.deepEqual(prioritySelection.selected.map((item) => item.id), ["max", "taylor"]);

const balancedSelection = selectUnitMockCandidates(
  calculusUnits.flatMap((unit, unitIndex) =>
    Array.from({ length: 3 }, (_, index) => question(`${unitIndex}-${index}`, unit, "medium"))
  ),
  {
    subject: "미분학",
    unit: ALL_UNIT_VALUE,
    units: calculusUnits,
    count: 10,
    difficulty: "medium",
  }
);
assert.equal(balancedSelection.selected.length, 10);
assert.equal(Math.max(...Object.values(balancedSelection.selectedByUnit)), 3);
assert.equal(Math.min(...Object.values(balancedSelection.selectedByUnit)), 2);
assert.equal(balancedSelection.selectedByUnit["최대/최소"], 3);
assert.equal(balancedSelection.selectedByUnit.Taylor급수, 3);

const fallbackSelection = selectUnitMockCandidates(
  [
    question("higher", "최대/최소", "hard"),
    question("lower-2", "최대/최소", "easyMedium"),
    question("requested", "최대/최소", "mediumHard"),
    question("lower-1", "최대/최소", "medium"),
    question("lowest", "최대/최소", "easy"),
  ],
  {
    subject: "미분학",
    unit: "최대/최소",
    units: calculusUnits,
    count: 4,
    difficulty: "mediumHard",
  }
);
assert.deepEqual(fallbackSelection.selected.map((item) => item.id), [
  "requested",
  "lower-1",
  "lower-2",
  "lowest",
]);
assert.equal(fallbackSelection.selected.some((item) => item.difficulty === "hard"), false);

const replacementFallbackSelection = selectUnitMockCandidates(
  [
    question("higher-unused", "최대/최소", "hard"),
    question("next-lower-unused", "최대/최소", "medium"),
    question("two-levels-lower-unused", "최대/최소", "easyMedium"),
  ],
  {
    subject: "미분학",
    unit: "최대/최소",
    units: calculusUnits,
    count: 1,
    difficulty: "mediumHard",
  }
);
assert.deepEqual(replacementFallbackSelection.selected.map((item) => item.id), [
  "next-lower-unused",
]);

const unavailablePrioritySelection = selectUnitMockCandidates(
  [
    question("function-1", "함수", "medium"),
    question("extra-1", "추가내용", "medium"),
  ],
  {
    subject: "미분학",
    unit: ALL_UNIT_VALUE,
    units: calculusUnits,
    count: 2,
    difficulty: "medium",
  }
);
assert.deepEqual(unavailablePrioritySelection.selected.map((item) => item.id), [
  "function-1",
  "extra-1",
]);

console.log("unit mock selection: 13 regression checks passed");
