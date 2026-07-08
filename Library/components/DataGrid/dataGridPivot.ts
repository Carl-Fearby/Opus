import type { DataGridColumn, DataGridRow } from "./DataGrid";
import { getRowCellText } from "./dataGridLayout";


export type DataGridPivotConfig = {
  aggregator?: "sum" | "avg" | "count";
  columns: string[];
  rows: string[];
  values: string[];
};

export type DataGridPivotResult = {
  columns: DataGridColumn[];
  rows: DataGridRow[];
};

function toNumber(value: string): number | null {
  const cleaned = value.replace(/%/g, "").replace(/^\+/, "").trim();
  if (!cleaned || Number.isNaN(Number(cleaned))) {
    return null;
  }
  return Number(cleaned);
}

function aggregate(values: number[], mode: "sum" | "avg" | "count"): number {
  if (mode === "count") {
    return values.length;
  }
  if (!values.length) {
    return 0;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return mode === "avg" ? sum / values.length : sum;
}

function formatMeasure(value: number, sample: string): string | number {
  if (sample.includes("%")) {
    return `${Math.round(value)}%`;
  }
  if (Number.isInteger(value)) {
    return value;
  }
  return Math.round(value * 10) / 10;
}

export function buildPivotGrid(
  sourceRows: DataGridRow[],
  config: DataGridPivotConfig,
): DataGridPivotResult {
  const aggregator = config.aggregator ?? "sum";
  const rowDims = config.rows.length ? config.rows : ["team"];
  const colDims = config.columns.length ? config.columns : ["group"];
  const valueKeys = config.values.length ? config.values : ["q1"];

  const columnLabels = new Set<string>();
  const matrix = new Map<string, Map<string, number[]>>();
  const rowLabels = new Map<string, string>();
  const samples = new Map<string, string>();

  for (const source of sourceRows) {
    const rowKey = rowDims.map((key) => getRowCellText(source, key) || "—").join(" · ");
    const colKey = colDims.map((key) => getRowCellText(source, key) || "—").join(" · ");
    rowLabels.set(rowKey, rowKey);

    if (!matrix.has(rowKey)) {
      matrix.set(rowKey, new Map());
    }

    const rowBucket = matrix.get(rowKey)!;
    for (const valueKey of valueKeys) {
      const cellKey = valueKeys.length === 1 ? colKey : `${colKey} · ${valueKey}`;
      columnLabels.add(cellKey);
      const raw = getRowCellText(source, valueKey);
      const numeric = toNumber(raw);
      if (!samples.has(valueKey) && raw) {
        samples.set(valueKey, raw);
      }
      const values = rowBucket.get(cellKey) ?? [];
      if (aggregator === "count") {
        values.push(1);
      } else if (numeric !== null) {
        values.push(numeric);
      }
      rowBucket.set(cellKey, values);
    }
  }

  const sortedColumnLabels = Array.from(columnLabels).sort((a, b) => a.localeCompare(b));
  const columns: DataGridColumn[] = [
    { key: "team", label: rowDims.join(" · "), align: "left", sortable: true, filterable: true },
    ...sortedColumnLabels.map((label) => ({
      key: label,
      label,
      align: "right" as const,
      sortable: true,
      filterable: true,
    })),
  ];

  const rows: DataGridRow[] = Array.from(matrix.entries()).map(([rowKey, cells], index) => {
    const values: Record<string, string | number> = { team: rowKey };

    for (const columnLabel of sortedColumnLabels) {
      const nums = cells.get(columnLabel) ?? [];
      const sampleKey = valueKeys.find((key) => columnLabel.includes(key)) ?? valueKeys[0];
      const sample = samples.get(sampleKey) ?? "";
      values[columnLabel] = formatMeasure(aggregate(nums, aggregator), sample);
    }

    return {
      id: `pivot-${index + 1}`,
      values,
    };
  });

  return { columns, rows };
}
