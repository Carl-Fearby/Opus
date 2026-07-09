"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  getDealsOverTimePalette,
  type DealsOverTimePalette,
} from "@/lib/controls/dealsOverTimePalettes";
import styles from "./DealsOverTime.module.css";

export type { DealsOverTimePalette };

export type DealsOverTimePoint = {
  label: string;
  tooltipLabel?: string;
  value: number;
};

export type DealsOverTimeProps = {
  className?: string;
  data: DealsOverTimePoint[];
  maxValue?: number;
  onPeriodChange?: (period: string) => void;
  palette?: DealsOverTimePalette;
  period?: string;
  periodOptions?: string[];
  title?: string;
  valueLabel?: string;
};

const CHART_HEIGHT = 188;
const CHART_MIN_WIDTH = 280;
const CHART_DEFAULT_WIDTH = 480;
const PLOT_LEFT = 50;
const PLOT_RIGHT = 12;
const DATA_INSET = 34;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 26;

type PlotPoint = { x: number; y: number };

function smoothPath(points: PlotPoint[]) {
  if (points.length < 2) {
    return "";
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlOffset = (point.x - previous.x) / 2;
    return `${path} C ${previous.x + controlOffset} ${previous.y}, ${point.x - controlOffset} ${point.y}, ${point.x} ${point.y}`;
  }, "");
}

function buildAreaPath(points: PlotPoint[], baselineY: number) {
  if (!points.length) {
    return "";
  }

  const line = smoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${line} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
}

function shouldShowXLabel(index: number, count: number) {
  if (count <= 8) {
    return true;
  }

  const step = Math.max(1, Math.round(count / 6));
  return index % step === 0 || index === count - 1;
}

function plotX(index: number, count: number, plotLeft: number, plotRight: number) {
  if (count <= 1) {
    return (plotLeft + plotRight) / 2;
  }

  const start = plotLeft + DATA_INSET;
  const span = plotRight - start;
  return start + (index / (count - 1)) * span;
}

function useChartWidth(minWidth = CHART_MIN_WIDTH, fallback = CHART_DEFAULT_WIDTH) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(fallback);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) {
      return;
    }

    const update = () => {
      const next = Math.max(minWidth, Math.floor(node.getBoundingClientRect().width));
      setChartWidth((current) => (current === next ? current : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [minWidth]);

  return { chartWidth, wrapRef };
}

function DealsOverTimeChart({
  data,
  maxValue,
  palette = "purple",
  valueLabel = "Deals",
}: {
  data: DealsOverTimePoint[];
  maxValue: number;
  palette?: DealsOverTimePalette;
  valueLabel?: string;
}) {
  const areaGradientId = useId();
  const areaMaskGradientId = useId();
  const areaMaskId = useId();
  const lineFadeGradientId = useId();
  const lineGlowSoftFilterId = useId();
  const lineGlowMidFilterId = useId();
  const pointGlowFilterId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { chartWidth, wrapRef } = useChartWidth();
  const colors = getDealsOverTimePalette(palette);

  const plotBottom = CHART_HEIGHT - PLOT_BOTTOM;
  const plotRight = chartWidth - PLOT_RIGHT;
  const plotHeight = plotBottom - PLOT_TOP;

  const yTicks = useMemo(() => {
    const step = 20;
    const ticks: number[] = [];
    for (let value = 0; value <= maxValue; value += step) {
      ticks.push(value);
    }
    if (ticks[ticks.length - 1] !== maxValue) {
      ticks.push(maxValue);
    }
    return ticks;
  }, [maxValue]);

  const points = useMemo(() => {
    if (!data.length) {
      return [] as Array<PlotPoint & { datum: DealsOverTimePoint }>;
    }

    return data.map((datum, index) => {
      const x = plotX(index, data.length, PLOT_LEFT, plotRight);
      const y = plotBottom - (datum.value / maxValue) * plotHeight;
      return { datum, x, y };
    });
  }, [chartWidth, data, maxValue, plotBottom, plotHeight, plotRight]);

  const renderPoints = useMemo(() => {
    if (!points.length) {
      return [] as Array<PlotPoint & { datum: DealsOverTimePoint; isAnchor?: boolean }>;
    }

    const origin = {
      datum: points[0].datum,
      isAnchor: true,
      x: PLOT_LEFT,
      y: plotBottom,
    };

    return [origin, ...points];
  }, [plotBottom, points]);

  const leadPath = points.length
    ? smoothPath([{ x: PLOT_LEFT, y: plotBottom }, points[0]])
    : "";
  const mainPath = smoothPath(points);
  const areaPath = buildAreaPath(renderPoints, plotBottom);
  const lineFadeStartX = PLOT_LEFT;
  const lineFadeEndX = points[0]?.x ?? PLOT_LEFT + DATA_INSET;
  const activePoint = activeIndex === null ? null : points[activeIndex];

  return (
    <div className={styles.chartWrap} data-palette={palette} ref={wrapRef}>
      <svg
        aria-label="Deals over time chart"
        className={styles.chart}
        height={CHART_HEIGHT}
        role="img"
        viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
        width={chartWidth}
      >
        <defs>
          <linearGradient id={areaGradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={colors.areaTop} stopOpacity="0.42" />
            <stop offset="55%" stopColor={colors.areaMid} stopOpacity="0.14" />
            <stop offset="100%" stopColor={colors.areaMid} stopOpacity="0" />
          </linearGradient>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={areaMaskGradientId}
            x1={lineFadeStartX}
            x2={lineFadeEndX}
            y1="0"
            y2="0"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>
          <mask id={areaMaskId}>
            <rect fill={`url(#${areaMaskGradientId})`} height={CHART_HEIGHT} width={chartWidth} x="0" y="0" />
          </mask>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id={lineFadeGradientId}
            x1={lineFadeStartX}
            x2={lineFadeEndX}
            y1="0"
            y2="0"
          >
            <stop offset="0%" stopColor={colors.lineFadeStart} stopOpacity="0" />
            <stop offset="100%" stopColor={colors.lineFadeEnd} stopOpacity="1" />
          </linearGradient>
          <filter height="400%" id={lineGlowSoftFilterId} width="400%" x="-150%" y="-150%">
            <feGaussianBlur in="SourceGraphic" result="blurWide" stdDeviation="13" />
            <feGaussianBlur in="SourceGraphic" result="blurTight" stdDeviation="5" />
            <feMerge>
              <feMergeNode in="blurWide" />
              <feMergeNode in="blurTight" />
            </feMerge>
          </filter>
          <filter height="300%" id={lineGlowMidFilterId} width="300%" x="-100%" y="-100%">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="4" />
            <feComponentTransfer in="blur" result="boost">
              <feFuncA intercept="-0.05" slope="1.6" type="linear" />
            </feComponentTransfer>
          </filter>
          <filter height="400%" id={pointGlowFilterId} width="400%" x="-150%" y="-150%">
            <feGaussianBlur in="SourceGraphic" result="blurWide" stdDeviation="10" />
            <feGaussianBlur in="SourceGraphic" result="blurTight" stdDeviation="3.5" />
            <feMerge>
              <feMergeNode in="blurWide" />
              <feMergeNode in="blurTight" />
            </feMerge>
          </filter>
        </defs>

        {yTicks.map((tick) => {
          const y = plotBottom - (tick / maxValue) * plotHeight;
          return (
            <g key={tick}>
              <line className={styles.gridLine} x1={PLOT_LEFT} x2={plotRight} y1={y} y2={y} />
              <text className={styles.axisLabel} textAnchor="end" x={PLOT_LEFT - 12} y={y + 3.5}>
                {tick}
              </text>
            </g>
          );
        })}

        {data.map((datum, index) => {
          if (!shouldShowXLabel(index, data.length)) {
            return null;
          }

          const x = plotX(index, data.length, PLOT_LEFT, plotRight);
          return (
            <text className={styles.axisLabel} key={`${datum.label}-${index}`} textAnchor="middle" x={x} y={CHART_HEIGHT - 7}>
              {datum.label}
            </text>
          );
        })}

        {areaPath ? (
          <path className={styles.area} d={areaPath} fill={`url(#${areaGradientId})`} mask={`url(#${areaMaskId})`} />
        ) : null}
        {leadPath ? (
          <path
            className={styles.lineGlowSoft}
            d={leadPath}
            filter={`url(#${lineGlowSoftFilterId})`}
            stroke={`url(#${lineFadeGradientId})`}
          />
        ) : null}
        {leadPath ? (
          <path
            className={styles.lineGlowMid}
            d={leadPath}
            filter={`url(#${lineGlowMidFilterId})`}
            stroke={`url(#${lineFadeGradientId})`}
          />
        ) : null}
        {leadPath ? <path className={styles.line} d={leadPath} stroke={`url(#${lineFadeGradientId})`} /> : null}
        {mainPath ? (
          <path
            className={styles.lineGlowSoft}
            d={mainPath}
            filter={`url(#${lineGlowSoftFilterId})`}
            stroke={colors.lineSoft}
          />
        ) : null}
        {mainPath ? (
          <path className={styles.lineGlowMid} d={mainPath} filter={`url(#${lineGlowMidFilterId})`} stroke={colors.lineMid} />
        ) : null}
        {mainPath ? <path className={styles.line} d={mainPath} stroke={colors.lineCore} /> : null}

        {points.map((point, index) => {
          const isLast = index === points.length - 1;
          const isActive = activeIndex === index;

          return (
          <g key={`${point.datum.label}-${index}`}>
            <circle
              className={styles.hitTarget}
              cx={point.x}
              cy={point.y}
              onBlur={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              r="10"
              tabIndex={0}
            />
            <circle
              className={styles.pointGlow}
              cx={point.x}
              cy={point.y}
              data-active={isActive ? "true" : "false"}
              fill={isActive ? colors.pointGlowActive : colors.pointGlow}
              filter={`url(#${pointGlowFilterId})`}
              r={isLast ? "5" : "3.5"}
            />
            {isLast ? (
              <circle
                className={styles.pointSolid}
                cx={point.x}
                cy={point.y}
                data-active={isActive ? "true" : "false"}
                fill={isActive ? colors.pointRingActive : colors.pointRing}
                r="4.5"
              />
            ) : (
              <>
                <circle
                  className={styles.pointRing}
                  cx={point.x}
                  cy={point.y}
                  data-active={isActive ? "true" : "false"}
                  r="4.5"
                  stroke={isActive ? colors.pointRingActive : colors.pointRing}
                />
                <circle
                  className={styles.pointCore}
                  cx={point.x}
                  cy={point.y}
                  data-active={isActive ? "true" : "false"}
                  fill={isActive ? colors.pointCoreActive : colors.pointCore}
                  r="2"
                />
              </>
            )}
          </g>
          );
        })}
      </svg>

      {activePoint ? (
        <div
          className={styles.tooltip}
          style={
            {
              "--tooltip-accent": colors.tooltipAccent,
              "--tooltip-x": `${activePoint.x}px`,
              "--tooltip-y": `${activePoint.y}px`,
            } as CSSProperties
          }
        >
          <span className={styles.tooltipDate}>
            {activePoint.datum.tooltipLabel ?? activePoint.datum.label}
          </span>
          <strong className={styles.tooltipValue}>
            {activePoint.datum.value} {valueLabel}
          </strong>
        </div>
      ) : null}
    </div>
  );
}

export function DealsOverTime({
  className,
  data,
  maxValue = 100,
  onPeriodChange,
  palette = "purple",
  period = "This Year",
  periodOptions = ["This Month", "Last Month", "This Quarter", "This Year"],
  title = "Deals Over Time",
  valueLabel = "Deals",
}: DealsOverTimeProps) {
  const periodId = useId();
  const resolvedMax = Math.max(1, maxValue);

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} data-palette={palette}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.period}>
          <label className={styles.periodLabel} htmlFor={periodId}>
            Period
          </label>
          <select
            className={styles.periodSelect}
            id={periodId}
            onChange={(event) => onPeriodChange?.(event.target.value)}
            value={period}
          >
            {periodOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </header>

      <DealsOverTimeChart data={data} maxValue={resolvedMax} palette={palette} valueLabel={valueLabel} />
    </div>
  );
}
