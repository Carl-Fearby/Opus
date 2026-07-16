"use client";

import { useId } from "react";
import styles from "./Sparkline.module.css";

type SparklineProps = {
  height?: number;
  label?: string;
  palette?: "cool" | "mono" | "opus" | "warm";
  values: number[];
  variant?: "inline" | "labeled";
  width?: number;
};

function buildSparklineGeometry(values: number[], width: number, height: number) {
  if (!values.length) {
    return { areaPath: "", endPoint: null, linePath: "" };
  }

  const padX = 2;
  const padY = 3;
  const chartWidth = width - padX * 2;
  const chartHeight = height - padY * 2;
  const max = Math.max(1, ...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);

  const points = values.map((value, index) => {
    const x = padX + (values.length === 1 ? chartWidth / 2 : (index / (values.length - 1)) * chartWidth);
    const y = padY + chartHeight - ((value - min) / range) * (chartHeight - 4) - 2;
    return { x, y };
  });

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const lastPoint = points[points.length - 1];
  const areaPath = `${linePath} L ${lastPoint.x} ${height - padY} L ${points[0].x} ${height - padY} Z`;

  return { areaPath, endPoint: lastPoint, linePath };
}

export function Sparkline({
  height = 48,
  label,
  palette = "opus",
  values,
  variant = label ? "labeled" : "inline",
  width = 120,
}: SparklineProps) {
  const gradientId = useId();
  const { areaPath, endPoint, linePath } = buildSparklineGeometry(values, width, height);
  const resolvedVariant = variant === "labeled" || label ? "labeled" : "inline";

  const chart = (
    <svg
      aria-label={resolvedVariant === "labeled" && label ? label : undefined}
      aria-hidden={resolvedVariant === "labeled" && label ? undefined : true}
      className={styles.svg}
      height={height}
      role={resolvedVariant === "labeled" && label ? "img" : undefined}
      viewBox={`0 0 ${width} ${height}`}
      width={resolvedVariant === "labeled" ? "100%" : width}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {areaPath ? <path className={styles.area} d={areaPath} fill={`url(#${gradientId})`} /> : null}
      {linePath ? <path className={styles.line} d={linePath} /> : null}
      {endPoint ? <circle className={styles.endPoint} cx={endPoint.x} cy={endPoint.y} r="2.5" /> : null}
    </svg>
  );

  if (resolvedVariant === "inline") {
    return (
      <div className={styles.sparkline} data-palette={palette} data-variant="inline">
        {chart}
      </div>
    );
  }

  return (
    <figure className={styles.sparkline} data-palette={palette} data-variant="labeled">
      {label ? <figcaption className={styles.label}>{label}</figcaption> : null}
      <div className={styles.chart}>{chart}</div>
    </figure>
  );
}
