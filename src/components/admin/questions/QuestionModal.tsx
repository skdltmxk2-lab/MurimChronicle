"use client";

import { useEffect, useMemo, useState } from "react";
import type { ContentType, Difficulty, ProblemOption } from "@/types/exam";
import type { QuestionDraft, QuestionPool, QuestionRecord, QuestionSourceType } from "@/types/question";
import { POOL_LABELS } from "@/types/question";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { readFileAsDataUrl } from "@/lib/files/readFileAsDataUrl";
import {
  DIFFICULTY_KEYS,
  DIFFICULTY_LABELS,
  SUBJECT_NAMES,
  unitsForSubject
} from "@/lib/taxonomy";

type QuestionModalProps = {
  mode: "create" | "edit";
  question: QuestionRecord | null;
  onClose: () => void;
  onSave: (draft: QuestionDraft) => void;
};

const emptyOptions: ProblemOption[] = [
  { id: "1", label: "1", text: "", contentType: "latex" },
  { id: "2", label: "2", text: "", contentType: "latex" },
  { id: "3", label: "3", text: "", contentType: "latex" },
  { id: "4", label: "4", text: "", contentType: "latex" }
];

function makeEmptyDraft(): QuestionDraft {
  return {
    subject: SUBJECT_NAMES[0],
    unit: "",
    concept: "",
    difficulty: "medium",
    sourceType: "manual",
    pool: "general",
    question: "",
    contentType: "latex",
    questionImage: "",
    options: emptyOptions,
    correctOptionId: "1",
    explanation: "",
    explanationContentType: "latex",
    explanationImage: "",
    tags: []
  };
}

function recordToDraft(question: QuestionRecord): QuestionDraft {
  return {
    subject: question.subject,
    unit: question.unit,
    concept: question.concept,
    difficulty: question.difficulty,
    sourceType: question.sourceType,
    pool: question.pool ?? "general",
    question: question.question,
    contentType: question.contentType ?? "latex",
    questionImage: question.questionImage ?? "",
    options: question.options,
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    explanationContentType: question.explanationContentType ?? "latex",
    explanationImage: question.explanationImage ?? "",
    tags: question.tags
  };
}

export function QuestionModal({ mode, question, onClose, onSave }: QuestionModalProps) {
  const [draft, setDraft] = useState<QuestionDraft>(() =>
    question ? recordToDraft(question) : makeEmptyDraft()
  );
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");

  const unitOptions = useMemo(() => unitsForSubject(draft.subject), [draft.subject]);

  useEffect(() => {
    setDraft(question ? recordToDraft(question) : makeEmptyDraft());
    setTagInput("");
    setError("");
  }, [question, mode]);

  function updateOption(index: number, text: string) {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, text } : option
      )
    }));
  }

  function updateOptionContentType(index: number, contentType: ContentType) {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, contentType } : option
      )
    }));
  }

  async function updateImage(file: File | undefined, onDone: (dataUrl: string) => void) {
    if (!file) return;
    onDone(await readFileAsDataUrl(file));
  }

  function removeQuestionImage() {
    setDraft((current) => ({ ...current, questionImage: "", contentType: "latex" }));
  }

  function removeExplanationImage() {
    setDraft((current) => ({
      ...current,
      explanationImage: "",
      explanationContentType: "latex"
    }));
  }

  function addOption() {
    const nextId = String(draft.options.length + 1);
    setDraft((current) => ({
      ...current,
      options: [
        ...current.options,
        { id: nextId, label: nextId, text: "", contentType: "latex" }
      ]
    }));
  }

  function removeLastOption() {
    if (draft.options.length <= 2) return;
    const lastId = String(draft.options.length);
    setDraft((current) => ({
      ...current,
      options: current.options.slice(0, -1),
      correctOptionId: current.correctOptionId === lastId ? "1" : current.correctOptionId
    }));
  }

  function removeOptionImage(index: number) {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, image: "", contentType: "latex" } : option
      )
    }));
  }

  function addTag() {
    const nextTag = tagInput.trim();
    if (!nextTag) return;
    setDraft((current) => ({
      ...current,
      tags: Array.from(new Set([...current.tags, nextTag]))
    }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setDraft((current) => ({
      ...current,
      tags: current.tags.filter((item) => item !== tag)
    }));
  }

  function submit() {
    const hasQuestion = Boolean(draft.question.trim() || draft.questionImage);
    const hasExplanation = Boolean(draft.explanation.trim() || draft.explanationImage);
    if (!draft.subject.trim() || !draft.unit.trim() || !hasQuestion) {
      setError("과목, 단원, 문제 내용 또는 문제 이미지는 필수입니다.");
      return;
    }
    if (draft.options.some((option) => !option.text.trim() && !option.image)) {
      setError("보기 4개는 텍스트 또는 이미지를 모두 입력해야 합니다.");
      return;
    }
    if (!hasExplanation) {
      setError("해설 텍스트 또는 해설 이미지를 입력해야 합니다.");
      return;
    }
    setError("");
    onSave({
      ...draft,
      subject: draft.subject.trim(),
      unit: draft.unit.trim(),
      concept: draft.concept.trim(),
      question: draft.question.trim(),
      contentType: draft.contentType ?? (draft.questionImage ? "image" : "latex"),
      questionImage: draft.questionImage,
      options: draft.options.map((option) => ({
        ...option,
        text: option.text.trim(),
        contentType: option.contentType ?? (option.image ? "image" : "latex")
      })),
      explanation: draft.explanation.trim(),
      explanationContentType:
        draft.explanationContentType ?? (draft.explanationImage ? "image" : "latex"),
      explanationImage: draft.explanationImage
    });
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 py-6">
      <div className="mx-auto max-w-5xl rounded-lg bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-ink">
              {mode === "create" ? "문제 추가" : "문제 수정"}
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              수식은 $...$ 형식으로 입력하거나 이미지를 올릴 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="block">
                <span className="text-xs font-black text-slate-600">과목</span>
                <select
                  value={draft.subject}
                  onChange={(event) =>
                    setDraft({ ...draft, subject: event.target.value, unit: "" })
                  }
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  {SUBJECT_NAMES.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-600">단원</span>
                <select
                  value={draft.unit}
                  onChange={(event) => setDraft({ ...draft, unit: event.target.value })}
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  <option value="">선택</option>
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-600">난이도</span>
                <select
                  value={draft.difficulty}
                  onChange={(event) =>
                    setDraft({ ...draft, difficulty: event.target.value as Difficulty })
                  }
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  {DIFFICULTY_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {DIFFICULTY_LABELS[key]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-600">sourceType</span>
                <select
                  value={draft.sourceType}
                  onChange={(event) =>
                    setDraft({ ...draft, sourceType: event.target.value as QuestionSourceType })
                  }
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  <option value="mock">mock</option>
                  <option value="manual">manual</option>
                  <option value="imported">imported</option>
                  <option value="ai">ai</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-600">문제 풀</span>
                <select
                  value={draft.pool ?? "general"}
                  onChange={(event) =>
                    setDraft({ ...draft, pool: event.target.value as QuestionPool })
                  }
                  className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                >
                  <option value="general">{POOL_LABELS.general}</option>
                  <option value="daily">{POOL_LABELS.daily}</option>
                  <option value="self_mock">{POOL_LABELS.self_mock}</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-black text-slate-600">개념</span>
              <input
                value={draft.concept}
                onChange={(event) => setDraft({ ...draft, concept: event.target.value })}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
              />
            </label>

            <label className="block">
              <span className="text-xs font-black text-slate-600">문제 입력 방식</span>
              <select
                value={draft.contentType ?? "latex"}
                onChange={(event) =>
                  setDraft({ ...draft, contentType: event.target.value as ContentType })
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
              >
                <option value="latex">텍스트/수식</option>
                <option value="image">이미지</option>
                <option value="mixed">혼합</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black text-slate-600">문제 텍스트</span>
              <textarea
                value={draft.question}
                onChange={(event) => setDraft({ ...draft, question: event.target.value })}
                rows={4}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-brand-600"
              />
            </label>

            <div className="rounded-md border border-line p-3">
              <div className="text-xs font-black text-slate-600">문제 이미지</div>
              <input
                className="mt-2 block w-full text-sm"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  updateImage(event.target.files?.[0], (dataUrl) =>
                    setDraft((current) => ({
                      ...current,
                      questionImage: dataUrl,
                      contentType: current.question.trim() ? "mixed" : "image"
                    }))
                  )
                }
              />
              {draft.questionImage ? (
                <button
                  type="button"
                  onClick={removeQuestionImage}
                  className="mt-2 rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  문제 이미지 제거
                </button>
              ) : null}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-black text-slate-600">보기</span>
                <button
                  type="button"
                  onClick={addOption}
                  className="rounded px-2 py-0.5 text-xs font-black text-brand-600 hover:bg-brand-50"
                >
                  + 추가
                </button>
                {draft.options.length > 4 && (
                  <button
                    type="button"
                    onClick={removeLastOption}
                    className="rounded px-2 py-0.5 text-xs font-black text-coral-600 hover:bg-coral-50"
                  >
                    − 제거
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {draft.options.map((option, index) => (
                  <div key={option.id} className="grid gap-2 rounded-md border border-line p-2 lg:grid-cols-[40px_120px_1fr_130px]">
                    <label className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-slate-50 text-sm font-black text-slate-600">
                      {option.label}
                    </label>
                    <select
                      value={option.contentType ?? "latex"}
                      onChange={(event) =>
                        updateOptionContentType(index, event.target.value as ContentType)
                      }
                      className="rounded-md border border-line px-2 py-2 text-sm outline-none focus:border-brand-600"
                    >
                      <option value="latex">텍스트</option>
                      <option value="image">이미지</option>
                      <option value="mixed">혼합</option>
                    </select>
                    <input
                      value={option.text}
                      onChange={(event) => updateOption(index, event.target.value)}
                      className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                    />
                    <label className="flex shrink-0 items-center gap-2 rounded-md border border-line px-3 text-xs font-black text-slate-600">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={draft.correctOptionId === option.id}
                        onChange={() => setDraft({ ...draft, correctOptionId: option.id })}
                      />
                      정답
                    </label>
                    <div className="lg:col-span-4 lg:ml-12">
                      <input
                        className="block w-full text-sm"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          updateImage(event.target.files?.[0], (dataUrl) =>
                            setDraft((current) => ({
                              ...current,
                              options: current.options.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      image: dataUrl,
                                      contentType: item.text.trim() ? "mixed" : "image"
                                    }
                                  : item
                              )
                            }))
                          )
                        }
                      />
                      {option.image ? (
                        <button
                          type="button"
                          onClick={() => removeOptionImage(index)}
                          className="mt-2 rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50"
                        >
                          보기 이미지 제거
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-black text-slate-600">해설 입력 방식</span>
              <select
                value={draft.explanationContentType ?? "latex"}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    explanationContentType: event.target.value as ContentType
                  })
                }
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
              >
                <option value="latex">텍스트/수식</option>
                <option value="image">이미지</option>
                <option value="mixed">혼합</option>
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-black text-slate-600">해설 텍스트</span>
              <textarea
                value={draft.explanation}
                onChange={(event) => setDraft({ ...draft, explanation: event.target.value })}
                rows={4}
                className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm leading-6 outline-none focus:border-brand-600"
              />
            </label>

            <div className="rounded-md border border-line p-3">
              <div className="text-xs font-black text-slate-600">해설 이미지</div>
              <input
                className="mt-2 block w-full text-sm"
                type="file"
                accept="image/*"
                onChange={(event) =>
                  updateImage(event.target.files?.[0], (dataUrl) =>
                    setDraft((current) => ({
                      ...current,
                      explanationImage: dataUrl,
                      explanationContentType: current.explanation.trim() ? "mixed" : "image"
                    }))
                  )
                }
              />
              {draft.explanationImage ? (
                <button
                  type="button"
                  onClick={removeExplanationImage}
                  className="mt-2 rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  해설 이미지 제거
                </button>
              ) : null}
            </div>

            <div>
              <div className="text-xs font-black text-slate-600">태그</div>
              <div className="mt-1 flex gap-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand-600"
                  placeholder="예: 극한, 오답빈출"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-md bg-ink px-4 py-2 text-sm font-black text-white hover:bg-slate-700"
                >
                  추가
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700 hover:bg-brand-100"
                  >
                    {tag} x
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="rounded-md bg-coral-50 px-4 py-3 text-sm font-bold text-coral-600">
                {error}
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-lg border border-line bg-slate-50 p-4">
            <div className="text-sm font-black text-ink">미리보기</div>
            <div className="mt-4 rounded-md border border-line bg-white p-4">
              <div className="text-sm font-bold leading-7 text-ink">
                <ContentRenderer
                  contentType={draft.contentType}
                  text={draft.question || "문제 내용"}
                  image={draft.questionImage}
                />
              </div>
              <div className="mt-3 space-y-2">
                {draft.options.map((option) => (
                  <div
                    key={option.id}
                    className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    <ContentRenderer
                      contentType={option.contentType}
                      text={`${option.label}. ${option.text || "보기"}`}
                      image={option.image}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-md bg-brand-50 p-3 text-sm font-semibold leading-6 text-ink">
                <ContentRenderer
                  contentType={draft.explanationContentType}
                  text={draft.explanation || "해설"}
                  image={draft.explanationImage}
                />
              </div>
            </div>
          </aside>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-black text-white hover:bg-brand-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
