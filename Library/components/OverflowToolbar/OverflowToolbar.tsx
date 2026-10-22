"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button } from "@/components/fields/Button";
import styles from "./OverflowToolbar.module.css";

function withoutIds(children: ReactNode): ReactNode[] {
  return Children.toArray(children).map((child) => {
    if (!isValidElement(child)) return child;
    const props = { ...(child.props as Record<string, unknown>) };
    delete props.id;
    if (props.children) props.children = withoutIds(props.children as ReactNode);
    return cloneElement(child as ReactElement<Record<string, unknown>>, props);
  });
}

export type OverflowToolbarProps = {
  /** Direct children are treated as toolbar actions. */
  children: ReactNode;
  className?: string;
  /** Space between actions in pixels. Defaults to 8. */
  gap?: number;
  label?: string;
  moreLabel?: string;
};

export function OverflowToolbar({
  children,
  className,
  gap = 8,
  label = "Toolbar",
  moreLabel = "More",
}: OverflowToolbarProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreMeasureRef = useRef<HTMLButtonElement>(null);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;

    const recalculate = () => {
      const available = root.clientWidth;
      const nodes = Array.from(measure.children) as HTMLElement[];
      const widths = nodes.map((node) => node.getBoundingClientRect().width);
      const moreWidth = moreMeasureRef.current?.getBoundingClientRect().width ?? 88;
      if (!available) return;

      let used = 0;
      let count = 0;

      for (let index = 0; index < widths.length; index += 1) {
        const next = used + (index > 0 ? gap : 0) + (widths[index] ?? 0);
        const remaining = widths.length - index - 1;
        const reserve = remaining > 0 ? gap + moreWidth : 0;

        if (next + reserve <= available) {
          used = next;
          count = index + 1;
        } else {
          break;
        }
      }

      setVisibleCount(count);
    };

    recalculate();
    const observer = new ResizeObserver(recalculate);
    observer.observe(root);
    observer.observe(measure);
    window.addEventListener("resize", recalculate);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recalculate);
    };
  }, [gap, items.length]);

  useEffect(() => {
    if (visibleCount >= items.length) setOpen(false);
  }, [items.length, visibleCount]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        moreWrapRef.current?.querySelector("button")?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  return (
    <div
      aria-label={label}
      className={[styles.root, className].filter(Boolean).join(" ")}
      ref={rootRef}
      role="toolbar"
      style={{ gap }}
    >
      <div aria-hidden="true" className={styles.measure} ref={measureRef}>
        {withoutIds(items).map((item, index) => (
          <span className={styles.measureItem} key={index}>
            {item}
          </span>
        ))}
        <button className={styles.moreButton} ref={moreMeasureRef} type="button">
          {moreLabel} ({items.length})
        </button>
      </div>

      <div className={styles.items} style={{ gap }}>
        {visibleItems.map((item, index) => (
          <span className={styles.item} key={index}>
            {item}
          </span>
        ))}
      </div>

      {overflowItems.length ? (
        <div className={styles.more} ref={moreWrapRef}>
          <Button
            aria-controls={open ? menuId : undefined}
            aria-expanded={open}
            aria-haspopup="true"
            size="sm"
            variant="secondary"
            onClick={() => setOpen((current) => !current)}
          >
            {moreLabel} ({overflowItems.length})
          </Button>
          {open ? (
            <div
              aria-label={`${moreLabel} actions`}
              className={styles.panel}
              id={menuId}
              onClick={() => setOpen(false)}
              role="group"
            >
              {overflowItems.map((item, index) => (
                <div className={styles.panelItem} key={index}>
                  {item}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
