import assert from "node:assert/strict";
import { fixedPrintPages, packPrintPages } from "../src/lib/admin/printPaginationCore.mjs";

const flat = (pages) => pages.flatMap((page) => [...page.left, ...page.right]);
const shape = (pages) => pages.map((page) => [page.left.length, page.right.length]);

// 높이를 모를 때의 기본 구성은 예전 chunk(6) 와 같다(한 장 3 + 3).
assert.deepEqual(fixedPrintPages(0), []);
assert.deepEqual(fixedPrintPages(-1), []);
assert.deepEqual(fixedPrintPages(1), [{ left: [0], right: [] }]);
assert.deepEqual(fixedPrintPages(4), [{ left: [0, 1, 2], right: [3] }]);
assert.deepEqual(fixedPrintPages(7), [
  { left: [0, 1, 2], right: [3, 4, 5] },
  { left: [6], right: [] },
]);

const COLUMN = 300;
const GAP = 10;

// 모두 들어가면 예전과 똑같이 3 + 3 이다.
{
  const { pages, oversize } = packPrintPages(Array(12).fill(80), { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(pages, fixedPrintPages(12));
  assert.deepEqual(oversize, []);
}

// 높이 정보가 없으면 개수만 지킨다.
{
  const { pages } = packPrintPages(Array(7).fill(1000), { columnHeight: undefined, gap: GAP });
  assert.deepEqual(pages, fixedPrintPages(7));
  const second = packPrintPages(Array(7).fill(1000), { columnHeight: Number.NaN, gap: GAP });
  assert.deepEqual(second.pages, fixedPrintPages(7));
}

// 앞 두 문항이 길면 세 번째는 다음 단으로 넘어간다 — 사용자가 본 잘림 상황.
{
  // 단은 늘 3칸이라 간격 2개(20)를 항상 센다. 120 + 120 + 20 = 260 은 들어가고,
  // 세 번째(80)를 더하면 320 > 300 이라 넘어간다.
  const heights = [120, 120, 80, 80, 80, 80, 80];
  const { pages, oversize } = packPrintPages(heights, { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(pages[0].left, [0, 1]);
  assert.deepEqual(pages[0].right, [2, 3, 4]);
  assert.deepEqual(pages[1].left, [5, 6]);
  assert.deepEqual(flat(pages), [0, 1, 2, 3, 4, 5, 6], "순서와 개수는 그대로");
  assert.deepEqual(oversize, []);
}

// 오른쪽 단까지 차면 다음 장으로 넘어간다.
{
  const { pages } = packPrintPages(Array(5).fill(200), { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(shape(pages), [[1, 1], [1, 1], [1, 0]]);
  assert.deepEqual(flat(pages), [0, 1, 2, 3, 4]);
}

// 단 전체(문항 + 칸 사이 간격 2개)가 단 높이와 같으면 들어가고, 1 이라도 넘으면 넘어간다.
// 문항이 2개뿐이어도 빈 세 번째 칸 앞 간격까지 센다 — 이걸 빼면 단이 넘쳐 옆 단 문항이 밀려 잘렸다.
{
  const exact = packPrintPages([140, 140], { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(shape(exact.pages), [[2, 0]]);
  const over = packPrintPages([140, 141], { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(shape(over.pages), [[1, 1]]);
  const twoGapsOnly = packPrintPages([145, 145], { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(shape(twoGapsOnly.pages), [[1, 1]], "보이는 바닥(300)만 보면 들어가 보여도 단 전체(310)는 넘친다");
}

// 여유(safety)만큼 덜 채운다.
{
  const { pages } = packPrintPages([140, 140], { columnHeight: COLUMN, gap: GAP, safety: 6 });
  assert.deepEqual(shape(pages), [[1, 1]]);
}

// 한 단에 혼자 놓아도 안 들어가는 문항은 혼자 한 단을 차지하고 oversize 로 알려 준다.
// (인쇄 CSS 가 행을 페이지 높이에 고정하므로 넘쳐도 옆 단은 밀리지 않는다)
{
  const { pages, oversize } = packPrintPages([50, 400, 50], { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(oversize, [1]);
  assert.deepEqual(pages, [
    { left: [0], right: [1] },
    { left: [2], right: [] },
  ]);
}

// 보이는 부분은 들어가지만 간격까지 더하면 넘치는 문항은 혼자 한 단을 쓴다. 잘리지는 않으니 경고는 없다.
{
  const { pages, oversize } = packPrintPages([50, 290, 50, 50], { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(oversize, []);
  assert.deepEqual(pages, [
    { left: [0], right: [1] },
    { left: [2, 3], right: [] },
  ]);
}

// 머릿말 때문에 짧은 장에서만 안 들어가는 문항은 잘리게 두지 않고 다음 장으로 넘긴다.
{
  const { pages, oversize } = packPrintPages([50, 250, 30], {
    columnHeight: (pageIndex) => (pageIndex === 0 ? 200 : 300),
    gap: GAP,
  });
  assert.deepEqual(oversize, []);
  assert.deepEqual(pages, [
    { left: [0], right: [] },
    { left: [1, 2], right: [] },
  ]);
}

// 첫 문항이 너무 커도 빈 페이지를 만들지 않는다.
{
  const { pages, oversize } = packPrintPages([999], { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(pages, [{ left: [0], right: [] }]);
  assert.deepEqual(oversize, [0]);
}

// 페이지마다 단 높이가 다를 수 있다(머릿말이 있는 페이지는 짧다).
{
  const heights = Array(6).fill(90);
  const flatLimit = packPrintPages(heights, { columnHeight: () => 300, gap: GAP });
  assert.deepEqual(shape(flatLimit.pages), [[3, 3]]);
  // 90 * 3 + 10 * 2 = 290 이라 300 에는 들어가지만 260 에는 두 개만 들어간다.
  const withHeader = packPrintPages(heights, {
    columnHeight: (pageIndex) => (pageIndex === 0 ? 260 : 300),
    gap: GAP,
  });
  assert.deepEqual(shape(withHeader.pages), [[2, 2], [2, 0]]);
  assert.deepEqual(flat(withHeader.pages), [0, 1, 2, 3, 4, 5]);
}

// 새 페이지의 높이는 그 페이지 번호로 다시 묻는다.
{
  const asked = [];
  packPrintPages(Array(8).fill(200), {
    columnHeight: (pageIndex) => {
      asked.push(pageIndex);
      return COLUMN;
    },
    gap: GAP,
  });
  assert.ok(asked.includes(0) && asked.includes(1) && asked.includes(3), "모든 페이지 번호로 호출");
}

// 비어 있거나 이상한 높이는 0 으로 본다(측정 실패가 전체를 망치지 않게).
{
  const { pages } = packPrintPages([Number.NaN, -5, 80, undefined], { columnHeight: COLUMN, gap: GAP });
  assert.deepEqual(flat(pages), [0, 1, 2, 3]);
  assert.deepEqual(packPrintPages([], { columnHeight: COLUMN }).pages, []);
}

// 한 단 문항 수를 바꿀 수 있다.
{
  const { pages } = packPrintPages(Array(5).fill(10), { columnHeight: COLUMN, gap: GAP, perColumn: 2 });
  assert.deepEqual(shape(pages), [[2, 2], [1, 0]]);
}

// 번호는 항상 입력 순서다 — 어떤 높이 조합이어도 인덱스가 순서대로 한 번씩 나온다.
{
  let seed = 12345;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let round = 0; round < 200; round += 1) {
    const count = 1 + Math.floor(random() * 40);
    const heights = Array.from({ length: count }, () => 20 + Math.floor(random() * 320));
    const { pages, oversize } = packPrintPages(heights, { columnHeight: COLUMN, gap: GAP, safety: 4 });
    const limit = COLUMN - 4;
    assert.deepEqual(flat(pages), Array.from({ length: count }, (_, i) => i), "순서 보존");
    for (const page of pages) {
      assert.ok(page.left.length >= 1, "왼쪽 단이 비지 않는다");
      for (const column of [page.left, page.right]) {
        assert.ok(column.length <= 3, "한 단 3문항 이하");
        const total = column.reduce((sum, index) => sum + heights[index], 0) + GAP * 2;
        // 단 전체가 넘치는 것은 혼자 놓인 문항 하나뿐인 단에서만 생긴다.
        if (total > limit) assert.equal(column.length, 1, "둘 이상 놓은 단은 간격까지 높이 안에 든다");
      }
    }
    for (const index of oversize) assert.ok(heights[index] > limit);
    for (let index = 0; index < count; index += 1) {
      if (heights[index] > limit) assert.ok(oversize.includes(index), "잘리는 문항은 빠짐없이 알린다");
    }
  }
}

console.log("print pagination: all cases passed");
