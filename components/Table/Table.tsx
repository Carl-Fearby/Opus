import type { ReactNode } from "react";
import type { TableDensity } from "@/components/fields/types";
import styles from "./Table.module.css";

export type TableColumn = {
  align?: "left" | "right" | "center";
  key: string;
  label: string;
};

export type TableRow = {
  id: string;
  values: Record<string, ReactNode>;
};

type TableProps = {
  bordered?: boolean;
  caption?: string;
  columns: TableColumn[];
  density?: TableDensity;
  emptyMessage?: string;
  rows: TableRow[];
  showCaption?: boolean;
  striped?: boolean;
};

export function Table({
  bordered = false,
  caption,
  columns,
  density = "comfortable",
  emptyMessage = "No data available.",
  rows,
  showCaption = true,
  striped = false,
}: TableProps) {
  const empty = rows.length === 0;

  return (
    <div className={styles.wrap} data-bordered={bordered} data-density={density} data-striped={striped}>
      <table className={styles.table}>
        {caption ? (
          <caption className={showCaption ? styles.caption : styles.visuallyHidden}>{caption}</caption>
        ) : null}
        <thead>
          <tr>
            {columns.map((column) => (
              <th data-align={column.align ?? "left"} key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td className={styles.empty} colSpan={columns.length} role="status">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td data-align={column.align ?? "left"} key={column.key}>
                    {row.values[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
