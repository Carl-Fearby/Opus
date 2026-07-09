"use client";

import { useMemo } from "react";
import styles from "./ResourcePlanner.module.css";

export type ResourcePlannerItem = {
  end: number;
  id: string;
  label: string;
  resourceId: string;
  start: number;
  tone?: "accent" | "success" | "warning" | "danger";
};

export type ResourcePlannerResource = {
  id: string;
  label: string;
};

export type ResourcePlannerProps = {
  endHour?: number;
  items: ResourcePlannerItem[];
  resources: ResourcePlannerResource[];
  startHour?: number;
};

export function ResourcePlanner({
  endHour = 17,
  items,
  resources,
  startHour = 8,
}: ResourcePlannerProps) {
  const hours = useMemo(() => {
    const list: number[] = [];
    for (let hour = startHour; hour <= endHour; hour += 1) list.push(hour);
    return list;
  }, [endHour, startHour]);

  const span = Math.max(endHour - startHour, 1);

  return (
    <div className={styles.root} aria-label="Resource planner">
      <div className={styles.scroll}>
        <div className={styles.header} style={{ gridTemplateColumns: `9rem repeat(${hours.length}, minmax(48px, 1fr))` }}>
          <div className={styles.corner}>Resource</div>
          {hours.map((hour) => (
            <div className={styles.hour} key={hour}>
              {((hour + 11) % 12) + 1}
              {hour >= 12 ? "p" : "a"}
            </div>
          ))}
        </div>
        {resources.map((resource) => {
          const rowItems = items.filter((item) => item.resourceId === resource.id);
          return (
            <div className={styles.row} key={resource.id} style={{ gridTemplateColumns: `9rem minmax(0, 1fr)` }}>
              <div className={styles.resource}>{resource.label}</div>
              <div className={styles.track}>
                <div className={styles.lanes} style={{ gridTemplateColumns: `repeat(${hours.length}, minmax(48px, 1fr))` }}>
                  {hours.map((hour) => (
                    <div className={styles.lane} key={hour} />
                  ))}
                </div>
                {rowItems.map((item) => {
                  const left = ((item.start - startHour) / span) * 100;
                  const width = (Math.max(item.end - item.start, 0.5) / span) * 100;
                  return (
                    <div
                      className={styles.block}
                      data-tone={item.tone ?? "accent"}
                      key={item.id}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${item.label} (${item.start}–${item.end})`}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
