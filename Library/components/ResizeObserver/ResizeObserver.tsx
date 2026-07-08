"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export type ElementSize = {
  height: number;
  width: number;
};

type ResizeObserverProps = {
  children: (size: ElementSize) => ReactNode;
  className?: string;
  onResize?: (size: ElementSize) => void;
};

export function ResizeObserver({ children, className, onResize }: ResizeObserverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window.ResizeObserver === "undefined") {
      return;
    }

    const observer = new window.ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      const next = {
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      };
      setSize(next);
      onResize?.(next);
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [onResize]);

  return (
    <div className={className} ref={ref}>
      {children(size)}
    </div>
  );
}

export function useResizeObserver(targetRef: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const node = targetRef.current;
    if (!node || typeof window.ResizeObserver === "undefined") {
      return;
    }

    const observer = new window.ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      setSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [targetRef]);

  return size;
}
