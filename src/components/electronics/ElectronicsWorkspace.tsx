"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { electronicsAdminFetch } from "@/lib/electronics/api";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { EXPERIMENTS } from "@/lib/electronics/experiments";
import { CIRCUIT_TEMPLATES } from "@/lib/electronics/templates";
import { createBoard, createLayout, validateLayout, createAssemblySteps } from "@/lib/electronics/engine";
import { parseCircuit } from "@/lib/electronics/schema";
import { downloadText, isSavedProjectMetadata, readLocalProjects, saveLocalProject } from "@/lib/electronics/storage";
import type { BoardOptions, Circuit, CircuitLayout, SavedProject } from "@/lib/electronics/types";
import { Breadboard, type BoardSelection } from "./Breadboard";
import { ALL_BOARD_LAYERS, BOARD_LAYERS, componentLayer, countBoardLayers, isBoardSelectionVisible, layerForAssemblyStep, type BoardLayer } from "@/lib/electronics/visibility";
import { ElectronicsChat } from "./ElectronicsChat";
import { WorkspaceDrawer } from "./WorkspaceDrawer";
import "./electronics.css";
import "./workspace-layout.css";

type SourceFile = { name: string; mimeType: string; data: string; size: number };
const defaultBoard: BoardOptions = { boards: 1, railMode: "split" };
const modes = { circuit: "회로 조립", instruments: "계측 실습", signal: "신호처리", mixed: "회로 + 계측" };
const inputId = "electronics-source-file";
function cloneCircuit(c: Circuit): Circuit { return JSON.parse(JSON.stringify(c)) as Circuit; }
function Icon({ name, size = 18 }: { name: "chip" | "upload" | "board" | "book" | "parts" | "save" | "spark" | "download" | "check" | "arrow"; size?: number }) {
  const paths: Record<typeof name, React.ReactNode> = {
    chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5M10 10h4v4h-4z" /></>,
    upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" /></>,
    board: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 12h18M7 8h1m3 0h1m3 0h1m-9 8h1m3 0h1m3 0h1" /></>,
    book: <><path d="M12 5c-3-2-7-2-10 0v15c3-2 7-2 10 0 3-2 7-2 10 0V5c-3-2-7-2-10 0Zm0 0v15" /></>,
    parts: <><path d="M5 8h14v8H5zM1 12h4m14 0h4M8 8v8m4-8v8m4-8v8" /></>,
    save: <><path d="M4 3h13l4 4v14H3V3h1Zm3 0v6h9V3M7 21v-8h10v8" /></>,
    spark: <><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2ZM21 2v4m-2-2h4" /></>,
    download: <><path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function ElectronicsWorkspace() {
  const { user, authChecked } = useAuth();
  const initial = CIRCUIT_TEMPLATES.find(c => c.id === "rc-lowpass") || CIRCUIT_TEMPLATES[0];
  const [circuit, setCircuit] = useState<Circuit>(() => cloneCircuit(initial));
  const [boardOptions, setBoardOptions] = useState<BoardOptions>(defaultBoard);
  const [layout, setLayout] = useState<CircuitLayout>(() => createLayout(initial, COMPONENT_CATALOG, defaultBoard));
  const [selection, setSelection] = useState<BoardSelection>(null);
  const [view, setView] = useState<"board" | "experiments" | "catalog">("board");
  const [experimentId, setExperimentId] = useState("lab-0");
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [files, setFiles] = useState<SourceFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("전체");
  const [visibleLayers, setVisibleLayers] = useState<BoardLayer[]>([...ALL_BOARD_LAYERS]);
  const [drawer, setDrawer] = useState<"experiments" | "sources" | "projects" | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pickingPin, setPickingPin] = useState<{ componentId: string; pinId: string } | null>(null);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [undoStack, setUndoStack] = useState<CircuitLayout[]>([]);
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const [workspaceOwner, setWorkspaceOwner] = useState<string | null>(null);
  const readyUser = useRef<string | null>(null);
  const cancelAnalyze = useRef<AbortController | null>(null);
  const analysisVersion = useRef(0);
  const projectUser = user?.id || "";
  const experiment = EXPERIMENTS.find(e => e.id === experimentId) || EXPERIMENTS[0];
  const report = useMemo(() => validateLayout(circuit, COMPONENT_CATALOG, layout), [circuit, layout]);
  const steps = useMemo(() => createAssemblySteps(circuit, COMPONENT_CATALOG, layout), [circuit, layout]);
  const selectedComponent = selection?.type === "component" ? circuit.components.find(c => c.id === selection.id) : null;
  const selectedDefinition = COMPONENT_CATALOG.find(d => d.id === selectedComponent?.definitionId);
  const selectedPlacement = layout.placements.find(p => p.componentId === selectedComponent?.id);
  const selectedJumper = selection?.type === "jumper" ? layout.jumpers.find(j => j.id === selection.id) : null;
  const selectedTerminal = selection?.type === "terminal" ? circuit.instruments.find(i => i.id === selection.id) : null;
  const layerCounts = useMemo(() => countBoardLayers(circuit, COMPONENT_CATALOG, layout), [circuit, layout]);
  const openReviews = circuit.reviewItems.filter(i => !i.resolved);
  const categories = ["전체", ...new Set(COMPONENT_CATALOG.map(d => d.category))];
  const filteredCatalog = COMPONENT_CATALOG.filter(d => (catalogCategory === "전체" || d.category === catalogCategory) && `${d.name} ${d.description} ${d.package} ${d.id}`.toLowerCase().includes(catalogSearch.toLowerCase()));

  const applyCircuit = useCallback((next: Circuit, options: BoardOptions = boardOptions) => {
    analysisVersion.current += 1; cancelAnalyze.current?.abort(); cancelAnalyze.current = null; setBusy(false);
    setCircuit(next); setLayout(createLayout(next, COMPONENT_CATALOG, options)); setSelection(null); setStepIndex(null); setCompletedSteps([]); setUndoStack([]); setPickingPin(null); setError("");
  }, [boardOptions]);

  useEffect(() => {
    const authorized = !!projectUser && isAdminUser(user);
    if (authorized && readyUser.current === projectUser) return;
    if (!authorized && readyUser.current === null) return;
    readyUser.current = authorized ? projectUser : null;
    analysisVersion.current += 1; cancelAnalyze.current?.abort(); cancelAnalyze.current = null;
    setBusy(false); setSaving(false); setFiles([]); setSourceText(""); setCloudLoaded(false); setMessage(""); setError("");
    setJsonOpen(false); setJsonText(""); setView("board"); setDrawer(null); setExperimentId("lab-0"); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false);
    setBoardOptions(defaultBoard); setCircuit(cloneCircuit(initial)); setLayout(createLayout(initial, COMPONENT_CATALOG, defaultBoard));
    setSelection(null); setStepIndex(null); setCompletedSteps([]); setUndoStack([]); setPickingPin(null);
    if (!authorized) { setProjects([]); setProjectId(""); setWorkspaceOwner(null); return; }
    const stored = readLocalProjects(projectUser); setProjects(stored);
    setProjectId(crypto.randomUUID());
    setWorkspaceOwner(projectUser);
  }, [projectUser, user, initial]);

  useEffect(() => {
    if (!projectUser || !projectId || workspaceOwner !== projectUser || readyUser.current !== projectUser || !isAdminUser(user)) return;
    const timer = setTimeout(() => {
      try {
        const project: SavedProject = { version: 1, id: projectId, title: circuit.title, updatedAt: new Date().toISOString(), circuit, boardOptions, layout, completedSteps, experimentId };
        setProjects(saveLocalProject(projectUser, project));
      } catch { setMessage("브라우저 저장 공간이 부족합니다. JSON으로 내보내거나 클라우드에 저장하세요."); }
    }, 700);
    return () => clearTimeout(timer);
  }, [projectUser, projectId, circuit, layout, boardOptions, completedSteps, experimentId, user, workspaceOwner]);

  useEffect(() => () => cancelAnalyze.current?.abort(), []);

  function openTemplate(id: string) {
    const template = CIRCUIT_TEMPLATES.find(c => c.id === id); if (!template) return;
    applyCircuit(cloneCircuit(template)); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false); setProjectId(crypto.randomUUID()); setView("board"); setMessage("회로 예제를 열었습니다. 원문과 실제 부품을 확인한 뒤 사용하세요.");
  }

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setError("");
    const incoming = Array.from(list);
    const actingUser = projectUser;
    const version = analysisVersion.current;
    if (files.length + incoming.length > 4 || files.reduce((s, f) => s + f.size, 0) + incoming.reduce((s, f) => s + f.size, 0) > 2_900_000) { setError("첨부는 최대 4개, 합계 2.8MB까지 가능합니다. PDF는 필요한 페이지만 분리해 주세요."); return; }
    try {
      const added = await Promise.all(incoming.map(file => new Promise<SourceFile>((resolve, reject) => {
        if (!["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(file.type)) { reject(new Error("PDF, PNG, JPG, WebP 파일을 선택하세요.")); return; }
        const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, mimeType: file.type, data: String(reader.result).split(",")[1], size: file.size }); reader.onerror = () => reject(new Error("파일을 읽지 못했습니다.")); reader.readAsDataURL(file);
      })));
      if (readyUser.current === actingUser && analysisVersion.current === version) { setFiles(f => [...f, ...added]); setDrawer("sources"); }
    } catch (e) { if (readyUser.current === actingUser && analysisVersion.current === version) setError(e instanceof Error ? e.message : "파일을 읽지 못했습니다."); }
  }

  async function analyze() {
    if (!files.length && !sourceText.trim()) { setDrawer("sources"); setError("회로 자료를 첨부하거나 회로와 실험 조건을 입력하세요."); return; }
    setBusy(true); setError(""); setMessage("소자·연결·본문 조건을 함께 분석하고 있습니다…");
    const controller = new AbortController(); cancelAnalyze.current = controller;
    const version = ++analysisVersion.current; const actingUser = projectUser;
    try {
      const res = await electronicsAdminFetch(actingUser, "/api/admin/electronics/analyze", { method: "POST", body: JSON.stringify({ text: sourceText, files: files.map(({ name, mimeType, data }) => ({ name, mimeType, data })) }), signal: controller.signal });
      const data = await res.json();
      if (readyUser.current !== actingUser || analysisVersion.current !== version) return;
      if (!res.ok || !data.ok) throw new Error(data.message || data.error || "자료를 분석하지 못했습니다.");
      const next = parseCircuit(data.circuit, COMPONENT_CATALOG); applyCircuit(next); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false); setProjectId(crypto.randomUUID()); setView("board"); setDrawer(null); setMessage("분석과 전체 배치를 생성했습니다. 원문 확인 항목과 연결 검사 결과를 검토하세요.");
    } catch (e) { if (readyUser.current === actingUser && analysisVersion.current === version) { if (e instanceof Error && e.name === "AbortError") setMessage("분석을 취소했습니다."); else setError(e instanceof Error ? e.message : "분석 중 오류가 발생했습니다."); } }
    finally { if (cancelAnalyze.current === controller) { setBusy(false); cancelAnalyze.current = null; } }
  }

  async function saveCloud() {
    setSaving(true); setError("");
    const actingUser = projectUser;
    const version = analysisVersion.current;
    try {
      const project: SavedProject = { version: 1, id: projectId || crypto.randomUUID(), title: circuit.title, updatedAt: new Date().toISOString(), circuit, boardOptions, layout, completedSteps, experimentId };
      const res = await electronicsAdminFetch(actingUser, "/api/admin/electronics/projects", { method: "POST", body: JSON.stringify(project) }); const data = await res.json();
      if (readyUser.current !== actingUser || analysisVersion.current !== version) return;
      if (!res.ok || !data.ok) throw new Error(data.message || "클라우드에 저장하지 못했습니다.");
      setProjectId(project.id); setMessage("내 관리자 계정의 비공개 프로젝트에 저장했습니다."); setProjects(saveLocalProject(projectUser, project));
    } catch (e) { if (readyUser.current === actingUser) setError(e instanceof Error ? e.message : "저장하지 못했습니다."); }
    finally { if (readyUser.current === actingUser) setSaving(false); }
  }

  async function loadCloud() {
    setSaving(true); setError("");
    const actingUser = projectUser;
    try {
      const res = await electronicsAdminFetch(actingUser, "/api/admin/electronics/projects"); const data = await res.json();
      if (readyUser.current !== actingUser) return;
      if (!res.ok || !data.ok) throw new Error(data.message || "프로젝트를 불러오지 못했습니다.");
      const items: SavedProject[] = data.projects;
      const local = readLocalProjects(projectUser);
      const combined = new Map(local.map(p => [p.id, p]));
      for (const p of items) { const existing = combined.get(p.id); if (!existing || p.updatedAt > existing.updatedAt) combined.set(p.id, p); }
      const sorted = [...combined.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 30);
      setProjects(sorted); setCloudLoaded(true); setMessage(`내 프로젝트 ${items.length}개를 불러왔습니다.${data.skipped ? ` 형식을 확인할 수 없는 ${data.skipped}개는 제외했습니다.` : ""}`);
    } catch (e) { if (readyUser.current === actingUser) setError(e instanceof Error ? e.message : "프로젝트를 불러오지 못했습니다."); }
    finally { if (readyUser.current === actingUser) setSaving(false); }
  }

  function openProject(p: SavedProject) {
    try {
      if (!isSavedProjectMetadata(p)) throw new Error("프로젝트 메타데이터 형식이 올바르지 않습니다.");
      const next = parseCircuit(p.circuit, COMPONENT_CATALOG);
      const options: BoardOptions = { boards: p.boardOptions.boards === 2 ? 2 : 1, railMode: p.boardOptions.railMode === "continuous" ? "continuous" : "split" };
      setBoardOptions(options); applyCircuit(next, options); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false);
      if (p.layout) {
        const restored = { ...p.layout, board: createBoard(options) };
        if (restored.board?.options?.boards === options.boards && restored.board.options.railMode === options.railMode && Array.isArray(restored.placements) && Array.isArray(restored.jumpers) && Array.isArray(restored.terminals)) {
          // Validation is re-run, so edited or outdated placement never inherits a previous success status.
          validateLayout(next, COMPONENT_CATALOG, restored); setLayout(restored);
        }
      }
      setCompletedSteps(p.completedSteps || []); setProjectId(p.id); if (p.experimentId) setExperimentId(p.experimentId); setView("board"); setMessage("프로젝트를 불러오고 배선을 다시 검사했습니다.");
      return true;
    } catch { setError("이 프로젝트 형식을 읽지 못했습니다. 회로 JSON을 확인해 주세요."); return false; }
  }

  function exportAssembly() {
    const lines = [circuit.title, "", `보드: ${boardOptions.boards}장 · 레일 ${boardOptions.railMode === "split" ? "중앙 분리" : "연속"}`, `배선 검사: ${report.valid ? "통과" : "오류 확인 필요"} · 실제 성능 검증 전`, "", ...steps.map((s, i) => `${i + 1}. ${s.title}\n   ${s.description}\n   ${s.holes.join(" ↔ ")}`), "", "검토 사항", ...report.issues.map(i => `- ${i.message}`), ...circuit.notes.map(n => `- ${n}`)];
    downloadText(`${circuit.title}-조립안내.txt`, lines.join("\n"), "text/plain;charset=utf-8");
  }

  function exportSvg() {
    const svg = document.getElementById("electronics-breadboard"); if (!svg) return;
    const copy = svg.cloneNode(true) as SVGElement; copy.setAttribute("width", String(layout.board.width)); copy.setAttribute("height", String(layout.board.height)); copy.removeAttribute("style");
    downloadText(`${circuit.title}-빵판.svg`, new XMLSerializer().serializeToString(copy), "image/svg+xml;charset=utf-8");
  }

  function movePin(holeId: string) {
    if (!pickingPin) return;
    setUndoStack(s => [...s.slice(-19), layout]);
    setLayout(l => ({ ...l, placements: l.placements.map(p => p.componentId === pickingPin.componentId ? { ...p, pins: { ...p.pins, [pickingPin.pinId]: holeId } } : p) }));
    setPickingPin(null); setCompletedSteps([]); setMessage("핀 위치를 변경했습니다. 연결 검사 결과를 확인하세요.");
  }

  function addComponent(definitionId: string) {
    const definition = COMPONENT_CATALOG.find(d => d.id === definitionId);
    if (!definition || !definition.pins.length || definition.mounting !== "direct" || definition.pinoutStatus === "unverified") return;
    if (circuit.components.length >= 80) { setError("한 회로에는 최대 80개 소자를 사용할 수 있습니다."); return; }
    const prefix = definition.kind === "resistor" ? "R" : ["capacitor", "electrolytic"].includes(definition.kind) ? "C" : ["transistor", "mosfet"].includes(definition.kind) ? "Q" : ["diode", "led"].includes(definition.kind) ? "D" : "U";
    let n = 1; while (circuit.components.some(c => c.id === `${prefix}${n}`)) n++;
    const id = `${prefix}${n}`;
    const pinNets = Object.fromEntries(definition.pins.map(p => [p.id, `${id}_P${p.id}`]));
    const next = { ...circuit, components: [...circuit.components, { id, definitionId, value: definition.kind === "resistor" ? "10kΩ" : definition.name, pinNets }], netNames: { ...circuit.netNames, ...Object.fromEntries(Object.values(pinNets).map(net => [net, net])) } };
    applyCircuit(next); setVisibleLayers(current => [...new Set([...current, componentLayer(definition.kind)])]); setDetailsOpen(true); setSelection({ type: "component", id }); setView("board"); setMessage(`${id}을 추가했습니다. 상세창에서 각 핀의 연결을 지정하세요.`);
  }

  function changePinNet(componentId: string, pinId: string, netId: string) {
    if (!netId) return;
    const next = { ...circuit, components: circuit.components.map(c => c.id === componentId ? { ...c, pinNets: { ...c.pinNets, [pinId]: netId } } : c) };
    applyCircuit(next); setSelection({ type: "component", id: componentId });
  }

  function changeLayers(next: BoardLayer[]) {
    setVisibleLayers(next); setStepIndex(null); setPickingPin(null);
    if (!isBoardSelectionVisible(selection, circuit, COMPONENT_CATALOG, next)) setSelection(null);
  }

  function selectItem(next: BoardSelection) {
    if (next?.type === "component") {
      const definition = COMPONENT_CATALOG.find(d => d.id === circuit.components.find(c => c.id === next.id)?.definitionId);
      if (definition) setVisibleLayers(current => [...new Set([...current, componentLayer(definition.kind)])]);
    } else if (next?.type === "jumper" || next?.type === "terminal") {
      const layer = next.type === "jumper" ? "jumper" : "instrument";
      setVisibleLayers(current => [...new Set<BoardLayer>([...current, layer])]);
    }
    setSelection(next); setStepIndex(null); setPickingPin(null);
    if (next) setDetailsOpen(true);
  }

  function showStep(index: number) {
    const bounded = Math.max(0, Math.min(steps.length - 1, index));
    const layer = layerForAssemblyStep(steps[bounded], circuit, COMPONENT_CATALOG);
    if (layer) setVisibleLayers(current => [...new Set([...current, layer])]);
    setStepIndex(bounded); setSelection(null); setPickingPin(null); setDetailsOpen(false);
  }

  if (!authChecked) return <main className="el-loading">관리자 계정을 확인하고 있습니다…</main>;
  if (!isAdminUser(user)) return <main className="el-loading"><h1>관리자 전용 실험실입니다</h1><p>관리자 계정으로 로그인한 뒤 이용해 주세요.</p><Link href="/">사이트로 돌아가기 →</Link></main>;
  if (workspaceOwner !== projectUser) return <main className="el-loading">내 실험 공간을 준비하고 있습니다…</main>;

  return <main className="electronics-app">
    <header className="el-app-header">
      <div className="el-brand"><span className="el-brand-mark"><Icon name="chip" size={25} /></span><div><p>ROUTE · ENGINEERING</p><h1>전자공학 실험실 <span>Beta</span></h1></div></div>
      <div className="el-header-actions"><span className="el-autosave"><i /> 브라우저 자동 저장</span><button className="el-button" onClick={() => { setJsonText(JSON.stringify(circuit, null, 2)); setJsonOpen(true); setDrawer(null); }}>회로 JSON</button><button className="el-button el-primary" disabled={saving} onClick={saveCloud}><Icon name="save" />{saving ? "저장 중…" : "클라우드 저장"}</button></div>
    </header>
    <div className="el-workspace-tools">
      <button className="el-experiment-picker" onClick={() => setDrawer("experiments")} aria-haspopup="dialog"><Icon name="book" /><span><small>실험 선택</small><b>{experiment.title}</b></span><span aria-hidden="true">⌄</span></button>
      <button className="el-button" onClick={() => setDrawer("sources")}><Icon name="upload" />자료 업로드</button>
      <button className="el-button" onClick={() => setDrawer("projects")}><Icon name="save" />저장함</button>
      <button className={`el-button el-chat-toggle ${chatOpen ? "active" : ""}`} aria-pressed={chatOpen} onClick={() => setChatOpen(open => !open)}><Icon name="spark" />Gemini 질문</button>
    </div>
    <div className={`el-app-grid ${chatOpen ? "with-chat" : "without-chat"}`}>


      <section className="el-main">
        <nav className="el-view-tabs" aria-label="실험실 보기"><button className={view === "board" ? "active" : ""} onClick={() => setView("board")}><Icon name="board" />빵판 설계</button><button className={view === "experiments" ? "active" : ""} onClick={() => setView("experiments")}><Icon name="book" />실험 가이드</button><button className={view === "catalog" ? "active" : ""} onClick={() => setView("catalog")}><Icon name="parts" />소자 도감 <span>{COMPONENT_CATALOG.length}</span></button><button className="el-new-source" onClick={() => { setDrawer("sources"); }}><Icon name="upload" />자료에서 설계</button></nav>
        {(message || error) && <div className={`el-notice ${error ? "error" : ""}`} role={error ? "alert" : "status"}><span>{error || message}</span><button aria-label="알림 닫기" onClick={() => { setMessage(""); setError(""); }}>×</button></div>}

        {view === "board" && <>
          <div className="el-circuit-heading"><div><p className="el-eyebrow">BREADBOARD DESIGN</p><input aria-label="설계 이름" value={circuit.title} onChange={e => setCircuit(c => ({ ...c, title: e.target.value.slice(0, 120) }))} /><p>{circuit.description}</p></div><span className={`el-status ${report.valid ? "ok" : "needs-review"}`}>{report.valid ? <Icon name="check" size={15} /> : <span>!</span>}{report.valid ? "연결 검사 통과" : "배선 확인 필요"}</span></div>
          <details className="el-board-settings"><summary>빵판 설정 <span>{boardOptions.boards === 1 ? "830홀 · 1장" : "1660홀 · 2장"} / {boardOptions.railMode === "split" ? "레일 중앙 분리" : "레일 연속"}</span></summary>          <div className="el-board-options"><label>빵판 <select aria-label="빵판 구성" value={boardOptions.boards} onChange={e => { const next: BoardOptions = { ...boardOptions, boards: Number(e.target.value) === 2 ? 2 : 1 }; setBoardOptions(next); applyCircuit(circuit, next); }}><option value={1}>사진형 단일판 · 830홀</option><option value={2}>단일판 2장 · 1660홀</option></select></label><label>전원 레일 <select aria-label="전원 레일 구조" value={boardOptions.railMode} onChange={e => { const next: BoardOptions = { ...boardOptions, railMode: e.target.value === "continuous" ? "continuous" : "split" }; setBoardOptions(next); applyCircuit(circuit, next); }}><option value="split">중앙 분리</option><option value="continuous">연속 연결</option></select></label><label className="el-checkbox"><input type="checkbox" checked={labelsVisible} onChange={e => setLabelsVisible(e.target.checked)} />소자 번호</label><button className="el-button el-small" onClick={() => { applyCircuit(circuit); setMessage("전체 소자와 점퍼를 다시 배치하고 연결을 검사했습니다."); }}>전체 자동 배치</button></div></details>
          <div className="el-layer-panel" aria-label="빵판 표시 필터">
            <div className="el-layer-top"><b>표시할 항목</b><label>한 종류만 보기 <select aria-label="한 종류만 보기" value={visibleLayers.length === ALL_BOARD_LAYERS.length ? "all" : visibleLayers.length === 1 ? visibleLayers[0] : "custom"} onChange={e => { if (e.target.value === "all") changeLayers([...ALL_BOARD_LAYERS]); else if (e.target.value !== "custom") changeLayers([e.target.value as BoardLayer]); }}><option value="all">전체 보기</option><option value="custom" disabled>직접 선택</option>{BOARD_LAYERS.map(layer => <option key={layer.id} value={layer.id}>{layer.label}만</option>)}</select></label></div>
            <div className="el-layer-chips"><button className={visibleLayers.length === ALL_BOARD_LAYERS.length ? "active" : ""} aria-pressed={visibleLayers.length === ALL_BOARD_LAYERS.length} onClick={() => changeLayers([...ALL_BOARD_LAYERS])}>전체</button>{BOARD_LAYERS.map(layer => <button key={layer.id} className={visibleLayers.includes(layer.id) ? "active" : ""} aria-pressed={visibleLayers.includes(layer.id)} onClick={() => changeLayers(visibleLayers.includes(layer.id) ? visibleLayers.filter(id => id !== layer.id) : [...visibleLayers, layer.id])}><span className={`el-layer-dot ${layer.id}`} />{layer.label}<small>{layerCounts[layer.id]}</small></button>)}</div>
            {visibleLayers.length !== ALL_BOARD_LAYERS.length && <p className="el-filter-notice">선택한 종류만 표시 중 · 전체 회로와 연결 검사는 그대로 유지됩니다.<button className="el-text-button" onClick={() => changeLayers([...ALL_BOARD_LAYERS])}>전체 복원</button></p>}
          </div>
          <Breadboard circuit={circuit} definitions={COMPONENT_CATALOG} layout={layout} selection={selection} onSelect={selectItem} activeStep={stepIndex !== null ? steps[stepIndex] : undefined} visibleLayers={visibleLayers} labelsVisible={labelsVisible} onHolePick={pickingPin ? movePin : undefined} zoom={zoom} onZoom={setZoom} />
          <div className="el-design-stats"><div><b>{circuit.components.length}</b><span>소자</span></div><div><b>{layout.jumpers.length}</b><span>점퍼선</span></div><div><b>{report.checkedNets}</b><span>연결 노드</span></div><div><b>{circuit.instruments.length}</b><span>장비 연결</span></div><div className="el-stats-note">물리 연결 검사 기준<br /><strong>동작·성능 검증 전</strong></div></div>
          <details className="el-selection-panel" open={detailsOpen} onToggle={event => setDetailsOpen(event.currentTarget.open)}><summary>선택 항목 · 핀 위치 <span>{selectedComponent ? `${selectedComponent.id} · ${selectedDefinition?.name}` : selectedJumper ? selectedJumper.id : selectedTerminal ? selectedTerminal.port : "소자를 클릭하면 상세 정보가 열립니다"}</span></summary>
      <aside className="el-inspector"><div className="el-inspector-title"><h2>선택한 항목</h2>{selection && <button className="el-text-button" onClick={() => { setSelection(null); setPickingPin(null); }}>해제</button>}</div>{selectedComponent && selectedDefinition ? <><span className="el-detail-ref">{selectedComponent.id}</span><h3>{selectedDefinition.name}</h3><p className="el-detail-package">{selectedDefinition.package}</p><label className="el-field-label">부품값<input value={selectedComponent.value} onChange={e => setCircuit(c => ({ ...c, components: c.components.map(v => v.id === selectedComponent.id ? { ...v, value: e.target.value.slice(0, 80) } : v) }))} /></label><p className="el-detail-description">{selectedDefinition.description}</p><div className="el-section-label">핀 · 꽂을 위치</div><div className="el-pin-table">{selectedDefinition.pins.map(pin => <div key={pin.id}><span><b>{pin.id}</b> {pin.label}<select aria-label={`${selectedComponent.id} ${pin.id}번 핀 연결`} value={selectedComponent.pinNets[pin.id]} onChange={e => changePinNet(selectedComponent.id, pin.id, e.target.value)}>{Object.entries(circuit.netNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></span><button className={pickingPin?.pinId === pin.id ? "active" : ""} onClick={() => setPickingPin({ componentId: selectedComponent.id, pinId: pin.id })}>{selectedPlacement?.pins[pin.id] || "미배치"}<small>위치 변경 ↗</small></button></div>)}</div>{pickingPin && <div className="el-soft-box">빵판에서 새 구멍을 클릭하세요.<button className="el-text-button" onClick={() => setPickingPin(null)}>취소</button></div>}<p className="el-small-note">핀 하나를 옮기면 기존 점퍼 연결을 다시 확인해야 합니다.</p>{selectedDefinition.sourceUrl && <a className="el-datasheet" href={selectedDefinition.sourceUrl} target="_blank" rel="noreferrer">데이터시트 열기 ↗</a>}</> : selectedJumper ? <><span className="el-detail-ref">{selectedJumper.id}</span><h3>점퍼선</h3><p>{circuit.netNames[selectedJumper.netId] || selectedJumper.netId}</p><div className="el-endpoint"><span>시작</span><b>{selectedJumper.from}</b></div><div className="el-endpoint"><span>끝</span><b>{selectedJumper.to}</b></div><button className="el-button el-full" onClick={() => { const i = steps.findIndex(s => s.jumperId === selectedJumper.id); if (i >= 0) { showStep(i); } }}>이 점퍼의 조립 단계</button></> : selectedTerminal ? <><span className="el-detail-ref">장비 연결</span><h3>{selectedTerminal.instrument}</h3><div className="el-endpoint"><span>단자</span><b>{selectedTerminal.port}</b></div><div className="el-endpoint"><span>구멍</span><b>{layout.terminals.find(t => t.connectionId === selectedTerminal.id)?.holeId}</b></div><p className="el-detail-description">{selectedTerminal.setting}</p></> : selection?.type === "hole" ? <><span className="el-detail-ref">구멍 좌표</span><h3>{selection.id}</h3><p className="el-detail-description">내부 연결 그룹: {layout.board.holes.find(h => h.id === selection.id)?.group}</p><p className="el-small-note">같은 그룹의 구멍은 빵판 내부에서 전기적으로 연결됩니다.</p></> : <div className="el-empty-inspector"><span><Icon name="chip" size={34} /></span><h3>소자를 선택해 보세요</h3><p>이름, 값, 핀 방향과<br />정확한 구멍 위치를 보여줍니다.</p><div><b>HOVER</b> 이름·값 빠르게 보기<br /><b>CLICK</b> 상세 정보 고정<br /><b>STEP</b> 하나씩 따라 꽂기</div></div>}
        <div className="el-inspector-instruments"><div className="el-section-label">계측기 연결 <span>{circuit.instruments.length}</span></div>{circuit.instruments.map((connection, index) => <button key={connection.id} onClick={() => { selectItem({ type: "terminal", id: connection.id }); }}><b>T{index + 1}</b><span>{connection.port}<small>{connection.instrument} · {layout.terminals.find(t => t.connectionId === connection.id)?.holeId || "미배치"}</small></span></button>)}</div><div className="el-inspector-components"><div className="el-section-label">사용 소자 <span>{circuit.components.length}</span></div>{circuit.components.map(c => <button key={c.id} className={selectedComponent?.id === c.id ? "active" : ""} onClick={() => { selectItem({ type: "component", id: c.id }); }}><b>{c.id}</b><span>{c.value}<small>{COMPONENT_CATALOG.find(d => d.id === c.definitionId)?.name || c.definitionId}</small></span></button>)}</div>{undoStack.length > 0 && <button className="el-button el-full" onClick={() => { const last = undoStack[undoStack.length - 1]; setLayout(last); setUndoStack(s => s.slice(0, -1)); }}>위치 변경 실행 취소</button>}
      </aside>
          </details>
          <section className="el-assembly"><div className="el-assembly-title"><div><span className="el-mini-tag">BUILD GUIDE</span><h2>화면 그대로, 하나씩 꽂기</h2></div><span>{completedSteps.length} / {steps.length} 완료</span></div>{stepIndex === null ? <div className="el-assembly-start"><p>소자 방향과 구멍 좌표, 점퍼의 양 끝을 단계마다 확인합니다.</p><button className="el-button el-primary" disabled={!steps.length} onClick={() => showStep(0)}>조립 안내 시작 <Icon name="arrow" /></button></div> : steps[stepIndex] && <div className="el-step"><div className="el-step-number">{stepIndex + 1}</div><div className="el-step-copy"><b>{steps[stepIndex].title}</b><p>{steps[stepIndex].description}</p><div className="el-hole-chips">{steps[stepIndex].holes.map(h => <span key={h}>{h}</span>)}</div></div><div className="el-step-actions"><label><input type="checkbox" checked={completedSteps.includes(steps[stepIndex].id)} onChange={e => setCompletedSteps(s => e.target.checked ? [...new Set([...s, steps[stepIndex].id])] : s.filter(id => id !== steps[stepIndex].id))} /> 완료</label><button className="el-button el-small" disabled={stepIndex === 0} onClick={() => showStep((stepIndex || 0) - 1)}>이전</button><button className="el-button el-small el-primary" disabled={stepIndex >= steps.length - 1} onClick={() => showStep((stepIndex || 0) + 1)}>다음</button><button className="el-text-button" onClick={() => setStepIndex(null)}>안내 닫기</button></div></div>}</section>
          <details className="el-checks-panel"><summary>연결 검사 · 원문 확인 <span>{report.issues.filter(i => i.severity === "error").length}개 오류 / {openReviews.length}개 미확인</span></summary><div className="el-bottom-grid"><section className="el-card"><div className="el-card-title"><h2>연결 검사</h2><span className="el-mini-tag">{report.checkedPins} pins</span></div>{report.issues.length ? <ul className="el-issues">{report.issues.map((i, index) => <li key={`${i.code}-${index}`} className={i.severity}><span>{i.severity === "error" ? "!" : "i"}</span>{i.message}</li>)}</ul> : <p className="el-success-text"><Icon name="check" />목표 회로와 빵판의 연결이 일치합니다.</p>}<p className="el-small-note">실제 소자의 정격, 핀 방향과 계측기 내부 접지는 별도로 확인하세요. 사진만으로 전원 레일 내부 연결을 확정할 수 없습니다.</p></section><section className="el-card"><div className="el-card-title"><h2>원문·조건 확인</h2><span className="el-mini-tag">{openReviews.length}개 미확인</span></div>{circuit.reviewItems.map(item => <label className="el-review" key={item.id}><input type="checkbox" checked={item.resolved} onChange={e => setCircuit(c => ({ ...c, reviewItems: c.reviewItems.map(i => i.id === item.id ? { ...i, resolved: e.target.checked } : i) }))} /><span>{item.message}</span></label>)}{circuit.notes.map((n, i) => <p className="el-note" key={i}>{n}</p>)}{circuit.provenance && <p className="el-small-note">출처: {circuit.provenance}</p>}</section></div></details>
          <div className="el-export"><span>설계와 조립 좌표를 내보내기</span><button className="el-button el-small" onClick={exportSvg}><Icon name="download" size={14} />현재 보기 SVG</button><button className="el-button el-small" onClick={exportAssembly}>조립 안내 TXT</button><button className="el-button el-small" onClick={() => downloadText(`${circuit.title}.json`, JSON.stringify({ version: 1, id: projectId, title: circuit.title, updatedAt: new Date().toISOString(), circuit, boardOptions, layout, completedSteps, experimentId }, null, 2))}>프로젝트 JSON</button></div>
        </>}

        {view === "experiments" && <section className="el-guide"><div className="el-guide-top"><span className="el-guide-number">{experiment.number}</span><div><p className="el-eyebrow">COURSE EXPERIMENT</p><h2>{experiment.title}</h2><p>{experiment.summary}</p></div></div><div className="el-topic-chips">{experiment.topics.map(t => <span key={t}>{t}</span>)}</div><div className="el-guide-section"><h3>회로 예제와 설계</h3>{experiment.templateIds.length ? <div className="el-template-grid">{experiment.templateIds.map(id => { const t = CIRCUIT_TEMPLATES.find(t => t.id === id); return t ? <button key={id} onClick={() => openTemplate(id)}><span><Icon name="board" /></span><b>{t.title}</b><p>{t.description}</p><small>{t.components.length}개 소자 · 배치도 열기 →</small></button> : null; })}</div> : <div className="el-soft-box">이 실험은 계측 또는 소프트웨어 신호처리가 중심입니다. 아래 연결·설정과 실험 절차를 확인하세요.</div>}</div><div className="el-bottom-grid"><section className="el-card"><h3>계측기·실험 설정</h3><dl className="el-setting-list">{experiment.settings.map((s, i) => <div key={i}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl></section><section className="el-card"><h3>실험 절차</h3><ol className="el-procedure">{experiment.procedure.map((p, i) => <li key={i}><b>{String(i + 1).padStart(2, "0")}</b><span>{p}</span></li>)}</ol></section></div><div className="el-future"><span className="el-mini-tag">후속 실행 기능</span><h3>같은 프로젝트에서 이어질 분석</h3><p>{experiment.future.join(" · ")}</p><small>현재는 연결·설정 안내를 제공합니다. 파형·시뮬레이션 계산은 이후 구현 범위입니다.</small></div><button className="el-button el-primary" onClick={() => { setDrawer("sources"); setSourceText(`${experiment.title}\n실험 조건: ${experiment.settings.map(s => `${s.label}: ${s.value}`).join("; ")}\n`); }}>이 실험의 PDF·사진으로 설계 <Icon name="arrow" /></button></section>}

        {view === "catalog" && <section className="el-catalog"><p className="el-eyebrow">COMPONENT LIBRARY</p><h2>실험에 필요한 소자, 한곳에서</h2><p>정확한 패키지와 핀맵, 직접 삽입 가능 여부를 확인합니다.</p><div className="el-catalog-search"><input aria-label="소자 검색" placeholder="품번, 종류, 패키지 검색…" value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)} /><select aria-label="소자 분류" value={catalogCategory} onChange={e => setCatalogCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div><div className="el-catalog-info"><b>{filteredCatalog.length}개 항목</b><span>등록 · 핀맵 확인 · 배치 지원 상태를 구분합니다.</span></div><div className="el-catalog-grid">{filteredCatalog.map(d => <article key={d.id}><div className="el-catalog-card-top"><span className="el-part-symbol">{d.kind === "resistor" ? "▰" : d.kind === "capacitor" || d.kind === "electrolytic" ? "⊣⊢" : d.kind === "diode" ? "▷│" : "▣"}</span><span className={`el-part-status ${d.pinoutStatus === "unverified" ? "pending" : ""}`}>{d.pinoutStatus === "unverified" ? "핀맵 확인 전" : d.pinoutStatus === "datasheet" ? "자료 확인" : "범용 모델"}</span></div><h3>{d.name}</h3><div className="el-part-meta">{d.category} · {d.package}</div><p>{d.description}</p><div className="el-pin-preview">{d.pins.slice(0, 8).map(p => <span key={p.id}>{p.id}: {p.label}</span>)}{d.pins.length > 8 && <span>+{d.pins.length - 8}핀</span>}</div><footer><span>{d.mounting === "direct" ? "직접 삽입" : d.mounting === "adapter" ? "어댑터 필요" : "외부 연결"}</span>{d.sourceUrl && <a href={d.sourceUrl} target="_blank" rel="noreferrer">데이터시트 ↗</a>}</footer>{d.mounting === "direct" && d.pinoutStatus !== "unverified" && d.pins.length > 0 && <button className="el-button el-small" style={{ marginTop: 12 }} onClick={() => addComponent(d.id)}>현재 회로에 추가 +</button>}</article>)}</div></section>}
      </section>

      <aside className="el-chat-rail" hidden={!chatOpen} aria-label="Gemini 질문 패널">
        <ElectronicsChat key={`${projectUser}:${projectId}`} ownerId={projectUser} circuit={circuit} boardOptions={boardOptions} layout={layout} selection={selection} onClose={() => setChatOpen(false)} />
      </aside>
    </div>
    {drawer && <WorkspaceDrawer title={drawer === "experiments" ? "수업 실험 선택" : drawer === "sources" ? "내 자료로 설계" : "내 프로젝트"} onClose={() => setDrawer(null)}>
      <aside className="el-sidebar">
        {(message || error) && <div className={`el-notice ${error ? "error" : ""}`} role={error ? "alert" : "status"}><span>{error || message}</span><button aria-label="알림 닫기" onClick={() => { setMessage(""); setError(""); }}>×</button></div>}

        <div className="el-sidebar-tabs"><button className={drawer === "experiments" ? "active" : ""} onClick={() => setDrawer("experiments")}>수업 실험</button><button className={drawer === "sources" ? "active" : ""} onClick={() => setDrawer("sources")}>내 자료</button><button className={drawer === "projects" ? "active" : ""} onClick={() => setDrawer("projects")}>저장함</button></div>
        {drawer === "experiments" && <><div className="el-section-label">고급전자회로실험 <span>{EXPERIMENTS.length}개 가이드</span></div><div className="el-experiment-list">{EXPERIMENTS.map(e => <button key={e.id} className={experiment.id === e.id ? "active" : ""} onClick={() => { setExperimentId(e.id); setView("experiments"); setSelection(null); setPickingPin(null); setStepIndex(null); setDrawer(null); }}><span className="el-experiment-number">{e.number}</span><span><b>{e.title}</b><small>{modes[e.mode]}</small></span>{experiment.id === e.id && <i />}</button>)}</div><div className="el-sidebar-note"><Icon name="book" /><span>회로·계측·신호처리를<br />실험별로 연결해 봅니다.</span></div></>}
        {drawer === "sources" && <div className="el-source-panel"><h3>실험 자료로 설계하기</h3><p>회로도와 본문 조건을 함께 올려 주세요.</p><label className="el-dropzone" htmlFor={inputId}><Icon name="upload" size={28} /><b>PDF·사진 추가</b><span>최대 4개 · 합계 2.8MB</span></label><input id={inputId} type="file" hidden multiple accept="application/pdf,image/png,image/jpeg,image/webp" onChange={e => { void addFiles(e.target.files); e.target.value = ""; }} />{files.map((f, i) => <div className="el-file" key={`${f.name}-${i}`}><span>{f.name}<small>{Math.round(f.size / 1024)} KB</small></span><button aria-label={`${f.name} 제거`} onClick={() => setFiles(f => f.filter((_, j) => i !== j))}>×</button></div>)}<label className="el-field-label" htmlFor="el-source-text">추가 조건 또는 회로 설명</label><textarea id="el-source-text" maxLength={20000} value={sourceText} onChange={e => setSourceText(e.target.value)} placeholder="예: 회로의 트랜스는 사용하지 않고 커패시터 두 개로 입력합니다. 전원은 9V입니다." rows={7} /><button className="el-button el-primary el-full" disabled={busy} onClick={analyze}><Icon name="spark" />{busy ? "자료 분석 중…" : "자료 분석 · 전체 설계"}</button>{busy && <button className="el-button el-full" onClick={() => cancelAnalyze.current?.abort()}>분석 취소</button>}<button className="el-button el-full" onClick={() => { setJsonText(JSON.stringify(circuit, null, 2)); setJsonOpen(true); setDrawer(null); }}>ChatGPT 설계 가져오기</button><p className="el-small-note">분석 결과는 원문 확인이 필요한 초안입니다. 불명확한 소자·핀·연결은 검토 항목으로 표시합니다.</p></div>}
        {drawer === "projects" && <div className="el-saved-panel"><button className="el-button el-full" disabled={saving} onClick={loadCloud}><Icon name="save" />{cloudLoaded ? "클라우드 새로고침" : "내 클라우드 프로젝트"}</button><div className="el-section-label">최근 프로젝트 <span>{projects.length}</span></div>{projects.map(p => <button key={p.id} className="el-project-card" onClick={() => { if (openProject(p)) setDrawer(null); }}><b>{p.title}</b><span>{new Date(p.updatedAt).toLocaleString("ko-KR")}</span><small>{p.circuit.components.length}개 소자 · {p.boardOptions.boards}장</small></button>)}{!projects.length && <p className="el-small-note">작업을 시작하면 이 브라우저에 자동 저장됩니다.</p>}</div>}
      </aside>
    </WorkspaceDrawer>}
    {jsonOpen && <div className="el-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setJsonOpen(false); }}><section className="el-modal" role="dialog" aria-modal="true" aria-labelledby="el-json-title"><div className="el-card-title"><h2 id="el-json-title">ChatGPT 설계 가져오기 · 회로 편집</h2><button className="el-button" onClick={() => setJsonOpen(false)}>닫기</button></div><p>이 채팅에서 만든 설계 파일을 불러오면 같은 배치 엔진으로 생성하고 검사합니다. 회로 또는 프로젝트 JSON을 붙여 넣거나 선택하세요.</p><label className="el-json-import">JSON 파일 불러오기<input type="file" accept="application/json,.json" onChange={async e => { const file = e.target.files?.[0]; if (file && file.size < 3_000_000) { const owner = projectUser; const version = analysisVersion.current; const json = await file.text(); if (readyUser.current === owner && analysisVersion.current === version) setJsonText(json); } else if (file) setError("JSON 파일은 3MB 미만으로 선택하세요."); }} /></label><textarea aria-label="회로 JSON" value={jsonText} onChange={e => setJsonText(e.target.value)} spellCheck={false} />{error && <div className="el-notice error" role="alert">{error}</div>}<div className="el-modal-actions"><button className="el-button el-primary" onClick={() => { try { const value = JSON.parse(jsonText); if (value.version === 1 && value.circuit) { if (!openProject(value)) return; } else { applyCircuit(parseCircuit(value, COMPONENT_CATALOG)); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false); setProjectId(crypto.randomUUID()); } setJsonOpen(false); setView("board"); } catch (e) { setError(e instanceof Error ? e.message : "JSON 형식을 확인해 주세요."); } }}>적용 · 전체 재배치</button></div></section></div>}
  </main>;
}
