import type { BreadcrumbItem, BottomNavigationItem, NavigationRailItem, SplitButtonAction } from "@/components/fields";

export const demoBreadcrumbItems: BreadcrumbItem[] = [
  { id: "home", label: "Home" },
  { id: "docs", label: "Documentation" },
  { id: "components", label: "Components" },
  { id: "current", label: "Breadcrumb" },
];

export const demoBottomNavItems: BottomNavigationItem[] = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "search", label: "Search", icon: "⌕" },
  { id: "create", label: "Create", icon: "+" },
  { id: "profile", label: "Profile", icon: "☺" },
];

export const demoRailItems: NavigationRailItem[] = [
  { id: "inbox", label: "Inbox", icon: "Inbox" },
  { id: "projects", label: "Projects", icon: "Grid" },
  { id: "calendar", label: "Calendar", icon: "Cal" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export const demoSplitActions: SplitButtonAction[] = [
  { id: "draft", label: "Save draft" },
  { id: "schedule", label: "Schedule…" },
  { id: "duplicate", label: "Duplicate" },
];
