"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./FlipClock.module.css";

export type FlipClockSize = "sm" | "md" | "lg";

/** Film / video-editing frame rate for the optional FF column. */
export const FLIP_CLOCK_FRAME_RATE = 24;

type FlipClockProps = {
  showDate?: boolean;
  /** Show SS column. Implied when `showFrames` is true. */
  showSeconds?: boolean;
  /** Show FF column at 24 fps (0–23), for video-editing timecode. */
  showFrames?: boolean;
  size?: FlipClockSize;
};

type FlipDigitProps = {
  durationMs: number;
  value: string;
};

function frameFromDate(date: Date) {
  return Math.floor(date.getMilliseconds() / (1000 / FLIP_CLOCK_FRAME_RATE)) % FLIP_CLOCK_FRAME_RATE;
}

/** Measure rendered ink vs the figure box and return the translate needed to optically center. */
function measureInkNudge(glyph: HTMLElement, figure: HTMLElement) {
  glyph.style.transform = "none";
  const range = document.createRange();
  range.selectNodeContents(glyph);
  const ink = range.getBoundingClientRect();
  const box = figure.getBoundingClientRect();
  glyph.style.transform = "";

  if (ink.width < 1 || ink.height < 1 || box.height < 1) {
    return { x: 0, y: 0 };
  }

  return {
    x: box.left + box.width / 2 - (ink.left + ink.width / 2),
    y: box.top + box.height / 2 - (ink.top + ink.height / 2),
  };
}

function useFlipInkNudge(size: FlipClockSize) {
  const rootRef = useRef<HTMLDivElement>(null);
  const probeGlyphRef = useRef<HTMLSpanElement>(null);
  const probeFigureRef = useRef<HTMLSpanElement>(null);
  const [nudge, setNudge] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const root = rootRef.current;
    const glyph = probeGlyphRef.current;
    const figure = probeFigureRef.current;
    if (!root || !glyph || !figure) {
      return;
    }

    let frame = 0;
    const timeouts: number[] = [];

    const run = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const next = measureInkNudge(glyph, figure);
        setNudge((prev) =>
          Math.abs(prev.x - next.x) < 0.25 && Math.abs(prev.y - next.y) < 0.25 ? prev : next,
        );
      });
    };

    const runSoon = () => {
      run();
      timeouts.push(window.setTimeout(run, 60));
      timeouts.push(window.setTimeout(run, 250));
    };

    runSoon();
    void document.fonts.ready.then(runSoon);
    document.fonts.addEventListener("loadingdone", runSoon);

    const rootObserver = new ResizeObserver(runSoon);
    rootObserver.observe(root);

    const themeObserver = new MutationObserver(runSoon);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      window.cancelAnimationFrame(frame);
      timeouts.forEach((id) => window.clearTimeout(id));
      document.fonts.removeEventListener("loadingdone", runSoon);
      rootObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [size]);

  return {
    rootRef,
    probeGlyphRef,
    probeFigureRef,
    inkStyle: {
      ["--flip-ink-x" as string]: `${nudge.x}px`,
      ["--flip-ink-y" as string]: `${nudge.y}px`,
    } satisfies CSSProperties,
  };
}

function FlipDigit({ durationMs, value }: FlipDigitProps) {
  const [upper, setUpper] = useState(value);
  const [lower, setLower] = useState(value);
  const [from, setFrom] = useState(value);
  const [to, setTo] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const [flipKey, setFlipKey] = useState(0);

  const upperRef = useRef(value);
  const busyRef = useRef(false);
  const pendingRef = useRef<string | null>(null);
  const durationRef = useRef(durationMs);
  const timerRef = useRef(0);

  useEffect(() => {
    durationRef.current = durationMs;
  }, [durationMs]);

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const finishFlip = (next: string) => {
      setLower(next);
      setFlipping(false);
      busyRef.current = false;

      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending !== null && pending !== upperRef.current) {
        startFlip(pending);
      }
    };

    const startFlip = (next: string) => {
      const previous = upperRef.current;
      if (next === previous) {
        return;
      }

      busyRef.current = true;
      setFrom(previous);
      setTo(next);
      setLower(previous);
      setUpper(next);
      upperRef.current = next;
      setFlipKey((key) => key + 1);
      setFlipping(true);

      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        finishFlip(next);
      }, durationRef.current);
    };

    if (value === upperRef.current) {
      return;
    }

    if (busyRef.current) {
      pendingRef.current = value;
      return;
    }

    startFlip(value);
  }, [value]);

  return (
    <div
      aria-hidden="true"
      className={styles.rotor}
      data-flipping={flipping ? "true" : "false"}
      style={{ ["--flip-duration" as string]: `${durationMs}ms` }}
    >
      <div className={`${styles.panel} ${styles.panelTop}`}>
        <span className={styles.figure}>
          <span className={styles.glyph}>{upper}</span>
        </span>
      </div>
      <div className={`${styles.panel} ${styles.panelBottom}`}>
        <span className={styles.figure}>
          <span className={styles.glyph}>{lower}</span>
        </span>
      </div>

      {flipping ? (
        <div key={flipKey} className={styles.leaf}>
          <div className={`${styles.leafFace} ${styles.leafFront}`}>
            <span className={styles.figure}>
              <span className={styles.glyph}>{from}</span>
            </span>
          </div>
          <div className={`${styles.leafFace} ${styles.leafRear}`}>
            <span className={styles.figure}>
              <span className={styles.glyph}>{to}</span>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DigitPair({ durationMs, value }: { durationMs: number; value: string }) {
  const padded = value.padStart(2, "0");
  return (
    <div className={styles.pair}>
      <FlipDigit durationMs={durationMs} value={padded[0]!} />
      <FlipDigit durationMs={durationMs} value={padded[1]!} />
    </div>
  );
}

function Colon() {
  return (
    <span className={styles.separator} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

export function FlipClock({
  showDate = true,
  showSeconds = true,
  showFrames = false,
  size = "md",
}: FlipClockProps) {
  const [time, setTime] = useState<Date | null>(null);
  const includeSeconds = showSeconds || showFrames;
  const durationMs = showFrames ? 120 : 650;
  const tickMs = showFrames ? 1000 / FLIP_CLOCK_FRAME_RATE : 1000;
  const { rootRef, probeGlyphRef, probeFigureRef, inkStyle } = useFlipInkNudge(size);

  useEffect(() => {
    setTime(new Date());
    const interval = window.setInterval(() => setTime(new Date()), tickMs);
    return () => window.clearInterval(interval);
  }, [tickMs]);

  const hours = time ? String(time.getHours()).padStart(2, "0") : "00";
  const minutes = time ? String(time.getMinutes()).padStart(2, "0") : "00";
  const seconds = time ? String(time.getSeconds()).padStart(2, "0") : "00";
  const frames = time ? String(frameFromDate(time)).padStart(2, "0") : "00";

  const digitalTime = showFrames
    ? `${hours}:${minutes}:${seconds}:${frames}`
    : includeSeconds
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}`;

  const date = time
    ? time.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div
      aria-live="polite"
      className={styles.root}
      data-frames={showFrames ? "true" : "false"}
      data-seconds={includeSeconds ? "true" : "false"}
      data-size={size}
      ref={rootRef}
      style={inkStyle}
    >
      {/* Hidden probe — re-measures ink bounds whenever the theme font changes */}
      <span className={styles.probe} aria-hidden="true">
        <span className={styles.figure} ref={probeFigureRef}>
          <span className={styles.glyph} ref={probeGlyphRef}>
            8
          </span>
        </span>
      </span>

      {!time ? (
        <div className={styles.loading}>Loading flip clock…</div>
      ) : (
        <>
          <div className={styles.board} role="img" aria-label={digitalTime}>
            <DigitPair durationMs={durationMs} value={hours} />
            <Colon />
            <DigitPair durationMs={durationMs} value={minutes} />
            {includeSeconds ? (
              <>
                <Colon />
                <DigitPair durationMs={durationMs} value={seconds} />
              </>
            ) : null}
            {showFrames ? (
              <>
                <Colon />
                <DigitPair durationMs={durationMs} value={frames} />
              </>
            ) : null}
          </div>

          <time className={styles.srOnly} dateTime={time.toISOString()}>
            {digitalTime}
          </time>

          {showDate ? <div className={styles.date}>{date}</div> : null}
        </>
      )}
    </div>
  );
}
