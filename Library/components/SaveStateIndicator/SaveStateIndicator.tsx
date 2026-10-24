"use client";

import { Button } from "../fields/Button";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./SaveStateIndicator.module.css";

export type SaveState = "idle" | "saving" | "saved" | "error";
export type SaveStateIndicatorProps = {
  state: SaveState;
  message?: string;
  lastSaved?: Date | string;
  showLastSaved?: boolean;
  retryLabel?: string;
  onRetry?: () => void;
};

export function SaveStateIndicator({ state, message, lastSaved, showLastSaved = true, retryLabel, onRetry }: SaveStateIndicatorProps) {
  const { t } = useOpusI18n();
  const defaultMessages: Record<SaveState, string> = {
    idle: t("saveState.noChanges", "No unsaved changes"),
    saving: t("saveState.saving", "Saving changes…"),
    saved: t("saveState.saved", "All changes saved"),
    error: t("saveState.error", "Changes could not be saved"),
  };
  const savedLabel = lastSaved instanceof Date ? lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : lastSaved;
  return (
    <div className={styles.root} data-state={state} role="status" aria-live="polite">
      <span aria-hidden="true" className={styles.icon}>{state === "saving" ? "↻" : state === "error" ? "!" : state === "saved" ? "✓" : "•"}</span>
      <span className={styles.copy}>
        <strong>{message ?? defaultMessages[state]}</strong>
        {showLastSaved && savedLabel && state === "saved" ? (
          <small>{t("common.lastSaved", "Last saved {time}", { time: savedLabel })}</small>
        ) : null}
      </span>
      {state === "error" && onRetry ? <Button size="sm" variant="secondary" type="button" onClick={onRetry}>{retryLabel ?? t("saveState.retry", "Retry")}</Button> : null}
    </div>
  );
}
