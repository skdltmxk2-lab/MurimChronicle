import type { Difficulty, Problem } from "@/types/exam";
import type { QuestionRecord } from "@/types/question";
import type {
  AdminExamMode,
  DifficultyRatio,
  ExamGenerationConfig,
  ExamGenerationResult,
  GeneratedExam
} from "@/types/generatedExam";
import { DIFFICULTY_KEYS } from "@/lib/taxonomy";

export type { AdminExamMode, DifficultyRatio, ExamGenerationConfig, ExamGenerationResult, GeneratedExam };

const difficulties: Difficulty[] = DIFFICULTY_KEYS;
const DIFFICULTY_SCORE: Record<Difficulty, number> = difficulties.reduce((acc, difficulty, index) => {
  acc[difficulty] = index + 1;
  return acc;
}, {} as Record<Difficulty, number>);

function emptyDifficultyRatio(): DifficultyRatio {
  return difficulties.reduce((acc, difficulty) => {
    acc[difficulty] = 0;
    return acc;
  }, {} as DifficultyRatio);
}

const DEFAULT_RATIO: DifficultyRatio = {
  easy: 15,
  easyMedium: 20,
  medium: 25,
  mediumHard: 20,
  hard: 15,
  killer: 5
};

function questionToProblem(question: QuestionRecord): Problem {
  return {
    id: question.id,
    subject: question.subject,
    unit: question.unit,
    concept: question.concept,
    difficulty: question.difficulty,
    question: question.question,
    contentType: question.contentType,
    questionImage: question.questionImage,
    options: question.options,
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    explanationContentType: question.explanationContentType,
    explanationImage: question.explanationImage,
    questionType: question.questionType,
    answerText: question.answerText
  };
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeId() {
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRatio(ratio: DifficultyRatio): DifficultyRatio {
  const safeRatio = emptyDifficultyRatio();
  for (const difficulty of difficulties) {
    safeRatio[difficulty] = Math.max(0, Number(ratio[difficulty]) || 0);
  }
  const sum = difficulties.reduce((acc, difficulty) => acc + safeRatio[difficulty], 0);

  if (sum === 0) {
    return { ...DEFAULT_RATIO };
  }

  const normalized = emptyDifficultyRatio();
  for (const difficulty of difficulties) {
    normalized[difficulty] = (safeRatio[difficulty] / sum) * 100;
  }
  return normalized;
}

function allocateDifficultyCounts(problemCount: number, ratio: DifficultyRatio): DifficultyRatio {
  const normalized = normalizeRatio(ratio);
  const raw = difficulties.map((difficulty) => ({
    difficulty,
    exact: (problemCount * normalized[difficulty]) / 100
  }));

  const counts = emptyDifficultyRatio();
  for (const item of raw) {
    counts[item.difficulty] = Math.floor(item.exact);
  }

  let remainder = problemCount - difficulties.reduce((sum, difficulty) => sum + counts[difficulty], 0);
  const priority = raw
    .map((item) => ({
      difficulty: item.difficulty,
      fraction: item.exact - Math.floor(item.exact)
    }))
    .sort((a, b) => b.fraction - a.fraction);

  for (const item of priority) {
    if (remainder <= 0) break;
    counts[item.difficulty] += 1;
    remainder -= 1;
  }

  return counts;
}

function totalCount(counts: DifficultyRatio) {
  return difficulties.reduce((sum, difficulty) => sum + counts[difficulty], 0);
}

function totalScore(counts: DifficultyRatio) {
  return difficulties.reduce(
    (sum, difficulty) => sum + counts[difficulty] * DIFFICULTY_SCORE[difficulty],
    0
  );
}

function countDeviation(a: DifficultyRatio, b: DifficultyRatio) {
  return difficulties.reduce((sum, difficulty) => sum + Math.abs(a[difficulty] - b[difficulty]), 0);
}

// Ordered-difficulty distance. Replacing killer with hard is cheap; replacing killer with easy is expensive.
function difficultyTransportDistance(actual: DifficultyRatio, target: DifficultyRatio) {
  let carry = 0;
  let distance = 0;
  for (const difficulty of difficulties) {
    carry += actual[difficulty] - target[difficulty];
    distance += Math.abs(carry);
  }
  return distance;
}

function scaleCounts(counts: DifficultyRatio, nextTotal: number): DifficultyRatio {
  const currentTotal = totalCount(counts);
  if (currentTotal <= 0 || nextTotal <= 0) return emptyDifficultyRatio();

  const exact = difficulties.map((difficulty) => ({
    difficulty,
    value: (counts[difficulty] * nextTotal) / currentTotal
  }));
  const scaled = emptyDifficultyRatio();
  for (const item of exact) scaled[item.difficulty] = Math.floor(item.value);

  let remainder = nextTotal - totalCount(scaled);
  exact
    .map((item) => ({
      difficulty: item.difficulty,
      fraction: item.value - Math.floor(item.value)
    }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach((item) => {
      if (remainder <= 0) return;
      scaled[item.difficulty] += 1;
      remainder -= 1;
    });
  return scaled;
}

function availabilityCounts(questions: QuestionRecord[]) {
  const counts = emptyDifficultyRatio();
  for (const question of questions) counts[question.difficulty] += 1;
  return counts;
}

function difficultyCountsForQuestions(questions: QuestionRecord[]) {
  return availabilityCounts(questions);
}

function questionScore(questions: QuestionRecord[]) {
  return questions.reduce((sum, question) => sum + DIFFICULTY_SCORE[question.difficulty], 0);
}

function remainingIdealCounts(
  targetCounts: DifficultyRatio,
  selectedCounts: DifficultyRatio,
  needed: number
) {
  const deficits = emptyDifficultyRatio();
  for (const difficulty of difficulties) {
    deficits[difficulty] = Math.max(0, targetCounts[difficulty] - selectedCounts[difficulty]);
  }

  const deficitTotal = totalCount(deficits);
  if (deficitTotal === needed) return deficits;
  if (deficitTotal === 0) return scaleCounts(targetCounts, needed);
  return scaleCounts(deficits, needed);
}

function chooseDifficultyPlan(
  availability: DifficultyRatio,
  needed: number,
  targetPlanScore: number,
  idealCounts: DifficultyRatio
) {
  const best = {
    counts: emptyDifficultyRatio(),
    scoreDiff: Number.POSITIVE_INFINITY,
    transport: Number.POSITIVE_INFINITY,
    countDiff: Number.POSITIVE_INFINITY
  };
  const current = emptyDifficultyRatio();

  function consider() {
    const scoreDiff = Math.abs(totalScore(current) - targetPlanScore);
    const transport = difficultyTransportDistance(current, idealCounts);
    const diff = countDeviation(current, idealCounts);
    if (
      scoreDiff < best.scoreDiff ||
      (scoreDiff === best.scoreDiff && transport < best.transport) ||
      (scoreDiff === best.scoreDiff && transport === best.transport && diff < best.countDiff)
    ) {
      best.counts = { ...current };
      best.scoreDiff = scoreDiff;
      best.transport = transport;
      best.countDiff = diff;
    }
  }

  function walk(index: number, picked: number) {
    if (index >= difficulties.length) {
      if (picked === needed) consider();
      return;
    }

    const difficulty = difficulties[index];
    const remainingSlots = needed - picked;
    const remainingAvailability = difficulties
      .slice(index + 1)
      .reduce((sum, next) => sum + availability[next], 0);
    const minForThis = Math.max(0, remainingSlots - remainingAvailability);
    const maxForThis = Math.min(availability[difficulty], remainingSlots);

    for (let count = minForThis; count <= maxForThis; count += 1) {
      current[difficulty] = count;
      walk(index + 1, picked + count);
    }
    current[difficulty] = 0;
  }

  if (needed <= 0) return emptyDifficultyRatio();
  if (totalCount(availability) < needed) return { ...availability };
  walk(0, 0);
  return best.counts;
}

function pickQuestionsByPlan(questions: QuestionRecord[], plan: DifficultyRatio) {
  const picked: QuestionRecord[] = [];
  for (const difficulty of difficulties) {
    picked.push(...shuffle(questions.filter((q) => q.difficulty === difficulty)).slice(0, plan[difficulty]));
  }
  return picked;
}

function matchesConfig(question: QuestionRecord, config: ExamGenerationConfig) {
  const subjectOk = config.subjects.length === 0 || config.subjects.includes(question.subject);
  const unitOk = config.units.length === 0 || config.units.includes(question.unit);
  return subjectOk && unitOk;
}

export function generateExamFromQuestionBank(
  questions: QuestionRecord[],
  config: ExamGenerationConfig
): ExamGenerationResult {
  const title = config.title.trim();
  const problemCount = Math.max(1, Math.floor(config.problemCount));
  const timeLimitSec = Math.max(60, Math.floor(config.timeLimitSec));

  if (!title) {
    return { ok: false, message: "시험 제목을 입력해주세요." };
  }

  const matchedQuestions = questions.filter((question) => matchesConfig(question, config));
  if (matchedQuestions.length === 0) {
    return { ok: false, message: "조건에 맞는 문제가 없습니다." };
  }

  // 풀 분리: 이미 다른 admin 모의고사에 들어간 문제는 가능한 한 피한다.
  // - freshPool: 어떤 admin 시험에도 안 들어간 신규 문제 (우선 사용)
  // - reusePool: 이미 다른 시험에 한 번 이상 들어간 문제 (부족 시 fallback)
  // excludeIds가 비어있으면(또는 미전달) 모든 문제가 freshPool로 간주된다.
  const excludeIds = config.excludeIds ?? new Set<string>();
  const freshPool = matchedQuestions.filter((q) => !excludeIds.has(q.id));
  const reusePool = matchedQuestions.filter((q) => excludeIds.has(q.id));

  const targetCounts = allocateDifficultyCounts(problemCount, config.difficultyRatio);
  const targetDifficultyScore = totalScore(targetCounts);
  const selected: QuestionRecord[] = [];
  const selectedIds = new Set<string>();
  const warnings: string[] = [];
  let reuseCount = 0;

  function addQuestions(questionsToAdd: QuestionRecord[], reused = false) {
    for (const question of questionsToAdd) {
      if (selectedIds.has(question.id)) continue;
      selected.push(question);
      selectedIds.add(question.id);
      if (reused) reuseCount += 1;
    }
  }

  // 1) 신규 문제에서 먼저 목표 난이도 점수에 가장 가까운 조합을 찾는다.
  //    특정 난이도가 비면 인접 난이도 대체를 우선하고, 중복은 아직 쓰지 않는다.
  const freshCount = Math.min(problemCount, freshPool.length);
  if (freshCount > 0) {
    const freshTargetCounts =
      freshCount === problemCount ? targetCounts : scaleCounts(targetCounts, freshCount);
    const freshTargetScore =
      freshCount === problemCount
        ? targetDifficultyScore
        : Math.round((targetDifficultyScore * freshCount) / problemCount);
    const freshPlan = chooseDifficultyPlan(
      availabilityCounts(freshPool),
      freshCount,
      freshTargetScore,
      freshTargetCounts
    );
    addQuestions(pickQuestionsByPlan(freshPool, freshPlan));
  }

  // 2) 신규 문제 총량이 부족할 때만 이미 다른 모의고사에 들어간 문제를 마지막 수단으로 쓴다.
  if (selected.length < problemCount) {
    const reuseNeeded = problemCount - selected.length;
    const selectedCounts = difficultyCountsForQuestions(selected);
    const reusePlan = chooseDifficultyPlan(
      availabilityCounts(reusePool),
      reuseNeeded,
      targetDifficultyScore - questionScore(selected),
      remainingIdealCounts(targetCounts, selectedCounts, reuseNeeded)
    );
    addQuestions(pickQuestionsByPlan(reusePool, reusePlan), true);
  }

  if (reuseCount > 0) {
    warnings.push(
      `풀 분리 정책상 신규 문제가 부족해 ${reuseCount}개가 다른 admin 시험과 겹쳐 출제됩니다.`
    );
  }

  const finalQuestions = shuffle(selected).slice(0, problemCount);
  if (finalQuestions.length < problemCount) {
    warnings.push(`요청한 ${problemCount}문항 중 ${finalQuestions.length}문항만 생성했습니다.`);
  }

  const difficultyCounts = emptyDifficultyRatio();
  for (const difficulty of difficulties) {
    difficultyCounts[difficulty] = finalQuestions.filter(
      (question) => question.difficulty === difficulty
    ).length;
  }
  const finalDifficultyScore = totalScore(difficultyCounts);
  const difficultyShift = difficultyTransportDistance(difficultyCounts, targetCounts);
  if (difficultyShift > 0 && finalQuestions.length === problemCount) {
    const scoreMessage =
      finalDifficultyScore === targetDifficultyScore
        ? `목표 난이도 총점 ${targetDifficultyScore}점은 유지했습니다.`
        : `목표 난이도 총점 ${targetDifficultyScore}점에 가장 가까운 ${finalDifficultyScore}점으로 구성했습니다.`;
    warnings.push(`일부 난이도 신규 문제가 부족해 인접 난이도로 대체했습니다. ${scoreMessage}`);
  }

  const selectedSubjects = Array.from(new Set(finalQuestions.map((question) => question.subject)));
  const selectedUnits = Array.from(new Set(finalQuestions.map((question) => question.unit)));

  return {
    ok: true,
    exam: {
      id: makeId(),
      title,
      description: `${selectedSubjects.join(", ")} / ${selectedUnits.join(", ")} 조건으로 생성된 ${config.mode} 모의고사`,
      mode: config.mode,
      timeLimitSec,
      tags: [config.mode, ...selectedSubjects, ...selectedUnits],
      problems: finalQuestions.map(questionToProblem),
      createdAt: new Date().toISOString(),
      sourceQuestionIds: finalQuestions.map((question) => question.id),
      generationSummary: {
        requestedCount: problemCount,
        matchedCount: matchedQuestions.length,
        selectedCount: finalQuestions.length,
        difficultyCounts,
        warnings
      }
    }
  };
}
