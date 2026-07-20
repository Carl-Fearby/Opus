import styles from "./TabActiveLine.module.css";

export type TabActiveLineOrientation = "horizontal" | "vertical";

export type TabActiveLineProps = {
  className?: string;
  orientation?: TabActiveLineOrientation;
};

export function TabActiveLine({ className, orientation = "horizontal" }: TabActiveLineProps) {
  return (
    <span
      aria-hidden="true"
      className={[styles.line, className].filter(Boolean).join(" ")}
      data-orientation={orientation}
    />
  );
}
