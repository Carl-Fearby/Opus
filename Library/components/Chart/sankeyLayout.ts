export type SankeyNodeKind = "neutral" | "profit" | "cost";

export type SankeyNodeDef = {
  id: string;
  label: string;
  column: number;
  kind: SankeyNodeKind;
  labelPosition?: "left" | "right" | "center";
};

export type SankeyLinkDef = {
  source: string;
  target: string;
  value: number;
};

export type SankeyLayoutNode = {
  id: string;
  label: string;
  kind: SankeyNodeKind;
  column: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  labelPosition: "left" | "right" | "center";
};

export type SankeyLayoutLink = {
  path: string;
  sourceKind: SankeyNodeKind;
  targetKind: SankeyNodeKind;
  value: number;
};

export const demoSankeyNodes: SankeyNodeDef[] = [
  { id: "Hardware", label: "Hardware", column: 0, kind: "neutral" },
  { id: "Software", label: "Software", column: 0, kind: "neutral" },
  { id: "Support", label: "Support", column: 0, kind: "neutral" },
  { id: "Revenue", label: "Revenue", column: 1, kind: "neutral", labelPosition: "center" },
  { id: "Margin", label: "Margin", column: 2, kind: "profit", labelPosition: "center" },
  { id: "Spend", label: "Spend", column: 2, kind: "cost", labelPosition: "center" },
  { id: "Profit", label: "Profit", column: 3, kind: "profit" },
  { id: "Tax", label: "Tax", column: 3, kind: "cost" },
  { id: "Ops", label: "Ops", column: 3, kind: "cost" },
];

export const demoSankeyLinks: SankeyLinkDef[] = [
  { source: "Hardware", target: "Revenue", value: 65 },
  { source: "Software", target: "Revenue", value: 25 },
  { source: "Support", target: "Revenue", value: 10 },
  { source: "Revenue", target: "Margin", value: 42 },
  { source: "Revenue", target: "Spend", value: 58 },
  { source: "Margin", target: "Profit", value: 30 },
  { source: "Margin", target: "Tax", value: 12 },
  { source: "Spend", target: "Ops", value: 58 },
];

function nodeValue(id: string, links: SankeyLinkDef[]) {
  const incoming = links.filter((link) => link.target === id).reduce((sum, link) => sum + link.value, 0);
  const outgoing = links.filter((link) => link.source === id).reduce((sum, link) => sum + link.value, 0);
  return Math.max(incoming, outgoing);
}

function defaultLabelPosition(column: number, maxColumn: number): "left" | "right" | "center" {
  if (column === 0) {
    return "left";
  }

  if (column === maxColumn) {
    return "right";
  }

  return column < maxColumn / 2 ? "left" : "right";
}

function sankeyLinkPath(
  sx: number,
  sy: number,
  sh: number,
  tx: number,
  ty: number,
  th: number,
) {
  const curvature = 0.5;
  const dx = (tx - sx) * curvature;

  return [
    `M ${sx} ${sy}`,
    `C ${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`,
    `L ${tx} ${ty + th}`,
    `C ${tx - dx} ${ty + th}, ${sx + dx} ${sy + sh}, ${sx} ${sy + sh}`,
    "Z",
  ].join(" ");
}

export function formatSankeyValue(value: number) {
  return `$${Math.round(value)}`;
}

export function layoutSankey(
  nodeDefs: SankeyNodeDef[],
  links: SankeyLinkDef[],
  width: number,
  height: number,
  options?: { nodeWidth?: number; nodePadding?: number; padX?: number; padY?: number },
): { nodes: SankeyLayoutNode[]; layoutLinks: SankeyLayoutLink[] } {
  const nodeWidth = options?.nodeWidth ?? 5;
  const nodePadding = options?.nodePadding ?? 10;
  const padX = options?.padX ?? 52;
  const padY = options?.padY ?? 12;

  const maxColumn = Math.max(...nodeDefs.map((node) => node.column));
  const columns = Array.from({ length: maxColumn + 1 }, (_, column) =>
    nodeDefs
      .filter((node) => node.column === column)
      .map((node) => ({
        ...node,
        value: nodeValue(node.id, links),
      }))
      .sort((a, b) => {
        const order = nodeDefs.map((item) => item.id);
        return order.indexOf(a.id) - order.indexOf(b.id);
      }),
  );

  const innerWidth = width - padX * 2;
  const innerHeight = height - padY * 2;
  const columnStep = maxColumn > 0 ? innerWidth / maxColumn : innerWidth;
  const globalTotal = Math.max(...columns.map((columnNodes) => columnNodes.reduce((sum, node) => sum + node.value, 0)), 1);
  const valueScale = innerHeight / globalTotal;

  const positioned = new Map<string, SankeyLayoutNode>();

  columns.forEach((columnNodes, column) => {
    const columnTotal = columnNodes.reduce((sum, node) => sum + node.value, 0);
    const columnHeight = columnTotal * valueScale + nodePadding * Math.max(columnNodes.length - 1, 0);
    let y = padY + (innerHeight - columnHeight) / 2;

    columnNodes.forEach((node) => {
      const nodeHeight = node.value * valueScale;
      const x = padX + column * columnStep - nodeWidth / 2;

      positioned.set(node.id, {
        id: node.id,
        label: node.label,
        kind: node.kind,
        column,
        x,
        y,
        width: nodeWidth,
        height: Math.max(2, nodeHeight),
        value: node.value,
        labelPosition: node.labelPosition ?? defaultLabelPosition(column, maxColumn),
      });

      y += nodeHeight + nodePadding;
    });
  });

  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();

  const sortedLinks = [...links].sort((a, b) => {
    const sourceA = positioned.get(a.source);
    const sourceB = positioned.get(b.source);
    const targetA = positioned.get(a.target);
    const targetB = positioned.get(b.target);
    return (targetA?.y ?? 0) - (targetB?.y ?? 0) || (sourceA?.y ?? 0) - (sourceB?.y ?? 0);
  });

  const layoutLinks: SankeyLayoutLink[] = sortedLinks.map((link) => {
    const source = positioned.get(link.source)!;
    const target = positioned.get(link.target)!;
    const sourceTotal = links.filter((item) => item.source === link.source).reduce((sum, item) => sum + item.value, 0) || 1;
    const targetTotal = links.filter((item) => item.target === link.target).reduce((sum, item) => sum + item.value, 0) || 1;

    const sh = (link.value / sourceTotal) * source.height;
    const th = (link.value / targetTotal) * target.height;
    const sy = source.y + (sourceOffsets.get(link.source) ?? 0);
    const ty = target.y + (targetOffsets.get(link.target) ?? 0);

    sourceOffsets.set(link.source, (sourceOffsets.get(link.source) ?? 0) + sh);
    targetOffsets.set(link.target, (targetOffsets.get(link.target) ?? 0) + th);

    return {
      path: sankeyLinkPath(source.x + source.width, sy, sh, target.x, ty, th),
      sourceKind: source.kind,
      targetKind: target.kind,
      value: link.value,
    };
  });

  return { nodes: [...positioned.values()], layoutLinks };
}
