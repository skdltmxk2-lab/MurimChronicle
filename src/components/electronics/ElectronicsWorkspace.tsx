"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { electronicsAdminFetch } from "@/lib/electronics/api";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { COURSE_SUPPORT_SCOPE, EXPERIMENTS } from "@/lib/electronics/experiments";
import { CIRCUIT_TEMPLATES } from "@/lib/electronics/templates";
import { createLayout, validateLayout, createAssemblySteps, moveComponentPlacement, moveComponentPinPlacement } from "@/lib/electronics/engine";
import { getPowerNetRole, getRailUsage } from "@/lib/electronics/power";
import { parseCircuit } from "@/lib/electronics/schema";
import { downloadText, readLocalProjects, saveLocalProject } from "@/lib/electronics/storage";
import { parseProjectForWorkspace } from "@/lib/electronics/project-input";
import type { BoardOptions, Circuit, CircuitLayout, SavedProject, ValidationReport } from "@/lib/electronics/types";
import { Breadboard, type BoardSelection } from "./Breadboard";
import { ALL_BOARD_LAYERS, BOARD_LAYERS, componentLayer, countBoardLayers, isBoardSelectionVisible, layerForAssemblyStep, type BoardLayer } from "@/lib/electronics/visibility";
import { ElectronicsChat } from "./ElectronicsChat";
import { WorkspaceDrawer } from "./WorkspaceDrawer";
import { defaultProbeHoles, resolveSimulationProbes, type ProbeHoles } from "@/lib/electronics/simulation-probes";
import { resolveProbeNet } from "@/lib/electronics/simulation-layout";
import { checkSourceAttachments, clipboardFiles, readSourceClipboard, SOURCE_TEXT_LIMIT } from "@/lib/electronics/clipboard";
import "./electronics.css";
import "./workspace-layout.css";
import "./source-clipboard.css";

type SourceFile = { name: string; mimeType: string; data: string; size: number };
const defaultBoard: BoardOptions = { boards: 1, railMode: "split" };
const modes = { circuit: "회로 조립", instruments: "계측 실습", signal: "신호처리", mixed: "회로 + 계측" };
const inputId = "electronics-source-file";
const SimulationPanel = dynamic(() => import("./SimulationPanel").then(module => module.SimulationPanel), { ssr: false, loading: () => <p role="status">파형 도구를 불러오는 중입니다…</p> });
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
  const [view, setView] = useState<"board" | "simulation" | "experiments" | "catalog">("board");
  const [probeHoles, setProbeHoles] = useState<ProbeHoles>([null, null]);
  const [pickingProbe, setPickingProbe] = useState<0 | 1 | null>(null);
  const [simulationOpened, setSimulationOpened] = useState(false);
  const [experimentId, setExperimentId] = useState("lab-0");
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sourceText, setSourceText] = useState("");
  const sourceTextRef = useRef(sourceText);
  sourceTextRef.current = sourceText;
  const [files, setFiles] = useState<SourceFile[]>([]);
  const filesRef = useRef(files);
  filesRef.current = files;
  const pendingAttachments = useRef({ count: 0, bytes: 0 });
  const [pasting, setPasting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("전체");
  const [visibleLayers, setVisibleLayers] = useState<BoardLayer[]>([...ALL_BOARD_LAYERS]);
  const [drawer, setDrawer] = useState<"experiments" | "sources" | "projects" | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [autoRearrange, setAutoRearrange] = useState(true);
  const [checksOpen, setChecksOpen] = useState(false);
  const [manualCheck, setManualCheck] = useState<{ circuit: Circuit; layout: CircuitLayout; report: ValidationReport } | null>(null);
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
  const currentProjectState = useRef({ projectId, circuit, layout, boardOptions, completedSteps, experimentId });
  currentProjectState.current = { projectId, circuit, layout, boardOptions, completedSteps, experimentId };
  const experiment = EXPERIMENTS.find(e => e.id === experimentId) || EXPERIMENTS[0];
  const courseSupport = COURSE_SUPPORT_SCOPE.find(item => item.id === experiment.id);
  const report = useMemo(() => validateLayout(circuit, COMPONENT_CATALOG, layout), [circuit, layout]);
  const steps = useMemo(() => createAssemblySteps(circuit, COMPONENT_CATALOG, layout), [circuit, layout]);
  const selectedComponent = selection?.type === "component" ? circuit.components.find(c => c.id === selection.id) : null;
  const selectedDefinition = COMPONENT_CATALOG.find(d => d.id === selectedComponent?.definitionId);
  const selectedPlacement = layout.placements.find(p => p.componentId === selectedComponent?.id);
  const selectedJumper = selection?.type === "jumper" ? layout.jumpers.find(j => j.id === selection.id) : null;
  const selectedTerminal = selection?.type === "terminal" ? circuit.instruments.find(i => i.id === selection.id) : null;
  const layerCounts = useMemo(() => countBoardLayers(circuit, COMPONENT_CATALOG, layout), [circuit, layout]);
  const railUsage = useMemo(() => getRailUsage(circuit, layout), [circuit, layout]);
  const powerNets = useMemo(() => [...new Set([...circuit.components.flatMap(component => Object.values(component.pinNets)), ...circuit.instruments.map(connection => connection.netId)])].filter(net => getPowerNetRole(circuit, net)), [circuit]);
  const missingRailNets = powerNets.filter(net => !railUsage.some(rail => rail.netIds.length === 1 && rail.netIds[0] === net));
  // A split rail's left/right segments can carry different nets without a short.
  const railLabels = railUsage;
  const openReviews = circuit.reviewItems.filter(i => !i.resolved);
  const categories = ["전체", ...new Set(COMPONENT_CATALOG.map(d => d.category))];
  const filteredCatalog = COMPONENT_CATALOG.filter(d => (catalogCategory === "전체" || d.category === catalogCategory) && `${d.name} ${d.description} ${d.package} ${d.id}`.toLowerCase().includes(catalogSearch.toLowerCase()));
  const probes = useMemo(() => resolveSimulationProbes(circuit, COMPONENT_CATALOG, layout, probeHoles), [circuit, layout, probeHoles]);
  const probeMarkers = useMemo(() => probes.flatMap((probe, channel) => probe.holeId ? [{ holeId: probe.holeId, label: `CH${channel + 1}${probe.netId ? "" : " ?"}`, color: channel === 0 ? "#d49124" : "#3c8ed4" }] : []), [probes]);
  const probeProject = useRef("");

  useEffect(() => {
    const key = `${projectUser}:${projectId}:${circuit.id}`;
    if (probeProject.current === key) return;
    probeProject.current = key;
    setProbeHoles(defaultProbeHoles(circuit, layout)); setPickingProbe(null);
  }, [projectUser, projectId, circuit, layout]);
  useEffect(() => { setPickingProbe(null); }, [circuit, layout, view]);
  useEffect(() => { if (pickingPin) setPickingProbe(null); }, [pickingPin]);
  useEffect(() => {
    if (pickingProbe === null) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); setPickingProbe(null); } };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [pickingProbe]);

  const applyCircuit = useCallback((next: Circuit, options: BoardOptions = boardOptions) => {
    analysisVersion.current += 1; cancelAnalyze.current?.abort(); cancelAnalyze.current = null; setBusy(false);
    setManualCheck(null); setChecksOpen(false); setCircuit(next); setLayout(createLayout(next, COMPONENT_CATALOG, options)); setSelection(null); setStepIndex(null); setCompletedSteps([]); setUndoStack([]); setPickingPin(null); setError("");
  }, [boardOptions]);

  useEffect(() => {
    const authorized = !!projectUser && isAdminUser(user);
    if (authorized && readyUser.current === projectUser) return;
    if (!authorized && readyUser.current === null) return;
    readyUser.current = authorized ? projectUser : null;
    analysisVersion.current += 1; cancelAnalyze.current?.abort(); cancelAnalyze.current = null;
    setBusy(false); setSaving(false); setPasting(false); setFiles([]); setSourceText(""); setCloudLoaded(false); setMessage(""); setError("");
    setJsonOpen(false); setJsonText(""); setView("board"); setDrawer(null); setExperimentId("lab-0"); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false); setAutoRearrange(true); setChecksOpen(false); setManualCheck(null);
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

  async function addFiles(list: FileList | File[] | null) {
    if (!list) return false;
    setError("");
    const incoming = Array.from(list);
    if (!incoming.length) return false;
    const actingUser = projectUser;
    const version = analysisVersion.current;
    try { checkSourceAttachments(filesRef.current, incoming, pendingAttachments.current); }
    catch (error) { setError(error instanceof Error ? error.message : "첨부 파일을 확인해 주세요."); return false; }
    const bytes = incoming.reduce((sum, file) => sum + file.size, 0);
    pendingAttachments.current.count += incoming.length; pendingAttachments.current.bytes += bytes;
    try {
      const added = await Promise.all(incoming.map(file => new Promise<SourceFile>((resolve, reject) => {
        if (!["application/pdf", "image/png", "image/jpeg", "image/webp"].includes(file.type)) { reject(new Error("PDF, PNG, JPG, WebP 파일을 선택하세요.")); return; }
        const reader = new FileReader(); reader.onload = () => resolve({ name: file.name, mimeType: file.type, data: String(reader.result).split(",")[1], size: file.size }); reader.onerror = () => reject(new Error("파일을 읽지 못했습니다.")); reader.readAsDataURL(file);
      })));
      if (readyUser.current === actingUser && analysisVersion.current === version) { filesRef.current = [...filesRef.current, ...added]; setFiles(filesRef.current); setDrawer("sources"); setMessage(`${added.length}개 자료를 추가했습니다. 내용을 확인한 뒤 분석하세요.`); return true; }
      return false;
    } catch (e) { if (readyUser.current === actingUser && analysisVersion.current === version) setError(e instanceof Error ? e.message : "파일을 읽지 못했습니다."); return false; }
    finally { pendingAttachments.current.count -= incoming.length; pendingAttachments.current.bytes -= bytes; }
  }

  function appendSourceText(text: string) {
    if (!text.trim()) return;
    const current = sourceTextRef.current;
    const next = current ? `${current}\n${text}` : text;
    if (next.length > SOURCE_TEXT_LIMIT) { setError("실험 조건은 20,000자 이하로 붙여넣어 주세요."); return; }
    sourceTextRef.current = next; setSourceText(next); setDrawer("sources"); setError(""); setMessage("클립보드의 텍스트를 추가 조건에 넣었습니다.");
  }

  function pasteSource(event: React.ClipboardEvent<HTMLElement>) {
    const attached = clipboardFiles(event.clipboardData);
    if (attached.length) { event.preventDefault(); void addFiles(attached); return; }
    const target = event.target as HTMLElement;
    if (target.isContentEditable || target.closest("input, textarea, [contenteditable=true]")) return;
    const text = event.clipboardData.getData("text/plain");
    if (text.trim()) { event.preventDefault(); appendSourceText(text); }
  }

  async function pasteFromButton() {
    if (pasting) return;
    const actingUser = projectUser, version = analysisVersion.current;
    setPasting(true); setError("");
    try {
      const pasted = await readSourceClipboard(navigator.clipboard);
      if (readyUser.current !== actingUser || analysisVersion.current !== version) return;
      if (pasted.files.length && !await addFiles(pasted.files)) return;
      if (readyUser.current !== actingUser || analysisVersion.current !== version) return;
      if (pasted.text.trim()) appendSourceText(pasted.text);
    } catch (error) {
      if (readyUser.current !== actingUser || analysisVersion.current !== version) return;
      setError(error instanceof Error && error.name !== "NotAllowedError" ? error.message : "클립보드 읽기가 허용되지 않았습니다. 아래 붙여넣기 영역을 클릭하고 Ctrl+V를 눌러 주세요.");
    } finally { if (readyUser.current === actingUser) setPasting(false); }
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
      // Persist the captured snapshot before awaiting the network. A late response
      // must never replace a newer edit already written by browser autosave.
      try { setProjects(saveLocalProject(actingUser, project)); } catch { /* Cloud saving still works when browser storage is full. */ }
      const res = await electronicsAdminFetch(actingUser, "/api/admin/electronics/projects", { method: "POST", body: JSON.stringify(project) }); const data = await res.json();
      if (readyUser.current !== actingUser || analysisVersion.current !== version) return;
      if (!res.ok || !data.ok) throw new Error(data.message || "클라우드에 저장하지 못했습니다.");
      const current = currentProjectState.current;
      const changed = current.circuit !== project.circuit || current.layout !== project.layout || current.boardOptions !== project.boardOptions || current.completedSteps !== project.completedSteps || current.experimentId !== project.experimentId;
      setProjectId(project.id); setMessage(changed ? "저장 버튼을 누른 시점의 설계를 클라우드에 저장했습니다. 이후 변경 내용은 다시 저장해 주세요." : "내 관리자 계정의 비공개 프로젝트에 저장했습니다.");
    } catch (e) { if (readyUser.current === actingUser && analysisVersion.current === version) setError(e instanceof Error ? e.message : "저장하지 못했습니다."); }
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
      const project = parseProjectForWorkspace(p, COMPONENT_CATALOG);
      // All parsing and layout validation have completed before any state changes.
      analysisVersion.current += 1; cancelAnalyze.current?.abort(); cancelAnalyze.current = null; setBusy(false);
      setBoardOptions(project.boardOptions); setCircuit(project.circuit); setLayout(project.layout);
      setManualCheck(null); setChecksOpen(false); setSelection(null); setStepIndex(null); setUndoStack([]); setPickingPin(null); setError("");
      setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false);
      setCompletedSteps(project.completedSteps); setProjectId(project.id); if (project.experimentId) setExperimentId(project.experimentId); setView("board"); setMessage("프로젝트를 불러오고 배선을 다시 검사했습니다.");
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
    dragPin(pickingPin.componentId, holeId, pickingPin.pinId);
    setPickingPin(null);
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

  function applyPositionChange(next: CircuitLayout, selected: BoardSelection) {
    analysisVersion.current += 1; cancelAnalyze.current?.abort(); cancelAnalyze.current = null; setBusy(false);
    setUndoStack(history => [...history.slice(-19), layout]); setLayout(next);
    setCompletedSteps([]); setStepIndex(null); setPickingPin(null); setSelection(selected); setError("");
    setMessage(autoRearrange ? "옮긴 위치를 고정하고 나머지 소자·배선을 다시 정리했습니다. 변경 검증으로 연결을 확인하세요." : "선택한 항목만 옮겼습니다. 기존 점퍼는 그대로이므로 변경 검증으로 연결을 확인하세요.");
  }

  function dragComponent(componentId: string, targetHoleId: string, anchorPinId: string) {
    const component = circuit.components.find(item => item.id === componentId);
    const definition = COMPONENT_CATALOG.find(item => item.id === component?.definitionId);
    const current = layout.placements.find(item => item.componentId === componentId);
    if (!component || !definition || !current) return;
    try {
      const moved = moveComponentPlacement(component, definition, current, targetHoleId, anchorPinId, layout.board);
      if (Object.keys(moved.pins).every(pin => moved.pins[pin] === current.pins[pin])) return;
      const next = autoRearrange ? createLayout(circuit, COMPONENT_CATALOG, boardOptions, { fixedPlacements: [moved] }) : { ...layout, placements: layout.placements.map(item => item.componentId === componentId ? moved : item) };
      applyPositionChange(next, { type: "component", id: componentId });
    } catch (e) { setError(e instanceof Error ? e.message : "이 위치로 소자를 옮길 수 없습니다."); }
  }

  function dragPin(componentId: string, targetHoleId: string, pinId: string) {
    const component = circuit.components.find(item => item.id === componentId);
    const definition = COMPONENT_CATALOG.find(item => item.id === component?.definitionId);
    const current = layout.placements.find(item => item.componentId === componentId);
    if (!component || !definition || !current || current.pins[pinId] === targetHoleId) return;
    try {
      const moved = moveComponentPinPlacement(component, definition, current, targetHoleId, pinId, layout.board);
      const next = autoRearrange ? createLayout(circuit, COMPONENT_CATALOG, boardOptions, { fixedPlacements: [moved] }) : { ...layout, placements: layout.placements.map(item => item.componentId === componentId ? moved : item) };
      applyPositionChange(next, { type: "component", id: componentId });
    } catch (e) { setError(e instanceof Error ? e.message : "이 위치로 다리를 옮길 수 없습니다."); }
  }

  function dragTerminal(connectionId: string, targetHoleId: string) {
    const current = layout.terminals.find(item => item.connectionId === connectionId);
    if (!current || current.holeId === targetHoleId || !layout.board.holes.some(hole => hole.id === targetHoleId)) return;
    try {
      const moved = { ...current, holeId: targetHoleId };
      const next = autoRearrange ? createLayout(circuit, COMPONENT_CATALOG, boardOptions, { fixedTerminals: [moved] }) : { ...layout, terminals: layout.terminals.map(item => item.connectionId === connectionId ? moved : item) };
      applyPositionChange(next, { type: "terminal", id: connectionId });
    } catch (e) { setError(e instanceof Error ? e.message : "이 위치로 단자를 옮길 수 없습니다."); }
  }

  function verifyChanges() {
    const result = validateLayout(circuit, COMPONENT_CATALOG, layout);
    setManualCheck({ circuit, layout, report: result }); setChecksOpen(true);
  }

  function beginProbePick(channel: 0 | 1) {
    setPickingPin(null); setSelection(null); setStepIndex(null); setPickingProbe(channel);
    requestAnimationFrame(() => document.getElementById("electronics-board-probes")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function pickProbeHole(holeId: string) {
    if (pickingProbe === null) return;
    try {
      const netId = resolveProbeNet(circuit, COMPONENT_CATALOG, layout, holeId);
      const channel = pickingProbe;
      setProbeHoles(current => current.map((hole, index) => index === channel ? holeId : hole) as ProbeHoles);
      setPickingProbe(null); setError("");
      setMessage(`CH${channel + 1}: ${holeId} · ${circuit.netNames[netId] || netId}에 연결했습니다.`);
      requestAnimationFrame(() => document.getElementById("electronics-simulation-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) { setError(error instanceof Error ? error.message : "이 구멍의 연결을 확인할 수 없습니다."); }
  }

  function undoPositionChange() {
    const previous = undoStack[undoStack.length - 1]; if (!previous) return;
    analysisVersion.current += 1; cancelAnalyze.current?.abort(); cancelAnalyze.current = null; setBusy(false);
    setLayout(previous); setUndoStack(history => history.slice(0, -1)); setCompletedSteps([]); setStepIndex(null); setPickingPin(null); setSelection(null);
    setMessage("이전 배치로 되돌렸습니다."); setError("");
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

  return <main className="electronics-app" onPaste={pasteSource}>
    <header className="el-app-header">
      <div className="el-brand"><span className="el-brand-mark"><Icon name="chip" size={25} /></span><div><p>ROUTE · ENGINEERING</p><h1>전자공학 실험실 <span>Beta</span></h1></div></div>
      <div className="el-header-actions"><Link className="el-button" href="/admin/electronics/lab5">Lab 5 비교</Link><span className="el-autosave"><i /> 브라우저 자동 저장</span><button className="el-button" onClick={() => { setJsonText(JSON.stringify(circuit, null, 2)); setJsonOpen(true); setDrawer(null); }}>회로 JSON</button><button className="el-button el-primary" disabled={saving} onClick={saveCloud}><Icon name="save" />{saving ? "저장 중…" : "클라우드 저장"}</button></div>
    </header>
    <div className="el-workspace-tools">
      <button className="el-experiment-picker" onClick={() => setDrawer("experiments")} aria-haspopup="dialog"><Icon name="book" /><span><small>실험 선택</small><b>{experiment.title}</b></span><span aria-hidden="true">⌄</span></button>
      <button className="el-button" onClick={() => setDrawer("sources")}><Icon name="upload" />자료 업로드</button>
      <button className="el-button" onClick={() => setDrawer("projects")}><Icon name="save" />저장함</button>
      <button className={`el-button el-chat-toggle ${chatOpen ? "active" : ""}`} aria-pressed={chatOpen} onClick={() => setChatOpen(open => !open)}><Icon name="spark" />Gemini 질문</button>
    </div>
    <div className={`el-app-grid ${chatOpen ? "with-chat" : "without-chat"}`}>


      <section className="el-main">
        <nav className="el-view-tabs" aria-label="실험실 보기"><button className={view === "board" ? "active" : ""} onClick={() => setView("board")}><Icon name="board" />빵판 설계</button><button className={view === "simulation" ? "active" : ""} onClick={() => { setSimulationOpened(true); setView("simulation"); }}><Icon name="spark" />파형 · 계측</button><button className={view === "experiments" ? "active" : ""} onClick={() => setView("experiments")}><Icon name="book" />실험 가이드</button><button className={view === "catalog" ? "active" : ""} onClick={() => setView("catalog")}><Icon name="parts" />소자 도감 <span>{COMPONENT_CATALOG.length}</span></button><button className="el-new-source" onClick={() => { setDrawer("sources"); }}><Icon name="upload" />자료에서 설계</button></nav>
        {(message || error) && <div className={`el-notice ${error ? "error" : ""}`} role={error ? "alert" : "status"}><span>{error || message}</span><button aria-label="알림 닫기" onClick={() => { setMessage(""); setError(""); }}>×</button></div>}

        {simulationOpened && <div id="electronics-simulation-panel" hidden={view !== "simulation"}>
          <SimulationPanel key={`${projectUser}:${projectId}:${circuit.id}`} circuit={circuit} definitions={COMPONENT_CATALOG} layout={layout} probes={probes} pickingChannel={pickingProbe} onPickProbe={beginProbePick} onClearProbe={channel => { setProbeHoles(current => current.map((hole, index) => index === channel ? null : hole) as ProbeHoles); setPickingProbe(null); }} />
        </div>}
        {(view === "board" || view === "simulation") && <>
          <div className="el-circuit-heading"><div><p className="el-eyebrow">BREADBOARD DESIGN</p><input aria-label="설계 이름" value={circuit.title} onChange={e => setCircuit(c => ({ ...c, title: e.target.value.slice(0, 120) }))} /><p>{circuit.description}</p></div><span className={`el-status ${report.valid ? "ok" : "needs-review"}`}>{report.valid ? <Icon name="check" size={15} /> : <span>!</span>}{report.valid ? "연결 검사 통과" : "배선 확인 필요"}</span></div>
          <details className="el-board-settings"><summary>빵판 설정 <span>{boardOptions.boards === 1 ? "830홀 · 1장" : "1660홀 · 2장"} / {boardOptions.railMode === "split" ? "레일 중앙 분리" : "레일 연속"}</span></summary>          <div className="el-board-options"><label>빵판 <select aria-label="빵판 구성" value={boardOptions.boards} onChange={e => { const next: BoardOptions = { ...boardOptions, boards: Number(e.target.value) === 2 ? 2 : 1 }; setBoardOptions(next); applyCircuit(circuit, next); }}><option value={1}>사진형 단일판 · 830홀</option><option value={2}>단일판 2장 · 1660홀</option></select></label><label>전원 레일 <select aria-label="전원 레일 구조" value={boardOptions.railMode} onChange={e => { const next: BoardOptions = { ...boardOptions, railMode: e.target.value === "continuous" ? "continuous" : "split" }; setBoardOptions(next); applyCircuit(circuit, next); }}><option value="split">중앙 분리</option><option value="continuous">연속 연결</option></select></label><label className="el-checkbox"><input type="checkbox" checked={labelsVisible} onChange={e => setLabelsVisible(e.target.checked)} />소자 번호</label><button className="el-button el-small" onClick={() => { applyCircuit(circuit); setMessage("전체 소자와 점퍼를 다시 배치하고 연결을 검사했습니다."); }}>전체 자동 배치</button></div></details>
          <div className="el-layer-panel" aria-label="빵판 표시 필터">
            <div className="el-layer-top"><b>표시할 항목</b><label>한 종류만 보기 <select aria-label="한 종류만 보기" value={visibleLayers.length === ALL_BOARD_LAYERS.length ? "all" : visibleLayers.length === 1 ? visibleLayers[0] : "custom"} onChange={e => { if (e.target.value === "all") changeLayers([...ALL_BOARD_LAYERS]); else if (e.target.value !== "custom") changeLayers([e.target.value as BoardLayer]); }}><option value="all">전체 보기</option><option value="custom" disabled>직접 선택</option>{BOARD_LAYERS.map(layer => <option key={layer.id} value={layer.id}>{layer.label}만</option>)}</select></label></div>
            <div className="el-layer-chips"><button className={visibleLayers.length === ALL_BOARD_LAYERS.length ? "active" : ""} aria-pressed={visibleLayers.length === ALL_BOARD_LAYERS.length} onClick={() => changeLayers([...ALL_BOARD_LAYERS])}>전체</button>{BOARD_LAYERS.map(layer => <button key={layer.id} className={visibleLayers.includes(layer.id) ? "active" : ""} aria-pressed={visibleLayers.includes(layer.id)} onClick={() => changeLayers(visibleLayers.includes(layer.id) ? visibleLayers.filter(id => id !== layer.id) : [...visibleLayers, layer.id])}><span className={`el-layer-dot ${layer.id}`} />{layer.label}<small>{layerCounts[layer.id]}</small></button>)}</div>
            {visibleLayers.length !== ALL_BOARD_LAYERS.length && <p className="el-filter-notice">선택한 종류만 표시 중 · 전체 회로와 연결 검사는 그대로 유지됩니다.<button className="el-text-button" onClick={() => changeLayers([...ALL_BOARD_LAYERS])}>전체 복원</button></p>}
          </div>
          {(railLabels.length > 0 || missingRailNets.length > 0) && <div className="el-power-summary" aria-label="전원과 접지 레일">
            <div className="el-power-rail-list"><b>전원 · 접지</b>{railLabels.map(rail => <span key={rail.group} className={rail.netIds.length > 1 ? "conflict" : getPowerNetRole(circuit, rail.netIds[0]) || "signal"}><small>B{rail.board} {rail.row.startsWith("T") ? "위" : "아래"} {rail.row.endsWith("+") ? "+" : "−"} {rail.group.endsWith(":left") ? "왼쪽" : rail.group.endsWith(":right") ? "오른쪽" : "연속"}</small>{rail.netIds.length > 1 ? `연결 충돌: ${rail.netIds.join(" / ")}` : getPowerNetRole(circuit, rail.netIds[0]) === "ground" ? `${rail.netIds[0]} · 0 V 기준` : rail.netIds[0]}</span>)}</div>
            {missingRailNets.length > 0 ? <div className="el-power-unrouted"><span>{missingRailNets.join(", ")} 레일 배치가 아직 없습니다.</span><button className="el-button el-small" onClick={() => { applyCircuit(circuit); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false); setMessage("전원·접지 레일을 사용해 전체 배선을 다시 만들었습니다. 핀·점퍼 위치와 조립 순서를 확인하세요."); }}>레일을 사용해 전체 재배치</button></div> : <p>{powerNets.every(net => getPowerNetRole(circuit, net) === "ground") ? "이 회로는 별도 DC 전원을 사용하지 않아 +전원 레일은 비워둡니다." : "파란 −레일의 GND와 음전원은 별개입니다. 위에 표시된 연결 이름을 따라 꽂으세요."}</p>}
          </div>}
          <div className="el-drag-controls">
            <button type="button" role="switch" aria-checked={autoRearrange} className={`el-rearrange-toggle ${autoRearrange ? "active" : ""}`} onClick={() => setAutoRearrange(value => !value)}><span className="el-toggle-track"><i /></span><span>주변 자동 재배치 <b>{autoRearrange ? "켜짐" : "꺼짐"}</b></span></button>
            <span className="el-drag-mode-note">{autoRearrange ? "옮긴 항목은 고정 · 나머지 다시 배치" : "옮긴 항목만 변경 · 점퍼는 그대로"}</span>
            <button className="el-button el-small" disabled={!undoStack.length} onClick={undoPositionChange}>이동 취소 ↶</button>
            <button className="el-button el-small el-primary" onClick={verifyChanges}><Icon name="check" size={14} />변경 검증</button>
          </div>
          {manualCheck && <div className={`el-change-check ${manualCheck.layout !== layout || manualCheck.circuit !== circuit ? "stale" : manualCheck.report.valid ? "ok" : "error"}`} role="status"><b>{manualCheck.layout !== layout || manualCheck.circuit !== circuit ? "검사 이후 설계가 변경됐습니다. 다시 검증하세요." : manualCheck.report.valid ? "연결·배치 검사 통과" : `수정 필요 · ${manualCheck.report.issues.filter(issue => issue.severity === "error").length}개 오류`}</b><span>{manualCheck.layout !== layout || manualCheck.circuit !== circuit ? "이전 결과는 현재 배치에 적용되지 않습니다." : manualCheck.report.valid ? "원래 회로의 연결이 유지됩니다. 실제 이득·파형·정격 동작은 별도 검증이 필요합니다." : "아래 검사 결과에서 끊긴 연결·단락·겹침·핀 배치를 확인하세요."}</span></div>}
          <div id="electronics-board-probes" style={{ scrollMarginTop: 20 }}>
            {pickingProbe !== null && <div className="el-soft-box" role="status">CH{pickingProbe + 1} 프로브를 연결할 구멍이나 소자 다리의 원형 접점을 선택하세요. <button className="el-text-button" onClick={() => setPickingProbe(null)}>선택 취소 · Esc</button></div>}
            <Breadboard circuit={circuit} definitions={COMPONENT_CATALOG} layout={layout} selection={selection} onSelect={pickingProbe !== null ? () => undefined : selectItem} onMoveComponent={dragComponent} onMovePin={dragPin} onMoveTerminal={dragTerminal} activeStep={stepIndex !== null ? steps[stepIndex] : undefined} visibleLayers={visibleLayers} labelsVisible={labelsVisible} onHolePick={pickingProbe !== null ? pickProbeHole : pickingPin ? movePin : undefined} holePickLabel={pickingProbe !== null ? `CH${pickingProbe + 1} 측정 위치 선택 · 구멍 또는 원형 접점 클릭` : undefined} probeMarkers={view === "simulation" ? probeMarkers : undefined} zoom={zoom} onZoom={setZoom} />
          </div>
          <div className="el-design-stats"><div><b>{circuit.components.length}</b><span>소자</span></div><div><b>{layout.jumpers.length}</b><span>점퍼선</span></div><div><b>{report.checkedNets}</b><span>연결 노드</span></div><div><b>{circuit.instruments.length}</b><span>장비 연결</span></div><div className="el-stats-note">물리 연결 검사 기준<br /><strong>동작·성능 검증 전</strong></div></div>
          <details className="el-selection-panel" open={detailsOpen} onToggle={event => setDetailsOpen(event.currentTarget.open)}><summary>선택 항목 · 핀 위치 <span>{selectedComponent ? `${selectedComponent.id} · ${selectedDefinition?.name}` : selectedJumper ? selectedJumper.id : selectedTerminal ? selectedTerminal.port : "소자를 클릭하면 상세 정보가 열립니다"}</span></summary>
      <aside className="el-inspector"><div className="el-inspector-title"><h2>선택한 항목</h2>{selection && <button className="el-text-button" onClick={() => { setSelection(null); setPickingPin(null); }}>해제</button>}</div>{selectedComponent && selectedDefinition ? <><span className="el-detail-ref">{selectedComponent.id}</span><h3>{selectedDefinition.name}</h3><p className="el-detail-package">{selectedDefinition.package}</p><label className="el-field-label">부품값<input value={selectedComponent.value} onChange={e => setCircuit(c => ({ ...c, components: c.components.map(v => v.id === selectedComponent.id ? { ...v, value: e.target.value.slice(0, 80) } : v) }))} /></label><p className="el-detail-description">{selectedDefinition.description}</p><div className="el-section-label">핀 · 꽂을 위치</div><div className="el-pin-table">{selectedDefinition.pins.map(pin => <div key={pin.id}><span><b>{pin.id}</b> {pin.label}<select aria-label={`${selectedComponent.id} ${pin.id}번 핀 연결`} value={selectedComponent.pinNets[pin.id]} onChange={e => changePinNet(selectedComponent.id, pin.id, e.target.value)}>{Object.entries(circuit.netNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></span><button className={pickingPin?.pinId === pin.id ? "active" : ""} onClick={() => setPickingPin({ componentId: selectedComponent.id, pinId: pin.id })}>{selectedPlacement?.pins[pin.id] || "미배치"}<small>이 다리만 이동 ↗</small></button></div>)}</div>{pickingPin && <div className="el-soft-box">이 다리만 꽂을 새 구멍을 선택하세요. 다른 다리는 현재 위치를 유지합니다.<button className="el-text-button" onClick={() => setPickingPin(null)}>취소</button></div>}<p className="el-small-note">몸통을 끌면 소자 전체가, 다리의 원형 삽입점을 끌면 그 다리만 이동합니다. IC처럼 핀 간격이 고정된 부품은 몸통으로 옮기세요. 주변 자동 재배치 토글은 두 방식 모두에 적용됩니다.</p>{selectedDefinition.sourceUrl && <a className="el-datasheet" href={selectedDefinition.sourceUrl} target="_blank" rel="noreferrer">데이터시트 열기 ↗</a>}</> : selectedJumper ? <><span className="el-detail-ref">{selectedJumper.id}</span><h3>점퍼선</h3><p>{circuit.netNames[selectedJumper.netId] || selectedJumper.netId}</p><div className="el-endpoint"><span>시작</span><b>{selectedJumper.from}</b></div><div className="el-endpoint"><span>끝</span><b>{selectedJumper.to}</b></div><button className="el-button el-full" onClick={() => { const i = steps.findIndex(s => s.jumperId === selectedJumper.id); if (i >= 0) { showStep(i); } }}>이 점퍼의 조립 단계</button></> : selectedTerminal ? <><span className="el-detail-ref">장비 연결</span><h3>{selectedTerminal.instrument}</h3><div className="el-endpoint"><span>단자</span><b>{selectedTerminal.port}</b></div><div className="el-endpoint"><span>구멍</span><b>{layout.terminals.find(t => t.connectionId === selectedTerminal.id)?.holeId}</b></div><p className="el-detail-description">{selectedTerminal.setting}</p></> : selection?.type === "hole" ? <><span className="el-detail-ref">구멍 좌표</span><h3>{selection.id}</h3><p className="el-detail-description">내부 연결 그룹: {layout.board.holes.find(h => h.id === selection.id)?.group}</p><p className="el-small-note">같은 그룹의 구멍은 빵판 내부에서 전기적으로 연결됩니다.</p></> : <div className="el-empty-inspector"><span><Icon name="chip" size={34} /></span><h3>소자를 선택해 보세요</h3><p>이름, 값, 핀 방향과<br />정확한 구멍 위치를 보여줍니다.</p><div><b>HOVER</b> 이름·값 빠르게 보기<br /><b>CLICK</b> 상세 정보 고정<br /><b>STEP</b> 하나씩 따라 꽂기</div></div>}
        <div className="el-inspector-instruments"><div className="el-section-label">계측기 연결 <span>{circuit.instruments.length}</span></div>{circuit.instruments.map((connection, index) => <button key={connection.id} onClick={() => { selectItem({ type: "terminal", id: connection.id }); }}><b>T{index + 1}</b><span>{connection.port}<small>{connection.instrument} · {layout.terminals.find(t => t.connectionId === connection.id)?.holeId || "미배치"}</small></span></button>)}</div><div className="el-inspector-components"><div className="el-section-label">사용 소자 <span>{circuit.components.length}</span></div>{circuit.components.map(c => <button key={c.id} className={selectedComponent?.id === c.id ? "active" : ""} onClick={() => { selectItem({ type: "component", id: c.id }); }}><b>{c.id}</b><span>{c.value}<small>{COMPONENT_CATALOG.find(d => d.id === c.definitionId)?.name || c.definitionId}</small></span></button>)}</div>{undoStack.length > 0 && <button className="el-button el-full" onClick={undoPositionChange}>위치 변경 실행 취소</button>}
      </aside>
          </details>
          <section className="el-assembly"><div className="el-assembly-title"><div><span className="el-mini-tag">BUILD GUIDE</span><h2>화면 그대로, 하나씩 꽂기</h2></div><span>{completedSteps.length} / {steps.length} 완료</span></div>{stepIndex === null ? <div className="el-assembly-start"><p>소자 방향과 구멍 좌표, 점퍼의 양 끝을 단계마다 확인합니다.</p><button className="el-button el-primary" disabled={!steps.length} onClick={() => showStep(0)}>조립 안내 시작 <Icon name="arrow" /></button></div> : steps[stepIndex] && <div className="el-step"><div className="el-step-number">{stepIndex + 1}</div><div className="el-step-copy"><b>{steps[stepIndex].title}</b><p>{steps[stepIndex].description}</p><div className="el-hole-chips">{steps[stepIndex].holes.map(h => <span key={h}>{h}</span>)}</div></div><div className="el-step-actions"><label><input type="checkbox" checked={completedSteps.includes(steps[stepIndex].id)} onChange={e => setCompletedSteps(s => e.target.checked ? [...new Set([...s, steps[stepIndex].id])] : s.filter(id => id !== steps[stepIndex].id))} /> 완료</label><button className="el-button el-small" disabled={stepIndex === 0} onClick={() => showStep((stepIndex || 0) - 1)}>이전</button><button className="el-button el-small el-primary" disabled={stepIndex >= steps.length - 1} onClick={() => showStep((stepIndex || 0) + 1)}>다음</button><button className="el-text-button" onClick={() => setStepIndex(null)}>안내 닫기</button></div></div>}</section>
          <details className="el-checks-panel" open={checksOpen} onToggle={event => setChecksOpen(event.currentTarget.open)}><summary>연결 검사 · 원문 확인 <span>{report.issues.filter(i => i.severity === "error").length}개 오류 / {openReviews.length}개 미확인</span></summary><div className="el-bottom-grid"><section className="el-card"><div className="el-card-title"><h2>연결 검사</h2><span className="el-mini-tag">{report.checkedPins} pins</span></div>{report.issues.length ? <ul className="el-issues">{report.issues.map((i, index) => <li key={`${i.code}-${index}`} className={i.severity}><span>{i.severity === "error" ? "!" : "i"}</span>{i.message}</li>)}</ul> : <p className="el-success-text"><Icon name="check" />목표 회로와 빵판의 연결이 일치합니다.</p>}<p className="el-small-note">실제 소자의 정격, 핀 방향과 계측기 내부 접지는 별도로 확인하세요. 사진만으로 전원 레일 내부 연결을 확정할 수 없습니다.</p></section><section className="el-card"><div className="el-card-title"><h2>원문·조건 확인</h2><span className="el-mini-tag">{openReviews.length}개 미확인</span></div>{circuit.reviewItems.map(item => <label className="el-review" key={item.id}><input type="checkbox" checked={item.resolved} onChange={e => setCircuit(c => ({ ...c, reviewItems: c.reviewItems.map(i => i.id === item.id ? { ...i, resolved: e.target.checked } : i) }))} /><span>{item.message}</span></label>)}{circuit.notes.map((n, i) => <p className="el-note" key={i}>{n}</p>)}{circuit.provenance && <p className="el-small-note">출처: {circuit.provenance}</p>}</section></div></details>
          <div className="el-export"><span>설계와 조립 좌표를 내보내기</span><button className="el-button el-small" onClick={exportSvg}><Icon name="download" size={14} />현재 보기 SVG</button><button className="el-button el-small" onClick={exportAssembly}>조립 안내 TXT</button><button className="el-button el-small" onClick={() => downloadText(`${circuit.title}.json`, JSON.stringify({ version: 1, id: projectId, title: circuit.title, updatedAt: new Date().toISOString(), circuit, boardOptions, layout, completedSteps, experimentId }, null, 2))}>프로젝트 JSON</button></div>
        </>}

        {view === "experiments" && <section className="el-guide"><div className="el-guide-top"><span className="el-guide-number">{experiment.number}</span><div><p className="el-eyebrow">COURSE EXPERIMENT</p><h2>{experiment.title}</h2><p>{experiment.summary}</p></div></div><div className="el-topic-chips">{experiment.topics.map(t => <span key={t}>{t}</span>)}</div><div className="el-guide-section"><h3>회로 예제와 설계</h3>{experiment.templateIds.length ? <div className="el-template-grid">{experiment.templateIds.map(id => { const t = CIRCUIT_TEMPLATES.find(t => t.id === id); return t ? <button key={id} onClick={() => openTemplate(id)}><span><Icon name="board" /></span><b>{t.title}</b><p>{t.description}</p><small>{t.components.length}개 소자 · 배치도 열기 →</small></button> : null; })}</div> : <div className="el-soft-box">이 실험은 계측 또는 소프트웨어 신호처리가 중심입니다. 아래 연결·설정과 실험 절차를 확인하세요.</div>}</div><div className="el-bottom-grid"><section className="el-card"><h3>계측기·실험 설정</h3><dl className="el-setting-list">{experiment.settings.map((s, i) => <div key={i}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}</dl></section><section className="el-card"><h3>실험 절차</h3><ol className="el-procedure">{experiment.procedure.map((p, i) => <li key={i}><b>{String(i + 1).padStart(2, "0")}</b><span>{p}</span></li>)}</ol></section></div><div className="el-future"><span className="el-mini-tag">{courseSupport?.status === "guide" ? "설정·절차 안내" : "일부 회로 실행 지원"}</span><h3>이 실험의 지원 범위</h3>{courseSupport && <><p><b>현재 가능</b> · {courseSupport.available.join(" · ")}</p><p><b>추가 구현·검수</b> · {courseSupport.remaining.join(" · ")}</p></>}<small>교육 모델의 계산 결과와 원문 전체 회로·실물 성능 검증은 구분합니다. 파형·계측에서 소자 모델과 현재 배선을 함께 확인하세요.</small></div><button className="el-button el-primary" onClick={() => { setDrawer("sources"); setSourceText(`${experiment.title}\n실험 조건: ${experiment.settings.map(s => `${s.label}: ${s.value}`).join("; ")}\n`); }}>이 실험의 PDF·사진으로 설계 <Icon name="arrow" /></button></section>}

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
        {drawer === "sources" && <div className="el-source-panel"><h3>실험 자료로 설계하기</h3><p>회로도와 본문 조건을 함께 올려 주세요.</p><div className="el-clipboard-zone" tabIndex={0} role="region" aria-label="클립보드 붙여넣기 영역"><b>캡처한 사진이나 복사한 조건을 바로 붙여넣기</b><span>이 영역을 클릭하고 <kbd>Ctrl</kbd> + <kbd>V</kbd> · Mac은 <kbd>⌘</kbd> + <kbd>V</kbd></span><button type="button" className="el-button el-small" disabled={pasting} onClick={() => void pasteFromButton()}>{pasting ? "클립보드 읽는 중…" : "클립보드에서 붙여넣기"}</button><span>사진은 첨부 자료로, 텍스트는 추가 조건으로 들어갑니다. 붙여넣은 뒤 분석 버튼을 눌러 주세요.</span></div><label className="el-dropzone" htmlFor={inputId}><Icon name="upload" size={28} /><b>PDF·사진 추가</b><span>최대 4개 · 합계 2.9MB</span></label><input id={inputId} type="file" hidden multiple accept="application/pdf,image/png,image/jpeg,image/webp" onChange={e => { void addFiles(e.target.files); e.target.value = ""; }} />{files.map((f, i) => <div className="el-file" key={`${f.name}-${i}`}>{f.mimeType.startsWith("image/") && <Image className="el-source-thumbnail" src={`data:${f.mimeType};base64,${f.data}`} alt={`${f.name} 미리보기`} width={56} height={44} unoptimized />}<span>{f.name}<small>{Math.round(f.size / 1024)} KB</small></span><button aria-label={`${f.name} 제거`} onClick={() => setFiles(f => f.filter((_, j) => i !== j))}>×</button></div>)}<label className="el-field-label" htmlFor="el-source-text">추가 조건 또는 회로 설명</label><textarea id="el-source-text" maxLength={20000} value={sourceText} onChange={e => setSourceText(e.target.value)} placeholder="예: 회로의 트랜스는 사용하지 않고 커패시터 두 개로 입력합니다. 전원은 9V입니다." rows={7} /><button className="el-button el-primary el-full" disabled={busy} onClick={analyze}><Icon name="spark" />{busy ? "자료 분석 중…" : "자료 분석 · 전체 설계"}</button>{busy && <button className="el-button el-full" onClick={() => cancelAnalyze.current?.abort()}>분석 취소</button>}<button className="el-button el-full" onClick={() => { setJsonText(JSON.stringify(circuit, null, 2)); setJsonOpen(true); setDrawer(null); }}>ChatGPT 설계 가져오기</button><p className="el-small-note">분석 결과는 원문 확인이 필요한 초안입니다. 불명확한 소자·핀·연결은 검토 항목으로 표시합니다.</p></div>}
        {drawer === "projects" && <div className="el-saved-panel"><button className="el-button el-full" disabled={saving} onClick={loadCloud}><Icon name="save" />{cloudLoaded ? "클라우드 새로고침" : "내 클라우드 프로젝트"}</button><div className="el-section-label">최근 프로젝트 <span>{projects.length}</span></div>{projects.map(p => <button key={p.id} className="el-project-card" onClick={() => { if (openProject(p)) setDrawer(null); }}><b>{p.title}</b><span>{new Date(p.updatedAt).toLocaleString("ko-KR")}</span><small>{p.circuit.components.length}개 소자 · {p.boardOptions.boards}장</small></button>)}{!projects.length && <p className="el-small-note">작업을 시작하면 이 브라우저에 자동 저장됩니다.</p>}</div>}
      </aside>
    </WorkspaceDrawer>}
    {jsonOpen && <div className="el-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setJsonOpen(false); }}><section className="el-modal" role="dialog" aria-modal="true" aria-labelledby="el-json-title"><div className="el-card-title"><h2 id="el-json-title">ChatGPT 설계 가져오기 · 회로 편집</h2><button className="el-button" onClick={() => setJsonOpen(false)}>닫기</button></div><p>이 채팅에서 만든 설계 파일을 불러오면 같은 배치 엔진으로 생성하고 검사합니다. 회로 또는 프로젝트 JSON을 붙여 넣거나 선택하세요.</p><label className="el-json-import">JSON 파일 불러오기<input type="file" accept="application/json,.json" onChange={async e => { const file = e.target.files?.[0]; if (file && file.size < 3_000_000) { const owner = projectUser; const version = analysisVersion.current; const json = await file.text(); if (readyUser.current === owner && analysisVersion.current === version) setJsonText(json); } else if (file) setError("JSON 파일은 3MB 미만으로 선택하세요."); }} /></label><textarea aria-label="회로 JSON" value={jsonText} onChange={e => setJsonText(e.target.value)} spellCheck={false} />{error && <div className="el-notice error" role="alert">{error}</div>}<div className="el-modal-actions"><button className="el-button el-primary" onClick={() => { try { const value = JSON.parse(jsonText); if (value.version === 1 && value.circuit) { if (!openProject(value)) return; } else { applyCircuit(parseCircuit(value, COMPONENT_CATALOG)); setVisibleLayers([...ALL_BOARD_LAYERS]); setDetailsOpen(false); setProjectId(crypto.randomUUID()); } setJsonOpen(false); setView("board"); } catch (e) { setError(e instanceof Error ? e.message : "JSON 형식을 확인해 주세요."); } }}>적용 · 전체 재배치</button></div></section></div>}
  </main>;
}
