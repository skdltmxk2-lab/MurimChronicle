import assert from "node:assert/strict";
import {
  BROWSE_DEFAULT_LIMIT,
  BROWSE_MAX_LIMIT,
  browsePreviewText,
  clampBrowseLimit,
  clampBrowseOffset,
  compareBrowseRows,
  countBrowseRowsByUnit,
  matchesBrowseQuery,
  normalizeBrowseQuery,
} from "../src/lib/admin/unitMockBrowseCore.mjs";

// 검색어: 대소문자·중복 공백을 무시하고, 길이는 잘라 낸다.
assert.equal(normalizeBrowseQuery("  Taylor   급수 "), "taylor 급수");
assert.equal(normalizeBrowseQuery(null), "");
assert.equal(normalizeBrowseQuery("a".repeat(500)).length, 100);

const row = {
  id: "q-1",
  unit: "순간 변화율",
  difficulty: "easy",
  concept: "위치-시간 그래프 해석",
  question: "어떤 입자의 위치 그래프가 점 $(0,0)$ 을 지난다.",
  tags: ["홍익대", "2019"],
};
assert.equal(matchesBrowseQuery(row, ""), true);
assert.equal(matchesBrowseQuery(row, "입자"), true);
assert.equal(matchesBrowseQuery(row, "홍익대 2019"), true, "토큰은 단원·개념·태그·본문 어디든 찾는다");
assert.equal(matchesBrowseQuery(row, "홍익대 2020"), false, "모든 토큰이 있어야 통과한다");
assert.equal(matchesBrowseQuery({ id: "x", unit: "u", difficulty: "easy" }, "없음"), false, "빈 필드도 안전하다");

// 정렬: 단원 순서 → 쉬운 난이도 → id. 모르는 단원·난이도는 맨 뒤로 간다.
const units = ["함수", "극한", "미분"];
const rows = [
  { id: "d", unit: "미분", difficulty: "hard" },
  { id: "c", unit: "함수", difficulty: "medium" },
  { id: "b", unit: "함수", difficulty: "easy" },
  { id: "a", unit: "함수", difficulty: "easy" },
  { id: "z", unit: "없는단원", difficulty: "easy" },
  { id: "y", unit: "극한", difficulty: "미정" },
];
assert.deepEqual(
  [...rows].sort(compareBrowseRows(units)).map((item) => item.id),
  ["a", "b", "c", "y", "d", "z"]
);
assert.deepEqual(
  [...rows].reverse().sort(compareBrowseRows(units)).map((item) => item.id),
  ["a", "b", "c", "y", "d", "z"],
  "입력 순서와 상관없이 같은 결과여야 페이지가 겹치지 않는다"
);

// 페이지 크기·시작 위치는 잘못된 값이 와도 범위 안으로 되돌린다.
assert.equal(clampBrowseLimit(undefined), BROWSE_DEFAULT_LIMIT);
assert.equal(clampBrowseLimit("abc"), BROWSE_DEFAULT_LIMIT);
assert.equal(clampBrowseLimit(0), 1);
assert.equal(clampBrowseLimit(9999), BROWSE_MAX_LIMIT);
assert.equal(clampBrowseLimit(12.4), 12);
assert.equal(clampBrowseOffset(undefined), 0);
assert.equal(clampBrowseOffset(-5), 0);
assert.equal(clampBrowseOffset(40.2), 40);

assert.deepEqual(countBrowseRowsByUnit(rows), { 미분: 1, 함수: 3, 없는단원: 1, 극한: 1 });

assert.equal(browsePreviewText("  가\n\n나   다 "), "가 나 다");
assert.equal(browsePreviewText("가나다라마", 3), "가나다…");
assert.equal(browsePreviewText(undefined), "");

console.log("unit mock browse: regression checks passed");
