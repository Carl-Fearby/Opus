import type {
  AccordionGroupType,
  AvatarShape,
  AvatarSize,
  BadgeSize,
  BadgeTone,
  BadgeVariant,
  ButtonVariant,
  ChartPalette,
  ChartVariant,
  ChipInputPreset,
  ChipInputVariant,
  ChoiceControlSize,
  ChoiceShape,
  DescriptionListLayout,
  DialogActionSet,
  DividerOrientation,
  DividerTone,
  DrawerSide,
  DropdownMenuPlacement,
  FieldMode,
  ImageThumbnailSize,
  InputControlSize,
  LabelPosition,
  ModalSize,
  ModelThumbnailSize,
  PopoverPlacement,
  SidebarSide,
  SkeletonAnimation,
  SkeletonVariant,
  AlertStatus,
  StatisticTrend,
  SurfaceDensity,
  SurfaceTone,
  TableDensity,
  TabsOrientation,
  TabsVariant,
  Theme,
  ToastHorizontalPosition,
  ToastVerticalPosition,
} from "opus-react";
import type {
  SectionColumns,
  SectionGap,
  SectionSidebar,
  SectionSidebarRatio,
  SectionStackBelow,
} from "@/lib/layout/sectionLayout";
import type { BuildersControlSlug } from "./buildersCatalog";
import type { ChartControlSlug } from "./chartCatalog";
import type { DashboardControlSlug } from "./dashboardCatalog";
import type {
  DashboardPreviewLayout,
  DashboardSectionHeight,
  DashboardSectionWidth,
} from "./dashboardPreview";
import type { LabsControlSlug } from "./labsCatalog";
import type { SystemControlSlug } from "./systemCatalog";
import type { LayoutControlSlug } from "./layoutCatalog";
import type { NavigationExtrasControlSlug } from "./navigationExtrasCatalog";
import type { TilesControlSlug } from "./tilesCatalog";

export type FontAwesomeIconName = string;

export type ControlSlug =
  | "button"
  | "submit-button"
  | "reset-button"
  | "checkbox"
  | "switch"
  | "radio-group"
  | "chip-input"
  | "choice-chips"
  | "color-picker"
  | "date-picker"
  | "time-picker"
  | "datetime-picker"
  | "month-picker"
  | "week-picker"
  | "email-input"
  | "url-input"
  | "search-input"
  | "file-upload"
  | "image-crop-upload"
  | "hidden-input"
  | "number-input"
  | "password-input"
  | "range-slider"
  | "select"
  | "text-input"
  | "textarea"
  | "note-composer"
  | "rich-text-field"
  | "filter-select"
  | "multi-select"
  | "transfer-list"
  | "password-strength-field"
  | "rating-input"
  | "segmented-control"
  | "slider-range"
  | "phone-number-input"
  | "country-picker"
  | "tree-select"
  | "cascader"
  | "theme-toggle"
  | "accent-color-picker"
  | "icon-picker"
  | "emoji-picker"
  | "tooltip"
  | "dialog"
  | "drawer"
  | "dropdown-menu"
  | "context-menu"
  | "modal"
  | "popover"
  | "command-palette"
  | "alert"
  | "toast"
  | "tabs"
  | "card"
  | "panel"
  | "section"
  | "table"
  | "data-grid"
  | "skeleton"
  | "carousel"
  | "lightbox"
  | "image-thumbnail"
  | "image-gallery"
  | "model-viewer"
  | "model-lightbox"
  | "model-thumbnail"
  | "model-gallery"
  | "accordion"
  | "accordion-group"
  | "show-more"
  | "empty-state"
  | "badge"
  | "avatar"
  | "avatar-group"
  | "list"
  | "description-list"
  | "divider"
  | "content-timeline"
  | "tree-view"
  | "masonry-grid"
  | "property-grid"
  | BuildersControlSlug
  | LayoutControlSlug
  | NavigationExtrasControlSlug
  | TilesControlSlug
  | "json-viewer"
  | "statistic"
  | "icon"
  | "icon-badge"
  | "spinner"
  | "clock"
  | "portal"
  | "portal-host"
  | "visually-hidden"
  | "focus-trap"
  | "keyboard-shortcut"
  | "hotkey-manager"
  | "copy-button"
  | "clipboard"
  | "theme-provider"
  | "theme-switcher"
  | "resize-observer"
  | "intersection-observer"
  | "sidebar"
  | "mega-menu"
  | "top-navigation"
  | ChartControlSlug
  | DashboardControlSlug
  | LabsControlSlug
  | SystemControlSlug;

export type ComponentCategory =
  "content" | "dashboard" | "forms" | "graphs" | "labs" | "overlays" | "system";

export type BaseFieldSettings = {
  mode: FieldMode;
  labelPosition: LabelPosition;
  label: string;
  errorEnabled: boolean;
  error: string;
  helpEnabled: boolean;
  help: string;
  required: boolean;
  size: InputControlSize;
};

export type ValueFieldSettings = BaseFieldSettings & {
  value: string;
  placeholder?: string;
  placeholderEnabled?: boolean;
};

export type TextInputSettings = BaseFieldSettings & {
  value: string;
  placeholder: string;
  placeholderEnabled: boolean;
};

export type TextareaSettings = BaseFieldSettings & {
  value: string;
  maxCharsEnabled: boolean;
  maxChars: number;
  placeholder: string;
  placeholderEnabled: boolean;
};

export type NoteComposerSettings = {
  placeholder: string;
  saveButtonLabel: string;
  showAttach: boolean;
  showEmoji: boolean;
  showMention: boolean;
  value: string;
};

export type RichTextFieldSettings = BaseFieldSettings & {
  value: string;
  placeholder: string;
  placeholderEnabled: boolean;
  minHeight: number;
};

export type SelectSettings = BaseFieldSettings & {
  value: string;
  options: string;
};

export type RadioGroupSettings = BaseFieldSettings & {
  value: string;
  shape: ChoiceShape;
  size: ChoiceControlSize;
  optionErrorsEnabled: boolean;
  optionError: string;
};

export type ChipInputSettings = BaseFieldSettings & {
  value: string[];
  placeholder: string;
  placeholderEnabled: boolean;
  variant: ChipInputVariant;
  preset: ChipInputPreset;
  disabled: boolean;
  readOnly: boolean;
};

export type ChoiceChipsSettings = BaseFieldSettings & {
  disabled: boolean;
  options: string;
  selectionMode: "multiple" | "single";
  value: string[];
  variant: "filled" | "outlined" | "soft" | "glass";
};

export type CheckboxSettings = BaseFieldSettings & {
  checked: boolean;
  shape: ChoiceShape;
  size: ChoiceControlSize;
};

export type SwitchSettings = BaseFieldSettings & {
  checked: boolean;
};

export type RangeSettings = BaseFieldSettings & {
  value: number;
  min: number;
  max: number;
  step: number;
};

export type SliderRangeSettings = BaseFieldSettings & {
  value: [number, number];
  min: number;
  max: number;
  step: number;
};

export type MultiSelectSettings = BaseFieldSettings & {
  value: string[];
  options: string;
};

export type FilterSelectSettings = BaseFieldSettings & {
  value: string[];
};

export type TransferListSettings = BaseFieldSettings & {
  available: string;
  selected: string[];
};

export type PasswordStrengthSettings = BaseFieldSettings & {
  value: string;
  showRequirements: boolean;
};

export type RatingInputSettings = BaseFieldSettings & {
  value: number;
  max: number;
  variant: "stars" | "hearts" | "numeric";
};

export type SegmentedControlSettings = BaseFieldSettings & {
  value: string;
  options: string;
};

export type PhoneNumberInputSettings = BaseFieldSettings & {
  value: string;
  countryCode: string;
};

export type CountryPickerSettings = BaseFieldSettings & {
  value: string;
  placeholder: string;
  placeholderEnabled: boolean;
  searchPlaceholder: string;
};

export type TreeSelectSettings = BaseFieldSettings & {
  value: string | null;
};

export type CascaderSettings = BaseFieldSettings & {
  value: string[];
};

export type NumberInputSettings = BaseFieldSettings & {
  value: number;
  min: number;
  max: number;
  step: number;
};

export type FileUploadSettings = BaseFieldSettings & {
  fileName: string;
};

export type ImageCropUploadSettings = BaseFieldSettings & {
  changeButtonLabel: string;
  cropButtonLabel: string;
  maxZoom: number;
  minZoom: number;
  outputSize: number;
  uploadLabel: string;
  value: string;
  viewportSize: number;
  zoomLabel: string;
  zoomStep: number;
};

export type ColorPickerSettings = BaseFieldSettings & {
  value: string;
};

export type HiddenInputSettings = BaseFieldSettings & {
  name: string;
  value: string;
};

export type ButtonSettings = {
  variant: ButtonVariant;
  label: string;
  disabled: boolean;
  size: InputControlSize;
};

export type ThemeToggleSettings = {
  mode: FieldMode;
  labelPosition: LabelPosition;
  label: string;
  helpEnabled: boolean;
  help: string;
  value: Theme;
};

export type AccentColorPickerSettings = {
  mode: FieldMode;
  labelPosition: LabelPosition;
  label: string;
  helpEnabled: boolean;
  help: string;
  value: string;
};

export type IconPickerSettings = {
  mode: FieldMode;
  labelPosition: LabelPosition;
  label: string;
  helpEnabled: boolean;
  help: string;
  value: string;
};

export type EmojiPickerSettings = {
  closeOnEscape: boolean;
  closeOnOutside: boolean;
  lastSelected: string;
  open: boolean;
  placement: "bottom" | "top";
  searchPlaceholder: string;
};

export type TooltipSettings = {
  content: string;
  demoLabel: string;
};

export type AlertSettings = {
  status: AlertStatus;
  title: string;
  description: string;
  dismissible: boolean;
  iconFlagged: boolean;
  visible: boolean;
};

export type DialogSettings = {
  actionSet: DialogActionSet;
  status: AlertStatus;
  title: string;
  description: string;
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  open: boolean;
};

export type ModalSettings = {
  title: string;
  description: string;
  content: string;
  contentType: "html" | "form";
  size: ModalSize;
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  closeButton: boolean;
  footerActions: boolean;
  open: boolean;
};

export type DrawerSettings = {
  title: string;
  description: string;
  content: string;
  contentType: "html" | "form";
  side: DrawerSide;
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  closeButton: boolean;
  footerActions: boolean;
  open: boolean;
};

export type PopoverSettings = {
  title: string;
  content: string;
  contentType: "html" | "form";
  placement: PopoverPlacement;
  closeOnOutside: boolean;
  closeOnEscape: boolean;
  showArrow: boolean;
  open: boolean;
};

export type DropdownMenuSettings = {
  placement: DropdownMenuPlacement;
  closeOnSelect: boolean;
  closeOnOutside: boolean;
  closeOnEscape: boolean;
  showIcons: boolean;
  showDestructive: boolean;
  showDisabled: boolean;
  open: boolean;
};

export type ContextMenuSettings = {
  closeOnSelect: boolean;
  closeOnOutside: boolean;
  closeOnEscape: boolean;
  showIcons: boolean;
  showDestructive: boolean;
  showDisabled: boolean;
  open: boolean;
  targetLabel: string;
};

export type CommandPaletteSettings = {
  closeOnSelect: boolean;
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  emptyMessage: string;
  open: boolean;
  placeholder: string;
  showDescriptions: boolean;
  showEmptyResults: boolean;
  showGroups: boolean;
  showShortcuts: boolean;
};

export type ToastSettings = {
  status: AlertStatus;
  title: string;
  description: string;
  descriptionEnabled: boolean;
  dismissible: boolean;
  autoDismissEnabled: boolean;
  positionVertical: ToastVerticalPosition;
  positionHorizontal: ToastHorizontalPosition;
};

export type AccordionSettings = {
  title: string;
  content: string;
  defaultOpen: boolean;
  disabled: boolean;
};

export type TabsSettings = {
  activeValue: string;
  disabledSecond: boolean;
  fitted: boolean;
  orientation: TabsOrientation;
  variant: TabsVariant;
};

export type CardSettings = {
  title: string;
  eyebrow: string;
  content: string;
  tone: SurfaceTone;
  density: SurfaceDensity;
  media: boolean;
  footerActions: boolean;
};

export type PanelSettings = {
  title: string;
  description: string;
  content: string;
  tone: SurfaceTone;
  density: SurfaceDensity;
  divided: boolean;
  bordered: boolean;
  footer: string;
};

export type SectionSettings = {
  title: string;
  description: string;
  sidebar: SectionSidebar;
  columns: SectionColumns;
  gap: SectionGap;
  stackBelow: SectionStackBelow;
  sidebarRatio: SectionSidebarRatio;
  sidebarTitle: string;
  sidebarContent: string;
  columnOneTitle: string;
  columnOneContent: string;
  columnTwoTitle: string;
  columnTwoContent: string;
  columnThreeTitle: string;
  columnThreeContent: string;
  columnFourTitle: string;
  columnFourContent: string;
  columnFiveTitle: string;
  columnFiveContent: string;
};

export type TableSettings = {
  caption: string;
  density: TableDensity;
  striped: boolean;
  bordered: boolean;
  showCaption: boolean;
  showEmpty: boolean;
  numericColumn: boolean;
};

export type DataGridLayoutSetting = "flat" | "grouped" | "tree" | "pivot";

export type DataGridSettings = {
  caption: string;
  density: TableDensity;
  striped: boolean;
  bordered: boolean;
  filterable: boolean;
  resizable: boolean;
  rowHeaderResizable: boolean;
  q1Q2Resizable: boolean;
  q1Q2SortFilter: boolean;
  sortable: boolean;
  stickyHeader: boolean;
  stickyFirstColumn: boolean;
  numericColumns: boolean;
  layout: DataGridLayoutSetting;
  masterDetail: boolean;
  virtualized: boolean;
  infiniteScroll: boolean;
};

export type SkeletonSettings = {
  animation: SkeletonAnimation;
  lines: number;
  variant: SkeletonVariant;
};

export type ChartSettings = {
  title: string;
  variant: ChartVariant;
  palette: ChartPalette;
  height: number;
  maximise: boolean;
  previewLayout: "single" | "split";
  showAxis: boolean;
  showGrid: boolean;
  showLegend: boolean;
  showValues: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  highlightLabel: string;
};

export type StatCardTrend = "up" | "down";

export type StatCardSettings = {
  change: string;
  density: SurfaceDensity;
  icon: FontAwesomeIconName;
  label: string;
  previewLayout: DashboardPreviewLayout;
  showChange: boolean;
  trend: StatCardTrend;
  value: string;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type GaugeFooterItem = {
  color?: string;
  label: string;
  trend?: StatCardTrend;
  value: string;
};

export type GaugeTrackTone = "neutral" | "soft" | "contrast" | "palette";
export type GaugeValueTone =
  "palette" | "accent" | "red" | "orange" | "blue" | "green";

export type GaugeSettings = {
  change: string;
  changeTrend: StatCardTrend;
  density: SurfaceDensity;
  footerMetricCount: number;
  palette: ChartPalette;
  previewLayout: DashboardPreviewLayout;
  subtitle: string;
  summary: string;
  title: string;
  trackTone: GaugeTrackTone;
  valueTone: GaugeValueTone;
  variant: "full" | "half";
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type SparklineSettings = {
  label: string;
  palette: ChartPalette;
  previewLayout: DashboardPreviewLayout;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type ProgressRingSettings = {
  label: string;
  max: number;
  previewLayout: DashboardPreviewLayout;
  value: number;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type ProgressBarSettings = {
  label: string;
  max: number;
  previewLayout: DashboardPreviewLayout;
  value: number;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type SpeedometerSettings = {
  label: string;
  max: number;
  previewLayout: DashboardPreviewLayout;
  value: number;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type MetricTileSettings = {
  icon: FontAwesomeIconName;
  label: string;
  previewLayout: DashboardPreviewLayout;
  showSparkline: boolean;
  value: string;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type PipelineOverviewSettings = {
  closingValue: string;
  negotiationValue: string;
  period: string;
  previewLayout: DashboardPreviewLayout;
  proposalValue: string;
  qualificationValue: string;
  stageCount: string;
  title: string;
  totalLabel: string;
  totalValue: string;
  width: DashboardSectionWidth;
  wonValue: string;
  wrapInContainer?: boolean;
};

export type DealsOverTimeSettings = {
  maxValue: string;
  palette: "blue" | "purple";
  period: string;
  previewLayout: DashboardPreviewLayout;
  title: string;
  valueLabel: string;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type DashboardListWidgetSettings = {
  footerLabel: string;
  previewLayout: DashboardPreviewLayout;
  title: string;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type DashboardListColumnsLayout = "row" | "stacked";

export type ErrorPageSettings = Record<string, unknown>;

export type AppSetupSettings = {
  theme: "dark" | "light";
};

export type DashboardListColumnsSettings = {
  checkboxSize: ChoiceControlSize;
  layout: DashboardListColumnsLayout;
  previewLayout: DashboardPreviewLayout;
  recentActivityFooterLabel: string;
  recentActivityTitle: string;
  topPerformingUsersFooterLabel: string;
  topPerformingUsersTitle: string;
  upcomingTasksFooterLabel: string;
  upcomingTasksTitle: string;
  width: DashboardSectionWidth;
};

export type NotesActivitySettings = {
  addNoteButtonLabel: string;
  addNoteModalDescription: string;
  addNoteModalTitle: string;
  activityFooterLabel: string;
  composerPlaceholder: string;
  density: SurfaceDensity;
  height: DashboardSectionHeight;
  notesFooterLabel: string;
  previewLayout: DashboardPreviewLayout;
  saveButtonLabel: string;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type UpcomingTasksSettings = DashboardListWidgetSettings & {
  checkboxSize: ChoiceControlSize;
};
export type RecentActivitySettings = DashboardListWidgetSettings;
export type TopPerformingUsersSettings = DashboardListWidgetSettings;

export type UserProfileWidgetSettings = {
  avatarSize: AvatarSize;
  menuItemsJson: string;
  name: string;
  photoUploadChangeButtonLabel: string;
  photoUploadCropButtonLabel: string;
  photoUploadDescription: string;
  photoUploadEnabled: boolean;
  photoUploadLabel: string;
  photoUploadMenuItemId: string;
  photoUploadMaxZoom: number;
  photoUploadMinZoom: number;
  photoUploadOutputSize: number;
  photoUploadTitle: string;
  photoUploadUploadLabel: string;
  photoUploadViewportSize: number;
  photoUploadZoomLabel: string;
  photoUploadZoomStep: number;
  previewLayout: DashboardPreviewLayout;
  role: string;
  src: string;
  srcEnabled: boolean;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type ProfilePhotoUploadWidgetSettings = {
  changeButtonLabel: string;
  cropButtonLabel: string;
  label: string;
  maxZoom: number;
  minZoom: number;
  outputSize: number;
  previewLayout: DashboardPreviewLayout;
  title: string;
  uploadLabel: string;
  value: string;
  viewportSize: number;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
  zoomLabel: string;
  zoomStep: number;
};

export type DashboardContentContainerSettings = {
  height: DashboardSectionHeight;
  paddingBottom: boolean;
  paddingLeft: boolean;
  paddingRight: boolean;
  paddingTop: boolean;
  previewLayout: DashboardPreviewLayout;
  title: string;
  width: DashboardSectionWidth;
};

export type StatusIndicatorSettings = {
  label: string;
  previewLayout: DashboardPreviewLayout;
  status: "error" | "neutral" | "success" | "warning";
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type TrendBadgeSettings = {
  direction: StatCardTrend;
  previewLayout: DashboardPreviewLayout;
  value: string;
  width: DashboardSectionWidth;
  wrapInContainer?: boolean;
};

export type CarouselSettings = {
  initialIndex: number;
  loop: boolean;
  showCaptions: boolean;
  showPips: boolean;
};

export type LightboxSettings = {
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  showCaptions: boolean;
  triggerLabel: string;
};

export type ImageThumbnailSettings = {
  openInLightbox: boolean;
  showCaption: boolean;
  size: ImageThumbnailSize;
};

export type ImageGallerySettings = {
  columns: 2 | 3 | 4;
  showCaptions: boolean;
  thumbnailSize: ImageThumbnailSize;
};

export type ModelViewerSettings = {
  autoRotate: boolean;
  cameraControls: boolean;
  showCaption: boolean;
};

export type ModelLightboxSettings = {
  dismissOnBackdrop: boolean;
  dismissOnEscape: boolean;
  showCaption: boolean;
  triggerLabel: string;
};

export type ModelThumbnailSettings = {
  openInLightbox: boolean;
  showCaption: boolean;
  size: ModelThumbnailSize;
};

export type ModelGallerySettings = {
  columns: 2 | 3 | 4;
  showCaptions: boolean;
  thumbnailSize: ModelThumbnailSize;
};

export type AccordionGroupSettings = {
  type: AccordionGroupType;
  collapsible: boolean;
  defaultOpenFirst: boolean;
  itemOneTitle: string;
  itemOneContent: string;
  itemTwoTitle: string;
  itemTwoContent: string;
  itemThreeTitle: string;
  itemThreeContent: string;
};

export type ShowMoreSettings = {
  content: string;
  maxLines: number;
  showMoreLabel: string;
  showLessLabel: string;
  defaultExpanded: boolean;
};

export type EmptyStateSettings = {
  title: string;
  description: string;
  density: SurfaceDensity;
  showIcon: boolean;
  icon: FontAwesomeIconName;
  primaryAction: boolean;
  primaryActionLabel: string;
  secondaryAction: boolean;
  secondaryActionLabel: string;
};

export type BadgeSettings = {
  label: string;
  tone: BadgeTone;
  variant: BadgeVariant;
  size: BadgeSize;
  dot: boolean;
};

export type AvatarSettings = {
  name: string;
  size: AvatarSize;
  shape: AvatarShape;
  srcEnabled: boolean;
  src: string;
};

export type AvatarGroupSettings = {
  size: AvatarSize;
  max: number;
};

export type ListSettings = {
  density: SurfaceDensity;
  ordered: boolean;
  showIcons: boolean;
};

export type DescriptionListSettings = {
  layout: DescriptionListLayout;
};

export type DividerSettings = {
  orientation: DividerOrientation;
  tone: DividerTone;
  labelEnabled: boolean;
  label: string;
};

export type ContentTimelineRowStyle = "avatar" | "status";

export type ContentTimelineSettings = {
  includeGroups: boolean;
  includeStatus: boolean;
  includeTags: boolean;
  rowStyles: [
    ContentTimelineRowStyle,
    ContentTimelineRowStyle,
    ContentTimelineRowStyle,
  ];
};

export type TreeViewSettings = {
  expandRoots: boolean;
};

export type MasonryGridSettings = {
  columns: number;
  gap: number;
};

export type PropertyGridSettings = {
  bordered: boolean;
  copyable: boolean;
};

export type StackSettings = {
  direction: "row" | "column";
  gap: number;
  wrap: boolean;
};

export type ColumnsSettings = {
  columns: number;
  direction: "row" | "column";
  gap: number;
};

export type GridSettings = {
  columns: number;
  gap: number;
};

export type SplitterSettings = {
  orientation: "horizontal" | "vertical";
  defaultSize: number;
};

export type ResizeHandleSettings = {
  background: "accent" | "contrast" | "none" | "subtle";
  height: "full" | "medium" | "short" | "tall";
  orientation: "horizontal" | "vertical";
};

export type ResizablePanelSettings = {
  defaultWidth: number;
  defaultHeight: number;
};

export type DockLayoutSettings = {
  showLeft: boolean;
  showRight: boolean;
  showTop: boolean;
  showBottom: boolean;
};

export type ThreePaneLayoutSettings = {
  defaultLeftWidth: number;
  defaultRightWidth: number;
  handleBackground: "accent" | "contrast" | "none" | "subtle";
  handleBorderRadius: number;
  handleHeight: "full" | "medium" | "short" | "tall";
  handleMarginBlock: number;
  height: "auto" | "full";
  maxLeftWidth: number;
  maxRightWidth: number;
  minLeftWidth: number;
  minRightWidth: number;
  layoutResetKey?: number;
  persist: boolean;
  showLeft: boolean;
  showRight: boolean;
};

export type ScrollAreaSettings = {
  autoHide: boolean;
  maxHeight: number;
  orientation: "vertical" | "horizontal" | "both";
  thickness: number;
};

export type CustomScrollbarSettings = ScrollAreaSettings & {
  horizontalThumbShape: "round" | "square";
  horizontalTrackShape: "round" | "square";
  minThumbSize: number;
  verticalThumbShape: "round" | "square";
  verticalTrackShape: "round" | "square";
};

export type AspectRatioSettings = {
  ratio: "16 / 9" | "4 / 3" | "1 / 1" | "9 / 16";
};

export type ContainerSettings = {
  size: "sm" | "md" | "lg" | "xl" | "full";
  padded: boolean;
};

export type SpacerSettings = {
  axis: "x" | "y" | "both";
  size: number;
  flex: boolean;
};

export type BreadcrumbSettings = {
  separator: string;
};

export type PaginationSettings = {
  page: number;
  pageCount: number;
};

export type PageHeaderSettings = {
  showBreadcrumbs: boolean;
  showActions: boolean;
};

export type ToolbarSettings = {
  dense: boolean;
};

export type ApplicationHeaderSettings = {
  showProfile: boolean;
  showSearch: boolean;
};
export type ApplicationFooterSettings = { showActions: boolean; showBrand: boolean; showVersion: boolean };

export type DashboardWelcomeSettings = {
  greeting: "afternoon" | "auto" | "evening" | "morning";
  name: string;
  showDate: boolean;
  showWave: boolean;
  subtitle: string;
  tileLayout: "fill" | "fixed";
  wrapInContainer: boolean;
};

export type BottomNavigationSettings = {
  value: string;
};

export type NavigationRailSettings = {
  collapsed: boolean;
  value: string;
};

export type SplitButtonSettings = {
  variant: ButtonVariant;
};

export type FabSettings = {
  extended: boolean;
  size: "sm" | "md" | "lg";
};

export type TileSettings = {
  icon: FontAwesomeIconName;
  label: string;
  tone: "purple" | "blue";
};

export type TilesLayout = "fill" | "fixed";

export type TilesSettings = {
  layout: TilesLayout;
};

export type StatTileSettings = {
  comparison: string;
  icon: FontAwesomeIconName;
  label: string;
  tone: "purple" | "blue";
  trend: "up" | "down";
  trendValue: string;
  value: string;
};

export type StatTilesSettings = {
  layout: TilesLayout;
};

export type PropertyInspectorSettings = {
  searchable: boolean;
};

export type FilterBuilderSettings = {
  seedCount: number;
};

export type QueryBuilderSettings = {
  combinator: "and" | "or";
};

export type RuleBuilderSettings = {
  showDisabled: boolean;
};

export type PermissionsMatrixSettings = {
  compact: boolean;
};

export type DualListBuilderSettings = {
  selectedCount: number;
};

export type SchedulerSettings = {
  startHour: number;
  endHour: number;
};

export type KanbanBoardSettings = {
  interactive: boolean;
};

export type CalendarSettings = {
  openDayOnSelect: boolean;
  showEvents: boolean;
  showMonthYearPicker: boolean;
};

export type ResourcePlannerSettings = {
  startHour: number;
  endHour: number;
};

export type JsonViewerSettings = {
  collapsedDepth: number;
};

export type StatisticSettings = {
  label: string;
  value: string;
  prefix: string;
  suffix: string;
  trendEnabled: boolean;
  trend: StatisticTrend;
  trendLabel: string;
};

export type IconSettings = {
  name: string;
  size: "sm" | "md" | "lg";
  tone: "default" | "muted" | "accent" | "success" | "warning" | "danger";
  labelEnabled: boolean;
  label: string;
};

export type IconBadgeSettings = {
  count: number;
  iconName: string;
  label: string;
  max: number;
  showToolbarDemo: boolean;
  showZero: boolean;
  size: "sm" | "md" | "lg";
  tone: "default" | "muted" | "accent" | "success" | "warning" | "danger";
  urgency: "standard" | "danger" | "warning" | "success" | "info";
};

export type SpinnerSettings = {
  size: "sm" | "md" | "lg";
  tone: "accent" | "muted" | "inverse";
  label: string;
};

export type ClockSettings = {
  showAnalog: boolean;
  showDate: boolean;
  showDigital: boolean;
  size: "sm" | "md" | "lg";
};

export type PortalSettings = {
  disabled: boolean;
  message: string;
};

export type PortalHostSettings = {
  hostId: string;
  message: string;
};

export type VisuallyHiddenSettings = {
  text: string;
  showHint: boolean;
};

export type FocusTrapSettings = {
  active: boolean;
};

export type KeyboardShortcutSettings = {
  keys: string;
  size: "sm" | "md";
};

export type HotkeyManagerSettings = {
  enabled: boolean;
  key: string;
};

export type CopyButtonSettings = {
  value: string;
  label: string;
  copiedLabel: string;
};

export type ClipboardSettings = {
  value: string;
};

export type ThemeProviderSettings = {
  theme: Theme;
};

export type ThemeSwitcherSettings = {
  theme: Theme;
  label: string;
};

export type ResizeObserverSettings = {
  hint: string;
};

export type IntersectionObserverSettings = {
  threshold: number;
};

export type SidebarSettings = {
  side: SidebarSide;
  collapsed: boolean;
  density: SurfaceDensity;
  showHeader: boolean;
  headerTitle: string;
  showFooter: boolean;
  footerText: string;
  footerPaddingBottom: boolean;
  footerPaddingLeft: boolean;
  footerPaddingRight: boolean;
  footerPaddingTop: boolean;
  activeItem: "overview" | "library" | "templates" | "tokens" | "settings";
  groupOpen: boolean;
  paddingBottom: boolean;
  paddingLeft: boolean;
  paddingRight: boolean;
  paddingTop: boolean;
  persistState: boolean;
  height: DashboardSectionHeight;
  wrapInContainer?: boolean;
};

export type TopNavigationActiveMenu =
  "app" | "edit" | "file" | "help" | "none" | "view" | "window";

export type TopNavigationSettings = {
  activeMenu: TopNavigationActiveMenu;
  closeOnEscape: boolean;
  closeOnOutside: boolean;
  closeOnSelect: boolean;
  density: SurfaceDensity;
  showShortcuts: boolean;
};

export type MegaMenuColumnCount = 1 | 2 | 3 | 4;
export type MegaMenuItemsPerColumn = 1 | 2 | 3 | 4 | 5;

export type MegaMenuSettings = {
  closeOnEscape: boolean;
  closeOnOutside: boolean;
  columnCount: MegaMenuColumnCount;
  density: SurfaceDensity;
  featured: boolean;
  featuredActionLabel: string;
  featuredDescription: string;
  featuredEyebrow: string;
  featuredTitle: string;
  itemsPerColumn: MegaMenuItemsPerColumn;
};

export type ControlSettingsBySlug = {
  button: ButtonSettings;
  "submit-button": ButtonSettings;
  "reset-button": ButtonSettings;
  checkbox: CheckboxSettings;
  switch: SwitchSettings;
  "radio-group": RadioGroupSettings;
  "chip-input": ChipInputSettings;
  "choice-chips": ChoiceChipsSettings;
  "color-picker": ColorPickerSettings;
  "date-picker": ValueFieldSettings;
  "time-picker": ValueFieldSettings;
  "datetime-picker": ValueFieldSettings;
  "month-picker": ValueFieldSettings;
  "week-picker": ValueFieldSettings;
  "email-input": ValueFieldSettings;
  "url-input": ValueFieldSettings;
  "search-input": ValueFieldSettings;
  "file-upload": FileUploadSettings;
  "image-crop-upload": ImageCropUploadSettings;
  "hidden-input": HiddenInputSettings;
  "number-input": NumberInputSettings;
  "password-input": ValueFieldSettings;
  "range-slider": RangeSettings;
  select: SelectSettings;
  "text-input": TextInputSettings;
  textarea: TextareaSettings;
  "note-composer": NoteComposerSettings;
  "rich-text-field": RichTextFieldSettings;
  "filter-select": FilterSelectSettings;
  "multi-select": MultiSelectSettings;
  "transfer-list": TransferListSettings;
  "password-strength-field": PasswordStrengthSettings;
  "rating-input": RatingInputSettings;
  "segmented-control": SegmentedControlSettings;
  "slider-range": SliderRangeSettings;
  "phone-number-input": PhoneNumberInputSettings;
  "country-picker": CountryPickerSettings;
  "tree-select": TreeSelectSettings;
  cascader: CascaderSettings;
  "theme-toggle": ThemeToggleSettings;
  "accent-color-picker": AccentColorPickerSettings;
  "icon-picker": IconPickerSettings;
  "emoji-picker": EmojiPickerSettings;
  tooltip: TooltipSettings;
  dialog: DialogSettings;
  drawer: DrawerSettings;
  "dropdown-menu": DropdownMenuSettings;
  "context-menu": ContextMenuSettings;
  "command-palette": CommandPaletteSettings;
  modal: ModalSettings;
  popover: PopoverSettings;
  alert: AlertSettings;
  toast: ToastSettings;
  tabs: TabsSettings;
  card: CardSettings;
  panel: PanelSettings;
  section: SectionSettings;
  table: TableSettings;
  "data-grid": DataGridSettings;
  skeleton: SkeletonSettings;
  carousel: CarouselSettings;
  lightbox: LightboxSettings;
  "image-thumbnail": ImageThumbnailSettings;
  "image-gallery": ImageGallerySettings;
  "model-viewer": ModelViewerSettings;
  "model-lightbox": ModelLightboxSettings;
  "model-thumbnail": ModelThumbnailSettings;
  "model-gallery": ModelGallerySettings;
  accordion: AccordionSettings;
  "accordion-group": AccordionGroupSettings;
  "show-more": ShowMoreSettings;
  "empty-state": EmptyStateSettings;
  badge: BadgeSettings;
  avatar: AvatarSettings;
  "avatar-group": AvatarGroupSettings;
  list: ListSettings;
  "description-list": DescriptionListSettings;
  divider: DividerSettings;
  "content-timeline": ContentTimelineSettings;
  "tree-view": TreeViewSettings;
  "masonry-grid": MasonryGridSettings;
  "property-grid": PropertyGridSettings;
  stack: StackSettings;
  columns: ColumnsSettings;
  grid: GridSettings;
  splitter: SplitterSettings;
  "resize-handle": ResizeHandleSettings;
  "resizable-panel": ResizablePanelSettings;
  "dock-layout": DockLayoutSettings;
  "three-pane-layout": ThreePaneLayoutSettings;
  "custom-scrollbar": CustomScrollbarSettings;
  "scroll-area": ScrollAreaSettings;
  "aspect-ratio": AspectRatioSettings;
  container: ContainerSettings;
  spacer: SpacerSettings;
  breadcrumb: BreadcrumbSettings;
  pagination: PaginationSettings;
  "page-header": PageHeaderSettings;
  toolbar: ToolbarSettings;
  "application-header": ApplicationHeaderSettings;
  "application-footer": ApplicationFooterSettings;
  "bottom-navigation": BottomNavigationSettings;
  "navigation-rail": NavigationRailSettings;
  "split-button": SplitButtonSettings;
  fab: FabSettings;
  tile: TileSettings;
  tiles: TilesSettings;
  "stat-tile": StatTileSettings;
  "stat-tiles": StatTilesSettings;
  "property-inspector": PropertyInspectorSettings;
  "filter-builder": FilterBuilderSettings;
  "query-builder": QueryBuilderSettings;
  "rule-builder": RuleBuilderSettings;
  "permissions-matrix": PermissionsMatrixSettings;
  "dual-list-builder": DualListBuilderSettings;
  scheduler: SchedulerSettings;
  "kanban-board": KanbanBoardSettings;
  calendar: CalendarSettings;
  "resource-planner": ResourcePlannerSettings;
  "json-viewer": JsonViewerSettings;
  statistic: StatisticSettings;
  icon: IconSettings;
  "icon-badge": IconBadgeSettings;
  spinner: SpinnerSettings;
  clock: ClockSettings;
  portal: PortalSettings;
  "portal-host": PortalHostSettings;
  "visually-hidden": VisuallyHiddenSettings;
  "focus-trap": FocusTrapSettings;
  "keyboard-shortcut": KeyboardShortcutSettings;
  "hotkey-manager": HotkeyManagerSettings;
  "copy-button": CopyButtonSettings;
  clipboard: ClipboardSettings;
  "theme-provider": ThemeProviderSettings;
  "theme-switcher": ThemeSwitcherSettings;
  "resize-observer": ResizeObserverSettings;
  "intersection-observer": IntersectionObserverSettings;
  sidebar: SidebarSettings;
  "mega-menu": MegaMenuSettings;
  "top-navigation": TopNavigationSettings;
} & Record<ChartControlSlug, ChartSettings> & {
    "kpi-card": StatCardSettings;
    "stat-card": StatCardSettings;
    gauge: GaugeSettings;
    sparkline: SparklineSettings;
    "progress-ring": ProgressRingSettings;
    "progress-bar": ProgressBarSettings;
    speedometer: SpeedometerSettings;
    "metric-tile": MetricTileSettings;
    "dashboard-content-container": DashboardContentContainerSettings;
    "pipeline-overview": PipelineOverviewSettings;
    "deals-over-time": DealsOverTimeSettings;
    "upcoming-tasks": UpcomingTasksSettings;
    "recent-activity": RecentActivitySettings;
    "top-performing-users": TopPerformingUsersSettings;
    "user-profile": UserProfileWidgetSettings;
    "profile-photo-upload": ProfilePhotoUploadWidgetSettings;
    "dashboard-list-columns": DashboardListColumnsSettings;
    "notes-activity": NotesActivitySettings;
    "lab-dashboard-list-columns": DashboardListColumnsSettings;
    "lab-dashboard-welcome": DashboardWelcomeSettings;
    "lab-notes-activity": NotesActivitySettings;
    "lab-sidebar": SidebarSettings;
    "lab-test-layout": ThreePaneLayoutSettings;
    "lab-user-profile": UserProfileWidgetSettings;
    "404-page": ErrorPageSettings;
    "403-page": ErrorPageSettings;
    "app-setup": AppSetupSettings;
    "status-indicator": StatusIndicatorSettings;
    "trend-badge": TrendBadgeSettings;
  };

export type ControlSettings = ControlSettingsBySlug[ControlSlug];

export type ControlDefinition<S extends ControlSlug = ControlSlug> = {
  slug: S;
  title: string;
  category: ComponentCategory;
  componentName: string;
  description: string;
  /** Catalog slugs for sub-components used in compositions. */
  compositionParts?: ControlSlug[];
  /** Marks the sidebar nav entry with an orange asterisk for discoverability. */
  isNew?: boolean;
  navigationGroup?: string;
  sourceFiles: string[];
  usesFieldShell: boolean;
};

export const formsControlOrder = [
  "button",
  "submit-button",
  "reset-button",
  "checkbox",
  "switch",
  "radio-group",
  "chip-input",
  "choice-chips",
  "color-picker",
  "date-picker",
  "time-picker",
  "datetime-picker",
  "month-picker",
  "week-picker",
  "email-input",
  "url-input",
  "search-input",
  "file-upload",
  "image-crop-upload",
  "hidden-input",
  "number-input",
  "password-input",
  "range-slider",
  "select",
  "text-input",
  "textarea",
  "note-composer",
  "rich-text-field",
  "filter-select",
  "multi-select",
  "transfer-list",
  "password-strength-field",
  "rating-input",
  "segmented-control",
  "slider-range",
  "phone-number-input",
  "country-picker",
  "tree-select",
  "cascader",
] as const satisfies readonly ControlSlug[];
