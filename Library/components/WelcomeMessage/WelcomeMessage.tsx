"use client";

import { useEffect, useMemo, useState, type ElementType } from "react";
import styles from "./WelcomeMessage.module.css";

export type WelcomeGreeting = "afternoon" | "evening" | "morning";

export type WelcomeMessageProps = {
  as?: ElementType;
  className?: string;
  date?: Date | number | string;
  greeting?: string;
  name: string;
  showWave?: boolean;
  subtitle?: string;
  timeZone?: string;
  updateInterval?: number;
};

function toDate(value: WelcomeMessageProps["date"]) {
  if (value instanceof Date) return value;
  if (value !== undefined) return new Date(value);
  return new Date();
}

function getHour(date: Date, timeZone?: string) {
  if (!timeZone) return date.getHours();

  const hour = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone,
  }).formatToParts(date).find((part) => part.type === "hour")?.value;

  return Number(hour ?? date.getHours());
}

export function getWelcomeGreeting(hour: number): WelcomeGreeting {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

export function WelcomeMessage({
  as: Heading = "h1",
  className,
  date,
  greeting,
  name,
  showWave = true,
  subtitle = "Here’s what’s happening with your CRM today.",
  timeZone,
  updateInterval = 60_000,
}: WelcomeMessageProps) {
  const [currentDate, setCurrentDate] = useState(() => toDate(date));

  useEffect(() => {
    if (date !== undefined) {
      setCurrentDate(toDate(date));
      return;
    }

    const interval = window.setInterval(() => setCurrentDate(new Date()), updateInterval);
    return () => window.clearInterval(interval);
  }, [date, updateInterval]);

  const resolvedGreeting = useMemo(
    () => greeting ?? `Good ${getWelcomeGreeting(getHour(currentDate, timeZone))}`,
    [currentDate, greeting, timeZone],
  );

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <Heading className={styles.heading} suppressHydrationWarning>
        {resolvedGreeting}, {name}
        {showWave ? <span aria-hidden="true" className={styles.wave}>👋</span> : null}
      </Heading>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
    </div>
  );
}
