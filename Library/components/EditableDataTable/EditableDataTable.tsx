"use client";
import { useState } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import { Button } from "../fields/Button";
import { CheckboxField } from "../fields/CheckboxField";
import { NumberField } from "../fields/NumberField";
import { TextField } from "../fields/TextField";
import { BulkActionBar, type BulkAction } from "../BulkActionBar";
import styles from "./EditableDataTable.module.css";

export type EditableTableValue = string | number | boolean;
export type EditableDataTableColumn = { key: string; label: string; editable?: boolean; type?: "text" | "number" };
export type EditableDataTableRow = { id: string; values: Record<string, EditableTableValue> };
export type EditableDataTableProps = {
  columns: EditableDataTableColumn[];
  rows: EditableDataTableRow[];
  caption?: string;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  onRowsChange: (rows: EditableDataTableRow[]) => void;
  onRowSave?: (row: EditableDataTableRow) => void;
  onRowDelete?: (row: EditableDataTableRow) => void;
  onBulkAction?: (action: BulkAction, rows: EditableDataTableRow[]) => void;
};

export function EditableDataTable({ columns, rows, caption, selectable = true, bulkActions, onRowsChange, onRowSave, onRowDelete, onBulkAction }: EditableDataTableProps) {
  const { t } = useOpusI18n();
  const [selected, setSelected] = useState<string[]>([]);
  const displayCaption = caption ?? t("editableTable.caption", "Editable data");
  const displayBulkActions = bulkActions ?? [
    { id: "archive", label: t("editableTable.archive", "Archive") },
    { id: "delete", label: t("editableTable.delete", "Delete"), destructive: true },
  ];
  const update = (rowId: string, key: string, value: EditableTableValue) =>
    onRowsChange(rows.map((row) => row.id === rowId ? { ...row, values: { ...row.values, [key]: value } } : row));
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const allSelected = rows.length > 0 && selected.length === rows.length;

  return (
    <div className={styles.root}>
      <BulkActionBar
        selectedCount={selected.length}
        actions={displayBulkActions}
        onClear={() => setSelected([])}
        onAction={(action) => onBulkAction?.(action, selectedRows)}
      />
      <div className={styles.scroller}>
        <table>
          <caption>{displayCaption}</caption>
          <thead>
            <tr>
              {selectable ? (
                <th scope="col">
                  <CheckboxField
                    id="editable-table-select-all"
                    label={t("editableTable.selectAll", "Select all rows")}
                    labelVisuallyHidden
                    fitContent
                    size="sm"
                    checked={allSelected}
                    onChange={() => setSelected(allSelected ? [] : rows.map((row) => row.id))}
                  />
                </th>
              ) : null}
              {columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
              <th scope="col"><span className={styles.sr}>{t("editableTable.rowActions", "Row actions")}</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {selectable ? (
                  <td>
                    <CheckboxField
                      id={`editable-table-select-${row.id}`}
                      label={t("editableTable.selectRow", "Select row {id}", { id: row.id })}
                      labelVisuallyHidden
                      fitContent
                      size="sm"
                      checked={selected.includes(row.id)}
                      onChange={() => setSelected((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.editable ? (
                      column.type === "number" ? (
                        <NumberField
                          id={`editable-table-${row.id}-${column.key}`}
                          label={t("editableTable.fieldForRow", "{label} for row {id}", { label: column.label, id: row.id })}
                          labelVisuallyHidden
                          size="sm"
                          value={Number(row.values[column.key] ?? 0)}
                          onChange={(event) => update(row.id, column.key, event.target.valueAsNumber)}
                        />
                      ) : (
                        <TextField
                          id={`editable-table-${row.id}-${column.key}`}
                          label={t("editableTable.fieldForRow", "{label} for row {id}", { label: column.label, id: row.id })}
                          labelVisuallyHidden
                          size="sm"
                          type="text"
                          value={String(row.values[column.key] ?? "")}
                          onChange={(event) => update(row.id, column.key, event.target.value)}
                        />
                      )
                    ) : String(row.values[column.key] ?? "")}
                  </td>
                ))}
                <td className={styles.rowActions}>
                  <Button size="sm" variant="secondary" type="button" onClick={() => onRowSave?.(row)}>{t("editableTable.save", "Save")}</Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => onRowDelete?.(row)}>{t("editableTable.delete", "Delete")}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
