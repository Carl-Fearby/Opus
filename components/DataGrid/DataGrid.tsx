"use client";

import type { PointerEvent, ReactNode, Ref } from "react";
import { forwardRef, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TableDensity } from "@/components/fields/types";
import "@/lib/fontawesome";
import styles from "./DataGrid.module.css";

export type DataGridColumn = {
  align?: "left" | "right" | "center";
  filterable?: boolean;
  key: string;
  label: string;
  resizable?: boolean;
  sortable?: boolean;
};

export type DataGridRowHeaderColumn = {
  filterable?: boolean;
  resizable?: boolean;
  sortable?: boolean;
};

export type DataGridRow = {
  id: string;
  label?: string;
  values: Record<string, ReactNode>;
};

type DataGridProps = {
  bordered?: boolean;
  caption?: string;
  columns: DataGridColumn[];
  density?: TableDensity;
  rowHeader?: DataGridRowHeaderColumn;
  rows: DataGridRow[];
  stickyFirstColumn?: boolean;
  stickyHeader?: boolean;
  striped?: boolean;
};

type ResizeState = {
  key: string;
  startWidth: number;
  startX: number;
};

type SortState = {
  direction: "ascending" | "descending";
  key: string;
};

type OpenMenuState = {
  align: "left" | "right";
  key: string;
  label: string;
  menuId: string;
};

type MenuAnchor = {
  align: "left" | "right";
  button: HTMLButtonElement;
};

const MENU_WIDTH = 260;
const MENU_GAP = 8;
const MENU_EDGE = 8;
const MENU_MIN_HEIGHT = 120;
const MENU_PREFERRED_HEIGHT = 277;
const MENU_CLEAR_FILTER_RESERVE = 37;
const MENU_BUTTON_WIDTH = 22;
const HEADER_CONTROL_GAP = 6;
const SORT_INDICATOR_WIDTH = 8;
const SORT_LABEL_GAP = 8;
const RESIZE_HANDLE_WIDTH = 14;

function resolveColumnFeatures(
  column: DataGridColumn | DataGridRowHeaderColumn | undefined,
) {
  return {
    filterable: column?.filterable === true,
    resizable: column?.resizable === true,
    sortable: column?.sortable === true,
  };
}

function getMinColumnWidth(sortable: boolean, hasMenu: boolean, density: TableDensity) {
  const paddingInline = density === "comfortable" ? 28 : 20;
  let width = paddingInline + 1;

  if (hasMenu) {
    width += MENU_BUTTON_WIDTH + HEADER_CONTROL_GAP;
  }

  if (sortable) {
    width += SORT_INDICATOR_WIDTH + SORT_LABEL_GAP;
  }

  return width;
}

function cellText(value: ReactNode): string {
  if (value === null || value === undefined || typeof value === "boolean") {
    return "";
  }

  if (typeof value === "number" || typeof value === "string") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(cellText).join(" ");
  }

  return "";
}

function rowTeamValue(row: DataGridRow): string {
  return cellText(row.values.team ?? row.label);
}

function isNumericValue(value: string) {
  return /^-?\d+(?:\.\d+)?$/.test(value);
}

function compareValues(a: string, b: string) {
  const aTrim = a.trim();
  const bTrim = b.trim();

  if (aTrim && bTrim && isNumericValue(aTrim) && isNumericValue(bTrim)) {
    return Number(aTrim) - Number(bTrim);
  }

  return aTrim.localeCompare(bTrim, undefined, { numeric: true, sensitivity: "base" });
}

export function DataGrid({
  bordered = true,
  caption,
  columns,
  density = "compact",
  rowHeader,
  rows,
  stickyFirstColumn = true,
  stickyHeader = true,
  striped = true,
}: DataGridProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [openMenu, setOpenMenu] = useState<OpenMenuState | null>(null);
  const [resizing, setResizing] = useState<ResizeState | null>(null);
  const [sort, setSort] = useState<SortState | null>(null);
  const menuAnchorRef = useRef<MenuAnchor | null>(null);
  const menuHostRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLSpanElement | null>(null);
  const menuFrameRef = useRef<number | null>(null);
  const resizeDragRef = useRef<ResizeState | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hasTeamColumn = columns.some((column) => column.key === "team");
  const gridColumns = useMemo(
    () =>
      hasTeamColumn
        ? columns
        : [{ key: "team", label: "Team", align: "left" as const }, ...columns],
    [columns, hasTeamColumn],
  );
  const dataColumns = useMemo(
    () => gridColumns.filter((column) => column.key !== "team"),
    [gridColumns],
  );
  const columnFeatures = useMemo(() => {
    const features: Record<string, { filterable: boolean; resizable: boolean; sortable: boolean }> = {};

    for (const column of gridColumns) {
      const config = column.key === "team" && !hasTeamColumn ? rowHeader : column;
      features[column.key] = resolveColumnFeatures(config);
    }

    return features;
  }, [gridColumns, hasTeamColumn, rowHeader]);
  const visibleRows = rows
    .filter((row) =>
      gridColumns.every((column) => {
        const features = columnFeatures[column.key];

        if (!features?.filterable) {
          return true;
        }

        const filter = filters[column.key]?.trim().toLowerCase();

        if (!filter) {
          return true;
        }

        const value = column.key === "team" ? rowTeamValue(row) : cellText(row.values[column.key]);
        return value.toLowerCase().includes(filter);
      }),
    )
    .sort((a, b) => {
      if (!sort) {
        return 0;
      }

      if (!columnFeatures[sort.key]?.sortable) {
        return 0;
      }

      const aValue = sort.key === "team" ? rowTeamValue(a) : cellText(a.values[sort.key]);
      const bValue = sort.key === "team" ? rowTeamValue(b) : cellText(b.values[sort.key]);
      const result = compareValues(aValue, bValue);

      return sort.direction === "ascending" ? result : -result;
    });
  const openMenuFeatures = openMenu ? columnFeatures[openMenu.key] : undefined;

  const resetWrapMinHeight = useCallback(() => {
    if (wrapRef.current) {
      wrapRef.current.style.minHeight = "";
    }
  }, []);

  const closeHeaderMenu = useCallback(() => {
    menuAnchorRef.current = null;
    resetWrapMinHeight();
    setOpenMenu(null);
  }, [resetWrapMinHeight]);

  const activeMenuFilter = openMenu ? filters[openMenu.key] ?? "" : "";

  const applyMenuPosition = useCallback(() => {
    const anchor = menuAnchorRef.current;
    const menu = menuRef.current;
    const host = menuHostRef.current;
    const wrap = wrapRef.current;

    if (!anchor || !menu || !host) {
      return;
    }

    const buttonRect = anchor.button.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const menuWidth = Math.min(MENU_WIDTH, hostRect.width - MENU_EDGE * 2);
    const buttonVisible =
      buttonRect.bottom > hostRect.top
      && buttonRect.top < hostRect.bottom
      && buttonRect.right > hostRect.left
      && buttonRect.left < hostRect.right;

    if (!buttonVisible) {
      closeHeaderMenu();
      return;
    }

    let left = anchor.align === "left"
      ? buttonRect.left - hostRect.left
      : buttonRect.right - hostRect.left - menuWidth;
    left = Math.min(Math.max(left, MENU_EDGE), hostRect.width - menuWidth - MENU_EDGE);

    const belowTop = buttonRect.bottom - hostRect.top + MENU_GAP;
    menu.style.maxHeight = "none";
    let menuNaturalHeight = menu.offsetHeight;

    if (openMenuFeatures?.filterable && !activeMenuFilter.trim()) {
      menuNaturalHeight += MENU_CLEAR_FILTER_RESERVE;
    }

    menuNaturalHeight = Math.max(menuNaturalHeight, MENU_MIN_HEIGHT, MENU_PREFERRED_HEIGHT);
    menu.style.maxHeight = "";

    if (wrap) {
      wrap.style.minHeight = `${Math.ceil(belowTop + menuNaturalHeight + MENU_EDGE)}px`;
    }

    const expandedHostRect = host.getBoundingClientRect();
    const spaceBelow = expandedHostRect.height - belowTop - MENU_EDGE;
    const spaceAbove = buttonRect.top - expandedHostRect.top - MENU_GAP - MENU_EDGE;
    const openBelow = spaceBelow >= MENU_MIN_HEIGHT || spaceBelow >= spaceAbove;
    const top = openBelow
      ? belowTop
      : Math.max(MENU_EDGE, buttonRect.top - expandedHostRect.top - MENU_GAP);
    const maxHeight = openBelow
      ? Math.min(menuNaturalHeight, Math.max(MENU_MIN_HEIGHT, spaceBelow))
      : Math.min(menuNaturalHeight, Math.max(MENU_MIN_HEIGHT, spaceAbove));

    menu.style.width = `${menuWidth}px`;
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    menu.style.maxHeight = `${maxHeight}px`;
    menu.style.transform = openBelow ? "" : "translateY(-100%)";
  }, [activeMenuFilter, closeHeaderMenu, openMenuFeatures?.filterable]);

  const scheduleMenuPosition = useCallback(() => {
    if (menuFrameRef.current !== null) {
      return;
    }

    menuFrameRef.current = window.requestAnimationFrame(() => {
      menuFrameRef.current = null;
      applyMenuPosition();
    });
  }, [applyMenuPosition]);

  useLayoutEffect(() => {
    if (!openMenu) {
      resetWrapMinHeight();
      return;
    }

    applyMenuPosition();

    const wrap = wrapRef.current;
    const menu = menuRef.current;
    wrap?.addEventListener("scroll", scheduleMenuPosition, { passive: true });
    window.addEventListener("resize", scheduleMenuPosition, { passive: true });

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const trigger = menuAnchorRef.current?.button;
      closeHeaderMenu();
      trigger?.focus();
    };

    document.addEventListener("keydown", onDocumentKeyDown, true);

    const resizeObserver = menu
      ? new ResizeObserver(() => {
          scheduleMenuPosition();
        })
      : null;

    if (menu && resizeObserver) {
      resizeObserver.observe(menu);
    }

    const anchorButton = menuAnchorRef.current?.button;
    const headerCell = anchorButton?.closest("th");
    const headerResizeObserver = headerCell
      ? new ResizeObserver(() => {
          scheduleMenuPosition();
        })
      : null;

    if (headerCell && headerResizeObserver) {
      headerResizeObserver.observe(headerCell);
    }

    const focusTarget = menu?.querySelector("input");

    if (focusTarget instanceof HTMLInputElement) {
      focusTarget.focus();
    } else {
      menu?.focus();
    }

    return () => {
      wrap?.removeEventListener("scroll", scheduleMenuPosition);
      window.removeEventListener("resize", scheduleMenuPosition);
      document.removeEventListener("keydown", onDocumentKeyDown, true);
      resizeObserver?.disconnect();
      headerResizeObserver?.disconnect();
      resetWrapMinHeight();

      if (menuFrameRef.current !== null) {
        window.cancelAnimationFrame(menuFrameRef.current);
        menuFrameRef.current = null;
      }
    };
  }, [activeMenuFilter, applyMenuPosition, closeHeaderMenu, openMenu, resetWrapMinHeight, scheduleMenuPosition]);

  useLayoutEffect(() => {
    if (!openMenu) {
      return;
    }

    scheduleMenuPosition();
  }, [columnWidths, openMenu, scheduleMenuPosition]);

  const toggleSort = (key: string) => {
    if (!columnFeatures[key]?.sortable) {
      return;
    }

    setSort((current) => {
      if (current?.key !== key) {
        return { key, direction: "ascending" };
      }

      if (current.direction === "ascending") {
        return { key, direction: "descending" };
      }

      return null;
    });
  };

  const setSortDirection = (key: string, direction: SortState["direction"] | null) => {
    setSort(direction ? { key, direction } : null);
    closeHeaderMenu();
  };

  const openHeaderMenu = ({
    align,
    button,
    key,
    label,
  }: {
    align: "left" | "right";
    button: HTMLButtonElement;
    key: string;
    label: string;
  }) => {
    menuAnchorRef.current = { align, button };
    setOpenMenu({
      align,
      key,
      label,
      menuId: key,
    });
  };

  const beginResize = useCallback((
    event: PointerEvent<HTMLElement> | globalThis.PointerEvent,
    key: string,
    measuredWidth?: number,
  ) => {
    if (!columnFeatures[key]?.resizable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    closeHeaderMenu();

    const cell = "currentTarget" in event
      ? (event.currentTarget as HTMLElement).closest("th, td")
      : null;
    const widthFromCell = cell?.getBoundingClientRect().width;
    const currentWidth =
      columnWidths[key] ?? measuredWidth ?? widthFromCell ?? (key === "team" ? 180 : 130);

    const dragState: ResizeState = {
      key,
      startWidth: currentWidth,
      startX: event.clientX,
    };

    resizeDragRef.current = dragState;
    setResizing(dragState);

    const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
      const drag = resizeDragRef.current;

      if (!drag) {
        return;
      }

      const features = columnFeatures[drag.key] ?? {
        filterable: false,
        resizable: false,
        sortable: false,
      };
      const nextWidth = Math.max(
        getMinColumnWidth(
          features.sortable,
          features.sortable || features.filterable,
          density,
        ),
        drag.startWidth + moveEvent.clientX - drag.startX,
      );

      setColumnWidths((current) => ({ ...current, [drag.key]: nextWidth }));
    };

    const finishResize = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", finishResize);
      window.removeEventListener("pointercancel", finishResize);
      resizeDragRef.current = null;
      setResizing(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", finishResize);
    window.addEventListener("pointercancel", finishResize);
  }, [closeHeaderMenu, columnFeatures, columnWidths, density]);

  const handleBodyPointerDown = useCallback((event: PointerEvent<HTMLTableSectionElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLTableCellElement>(
      "td[data-column-key]",
    );

    if (!cell || cell.dataset.columnResizable !== "true") {
      return;
    }

    const columnKey = cell.dataset.columnKey;

    if (!columnKey || !columnFeatures[columnKey]?.resizable) {
      return;
    }

    const { right, width } = cell.getBoundingClientRect();

    if (event.clientX < right - RESIZE_HANDLE_WIDTH) {
      return;
    }

    beginResize(event, columnKey, width);
  }, [beginResize, columnFeatures]);

  return (
    <div className={styles.frame}>
      {caption ? <div className={styles.caption}>{caption}</div> : null}
      <div className={styles.gridBody}>
        <div
          ref={wrapRef}
          className={styles.wrap}
          data-bordered={bordered}
          data-density={density}
          data-filterable={Object.values(columnFeatures).some((feature) => feature.filterable)}
          data-resizable={Object.values(columnFeatures).some((feature) => feature.resizable)}
          data-resizing={Boolean(resizing)}
          data-sortable={Object.values(columnFeatures).some((feature) => feature.sortable)}
          data-sticky-column={stickyFirstColumn}
          data-sticky-header={stickyHeader}
          data-striped={striped}
        >
          <table className={styles.grid}>
            {caption ? <caption className={styles.visuallyHidden}>{caption}</caption> : null}
            <colgroup>
              {gridColumns.map((column) => (
                <col
                  key={column.key}
                  style={{ width: columnWidths[column.key] ?? (column.key === "team" ? 180 : 130) }}
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                {gridColumns.map((column) => (
                  <th
                    aria-sort={
                      columnFeatures[column.key].sortable
                        ? sort?.key === column.key
                          ? sort.direction
                          : "none"
                        : undefined
                    }
                    className={column.key === "team" ? styles.corner : undefined}
                    data-column-resizable={columnFeatures[column.key].resizable}
                    data-filter-active={Boolean(filters[column.key]?.trim())}
                    data-menu-open={openMenu?.key === column.key}
                    key={column.key}
                    scope="col"
                    style={
                      columnWidths[column.key]
                        ? { width: columnWidths[column.key], minWidth: columnWidths[column.key] }
                        : undefined
                    }
                  >
                    <HeaderContent
                      filterActive={Boolean(filters[column.key]?.trim())}
                      filterable={columnFeatures[column.key].filterable}
                      label={column.label}
                      menuId={column.key}
                      sortDirection={sort?.key === column.key ? sort.direction : undefined}
                      sortable={columnFeatures[column.key].sortable}
                      menuOpen={openMenu?.key === column.key}
                      onMenuToggle={(button) => {
                        if (openMenu?.key === column.key) {
                          closeHeaderMenu();
                          return;
                        }

                        openHeaderMenu({
                          align: column.key === "team" ? "left" : "right",
                          button,
                          key: column.key,
                          label: column.label,
                        });
                      }}
                      onSort={() => toggleSort(column.key)}
                    />
                    {columnFeatures[column.key].resizable ? (
                      <ColumnResizeHandle
                        onResizeStart={(event) => beginResize(event, column.key)}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody onPointerDown={handleBodyPointerDown}>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <th
                    className={styles.rowHeader}
                    scope="row"
                    style={
                      columnWidths.team
                        ? { width: columnWidths.team, minWidth: columnWidths.team }
                        : undefined
                    }
                  >
                    {row.values.team ?? row.label}
                  </th>
                  {dataColumns.map((column) => (
                    <td
                      data-align={column.align ?? "left"}
                      data-column-key={column.key}
                      data-column-resizable={columnFeatures[column.key].resizable}
                      key={column.key}
                      style={
                        columnWidths[column.key]
                          ? { width: columnWidths[column.key], minWidth: columnWidths[column.key] }
                          : undefined
                      }
                    >
                      {row.values[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
              {!visibleRows.length ? (
                <tr>
                  <th className={styles.rowHeader} scope="row">
                    No rows
                  </th>
                  <td className={styles.empty} colSpan={Math.max(dataColumns.length, 1)}>
                    No matching rows.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {openMenu ? (
          <div className={styles.menuHost} ref={menuHostRef}>
            <GridHeaderMenu
              ref={menuRef}
              filter={filters[openMenu.key] ?? ""}
              filterable={openMenuFeatures?.filterable ?? false}
              label={openMenu.label}
              menuId={openMenu.menuId}
              sortDirection={sort?.key === openMenu.key ? sort.direction : undefined}
              sortable={openMenuFeatures?.sortable ?? false}
              onFilterChange={(filter) =>
                setFilters((current) => ({ ...current, [openMenu.key]: filter }))
              }
              onMenuClose={closeHeaderMenu}
              onSortDirection={(direction) => setSortDirection(openMenu.key, direction)}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ColumnResizeHandle({
  onResizeStart,
}: {
  onResizeStart: (event: PointerEvent<HTMLSpanElement>) => void;
}) {
  return (
    <span
      aria-hidden="true"
      className={styles.columnResizeHandle}
      onPointerDown={onResizeStart}
    />
  );
}

function HeaderContent({
  filterActive,
  filterable,
  label,
  menuId,
  menuOpen,
  sortDirection,
  sortable,
  onMenuToggle,
  onSort,
}: {
  filterActive: boolean;
  filterable: boolean;
  label: string;
  menuId: string;
  menuOpen: boolean;
  sortDirection?: "ascending" | "descending";
  sortable: boolean;
  onMenuToggle: (button: HTMLButtonElement) => void;
  onSort: () => void;
}) {
  const hasMenu = sortable || filterable;

  const sortLabel = sortDirection === "ascending"
    ? `${label}, sorted ascending`
    : sortDirection === "descending"
      ? `${label}, sorted descending`
      : `Sort by ${label}`;

  return (
    <span className={styles.headerCell}>
      {sortable ? (
        <button
          aria-label={sortLabel}
          className={styles.sortButton}
          type="button"
          onClick={onSort}
        >
          <span className={styles.sortButtonLabel} title={label}>
            {label}
          </span>
        </button>
      ) : (
        <span className={styles.headerLabel}>
          <span className={styles.sortButtonLabel} title={label}>
            {label}
          </span>
        </span>
      )}
      {sortable || hasMenu ? (
        <span className={styles.headerControls}>
          {sortable ? (
            <span
              aria-hidden="true"
              className={styles.sortIndicator}
              data-direction={sortDirection ?? "none"}
            />
          ) : null}
          {hasMenu ? (
            <button
              aria-controls={`data-grid-menu-${menuId}`}
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              aria-label={
                filterActive
                  ? `${label} filter active. Open column options.`
                  : sortable && filterable
                    ? `Open ${label} sort and filter options`
                    : sortable
                      ? `Open ${label} sort options`
                      : `Open ${label} filter options`
              }
              className={styles.menuButton}
              data-filter-active={filterActive}
              type="button"
              onClick={(event) => onMenuToggle(event.currentTarget)}
            >
              {filterActive ? (
                <FontAwesomeIcon className={styles.menuFilterIcon} icon={faFilter} />
              ) : (
                <span aria-hidden="true" className={styles.menuChevron} />
              )}
            </button>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

const GridHeaderMenu = forwardRef(function GridHeaderMenu(
  {
    filter,
    filterable,
    label,
    menuId,
    sortDirection,
    sortable,
    onFilterChange,
    onMenuClose,
    onSortDirection,
  }: {
    filter: string;
    filterable: boolean;
    label: string;
    menuId: string;
    sortDirection?: "ascending" | "descending";
    sortable: boolean;
    onFilterChange: (filter: string) => void;
    onMenuClose: () => void;
    onSortDirection: (direction: SortState["direction"] | null) => void;
  },
  ref: Ref<HTMLSpanElement>,
) {
  return (
    <span
      ref={ref}
      className={styles.headerMenu}
      id={`data-grid-menu-${menuId}`}
      role="dialog"
      tabIndex={-1}
      aria-label={`${label} column options`}
    >
      {sortable ? (
        <span className={styles.menuSection}>
          <span className={styles.menuLabel}>Sort</span>
          <button
            aria-pressed={sortDirection === "ascending"}
            className={styles.menuAction}
            type="button"
            onClick={() => onSortDirection("ascending")}
          >
            Ascending
          </button>
          <button
            aria-pressed={sortDirection === "descending"}
            className={styles.menuAction}
            type="button"
            onClick={() => onSortDirection("descending")}
          >
            Descending
          </button>
          <button
            aria-pressed={sortDirection ? false : undefined}
            className={styles.menuAction}
            type="button"
            onClick={() => onSortDirection(null)}
          >
            Clear sort
          </button>
        </span>
      ) : null}
      {filterable ? (
        <span className={styles.menuSection}>
          <span className={styles.menuLabel}>Filter</span>
          <input
            aria-label={`Filter ${label}`}
            className={styles.filterInput}
            placeholder={`Search ${label}`}
            value={filter}
            onChange={(event) => onFilterChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "Escape") {
                event.preventDefault();
                onMenuClose();
              }
            }}
          />
          {filter ? (
            <button className={styles.menuAction} type="button" onClick={() => onFilterChange("")}>
              Clear filter
            </button>
          ) : null}
        </span>
      ) : null}
    </span>
  );
});
