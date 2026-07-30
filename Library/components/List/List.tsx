"use client";

import { CatalogIcon } from "@/components/CatalogIcon";
import type { SurfaceDensity } from "@/components/fields/types";
import styles from "./List.module.css";

export type ListItem = {
  description?: string;
  id?: string;
  icon?: string;
  meta?: string;
  title: string;
};

type ListProps = {
  density?: SurfaceDensity;
  items: ListItem[];
  ordered?: boolean;
  onItemClick?: (item: ListItem, index: number) => void;
};

export function List({ density = "comfortable", items, ordered = false, onItemClick }: ListProps) {
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag className={styles.list} data-density={density} data-ordered={ordered ? "true" : "false"}>
      {items.map((item, index) => {
        const content = (
          <>
          {item.icon ? (
            <span aria-hidden="true" className={styles.icon}>
              <CatalogIcon iconName={item.icon} />
            </span>
          ) : null}
          <div className={styles.body}>
            <div className={styles.head}>
              <span className={styles.title}>{item.title}</span>
              {item.meta ? <span className={styles.meta}>{item.meta}</span> : null}
            </div>
            {item.description ? <p className={styles.description}>{item.description}</p> : null}
          </div>
          </>
        );
        return (
          <li className={styles.item} key={item.id ?? `${item.title}-${index}`}>
            {onItemClick ? (
              <button className={styles.itemAction} onClick={() => onItemClick(item, index)} type="button">
                {content}
              </button>
            ) : content}
          </li>
        );
      })}
    </Tag>
  );
}
