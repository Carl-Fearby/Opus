export type CirclePackItem = {
  index: number;
  label: string;
  parent?: string;
  value: number;
};

export type CirclePackNode = CirclePackItem & {
  colorIndex: number;
  depth: number;
  isParent: boolean;
  r: number;
  x: number;
  y: number;
};

type InternalNode = {
  children: InternalNode[];
  index: number;
  label: string;
  leafValue: number;
  parent?: string;
  value: number;
};

type LocalPack = {
  circles: CirclePackNode[];
  r: number;
};

function placeTangent(
  a: { r: number; x: number; y: number },
  b: { r: number; x: number; y: number },
  radius: number,
  padding: number,
): Array<{ x: number; y: number }> {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);

  if (distance < 1e-6) {
    return [];
  }

  const aRadius = a.r + radius + padding;
  const bRadius = b.r + radius + padding;

  if (distance > aRadius + bRadius) {
    return [];
  }

  const a2 = aRadius * aRadius;
  const b2 = bRadius * bRadius;
  const d2 = distance * distance;
  const x = (a2 - b2 + d2) / (2 * distance);
  const y = Math.sqrt(Math.max(0, a2 - x * x));
  const mx = a.x + (dx * x) / distance;
  const my = a.y + (dy * x) / distance;
  const nx = (-dy * y) / distance;
  const ny = (dx * y) / distance;

  return [
    { x: mx + nx, y: my + ny },
    { x: mx - nx, y: my - ny },
  ];
}

function hasCollision(
  candidate: { x: number; y: number },
  radius: number,
  placed: Array<{ r: number; x: number; y: number }>,
  padding: number,
) {
  for (const circle of placed) {
    const minDistance = radius + circle.r + padding;
    const dx = candidate.x - circle.x;
    const dy = candidate.y - circle.y;
    if (minDistance * minDistance > dx * dx + dy * dy - 1e-4) {
      return true;
    }
  }

  return false;
}

function enclosingRadius(circles: Array<{ r: number; x: number; y: number }>) {
  let radius = 0;
  for (const circle of circles) {
    radius = Math.max(radius, Math.hypot(circle.x, circle.y) + circle.r);
  }
  return radius;
}

function fitPackedCircles(circles: CirclePackNode[], width: number, height: number, padding: number) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const circle of circles) {
    minX = Math.min(minX, circle.x - circle.r);
    minY = Math.min(minY, circle.y - circle.r);
    maxX = Math.max(maxX, circle.x + circle.r);
    maxY = Math.max(maxY, circle.y + circle.r);
  }

  const boundsWidth = maxX - minX + padding * 2;
  const boundsHeight = maxY - minY + padding * 2;
  const scale = Math.min(width / boundsWidth, height / boundsHeight);
  const offsetX = (width - boundsWidth * scale) / 2 - (minX - padding) * scale;
  const offsetY = (height - boundsHeight * scale) / 2 - (minY - padding) * scale;

  return circles.map((circle) => ({
    ...circle,
    x: circle.x * scale + offsetX,
    y: circle.y * scale + offsetY,
    r: circle.r * scale,
  }));
}

function packFlatCircles(
  items: CirclePackItem[],
  width: number,
  height: number,
  padding: number,
): CirclePackNode[] {
  if (!items.length || width <= 0 || height <= 0) {
    return [];
  }

  const maxValue = Math.max(1, ...items.map((item) => item.value));
  const fit = Math.min(width, height);

  const circles = items
    .map((item) => ({
      ...item,
      colorIndex: item.index,
      depth: 0,
      isParent: false,
      r: Math.max(12, Math.sqrt(item.value / maxValue) * fit * 0.24),
      x: 0,
      y: 0,
    }))
    .sort((a, b) => b.r - a.r);

  if (circles.length === 1) {
    return fitPackedCircles([{ ...circles[0], x: 0, y: 0 }], width, height, padding);
  }

  circles[0].x = 0;
  circles[0].y = 0;
  circles[1].x = circles[0].r + circles[1].r + padding;
  circles[1].y = 0;

  for (let index = 2; index < circles.length; index++) {
    const circle = circles[index];
    const placed = circles.slice(0, index);
    let best: { dist: number; x: number; y: number } | null = null;

    for (let left = 0; left < index; left++) {
      for (let right = left + 1; right < index; right++) {
        for (const position of placeTangent(placed[left], placed[right], circle.r, padding)) {
          if (!hasCollision(position, circle.r, placed, padding)) {
            const dist = Math.hypot(position.x, position.y);
            if (!best || dist < best.dist) {
              best = { ...position, dist };
            }
          }
        }
      }
    }

    if (!best) {
      for (const anchor of placed) {
        const orbit = anchor.r + circle.r + padding;
        for (let step = 0; step < 16; step++) {
          const angle = (step / 16) * Math.PI * 2;
          const position = {
            x: anchor.x + Math.cos(angle) * orbit,
            y: anchor.y + Math.sin(angle) * orbit,
          };
          if (!hasCollision(position, circle.r, placed, padding)) {
            const dist = Math.hypot(position.x, position.y);
            if (!best || dist < best.dist) {
              best = { ...position, dist };
            }
          }
        }
      }
    }

    circle.x = best?.x ?? placed[index - 1].x + placed[index - 1].r + circle.r + padding;
    circle.y = best?.y ?? 0;
  }

  return fitPackedCircles(circles, width, height, padding);
}

function buildForest(items: CirclePackItem[]): InternalNode[] {
  const nodes = new Map<string, InternalNode>();

  for (const item of items) {
    nodes.set(item.label, {
      children: [],
      index: item.index,
      label: item.label,
      leafValue: Math.max(0, item.value),
      parent: item.parent,
      value: Math.max(0, item.value),
    });
  }

  const roots: InternalNode[] = [];
  for (const node of nodes.values()) {
    if (node.parent && nodes.has(node.parent)) {
      nodes.get(node.parent)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function assignTotals(node: InternalNode): number {
    if (!node.children.length) {
      node.value = Math.max(1, node.leafValue);
      return node.value;
    }

    const total = node.children.reduce((sum, child) => sum + assignTotals(child), 0);
    node.value = Math.max(1, total);
    return node.value;
  }

  roots.forEach(assignTotals);
  return roots;
}

function transformCircles(circles: CirclePackNode[], offsetX: number, offsetY: number, scale: number) {
  return circles.map((circle) => ({
    ...circle,
    r: circle.r * scale,
    x: offsetX + circle.x * scale,
    y: offsetY + circle.y * scale,
  }));
}

function packNode(node: InternalNode, depth: number, padding: number, colorIndex = node.index): LocalPack {
  if (!node.children.length) {
    const r = Math.max(10, Math.sqrt(node.value) * 2.4);
    return {
      r,
      circles: [
        {
          colorIndex,
          depth,
          index: node.index,
          isParent: false,
          label: node.label,
          parent: node.parent,
          r,
          value: node.value,
          x: 0,
          y: 0,
        },
      ],
    };
  }

  const childPacks = node.children.map((child) => packNode(child, depth + 1, padding, colorIndex));
  const maxChildRadius = Math.max(...childPacks.map((pack) => pack.r), 1);
  const canvas = maxChildRadius * 2.8;
  const positioned = packFlatCircles(
    childPacks.map((pack, index) => ({
      index: node.children[index].index,
      label: node.children[index].label,
      parent: node.children[index].parent,
      value: pack.r * pack.r,
    })),
    canvas,
    canvas,
    padding,
  );

  const merged: CirclePackNode[] = [];
  for (let index = 0; index < positioned.length; index++) {
    const scale = positioned[index].r / childPacks[index].r;
    merged.push(
      ...transformCircles(childPacks[index].circles, positioned[index].x, positioned[index].y, scale),
    );
  }

  const enclosing = enclosingRadius(merged) + padding;
  merged.unshift({
    colorIndex,
    depth,
    index: node.index,
    isParent: true,
    label: node.label,
    parent: node.parent,
    r: enclosing,
    value: node.value,
    x: 0,
    y: 0,
  });

  return {
    circles: merged,
    r: enclosing,
  };
}

function packHierarchy(roots: InternalNode[], width: number, height: number, padding: number): CirclePackNode[] {
  if (!roots.length) {
    return [];
  }

  if (roots.length === 1 && roots[0].children.length) {
    const packed = packNode(roots[0], 0, padding);
    return fitPackedCircles(packed.circles, width, height, padding);
  }

  const rootPacks = roots.map((root) => packNode(root, 0, padding));
  const positioned = packFlatCircles(
    rootPacks.map((pack, index) => ({
      index: roots[index].index,
      label: roots[index].label,
      parent: roots[index].parent,
      value: pack.r * pack.r,
    })),
    width,
    height,
    padding,
  );

  const merged: CirclePackNode[] = [];
  for (let index = 0; index < positioned.length; index++) {
    const scale = positioned[index].r / rootPacks[index].r;
    merged.push(
      ...transformCircles(rootPacks[index].circles, positioned[index].x, positioned[index].y, scale),
    );
  }

  return merged;
}

export function layoutCirclePack(
  items: CirclePackItem[],
  width: number,
  height: number,
  padding = 3,
): CirclePackNode[] {
  if (!items.length || width <= 0 || height <= 0) {
    return [];
  }

  const hasHierarchy = items.some((item) => item.parent);
  if (!hasHierarchy) {
    return packFlatCircles(items, width, height, padding);
  }

  const roots = buildForest(items);
  return packHierarchy(roots, width, height, padding);
}
