import styles from "./Spinner.module.css";

export type SpinnerSize = "sm" | "md" | "lg";
export type SpinnerTone = "accent" | "muted" | "inverse";

type SpinnerProps = {
  label?: string;
  size?: SpinnerSize;
  tone?: SpinnerTone;
};

export function Spinner({ label = "Loading", size = "md", tone = "accent" }: SpinnerProps) {
  return (
    <span
      aria-label={label}
      className={styles.spinner}
      data-size={size}
      data-tone={tone}
      role="status"
    >
      <span aria-hidden="true" className={styles.ring} />
    </span>
  );
}
