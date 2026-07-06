import styles from "./Sparkline.module.css";

type SparklineProps = {
  height?: number;
  label?: string;
  palette?: "cool" | "mono" | "opus" | "warm";
  values: number[];
  width?: number;
};

function sparklinePath(values: number[], width: number, height: number) {
  if (!values.length) {
    return "";
  }

  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function Sparkline({ height = 36, label, palette = "opus", values, width = 120 }: SparklineProps) {
  const path = sparklinePath(values, width, height);

  return (
    <figure className={styles.sparkline} data-palette={palette}>
      {label ? <figcaption className={styles.label}>{label}</figcaption> : null}
      <svg
        aria-hidden={label ? undefined : true}
        className={styles.svg}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        <path className={styles.line} d={path} />
      </svg>
    </figure>
  );
}
