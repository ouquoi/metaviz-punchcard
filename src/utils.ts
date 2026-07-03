export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return [235, 237, 240];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function lerpColor(a: string, b: string, t: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  const r = Math.round(ra[0] + (rb[0] - ra[0]) * t);
  const g = Math.round(ra[1] + (rb[1] - ra[1]) * t);
  const bl = Math.round(ra[2] + (rb[2] - ra[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

export function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toLocaleString();
}

export function isNumericCol(col: { base_type?: string }): boolean {
  return /Integer|Float|Decimal|BigInteger|Number/i.test(col.base_type ?? "");
}

const DAY_NAME_MAP: Record<string, number> = {
  sunday: 0, sun: 0, dim: 0, dimanche: 0,
  monday: 1, mon: 1, lun: 1, lundi: 1,
  tuesday: 2, tue: 2, mar: 2, mardi: 2,
  wednesday: 3, wed: 3, mer: 3, mercredi: 3,
  thursday: 4, thu: 4, jeu: 4, jeudi: 4,
  friday: 5, fri: 5, ven: 5, vendredi: 5,
  saturday: 6, sat: 6, sam: 6, samedi: 6,
};

export function parseDayValue(v: unknown): number {
  if (typeof v === "number") return Math.round(v);
  const s = String(v).toLowerCase().trim();
  if (s in DAY_NAME_MAP) return DAY_NAME_MAP[s];
  const n = parseInt(s, 10);
  return isNaN(n) ? -1 : n;
}
