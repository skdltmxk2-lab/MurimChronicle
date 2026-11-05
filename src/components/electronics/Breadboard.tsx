"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AssemblyStep, BoardHole, Circuit, CircuitLayout, ComponentDefinition } from "@/lib/electronics/types";
import { ALL_BOARD_LAYERS, componentLayer, isBoardSelectionVisible, layerForAssemblyStep, type BoardLayer } from "@/lib/electronics/visibility";
import { getPowerNetRole, getRailUsage } from "@/lib/electronics/power";
import { resistorMarking } from "@/lib/electronics/resistor-marking";

export type BoardSelection = { type: "component" | "jumper" | "terminal" | "hole"; id: string } | null;
export type ProbeMarker = { holeId: string; label: string; color: string };
const NO_PROBES: readonly ProbeMarker[] = [];
type BoardDrag = {
  type: "component" | "pin" | "terminal";
  id: string;
  anchorPinId?: string;
  pointerId: number;
  start: { x: number; y: number; clientX: number; clientY: number };
  origin: BoardHole;
  dx: number;
  dy: number;
  targetHoleId: string | null;
  moved: boolean;
};

export function Breadboard({ circuit, definitions, layout, selection: requestedSelection, onSelect, activeStep: requestedActiveStep, wiresVisible = true, visibleLayers = ALL_BOARD_LAYERS, labelsVisible, onHolePick, holePickLabel, probeMarkers = NO_PROBES, onMoveComponent, onMovePin, onMoveTerminal, zoom, onZoom }: {
  circuit: Circuit;
  definitions: ComponentDefinition[];
  layout: CircuitLayout;
  selection: BoardSelection;
  onSelect: (selection: BoardSelection) => void;
  activeStep?: AssemblyStep;
  wiresVisible?: boolean;
  visibleLayers?: readonly BoardLayer[];
  labelsVisible: boolean;
  onHolePick?: (holeId: string) => void;
  holePickLabel?: string;
  probeMarkers?: readonly ProbeMarker[];
  onMoveComponent?: (componentId: string, targetHoleId: string, anchorPinId: string) => void;
  onMovePin?: (componentId: string, targetHoleId: string, pinId: string) => void;
  onMoveTerminal?: (connectionId: string, targetHoleId: string) => void;
  zoom: number;
  onZoom: (zoom: number) => void;
}) {
  const holes = useMemo(() => new Map(layout.board.holes.map(h => [h.id, h])), [layout.board]);
  const defs = useMemo(() => new Map(definitions.map(d => [d.id, d])), [definitions]);
  const components = useMemo(() => new Map(circuit.components.map(component => [component.id, component])), [circuit.components]);
  const placements = useMemo(() => new Map(layout.placements.map(placement => [placement.componentId, placement])), [layout.placements]);
  const jumpers = useMemo(() => new Map(layout.jumpers.map(jumper => [jumper.id, jumper])), [layout.jumpers]);
  const terminals = useMemo(() => new Map(layout.terminals.map(terminal => [terminal.connectionId, terminal])), [layout.terminals]);
  const instruments = useMemo(() => new Map(circuit.instruments.map((connection, index) => [connection.id, { connection, reference: `T${index + 1}` }])), [circuit.instruments]);
  const railUsage = useMemo(() => new Map(getRailUsage(circuit, layout).map(rail => [rail.group, rail])), [circuit, layout]);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [fitOccupied, setFitOccupied] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<BoardDrag | null>(null);
  const dragRef = useRef<BoardDrag | null>(null);
  const dragFrame = useRef<number | null>(null);
  const tipFrame = useRef<number | null>(null);
  const pendingTip = useRef<typeof tip>(null);
  const dragCapture = useRef<SVGGElement | null>(null);
  const suppressClick = useRef(false);
  const cancelDrag = useCallback(() => {
    if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current);
    dragFrame.current = null;
    const active = dragRef.current;
    if (active?.moved) suppressClick.current = true;
    dragRef.current = null;
    if (active && dragCapture.current?.hasPointerCapture(active.pointerId)) dragCapture.current.releasePointerCapture(active.pointerId);
    dragCapture.current = null;
    setDrag(null);
  }, []);
  const [pan, setPan] = useState<{ x: number; y: number; left: number; top: number } | null>(null);
  const displayedLayers = useMemo(() => wiresVisible ? visibleLayers : visibleLayers.filter(layer => layer !== "jumper"), [wiresVisible, visibleLayers]);
  const layerKey = displayedLayers.join(",");
  const pickingMode = Boolean(onHolePick);
  useEffect(() => { cancelDrag(); }, [circuit, layout, layerKey, pickingMode, cancelDrag]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape" && dragRef.current) { event.preventDefault(); cancelDrag(); } };
    window.addEventListener("keydown", escape);
    window.addEventListener("blur", cancelDrag);
    return () => {
      window.removeEventListener("keydown", escape); window.removeEventListener("blur", cancelDrag);
      if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current);
      if (tipFrame.current !== null) cancelAnimationFrame(tipFrame.current);
    };
  }, [cancelDrag]);
  const selection = isBoardSelectionVisible(requestedSelection, circuit, definitions, displayedLayers) ? requestedSelection : null;
  const stepLayer = layerForAssemblyStep(requestedActiveStep, circuit, definitions);
  const activeStep = stepLayer && displayedLayers.includes(stepLayer) ? requestedActiveStep : undefined;
  // Keep framing and occupied-hole information stable while layers are hidden.
  const occupied = useMemo(() => new Set([...layout.placements.flatMap(p => Object.values(p.pins)), ...layout.jumpers.flatMap(j => [j.from, j.to]), ...layout.terminals.map(t => t.holeId)]), [layout]);
  const viewRect = useMemo(() => {
    const full = { x: 0, y: 0, width: layout.board.width, height: layout.board.height };
    if (!fitOccupied) return full;
    const points = [...occupied, ...probeMarkers.map(probe => probe.holeId)].map(id => holes.get(id)).filter((hole): hole is BoardHole => Boolean(hole));
    if (!points.length) return full;
    // Include lead bodies, wire bends and coordinate labels without moving physical holes.
    const x = Math.max(0, Math.min(...points.map(h => h.x)) - 54);
    const y = Math.max(0, Math.min(...points.map(h => h.y)) - 84);
    return { x, y, width: Math.min(layout.board.width - x, Math.max(320, Math.max(...points.map(h => h.x)) + 90 - x)),
      height: Math.min(layout.board.height - y, Math.max(220, Math.max(...points.map(h => h.y)) + 66 - y)) };
  }, [fitOccupied, occupied, holes, layout.board.width, layout.board.height, probeMarkers]);
  const selectedComponent = selection?.type === "component" ? components.get(selection.id) : null;
  const selectedJumper = selection?.type === "jumper" ? jumpers.get(selection.id) : null;
  const selectedTerminal = selection?.type === "terminal" ? terminals.get(selection.id) : null;
  const selectedNets = new Set(selectedComponent ? Object.values(selectedComponent.pinNets) : selectedJumper ? [selectedJumper.netId] : selectedTerminal ? [selectedTerminal.netId] : []);
  const selectedHoleGroup = selection?.type === "hole" ? holes.get(selection.id)?.group : undefined;
  if (selectedHoleGroup) {
    for (const placement of layout.placements) {
      const component = components.get(placement.componentId);
      for (const [pin, holeId] of Object.entries(placement.pins)) if (holes.get(holeId)?.group === selectedHoleGroup && component?.pinNets[pin]) selectedNets.add(component.pinNets[pin]);
    }
    for (const jumper of layout.jumpers) if (holes.get(jumper.from)?.group === selectedHoleGroup || holes.get(jumper.to)?.group === selectedHoleGroup) selectedNets.add(jumper.netId);
    for (const terminal of layout.terminals) if (holes.get(terminal.holeId)?.group === selectedHoleGroup) selectedNets.add(terminal.netId);
  }
  const activeHoles = useMemo(() => new Set(activeStep?.holes ?? []), [activeStep]);
  const selectedHoles = useMemo(() => new Set(selectedHoleGroup ? layout.board.holes.filter(h => h.group === selectedHoleGroup).map(h => h.id) : selectedComponent ? Object.values(placements.get(selectedComponent.id)?.pins ?? {}) : selectedJumper ? [selectedJumper.from, selectedJumper.to] : selectedTerminal ? [selectedTerminal.holeId] : []), [selectedHoleGroup, layout.board, placements, selectedComponent, selectedJumper, selectedTerminal]);
  const selectionActive = Boolean(selection || activeStep);
  // Group by the actual board IDs; engines may number boards starting at zero or one.
  const boardIds = useMemo(() => [...new Set(layout.board.holes.map(h => h.board))], [layout.board]);
  const clearTip = useCallback(() => {
    if (tipFrame.current !== null) cancelAnimationFrame(tipFrame.current);
    tipFrame.current = null;
    pendingTip.current = null;
    setTip(null);
  }, []);
  const titleFor = useCallback((text: string, e: React.MouseEvent<SVGElement>) => {
    if (dragRef.current?.moved) return;
    const rect = scroller.current?.getBoundingClientRect();
    if (!rect) return;
    pendingTip.current = { text, x: Math.min(e.clientX - rect.left + 14, rect.width - 260), y: Math.max(8, e.clientY - rect.top - 55) };
    if (tipFrame.current === null) tipFrame.current = requestAnimationFrame(() => {
      tipFrame.current = null;
      setTip(pendingTip.current);
    });
  }, []);
  useEffect(() => { clearTip(); }, [layerKey, circuit, layout, clearTip]);
  const opacityFor = (componentId?: string, netId?: string, jumperId?: string) => {
    if (!selectionActive) return 1;
    if (activeStep) return (componentId && activeStep.componentId === componentId) || (jumperId && activeStep.jumperId === jumperId) || (netId && activeStep.connectionId && terminals.get(activeStep.connectionId)?.netId === netId) ? 1 : 0.16;
    const connectedComponent = componentId && selection?.type !== "component" && Object.values(components.get(componentId)?.pinNets ?? {}).some(net => selectedNets.has(net));
    return (selection?.type === "component" && selection.id === componentId) || (selection?.type === "jumper" && selection.id === jumperId) || (netId && selectedNets.has(netId)) || connectedComponent ? 1 : 0.2;
  };
  const pinDot = (h: BoardHole, label: string, key: string, componentId?: string) => <g key={key} data-component-pin={componentId ? `${componentId}.${key}` : undefined} aria-label={componentId ? label : undefined} role={onHolePick ? "button" : undefined} tabIndex={onHolePick ? 0 : undefined} style={componentId && onMovePin && !onHolePick ? { cursor: "grab", touchAction: "none" } : onHolePick ? { cursor: "crosshair" } : undefined} onClick={onHolePick ? event => { event.stopPropagation(); onHolePick(h.id); } : undefined} onKeyDown={onHolePick ? event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); onHolePick(h.id); } } : undefined} onPointerDown={componentId && onMovePin ? event => beginDrag(event, "pin", componentId, h, key) : undefined} onMouseMove={e => { e.stopPropagation(); titleFor(label, e); }} onMouseLeave={clearTip}>
    {componentId && onMovePin && <circle cx={h.x} cy={h.y} r={7} fill="transparent" />}
    <circle cx={h.x} cy={h.y} r={4} fill="#c9cdd1" stroke="#515a65" strokeWidth={1.3} />
    <circle cx={h.x} cy={h.y} r={1.4} fill="#27333c" />
    <title>{label}</title>
  </g>;

  function svgPoint(clientX: number, clientY: number) {
    const matrix = svg.current?.getScreenCTM();
    if (!svg.current || !matrix) return null;
    const point = svg.current.createSVGPoint(); point.x = clientX; point.y = clientY;
    return point.matrixTransform(matrix.inverse());
  }

  function beginDrag(event: React.PointerEvent<SVGGElement>, type: BoardDrag["type"], id: string, origin: BoardHole, anchorPinId?: string) {
    if (event.button !== 0 || onHolePick || dragRef.current || (type === "component" ? !onMoveComponent : type === "pin" ? !onMovePin : !onMoveTerminal)) return;
    const point = svgPoint(event.clientX, event.clientY);
    if (!point) return;
    event.stopPropagation();
    const next: BoardDrag = { type, id, anchorPinId, pointerId: event.pointerId, start: { x: point.x, y: point.y, clientX: event.clientX, clientY: event.clientY }, origin, dx: 0, dy: 0, targetHoleId: origin.id, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    dragCapture.current = event.currentTarget;
    dragRef.current = next; setDrag(next); clearTip(); setPan(null);
  }

  function moveDrag(event: React.PointerEvent<SVGSVGElement>) {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const point = svgPoint(event.clientX, event.clientY);
    if (!point) return;
    const moved = active.moved || Math.hypot(event.clientX - active.start.clientX, event.clientY - active.start.clientY) > 4;
    if (!moved) return;
    event.preventDefault();
    const desired = { x: active.origin.x + point.x - active.start.x, y: active.origin.y + point.y - active.start.y };
    let nearest: BoardHole | undefined;
    let distance = 19;
    for (const hole of layout.board.holes) {
      if (active.type !== "terminal" && !/^[A-J]$/.test(hole.row)) continue;
      const gap = Math.hypot(hole.x - desired.x, hole.y - desired.y);
      if (gap < distance) { nearest = hole; distance = gap; }
    }
    const next = { ...active, moved, dx: (nearest?.x ?? desired.x) - active.origin.x, dy: (nearest?.y ?? desired.y) - active.origin.y, targetHoleId: nearest?.id ?? null };
    dragRef.current = next;
    if (dragFrame.current === null) dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = null;
      setDrag(dragRef.current);
    });
    clearTip();
  }

  function finishDrag(event: React.PointerEvent<SVGSVGElement>) {
    const active = dragRef.current;
    if (!active || active.pointerId !== event.pointerId) return;
    cancelDrag();
    if (!active.moved || !active.targetHoleId || active.targetHoleId === active.origin.id) return;
    if (active.type === "component" && active.anchorPinId) onMoveComponent?.(active.id, active.targetHoleId, active.anchorPinId);
    else if (active.type === "pin" && active.anchorPinId) onMovePin?.(active.id, active.targetHoleId, active.anchorPinId);
    else if (active.type === "terminal") onMoveTerminal?.(active.id, active.targetHoleId);
  }

  // Pointer previews reuse all board contacts; only selection or model changes rebuild them.
  const boardSurface = useMemo(() => boardIds.map((boardId, bi) => {
          const list = layout.board.holes.filter(h => h.board === boardId);
          if (!list.length) return null;
          const xs = list.map(h => h.x), ys = list.map(h => h.y);
          const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
          const rowNames = [...new Set(list.map(h => h.row))];
          const rows = rowNames.map(row => ({ row, holes: list.filter(h => h.row === row).sort((a, b) => a.x - b.x) }));
          const eRow = rows.find(r => r.row.toUpperCase() === "E"), fRow = rows.find(r => r.row.toUpperCase() === "F");
          const trenchY = eRow && fRow ? (eRow.holes[0].y + fRow.holes[0].y) / 2 : (minY + maxY) / 2;
          return <g key={boardId}>
            <rect x={minX - 32} y={minY - 24} width={maxX - minX + 64} height={maxY - minY + 46} rx={13} fill="url(#bb-surface)" stroke="#c9c9c9" strokeWidth={2} filter="url(#bb-shadow)" />
            <text x={minX - 18} y={minY - 10} fill="#777777" fontSize={10} fontWeight={700}>B{bi + 1} · 63열</text>
            <rect x={minX - 14} y={trenchY - 7} width={maxX - minX + 28} height={14} rx={3} fill="#d5d5d5" stroke="#cccccc" />
            {rows.map(({ row, holes: rh }) => {
              const isCore = /^[a-j]$/i.test(row);
              const color = /\+|p|red/i.test(row) && !isCore ? "#d96f70" : "#7397b7";
              const y = rh[0].y;
              const railGroups = [...new Set(rh.map(h => h.group))].map(group => rh.filter(h => h.group === group));
              return <g key={row}>
                {!isCore && railGroups.map(group => <g key={group[0].group} data-rail-group={group[0].group}>
                    <line x1={group[0].x - 8} x2={group[group.length - 1].x + 8} y1={y - 8} y2={y - 8} stroke={color} strokeWidth={2} />
                  </g>)}
                <text x={minX - 21} y={y + 3} fontSize={10} fontWeight={700} fill={isCore ? "#777777" : color}>{isCore ? row.toUpperCase() : row.includes("+") || /p|red/i.test(row) ? "+" : "−"}</text>
                <text x={maxX + 14} y={y + 3} fontSize={10} fontWeight={700} fill={isCore ? "#777777" : color}>{isCore ? row.toUpperCase() : row.includes("+") || /p|red/i.test(row) ? "+" : "−"}</text>
                {isCore && row.toUpperCase() === "A" && rh.filter(h => h.column === 1 || h.column % 5 === 0 || h.column === 63).map(h => <text key={h.id} x={h.x} y={y - 14} textAnchor="middle" fill="#888888" fontSize={9}>{h.column}</text>)}
              </g>;
            })}
            {list.map(h => {
              const active = activeHoles.has(h.id) || selectedHoles.has(h.id);
              const rail = railUsage.get(h.group);
              const holeLabel = `${h.id} · ${occupied.has(h.id) ? "사용 중" : "빈 구멍"}${rail ? ` · ${rail.netIds.map(netId => circuit.netNames[netId] || netId).join(" / ")}${rail.role === "ground" ? " (GND 기준)" : ""}` : ""}`;
              return <g key={h.id} role="button" aria-label={holeLabel} tabIndex={onHolePick ? 0 : undefined} onClick={e => { e.stopPropagation(); onHolePick ? onHolePick(h.id) : onSelect({ type: "hole", id: h.id }); }} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onHolePick ? onHolePick(h.id) : onSelect({ type: "hole", id: h.id }); } }} onMouseMove={e => titleFor(holeLabel, e)} onMouseLeave={clearTip}>
                {active && <circle cx={h.x} cy={h.y} r={8} fill="#525252" fillOpacity={0.2} stroke="#363636" strokeWidth={2} />}
                <rect x={h.x - 2.1} y={h.y - 2.1} width={4.2} height={4.2} rx={0.9} fill={active ? "#333333" : "#666666"} />
                <line x1={h.x - 1.2} x2={h.x + 1.2} y1={h.y - 1.2} y2={h.y - 1.2} stroke="#b9b9b9" strokeWidth={0.8} />
              </g>;
            })}
          </g>;
        }), [boardIds, layout.board, activeHoles, selectedHoles, railUsage, occupied, circuit.netNames, onHolePick, onSelect, titleFor, clearTip]);

  return <div className={`el-board-stage ${onHolePick ? "el-picking" : ""}`}>
    <div className="el-board-toolbar">
      <span><i className="el-live-dot" /> {onHolePick ? holePickLabel || "선택한 핀을 꽂을 구멍을 클릭하세요" : onMoveComponent ? "몸통은 전체 이동 · 다리는 한쪽만 이동 · 클릭하여 상세 확인" : "소자에 마우스를 올리거나 클릭해 보세요"}</span>
      <div><button aria-label="축소" onClick={() => onZoom(Math.max(0.6, zoom - 0.2))}>−</button><button onClick={() => onZoom(1)}>{Math.round(zoom * 100)}%</button><button aria-label="확대" onClick={() => onZoom(Math.min(3, zoom + 0.2))}>+</button><button aria-pressed={fitOccupied} onClick={() => { setFitOccupied(value => !value); if (scroller.current) scroller.current.scrollTo({ left: 0, top: 0 }); }}>{fitOccupied ? "전체 빵판" : "사용 영역"}</button></div>
    </div>
    <div className="el-board-scroll" ref={scroller} onMouseLeave={() => { clearTip(); setPan(null); }} onMouseUp={() => setPan(null)} onMouseMove={e => {
      if (pan && scroller.current) { scroller.current.scrollLeft = pan.left - (e.clientX - pan.x); scroller.current.scrollTop = pan.top - (e.clientY - pan.y); }
    }}>
      <svg ref={svg} fontFamily="Arial, Malgun Gothic, sans-serif" id="electronics-breadboard" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${circuit.title} 가상 빵판 배치도${fitOccupied ? " · 사용 영역" : " · 전체 빵판"}`} viewBox={`${viewRect.x} ${viewRect.y} ${viewRect.width} ${viewRect.height}`} style={{ width: `${zoom * 100}%`, minWidth: (fitOccupied ? Math.min(950, viewRect.width) : 950) * zoom, height: "auto", display: "block" }} onPointerDownCapture={() => { if (!dragRef.current) suppressClick.current = false; }} onPointerMove={moveDrag} onPointerUp={finishDrag} onPointerCancel={cancelDrag} onLostPointerCapture={() => { if (dragRef.current) cancelDrag(); }} onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; } }} onMouseDown={e => {
        if (e.target === e.currentTarget && scroller.current) setPan({ x: e.clientX, y: e.clientY, left: scroller.current.scrollLeft, top: scroller.current.scrollTop });
      }}>
        <defs>
          <linearGradient id="bb-surface" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fafafa" /><stop offset="0.5" stopColor="#eeeeee" /><stop offset="1" stopColor="#e6e6e6" /></linearGradient>
          <linearGradient id="bb-chip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38424a" /><stop offset="1" stopColor="#111c22" /></linearGradient>
          <filter id="bb-shadow" x="-30%" y="-50%" width="160%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.18" /></filter>
        </defs>
        {boardSurface}
        {displayedLayers.includes("jumper") && layout.jumpers.map((j, i) => {
          const a = holes.get(j.from), b = holes.get(j.to); if (!a || !b) return null;
          const sameRow = Math.abs(a.y - b.y) < 3;
          const sameRail = sameRow && a.board === b.board && /^[TB][+-]$/.test(a.row) && a.row === b.row;
          // Rail bridges stay beside their contacts instead of arching outside the board.
          const bendY = sameRail ? a.y + (a.row.startsWith("T") ? 7 : -7) : Math.min(a.y, b.y) - 18 - i % 5 * 9;
          const path = sameRow ? `M${a.x},${a.y} L${a.x},${bendY} L${b.x},${bendY} L${b.x},${b.y}` : `M${a.x},${a.y} L${a.x + 6 + i % 3 * 5},${a.y} L${a.x + 6 + i % 3 * 5},${b.y} L${b.x},${b.y}`;
          const label = `${j.id} · ${circuit.netNames[j.netId] || j.netId} · ${j.from} ↔ ${j.to}`;
          const opacity = opacityFor(undefined, j.netId, j.id);
          return <g key={j.id} data-board-layer="jumper" opacity={opacity} style={{ cursor: "pointer" }} role="button" tabIndex={0} aria-label={label} onClick={() => onSelect({ type: "jumper", id: j.id })} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect({ type: "jumper", id: j.id }); } }} onMouseMove={e => titleFor(label, e)} onMouseLeave={clearTip}>
            <path d={path} fill="none" stroke="#f0f0f0" strokeWidth={6.8} strokeLinejoin="round" />
            <path d={path} fill="none" stroke={j.color} strokeWidth={3.5} strokeLinejoin="round" />
            <path d={path} fill="none" stroke="transparent" strokeWidth={12} />
            {pinDot(a, `${j.id} 시작 · ${j.from}`, "a")}{pinDot(b, `${j.id} 끝 · ${j.to}`, "b")}
            {selection?.type === "jumper" && selection.id === j.id && <text x={(a.x + b.x) / 2} y={Math.min(a.y, b.y) - 9} fontSize={11} fill={j.color} fontWeight={800} stroke="#fff" strokeWidth={3} paintOrder="stroke">{j.id}</text>}
            <title>{label}</title>
          </g>;
        })}
        {layout.placements.map(p => {
          const c = components.get(p.componentId); if (!c) return null;
          const d = defs.get(c.definitionId); if (!d) return null;
          if (!displayedLayers.includes(componentLayer(d.kind))) return null;
          const entries = d.pins.map(pin => {
            const hole = holes.get(p.pins[pin.id]);
            const movingPin = hole && drag?.moved && drag.type === "pin" && drag.id === c.id && drag.anchorPinId === pin.id;
            return { pin, hole: movingPin ? { ...hole, x: hole.x + drag.dx, y: hole.y + drag.dy } : hole };
          }).filter((e): e is { pin: typeof d.pins[number]; hole: BoardHole } => Boolean(e.hole));
          if (!entries.length) return null;
          const xs = entries.map(e => e.hole.x), ys = entries.map(e => e.hole.y);
          const x = (Math.min(...xs) + Math.max(...xs)) / 2, y = (Math.min(...ys) + Math.max(...ys)) / 2;
          const a = entries[0].hole, b = entries[entries.length - 1].hole;
          const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
          const length = Math.hypot(b.x - a.x, b.y - a.y);
          const dip = /(?:PDIP|DIP|DIL)/i.test(d.package) && entries.length >= 4;
          const bodyWidth = Math.max(22, Math.min(38, length * 0.55));
          const negativeLead = entries.find(entry => /^(?:−|-)$/.test(entry.pin.label));
          const negativeSide = negativeLead && negativeLead.hole.x < x ? -1 : 1;
          const marking = d.kind === "resistor" ? resistorMarking(c.value) : null;
          const label = `${c.id} · ${d.name} · ${c.value}${marking ? ` · ${marking.label}` : ""}`;
          const selected = selection?.type === "component" && selection.id === c.id || activeStep?.componentId === c.id;
          const opacity = opacityFor(c.id);
          const moving = (drag?.type === "component" || drag?.type === "pin") && drag.id === c.id && drag.moved ? drag : null;
          return <g key={c.id} data-board-layer={componentLayer(d.kind)} opacity={moving ? 0.58 : opacity} transform={moving?.type === "component" ? `translate(${moving.dx},${moving.dy})` : undefined} style={{ cursor: onMoveComponent && !onHolePick ? moving ? "grabbing" : "grab" : "pointer", touchAction: onMoveComponent && !onHolePick ? "none" : undefined }} role="button" tabIndex={0} aria-label={`${label}${onMoveComponent ? " · 끌어서 위치 이동" : ""}`} onPointerDown={event => beginDrag(event, "component", c.id, entries[0].hole, entries[0].pin.id)} onClick={() => onSelect({ type: "component", id: c.id })} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect({ type: "component", id: c.id }); } }} onMouseMove={e => titleFor(label, e)} onMouseLeave={clearTip}>
            {selected && <rect x={Math.min(...xs) - 12} y={Math.min(...ys) - 24} width={Math.max(...xs) - Math.min(...xs) + 24} height={Math.max(...ys) - Math.min(...ys) + 42} rx={7} fill="#525252" fillOpacity={0.08} stroke="#4a4a4a" strokeWidth={1.5} strokeDasharray="4 3" />}
            {entries.map(({ pin, hole }, index) => {
              const radial = !dip && !["resistor", "diode", "inductor"].includes(d.kind);
              const leadX = radial ? x + (entries.length === 2 ? (hole.x < x ? -6 : 6) : (index - (entries.length - 1) / 2) * 8) : dip ? hole.x : x;
              const leadY = radial && ["transistor", "mosfet"].includes(d.kind) ? y - 6 : radial ? y - 3 : y;
              return <line key={`lead${pin.id}`} x1={hole.x} y1={hole.y} x2={leadX} y2={leadY} stroke="#9aa4a4" strokeWidth={2.8} />;
            })}
            {dip ? <g>
              <rect x={Math.min(...xs) - 9} y={y - 14} width={Math.max(...xs) - Math.min(...xs) + 18} height={28} rx={3} fill="url(#bb-chip)" stroke="#0b171b" />
              <path d={`M${Math.min(...xs) - 9},${y - 5} a5,5 0 0 1 0,10`} fill="#a6aeb0" />
              <circle cx={Math.min(...xs) - 2} cy={y + 8} r={1.5} fill="#b5bfbf" />
              <text x={x} y={y + 3} textAnchor="middle" fill="#d5dddd" fontSize={8} fontFamily="monospace">{c.value || d.name}</text>
            </g> : d.kind === "resistor" || d.kind === "diode" || d.kind === "inductor" ? <g transform={`translate(${x},${y}) rotate(${angle})`} filter="url(#bb-shadow)">
              <rect x={-bodyWidth / 2} y={-6} width={bodyWidth} height={12} rx={d.kind === "diode" ? 2 : 5} fill={d.kind === "diode" ? "#c96631" : d.kind === "inductor" ? "#527d70" : "#d8bd86"} stroke="#9c8d70" strokeWidth={0.7} />
              {marking ? <g data-resistor-marking={c.id}>
                {marking.colors.map((color, index) => <rect key={index} x={marking.colors.length === 1 ? -1.5 : -bodyWidth / 2 + 4 + index * (bodyWidth - 10) / marking.colors.length} y={-5.8} width={marking.colors.length > 3 ? 2.2 : 3} height={11.6} fill={color} />)}
                {marking.toleranceUnknown && <text x={bodyWidth / 2 - 4} y={3} textAnchor="middle" fontSize={8} fontWeight={800} fill="#40351f">?</text>}
                {!marking.colors.length && <text x={0} y={3} textAnchor="middle" fontSize={9} fontWeight={800} fill="#40351f">?</text>}
              </g> : d.kind === "diode" ? <rect x={bodyWidth / 2 - 7} y={-6} width={4} height={12} fill="#292d2f" /> : null}
            </g> : d.kind === "electrolytic" ? <g filter="url(#bb-shadow)"><rect x={x - 10} y={y - 21} width={20} height={26} rx={3} fill="#315a74" /><ellipse cx={x} cy={y - 21} rx={10} ry={4} fill="#9caeb6" /><path d={`M${x - 4},${y - 21}h8M${x},${y - 24}v6`} stroke="#71858b" strokeWidth={0.7} /><rect data-negative-band={c.id} x={x + negativeSide * 7 - 2} y={y - 18} width={4} height={21} fill="#bdcbd2" /><text x={x + negativeSide * 7} y={y - 5} fontSize={7} fill="#315a74" textAnchor="middle">−</text></g>
              : d.kind === "transistor" || d.kind === "mosfet" ? <g filter="url(#bb-shadow)"><path d={`M${x - 13},${y - 6} L${x + 13},${y - 6} L${x + 13},${y - 18} Q${x},${y - 31} ${x - 13},${y - 18} Z`} fill="#27353b" stroke="#0d1d22" /><text x={x} y={y - 13} textAnchor="middle" fill="#ccd5d5" fontSize={6.5}>{c.value || d.name.replace(/ .*/, "")}</text></g>
                : d.kind === "led" ? <g filter="url(#bb-shadow)"><circle cx={x} cy={y - 9} r={10} fill="#d64e49" fillOpacity={0.85} stroke="#9f3537" /><ellipse cx={x - 3} cy={y - 13} rx={3} ry={4} fill="#fff" opacity={0.4} /></g>
                  : d.kind === "capacitor" ? <ellipse cx={x} cy={y - 8} rx={12} ry={10} fill="#bd7544" stroke="#9e572f" filter="url(#bb-shadow)" />
                    : <rect x={x - 13} y={y - 16} width={26} height={22} rx={3} fill="#426f93" stroke="#234d6b" />}
            {entries.map(({ pin, hole }) => <g key={pin.id}>
              {pinDot(hole, `${c.id} ${pin.id}번 · ${pin.label} · ${hole.id} · ${c.pinNets[pin.id] || "연결 미정"}${onMovePin ? " · 이 다리만 끌어서 이동" : ""}`, pin.id, c.id)}
              {(labelsVisible || selected) && ["electrolytic", "diode", "led"].includes(d.kind) && <text data-pin-polarity={`${c.id}.${pin.id}`} x={hole.x} y={hole.y + 12} textAnchor="middle" fontSize={8} fontWeight={700} fill="#444" stroke="#fff" strokeWidth={2.5} paintOrder="stroke" pointerEvents="none">{pin.label}</text>}
            </g>)}
            {(labelsVisible || selected) && <text x={x} y={Math.min(...ys) - (dip ? 12 : ["transistor", "mosfet"].includes(d.kind) ? 34 : d.kind === "electrolytic" ? 30 : 18)} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#414141" stroke="#fafafa" strokeWidth={3.4} paintOrder="stroke">{selected ? `${c.id} · ${c.value || d.name}` : c.id}</text>}
            <title>{`${label}\n${entries.map(e => `${e.pin.id} ${e.pin.label}: ${e.hole.id}`).join("\n")}`}</title>
          </g>;
        })}
        {/* Captions sit over wire paths; terminals render afterward and retain their hit targets. */}
        {[...railUsage.values()].map(usage => {
          const firstHole = layout.board.holes.find(hole => hole.group === usage.group);
          if (!firstHole) return null;
          const conflict = usage.netIds.length > 1;
          const railColor = conflict ? "#dc2626" : usage.role === "ground" ? "#356457" : usage.role === "positive" ? "#c74343" : usage.role === "negative" ? "#326db2" : "#667e82";
          const names = usage.netIds.map(netId => circuit.netNames[netId] || netId).join(" / ");
          const name = names.length > 16 ? `${names.slice(0, 15)}…` : names;
          const groundId = usage.netIds[0] || "GND";
          const groundName = /^(?:[ADP]?GND|GROUND)(?:$|[_:])/i.test(groundId) ? groundId : groundId === "0" ? "GND" : `GND (${groundId})`;
          const caption = conflict ? `연결 충돌 · ${name}` : usage.role === "ground" ? `${groundName.length > 18 ? `${groundName.slice(0, 17)}…` : groundName} · 0V` : usage.role === "positive" ? `${/^\+/.test(name) ? "" : "+ "}${name}` : usage.role === "negative" ? `${/^[−-]/.test(name) ? "" : "− "}${name}` : name;
          const labelX = firstHole.x + 48;
          const labelWidth = Math.max(64, [...caption].reduce((width, character) => width + (character.charCodeAt(0) > 255 ? 9 : 5.4), 14));
          return <g key={usage.group} data-rail-label={usage.netIds.join(",")} pointerEvents="none">
            <rect x={labelX - 5} y={firstHole.y - 16} width={labelWidth} height={14} rx={4} fill="#fafafa" stroke={railColor} strokeWidth={0.7} />
            <text x={labelX + 1} y={firstHole.y - 6} fontSize={9} fontWeight={800} fill={railColor}>{caption}</text>
            <title>{`${usage.group} · ${names}${usage.role === "ground" ? " · GND 기준 전위(0V)" : ""}${conflict ? " · 서로 다른 노드의 연결 충돌" : ""}`}</title>
          </g>;
        })}
        {displayedLayers.includes("instrument") && layout.terminals.map(t => {
          const h = holes.get(t.holeId), instrument = instruments.get(t.connectionId); if (!h || !instrument) return null;
          const { connection: c, reference } = instrument;
          const label = `${reference} · ${c.instrument} ${c.port} · ${h.id} · ${c.setting || ""}`;
          const powerRole = getPowerNetRole(circuit, t.netId);
          const terminalColor = powerRole === "ground" ? "#356457" : powerRole === "positive" ? "#c74343" : powerRole === "negative" ? "#326db2" : "#da8a3b";
          const active = selection?.type === "terminal" && selection.id === t.connectionId || activeStep?.connectionId === t.connectionId;
          const moving = drag?.type === "terminal" && drag.id === t.connectionId && drag.moved ? drag : null;
          return <g key={t.connectionId} data-board-layer="instrument" role="button" tabIndex={0} aria-label={`${label}${onMoveTerminal ? " · 끌어서 위치 이동" : ""}`} transform={moving ? `translate(${moving.dx},${moving.dy})` : undefined} style={{ cursor: onHolePick ? "crosshair" : onMoveTerminal ? moving ? "grabbing" : "grab" : "pointer", touchAction: onMoveTerminal && !onHolePick ? "none" : undefined }} onPointerDown={event => beginDrag(event, "terminal", t.connectionId, h)} onClick={() => onHolePick ? onHolePick(h.id) : onSelect({ type: "terminal", id: t.connectionId })} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onHolePick ? onHolePick(h.id) : onSelect({ type: "terminal", id: t.connectionId }); } }} onMouseMove={e => titleFor(label, e)} onMouseLeave={clearTip} opacity={moving ? 0.58 : selectionActive && !active && !selectedNets.has(t.netId) ? 0.22 : 1}>
            <circle cx={h.x} cy={h.y} r={active ? 7 : 5} fill={terminalColor} stroke="#fff" strokeWidth={1.5} />
            {(labelsVisible || active) && <text x={h.x} y={h.y + 13} textAnchor="middle" fontSize={8} fontWeight={800} fill={terminalColor} stroke="#fff" strokeWidth={2.5} paintOrder="stroke">{reference}</text>}
            {active && <text x={h.x + 11} y={h.y - 13} fontSize={9} fontWeight={800} fill={terminalColor} stroke="#fff" strokeWidth={3} paintOrder="stroke">{c.instrument} · {c.port}{powerRole === "ground" ? " · GND" : powerRole === "positive" ? " · +전원" : powerRole === "negative" ? " · −전원" : ""}</text>}
            <title>{label}</title>
          </g>;
        })}
        {probeMarkers.map((probe, index) => {
          const hole = holes.get(probe.holeId);
          if (!hole) return null;
          const offset = index % 2 === 0 ? -27 : 27;
          return <g key={probe.label} data-probe-marker={probe.label} pointerEvents="none">
            <circle cx={hole.x} cy={hole.y} r={9 + index * 2} fill="none" stroke={probe.color} strokeWidth={2} />
            <path d={`M${hole.x},${hole.y + (offset < 0 ? -9 : 9)}v${offset < 0 ? -8 : 8}`} stroke={probe.color} strokeWidth={2} />
            <rect x={hole.x - 20} y={hole.y + offset - 7} width={40} height={14} rx={4} fill={probe.color} stroke="#fff" />
            <text x={hole.x} y={hole.y + offset + 3} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">{probe.label}</text>
            <title>{`${probe.label} · ${hole.id} 측정`}</title>
          </g>;
        })}
        {drag?.moved && <g pointerEvents="none" aria-hidden="true">
          <circle cx={drag.origin.x} cy={drag.origin.y} r={8} fill="none" stroke="#858585" strokeWidth={1.5} strokeDasharray="3 3" />
          <circle cx={drag.origin.x + drag.dx} cy={drag.origin.y + drag.dy} r={9} fill={drag.targetHoleId ? "#52525222" : "#cb534322"} stroke={drag.targetHoleId ? "#4a4a4a" : "#cb5343"} strokeWidth={2} />
          <g transform={`translate(${Math.max(viewRect.x + 6, Math.min(viewRect.x + viewRect.width - 210, drag.origin.x + drag.dx + 12))},${Math.max(viewRect.y + 22, drag.origin.y + drag.dy - 22)})`}>
            <rect x={0} y={-15} width={204} height={24} rx={5} fill="#272727" />
            <text x={9} y={1} fill="#fff" fontSize={10}>{drag.targetHoleId ? `${drag.type === "terminal" ? drag.id : `${drag.id}.${drag.anchorPinId}`} → ${drag.targetHoleId} · 놓아서 적용` : "구멍 위에 놓으세요 · Esc 취소"}</text>
          </g>
        </g>}
      </svg>
    </div>
    {tip && <div className="el-board-tooltip" style={{ left: Math.max(8, tip.x), top: tip.y + 40 }}>{tip.text}</div>}
    <div className="el-board-caption"><span><b /> 소자 · {onMoveComponent ? "몸통 전체 / 다리 한쪽 이동" : "클릭하여 상세 확인"}</span><span><b className="el-dot-wire" /> 점퍼 · 양 끝 좌표 확인</span><span><b className="el-dot-port" /> 외부 장비 연결점</span><span>{onMoveComponent ? "이동 미리보기 · 놓아서 적용 / Esc 취소" : "정면 기준 · 색상과 좌표를 함께 확인"}</span></div>
  </div>;
}
