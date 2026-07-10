import type { DropdownMenuPlacement } from "opus-react";

export type EmojiPickerPlacement = "bottom" | "top";

export type FloatingPortalStyle = {
  left: number;
  top: number;
  width?: number;
};

export function resolveEmojiPickerPortalStyle(
  anchorRect: DOMRect,
  panelRect: DOMRect | null,
  placement: EmojiPickerPlacement,
): FloatingPortalStyle {
  const gap = 8;
  const viewportPadding = 16;
  const panelWidth = panelRect?.width ?? Math.min(352, window.innerWidth - viewportPadding * 2);
  const panelHeight = panelRect?.height ?? 0;

  let top =
    placement === "bottom" ? anchorRect.bottom + gap : anchorRect.top - gap - panelHeight;
  let left = anchorRect.left;

  if (
    placement === "top" &&
    top < viewportPadding &&
    anchorRect.bottom + gap + panelHeight <= window.innerHeight - viewportPadding
  ) {
    top = anchorRect.bottom + gap;
  } else if (
    placement === "bottom" &&
    top + panelHeight > window.innerHeight - viewportPadding &&
    anchorRect.top - gap - panelHeight >= viewportPadding
  ) {
    top = anchorRect.top - gap - panelHeight;
  }

  left = Math.min(
    Math.max(left, viewportPadding),
    window.innerWidth - panelWidth - viewportPadding,
  );
  top = Math.min(
    Math.max(top, viewportPadding),
    Math.max(viewportPadding, window.innerHeight - panelHeight - viewportPadding),
  );

  return { left, top, width: panelWidth };
}

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
