import type { ChartVariant } from "@/components/fields/types";

export type ChartCatalogEntry = {
  description: string;
  /** Marks the sidebar nav entry with an orange asterisk. */
  navigationGroup: string;
  slug: string;
  title: string;
  variant: ChartVariant;
};

export const chartCatalog = [
  {
    slug: "bar-chart-vertical",
    title: "Bar Chart (Vertical)",
    variant: "bar-vertical",
    navigationGroup: "Bar Charts",
    description: "Vertical bar chart for comparing categories across a single metric.",
  },
  {
    slug: "bar-chart-horizontal",
    title: "Bar Chart (Horizontal)",
    variant: "bar-horizontal",
    navigationGroup: "Bar Charts",
    description: "Horizontal bar chart for ranked categories and longer labels.",
  },
  {
    slug: "grouped-bar-chart",
    title: "Grouped Bar Chart",
    variant: "grouped-bar",
    navigationGroup: "Bar Charts",
    description: "Grouped bars for comparing multiple series across the same categories.",
  },
  {
    slug: "stacked-bar-chart",
    title: "Stacked Bar Chart",
    variant: "stacked-bar",
    navigationGroup: "Bar Charts",
    description: "Stacked bars for showing totals and their contributing parts.",
  },
  {
    slug: "stacked-bar-chart-100",
    title: "100% Stacked Bar Chart",
    variant: "stacked-bar-100",
    navigationGroup: "Bar Charts",
    description: "Normalised stacked bars for comparing relative share across categories.",
  },
  {
    slug: "line-chart",
    title: "Line Chart",
    variant: "line",
    navigationGroup: "Line Charts",
    description: "Single-series line chart for showing trend over time.",
  },
  {
    slug: "multi-line-chart",
    title: "Multi-Line Chart",
    variant: "multi-line",
    navigationGroup: "Line Charts",
    description: "Multi-series line chart for comparing several trends together.",
  },
  {
    slug: "area-chart",
    title: "Area Chart",
    variant: "area",
    navigationGroup: "Line Charts",
    description: "Area chart for emphasising magnitude under a trend line.",
  },
  {
    slug: "stacked-area-chart",
    title: "Stacked Area Chart",
    variant: "stacked-area",
    navigationGroup: "Line Charts",
    description: "Stacked area chart for cumulative multi-series trends.",
  },
  {
    slug: "spline-chart",
    title: "Spline (Smooth Line)",
    variant: "spline",
    navigationGroup: "Line Charts",
    description: "Smoothed line chart for trend previews that benefit from softer interpolation.",
  },
  {
    slug: "stream-graph",
    title: "Stream Graph",
    variant: "stream",
    navigationGroup: "Line Charts",
    description: "Stacked area streams for showing how categories contribute to a whole over time.",
  },
  {
    slug: "ridgeline-plot",
    title: "Ridgeline Plot",
    variant: "ridgeline",
    navigationGroup: "Line Charts",
    description: "Overlapping density ridges for comparing distributions across categories.",
  },
  {
    slug: "pie-chart",
    title: "Pie Chart",
    variant: "pie",
    navigationGroup: "Radial Charts",
    description: "Pie chart for showing simple part-to-whole splits.",
  },
  {
    slug: "donut-chart",
    title: "Donut Chart",
    variant: "donut",
    navigationGroup: "Radial Charts",
    description: "Donut chart for part-to-whole splits with a lighter centre.",
  },
  {
    slug: "radar-chart",
    title: "Radar Chart",
    variant: "radar",
    navigationGroup: "Radial Charts",
    description: "Radar chart for comparing capability or score profiles across dimensions.",
  },
  {
    slug: "polar-area-chart",
    title: "Polar Area Chart",
    variant: "polar-area",
    navigationGroup: "Radial Charts",
    description: "Polar area chart for radial category comparison with proportional slices.",
  },
  {
    slug: "sunburst-chart",
    title: "Sunburst Chart",
    variant: "sunburst",
    navigationGroup: "Radial Charts",
    description: "Hierarchical sunburst for nested part-to-whole relationships.",
  },
  {
    slug: "scatter-plot",
    title: "Scatter Plot",
    variant: "scatter",
    navigationGroup: "Point Charts",
    description: "Scatter plot for exploring relationships between two numeric dimensions.",
  },
  {
    slug: "bubble-chart",
    title: "Bubble Chart",
    variant: "bubble",
    navigationGroup: "Point Charts",
    description: "Bubble chart for plotting x/y relationships with a third magnitude dimension.",
  },
  {
    slug: "hexbin-plot",
    title: "Hexbin Plot",
    variant: "hexbin",
    navigationGroup: "Point Charts",
    description: "Hexagonal binning plot for dense scatter aggregation.",
  },
  {
    slug: "funnel-chart",
    title: "Funnel Chart",
    variant: "funnel",
    navigationGroup: "Flow Charts",
    description: "Funnel chart for staged conversion or process drop-off.",
  },
  {
    slug: "pyramid-chart",
    title: "Pyramid Chart",
    variant: "pyramid",
    navigationGroup: "Flow Charts",
    description: "Pyramid chart for layered priority, hierarchy, or composition views.",
  },
  {
    slug: "sankey-diagram",
    title: "Sankey Diagram",
    variant: "sankey",
    navigationGroup: "Flow Charts",
    description: "Sankey diagram for visualising flows between stages or categories.",
  },
  {
    slug: "chord-diagram",
    title: "Chord Diagram",
    variant: "chord",
    navigationGroup: "Flow Charts",
    description: "Chord diagram for showing relationships between entities in a circular layout.",
  },
  {
    slug: "network-graph",
    title: "Network Graph",
    variant: "network",
    navigationGroup: "Flow Charts",
    description: "Network graph for nodes and weighted relationships.",
  },
  {
    slug: "force-directed-graph",
    title: "Force Directed Graph",
    variant: "force-directed",
    navigationGroup: "Flow Charts",
    description: "Force-directed layout for exploratory network structure.",
  },
  {
    slug: "heatmap",
    title: "Heatmap",
    variant: "heatmap",
    navigationGroup: "Matrix Charts",
    description: "Heatmap for matrix intensity across two categorical dimensions.",
  },
  {
    slug: "calendar-heatmap",
    title: "Calendar Heatmap",
    variant: "calendar-heatmap",
    navigationGroup: "Matrix Charts",
    description: "Calendar heatmap for activity or volume by day.",
  },
  {
    slug: "treemap",
    title: "Treemap",
    variant: "treemap",
    navigationGroup: "Hierarchy Charts",
    description: "Treemap for hierarchical values using nested rectangles.",
  },
  {
    slug: "circle-packing",
    title: "Circle Packing",
    variant: "circle-packing",
    navigationGroup: "Hierarchy Charts",
    description: "Circle packing chart for nested hierarchical groups.",
  },
  {
    slug: "waterfall-chart",
    title: "Waterfall Chart",
    variant: "waterfall",
    navigationGroup: "Financial Charts",
    description: "Waterfall chart for cumulative positive and negative changes.",
  },
  {
    slug: "candlestick-chart",
    title: "Candlestick Chart",
    variant: "candlestick",
    navigationGroup: "Financial Charts",
    description: "Candlestick chart for open-high-low-close financial intervals.",
  },
  {
    slug: "ohlc-chart",
    title: "OHLC Chart",
    variant: "ohlc",
    navigationGroup: "Financial Charts",
    description: "Open-high-low-close bars for financial price intervals.",
  },
  {
    slug: "range-area-chart",
    title: "Range Area Chart",
    variant: "range-area",
    navigationGroup: "Line Charts",
    description: "Banded area chart for high–low ranges with a centre value line.",
  },
  {
    slug: "range-bar-chart",
    title: "Range Bar Chart",
    variant: "range-bar",
    navigationGroup: "Bar Charts",
    description: "Bars spanning a low–high range for each category.",
  },
  {
    slug: "error-bar-chart",
    title: "Error Bar Chart",
    variant: "error-bar",
    navigationGroup: "Statistical Charts",
    description: "Category bars with uncertainty caps for measurement error.",
  },
  {
    slug: "parallel-coordinates",
    title: "Parallel Coordinates",
    variant: "parallel-coordinates",
    navigationGroup: "Statistical Charts",
    description: "Multi-dimension profiles as polylines across parallel axes.",
  },
  {
    slug: "contour-plot",
    title: "Contour Plot",
    variant: "contour",
    navigationGroup: "Matrix Charts",
    description: "2D intensity field with contour rings for continuous density.",
  },
  {
    slug: "surface-plot",
    title: "Surface Plot (2D projection)",
    variant: "surface",
    navigationGroup: "Matrix Charts",
    description: "Projected surface mesh for exploring continuous value fields.",
  },
  {
    slug: "bullet-chart",
    title: "Bullet Chart",
    variant: "bullet",
    navigationGroup: "Bar Charts",
    description: "Compact performance bars with qualitative range and target marker.",
  },
  {
    slug: "pareto-chart",
    title: "Pareto Chart",
    variant: "pareto",
    navigationGroup: "Bar Charts",
    description: "Ranked bars with cumulative percentage line for 80/20 analysis.",
  },
  {
    slug: "box-plot",
    title: "Box Plot",
    variant: "box-plot",
    navigationGroup: "Statistical Charts",
    description: "Box plot for quartiles, median, and outliers per category.",
  },
  {
    slug: "histogram",
    title: "Histogram",
    variant: "histogram",
    navigationGroup: "Statistical Charts",
    description: "Histogram for value distribution across bins.",
  },
  {
    slug: "violin-plot",
    title: "Violin Plot",
    variant: "violin",
    navigationGroup: "Statistical Charts",
    description: "Violin plot for distribution shape comparison across categories.",
  },
  {
    slug: "density-plot",
    title: "Density Plot",
    variant: "density",
    navigationGroup: "Statistical Charts",
    description: "Density plot for smoothed distribution curves.",
  },
  {
    slug: "timeline",
    title: "Timeline",
    variant: "timeline",
    navigationGroup: "Planning Charts",
    description: "Timeline for sequential events and milestones.",
  },
  {
    slug: "gantt-chart",
    title: "Gantt Chart",
    variant: "gantt",
    navigationGroup: "Planning Charts",
    description: "Gantt chart for task schedules, durations, and overlaps.",
  },
  {
    slug: "milestone-timeline",
    title: "Milestone Timeline",
    variant: "milestone-timeline",
    navigationGroup: "Planning Charts",
    description: "Milestone timeline for key delivery checkpoints.",
  },
  {
    slug: "geo-map",
    title: "Geo Map",
    variant: "geo-map",
    navigationGroup: "Maps",
    description: "Geographic map for regional metric markers.",
  },
  {
    slug: "bubble-map",
    title: "Bubble Map",
    variant: "bubble-map",
    navigationGroup: "Maps",
    description: "Bubble map for location-based magnitude comparison.",
  },
  {
    slug: "choropleth-map",
    title: "Choropleth Map",
    variant: "choropleth",
    navigationGroup: "Maps",
    description: "Choropleth map for shaded regional intensity.",
  },
] as const satisfies readonly ChartCatalogEntry[];

export type ChartControlSlug = (typeof chartCatalog)[number]["slug"];

export const CHART_SLUGS = chartCatalog.map((entry) => entry.slug);

const chartSlugSet = new Set<string>(CHART_SLUGS);

export function isChartSlug(slug: string): slug is ChartControlSlug {
  return chartSlugSet.has(slug);
}

export function getChartCatalogEntry(slug: ChartControlSlug) {
  return chartCatalog.find((entry) => entry.slug === slug)!;
}

export function getChartVariantForSlug(slug: ChartControlSlug): ChartVariant {
  return getChartCatalogEntry(slug).variant;
}

export const cartesianChartSlugs = new Set<ChartControlSlug>([
  "bar-chart-vertical",
  "bar-chart-horizontal",
  "grouped-bar-chart",
  "stacked-bar-chart",
  "stacked-bar-chart-100",
  "range-bar-chart",
  "bullet-chart",
  "pareto-chart",
  "line-chart",
  "multi-line-chart",
  "area-chart",
  "stacked-area-chart",
  "spline-chart",
  "range-area-chart",
  "stream-graph",
  "ridgeline-plot",
  "scatter-plot",
  "bubble-chart",
  "hexbin-plot",
  "waterfall-chart",
  "candlestick-chart",
  "ohlc-chart",
  "box-plot",
  "histogram",
  "violin-plot",
  "density-plot",
  "error-bar-chart",
  "timeline",
  "gantt-chart",
  "milestone-timeline",
]);

export function isCartesianChartSlug(slug: ChartControlSlug) {
  return cartesianChartSlugs.has(slug);
}

const matrixChartSlugs = new Set<ChartControlSlug>(["heatmap", "calendar-heatmap", "contour-plot", "surface-plot"]);

export function isMatrixChartSlug(slug: ChartControlSlug) {
  return matrixChartSlugs.has(slug);
}

export function defaultChartSettings(entry: ChartCatalogEntry) {
  return {
    title: entry.title,
    variant: entry.variant,
    palette: "opus" as const,
    height: 280,
    maximise: false,
    previewLayout: "single" as const,
    showAxis: true,
    showGrid: false,
    showLegend: true,
    showValues: false,
    xAxisLabel: "Category",
    yAxisLabel: "Value",
    highlightLabel: "",
  };
}
