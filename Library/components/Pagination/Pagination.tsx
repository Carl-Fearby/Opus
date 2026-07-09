"use client";

import styles from "./Pagination.module.css";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildPages(page: number, pageCount: number, siblingCount: number) {
  if (pageCount <= 7) return range(1, pageCount);
  const left = Math.max(page - siblingCount, 1);
  const right = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;
  const pages: Array<number | "ellipsis"> = [1];
  if (showLeftEllipsis) pages.push("ellipsis");
  else pages.push(...range(2, left - 1));
  pages.push(...range(left, right).filter((value) => value !== 1 && value !== pageCount));
  if (showRightEllipsis) pages.push("ellipsis");
  else pages.push(...range(right + 1, pageCount - 1));
  if (pageCount > 1) pages.push(pageCount);
  return [...new Set(pages)];
}

export function Pagination({ page, pageCount, onPageChange, siblingCount = 1 }: PaginationProps) {
  const pages = buildPages(page, Math.max(pageCount, 1), siblingCount);

  return (
    <nav aria-label="Pagination" className={styles.root}>
      <button
        aria-label="Previous page"
        className={styles.button}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        type="button"
      >
        ‹
      </button>
      {pages.map((entry, index) =>
        entry === "ellipsis" ? (
          <span aria-hidden="true" className={styles.ellipsis} key={`e-${index}`}>
            …
          </span>
        ) : (
          <button
            aria-current={entry === page ? "page" : undefined}
            aria-label={`Page ${entry}`}
            className={entry === page ? `${styles.button} ${styles.active}` : styles.button}
            key={entry}
            onClick={() => onPageChange(entry)}
            type="button"
          >
            {entry}
          </button>
        ),
      )}
      <button
        aria-label="Next page"
        className={styles.button}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        type="button"
      >
        ›
      </button>
    </nav>
  );
}
