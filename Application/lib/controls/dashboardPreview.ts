export type DashboardPreviewLayout = "single" | "double" | "triple";
export type DashboardSectionWidth = "full" | "widget";

export const dashboardPreviewLayoutOptions = [
  { label: "1 view", value: "single" },
  { label: "2 side by side", value: "double" },
  { label: "3 side by side", value: "triple" },
] as const satisfies readonly { label: string; value: DashboardPreviewLayout }[];

export const dashboardWidthOptions = [
  { label: "Widget", value: "widget" },
  { label: "Full width", value: "full" },
] as const satisfies readonly { label: string; value: DashboardSectionWidth }[];

export function dashboardPreviewCount(layout: DashboardPreviewLayout): number {
  switch (layout) {
    case "double":
      return 2;
    case "triple":
      return 3;
    default:
      return 1;
  }
}
