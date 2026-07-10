"use client";

import { Avatar } from "@/components/Avatar";
import { CatalogIcon } from "@/components/CatalogIcon";
import { DropdownMenu } from "@/components/DropdownMenu";
import type { AvatarSize } from "@/components/fields/types";
import styles from "./UserProfileWidget.module.css";

export type UserProfileMenuItem = {
  destructive?: boolean;
  id: string;
  label: string;
  onSelect?: () => void;
};

export type UserProfileWidgetProps = {
  avatarSize?: AvatarSize;
  className?: string;
  menuItems?: UserProfileMenuItem[];
  name: string;
  onAvatarClick?: () => void;
  onMenuSelect?: (item: UserProfileMenuItem) => void;
  role: string;
  src?: string;
};

export function UserProfileWidget({
  avatarSize = "md",
  className,
  menuItems = [],
  name,
  onAvatarClick,
  onMenuSelect,
  role,
  src,
}: UserProfileWidgetProps) {
  const handleMenuSelect = (item: UserProfileMenuItem) => {
    item.onSelect?.();
    onMenuSelect?.(item);
  };

  const dropdownItems = menuItems.map((item) => ({
    destructive: item.destructive,
    id: item.id,
    label: item.label,
    onSelect: () => handleMenuSelect(item),
  }));

  const avatar = <Avatar name={name} size={avatarSize} src={src} />;

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {onAvatarClick ? (
        <button
          aria-label={`Open actions for ${name}`}
          className={styles.avatarButton}
          type="button"
          onClick={onAvatarClick}
        >
          {avatar}
        </button>
      ) : (
        avatar
      )}
      <div className={styles.copy}>
        <span className={styles.name}>{name}</span>
        <span className={styles.role}>{role}</span>
      </div>
      {menuItems.length ? (
        <DropdownMenu
          items={dropdownItems}
          label={`${name} menu`}
          placement="bottom-end"
          trigger={
            <button
              aria-label={`Open menu for ${name}`}
              className={styles.chevronButton}
              type="button"
            >
              <span aria-hidden="true" className={styles.chevron}>
                <CatalogIcon iconName="chevron-down" />
              </span>
            </button>
          }
          onSelect={(item) => {
            const selected = menuItems.find((entry) => entry.id === item.id);
            if (selected) {
              handleMenuSelect(selected);
            }
          }}
        />
      ) : (
        <span aria-hidden="true" className={styles.chevron}>
          <CatalogIcon iconName="chevron-down" />
        </span>
      )}
    </div>
  );
}
