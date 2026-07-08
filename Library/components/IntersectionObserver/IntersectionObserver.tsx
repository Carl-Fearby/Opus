"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

type IntersectionObserverProps = {
  children: (isIntersecting: boolean) => ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number | number[];
  onChange?: (isIntersecting: boolean) => void;
};

export function IntersectionObserver({
  children,
  className,
  rootMargin = "0px",
  threshold = 0.25,
  onChange,
}: IntersectionObserverProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof window.IntersectionObserver === "undefined") {
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        setIsIntersecting(entry.isIntersecting);
        onChange?.(entry.isIntersecting);
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onChange, rootMargin, threshold]);

  return (
    <div className={className} ref={ref}>
      {children(isIntersecting)}
    </div>
  );
}

export function useIntersectionObserver(
  targetRef: RefObject<HTMLElement | null>,
  options: { rootMargin?: string; threshold?: number | number[] } = {},
) {
  const { rootMargin = "0px", threshold = 0.25 } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const node = targetRef.current;
    if (!node || typeof window.IntersectionObserver === "undefined") {
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, targetRef, threshold]);

  return isIntersecting;
}
