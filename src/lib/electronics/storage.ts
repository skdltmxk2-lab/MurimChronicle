import type { SavedProject } from "./types";
import { isProjectSource, parseProjectSource } from "./project-source";
import { createBoard } from "./engine";

export type LocalProjectReadResult = { projects: SavedProject[]; error: string | null; skipped: number };

export function projectStorageKey(userId: string) { return `cbt:electronics:v1:${userId}`; }
export function isSavedProjectMetadata(value: unknown): value is SavedProject {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const p = value as Partial<SavedProject>;
  return p.version === 1 && typeof p.id === "string" && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(p.id)
    && typeof p.title === "string" && p.title.length > 0 && p.title.length <= 160
    && typeof p.updatedAt === "string" && Number.isFinite(Date.parse(p.updatedAt))
    && !!p.circuit && typeof p.circuit === "object" && Array.isArray(p.circuit.components) && p.circuit.components.length <= 80
    && !!p.boardOptions && [1, 2].includes(p.boardOptions.boards) && ["split", "continuous"].includes(p.boardOptions.railMode)
    && Array.isArray(p.completedSteps) && p.completedSteps.length <= 1400 && p.completedSteps.every(step => typeof step === "string" && step.length <= 100)
    && (p.experimentId === undefined || typeof p.experimentId === "string")
    && (p.source === undefined || isProjectSource(p.source));
}
/** Merge lists without hiding cloud-only projects when the current draft autosaves. */
export function mergeProjects(...lists: SavedProject[][]): SavedProject[] {
  const projects = new Map<string, SavedProject>();
  for (const list of lists) {
    for (const project of list) {
      const previous = projects.get(project.id);
      if (!previous || Date.parse(project.updatedAt) > Date.parse(previous.updatedAt)) projects.set(project.id, project);
    }
  }
  return [...projects.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

function restoreBoard(project: SavedProject): SavedProject {
  if (!project.layout || typeof project.layout !== "object" || Array.isArray(project.layout)) return project;
  return { ...project, layout: { ...project.layout, board: createBoard(project.boardOptions) } };
}

/** Distinguish an empty library from unavailable or damaged browser storage. */
export function readLocalProjectState(userId: string): LocalProjectReadResult {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(projectStorageKey(userId)) || "[]");
    if (!Array.isArray(data)) throw new Error("invalid collection");
    const valid = data.filter(isSavedProjectMetadata);
    const skipped = data.length - valid.length;
    return {
      projects: mergeProjects(valid).map(restoreBoard),
      error: skipped ? `브라우저에 저장된 ${skipped}개 프로젝트의 형식을 읽지 못했습니다. 기존 데이터를 보존하고 자동 저장을 중단했습니다. 현재 설계는 클라우드나 JSON으로 저장하세요.` : null,
      skipped,
    };
  } catch {
    return { projects: [], error: "브라우저 저장함을 읽지 못했습니다. 기존 데이터를 보존하고 자동 저장을 중단했습니다. 현재 설계는 클라우드나 JSON으로 저장하세요.", skipped: 0 };
  }
}

export function readLocalProjects(userId: string): SavedProject[] {
  return readLocalProjectState(userId).projects;
}
export function saveLocalProject(userId: string, project: SavedProject) {
  const source = parseProjectSource(project.source);
  const normalized = { ...project, ...(source ? { source } : {}) };
  if (!isSavedProjectMetadata(normalized)) throw new Error("자동 저장할 프로젝트의 이름과 데이터 형식을 확인해 주세요.");
  const previous = readLocalProjectState(userId);
  if (previous.error) throw new Error(previous.error);
  const projects = [normalized, ...previous.projects.filter(p => p.id !== project.id)];
  // Board coordinates are derived from boardOptions. Keep the existing project
  // format while avoiding 830/1660 duplicate hole records in every saved draft.
  const compact = projects.map(item => item.layout ? {
    ...item,
    layout: { ...item.layout, board: { ...item.layout.board, holes: [] } },
  } : item);
  localStorage.setItem(projectStorageKey(userId), JSON.stringify(compact));
  return projects;
}

export function downloadText(name: string, text: string, mime = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
