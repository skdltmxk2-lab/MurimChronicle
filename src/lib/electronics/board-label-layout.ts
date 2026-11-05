/**
 * Pure placement rules that keep every hole number readable on the virtual breadboard. Hole numbers are the
 * owner's first reading aid, so no caption, terminal tag or part name may be drawn over one.
 */

export type CaptionRequest = { id: string; lane: string; order: number; startX: number; width: number };

/**
 * Places rail captions left to right inside their own lane. A caption never overlaps an earlier caption of the
 * same lane nor a blocked interval (for example an instrument-terminal label), so it cannot hide a hole number.
 * Returns the left edge of every caption by id.
 */
export function layoutRailCaptions(requests: CaptionRequest[], blocked: Record<string, [number, number][]> = {}, gap = 6): Map<string, number> {
  const lanes = new Map<string, CaptionRequest[]>();
  for (const request of requests) lanes.set(request.lane, [...(lanes.get(request.lane) ?? []), request]);
  const placed = new Map<string, number>();
  for (const [lane, items] of lanes) {
    const obstacles = (blocked[lane] ?? []).map(([a, b]) => [Math.min(a, b), Math.max(a, b)] as [number, number]);
    const taken: [number, number][] = [];
    for (const item of [...items].sort((a, b) => a.startX - b.startX || a.order - b.order)) {
      let x = item.startX;
      // Every hit moves x strictly right, so this ends after at most one pass per interval.
      for (let guard = 0; guard <= obstacles.length + taken.length; guard++) {
        const hit = [...obstacles, ...taken].find(([from, to]) => x < to + gap && x + item.width + gap > from);
        if (!hit) break;
        x = hit[1] + gap;
      }
      taken.push([x, x + item.width]);
      placed.set(item.id, x);
    }
  }
  return placed;
}

/**
 * Baseline offset of an instrument-terminal label so it never lands on a hole-number line. Signal columns are
 * numbered above row A and below row J; rail contacts sit in two rows whose shared lane is the free band
 * between them. The first rail row of a pair labels downward into that lane and the second labels upward.
 */
export function terminalLabelOffset(row: string): number {
  if (row === "J") return -8;
  if (/^[TB]-$/.test(row)) return -8;
  return 13;
}

/** Names a hole's connected group, listing every hole of a strip and only the two ends of a long rail. */
export function describeHoleGroup(holes: { id: string; group: string; x: number; y: number }[], holeId: string): string {
  const hole = holes.find(item => item.id === holeId);
  if (!hole) return "";
  const group = holes.filter(item => item.group === hole.group).sort((a, b) => a.x - b.x || a.y - b.y);
  return `내부 연결 ${group.length}홀: ${group.length <= 5 ? group.map(item => item.id).join(" · ") : `${group[0].id} ~ ${group.at(-1)!.id}`}`;
}

/**
 * Column numbers sit about 12 px above row A (glyphs span roughly 18.5 to 12 px above it). A part name whose glyphs
 * would overlap them moves down to rest just above row A, so the name never covers a hole number. A name that
 * already clears the numbers, such as the default label of a part in row A, is left where it is.
 */
export function partLabelBaseline(wanted: number, topRowY: number | undefined): number {
  return topRowY !== undefined && wanted > topRowY - 17 && wanted < topRowY - 4.5 ? topRowY - 4 : wanted;
}
