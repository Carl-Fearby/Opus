export type BuildersCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup: "Builders" | "Planning";
  slug:
    | "property-inspector"
    | "filter-builder"
    | "query-builder"
    | "rule-builder"
    | "permissions-matrix"
    | "dual-list-builder"
    | "scheduler"
    | "kanban-board"
    | "calendar"
    | "resource-planner";
  sourceFiles: string[];
  title: string;
};

export const buildersCatalog = [
  {
    slug: "property-inspector",
    title: "Property Inspector",
    componentName: "PropertyInspector",
    navigationGroup: "Builders",
    description: "Grouped editable property sheet with search, booleans, selects, and text values.",
    sourceFiles: [
      "components/PropertyInspector/PropertyInspector.tsx",
      "components/PropertyInspector/PropertyInspector.module.css",
    ],
  },
  {
    slug: "filter-builder",
    title: "Filter Builder",
    componentName: "FilterBuilder",
    navigationGroup: "Builders",
    description: "AND-joined filter conditions with field, operator, and value rows.",
    sourceFiles: [
      "components/FilterBuilder/FilterBuilder.tsx",
      "components/FilterBuilder/FilterBuilder.module.css",
    ],
  },
  {
    slug: "query-builder",
    title: "Query Builder",
    componentName: "QueryBuilder",
    navigationGroup: "Builders",
    description: "Composable query group with AND/OR combinator and editable rules.",
    sourceFiles: [
      "components/QueryBuilder/QueryBuilder.tsx",
      "components/QueryBuilder/QueryBuilder.module.css",
    ],
  },
  {
    slug: "rule-builder",
    title: "Rule Builder",
    componentName: "RuleBuilder",
    navigationGroup: "Builders",
    description: "Ordered policy rules with enable toggles, effects, and priority controls.",
    sourceFiles: [
      "components/RuleBuilder/RuleBuilder.tsx",
      "components/RuleBuilder/RuleBuilder.module.css",
    ],
  },
  {
    slug: "permissions-matrix",
    title: "Permissions Matrix",
    componentName: "PermissionsMatrix",
    navigationGroup: "Builders",
    description: "Role-by-resource access matrix with none/read/write/admin levels.",
    sourceFiles: [
      "components/PermissionsMatrix/PermissionsMatrix.tsx",
      "components/PermissionsMatrix/PermissionsMatrix.module.css",
    ],
  },
  {
    slug: "dual-list-builder",
    title: "Dual List Builder",
    componentName: "DualListBuilder",
    navigationGroup: "Builders",
    description: "Searchable dual-pane transfer UI for picking and ordering collections.",
    sourceFiles: [
      "components/DualListBuilder/DualListBuilder.tsx",
      "components/DualListBuilder/DualListBuilder.module.css",
    ],
  },
  {
    slug: "scheduler",
    title: "Scheduler",
    componentName: "Scheduler",
    navigationGroup: "Planning",
    description: "Week-style time grid for placing timed events across days.",
    sourceFiles: ["components/Scheduler/Scheduler.tsx", "components/Scheduler/Scheduler.module.css"],
  },
  {
    slug: "kanban-board",
    title: "Kanban Board",
    componentName: "KanbanBoard",
    navigationGroup: "Planning",
    description: "Column board with drag-and-drop cards for workflow stages.",
    sourceFiles: [
      "components/KanbanBoard/KanbanBoard.tsx",
      "components/KanbanBoard/KanbanBoard.module.css",
    ],
  },
  {
    slug: "calendar",
    title: "Calendar",
    componentName: "Calendar",
    navigationGroup: "Planning",
    description: "Month calendar with selectable days and event dots.",
    sourceFiles: ["components/Calendar/Calendar.tsx", "components/Calendar/Calendar.module.css"],
  },
  {
    slug: "resource-planner",
    title: "Resource Planner",
    componentName: "ResourcePlanner",
    navigationGroup: "Planning",
    description: "Resource-by-hour timeline for assignments and capacity planning.",
    sourceFiles: [
      "components/ResourcePlanner/ResourcePlanner.tsx",
      "components/ResourcePlanner/ResourcePlanner.module.css",
    ],
  },
] as const satisfies readonly BuildersCatalogEntry[];

export type BuildersControlSlug = (typeof buildersCatalog)[number]["slug"];

export function isBuildersSlug(slug: string): slug is BuildersControlSlug {
  return buildersCatalog.some((entry) => entry.slug === slug);
}
