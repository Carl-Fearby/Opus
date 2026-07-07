export type TreemapItem = {
  index: number;
  label: string;
  value: number;
};

export type TreemapRect = TreemapItem & {
  group?: string;
  groupIndex?: number;
  height: number;
  width: number;
  x: number;
  y: number;
};

export type TreemapGroupLayout = {
  group: string;
  groupIndex: number;
  height: number;
  width: number;
  x: number;
  y: number;
};

export type GroupedTreemapLayout = {
  groups: TreemapGroupLayout[];
  rects: TreemapRect[];
};

function worst(row: TreemapItem[], length: number) {
  if (!row.length) {
    return Infinity;
  }

  const sum = row.reduce((total, item) => total + item.value, 0);
  const max = Math.max(...row.map((item) => item.value));
  const min = Math.min(...row.map((item) => item.value));
  const sumSq = sum * sum;
  const lenSq = length * length;
  return Math.max((lenSq * max) / sumSq, sumSq / (lenSq * min));
}

export function layoutSquarifiedTreemap(
  items: TreemapItem[],
  x: number,
  y: number,
  width: number,
  height: number,
): TreemapRect[] {
  if (!items.length || width <= 0 || height <= 0) {
    return [];
  }

  if (items.length === 1) {
    return [{ ...items[0], x, y, width, height }];
  }

  const total = items.reduce((sum, item) => sum + item.value, 0);
  const vertical = width < height;
  const length = vertical ? height : width;
  const row: TreemapItem[] = [];
  const rest = [...items];
  const result: TreemapRect[] = [];

  while (rest.length) {
    const candidate = rest[0];
    const trial = [...row, candidate];
    if (row.length && worst(trial, length) > worst(row, length)) {
      break;
    }
    row.push(candidate);
    rest.shift();
  }

  const rowSum = row.reduce((sum, item) => sum + item.value, 0);
  const strip = (rowSum / total) * (vertical ? width : height);

  let offset = vertical ? y : x;
  for (const item of row) {
    const share = item.value / rowSum;
    if (vertical) {
      const rectHeight = share * length;
      result.push({ ...item, x, y: offset, width: strip, height: rectHeight });
      offset += rectHeight;
    } else {
      const rectWidth = share * length;
      result.push({ ...item, x: offset, y, width: rectWidth, height: strip });
      offset += rectWidth;
    }
  }

  if (vertical) {
    result.push(...layoutSquarifiedTreemap(rest, x + strip, y, width - strip, height));
  } else {
    result.push(...layoutSquarifiedTreemap(rest, x, y + strip, width, height - strip));
  }

  return result;
}

export function layoutGroupedTreemap(
  items: Array<TreemapItem & { group?: string }>,
  x: number,
  y: number,
  width: number,
  height: number,
): GroupedTreemapLayout {
  const grouped = new Map<string, TreemapItem[]>();
  for (const item of items) {
    const key = item.group?.trim() || "";
    const bucket = grouped.get(key) ?? [];
    bucket.push(item);
    grouped.set(key, bucket);
  }

  const groups = [...grouped.entries()]
    .filter(([key]) => key.length > 0)
    .map(([group, groupItems], groupIndex) => ({
      group,
      groupIndex,
      items: [...groupItems].sort((a, b) => b.value - a.value),
      total: groupItems.reduce((sum, item) => sum + item.value, 0),
    }))
    .sort((a, b) => b.total - a.total);

  if (!groups.length) {
    return {
      groups: [],
      rects: layoutSquarifiedTreemap(items, x, y, width, height),
    };
  }

  const grandTotal = groups.reduce((sum, group) => sum + group.total, 0) || 1;
  const rects: TreemapRect[] = [];
  const layouts: TreemapGroupLayout[] = [];
  let offsetX = x;

  for (const group of groups) {
    const columnWidth = (group.total / grandTotal) * width;
    layouts.push({
      group: group.group,
      groupIndex: group.groupIndex,
      x: offsetX,
      y,
      width: columnWidth,
      height,
    });
    rects.push(
      ...layoutSquarifiedTreemap(group.items, offsetX, y, columnWidth, height).map((rect) => ({
        ...rect,
        group: group.group,
        groupIndex: group.groupIndex,
      })),
    );
    offsetX += columnWidth;
  }

  return { groups: layouts, rects };
}
