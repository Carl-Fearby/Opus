export type LayoutCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup: "Layout";
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
    | "spacer";
  sourceFiles: string[];
  title: string;
};

export const layoutCatalog = [
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
