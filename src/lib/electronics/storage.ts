import type { SavedProject } from "./types";

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
    && (p.experimentId === undefined || typeof p.experimentId === "string");
}
export function readLocalProjects(userId: string): SavedProject[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(projectStorageKey(userId)) || "[]");
    return Array.isArray(data) ? data.filter(isSavedProjectMetadata).slice(0, 30) : [];
  } catch { return []; }
}
export function saveLocalProject(userId: string, project: SavedProject) {
  const projects = [project, ...readLocalProjects(userId).filter(p => p.id !== project.id)].slice(0, 30);
  localStorage.setItem(projectStorageKey(userId), JSON.stringify(projects));
  return projects;
}

export function downloadText(name: string, text: string, mime = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
