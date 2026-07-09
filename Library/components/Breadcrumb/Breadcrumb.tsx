"use client";

import type { ReactNode } from "react";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbItem = {
  href?: string;
  id: string;
  label: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  onNavigate?: (id: string) => void;
  separator?: ReactNode;
};

export function Breadcrumb({ items, onNavigate, separator = "/" }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={styles.root}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li className={styles.item} key={item.id}>
              {index > 0 ? (
                <span aria-hidden="true" className={styles.separator}>
                  {separator}
                </span>
              ) : null}
              {isLast ? (
                <span aria-current="page" className={styles.current}>
                  {item.label}
                </span>
              ) : (
                <a
                  className={styles.link}
                  href={item.href ?? `#${item.id}`}
                  onClick={(event) => {
                    if (!onNavigate) return;
                    event.preventDefault();
                    onNavigate(item.id);
                  }}
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
