"use client";

import { ContentRenderer } from "@/components/content/ContentRenderer";
import type { ContentType, Difficulty, ProblemOption, QuestionType } from "@/types/exam";

export type WrongPrintItem = {
  problemId: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  submittedAt: string;
  selectedOptionId: string | null;
  userAnswerText?: string | null;
  subject: string;
  unit: string;
  concept: string;
  difficulty: Difficulty;
  question: string;
  contentType: ContentType | null;
  questionImage: string | null;
  options: ProblemOption[];
  correctOptionId: string;
  explanation: string;
  explanationContentType: ContentType | null;
  explanationImage: string | null;
  questionType?: QuestionType;
  answerText?: string | null;
  wrongCount?: number;
};

const WRONGS_PER_PRINT_PAGE = 2;

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit"
  });
}

function isSubjective(item: WrongPrintItem) {
  return (
    item.questionType === "subjective" ||
    (item.options.length === 0 && (item.answerText ?? "").trim().length > 0)
  );
}

function getAnswerLabels(item: WrongPrintItem) {
  if (isSubjective(item)) {
    return {
      selected: item.userAnswerText?.trim() || "미응답",
      correct: item.answerText?.trim() || item.correctOptionId || "-"
    };
  }

  const selected = item.options.find((option) => option.id === item.selectedOptionId);
  const correct = item.options.find((option) => option.id === item.correctOptionId);
  return {
    selected: selected?.label ?? "미응답",
    correct: correct?.label ?? item.correctOptionId
  };
}

export function WrongQuestionsPrintSheet({ items }: { items: WrongPrintItem[] }) {
  if (items.length === 0) return null;

  const pages = chunk(items, WRONGS_PER_PRINT_PAGE);

  return (
    <section className="student-print-only student-wrong-print-area">
      {pages.map((pageItems, pageIndex) => (
        <div key={`wrong-print-${pageIndex}`} className="student-wrong-print-page">
          <div className="student-wrong-print-header">
            <div>
              <h2>오답 복습지</h2>
              <p>선택한 오답 {items.length}문항 · 정답과 풀이 포함</p>
            </div>
            <div className="student-wrong-print-page-count">
              {pageIndex + 1} / {pages.length}
            </div>
          </div>

          <div className="student-wrong-print-grid">
            {[pageItems.slice(0, 1), pageItems.slice(1, 2)].map((columnItems, columnIndex) => (
              <div
                key={columnIndex}
                className={`student-wrong-print-column ${
                  columnIndex === 0 ? "student-wrong-print-column-left" : "student-wrong-print-column-right"
                }`}
              >
                {columnItems.map((item, index) => {
                  const questionNumber = pageIndex * WRONGS_PER_PRINT_PAGE + columnIndex + index + 1;
                  const labels = getAnswerLabels(item);

                  return (
                    <div key={item.problemId} className="student-wrong-print-card">
                      <div className="student-wrong-print-meta">
                        <span className="student-wrong-print-number">{questionNumber}</span>
                        <span>{item.subject}</span>
                        <span>{item.unit}</span>
                        <span>{item.difficulty}</span>
                        {item.wrongCount && item.wrongCount > 1 ? <span>반복 {item.wrongCount}회</span> : null}
                      </div>

                      <div className="student-wrong-print-question">
                        <ContentRenderer
                          contentType={item.contentType ?? "latex"}
                          text={item.question}
                          image={item.questionImage ?? undefined}
                          imageAlt={`${questionNumber}번 오답 문제`}
                          className="student-wrong-print-content"
                        />
                      </div>

                      {item.options.length > 0 ? (
                        <ol className="student-wrong-print-options">
                          {item.options.map((option) => {
                            const correct = option.id === item.correctOptionId;
                            const selected = option.id === item.selectedOptionId;
                            return (
                              <li
                                key={option.id}
                                className={[
                                  "student-wrong-print-option",
                                  correct ? "is-correct" : "",
                                  selected && !correct ? "is-selected" : ""
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                <span className="student-wrong-print-option-label">{option.label}</span>
                                <ContentRenderer
                                  contentType={option.contentType ?? "latex"}
                                  text={option.text}
                                  image={option.image}
                                  imageAlt={`${questionNumber}번 ${option.label}번 보기`}
                                  className="student-wrong-print-option-content"
                                />
                              </li>
                            );
                          })}
                        </ol>
                      ) : null}

                      <div className="student-wrong-print-answer-row">
                        <span>내 답: {labels.selected}</span>
                        <span>정답: {labels.correct}</span>
                      </div>

                      <div className="student-wrong-print-solution">
                        <div className="student-wrong-print-solution-title">풀이</div>
                        <ContentRenderer
                          contentType={item.explanationContentType ?? "latex"}
                          text={item.explanation}
                          image={item.explanationImage ?? undefined}
                          imageAlt={`${questionNumber}번 풀이`}
                          className="student-wrong-print-solution-content"
                        />
                      </div>

                      <div className="student-wrong-print-source">
                        {formatDate(item.submittedAt)} · {item.examTitle || item.examId}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
