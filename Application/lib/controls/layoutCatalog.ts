export type LayoutCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup: "Desktop" | "Layout";
  slug:
    | "stack"
    | "columns"
    | "grid"
    | "splitter"
    | "resize-handle"
    | "resizable-panel"
    | "dock-layout"
    | "three-pane-layout"
    | "custom-scrollbar"
    | "scroll-area"
    | "aspect-ratio"
    | "container"
    | "spacer"
    | "desktop"
    | "desktop-window"
    | "desktop-dock"
    | "desktop-icon";
  sourceFiles: string[];
  title: string;
};

export const layoutCatalog = [
  {
    slug: "desktop",
    title: "Desktop",
    componentName: "Desktop",
    navigationGroup: "Desktop",
    description: "Desktop canvas that coordinates shortcuts, application windows, focus order, and a dock.",
    sourceFiles: ["components/Desktop/Desktop.tsx", "components/Desktop/Desktop.module.css"],
  },
  {
    slug: "desktop-window",
    title: "Desktop Window",
    componentName: "DesktopWindow",
    navigationGroup: "Desktop",
    description: "Draggable and edge-resizable window with close, minimize, maximize, restore, and focus callbacks.",
    sourceFiles: ["components/DesktopWindow/DesktopWindow.tsx", "components/DesktopWindow/DesktopWindow.module.css"],
  },
  {
    slug: "desktop-dock",
    title: "Desktop Dock",
    componentName: "DesktopDock",
    navigationGroup: "Desktop",
    description: "Glass desktop application dock with active and minimized application state.",
    sourceFiles: ["components/DesktopDock/DesktopDock.tsx", "components/DesktopDock/DesktopDock.module.css"],
  },
  {
    slug: "desktop-icon",
    title: "Desktop Icon",
    componentName: "DesktopIcon",
    navigationGroup: "Desktop",
    description: "Tile-inspired glowing desktop shortcut with selection and open behavior.",
    sourceFiles: ["components/DesktopIcon/DesktopIcon.tsx", "components/DesktopIcon/DesktopIcon.module.css"],
  },
  {
    slug: "stack",
    title: "Stack",
    componentName: "Stack",
    navigationGroup: "Layout",
    description: "Flex layout for stacking children horizontally or vertically with shared gap.",
    sourceFiles: ["components/Stack/Stack.tsx", "components/Stack/Stack.module.css"],
  },
  {
    slug: "columns",
    title: "Columns",
    componentName: "Columns",
    navigationGroup: "Layout",
    description: "Equal-width column layout for placing children side by side or stacked in one column.",
    sourceFiles: ["components/Columns/Columns.tsx", "components/Columns/Columns.module.css"],
  },
  {
    slug: "grid",
    title: "Grid",
    componentName: "Grid",
    navigationGroup: "Layout",
    description: "CSS grid for equal or auto-fit columns with configurable gap.",
    sourceFiles: ["components/Grid/Grid.tsx", "components/Grid/Grid.module.css"],
  },
  {
    slug: "splitter",
    title: "Splitter",
    componentName: "Splitter",
    navigationGroup: "Layout",
    description: "Two-pane layout with a draggable separator for resizing regions.",
    sourceFiles: ["components/Splitter/Splitter.tsx", "components/Splitter/Splitter.module.css"],
  },
  {
    slug: "resize-handle",
    title: "Resize Handle",
    componentName: "ResizeHandle",
    navigationGroup: "Layout",
    description: "Shared keyboard-accessible separator handle used by resizable layouts.",
    sourceFiles: ["components/ResizeHandle/ResizeHandle.tsx", "components/ResizeHandle/ResizeHandle.module.css"],
  },
  {
    slug: "resizable-panel",
    title: "Resizable Panel",
    componentName: "ResizablePanel",
    navigationGroup: "Layout",
    description: "Bounded panel that users can resize from the bottom-right handle.",
    sourceFiles: [
      "components/ResizablePanel/ResizablePanel.tsx",
      "components/ResizablePanel/ResizablePanel.module.css",
    ],
  },
  {
    slug: "dock-layout",
    title: "Dock Layout",
    componentName: "DockLayout",
    navigationGroup: "Layout",
    description: "IDE-style dock regions for top, left, center, right, and bottom panes.",
    sourceFiles: ["components/DockLayout/DockLayout.tsx", "components/DockLayout/DockLayout.module.css"],
  },
  {
    slug: "three-pane-layout",
    title: "Three Pane Layout",
    componentName: "ThreePaneLayout",
    navigationGroup: "Layout",
    description: "Application shell with optional persisted, resizable left and right sidebars around a main content pane.",
    sourceFiles: [
      "components/ThreePaneLayout/ThreePaneLayout.tsx",
      "components/ThreePaneLayout/ThreePaneLayout.module.css",
    ],
  },
  {
    slug: "custom-scrollbar",
    title: "Custom Scrollbar",
    componentName: "CustomScrollbar",
    navigationGroup: "Layout",
    description: "Custom draggable scrollbar with accessible keyboard controls and native wheel, touch, and trackpad behaviour.",
    sourceFiles: [
      "components/CustomScrollbar/CustomScrollbar.tsx",
      "components/CustomScrollbar/CustomScrollbar.module.css",
    ],
  },
  {
    slug: "scroll-area",
    title: "Scroll Area",
    componentName: "ScrollArea",
    navigationGroup: "Layout",
    description: "Accessible scroll region with custom draggable tracks, keyboard controls, and native wheel, touch, and trackpad scrolling.",
    sourceFiles: [
      "components/CustomScrollbar/CustomScrollbar.tsx",
      "components/CustomScrollbar/CustomScrollbar.module.css",
      "components/ScrollArea/ScrollArea.tsx",
    ],
  },
  {
    slug: "aspect-ratio",
    title: "Aspect Ratio",
    componentName: "AspectRatio",
    navigationGroup: "Layout",
    description: "Locks child content to a fixed media ratio such as 16:9 or 1:1.",
    sourceFiles: [
      "components/AspectRatio/AspectRatio.tsx",
      "components/AspectRatio/AspectRatio.module.css",
    ],
  },
  {
    slug: "container",
    title: "Container",
    componentName: "Container",
    navigationGroup: "Layout",
    description: "Centered max-width wrapper for page and section content.",
    sourceFiles: ["components/Container/Container.tsx", "components/Container/Container.module.css"],
  },
  {
    slug: "spacer",
    title: "Spacer",
    componentName: "Spacer",
    navigationGroup: "Layout",
    description: "Invisible spacing primitive for fixed gaps or flexible grow space.",
    sourceFiles: ["components/Spacer/Spacer.tsx", "components/Spacer/Spacer.module.css"],
  },
] as const satisfies readonly LayoutCatalogEntry[];

export type LayoutControlSlug = (typeof layoutCatalog)[number]["slug"];

export function isLayoutSlug(slug: string): slug is LayoutControlSlug {
  return layoutCatalog.some((entry) => entry.slug === slug);
}
