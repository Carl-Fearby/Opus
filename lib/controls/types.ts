import type { AccordionGroupType, ButtonVariant, ChoiceShape, DialogActionSet, DrawerSide, DropdownMenuPlacement, EmptyStateIcon, FieldMode, ImageThumbnailSize, LabelPosition, ModalSize, ModelThumbnailSize, PopoverPlacement, SidebarSide, SkeletonAnimation, SkeletonVariant, AlertStatus, SurfaceDensity, SurfaceTone, TableDensity, TabsOrientation, TabsVariant, Theme, ToastHorizontalPosition, ToastVerticalPosition } from "@/components/fields";
import type {
  SectionColumns,
  SectionGap,
  SectionSidebar,
  SectionSidebarRatio,
  SectionStackBelow,
} from "@/lib/layout/sectionLayout";

export type ControlSlug =
  | "button"
  | "submit-button"
  | "reset-button"
  | "checkbox"
  | "switch"
  | "radio-group"
  | "color-picker"
  | "date-picker"
  | "time-picker"
  | "datetime-picker"
  | "month-picker"
  | "week-picker"
  | "email-input"
  | "telephone-input"
  | "url-input"
  | "search-input"
  | "file-upload"
  | "hidden-input"
  | "number-input"
  | "password-input"
  | "range-slider"
  | "select"
  | "text-input"
  | "textarea"
  | "theme-toggle"
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
  | "sidebar"
  | "mega-menu"
  | "top-navigation";

export type ComponentCategory = "forms" | "overlays" | "content";

export type BaseFieldSettings = {
  mode: FieldMode;
  labelPosition: LabelPosition;
  label: string;
  errorEnabled: boolean;
  error: string;
  helpEnabled: boolean;
  help: string;
  required: boolean;
};

export type ValueFieldSettings = BaseFieldSettings & {
  value: string;
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

export type SelectSettings = BaseFieldSettings & {
  value: string;
  options: string;
};

export type RadioGroupSettings = BaseFieldSettings & {
  value: string;
  shape: ChoiceShape;
  optionErrorsEnabled: boolean;
  optionError: string;
};

export type CheckboxSettings = BaseFieldSettings & {
  checked: boolean;
  shape: ChoiceShape;
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

export type NumberInputSettings = BaseFieldSettings & {
  value: number;
  min: number;
  max: number;
  step: number;
};

export type FileUploadSettings = BaseFieldSettings & {
  fileName: string;
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
};

export type ThemeToggleSettings = {
  mode: FieldMode;
  labelPosition: LabelPosition;
  label: string;
  value: Theme;
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
};

export type SkeletonSettings = {
  animation: SkeletonAnimation;
  lines: number;
  variant: SkeletonVariant;
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
  icon: EmptyStateIcon;
  primaryAction: boolean;
  primaryActionLabel: string;
  secondaryAction: boolean;
  secondaryActionLabel: string;
};

export type SidebarSettings = {
  side: SidebarSide;
  collapsed: boolean;
  density: SurfaceDensity;
  showHeader: boolean;
  headerTitle: string;
  showFooter: boolean;
  footerText: string;
  activeItem: "overview" | "library" | "settings";
  groupOpen: boolean;
};

export type TopNavigationActiveMenu = "app" | "edit" | "file" | "help" | "none" | "view" | "window";

export type TopNavigationSettings = {
  activeMenu: TopNavigationActiveMenu;
  closeOnEscape: boolean;
  closeOnOutside: boolean;
  closeOnSelect: boolean;
  density: SurfaceDensity;
  showShortcuts: boolean;
};

export type MegaMenuSettings = {
  closeOnEscape: boolean;
  closeOnOutside: boolean;
  density: SurfaceDensity;
  featured: boolean;
};

export type ControlSettingsBySlug = {
  button: ButtonSettings;
  "submit-button": ButtonSettings;
  "reset-button": ButtonSettings;
  checkbox: CheckboxSettings;
  switch: SwitchSettings;
  "radio-group": RadioGroupSettings;
  "color-picker": ColorPickerSettings;
  "date-picker": ValueFieldSettings;
  "time-picker": ValueFieldSettings;
  "datetime-picker": ValueFieldSettings;
  "month-picker": ValueFieldSettings;
  "week-picker": ValueFieldSettings;
  "email-input": ValueFieldSettings;
  "telephone-input": ValueFieldSettings;
  "url-input": ValueFieldSettings;
  "search-input": ValueFieldSettings;
  "file-upload": FileUploadSettings;
  "hidden-input": HiddenInputSettings;
  "number-input": NumberInputSettings;
  "password-input": ValueFieldSettings;
  "range-slider": RangeSettings;
  select: SelectSettings;
  "text-input": TextInputSettings;
  textarea: TextareaSettings;
  "theme-toggle": ThemeToggleSettings;
  tooltip: TooltipSettings;
  dialog: DialogSettings;
  drawer: DrawerSettings;
  "dropdown-menu": DropdownMenuSettings;
  "context-menu": ContextMenuSettings;
  "command-palette": CommandPaletteSettings;
  modal: ModalSettings;
  popover: PopoverSettings;
  "alert": AlertSettings;
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
  sidebar: SidebarSettings;
  "mega-menu": MegaMenuSettings;
  "top-navigation": TopNavigationSettings;
};

export type ControlSettings = ControlSettingsBySlug[ControlSlug];

export type ControlDefinition<S extends ControlSlug = ControlSlug> = {
  slug: S;
  title: string;
  category: ComponentCategory;
  componentName: string;
  description: string;
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
  "color-picker",
  "date-picker",
  "time-picker",
  "datetime-picker",
  "month-picker",
  "week-picker",
  "email-input",
  "telephone-input",
  "url-input",
  "search-input",
  "file-upload",
  "hidden-input",
  "number-input",
  "password-input",
  "range-slider",
  "select",
  "text-input",
  "textarea",
] as const satisfies readonly ControlSlug[];
