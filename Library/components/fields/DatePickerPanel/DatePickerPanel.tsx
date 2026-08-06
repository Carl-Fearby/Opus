"use client";

import { useMemo, useState } from "react";
import { DatePickerSelect } from "./DatePickerSelect";
import styles from "./DatePickerPanel.module.css";

export type DatePickerPanelProps = {
  max?: string;
  min?: string;
  onClose?: () => void;
  onSelect: (iso: string) => void;
  value?: string;
};

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

type Cell = {
  day: number;
  iso: string;
  outside: boolean;
};

export function DatePickerPanel({ max, min, onClose, onSelect, value }: DatePickerPanelProps) {
  const today = useMemo(() => new Date(), []);
  const todayIso = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const selected = parseIso(value);

  const [cursor, setCursor] = useState(() => {
    const seed = selected ?? today;
    return { year: seed.getFullYear(), month: seed.getMonth() };
  });

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

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  }

  function handleSelect(iso: string) {
    if (isDisabled(iso, min, max)) return;
    onSelect(iso);
    onClose?.();
  }

  function handleClear() {
    onSelect("");
    onClose?.();
  }

  function handleToday() {
    if (isDisabled(todayIso, min, max)) return;
    setCursor({ year: today.getFullYear(), month: today.getMonth() });
    onSelect(todayIso);
    onClose?.();
  }

  return (
    <div className={styles.panel} role="dialog" aria-label="Choose date">
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

      <div className={styles.weekdays} aria-hidden="true">
        {weekdayLabels.map((day) => (
          <div className={styles.weekday} key={day}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {cells.map((cell) => {
          const disabled = isDisabled(cell.iso, min, max);
          const isToday = cell.iso === todayIso;
          const isSelected = value === cell.iso;
          return (
            <button
              aria-current={isToday ? "date" : undefined}
              aria-disabled={disabled || undefined}
              aria-label={cell.iso}
              aria-pressed={isSelected}
              className={[
                styles.day,
                cell.outside ? styles.outside : "",
                isToday ? styles.today : "",
                isSelected ? styles.selected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              key={cell.iso}
              type="button"
              onClick={() => handleSelect(cell.iso)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

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
    </div>
  );
}
