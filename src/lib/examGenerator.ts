import type { Difficulty, Problem } from "@/types/exam";
import type { QuestionRecord } from "@/types/question";
import type {
  AdminExamMode,
  DifficultyRatio,
  ExamGenerationConfig,
  ExamGenerationResult,
  GeneratedExam
} from "@/types/generatedExam";

export type { AdminExamMode, DifficultyRatio, ExamGenerationConfig, ExamGenerationResult, GeneratedExam };

const difficulties: Difficulty[] = ["easy", "medium", "hard"];

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
    explanationImage: question.explanationImage
  };
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeId() {
  return `exam-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRatio(ratio: DifficultyRatio): DifficultyRatio {
  const safeRatio = {
    easy: Math.max(0, Number(ratio.easy) || 0),
    medium: Math.max(0, Number(ratio.medium) || 0),
    hard: Math.max(0, Number(ratio.hard) || 0)
  };
  const sum = safeRatio.easy + safeRatio.medium + safeRatio.hard;

  if (sum === 0) {
    return { easy: 30, medium: 50, hard: 20 };
  }

  return {
    easy: (safeRatio.easy / sum) * 100,
    medium: (safeRatio.medium / sum) * 100,
    hard: (safeRatio.hard / sum) * 100
  };
}

function allocateDifficultyCounts(problemCount: number, ratio: DifficultyRatio): DifficultyRatio {
  const normalized = normalizeRatio(ratio);
  const raw = difficulties.map((difficulty) => ({
    difficulty,
    exact: (problemCount * normalized[difficulty]) / 100
  }));

  const counts: DifficultyRatio = {
    easy: Math.floor(raw[0].exact),
    medium: Math.floor(raw[1].exact),
    hard: Math.floor(raw[2].exact)
  };

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

  const targetCounts = allocateDifficultyCounts(problemCount, config.difficultyRatio);
  const selected: QuestionRecord[] = [];
  const selectedIds = new Set<string>();
  const warnings: string[] = [];

  for (const difficulty of difficulties) {
    const pool = shuffle(matchedQuestions.filter((question) => question.difficulty === difficulty));
    const picked = pool.slice(0, targetCounts[difficulty]);
    picked.forEach((question) => {
      selected.push(question);
      selectedIds.add(question.id);
    });

    if (picked.length < targetCounts[difficulty]) {
      warnings.push(
        `${difficulty} 난이도 문제가 부족해 ${targetCounts[difficulty]}개 중 ${picked.length}개만 배정했습니다.`
      );
    }
  }

  if (selected.length < problemCount) {
    const fallback = shuffle(matchedQuestions.filter((question) => !selectedIds.has(question.id)));
    for (const question of fallback) {
      if (selected.length >= problemCount) break;
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  const finalQuestions = shuffle(selected).slice(0, problemCount);
  if (finalQuestions.length < problemCount) {
    warnings.push(`요청한 ${problemCount}문항 중 ${finalQuestions.length}문항만 생성했습니다.`);
  }

  const difficultyCounts: DifficultyRatio = {
    easy: finalQuestions.filter((question) => question.difficulty === "easy").length,
    medium: finalQuestions.filter((question) => question.difficulty === "medium").length,
    hard: finalQuestions.filter((question) => question.difficulty === "hard").length
  };

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
