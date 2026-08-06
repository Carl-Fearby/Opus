import type {
  CalendarEvent,
  DualListItem,
  FilterCondition,
  KanbanCard,
  KanbanColumn,
  PermissionLevel,
  PropertyInspectorItem,
  QueryGroup,
  ResourcePlannerItem,
  ResourcePlannerResource,
  RuleDefinition,
  SchedulerEvent,
} from "opus-react";

export const demoInspectorFields: string[] = ["status", "owner", "priority", "tags", "created"];

export const demoPropertyInspectorItems = (): PropertyInspectorItem[] => [
  { id: "name", group: "Identity", label: "Name", value: "Orders board" },
  { id: "slug", group: "Identity", label: "Slug", value: "orders-board", readOnly: true },
  {
    id: "status",
    group: "State",
    label: "Status",
    value: { options: ["draft", "published", "archived"], value: "published" },
  },
  { id: "priority", group: "State", label: "Priority", value: 2 },
  { id: "featured", group: "State", label: "Featured", value: true },
  { id: "owner", group: "Ownership", label: "Owner", value: "platform-team" },
];

export const demoFilterConditions: FilterCondition[] = [
  { id: "f1", field: "status", operator: "eq", value: "open" },
  { id: "f2", field: "priority", operator: "gt", value: "2" },
];

export const demoQueryGroup: QueryGroup = {
  id: "root",
  combinator: "and",
  rules: [
    { id: "q1", field: "status", operator: "eq", value: "active" },
    { id: "q2", field: "owner", operator: "contains", value: "design" },
  ],
};

export const demoRules: RuleDefinition[] = [
  {
    id: "r1",
    name: "Escalate urgent",
    conditions: "priority >= 4 AND status = open",
    effect: "notify",
    enabled: true,
    priority: 1,
  },
  {
    id: "r2",
    name: "Auto-close stale",
    conditions: "updatedAt < -30d",
    effect: "route",
    enabled: true,
    priority: 2,
  },
  {
    id: "r3",
    name: "Block archived edits",
    conditions: "status = archived",
    effect: "deny",
    enabled: false,
    priority: 3,
  },
];

export const demoPermissionRoles = ["Admin", "Editor", "Viewer", "Guest"];
export const demoPermissionResources = ["Projects", "Billing", "Members", "Settings"];

export const demoPermissions = (): Record<string, Record<string, PermissionLevel>> => ({
  Admin: { Projects: "admin", Billing: "admin", Members: "admin", Settings: "admin" },
  Editor: { Projects: "write", Billing: "read", Members: "write", Settings: "none" },
  Viewer: { Projects: "read", Billing: "none", Members: "read", Settings: "none" },
  Guest: { Projects: "read", Billing: "none", Members: "none", Settings: "none" },
});

export const demoDualListItems: DualListItem[] = [
  { id: "design", label: "Design system" },
  { id: "docs", label: "Documentation" },
  { id: "charts", label: "Charts kit" },
  { id: "forms", label: "Forms kit" },
  { id: "overlays", label: "Overlays" },
  { id: "planning", label: "Planning tools" },
];

export const demoDualListSelected = ["design", "docs"];

export const demoSchedulerEvents: SchedulerEvent[] = [
  { id: "s1", day: 0, startHour: 9, durationHours: 1, title: "Standup", tone: "accent" },
  { id: "s2", day: 1, startHour: 11, durationHours: 2, title: "Design review", tone: "success" },
  { id: "s3", day: 2, startHour: 14, durationHours: 1.5, title: "Customer call", tone: "warning" },
  { id: "s4", day: 4, startHour: 10, durationHours: 1, title: "Release sync", tone: "danger" },
];

export const demoKanbanCards: Record<string, KanbanCard> = {
  c1: { id: "c1", title: "Sidebar collapse animation", meta: "Navigation", tone: "default" },
  c2: { id: "c2", title: "Toast stacking rules", meta: "Feedback", tone: "accent" },
  c3: { id: "c3", title: "Empty state illustrations", meta: "Content", tone: "default" },
  c4: { id: "c4", title: "Keyboard shortcuts panel", meta: "A11y", tone: "warning" },
  c5: { id: "c5", title: "Export board as CSV", meta: "Planning", tone: "default" },
  c6: { id: "c6", title: "Filter builder validation", meta: "Forms", tone: "accent" },
  c7: { id: "c7", title: "Property inspector polish", meta: "Builders", tone: "default" },
  c8: { id: "c8", title: "Colour picker contrast", meta: "Forms", tone: "warning" },
  c9: { id: "c9", title: "Date range presets", meta: "Forms", tone: "default" },
  c10: { id: "c10", title: "Kanban drag handle", meta: "Planning", tone: "accent" },
  c11: { id: "c11", title: "Card click modal wiring", meta: "Planning", tone: "default" },
  c12: { id: "c12", title: "Calendar event popover", meta: "Planning", tone: "success" },
  c13: { id: "c13", title: "Permissions matrix a11y", meta: "Security", tone: "danger" },
  c14: { id: "c14", title: "Select chevron alignment", meta: "Forms", tone: "success" },
  c15: { id: "c15", title: "JsonViewer expand depth", meta: "Content", tone: "default" },
  c16: { id: "c16", title: "Usage preview action status", meta: "Docs", tone: "success" },
  c17: { id: "c17", title: "Column min-height for eight cards", meta: "Planning", tone: "success" },
  c18: { id: "c18", title: "Drop ghost dashed outline", meta: "Planning", tone: "accent" },
  c19: { id: "c19", title: "Origin ghost fade polish", meta: "Planning", tone: "default" },
};

export const demoKanbanColumns: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", cardIds: ["c1", "c2", "c3", "c4", "c5"], accent: "#64748b" },
  { id: "todo", title: "To do", cardIds: ["c6", "c7", "c8", "c9"], accent: "#0284c7" },
  { id: "doing", title: "In progress", cardIds: ["c10", "c11"], accent: "#f59e0b" },
  { id: "done", title: "Done", cardIds: ["c12", "c13", "c14", "c15", "c16", "c17", "c18", "c19"], accent: "#22c55e" },
];

export const demoCalendarEvents = (): CalendarEvent[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const pad = (value: number) => String(value).padStart(2, "0");
  const dayKey = (day: number, monthIndex = month, yearValue = year) =>
    `${yearValue}-${pad(monthIndex + 1)}-${pad(day)}`;

  return [
    {
      id: "e1",
      date: dayKey(3),
      endTime: "11:30",
      startTime: "10:00",
      title: "Sprint planning",
      tone: "accent",
    },
    {
      id: "e2",
      date: dayKey(12),
      endTime: "15:00",
      startTime: "14:00",
      title: "Design critique",
      tone: "success",
    },
    {
      id: "e3",
      date: dayKey(18),
      endTime: "17:00",
      startTime: "09:00",
      title: "Release freeze",
      tone: "warning",
    },
    {
      id: "e4",
      date: dayKey(27),
      endTime: "09:30",
      startTime: "09:00",
      title: "Stand-up",
      tone: "accent",
    },
    {
      id: "e5",
      date: dayKey(27),
      endTime: "11:00",
      startTime: "10:00",
      title: "Design review",
      tone: "success",
    },
    {
      id: "e6",
      date: dayKey(27),
      endTime: "12:00",
      startTime: "11:30",
      title: "Customer call",
      tone: "warning",
    },
    {
      id: "e7",
      date: dayKey(27),
      endTime: "13:30",
      startTime: "12:30",
      title: "Lunch and learn",
      tone: "accent",
    },
    {
      id: "e8",
      date: dayKey(27),
      endTime: "15:00",
      startTime: "14:00",
      title: "Incident review",
      tone: "danger",
    },
    {
      id: "e9",
      date: dayKey(27),
      endTime: "16:00",
      startTime: "15:30",
      title: "Release sign-off",
      tone: "warning",
    },
    {
      id: "e10",
      date: dayKey(27),
      endTime: "17:30",
      startTime: "16:30",
      title: "Retro",
      tone: "success",
    },
    {
      id: "e11",
      date: dayKey(5, nextMonth, nextYear),
      endTime: "11:00",
      startTime: "09:30",
      title: "Sprint kickoff",
      tone: "accent",
    },
    {
      id: "e12",
      date: dayKey(15, nextMonth, nextYear),
      endTime: "16:00",
      startTime: "14:00",
      title: "Roadmap review",
      tone: "success",
    },
  ];
};

export const demoResources: ResourcePlannerResource[] = [
  { id: "alex", label: "Alex Morgan" },
  { id: "jamie", label: "Jamie Chen" },
  { id: "sam", label: "Sam Rivera" },
];

export const demoResourceItems: ResourcePlannerItem[] = [
  { id: "b1", resourceId: "alex", label: "Opus builders", start: 9, end: 12, tone: "accent" },
  { id: "b2", resourceId: "alex", label: "Code review", start: 13, end: 15, tone: "success" },
  { id: "b3", resourceId: "jamie", label: "Catalog sync", start: 10, end: 14, tone: "warning" },
  { id: "b4", resourceId: "sam", label: "QA pass", start: 11, end: 16, tone: "danger" },
];
