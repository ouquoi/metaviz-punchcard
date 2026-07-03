export type Settings = {
  dayColumn?: string;
  hourColumn?: string;
  valueColumn?: string;
  cellShape?: "square" | "circle";
  weekStart?: "monday" | "sunday";
  encoding?: "intensity" | "size" | "both";
  colorLow?: string;
  colorHigh?: string;
  showLegend?: boolean;
  legendTitle?: string;
};
