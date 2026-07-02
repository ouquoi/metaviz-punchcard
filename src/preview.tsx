import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Punchcard } from "./Punchcard";
import type { Settings } from "./types";

function generateMockRows(): [number, number, number][] {
  const rows: [number, number, number][] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      // Simulate realistic activity: high on weekdays (1-5=Mon-Fri), business hours
      const isWeekday = d >= 1 && d <= 5;
      const isPeak = h >= 9 && h <= 18;
      const base = isWeekday ? (isPeak ? 60 : 8) : (isPeak ? 20 : 4);
      const v = Math.round(
        Math.max(0, base + Math.abs(Math.sin(d * 1.3 + h * 0.5) * 30 + Math.cos(h * 0.4) * 20)),
      );
      rows.push([d, h, v]);
    }
  }
  return rows;
}

const MOCK_SERIES = [
  {
    data: {
      cols: [
        { name: "day_of_week", display_name: "Day of week", base_type: "type/Integer" },
        { name: "hour_of_day", display_name: "Hour of day", base_type: "type/Integer" },
        { name: "validations", display_name: "Validations", base_type: "type/Integer" },
      ],
      rows: generateMockRows(),
    },
  },
];

const DEFAULT_SETTINGS: Settings = {
  dayColumn: "day_of_week",
  hourColumn: "hour_of_day",
  valueColumn: "validations",
};

function App() {
  const [dark, setDark] = useState(false);
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(240);
  const [cellShape, setCellShape] = useState<"square" | "circle">("square");
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">("monday");
  const [encoding, setEncoding] = useState<"intensity" | "size" | "both">("intensity");
  const [colorHigh, setColorHigh] = useState("#509EE3");

  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    cellShape,
    weekStart,
    encoding,
    colorLow: "#ebedf0",
    colorHigh,
  };

  const labelStyle = { color: dark ? "#ccc" : "#333", display: "flex", alignItems: "center", gap: 4 };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 24, background: dark ? "#111" : "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
        <label style={labelStyle}>
          Width:&nbsp;<input type="number" value={width} onChange={e => setWidth(+e.target.value)} style={{ width: 70 }} />
        </label>
        <label style={labelStyle}>
          Height:&nbsp;<input type="number" value={height} onChange={e => setHeight(+e.target.value)} style={{ width: 70 }} />
        </label>
        <label style={labelStyle}>
          Shape:&nbsp;
          <select value={cellShape} onChange={e => setCellShape(e.target.value as "square" | "circle")}>
            <option value="square">Square</option>
            <option value="circle">Circle</option>
          </select>
        </label>
        <label style={labelStyle}>
          Week starts:&nbsp;
          <select value={weekStart} onChange={e => setWeekStart(e.target.value as "monday" | "sunday")}>
            <option value="monday">Monday</option>
            <option value="sunday">Sunday</option>
          </select>
        </label>
        <label style={labelStyle}>
          Encoding:&nbsp;
          <select value={encoding} onChange={e => setEncoding(e.target.value as "intensity" | "size" | "both")}>
            <option value="intensity">Color intensity</option>
            <option value="size">Cell size</option>
            <option value="both">Size + color</option>
          </select>
        </label>
        <label style={labelStyle}>
          High color:&nbsp;<input type="color" value={colorHigh} onChange={e => setColorHigh(e.target.value)} />
        </label>
        <label style={labelStyle}>
          <input type="checkbox" checked={dark} onChange={e => setDark(e.target.checked)} />&nbsp;Dark
        </label>
      </div>

      <div style={{
        width,
        height,
        border: `1px solid ${dark ? "#333" : "#ddd"}`,
        borderRadius: 8,
        overflow: "hidden",
      }}>
        <Punchcard
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          series={MOCK_SERIES as any}
          settings={settings}
          width={width}
          height={height}
          colorScheme={dark ? "dark" : "light"}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onClick={() => {}}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onHover={() => {}}
        />
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
