// 단원별 모고 "다른 파트에서 가져오기" — 목록을 거르고 정렬하고 자르는 순수 로직.
// 서버 라우트(app/api/admin/coaching/unit-mock/browse)와 테스트(scripts/test_unit_mock_browse.mjs)가 함께 쓴다.

const DIFFICULTY_ORDER = ["easy", "easyMedium", "medium", "mediumHard", "hard", "killer"];

export const BROWSE_DEFAULT_LIMIT = 30;
export const BROWSE_MAX_LIMIT = 60;
export const BROWSE_QUERY_MAX_LENGTH = 100;
export const BROWSE_PREVIEW_LENGTH = 320;

export function normalizeBrowseQuery(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, BROWSE_QUERY_MAX_LENGTH);
}

/** 검색어를 공백으로 나눠 모두 포함해야 통과한다. 단원·개념·태그·본문을 한꺼번에 본다. */
export function matchesBrowseQuery(row, query) {
  const tokens = normalizeBrowseQuery(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return true;
  const haystack = [row.unit, row.concept, row.question, ...(Array.isArray(row.tags) ? row.tags : [])]
    .map((part) => String(part ?? ""))
    .join("\n")
    .toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function difficultyRank(difficulty) {
  const index = DIFFICULTY_ORDER.indexOf(difficulty);
  return index < 0 ? DIFFICULTY_ORDER.length : index;
}

/** 단원 순서 → 난이도(쉬운 것부터) → id. 페이지를 넘겨도 순서가 흔들리지 않게 항상 결정적이다. */
export function compareBrowseRows(units) {
  const unitRank = new Map(units.map((unit, index) => [unit, index]));
  const rankOf = (row) => unitRank.get(row.unit) ?? units.length;
  return (left, right) =>
    rankOf(left) - rankOf(right) ||
    difficultyRank(left.difficulty) - difficultyRank(right.difficulty) ||
    String(left.id).localeCompare(String(right.id));
}

export function clampBrowseLimit(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return BROWSE_DEFAULT_LIMIT;
  return Math.max(1, Math.min(BROWSE_MAX_LIMIT, Math.round(number)));
}

export function clampBrowseOffset(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.round(number));
}

export function countBrowseRowsByUnit(rows) {
  const counts = {};
  for (const row of rows) counts[row.unit] = (counts[row.unit] ?? 0) + 1;
  return counts;
}

/** 목록용 본문: 줄바꿈을 접고 길이를 자른다(원문 LaTeX 는 그대로 둔다). */
export function browsePreviewText(text, max = BROWSE_PREVIEW_LENGTH) {
  const flat = String(text ?? "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}
