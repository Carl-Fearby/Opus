"use client";

import { useEffect, useState } from "react";
import styles from "./Clock.module.css";

export type ClockSize = "sm" | "md" | "lg";

type ClockProps = {
  showAnalog?: boolean;
  showDate?: boolean;
  showDigital?: boolean;
  size?: ClockSize;
};

export function Clock({
  showAnalog = true,
  showDate = true,
  showDigital = true,
  size = "md",
}: ClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());

    const interval = window.setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className={styles.root} data-size={size}>
        <div className={styles.loading}>Loading clock…</div>
      </div>
    );
  }

  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();

  const secondRotation = seconds * 6;
  const minuteRotation = minutes * 6 + seconds * 0.1;
  const hourRotation = (hours % 12) * 30 + minutes * 0.5;

  const digitalTime = time.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const date = time.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      aria-live="polite"
      className={styles.root}
      data-analog={showAnalog ? "true" : "false"}
      data-digital={showDigital ? "true" : "false"}
      data-size={size}
    >
      {showAnalog ? (
        <div aria-hidden="true" className={styles.face}>
          {Array.from({ length: 60 }).map((_, index) => {
            const isHourMark = index % 5 === 0;

            return (
              <span
                key={index}
                className={styles.tick}
                data-hour-mark={isHourMark ? "true" : "false"}
                style={{ transform: `rotate(${index * 6}deg)` }}
              />
            );
          })}

          {Array.from({ length: 12 }).map((_, index) => {
            const number = index + 1;
            const angle = number * 30 * (Math.PI / 180);
            const radius = size === "sm" ? 64 : size === "lg" ? 113 : 92;

            return (
              <span
                key={number}
                className={styles.number}
                style={{
                  left: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  top: `calc(50% - ${Math.cos(angle) * radius}px)`,
                }}
              >
                {number}
              </span>
            );
          })}

          <div
            className={`${styles.hand} ${styles.hourHand}`}
            style={{ transform: `translateX(-50%) rotate(${hourRotation}deg)` }}
          />
          <div
            className={`${styles.hand} ${styles.minuteHand}`}
            style={{ transform: `translateX(-50%) rotate(${minuteRotation}deg)` }}
          />
          <div
            className={`${styles.hand} ${styles.secondHand}`}
            style={{ transform: `translateX(-50%) rotate(${secondRotation}deg)` }}
          />
          <div className={styles.centreDot}>
            <div className={styles.centreDotInner} />
          </div>
        </div>
      ) : null}

      {showDigital ? (
        <time className={styles.digitalTime} dateTime={time.toISOString()}>
          {digitalTime}
        </time>
      ) : null}

      {showDate ? <div className={styles.date}>{date}</div> : null}
    </div>
  );
}
