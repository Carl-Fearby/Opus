"use client";
import { useState } from "react";
import { Button } from "../fields/Button";
import { CheckboxField } from "../fields/CheckboxField";
import { NumberField } from "../fields/NumberField";
import { TextField } from "../fields/TextField";
import { BulkActionBar, type BulkAction } from "../BulkActionBar";
import styles from "./EditableDataTable.module.css";
export type EditableTableValue = string | number | boolean;
export type EditableDataTableColumn = { key: string; label: string; editable?: boolean; type?: "text" | "number" };
export type EditableDataTableRow = { id: string; values: Record<string, EditableTableValue> };
export type EditableDataTableProps = { columns: EditableDataTableColumn[]; rows: EditableDataTableRow[]; caption?: string; selectable?: boolean; bulkActions?: BulkAction[]; onRowsChange: (rows: EditableDataTableRow[]) => void; onRowSave?: (row: EditableDataTableRow) => void; onRowDelete?: (row: EditableDataTableRow) => void; onBulkAction?: (action: BulkAction, rows: EditableDataTableRow[]) => void };
export function EditableDataTable({ columns, rows, caption = "Editable data", selectable = true, bulkActions = [{id:"archive",label:"Archive"},{id:"delete",label:"Delete",destructive:true}], onRowsChange, onRowSave, onRowDelete, onBulkAction }: EditableDataTableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const update = (rowId:string,key:string,value:EditableTableValue) => onRowsChange(rows.map((row) => row.id === rowId ? {...row,values:{...row.values,[key]:value}} : row));
  const selectedRows = rows.filter((row) => selected.includes(row.id));
  const allSelected = rows.length > 0 && selected.length === rows.length;
  return <div className={styles.root}><BulkActionBar selectedCount={selected.length} actions={bulkActions} onClear={() => setSelected([])} onAction={(action) => onBulkAction?.(action, selectedRows)} /><div className={styles.scroller}><table><caption>{caption}</caption><thead><tr>{selectable ? <th scope="col"><CheckboxField id="editable-table-select-all" label="Select all rows" labelVisuallyHidden fitContent size="sm" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((row) => row.id))}/></th>:null}{columns.map((column)=><th key={column.key} scope="col">{column.label}</th>)}<th scope="col"><span className={styles.sr}>Row actions</span></th></tr></thead><tbody>{rows.map((row)=><tr key={row.id}>{selectable?<td><CheckboxField id={`editable-table-select-${row.id}`} label={`Select row ${row.id}`} labelVisuallyHidden fitContent size="sm" checked={selected.includes(row.id)} onChange={() => setSelected((current)=>current.includes(row.id)?current.filter((id)=>id!==row.id):[...current,row.id])}/></td>:null}{columns.map((column)=><td key={column.key}>{column.editable?(column.type==="number"?<NumberField id={`editable-table-${row.id}-${column.key}`} label={`${column.label} for row ${row.id}`} labelVisuallyHidden size="sm" value={Number(row.values[column.key] ?? 0)} onChange={(event)=>update(row.id,column.key,event.target.valueAsNumber)}/>:<TextField id={`editable-table-${row.id}-${column.key}`} label={`${column.label} for row ${row.id}`} labelVisuallyHidden size="sm" type="text" value={String(row.values[column.key] ?? "")} onChange={(event)=>update(row.id,column.key,event.target.value)}/>):String(row.values[column.key] ?? "")}</td>)}<td className={styles.rowActions}><Button size="sm" variant="secondary" type="button" onClick={()=>onRowSave?.(row)}>Save</Button><Button size="sm" variant="ghost" type="button" onClick={()=>onRowDelete?.(row)}>Delete</Button></td></tr>)}</tbody></table></div></div>;
}
