import { useState } from "react";
import type { CustomVisualizationProps as VisualizationProps } from "@metabase/custom-viz";
import type { Settings } from "./types";
import { lerpColor, parseDayValue } from "./utils";

const ML = 42;
const MT = 22;
const MR = 12;
const MB = 14;
const GAP = 2;

const LABELS_MON = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const LABELS_SUN = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

type CellEntry = { value: number; rawRow: unknown[]; rawDay: unknown; rawHour: unknown };

export function Punchcard({
  series,
  settings,
  width,
  height,
  colorScheme,
  onClick,
}: VisualizationProps<Settings>) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const cw = (width ?? 0) > 0 ? Math.floor(width ?? 0) : 0;
  const ch = (height ?? 0) > 0 ? Math.floor(height ?? 0) : 0;
  if (!cw || !ch) return null;

  const dark = colorScheme === "dark";
  const axisColor = dark ? "#9BA7B5" : "#6E7B8B";
  const emptyFill = dark ? "#2A2E3A" : "#efefef";

  const data = series?.[0]?.data;
  if (!data) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cols = data.cols as any[];
  const rows = data.rows as unknown[][];

  const dayIdx = cols.findIndex((c) => c.name === settings.dayColumn);
  const hourIdx = cols.findIndex((c) => c.name === settings.hourColumn);
  const valueIdx = cols.findIndex((c) => c.name === settings.valueColumn);
  if (dayIdx < 0 || hourIdx < 0 || valueIdx < 0) return null;

  const grid: (CellEntry | null)[][] = Array.from({ length: 7 }, () =>
    Array<CellEntry | null>(24).fill(null),
  );
  let maxVal = 0;
  let peakD = 0;
  let peakH = 0;

  for (const row of rows) {
    const rawDay = row[dayIdx];
    const rawHour = row[hourIdx];
    const rawValue = row[valueIdx];

    const d = parseDayValue(rawDay);
    const h = typeof rawHour === "number" ? Math.round(rawHour) : parseInt(String(rawHour), 10);
    const v = typeof rawValue === "number" ? rawValue : parseFloat(String(rawValue));

    if (d < 0 || d > 6 || isNaN(h) || h < 0 || h > 23 || isNaN(v) || v < 0) continue;

    grid[d][h] = { value: v, rawRow: row, rawDay, rawHour };
    if (v > maxVal) {
      maxVal = v;
      peakD = d;
      peakH = h;
    }
  }

  const labels = (settings.weekStart ?? "monday") === "monday" ? LABELS_MON : LABELS_SUN;
  const colW = (cw - ML - MR) / 24;
  const rowH = (ch - MT - MB) / 7;
  const baseCell = Math.min(colW, rowH) - GAP;
  const colorLow = settings.colorLow ?? "#ebedf0";
  const colorHigh = settings.colorHigh ?? "#509EE3";
  const shape = settings.cellShape ?? "square";
  const encoding = settings.encoding ?? "intensity";

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const anyHovered = hoveredKey !== null;
  const cells: React.ReactElement[] = [];

  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const cell = grid[d][h];
      const key = `${d}-${h}`;
      const cx = ML + h * colW + colW / 2;
      const cy = MT + d * rowH + rowH / 2;
      const t = maxVal > 0 && cell ? cell.value / maxVal : 0;

      let cellSize: number;
      let fillColor: string;

      if (encoding === "intensity") {
        cellSize = baseCell;
        fillColor = cell ? lerpColor(colorLow, colorHigh, t) : emptyFill;
      } else if (encoding === "size") {
        cellSize = cell ? Math.max(baseCell * 0.12, baseCell * t) : baseCell * 0.08;
        fillColor = cell ? colorHigh : emptyFill;
      } else {
        cellSize = cell ? Math.max(baseCell * 0.2, baseCell * (0.3 + 0.7 * t)) : baseCell * 0.12;
        fillColor = cell ? lerpColor(colorLow, colorHigh, t) : emptyFill;
      }

      const hovered = hoveredKey === key;
      const gOpacity = anyHovered ? (hovered ? 1 : 0.35) : 1;
      const delay = (h + d) * 6;

      const animEl = !reducedMotion ? (
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.25s"
          begin={`${delay}ms`}
          fill="freeze"
        />
      ) : null;

      const handlers = {
        style: { cursor: cell ? "pointer" : "default" },
        onMouseEnter: (e: React.MouseEvent) => {
          setHoveredKey(key);
          if (cell) {
            setTooltip({
              x: e.clientX,
              y: e.clientY,
              text: `${labels[d]} ${h}h · ${cell.value.toLocaleString()}`,
            });
          }
        },
        onMouseMove: (e: React.MouseEvent) => {
          if (cell) setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
        },
        onMouseLeave: () => {
          setHoveredKey(null);
          setTooltip(null);
        },
        onClick: (e: React.MouseEvent) => {
          if (cell && onClick) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (onClick as any)({
              value: cell.rawDay,
              column: cols[dayIdx],
              data: [
                { col: cols[dayIdx], value: cell.rawDay },
                { col: cols[hourIdx], value: cell.rawHour },
                { col: cols[valueIdx], value: cell.value },
              ],
              dimensions: [{ value: cell.rawDay, column: cols[dayIdx] }],
              event: e.nativeEvent,
              origin: { row: cell.rawRow, cols },
            });
          }
        },
      };

      let shapeEl: React.ReactElement;
      if (shape === "circle") {
        shapeEl = (
          <circle
            opacity={reducedMotion ? 1 : 0}
            cx={cx}
            cy={cy}
            r={cellSize / 2}
            fill={fillColor}
            {...handlers}
          >
            {animEl}
          </circle>
        );
      } else {
        const x = cx - cellSize / 2;
        const y = cy - cellSize / 2;
        shapeEl = (
          <rect
            opacity={reducedMotion ? 1 : 0}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            rx={Math.min(3, cellSize * 0.2)}
            fill={fillColor}
            {...handlers}
          >
            {animEl}
          </rect>
        );
      }

      cells.push(
        <g key={key} opacity={gOpacity}>
          {shapeEl}
        </g>,
      );
    }
  }

  // Peak highlight border
  let peakEl: React.ReactElement | null = null;
  if (maxVal > 0) {
    const pcx = ML + peakH * colW + colW / 2;
    const pcy = MT + peakD * rowH + rowH / 2;
    const pad = 2;
    const peakColor = dark ? "#FF33BB" : "#5F016F";
    if (shape === "circle") {
      peakEl = (
        <circle
          cx={pcx}
          cy={pcy}
          r={baseCell / 2 + pad}
          fill="none"
          stroke={peakColor}
          strokeWidth={1.5}
          pointerEvents="none"
        />
      );
    } else {
      const ps = baseCell / 2 + pad;
      peakEl = (
        <rect
          x={pcx - ps}
          y={pcy - ps}
          width={ps * 2}
          height={ps * 2}
          rx={5}
          fill="none"
          stroke={peakColor}
          strokeWidth={1.5}
          pointerEvents="none"
        />
      );
    }
  }

  // Hour axis labels (every 3 hours)
  const hourLabels = Array.from({ length: 8 }, (_, i) => {
    const h = i * 3;
    return (
      <text
        key={h}
        x={ML + h * colW + colW / 2}
        y={MT - 8}
        textAnchor="middle"
        fontSize={10}
        fill={axisColor}
      >
        {h}h
      </text>
    );
  });

  // Day axis labels
  const dayLabels = labels.map((label, d) => (
    <text
      key={d}
      x={ML - 8}
      y={MT + d * rowH + rowH / 2}
      textAnchor="end"
      dominantBaseline="central"
      fontSize={10}
      fill={axisColor}
    >
      {label}
    </text>
  ));

  return (
    <div style={{ position: "relative", width: cw, height: ch, overflow: "hidden" }}>
      <svg width={cw} height={ch}>
        {hourLabels}
        {dayLabels}
        {cells}
        {peakEl}
      </svg>
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 12,
            top: tooltip.y - 32,
            background: dark ? "#1F2335" : "#fff",
            border: `1px solid ${dark ? "#3A4060" : "#ddd"}`,
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 12,
            color: dark ? "#ccc" : "#333",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
