"use client";

import { useEffect, useRef, type ChangeEvent } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import { Divider } from "@/components/Divider";
import { DropdownMenu, type DropdownMenuItemData } from "@/components/DropdownMenu";
import { IconBadge, type IconBadgeUrgency } from "@/components/IconBadge";
import { KeyboardShortcut } from "@/components/KeyboardShortcut";
import { Tooltip } from "@/components/Tooltip";
import { UserProfileWidget, type UserProfileMenuItem } from "@/components/UserProfileWidget";
import { TextField } from "@/components/fields/TextField";
import styles from "./ApplicationHeader.module.css";

export type ApplicationHeaderAction = {
  count?: number;
  group?: "notification" | "utility";
  iconName: string;
  id: string;
  label: string;
  onClick?: () => void;
  urgency?: IconBadgeUrgency;
};

export type ApplicationHeaderCreateItem = {
  disabled?: boolean;
  iconName?: string;
  id: string;
  label: string;
  onSelect?: () => void;
};

export type ApplicationHeaderProfile = {
  menuItems?: UserProfileMenuItem[];
  name: string;
  role: string;
  src?: string;
};

export type ApplicationHeaderProps = {
  actions?: ApplicationHeaderAction[];
  brandAlt?: string;
  brandHref?: string;
  brandSrc?: string;
  className?: string;
  connected?: boolean;
  createLabel?: string;
  createItems?: ApplicationHeaderCreateItem[];
  onCreate?: () => void;
  onCreateSelect?: (item: ApplicationHeaderCreateItem) => void;
  onSearchChange?: (value: string) => void;
  profile?: ApplicationHeaderProfile;
  searchPlaceholder?: string;
  searchShortcut?: string[];
  searchValue?: string;
  showSearch?: boolean;
};

export function ApplicationHeader({
  actions = [],
  brandAlt = "Opus",
  brandHref = "/",
  brandSrc = "/opus-logo.png",
  className,
  connected = false,
  createLabel = "Create new",
  createItems = [],
  onCreate,
  onCreateSelect,
  onSearchChange,
  profile,
  searchPlaceholder = "Search contacts, companies, deals…",
  searchShortcut = ["⌘", "S"],
  searchValue = "",
  showSearch = true,
}: ApplicationHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationActions = actions.filter((action) => action.group === "notification" || action.count !== undefined);
  const utilityActions = actions.filter((action) => action.group === "utility" || (action.group === undefined && action.count === undefined));
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };
  const createMenuItems: DropdownMenuItemData[] = createItems.map((item) => ({
    disabled: item.disabled,
    icon: item.iconName ? (
      <span className={styles.createMenuIcon}>
        <CatalogIcon iconName={item.iconName} />
      </span>
    ) : undefined,
    id: item.id,
    label: item.label,
    onSelect: item.onSelect,
  }));

  useEffect(() => {
    if (!showSearch) {
      return;
    }

    const shortcutKey = searchShortcut.at(-1)?.toLowerCase();
    if (!shortcutKey) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.key.toLowerCase() !== shortcutKey) {
        return;
      }

      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchShortcut, showSearch]);

  return (
    <header
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-connected={connected ? "true" : "false"}
    >
      <a aria-label={brandAlt} className={styles.brand} href={brandHref}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={brandAlt} className={styles.logo} src={brandSrc} />
      </a>

      <div className={styles.content}>
        {showSearch ? <div className={styles.search}>
          <TextField
            endAdornment={<KeyboardShortcut keys={searchShortcut} size="sm" />}
            id="application-header-search"
            inputRef={searchInputRef}
            label="Search"
            labelVisuallyHidden
            placeholder={searchPlaceholder}
            size="lg"
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div> : <span />}

        <nav aria-label="Application actions" className={styles.actions}>
        {createItems.length ? (
          <DropdownMenu
            items={createMenuItems}
            label={createLabel}
            onSelect={(selectedItem) => {
              const item = createItems.find((candidate) => candidate.id === selectedItem.id);
              if (item) {
                onCreateSelect?.(item);
              }
            }}
            placement="bottom-end"
            trigger={(
              <button aria-label={createLabel} className={styles.createButton} type="button">
                <CatalogIcon iconName="plus" />
              </button>
            )}
          />
        ) : onCreate ? (
          <Tooltip content={createLabel} placement="bottom">
            <button aria-label={createLabel} className={styles.createButton} onClick={onCreate} type="button">
              <CatalogIcon iconName="plus" />
            </button>
          </Tooltip>
        ) : null}

        {(createItems.length || onCreate) && actions.length ? <Divider orientation="vertical" tone="muted" /> : null}

        <div className={styles.actionGroup}>
        {notificationActions.map((action) => (
          <Tooltip content={action.label} key={action.id} placement="bottom">
            <IconBadge
              count={action.count}
              iconName={action.iconName}
              label={action.label}
              onClick={action.onClick}
              urgency={action.urgency}
            />
          </Tooltip>
        ))}
        </div>

        {notificationActions.length && utilityActions.length ? <Divider orientation="vertical" tone="muted" /> : null}

        <div className={styles.actionGroup}>
        {utilityActions.map((action) => (
          <Tooltip content={action.label} key={action.id} placement="bottom">
            <IconBadge
              count={action.count}
              iconName={action.iconName}
              label={action.label}
              onClick={action.onClick}
              urgency={action.urgency}
            />
          </Tooltip>
        ))}
        </div>

        {profile ? (
          <>
            <Divider orientation="vertical" tone="muted" />
            <div className={styles.profile}>
              <UserProfileWidget
                avatarSize="md"
                menuItems={profile.menuItems}
                name={profile.name}
                role={profile.role}
                src={profile.src}
              />
            </div>
          </>
        ) : null}
        </nav>
      </div>
    </header>
  );
}
