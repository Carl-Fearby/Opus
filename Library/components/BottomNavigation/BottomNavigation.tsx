"use client";

import type { ReactNode } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./BottomNavigation.module.css";

export type BottomNavigationItem = {
  href?: string;
  icon?: ReactNode;
  id: string;
  label: string;
};

export type BottomNavigationProps = {
  items: BottomNavigationItem[];
  onChange?: (id: string) => void;
  value: string;
};

export function BottomNavigation({ items, onChange, value }: BottomNavigationProps) {
  const { t } = useOpusI18n();
  return (
    <nav aria-label={t("bottomNavigation.label", "Bottom navigation")} className={styles.root}>
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
          >
            {item.icon ? <span className={styles.icon}>{item.icon}</span> : null}
            <span className={styles.label}>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
