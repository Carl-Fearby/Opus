import type { CSSProperties, ReactNode } from "react";
import {
  resolveColumnStyleVars,
  resolveRowStyleVars,
  resolveSectionGapVars,
  type SectionAlign,
  type SectionColumns,
  type SectionGap,
  type SectionJustify,
  type SectionLayoutPreset,
  type SectionSidebar,
  type SectionSidebarRatio,
  type SectionSpan,
  type SectionStackBelow,
  type SectionTemplate,
  type SectionWidth,
} from "@/lib/layout/sectionLayout";
import styles from "./Section.module.css";

type SectionMaxWidth = "full" | "narrow" | "wide";

type SectionProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  gap?: SectionGap;
  maxWidth?: SectionMaxWidth;
  style?: CSSProperties;
  title?: string;
};

type SectionRowProps = {
  align?: SectionAlign;
  children: ReactNode;
  className?: string;
  columns?: SectionColumns;
  gap?: SectionGap;
  justify?: SectionJustify;
  layout?: SectionLayoutPreset;
  sidebar?: SectionSidebar;
  sidebarRatio?: SectionSidebarRatio;
  stackBelow?: SectionStackBelow;
  style?: CSSProperties;
  template?: SectionTemplate;
};

type SectionColumnProps = {
  children: ReactNode;
  className?: string;
  span?: SectionSpan;
  style?: CSSProperties;
  width?: SectionWidth;
};

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function SectionRoot({
  children,
  className,
  description,
  gap = "md",
  maxWidth = "full",
  style,
  title,
}: SectionProps) {
  return (
    <section
      className={joinClassNames(styles.section, className)}
      data-max-width={maxWidth}
      style={{ ...resolveSectionGapVars(gap), ...style }}
    >
      {title || description ? (
        <header className={styles.header}>
          {title ? <h2 className={styles.title}>{title}</h2> : null}
          {description ? <p className={styles.description}>{description}</p> : null}
        </header>
      ) : null}
      <div className={styles.body}>{children}</div>
    </section>
  );
}

function SectionRow({
  align,
  children,
  className,
  columns,
  gap,
  justify,
  layout,
  sidebar,
  sidebarRatio,
  stackBelow,
  style,
  template,
}: SectionRowProps) {
  return (
    <div
      className={joinClassNames(styles.row, className)}
      style={{
        ...resolveRowStyleVars({
          align,
          columns,
          gap,
          justify,
          layout,
          sidebar,
          sidebarRatio,
          stackBelow,
          template,
        }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionColumn({ children, className, span, style, width }: SectionColumnProps) {
  return (
    <div
      className={joinClassNames(styles.column, className)}
      style={{ ...resolveColumnStyleVars({ span, width }), ...style }}
    >
      {children}
    </div>
  );
}

export const Section = Object.assign(SectionRoot, {
  Row: SectionRow,
  Column: SectionColumn,
});

export type {
  SectionAlign,
  SectionColumns,
  SectionGap,
  SectionJustify,
  SectionLayoutPreset,
  SectionSidebar,
  SectionSidebarRatio,
  SectionSpan,
  SectionStackBelow,
  SectionTemplate,
  SectionWidth,
};
