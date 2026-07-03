import { type CreateCustomVisualization, defineConfig } from "@metabase/custom-viz";
import { Punchcard } from "./Punchcard";
import type { Settings } from "./types";
import { isNumericCol } from "./utils";

const createVisualization: CreateCustomVisualization<Settings> = ({ defineSetting }) => {
  return defineConfig<Settings>({
    id: "punchcard",
    getName: () => "Punchcard",
    minSize: { width: 4, height: 3 },
    defaultSize: { width: 12, height: 4 },

    checkRenderable(series) {
      if (!series || series.length === 0) throw new Error("Select a day column, an hour column, and a value column");
      const data = series[0]?.data;
      if (!data) throw new Error("Select a day column, an hour column, and a value column");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cols = data.cols as any[];
      const numeric = cols.filter((c) => isNumericCol(c));
      if (numeric.length < 3) throw new Error("The query must return at least 3 numeric columns (day 0–6, hour 0–23, value)");
    },

    settings: {
      // ── Data ──────────────────────────────────────────────────────────
      dayColumn: defineSetting({
        id: "dayColumn",
        title: "Day column (0–6)",
        widget: "select",
        getSection() { return "Data"; },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDefault(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          const numeric = cols.filter((c) => isNumericCol(c));
          return (numeric.find((c) => /day|jour|weekday|dow/i.test(c.name)) ?? numeric[0])?.name ?? "";
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getProps(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          return {
            options: cols
              .filter((c) => isNumericCol(c))
              .map((c) => ({ name: c.display_name || c.name, value: c.name })),
          };
        },
      }),

      hourColumn: defineSetting({
        id: "hourColumn",
        title: "Hour column (0–23)",
        widget: "select",
        getSection() { return "Data"; },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDefault(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          const numeric = cols.filter((c) => isNumericCol(c));
          return (numeric.find((c) => /hour|heure/i.test(c.name)) ?? numeric[1])?.name ?? "";
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getProps(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          return {
            options: cols
              .filter((c) => isNumericCol(c))
              .map((c) => ({ name: c.display_name || c.name, value: c.name })),
          };
        },
      }),

      valueColumn: defineSetting({
        id: "valueColumn",
        title: "Value column",
        widget: "select",
        getSection() { return "Data"; },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDefault(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          const numeric = cols.filter((c) => isNumericCol(c));
          return (
            numeric.find((c) => !/day|jour|weekday|dow|hour|heure/i.test(c.name)) ?? numeric[2]
          )?.name ?? "";
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getProps(series: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cols = (series?.[0]?.data?.cols ?? []) as any[];
          return {
            options: cols
              .filter((c) => isNumericCol(c))
              .map((c) => ({ name: c.display_name || c.name, value: c.name })),
          };
        },
      }),

      // ── Appearance ────────────────────────────────────────────────────
      cellShape: defineSetting({
        id: "cellShape",
        title: "Cell shape",
        widget: "select",
        getSection() { return "Appearance"; },
        getDefault() { return "square"; },
        getProps() {
          return {
            options: [
              { name: "Square", value: "square" },
              { name: "Circle", value: "circle" },
            ],
          };
        },
      }),

      weekStart: defineSetting({
        id: "weekStart",
        title: "Week starts on",
        widget: "select",
        getSection() { return "Appearance"; },
        getDefault() { return "monday"; },
        getProps() {
          return {
            options: [
              { name: "Monday", value: "monday" },
              { name: "Sunday", value: "sunday" },
            ],
          };
        },
      }),

      encoding: defineSetting({
        id: "encoding",
        title: "Visual encoding",
        widget: "select",
        getSection() { return "Appearance"; },
        getDefault() { return "intensity"; },
        getProps() {
          return {
            options: [
              { name: "Color intensity", value: "intensity" },
              { name: "Cell size", value: "size" },
              { name: "Size + color", value: "both" },
            ],
          };
        },
      }),

      colorLow: defineSetting({
        id: "colorLow",
        title: "Color — low values",
        widget: "color",
        getSection() { return "Appearance"; },
        getDefault() { return "#ebedf0"; },
      }),

      colorHigh: defineSetting({
        id: "colorHigh",
        title: "Color — high values",
        widget: "color",
        getSection() { return "Appearance"; },
        getDefault() { return "#509EE3"; },
      }),

      showLegend: defineSetting({
        id: "showLegend",
        title: "Show legend",
        widget: "toggle",
        getSection() { return "Appearance"; },
        getDefault() { return true; },
      }),

      legendTitle: defineSetting({
        id: "legendTitle",
        title: "Legend title",
        widget: "input",
        getSection() { return "Appearance"; },
        getDefault() { return ""; },
      }),
    },

    VisualizationComponent: Punchcard,
  });
};

export default createVisualization;
