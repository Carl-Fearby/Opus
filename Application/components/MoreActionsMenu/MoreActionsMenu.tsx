"use client";

import { CatalogIcon } from "opus-react";
import { DropdownMenu, type DropdownMenuItemData } from "opus-react";
import { Button } from "opus-react";
import styles from "./MoreActionsMenu.module.css";

export type MoreActionsMenuItem = {
  callback?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  iconName?: string;
  id: string;
  label: string;
  shortcut?: string;
};

export type MoreActionsMenuProps = {
  items: MoreActionsMenuItem[];
  label?: string;
  onSelect?: (item: MoreActionsMenuItem) => void;
};

export function MoreActionsMenu({
  items,
  label = "More actions",
  onSelect,
}: MoreActionsMenuProps) {
  const dropdownItems: DropdownMenuItemData[] = items.map((item) => ({
    destructive: item.destructive,
    disabled: item.disabled,
    icon: item.iconName ? <CatalogIcon iconName={item.iconName} /> : undefined,
    id: item.id,
    label: item.label,
    shortcut: item.shortcut,
  }));

  return (
    <DropdownMenu
      items={dropdownItems}
      label={label}
      onSelect={(selectedItem) => {
        const item = items.find((candidate) => candidate.id === selectedItem.id);
        if (!item) return;
        item.callback?.();
        onSelect?.(item);
      }}
      placement="bottom-end"
      trigger={(
        <Button aria-label={label} className={styles.trigger} variant="dark">
          <CatalogIcon iconName="ellipsis-vertical" />
        </Button>
      )}
    />
  );
}
