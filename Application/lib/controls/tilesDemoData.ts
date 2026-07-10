import type { StatTileItem, TileItem } from "opus-react";

export const demoTiles: TileItem[] = [
  { id: "new-lead", label: "New Lead", icon: "user-plus", tone: "purple" },
  { id: "add-contact", label: "Add Contact", icon: "user", tone: "blue" },
  { id: "add-company", label: "Add Company", icon: "building", tone: "purple" },
  { id: "create-deal", label: "Create Deal", icon: "handshake", tone: "blue" },
  { id: "schedule-call", label: "Schedule Call", icon: "calendar-days", tone: "purple" },
  { id: "add-note", label: "Add Note", icon: "note-sticky", tone: "blue" },
  { id: "send-email", label: "Send Email", icon: "envelope", tone: "purple" },
  { id: "upload-file", label: "Upload File", icon: "cloud-arrow-up", tone: "blue" },
  { id: "log-activity", label: "Log Activity", icon: "clipboard-list", tone: "purple" },
  { id: "view-pipeline", label: "View Pipeline", icon: "chart-line", tone: "blue" },
];

export function withDemoTileHandlers(onSelect: (item: TileItem) => void): TileItem[] {
  return demoTiles.map((item) => ({
    ...item,
    onClick: () => onSelect(item),
  }));
}

export const demoStatTiles: StatTileItem[] = [
  {
    id: "total-contacts",
    label: "Total Contacts",
    value: "2,543",
    icon: "user",
    tone: "blue",
    trend: "up",
    trendValue: "12.5%",
    comparison: "vs last 30 days",
  },
  {
    id: "revenue",
    label: "Revenue",
    value: "$128k",
    icon: "chart-column",
    tone: "purple",
    trend: "up",
    trendValue: "8.4%",
    comparison: "vs last 30 days",
  },
  {
    id: "active-deals",
    label: "Active Deals",
    value: "86",
    icon: "handshake",
    tone: "blue",
    trend: "down",
    trendValue: "3.1%",
    comparison: "vs last 30 days",
  },
  {
    id: "new-leads",
    label: "New Leads",
    value: "412",
    icon: "user-plus",
    tone: "purple",
    trend: "up",
    trendValue: "18.2%",
    comparison: "vs last 30 days",
  },
  {
    id: "conversion-rate",
    label: "Conversion Rate",
    value: "24.8%",
    icon: "chart-line",
    tone: "blue",
    trend: "up",
    trendValue: "2.3%",
    comparison: "vs last 30 days",
  },
];

export function withDemoStatTileHandlers(onSelect: (item: StatTileItem) => void): StatTileItem[] {
  return demoStatTiles.map((item) => ({
    ...item,
    onClick: () => onSelect(item),
  }));
}
