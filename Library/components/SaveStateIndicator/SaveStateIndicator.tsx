"use client";

import { Button } from "../fields/Button";
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

const defaultMessages: Record<SaveState, string> = {
  idle: "No unsaved changes",
  saving: "Saving changes…",
  saved: "All changes saved",
  error: "Changes could not be saved",
};

export function SaveStateIndicator({ state, message, lastSaved, showLastSaved = true, retryLabel = "Retry", onRetry }: SaveStateIndicatorProps) {
  const savedLabel = lastSaved instanceof Date ? lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : lastSaved;
  return (
    <div className={styles.root} data-state={state} role="status" aria-live="polite">
      <span aria-hidden="true" className={styles.icon}>{state === "saving" ? "↻" : state === "error" ? "!" : state === "saved" ? "✓" : "•"}</span>
      <span className={styles.copy}>
        <strong>{message ?? defaultMessages[state]}</strong>
        {showLastSaved && savedLabel && state === "saved" ? <small>Last saved {savedLabel}</small> : null}
      </span>
      {state === "error" && onRetry ? <Button size="sm" variant="secondary" type="button" onClick={onRetry}>{retryLabel}</Button> : null}
    </div>
  );
}
