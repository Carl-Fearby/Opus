import type { SkeletonAnimation, SkeletonVariant } from "@/components/fields/types";
import styles from "./Skeleton.module.css";

type SkeletonProps = {
  animation?: SkeletonAnimation;
  lines?: number;
  variant?: SkeletonVariant;
};

const clampLines = (lines: number) => Math.min(Math.max(Math.round(lines), 1), 8);

function SkeletonLine({ index }: { index: number }) {
  return (
    <span
      aria-hidden="true"
      className={styles.line}
      data-line={index}
    />
  );
}

export function Skeleton({
  animation = "shimmer",
  lines = 3,
  variant = "text",
}: SkeletonProps) {
  const safeLines = clampLines(lines);
  const lineItems = Array.from({ length: safeLines }, (_, index) => index);

  if (variant === "avatar") {
    return (
      <div aria-busy="true" aria-label="Loading content" className={styles.skeleton} data-animation={animation} data-variant={variant} role="status">
        <span aria-hidden="true" className={styles.avatar} />
        <span className={styles.avatarContent}>
          {lineItems.map((index) => (
            <SkeletonLine index={index} key={index} />
          ))}
        </span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div aria-busy="true" aria-label="Loading content" className={styles.skeleton} data-animation={animation} data-variant={variant} role="status">
        <span aria-hidden="true" className={styles.media} />
        <span className={styles.stack}>
          {lineItems.map((index) => (
            <SkeletonLine index={index} key={index} />
          ))}
        </span>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div aria-busy="true" aria-label="Loading table" className={styles.skeleton} data-animation={animation} data-variant={variant} role="status">
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <span className={styles.tableRow} key={rowIndex}>
            {Array.from({ length: 4 }, (_, cellIndex) => (
              <span aria-hidden="true" className={styles.tableCell} key={cellIndex} />
            ))}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div aria-busy="true" aria-label="Loading content" className={styles.skeleton} data-animation={animation} data-variant={variant} role="status">
      {lineItems.map((index) => (
        <SkeletonLine index={index} key={index} />
      ))}
    </div>
  );
}
