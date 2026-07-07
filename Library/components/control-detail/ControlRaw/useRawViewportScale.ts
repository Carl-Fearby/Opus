"use client";

import { useLayoutEffect, useRef, useState } from "react";

const STAGE_PADDING = 48;

export function useRawViewportScale(width: number | null, height: number | null, full: boolean) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const scalingDisabled = full || width === null || height === null;

  useLayoutEffect(() => {
    if (scalingDisabled) {
      return;
    }

    const area = areaRef.current;
    if (!area) {
      return;
    }

    const update = () => {
      const availableWidth = Math.max(area.clientWidth - STAGE_PADDING, 1);
      const availableHeight = Math.max(area.clientHeight - STAGE_PADDING, 1);
      const nextScale = Math.min(availableWidth / width, availableHeight / height, 1);
      setScale(nextScale > 0 ? nextScale : 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(area);

    return () => observer.disconnect();
  }, [height, scalingDisabled, width]);

  return { areaRef, scale: scalingDisabled ? 1 : scale };
}
