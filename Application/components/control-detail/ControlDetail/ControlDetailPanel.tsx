import type { ReactNode } from "react";
import styles from "./ControlDetail.module.css";

type ControlDetailPanelProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  tourTarget?: string;
  title: string;
};

export function ControlDetailPanel({ actions, children, className, tourTarget, title }: ControlDetailPanelProps) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(" ")} data-opus-tour={tourTarget}>
      <div className="opus-panel-heading">
        <h2 className="opus-panel-title">{title}</h2>
        {actions ? <div className={styles.previewToolbar}>{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
