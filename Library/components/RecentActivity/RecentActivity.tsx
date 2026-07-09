"use client";

import { CatalogIcon } from "@/components/CatalogIcon";
import { DashboardListFooter } from "@/components/DashboardListWidget/DashboardListFooter";
import shared from "@/components/DashboardListWidget/shared.module.css";
import styles from "./RecentActivity.module.css";

export type RecentActivityIconTone = "blue" | "green" | "orange";

export type RecentActivityItem = {
  icon: string;
  iconTone: RecentActivityIconTone;
  id: string;
  subtitle: string;
  time: string;
  title: string;
};

export type RecentActivityProps = {
  className?: string;
  footerHref?: string;
  footerLabel?: string;
  items: RecentActivityItem[];
  onFooterClick?: () => void;
  onItemClick?: (item: RecentActivityItem) => void;
  title?: string;
};

function ActivityRow({
  item,
  onItemClick,
}: {
  item: RecentActivityItem;
  onItemClick?: (item: RecentActivityItem) => void;
}) {
  const content = (
    <>
      <span className={[styles.iconWrap, shared.iconWrap].join(" ")} data-tone={item.iconTone}>
        <CatalogIcon iconName={item.icon} />
      </span>
      <div className={styles.copy}>
        <span className={styles.itemTitle}>{item.title}</span>
        <span className={styles.itemSubtitle}>{item.subtitle}</span>
      </div>
      <time className={styles.time}>{item.time}</time>
    </>
  );

  if (!onItemClick) {
    return content;
  }

  return (
    <button
      className={[styles.itemAction, shared.itemAction].join(" ")}
      onClick={() => onItemClick(item)}
      type="button"
    >
      {content}
    </button>
  );
}

export function RecentActivity({
  className,
  footerHref,
  footerLabel = "View all activity",
  items,
  onFooterClick,
  onItemClick,
  title = "Recent Activity",
}: RecentActivityProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </header>

      <ul className={[shared.list, styles.list].join(" ")}>
        {items.slice(0, 3).map((item) => (
          <li className={styles.item} key={item.id}>
            <ActivityRow item={item} onItemClick={onItemClick} />
          </li>
        ))}
      </ul>

      <DashboardListFooter
        footerHref={footerHref}
        footerLabel={footerLabel}
        onFooterClick={onFooterClick}
      />
    </div>
  );
}
