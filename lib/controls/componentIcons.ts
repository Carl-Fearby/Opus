import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faAlignLeft,
  faBars,
  faBell,
  faCalendar,
  faCalendarDays,
  faCalendarWeek,
  faCaretDown,
  faCircleDot,
  faCircleInfo,
  faClipboardList,
  faClone,
  faCloudArrowUp,
  faClock,
  faComments,
  faCube,
  faDoorOpen,
  faEllipsis,
  faEnvelope,
  faEyeSlash,
  faFont,
  faGrip,
  faGripLines,
  faHashtag,
  faImage,
  faInbox,
  faLayerGroup,
  faLink,
  faList,
  faLock,
  faMagnifyingGlass,
  faMessage,
  faMousePointer,
  faPalette,
  faPaperPlane,
  faPhone,
  faRotateLeft,
  faSitemap,
  faSliders,
  faSquare,
  faSquareCheck,
  faSun,
  faTable,
  faTableCells,
  faTableColumns,
  faTerminal,
  faToggleOn,
  faTriangleExclamation,
  faWindowMaximize,
  faWindowRestore,
} from "@fortawesome/free-solid-svg-icons";
import type { ComponentCategory, ControlSlug } from "./types";

const componentIcons: Record<ControlSlug, IconDefinition> = {
  accordion: faList,
  "accordion-group": faLayerGroup,
  button: faSquare,
  card: faClone,
  carousel: faLayerGroup,
  checkbox: faSquareCheck,
  "color-picker": faPalette,
  "command-palette": faTerminal,
  "context-menu": faMousePointer,
  "data-grid": faTableCells,
  "date-picker": faCalendar,
  "datetime-picker": faCalendarDays,
  dialog: faComments,
  drawer: faDoorOpen,
  "dropdown-menu": faCaretDown,
  "email-input": faEnvelope,
  "empty-state": faInbox,
  "file-upload": faCloudArrowUp,
  "hidden-input": faEyeSlash,
  "image-gallery": faLayerGroup,
  "image-thumbnail": faClone,
  lightbox: faWindowMaximize,
  "mega-menu": faTableColumns,
  modal: faWindowMaximize,
  "model-gallery": faLayerGroup,
  "model-lightbox": faCube,
  "model-thumbnail": faClone,
  "model-viewer": faCube,
  "month-picker": faCalendarDays,
  "number-input": faHashtag,
  panel: faWindowRestore,
  section: faTableColumns,
  "password-input": faLock,
  popover: faMessage,
  "radio-group": faCircleDot,
  "range-slider": faSliders,
  "reset-button": faRotateLeft,
  "search-input": faMagnifyingGlass,
  select: faCaretDown,
  "show-more": faEllipsis,
  sidebar: faBars,
  skeleton: faGripLines,
  "alert": faTriangleExclamation,
  "submit-button": faPaperPlane,
  switch: faToggleOn,
  table: faTable,
  tabs: faTableCells,
  "telephone-input": faPhone,
  "text-input": faFont,
  textarea: faAlignLeft,
  "theme-toggle": faSun,
  "time-picker": faClock,
  toast: faBell,
  tooltip: faCircleInfo,
  "top-navigation": faSitemap,
  "url-input": faLink,
  "week-picker": faCalendarWeek,
};

const categoryIcons: Record<ComponentCategory, IconDefinition> = {
  content: faLayerGroup,
  forms: faClipboardList,
  overlays: faClone,
};

const navigationGroupIcons: Record<string, IconDefinition> = {
  Accordion: faList,
  Data: faTable,
  "3D Assets": faCube,
  Images: faImage,
  Navigation: faSitemap,
};

export function getOverviewIcon(): IconDefinition {
  return faGrip;
}

export function getNavigationGroupIcon(label: string): IconDefinition {
  return navigationGroupIcons[label] ?? faCube;
}

export function getComponentIcon(slug: ControlSlug): IconDefinition {
  return componentIcons[slug] ?? faCube;
}

export function getCategoryIcon(category: ComponentCategory): IconDefinition {
  return categoryIcons[category];
}
