import type { RecentActivityItem } from "@/components/RecentActivity";

export const demoRecentActivity: RecentActivityItem[] = [
  {
    id: "activity-1",
    icon: "envelope",
    iconTone: "blue",
    subtitle: "Re: Proposal for Enterprise Plan",
    time: "2m ago",
    title: "Sarah Jones opened email",
  },
  {
    id: "activity-2",
    icon: "sterling-sign",
    iconTone: "green",
    subtitle: "Acme Ltd • £24,000",
    time: "15m ago",
    title: "Deal moved to Proposal",
  },
  {
    id: "activity-3",
    icon: "note-sticky",
    iconTone: "orange",
    subtitle: "Customer interested in annual plan...",
    time: "1h ago",
    title: "Note added by Carl Fearby",
  },
];
