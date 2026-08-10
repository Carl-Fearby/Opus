"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import styles from "./TextMarquee.module.css";

export type TextMarqueeDirection = "left" | "right";

export type TextMarqueeProps = {
  /** Content repeated across the moving track. */
  children: ReactNode;
  className?: string;
  /** Direction in which the content travels. */
  direction?: TextMarqueeDirection;
  /** Edge-to-edge space between repeated copies, in pixels. */
  gap?: number;
  /** Softly mask content as it enters and leaves the viewport. */
  fadeEdges?: boolean;
  /** Pause motion while the pointer or keyboard focus is inside. */
  pauseOnHover?: boolean;
  /** Movement speed in pixels per second. */
  speed?: number;
  /** Render the Opus glass surface around the marquee. */
  surface?: boolean;
  /** Accessible description. Required when children are not plain text. */
  ariaLabel?: string;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function TextMarquee({
  ariaLabel,
  children,
  className,
  direction = "left",
  fadeEdges = true,
  gap = 48,
  pauseOnHover = true,
  speed = 56,
  surface = true,
}: TextMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const firstGroupRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(1);
  const [distance, setDistance] = useState(0);

  const measure = useCallback(() => {
    const root = rootRef.current;
    const item = measureRef.current;
    if (!root || !item) return;

    const safeGap = clamp(gap, 0, 240);
    const itemWidth = item.getBoundingClientRect().width;
    const viewportWidth = root.getBoundingClientRect().width;
    if (itemWidth < 1 || viewportWidth < 1) return;

    const nextCopies = Math.max(
      1,
      Math.ceil((viewportWidth + safeGap) / (itemWidth + safeGap)),
    );
    setCopies((current) => (current === nextCopies ? current : nextCopies));
  }, [gap]);

  useLayoutEffect(() => {
    measure();
    const root = rootRef.current;
    const item = measureRef.current;
    if (!root || !item) return;

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(item);
    document.fonts?.addEventListener("loadingdone", measure);
    void document.fonts?.ready.then(measure);
    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [measure]);

  useLayoutEffect(() => {
    const group = firstGroupRef.current;
    if (!group) return;
    const update = () => setDistance(group.getBoundingClientRect().width + clamp(gap, 0, 240));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(group);
    return () => observer.disconnect();
  }, [copies, gap, children]);

  const duration = Math.max(1, distance / clamp(speed, 8, 320));
  const resolvedLabel = ariaLabel ?? (typeof children === "string" ? children : undefined);
  const rootClassName = [styles.root, className].filter(Boolean).join(" ");
  const rootStyle = {
    ["--marquee-distance" as string]: `${distance}px`,
    ["--marquee-duration" as string]: `${duration}s`,
    ["--marquee-gap" as string]: `${clamp(gap, 0, 240)}px`,
  } satisfies CSSProperties;

  const renderGroup = (duplicate: boolean) => (
    <div
      aria-hidden={duplicate ? "true" : undefined}
      className={styles.group}
      ref={duplicate ? undefined : firstGroupRef}
    >
      {Array.from({ length: copies }, (_, index) => (
        <span aria-hidden={index > 0 ? "true" : undefined} className={styles.item} key={index}>
          {children}
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-label={resolvedLabel}
      className={rootClassName}
      data-direction={direction}
      data-fade-edges={fadeEdges ? "true" : "false"}
      data-pause-on-hover={pauseOnHover ? "true" : "false"}
      data-surface={surface ? "true" : "false"}
      ref={rootRef}
      role={resolvedLabel ? "region" : undefined}
      style={rootStyle}
    >
      <span aria-hidden="true" className={styles.measure} ref={measureRef}>
        {children}
      </span>
      <div
        aria-hidden={resolvedLabel ? "true" : undefined}
        className={styles.track}
        data-ready={distance > 0 ? "true" : "false"}
      >
        {renderGroup(false)}
        {renderGroup(true)}
      </div>
    </div>
  );
}
