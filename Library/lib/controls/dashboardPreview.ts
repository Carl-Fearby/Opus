export type DashboardPreviewLayout = "single" | "double" | "triple";

export const dashboardPreviewLayoutOptions = [
  { label: "1 view", value: "single" },
  { label: "2 side by side", value: "double" },
  { label: "3 side by side", value: "triple" },
] as const satisfies readonly { label: string; value: DashboardPreviewLayout }[];

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
