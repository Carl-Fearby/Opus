import type { ChartDatum } from "@/components/Chart";

export type NetworkLayoutNode = {
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
  radius: number;
  depth: number;
  groupIndex: number;
  showRing: boolean;
  showLabel: boolean;
};

export type NetworkLayoutEdge = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  groupIndex?: number;
};

type LayoutItem = Pick<ChartDatum, "label" | "value" | "parent" | "group">;

function nodeRadius(depth: number, labeled: boolean) {
  if (depth === 0) {
    return labeled ? 22 : 16;
  }

  if (depth === 1) {
    return labeled ? 15 : 11;
  }

  if (depth === 2) {
    return labeled ? 10 : 7;
  }

  return labeled ? 7 : 4.5;
}

function scaleToPlot(
  nodes: Array<Omit<NetworkLayoutNode, "groupIndex" | "showRing" | "showLabel"> & { group?: string }>,
  width: number,
  height: number,
  pad: number,
  labeled: boolean,
) {
  const groupIds = [...new Set(nodes.map((node) => node.group ?? node.id))];

  return nodes.map((node) => {
    const depth = node.depth;
    const radius = nodeRadius(depth, labeled);

    return {
      ...node,
      x: pad + node.x * (width - pad * 2),
      y: pad + node.y * (height - pad * 2),
      radius,
      groupIndex: groupIds.indexOf(node.group ?? node.id),
      showRing: labeled && depth <= 1,
      showLabel: labeled && radius >= 8,
    };
  });
}

function polarOffset(x: number, y: number, distance: number, angle: number) {
  return {
    x: x + Math.cos(angle) * distance,
    y: y + Math.sin(angle) * distance,
  };
}

function placeFan(
  nodes: Array<{ id: string; label: string; value: number; depth: number; group?: string; x: number; y: number }>,
  parentId: string,
  parentX: number,
  parentY: number,
  baseAngle: number,
  distance: number,
  spread: number,
  labels: string[],
  depth: number,
  group?: string,
) {
  const count = labels.length;
  const start = baseAngle - ((count - 1) * spread) / 2;

  labels.forEach((label, index) => {
    const angle = count === 1 ? baseAngle : start + index * spread;
    const point = polarOffset(parentX, parentY, distance, angle);
    nodes.push({
      id: label,
      label,
      value: 6,
      depth,
      group: group ?? parentId,
      x: point.x,
      y: point.y,
    });
  });
}

export function layoutForceDirectedGraph(items: LayoutItem[], width: number, height: number): {
  nodes: NetworkLayoutNode[];
  edges: NetworkLayoutEdge[];
} {
  const nodes: Array<{
    id: string;
    label: string;
    value: number;
    depth: number;
    group?: string;
    x: number;
    y: number;
  }> = [];

  const spine = [
    { id: "3", x: 0.24, y: 0.5, value: 28, group: "0" },
    { id: "2", x: 0.5, y: 0.5, value: 18, group: "1" },
    { id: "1", x: 0.76, y: 0.5, value: 28, group: "2" },
  ];

  spine.forEach((node) => {
    nodes.push({ ...node, label: node.id, depth: 0 });
  });

  const hub3Children = [
    { id: "F", angle: -Math.PI / 2, value: 14 },
    { id: "G", angle: Math.PI, value: 14 },
    { id: "H", angle: Math.PI / 2, value: 14 },
  ];
  hub3Children.forEach((child) => {
    const point = polarOffset(0.24, 0.5, 0.14, child.angle);
    nodes.push({
      id: child.id,
      label: child.id,
      value: child.value,
      depth: 1,
      group: "0",
      x: point.x,
      y: point.y,
    });
    placeFan(
      nodes,
      child.id,
      point.x,
      point.y,
      child.angle,
      0.1,
      Math.PI / 10,
      Array.from({ length: 5 }, (_, index) => `${child.id}${index + 1}`),
      2,
      child.id,
    );
  });

  const hub1Children = [
    { id: "A", angle: -Math.PI / 3, value: 14 },
    { id: "B", angle: 0, value: 14 },
    { id: "C", angle: Math.PI / 3, value: 14 },
  ];
  hub1Children.forEach((child) => {
    const point = polarOffset(0.76, 0.5, 0.14, child.angle);
    nodes.push({
      id: child.id,
      label: child.id,
      value: child.value,
      depth: 1,
      group: "2",
      x: point.x,
      y: point.y,
    });
    placeFan(
      nodes,
      child.id,
      point.x,
      point.y,
      child.angle,
      0.1,
      Math.PI / 10,
      Array.from({ length: 5 }, (_, index) => `${child.id}${index + 1}`),
      2,
      child.id,
    );
  });

  nodes.push(
    { id: "D", label: "D", value: 10, depth: 1, group: "1", x: 0.5, y: 0.34 },
    { id: "E", label: "E", value: 10, depth: 1, group: "1", x: 0.5, y: 0.66 },
  );

  const itemMap = new Map(items.map((item) => [item.label, item]));
  const placed = scaleToPlot(
    nodes.map((node) => ({
      ...node,
      value: itemMap.get(node.id)?.value ?? node.value,
      group: itemMap.get(node.id)?.group ?? node.group,
    })),
    width,
    height,
    18,
    true,
  );

  const byId = new Map(placed.map((node) => [node.id, node]));
  const edges: NetworkLayoutEdge[] = [
    { x1: byId.get("3")!.x, y1: byId.get("3")!.y, x2: byId.get("2")!.x, y2: byId.get("2")!.y, groupIndex: byId.get("3")!.groupIndex },
    { x1: byId.get("2")!.x, y1: byId.get("2")!.y, x2: byId.get("1")!.x, y2: byId.get("1")!.y, groupIndex: byId.get("2")!.groupIndex },
  ];

  const childLinks: Array<[string, string]> = [
    ["3", "F"],
    ["3", "G"],
    ["3", "H"],
    ["1", "A"],
    ["1", "B"],
    ["1", "C"],
    ["2", "D"],
    ["2", "E"],
    ...hub3Children.flatMap((child) => Array.from({ length: 5 }, (_, index) => [child.id, `${child.id}${index + 1}`] as [string, string])),
    ...hub1Children.flatMap((child) => Array.from({ length: 5 }, (_, index) => [child.id, `${child.id}${index + 1}`] as [string, string])),
  ];

  childLinks.forEach(([from, to]) => {
    const source = byId.get(from);
    const target = byId.get(to);
    if (source && target) {
      edges.push({
        x1: source.x,
        y1: source.y,
        x2: target.x,
        y2: target.y,
        groupIndex: source.groupIndex,
      });
    }
  });

  return { nodes: placed, edges };
}

export function layoutRadialNetworkGraph(items: LayoutItem[], width: number, height: number): {
  nodes: NetworkLayoutNode[];
  edges: NetworkLayoutEdge[];
} {
  const nodes: Array<{
    id: string;
    label: string;
    value: number;
    depth: number;
    group?: string;
    x: number;
    y: number;
  }> = [
    { id: "Core", label: "Core", value: 32, depth: 0, group: "core", x: 0.5, y: 0.5 },
  ];

  const branches = [
    { id: "B1", angle: -Math.PI / 2, leaves: 2 },
    { id: "B2", angle: -Math.PI / 6, leaves: 2 },
    { id: "B3", angle: Math.PI / 6, leaves: 3 },
    { id: "B4", angle: Math.PI / 2, leaves: 2 },
    { id: "B5", angle: (5 * Math.PI) / 6, leaves: 2 },
    { id: "B6", angle: (-5 * Math.PI) / 6, leaves: 2 },
    { id: "B7", angle: Math.PI, leaves: 2 },
  ];

  branches.forEach((branch, branchIndex) => {
    const primary = polarOffset(0.5, 0.5, 0.18, branch.angle);
    nodes.push({
      id: branch.id,
      label: branch.id,
      value: 16,
      depth: 1,
      group: `branch-${branchIndex}`,
      x: primary.x,
      y: primary.y,
    });

    const secondaryAngles =
      branch.leaves === 3
        ? [branch.angle - 0.18, branch.angle, branch.angle + 0.18]
        : [branch.angle - 0.12, branch.angle + 0.12];

    secondaryAngles.forEach((angle, secondaryIndex) => {
      const secondaryId = `${branch.id}.${secondaryIndex + 1}`;
      const secondary = polarOffset(primary.x, primary.y, 0.12, angle);
      nodes.push({
        id: secondaryId,
        label: secondaryId,
        value: 10,
        depth: 2,
        group: `branch-${branchIndex}`,
        x: secondary.x,
        y: secondary.y,
      });

      const leafCount = branch.leaves === 3 && secondaryIndex === 1 ? 2 : 1;
      const leafSpread = leafCount === 2 ? 0.22 : 0;
      const leafStart = angle - ((leafCount - 1) * leafSpread) / 2;
      Array.from({ length: leafCount }, (_, leafIndex) => {
        const leafAngle = leafCount === 1 ? angle : leafStart + leafIndex * leafSpread;
        const leaf = polarOffset(secondary.x, secondary.y, 0.09, leafAngle);
        nodes.push({
          id: `${secondaryId}.${leafIndex + 1}`,
          label: `${secondaryId}.${leafIndex + 1}`,
          value: 6,
          depth: 3,
          group: `branch-${branchIndex}`,
          x: leaf.x,
          y: leaf.y,
        });
      });
    });
  });

  const itemMap = new Map(items.map((item) => [item.label, item]));
  const placed = scaleToPlot(
    nodes.map((node) => ({
      ...node,
      value: itemMap.get(node.id)?.value ?? node.value,
      group: itemMap.get(node.id)?.group ?? node.group,
    })),
    width,
    height,
    14,
    false,
  );

  const byId = new Map(placed.map((node) => [node.id, node]));
  const edges: NetworkLayoutEdge[] = [];

  branches.forEach((branch) => {
    const core = byId.get("Core")!;
    const primary = byId.get(branch.id)!;
    edges.push({ x1: core.x, y1: core.y, x2: primary.x, y2: primary.y });

    const secondaryAngles =
      branch.leaves === 3
        ? [branch.angle - 0.18, branch.angle, branch.angle + 0.18]
        : [branch.angle - 0.12, branch.angle + 0.12];

    secondaryAngles.forEach((_, secondaryIndex) => {
      const secondaryId = `${branch.id}.${secondaryIndex + 1}`;
      const secondary = byId.get(secondaryId);
      if (!secondary) {
        return;
      }

      edges.push({ x1: primary.x, y1: primary.y, x2: secondary.x, y2: secondary.y });

      const leafCount = branch.leaves === 3 && secondaryIndex === 1 ? 2 : 1;
      Array.from({ length: leafCount }, (_, leafIndex) => {
        const leaf = byId.get(`${secondaryId}.${leafIndex + 1}`);
        if (leaf) {
          edges.push({ x1: secondary.x, y1: secondary.y, x2: leaf.x, y2: leaf.y });
        }
      });
    });
  });

  return { nodes: placed, edges };
}
