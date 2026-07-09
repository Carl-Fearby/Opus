"use client";

import type { ReactNode } from "react";
import styles from "./NavigationRail.module.css";

export type NavigationRailItem = {
  href?: string;
  icon?: ReactNode;
  id: string;
  label: string;
};

export type NavigationRailProps = {
  collapsed?: boolean;
  items: NavigationRailItem[];
  onChange?: (id: string) => void;
  value: string;
};

export function NavigationRail({ collapsed = false, items, onChange, value }: NavigationRailProps) {
  return (
    <nav
      aria-label="Navigation rail"
      className={styles.root}
      data-collapsed={collapsed || undefined}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <a
            aria-current={active ? "page" : undefined}
            className={active ? `${styles.item} ${styles.active}` : styles.item}
            href={item.href ?? `#${item.id}`}
            key={item.id}
            onClick={(event) => {
              if (!onChange) return;
              event.preventDefault();
              onChange(item.id);
            }}
            title={collapsed ? item.label : undefined}
          >
            {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
            {!collapsed ? <span className={styles.label}>{item.label}</span> : null}
            {collapsed ? <span className={styles.srOnly}>{item.label}</span> : null}
          </a>
        );
      })}
    </nav>
  );
}
