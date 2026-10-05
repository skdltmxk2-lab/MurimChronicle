const MAX_QUESTIONS = 60;
const verdicts = new Set(["correct", "partial", "incorrect", "unreadable", "missing", "review"]);
const str = (value, max = 12000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const record = value => value !== null && typeof value === "object" && !Array.isArray(value);

export function validateQuestionNumbers(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_QUESTIONS) throw new Error("문항 번호를 1~60개 입력해 주세요.");
  const result = value.map(number => {
    if (typeof number !== "string" || !/^[\p{L}\p{N}][\p{L}\p{N}()._-]{0,23}$/u.test(number.trim())) throw new Error("문항 번호는 24자 이내의 숫자·문자와 괄호로 입력해 주세요.");
    return number.trim();
  });
  if (new Set(result).size !== result.length) throw new Error("중복된 문항 번호가 있습니다. 페이지마다 번호가 다시 시작하면 구분해서 등록해 주세요.");
  return result;
}

export function parseQuestionNumbers(input) {
  if (typeof input !== "string" || input.length > 2000) throw new Error("문항 번호 입력을 확인해 주세요.");
  const numbers = [];
  for (const token of input.trim().split(/[\s,，]+/).filter(Boolean)) {
    const range = token.match(/^(\d+)[-~–](\d+)$/);
    if (range) {
      const first = Number(range[1]); const last = Number(range[2]);
      if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last) || first < 1 || last < first || last - first >= MAX_QUESTIONS) throw new Error("문항 범위는 작은 번호부터 최대 60개까지 입력해 주세요.");
      for (let n = first; n <= last; n++) numbers.push(String(n));
    } else numbers.push(token);
    if (numbers.length > MAX_QUESTIONS) throw new Error("한 자료에는 최대 60문항까지 등록할 수 있습니다.");
  }
  return validateQuestionNumbers(numbers);
}

function align(value, numbers) {
  const source = Array.isArray(value) ? value : [];
  const byNumber = new Map(); let ambiguous = !Array.isArray(value);
  for (const raw of source) {
    if (!record(raw)) { ambiguous = true; continue; }
    const number = typeof raw.questionNumber === "number" ? String(raw.questionNumber) : str(raw.questionNumber, 24);
    if (!numbers.includes(number) || byNumber.has(number)) { ambiguous = true; continue; }
    byNumber.set(number, raw);
  }
  return { byNumber, ambiguous };
}

function pages(value) {
  return Array.isArray(value) ? [...new Set(value.filter(n => Number.isInteger(n) && n >= 1 && n <= 50))].sort((a, b) => a - b) : [];
}

function invalidPages(value) {
  return !Array.isArray(value) || value.some(n => !Number.isInteger(n) || n < 1 || n > 50);
}

export function normalizeReference(value, numbers) {
  const { byNumber, ambiguous } = align(value, numbers);
  return numbers.map(questionNumber => {
    const raw = byNumber.get(questionNumber) ?? {};
    const problem = str(raw.problem); const answer = str(raw.answer); const solution = str(raw.solution, 24000);
    const sourcePages = pages(raw.sourcePages);
    const incomplete = !problem || !answer || !solution || sourcePages.length === 0 || invalidPages(raw.sourcePages);
    return { questionNumber, problem, answer, solution, sourcePages,
      needsReview: ambiguous || incomplete || raw.needsReview !== false,
      reviewReason: ambiguous ? "문항 번호의 중복·누락 또는 연결 오류를 확인해 주세요." : incomplete ? "문제·정답·풀이 또는 원본 페이지를 확인해 주세요." : str(raw.reviewReason, 2000),
    };
  });
}

export function emptyFeedback(questionNumber) {
  return { questionNumber, verdict: "review", studentWork: "", errorStep: "", reason: "", hint: "", comment: "", sourcePages: [], needsReview: true, reviewReason: "선생님 확인이 필요합니다.", verified: false };
}

export function normalizeFeedback(value, numbers) {
  const { byNumber, ambiguous } = align(value, numbers);
  return numbers.map(questionNumber => {
    const raw = byNumber.get(questionNumber);
    if (!raw) return { ...emptyFeedback(questionNumber), reviewReason: "AI 응답에 이 문항이 없습니다. 원본 풀이를 확인해 주세요." };
    const verdict = verdicts.has(raw.verdict) ? raw.verdict : "review";
    const sourcePages = pages(raw.sourcePages);
    const comment = str(raw.comment);
    const studentWork = str(raw.studentWork, 24000);
    const uncertain = ["unreadable", "missing", "review"].includes(verdict) || !comment || !studentWork || !sourcePages.length || invalidPages(raw.sourcePages);
    return { questionNumber, verdict, studentWork, errorStep: str(raw.errorStep, 4000), reason: str(raw.reason), hint: str(raw.hint), comment, sourcePages,
      needsReview: ambiguous || uncertain || raw.needsReview !== false,
      reviewReason: ambiguous ? "문항 번호가 중복되거나 예상 번호와 다릅니다. 원본과 연결을 확인해 주세요." : str(raw.reviewReason, 2000) || (uncertain ? "판독 결과와 원본 풀이를 확인해 주세요." : ""),
      verified: raw.verified === true,
    };
  });
}

export function validateSettings(value) {
  if (!record(value) || typeof value.aiEnabled !== "boolean" || !["polite", "casual"].includes(value.tone) || !["hint", "detailed"].includes(value.depth) || typeof value.styleGuide !== "string" || typeof value.examples !== "string" || value.styleGuide.length > 5000 || value.examples.length > 10000) throw new Error("AI 설정과 말투 예시 입력을 확인해 주세요.");
  return { aiEnabled: value.aiEnabled, tone: value.tone, depth: value.depth, styleGuide: value.styleGuide.trim(), examples: value.examples.trim() };
}

export function applyVerification(feedback, verification) {
  const { byNumber, ambiguous } = align(verification, feedback.map(row => row.questionNumber));
  return feedback.map(row => {
    const check = byNumber.get(row.questionNumber);
    const verified = !ambiguous && check?.agrees === true && check?.readable === true;
    return { ...row, verified, needsReview: row.needsReview || !verified,
      reviewReason: !verified ? str(check?.reason, 2000) || "두 번째 검토에서 판정과 풀이 근거를 확인하지 못했습니다." : row.reviewReason,
    };
  });
}

export function canAutoPublish({ settings, assignment, latest, referenceApproved, referenceRevisionMatches, feedback, numbers }) {
  return settings.aiEnabled === true && assignment.aiEnabled === true && assignment.releaseMode === "auto" && latest === true && referenceApproved === true && referenceRevisionMatches === true && Array.isArray(feedback) && feedback.length === numbers.length && feedback.every((row, index) => row.questionNumber === numbers[index] && row.verified === true && row.needsReview === false && ["correct", "partial", "incorrect"].includes(row.verdict) && str(row.comment).length > 0 && str(row.studentWork).length > 0 && !invalidPages(row.sourcePages) && pages(row.sourcePages).length > 0);
}
