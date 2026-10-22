import type { CSSProperties, ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faLock,
  faMagnifyingGlass,
  faTriangleExclamation,
  faWifi,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ErrorState.module.css";

export type ErrorStateStatus = "error" | "warning" | "offline" | "forbidden" | "not-found";

export type ErrorStateProps = {
  /** Optional short code shown above the title, e.g. 404 or 500. */
  code?: string;
  className?: string;
  /** Compact variant for inline panels and cards. */
  compact?: boolean;
  description?: string;
  /** Action buttons rendered underneath the copy. */
  actions?: ReactNode;
  status?: ErrorStateStatus;
  title?: string;
};

const statusIcons = {
  error: faCircleExclamation,
  warning: faTriangleExclamation,
  offline: faWifi,
  forbidden: faLock,
  "not-found": faMagnifyingGlass,
} as const;

const statusTone: Record<ErrorStateStatus, string> = {
  error: "var(--opus-error)",
  warning: "#f59e0b",
  offline: "var(--opus-muted)",
  forbidden: "#f59e0b",
  "not-found": "var(--opus-muted)",
};

const defaultCopy: Record<ErrorStateStatus, { title: string; description: string }> = {
  error: {
    title: "Something went wrong",
    description: "The page could not be loaded. Try again, or contact support if the problem continues.",
  },
  warning: {
    title: "Check the details",
    description: "Some of the information needs your attention before you can continue.",
  },
  offline: {
    title: "You're offline",
    description: "Check your connection and try again. Any unsaved work is kept locally.",
  },
  forbidden: {
    title: "Access denied",
    description: "You don't have permission to view this page. Ask an administrator for access.",
  },
  "not-found": {
    title: "Page not found",
    description: "The page may have moved, or the address may be incomplete.",
  },
};

export function ErrorState({
  actions,
  className,
  code,
  compact = false,
  description,
  status = "error",
  title,
}: ErrorStateProps) {
  const copy = defaultCopy[status];

  return (
    <section
      className={[styles.root, compact ? styles.compact : "", className].filter(Boolean).join(" ")}
      data-status={status}
      role={status === "warning" ? "status" : "alert"}
      style={{ "--error-state-color": statusTone[status] } as CSSProperties}
    >
      <span aria-hidden="true" className={styles.icon}>
        <FontAwesomeIcon icon={statusIcons[status]} />
      </span>
      <div className={styles.copy}>
        {code ? <span className={styles.code}>{code}</span> : null}
        <h2 className={styles.title}>{title ?? copy.title}</h2>
        <p className={styles.description}>{description ?? copy.description}</p>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </section>
  );
}
