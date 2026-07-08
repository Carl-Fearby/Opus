"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { ChartPalette, ChartVariant } from "@/components/fields/types";
import { chartDemoData, chartDemoSeries } from "@/lib/controls/chartDemoData";
import {
  CalendarHeatmapAxisLabels,
  GanttRowLabels,
  HeatmapAxisLabels,
  isSpecializedChartVariant,
  SpecializedChart,
  cartesianSpecializedVariants,
  specializedVariantHasXCategoryLabels,
  specializedVariantHasYNumericAxis,
  specializedVariantUsesSlotLabels,
  xForTimelineIndex,
  timelineEndpointInset,
  getCandlestickBarHalfWidth,
  getHistogramBarHalfWidth,
  getBoxPlotBarHalfWidth,
  getViolinBarHalfWidth,
  xForEdgeBarIndex,
} from "@/components/Chart/SpecializedCharts";
import styles from "./Chart.module.css";

export type ChartDatum = {
  region?: string;
  lat?: number;
  lng?: number;
  close?: number;
  end?: number;
  /** Error / uncertainty magnitude used by error-bar charts when high/low are omitted. */
  error?: number;
  group?: string;
  high?: number;
  label: string;
  low?: number;
  max?: number;
  median?: number;
  min?: number;
  open?: number;
  parent?: string;
  q1?: number;
  q3?: number;
  start?: number;
  /** Target value for bullet charts. */
  target?: number;
  value: number;
  values?: number[];
  x?: number;
  y?: number;
};

export type ChartSeries = {
  id: string;
  label: string;
  values: number[];
};

type ChartProps = {
  data?: ChartDatum[];
  height?: number;
  highlightLabel?: string;
  maximise?: boolean;
  palette?: ChartPalette;
  series?: ChartSeries[];
  showAxis?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  title?: string;
  variant: ChartVariant;
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const cartesianVariants: ChartVariant[] = [
  "bar-vertical",
  "bar-horizontal",
  "grouped-bar",
  "stacked-bar",
  "stacked-bar-100",
  "line",
  "multi-line",
  "area",
  "stacked-area",
  "spline",
  "scatter",
  "bubble",
];

function computeYTicks(max: number, steps = 5) {
  const safeMax = Math.max(1, max);
  return Array.from({ length: steps }, (_, index) =>
    Math.round((safeMax * index) / (steps - 1)),
  );
}

function yForValue(value: number, max: number, plot: PlotArea) {
  return plot.bottom - (value / Math.max(1, max)) * (plot.bottom - plot.top);
}

function plotSpan(plot: PlotArea) {
  return plot.bottom - plot.top;
}

function resolvePlot(
  basePlot: PlotArea,
  { denseXLabels, showAxis, variant }: { denseXLabels: boolean; showAxis: boolean; variant?: ChartVariant },
): PlotArea {
  if (variant === "choropleth" || variant === "geo-map" || variant === "bubble-map") {
    const gridLeft = 8;
    const gridRight = Math.max(basePlot.gridRight, basePlot.right) - 4;
    return {
      ...basePlot,
      bottom: 246,
      gridLeft,
      gridRight,
      left: gridLeft,
      right: gridRight,
      top: 14,
    };
  }

  if ((variant === "heatmap" || variant === "calendar-heatmap") && showAxis) {
    const rowLabelGutter = 32;
    const colLabelGutter = 12;

    return {
      ...basePlot,
      gridLeft: basePlot.gridLeft + rowLabelGutter,
      left: basePlot.gridLeft + rowLabelGutter,
      top: basePlot.top + colLabelGutter,
    };
  }

  if (variant === "gantt") {
    const rowLabelGutter = 72;
    const trackLeft = basePlot.gridLeft + rowLabelGutter;

    if (!showAxis) {
      return {
        ...basePlot,
        gridLeft: trackLeft,
        left: trackLeft,
      };
    }

    return {
      ...basePlot,
      barStart: basePlot.barStart + rowLabelGutter,
      bottom: denseXLabels ? 178 : 190,
      gridLeft: trackLeft,
      left: trackLeft,
      top: 20,
    };
  }

  if (!showAxis) {
    return basePlot;
  }

  const pad = 30;

  return {
    ...basePlot,
    barStart: basePlot.barStart + pad,
    bottom: denseXLabels ? 178 : 190,
    gridLeft: basePlot.gridLeft + pad,
    horizontalLabelX: basePlot.horizontalLabelX + pad,
    left: basePlot.left + pad,
    top: 20,
  };
}

function categoryLabelY(plotBottom: number, rotate: boolean, showAxis: boolean) {
  if (!showAxis) {
    return rotate ? 228 : 236;
  }

  return plotBottom + (rotate ? 12 : 20);
}

function xAxisTitleY(plotBottom: number, showAxis: boolean, dense: boolean) {
  if (!showAxis) {
    return 248;
  }

  return plotBottom + (dense ? 52 : 46);
}

function getDenseChartMinWidth(variant: ChartVariant, count: number) {
  const slotVariants = [
    "bar-vertical",
    "grouped-bar",
    "stacked-bar",
    "stacked-bar-100",
    "histogram",
    "candlestick",
    "box-plot",
    "violin",
    "waterfall",
  ];

  if (!slotVariants.includes(variant)) {
    return 376;
  }

  const slot = variant === "bar-vertical" ? 12 : 18;
  return Math.max(376, 92 + count * slot);
}

function shouldShowCategoryLabel(index: number, count: number) {
  if (count <= 12) {
    return true;
  }

  const step = Math.max(1, Math.ceil(count / 12));
  return index % step === 0 || index === count - 1;
}

function verticalBarMetrics(
  plot: PlotArea,
  count: number,
  bounds?: { left: number; right: number },
) {
  const left = bounds?.left ?? plot.gridLeft;
  const right = bounds?.right ?? plot.gridRight;
  const slotWidth = count > 0 ? (right - left) / count : right - left;
  const barWidth = Math.min(28, Math.max(4, slotWidth * 0.72));

  return {
    barWidth,
    xCenter: (index: number) => left + slotWidth * index + slotWidth / 2,
  };
}

function horizontalBarMetrics(plot: PlotArea, count: number) {
  const slotHeight = plotSpan(plot) / Math.max(count, 1);
  const barHeight = Math.min(22, Math.max(10, slotHeight * 0.62));
  const trackWidth = plot.gridRight - plot.gridLeft;

  return {
    barHeight,
    barY: (index: number) => plot.top + index * slotHeight + (slotHeight - barHeight) / 2,
    labelY: (index: number) => plot.top + index * slotHeight + slotHeight / 2 + 4,
    trackWidth,
  };
}

const paletteClasses = ["seriesA", "seriesB", "seriesC", "seriesD", "seriesE", "seriesF"] as const;
const maximisePlotVariants: ChartVariant[] = [
  "bar-vertical",
  "bar-horizontal",
  "grouped-bar",
  "stacked-bar",
  "stacked-bar-100",
  "line",
  "multi-line",
  "area",
  "stacked-area",
  "spline",
  "scatter",
  "bubble",
  ...cartesianSpecializedVariants,
];

function isCartesianVariant(variant: ChartVariant) {
  return cartesianVariants.includes(variant) || cartesianSpecializedVariants.includes(variant);
}
type PlotArea = {
  barStart: number;
  bottom: number;
  gridLeft: number;
  gridRight: number;
  horizontalLabelX: number;
  horizontalMaxWidth: number;
  left: number;
  right: number;
  scatterLeft: number;
  scatterWidth: number;
  top: number;
};

const defaultPlot: PlotArea = {
  barStart: 84,
  bottom: 204,
  gridLeft: 46,
  gridRight: 330,
  horizontalLabelX: 70,
  horizontalMaxWidth: 258,
  left: 46,
  right: 330,
  scatterLeft: 46,
  scatterWidth: 284,
  top: 54,
};

const widePlot: PlotArea = {
  ...defaultPlot,
  barStart: 84,
  gridLeft: 46,
  gridRight: 330,
  horizontalLabelX: 70,
  horizontalMaxWidth: 258,
  left: 46,
  right: 330,
  scatterLeft: 46,
  scatterWidth: 284,
};

function getWidePlot(viewBoxWidth: number): PlotArea {
  const rightPad = 46;
  const horizontalLabelX = 70;
  const barStart = 84;
  const gridLeft = defaultPlot.gridLeft;
  const gridRight = Math.max(defaultPlot.gridRight, viewBoxWidth - rightPad);

  return {
    ...widePlot,
    barStart,
    gridLeft,
    gridRight,
    horizontalLabelX,
    horizontalMaxWidth: Math.max(defaultPlot.horizontalMaxWidth, viewBoxWidth - barStart - rightPad - 18),
    left: gridLeft,
    right: gridRight,
    scatterLeft: gridLeft,
    scatterWidth: gridRight - gridLeft,
  };
}

function yForDomain(value: number, min: number, max: number, plot: PlotArea) {
  const span = Math.max(1, max - min);
  return plot.bottom - ((value - min) / span) * plotSpan(plot);
}

function computeDomainTicks(min: number, max: number, steps = 5) {
  const span = Math.max(1, max - min);
  return Array.from({ length: steps }, (_, index) => Math.round(min + (span * index) / (steps - 1)));
}

function getWaterfallDomain(data: ChartDatum[]) {
  let running = 0;
  let min = 0;
  let max = 0;

  for (const item of data) {
    const start = running;
    running += item.value;
    min = Math.min(min, start, running);
    max = Math.max(max, start, running);
  }

  const pad = Math.max(0, (max - min) * 0.02);
  return { min: min - pad, max: max + pad };
}

function getChartYDomain(variant: ChartVariant, data: ChartDatum[], series: ChartSeries[], fallbackMax: number) {
  if (variant === "candlestick" || variant === "ohlc") {
    const lows = data.map((item) => item.low ?? item.value * 0.82);
    const highs = data.map((item) => item.high ?? item.value * 1.08);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = Math.max(0, (max - min) * 0.04);
    return { min: min - pad, max: max + pad };
  }

  if (variant === "range-area" || variant === "range-bar") {
    const lows = data.map((item) => item.low ?? item.min ?? item.value * 0.75);
    const highs = data.map((item) => item.high ?? item.max ?? item.value * 1.25);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = Math.max(0, (max - min) * 0.06);
    return { min: Math.max(0, min - pad), max: max + pad };
  }

  if (variant === "error-bar") {
    const lows = data.map((item) => {
      const error = item.error ?? item.value * 0.12;
      return (item.low ?? item.value) - (item.low == null ? error : 0);
    });
    const highs = data.map((item) => {
      const error = item.error ?? item.value * 0.12;
      return (item.high ?? item.value) + (item.high == null ? error : 0);
    });
    const min = Math.min(0, ...lows);
    const max = Math.max(...highs);
    return { min, max: max * 1.08 };
  }

  if (variant === "bullet") {
    const highs = data.map((item) => Math.max(item.value, item.target ?? item.value, item.max ?? item.value));
    return { min: 0, max: Math.max(1, ...highs) * 1.08 };
  }

  if (variant === "pareto") {
    return { min: 0, max: Math.max(1, ...data.map((item) => item.value)) * 1.08 };
  }

  if (variant === "box-plot") {
    const lows = data.map((item) => item.min ?? item.value * 0.6);
    const highs = data.map((item) => item.max ?? item.value * 1.35);
    return { min: Math.min(...lows), max: Math.max(...highs) };
  }

  if (variant === "histogram" || variant === "violin") {
    return { min: 0, max: Math.max(1, ...data.map((item) => item.value)) };
  }

  if (variant === "density") {
    return { min: 0, max: Math.max(1, ...series.flatMap((item) => item.values)) };
  }

  if (variant === "waterfall") {
    return getWaterfallDomain(data);
  }

  if (variant === "stream") {
    return { min: 0, max: stackedSeriesMax(series) };
  }

  if (variant === "gantt") {
    return { min: 0, max: 100 };
  }

  return { min: 0, max: fallbackMax };
}

function maxValue(data: ChartDatum[], series: ChartSeries[]) {
  return Math.max(
    1,
    ...data.map((item) => item.value),
    ...data.flatMap((item) => item.values ?? []),
    ...series.flatMap((item) => item.values),
  );
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function ringPath(cx: number, cy: number, outerRadius: number, innerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polarPoint(cx, cy, outerRadius, startAngle);
  const outerEnd = polarPoint(cx, cy, outerRadius, endAngle);
  const innerStart = polarPoint(cx, cy, innerRadius, endAngle);
  const innerEnd = polarPoint(cx, cy, innerRadius, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    "Z",
  ].join(" ");
}

function smoothPath(points: { x: number; y: number }[]) {
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

function chartClass(index: number) {
  return styles[paletteClasses[index % paletteClasses.length]];
}

function xForIndex(plot: PlotArea, index: number, count: number) {
  if (count <= 1) {
    return (plot.gridLeft + plot.gridRight) / 2;
  }

  const slotWidth = (plot.gridRight - plot.gridLeft) / count;
  return plot.gridLeft + slotWidth * index + slotWidth / 2;
}

function xForLineIndex(plot: PlotArea, index: number, count: number) {
  if (count <= 1) {
    return (plot.gridLeft + plot.gridRight) / 2;
  }

  return plot.gridLeft + index * ((plot.gridRight - plot.gridLeft) / (count - 1));
}

function Grid({ max, min = 0, plot, show, useDomain = false }: { max?: number; min?: number; plot: PlotArea; show: boolean; useDomain?: boolean }) {
  if (!show) {
    return null;
  }

  const yPositions = max
    ? (useDomain ? computeDomainTicks(min, max) : computeYTicks(max)).map((tick) =>
        useDomain ? yForDomain(tick, min, max, plot) : yForValue(tick, max, plot),
      )
    : [0, 1, 2, 3].map((item) => plot.top + item * 44);

  return (
    <g className={styles.grid}>
      {yPositions.map((y, index) => (
        <line key={index} x1={plot.gridLeft} x2={plot.gridRight} y1={y} y2={y} />
      ))}
    </g>
  );
}

function RadialGrid({ show }: { show: boolean }) {
  if (!show) {
    return null;
  }

  return (
    <g className={styles.grid}>
      {[34, 58, 82].map((radius) => (
        <circle cx="188" cy="126" fill="none" key={radius} r={radius} />
      ))}
      {[0, 1, 2, 3].map((item) => {
        const point = polarPoint(188, 126, 88, -Math.PI / 2 + item * (Math.PI / 2));
        return <line key={item} x1="188" x2={point.x} y1="126" y2={point.y} />;
      })}
    </g>
  );
}

function AxisLabels({
  dense,
  edgeAligned = false,
  labels,
  plot,
  showAxis,
  slotBounds,
  slotCentered = false,
  timeline = false,
  edgeBarHalfWidth,
}: {
  dense?: boolean;
  edgeAligned?: boolean;
  labels: string[];
  plot: PlotArea;
  showAxis?: boolean;
  slotBounds?: { left: number; right: number };
  slotCentered?: boolean;
  timeline?: boolean;
  edgeBarHalfWidth?: number;
}) {
  const rotate = labels.length > 18;
  const slotMetrics = slotCentered ? verticalBarMetrics(plot, labels.length, slotBounds) : null;

  return (
    <g className={styles.axisLabels}>
      {labels.map((label, index) => {
        if (dense && !shouldShowCategoryLabel(index, labels.length)) {
          return null;
        }

        const x = edgeBarHalfWidth !== undefined
          ? xForEdgeBarIndex(plot, index, labels.length, edgeBarHalfWidth)
          : timeline
            ? xForTimelineIndex(plot, index, labels.length)
            : slotMetrics
              ? slotMetrics.xCenter(index)
              : edgeAligned
                ? xForLineIndex(plot, index, labels.length)
                : xForIndex(plot, index, labels.length);
        const y = categoryLabelY(plot.bottom, rotate, Boolean(showAxis));

        return (
          <text
            key={`${label}-${index}`}
            textAnchor={rotate ? "end" : "middle"}
            transform={rotate ? `rotate(-40 ${x} ${y})` : undefined}
            x={x}
            y={y}
          >
            {label}
          </text>
        );
      })}
    </g>
  );
}

function CartesianAxes({
  denseXLabels,
  horizontal,
  max,
  min = 0,
  plot,
  show,
  useDomain = false,
  variant,
  xAxisLabel,
  yAxisLabel,
}: {
  denseXLabels?: boolean;
  horizontal?: boolean;
  max: number;
  min?: number;
  plot: PlotArea;
  show: boolean;
  useDomain?: boolean;
  variant: ChartVariant;
  xAxisLabel?: string;
  yAxisLabel?: string;
}) {
  if (!show || !isCartesianVariant(variant)) {
    return null;
  }

  const ticks = useDomain ? computeDomainTicks(min, max) : computeYTicks(max);
  const xCenter = (plot.gridLeft + plot.gridRight) / 2;
  const plotWidth = plot.gridRight - plot.gridLeft;

  if (variant === "gantt") {
    return (
      <g className={styles.axes}>
        <line className={styles.axisLine} x1={plot.gridLeft} x2={plot.gridRight} y1={plot.bottom} y2={plot.bottom} />
        <line className={styles.axisLine} x1={plot.gridLeft} x2={plot.gridLeft} y1={plot.top} y2={plot.bottom} />
        {ticks.map((tick) => {
          const x = plot.gridLeft + (tick / Math.max(1, max)) * plotWidth;
          return (
            <text className={styles.axisTick} key={tick} textAnchor="middle" x={x} y={plot.bottom + 14}>
              {tick}
            </text>
          );
        })}
        {xAxisLabel ? (
          <text className={styles.axisTitle} textAnchor="middle" x={xCenter} y={xAxisTitleY(plot.bottom, true, Boolean(denseXLabels))}>
            {xAxisLabel}
          </text>
        ) : null}
      </g>
    );
  }

  const showYNumericAxis = !["timeline", "milestone-timeline"].includes(variant) && specializedVariantHasYNumericAxis(variant);

  if (horizontal) {
    const plotWidth = plot.gridRight - plot.gridLeft;
    return (
      <g className={styles.axes}>
        <line className={styles.axisLine} x1={plot.gridLeft} x2={plot.gridRight} y1={plot.bottom} y2={plot.bottom} />
        <line className={styles.axisLine} x1={plot.gridLeft} x2={plot.gridLeft} y1={plot.top} y2={plot.bottom} />
        {ticks.map((tick) => {
          const x = plot.gridLeft + (tick / Math.max(1, max)) * plotWidth;
          return (
            <text className={styles.axisTick} key={tick} textAnchor="middle" x={x} y={plot.bottom + 14}>
              {tick}
            </text>
          );
        })}
        {xAxisLabel ? (
          <text className={styles.axisTitle} textAnchor="middle" x={xCenter} y={plot.bottom + 28}>
            {xAxisLabel}
          </text>
        ) : null}
        {yAxisLabel ? (
          <text
            className={styles.axisTitle}
            textAnchor="middle"
            transform={`rotate(-90 16 ${(plot.top + plot.bottom) / 2})`}
            x={16}
            y={(plot.top + plot.bottom) / 2}
          >
            {yAxisLabel}
          </text>
        ) : null}
      </g>
    );
  }

  return (
    <g className={styles.axes}>
      <line className={styles.axisLine} x1={plot.gridLeft} x2={plot.gridRight} y1={plot.bottom} y2={plot.bottom} />
      <line className={styles.axisLine} x1={plot.gridLeft} x2={plot.gridLeft} y1={plot.top} y2={plot.bottom} />
      {showYNumericAxis
        ? ticks.map((tick) => {
            const y = useDomain ? yForDomain(tick, min, max, plot) : yForValue(tick, max, plot);
            return (
              <text className={styles.axisTick} key={tick} textAnchor="end" x={plot.gridLeft - 6} y={y + 3}>
                {tick}
              </text>
            );
          })
        : null}
      {xAxisLabel ? (
        <text className={styles.axisTitle} textAnchor="middle" x={xCenter} y={xAxisTitleY(plot.bottom, true, Boolean(denseXLabels))}>
          {xAxisLabel}
        </text>
      ) : null}
      {yAxisLabel ? (
        <text
          className={styles.axisTitle}
          textAnchor="middle"
          transform={`rotate(-90 12 ${(plot.top + plot.bottom) / 2})`}
          x={12}
          y={(plot.top + plot.bottom) / 2}
        >
          {yAxisLabel}
        </text>
      ) : null}
    </g>
  );
}

function Bars({
  data,
  highlightLabel,
  horizontal,
  max,
  plot,
  showAxis = false,
  showValues,
}: {
  data: ChartDatum[];
  highlightLabel?: string;
  horizontal?: boolean;
  max: number;
  plot: PlotArea;
  showAxis?: boolean;
  showValues: boolean;
}) {
  if (horizontal) {
    const { barHeight, barY, labelY, trackWidth } = horizontalBarMetrics(plot, data.length);

    return (
      <g>
        {data.map((item, index) => {
          const width = (item.value / max) * trackWidth;
          const y = barY(index);
          return (
            <g key={item.label}>
              <text className={styles.axisLabels} textAnchor="end" x={plot.gridLeft - 8} y={labelY(index)}>
                {item.label}
              </text>
              <rect className={`${styles.bar} ${chartClass(index)}`} height={barHeight} rx="4" width={width} x={plot.gridLeft} y={y} />
              {showValues ? (
                <text className={styles.valueLabel} x={plot.gridLeft + width + 6} y={labelY(index)}>
                  {item.value}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <g>
      {data.map((item, index) => {
        const height = (item.value / max) * plotSpan(plot);
        const { barWidth, xCenter } = verticalBarMetrics(plot, data.length);
        const x = xCenter(index) - barWidth / 2;
        const y = plot.bottom - height;
        const highlighted = highlightLabel ? item.label === highlightLabel : false;

        return (
          <g key={`${item.label}-${index}`}>
            <rect
              className={`${styles.bar} ${chartClass(index)}`}
              data-highlighted={highlighted ? "true" : "false"}
              height={height}
              rx="2"
              ry="2"
              width={barWidth}
              x={x}
              y={y}
            />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={xCenter(index)} y={y - 8}>
                {item.value}
              </text>
            ) : null}
          </g>
        );
      })}
      <AxisLabels
        dense={data.length > 18}
        labels={data.map((item) => item.label)}
        plot={plot}
        showAxis={showAxis}
        slotCentered
      />
    </g>
  );
}

function GroupedBars({
  data,
  max,
  plot,
  showAxis = false,
  showValues,
}: {
  data: ChartDatum[];
  max: number;
  plot: PlotArea;
  showAxis?: boolean;
  showValues: boolean;
}) {
  const { xCenter } = verticalBarMetrics(plot, data.length);

  return (
    <g>
      {data.map((item, index) => {
        const values = item.values ?? [];
        const groupWidth = values.length * 8 + Math.max(values.length - 1, 0) * 3;
        const groupStart = xCenter(index) - groupWidth / 2;
        return values.map((value, valueIndex) => {
          const height = (value / max) * plotSpan(plot);
          const x = groupStart + valueIndex * 11;
          const y = plot.bottom - height;
          return (
            <g key={`${item.label}-${valueIndex}`}>
              <rect className={`${styles.bar} ${chartClass(valueIndex)}`} height={height} rx="3" width="8" x={x} y={y} />
              {showValues && valueIndex === 0 ? (
                <text className={styles.valueLabel} textAnchor="middle" x={x + 4} y={y - 8}>
                  {value}
                </text>
              ) : null}
            </g>
          );
        });
      })}
      <AxisLabels
        dense={data.length > 18}
        labels={data.map((item) => item.label)}
        plot={plot}
        showAxis={showAxis}
        slotCentered
      />
    </g>
  );
}

function stackedBarShape(
  x: number,
  y: number,
  width: number,
  height: number,
  topRadius: number,
  bottomRadius: number,
) {
  if (topRadius === 0 && bottomRadius === 0) {
    return null;
  }

  const rt = Math.min(topRadius, width / 2, height / 2);
  const rb = Math.min(bottomRadius, width / 2, height / 2);
  const x2 = x + width;
  const y2 = y + height;

  if (rt > 0 && rb === 0) {
    return `M ${x + rt},${y} H ${x2 - rt} A ${rt},${rt} 0 0 1 ${x2},${y + rt} V ${y2} H ${x} V ${y + rt} A ${rt},${rt} 0 0 1 ${x + rt},${y} Z`;
  }

  if (rb > 0 && rt === 0) {
    return `M ${x},${y} H ${x2} V ${y2 - rb} A ${rb},${rb} 0 0 1 ${x2 - rb},${y2} H ${x + rb} A ${rb},${rb} 0 0 1 ${x},${y2 - rb} V ${y} Z`;
  }

  const radius = Math.min(rt, rb);
  return `M ${x + radius},${y} H ${x2 - radius} A ${radius},${radius} 0 0 1 ${x2},${y + radius} V ${y2 - radius} A ${radius},${radius} 0 0 1 ${x2 - radius},${y2} H ${x + radius} A ${radius},${radius} 0 0 1 ${x},${y2 - radius} V ${y + radius} A ${radius},${radius} 0 0 1 ${x + radius},${y} Z`;
}

function StackedBars({
  data,
  percent,
  plot,
  showAxis = false,
  showValues,
}: {
  data: ChartDatum[];
  percent?: boolean;
  plot: PlotArea;
  showAxis?: boolean;
  showValues: boolean;
}) {
  const max = percent ? 100 : Math.max(1, ...data.map((item) => (item.values ?? []).reduce((total, value) => total + value, 0)));

  return (
    <g>
      {data.map((item, index) => {
        const values = item.values ?? [];
        let offset = 0;
        const total = values.reduce((sum, value) => sum + value, 0) || 1;
        return values.map((rawValue, valueIndex) => {
          const value = percent ? (rawValue / total) * 100 : rawValue;
          const height = (value / max) * plotSpan(plot);
          const y = plot.bottom - offset - height;
          const { barWidth, xCenter } = verticalBarMetrics(plot, data.length);
          const x = xCenter(index) - barWidth / 2;
          const width = barWidth;
          offset += height;
          const isTop = valueIndex === values.length - 1;
          const shape = stackedBarShape(x, y, width, height, isTop ? 4 : 0, 0);

          return shape ? (
            <path
              className={`${styles.bar} ${chartClass(valueIndex)}`}
              d={shape}
              key={`${item.label}-${valueIndex}`}
            />
          ) : (
            <rect
              className={`${styles.bar} ${chartClass(valueIndex)}`}
              height={height}
              key={`${item.label}-${valueIndex}`}
              width={width}
              x={x}
              y={y}
            />
          );
        }).concat(showValues ? [
          <text className={styles.valueLabel} key={`${item.label}-value`} textAnchor="middle" x={xForIndex(plot, index, data.length)} y="42">
            {percent ? "100%" : total}
          </text>,
        ] : []);
      })}
      <AxisLabels
        dense={data.length > 18}
        labels={data.map((item) => item.label)}
        plot={plot}
        showAxis={showAxis}
      />
    </g>
  );
}

function stackedSeriesMax(series: ChartSeries[]) {
  if (!series.length) {
    return 1;
  }

  return Math.max(
    1,
    ...series[0].values.map((_, index) =>
      series.reduce((sum, item) => sum + (item.values[index] ?? 0), 0),
    ),
  );
}

function stackedAreaBandPath(points: { x: number; yBaseline: number; yTop: number }[]) {
  if (!points.length) {
    return "";
  }

  const topEdge = points.map((point) => `L ${point.x} ${point.yTop}`).join(" ");
  const baselineEdge = [...points].reverse().map((point) => `L ${point.x} ${point.yBaseline}`).join(" ");

  return `M ${points[0].x} ${points[0].yBaseline} ${topEdge} ${baselineEdge} Z`;
}

function LineChart({
  area,
  labels,
  max,
  multi,
  plot,
  series,
  showAxis = false,
  showValues,
  smooth,
  stacked,
}: {
  area?: boolean;
  labels: string[];
  max: number;
  multi?: boolean;
  plot: PlotArea;
  series: ChartSeries[];
  showAxis?: boolean;
  showValues: boolean;
  smooth?: boolean;
  stacked?: boolean;
}) {
  const visibleSeries = multi || stacked ? series : [series[0]];
  const totals = labels.map((_, index) =>
    visibleSeries.reduce((sum, item) => sum + item.values[index], 0),
  );
  const stackedMax = stacked ? Math.max(1, ...totals) : max;
  const valueY = (value: number) => plot.bottom - (value / stackedMax) * plotSpan(plot);

  if (stacked && area) {
    return (
      <g>
        {visibleSeries.map((item, seriesIndex) => {
          const points = labels.map((_, index) => {
            const baseline = visibleSeries
              .slice(0, seriesIndex)
              .reduce((sum, seriesItem) => sum + seriesItem.values[index], 0);
            const top = baseline + item.values[index];

            return {
              x: xForLineIndex(plot, index, labels.length),
              yBaseline: valueY(baseline),
              yTop: valueY(top),
            };
          });

          return (
            <g key={item.id}>
              <path className={`${styles.area} ${chartClass(seriesIndex)}`} d={stackedAreaBandPath(points)} />
              <polyline
                className={`${styles.line} ${chartClass(seriesIndex)}`}
                fill="none"
                points={points.map((point) => `${point.x},${point.yTop}`).join(" ")}
              />
            </g>
          );
        })}
        <AxisLabels dense={labels.length > 18} edgeAligned labels={labels} plot={plot} showAxis={showAxis} />
      </g>
    );
  }

  return (
    <g>
      {visibleSeries.map((item, seriesIndex) => {
        let stackedOffset = 0;
        const points = item.values.map((value, index) => {
          const nextValue = stacked ? value + stackedOffset : value;
          if (stacked) {
            stackedOffset += value;
          }
          return {
            x: xForLineIndex(plot, index, labels.length),
            y: plot.bottom - (nextValue / stackedMax) * plotSpan(plot),
          };
        });
        const path = smooth ? smoothPath(points) : points.map((point) => `${point.x},${point.y}`).join(" ");
        const areaPath = `M ${points[0].x} ${plot.bottom} L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points[points.length - 1].x} ${plot.bottom} Z`;

        return (
          <g key={item.id}>
            {area ? <path className={`${styles.area} ${chartClass(seriesIndex)}`} d={areaPath} /> : null}
            {smooth ? (
              <path className={`${styles.line} ${chartClass(seriesIndex)}`} d={path} />
            ) : (
              <polyline className={`${styles.line} ${chartClass(seriesIndex)}`} points={path} />
            )}
            {points.map((point, pointIndex) => (
              <g key={`${item.id}-${point.x}`}>
                <circle className={`${styles.point} ${chartClass(seriesIndex)}`} cx={point.x} cy={point.y} r="4" />
                {showValues && (!multi || seriesIndex === 0) ? (
                  <text className={styles.valueLabel} textAnchor="middle" x={point.x} y={point.y - 10}>
                    {item.values[pointIndex]}
                  </text>
                ) : null}
              </g>
            ))}
          </g>
        );
      })}
      <AxisLabels dense={labels.length > 18} edgeAligned labels={labels} plot={plot} showAxis={showAxis} />
    </g>
  );
}

function PieLike({
  data,
  donut,
  polar,
  showGrid,
  showValues,
}: {
  data: ChartDatum[];
  donut?: boolean;
  polar?: boolean;
  showGrid: boolean;
  showValues: boolean;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  const slices = data.map((item, index) => {
    const previousTotal = data.slice(0, index).reduce((sum, previous) => sum + previous.value, 0);
    const startAngle = -Math.PI / 2 + (previousTotal / total) * Math.PI * 2;
    const endAngle = startAngle + (item.value / total) * Math.PI * 2;
    return { endAngle, item, startAngle };
  });

  return (
    <g>
      <RadialGrid show={showGrid} />
      {slices.map(({ endAngle, item, startAngle }, index) => {
        const portion = item.value / total;
        const radius = polar ? 42 + portion * 84 : 76;
        const path = donut
          ? ringPath(188, 126, radius, 38, startAngle, endAngle)
          : arcPath(188, 126, radius, startAngle, endAngle);
        const labelPoint = polarPoint(188, 126, donut ? 56 : radius * 0.66, startAngle + (endAngle - startAngle) / 2);
        return (
          <g key={item.label}>
            <path className={`${styles.slice} ${chartClass(index)}`} d={path} />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={labelPoint.x} y={labelPoint.y + 3}>
                {Math.round(portion * 100)}%
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function Scatter({ bubble, data, plot, showValues }: { bubble?: boolean; data: ChartDatum[]; plot: PlotArea; showValues: boolean }) {
  const plotWidth = plot.gridRight - plot.gridLeft;

  return (
    <g>
      {data.map((item, index) => {
        const x = plot.gridLeft + ((item.x ?? item.value) / 100) * plotWidth;
        const y = plot.bottom - ((item.y ?? item.value) / 100) * plotSpan(plot);
        return (
          <g key={item.label}>
            <circle
              className={`${styles.point} ${chartClass(index)}`}
              cx={x}
              cy={y}
              r={bubble ? 7 + item.value / 12 : 5}
            />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={x} y={y - (bubble ? 16 : 10)}>
                {item.value}
              </text>
            ) : null}
          </g>
        );
      })}
      <AxisLabels labels={["0", "20", "40", "60", "80", "100"]} plot={plot} />
    </g>
  );
}

function Radar({ data, showGrid, showValues }: { data: ChartDatum[]; showGrid: boolean; showValues: boolean }) {
  const cx = 188;
  const cy = 128;
  const max = maxValue(data, []);
  const points = data.map((item, index) => {
    const angle = -Math.PI / 2 + (index / data.length) * Math.PI * 2;
    return polarPoint(cx, cy, (item.value / max) * 82, angle);
  });
  const rings = [0.33, 0.66, 1];

  return (
    <g>
      {showGrid ? (
        rings.map((ring) => (
          <polygon
            className={styles.radarGrid}
            key={ring}
            points={data.map((_, index) => {
              const angle = -Math.PI / 2 + (index / data.length) * Math.PI * 2;
              const point = polarPoint(cx, cy, ring * 82, angle);
              return `${point.x},${point.y}`;
            }).join(" ")}
          />
        ))
      ) : null}
      <polygon className={styles.radarArea} points={points.map((point) => `${point.x},${point.y}`).join(" ")} />
      {points.map((point, index) => (
        <g key={data[index].label}>
          <circle className={`${styles.point} ${chartClass(index)}`} cx={point.x} cy={point.y} r="4" />
          {showValues ? (
            <text className={styles.valueLabel} textAnchor="middle" x={point.x} y={point.y - 10}>
              {data[index].value}
            </text>
          ) : null}
        </g>
      ))}
    </g>
  );
}

function FunnelLike({
  data,
  pyramid,
  showGrid,
  showValues,
}: {
  data: ChartDatum[];
  pyramid?: boolean;
  showGrid: boolean;
  showValues: boolean;
}) {
  const sorted = pyramid ? [...data].sort((a, b) => a.value - b.value) : data;
  const max = maxValue(sorted, []);

  return (
    <g>
      {sorted.slice(0, 5).map((item, index) => {
        const width = 250 * (item.value / max);
        const next = sorted[index + 1];
        const nextWidth = next ? 250 * (next.value / max) : width * 0.68;
        const y = 46 + index * 34;
        const x1 = 188 - width / 2;
        const x2 = 188 + width / 2;
        const x3 = 188 + nextWidth / 2;
        const x4 = 188 - nextWidth / 2;
        return (
          <g key={item.label}>
            {showGrid ? <line className={styles.funnelGuide} x1="54" x2="322" y1={y} y2={y} /> : null}
            <polygon className={`${styles.funnel} ${chartClass(index)}`} points={`${x1},${y} ${x2},${y} ${x3},${y + 30} ${x4},${y + 30}`} />
            <text className={styles.funnelText} textAnchor="middle" x="188" y={y + 20}>
              {showValues ? `${item.label} ${item.value}` : item.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function getLegendItems({
  data,
  series,
  variant,
}: {
  data: ChartDatum[];
  series: ChartSeries[];
  variant: ChartVariant;
}) {
  if (variant === "grouped-bar" || variant === "stacked-bar" || variant === "stacked-bar-100" || variant === "multi-line" || variant === "stacked-area") {
    return series.map((item) => ({ id: item.id, label: item.label }));
  }

  if (variant === "line" || variant === "area" || variant === "spline") {
    return series.slice(0, 1).map((item) => ({ id: item.id, label: item.label }));
  }

  if (variant === "funnel" || variant === "pyramid") {
    return data.slice(0, 5).map((item) => ({ id: item.label, label: item.label }));
  }

  if (variant === "candlestick") {
    return [
      { id: "close", label: "Close" },
      { id: "bullish", label: "Up" },
      { id: "bearish", label: "Down" },
    ];
  }

  if (variant === "waterfall") {
    return [
      { id: "positive", label: "Increase" },
      { id: "negative", label: "Decrease" },
    ];
  }

  if (variant === "stream" || variant === "ridgeline" || variant === "density") {
    return series.map((item) => ({ id: item.id, label: item.label }));
  }

  if (variant === "heatmap" || variant === "calendar-heatmap") {
    return [{ id: "activity", label: "Activity" }];
  }

  if (variant === "choropleth" || variant === "geo-map" || variant === "bubble-map") {
    return data.map((item) => ({ id: item.label, label: item.label }));
  }

  return data.map((item) => ({ id: item.label, label: item.label }));
}

export function Chart({
  data = chartDemoData,
  height = 280,
  highlightLabel,
  maximise = false,
  palette = "opus",
  series = chartDemoSeries,
  showAxis = false,
  showGrid = false,
  showLegend = true,
  showValues = false,
  title,
  variant,
  xAxisLabel,
  yAxisLabel,
}: ChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const plotClipId = useId();
  const [svgWidth, setSvgWidth] = useState(0);
  const max = maxValue(data, series);
  const canMaximisePlot = maximisePlotVariants.includes(variant);
  const viewBoxHeight = 252;
  const effectiveHeight = Math.max(height, 220);
  const heightScale = effectiveHeight / viewBoxHeight;
  const minViewBoxWidth = getDenseChartMinWidth(variant, data.length);
  const wideViewBoxWidth =
    maximise && canMaximisePlot
      ? Math.max(minViewBoxWidth, svgWidth > 0 ? svgWidth / heightScale : minViewBoxWidth)
      : 376;
  const basePlot = maximise && canMaximisePlot ? getWidePlot(wideViewBoxWidth) : defaultPlot;
  const denseXLabels = data.length > 18;
  const activePlot = resolvePlot(basePlot, { denseXLabels, showAxis, variant });
  const viewBox = `0 0 ${wideViewBoxWidth} ${viewBoxHeight}`;
  const isTimelineVariant = variant === "timeline" || variant === "milestone-timeline";
  const timelineClipPad = {
    top: 18,
    left: timelineEndpointInset,
    right: timelineEndpointInset,
  };
  const style = { "--chart-height": `${height}px` } as CSSProperties;
  const legendItems = getLegendItems({ data, series, variant });
  const isCartesian = isCartesianVariant(variant);
  const yDomain = isSpecializedChartVariant(variant)
    ? getChartYDomain(variant, data, series, max)
    : { min: 0, max };
  const useDomainAxis = isSpecializedChartVariant(variant) && specializedVariantHasYNumericAxis(variant);
  const axisMax =
    variant === "stacked-bar" || variant === "stacked-bar-100"
      ? Math.max(
          1,
          ...(variant === "stacked-bar-100"
            ? [100]
            : data.map((item) => (item.values ?? []).reduce((total, value) => total + value, 0))),
        )
      : variant === "stacked-area"
        ? stackedSeriesMax(series)
        : useDomainAxis
          ? yDomain.max
          : max;
  const axisMin = useDomainAxis ? yDomain.min : 0;

  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) {
      return;
    }

    const updateWidth = () => {
      setSvgWidth(svg.getBoundingClientRect().width);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(svg);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <figure
      className={styles.chart}
      data-maximise={maximise}
      data-maximise-plot={canMaximisePlot}
      data-palette={palette}
      data-show-axis={showAxis}
      data-variant={variant}
      style={style}
    >
      {title ? (
        <figcaption className={styles.header}>
          <span className={styles.title}>{title}</span>
        </figcaption>
      ) : null}
      <svg ref={svgRef} aria-label={title ?? `${variant} chart`} className={styles.svg} role="img" viewBox={viewBox}>
        {isCartesian ? <Grid max={axisMax} min={axisMin} plot={activePlot} show={showGrid} useDomain={useDomainAxis} /> : null}
        {isCartesian ? (
          <CartesianAxes
            denseXLabels={denseXLabels}
            horizontal={variant === "bar-horizontal"}
            max={axisMax}
            min={axisMin}
            plot={activePlot}
            show={showAxis}
            useDomain={useDomainAxis}
            variant={variant}
            xAxisLabel={xAxisLabel}
            yAxisLabel={yAxisLabel}
          />
        ) : null}
        {variant === "bar-vertical" ? (
          <Bars
            data={data}
            highlightLabel={highlightLabel}
            max={max}
            plot={activePlot}
            showAxis={showAxis}
            showValues={showValues}
          />
        ) : null}
        {variant === "bar-horizontal" ? (
          <Bars data={data} horizontal max={max} plot={activePlot} showAxis={showAxis} showValues={showValues} />
        ) : null}
        {variant === "grouped-bar" ? (
          <GroupedBars data={data} max={max} plot={activePlot} showAxis={showAxis} showValues={showValues} />
        ) : null}
        {variant === "stacked-bar" ? (
          <StackedBars data={data} plot={activePlot} showAxis={showAxis} showValues={showValues} />
        ) : null}
        {variant === "stacked-bar-100" ? (
          <StackedBars data={data} percent plot={activePlot} showAxis={showAxis} showValues={showValues} />
        ) : null}
        {variant === "line" ? (
          <LineChart
            labels={data.map((item) => item.label)}
            max={max}
            plot={activePlot}
            series={series}
            showAxis={showAxis}
            showValues={showValues}
          />
        ) : null}
        {variant === "multi-line" ? (
          <LineChart
            labels={data.map((item) => item.label)}
            max={max}
            multi
            plot={activePlot}
            series={series}
            showAxis={showAxis}
            showValues={showValues}
          />
        ) : null}
        {variant === "area" ? (
          <LineChart
            area
            labels={data.map((item) => item.label)}
            max={max}
            plot={activePlot}
            series={series}
            showAxis={showAxis}
            showValues={showValues}
          />
        ) : null}
        {variant === "stacked-area" ? (
          <LineChart
            area
            labels={data.map((item) => item.label)}
            max={stackedSeriesMax(series)}
            plot={activePlot}
            series={series}
            showAxis={showAxis}
            showValues={showValues}
            stacked
          />
        ) : null}
        {variant === "spline" ? (
          <LineChart
            labels={data.map((item) => item.label)}
            max={max}
            plot={activePlot}
            series={series}
            showAxis={showAxis}
            showValues={showValues}
            smooth
          />
        ) : null}
        {variant === "pie" ? <PieLike data={data} showGrid={showGrid} showValues={showValues} /> : null}
        {variant === "donut" ? <PieLike data={data} donut showGrid={showGrid} showValues={showValues} /> : null}
        {variant === "polar-area" ? <PieLike data={data} polar showGrid={showGrid} showValues={showValues} /> : null}
        {variant === "scatter" ? <Scatter data={data} plot={activePlot} showValues={showValues} /> : null}
        {variant === "bubble" ? <Scatter bubble data={data} plot={activePlot} showValues={showValues} /> : null}
        {variant === "radar" ? <Radar data={data} showGrid={showGrid} showValues={showValues} /> : null}
        {variant === "funnel" ? <FunnelLike data={data} showGrid={showGrid} showValues={showValues} /> : null}
        {variant === "pyramid" ? <FunnelLike data={data} pyramid showGrid={showGrid} showValues={showValues} /> : null}
        {variant === "gantt" ? (
          <GanttRowLabels data={data} plot={activePlot} styles={styles} />
        ) : null}
        {variant === "heatmap" && showAxis ? <HeatmapAxisLabels plot={activePlot} styles={styles} /> : null}
        {variant === "calendar-heatmap" && showAxis ? (
          <CalendarHeatmapAxisLabels plot={activePlot} styles={styles} />
        ) : null}
        {isSpecializedChartVariant(variant) ? (
          <>
            <defs>
              <clipPath id={plotClipId}>
                <rect
                  height={
                    activePlot.bottom -
                    activePlot.top +
                    (isTimelineVariant ? timelineClipPad.top : 0)
                  }
                  width={
                    activePlot.gridRight -
                    activePlot.gridLeft +
                    (isTimelineVariant ? timelineClipPad.left + timelineClipPad.right : 0)
                  }
                  x={activePlot.gridLeft - (isTimelineVariant ? timelineClipPad.left : 0)}
                  y={activePlot.top - (isTimelineVariant ? timelineClipPad.top : 0)}
                />
              </clipPath>
            </defs>
            <g clipPath={`url(#${plotClipId})`}>
              <SpecializedChart
                data={data}
                plot={activePlot}
                series={series}
                showValues={showValues}
                styles={styles}
                variant={variant}
                yMax={yDomain.max}
                yMin={yDomain.min}
              />
            </g>
          </>
        ) : null}
        {isSpecializedChartVariant(variant) && showAxis && specializedVariantHasXCategoryLabels(variant) ? (
          <AxisLabels
            dense={data.length > 18}
            edgeAligned={!specializedVariantUsesSlotLabels(variant)}
            labels={data.map((item) => item.label)}
            plot={activePlot}
            showAxis={showAxis}
            slotBounds={specializedVariantUsesSlotLabels(variant) ? { left: activePlot.gridLeft, right: activePlot.gridRight } : undefined}
            slotCentered={specializedVariantUsesSlotLabels(variant)}
            timeline={variant === "timeline" || variant === "milestone-timeline"}
            edgeBarHalfWidth={
              variant === "candlestick" ||
              variant === "ohlc" ||
              variant === "range-bar" ||
              variant === "error-bar" ||
              variant === "pareto"
                ? getCandlestickBarHalfWidth(activePlot, data.length)
                : variant === "histogram"
                  ? getHistogramBarHalfWidth(activePlot, data.length)
                  : variant === "box-plot"
                    ? getBoxPlotBarHalfWidth(activePlot, data.length)
                    : variant === "violin"
                      ? getViolinBarHalfWidth(activePlot, data.length)
                      : undefined
            }
          />
        ) : null}
      </svg>
      {showLegend ? (
        <div className={styles.legend} aria-label="Chart legend">
          {legendItems.map((item, index) => {
            const swatchIndex =
              variant === "candlestick"
                ? index === 0
                  ? 0
                  : index === 1
                    ? 1
                    : 3
                : variant === "waterfall"
                  ? index === 0
                    ? 0
                    : 3
                  : index;
            return (
              <span className={styles.legendItem} key={item.id}>
                <span className={`${styles.legendSwatch} ${chartClass(swatchIndex)}`} />
                {item.label}
              </span>
            );
          })}
        </div>
      ) : null}
    </figure>
  );
}
