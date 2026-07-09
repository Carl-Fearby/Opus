import type { DataGridColumn, DataGridRow } from "@/components/DataGrid";

export const dataGridRowGroups = [
  "Buttons",
  "Inputs",
  "Overlays",
  "Navigation",
  "Data display",
  "Feedback",
  "Layout",
  "Content",
];

const dataGridBaseColumns: Omit<DataGridColumn, "align">[] = [
  { key: "q1", label: "Q1" },
  { key: "q2", label: "Q2" },
  { key: "q3", label: "Q3" },
  { key: "q4", label: "Q4" },
  { key: "adoption", label: "Adoption" },
  { key: "coverage", label: "Coverage" },
  { key: "a11y", label: "A11y" },
  { key: "velocity", label: "Velocity" },
];

export function createDataGridRows(count = 200): DataGridRow[] {
  return Array.from({ length: count }, (_, index) => {
    const group = dataGridRowGroups[index % dataGridRowGroups.length];
    const team = `${group} ${index + 1}`;
    const q1 = 3 + (index % 19);
    const q2 = q1 + 4 + (index % 7);
    const q3 = q2 + 3 + (index % 9);
    const q4 = q3 + 2 + (index % 11);
    const adoption = 62 + (index % 36);
    const coverage = 68 + (index % 28);

    return {
      id: `row-${index + 1}`,
      values: {
        group,
        team,
        q1,
        q2,
        q3,
        q4,
        adoption: `${adoption}%`,
        coverage: `${coverage}%`,
        a11y: index % 5 === 0 ? "Review" : "Pass",
        velocity: `+${6 + (index % 19)}%`,
      },
    };
  });
}

export const dataGridRows = createDataGridRows();

/** Tree sample: one parent per catalog group with a few leaf teams. */
export function createDataGridTreeRows(): DataGridRow[] {
  return dataGridRowGroups.map((group, groupIndex) => {
    const children = Array.from({ length: 3 }, (_, childIndex) => {
      const index = groupIndex * 3 + childIndex;
      const q1 = 5 + (index % 12);
      return {
        id: `tree-${groupIndex + 1}-${childIndex + 1}`,
        values: {
          group,
          team: `${group} · squad ${childIndex + 1}`,
          q1,
          q2: q1 + 3,
          q3: q1 + 6,
          q4: q1 + 8,
          adoption: `${70 + (index % 20)}%`,
          coverage: `${72 + (index % 18)}%`,
          a11y: childIndex === 0 ? "Review" : "Pass",
          velocity: `+${8 + (index % 10)}%`,
        },
      } satisfies DataGridRow;
    });

    return {
      id: `tree-group-${groupIndex + 1}`,
      values: {
        group,
        team: group,
        q1: children.reduce((sum, row) => sum + Number(row.values.q1), 0),
        q2: "—",
        q3: "—",
        q4: "—",
        adoption: "—",
        coverage: "—",
        a11y: "—",
        velocity: "—",
      },
      children,
    } satisfies DataGridRow;
  });
}

export const dataGridTreeRows = createDataGridTreeRows();

export const dataGridPivotConfig = {
  rows: ["group"],
  columns: ["a11y"],
  values: ["q1", "q2"],
  aggregator: "sum" as const,
};

export function getDetailContentForDemo(row: DataGridRow) {
  const group = String(row.values.group ?? "—");
  const team = String(row.values.team ?? row.label ?? row.id);
  const adoption = String(row.values.adoption ?? "—");
  const coverage = String(row.values.coverage ?? "—");
  return `Detail for ${team} (${group}): adoption ${adoption}, coverage ${coverage}. Use master-detail to show nested editors, activity, or related records.`;
}

export type DataGridColumnHeaderDefaults = {
  filterable: boolean;
  resizable: boolean;
  sortable: boolean;
};

export type DataGridDemoColumnOptions = {
  gridDefaults?: DataGridColumnHeaderDefaults;
  numericColumns?: boolean;
  q1Q2Resizable?: boolean;
  q1Q2SortFilter?: boolean;
  teamResizable?: boolean;
};

type ColumnHeaderFeatures = {
  filterable?: boolean;
  resizable?: boolean;
  sortable?: boolean;
};

function withHeaderFeatures(
  column: DataGridColumn,
  features: ColumnHeaderFeatures,
): DataGridColumn {
  const next: DataGridColumn = { ...column };

  if (features.sortable) {
    next.sortable = true;
  }

  if (features.filterable) {
    next.filterable = true;
  }

  if (features.resizable) {
    next.resizable = true;
  }

  return next;
}

function buildTeamColumn(
  teamResizable: boolean,
  gridDefaults?: DataGridColumnHeaderDefaults,
): DataGridColumn {
  return withHeaderFeatures(
    {
      key: "team",
      label: "Team",
      align: "left",
    },
    {
      filterable: gridDefaults?.filterable,
      resizable: teamResizable,
      sortable: gridDefaults?.sortable,
    },
  );
}

export function buildDataGridColumns({
  gridDefaults,
  numericColumns = false,
  q1Q2Resizable = true,
  q1Q2SortFilter = false,
  teamResizable = false,
}: DataGridDemoColumnOptions = {}): DataGridColumn[] {
  const dataColumns = dataGridBaseColumns.map((column) => {
    const isQ1OrQ2 = column.key === "q1" || column.key === "q2";
    let next: DataGridColumn = { ...column };

    if (numericColumns) {
      next.align = column.key === "a11y" ? "left" : "right";
    }

    if (isQ1OrQ2) {
      next = withHeaderFeatures(next, {
        filterable: q1Q2SortFilter && gridDefaults?.filterable,
        resizable: q1Q2Resizable && gridDefaults?.resizable,
        sortable: q1Q2SortFilter && gridDefaults?.sortable,
      });
    } else {
      next = withHeaderFeatures(next, {
        filterable: gridDefaults?.filterable,
        resizable: gridDefaults?.resizable,
        sortable: gridDefaults?.sortable,
      });
    }

    return next;
  });

  return [buildTeamColumn(teamResizable, gridDefaults), ...dataColumns];
}

function formatColumnForUsage(column: DataGridColumn): string {
  const parts = [
    `key: ${JSON.stringify(column.key)}`,
    `label: ${JSON.stringify(column.label)}`,
  ];

  if (column.align) {
    parts.push(`align: ${JSON.stringify(column.align)}`);
  }

  if (column.sortable === true) {
    parts.push("sortable: true");
  }

  if (column.filterable === true) {
    parts.push("filterable: true");
  }

  if (column.resizable === true) {
    parts.push("resizable: true");
  }

  return `  { ${parts.join(", ")} }`;
}

export function formatDataGridColumnsForUsage(columns: DataGridColumn[]): string {
  return `[\n${columns.map(formatColumnForUsage).join(",\n")},\n]`;
}

function formatRowValuesForUsage(row: DataGridRow): string {
  const team = row.values.team ?? row.label ?? "";
  const parts = [`team: ${JSON.stringify(team)}`];

  for (const [key, value] of Object.entries(row.values)) {
    if (key === "team") {
      continue;
    }

    if (typeof value === "number") {
      parts.push(`${key}: ${value}`);
    } else {
      parts.push(`${key}: ${JSON.stringify(value)}`);
    }
  }

  return `{ ${parts.join(", ")} }`;
}

export function formatDataGridRowsForUsage(rows: DataGridRow[]): string {
  const formatRow = (row: DataGridRow, indent: string): string => {
    const children =
      row.children?.length
        ? `,\n${indent}  children: [\n${row.children
            .map((child) => `${indent}    ${formatRow(child, `${indent}    `)}`)
            .join(",\n")},\n${indent}  ]`
        : "";
    return `{ id: ${JSON.stringify(row.id)}, values: ${formatRowValuesForUsage(row)}${children} }`;
  };

  return `[\n${rows.map((row) => `  ${formatRow(row, "  ")}`).join(",\n")},\n]`;
}
