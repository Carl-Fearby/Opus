import type { ChartDatum, ChartSeries } from "@/components/Chart";
import { demoSankeyLinks } from "@/components/Chart/sankeyLayout";
import type { ChartVariant } from "@/components/fields";
import type { ChartControlSlug } from "./chartCatalog";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthValues = [180, 380, 300, 220, 190, 210, 260, 320, 280, 360, 240, 200];

export const chartDemoData: ChartDatum[] = [
  { label: "Jan", value: 42, values: [42, 28, 18], x: 12, y: 44 },
  { label: "Feb", value: 64, values: [64, 34, 22], x: 28, y: 68 },
  { label: "Mar", value: 52, values: [52, 46, 28], x: 44, y: 51 },
  { label: "Apr", value: 76, values: [76, 48, 32], x: 60, y: 79 },
  { label: "May", value: 58, values: [58, 56, 36], x: 74, y: 58 },
  { label: "Jun", value: 88, values: [88, 62, 42], x: 88, y: 92 },
];

export const chartFinancialData: ChartDatum[] = [
  { label: "Start", value: 120 },
  { label: "Product", value: 48 },
  { label: "Services", value: 32 },
  { label: "Costs", value: -28 },
  { label: "Tax", value: -12 },
  { label: "End", value: 160 },
];

export const chartCandlestickData: ChartDatum[] = [
  { label: "Mon", value: 102, open: 98, high: 108, low: 94, close: 102 },
  { label: "Tue", value: 106, open: 102, high: 112, low: 100, close: 106 },
  { label: "Wed", value: 101, open: 106, high: 108, low: 96, close: 101 },
  { label: "Thu", value: 110, open: 101, high: 114, low: 99, close: 110 },
  { label: "Fri", value: 108, open: 110, high: 113, low: 104, close: 108 },
];

export const chartBoxPlotData: ChartDatum[] = [
  { label: "API", value: 84, min: 42, q1: 68, median: 84, q3: 96, max: 118 },
  { label: "Web", value: 72, min: 38, q1: 58, median: 72, q3: 86, max: 104 },
  { label: "Jobs", value: 64, min: 30, q1: 52, median: 64, q3: 78, max: 92 },
];

export const chartGanttData: ChartDatum[] = [
  { label: "Research", value: 24, start: 4, end: 28 },
  { label: "Design", value: 20, start: 18, end: 38 },
  { label: "Build", value: 34, start: 32, end: 66 },
  { label: "Launch", value: 12, start: 64, end: 76 },
];

function branchLeaves(prefix: string, parent: string, group: string, count = 5): ChartDatum[] {
  return Array.from({ length: count }, (_, index) => ({
    label: `${prefix}${index + 1}`,
    value: 6 + (index % 3),
    parent,
    group,
  }));
}

export const chartForceDirectedData: ChartDatum[] = [
  { label: "3", value: 28, group: "0" },
  { label: "2", value: 18, group: "1" },
  { label: "1", value: 28, group: "2" },
  { label: "F", value: 14, parent: "3", group: "0" },
  { label: "G", value: 14, parent: "3", group: "0" },
  { label: "H", value: 14, parent: "3", group: "0" },
  ...branchLeaves("F", "F", "F"),
  ...branchLeaves("G", "G", "G"),
  ...branchLeaves("H", "H", "H"),
  { label: "A", value: 14, parent: "1", group: "2" },
  { label: "B", value: 14, parent: "1", group: "2" },
  { label: "C", value: 14, parent: "1", group: "2" },
  ...branchLeaves("A", "A", "A"),
  ...branchLeaves("B", "B", "B"),
  ...branchLeaves("C", "C", "C"),
  { label: "D", value: 10, parent: "2", group: "1" },
  { label: "E", value: 10, parent: "2", group: "1" },
];

export const chartNetworkGraphData: ChartDatum[] = [
  { label: "Core", value: 32, group: "core" },
  { label: "B1", value: 16, parent: "Core", group: "branch-0" },
  { label: "B2", value: 16, parent: "Core", group: "branch-1" },
  { label: "B3", value: 16, parent: "Core", group: "branch-2" },
  { label: "B4", value: 16, parent: "Core", group: "branch-3" },
  { label: "B5", value: 16, parent: "Core", group: "branch-4" },
  { label: "B6", value: 16, parent: "Core", group: "branch-5" },
  { label: "B7", value: 16, parent: "Core", group: "branch-6" },
];

export const chartSankeyData: ChartDatum[] = demoSankeyLinks.map((link) => ({
  label: `${link.source}→${link.target}`,
  value: link.value,
  group: link.source,
  parent: link.target,
}));

export const chartTreemapData: ChartDatum[] = [
  { label: "A-1", group: "Category A", value: 12 },
  { label: "A-2", group: "Category A", value: 10 },
  { label: "A-3", group: "Category A", value: 9 },
  { label: "A-4", group: "Category A", value: 8 },
  { label: "A-5", group: "Category A", value: 7 },
  { label: "A-6", group: "Category A", value: 6 },
  { label: "A-7", group: "Category A", value: 5 },
  { label: "A-8", group: "Category A", value: 4 },
  { label: "B-1", group: "Category B", value: 14 },
  { label: "B-2", group: "Category B", value: 11 },
  { label: "B-3", group: "Category B", value: 9 },
  { label: "B-4", group: "Category B", value: 8 },
  { label: "B-5", group: "Category B", value: 7 },
  { label: "B-6", group: "Category B", value: 6 },
  { label: "C-1", group: "Category C", value: 13 },
  { label: "C-2", group: "Category C", value: 11 },
  { label: "C-3", group: "Category C", value: 10 },
  { label: "C-4", group: "Category C", value: 8 },
  { label: "C-5", group: "Category C", value: 7 },
  { label: "C-6", group: "Category C", value: 6 },
  { label: "D-1", group: "Category D", value: 16 },
  { label: "D-2", group: "Category D", value: 12 },
  { label: "D-3", group: "Category D", value: 9 },
  { label: "D-4", group: "Category D", value: 7 },
];

export const chartCirclePackData: ChartDatum[] = [
  { label: "Fruity", value: 0 },
  { label: "Sweet", value: 0 },
  { label: "Sour/Fermented", value: 0 },
  { label: "Roasted", value: 0 },
  { label: "Spices", value: 0 },
  { label: "Berry", value: 0, parent: "Fruity" },
  { label: "Citrus Fruit", value: 0, parent: "Fruity" },
  { label: "Blackberry", value: 10, parent: "Berry" },
  { label: "Blueberry", value: 8, parent: "Berry" },
  { label: "Grapefruit", value: 9, parent: "Citrus Fruit" },
  { label: "Orange", value: 11, parent: "Citrus Fruit" },
  { label: "Chocolate", value: 14, parent: "Sweet" },
  { label: "Caramel", value: 10, parent: "Sweet" },
  { label: "Honey", value: 8, parent: "Sweet" },
  { label: "Winey", value: 0, parent: "Sour/Fermented" },
  { label: "Sour note", value: 12, parent: "Sour/Fermented" },
  { label: "Fermented", value: 9, parent: "Winey" },
  { label: "Whiskey", value: 7, parent: "Winey" },
  { label: "Nutty", value: 0, parent: "Roasted" },
  { label: "Cocoa", value: 11, parent: "Roasted" },
  { label: "Almond", value: 8, parent: "Nutty" },
  { label: "Hazelnut", value: 9, parent: "Nutty" },
  { label: "Pepper", value: 10, parent: "Spices" },
  { label: "Cinnamon", value: 8, parent: "Spices" },
  { label: "Anise", value: 6, parent: "Spices" },
];

export const chartChoroplethData: ChartDatum[] = [
  { label: "North America", region: "north-america", value: 82 },
  { label: "South America", region: "south-america", value: 44 },
  { label: "Europe", region: "europe", value: 68 },
  { label: "Africa", region: "africa", value: 53 },
  { label: "Asia", region: "asia", value: 91 },
  { label: "Oceania", region: "oceania", value: 37 },
];

export const chartGeoMapData: ChartDatum[] = [
  { label: "San Francisco", lat: 37.77, lng: -122.42, value: 48 },
  { label: "London", lat: 51.51, lng: -0.13, value: 62 },
  { label: "Singapore", lat: 1.35, lng: 103.82, value: 55 },
  { label: "Sydney", lat: -33.87, lng: 151.21, value: 41 },
  { label: "São Paulo", lat: -23.55, lng: -46.63, value: 36 },
];

export const chartBubbleMapData: ChartDatum[] = [
  { label: "San Francisco", lat: 37.77, lng: -122.42, value: 72 },
  { label: "London", lat: 51.51, lng: -0.13, value: 58 },
  { label: "Singapore", lat: 1.35, lng: 103.82, value: 84 },
  { label: "Sydney", lat: -33.87, lng: 151.21, value: 46 },
  { label: "São Paulo", lat: -23.55, lng: -46.63, value: 63 },
  { label: "Tokyo", lat: 35.68, lng: 139.65, value: 91 },
];

export const chartCalendarHeatmapData: ChartDatum[] = Array.from({ length: 84 }, (_, index) => {
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index % 12];
  const week = Math.floor(index / 12) + 1;
  const base = 12 + (index % 7) * 6 + (index % 5) * 4;

  return {
    label: `${month} W${week}`,
    value: base + (index % 11) * 5,
  };
});

export const chartVerticalBar36MonthData: ChartDatum[] = Array.from({ length: 36 }, (_, index) => {
  const month = monthNames[index % 12];
  const year = 24 + Math.floor(index / 12);
  const base = monthValues[index % 12];
  const drift = Math.floor(index / 12) * 18 + (index % 3) * 8;

  return {
    label: `${month} ${year}`,
    value: base + drift,
  };
});

export const chartDemoSeries: ChartSeries[] = [
  { id: "design", label: "Design", values: [42, 64, 52, 76, 58, 88] },
  { id: "web", label: "Web", values: [28, 34, 46, 48, 56, 62] },
  { id: "mobile", label: "Mobile", values: [18, 22, 28, 32, 36, 42] },
];

type ChartUsageDataMode = "category" | "geo" | "hierarchy" | "labels" | "points" | "region" | "stacked";

export function chartUsesSeries(variant: ChartVariant) {
  return (
    variant === "grouped-bar" ||
    variant === "stacked-bar" ||
    variant === "stacked-bar-100" ||
    variant === "line" ||
    variant === "multi-line" ||
    variant === "area" ||
    variant === "stacked-area" ||
    variant === "spline" ||
    variant === "stream" ||
    variant === "ridgeline" ||
    variant === "density"
  );
}

export function getChartPreviewData(slug: ChartControlSlug): ChartDatum[] {
  if (slug === "bar-chart-vertical") {
    return chartVerticalBar36MonthData;
  }

  if (slug === "waterfall-chart") {
    return chartFinancialData;
  }

  if (slug === "candlestick-chart") {
    return chartCandlestickData;
  }

  if (slug === "box-plot") {
    return chartBoxPlotData;
  }

  if (slug === "gantt-chart") {
    return chartGanttData;
  }

  if (slug === "treemap") {
    return chartTreemapData;
  }

  if (slug === "circle-packing") {
    return chartCirclePackData;
  }

  if (slug === "choropleth-map") {
    return chartChoroplethData;
  }

  if (slug === "geo-map") {
    return chartGeoMapData;
  }

  if (slug === "bubble-map") {
    return chartBubbleMapData;
  }

  if (slug === "calendar-heatmap") {
    return chartCalendarHeatmapData;
  }

  if (slug === "force-directed-graph") {
    return chartForceDirectedData;
  }

  if (slug === "network-graph") {
    return chartNetworkGraphData;
  }

  if (slug === "sankey-diagram") {
    return chartSankeyData;
  }

  return chartDemoData;
}

export function getChartUsageDataMode(variant: ChartVariant): ChartUsageDataMode {
  if (variant === "grouped-bar" || variant === "stacked-bar" || variant === "stacked-bar-100") {
    return "stacked";
  }

  if (variant === "scatter" || variant === "bubble") {
    return "points";
  }

  if (variant === "choropleth") {
    return "region";
  }

  if (variant === "geo-map" || variant === "bubble-map") {
    return "geo";
  }

  if (variant === "treemap" || variant === "circle-packing") {
    return "hierarchy";
  }

  if (variant === "line" || variant === "multi-line" || variant === "area" || variant === "stacked-area" || variant === "spline" || variant === "stream" || variant === "ridgeline" || variant === "density") {
    return "labels";
  }

  return "category";
}

export function formatChartDataForUsage(data = chartDemoData, mode: ChartUsageDataMode = "category") {
  return `[
${data
  .map((item) => {
    if (mode === "stacked") {
      const values = item.values ? `, values: [${item.values.join(", ")}]` : "";
      return `  { label: ${JSON.stringify(item.label)}, value: ${item.value}${values} }`;
    }

    if (mode === "points") {
      const x = typeof item.x === "number" ? item.x : item.value;
      const y = typeof item.y === "number" ? item.y : item.value;
      return `  { label: ${JSON.stringify(item.label)}, value: ${item.value}, x: ${x}, y: ${y} }`;
    }

    if (mode === "region") {
      const region = item.region ? `, region: ${JSON.stringify(item.region)}` : "";
      return `  { label: ${JSON.stringify(item.label)}, value: ${item.value}${region} }`;
    }

    if (mode === "geo") {
      if (item.lat == null || item.lng == null) {
        return `  { label: ${JSON.stringify(item.label)}, value: ${item.value} }`;
      }
      return `  { label: ${JSON.stringify(item.label)}, value: ${item.value}, lat: ${item.lat}, lng: ${item.lng} }`;
    }

    if (mode === "hierarchy") {
      const group = item.group ? `, group: ${JSON.stringify(item.group)}` : "";
      const parent = item.parent ? `, parent: ${JSON.stringify(item.parent)}` : "";
      return `  { label: ${JSON.stringify(item.label)}, value: ${item.value}${group}${parent} }`;
    }

    return `  { label: ${JSON.stringify(item.label)}, value: ${item.value} }`;
  })
  .join(",\n")}
]`;
}

export function formatChartSeriesForUsage(series = chartDemoSeries) {
  return `[
${series
  .map(
    (item) =>
      `  { id: ${JSON.stringify(item.id)}, label: ${JSON.stringify(item.label)}, values: [${item.values.join(", ")}] }`,
  )
  .join(",\n")}
]`;
}
