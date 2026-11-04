import type { SavedProject } from "./types";

export function projectStorageKey(userId: string) { return `cbt:electronics:v1:${userId}`; }
export function readLocalProjects(userId: string): SavedProject[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(projectStorageKey(userId)) || "[]");
    return Array.isArray(data) ? data.filter((p): p is SavedProject => Boolean(p && typeof p === "object" && p.version === 1 && typeof p.id === "string" && p.circuit && p.boardOptions && Array.isArray(p.completedSteps))).slice(0, 30) : [];
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
