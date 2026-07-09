"use client";

import { useMemo } from "react";
import styles from "./Scheduler.module.css";

export type SchedulerEvent = {
  day: number;
  id: string;
  startHour: number;
  title: string;
  durationHours?: number;
  tone?: "accent" | "success" | "warning" | "danger";
};

export type SchedulerProps = {
  days?: string[];
  endHour?: number;
  events: SchedulerEvent[];
  startHour?: number;
};

const defaultDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export function Scheduler({
  days = defaultDays,
  endHour = 17,
  events,
  startHour = 9,
}: SchedulerProps) {
  const hours = useMemo(() => {
    const list: number[] = [];
    for (let hour = startHour; hour <= endHour; hour += 1) list.push(hour);
    return list;
  }, [endHour, startHour]);

  return (
    <div className={styles.root} aria-label="Scheduler">
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))`,
          gridTemplateRows: `2rem repeat(${hours.length}, minmax(44px, 1fr))`,
        }}
      >
        <div className={styles.corner} />
        {days.map((day) => (
          <div className={styles.dayHead} key={day}>
            {day}
          </div>
        ))}
        {hours.map((hour) => (
          <div className={styles.contents} key={hour} style={{ display: "contents" }}>
            <div className={styles.time}>{formatHour(hour)}</div>
            {days.map((_, dayIndex) => {
              const cellEvents = events.filter(
                (event) => event.day === dayIndex && Math.floor(event.startHour) === hour,
              );
              return (
                <div className={styles.cell} key={`${dayIndex}-${hour}`}>
                  {cellEvents.map((event) => (
                    <div
                      className={styles.event}
                      data-tone={event.tone ?? "accent"}
                      key={event.id}
                      style={{ minHeight: `${Math.max(event.durationHours ?? 1, 0.75) * 36}px` }}
                      title={`${event.title} · ${formatHour(event.startHour)}`}
                    >
                      <span className={styles.eventTitle}>{event.title}</span>
                      <span className={styles.eventTime}>{formatHour(event.startHour)}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatHour(hour: number) {
  const whole = Math.floor(hour);
  const minutes = Math.round((hour - whole) * 60);
  const suffix = whole >= 12 ? "PM" : "AM";
  const display = ((whole + 11) % 12) + 1;
  return minutes ? `${display}:${String(minutes).padStart(2, "0")} ${suffix}` : `${display} ${suffix}`;
}
