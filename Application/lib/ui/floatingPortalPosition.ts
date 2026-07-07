import type { DropdownMenuPlacement } from "opus-react";

export type FloatingPortalStyle = {
  left: number;
  top: number;
  width?: number;
};

export function resolveDropdownPortalStyle(
  anchorRect: DOMRect,
  menuRect: DOMRect | null,
  placement: DropdownMenuPlacement,
  elevated: boolean,
): FloatingPortalStyle {
  const gap = elevated ? 6 : 8;
  const menuWidth = menuRect?.width ?? Math.min(260, window.innerWidth - 32);
  const menuHeight = menuRect?.height ?? 0;

  switch (placement) {
    case "bottom-end":
      return { top: anchorRect.bottom + gap, left: anchorRect.right - menuWidth };
    case "top-start":
      return { top: anchorRect.top - gap - menuHeight, left: anchorRect.left };
    case "top-end":
      return { top: anchorRect.top - gap - menuHeight, left: anchorRect.right - menuWidth };
    case "bottom-start":
    default:
      return { top: anchorRect.bottom + gap, left: anchorRect.left };
  }
}

export function resolveMegaMenuPortalStyle(
  root: HTMLElement,
  inTopNavigation: boolean,
): FloatingPortalStyle {
  const bar = root.closest("header");
  const anchorRect = (inTopNavigation && bar ? bar : root).getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const width = inTopNavigation
    ? anchorRect.width
    : Math.min(Math.max(anchorRect.width, 280), viewportWidth - 32);
  const left = inTopNavigation
    ? anchorRect.left
    : Math.min(Math.max(anchorRect.left, 16), viewportWidth - width - 16);

  return {
    top: anchorRect.bottom + (inTopNavigation ? 2 : 10),
    left,
    width,
  };
}
