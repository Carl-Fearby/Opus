"use client";

import { useMemo, useState } from "react";
import styles from "./Calendar.module.css";

export type CalendarEvent = {
  date: string;
  id: string;
  title: string;
  tone?: "accent" | "success" | "warning" | "danger";
};

export type CalendarProps = {
  events?: CalendarEvent[];
  month?: number;
  onSelectDate?: (date: string) => void;
  selectedDate?: string;
  year?: number;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function Calendar({
  events = [],
  month: controlledMonth,
  onSelectDate,
  selectedDate,
  year: controlledYear,
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => ({
    year: controlledYear ?? today.getFullYear(),
    month: controlledMonth ?? today.getMonth(),
  }));

  const year = controlledYear ?? cursor.year;
  const month = controlledMonth ?? cursor.month;

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const total = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, index) => {
      const day = index - startOffset + 1;
      if (day < 1 || day > daysInMonth) return null;
      return day;
    });
  }, [month, year]);

  const label = new Date(year, month, 1).toLocaleString(undefined, { month: "long", year: "numeric" });

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    if (controlledYear != null && controlledMonth != null) return;
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  }

  return (
    <div className={styles.root} aria-label="Calendar">
      <div className={styles.toolbar}>
        <button aria-label="Previous month" className={styles.nav} onClick={() => shiftMonth(-1)} type="button">
          ‹
        </button>
        <div className={styles.label}>{label}</div>
        <button aria-label="Next month" className={styles.nav} onClick={() => shiftMonth(1)} type="button">
          ›
        </button>
      </div>
      <div className={styles.weekdays}>
        {weekdayLabels.map((day) => (
          <div className={styles.weekday} key={day}>
            {day}
          </div>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((day, index) => {
          if (day == null) return <div className={styles.empty} key={`empty-${index}`} />;
          const key = toDateKey(year, month, day);
          const dayEvents = eventsByDate.get(key) ?? [];
          const isToday =
            today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
          const isSelected = selectedDate === key;
          return (
            <button
              aria-current={isToday ? "date" : undefined}
              aria-pressed={isSelected}
              className={[
                styles.day,
                isToday ? styles.today : "",
                isSelected ? styles.selected : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={key}
              onClick={() => onSelectDate?.(key)}
              type="button"
            >
              <span className={styles.dayNumber}>{day}</span>
              {dayEvents.length > 0 ? (
                <span className={styles.dots}>
                  {dayEvents.slice(0, 3).map((event) => (
                    <span className={styles.dot} data-tone={event.tone ?? "accent"} key={event.id} title={event.title} />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
