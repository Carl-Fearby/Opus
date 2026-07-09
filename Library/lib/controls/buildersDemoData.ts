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
} from "@/components/fields";

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
  c1: { id: "c1", title: "Property inspector polish", meta: "Builders", tone: "accent" },
  c2: { id: "c2", title: "Filter builder validation", meta: "Forms", tone: "warning" },
  c3: { id: "c3", title: "Kanban drag handle", meta: "Planning", tone: "default" },
  c4: { id: "c4", title: "Calendar event popover", meta: "Planning", tone: "success" },
  c5: { id: "c5", title: "Permissions matrix a11y", meta: "Security", tone: "danger" },
};

export const demoKanbanColumns: KanbanColumn[] = [
  { id: "todo", title: "To do", cardIds: ["c1", "c2"] },
  { id: "doing", title: "In progress", cardIds: ["c3"] },
  { id: "done", title: "Done", cardIds: ["c4", "c5"] },
];

export const demoCalendarEvents = (): CalendarEvent[] => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  return [
    { id: "e1", date: `${y}-${pad(m + 1)}-03`, title: "Sprint planning", tone: "accent" },
    { id: "e2", date: `${y}-${pad(m + 1)}-12`, title: "Design critique", tone: "success" },
    { id: "e3", date: `${y}-${pad(m + 1)}-18`, title: "Release freeze", tone: "warning" },
    { id: "e4", date: `${y}-${pad(m + 1)}-22`, title: "Incident review", tone: "danger" },
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
