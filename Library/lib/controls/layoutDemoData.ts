import type { ReactNode } from "react";

export const layoutDemoTiles = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta"];

export const layoutScrollLines = Array.from({ length: 24 }, (_, index) => `Line ${index + 1} — opus layout demo content`);

export function layoutDemoBox(label: string): ReactNode {
  return label;
}
