"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { ComponentIcon } from "@/components/development/ComponentIcon";
import { getCategoryIcon, getComponentIcon, getNavigationGroupIcon, getOverviewIcon } from "@/lib/controls/componentIcons";
import type { ComponentCategory, ControlDefinition } from "@/lib/controls/types";
import { componentCategories, getControl, getControlSectionsByCategory, getControlsByCategory } from "@/lib/controls/registry";
import {
  categoryPath,
  componentPath,
  COMPONENTS_BASE_PATH,
  getActiveCategoryFromPath,
} from "@/lib/controls/routes";
import styles from "./ComponentsShell.module.css";

const SIDEBAR_GROUPS_STORAGE_KEY = "opus-components-sidebar-groups";

const SIDEBAR_BOTTOM_CATEGORY_IDS = ["labs", "system"] as const satisfies readonly ComponentCategory[];

const sidebarMainCategories = componentCategories.filter(
  (category) => !SIDEBAR_BOTTOM_CATEGORY_IDS.includes(category.id as (typeof SIDEBAR_BOTTOM_CATEGORY_IDS)[number]),
);
const sidebarBottomCategories = SIDEBAR_BOTTOM_CATEGORY_IDS.map((id) =>
  componentCategories.find((category) => category.id === id),
).filter((category): category is (typeof componentCategories)[number] => Boolean(category));

const categoryLabels = Object.fromEntries(
  componentCategories.map((category) => [category.id, category.label]),
) as Record<ComponentCategory, string>;

function controlDetailPath(control: ControlDefinition) {
  return componentPath(control.slug, control.category === "labs" ? { category: "labs" } : undefined);
}

function normalise(value: string) {
  return value.trim().toLowerCase();
}

function matchesControl(control: ControlDefinition, query: string) {
  const haystack = [
    control.title,
    control.slug,
    control.description,
    control.componentName,
    control.navigationGroup,
    categoryLabels[control.category],
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function matchesOverview(query: string) {
  return "overview components documentation".includes(query);
}

type OpenSidebarGroups = Record<string, boolean>;

function readOpenGroups(): OpenSidebarGroups {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = window.localStorage.getItem(SIDEBAR_GROUPS_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    const next: OpenSidebarGroups = {};
    for (const category of componentCategories) {
      if (Object.prototype.hasOwnProperty.call(parsed, category.id) && parsed[category.id as keyof typeof parsed] === true) {
        next[category.id] = true;
      }
    }

    for (const [key, value] of Object.entries(parsed)) {
      if (key.includes(":") && value === true) {
        next[key] = true;
      }
    }

    return next;
  } catch {
    return {};
  }
}

function writeOpenGroups(groups: OpenSidebarGroups) {
  window.localStorage.setItem(SIDEBAR_GROUPS_STORAGE_KEY, JSON.stringify(groups));
}

function NavLink({
  href,
  icon,
  label,
  nested,
  isNew,
  onNavigate,
}: {
  href: string;
  icon: IconDefinition;
  label: string;
  nested?: boolean;
  isNew?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={[isActive ? styles.navLinkActive : styles.navLink, nested ? styles.navLinkNested : ""]
        .filter(Boolean)
        .join(" ")}
      href={href}
      onClick={onNavigate}
    >
      <ComponentIcon compact={nested} icon={icon} />
      <span className={styles.navLinkLabel}>
        {label}
        {isNew ? (
          <span aria-label="New" className={styles.navLinkNewMark} title="New">
            *
          </span>
        ) : null}
      </span>
    </Link>
  );
}

function NavGroup({
  category,
  label,
  open,
  openGroups,
  onToggleSubgroup,
  onToggle,
}: {
  category: ComponentCategory;
  label: string;
  open: boolean;
  openGroups: OpenSidebarGroups;
  onToggleSubgroup: (key: string) => void;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const listId = useId();
  const sections = getControlSectionsByCategory(category);
  const isCategoryOverview = pathname === categoryPath(category);

  return (
    <div className={styles.navGroup}>
      <div className={styles.navGroupHeader}>
        <Link
          aria-current={isCategoryOverview ? "page" : undefined}
          className={[
            styles.navHeadingLink,
            styles.navHeadingLinkFlex,
            isCategoryOverview ? styles.navHeadingLinkActive : "",
          ]
            .filter(Boolean)
            .join(" ")}
          href={categoryPath(category)}
        >
          <ComponentIcon icon={getCategoryIcon(category)} />
          <span>{label}</span>
        </Link>
        <button
          aria-controls={listId}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
          className={styles.navGroupChevronButton}
          onClick={onToggle}
          type="button"
        >
          <span
            aria-hidden="true"
            className={open ? styles.navGroupChevronOpen : styles.navGroupChevron}
          />
        </button>
      </div>
      <div className={styles.navGroupItemsWrap} data-open={open ? "true" : "false"}>
        <div className={styles.navGroupItems} id={listId} inert={!open || undefined}>
          {sections.map((section) => (
            <div className={styles.navSubsection} key={section.label ?? "ungrouped"}>
              {section.label ? (
                <NavSubgroup
                  category={category}
                  controls={section.controls}
                  label={section.label}
                  open={Boolean(openGroups[`${category}:${section.label}`])}
                  onToggle={() => onToggleSubgroup(`${category}:${section.label}`)}
                />
              ) : (
                <div className={styles.navSubsectionItemsFlat}>
                  {section.controls.map((control) => (
                    <NavLink
                      key={`${category}:${control.slug}`}
                      href={controlDetailPath(control)}
                      icon={getComponentIcon(control.slug)}
                      isNew={control.isNew}
                      label={control.title}
                      nested
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavSubgroup({
  category,
  controls,
  label,
  open,
  onToggle,
}: {
  category: ComponentCategory;
  controls: ReturnType<typeof getControlSectionsByCategory>[number]["controls"];
  label: string;
  open: boolean;
  onToggle: () => void;
}) {
  const listId = useId();

  return (
    <>
      <button
        aria-controls={listId}
        aria-expanded={open}
        className={styles.navSubsectionButton}
        type="button"
        onClick={onToggle}
      >
        <span className={styles.navSubsectionLabel}>
          <ComponentIcon compact icon={getNavigationGroupIcon(label)} />
          <span>{label}</span>
        </span>
        <span
          aria-hidden="true"
          className={open ? styles.navGroupChevronOpen : styles.navGroupChevron}
        />
      </button>
      <div className={styles.navSubsectionItemsWrap} data-open={open ? "true" : "false"}>
        <div className={styles.navSubsectionItems} id={listId} inert={!open || undefined}>
          {controls.map((control) => (
            <NavLink
              key={`${category}:${control.slug}`}
              href={controlDetailPath(control)}
              icon={getComponentIcon(control.slug)}
              isNew={control.isNew}
              label={control.title}
              nested
            />
          ))}
        </div>
      </div>
    </>
  );
}

export function ComponentsSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchId = useId();
  const isOverview = pathname === COMPONENTS_BASE_PATH;
  const [openGroups, setOpenGroups] = useState<OpenSidebarGroups>({});
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const categoryFromQuery = searchParams.get("category") as ComponentCategory | null;

  const activeCategory = useMemo(() => {
    if (categoryFromQuery && componentCategories.some((category) => category.id === categoryFromQuery)) {
      return categoryFromQuery;
    }

    return getActiveCategoryFromPath(pathname);
  }, [categoryFromQuery, pathname]);
  const normalisedQuery = normalise(query);
  const isSearching = normalisedQuery.length > 0;

  const allControls = useMemo(
    () => componentCategories.flatMap((category) => getControlsByCategory(category.id)),
    [],
  );

  const searchResults = useMemo(() => {
    if (!isSearching) {
      return [];
    }

    return allControls
      .filter((control) => matchesControl(control, normalisedQuery))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [allControls, isSearching, normalisedQuery]);

  const showOverviewInSearch = isSearching && matchesOverview(normalisedQuery);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setOpenGroups(readOpenGroups());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated || !activeCategory) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setOpenGroups((current) => {
        let next = current;
        let changed = false;

        if (!current[activeCategory]) {
          next = { ...next, [activeCategory]: true };
          changed = true;
        }

        const segment = pathname.slice(`${COMPONENTS_BASE_PATH}/`.length).split("/")[0];
        const activeControl = segment
          ? getControl(segment, categoryFromQuery ? { category: categoryFromQuery } : undefined) ?? getControl(segment)
          : undefined;
        if (
          activeControl?.navigationGroup &&
          activeControl.category === activeCategory
        ) {
          const subgroupKey = `${activeCategory}:${activeControl.navigationGroup}`;
          if (!next[subgroupKey]) {
            next = { ...next, [subgroupKey]: true };
            changed = true;
          }
        }

        if (!changed) {
          return current;
        }

        writeOpenGroups(next);
        return next;
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [activeCategory, categoryFromQuery, hydrated, pathname]);

  const toggleGroup = useCallback((category: ComponentCategory) => {
    setOpenGroups((current) => {
      const next = { ...current, [category]: !current[category] };
      writeOpenGroups(next);
      return next;
    });
  }, []);

  const toggleSubgroup = useCallback((key: string) => {
    setOpenGroups((current) => {
      const next = { ...current, [key]: !current[key] };
      writeOpenGroups(next);
      return next;
    });
  }, []);

  const clearSearch = useCallback(() => setQuery(""), []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarSearch} role="search">
        <label className={styles.sidebarSearchWrap} htmlFor={searchId}>
          <span aria-hidden="true" className={styles.sidebarSearchIcon}>
            <FontAwesomeIcon className={styles.sidebarSearchIconSvg} icon={faMagnifyingGlass} />
          </span>
          <input
            aria-controls={isSearching ? "components-sidebar-search-results" : undefined}
            className={styles.sidebarSearchInput}
            id={searchId}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                clearSearch();
              }
            }}
            placeholder="Search components…"
            type="search"
            value={query}
          />
        </label>
      </div>
      <nav className={styles.nav} aria-label="Components">
        {isSearching ? (
          <div className={styles.sidebarSearchResults} id="components-sidebar-search-results">
            {showOverviewInSearch ? (
              <Link
                aria-current={isOverview ? "page" : undefined}
                className={[styles.navHeadingLink, isOverview ? styles.navHeadingLinkActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                href={componentPath()}
                onClick={clearSearch}
              >
                <ComponentIcon icon={getOverviewIcon()} />
                <span>Overview</span>
              </Link>
            ) : null}
            {searchResults.map((control) => (
              <NavLink
                key={`${control.category}:${control.slug}`}
                href={controlDetailPath(control)}
                icon={getComponentIcon(control.slug)}
                isNew={control.isNew}
                label={control.title}
                nested
                onNavigate={clearSearch}
              />
            ))}
            {!showOverviewInSearch && searchResults.length === 0 ? (
              <p className={styles.sidebarSearchEmpty} role="status">
                No components match &ldquo;{query.trim()}&rdquo;.
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <Link
              aria-current={isOverview ? "page" : undefined}
              className={[styles.navHeadingLink, isOverview ? styles.navHeadingLinkActive : ""]
                .filter(Boolean)
                .join(" ")}
              href={componentPath()}
            >
              <ComponentIcon icon={getOverviewIcon()} />
              <span>Overview</span>
            </Link>
            {sidebarMainCategories.map((category) => (
              <NavGroup
                key={category.id}
                category={category.id}
                label={category.label}
                open={Boolean(openGroups[category.id])}
                openGroups={openGroups}
                onToggleSubgroup={toggleSubgroup}
                onToggle={() => toggleGroup(category.id)}
              />
            ))}
            {sidebarBottomCategories.map((category) => (
              <div key={category.id}>
                <hr className={styles.sidebarDivider} />
                <NavGroup
                  category={category.id}
                  label={category.label}
                  open={Boolean(openGroups[category.id])}
                  openGroups={openGroups}
                  onToggleSubgroup={toggleSubgroup}
                  onToggle={() => toggleGroup(category.id)}
                />
              </div>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
