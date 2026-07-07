"use client";

import type { AlertStatus } from "@/components/fields/types";
import { AlertStatusIcon } from "@/components/AlertStatusIcon";
import { useOpusTheme } from "@/components/OpusThemeProvider";
import styles from "./Alert.module.css";

type AlertProps = {
  description: string;
  dismissible?: boolean;
  iconFlagged?: boolean;
  onDismiss?: () => void;
  status?: AlertStatus;
  title: string;
};

export function Alert({
  description,
  dismissible = true,
  iconFlagged = true,
  onDismiss,
  status = "error",
  title,
}: AlertProps) {
  const liveRole = status === "error" || status === "warning" ? "alert" : "status";
  const theme = useOpusTheme();

  return (
    <div
      className={`${styles.alert} ${iconFlagged ? styles.iconFlagged : ""}`}
      data-status={status}
      data-theme={theme}
      role={liveRole}
    >
      <div aria-hidden="true" className={styles.icon}>
        <AlertStatusIcon markClassName={styles.iconMark} status={status} svgClassName={styles.iconSvg} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
      {dismissible ? (
        <button
          aria-label="Dismiss alert"
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
  );
}
