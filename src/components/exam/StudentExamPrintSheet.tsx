"use client";

import { ContentRenderer } from "@/components/content/ContentRenderer";
import type { MockExam, Problem } from "@/types/exam";

const QUESTIONS_PER_PRINT_PAGE = 6;

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

function isSubjective(problem: Problem) {
  return (
    problem.questionType === "subjective" ||
    ((problem.options?.length ?? 0) === 0 && (problem.answerText ?? "").length > 0)
  );
}

export function StudentExamPrintSheet({
  exam,
  className,
}: {
  exam: MockExam;
  className?: string;
}) {
  const pages = chunk(exam.problems, QUESTIONS_PER_PRINT_PAGE);

  return (
    <section className={["student-print-only student-exam-print-area", className].filter(Boolean).join(" ")}>
      {pages.map((pageQuestions, pageIndex) => (
        <div key={`${exam.id}-${pageIndex}`} className="student-exam-print-page">
          <div className="student-exam-print-header">
            <div>
              <h2>{exam.title}</h2>
              <p>{exam.description}</p>
            </div>
            <div className="student-exam-print-page-count">
              {pageIndex + 1} / {pages.length}
            </div>
          </div>

          <div className="student-exam-print-grid">
            {[pageQuestions.slice(0, 3), pageQuestions.slice(3, 6)].map((columnQuestions, columnIndex) => (
              <div
                key={columnIndex}
                className={`student-exam-print-column ${
                  columnIndex === 0 ? "student-exam-print-column-left" : "student-exam-print-column-right"
                }`}
              >
                {columnQuestions.map((problem, index) => {
                  const questionNumber = pageIndex * QUESTIONS_PER_PRINT_PAGE + columnIndex * 3 + index + 1;
                  return (
                    <div key={problem.id} className="student-exam-print-question">
                      <div className="student-exam-print-question-body">
                        <span className="student-exam-print-question-number">{questionNumber}.</span>
                        <ContentRenderer
                          contentType={problem.contentType}
                          text={problem.question}
                          image={problem.questionImage}
                          imageAlt={`${questionNumber}번 문제`}
                          className="student-exam-print-content"
                        />
                      </div>

                      {isSubjective(problem) ? (
                        <div className="student-exam-print-answer-line">답:</div>
                      ) : (
                        <ol className="student-exam-print-options">
                          {problem.options.map((option) => (
                            <li key={option.id} className="student-exam-print-option">
                              <span className="student-exam-print-option-label">{option.label}</span>
                              <ContentRenderer
                                contentType={option.contentType}
                                text={option.text}
                                image={option.image}
                                imageAlt={`${questionNumber}번 ${option.label}번 보기`}
                                className="student-exam-print-option-content"
                              />
                            </li>
                          ))}
                        </ol>
                      )}
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
