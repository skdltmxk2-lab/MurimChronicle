/**
 * 문제지 인쇄 페이지 구성 — 문항 높이를 보고 칸·페이지에 나눠 담는 순수 로직.
 *
 * 문제지 한 장은 2단이고 한 단에 최대 3문항이다. 예전에는 문항 수만 보고 6개씩
 * 끊었기 때문에 그림이나 선지가 긴 문항이 한 단에 몰리면 맨 아래 문항이 페이지
 * 밖으로 밀려 잘렸다. 여기서는 실제로 잰 높이를 받아, 안 들어가는 문항을 다음 단
 * 또는 다음 장으로 넘긴다. 문항 순서와 번호는 바꾸지 않는다.
 *
 * 높이를 재는 일은 DOM 이 필요하므로 이 파일 밖(usePrintPagination)에서 한다.
 */

export const PRINT_QUESTIONS_PER_COLUMN = 3;

/** 높이를 모를 때의 기본 구성: 한 장에 3 + 3 문항. 예전 chunk(6) 결과와 같다. */
export function fixedPrintPages(count, perColumn = PRINT_QUESTIONS_PER_COLUMN) {
  const total = Number.isInteger(count) && count > 0 ? count : 0;
  const perPage = perColumn * 2;
  const pages = [];
  for (let start = 0; start < total; start += perPage) {
    const left = [];
    const right = [];
    for (let offset = 0; offset < perPage && start + offset < total; offset += 1) {
      (offset < perColumn ? left : right).push(start + offset);
    }
    pages.push({ left, right });
  }
  return pages;
}

function finiteNumber(value, fallback) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/**
 * @param {readonly number[]} heights 각 문항을 한 단 폭으로 놓았을 때의 높이(px).
 * @param {{
 *   columnHeight: number | ((pageIndex: number) => number),
 *   gap?: number,
 *   safety?: number,
 *   perColumn?: number,
 * }} options
 *   columnHeight: 한 단에 쓸 수 있는 높이. 함수면 페이지 번호(0부터)별로 다르게 줄 수 있다
 *     (머릿말이 있는 페이지는 그만큼 짧다). 숫자가 아니면 높이 제한 없이 개수만 지킨다.
 *   gap: 같은 단 안 문항 사이 간격. safety: 인쇄 때 글자 줄바꿈이 조금 달라도 안 잘리게 남기는 여유.
 *   perColumn: 한 단의 칸 수. 인쇄 CSS 의 grid-template-rows: repeat(3, …) 와 같아야 한다.
 * @returns {{ pages: { left: number[], right: number[] }[], oversize: number[] }}
 *   pages 는 문항 인덱스로 채운 페이지 목록. oversize 는 빈 단에 혼자 놓아도 안 들어가는 문항.
 */
export function packPrintPages(heights, options = {}) {
  const gap = Math.max(0, finiteNumber(options.gap, 0));
  const safety = Math.max(0, finiteNumber(options.safety, 0));
  const perColumn = Math.max(1, Math.floor(finiteNumber(options.perColumn, PRINT_QUESTIONS_PER_COLUMN)));
  const heightFor =
    typeof options.columnHeight === "function" ? options.columnHeight : () => options.columnHeight;
  const limitFor = (pageIndex) => finiteNumber(heightFor(pageIndex), Infinity) - safety;
  // 단은 문항이 몇 개든 늘 perColumn 칸짜리 grid 라서, 빈 칸이 있어도 칸 사이 간격은 모두 높이를 먹는다.
  // 그래서 "맨 아래 문항이 보이는가" 가 아니라 "단 전체(문항 + 간격 perColumn-1 개)가 단 높이 안에
  // 드는가" 로 판단한다. 이 조건이면 grid 가 칸을 어떻게 나눠도 모든 문항이 제 칸 안에 들어간다.
  const span = gap * (perColumn - 1);

  const pages = [];
  const oversize = [];
  let page = null;
  let side = "left";
  let used = 0;

  const openPage = () => {
    page = { left: [], right: [] };
    pages.push(page);
    side = "left";
    used = 0;
  };

  for (let index = 0; index < heights.length; index += 1) {
    const height = Math.max(0, finiteNumber(heights[index], 0));
    if (!page) openPage();

    let column = page[side];
    // 이미 문항이 있는 단에서, 칸이 다 찼거나 넣으면 단 높이를 넘으면 다음 단으로 간다.
    // 빈 단에는 아무리 커도 일단 놓는다(문항은 쪼갤 수 없다).
    if (column.length > 0 && (column.length >= perColumn || used + height + span > limitFor(pages.length - 1))) {
      if (side === "left") {
        side = "right";
      } else {
        openPage();
      }
      column = page[side];
      used = 0;
    }

    if (column.length === 0 && height > limitFor(pages.length - 1)) {
      // 머릿말 때문에 이 장에서만 짧은 경우라면, 다음 장에서는 들어갈 수 있다.
      const pageHasQuestions = page.left.length + page.right.length > 0;
      if (pageHasQuestions && height <= limitFor(pages.length)) {
        openPage();
        column = page[side];
      } else {
        oversize.push(index);
      }
    }
    column.push(index);
    used += height;
  }

  return { pages, oversize };
}
