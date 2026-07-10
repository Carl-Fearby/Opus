export type Theme = "light" | "dark";
export type FieldMode = "stacked" | "flagged";
export type LabelPosition = "left" | "right";
export type ChoiceShape = "round" | "square";
export type ChoiceControlSize = "lg" | "md" | "sm";
export type InputControlSize = "lg" | "md" | "sm";
export type ChipInputVariant = "filled" | "outlined" | "soft" | "glass" | "gradient";
export type ChipInputPreset = "chip-input" | "tag-input" | "token-input";

export type ChoiceOption = {
  error?: string;
  label: string;
  value: string;
};

export type GalleryImage = {
  alt: string;
  caption?: string;
  id?: string;
  src: string;
};

export type ModelFireOverlay = {
  alphaSrc: string;
  colorSrc: string;
};

export type ModelAsset = {
  alt: string;
  animationName?: string;
  autoplay?: boolean;
  cameraOrbit?: string;
  description?: string;
  fireOverlay?: ModelFireOverlay;
  id?: string;
  name: string;
  src: string;
};

export type AlertStatus = "error" | "success" | "warning" | "info";
export type DialogActionSet = "ok" | "ok-cancel" | "yes-no" | "delete";
export type ModalSize = "small" | "medium" | "large" | "fullscreen";
export type DrawerSide = "left" | "right" | "top" | "bottom";
export type PopoverPlacement = "top" | "right" | "bottom" | "left";
export type DropdownMenuPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsVariant = "line" | "contained";
export type SurfaceTone = "default" | "accent" | "success" | "warning" | "danger" | "info";
export type SurfaceDensity = "comfortable" | "compact";
export type TableDensity = "comfortable" | "compact";
export type EmptyStateIcon = "folder" | "inbox" | "search";
export type SidebarSide = "left" | "right";
export type SkeletonVariant = "text" | "card" | "avatar" | "table";
export type SkeletonAnimation = "shimmer" | "pulse" | "none";
export type ImageThumbnailSize = "small" | "medium" | "large";
export type ModelThumbnailSize = "small" | "medium" | "large";
export type ChartPalette = "opus" | "cool" | "warm" | "mono";
export type ChartVariant =
  | "area"
  | "bar-horizontal"
  | "bar-vertical"
  | "box-plot"
  | "bubble"
  | "bubble-map"
  | "bullet"
  | "calendar-heatmap"
  | "candlestick"
  | "chord"
  | "choropleth"
  | "circle-packing"
  | "contour"
  | "density"
  | "donut"
  | "error-bar"
  | "force-directed"
  | "funnel"
  | "gantt"
  | "geo-map"
  | "grouped-bar"
  | "heatmap"
  | "hexbin"
  | "histogram"
  | "line"
  | "milestone-timeline"
  | "multi-line"
  | "network"
  | "ohlc"
  | "parallel-coordinates"
  | "pareto"
  | "pie"
  | "polar-area"
  | "pyramid"
  | "radar"
  | "range-area"
  | "range-bar"
  | "ridgeline"
  | "sankey"
  | "scatter"
  | "spline"
  | "stacked-area"
  | "stacked-bar"
  | "stacked-bar-100"
  | "stream"
  | "sunburst"
  | "surface"
  | "timeline"
  | "treemap"
  | "violin"
  | "waterfall";

export type ToastVerticalPosition = "top" | "bottom";
export type ToastHorizontalPosition = "left" | "right";

export type ToastViewportPosition = {
  horizontal: ToastHorizontalPosition;
  vertical: ToastVerticalPosition;
};

export type AccordionGroupType = "single" | "multiple";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export type BadgeVariant = "solid" | "soft" | "outline";
export type BadgeSize = "sm" | "md";
export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded";
export type DividerOrientation = "horizontal" | "vertical";
export type DividerTone = "default" | "muted" | "strong";
export type DescriptionListLayout = "stacked" | "inline";
export type ContentTimelineStatus = "default" | "success" | "warning" | "danger" | "muted";
export type StatisticTrend = "up" | "down" | "flat";
