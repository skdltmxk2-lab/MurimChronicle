/** Shared lexical parsing for explicit SI component values. Callers apply their own limits. */
export function parseExplicitComponentValue(value: string, kind: "resistor" | "capacitor"): number | null {
  if (typeof value !== "string" || value.length > 80) return null;
  const text = value.trim().replace(/[μµ]/g, "u").replace(/Ω/g, "Ω");
  const match = /^([+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)\s*(meg|[fpnumkKMG]?)\s*(Ω|[oO][hH][mM][sS]?|F)?$/.exec(text);
  if (!match || (match[3] && (kind === "resistor" ? match[3] === "F" : match[3] !== "F"))) return null;
  const factors: Record<string, number> = { "": 1, f: 1e-15, p: 1e-12, n: 1e-9, u: 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, meg: 1e6, G: 1e9 };
  return Number(match[1]) * factors[match[2]];
}
