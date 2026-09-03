import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./BackgroundBlobs.module.css";

export type BackgroundBlobPlacement = "absolute" | "fixed";

export type BackgroundBlobSize = "too-large" | "large" | "medium" | "small";

export type BackgroundBlobDrift = "a" | "b" | "c" | "a-reverse";

export type BackgroundBlob = {
  bottom?: string;
  drift?: BackgroundBlobDrift;
  from: string;
  left?: string;
  opacity?: number;
  right?: string;
  size?: string;
  to: string;
  top?: string;
};

export type BackgroundBlobsProps = {
  /** Animate the colour field. Also respects `prefers-reduced-motion`. */
  animated?: boolean;
  /** Brightness multiplier for the colour field. `1` is unchanged. */
  brightness?: number;
  /** Gaussian blur radius in pixels. */
  blur?: number;
  /** Replace the default four-tone field. */
  blobs?: BackgroundBlob[];
  /** Number of generated blobs when `colors` is provided. */
  count?: number;
  /** Base colour for each generated blob. */
  colors?: string[];
  className?: string;
  children?: ReactNode;
  /** Add spacing around children when filling a parent. */
  padParent?: boolean;
  /** `fixed` covers the viewport; `absolute` fills a positioned parent. */
  placement?: BackgroundBlobPlacement;
  /** Diameter scale. `large` is the original marketing size. */
  size?: BackgroundBlobSize;
};

const DEFAULT_DRIFTS: BackgroundBlobDrift[] = ["a", "b", "c", "a-reverse"];
const DRIFT_DURATIONS = [7, 8, 9, 8];

type BlobMotion = {
  drift: BackgroundBlobDrift;
  delay: number;
};

function randomMotion(): BlobMotion[] {
  const paths = [...DEFAULT_DRIFTS].sort(() => Math.random() - 0.5);

  return paths.map((drift, index) => {
    const duration = DRIFT_DURATIONS[index];
    const separatedPhase = (index / paths.length) * duration;
    const jitter = (Math.random() - 0.5) * duration * 0.25;
    return { drift, delay: -(separatedPhase + jitter) };
  });
}

const BLOB_SIZE_SCALE: Record<BackgroundBlobSize, number> = {
  "too-large": 1.5,
  large: 1,
  medium: 0.62,
  small: 0.4,
};

type OrganicPosition = {
  nextShape: number;
  scaleProgress: number;
  scaleStartX: number;
  scaleStartY: number;
  scaleX: number;
  scaleY: number;
  targetScaleX: number;
  targetScaleY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
};

const simulationCache = new Map<string, OrganicPosition[]>();

function randomShape() {
  const horizontal = Array.from({ length: 4 }, () => 25 + Math.random() * 50);
  const vertical = Array.from({ length: 4 }, () => 25 + Math.random() * 50);
  return `${horizontal.map((value) => `${value.toFixed(1)}%`).join(" ")} / ${vertical
    .map((value) => `${value.toFixed(1)}%`)
    .join(" ")}`;
}

function randomSpacedPositions(count: number) {
  const positions: Array<{ x: number; y: number }> = [];
  const minimumDistance = 0.25;

  for (let index = 0; index < count; index += 1) {
    let candidate = {
      x: 0.12 + Math.random() * 0.76,
      y: 0.12 + Math.random() * 0.76,
    };
    let attempts = 0;

    while (
      attempts < 80 &&
      positions.some(
        (position) =>
          Math.hypot(candidate.x - position.x, candidate.y - position.y) < minimumDistance,
      )
    ) {
      candidate = {
        x: 0.12 + Math.random() * 0.76,
        y: 0.12 + Math.random() * 0.76,
      };
      attempts += 1;
    }

    if (attempts === 80) {
      const columns = Math.ceil(Math.sqrt(count));
      const row = Math.floor(index / columns);
      const column = index % columns;
      candidate = {
        x: columns === 1 ? 0.5 : 0.16 + (column / (columns - 1)) * 0.68,
        y: columns === 1 ? 0.5 : 0.16 + (row / Math.max(1, columns - 1)) * 0.68,
      };
    }

    positions.push(candidate);
  }

  return positions;
}

function scaleBlobMeasure(value: string | undefined, scale: number) {
  if (!value || scale === 1) {
    return value;
  }

  return value.replace(/(\d+(?:\.\d+)?)(vw|px)/g, (_, amount: string, unit: string) => {
    const scaled = Number(amount) * scale;
    const rounded = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1).replace(/\.0$/, "");
    return `${rounded}${unit}`;
  });
}

export const defaultBackgroundBlobs: BackgroundBlob[] = [
  {
    drift: "a",
    from: "#c4b3fb",
    left: "-8%",
    opacity: 0.58,
    size: "min(52vw, 640px)",
    to: "#8f6cff",
    top: "-12%",
  },
  {
    drift: "b",
    from: "#67e8f9",
    opacity: 0.58,
    right: "-12%",
    size: "min(46vw, 560px)",
    to: "#22d3ee",
    top: "8%",
  },
  {
    drift: "c",
    from: "#fda4af",
    left: "18%",
    opacity: 0.42,
    size: "min(40vw, 480px)",
    to: "#fb7185",
    top: "46%",
  },
  {
    bottom: "-16%",
    drift: "a-reverse",
    from: "#fde68a",
    opacity: 0.38,
    right: "12%",
    size: "min(50vw, 620px)",
    to: "#f59e0b",
  },
];

export const defaultBackgroundBlobColors = defaultBackgroundBlobs.map((blob) => blob.to);

export function BackgroundBlobs({
  animated = true,
  brightness = 1,
  blur = 80,
  blobs,
  className,
  children,
  colors = defaultBackgroundBlobColors,
  count = 4,
  placement = "fixed",
  padParent = false,
  size = "large",
}: BackgroundBlobsProps) {
  const scale = BLOB_SIZE_SCALE[size];
  const generatedBlobs = useMemo(
    () =>
      Array.from({ length: Math.max(1, Math.min(8, count)) }, (_, index) => {
        const template = defaultBackgroundBlobs[index % defaultBackgroundBlobs.length];
        const color = colors[index % colors.length] ?? defaultBackgroundBlobColors[index % 4];
        return {
          ...template,
          from: `color-mix(in srgb, ${color} 45%, white)`,
          to: color,
        };
      }),
    [colors, count],
  );
  const activeBlobs = useMemo(() => blobs ?? generatedBlobs, [blobs, generatedBlobs]);
  const rootRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const positionsRef = useRef<OrganicPosition[]>([]);
  const [motions, setMotions] = useState<BlobMotion[]>(() =>
    DEFAULT_DRIFTS.map((drift) => ({ drift, delay: 0 })),
  );

  useEffect(() => {
    setMotions(randomMotion());
  }, []);

  useEffect(() => {
    if (!animated || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current;
    if (!root) return;

    const cacheKey = `${placement}-${activeBlobs.length}`;
    if (positionsRef.current.length !== activeBlobs.length) {
      const originalPositions = randomSpacedPositions(activeBlobs.length);
      positionsRef.current =
        simulationCache.get(cacheKey) ??
        activeBlobs.map((_, index) => ({
          nextShape: performance.now() + 1800 + Math.random() * 1400,
          scaleX: 1,
          scaleY: 1,
          scaleProgress: 1,
          scaleStartX: 1,
          scaleStartY: 1,
          targetScaleX: 0.62 + Math.random() * 0.78,
          targetScaleY: 0.62 + Math.random() * 0.78,
          x: originalPositions[index].x,
          y: originalPositions[index].y,
          vx: 0,
          vy: 0,
          tx: index % 2 === 0 ? 0.16 + Math.random() * 0.28 : 0.56 + Math.random() * 0.28,
          ty: index < 2 ? 0.16 + Math.random() * 0.28 : 0.56 + Math.random() * 0.28,
        }));
    }
    const positions = positionsRef.current;
    let frame = 0;
    let previous = performance.now();

    const tick = (time: number) => {
      const delta = Math.min(48, time - previous) / 1000;
      previous = time;
      const bounds = root.getBoundingClientRect();
      const separation = 0.25;

      positions.forEach((position, index) => {
        const blob = blobRefs.current[index];
        if (!blob) return;
        if (Math.hypot(position.tx - position.x, position.ty - position.y) < 0.08) {
          position.tx =
            index % 2 === 0 ? 0.12 + Math.random() * 0.32 : 0.56 + Math.random() * 0.32;
          position.ty =
            index < 2 ? 0.12 + Math.random() * 0.32 : 0.56 + Math.random() * 0.32;
        }
        if (time >= position.nextShape) {
          blob.style.borderRadius = randomShape();
          position.scaleStartX = position.scaleX;
          position.scaleStartY = position.scaleY;
          position.targetScaleX = 0.58 + Math.random() * 0.86;
          position.targetScaleY = 0.58 + Math.random() * 0.86;
          position.scaleProgress = 0;
          position.nextShape = time + 1800 + Math.random() * 1800;
        }
        position.vx += (position.tx - position.x) * delta * 0.22;
        position.vy += (position.ty - position.y) * delta * 0.22;
        positions.forEach((other, otherIndex) => {
          if (index === otherIndex) return;
          const dx = position.x - other.x;
          const dy = position.y - other.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < separation) {
            const force = (1 - distance / separation) * delta * 1.5;
            position.vx += (dx / distance) * force;
            position.vy += (dy / distance) * force;
          }
        });
        position.vx *= 0.985;
        position.vy *= 0.985;
        position.scaleProgress = Math.min(1, position.scaleProgress + delta / 2.4);
        const easeInOut =
          position.scaleProgress < 0.5
            ? 2 * position.scaleProgress ** 2
            : 1 - (-2 * position.scaleProgress + 2) ** 2 / 2;
        position.scaleX =
          position.scaleStartX +
          (position.targetScaleX - position.scaleStartX) * easeInOut;
        position.scaleY =
          position.scaleStartY +
          (position.targetScaleY - position.scaleStartY) * easeInOut;
        position.x = Math.max(0.08, Math.min(0.92, position.x + position.vx * delta));
        position.y = Math.max(0.08, Math.min(0.92, position.y + position.vy * delta));
        blob.style.left = `${position.x * bounds.width - blob.offsetWidth / 2}px`;
        blob.style.top = `${position.y * bounds.height - blob.offsetHeight / 2}px`;
        blob.style.transform = `scale(${position.scaleX}, ${position.scaleY})`;
      });
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frame);
      simulationCache.set(cacheKey, positions);
    };
  }, [activeBlobs, animated, placement]);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-animated={animated ? "true" : "false"}
      data-programmatic={animated ? "true" : "false"}
      data-pad-parent={padParent ? "true" : "false"}
      data-placement={placement}
      data-size={size}
      style={
        {
          "--opus-blob-blur": `${Math.max(0, blur)}px`,
          "--opus-blob-brightness": Math.max(0, brightness),
        } as CSSProperties
      }
    >
      <div
        aria-hidden="true"
        className={styles.blobLayer}
        data-placement={placement}
        ref={rootRef}
      >
        {activeBlobs.map((blob, index) => {
          const measure = scaleBlobMeasure(blob.size, scale);
          return (
            <span
              className={styles.blob}
              ref={(node) => {
                blobRefs.current[index] = node;
              }}
              data-drift={motions[index]?.drift ?? blob.drift ?? DEFAULT_DRIFTS[index % DEFAULT_DRIFTS.length]}
              key={`${blob.from}-${blob.to}-${index}`}
              style={{
                background: `radial-gradient(circle at 35% 35%, ${blob.from} 0%, ${blob.to} 46%, transparent 74%)`,
                bottom: animated ? undefined : blob.bottom,
                height: measure,
                left: animated ? undefined : blob.left,
                opacity: blob.opacity,
                animationDelay: `${motions[index]?.delay ?? 0}s`,
                right: animated ? undefined : blob.right,
                top: animated ? undefined : blob.top,
                width: measure,
              }}
            />
          );
        })}
      </div>
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
