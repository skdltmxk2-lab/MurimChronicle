"use client";

import { useMemo, useRef, useState } from "react";
import type { AssemblyStep, BoardHole, Circuit, CircuitLayout, ComponentDefinition } from "@/lib/electronics/types";

export type BoardSelection = { type: "component" | "jumper" | "terminal" | "hole"; id: string } | null;

function resistanceColors(value: string) {
  const match = value.replace(/,/g, "").match(/([\d.]+)\s*([kKmM]?)/);
  const n = match ? Number(match[1]) * (match[2]?.toLowerCase() === "k" ? 1000 : match[2] === "M" ? 1000000 : 1) : 1000;
  const palette = ["#202020", "#75432a", "#bc292f", "#e47e32", "#e2bd43", "#50824b", "#3472aa", "#7e539a", "#7c8087", "#eee9d9"];
  if (!Number.isFinite(n) || n <= 0) return [palette[0]];
  const exponent = Math.floor(Math.log10(n)) - 1;
  const digits = Math.round(n / 10 ** exponent).toString().padStart(2, "0");
  const multiplier = exponent === -1 ? "#b59b52" : exponent === -2 ? "#b8bfc3" : palette[exponent] || "#75432a";
  return [palette[Number(digits[0])], palette[Number(digits[1])], multiplier, "#b59b52"];
}

export function Breadboard({ circuit, definitions, layout, selection, onSelect, activeStep, wiresVisible, labelsVisible, onHolePick, zoom, onZoom }: {
  circuit: Circuit;
  definitions: ComponentDefinition[];
  layout: CircuitLayout;
  selection: BoardSelection;
  onSelect: (selection: BoardSelection) => void;
  activeStep?: AssemblyStep;
  wiresVisible: boolean;
  labelsVisible: boolean;
  onHolePick?: (holeId: string) => void;
  zoom: number;
  onZoom: (zoom: number) => void;
}) {
  const holes = useMemo(() => new Map(layout.board.holes.map(h => [h.id, h])), [layout.board]);
  const defs = useMemo(() => new Map(definitions.map(d => [d.id, d])), [definitions]);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [fitOccupied, setFitOccupied] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<{ x: number; y: number; left: number; top: number } | null>(null);
  const occupied = useMemo(() => new Set([...layout.placements.flatMap(p => Object.values(p.pins)), ...layout.jumpers.flatMap(j => [j.from, j.to]), ...layout.terminals.map(t => t.holeId)]), [layout]);
  const viewRect = useMemo(() => {
    const full = { x: 0, y: 0, width: layout.board.width, height: layout.board.height };
    if (!fitOccupied) return full;
    const points = [...occupied].map(id => holes.get(id)).filter((hole): hole is BoardHole => Boolean(hole));
    if (!points.length) return full;
    // Include lead bodies, wire bends and coordinate labels without moving physical holes.
    const x = Math.max(0, Math.min(...points.map(h => h.x)) - 54);
    const y = Math.max(0, Math.min(...points.map(h => h.y)) - 84);
    return { x, y, width: Math.min(layout.board.width - x, Math.max(320, Math.max(...points.map(h => h.x)) + 90 - x)),
      height: Math.min(layout.board.height - y, Math.max(220, Math.max(...points.map(h => h.y)) + 66 - y)) };
  }, [fitOccupied, occupied, holes, layout.board.width, layout.board.height]);
  const selectedComponent = selection?.type === "component" ? circuit.components.find(c => c.id === selection.id) : null;
  const selectedJumper = selection?.type === "jumper" ? layout.jumpers.find(j => j.id === selection.id) : null;
  const selectedTerminal = selection?.type === "terminal" ? layout.terminals.find(t => t.connectionId === selection.id) : null;
  const selectedNets = new Set(selectedComponent ? Object.values(selectedComponent.pinNets) : selectedJumper ? [selectedJumper.netId] : selectedTerminal ? [selectedTerminal.netId] : []);
  const selectedHoleGroup = selection?.type === "hole" ? holes.get(selection.id)?.group : undefined;
  if (selectedHoleGroup) {
    for (const placement of layout.placements) {
      const component = circuit.components.find(c => c.id === placement.componentId);
      for (const [pin, holeId] of Object.entries(placement.pins)) if (holes.get(holeId)?.group === selectedHoleGroup && component?.pinNets[pin]) selectedNets.add(component.pinNets[pin]);
    }
    for (const jumper of layout.jumpers) if (holes.get(jumper.from)?.group === selectedHoleGroup || holes.get(jumper.to)?.group === selectedHoleGroup) selectedNets.add(jumper.netId);
    for (const terminal of layout.terminals) if (holes.get(terminal.holeId)?.group === selectedHoleGroup) selectedNets.add(terminal.netId);
  }
  const activeHoles = new Set(activeStep?.holes ?? []);
  const selectedHoles = new Set(selection?.type === "hole" ? layout.board.holes.filter(h => h.group === selectedHoleGroup).map(h => h.id) : selectedComponent ? Object.values(layout.placements.find(p => p.componentId === selectedComponent.id)?.pins ?? {}) : selectedJumper ? [selectedJumper.from, selectedJumper.to] : selectedTerminal ? [selectedTerminal.holeId] : []);
  const selectionActive = Boolean(selection || activeStep);
  // Group by the actual board IDs; engines may number boards starting at zero or one.
  const boardIds = [...new Set(layout.board.holes.map(h => h.board))];
  const titleFor = (text: string, e: React.MouseEvent<SVGElement>) => {
    const rect = scroller.current?.getBoundingClientRect();
    if (rect) setTip({ text, x: Math.min(e.clientX - rect.left + 14, rect.width - 260), y: Math.max(8, e.clientY - rect.top - 55) });
  };
  const opacityFor = (componentId?: string, netId?: string, jumperId?: string) => {
    if (!selectionActive) return 1;
    if (activeStep) return (componentId && activeStep.componentId === componentId) || (jumperId && activeStep.jumperId === jumperId) || (netId && activeStep.connectionId && layout.terminals.find(t => t.connectionId === activeStep.connectionId)?.netId === netId) ? 1 : 0.16;
    const connectedComponent = componentId && selection?.type !== "component" && Object.values(circuit.components.find(c => c.id === componentId)?.pinNets ?? {}).some(net => selectedNets.has(net));
    return (selection?.type === "component" && selection.id === componentId) || (selection?.type === "jumper" && selection.id === jumperId) || (netId && selectedNets.has(netId)) || connectedComponent ? 1 : 0.2;
  };
  const pinDot = (h: BoardHole, label: string, key: string) => <g key={key} onMouseMove={e => { e.stopPropagation(); titleFor(label, e); }} onMouseLeave={() => setTip(null)}>
    <circle cx={h.x} cy={h.y} r={4} fill="#c9cdd1" stroke="#515a65" strokeWidth={1.3} />
    <circle cx={h.x} cy={h.y} r={1.4} fill="#27333c" />
    <title>{label}</title>
  </g>;

  return <div className={`el-board-stage ${onHolePick ? "el-picking" : ""}`}>
    <div className="el-board-toolbar">
      <span><i className="el-live-dot" /> {onHolePick ? "선택한 핀을 꽂을 구멍을 클릭하세요" : "소자에 마우스를 올리거나 클릭해 보세요"}</span>
      <div><button aria-label="축소" onClick={() => onZoom(Math.max(0.6, zoom - 0.2))}>−</button><button onClick={() => onZoom(1)}>{Math.round(zoom * 100)}%</button><button aria-label="확대" onClick={() => onZoom(Math.min(3, zoom + 0.2))}>+</button><button aria-pressed={fitOccupied} onClick={() => { setFitOccupied(value => !value); if (scroller.current) scroller.current.scrollTo({ left: 0, top: 0 }); }}>{fitOccupied ? "전체 빵판" : "사용 영역"}</button></div>
    </div>
    <div className="el-board-scroll" ref={scroller} onMouseLeave={() => { setTip(null); setPan(null); }} onMouseUp={() => setPan(null)} onMouseMove={e => {
      if (pan && scroller.current) { scroller.current.scrollLeft = pan.left - (e.clientX - pan.x); scroller.current.scrollTop = pan.top - (e.clientY - pan.y); }
    }}>
      <svg fontFamily="Arial, Malgun Gothic, sans-serif" id="electronics-breadboard" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`${circuit.title} 가상 빵판 배치도${fitOccupied ? " · 사용 영역" : " · 전체 빵판"}`} viewBox={`${viewRect.x} ${viewRect.y} ${viewRect.width} ${viewRect.height}`} style={{ width: `${zoom * 100}%`, minWidth: (fitOccupied ? Math.min(950, viewRect.width) : 950) * zoom, height: "auto", display: "block" }} onMouseDown={e => {
        if (e.target === e.currentTarget && scroller.current) setPan({ x: e.clientX, y: e.clientY, left: scroller.current.scrollLeft, top: scroller.current.scrollTop });
      }}>
        <defs>
          <linearGradient id="bb-surface" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fcfcf8" /><stop offset="0.5" stopColor="#eeeFE9" /><stop offset="1" stopColor="#e6e8e1" /></linearGradient>
          <linearGradient id="bb-chip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#38424a" /><stop offset="1" stopColor="#111c22" /></linearGradient>
          <filter id="bb-shadow" x="-30%" y="-50%" width="160%" height="220%"><feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.18" /></filter>
        </defs>
        {boardIds.map((boardId, bi) => {
          const list = layout.board.holes.filter(h => h.board === boardId);
          if (!list.length) return null;
          const xs = list.map(h => h.x), ys = list.map(h => h.y);
          const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
          const rowNames = [...new Set(list.map(h => h.row))];
          const rows = rowNames.map(row => ({ row, holes: list.filter(h => h.row === row).sort((a, b) => a.x - b.x) }));
          const eRow = rows.find(r => r.row.toUpperCase() === "E"), fRow = rows.find(r => r.row.toUpperCase() === "F");
          const trenchY = eRow && fRow ? (eRow.holes[0].y + fRow.holes[0].y) / 2 : (minY + maxY) / 2;
          return <g key={boardId}>
            <rect x={minX - 32} y={minY - 24} width={maxX - minX + 64} height={maxY - minY + 46} rx={13} fill="url(#bb-surface)" stroke="#c8cdc6" strokeWidth={2} filter="url(#bb-shadow)" />
            <text x={minX - 18} y={minY - 10} fill="#758176" fontSize={10} fontWeight={700}>B{bi + 1} · 63열</text>
            <rect x={minX - 14} y={trenchY - 7} width={maxX - minX + 28} height={14} rx={3} fill="#d4d9d0" stroke="#cbd0c7" />
            {rows.map(({ row, holes: rh }) => {
              const isCore = /^[a-j]$/i.test(row);
              const color = /\+|p|red/i.test(row) && !isCore ? "#d96f70" : "#7397b7";
              const y = rh[0].y;
              const railGroups = [...new Set(rh.map(h => h.group))].map(group => rh.filter(h => h.group === group));
              return <g key={row}>
                {!isCore && railGroups.map(group => <line key={group[0].group} x1={group[0].x - 8} x2={group[group.length - 1].x + 8} y1={y - 8} y2={y - 8} stroke={color} strokeWidth={2} />)}
                <text x={minX - 21} y={y + 3} fontSize={10} fontWeight={700} fill={isCore ? "#758176" : color}>{isCore ? row.toUpperCase() : row.includes("+") || /p|red/i.test(row) ? "+" : "−"}</text>
                <text x={maxX + 14} y={y + 3} fontSize={10} fontWeight={700} fill={isCore ? "#758176" : color}>{isCore ? row.toUpperCase() : row.includes("+") || /p|red/i.test(row) ? "+" : "−"}</text>
                {isCore && row.toUpperCase() === "A" && rh.filter(h => h.column === 1 || h.column % 5 === 0 || h.column === 63).map(h => <text key={h.id} x={h.x} y={y - 14} textAnchor="middle" fill="#889187" fontSize={9}>{h.column}</text>)}
              </g>;
            })}
            {list.map(h => {
              const active = activeHoles.has(h.id) || selectedHoles.has(h.id);
              return <g key={h.id} role="button" aria-label={`${h.id}${occupied.has(h.id) ? " 사용 중" : " 빈 구멍"}`} tabIndex={onHolePick ? 0 : undefined} onClick={e => { e.stopPropagation(); onHolePick ? onHolePick(h.id) : onSelect({ type: "hole", id: h.id }); }} onKeyDown={e => { if (e.key === "Enter") onHolePick ? onHolePick(h.id) : onSelect({ type: "hole", id: h.id }); }} onMouseMove={e => titleFor(`${h.id} · ${occupied.has(h.id) ? "사용 중" : "빈 구멍"}`, e)} onMouseLeave={() => setTip(null)}>
                {active && <circle cx={h.x} cy={h.y} r={8} fill="#15a394" fillOpacity={0.2} stroke="#009d91" strokeWidth={2} />}
                <rect x={h.x - 2.1} y={h.y - 2.1} width={4.2} height={4.2} rx={0.9} fill={active ? "#008c83" : "#606c63"} />
                <line x1={h.x - 1.2} x2={h.x + 1.2} y1={h.y - 1.2} y2={h.y - 1.2} stroke="#b6bdb3" strokeWidth={0.8} />
              </g>;
            })}
          </g>;
        })}
        {layout.jumpers.map((j, i) => {
          const a = holes.get(j.from), b = holes.get(j.to); if (!a || !b) return null;
          const sameRow = Math.abs(a.y - b.y) < 3;
          const bendY = Math.min(a.y, b.y) - 18 - i % 5 * 9;
          const path = sameRow ? `M${a.x},${a.y} L${a.x},${bendY} L${b.x},${bendY} L${b.x},${b.y}` : `M${a.x},${a.y} L${a.x + 6 + i % 3 * 5},${a.y} L${a.x + 6 + i % 3 * 5},${b.y} L${b.x},${b.y}`;
          const label = `${j.id} · ${circuit.netNames[j.netId] || j.netId} · ${j.from} ↔ ${j.to}`;
          const opacity = opacityFor(undefined, j.netId, j.id);
          const visible = wiresVisible || activeStep?.jumperId === j.id;
          return <g key={j.id} opacity={visible ? opacity : 0} style={{ pointerEvents: visible ? "auto" : "none", cursor: "pointer" }} role="button" tabIndex={visible ? 0 : -1} aria-label={label} onClick={() => onSelect({ type: "jumper", id: j.id })} onKeyDown={e => { if (e.key === "Enter") onSelect({ type: "jumper", id: j.id }); }} onMouseMove={e => titleFor(label, e)} onMouseLeave={() => setTip(null)}>
            <path d={path} fill="none" stroke="#eef0e8" strokeWidth={6.8} strokeLinejoin="round" />
            <path d={path} fill="none" stroke={j.color} strokeWidth={3.5} strokeLinejoin="round" />
            <path d={path} fill="none" stroke="transparent" strokeWidth={12} />
            {pinDot(a, `${j.id} 시작 · ${j.from}`, "a")}{pinDot(b, `${j.id} 끝 · ${j.to}`, "b")}
            {selection?.type === "jumper" && selection.id === j.id && <text x={(a.x + b.x) / 2} y={Math.min(a.y, b.y) - 9} fontSize={11} fill={j.color} fontWeight={800} stroke="#fff" strokeWidth={3} paintOrder="stroke">{j.id}</text>}
            <title>{label}</title>
          </g>;
        })}
        {layout.placements.map(p => {
          const c = circuit.components.find(c => c.id === p.componentId); if (!c) return null;
          const d = defs.get(c.definitionId); if (!d) return null;
          const entries = d.pins.map(pin => ({ pin, hole: holes.get(p.pins[pin.id]) })).filter((e): e is { pin: typeof d.pins[number]; hole: BoardHole } => Boolean(e.hole));
          if (!entries.length) return null;
          const xs = entries.map(e => e.hole.x), ys = entries.map(e => e.hole.y);
          const x = (Math.min(...xs) + Math.max(...xs)) / 2, y = (Math.min(...ys) + Math.max(...ys)) / 2;
          const a = entries[0].hole, b = entries[entries.length - 1].hole;
          const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
          const length = Math.hypot(b.x - a.x, b.y - a.y);
          const dip = /(?:PDIP|DIP|DIL)/i.test(d.package) && entries.length >= 4;
          const bodyWidth = Math.max(22, Math.min(38, length * 0.55));
          const label = `${c.id} · ${d.name} · ${c.value}`;
          const selected = selection?.type === "component" && selection.id === c.id || activeStep?.componentId === c.id;
          const opacity = opacityFor(c.id);
          return <g key={c.id} opacity={opacity} style={{ cursor: "pointer" }} role="button" tabIndex={0} aria-label={label} onClick={() => onSelect({ type: "component", id: c.id })} onKeyDown={e => { if (e.key === "Enter") onSelect({ type: "component", id: c.id }); }} onMouseMove={e => titleFor(label, e)} onMouseLeave={() => setTip(null)}>
            {selected && <rect x={Math.min(...xs) - 12} y={Math.min(...ys) - 24} width={Math.max(...xs) - Math.min(...xs) + 24} height={Math.max(...ys) - Math.min(...ys) + 42} rx={7} fill="#00a998" fillOpacity={0.08} stroke="#07978b" strokeWidth={1.5} strokeDasharray="4 3" />}
            {entries.map(({ pin, hole }, index) => {
              const radial = !dip && !["resistor", "diode", "inductor"].includes(d.kind);
              const leadX = radial ? x + (index - (entries.length - 1) / 2) * (entries.length === 3 ? 8 : 12) : dip ? hole.x : x;
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
              {d.kind === "resistor" ? resistanceColors(c.value).map((color, i) => <rect key={i} x={-bodyWidth / 2 + 5 + i * (bodyWidth - 12) / 3} y={-5.8} width={3} height={11.6} fill={color} />) : d.kind === "diode" ? <rect x={bodyWidth / 2 - 7} y={-6} width={4} height={12} fill="#292d2f" /> : null}
            </g> : d.kind === "electrolytic" ? <g filter="url(#bb-shadow)"><rect x={x - 10} y={y - 21} width={20} height={26} rx={3} fill="#315a74" /><ellipse cx={x} cy={y - 21} rx={10} ry={4} fill="#9caeb6" /><path d={`M${x - 4},${y - 21}h8M${x},${y - 24}v6`} stroke="#71858b" strokeWidth={0.7} /><rect x={x + 5} y={y - 18} width={4} height={21} fill="#bdcbd2" /><text x={x + 7} y={y - 5} fontSize={7} fill="#315a74" textAnchor="middle">−</text></g>
              : d.kind === "transistor" || d.kind === "mosfet" ? <g filter="url(#bb-shadow)"><path d={`M${x - 13},${y - 6} L${x + 13},${y - 6} L${x + 13},${y - 18} Q${x},${y - 31} ${x - 13},${y - 18} Z`} fill="#27353b" stroke="#0d1d22" /><text x={x} y={y - 13} textAnchor="middle" fill="#ccd5d5" fontSize={6.5}>{c.value || d.name.replace(/ .*/, "")}</text></g>
                : d.kind === "led" ? <g filter="url(#bb-shadow)"><circle cx={x} cy={y - 9} r={10} fill="#d64e49" fillOpacity={0.85} stroke="#9f3537" /><ellipse cx={x - 3} cy={y - 13} rx={3} ry={4} fill="#fff" opacity={0.4} /></g>
                  : d.kind === "capacitor" ? <ellipse cx={x} cy={y - 8} rx={12} ry={10} fill="#bd7544" stroke="#9e572f" filter="url(#bb-shadow)" />
                    : <rect x={x - 13} y={y - 16} width={26} height={22} rx={3} fill="#426f93" stroke="#234d6b" />}
            {entries.map(({ pin, hole }) => pinDot(hole, `${c.id} ${pin.id}번 · ${pin.label} · ${hole.id} · ${c.pinNets[pin.id] || "연결 미정"}`, pin.id))}
            {(labelsVisible || selected) && <text x={x} y={Math.min(...ys) - (dip ? 12 : ["transistor", "mosfet"].includes(d.kind) ? 34 : d.kind === "electrolytic" ? 30 : 18)} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#344b4b" stroke="#fafbf7" strokeWidth={3.4} paintOrder="stroke">{selected ? `${c.id} · ${c.value || d.name}` : c.id}</text>}
            <title>{`${label}\n${entries.map(e => `${e.pin.id} ${e.pin.label}: ${e.hole.id}`).join("\n")}`}</title>
          </g>;
        })}
        {layout.terminals.map(t => {
          const h = holes.get(t.holeId), c = circuit.instruments.find(i => i.id === t.connectionId); if (!h || !c) return null;
          const reference = `T${circuit.instruments.findIndex(connection => connection.id === t.connectionId) + 1}`;
          const label = `${reference} · ${c.instrument} ${c.port} · ${h.id} · ${c.setting || ""}`;
          const active = selection?.type === "terminal" && selection.id === t.connectionId || activeStep?.connectionId === t.connectionId;
          return <g key={t.connectionId} role="button" tabIndex={0} aria-label={label} onClick={() => onSelect({ type: "terminal", id: t.connectionId })} onKeyDown={e => { if (e.key === "Enter") onSelect({ type: "terminal", id: t.connectionId }); }} onMouseMove={e => titleFor(label, e)} onMouseLeave={() => setTip(null)} opacity={selectionActive && !active && !selectedNets.has(t.netId) ? 0.22 : 1}>
            <circle cx={h.x} cy={h.y} r={active ? 7 : 5} fill={/gnd|ground|−|^-$/i.test(c.port) ? "#475569" : "#da8a3b"} stroke="#fff" strokeWidth={1.5} />
            {(labelsVisible || active) && <text x={h.x} y={h.y + 13} textAnchor="middle" fontSize={8} fontWeight={800} fill="#925622" stroke="#fff" strokeWidth={2.5} paintOrder="stroke">{reference}</text>}
            {active && <text x={h.x + 11} y={h.y - 13} fontSize={9} fontWeight={800} fill="#925622" stroke="#fff" strokeWidth={3} paintOrder="stroke">{c.instrument} · {c.port}</text>}
            <title>{label}</title>
          </g>;
        })}
      </svg>
    </div>
    {tip && <div className="el-board-tooltip" style={{ left: Math.max(8, tip.x), top: tip.y + 40 }}>{tip.text}</div>}
    <div className="el-board-caption"><span><b /> 소자 · 클릭하여 상세 확인</span><span><b className="el-dot-wire" /> 점퍼 · 양 끝 좌표 확인</span><span><b className="el-dot-port" /> 외부 장비 연결점</span><span>정면 기준 · 색상과 좌표를 함께 확인</span></div>
  </div>;
}
