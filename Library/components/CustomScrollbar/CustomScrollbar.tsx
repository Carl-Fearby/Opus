"use client";

/* eslint-disable react-hooks/refs -- viewport refs are read exclusively inside event callbacks and layout effects. */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import styles from "./CustomScrollbar.module.css";

export type CustomScrollbarOrientation = "both" | "horizontal" | "vertical";
export type CustomScrollbarShape = "round" | "square";

export type CustomScrollbarProps = {
  autoHide?: boolean;
  children: ReactNode;
  className?: string;
  label?: string;
  maxHeight?: number | string;
  minThumbSize?: number;
  horizontalThumbShape?: CustomScrollbarShape;
  horizontalTrackShape?: CustomScrollbarShape;
  orientation?: CustomScrollbarOrientation;
  style?: CSSProperties;
  thickness?: number;
  verticalThumbShape?: CustomScrollbarShape;
  verticalTrackShape?: CustomScrollbarShape;
  viewportSelector?: string;
};

type Axis = "x" | "y";
type Metrics = {
  clientHeight: number;
  clientWidth: number;
  scrollHeight: number;
  scrollLeft: number;
  scrollTop: number;
  scrollWidth: number;
  trackHeight: number;
  trackWidth: number;
};

const emptyMetrics: Metrics = {
  clientHeight: 0,
  clientWidth: 0,
  scrollHeight: 0,
  scrollLeft: 0,
  scrollTop: 0,
  scrollWidth: 0,
  trackHeight: 0,
  trackWidth: 0,
};

function axisValues(metrics: Metrics, axis: Axis) {
  return axis === "y"
    ? { client: metrics.clientHeight, scroll: metrics.scrollHeight, position: metrics.scrollTop }
    : { client: metrics.clientWidth, scroll: metrics.scrollWidth, position: metrics.scrollLeft };
}

function thumbGeometry(metrics: Metrics, axis: Axis, minThumbSize: number) {
  const { client, position, scroll } = axisValues(metrics, axis);
  const track = axis === "y" ? metrics.trackHeight : metrics.trackWidth;
  if (!client || !track || scroll <= client) return { offset: 0, size: 0, visible: false };
  const size = Math.min(track, Math.max(minThumbSize, (client / scroll) * track));
  const travel = Math.max(0, track - size);
  const maxScroll = Math.max(1, scroll - client);
  return { offset: (position / maxScroll) * travel, size, visible: true };
}

export function CustomScrollbar({
  autoHide = true,
  children,
  className,
  label = "Scrollable content",
  maxHeight,
  minThumbSize = 28,
  horizontalThumbShape = "round",
  horizontalTrackShape = "round",
  orientation = "vertical",
  style,
  thickness = 10,
  verticalThumbShape = "round",
  verticalTrackShape = "round",
  viewportSelector,
}: CustomScrollbarProps) {
  const generatedId = useId();
  const viewportId = `custom-scrollbar-${generatedId.replaceAll(":", "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verticalTrackRef = useRef<HTMLDivElement>(null);
  const horizontalTrackRef = useRef<HTMLDivElement>(null);
  const activityTimer = useRef<number | null>(null);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [active, setActive] = useState(false);
  const [draggingAxis, setDraggingAxis] = useState<Axis | null>(null);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setMetrics({
      clientHeight: viewport.clientHeight,
      clientWidth: viewport.clientWidth,
      scrollHeight: viewport.scrollHeight,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      scrollWidth: viewport.scrollWidth,
      trackHeight: verticalTrackRef.current?.clientHeight ?? 0,
      trackWidth: horizontalTrackRef.current?.clientWidth ?? 0,
    });
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    if (rootRef.current?.parentElement) observer.observe(rootRef.current.parentElement);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [measure]);

  const showTemporarily = useCallback(() => {
    setActive(true);
    if (activityTimer.current !== null) window.clearTimeout(activityTimer.current);
    activityTimer.current = window.setTimeout(() => setActive(false), 850);
  }, []);

  const handleScroll = () => {
    measure();
    showTemporarily();
  };

  useLayoutEffect(() => {
    if (!viewportSelector) return;
    const root = rootRef.current;
    if (!root) return;
    let viewport: HTMLElement | null = null;
    let frame: number | null = null;

    const attach = () => {
      const next = root.querySelector<HTMLElement>(viewportSelector);
      if (!next || next === viewport) return;
      viewport?.removeEventListener("scroll", handleScroll);
      viewport = next;
      viewportRef.current = next;
      next.id ||= viewportId;
      next.setAttribute("aria-label", label);
      next.addEventListener("scroll", handleScroll, { passive: true });
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    };

    attach();
    const observer = new MutationObserver(() => {
      attach();
      measure();
    });
    observer.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (frame !== null) window.cancelAnimationFrame(frame);
      viewport?.removeEventListener("scroll", handleScroll);
      if (viewportRef.current === viewport) viewportRef.current = null;
    };
  }, [label, measure, viewportId, viewportSelector]);

  useLayoutEffect(() => () => {
    if (activityTimer.current !== null) window.clearTimeout(activityTimer.current);
  }, []);

  const vertical = thumbGeometry(metrics, "y", minThumbSize);
  const horizontal = thumbGeometry(metrics, "x", minThumbSize);

  useLayoutEffect(() => {
    if (!vertical.visible || !horizontal.visible) return;
    const frame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frame);
  }, [horizontal.visible, measure, vertical.visible]);

  const setAxisPosition = (axis: Axis, next: number) => {
    viewportRef.current?.scrollTo({
      behavior: "auto",
      ...(axis === "y" ? { top: next } : { left: next }),
    });
  };

  const startThumbDrag = (axis: Axis, event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDraggingAxis(axis);
    showTemporarily();
    event.currentTarget.setPointerCapture(event.pointerId);
    const startPointer = axis === "y" ? event.clientY : event.clientX;
    const values = axisValues(metrics, axis);
    const geometry = axis === "y" ? vertical : horizontal;
    const trackLength = axis === "y" ? metrics.trackHeight : metrics.trackWidth;
    const travel = Math.max(1, trackLength - geometry.size);
    const maxScroll = Math.max(0, values.scroll - values.client);

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const pointer = axis === "y" ? moveEvent.clientY : moveEvent.clientX;
      setAxisPosition(axis, values.position + ((pointer - startPointer) / travel) * maxScroll);
    };
    const handleEnd = () => {
      setDraggingAxis(null);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleEnd);
    window.addEventListener("pointercancel", handleEnd);
  };

  const handleTrackPointerDown = (axis: Axis, event: PointerEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    showTemporarily();
    const rect = event.currentTarget.getBoundingClientRect();
    const pointer = axis === "y" ? event.clientY - rect.top : event.clientX - rect.left;
    const geometry = axis === "y" ? vertical : horizontal;
    const values = axisValues(metrics, axis);
    const trackLength = axis === "y" ? metrics.trackHeight : metrics.trackWidth;
    const ratio = Math.max(0, Math.min(1, (pointer - geometry.size / 2) / Math.max(1, trackLength - geometry.size)));
    setAxisPosition(axis, ratio * Math.max(0, values.scroll - values.client));
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleTrackWheel = (event: globalThis.WheelEvent) => {
      const path = event.composedPath();
      const track = path.find(
        (target): target is HTMLElement => target instanceof HTMLElement && target.dataset.scrollbarTrack !== undefined,
      );
      const viewport = viewportRef.current;
      if (!track || !viewport) return;

      event.preventDefault();
      event.stopPropagation();
      showTemporarily();

      const axis = track.dataset.axis;
      if (axis === "y") {
        viewport.scrollBy({ top: event.deltaY || event.deltaX, behavior: "auto" });
      } else {
        viewport.scrollBy({ left: event.deltaX || event.deltaY, behavior: "auto" });
      }
    };

    root.addEventListener("wheel", handleTrackWheel, { passive: false });
    return () => root.removeEventListener("wheel", handleTrackWheel);
  }, [showTemporarily]);

  const handleThumbKeyDown = (axis: Axis, event: KeyboardEvent<HTMLDivElement>) => {
    const values = axisValues(metrics, axis);
    const smallStep = 40;
    const pageStep = Math.max(40, values.client * 0.9);
    const directions = axis === "y" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
    let next: number | null = null;
    if (event.key === directions[0]) next = values.position - smallStep;
    if (event.key === directions[1]) next = values.position + smallStep;
    if (event.key === "PageUp") next = values.position - pageStep;
    if (event.key === "PageDown") next = values.position + pageStep;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = values.scroll - values.client;
    if (next === null) return;
    event.preventDefault();
    setAxisPosition(axis, next);
  };

  const setVerticalTrack = useCallback((node: HTMLDivElement | null) => {
    verticalTrackRef.current = node;
    if (node) window.requestAnimationFrame(measure);
  }, [measure]);

  const setHorizontalTrack = useCallback((node: HTMLDivElement | null) => {
    horizontalTrackRef.current = node;
    if (node) window.requestAnimationFrame(measure);
  }, [measure]);

  const renderTrack = (axis: Axis) => {
    const geometry = axis === "y" ? vertical : horizontal;
    const values = axisValues(metrics, axis);
    if (!values.client || values.scroll <= values.client) return null;
    const max = Math.max(0, values.scroll - values.client);
    return (
      <div
        className={styles.track}
        data-axis={axis}
        data-scrollbar-track=""
        ref={axis === "y" ? setVerticalTrack : setHorizontalTrack}
        onPointerDown={(event) => handleTrackPointerDown(axis, event)}
      >
        {geometry.visible ? <div
          aria-controls={viewportId}
          aria-label={`${axis === "y" ? "Vertical" : "Horizontal"} scroll position`}
          aria-orientation={axis === "y" ? "vertical" : "horizontal"}
          aria-valuemax={Math.round(max)}
          aria-valuemin={0}
          aria-valuenow={Math.round(values.position)}
          className={styles.thumb}
          data-grabbing={draggingAxis === axis ? "true" : undefined}
          role="scrollbar"
          style={axis === "y"
            ? { height: geometry.size, transform: `translateY(${geometry.offset}px)` }
            : { width: geometry.size, transform: `translateX(${geometry.offset}px)` }}
          tabIndex={0}
          onKeyDown={(event) => handleThumbKeyDown(axis, event)}
          onPointerDown={(event) => startThumbDrag(axis, event)}
        /> : null}
      </div>
    );
  };

  const rootStyle = {
    ...style,
    "--custom-scrollbar-size": `${Math.max(6, thickness)}px`,
    maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
  } as CSSProperties;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-auto-hide={autoHide ? "true" : undefined}
      data-active={active ? "true" : undefined}
      data-both-scrollbars={vertical.visible && horizontal.visible ? "true" : undefined}
      data-custom-scrollbar-root=""
      data-horizontal-thumb-shape={horizontalThumbShape}
      data-horizontal-track-shape={horizontalTrackShape}
      data-orientation={orientation}
      ref={rootRef}
      style={rootStyle}
      data-vertical-thumb-shape={verticalThumbShape}
      data-vertical-track-shape={verticalTrackShape}
    >
      {viewportSelector ? children : (
        <div
          aria-label={label}
          className={styles.viewport}
          id={viewportId}
          ref={viewportRef as RefObject<HTMLDivElement | null>}
          tabIndex={0}
          onScroll={handleScroll}
        >
          <div className={styles.content} ref={contentRef}>{children}</div>
        </div>
      )}
      {orientation !== "horizontal" ? renderTrack("y") : null}
      {orientation !== "vertical" ? renderTrack("x") : null}
      {vertical.visible && horizontal.visible ? <span aria-hidden="true" className={styles.cornerDot} /> : null}
    </div>
  );
}
