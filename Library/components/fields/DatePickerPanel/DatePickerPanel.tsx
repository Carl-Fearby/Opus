"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DatePickerSelect } from "./DatePickerSelect";
import type { DateRangeValue } from "./datePickerUtils";
import styles from "./DatePickerPanel.module.css";
import type { ControlTransparency } from "../types";

type DatePickerPanelBaseProps = {
  closeOnSelect?: boolean;
  extra?: ReactNode;
  max?: string;
  min?: string;
  onClose?: () => void;
  showFooter?: boolean;
  transparency?: ControlTransparency;
};

export type DatePickerPanelSingleProps = DatePickerPanelBaseProps & {
  selectionMode?: "single";
  value?: string;
  onSelect: (iso: string) => void;
};

export type DatePickerPanelRangeProps = DatePickerPanelBaseProps & {
  selectionMode: "range";
  value?: DateRangeValue;
  onSelect: (value: DateRangeValue) => void;
};

export type DatePickerPanelProps = DatePickerPanelSingleProps | DatePickerPanelRangeProps;

const weekdayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const monthLabels = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleString(undefined, { month: "long" }),
);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function parseIso(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function isDisabled(iso: string, min?: string, max?: string) {
  if (min && iso < min) return true;
  if (max && iso > max) return true;
  return false;
}

function emptyRange(): DateRangeValue {
  return { from: "", to: "" };
}

type Cell = {
  day: number;
  iso: string;
  outside: boolean;
};

export function DatePickerPanel(props: DatePickerPanelProps) {
  const { closeOnSelect = true, extra, max, min, onClose, showFooter = true, transparency } = props;
  const isRange = props.selectionMode === "range";
  const singleValue = !isRange ? props.value : undefined;
  const rangeValue = isRange ? (props.value ?? emptyRange()) : emptyRange();

  const today = useMemo(() => new Date(), []);
  const todayIso = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selected = parseIso(isRange ? rangeValue.from || rangeValue.to : singleValue);

  const [cursor, setCursor] = useState(() => {
    const seed = selected ?? today;
    return { year: seed.getFullYear(), month: seed.getMonth() };
  });
  const [hoverIso, setHoverIso] = useState<string | null>(null);
  /** True while waiting for the end date after the first click. */
  const [pickingEnd, setPickingEnd] = useState(
    () => isRange && Boolean(rangeValue.from) && !rangeValue.to,
  );

  const { year, month } = cursor;

  const yearOptions = useMemo(() => {
    const center = today.getFullYear();
    const minYear = min ? Number(min.slice(0, 4)) : center - 40;
    const maxYear = max ? Number(max.slice(0, 4)) : center + 40;
    const start = Math.min(minYear, year);
    const end = Math.max(maxYear, year);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [max, min, today, year]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const total = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: total }, (_, index): Cell => {
      if (index < startOffset) {
        const day = daysInPrev - startOffset + index + 1;
        const date = new Date(year, month - 1, day);
        return {
          day,
          iso: toDateKey(date.getFullYear(), date.getMonth(), day),
          outside: true,
        };
      }

      const day = index - startOffset + 1;
      if (day > daysInMonth) {
        const nextDay = day - daysInMonth;
        const date = new Date(year, month + 1, nextDay);
        return {
          day: nextDay,
          iso: toDateKey(date.getFullYear(), date.getMonth(), nextDay),
          outside: true,
        };
      }

      return {
        day,
        iso: toDateKey(year, month, day),
        outside: false,
      };
    });
  }, [month, year]);

  const previewRange = useMemo(() => {
    if (!isRange) return null;
    const start = rangeValue.from;
    if (!start) return null;

    if (pickingEnd && hoverIso) {
      return start <= hoverIso
        ? { from: start, to: hoverIso }
        : { from: hoverIso, to: start };
    }

    if (rangeValue.to) {
      return rangeValue.from <= rangeValue.to
        ? { from: rangeValue.from, to: rangeValue.to }
        : { from: rangeValue.to, to: rangeValue.from };
    }

    return { from: start, to: start };
  }, [hoverIso, isRange, pickingEnd, rangeValue.from, rangeValue.to]);

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  }

  function emitRange(next: DateRangeValue, close: boolean) {
    if (!isRange) return;
    props.onSelect(next);
    if (close) onClose?.();
  }

  function handleSelect(iso: string) {
    if (isDisabled(iso, min, max)) return;

    if (!isRange) {
      props.onSelect(iso);
      if (closeOnSelect) onClose?.();
      return;
    }

    // Completed range (or empty): first click starts a new selection.
    if (!pickingEnd || !rangeValue.from) {
      setPickingEnd(true);
      setHoverIso(iso);
      emitRange({ from: iso, to: "" }, false);
      return;
    }

    // Second click: if before start, treat as a new start; otherwise complete.
    if (iso < rangeValue.from) {
      setHoverIso(iso);
      emitRange({ from: iso, to: "" }, false);
      return;
    }

    setPickingEnd(false);
    setHoverIso(null);
    emitRange({ from: rangeValue.from, to: iso }, true);
  }

  function handleClear() {
    if (isRange) {
      setPickingEnd(false);
      setHoverIso(null);
      emitRange(emptyRange(), true);
      return;
    }
    props.onSelect("");
    if (closeOnSelect) onClose?.();
  }

  function handleToday() {
    if (isDisabled(todayIso, min, max)) return;
    setCursor({ year: today.getFullYear(), month: today.getMonth() });

    if (isRange) {
      setPickingEnd(true);
      setHoverIso(todayIso);
      emitRange({ from: todayIso, to: "" }, false);
      return;
    }

    props.onSelect(todayIso);
    if (closeOnSelect) onClose?.();
  }

  function dayClassName(cell: Cell, disabled: boolean) {
    const isToday = cell.iso === todayIso;
    const classes = [styles.day, cell.outside ? styles.outside : "", isToday ? styles.today : ""];

    if (!isRange) {
      if (singleValue === cell.iso) classes.push(styles.selected);
      return classes.filter(Boolean).join(" ");
    }

    if (!previewRange) {
      return classes.filter(Boolean).join(" ");
    }

    const { from, to } = previewRange;
    const isStart = cell.iso === from;
    const isEnd = cell.iso === to;
    const inRange = cell.iso > from && cell.iso < to;
    const isPreview = Boolean(pickingEnd && hoverIso && (isStart || isEnd || inRange));

    if (isStart && isEnd) {
      classes.push(styles.selected, styles.rangeEndpoint);
    } else if (isStart) {
      classes.push(styles.selected, styles.rangeStart, styles.rangeEndpoint);
    } else if (isEnd) {
      classes.push(styles.selected, styles.rangeEnd, styles.rangeEndpoint);
    } else if (inRange) {
      classes.push(isPreview ? styles.rangePreview : styles.inRange);
    }

    if (disabled) {
      // keep disabled look; classes already applied via disabled attr
    }

    return classes.filter(Boolean).join(" ");
  }

  return (
    <div
      className={styles.panel}
      data-control-transparency={transparency}
      role="dialog"
      aria-label={isRange ? "Choose date range" : "Choose date"}
    >
      <div className={styles.toolbar}>
        <button
          aria-label="Previous month"
          className={styles.nav}
          type="button"
          onClick={() => shiftMonth(-1)}
        >
          ‹
        </button>
        <div className={styles.picker}>
          <DatePickerSelect
            aria-label="Month"
            className={styles.monthSelect}
            options={monthLabels.map((name, index) => ({ label: name, value: index }))}
            value={month}
            onChange={(nextMonth) => setCursor({ year, month: nextMonth })}
          />
          <DatePickerSelect
            aria-label="Year"
            className={styles.yearSelect}
            options={yearOptions.map((optionYear) => ({
              label: String(optionYear),
              value: optionYear,
            }))}
            value={year}
            onChange={(nextYear) => setCursor({ year: nextYear, month })}
          />
        </div>
        <button
          aria-label="Next month"
          className={styles.nav}
          type="button"
          onClick={() => shiftMonth(1)}
        >
          ›
        </button>
      </div>

      {isRange ? (
        <p className={styles.hint}>
          {pickingEnd && rangeValue.from
            ? "Select the end date"
            : "Select the start date"}
        </p>
      ) : null}

      <div className={styles.weekdays} aria-hidden="true">
        {weekdayLabels.map((day) => (
          <div className={styles.weekday} key={day}>
            {day}
          </div>
        ))}
      </div>

      <div
        className={[styles.grid, isRange ? styles.rangeGrid : ""].filter(Boolean).join(" ")}
        onMouseLeave={() => setHoverIso(null)}
      >
        {cells.map((cell) => {
          const disabled = isDisabled(cell.iso, min, max);
          const isToday = cell.iso === todayIso;
          const isSelected = isRange
            ? Boolean(
                previewRange &&
                  (cell.iso === previewRange.from || cell.iso === previewRange.to),
              )
            : singleValue === cell.iso;

          return (
            <button
              aria-current={isToday ? "date" : undefined}
              aria-disabled={disabled || undefined}
              aria-label={cell.iso}
              aria-pressed={isSelected}
              className={dayClassName(cell, disabled)}
              disabled={disabled}
              key={cell.iso}
              type="button"
              onClick={() => handleSelect(cell.iso)}
              onMouseEnter={() => {
                if (isRange && pickingEnd && !disabled) {
                  setHoverIso(cell.iso);
                }
              }}
            >
              <span className={styles.dayLabel}>{cell.day}</span>
            </button>
          );
        })}
      </div>

      {extra}

      {showFooter ? (
        <div className={styles.footer}>
          <button className={styles.footerAction} type="button" onClick={handleClear}>
            Clear
          </button>
          <button
            className={styles.footerAction}
            disabled={isDisabled(todayIso, min, max)}
            type="button"
            onClick={handleToday}
          >
            Today
          </button>
        </div>
      ) : null}
    </div>
  );
}
