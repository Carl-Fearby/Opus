export type DashboardCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup: string;
  settingsType:
    | "gauge"
    | "metric-tile"
    | "progress-bar"
    | "progress-ring"
    | "sparkline"
    | "speedometer"
    | "stat-card"
    | "status-indicator"
    | "trend-badge";
  slug: string;
  sourceFiles: string[];
  title: string;
};

export const dashboardCatalog = [
  {
    slug: "kpi-card",
    title: "KPI Card",
    componentName: "StatCard",
    navigationGroup: "Dashboard",
    description: "Primary KPI card for headline metrics with optional trend.",
    settingsType: "stat-card",
    sourceFiles: [
      "components/StatCard/StatCard.tsx",
      "components/StatCard/StatCard.module.css",
      "components/dashboardMetricCardLayout/dashboardMetricCardLayout.module.css",
    ],
  },
  {
    slug: "stat-card",
    title: "Stat Card",
    componentName: "StatCard",
    navigationGroup: "Dashboard",
    description: "Compact KPI tile with label, value, and optional trend badge for dashboard summaries.",
    settingsType: "stat-card",
    sourceFiles: [
      "components/StatCard/StatCard.tsx",
      "components/StatCard/StatCard.module.css",
      "components/dashboardMetricCardLayout/dashboardMetricCardLayout.module.css",
    ],
  },
  {
    slug: "sparkline",
    title: "Sparkline",
    componentName: "Sparkline",
    navigationGroup: "Dashboard",
    description: "Compact inline trend line for embedding beside metrics.",
    settingsType: "sparkline",
    sourceFiles: ["components/Sparkline/Sparkline.tsx", "components/Sparkline/Sparkline.module.css"],
  },
  {
    slug: "progress-ring",
    title: "Progress Ring",
    componentName: "ProgressRing",
    navigationGroup: "Dashboard",
    description: "Circular progress ring for completion and quota tracking.",
    settingsType: "progress-ring",
    sourceFiles: ["components/ProgressRing/ProgressRing.tsx", "components/ProgressRing/ProgressRing.module.css"],
  },
  {
    slug: "progress-bar",
    title: "Progress Bar",
    componentName: "ProgressBar",
    navigationGroup: "Dashboard",
    description: "Horizontal progress bar for goal and quota completion.",
    settingsType: "progress-bar",
    sourceFiles: ["components/ProgressBar/ProgressBar.tsx", "components/ProgressBar/ProgressBar.module.css"],
  },
  {
    slug: "gauge",
    title: "Gauge",
    componentName: "Gauge",
    navigationGroup: "Dashboard",
    description: "Dashboard progress gauge with half and full variants, optional summary copy, and footer metrics.",
    settingsType: "gauge",
    sourceFiles: ["components/Gauge/Gauge.tsx", "components/Gauge/Gauge.module.css"],
  },
  {
    slug: "speedometer",
    title: "Speedometer",
    componentName: "Speedometer",
    navigationGroup: "Dashboard",
    description: "Speedometer gauge with needle for performance and utilisation readouts.",
    settingsType: "speedometer",
    sourceFiles: ["components/Speedometer/Speedometer.tsx", "components/Speedometer/Speedometer.module.css"],
  },
  {
    slug: "metric-tile",
    title: "Metric Tile",
    componentName: "MetricTile",
    navigationGroup: "Dashboard",
    description: "Metric tile combining label, value, and optional sparkline preview.",
    settingsType: "metric-tile",
    sourceFiles: [
      "components/MetricTile/MetricTile.tsx",
      "components/MetricTile/MetricTile.module.css",
      "components/dashboardMetricCardLayout/dashboardMetricCardLayout.module.css",
    ],
  },
  {
    slug: "status-indicator",
    title: "Status Indicator",
    componentName: "StatusIndicator",
    navigationGroup: "Dashboard",
    description: "Status indicator dot with label for health and state readouts.",
    settingsType: "status-indicator",
    sourceFiles: [
      "components/StatusIndicator/StatusIndicator.tsx",
      "components/StatusIndicator/StatusIndicator.module.css",
    ],
  },
  {
    slug: "trend-badge",
    title: "Trend Badge",
    componentName: "TrendBadge",
    navigationGroup: "Dashboard",
    description: "Compact trend badge for delta and direction beside metrics.",
    settingsType: "trend-badge",
    sourceFiles: ["components/TrendBadge/TrendBadge.tsx", "components/TrendBadge/TrendBadge.module.css"],
  },
] as const satisfies readonly DashboardCatalogEntry[];

export type DashboardControlSlug = (typeof dashboardCatalog)[number]["slug"];

export const DASHBOARD_SLUGS = dashboardCatalog.map((entry) => entry.slug);

const dashboardSlugSet = new Set<string>(DASHBOARD_SLUGS);

export function isDashboardSlug(slug: string): slug is DashboardControlSlug {
  return dashboardSlugSet.has(slug);
}

export function getDashboardCatalogEntry(slug: DashboardControlSlug) {
  return dashboardCatalog.find((entry) => entry.slug === slug)!;
}
