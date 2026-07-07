"use client";

import {
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AccordionGroupContext } from "@/components/AccordionGroup";
import styles from "./Accordion.module.css";

function ChevronIcon() {
  return (
    <svg aria-hidden="true" className={styles.chevron} viewBox="0 0 16 16">
      <path
        d="M4 6.2 8 10.2 12 6.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}

type AccordionProps = {
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: string;
  value?: string;
};

export function Accordion({
  children,
  className,
  defaultOpen = false,
  disabled = false,
  onOpenChange,
  open,
  title,
  value,
}: AccordionProps) {
  const group = useContext(AccordionGroupContext);
  const generatedId = useId();
  const itemValue = value ?? generatedId;
  const triggerId = `${itemValue}-trigger`;
  const panelId = `${itemValue}-panel`;
  const [standaloneOpen, setStandaloneOpen] = useState(defaultOpen);

  const isOpen = group ? group.isOpen(itemValue) : (open ?? standaloneOpen);

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    if (group) {
      group.toggle(itemValue);
      return;
    }

    const next = !(open ?? standaloneOpen);
    if (open === undefined) {
      setStandaloneOpen(next);
    }

    onOpenChange?.(next);
  };

  const content = (
    <div className={[styles.item, className].filter(Boolean).join(" ")} data-open={isOpen ? "true" : "false"}>
      <button
        aria-controls={panelId}
        aria-expanded={isOpen}
        className={styles.trigger}
        disabled={disabled}
        id={triggerId}
        onClick={handleToggle}
        type="button"
      >
        <span className={styles.triggerLabel}>{title}</span>
        <ChevronIcon />
      </button>
      <div
        aria-labelledby={triggerId}
        className={styles.panel}
        id={panelId}
        inert={!isOpen || undefined}
        role="region"
      >
        <div className={styles.panelInner}>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </div>
  );

  if (group) {
    return content;
  }

  return <div className={styles.standalone}>{content}</div>;
}
