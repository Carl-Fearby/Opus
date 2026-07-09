import type { DealsOverTimePoint } from "@/components/DealsOverTime";

export const dealsOverTimePeriodOptions = [
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
] as const;

const thisYearData: DealsOverTimePoint[] = [
  { label: "Mar", tooltipLabel: "Mar 2024", value: 18 },
  { label: "Apr", tooltipLabel: "Apr 2024", value: 22 },
  { label: "May", tooltipLabel: "May 2024", value: 26 },
  { label: "Jun", tooltipLabel: "Jun 2024", value: 31 },
  { label: "Jul", tooltipLabel: "Jul 2024", value: 28 },
  { label: "Aug", tooltipLabel: "Aug 2024", value: 35 },
  { label: "Sep", tooltipLabel: "Sep 2024", value: 33 },
  { label: "Oct", tooltipLabel: "Oct 2024", value: 39 },
  { label: "Nov", tooltipLabel: "Nov 2024", value: 44 },
  { label: "Dec", tooltipLabel: "Dec 2024", value: 28 },
  { label: "Jan", tooltipLabel: "Jan 2025", value: 42 },
  { label: "Feb", tooltipLabel: "Feb 2025", value: 15 },
  { label: "Mar", tooltipLabel: "Mar 2025", value: 48 },
  { label: "Apr", tooltipLabel: "Apr 2025", value: 58 },
  { label: "May", tooltipLabel: "May 2025", value: 67 },
];

const thisQuarterData: DealsOverTimePoint[] = [
  { label: "W1", tooltipLabel: "Week 1", value: 12 },
  { label: "W2", tooltipLabel: "Week 2", value: 18 },
  { label: "W3", tooltipLabel: "Week 3", value: 15 },
  { label: "W4", tooltipLabel: "Week 4", value: 22 },
  { label: "W5", tooltipLabel: "Week 5", value: 28 },
  { label: "W6", tooltipLabel: "Week 6", value: 24 },
  { label: "W7", tooltipLabel: "Week 7", value: 31 },
  { label: "W8", tooltipLabel: "Week 8", value: 27 },
  { label: "W9", tooltipLabel: "Week 9", value: 35 },
  { label: "W10", tooltipLabel: "Week 10", value: 33 },
  { label: "W11", tooltipLabel: "Week 11", value: 39 },
  { label: "W12", tooltipLabel: "Week 12", value: 36 },
  { label: "W13", tooltipLabel: "Week 13", value: 44 },
  { label: "W14", tooltipLabel: "Week 14", value: 41 },
  { label: "W15", tooltipLabel: "Week 15", value: 48 },
];

export const dealsOverTimeDemoData: Record<string, DealsOverTimePoint[]> = {
  "This Month": thisQuarterData,
  "Last Month": [...thisQuarterData].reverse().map((point, index) => ({
    ...point,
    label: `W${index + 1}`,
    tooltipLabel: `Week ${index + 1}`,
    value: Math.max(8, point.value - 6 + (index % 3)),
  })),
  "This Quarter": thisQuarterData,
  "This Year": thisYearData,
};

export function getDealsOverTimeDemoData(period: string) {
  return dealsOverTimeDemoData[period] ?? dealsOverTimeDemoData["This Year"];
}
