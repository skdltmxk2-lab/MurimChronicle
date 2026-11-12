export const PRINT_QUESTIONS_PER_COLUMN: 3;

export type PrintPagePlan = {
  /** 왼쪽 단에 놓을 문항 인덱스(문항 순서 기준). */
  left: number[];
  /** 오른쪽 단에 놓을 문항 인덱스. */
  right: number[];
};

export type PackPrintPagesOptions = {
  columnHeight: number | ((pageIndex: number) => number);
  gap?: number;
  safety?: number;
  perColumn?: number;
};

export function fixedPrintPages(count: number, perColumn?: number): PrintPagePlan[];
export function packPrintPages(
  heights: readonly number[],
  options?: PackPrintPagesOptions
): { pages: PrintPagePlan[]; oversize: number[] };
