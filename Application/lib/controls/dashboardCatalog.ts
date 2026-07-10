export type DashboardCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup: string;
  settingsType:
    | "dashboard-content-container"
    | "deals-over-time"
    | "gauge"
    | "metric-tile"
    | "pipeline-overview"
    | "progress-bar"
    | "progress-ring"
    | "recent-activity"
    | "sparkline"
    | "speedometer"
    | "stat-card"
    | "status-indicator"
    | "top-performing-users"
    | "trend-badge"
    | "upcoming-tasks"
    | "user-profile"
    | "profile-photo-upload";
  slug: string;
  sourceFiles: string[];
  title: string;
};

export const dashboardCatalog = [
  {
    slug: "dashboard-content-container",
    title: "Dashboard Content Container",
    componentName: "DashboardContentContainer",
    navigationGroup: "Dashboard",
    description: "Neon glass dashboard section shell for wrapping widgets with a shared title, body, and footer layout.",
    settingsType: "dashboard-content-container",
    sourceFiles: [
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.module.css",
    ],
  },
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
    description: "Compact inline trend line for embedding in metric tiles and dashboard cards.",
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
    slug: "pipeline-overview",
    title: "Pipeline Overview",
    componentName: "PipelineOverview",
    navigationGroup: "Dashboard",
    description: "Sales pipeline funnel card with stage legend, total value, and period selector.",
    settingsType: "pipeline-overview",
    sourceFiles: [
      "components/PipelineOverview/PipelineOverview.tsx",
      "components/PipelineOverview/PipelineOverview.module.css",
    ],
  },
  {
    slug: "deals-over-time",
    title: "Deals Over Time",
    componentName: "DealsOverTime",
    navigationGroup: "Dashboard",
    description: "Line chart dashboard widget for tracking deal volume over time with period selector and tooltip.",
    settingsType: "deals-over-time",
    sourceFiles: [
      "components/DealsOverTime/DealsOverTime.tsx",
      "components/DealsOverTime/DealsOverTime.module.css",
    ],
  },
  {
    slug: "upcoming-tasks",
    title: "Upcoming Tasks",
    componentName: "UpcomingTasks",
    navigationGroup: "Dashboard",
    description: "Task list dashboard widget with checkbox rows, due times, and footer link.",
    settingsType: "upcoming-tasks",
    sourceFiles: [
      "components/UpcomingTasks/UpcomingTasks.tsx",
      "components/UpcomingTasks/UpcomingTasks.module.css",
    ],
  },
  {
    slug: "recent-activity",
    title: "Recent Activity",
    componentName: "RecentActivity",
    navigationGroup: "Dashboard",
    description: "Activity feed dashboard widget with icon rows, timestamps, and footer link.",
    settingsType: "recent-activity",
    sourceFiles: [
      "components/RecentActivity/RecentActivity.tsx",
      "components/RecentActivity/RecentActivity.module.css",
    ],
  },
  {
    slug: "top-performing-users",
    title: "Top Performing People",
    componentName: "TopPerformingUsers",
    navigationGroup: "Dashboard",
    description: "Ranked people performance dashboard widget with avatars, gradient bars, and values.",
    settingsType: "top-performing-users",
    sourceFiles: [
      "components/TopPerformingUsers/TopPerformingUsers.tsx",
      "components/TopPerformingUsers/TopPerformingUsers.module.css",
    ],
  },
  {
    slug: "user-profile",
    title: "User Profile",
    componentName: "UserProfileWidget",
    navigationGroup: "Dashboard",
    description:
      "Signed-in user profile chip with optional photo, name, role, and chevron menu driven by a JSON menu config.",
    settingsType: "user-profile",
    sourceFiles: [
      "components/UserProfileWidget/UserProfileWidget.tsx",
      "components/UserProfileWidget/UserProfileWidget.module.css",
      "components/UserProfileWidget/ProfilePhotoUploadModal.tsx",
      "components/Avatar/Avatar.tsx",
      "components/DropdownMenu/DropdownMenu.tsx",
    ],
  },
  {
    slug: "profile-photo-upload",
    title: "Profile Photo Upload",
    componentName: "ImageCropUploadWidget",
    navigationGroup: "Dashboard",
    description:
      "Profile photo upload widget with circular crop mask, drag positioning, zoom controls, and canvas export before upload.",
    settingsType: "profile-photo-upload",
    sourceFiles: [
      "components/ImageCropUploadWidget/ImageCropUploadWidget.tsx",
      "components/ImageCropUploadWidget/ImageCropUploadWidget.module.css",
      "components/fields/ImageCropUploadField/ImageCropUploadField.tsx",
      "components/fields/ImageCropUploadField/cropCircularImage.ts",
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
