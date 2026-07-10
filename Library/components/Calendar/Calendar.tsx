"use client";

import { useMemo, useState } from "react";
import { sortEventsByTime } from "./calendarTime";
import { CalendarDayModal } from "./CalendarDayModal";
import styles from "./Calendar.module.css";

export type CalendarEvent = {
  date: string;
  endTime?: string;
  id: string;
  startTime?: string;
  title: string;
  tone?: "accent" | "success" | "warning" | "danger";
};

export type CalendarProps = {
  events?: CalendarEvent[];
  maxDayEvents?: number;
  month?: number;
  onBookEvent?: (event: CalendarEvent) => void;
  onSelectDate?: (date: string) => void;
  openDayOnSelect?: boolean;
  selectedDate?: string;
  showMonthYearPicker?: boolean;
  year?: number;
};

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const defaultMaxDayEvents = 3;

const monthLabels = Array.from({ length: 12 }, (_, month) =>
  new Date(2000, month, 1).toLocaleString(undefined, { month: "long" }),
);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function Calendar({
  events = [],
  maxDayEvents = defaultMaxDayEvents,
  month: controlledMonth,
  onBookEvent,
  onSelectDate,
  openDayOnSelect = true,
  selectedDate,
  showMonthYearPicker = true,
  year: controlledYear,
}: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => ({
    year: controlledYear ?? today.getFullYear(),
    month: controlledMonth ?? today.getMonth(),
  }));
  const [internalSelected, setInternalSelected] = useState<string | undefined>();
  const [activeDayKey, setActiveDayKey] = useState<string | null>(null);
  const [bookedEvents, setBookedEvents] = useState<CalendarEvent[]>([]);

  const year = controlledYear ?? cursor.year;
  const month = controlledMonth ?? cursor.month;
  const isControlled = controlledYear != null && controlledMonth != null;
  const activeSelected = selectedDate ?? internalSelected;

  const allEvents = useMemo(() => [...events, ...bookedEvents], [bookedEvents, events]);

  const yearOptions = useMemo(() => {
    const minYear = today.getFullYear() - 20;
    const maxYear = today.getFullYear() + 20;
    const start = Math.min(minYear, year);
    const end = Math.max(maxYear, year);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [today, year]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of allEvents) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    return map;
  }, [allEvents]);

  const activeDayEvents = activeDayKey ? sortEventsByTime(eventsByDate.get(activeDayKey) ?? []) : [];

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

  function setMonthYear(nextMonth: number, nextYear: number) {
    if (isControlled) return;
    setCursor({ year: nextYear, month: nextMonth });
  }

  function shiftMonth(delta: number) {
    const next = new Date(year, month + delta, 1);
    setMonthYear(next.getMonth(), next.getFullYear());
  }

  function handleSelectDay(key: string) {
    setInternalSelected(key);
    onSelectDate?.(key);
    if (openDayOnSelect) {
      setActiveDayKey(key);
    }
  }

  function handleBookEvent(event: CalendarEvent) {
    setBookedEvents((current) => [...current, event]);
    onBookEvent?.(event);
  }

  return (
    <>
      <div className={styles.root} aria-label="Calendar">
        <div className={styles.toolbar} data-picker={showMonthYearPicker ? "true" : "false"}>
          <button aria-label="Previous month" className={styles.nav} onClick={() => shiftMonth(-1)} type="button">
            ‹
          </button>

          {showMonthYearPicker ? (
            <div className={styles.picker}>
              <label className={styles.pickerField}>
                <span className={styles.srOnly}>Month</span>
                <select
                  aria-label="Month"
                  className={[styles.select, styles.monthSelect].join(" ")}
                  disabled={isControlled}
                  onChange={(event) => setMonthYear(Number(event.target.value), year)}
                  value={month}
                >
                  {monthLabels.map((name, index) => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.pickerField}>
                <span className={styles.srOnly}>Year</span>
                <select
                  aria-label="Year"
                  className={[styles.select, styles.yearSelect].join(" ")}
                  disabled={isControlled}
                  onChange={(event) => setMonthYear(month, Number(event.target.value))}
                  value={year}
                >
                  {yearOptions.map((optionYear) => (
                    <option key={optionYear} value={optionYear}>
                      {optionYear}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : (
            <div className={styles.label}>{label}</div>
          )}

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
            const dayEvents = sortEventsByTime(eventsByDate.get(key) ?? []);
            const visibleEvents = dayEvents.slice(0, maxDayEvents);
            const hiddenEventCount = Math.max(dayEvents.length - visibleEvents.length, 0);
            const isToday =
              today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
            const isSelected = activeSelected === key;
            return (
              <button
                aria-current={isToday ? "date" : undefined}
                aria-label={
                  hiddenEventCount > 0
                    ? `${dayEvents.length} events on ${key}, ${hiddenEventCount} more not shown`
                    : undefined
                }
                aria-pressed={isSelected}
                className={[
                  styles.day,
                  isToday ? styles.today : "",
                  isSelected ? styles.selected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={key}
                onClick={() => handleSelectDay(key)}
                type="button"
              >
                <span className={styles.dayNumber}>{day}</span>
                {visibleEvents.length > 0 ? (
                  <span className={styles.events}>
                    {visibleEvents.map((event) => (
                      <span className={styles.event} key={event.id}>
                        <span
                          aria-hidden="true"
                          className={styles.dot}
                          data-tone={event.tone ?? "accent"}
                        />
                        <span className={styles.eventLabel}>{event.title}</span>
                      </span>
                    ))}
                    {hiddenEventCount > 0 ? (
                      <span className={styles.moreEvents}>+{hiddenEventCount} more</span>
                    ) : null}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <CalendarDayModal
        dateKey={activeDayKey}
        events={activeDayEvents}
        onBookEvent={handleBookEvent}
        onClose={() => setActiveDayKey(null)}
      />
    </>
  );
}
