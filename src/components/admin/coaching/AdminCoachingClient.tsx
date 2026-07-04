"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type FocusEvent, type KeyboardEvent } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { KaTeXRenderer } from "@/components/math/KaTeXRenderer";
import {
  blobToBase64,
  dataUrlToBlob,
  normalizeImageBlob,
  renderPdfPage,
  type NormalizedImage,
} from "@/lib/admin/coachingImage";
import {
  DIFFICULTY_KEYS,
  DIFFICULTY_LABELS,
  SUBJECT_NAMES,
  SUBJECT_UNITS,
} from "@/lib/taxonomy";
import type { Difficulty } from "@/types/exam";
import type { QuestionDraft, QuestionPool, QuestionRecord } from "@/types/question";
import type {
  CoachingExtractedProblem,
  CoachingRelatedGroup,
} from "@/types/coaching";

const MAX_UPLOAD_PAGES = 8;
const QUESTIONS_PER_PRINT_PAGE = 6;

type Tab = "related" | "unit" | "twin";
type PrintMode = "questions" | "answers";
type PoolFilter = "all" | QuestionPool;

type UploadPage = {
  id: string;
  name: string;
  sourceLabel: string;
  blob: Blob;
  url: string;
  mediaType: "image/png" | "image/jpeg" | "image/webp";
  width: number;
  height: number;
};

type PrintSheet = {
  title: string;
  subtitle: string;
  questions: QuestionRecord[];
  sourceLabel?: string;
};

type UnitMockSection = {
  id: string;
  subject: string;
  unit: string;
  count: OptionalNumber;
};

type UnitMockRequestSection = {
  subject: string;
  unit: string;
  count: number;
};

type UnitMockBreakdown = {
  subject: string;
  unit: string;
  requestedCount: number;
  available: number;
  candidateCount: number;
  selectedCount: number;
};

type TwinResult = {
  draft: QuestionDraft;
  question?: QuestionRecord;
  embedded?: boolean;
};

type OptionalNumber = number | "";

function hasExtension(file: File, extensions: string[]): boolean {
  const name = file.name.toLowerCase();
  return extensions.some((extension) => name.endsWith(extension));
}

function isSupportedClipboardFile(file: File): boolean {
  return (
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    hasExtension(file, [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff", ".pdf"])
  );
}

function mediaTypeOf(blob: Blob): UploadPage["mediaType"] {
  return blob.type === "image/jpeg" || blob.type === "image/webp" ? blob.type : "image/png";
}

function pageFromImage(image: NormalizedImage, name: string, sourceLabel: string): UploadPage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    sourceLabel,
    blob: image.blob,
    url: URL.createObjectURL(image.blob),
    mediaType: mediaTypeOf(image.blob),
    width: image.width,
    height: image.height,
  };
}

function releasePages(pages: UploadPage[]) {
  pages.forEach((page) => URL.revokeObjectURL(page.url));
}

function draftToRecord(draft: QuestionDraft, id = "twin-preview"): QuestionRecord {
  const now = new Date().toISOString();
  return {
    ...draft,
    id,
    createdAt: now,
    updatedAt: now,
  };
}

function answerLabel(question: QuestionRecord): string {
  if (question.questionType === "subjective") return question.answerText || "";
  const option = question.options.find((item) => item.id === question.correctOptionId);
  return option ? option.label : question.correctOptionId;
}

function stripLeadingQuestionNumber(value: string): string {
  return value.replace(/^\s*(?:\d+|[①-⑳])[\).\s]+/, "").trimStart();
}

function normalizePrintableText(value: string): string {
  return value
    .replace(/[\\₩wW]?\s*<\s*보기\s*[\\₩wW]?\s*>/g, "<보기>")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type ViewBlockItem = {
  label: string;
  displayLabel: string;
  text: string;
};

type ParsedViewBlock = {
  prompt: string;
  items: ViewBlockItem[];
  tail: string;
};

function parseViewBlock(value: string): ParsedViewBlock | null {
  const text = normalizePrintableText(value);
  const markerPattern = /(?:\(([ㄱㄴㄷㄹㅁ가나다라마a-eA-E])\)|\b([a-eA-E])\.|(^|[\s\n])([가나다라마ㄱㄴㄷㄹㅁ])\.)\s*/gm;
  const markers = [...text.matchAll(markerPattern)];
  if (markers.length < 2) return null;

  const labels = markers.map((marker) => marker[1] ?? marker[2] ?? marker[4] ?? "");
  const koreanLetterLabels = ["가", "나", "다", "라", "마", "ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ"];
  const latinLabels = ["a", "b", "c", "d", "e"];
  const hasOrderedPair = labels.some((label, index) => {
    if (index === 0) return false;
    const prev = labels[index - 1].toLowerCase();
    const current = label.toLowerCase();
    return (
      koreanLetterLabels.indexOf(prev) >= 0 &&
      koreanLetterLabels.indexOf(current) === koreanLetterLabels.indexOf(prev) + 1
    ) || (
      latinLabels.indexOf(prev) >= 0 &&
      latinLabels.indexOf(current) === latinLabels.indexOf(prev) + 1
    );
  });
  if (!hasOrderedPair) return null;

  const firstIndex = markers[0].index ?? 0;
  const prompt = text.slice(0, firstIndex).trim();
  const items = markers.map((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length;
    const end = index + 1 < markers.length ? markers[index + 1].index ?? text.length : text.length;
    const label = marker[1] ?? marker[2] ?? marker[4] ?? "";
    return {
      label,
      displayLabel: marker[1] ? `(${label})` : `${label}.`,
      text: text.slice(start, end).trim(),
    };
  }).filter((item) => item.text.length > 0);

  if (items.length < 2) return null;
  return { prompt, items, tail: "" };
}

function parseOptionalNumberInput(value: string): OptionalNumber {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : "";
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function selectNumberInput(event: FocusEvent<HTMLInputElement>) {
  event.currentTarget.select();
}

function unitsForUnitMockSubject(subject: string): readonly string[] {
  return SUBJECT_UNITS[subject as keyof typeof SUBJECT_UNITS] ?? [];
}

function createUnitMockSection(subject: string = SUBJECT_NAMES[0], count: OptionalNumber = 6): UnitMockSection {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subject,
    unit: unitsForUnitMockSubject(subject)[0] ?? "",
    count,
  };
}

function hasEditablePasteTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function clipboardHasSupportedInput(clipboard: DataTransfer): boolean {
  if (Array.from(clipboard.files).some(isSupportedClipboardFile)) return true;
  if (Array.from(clipboard.items).some((item) => item.kind === "file")) return true;
  return /<img[^>]+src=["'][^"']+["']/i.test(clipboard.getData("text/html"));
}

async function clipboardFileFromData(clipboard: DataTransfer): Promise<File | null> {
  const pastedFile = Array.from(clipboard.files).find(isSupportedClipboardFile);
  if (pastedFile) return pastedFile;

  for (const item of Array.from(clipboard.items)) {
    if (item.kind !== "file") continue;
    const file = item.getAsFile();
    if (file && isSupportedClipboardFile(file)) return file;
  }

  const html = clipboard.getData("text/html");
  const src = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  if (!src) return null;

  const blob = await dataUrlToBlob(src);
  return new File([blob], "clipboard-image", { type: blob.type || "image/png" });
}

function chunk<T>(values: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += size) chunks.push(values.slice(i, i + size));
  return chunks;
}

async function ensureOk<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as ({ ok?: boolean; message?: string } & T) | null;
  if (!res.ok || json?.ok === false || !json) {
    throw new Error(json?.message ?? `HTTP ${res.status}`);
  }
  return json as T;
}

export function AdminCoachingClient() {
  const relatedFileRef = useRef<HTMLInputElement>(null);
  const twinFileRef = useRef<HTMLInputElement>(null);
  const pagesRef = useRef<UploadPage[]>([]);
  const twinImageRef = useRef<UploadPage | null>(null);
  const tabRef = useRef<Tab>("related");

  const [tab, setTab] = useState<Tab>("related");
  const [pages, setPages] = useState<UploadPage[]>([]);
  const [uploadDragActive, setUploadDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [relatedMsg, setRelatedMsg] = useState("");
  const [extracted, setExtracted] = useState<CoachingExtractedProblem[]>([]);
  const [expectedProblemCount, setExpectedProblemCount] = useState<OptionalNumber>("");
  const [perProblem, setPerProblem] = useState<OptionalNumber>(2);
  const [relatedGroups, setRelatedGroups] = useState<CoachingRelatedGroup[]>([]);
  const [replacingRelatedKey, setReplacingRelatedKey] = useState("");

  const [unitSections, setUnitSections] = useState<UnitMockSection[]>(() => [
    createUnitMockSection(SUBJECT_NAMES[0], 12),
  ]);
  const [unitDifficulty, setUnitDifficulty] = useState<"all" | Difficulty>("all");
  const [unitPool, setUnitPool] = useState<PoolFilter>("all");
  const [unitLoading, setUnitLoading] = useState(false);
  const [unitMsg, setUnitMsg] = useState("");
  const [replacingUnitQuestionId, setReplacingUnitQuestionId] = useState("");

  const [twinImage, setTwinImage] = useState<UploadPage | null>(null);
  const [twinSourceText, setTwinSourceText] = useState("");
  const [twinInstruction, setTwinInstruction] = useState("");
  const [twinSave, setTwinSave] = useState(false);
  const [twinLoading, setTwinLoading] = useState(false);
  const [twinMsg, setTwinMsg] = useState("");
  const [twinResult, setTwinResult] = useState<TwinResult | null>(null);

  const [sheet, setSheet] = useState<PrintSheet | null>(null);
  const [printMode, setPrintMode] = useState<PrintMode>("questions");
  const [questionPageHeaders, setQuestionPageHeaders] = useState<string[]>([]);

  const unitTotalCount = useMemo(
    () =>
      unitSections.reduce(
        (total, section) =>
          total + (typeof section.count === "number" && Number.isFinite(section.count) ? section.count : 0),
        0
      ),
    [unitSections]
  );
  const unitHasBlankCount = unitSections.some((section) => section.count === "");
  const relatedSelected = useMemo(
    () => relatedGroups.flatMap((group) => group.matches.map((match) => match.question)),
    [relatedGroups]
  );
  const questionPageCount = sheet ? Math.ceil(sheet.questions.length / QUESTIONS_PER_PRINT_PAGE) : 0;
  const sheetSignature = useMemo(
    () =>
      sheet
        ? [
            sheet.sourceLabel ?? "",
            sheet.title,
            sheet.subtitle,
            sheet.questions.map((question) => question.id).join("|"),
          ].join("::")
        : "",
    [sheet]
  );

  useEffect(() => {
    setQuestionPageHeaders(Array.from({ length: questionPageCount }, () => ""));
  }, [questionPageCount, sheetSignature]);

  function currentPerProblem(): number | null {
    return typeof perProblem === "number" && Number.isFinite(perProblem)
      ? clampInteger(perProblem, 1, 6)
      : null;
  }

  function unitSheetFromQuestions(questions: QuestionRecord[], sections: UnitMockRequestSection[]): PrintSheet {
    const allocation = sections
      .map((section) => `${section.subject} ${section.unit} ${section.count}문항`)
      .join(" · ");
    return {
      title: sections.length === 1 ? `${sections[0].unit} 단원 모의고사` : "복합 단원 모의고사",
      subtitle: `${allocation} · ${unitDifficulty === "all" ? "전체 난이도" : DIFFICULTY_LABELS[unitDifficulty]}`,
      questions,
      sourceLabel: "unit-mock",
    };
  }

  function updateUnitSectionCount(sectionId: string, value: OptionalNumber) {
    setUnitSections((current) =>
      current.map((section) => (section.id === sectionId ? { ...section, count: value } : section))
    );
  }

  function clampUnitSectionCount(sectionId: string) {
    setUnitSections((current) =>
      current.map((section) =>
        section.id === sectionId && typeof section.count === "number"
          ? { ...section, count: clampInteger(section.count, 1, 60) }
          : section
      )
    );
  }

  function updateUnitSectionSubject(sectionId: string, subject: string) {
    setUnitSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              subject,
              unit: unitsForUnitMockSubject(subject)[0] ?? "",
            }
          : section
      )
    );
  }

  function updateUnitSectionUnit(sectionId: string, unitName: string) {
    setUnitSections((current) =>
      current.map((section) => (section.id === sectionId ? { ...section, unit: unitName } : section))
    );
  }

  function addUnitSection() {
    setUnitSections((current) => {
      const subject = current.at(-1)?.subject ?? SUBJECT_NAMES[0];
      return [...current, createUnitMockSection(subject, 6)];
    });
  }

  function removeUnitSection(sectionId: string) {
    setUnitSections((current) =>
      current.length <= 1
        ? [createUnitMockSection(SUBJECT_NAMES[0], 12)]
        : current.filter((section) => section.id !== sectionId)
    );
  }

  function resolveUnitSections(): UnitMockRequestSection[] | null {
    if (unitSections.length === 0) {
      setUnitMsg("단원 구성을 1개 이상 추가해 주세요.");
      return null;
    }

    const resolved: UnitMockRequestSection[] = [];
    for (const section of unitSections) {
      const subject = section.subject.trim();
      const unitName = section.unit.trim();
      const availableUnits = unitsForUnitMockSubject(subject);
      if (!availableUnits.includes(unitName)) {
        setUnitMsg("각 행의 과목과 단원을 확인해 주세요.");
        return null;
      }
      if (typeof section.count !== "number" || !Number.isFinite(section.count)) {
        setUnitMsg("각 단원별 문항 수를 입력해 주세요.");
        return null;
      }
      resolved.push({
        subject,
        unit: unitName,
        count: clampInteger(section.count, 1, 60),
      });
    }

    const total = resolved.reduce((sum, section) => sum + section.count, 0);
    if (total > 60) {
      setUnitMsg("복합 모고 총 문항 수는 60문항 이하로 설정해 주세요.");
      return null;
    }

    setUnitSections((current) =>
      current.map((section, index) => ({
        ...section,
        count: resolved[index]?.count ?? section.count,
      }))
    );
    return resolved;
  }

  function relatedSheetFromGroups(groups: CoachingRelatedGroup[]): PrintSheet | null {
    const questions = groups.flatMap((group) => group.matches.map((match) => match.question));
    if (questions.length === 0) return null;
    const resolvedPerProblem =
      currentPerProblem() ??
      groups.reduce((max, group) => Math.max(max, group.matches.length), 1);
    return {
      title: "관련문제 데일리 테스트",
      subtitle: `업로드 ${extracted.length}문제 · 문제당 ${resolvedPerProblem}개`,
      questions,
      sourceLabel: "vector-related",
    };
  }

  function updateRelatedSheet(groups: CoachingRelatedGroup[]) {
    const nextSheet = relatedSheetFromGroups(groups);
    if (nextSheet) setSheet(nextSheet);
  }

  useEffect(() => {
    if (relatedGroups.length === 0) return;
    setSheet((current) => {
      if (current?.sourceLabel !== "vector-related") return current;
      return relatedSheetFromGroups(relatedGroups) ?? current;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedGroups]);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => {
    twinImageRef.current = twinImage;
  }, [twinImage]);

  useEffect(() => {
    return () => {
      releasePages(pagesRef.current);
      if (twinImageRef.current) URL.revokeObjectURL(twinImageRef.current.url);
    };
  }, []);

  useEffect(() => {
    function handleWindowPaste(event: globalThis.ClipboardEvent) {
      const clipboard = event.clipboardData;
      if (!clipboard || !clipboardHasSupportedInput(clipboard)) return;
      if (hasEditablePasteTarget(event.target) && clipboard.files.length === 0) return;

      event.preventDefault();
      void loadClipboardData(clipboard);
    }

    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearRelatedOutputs(message = "") {
    setExtracted([]);
    setRelatedGroups([]);
    setRelatedMsg(message);
    setSheet((current) => (current?.sourceLabel === "vector-related" ? null : current));
  }

  function appendPages(next: UploadPage[], message = "") {
    if (next.length === 0) {
      if (message) setRelatedMsg(message);
      return;
    }

    setPages((prev) => [...prev, ...next]);
    clearRelatedOutputs(message);
  }

  function removePage(pageId: string) {
    const target = pagesRef.current.find((page) => page.id === pageId);
    if (!target) return;

    URL.revokeObjectURL(target.url);
    setPages((prev) => prev.filter((page) => page.id !== pageId));
    clearRelatedOutputs(
      pagesRef.current.length > 1
        ? "업로드 페이지를 삭제했습니다. 문제 인식을 다시 실행해 주세요."
        : ""
    );
    if (relatedFileRef.current) relatedFileRef.current.value = "";
  }

  function clearPages() {
    if (pagesRef.current.length === 0) return;

    releasePages(pagesRef.current);
    setPages([]);
    clearRelatedOutputs();
    if (relatedFileRef.current) relatedFileRef.current.value = "";
  }

  async function buildPagesFromFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    setRelatedMsg("");
    const next: UploadPage[] = [];
    try {
      const currentCount = pagesRef.current.length;
      const capacity = MAX_UPLOAD_PAGES - currentCount;
      if (capacity <= 0) {
        setRelatedMsg(`이미 최대 ${MAX_UPLOAD_PAGES}페이지가 준비되어 있습니다. 필요 없는 페이지를 삭제한 뒤 추가해 주세요.`);
        return;
      }

      for (const file of list) {
        if (next.length >= capacity) break;
        if (hasExtension(file, [".hwp", ".hwpx"])) {
          throw new Error("HWP/HWPX는 PDF 또는 이미지로 변환해서 올려 주세요.");
        }

        const isPdf = file.type === "application/pdf" || hasExtension(file, [".pdf"]);
        if (isPdf) {
          const first = await renderPdfPage(file, 1);
          const pageCount = Math.min(first.pageCount, capacity - next.length);
          next.push(pageFromImage(first, file.name, `${file.name} · ${first.pageNumber}p`));
          for (let pageNumber = 2; pageNumber <= pageCount; pageNumber++) {
            const page = await renderPdfPage(file, pageNumber);
            next.push(pageFromImage(page, file.name, `${file.name} · ${page.pageNumber}p`));
          }
          continue;
        }

        if (!file.type.startsWith("image/")) {
          throw new Error("PDF 또는 이미지 파일만 올릴 수 있습니다.");
        }
        const image = await normalizeImageBlob(file);
        next.push(pageFromImage(image, file.name || "image", file.name || "image"));
      }
      const reachedLimit = currentCount + next.length >= MAX_UPLOAD_PAGES;
      appendPages(
        next,
        reachedLimit
          ? `최대 ${MAX_UPLOAD_PAGES}페이지까지만 준비됩니다.`
          : currentCount > 0
            ? "업로드 페이지를 추가했습니다. 문제 인식을 다시 실행해 주세요."
            : ""
      );
    } catch (error) {
      releasePages(next);
      setRelatedMsg(error instanceof Error ? error.message : "파일을 읽지 못했습니다.");
    } finally {
      setUploading(false);
      if (relatedFileRef.current) relatedFileRef.current.value = "";
    }
  }

  async function loadClipboardFile(file: File) {
    if (tabRef.current === "twin") {
      await loadTwinFile(file);
      return;
    }

    setTab("related");
    await buildPagesFromFiles([file]);
  }

  async function loadClipboardData(clipboard: DataTransfer) {
    try {
      const file = await clipboardFileFromData(clipboard);
      if (!file) return;
      await loadClipboardFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "클립보드 이미지를 읽지 못했습니다.";
      if (tabRef.current === "twin") setTwinMsg(message);
      else setRelatedMsg(message);
    }
  }

  function handleUploadDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setUploadDragActive(false);
    const files = Array.from(event.dataTransfer.files).filter(isSupportedClipboardFile);
    if (files.length > 0) void buildPagesFromFiles(files);
  }

  function handleUploadKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    relatedFileRef.current?.click();
  }

  async function extractProblems() {
    if (pages.length === 0 || extracting) return;
    setExtracting(true);
    setRelatedMsg("");
    setRelatedGroups([]);
    const expectedCount =
      typeof expectedProblemCount === "number"
        ? clampInteger(expectedProblemCount, 1, 200)
        : undefined;
    try {
      const images = await Promise.all(
        pages.map(async (page) => ({
          id: page.id,
          imageBase64: await blobToBase64(page.blob),
          mediaType: page.mediaType,
          sourceLabel: page.sourceLabel,
        }))
      );
      const json = await ensureOk<{ problems: CoachingExtractedProblem[]; count: number }>(
        await adminFetch("/api/admin/coaching/extract", {
          method: "POST",
          body: JSON.stringify({
            images,
            expectedProblemCount: expectedCount,
          }),
        })
      );
      setExtracted(json.problems ?? []);
      const recognizedCount = json.count ?? json.problems?.length ?? 0;
      setRelatedMsg(
        typeof expectedCount === "number" && recognizedCount !== expectedCount
          ? `인식된 문제: ${recognizedCount}개 · 입력한 총 ${expectedCount}개와 다릅니다.`
          : `인식된 문제: ${recognizedCount}개`
      );
    } catch (error) {
      setRelatedMsg(error instanceof Error ? error.message : "문제 인식에 실패했습니다.");
    } finally {
      setExtracting(false);
    }
  }

  async function findRelated(excludeCurrent = false) {
    if (extracted.length === 0 || matching) return;
    const resolvedPerProblem = currentPerProblem();
    if (!resolvedPerProblem) {
      setRelatedMsg("원문 1문제당 관련문제 수를 입력해 주세요.");
      return;
    }
    setPerProblem(resolvedPerProblem);
    setMatching(true);
    setRelatedMsg("");
    const excludeIds = excludeCurrent ? relatedSelected.map((question) => question.id) : [];
    if (!excludeCurrent) setRelatedGroups([]);
    try {
      const json = await ensureOk<{
        groups: CoachingRelatedGroup[];
        selectedCount: number;
        skippedCount: number;
      }>(
        await adminFetch("/api/admin/coaching/related", {
          method: "POST",
          body: JSON.stringify({ problems: extracted, perProblem: resolvedPerProblem, excludeIds }),
        })
      );
      const nextGroups = json.groups ?? [];
      setRelatedGroups(nextGroups);
      const selected = json.selectedCount ?? 0;
      const skipped = json.skippedCount ?? 0;
      setRelatedMsg(`문제지 구성: ${selected}문항${skipped ? ` · 건너뜀 ${skipped}개` : ""}`);
      if (selected > 0) updateRelatedSheet(nextGroups);
    } catch (error) {
      setRelatedMsg(error instanceof Error ? error.message : "관련문제 검색에 실패했습니다.");
    } finally {
      setMatching(false);
    }
  }

  async function replaceRelatedMatch(groupIndex: number, matchIndex: number) {
    const group = relatedGroups[groupIndex];
    const currentMatch = group?.matches[matchIndex];
    if (!group || !currentMatch || replacingRelatedKey) return;

    const key = `${groupIndex}-${matchIndex}`;
    setReplacingRelatedKey(key);
    setRelatedMsg("");
    try {
      const excludeIds = relatedSelected.map((question) => question.id);
      const json = await ensureOk<{
        groups: CoachingRelatedGroup[];
        selectedCount: number;
        skippedCount: number;
      }>(
        await adminFetch("/api/admin/coaching/related", {
          method: "POST",
          body: JSON.stringify({ problems: [group.source], perProblem: 1, excludeIds }),
        })
      );
      const replacement = json.groups?.[0]?.matches?.[0];
      if (!replacement) {
        setRelatedMsg("교체할 관련문제를 찾지 못했습니다.");
        return;
      }
      const nextGroups = relatedGroups.map((item, itemIndex) => {
        if (itemIndex !== groupIndex) return item;
        return {
          ...item,
          skipped: false,
          reason: undefined,
          matches: item.matches.map((match, index) => (index === matchIndex ? replacement : match)),
        };
      });
      setRelatedGroups(nextGroups);
      updateRelatedSheet(nextGroups);
      setRelatedMsg("관련문제를 1개 교체했습니다.");
    } catch (error) {
      setRelatedMsg(error instanceof Error ? error.message : "관련문제 교체에 실패했습니다.");
    } finally {
      setReplacingRelatedKey("");
    }
  }

  async function generateUnitMock(excludeCurrent = false) {
    if (unitLoading || replacingUnitQuestionId) return;
    const resolvedSections = resolveUnitSections();
    if (!resolvedSections) return;
    setUnitLoading(true);
    setUnitMsg("");
    const excludeIds =
      excludeCurrent && sheet?.sourceLabel === "unit-mock"
        ? sheet.questions.map((question) => question.id)
        : [];
    try {
      const json = await ensureOk<{
        questions: QuestionRecord[];
        available: number;
        candidateCount?: number;
        requestedCount: number;
        breakdown?: UnitMockBreakdown[];
      }>(
        await adminFetch("/api/admin/coaching/unit-mock", {
          method: "POST",
          body: JSON.stringify({
            sections: resolvedSections,
            difficulty: unitDifficulty,
            pool: unitPool,
            excludeIds,
          }),
        })
      );
      const candidateText =
        typeof json.candidateCount === "number" && excludeIds.length > 0
          ? ` · 제외 후 후보 ${json.candidateCount}문항`
          : "";
      const breakdownText = (json.breakdown ?? [])
        .map((item) => `${item.unit} ${item.selectedCount}/${item.requestedCount}`)
        .join(" · ");
      setUnitMsg(
        `DB ${json.available}문항 중 ${json.questions.length}문항을 뽑았습니다.${candidateText}${
          breakdownText ? ` (${breakdownText})` : ""
        }`
      );
      setSheet(unitSheetFromQuestions(json.questions, resolvedSections));
    } catch (error) {
      setUnitMsg(error instanceof Error ? error.message : "단원별 모고 생성에 실패했습니다.");
    } finally {
      setUnitLoading(false);
    }
  }

  async function replaceUnitQuestion(questionId: string) {
    if (unitLoading || replacingUnitQuestionId || sheet?.sourceLabel !== "unit-mock") return;
    const targetIndex = sheet.questions.findIndex((question) => question.id === questionId);
    if (targetIndex < 0) return;

    setReplacingUnitQuestionId(questionId);
    setUnitMsg("");
    try {
      const excludeIds = sheet.questions.map((question) => question.id);
      const targetQuestion = sheet.questions[targetIndex];
      const json = await ensureOk<{
        questions: QuestionRecord[];
        available: number;
        candidateCount?: number;
        requestedCount: number;
      }>(
        await adminFetch("/api/admin/coaching/unit-mock", {
          method: "POST",
          body: JSON.stringify({
            sections: [
              {
                subject: targetQuestion.subject,
                unit: targetQuestion.unit,
                count: 1,
              },
            ],
            difficulty: unitDifficulty,
            pool: unitPool,
            excludeIds,
          }),
        })
      );
      const replacement = json.questions[0];
      if (!replacement) {
        setUnitMsg("교체할 문제를 찾지 못했습니다.");
        return;
      }
      setSheet((current) => {
        if (current?.sourceLabel !== "unit-mock") return current;
        return {
          ...current,
          questions: current.questions.map((question, index) => (index === targetIndex ? replacement : question)),
        };
      });
      setUnitMsg("문항 1개를 교체했습니다.");
    } catch (error) {
      setUnitMsg(error instanceof Error ? error.message : "문항 교체에 실패했습니다.");
    } finally {
      setReplacingUnitQuestionId("");
    }
  }

  async function loadTwinFile(file: File | null) {
    if (!file) return;
    setTwinMsg("");
    try {
      let image: NormalizedImage;
      if (file.type === "application/pdf" || hasExtension(file, [".pdf"])) {
        image = await renderPdfPage(file, 1);
      } else if (file.type.startsWith("image/")) {
        image = await normalizeImageBlob(file);
      } else {
        throw new Error("PDF 또는 이미지 파일만 올릴 수 있습니다.");
      }
      const next = pageFromImage(image, file.name || "source", file.name || "source");
      setTwinImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return next;
      });
      setTwinResult(null);
    } catch (error) {
      setTwinMsg(error instanceof Error ? error.message : "파일을 읽지 못했습니다.");
    } finally {
      if (twinFileRef.current) twinFileRef.current.value = "";
    }
  }

  async function generateTwin() {
    if (twinLoading) return;
    setTwinLoading(true);
    setTwinMsg("");
    setTwinResult(null);
    try {
      const imagePayload = twinImage
        ? {
            imageBase64: await blobToBase64(twinImage.blob),
            mediaType: twinImage.mediaType,
          }
        : {};
      const json = await ensureOk<TwinResult>(
        await adminFetch("/api/admin/coaching/twin", {
          method: "POST",
          body: JSON.stringify({
            ...imagePayload,
            sourceText: twinSourceText,
            instruction: twinInstruction,
            save: twinSave,
          }),
        })
      );
      setTwinResult(json);
      const preview = json.question ?? draftToRecord(json.draft);
      setSheet({
        title: "쌍둥이 문제",
        subtitle: json.question ? `DB 저장됨 · ${json.question.id}` : "미저장 미리보기",
        questions: [preview],
        sourceLabel: "twin",
      });
      setTwinMsg(json.question ? `문제를 저장했습니다.${json.embedded ? " 임베딩도 생성했습니다." : ""}` : "쌍둥이 문제를 생성했습니다.");
    } catch (error) {
      setTwinMsg(error instanceof Error ? error.message : "쌍둥이 문제 생성에 실패했습니다.");
    } finally {
      setTwinLoading(false);
    }
  }

  function printSheet(mode: PrintMode) {
    setPrintMode(mode);
    window.requestAnimationFrame(() => {
      window.setTimeout(() => window.print(), 0);
    });
  }

  function saveSheetPdf(mode: PrintMode) {
    printSheet(mode);
  }

  function updateQuestionPageHeader(pageIndex: number, value: string) {
    setQuestionPageHeaders((current) => {
      const next = Array.from({ length: questionPageCount }, (_, index) => current[index] ?? "");
      next[pageIndex] = value;
      return next;
    });
  }

  return (
    <main className={`coaching-workspace print-mode-${printMode} mx-auto max-w-7xl px-5 py-8`}>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 0;
        }
        .coaching-print-area {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .coaching-answer-print-area {
          margin-top: 1.5rem;
        }
        .coaching-print-page {
          box-sizing: border-box;
        }
        .coaching-answer-sheet {
          box-sizing: border-box;
          background: #ffffff;
        }
        .coaching-page-custom-header {
          border-bottom: 1px solid #d7deeb;
          color: #172033;
          font-size: 0.82rem;
          font-weight: 900;
          line-height: 1.35;
          margin-bottom: 1rem;
          min-height: 1.75rem;
          padding-bottom: 0.45rem;
          white-space: pre-wrap;
        }
        .coaching-answer-item {
          break-inside: auto;
        }
        .coaching-answer-explanation img {
          max-width: 100%;
          height: auto;
        }
        .coaching-print-grid {
          position: relative;
          padding-top: 1.25rem;
          box-sizing: border-box;
        }
        .coaching-print-column {
          min-width: 0;
          display: grid;
          grid-template-rows: repeat(3, minmax(max-content, 1fr));
          gap: 1.5rem;
          align-items: start;
        }
        .coaching-print-divider {
          display: none;
        }
        .coaching-print-question {
          min-width: 0;
          overflow: visible;
          position: relative;
          z-index: 1;
        }
        .coaching-print-question-body {
          overflow: visible;
        }
        .coaching-print-page .coaching-print-question,
        .coaching-print-page .coaching-print-question * {
          color: #172033 !important;
        }
        .coaching-print-content {
          min-width: 0;
          word-break: keep-all;
          overflow-wrap: break-word;
          overflow: visible;
        }
        .coaching-print-question .katex,
        .coaching-print-question .katex-html,
        .coaching-print-question .base,
        .coaching-print-question .strut,
        .coaching-print-question .vlist-t,
        .coaching-print-question .vlist-r,
        .coaching-print-question .vlist {
          overflow: visible !important;
        }
        .coaching-print-question .katex-display {
          margin: 0.2em 0;
          overflow: visible;
          text-align: left;
        }
        .coaching-print-viewbox {
          margin: 0.65em 0 0.45em;
          border: 1px solid #94a3b8;
          padding: 0.55em 0.7em 0.65em;
        }
        .coaching-print-viewbox-title {
          margin-bottom: 0.4em;
          text-align: center;
          font-weight: 900;
          line-height: 1.2;
        }
        .coaching-print-viewitems {
          display: flex;
          flex-direction: column;
          gap: 0.45em;
        }
        .coaching-print-viewitem {
          display: flex;
          align-items: flex-start;
          gap: 0.55em;
          break-inside: avoid;
        }
        .coaching-print-viewitem-label {
          flex: 0 0 auto;
          font-weight: 900;
        }
        .coaching-print-viewitem-text {
          min-width: 0;
          flex: 1;
        }
        @media (min-width: 1024px) {
          .coaching-print-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 0;
            min-height: 820px;
            background-image: none;
          }
          .coaching-print-column-left {
            padding-right: 2rem;
          }
          .coaching-print-column-right {
            border-left: 1px solid #c2ccda;
            padding-left: 2rem;
          }
          .coaching-print-divider {
            display: none;
          }
        }
        @media print {
          body {
            background: #ffffff !important;
          }
          header,
          .admin-screen-only {
            display: none !important;
          }
          .coaching-workspace {
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .coaching-question-print-area,
          .coaching-answer-print-area {
            display: none !important;
          }
          .print-mode-questions .coaching-question-print-area,
          .print-mode-answers .coaching-answer-print-area {
            display: block !important;
            gap: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .coaching-print-area > .coaching-print-page,
          .coaching-print-area > .coaching-print-page + .coaching-print-page {
            margin: 0 !important;
          }
          .coaching-print-page {
            width: 210mm;
            min-height: 0;
            padding: 12mm;
            box-sizing: border-box;
            break-after: page;
            page-break-after: always;
            break-inside: avoid;
            page-break-inside: avoid;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .coaching-answer-sheet {
            width: 210mm;
            min-height: 296mm;
            padding: 12mm;
            box-sizing: border-box;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
          }
          .coaching-print-page {
            height: 296mm;
            max-height: 296mm;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .coaching-print-header {
            display: none !important;
          }
          .coaching-page-custom-header {
            border-bottom: 0.25mm solid #111111 !important;
            display: block !important;
            font-size: 8.5pt !important;
            line-height: 1.35 !important;
            margin: 0 0 3mm !important;
            min-height: 6mm !important;
            padding: 0 0 1.8mm !important;
            white-space: pre-wrap !important;
          }
          .coaching-print-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }
          .coaching-answer-item {
            break-inside: auto;
            page-break-inside: auto;
            border: 0 !important;
            border-bottom: 0.2mm solid #d7deeb !important;
            padding: 0 0 4mm !important;
            margin: 0 0 4mm !important;
            font-size: 9pt !important;
            line-height: 1.5 !important;
            -webkit-box-decoration-break: clone;
            box-decoration-break: clone;
          }
          .coaching-answer-question-number {
            font-size: 9.5pt !important;
            font-weight: 900 !important;
            line-height: 1.35 !important;
            margin-bottom: 2mm !important;
          }
          .coaching-answer-item .katex {
            font-size: 1em;
            white-space: normal;
          }
          .coaching-answer-explanation img {
            max-height: 55mm !important;
            object-fit: contain;
          }
          .coaching-print-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 0;
            flex: 1 1 auto;
            height: auto;
            min-height: 0;
            padding-top: 8mm;
            box-sizing: border-box;
            position: relative;
            background-image: none !important;
          }
          .coaching-print-column {
            min-width: 0;
            display: grid;
            grid-template-rows: repeat(3, minmax(max-content, 1fr));
            gap: 4mm;
            align-items: start;
          }
          .coaching-print-column-left {
            padding: 0 6mm 0 0;
          }
          .coaching-print-column-right {
            border-left: 0.35mm solid #111111;
            padding: 0 0 0 6mm;
          }
          .coaching-print-divider {
            display: none !important;
          }
          .coaching-print-question {
            min-height: 0;
            overflow: visible;
            break-inside: avoid;
            page-break-inside: avoid;
            border: 0 !important;
            border-radius: 0 !important;
            padding: 1.6mm 0 0;
            font-size: 8pt;
            line-height: 1.48;
          }
          .coaching-print-question-body {
            display: flex;
            align-items: flex-start;
            gap: 2mm;
            overflow: visible;
          }
          .coaching-print-question-number {
            flex: 0 0 auto;
            font-size: 8pt;
            line-height: 1.48;
          }
          .coaching-print-content {
            font-size: 8pt;
            line-height: 1.48;
            word-break: keep-all;
            overflow-wrap: break-word;
            overflow: visible;
          }
          .coaching-print-page .coaching-print-question,
          .coaching-print-page .coaching-print-question * {
            color: #000000 !important;
          }
          .coaching-print-question img {
            max-height: 36mm !important;
          }
          .coaching-print-question .katex {
            font-size: 1em;
            white-space: normal;
            overflow: visible !important;
          }
          .coaching-print-question .katex-html,
          .coaching-print-question .base,
          .coaching-print-question .strut,
          .coaching-print-question .vlist-t,
          .coaching-print-question .vlist-r,
          .coaching-print-question .vlist {
            overflow: visible !important;
          }
          .coaching-print-question .katex-display {
            margin: 0.15em 0 !important;
            overflow: visible !important;
            text-align: left !important;
          }
          .coaching-print-viewbox {
            border: 0.25mm solid #111111 !important;
            padding: 1.8mm 2.2mm 2mm !important;
            margin: 1.8mm 0 1.4mm !important;
          }
          .coaching-print-viewbox-title {
            margin-bottom: 1.2mm !important;
          }
          .coaching-print-viewitems {
            gap: 1.2mm !important;
          }
          .coaching-print-viewitem {
            gap: 1.8mm !important;
          }
          .coaching-print-option {
            gap: 2mm;
            line-height: 1.45;
            break-inside: avoid;
          }
          .coaching-print-option-label {
            width: 4mm;
            flex: 0 0 4mm;
            text-align: left;
          }
        }
      `}</style>

      <section className="admin-screen-only mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">관리자 콘솔</p>
        <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">코칭 스튜디오</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              업로드 문제 인식, 관련문제 구성, 단원별 모고, 쌍둥이 문제 생성을 한곳에서 처리합니다.
            </p>
          </div>
          {sheet ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => saveSheetPdf("questions")}
                className="rounded-md bg-ink px-4 py-2 text-xs font-black text-white hover:bg-slate-800"
              >
                문제지 PDF 저장
              </button>
              <button
                type="button"
                onClick={() => saveSheetPdf("answers")}
                className="rounded-md border border-line bg-white px-4 py-2 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700"
              >
                해답지 PDF 저장
              </button>
            </div>
          ) : null}
        </div>
        {sheet && questionPageCount > 0 ? (
          <div className="mt-5 border-t border-line pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-sm font-black text-ink">문제지 머릿말</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  페이지별로 입력한 머릿말만 인쇄됩니다. 비워 둔 페이지는 기존 위치 그대로 출력됩니다.
                </p>
              </div>
              <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-3xl lg:grid-cols-3">
                {Array.from({ length: questionPageCount }, (_, pageIndex) => (
                  <label key={pageIndex} className="block text-xs font-black text-slate-600">
                    {pageIndex + 1}쪽
                    <input
                      type="text"
                      value={questionPageHeaders[pageIndex] ?? ""}
                      onChange={(event) => updateQuestionPageHeader(pageIndex, event.target.value)}
                      className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm font-bold text-ink"
                      placeholder="머릿말 없음"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="admin-screen-only mb-5 flex flex-wrap gap-2 rounded-lg border border-line bg-white p-2 shadow-soft">
        {[
          { id: "related" as const, label: "관련문제 문제지" },
          { id: "unit" as const, label: "단원별 모고" },
          { id: "twin" as const, label: "쌍둥이 문제" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-md px-4 py-2 text-sm font-black ${
              tab === item.id
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </section>

      <section className="admin-screen-only">
        {tab === "related" ? (
          <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
            <aside className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="text-lg font-black text-ink">1. 업로드 문제 분석</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                PDF/이미지를 여러 개 올릴 수 있고, 최대 {MAX_UPLOAD_PAGES}페이지까지 Gemini가 문제 단위로 분리합니다.
              </p>
              <input
                ref={relatedFileRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                multiple
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files) void buildPagesFromFiles(event.target.files);
                }}
              />
              <div
                role="button"
                tabIndex={0}
                aria-label="문제 PDF 또는 이미지 업로드"
                onClick={() => relatedFileRef.current?.click()}
                onKeyDown={handleUploadKeyDown}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setUploadDragActive(true);
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (event.currentTarget === event.target) setUploadDragActive(false);
                }}
                onDrop={handleUploadDrop}
                className={`mt-4 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-5 py-6 text-center transition ${
                  uploadDragActive
                    ? "border-brand-600 bg-brand-50"
                    : pages.length > 0
                      ? "border-brand-200 bg-brand-50/60 hover:bg-brand-50"
                      : "border-line bg-slate-50 hover:border-brand-300 hover:bg-white"
                }`}
              >
                <div className="grid size-12 place-items-center rounded-md bg-brand-600 text-2xl font-black leading-none text-white">
                  +
                </div>
                <p className="mt-4 text-base font-black text-ink">PDF/이미지 업로드</p>
                <p className="mt-2 text-xs font-bold text-slate-500">여러 파일 선택 · 드래그 · 붙여넣기</p>
                <p className="mt-4 rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                  {pages.length > 0 ? `${pages.length}/${MAX_UPLOAD_PAGES}페이지 준비됨` : `최대 ${MAX_UPLOAD_PAGES}페이지`}
                </p>
              </div>
              <label className="mt-4 block text-xs font-black text-slate-600">
                전체 문제 수 <span className="font-bold text-slate-400">(선택)</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={expectedProblemCount}
                  onFocus={selectNumberInput}
                  onChange={(event) => setExpectedProblemCount(parseOptionalNumberInput(event.target.value))}
                  onBlur={() => {
                    if (typeof expectedProblemCount === "number") {
                      setExpectedProblemCount(clampInteger(expectedProblemCount, 1, 200));
                    }
                  }}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                  placeholder="예: 6"
                />
              </label>
              <button
                type="button"
                disabled={pages.length === 0 || extracting || uploading}
                onClick={extractProblems}
                className="mt-4 w-full rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {extracting ? "문제 인식 중..." : uploading ? "파일 읽는 중..." : "문제 인식"}
              </button>

              <div className="mt-5 border-t border-line pt-5">
                <label className="text-xs font-black text-slate-600">원문 1문제당 관련문제 수</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={perProblem}
                  onFocus={selectNumberInput}
                  onChange={(event) => setPerProblem(parseOptionalNumberInput(event.target.value))}
                  onBlur={() => {
                    if (typeof perProblem === "number") {
                      setPerProblem(clampInteger(perProblem, 1, 6));
                    }
                  }}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={extracted.length === 0 || matching || perProblem === ""}
                  onClick={() => void findRelated()}
                  className="mt-3 w-full rounded-md bg-ink px-4 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {matching ? "벡터 검색 중..." : "관련문제 문제지 구성"}
                </button>
              </div>

              {relatedMsg ? (
                <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">{relatedMsg}</p>
              ) : null}
            </aside>

            <div className="space-y-5">
              {pages.length > 0 ? (
                <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-ink">업로드 페이지</h3>
                    <button
                      type="button"
                      disabled={uploading || extracting || matching}
                      onClick={clearPages}
                      className="rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-coral-600 hover:text-coral-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      전체 삭제
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {pages.map((page) => (
                      <div key={page.id} className="group relative rounded-lg border border-line bg-slate-50 p-2">
                        <button
                          type="button"
                          disabled={uploading || extracting || matching}
                          onClick={() => removePage(page.id)}
                          aria-label={`${page.sourceLabel} 삭제`}
                          className="absolute right-3 top-3 z-10 rounded-full bg-coral-600 px-2.5 py-1 text-[11px] font-black text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          삭제
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={page.url} alt={page.sourceLabel} className="h-36 w-full rounded-md bg-white object-contain" />
                        <p className="mt-2 truncate text-xs font-bold text-slate-600">{page.sourceLabel}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-ink">인식 결과</h3>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-black text-brand-700">
                    {extracted.length}문제
                  </span>
                </div>
                {extracted.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">PDF/이미지를 올리고 문제 인식을 실행해 주세요.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {extracted.map((problem, index) => (
                      <div key={problem.id} className="rounded-lg border border-line p-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-black text-slate-500">
                          <span>#{index + 1}</span>
                          <span>{problem.sourceLabel}</span>
                          <span>{problem.subject || "과목 미확정"}</span>
                          <span>{problem.unit || "단원 미확정"}</span>
                          <span>신뢰도 {Math.round(problem.recognition.confidence * 100)}%</span>
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink">{problem.problemText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {relatedGroups.length > 0 ? (
                <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-ink">관련문제 구성 결과</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={matching || replacingRelatedKey !== "" || relatedSelected.length === 0}
                        onClick={() => void findRelated(true)}
                        className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700 disabled:opacity-40"
                      >
                        다른 문제로 구성
                      </button>
                      <button
                        type="button"
                        disabled={relatedSelected.length === 0}
                        onClick={() => updateRelatedSheet(relatedGroups)}
                        className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700 disabled:opacity-40"
                      >
                        미리보기 갱신
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    {relatedGroups.map((group, index) => (
                      <div key={group.source.id} className="rounded-lg border border-line p-4">
                        <p className="text-xs font-black text-slate-500">원문 #{index + 1}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-ink">{group.source.problemText}</p>
                        {group.skipped ? (
                          <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
                            {group.reason}
                          </p>
                        ) : (
                          <ol className="mt-3 space-y-2">
                            {group.matches.map((match, matchIndex) => (
                              <li key={match.question.id} className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <b className="text-ink">{matchIndex + 1}. {match.question.unit}</b>
                                    <span className="ml-2">{match.question.concept}</span>
                                    {typeof match.similarity === "number" ? (
                                      <span className="ml-2 text-slate-400">유사도 {match.similarity.toFixed(3)}</span>
                                    ) : null}
                                  </div>
                                  <button
                                    type="button"
                                    disabled={matching || replacingRelatedKey !== ""}
                                    onClick={() => void replaceRelatedMatch(index, matchIndex)}
                                    className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {replacingRelatedKey === `${index}-${matchIndex}` ? "교체 중..." : "이 문제 교체"}
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "unit" ? (
          <section className="rounded-lg border border-line bg-white p-6 shadow-soft">
            <h2 className="text-lg font-black text-ink">단원별 모고 PDF</h2>
            <p className="mt-1 text-sm text-slate-500">
              DB에 저장된 문제를 과목/단원 기준으로 뽑아 6문항 단위 인쇄용 문제지로 만듭니다.
            </p>
            <section className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-black text-slate-600">단원 구성</div>
                <button
                  type="button"
                  onClick={addUnitSection}
                  className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700"
                >
                  + 단원 추가
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {unitSections.map((section, index) => {
                  const options = unitsForUnitMockSubject(section.subject);
                  return (
                    <div
                      key={section.id}
                      className="grid gap-3 rounded-lg border border-line bg-slate-50 p-3 md:grid-cols-[1fr_1fr_120px_auto]"
                    >
                      <label className="text-xs font-black text-slate-600">
                        과목
                        <select
                          value={section.subject}
                          onChange={(event) => updateUnitSectionSubject(section.id, event.target.value)}
                          className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal"
                        >
                          {SUBJECT_NAMES.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-black text-slate-600">
                        단원
                        <select
                          value={section.unit}
                          onChange={(event) => updateUnitSectionUnit(section.id, event.target.value)}
                          className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal"
                        >
                          {options.map((item) => (
                            <option key={item} value={item}>{item}</option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs font-black text-slate-600">
                        문항 수
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={section.count}
                          onFocus={selectNumberInput}
                          onChange={(event) =>
                            updateUnitSectionCount(section.id, parseOptionalNumberInput(event.target.value))
                          }
                          onBlur={() => clampUnitSectionCount(section.id)}
                          className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-normal"
                        />
                      </label>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeUnitSection(section.id)}
                          className="w-full rounded-md border border-line bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-coral-500 hover:text-coral-600"
                        >
                          {unitSections.length === 1 ? "초기화" : `${index + 1}행 삭제`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-xs font-black text-slate-600">
                난이도
                <select
                  value={unitDifficulty}
                  onChange={(event) => setUnitDifficulty(event.target.value as "all" | Difficulty)}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                >
                  <option value="all">전체</option>
                  {DIFFICULTY_KEYS.map((key) => (
                    <option key={key} value={key}>{DIFFICULTY_LABELS[key]}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-black text-slate-600">
                문제 풀
                <select
                  value={unitPool}
                  onChange={(event) => setUnitPool(event.target.value as PoolFilter)}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                >
                  <option value="all">전체</option>
                  <option value="general">일반</option>
                  <option value="daily">데일리</option>
                  <option value="self_mock">자체 모고</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => void generateUnitMock()}
              disabled={unitLoading || unitHasBlankCount}
              className="mt-5 rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:bg-slate-300"
            >
              {unitLoading ? "문제 뽑는 중..." : `단원별 모고 만들기 (${unitTotalCount}문항)`}
            </button>
            {unitMsg ? <p className="mt-4 text-sm font-bold text-slate-600">{unitMsg}</p> : null}
            {sheet?.sourceLabel === "unit-mock" ? (
              <section className="mt-5 rounded-lg border border-line bg-slate-50 p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-ink">단원별 모고 구성 결과</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {sheet.questions.length}문항 · 개별 문항을 교체하거나 전체를 다시 뽑을 수 있습니다.
                    </p>
                  </div>
                </div>
                <ol className="mt-4 grid gap-2 lg:grid-cols-2">
                  {sheet.questions.map((question, index) => (
                    <li key={question.id} className="rounded-md border border-line bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-500">
                            {index + 1}. {question.concept || question.unit}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                            {normalizePrintableText(stripLeadingQuestionNumber(question.question))}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={unitLoading || replacingUnitQuestionId !== ""}
                          onClick={() => void replaceUnitQuestion(question.id)}
                          className="shrink-0 rounded-md border border-line px-2 py-1 text-[11px] font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {replacingUnitQuestionId === question.id ? "교체 중..." : "이 문제 교체"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    disabled={unitLoading || replacingUnitQuestionId !== "" || sheet.questions.length === 0 || unitHasBlankCount}
                    onClick={() => void generateUnitMock(true)}
                    className="rounded-md border border-line bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {unitLoading ? "다시 뽑는 중..." : "전체 다른문제로 구성"}
                  </button>
                </div>
              </section>
            ) : null}
          </section>
        ) : null}

        {tab === "twin" ? (
          <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
            <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h2 className="text-lg font-black text-ink">쌍둥이 문제 생성</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                원문 이미지 또는 텍스트와 변경 요청을 Gemini에 보내 새 문제를 만듭니다.
              </p>
              <input
                ref={twinFileRef}
                type="file"
                accept="image/*,application/pdf,.pdf"
                className="mt-4 block w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
                onChange={(event) => void loadTwinFile(event.target.files?.[0] ?? null)}
              />
              {twinImage ? (
                <div className="mt-3 rounded-lg border border-line bg-slate-50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={twinImage.url} alt="원문 문제" className="max-h-56 w-full rounded-md bg-white object-contain" />
                  <p className="mt-2 truncate text-xs font-bold text-slate-600">{twinImage.name}</p>
                </div>
              ) : null}
              <label className="mt-4 block text-xs font-black text-slate-600">
                원문 텍스트
                <textarea
                  value={twinSourceText}
                  onChange={(event) => setTwinSourceText(event.target.value)}
                  rows={5}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                  placeholder="이미지가 없거나 보완 설명이 필요할 때 원문을 붙여넣으세요."
                />
              </label>
              <label className="mt-4 block text-xs font-black text-slate-600">
                바꿀 부분
                <textarea
                  value={twinInstruction}
                  onChange={(event) => setTwinInstruction(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm font-normal"
                  placeholder="예: 숫자는 더 깔끔하게, 최대/최소 조건은 유지, 정답은 2번이 되게 바꿔줘."
                />
              </label>
              <label className="mt-4 flex items-center gap-2 text-xs font-black text-slate-600">
                <input
                  type="checkbox"
                  checked={twinSave}
                  onChange={(event) => setTwinSave(event.target.checked)}
                />
                생성 후 DB에 저장
              </label>
              <button
                type="button"
                onClick={generateTwin}
                disabled={twinLoading}
                className="mt-4 w-full rounded-md bg-brand-600 px-5 py-3 text-sm font-black text-white hover:bg-brand-700 disabled:bg-slate-300"
              >
                {twinLoading ? "생성 중..." : "쌍둥이 문제 생성"}
              </button>
              {twinMsg ? <p className="mt-4 text-sm font-bold text-slate-600">{twinMsg}</p> : null}
            </div>

            <div className="rounded-lg border border-line bg-white p-6 shadow-soft">
              <h3 className="text-sm font-black text-ink">생성 결과</h3>
              {!twinResult ? (
                <p className="mt-4 text-sm text-slate-500">원문과 변경 요청을 입력하면 생성 결과가 표시됩니다.</p>
              ) : (
                <QuestionPreview
                  question={twinResult.question ?? draftToRecord(twinResult.draft)}
                  showAnswer
                />
              )}
            </div>
          </section>
        ) : null}

      </section>

      {sheet ? (
        <>
          <PrintableSheet sheet={sheet} pageHeaders={questionPageHeaders} />
          <PrintableAnswerSheet sheet={sheet} />
        </>
      ) : (
        <section className="admin-screen-only mt-6 rounded-lg border border-dashed border-line bg-white/70 p-8 text-center text-sm text-slate-500">
          문제지를 만들면 이곳에 인쇄 미리보기가 표시됩니다.
        </section>
      )}
    </main>
  );
}

function QuestionPreview({ question, showAnswer }: { question: QuestionRecord; showAnswer: boolean }) {
  return (
    <article className="rounded-lg border border-line bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-black text-slate-500">
        <span>{question.subject}</span>
        <span>{question.unit}</span>
        <span>{question.concept}</span>
        <span>{DIFFICULTY_LABELS[question.difficulty]}</span>
      </div>
      <ContentRenderer
        contentType={question.contentType}
        text={question.question}
        image={question.questionImage}
        className="text-sm leading-6 text-ink"
      />
      {question.options.length > 0 ? (
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <li key={option.id} className="flex gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span className="font-black text-slate-500">{option.label}</span>
              <ContentRenderer contentType={option.contentType} text={option.text} image={option.image} />
            </li>
          ))}
        </ol>
      ) : null}
      {showAnswer ? (
        <div className="mt-4 rounded-md bg-brand-50 px-3 py-2 text-sm font-bold text-brand-700">
          정답: {answerLabel(question) || "-"}
        </div>
      ) : null}
    </article>
  );
}

function PrintableQuestionContent({ question }: { question: QuestionRecord }) {
  const text = normalizePrintableText(stripLeadingQuestionNumber(question.question));
  const viewBlock = parseViewBlock(text);
  const shouldShowImage = (question.contentType === "image" || question.contentType === "mixed") && question.questionImage;
  const shouldShowText = question.contentType === "latex" || question.contentType === "mixed";

  return (
    <div className="coaching-print-content min-w-0 flex-1 text-ink">
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={question.questionImage}
          alt="문제 이미지"
          className="max-h-[560px] w-auto max-w-full rounded-md border border-line bg-white object-contain"
        />
      ) : null}
      {shouldShowText && text ? (
        <div className={shouldShowImage ? "mt-3" : undefined}>
          {viewBlock ? (
            <>
              {viewBlock.prompt ? <KaTeXRenderer content={viewBlock.prompt} /> : null}
              <div className="coaching-print-viewbox">
                <div className="coaching-print-viewbox-title">{"<보기>"}</div>
                <div className="coaching-print-viewitems">
                  {viewBlock.items.map((item) => (
                    <div key={item.label} className="coaching-print-viewitem">
                      <span className="coaching-print-viewitem-label">{item.displayLabel}</span>
                      <div className="coaching-print-viewitem-text">
                        <KaTeXRenderer content={item.text} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <KaTeXRenderer content={text} />
          )}
        </div>
      ) : null}
    </div>
  );
}

function PrintableSheet({ sheet, pageHeaders }: { sheet: PrintSheet; pageHeaders: string[] }) {
  const pages = chunk(sheet.questions, QUESTIONS_PER_PRINT_PAGE);
  return (
    <section className="coaching-print-area coaching-question-print-area mt-6">
      {pages.map((questions, pageIndex) => {
        const headerText = (pageHeaders[pageIndex] ?? "").trim();
        return (
          <div
            key={`${sheet.sourceLabel ?? sheet.title}-${pageIndex}`}
            data-coaching-print-page
            className="coaching-print-page rounded-lg border border-line bg-white p-6 shadow-soft"
          >
            <div className="coaching-print-header mb-5 flex items-end justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-xl font-black text-ink">{sheet.title}</h2>
                <p className="mt-1 text-xs font-bold text-slate-500">{sheet.subtitle}</p>
              </div>
              <p className="text-xs font-black text-slate-500">
                {pageIndex + 1} / {pages.length}
              </p>
            </div>
            {headerText ? <div className="coaching-page-custom-header">{headerText}</div> : null}
            <div className="coaching-print-grid">
              <div className="coaching-print-divider" aria-hidden="true" />
              {[questions.slice(0, 3), questions.slice(3, 6)].map((columnQuestions, columnIndex) => (
                <div
                  key={columnIndex}
                  className={`coaching-print-column ${
                    columnIndex === 0 ? "coaching-print-column-left" : "coaching-print-column-right"
                  }`}
                >
                  {columnQuestions.map((question, index) => {
                    const questionNumber = pageIndex * QUESTIONS_PER_PRINT_PAGE + columnIndex * 3 + index + 1;
                    return (
                      <div key={question.id} className="coaching-print-question px-3 py-2">
                        <div className="coaching-print-question-body flex items-start gap-2">
                          <span className="coaching-print-question-number shrink-0 font-black text-ink">
                            {questionNumber}.
                          </span>
                          <PrintableQuestionContent question={question} />
                        </div>
                        {question.options.length > 0 ? (
                          <ol className="coaching-print-options mt-3 space-y-1.5">
                            {question.options.map((option) => (
                              <li key={option.id} className="coaching-print-option flex gap-2">
                                <span className="coaching-print-option-label font-black text-slate-600">{option.label}</span>
                                <ContentRenderer
                                  contentType={option.contentType}
                                  text={option.text}
                                  image={option.image}
                                  className="coaching-print-content min-w-0 flex-1"
                                />
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-xs text-slate-400">
                            답:
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function PrintableAnswerSheet({ sheet }: { sheet: PrintSheet }) {
  return (
    <section className="coaching-print-area coaching-answer-print-area">
      <div className="coaching-answer-sheet rounded-lg border border-line bg-white p-6 shadow-soft">
        {sheet.questions.map((question, index) => {
          const questionNumber = index + 1;
          return (
            <article key={question.id} className="coaching-answer-item bg-white">
              <div className="coaching-answer-question-number text-sm font-black text-ink">
                {questionNumber}번
              </div>
              {question.explanation || question.explanationImage ? (
                <div className="coaching-answer-explanation">
                  <ContentRenderer
                    contentType={question.explanationContentType}
                    text={question.explanation}
                    image={question.explanationImage}
                    imageAlt={`${questionNumber}번 해설`}
                    className="text-sm leading-6 text-slate-700"
                  />
                </div>
              ) : (
                <div className="coaching-answer-explanation text-sm font-bold text-slate-400">
                  해설 없음
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
