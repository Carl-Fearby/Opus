import type { ChartDatum, ChartSeries } from "@/components/Chart";
import type { ChartVariant } from "@/components/fields";
import {
  fitWorldMapToPlot,
  getRegionCentroid,
  projectLatLng,
  resolveRegionId,
  worldLandPaths,
  worldMapRegions,
} from "@/components/Chart/worldMapRegions";
import { layoutCirclePack } from "@/components/Chart/circlePackLayout";
import { layoutForceDirectedGraph, layoutRadialNetworkGraph } from "@/components/Chart/networkGraphLayout";
import {
  demoSankeyLinks,
  demoSankeyNodes,
  formatSankeyValue,
  layoutSankey,
  type SankeyNodeKind,
} from "@/components/Chart/sankeyLayout";
import { layoutGroupedTreemap } from "@/components/Chart/treemapLayout";

export const specializedChartVariants = new Set<ChartVariant>([
  "heatmap",
  "treemap",
  "sunburst",
  "sankey",
  "waterfall",
  "candlestick",
  "box-plot",
  "histogram",
  "violin",
  "hexbin",
  "density",
  "chord",
  "network",
  "force-directed",
  "circle-packing",
  "stream",
  "ridgeline",
  "calendar-heatmap",
  "geo-map",
  "bubble-map",
  "choropleth",
  "timeline",
  "gantt",
  "milestone-timeline",
]);

export function isSpecializedChartVariant(variant: ChartVariant) {
  return specializedChartVariants.has(variant);
}

export const cartesianSpecializedVariants: ChartVariant[] = [
  "histogram",
  "waterfall",
  "candlestick",
  "box-plot",
  "violin",
  "hexbin",
  "density",
  "stream",
  "ridgeline",
  "timeline",
  "gantt",
  "milestone-timeline",
];

export function specializedVariantHasYNumericAxis(variant: ChartVariant) {
  return !["timeline", "milestone-timeline", "gantt", "heatmap", "calendar-heatmap", "ridgeline", "hexbin"].includes(
    variant,
  );
}

export function specializedVariantHasXCategoryLabels(variant: ChartVariant) {
  return [
    "histogram",
    "waterfall",
    "candlestick",
    "box-plot",
    "violin",
    "stream",
    "ridgeline",
    "density",
    "timeline",
    "milestone-timeline",
  ].includes(variant);
}

export function specializedVariantUsesSlotLabels(variant: ChartVariant) {
  return ["waterfall"].includes(variant);
}

export const chartSeriesAxisInset = 0;

export function getSeriesPlotBounds(plot: {
  gridLeft: number;
  gridRight: number;
}) {
  return {
    left: plot.gridLeft,
    right: plot.gridRight,
  };
}

export function xForSeriesCategoryIndex(
  plot: { gridLeft: number; gridRight: number },
  index: number,
  count: number,
) {
  const { left, right } = getSeriesPlotBounds(plot);
  if (count <= 1) {
    return (left + right) / 2;
  }

  const slotWidth = (right - left) / count;
  return left + slotWidth * index + slotWidth / 2;
}

type PlotArea = {
  bottom: number;
  gridLeft: number;
  gridRight: number;
  horizontalLabelX: number;
  left: number;
  right: number;
  top: number;
};

type SpecializedChartProps = {
  data: ChartDatum[];
  plot: PlotArea;
  series: ChartSeries[];
  showValues?: boolean;
  styles: Record<string, string>;
  variant: ChartVariant;
  yMax: number;
  yMin: number;
};

const paletteClasses = ["seriesA", "seriesB", "seriesC", "seriesD", "seriesE", "seriesF"] as const;

function chartClass(styles: Record<string, string>, index: number) {
  return styles[paletteClasses[index % paletteClasses.length]];
}

function plotSpan(plot: PlotArea) {
  return plot.bottom - plot.top;
}

function plotInnerWidth(plot: PlotArea) {
  return plot.gridRight - plot.gridLeft;
}

function plotDataLeft(plot: PlotArea) {
  return plot.gridLeft;
}

function plotDataRight(plot: PlotArea) {
  return plot.gridRight;
}

export const timelineEndpointInset = 12;

export function timelineTrackBounds(plot: PlotArea) {
  return {
    left: plotDataLeft(plot) + timelineEndpointInset,
    right: plotDataRight(plot) - timelineEndpointInset,
  };
}

export function xForTimelineIndex(plot: PlotArea, index: number, count: number) {
  const { left, right } = timelineTrackBounds(plot);
  if (count <= 1) {
    return (left + right) / 2;
  }

  return left + index * ((right - left) / (count - 1));
}

function candlestickBodyWidth(plot: PlotArea, count: number) {
  const span = plotInnerWidth(plot);
  const step = count > 1 ? span / (count - 1) : span;
  return Math.min(16, Math.max(4, (count > 1 ? step : span) * 0.45));
}

export function getCandlestickBarHalfWidth(plot: PlotArea, count: number) {
  return candlestickBodyWidth(plot, count) / 2;
}

function categoryBarWidth(plot: PlotArea, count: number, ratio: number, maxWidth = 28) {
  const span = plotInnerWidth(plot);
  const step = count > 1 ? span / (count - 1) : span;
  return Math.min(maxWidth, Math.max(4, (count > 1 ? step : span) * ratio));
}

export function getHistogramBarHalfWidth(plot: PlotArea, count: number) {
  return categoryBarWidth(plot, count, 0.55) / 2;
}

export function getBoxPlotBarHalfWidth(plot: PlotArea, count: number) {
  return categoryBarWidth(plot, count, 0.45, 34) / 2;
}

export function getViolinBarHalfWidth(plot: PlotArea, count: number) {
  const span = plotInnerWidth(plot);
  const step = count > 1 ? span / (count - 1) : span;
  return Math.max(4, (count > 1 ? step : span) * 0.22);
}

export function xForEdgeBarIndex(plot: PlotArea, index: number, count: number, barHalfWidth: number) {
  const left = plotDataLeft(plot) + barHalfWidth;
  const right = plotDataRight(plot) - barHalfWidth;
  if (count <= 1) {
    return (left + right) / 2;
  }

  return left + index * ((right - left) / (count - 1));
}

function xForCategoryIndex(plot: PlotArea, index: number, count: number) {
  const left = plotDataLeft(plot);
  const right = plotDataRight(plot);
  if (count <= 1) {
    return (left + right) / 2;
  }

  return left + index * ((right - left) / (count - 1));
}

function xForSeriesIndex(plot: PlotArea, index: number, count: number) {
  const { left, right } = getSeriesPlotBounds(plot);
  if (count <= 1) {
    return (left + right) / 2;
  }

  return left + index * ((right - left) / (count - 1));
}

function yForDomain(value: number, yMin: number, yMax: number, plot: PlotArea) {
  const span = Math.max(1, yMax - yMin);
  return plot.bottom - ((value - yMin) / span) * plotSpan(plot);
}

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function ChartValueLabel({
  anchor = "middle",
  children,
  show,
  styles,
  x,
  y,
}: {
  anchor?: "middle" | "start" | "end";
  children: string | number;
  show?: boolean;
  styles: Record<string, string>;
  x: number;
  y: number;
}) {
  if (!show) {
    return null;
  }

  return (
    <text className={styles.valueLabel} textAnchor={anchor} x={x} y={y}>
      {children}
    </text>
  );
}

function Histogram({ data, plot, showValues, styles, yMax, yMin }: SpecializedChartProps) {
  const barHalfWidth = getHistogramBarHalfWidth(plot, data.length);
  const width = barHalfWidth * 2;

  return (
    <g>
      {data.map((item, index) => {
        const height = ((item.value - yMin) / Math.max(1, yMax - yMin)) * plotSpan(plot);
        const xCenter = xForEdgeBarIndex(plot, index, data.length, barHalfWidth);
        const x = xCenter - barHalfWidth;
        const y = plot.bottom - height;
        return (
          <g key={item.label}>
            <rect
              className={`${styles.bar} ${chartClass(styles, index % paletteClasses.length)}`}
              height={height}
              rx="2"
              width={width}
              x={x}
              y={y}
            />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={x + width / 2} y={y - 6}>
                {formatValue(item.value)}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function heatmapLayout(plot: PlotArea) {
  const rows = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const cols = ["AM", "PM", "Eve"];
  const gap = 4;
  const cellW = (plotInnerWidth(plot) - gap * (cols.length - 1)) / cols.length;
  const cellH = (plotSpan(plot) - gap * (rows.length - 1)) / rows.length;
  const startX = plotDataLeft(plot);
  const startY = plot.top;

  return { rows, cols, gap, cellW, cellH, startX, startY };
}

export function HeatmapAxisLabels({ plot, styles }: Pick<SpecializedChartProps, "plot" | "styles">) {
  const { rows, cols, gap, cellW, cellH, startX, startY } = heatmapLayout(plot);

  return (
    <g>
      {cols.map((col, colIndex) => (
        <text
          className={styles.axisLabels}
          key={col}
          textAnchor="middle"
          x={startX + colIndex * (cellW + gap) + cellW / 2}
          y={startY - 6}
        >
          {col}
        </text>
      ))}
      {rows.map((row, rowIndex) => (
        <text
          className={styles.axisLabels}
          key={row}
          textAnchor="end"
          x={plot.gridLeft - 6}
          y={startY + rowIndex * (cellH + gap) + cellH / 2 + 3}
        >
          {row}
        </text>
      ))}
    </g>
  );
}

function Heatmap({ data, plot, showValues, styles }: SpecializedChartProps) {
  const { rows, cols, gap, cellW, cellH, startX, startY } = heatmapLayout(plot);
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <g>
      {rows.map((row, rowIndex) => (
        <g key={row}>
          {cols.map((col, colIndex) => {
            const item = data[(rowIndex * cols.length + colIndex) % data.length];
            const x = startX + colIndex * (cellW + gap);
            const y = startY + rowIndex * (cellH + gap);
            const ratio = item.value / max;
            return (
              <g key={`${row}-${col}`}>
                <rect
                  className={`${styles.bar} ${chartClass(styles, 0)}`}
                  height={cellH}
                  opacity={0.22 + ratio * 0.78}
                  rx="4"
                  width={cellW}
                  x={x}
                  y={y}
                />
                <ChartValueLabel show={showValues} styles={styles} x={x + cellW / 2} y={y + cellH / 2 + 3}>
                  {formatValue(item.value)}
                </ChartValueLabel>
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
}

function Waterfall({ data, plot, showValues, styles, yMax, yMin }: SpecializedChartProps) {
  let running = 0;
  const slotWidth = plotInnerWidth(plot) / Math.max(data.length, 1);
  const barWidth = Math.min(28, Math.max(4, slotWidth * 0.55));

  return (
    <g>
      {data.map((item, index) => {
        const start = running;
        running += item.value;
        const top = Math.max(start, running);
        const bottom = Math.min(start, running);
        const x = xForSeriesCategoryIndex(plot, index, data.length) - barWidth / 2;
        const y = yForDomain(top, yMin, yMax, plot);
        const height = yForDomain(bottom, yMin, yMax, plot) - y;
        const positive = item.value >= 0;
        return (
          <g key={item.label}>
            <rect
              className={`${styles.bar} ${chartClass(styles, positive ? 0 : 3)}`}
              height={Math.max(4, height)}
              rx="2"
              width={barWidth}
              x={x}
              y={y}
            />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={x + barWidth / 2} y={y - 6}>
                {formatValue(item.value)}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function Candlestick({ data, plot, showValues, styles, yMax, yMin }: SpecializedChartProps) {
  const bodyWidth = candlestickBodyWidth(plot, data.length);
  const barHalfWidth = bodyWidth / 2;
  const closePoints = data
    .map((item, index) => {
      const close = item.close ?? item.value;
      const x = xForEdgeBarIndex(plot, index, data.length, barHalfWidth);
      const y = yForDomain(close, yMin, yMax, plot);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <g>
      <polyline className={`${styles.line} ${chartClass(styles, 0)}`} fill="none" points={closePoints} />
      {data.map((item, index) => {
        const open = item.open ?? item.value * 0.9;
        const close = item.close ?? item.value;
        const high = item.high ?? item.value * 1.08;
        const low = item.low ?? item.value * 0.82;
        const x = xForEdgeBarIndex(plot, index, data.length, barHalfWidth);
        const bullish = close >= open;
        const bodyTop = yForDomain(Math.max(open, close), yMin, yMax, plot);
        const bodyBottom = yForDomain(Math.min(open, close), yMin, yMax, plot);
        return (
          <g key={item.label}>
            <line
              className={`${styles.wick} ${chartClass(styles, bullish ? 1 : 3)}`}
              x1={x}
              x2={x}
              y1={yForDomain(high, yMin, yMax, plot)}
              y2={yForDomain(low, yMin, yMax, plot)}
            />
            <rect
              className={`${styles.bar} ${chartClass(styles, bullish ? 1 : 3)}`}
              height={Math.max(3, bodyBottom - bodyTop)}
              width={bodyWidth}
              x={x - bodyWidth / 2}
              y={bodyTop}
            />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={x} y={bodyTop - 6}>
                {formatValue(close)}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function BoxPlot({ data, plot, showValues, styles, yMax, yMin }: SpecializedChartProps) {
  const barHalfWidth = getBoxPlotBarHalfWidth(plot, data.length);
  const boxWidth = barHalfWidth * 2;

  return (
    <g>
      {data.map((item, index) => {
        const min = item.min ?? item.value * 0.6;
        const q1 = item.q1 ?? item.value * 0.78;
        const median = item.median ?? item.value;
        const q3 = item.q3 ?? item.value * 1.18;
        const maxV = item.max ?? item.value * 1.35;
        const x = xForEdgeBarIndex(plot, index, data.length, barHalfWidth);
        const seriesClass = chartClass(styles, index % paletteClasses.length);
        return (
          <g key={item.label}>
            <line className={`${styles.wick} ${seriesClass}`} x1={x} x2={x} y1={yForDomain(min, yMin, yMax, plot)} y2={yForDomain(maxV, yMin, yMax, plot)} />
            <line className={`${styles.wick} ${seriesClass}`} x1={x - boxWidth / 2} x2={x + boxWidth / 2} y1={yForDomain(min, yMin, yMax, plot)} y2={yForDomain(min, yMin, yMax, plot)} />
            <line className={`${styles.wick} ${seriesClass}`} x1={x - boxWidth / 2} x2={x + boxWidth / 2} y1={yForDomain(maxV, yMin, yMax, plot)} y2={yForDomain(maxV, yMin, yMax, plot)} />
            <rect
              className={`${styles.area} ${seriesClass}`}
              height={yForDomain(q1, yMin, yMax, plot) - yForDomain(q3, yMin, yMax, plot)}
              width={boxWidth}
              x={x - boxWidth / 2}
              y={yForDomain(q3, yMin, yMax, plot)}
            />
            <line className={`${styles.wick} ${seriesClass}`} strokeWidth="2" x1={x - boxWidth / 2} x2={x + boxWidth / 2} y1={yForDomain(median, yMin, yMax, plot)} y2={yForDomain(median, yMin, yMax, plot)} />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={x} y={yForDomain(maxV, yMin, yMax, plot) - 6}>
                {formatValue(median)}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function truncateLabel(label: string, maxChars: number) {
  if (maxChars < 4) {
    return "";
  }

  if (label.length <= maxChars) {
    return label;
  }

  return `${label.slice(0, maxChars - 1)}…`;
}

function Treemap({ data, plot, showValues, styles }: SpecializedChartProps) {
  const gap = 2;
  const labelHeight = 18;
  const items = data.map((item, index) => ({
    group: item.group,
    index,
    label: item.label,
    value: Math.max(0, item.value),
  }));
  const layout = layoutGroupedTreemap(
    items,
    plot.gridLeft,
    plot.top + labelHeight,
    plot.gridRight - plot.gridLeft,
    plotSpan(plot) - labelHeight,
  );

  return (
    <g>
      {layout.groups.map((group) => (
        <text
          className={`${styles.treemapGroupLabel} ${chartClass(styles, group.groupIndex % paletteClasses.length)}`}
          key={group.group}
          textAnchor="middle"
          x={group.x + group.width / 2}
          y={plot.top + 12}
        >
          {group.group}
        </text>
      ))}
      {layout.rects.map((rect) => {
        const width = Math.max(0, rect.width - gap);
        const height = Math.max(0, rect.height - gap);
        const x = rect.x + gap / 2;
        const y = rect.y + gap / 2;
        const colorIndex = rect.groupIndex ?? rect.index;
        const showLabel = width >= 28 && height >= 16;
        const showValue = showValues && width >= 22 && height >= 22;

        return (
          <g key={`${rect.group ?? "flat"}-${rect.label}`}>
            <rect
              className={`${styles.bar} ${chartClass(styles, colorIndex % paletteClasses.length)}`}
              height={height}
              width={width}
              x={x}
              y={y}
            />
            {showLabel ? (
              <text className={styles.treemapLabel} textAnchor="middle" x={x + width / 2} y={y + height / 2 + (showValue ? -2 : 3)}>
                {rect.label}
              </text>
            ) : null}
            <ChartValueLabel show={showValue} styles={styles} x={x + width / 2} y={y + height / 2 + 12}>
              {formatValue(rect.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function Sunburst({ data, plot, showValues, styles }: SpecializedChartProps) {
  const cx = (plot.gridLeft + plot.gridRight) / 2;
  const cy = (plot.top + plot.bottom) / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let angle = -Math.PI / 2;

  return (
    <g>
      {data.map((item, index) => {
        const slice = (item.value / total) * Math.PI * 2;
        const inner = 26 + (index % 2) * 18;
        const outer = inner + 28;
        const start = angle;
        const end = angle + slice;
        angle = end;
        const largeArc = slice > Math.PI ? 1 : 0;
        const startOuter = {
          x: cx + outer * Math.cos(start),
          y: cy + outer * Math.sin(start),
        };
        const endOuter = {
          x: cx + outer * Math.cos(end),
          y: cy + outer * Math.sin(end),
        };
        const startInner = {
          x: cx + inner * Math.cos(end),
          y: cy + inner * Math.sin(end),
        };
        const endInner = {
          x: cx + inner * Math.cos(start),
          y: cy + inner * Math.sin(start),
        };
        const path = [
          `M ${startOuter.x} ${startOuter.y}`,
          `A ${outer} ${outer} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
          `L ${startInner.x} ${startInner.y}`,
          `A ${inner} ${inner} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
          "Z",
        ].join(" ");
        const midAngle = (start + end) / 2;
        const labelR = (inner + outer) / 2;
        const lx = cx + labelR * Math.cos(midAngle);
        const ly = cy + labelR * Math.sin(midAngle);
        return (
          <g key={item.label}>
            <path className={`${styles.slice} ${chartClass(styles, index)}`} d={path} opacity={0.9} />
            <ChartValueLabel show={showValues} styles={styles} x={lx} y={ly + 3}>
              {formatValue(item.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function sankeySeriesClass(styles: Record<string, string>, kind: SankeyNodeKind) {
  if (kind === "profit") {
    return chartClass(styles, 1);
  }

  if (kind === "cost") {
    return chartClass(styles, 3);
  }

  return chartClass(styles, 0);
}

function Sankey({ plot, styles }: Pick<SpecializedChartProps, "plot" | "styles">) {
  const width = plot.gridRight - plot.gridLeft;
  const height = plot.bottom - plot.top;
  const { nodes, layoutLinks } = layoutSankey(demoSankeyNodes, demoSankeyLinks, width, height, {
    nodeWidth: 5,
    nodePadding: 10,
    padX: 46,
    padY: 12,
  });

  return (
    <g transform={`translate(${plot.gridLeft}, ${plot.top})`}>
      {layoutLinks.map((link, index) => (
        <path
          className={`${styles.sankeyLink} ${sankeySeriesClass(styles, link.targetKind)}`}
          d={link.path}
          key={`link-${index}`}
        />
      ))}
      {nodes.map((node) => {
        const seriesClass = sankeySeriesClass(styles, node.kind);
        const valueLabel = formatSankeyValue(node.value);

        return (
          <g key={node.id}>
            <rect className={`${styles.sankeyNode} ${seriesClass}`} height={node.height} width={node.width} x={node.x} y={node.y} />
            {node.labelPosition === "center" ? (
              <g>
                <rect
                  className={styles.sankeyLabelBox}
                  height={24}
                  rx="3"
                  width={Math.max(58, node.label.length * 5.8 + 12)}
                  x={node.x - Math.max(58, node.label.length * 5.8 + 12) / 2 + node.width / 2}
                  y={node.y + node.height / 2 - 12}
                />
                <text
                  className={styles.sankeyCenterLabel}
                  textAnchor="middle"
                  x={node.x + node.width / 2}
                  y={node.y + node.height / 2 + 1}
                >
                  {node.label}
                </text>
              </g>
            ) : (
              <text
                className={styles.sankeySideLabel}
                textAnchor={node.labelPosition === "left" ? "end" : "start"}
                x={node.labelPosition === "left" ? node.x - 6 : node.x + node.width + 6}
                y={node.y + node.height / 2 - 2}
              >
                <tspan className={styles.sankeySideName} x={node.labelPosition === "left" ? node.x - 6 : node.x + node.width + 6}>
                  {node.label}
                </tspan>
                <tspan className={styles.sankeySideValue} dy="11" x={node.labelPosition === "left" ? node.x - 6 : node.x + node.width + 6}>
                  {valueLabel}
                </tspan>
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

function StreamGraph({ plot, series, showValues, styles, yMax, yMin }: SpecializedChartProps) {
  const labels = series[0]?.values.length ?? 0;
  const totals = Array.from({ length: labels }, (_, index) =>
    series.reduce((sum, item) => sum + item.values[index], 0),
  );
  const max = Math.max(1, ...totals);

  return (
    <g>
      {series.map((item, seriesIndex) => {
        let offset = 0;
        const topPoints = item.values.map((value, index) => {
          const top = offset + value;
          offset = top;
          return {
            x: xForSeriesIndex(plot, index, labels),
            y: yForDomain(top, yMin, max, plot),
          };
        });
        offset -= item.values.reduce((sum, value) => sum + value, 0);
        const basePoints = [...item.values].reverse().map((value, reverseIndex) => {
          const index = item.values.length - 1 - reverseIndex;
          offset += value;
          return {
            x: xForSeriesIndex(plot, index, labels),
            y: yForDomain(offset, yMin, max, plot),
          };
        });
        const path = [
          `M ${topPoints[0].x} ${topPoints[0].y}`,
          ...topPoints.slice(1).map((point) => `L ${point.x} ${point.y}`),
          ...basePoints.map((point) => `L ${point.x} ${point.y}`),
          "Z",
        ].join(" ");
        const lastTop = topPoints[topPoints.length - 1];
        const lastBase = basePoints[0];
        return (
          <g key={item.id}>
            <path className={`${styles.area} ${chartClass(styles, seriesIndex)}`} d={path} />
            <ChartValueLabel
              show={showValues}
              styles={styles}
              x={lastTop.x + 6}
              y={(lastTop.y + lastBase.y) / 2 + 3}
            >
              {formatValue(item.values[item.values.length - 1] ?? 0)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function Ridgeline({ plot, series, showValues, styles }: SpecializedChartProps) {
  return (
    <g>
      {series.map((item, seriesIndex) => {
        const max = Math.max(1, ...item.values);
        const offset = seriesIndex * 28;
        const peakIndex = item.values.indexOf(max);
        const points = item.values
          .map((value, index) => {
            const x = xForSeriesIndex(plot, index, item.values.length);
            const y = plot.top + offset + (1 - value / max) * 18;
            return `${x},${y}`;
          })
          .join(" ");
        const seriesClass = chartClass(styles, seriesIndex);
        return (
          <g key={item.id}>
            <polyline className={`${styles.line} ${seriesClass}`} fill="none" points={points} />
            <path
              className={`${styles.area} ${seriesClass}`}
              d={`M ${xForSeriesIndex(plot, 0, item.values.length)} ${plot.top + offset + 18} L ${item.values
                .map((value, index) => {
                  const x = xForSeriesIndex(plot, index, item.values.length);
                  const y = plot.top + offset + (1 - value / max) * 18;
                  return `${x} ${y}`;
                })
                .join(" L ")} L ${xForSeriesIndex(plot, item.values.length - 1, item.values.length)} ${plot.top + offset + 18} Z`}
            />
            <ChartValueLabel
              show={showValues}
              styles={styles}
              x={xForSeriesIndex(plot, peakIndex, item.values.length)}
              y={plot.top + offset + (1 - max / max) * 18 - 6}
            >
              {formatValue(max)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function DensityPlot({ plot, series, showValues, styles, yMax, yMin }: SpecializedChartProps) {
  return (
    <g>
      {series.slice(0, 3).map((item, seriesIndex) => {
        const max = Math.max(1, ...item.values);
        const peakIndex = item.values.indexOf(max);
        const baseY = plot.bottom;
        const path = item.values
          .map((value, index) => {
            const x = xForSeriesIndex(plot, index, item.values.length);
            const y = yForDomain(value, yMin, yMax, plot);
            return index === 0 ? `M ${x} ${baseY} L ${x} ${y}` : `L ${x} ${y}`;
          })
          .join(" ");
        const peakX = xForSeriesIndex(plot, peakIndex, item.values.length);
        const peakY = yForDomain(max, yMin, yMax, plot);
        return (
          <g key={item.id}>
            <path
              className={`${styles.area} ${chartClass(styles, seriesIndex)}`}
              d={`${path} L ${xForSeriesIndex(plot, item.values.length - 1, item.values.length)} ${baseY} Z`}
            />
            <ChartValueLabel show={showValues} styles={styles} x={peakX} y={peakY - 6}>
              {formatValue(max)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function ViolinPlot({ data, plot, showValues, styles, yMax, yMin }: SpecializedChartProps) {
  const barHalfWidth = getViolinBarHalfWidth(plot, data.length);

  return (
    <g>
      {data.map((item, index) => {
        const x = xForEdgeBarIndex(plot, index, data.length, barHalfWidth);
        const height = ((item.value - yMin) / Math.max(1, yMax - yMin)) * plotSpan(plot);
        const y = plot.bottom - height;
        return (
          <g key={item.label}>
            <ellipse
              className={`${styles.violin} ${chartClass(styles, index % paletteClasses.length)}`}
              cx={x}
              cy={y + height / 2}
              rx={barHalfWidth}
              ry={height / 2}
              strokeWidth="1.5"
            />
            {showValues ? (
              <text className={styles.valueLabel} textAnchor="middle" x={x} y={y - 6}>
                {formatValue(item.value)}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function HexbinPlot({ data, plot, showValues, styles }: SpecializedChartProps) {
  const cols = 6;
  const rows = Math.max(1, Math.ceil(data.length / cols));
  const gap = 3;
  const size = Math.min(
    (plot.gridRight - plot.gridLeft - gap * (cols - 1)) / cols,
    (plotSpan(plot) - gap * (rows - 1)) / rows,
  ) * 0.42;

  return (
    <g>
      {data.map((item, index) => {
        const x = plot.gridLeft + (index % cols) * (size * 2 + gap) + size;
        const y = plot.top + Math.floor(index / cols) * (size * 1.7 + gap) + size;
        const opacity = 0.25 + (item.value / 100) * 0.75;
        return (
          <g key={item.label}>
            <polygon
              className={`${styles.bar} ${chartClass(styles, 1)}`}
              opacity={opacity}
              points={`${x},${y - size} ${x + size},${y - size / 2} ${x + size},${y + size / 2} ${x},${y + size} ${x - size},${y + size / 2} ${x - size},${y - size / 2}`}
            />
            <ChartValueLabel show={showValues} styles={styles} x={x} y={y + 3}>
              {formatValue(item.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function ChordDiagram({ data, plot, showValues, styles }: SpecializedChartProps) {
  const cx = (plot.gridLeft + plot.gridRight) / 2;
  const cy = (plot.top + plot.bottom) / 2;
  const radius = Math.min(plot.gridRight - plot.gridLeft, plotSpan(plot)) * 0.34;
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let angle = -Math.PI / 2;

  return (
    <g>
      <circle className={styles.axisGuide} cx={cx} cy={cy} fill="none" r={radius} />
      {data.map((item, index) => {
        const slice = (item.value / total) * Math.PI * 2;
        const start = angle;
        const end = angle + slice;
        angle = end;
        const sx = cx + radius * Math.cos((start + end) / 2);
        const sy = cy + radius * Math.sin((start + end) / 2);
        const tx = cx + radius * Math.cos(end + 0.4);
        const ty = cy + radius * Math.sin(end + 0.4);
        const midAngle = (start + end) / 2;
        const lx = cx + (radius + 14) * Math.cos(midAngle);
        const ly = cy + (radius + 14) * Math.sin(midAngle);
        return (
          <g key={item.label}>
            <path
              className={`${styles.line} ${chartClass(styles, index)}`}
              d={`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`}
              fill="none"
              strokeWidth={2 + (item.value / total) * 8}
            />
            <ChartValueLabel show={showValues} styles={styles} x={lx} y={ly + 3}>
              {formatValue(item.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function NetworkGraph({ data, plot, showValues, styles }: SpecializedChartProps) {
  const width = plot.gridRight - plot.gridLeft;
  const height = plot.bottom - plot.top;
  const { nodes, edges } = layoutRadialNetworkGraph(data, width, height);

  return (
    <g transform={`translate(${plot.gridLeft}, ${plot.top})`}>
      {edges.map((edge, index) => (
        <line className={styles.graphLink} key={`edge-${index}`} x1={edge.x1} x2={edge.x2} y1={edge.y1} y2={edge.y2} />
      ))}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            className={`${styles.graphNode} ${chartClass(styles, node.groupIndex % paletteClasses.length)}`}
            cx={node.x}
            cy={node.y}
            r={node.radius}
          />
          <ChartValueLabel show={showValues} styles={styles} x={node.x} y={node.y + 3}>
            {formatValue(node.value)}
          </ChartValueLabel>
        </g>
      ))}
    </g>
  );
}

function ForceDirectedGraph({ data, plot, showValues, styles }: SpecializedChartProps) {
  const width = plot.gridRight - plot.gridLeft;
  const height = plot.bottom - plot.top;
  const { nodes, edges } = layoutForceDirectedGraph(data, width, height);

  return (
    <g transform={`translate(${plot.gridLeft}, ${plot.top})`}>
      {edges.map((edge, index) => {
        const seriesClass = chartClass(styles, (edge.groupIndex ?? 0) % paletteClasses.length);
        return (
          <line
            className={`${styles.graphLink} ${styles.graphLinkColored} ${seriesClass}`}
            key={`edge-${index}`}
            x1={edge.x1}
            x2={edge.x2}
            y1={edge.y1}
            y2={edge.y2}
          />
        );
      })}
      {nodes.map((node) => {
        const seriesClass = chartClass(styles, node.groupIndex % paletteClasses.length);
        return (
          <g key={node.id}>
            {node.showRing ? (
              <circle className={`${styles.graphNodeRing} ${seriesClass}`} cx={node.x} cy={node.y} r={node.radius + 4} />
            ) : null}
            <circle className={`${styles.graphNode} ${seriesClass}`} cx={node.x} cy={node.y} r={node.radius} />
            {node.showLabel ? (
              <text className={styles.graphLabel} textAnchor="middle" x={node.x} y={node.y + 4}>
                {node.label}
              </text>
            ) : null}
            <ChartValueLabel show={showValues} styles={styles} x={node.x} y={node.y + node.radius + 12}>
              {formatValue(node.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function CirclePacking({ data, plot, showValues, styles }: SpecializedChartProps) {
  const items = data.map((item, index) => ({
    index,
    label: item.label,
    parent: item.parent,
    value: Math.max(0, item.value),
  }));

  const circles = layoutCirclePack(items, plot.gridRight - plot.gridLeft, plotSpan(plot)).sort((a, b) => {
    if (a.depth !== b.depth) {
      return a.depth - b.depth;
    }

    return b.r - a.r;
  });

  return (
    <g>
      {circles.map((circle) => {
        const x = plot.gridLeft + circle.x;
        const y = plot.top + circle.y;
        const maxChars = Math.max(0, Math.floor((circle.r * 2) / 6.5));
        const label = truncateLabel(circle.label, maxChars);
        const showLabel = Boolean(label) && circle.r >= 12;
        const showValue = showValues && !circle.isParent && circle.r >= 16;

        return (
          <g key={`${circle.label}-${circle.depth}-${circle.isParent ? "p" : "l"}`}>
            <circle
              className={`${circle.isParent ? styles.packParent : styles.point} ${chartClass(styles, circle.colorIndex % paletteClasses.length)}`}
              cx={x}
              cy={y}
              r={circle.r}
            />
            {showLabel ? (
              <text className={styles.packLabel} textAnchor="middle" x={x} y={y + (showValue ? -4 : 3)}>
                {label}
              </text>
            ) : null}
            <ChartValueLabel show={showValue} styles={styles} x={x} y={y + 10}>
              {formatValue(circle.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function calendarHeatmapLayout(plot: PlotArea) {
  const cols = 12;
  const rows = 7;
  const gap = 3;
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const availW = plotInnerWidth(plot);
  const availH = plotSpan(plot);
  const cellW = (availW - gap * (cols - 1)) / cols;
  const cellH = (availH - gap * (rows - 1)) / rows;
  const startX = plotDataLeft(plot);
  const startY = plot.top;

  return { cols, rows, gap, monthLabels, dayLabels, cellW, cellH, startX, startY };
}

export function CalendarHeatmapAxisLabels({ plot, styles }: Pick<SpecializedChartProps, "plot" | "styles">) {
  const { gap, monthLabels, dayLabels, cellW, cellH, startX, startY } = calendarHeatmapLayout(plot);

  return (
    <g>
      {monthLabels.map((label, colIndex) => (
        <text
          className={styles.axisLabels}
          key={label}
          textAnchor="middle"
          x={startX + colIndex * (cellW + gap) + cellW / 2}
          y={startY - 8}
        >
          {label}
        </text>
      ))}
      {dayLabels.map((label, rowIndex) => (
        <text
          className={styles.axisLabels}
          key={label}
          textAnchor="end"
          x={plot.gridLeft - 6}
          y={startY + rowIndex * (cellH + gap) + cellH / 2 + 3}
        >
          {label}
        </text>
      ))}
    </g>
  );
}

function CalendarHeatmap({ data, plot, showValues, styles }: SpecializedChartProps) {
  const { cols, rows, gap, cellW, cellH, startX, startY } = calendarHeatmapLayout(plot);
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <g>
      {Array.from({ length: rows * cols }, (_, index) => {
        const item = data[index % data.length];
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = startX + col * (cellW + gap);
        const y = startY + row * (cellH + gap);
        const ratio = item.value / max;
        return (
          <g key={index}>
            <rect
              className={`${styles.bar} ${chartClass(styles, 0)}`}
              height={cellH}
              opacity={0.22 + ratio * 0.78}
              rx="3"
              width={cellW}
              x={x}
              y={y}
            />
            <ChartValueLabel show={showValues && cellW >= 14 && cellH >= 12} styles={styles} x={x + cellW / 2} y={y + cellH / 2 + 3}>
              {formatValue(item.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function Timeline({ data, plot, showValues, styles }: SpecializedChartProps) {
  const track = timelineTrackBounds(plot);
  const y = (plot.top + plot.bottom) / 2;
  return (
    <g>
      <line className={styles.axisGuide} x1={track.left} x2={track.right} y1={y} y2={y} />
      {data.map((item, index) => {
        const x = xForTimelineIndex(plot, index, data.length);
        return (
          <g key={item.label}>
            <circle className={`${styles.point} ${chartClass(styles, index % paletteClasses.length)}`} cx={x} cy={y} r="6" />
            <text className={styles.axisLabels} textAnchor="middle" x={x} y={y - 14}>
              {item.label}
            </text>
            <ChartValueLabel show={showValues} styles={styles} x={x} y={y + 18}>
              {formatValue(item.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function ganttRowMetrics(plot: PlotArea, rowCount: number) {
  const rowHeight = plotSpan(plot) / Math.max(rowCount, 1);
  const barHeight = Math.max(12, Math.min(22, rowHeight * 0.55));
  const rowY = (index: number) => plot.top + index * rowHeight + (rowHeight - barHeight) / 2;

  return {
    barHeight,
    rowHeight,
    rowY,
    rowCenterY: (index: number) => rowY(index) + barHeight / 2 + 4,
  };
}

export function GanttRowLabels({
  data,
  plot,
  styles,
}: Pick<SpecializedChartProps, "data" | "plot" | "styles">) {
  const { rowCenterY } = ganttRowMetrics(plot, data.length);

  return (
    <g>
      {data.map((item, index) => (
        <text
          className={styles.axisLabels}
          key={item.label}
          textAnchor="end"
          x={plot.gridLeft - 8}
          y={rowCenterY(index)}
        >
          {item.label}
        </text>
      ))}
    </g>
  );
}

function GanttChart({ data, plot, showValues, styles }: SpecializedChartProps) {
  const { barHeight, rowY } = ganttRowMetrics(plot, data.length);
  const trackWidth = plot.gridRight - plot.gridLeft;

  return (
    <g>
      {data.map((item, index) => {
        const start = item.start ?? index * 12;
        const end = item.end ?? start + item.value;
        const max = 100;
        const y = rowY(index);
        const x = plot.gridLeft + (start / max) * trackWidth;
        const width = ((end - start) / max) * trackWidth;
        const barWidth = Math.max(12, width);
        return (
          <g key={item.label}>
            <rect
              className={`${styles.bar} ${chartClass(styles, index % paletteClasses.length)}`}
              height={barHeight}
              rx="4"
              width={barWidth}
              x={x}
              y={y}
            />
            <ChartValueLabel show={showValues} styles={styles} x={x + barWidth / 2} y={y + barHeight / 2 + 3}>
              {formatValue(end - start)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function MilestoneTimeline({ data, plot, showValues, styles }: SpecializedChartProps) {
  const track = timelineTrackBounds(plot);
  const y = plot.top + plotSpan(plot) * 0.58;
  return (
    <g>
      <line className={`${styles.line} ${chartClass(styles, 0)}`} x1={track.left} x2={track.right} y1={y} y2={y} />
      {data.map((item, index) => {
        const x = xForTimelineIndex(plot, index, data.length);
        const done = index < data.length - 1;
        return (
          <g key={item.label}>
            <circle className={`${styles.point} ${chartClass(styles, done ? 1 : 2)}`} cx={x} cy={y} r="7" />
            <text className={styles.axisLabels} textAnchor="middle" x={x} y={y - 16}>
              {item.label}
            </text>
            <ChartValueLabel show={showValues} styles={styles} x={x} y={y + 18}>
              {formatValue(item.value)}
            </ChartValueLabel>
          </g>
        );
      })}
    </g>
  );
}

function MapBase({ data, plot, showValues, styles, variant }: SpecializedChartProps) {
  const fit = fitWorldMapToPlot(plot);
  const maxValue = Math.max(1, ...data.map((item) => item.value));
  const isChoropleth = variant === "choropleth";
  const mapTransform = `translate(${fit.x},${fit.y}) scale(${fit.scale})`;

  const projectToPlot = (x: number, y: number) => ({
    x: fit.x + x * fit.scale,
    y: fit.y + y * fit.scale,
  });

  return (
    <g>
      <g transform={mapTransform}>
        {worldLandPaths.map((path, index) => (
          <path className={styles.mapLand} d={path} key={`land-${index}`} />
        ))}
      </g>

      {isChoropleth ? (
        <g transform={mapTransform}>
          {data.map((item, index) => {
            const regionId = resolveRegionId(item);
            const region = worldMapRegions.find((entry) => entry.id === regionId);
            if (!region) {
              return null;
            }

            const ratio = item.value / maxValue;
            return region.paths.map((path, pathIndex) => (
              <path
                className={`${styles.mapRegion} ${chartClass(styles, index % paletteClasses.length)}`}
                d={path}
                key={`${regionId}-${pathIndex}`}
                opacity={0.38 + ratio * 0.62}
              />
            ));
          })}
        </g>
      ) : null}

      {isChoropleth
        ? data.map((item) => {
            const regionId = resolveRegionId(item);
            const centroid = getRegionCentroid(regionId);
            if (!centroid) {
              return null;
            }

            const point = projectToPlot(centroid.x, centroid.y);
            return (
              <g key={item.label}>
                <text className={styles.mapLabel} textAnchor="middle" x={point.x} y={point.y - 8}>
                  {item.label}
                </text>
                {showValues ? (
                  <text className={styles.mapValue} textAnchor="middle" x={point.x} y={point.y + 8}>
                    {formatValue(item.value)}
                  </text>
                ) : null}
              </g>
            );
          })
        : data.map((item, index) => {
            if (item.lat == null || item.lng == null) {
              return null;
            }

            const mapPoint = projectLatLng(item.lng, item.lat);
            const point = projectToPlot(mapPoint.x, mapPoint.y);
            const radius = variant === "bubble-map" ? 10 + (item.value / maxValue) * 26 : 8;

            return (
              <g key={item.label}>
                <circle
                  className={`${styles.point} ${chartClass(styles, index % paletteClasses.length)}`}
                  cx={point.x}
                  cy={point.y}
                  opacity={variant === "bubble-map" ? 0.7 : 1}
                  r={radius}
                />
                {variant === "geo-map" ? (
                  <text className={styles.mapLabel} textAnchor="middle" x={point.x} y={point.y - radius - 8}>
                    {item.label}
                  </text>
                ) : null}
                {showValues ? (
                  <text
                    className={styles.mapValue}
                    textAnchor="middle"
                    x={point.x}
                    y={point.y + (variant === "bubble-map" ? radius + 14 : 4)}
                  >
                    {formatValue(item.value)}
                  </text>
                ) : null}
              </g>
            );
          })}
    </g>
  );
}

export function SpecializedChart(props: SpecializedChartProps) {
  switch (props.variant) {
    case "histogram":
      return <Histogram {...props} />;
    case "heatmap":
      return <Heatmap {...props} />;
    case "waterfall":
      return <Waterfall {...props} />;
    case "candlestick":
      return <Candlestick {...props} />;
    case "box-plot":
      return <BoxPlot {...props} />;
    case "treemap":
      return <Treemap {...props} />;
    case "sunburst":
      return <Sunburst {...props} />;
    case "sankey":
      return <Sankey {...props} />;
    case "stream":
      return <StreamGraph {...props} />;
    case "ridgeline":
      return <Ridgeline {...props} />;
    case "density":
      return <DensityPlot {...props} />;
    case "violin":
      return <ViolinPlot {...props} />;
    case "hexbin":
      return <HexbinPlot {...props} />;
    case "chord":
      return <ChordDiagram {...props} />;
    case "network":
      return <NetworkGraph {...props} />;
    case "force-directed":
      return <ForceDirectedGraph {...props} />;
    case "circle-packing":
      return <CirclePacking {...props} />;
    case "calendar-heatmap":
      return <CalendarHeatmap {...props} />;
    case "timeline":
      return <Timeline {...props} />;
    case "gantt":
      return <GanttChart {...props} />;
    case "milestone-timeline":
      return <MilestoneTimeline {...props} />;
    case "geo-map":
    case "bubble-map":
    case "choropleth":
      return <MapBase {...props} />;
    default:
      return null;
  }
}
