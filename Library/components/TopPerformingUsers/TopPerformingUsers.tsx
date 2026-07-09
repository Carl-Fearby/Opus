"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/Avatar";
import { DashboardListFooter } from "@/components/DashboardListWidget/DashboardListFooter";
import shared from "@/components/DashboardListWidget/shared.module.css";
import styles from "./TopPerformingUsers.module.css";

export type TopPerformingUserItem = {
  displayValue: string;
  id: string;
  name: string;
  src?: string;
  value: number;
};

export type TopPerformingUsersProps = {
  className?: string;
  footerHref?: string;
  footerLabel?: string;
  onFooterClick?: () => void;
  onPersonClick?: (person: TopPerformingUserItem) => void;
  title?: string;
  users: TopPerformingUserItem[];
};

function PersonRow({
  maxValue,
  onPersonClick,
  user,
}: {
  maxValue: number;
  onPersonClick?: (person: TopPerformingUserItem) => void;
  user: TopPerformingUserItem;
}) {
  const content = (
    <>
      <Avatar name={user.name} size="sm" src={user.src} />
      <div className={styles.row}>
        <span className={styles.name}>{user.name}</span>
        <div className={styles.barTrack}>
          <span className={styles.barFill} style={{ width: `${(user.value / maxValue) * 100}%` }} />
        </div>
        <span className={styles.value}>{user.displayValue}</span>
      </div>
    </>
  );

  if (!onPersonClick) {
    return content;
  }

  return (
    <button
      className={[styles.itemAction, shared.itemAction].join(" ")}
      onClick={() => onPersonClick(user)}
      type="button"
    >
      {content}
    </button>
  );
}

export function TopPerformingUsers({
  className,
  footerHref,
  footerLabel = "View full report",
  onFooterClick,
  onPersonClick,
  title = "Top Performing People",
  users,
}: TopPerformingUsersProps) {
  const maxValue = useMemo(
    () => Math.max(1, ...users.slice(0, 3).map((user) => user.value)),
    [users],
  );
  const visibleUsers = users.slice(0, 3);

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </header>

      <ul className={[shared.list, styles.list].join(" ")}>
        {visibleUsers.map((user) => (
          <li className={styles.item} key={user.id}>
            <PersonRow maxValue={maxValue} onPersonClick={onPersonClick} user={user} />
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
