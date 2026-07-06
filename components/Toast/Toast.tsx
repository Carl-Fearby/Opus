"use client";

import type { AlertStatus } from "@/components/fields/types";
import { AlertStatusIcon } from "@/components/AlertStatusIcon";
import styles from "./Toast.module.css";

type ToastProps = {
  description?: string;
  dismissible?: boolean;
  duration?: number;
  onDismiss?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  paused?: boolean;
  phase?: "entering" | "visible" | "exiting";
  status?: AlertStatus;
  title: string;
};

export function Toast({
  description,
  dismissible = true,
  duration,
  onDismiss,
  onMouseEnter,
  onMouseLeave,
  paused = false,
  phase = "visible",
  status = "success",
  title,
}: ToastProps) {
  const showProgress = duration !== undefined && duration > 0;
  const isAssertive = status === "error" || status === "warning";

  return (
    <div
      className={styles.toast}
      data-paused={paused ? "true" : undefined}
      data-phase={phase}
      data-status={status}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-live={isAssertive ? "assertive" : "polite"}
      role={isAssertive ? "alert" : "status"}
    >
      <div className={styles.body}>
        <div className={styles.main}>
          <div aria-hidden="true" className={styles.icon}>
            <AlertStatusIcon markClassName={styles.iconMark} status={status} svgClassName={styles.iconSvg} />
          </div>
          <div className={styles.content}>
            <p className={styles.title}>{title}</p>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          {dismissible ? (
            <button
              aria-label="Dismiss toast"
              className={styles.dismiss}
              onClick={onDismiss}
              type="button"
            >
              <svg aria-hidden="true" className={styles.dismissIcon} viewBox="0 0 16 16">
                <path
                  d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.75"
                />
              </svg>
            </button>
          ) : null}
        </div>
        {showProgress ? (
          <div aria-hidden="true" className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
