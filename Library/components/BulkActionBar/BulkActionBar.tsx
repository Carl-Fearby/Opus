"use client";
import { useOpusI18n } from "@/components/OpusI18n";
import { Button } from "../fields/Button";
import styles from "./BulkActionBar.module.css";
export type BulkAction = { id: string; label: string; destructive?: boolean; disabled?: boolean };
export type BulkActionBarProps = { selectedCount: number; actions: BulkAction[]; selectionLabel?: string; clearLabel?: string; onAction: (action: BulkAction) => void; onClear: () => void };
export function BulkActionBar({ selectedCount, actions, selectionLabel, clearLabel, onAction, onClear }: BulkActionBarProps) {
  const { t } = useOpusI18n();
  const displaySelectionLabel = selectionLabel ?? t("bulkActionBar.selected", "selected");
  const displayClearLabel = clearLabel ?? t("bulkActionBar.clearSelection", "Clear selection");
  if (selectedCount < 1) return null;
  return <div className={styles.root} role="toolbar" aria-label={t("bulkActionBar.label", "Bulk actions")}><strong>{selectedCount} {displaySelectionLabel}</strong><div className={styles.actions}>{actions.map((action) => <Button key={action.id} disabled={action.disabled} size="sm" variant={action.destructive ? "danger" : "secondary"} type="button" onClick={() => onAction(action)}>{action.label}</Button>)}</div><Button size="sm" variant="link" type="button" onClick={onClear}>{displayClearLabel}</Button></div>;
}
