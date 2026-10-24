"use client";
import { useOpusI18n } from "@/components/OpusI18n";
import { Button } from "../fields/Button";
import styles from "./UploadQueue.module.css";

export type UploadQueueItem = { id: string; name: string; size?: string; progress: number; status: "queued" | "uploading" | "paused" | "complete" | "error"; error?: string };
export type UploadQueueProps = { items: UploadQueueItem[]; maxVisible?: number; onPause?: (item: UploadQueueItem) => void; onResume?: (item: UploadQueueItem) => void; onRetry?: (item: UploadQueueItem) => void; onRemove?: (item: UploadQueueItem) => void; onClearComplete?: () => void };

export function UploadQueue({ items, maxVisible = 6, onPause, onResume, onRetry, onRemove, onClearComplete }: UploadQueueProps) {
  const { t } = useOpusI18n();
  const complete = items.filter((item) => item.status === "complete").length;

  return (
    <section className={styles.root} aria-label={t("uploadQueue.label", "Upload queue")}>
      <header>
        <div>
          <h2>{t("uploadQueue.title", "Uploads")}</h2>
          <p>
            {items.length
              ? t("uploadQueue.completeOf", "{complete} of {total} complete", { complete, total: items.length })
              : t("uploadQueue.none", "No uploads")}
          </p>
        </div>
        {complete > 0 && onClearComplete ? (
          <Button size="sm" variant="ghost" type="button" onClick={onClearComplete}>{t("uploadQueue.clearComplete", "Clear complete")}</Button>
        ) : null}
      </header>
      <ul>
        {items.slice(0, maxVisible).map((item) => (
          <li key={item.id} data-status={item.status}>
            <span aria-hidden="true" className={styles.icon}>{item.status === "complete" ? "✓" : item.status === "error" ? "!" : "↑"}</span>
            <span className={styles.copy}>
              <strong>{item.name}</strong>
              <small>{item.error ?? `${item.size ?? ""}${item.size ? " · " : ""}${item.progress}%`}</small>
              <span className={styles.track} role="progressbar" aria-label={t("uploadQueue.uploadAria", "Upload {name}", { name: item.name })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
                <i style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }} />
              </span>
            </span>
            <span className={styles.actions}>
              {item.status === "uploading" && onPause ? <Button aria-label={t("uploadQueue.pauseAria", "Pause {name}", { name: item.name })} size="sm" variant="ghost" type="button" onClick={() => onPause(item)}>{t("uploadQueue.pause", "Pause")}</Button> : null}
              {item.status === "paused" && onResume ? <Button aria-label={t("uploadQueue.resumeAria", "Resume {name}", { name: item.name })} size="sm" variant="ghost" type="button" onClick={() => onResume(item)}>{t("uploadQueue.resume", "Resume")}</Button> : null}
              {item.status === "error" && onRetry ? <Button aria-label={t("uploadQueue.retryAria", "Retry {name}", { name: item.name })} size="sm" variant="secondary" type="button" onClick={() => onRetry(item)}>{t("uploadQueue.retry", "Retry")}</Button> : null}
              {onRemove ? <Button aria-label={t("uploadQueue.removeAria", "Remove {name}", { name: item.name })} size="sm" variant="ghost" type="button" onClick={() => onRemove(item)}>{t("uploadQueue.remove", "Remove")}</Button> : null}
            </span>
          </li>
        ))}
      </ul>
      {items.length > maxVisible ? <p className={styles.more}>{t("uploadQueue.more", "+{count} more uploads", { count: items.length - maxVisible })}</p> : null}
    </section>
  );
}
