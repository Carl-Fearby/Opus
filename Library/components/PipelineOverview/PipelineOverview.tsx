"use client";

import { useId, useMemo, type CSSProperties } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./PipelineOverview.module.css";

export type PipelineStage = {
  displayValue: string;
  id: string;
  label: string;
  percentage: number;
  value: number;
};

export type PipelineOverviewProps = {
  className?: string;
  onPeriodChange?: (period: string) => void;
  period?: string;
  periodOptions?: string[];
  stages: PipelineStage[];
  totalLabel?: string;
  totalValue: string;
};

const STAGE_STYLES = [
  {
    border: "#9da8fb",
    borderOpacity: 0.4,
    glow: "#5b5bd6",
    dot: "#7c72f0",
    gradientStops: ["#5b3fd4", "#3f46c9"],
  },
  {
    border: "#8b9cf8",
    borderOpacity: 0.38,
    glow: "#4f46e5",
    dot: "#6366f1",
    gradientStops: ["#4f46e5", "#312e81"],
  },
  {
    border: "#7eb8ff",
    borderOpacity: 0.38,
    glow: "#3b82f6",
    dot: "#3b82f6",
    gradientStops: ["#2563eb", "#1e40af"],
  },
  {
    border: "#5eead4",
    borderOpacity: 0.35,
    glow: "#22d3ee",
    dot: "#22d3ee",
    gradientStops: ["#0891b2", "#0e7490"],
  },
  {
    border: "#6ee7a0",
    borderOpacity: 0.35,
    glow: "#4ade80",
    dot: "#4ade80",
    gradientStops: ["#22c55e", "#15803d"],
  },
] as const;

const FUNNEL_VIEW_WIDTH = 240;
const FUNNEL_VIEW_HEIGHT = 168;
const FUNNEL_CENTER_X = 120;
const FUNNEL_MAX_WIDTH = 204;
const FUNNEL_MIN_SCALE = 0.12;
const SEGMENT_GAP = 4;
const DEFAULT_CORNER_RADIUS = 3;
const FUNNEL_TOP_CORNER_RADIUS = 5;
const FUNNEL_BOTTOM_CORNER_RADIUS = 5;
const STROKE_WIDTH = 0.85;
const EDGE_TRIM_LIMIT = 0.42;

type Point = { x: number; y: number };

type VertexGeometry = {
  angle: number;
  len1: number;
  len2: number;
  ux1: number;
  uy1: number;
  ux2: number;
  uy2: number;
};

function vertexGeometry(prev: Point, corner: Point, next: Point): VertexGeometry {
  const dx1 = corner.x - prev.x;
  const dy1 = corner.y - prev.y;
  const len1 = Math.hypot(dx1, dy1) || 1;
  const dx2 = next.x - corner.x;
  const dy2 = next.y - corner.y;
  const len2 = Math.hypot(dx2, dy2) || 1;
  const ux1 = dx1 / len1;
  const uy1 = dy1 / len1;
  const ux2 = dx2 / len2;
  const uy2 = dy2 / len2;
  const dot = Math.max(-1, Math.min(1, -ux1 * ux2 - uy1 * uy2));
  const angle = Math.acos(dot);

  return { angle, len1, len2, ux1, uy1, ux2, uy2 };
}

function maxRadiusAtVertex(prev: Point, corner: Point, next: Point, desiredRadius: number) {
  const { angle, len1, len2 } = vertexGeometry(prev, corner, next);
  if (angle < 0.01) {
    return desiredRadius;
  }

  const halfTan = Math.tan(angle / 2);
  return Math.min(desiredRadius, len1 * EDGE_TRIM_LIMIT * halfTan, len2 * EDGE_TRIM_LIMIT * halfTan);
}

function filletVertex(prev: Point, corner: Point, next: Point, radius: number) {
  const { angle, len1, len2, ux1, uy1, ux2, uy2 } = vertexGeometry(prev, corner, next);
  if (angle < 0.01) {
    return {
      control: corner,
      end: corner,
      start: corner,
      trim: 0,
    };
  }

  const trim = Math.min(radius / Math.tan(angle / 2), len1 * EDGE_TRIM_LIMIT, len2 * EDGE_TRIM_LIMIT);

  return {
    control: corner,
    end: { x: corner.x + ux2 * trim, y: corner.y + uy2 * trim },
    start: { x: corner.x - ux1 * trim, y: corner.y - uy1 * trim },
    trim,
  };
}

function clampCornerRadius(prev: Point, corner: Point, next: Point, desiredRadius: number) {
  return maxRadiusAtVertex(prev, corner, next, desiredRadius);
}

function roundedTrapezoidPath({
  bottomLeft,
  bottomRight,
  cornerRadii,
  height,
  topLeft,
  topRight,
  y,
}: {
  bottomLeft: number;
  bottomRight: number;
  cornerRadii: {
    bottomLeft: number;
    bottomRight: number;
    topLeft: number;
    topRight: number;
  };
  height: number;
  topLeft: number;
  topRight: number;
  y: number;
}) {
  const topLeftPoint = { x: topLeft, y };
  const topRightPoint = { x: topRight, y };
  const bottomRightPoint = { x: bottomRight, y: y + height };
  const bottomLeftPoint = { x: bottomLeft, y: y + height };

  const topLeftRadius = clampCornerRadius(bottomLeftPoint, topLeftPoint, topRightPoint, cornerRadii.topLeft);
  const topRightRadius = clampCornerRadius(topLeftPoint, topRightPoint, bottomRightPoint, cornerRadii.topRight);
  const bottomRightRadius = clampCornerRadius(topRightPoint, bottomRightPoint, bottomLeftPoint, cornerRadii.bottomRight);
  const bottomLeftRadius = clampCornerRadius(bottomRightPoint, bottomLeftPoint, topLeftPoint, cornerRadii.bottomLeft);

  if (
    topLeftRadius <= 0.25 &&
    topRightRadius <= 0.25 &&
    bottomRightRadius <= 0.25 &&
    bottomLeftRadius <= 0.25
  ) {
    return `M ${topLeft} ${y} L ${topRight} ${y} L ${bottomRight} ${y + height} L ${bottomLeft} ${y + height} Z`;
  }

  const topLeftFillet = filletVertex(bottomLeftPoint, topLeftPoint, topRightPoint, topLeftRadius);
  const topRightFillet = filletVertex(topLeftPoint, topRightPoint, bottomRightPoint, topRightRadius);
  const bottomRightFillet = filletVertex(topRightPoint, bottomRightPoint, bottomLeftPoint, bottomRightRadius);
  const bottomLeftFillet = filletVertex(bottomRightPoint, bottomLeftPoint, topLeftPoint, bottomLeftRadius);

  return [
    `M ${topLeftFillet.start.x} ${topLeftFillet.start.y}`,
    `Q ${topLeftFillet.control.x} ${topLeftFillet.control.y} ${topLeftFillet.end.x} ${topLeftFillet.end.y}`,
    `L ${topRightFillet.start.x} ${topRightFillet.start.y}`,
    `Q ${topRightFillet.control.x} ${topRightFillet.control.y} ${topRightFillet.end.x} ${topRightFillet.end.y}`,
    `L ${bottomRightFillet.start.x} ${bottomRightFillet.start.y}`,
    `Q ${bottomRightFillet.control.x} ${bottomRightFillet.control.y} ${bottomRightFillet.end.x} ${bottomRightFillet.end.y}`,
    `L ${bottomLeftFillet.start.x} ${bottomLeftFillet.start.y}`,
    `Q ${bottomLeftFillet.control.x} ${bottomLeftFillet.control.y} ${bottomLeftFillet.end.x} ${bottomLeftFillet.end.y}`,
    "Z",
  ].join(" ");
}

function funnelWidthForValue(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return FUNNEL_MAX_WIDTH * FUNNEL_MIN_SCALE;
  }
  const scale = value / maxValue;
  return Math.max(FUNNEL_MAX_WIDTH * FUNNEL_MIN_SCALE, FUNNEL_MAX_WIDTH * scale);
}

function FunnelChart({ stages }: { stages: PipelineStage[] }) {
  const baseId = useId().replace(/:/g, "");
  const stageCount = stages.length;
  const segmentHeight = (FUNNEL_VIEW_HEIGHT - SEGMENT_GAP * (stageCount - 1)) / stageCount;
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  const segments = useMemo(() => {
    return stages.map((stage, index) => {
      const next = stages[index + 1];
      const topWidth = funnelWidthForValue(stage.value, maxValue);
      const bottomWidth = next
        ? funnelWidthForValue(next.value, maxValue)
        : Math.max(topWidth * 0.76, FUNNEL_MAX_WIDTH * FUNNEL_MIN_SCALE);
      const y = index * (segmentHeight + SEGMENT_GAP);
      const topLeft = FUNNEL_CENTER_X - topWidth / 2;
      const topRight = FUNNEL_CENTER_X + topWidth / 2;
      const bottomLeft = FUNNEL_CENTER_X - bottomWidth / 2;
      const bottomRight = FUNNEL_CENTER_X + bottomWidth / 2;

      const baseRadius = DEFAULT_CORNER_RADIUS;
      const isFirst = index === 0;
      const isLast = index === stageCount - 1;

      return {
        d: roundedTrapezoidPath({
          bottomLeft,
          bottomRight,
          cornerRadii: {
            bottomLeft: isLast ? FUNNEL_BOTTOM_CORNER_RADIUS : baseRadius,
            bottomRight: isLast ? FUNNEL_BOTTOM_CORNER_RADIUS : baseRadius,
            topLeft: isFirst ? FUNNEL_TOP_CORNER_RADIUS : baseRadius,
            topRight: isFirst ? FUNNEL_TOP_CORNER_RADIUS : baseRadius,
          },
          height: segmentHeight,
          topLeft,
          topRight,
          y,
        }),
        index,
        style: STAGE_STYLES[index % STAGE_STYLES.length],
      };
    });
  }, [maxValue, segmentHeight, stageCount, stages]);

  return (
    <svg
      aria-hidden="true"
      className={styles.funnelSvg}
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${FUNNEL_VIEW_WIDTH} ${FUNNEL_VIEW_HEIGHT}`}
    >
      <defs>
        {segments.map((segment) => (
          <linearGradient
            gradientUnits="objectBoundingBox"
            id={`${baseId}-gradient-${segment.index}`}
            key={segment.index}
            x1="0"
            x2="1"
            y1="0.5"
            y2="0.5"
          >
            <stop offset="0%" stopColor={segment.style.gradientStops[0]} />
            <stop offset="100%" stopColor={segment.style.gradientStops[1]} />
          </linearGradient>
        ))}
        {segments.map((segment) => (
          <filter
            height="220%"
            id={`${baseId}-glow-${segment.index}`}
            key={`glow-${segment.index}`}
            width="220%"
            x="-60%"
            y="-60%"
          >
            <feDropShadow dx="0" dy="0" floodColor={segment.style.glow} floodOpacity="0.42" stdDeviation="2.5" />
            <feDropShadow dx="0" dy="0" floodColor={segment.style.glow} floodOpacity="0.2" stdDeviation="5" />
          </filter>
        ))}
      </defs>
      {segments.map((segment) => (
        <path
          d={segment.d}
          fill={`url(#${baseId}-gradient-${segment.index})`}
          filter={`url(#${baseId}-glow-${segment.index})`}
          key={segment.index}
          stroke={segment.style.border}
          strokeLinejoin="round"
          strokeOpacity={segment.style.borderOpacity}
          strokeWidth={STROKE_WIDTH}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function PipelineOverview({
  className,
  onPeriodChange,
  period = "This Month",
  periodOptions = ["This Month", "Last Month", "This Quarter", "This Year"],
  stages,
  totalLabel = "Total Pipeline Value",
  totalValue,
}: PipelineOverviewProps) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <div className={styles.body} style={{ gridTemplateRows: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        <div className={styles.funnel} style={{ gridRow: `1 / ${stages.length + 1}` }}>
          <FunnelChart stages={stages} />
        </div>

        <ol className={styles.legend}>
          {stages.map((stage, index) => {
            const tone = STAGE_STYLES[index % STAGE_STYLES.length];
            const dotStyle = {
              "--stage-dot": tone.dot,
              "--stage-glow": tone.glow,
            } as CSSProperties;

            return (
              <li className={styles.legendItem} key={stage.id} style={{ gridRow: index + 1 }}>
                <span className={styles.legendDot} style={dotStyle} />
                <div className={styles.legendCopy}>
                  <span className={styles.legendLabel}>{stage.label}</span>
                  <span className={styles.legendValue}>
                    {stage.displayValue} ({stage.percentage}%)
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <footer className={styles.footer}>
        <div className={styles.total}>
          <span className={styles.totalLabel}>{totalLabel}</span>
          <strong className={styles.totalValue}>{totalValue}</strong>
        </div>

        <label className={styles.period}>
          <span className={styles.periodLabel}>Period</span>
          <select
            className={styles.periodSelect}
            onChange={(event) => onPeriodChange?.(event.target.value)}
            value={period}
          >
            {periodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className={styles.periodChevron}>
            <CatalogIcon iconName="chevron-down" />
          </span>
        </label>
      </footer>
    </div>
  );
}
