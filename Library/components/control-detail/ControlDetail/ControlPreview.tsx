"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import {
  Button,
  Card,
  Carousel,
  Chart,
  CheckboxField,
  ChipInput,
  ColorField,
  CommandPalette,
  ContextMenuProvider,
  ContextMenuTarget,
  DataGrid,
  DateField,
  DropdownMenu,
  FileField,
  HiddenField,
  ImageGallery,
  ImageThumbnail,
  Lightbox,
  MegaMenu,
  ModelGallery,
  ModelLightbox,
  ModelThumbnail,
  ModelViewer,
  NumberField,
  Panel,
  Section,
  Radio,
  RadioGroup,
  RangeField,
  SelectField,
  FilterSelectField,
  MultiSelectField,
  TransferListField,
  PasswordStrengthField,
  RatingField,
  SegmentedControlField,
  SliderRangeField,
  PhoneNumberField,
  CountryPickerField,
  TreeSelectField,
  CascaderField,
  Skeleton,
  StatCard,
  SwitchField,
  TextAreaField,
  RichTextField,
  TextField,
  ThemeToggleField,
  Tooltip,
  Dialog,
  Drawer,
  DrawerDefaultActions,
  EmptyState,
  Badge,
  Divider,
  Avatar,
  AvatarGroup,
  Statistic,
  List,
  DescriptionList,
  PropertyGrid,
  Stack,
  Columns,
  Grid,
  Splitter,
  ResizablePanel,
  DockLayout,
  ScrollArea,
  AspectRatio,
  Container,
  Spacer,
  Breadcrumb,
  Pagination,
  PageHeader,
  Toolbar,
  BottomNavigation,
  NavigationRail,
  SplitButton,
  FloatingActionButton,
  Tiles,
  StatTiles,
  Tile,
  StatTile,
  PropertyInspector,
  FilterBuilder,
  QueryBuilder,
  RuleBuilder,
  PermissionsMatrix,
  DualListBuilder,
  Scheduler,
  KanbanBoard,
  Calendar,
  ResourcePlanner,
  ContentTimeline,
  TreeView,
  MasonryGrid,
  JsonViewer,
  Icon,
  Spinner,
  Portal,
  PortalHost,
  VisuallyHidden,
  FocusTrap,
  KeyboardShortcut,
  HotkeyManager,
  useHotkey,
  CopyButton,
  Clipboard,
  useClipboard,
  ThemeProvider,
  ThemeSwitcher,
  ResizeObserver,
  IntersectionObserver,
  Modal,
  ModalDefaultActions,
  Popover,
  Alert,
  Accordion,
  AccordionGroup,
  ShowMore,
  Sidebar,
  SidebarGroup,
  SidebarHeader,
  SidebarLayout,
  SidebarLink,
  SidebarNav,
  Table,
  Tabs,
  Gauge,
  MetricTile,
  NoteComposer,
  DashboardContentContainer,
  DealsOverTime,
  PipelineOverview,
  RecentActivity,
  NotesActivity,
  TopPerformingUsers,
  UpcomingTasks,
  ProgressBar,
  ProgressRing,
  Sparkline,
  Speedometer,
  StatusIndicator,
  TopNavigation,
  TrendBadge,
  useToast,
} from "@/components/fields";
import { AccentColorPicker, createAccentStyle } from "@/components/AccentColorPicker";
import { IconPicker } from "@/components/IconPicker";
import { IconBadge } from "@/components/IconBadge";
import { EmojiPicker } from "@/components/EmojiPicker";
import { DEFAULT_TOAST_DURATION_MS } from "@/components/ToastProvider";
import type { DateInputType } from "@/components/fields";
import type { CommandPaletteItem, DropdownMenuItemData } from "@/components/fields";
import type { AlertStatus } from "@/components/fields/types";
import { buildMegaMenuPreviewConfig } from "@/lib/controls/megaMenuDemo";
import {
  demoAvatarGroupItems,
  demoContentTimelineItems,
  demoDescriptionListItems,
  demoJsonValue,
  demoListItems,
  demoMasonryItems,
  demoPropertyItems,
  demoTreeViewNodes,
} from "@/lib/controls/contentDemoData";
import {
  demoCalendarEvents,
  demoDualListItems,
  demoDualListSelected,
  demoFilterConditions,
  demoInspectorFields,
  demoKanbanCards,
  demoKanbanColumns,
  demoPermissionResources,
  demoPermissionRoles,
  demoPermissions,
  demoPropertyInspectorItems,
  demoQueryGroup,
  demoResourceItems,
  demoResources,
  demoRules,
  demoSchedulerEvents,
} from "@/lib/controls/buildersDemoData";
import { layoutDemoTiles, layoutScrollLines } from "@/lib/controls/layoutDemoData";
import {
  demoBottomNavItems,
  demoBreadcrumbItems,
  demoRailItems,
  demoSplitActions,
} from "@/lib/controls/navigationExtrasDemoData";
import {
  withDemoStatTileHandlers,
  withDemoTileHandlers,
} from "@/lib/controls/tilesDemoData";
import {
  demoPipelineStages,
  demoPipelineTotalValue,
  parsePipelineStageCount,
} from "@/lib/controls/pipelineDemoData";
import {
  dealsOverTimePeriodOptions,
  getDealsOverTimeDemoData,
} from "@/lib/controls/dealsOverTimeDemoData";
import { demoRecentActivity } from "@/lib/controls/recentActivityDemoData";
import { demoNotesActivity } from "@/lib/controls/notesActivityDemoData";
import { demoTopPerformingUsers } from "@/lib/controls/topPerformingUsersDemoData";
import { demoUpcomingTasks } from "@/lib/controls/upcomingTasksDemoData";
import { ForbiddenPageContent } from "@/components/documentation/ForbiddenPage";
import { NotFoundPageContent } from "@/components/documentation/NotFoundPage";
import {
  gaugePreviewValue,
  getGaugeFooter,
  getGaugeTrackColor,
  getGaugeValueColor,
} from "@/lib/controls/dashboardWidgetData";
import { topNavigationDemoMenus } from "@/lib/controls/topNavigationDemo";
import type { TopNavigationSelectItem } from "@/components/TopNavigation/TopNavigationContext";
import type { ControlSettings, ControlSettingsBySlug, ControlSlug, ValueFieldSettings } from "@/lib/controls/types";
import {
  getSectionDemoSlots,
  getSectionLayoutConfigFromSettings,
  usesNestedContentRow,
} from "@/lib/layout/sectionLayout";
import {
  buildDataGridColumns,
  createDataGridRows,
  dataGridPivotConfig,
  dataGridRows,
  dataGridTreeRows,
  getDetailContentForDemo,
} from "@/lib/controls/dataGridDemoData";
import { chartDemoSeries, getChartPreviewData } from "@/lib/controls/chartDemoData";
import {
  cascaderDemoOptions,
  filterSelectDemoGroups,
  multiSelectDemoOptions,
  transferListDemoAvailable,
  treeSelectDemoNodes,
} from "@/lib/controls/advancedFormDemoData";
import { isChartSlug } from "@/lib/controls/chartCatalog";
import { cartesianSpecializedVariants } from "@/components/Chart/SpecializedCharts";
import { DashboardPreviewGrid } from "./DashboardPreviewGrid";
import styles from "./ControlDetail.module.css";

function parseCurrencySetting(value: string) {
  const digits = value.replace(/[^0-9.-]/g, "");
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function formatCurrencySetting(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function normalizePercentages(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return values.map(() => 0);
  }

  const exact = values.map((value) => (value / total) * 100);
  const rounded = exact.map((value) => Math.floor(value));
  let remainder = 100 - rounded.reduce((sum, value) => sum + value, 0);
  const ranked = exact
    .map((value, index) => ({ index, remainder: value - rounded[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < ranked.length && remainder > 0; i += 1) {
    rounded[ranked[i].index] += 1;
    remainder -= 1;
  }

  return rounded;
}

const toastStatuses: AlertStatus[] = ["error", "success", "warning", "info"];
const maximisableChartVariants = [
  "bar-vertical",
  "bar-horizontal",
  "grouped-bar",
  "stacked-bar",
  "stacked-bar-100",
  "line",
  "multi-line",
  "area",
  "stacked-area",
  "spline",
  "scatter",
  "bubble",
  ...cartesianSpecializedVariants,
] as const;

const randomToastSamples: Record<
  AlertStatus,
  { description: string; title: string }[]
> = {
  error: [
    { title: "Upload failed", description: "The file could not be saved. Try again." },
    { title: "Payment declined", description: "Check your card details and retry." },
  ],
  success: [
    { title: "Changes saved", description: "Your updates are live." },
    { title: "Invite sent", description: "They will receive an email shortly." },
  ],
  warning: [
    { title: "Session expiring", description: "You will be signed out in 2 minutes." },
    { title: "Storage almost full", description: "Free up space to keep syncing." },
  ],
  info: [
    { title: "Maintenance tonight", description: "Expect brief downtime after 11pm." },
    { title: "New version available", description: "Refresh to get the latest fixes." },
  ],
};

const radioOptions = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
  { label: "Enterprise", value: "enterprise" },
];

function parseChipValues(value: string[] | string) {
  if (Array.isArray(value)) {
    return value.map((entry) => entry.trim()).filter(Boolean);
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const dropdownMenuItemsBase: DropdownMenuItemData[] = [
  { icon: "✎", id: "rename", label: "Rename", shortcut: "R" },
  { checked: true, icon: "✓", id: "pin", label: "Pinned" },
  { icon: "⧉", id: "duplicate", label: "Duplicate", shortcut: "⌘D" },
];

const commandPaletteItemsBase: CommandPaletteItem[] = [
  {
    description: "Browse the component library",
    group: "Navigation",
    id: "overview",
    label: "Go to overview",
    shortcut: "⌘O",
  },
  {
    description: "View all registered components",
    group: "Navigation",
    id: "components",
    label: "Open components",
    shortcut: "⌘K",
  },
  {
    description: "Find components by name or category",
    group: "Navigation",
    id: "search",
    label: "Search library",
  },
  {
    description: "Start a new component entry",
    group: "Actions",
    id: "create",
    label: "Create component",
    shortcut: "⌘N",
  },
  {
    description: "Switch between light and dark",
    group: "Actions",
    id: "theme",
    label: "Toggle theme",
    shortcut: "⌘T",
  },
  {
    description: "Workspace and account preferences",
    group: "Account",
    id: "settings",
    label: "Open settings",
  },
  {
    description: "Log out of the current workspace",
    group: "Account",
    id: "sign-out",
    label: "Sign out",
  },
];

const tableColumns = [
  { key: "team", label: "Team" },
  { key: "status", label: "Status" },
  { key: "components", label: "Components", align: "right" as const },
];

const tableRows = [
  { id: "design", values: { team: "Design Systems", status: "Healthy", components: 42 } },
  { id: "web", values: { team: "Web Platform", status: "Adopting", components: 28 } },
  { id: "mobile", values: { team: "Mobile", status: "Reviewing", components: 16 } },
];

const galleryImages = [
  {
    id: "image-1",
    src: "/image-1.jpg",
    alt: "Two people standing in a neon sci-fi corridor.",
    caption: "image-1",
  },
  {
    id: "image-2",
    src: "/image-2.jpg",
    alt: "A person in a black jacket sitting beside neon cyberpunk panels.",
    caption: "image-2",
  },
  {
    id: "image-3",
    src: "/image-3.jpg",
    alt: "A black and white futuristic corridor with bright light strips.",
    caption: "image-3",
  },
  {
    id: "image-4",
    src: "/image-4.jpg",
    alt: "Abstract red and white futuristic city geometry.",
    caption: "image-4",
  },
];

const galleryImagesWithAltCaptions = galleryImages.map((image) => ({
  ...image,
  caption: image.alt,
}));

import { vx27ModelAssets as modelAssets } from "@/lib/models/vx27Assets";

type ControlPreviewProps = {
  slug: ControlSlug;
  settings: ControlSettings;
  onSettingsChange: (next: ControlSettings) => void;
};

function fieldProps(settings: ControlSettingsBySlug[Exclude<ControlSlug, "button" | "submit-button" | "reset-button" | "theme-toggle" | "accent-color-picker" | "icon-picker" | "tooltip" | "dialog" | "drawer" | "dropdown-menu" | "context-menu" | "command-palette" | "modal" | "popover" | "alert" | "toast" | "tabs" | "card" | "stat-card" | "gauge" | "panel" | "section" | "table" | "data-grid" | "skeleton" | "bar-chart-vertical" | "bar-chart-horizontal" | "grouped-bar-chart" | "stacked-bar-chart" | "stacked-bar-chart-100" | "line-chart" | "multi-line-chart" | "area-chart" | "stacked-area-chart" | "spline-chart" | "pie-chart" | "donut-chart" | "scatter-plot" | "bubble-chart" | "radar-chart" | "polar-area-chart" | "funnel-chart" | "pyramid-chart" | "carousel" | "lightbox" | "image-thumbnail" | "image-gallery" | "model-viewer" | "model-lightbox" | "model-thumbnail" | "model-gallery" | "accordion" | "accordion-group" | "show-more" | "empty-state" | "badge" | "avatar" | "avatar-group" | "list" | "description-list" | "divider" | "content-timeline" | "tree-view" | "masonry-grid" | "property-grid" | "json-viewer" | "statistic" | "icon" | "spinner" | "portal" | "portal-host" | "visually-hidden" | "focus-trap" | "keyboard-shortcut" | "hotkey-manager" | "copy-button" | "clipboard" | "theme-provider" | "theme-switcher" | "resize-observer" | "intersection-observer" | "sidebar" | "mega-menu" | "top-navigation">]) {
  return {
    error: settings.errorEnabled ? settings.error : undefined,
    help: settings.helpEnabled ? settings.help : undefined,
    label: settings.label,
    labelPosition: settings.labelPosition,
    mode: settings.mode,
    required: settings.required,
  };
}

function TilesPreview({ settings }: { settings: ControlSettingsBySlug["tiles"] }) {
  const [lastResult, setLastResult] = useState("Waiting for action");
  const items = useMemo(
    () => withDemoTileHandlers((item) => setLastResult(`Last action: ${item.label}`)),
    [],
  );

  return (
    <div className={styles.dialogPreview}>
      <Tiles items={items} layout={settings.layout} />
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function StatTilesPreview({ settings }: { settings: ControlSettingsBySlug["stat-tiles"] }) {
  const [lastResult, setLastResult] = useState("Waiting for action");
  const items = useMemo(
    () => withDemoStatTileHandlers((item) => setLastResult(`Last action: ${item.label}`)),
    [],
  );

  return (
    <div className={styles.dialogPreview}>
      <StatTiles items={items} layout={settings.layout} />
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function TilePreview({ settings }: { settings: ControlSettingsBySlug["tile"] }) {
  const [lastResult, setLastResult] = useState("Waiting for action");

  return (
    <div className={styles.dialogPreview}>
      <Tile
        icon={settings.icon}
        label={settings.label}
        tone={settings.tone}
        onClick={() => setLastResult(`Last action: ${settings.label}`)}
      />
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function StatTilePreview({ settings }: { settings: ControlSettingsBySlug["stat-tile"] }) {
  const [lastResult, setLastResult] = useState("Waiting for action");

  return (
    <div className={styles.dialogPreview}>
      <StatTile
        comparison={settings.comparison}
        icon={settings.icon}
        label={settings.label}
        trend={settings.trend}
        trendValue={settings.trendValue}
        tone={settings.tone}
        value={settings.value}
        onClick={() => setLastResult(`Last action: ${settings.label}`)}
      />
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function IconBadgePreview({ settings }: { settings: ControlSettingsBySlug["icon-badge"] }) {
  const [lastResult, setLastResult] = useState("Waiting for action");
  const reportAction = (label: string) => setLastResult(`Last action: ${label}`);

  if (settings.showToolbarDemo) {
    return (
      <div className={styles.dialogPreview}>
        <div className={styles.iconBadgeToolbar}>
          <IconBadge
            count={8}
            iconName="bell"
            label="Notifications"
            size={settings.size}
            tone={settings.tone}
            urgency="standard"
            onClick={() => reportAction("Notifications")}
          />
          <IconBadge
            count={3}
            iconName="envelope"
            label="Messages"
            size={settings.size}
            tone={settings.tone}
            urgency="info"
            onClick={() => reportAction("Messages")}
          />
          <IconBadge
            count={5}
            iconName="comment"
            label="Comments"
            size={settings.size}
            tone={settings.tone}
            urgency="standard"
            onClick={() => reportAction("Comments")}
          />
          <IconBadge
            count={2}
            iconName="heart"
            label="Favourites"
            size={settings.size}
            tone={settings.tone}
            urgency="danger"
            onClick={() => reportAction("Favourites")}
          />
          <IconBadge
            count={1}
            iconName="bookmark"
            label="Saved items"
            size={settings.size}
            tone={settings.tone}
            urgency="warning"
            onClick={() => reportAction("Saved items")}
          />
          <IconBadge
            count={12}
            iconName="inbox"
            label="Inbox"
            size={settings.size}
            tone={settings.tone}
            urgency="success"
            onClick={() => reportAction("Inbox")}
          />
          <IconBadge
            count={100}
            iconName="hashtag"
            label="Hundreds"
            size={settings.size}
            tone={settings.tone}
            urgency="standard"
            onClick={() => reportAction("Hundreds")}
          />
          <IconBadge
            count={1000}
            iconName="fire"
            label="Thousands"
            size={settings.size}
            tone={settings.tone}
            urgency="danger"
            onClick={() => reportAction("Thousands")}
          />
          <IconBadge
            iconName="calendar"
            label="Calendar"
            size={settings.size}
            tone={settings.tone}
            onClick={() => reportAction("Calendar")}
          />
          <IconBadge
            iconName="gear"
            label="Settings"
            size={settings.size}
            tone={settings.tone}
            onClick={() => reportAction("Settings")}
          />
          <span aria-hidden="true" className={styles.iconBadgeDivider} />
          <IconBadge
            iconName="sun"
            label="Theme"
            size={settings.size}
            tone={settings.tone}
            onClick={() => reportAction("Theme")}
          />
        </div>
        <span className={styles.dialogResult}>{lastResult}</span>
      </div>
    );
  }

  return (
    <div className={styles.dialogPreview}>
      <IconBadge
        count={settings.count}
        iconName={settings.iconName}
        label={settings.label}
        max={settings.max}
        showZero={settings.showZero}
        size={settings.size}
        tone={settings.tone}
        urgency={settings.urgency}
        onClick={() => reportAction(settings.label)}
      />
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function DashboardActionPreview({
  children,
}: {
  children: (reportAction: (label: string) => void) => React.ReactNode;
}) {
  const [lastResult, setLastResult] = useState("Waiting for action");

  return (
    <div className={styles.dialogPreview}>
      {children((label) => setLastResult(`Last action: ${label}`))}
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function UpcomingTasksDashboardPreview({
  settings,
}: {
  settings: ControlSettingsBySlug["upcoming-tasks"];
}) {
  const [tasks, setTasks] = useState(() => demoUpcomingTasks.map((task) => ({ ...task })));

  return (
    <DashboardActionPreview>
      {(reportAction) => (
        <DashboardPreviewGrid
          containerDataComponent="upcoming-tasks"
          containerWidth={settings.width ?? "widget"}
          layout={settings.previewLayout}
          renderItem={() => (
            <UpcomingTasks
              checkboxSize={settings.checkboxSize ?? "md"}
              footerLabel={settings.footerLabel}
              onFooterClick={() => reportAction(settings.footerLabel)}
              onTaskClick={(task) => reportAction(task.title)}
              onTaskCompleteChange={(task, completed) => {
                setTasks((current) =>
                  current.map((entry) => (entry.id === task.id ? { ...entry, completed } : entry)),
                );
                reportAction(completed ? `Completed: ${task.title}` : `Reopened: ${task.title}`);
              }}
              tasks={tasks}
              title={settings.title}
            />
          )}
        />
      )}
    </DashboardActionPreview>
  );
}

function DashboardListColumnsDashboardPreview({
  settings,
}: {
  settings: ControlSettingsBySlug["dashboard-list-columns"];
}) {
  const [tasks, setTasks] = useState(() => demoUpcomingTasks.map((task) => ({ ...task })));
  const containerWidth = settings.width === "widget" ? "widget" : "full";

  return (
    <DashboardActionPreview>
      {(reportAction) => (
        <DashboardPreviewGrid
          containerDataComponent="dashboard-list-columns"
          containerWidth={settings.width ?? "full"}
          layout={settings.previewLayout}
          unwrapped
          renderItem={() => (
            <Columns
              columns={3}
              direction={settings.layout === "stacked" ? "column" : "row"}
              gap={16}
            >
              <DashboardContentContainer data-component="upcoming-tasks" width={containerWidth}>
                <UpcomingTasks
                  checkboxSize={settings.checkboxSize ?? "md"}
                  footerLabel={settings.upcomingTasksFooterLabel}
                  onFooterClick={() => reportAction(settings.upcomingTasksFooterLabel)}
                  onTaskClick={(task) => reportAction(task.title)}
                  onTaskCompleteChange={(task, completed) => {
                    setTasks((current) =>
                      current.map((entry) => (entry.id === task.id ? { ...entry, completed } : entry)),
                    );
                    reportAction(completed ? `Completed: ${task.title}` : `Reopened: ${task.title}`);
                  }}
                  tasks={tasks}
                  title={settings.upcomingTasksTitle}
                />
              </DashboardContentContainer>
              <DashboardContentContainer data-component="recent-activity" width={containerWidth}>
                <RecentActivity
                  footerLabel={settings.recentActivityFooterLabel}
                  items={demoRecentActivity}
                  onFooterClick={() => reportAction(settings.recentActivityFooterLabel)}
                  onItemClick={(item) => reportAction(item.title)}
                  title={settings.recentActivityTitle}
                />
              </DashboardContentContainer>
              <DashboardContentContainer data-component="top-performing-users" width={containerWidth}>
                <TopPerformingUsers
                  footerLabel={settings.topPerformingUsersFooterLabel}
                  onFooterClick={() => reportAction(settings.topPerformingUsersFooterLabel)}
                  onPersonClick={(person) => reportAction(person.name)}
                  title={settings.topPerformingUsersTitle}
                  users={demoTopPerformingUsers}
                />
              </DashboardContentContainer>
            </Columns>
          )}
        />
      )}
    </DashboardActionPreview>
  );
}

function DropdownMenuPreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["dropdown-menu"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [lastResult, setLastResult] = useState<string>("Waiting for action");
  const items = [
    ...dropdownMenuItemsBase.map((item) => ({
      ...item,
      icon: settings.showIcons ? item.icon : undefined,
    })),
    ...(settings.showDisabled
      ? [{ disabled: true, icon: settings.showIcons ? "⌁" : undefined, id: "archive", label: "Archive" }]
      : []),
    ...(settings.showDestructive
      ? [{ destructive: true, icon: settings.showIcons ? "!" : undefined, id: "delete", label: "Delete" }]
      : []),
  ];

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Dropdown menus are for contextual actions. They are separate from form selects and support
        disabled, checked, shortcut, and destructive item states.
      </p>
      <DropdownMenu
        closeOnEscape={settings.closeOnEscape}
        closeOnOutside={settings.closeOnOutside}
        closeOnSelect={settings.closeOnSelect}
        items={items}
        label="Open dropdown menu demo"
        open={settings.open}
        placement={settings.placement}
        trigger={<Button variant="primary">Actions</Button>}
        onOpenChange={(open) => onSettingsChange({ ...settings, open } as ControlSettings)}
        onSelect={(item) => setLastResult(`Last action: ${item.label}`)}
      />
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function ContextMenuPreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["context-menu"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [lastResult, setLastResult] = useState<string>("Waiting for action");
  const items = [
    ...dropdownMenuItemsBase.map((item) => ({
      ...item,
      icon: settings.showIcons ? item.icon : undefined,
    })),
    ...(settings.showDisabled
      ? [{ disabled: true, icon: settings.showIcons ? "⌁" : undefined, id: "archive", label: "Archive" }]
      : []),
    ...(settings.showDestructive
      ? [{ destructive: true, icon: settings.showIcons ? "!" : undefined, id: "delete", label: "Delete" }]
      : []),
  ];

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Context menus open on right-click and appear at the pointer. They reuse dropdown menu item
        states for actions, shortcuts, checks, and destructive entries.
      </p>
      <ContextMenuProvider
        closeOnEscape={settings.closeOnEscape}
        closeOnOutside={settings.closeOnOutside}
        closeOnSelect={settings.closeOnSelect}
        open={settings.open}
        onOpenChange={(open) => onSettingsChange({ ...settings, open } as ControlSettings)}
      >
        <ContextMenuTarget
          className={styles.contextMenuTarget}
          items={items}
          label="Context menu demo"
          onSelect={(item) => setLastResult(`Last action: ${item.label}`)}
        >
          <div className={styles.contextMenuDemo}>
            <p className={styles.contextMenuDemoTitle}>{settings.targetLabel}</p>
            <p className={styles.contextMenuDemoHint}>Right-click anywhere in this area for actions.</p>
          </div>
        </ContextMenuTarget>
      </ContextMenuProvider>
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function CommandPalettePreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["command-palette"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [lastResult, setLastResult] = useState<string>("Waiting for action");
  const items = settings.showEmptyResults ? [] : commandPaletteItemsBase;

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Command palettes are keyboard-first launchers for navigation, actions, and search. Use
        arrow keys to move, Enter to select, and Escape to close.
      </p>
      <div className={styles.toastActions}>
        <Button
          variant="primary"
          onClick={() => onSettingsChange({ ...settings, open: true } as ControlSettings)}
        >
          Open command palette
        </Button>
        <span className={styles.dialogResult}>{lastResult}</span>
      </div>
      <CommandPalette
        closeOnSelect={settings.closeOnSelect}
        dismissOnBackdrop={settings.dismissOnBackdrop}
        dismissOnEscape={settings.dismissOnEscape}
        emptyMessage={settings.emptyMessage}
        items={items}
        open={settings.open}
        placeholder={settings.placeholder}
        showDescriptions={settings.showDescriptions}
        showGroups={settings.showGroups}
        showShortcuts={settings.showShortcuts}
        onClose={() => onSettingsChange({ ...settings, open: false } as ControlSettings)}
        onSelect={(item) => setLastResult(`Last command: ${item.label}`)}
      />
    </div>
  );
}

function TopNavigationPreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["top-navigation"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [lastResult, setLastResult] = useState<string>("Waiting for action");
  const activeMenu = settings.activeMenu === "none" ? null : settings.activeMenu;

  const handleSelect = useCallback((menuId: string, item: TopNavigationSelectItem) => {
    setLastResult(`${menuId}: ${item.label}`);
  }, []);

  const menus = useMemo(
    () =>
      topNavigationDemoMenus.map((menu) => {
        if (menu.type === "dropdown") {
          return {
            ...menu,
            items: menu.items.map((item) => ({
              ...item,
              onSelect: () => handleSelect(menu.id, { id: item.id, label: item.label }),
            })),
          };
        }

        return {
          ...menu,
          sections: menu.sections.map((section) => ({
            ...section,
            items: section.items.map((item) => ({
              ...item,
              onSelect: () =>
                handleSelect(menu.id, {
                  id: item.id,
                  label: item.label,
                  description: item.description,
                }),
            })),
          })),
        };
      }),
    [handleSelect],
  );

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Select any item from App, File, Edit, View, Window, or Help. Dropdown and mega menu links
        call back through item onSelect handlers and update the result below.
      </p>
      <TopNavigation
        activeMenu={activeMenu}
        closeOnEscape={settings.closeOnEscape}
        closeOnOutside={settings.closeOnOutside}
        closeOnSelect={settings.closeOnSelect}
        density={settings.density}
        menus={menus}
        showShortcuts={settings.showShortcuts}
        onActiveMenuChange={(menuId) =>
          onSettingsChange({ ...settings, activeMenu: menuId ?? "none" } as ControlSettings)
        }
      />
      <span className={styles.dialogResult}>{lastResult}</span>
    </div>
  );
}

function PopoverPreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["popover"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [note, setNote] = useState("Follow up next week");
  const [priority, setPriority] = useState("Medium");

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Popovers are anchored to a trigger and accept JSX children for compact content, actions, or
        small forms.
      </p>
      <Popover
        closeOnEscape={settings.closeOnEscape}
        closeOnOutside={settings.closeOnOutside}
        label="Open popover demo"
        open={settings.open}
        placement={settings.placement}
        showArrow={settings.showArrow}
        title={settings.title}
        trigger={<Button variant="primary">Open popover</Button>}
        onOpenChange={(open) => onSettingsChange({ ...settings, open } as ControlSettings)}
      >
        {settings.contentType === "form" ? (
          <div className={styles.modalFormDemo}>
            <TextField
              id="popover-demo-note"
              label="Note"
              mode="stacked"
              labelPosition="left"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <SelectField
              id="popover-demo-priority"
              label="Priority"
              mode="stacked"
              labelPosition="left"
              options={["Low", "Medium", "High"]}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            />
          </div>
        ) : (
          <div className={styles.modalHtmlDemo}>
            {settings.content
              .split(/\n\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
          </div>
        )}
      </Popover>
    </div>
  );
}

function DrawerPreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["drawer"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [query, setQuery] = useState("Design system");
  const [category, setCategory] = useState("Components");
  const [onlyActive, setOnlyActive] = useState(true);
  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [lastResult, setLastResult] = useState<string>("Waiting for action");
  const closeDrawer = (result = "closed") => {
    setLastResult(`Last result: ${result}`);
    onSettingsChange({ ...settings, open: false } as ControlSettings);
  };

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Drawers accept JSX children for navigation, filters, inspectors, and compact workflows
        that slide in from any screen edge.
      </p>
      <div className={styles.toastActions}>
        <Button
          variant="primary"
          onClick={() => onSettingsChange({ ...settings, open: true } as ControlSettings)}
        >
          Open drawer
        </Button>
        <span className={styles.dialogResult}>{lastResult}</span>
      </div>
      <Drawer
        closeButton={settings.closeButton}
        description={settings.description}
        dismissOnBackdrop={settings.dismissOnBackdrop}
        dismissOnEscape={settings.dismissOnEscape}
        footer={settings.footerActions ? "Drawer changes are applied to the current page." : undefined}
        actions={settings.footerActions ? <DrawerDefaultActions onClose={() => closeDrawer("applied")} /> : undefined}
        open={settings.open}
        side={settings.side}
        title={settings.title}
        onClose={() => closeDrawer("dismissed")}
      >
        {settings.contentType === "form" ? (
          <div className={styles.modalFormDemo}>
            <TextField
              id="drawer-demo-query"
              label="Search query"
              mode="stacked"
              labelPosition="left"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <SelectField
              id="drawer-demo-category"
              label="Category"
              mode="stacked"
              labelPosition="left"
              options={["Components", "Templates", "Tokens"]}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
            <SwitchField
              id="drawer-demo-active"
              label="Only show active items"
              mode="flagged"
              labelPosition="right"
              checked={onlyActive}
              onChange={(event) => setOnlyActive(event.target.checked)}
            />
            <CheckboxField
              id="drawer-demo-drafts"
              label="Include draft items"
              mode="flagged"
              labelPosition="right"
              checked={includeDrafts}
              shape="square"
              onChange={(event) => setIncludeDrafts(event.target.checked)}
            />
          </div>
        ) : (
          <div className={styles.modalHtmlDemo}>
            {settings.content
              .split(/\n\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            <ul>
              <li>Use left/right drawers for navigation, filters, and inspectors.</li>
              <li>Use top/bottom drawers for transient panels and compact workflows.</li>
              <li>Supports blocking or dismissible overlay behavior.</li>
            </ul>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function ModalPreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["modal"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [workspaceName, setWorkspaceName] = useState("Opus Design System");
  const [plan, setPlan] = useState("Team");
  const [launchNotifications, setLaunchNotifications] = useState(true);
  const [reviewedSettings, setReviewedSettings] = useState(true);
  const [lastResult, setLastResult] = useState<string>("Waiting for action");
  const closeModal = (result = "closed") => {
    setLastResult(`Last result: ${result}`);
    onSettingsChange({ ...settings, open: false } as ControlSettings);
  };

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Modals accept JSX children, so they can render plain HTML, custom content, or fully
        functional Opus form components inside the overlay.
      </p>
      <div className={styles.toastActions}>
        <Button
          variant="primary"
          onClick={() => onSettingsChange({ ...settings, open: true } as ControlSettings)}
        >
          Open modal
        </Button>
        <span className={styles.dialogResult}>{lastResult}</span>
      </div>
      <Modal
        closeButton={settings.closeButton}
        description={settings.description}
        dismissOnBackdrop={settings.dismissOnBackdrop}
        dismissOnEscape={settings.dismissOnEscape}
        footer={settings.footerActions ? "Changes are only saved when you confirm." : undefined}
        actions={settings.footerActions ? <ModalDefaultActions onClose={() => closeModal("saved")} /> : undefined}
        open={settings.open}
        size={settings.size}
        title={settings.title}
        onClose={() => closeModal("dismissed")}
      >
        {settings.contentType === "form" ? (
          <div className={styles.modalFormDemo}>
            <TextField
              id="modal-demo-name"
              label="Workspace name"
              mode="stacked"
              labelPosition="left"
              type="text"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
            />
            <SelectField
              id="modal-demo-plan"
              label="Plan"
              mode="stacked"
              labelPosition="left"
              options={["Starter", "Team", "Enterprise"]}
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
            />
            <SwitchField
              id="modal-demo-notifications"
              label="Enable launch notifications"
              mode="flagged"
              labelPosition="right"
              checked={launchNotifications}
              onChange={(event) => setLaunchNotifications(event.target.checked)}
            />
            <CheckboxField
              id="modal-demo-terms"
              label="I have reviewed the workspace settings"
              mode="flagged"
              labelPosition="right"
              checked={reviewedSettings}
              shape="square"
              onChange={(event) => setReviewedSettings(event.target.checked)}
            />
          </div>
        ) : (
          <div className={styles.modalHtmlDemo}>
            {settings.content
              .split(/\n\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            <ul>
              <li>Supports headings, paragraphs, lists, media, and custom layouts.</li>
              <li>Keeps the user in context without navigating away.</li>
              <li>Uses the same backdrop and animation language as dialogs.</li>
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
}

function DialogPreviewDemo({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["dialog"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [lastResult, setLastResult] = useState<string>("Waiting for action");

  return (
    <div className={styles.dialogPreview}>
      <p className={styles.toastHint}>
        Dialogs support standard confirmation phases and can either dismiss from the backdrop or
        block backdrop clicks for higher-risk actions.
      </p>
      <div className={styles.toastActions}>
        <Button
          variant="primary"
          onClick={() => onSettingsChange({ ...settings, open: true } as ControlSettings)}
        >
          Open dialog
        </Button>
        <span className={styles.dialogResult}>{lastResult}</span>
      </div>
      <Dialog
        actionSet={settings.actionSet}
        description={settings.description}
        dismissOnBackdrop={settings.dismissOnBackdrop}
        dismissOnEscape={settings.dismissOnEscape}
        open={settings.open}
        status={settings.status}
        title={settings.title}
        onClose={(result) => {
          setLastResult(`Last result: ${result}`);
          onSettingsChange({ ...settings, open: false } as ControlSettings);
        }}
      />
    </div>
  );
}

function ToastPreviewDemo({ settings }: { settings: ControlSettingsBySlug["toast"] }) {
  const { setViewport, show } = useToast();
  const duration = settings.autoDismissEnabled ? DEFAULT_TOAST_DURATION_MS : undefined;

  useEffect(() => {
    setViewport({
      horizontal: settings.positionHorizontal,
      vertical: settings.positionVertical,
    });
  }, [settings.positionHorizontal, settings.positionVertical, setViewport]);

  const showRandomToast = () => {
    const status = toastStatuses[Math.floor(Math.random() * toastStatuses.length)];
    const samples = randomToastSamples[status];
    const sample = samples[Math.floor(Math.random() * samples.length)];
    const randomDuration =
      Math.random() < 0.35 ? undefined : 3000 + Math.round(Math.random() * 2000);

    show({
      description: sample.description,
      dismissible: settings.dismissible,
      duration: randomDuration,
      status,
      title: sample.title,
    });
  };

  return (
    <div className={styles.toastPreview}>
      <p className={styles.toastHint}>
        Toasts animate in through <code>ToastProvider</code> and stack at the configured viewport
        corner. Hover a toast to pause its auto-dismiss timer. Random toasts mix 3–5s timers
        with some that stay until dismissed.
      </p>
      <div className={styles.toastActions}>
        <Button
          variant="primary"
          onClick={() =>
            show({
              description: settings.descriptionEnabled ? settings.description : undefined,
              dismissible: settings.dismissible,
              duration,
              status: settings.status,
              title: settings.title,
            })
          }
        >
          Trigger toast
        </Button>
        <Button variant="secondary" onClick={showRandomToast}>
          Add random toast
        </Button>
      </div>
    </div>
  );
}

function TabsPreview({
  onSettingsChange,
  settings,
}: {
  settings: ControlSettingsBySlug["tabs"];
  onSettingsChange: (next: ControlSettings) => void;
}) {
  const [projectName, setProjectName] = useState("Opus");
  const [releaseTrack, setReleaseTrack] = useState("Stable");
  const [notifyTeam, setNotifyTeam] = useState(true);

  return (
    <Tabs
      fitted={settings.fitted}
      items={[
        {
          content: <p>Review the main project status, recent activity, and current design-system health.</p>,
          label: "Overview",
          value: "overview",
        },
        {
          content: <p>Track component usage, accessibility checks, and adoption across product surfaces.</p>,
          disabled: settings.disabledSecond,
          label: "Insights",
          value: "insights",
        },
        {
          content: <p>Configure release notes, component ownership, and library publishing preferences.</p>,
          label: "Settings",
          value: "settings",
        },
        {
          content: (
            <div className={styles.modalFormDemo}>
              <TextField
                id="tabs-demo-project-name"
                label="Project name"
                mode="stacked"
                labelPosition="left"
                type="text"
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
              />
              <SelectField
                id="tabs-demo-release-track"
                label="Release track"
                mode="stacked"
                labelPosition="left"
                options={["Stable", "Beta", "Experimental"]}
                value={releaseTrack}
                onChange={(event) => setReleaseTrack(event.target.value)}
              />
              <SwitchField
                id="tabs-demo-notify-team"
                label="Notify team on publish"
                mode="flagged"
                labelPosition="right"
                checked={notifyTeam}
                onChange={(event) => setNotifyTeam(event.target.checked)}
              />
            </div>
          ),
          label: "Form",
          value: "form",
        },
      ]}
      orientation={settings.orientation}
      value={settings.activeValue}
      variant={settings.variant}
      onValueChange={(activeValue) =>
        onSettingsChange({ ...settings, activeValue } as ControlSettings)
      }
    />
  );
}

const textFieldTypes = {
  "email-input": "email",
  "password-input": "password",
  "search-input": "search",
  "url-input": "url",
} as const;

const dateFieldTypes = {
  "date-picker": "date",
  "datetime-picker": "datetime-local",
  "month-picker": "month",
  "time-picker": "time",
  "week-picker": "week",
} as const;

const DATA_GRID_PAGE_SIZE = 40;

function DataGridPreview({ settings: s }: { settings: ControlSettingsBySlug["data-grid"] }) {
  const [pageCount, setPageCount] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setPageCount(1);
    setLoadingMore(false);
  }, [s.infiniteScroll, s.layout]);

  const gridDefaults = {
    filterable: s.filterable,
    resizable: s.resizable,
    sortable: s.sortable,
  };
  const columns = buildDataGridColumns({
    gridDefaults,
    numericColumns: s.numericColumns,
    q1Q2Resizable: s.q1Q2Resizable,
    q1Q2SortFilter: s.q1Q2SortFilter,
    teamResizable: s.rowHeaderResizable,
  });

  const baseRows =
    s.layout === "tree"
      ? dataGridTreeRows
      : s.infiniteScroll
        ? createDataGridRows(pageCount * DATA_GRID_PAGE_SIZE)
        : dataGridRows;

  const hasMore = s.infiniteScroll && s.layout !== "tree" && s.layout !== "pivot" && pageCount < 8;

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loadingMore) {
      return;
    }
    setLoadingMore(true);
    window.setTimeout(() => {
      setPageCount((count) => count + 1);
      setLoadingMore(false);
    }, 450);
  }, [hasMore, loadingMore]);

  return (
    <DataGrid
      bordered={s.bordered}
      caption={s.caption}
      columns={columns}
      density={s.density}
      getDetailContent={
        s.masterDetail && s.layout !== "pivot" ? getDetailContentForDemo : undefined
      }
      groupBy={s.layout === "grouped" ? "group" : undefined}
      hasMore={hasMore}
      layout={s.layout}
      loadingMore={loadingMore}
      onLoadMore={s.infiniteScroll && s.layout !== "tree" && s.layout !== "pivot" ? handleLoadMore : undefined}
      pivot={s.layout === "pivot" ? dataGridPivotConfig : undefined}
      rows={baseRows}
      stickyFirstColumn={s.stickyFirstColumn}
      stickyHeader={s.stickyHeader}
      striped={s.striped}
      virtualized={s.virtualized}
      viewportHeight={s.virtualized || s.infiniteScroll ? 360 : undefined}
    />
  );
}


function HotkeyManagerPreview({ enabled, hotkey }: { enabled: boolean; hotkey: string }) {
  const [count, setCount] = useState(0);
  const onFire = useCallback(() => {
    setCount((n) => n + 1);
  }, []);

  return (
    <HotkeyManager enabled={enabled}>
      <HotkeyListener hotkey={hotkey} onFire={onFire} />
      <div style={{ display: "grid", gap: 8 }}>
        <p style={{ margin: 0 }}>
          Press <KeyboardShortcut keys={["Meta", hotkey.toUpperCase()]} /> (or Ctrl+{hotkey.toUpperCase()} via settings key) — fired {count} times.
        </p>
        <p style={{ margin: 0, color: "var(--opus-muted)" }}>Demo listens for key &quot;{hotkey}&quot; with Meta.</p>
      </div>
    </HotkeyManager>
  );
}

function HotkeyListener({ hotkey, onFire }: { hotkey: string; onFire: () => void }) {
  const combo = useMemo(
    () => ({ id: "demo-hotkey", key: hotkey, meta: true, description: "Demo" }),
    [hotkey],
  );
  useHotkey(combo, onFire);
  return null;
}

function ClipboardPreview({ value }: { value: string }) {
  return (
    <Clipboard>
      <ClipboardPreviewInner value={value} />
    </Clipboard>
  );
}

function ClipboardPreviewInner({ value }: { value: string }) {
  const { lastCopied, writeText } = useClipboard();
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Button type="button" variant="primary" onClick={() => void writeText(value)}>
        Write to clipboard
      </Button>
      <p style={{ margin: 0, color: "var(--opus-muted)" }}>
        Last copied: {lastCopied ?? "—"}
      </p>
    </div>
  );
}

function PropertyInspectorPreview({ searchable }: { searchable: boolean }) {
  const [items, setItems] = useState(() => demoPropertyInspectorItems());
  return (
    <PropertyInspector
      items={items}
      searchable={searchable}
      onChange={(id, value) =>
        setItems((current) => current.map((item) => (item.id === id ? { ...item, value } : item)))
      }
    />
  );
}

function FilterBuilderPreview() {
  const [conditions, setConditions] = useState(demoFilterConditions);
  return <FilterBuilder conditions={conditions} fields={demoInspectorFields} onChange={setConditions} />;
}

function QueryBuilderPreview({ combinator }: { combinator: "and" | "or" }) {
  const [group, setGroup] = useState(() => ({ ...demoQueryGroup, combinator }));
  useEffect(() => {
    setGroup((current) => ({ ...current, combinator }));
  }, [combinator]);
  return <QueryBuilder fields={demoInspectorFields} group={group} onChange={setGroup} />;
}

function RuleBuilderPreview({ showDisabled }: { showDisabled: boolean }) {
  const [rules, setRules] = useState(demoRules);
  const visible = showDisabled ? rules : rules.filter((rule) => rule.enabled);
  return (
    <RuleBuilder
      rules={visible}
      onChange={(next) => {
        if (showDisabled) {
          setRules(next);
          return;
        }
        const disabled = rules.filter((rule) => !rule.enabled);
        setRules([...next, ...disabled].map((rule, index) => ({ ...rule, priority: index + 1 })));
      }}
    />
  );
}

function PermissionsMatrixPreview() {
  const [permissions, setPermissions] = useState(() => demoPermissions());
  return (
    <PermissionsMatrix
      permissions={permissions}
      resources={demoPermissionResources}
      roles={demoPermissionRoles}
      onChange={(role, resource, level) =>
        setPermissions((current) => ({
          ...current,
          [role]: { ...current[role], [resource]: level },
        }))
      }
    />
  );
}

function DualListBuilderPreview({ selectedCount }: { selectedCount: number }) {
  const [selectedIds, setSelectedIds] = useState(() => demoDualListSelected.slice(0, selectedCount));
  useEffect(() => {
    setSelectedIds(demoDualListSelected.slice(0, Math.max(selectedCount, 0)));
  }, [selectedCount]);
  return <DualListBuilder available={demoDualListItems} onChange={setSelectedIds} selectedIds={selectedIds} />;
}

function KanbanBoardPreview({ interactive }: { interactive: boolean }) {
  const [columns, setColumns] = useState(demoKanbanColumns);
  return (
    <KanbanBoard
      cards={demoKanbanCards}
      columns={columns}
      onChange={interactive ? setColumns : undefined}
    />
  );
}

function CalendarPreview({ showEvents }: { showEvents: boolean }) {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  return (
    <Calendar
      events={showEvents ? demoCalendarEvents() : []}
      onSelectDate={setSelectedDate}
      selectedDate={selectedDate}
    />
  );
}

export function ControlPreview({ slug, settings, onSettingsChange }: ControlPreviewProps) {
  if (isChartSlug(slug)) {
    const s = settings as ControlSettingsBySlug[typeof slug];
    const canMaximise = maximisableChartVariants.includes(
      s.variant as (typeof maximisableChartVariants)[number],
    );
    const chartProps = {
      data: getChartPreviewData(slug),
      height: s.height,
      highlightLabel: s.highlightLabel || undefined,
      maximise: s.maximise,
      palette: s.palette,
      series: chartDemoSeries,
      showAxis: s.showAxis,
      showGrid: s.showGrid,
      showLegend: s.showLegend,
      showValues: s.showValues,
      title: s.title,
      variant: s.variant,
      xAxisLabel: s.xAxisLabel || undefined,
      yAxisLabel: s.yAxisLabel || undefined,
    };

    if (s.previewLayout === "split") {
      return (
        <div className={styles.chartPreviewGrid}>
          <div className={styles.chartPreviewItem}>
            <Chart {...chartProps} />
          </div>
          <div className={styles.chartPreviewItem}>
            <Chart {...chartProps} />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.chartPreviewSingle} data-maximise={s.maximise && canMaximise}>
        <Chart {...chartProps} />
      </div>
    );
  }

  switch (slug) {
    case "text-input": {
      const s = settings as ControlSettingsBySlug["text-input"];
      return (
        <TextField
          {...fieldProps(s)}
          id="preview-text-input"
          placeholder={s.placeholderEnabled ? s.placeholder : undefined}
          type="text"
          value={s.value}
          onChange={(event) => onSettingsChange({ ...s, value: event.target.value } as ControlSettings)}
        />
      );
    }
    case "email-input":
    case "password-input":
    case "search-input":
    case "url-input": {
      const s = settings as ValueFieldSettings;
      return (
        <TextField
          {...fieldProps(s)}
          id={`preview-${slug}`}
          type={textFieldTypes[slug]}
          value={s.value}
          onChange={(event) => onSettingsChange({ ...s, value: event.target.value } as ControlSettings)}
        />
      );
    }
    case "textarea": {
      const s = settings as ControlSettingsBySlug["textarea"];
      return (
        <TextAreaField
          {...fieldProps(s)}
          id="preview-textarea"
          maxChars={s.maxCharsEnabled ? s.maxChars : undefined}
          placeholder={s.placeholderEnabled ? s.placeholder : undefined}
          value={s.value}
          onChange={(event) => onSettingsChange({ ...s, value: event.target.value } as ControlSettings)}
        />
      );
    }
    case "note-composer": {
      const s = settings as ControlSettingsBySlug["note-composer"];
      return (
        <DashboardContentContainer data-component="notes-activity" width="widget">
          <NoteComposer
            placeholder={s.placeholder}
            saveButtonLabel={s.saveButtonLabel}
            showAttach={s.showAttach}
            showEmoji={s.showEmoji}
            showMention={s.showMention}
            value={s.value}
            onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
            onSave={() => onSettingsChange({ ...s, value: "" } as ControlSettings)}
          />
        </DashboardContentContainer>
      );
    }
    case "rich-text-field": {
      const s = settings as ControlSettingsBySlug["rich-text-field"];
      return (
        <RichTextField
          {...fieldProps(s)}
          id="preview-rich-text-field"
          minHeight={s.minHeight}
          placeholder={s.placeholderEnabled ? s.placeholder : undefined}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "filter-select": {
      const s = settings as ControlSettingsBySlug["filter-select"];
      return (
        <FilterSelectField
          {...fieldProps(s)}
          groups={filterSelectDemoGroups}
          id="preview-filter-select"
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "multi-select": {
      const s = settings as ControlSettingsBySlug["multi-select"];
      const options = s.options
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean);
      return (
        <MultiSelectField
          {...fieldProps(s)}
          id="preview-multi-select"
          options={options.length ? options : multiSelectDemoOptions}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "transfer-list": {
      const s = settings as ControlSettingsBySlug["transfer-list"];
      const available = s.available
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return (
        <TransferListField
          {...fieldProps(s)}
          available={available.length ? available : transferListDemoAvailable}
          id="preview-transfer-list"
          selected={s.selected}
          onChange={(selected) => onSettingsChange({ ...s, selected } as ControlSettings)}
        />
      );
    }
    case "password-strength-field": {
      const s = settings as ControlSettingsBySlug["password-strength-field"];
      return (
        <PasswordStrengthField
          {...fieldProps(s)}
          id="preview-password-strength-field"
          showRequirements={s.showRequirements}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "rating-input": {
      const s = settings as ControlSettingsBySlug["rating-input"];
      return (
        <RatingField
          {...fieldProps(s)}
          id="preview-rating-input"
          max={s.max}
          value={s.value}
          variant={s.variant}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "segmented-control": {
      const s = settings as ControlSettingsBySlug["segmented-control"];
      const options = s.options
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean);
      return (
        <SegmentedControlField
          {...fieldProps(s)}
          id="preview-segmented-control"
          options={options.length ? options : ["Monthly", "Quarterly", "Yearly"]}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "slider-range": {
      const s = settings as ControlSettingsBySlug["slider-range"];
      return (
        <SliderRangeField
          {...fieldProps(s)}
          id="preview-slider-range"
          max={s.max}
          min={s.min}
          step={s.step}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "phone-number-input": {
      const s = settings as ControlSettingsBySlug["phone-number-input"];
      return (
        <PhoneNumberField
          {...fieldProps(s)}
          countryCode={s.countryCode}
          id="preview-phone-number-input"
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
          onCountryCodeChange={(countryCode) =>
            onSettingsChange({ ...s, countryCode } as ControlSettings)
          }
        />
      );
    }
    case "country-picker": {
      const s = settings as ControlSettingsBySlug["country-picker"];
      return (
        <CountryPickerField
          {...fieldProps(s)}
          id="preview-country-picker"
          placeholder={s.placeholderEnabled ? s.placeholder : undefined}
          searchPlaceholder={s.searchPlaceholder}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "tree-select": {
      const s = settings as ControlSettingsBySlug["tree-select"];
      return (
        <TreeSelectField
          {...fieldProps(s)}
          id="preview-tree-select"
          nodes={treeSelectDemoNodes}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "cascader": {
      const s = settings as ControlSettingsBySlug["cascader"];
      return (
        <CascaderField
          {...fieldProps(s)}
          id="preview-cascader"
          options={cascaderDemoOptions}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "select": {
      const s = settings as ControlSettingsBySlug["select"];
      const options = s.options
        .split(",")
        .map((option) => option.trim())
        .filter(Boolean);
      return (
        <SelectField
          {...fieldProps(s)}
          id="preview-select"
          options={options.length ? options : ["Option 1"]}
          value={s.value}
          onChange={(event) => onSettingsChange({ ...s, value: event.target.value } as ControlSettings)}
        />
      );
    }
    case "date-picker":
    case "datetime-picker":
    case "month-picker":
    case "time-picker":
    case "week-picker": {
      const s = settings as ValueFieldSettings;
      return (
        <DateField
          {...fieldProps(s)}
          id={`preview-${slug}`}
          type={dateFieldTypes[slug] as DateInputType}
          value={s.value}
          onChange={(event) => onSettingsChange({ ...s, value: event.target.value } as ControlSettings)}
        />
      );
    }
    case "radio-group": {
      const s = settings as ControlSettingsBySlug["radio-group"];
      return (
        <RadioGroup
          {...fieldProps(s)}
          id="preview-radio-group"
          name="preview-radio-group"
          shape={s.shape}
          size={s.size ?? "md"}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        >
          {radioOptions.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              error={s.optionErrorsEnabled ? s.optionError : undefined}
            >
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      );
    }
    case "chip-input": {
      const s = settings as ControlSettingsBySlug["chip-input"];

      return (
        <ChipInput
          {...fieldProps(s)}
          disabled={s.disabled}
          id="preview-chip-input"
          placeholder={s.placeholderEnabled ? s.placeholder : undefined}
          readOnly={s.readOnly}
          value={parseChipValues(s.value)}
          variant={s.variant}
          onChange={(value) =>
            onSettingsChange({
              ...s,
              value,
            } as ControlSettings)
          }
        />
      );
    }
    case "checkbox": {
      const s = settings as ControlSettingsBySlug["checkbox"];
      return (
        <CheckboxField
          {...fieldProps(s)}
          id="preview-checkbox"
          checked={s.checked}
          shape={s.shape}
          size={s.size ?? "md"}
          onChange={(event) =>
            onSettingsChange({ ...s, checked: event.target.checked } as ControlSettings)
          }
        />
      );
    }
    case "switch": {
      const s = settings as ControlSettingsBySlug["switch"];
      return (
        <SwitchField
          {...fieldProps(s)}
          id="preview-switch"
          checked={s.checked}
          onChange={(event) =>
            onSettingsChange({ ...s, checked: event.target.checked } as ControlSettings)
          }
        />
      );
    }
    case "range-slider": {
      const s = settings as ControlSettingsBySlug["range-slider"];
      return (
        <RangeField
          {...fieldProps(s)}
          id="preview-range-slider"
          max={s.max}
          min={s.min}
          step={s.step}
          value={s.value}
          onChange={(event) =>
            onSettingsChange({ ...s, value: Number(event.target.value) } as ControlSettings)
          }
        />
      );
    }
    case "number-input": {
      const s = settings as ControlSettingsBySlug["number-input"];
      return (
        <NumberField
          {...fieldProps(s)}
          id="preview-number-input"
          max={s.max}
          min={s.min}
          step={s.step}
          value={s.value}
          onChange={(event) =>
            onSettingsChange({ ...s, value: Number(event.target.value) || 0 } as ControlSettings)
          }
        />
      );
    }
    case "file-upload": {
      const s = settings as ControlSettingsBySlug["file-upload"];
      return (
        <FileField
          {...fieldProps(s)}
          id="preview-file-upload"
          fileName={s.fileName}
          onChange={(event) =>
            onSettingsChange({
              ...s,
              fileName: event.target.files?.[0]?.name ?? "",
            } as ControlSettings)
          }
        />
      );
    }
    case "color-picker": {
      const s = settings as ControlSettingsBySlug["color-picker"];
      return (
        <ColorField
          {...fieldProps(s)}
          id="preview-color-picker"
          value={s.value}
          onChange={(event) => onSettingsChange({ ...s, value: event.target.value } as ControlSettings)}
        />
      );
    }
    case "hidden-input": {
      const s = settings as ControlSettingsBySlug["hidden-input"];
      return (
        <HiddenField
          help={s.helpEnabled ? s.help : undefined}
          id="preview-hidden-input"
          label={s.label}
          labelPosition={s.labelPosition}
          mode={s.mode}
          name={s.name}
          required={s.required}
          value={s.value}
        />
      );
    }
    case "button":
    case "submit-button":
    case "reset-button": {
      const s = settings as ControlSettingsBySlug["button"];
      const buttonType = slug === "submit-button" ? "submit" : slug === "reset-button" ? "reset" : "button";
      return (
        <Button disabled={s.disabled} type={buttonType} variant={s.variant}>
          {s.label}
        </Button>
      );
    }
    case "theme-toggle": {
      const s = settings as ControlSettingsBySlug["theme-toggle"];
      return (
        <ThemeToggleField
          help={s.helpEnabled ? s.help : undefined}
          id="preview-theme-toggle"
          label={s.label}
          labelPosition={s.labelPosition}
          mode={s.mode}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "accent-color-picker": {
      const s = settings as ControlSettingsBySlug["accent-color-picker"];
      const accentStyle = createAccentStyle(s.value);

      return (
        <div className={styles.accentPreview} style={accentStyle}>
          <AccentColorPicker
            help={s.helpEnabled ? s.help : undefined}
            id="preview-accent-color-picker"
            label={s.label}
            labelPosition={s.labelPosition}
            mode={s.mode}
            value={s.value}
            onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
          />
          <Button variant="primary">Preview accent</Button>
        </div>
      );
    }
    case "icon-picker": {
      const s = settings as ControlSettingsBySlug["icon-picker"];
      return (
        <IconPicker
          help={s.helpEnabled ? s.help : undefined}
          id="preview-icon-picker"
          label={s.label}
          labelPosition={s.labelPosition}
          mode={s.mode}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "emoji-picker": {
      const s = settings as ControlSettingsBySlug["emoji-picker"];
      return (
        <div className={styles.emojiPickerDemo}>
          <EmojiPicker
            closeOnEscape={s.closeOnEscape}
            closeOnOutside={s.closeOnOutside}
            open={s.open}
            placement={s.placement}
            searchPlaceholder={s.searchPlaceholder}
            trigger={
              <Button variant="secondary">
                <CatalogIcon iconName="face-smile" /> Add emoji
              </Button>
            }
            onOpenChange={(open) => onSettingsChange({ ...s, open } as ControlSettings)}
            onSelect={(emoji) =>
              onSettingsChange({ ...s, lastSelected: emoji, open: false } as ControlSettings)
            }
          />
          <p className={styles.emojiPickerSelection}>
            Last selected: <span aria-hidden="true">{s.lastSelected}</span>
          </p>
        </div>
      );
    }
    case "tooltip": {
      const s = settings as ControlSettingsBySlug["tooltip"];
      return (
        <div className={styles.tooltipDemo}>
          <span className={styles.tooltipDemoLabel}>{s.demoLabel}</span>
          <Tooltip content={s.content} label={`Help for ${s.demoLabel}`} />
        </div>
      );
    }
    case "dialog": {
      const s = settings as ControlSettingsBySlug["dialog"];
      return <DialogPreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    case "drawer": {
      const s = settings as ControlSettingsBySlug["drawer"];
      return <DrawerPreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    case "dropdown-menu": {
      const s = settings as ControlSettingsBySlug["dropdown-menu"];
      return <DropdownMenuPreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    case "context-menu": {
      const s = settings as ControlSettingsBySlug["context-menu"];
      return <ContextMenuPreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    case "command-palette": {
      const s = settings as ControlSettingsBySlug["command-palette"];
      return <CommandPalettePreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    case "modal": {
      const s = settings as ControlSettingsBySlug["modal"];
      return <ModalPreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    case "popover": {
      const s = settings as ControlSettingsBySlug["popover"];
      return <PopoverPreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    case "alert": {
      const s = settings as ControlSettingsBySlug["alert"];
      if (!s.visible) {
        return <p className={styles.dismissedHint}>Alert dismissed. Turn on “Show alert” in settings to preview it again.</p>;
      }
      return (
        <Alert
          description={s.description}
          dismissible={s.dismissible}
          iconFlagged={s.iconFlagged}
          status={s.status}
          title={s.title}
          onDismiss={() => onSettingsChange({ ...s, visible: false } as ControlSettings)}
        />
      );
    }
    case "toast": {
      const s = settings as ControlSettingsBySlug["toast"];
      return <ToastPreviewDemo settings={s} />;
    }
    case "card": {
      const s = settings as ControlSettingsBySlug["card"];
      return (
        <Card
          actions={
            s.footerActions ? (
              <>
                <Button variant="secondary">Details</Button>
                <Button variant="primary">Open</Button>
              </>
            ) : undefined
          }
          density={s.density}
          eyebrow={s.eyebrow}
          footer={s.footerActions ? "Updated 2 minutes ago" : undefined}
          media={s.media ? <span aria-hidden="true" /> : undefined}
          title={s.title}
          tone={s.tone}
        >
          <p>{s.content}</p>
        </Card>
      );
    }
    case "kpi-card":
    case "stat-card": {
      const s = settings as ControlSettingsBySlug["stat-card"];
      const icon = <CatalogIcon iconName={s.icon} />;

      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => (
            <StatCard
              change={s.showChange ? s.change : undefined}
              density={s.density}
              icon={icon}
              label={s.label}
              trend={s.trend}
              value={s.value}
            />
          )}
        />
      );
    }
    case "sparkline": {
      const s = settings as ControlSettingsBySlug["sparkline"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => (
            <Sparkline
              height={48}
              label={s.label}
              palette={s.palette}
              values={[18, 24, 21, 34, 29, 42, 38]}
              variant="labeled"
            />
          )}
        />
      );
    }
    case "progress-ring": {
      const s = settings as ControlSettingsBySlug["progress-ring"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => <ProgressRing label={s.label} max={s.max} value={s.value} />}
        />
      );
    }
    case "progress-bar": {
      const s = settings as ControlSettingsBySlug["progress-bar"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => <ProgressBar label={s.label} max={s.max} value={s.value} />}
        />
      );
    }
    case "gauge":
    {
      const s = settings as ControlSettingsBySlug["gauge"];
      const gaugeFooter = getGaugeFooter(s.palette);
      const footer =
        s.footerMetricCount > 0
          ? gaugeFooter.slice(0, s.footerMetricCount)
          : undefined;
      const sharedGaugeProps = {
        change: s.change,
        changeTrend: s.changeTrend,
        density: s.density,
        footer,
        subtitle: s.subtitle,
        summary: s.summary,
        trackColor: getGaugeTrackColor(s.trackTone, s.palette),
        value: gaugePreviewValue,
        valueColor: getGaugeValueColor(s.valueTone, s.palette),
      };

      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => <Gauge {...sharedGaugeProps} title={s.title} variant={s.variant} />}
        />
      );
    }
    case "speedometer": {
      const s = settings as ControlSettingsBySlug["speedometer"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => <Speedometer label={s.label} max={s.max} value={s.value} />}
        />
      );
    }
    case "metric-tile": {
      const s = settings as ControlSettingsBySlug["metric-tile"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => (
            <MetricTile
              icon={<CatalogIcon iconName={s.icon} />}
              label={s.label}
              sparkline={s.showSparkline ? [12, 18, 16, 24, 22, 30, 28] : undefined}
              value={s.value}
            />
          )}
        />
      );
    }
    case "dashboard-content-container": {
      const s = settings as ControlSettingsBySlug["dashboard-content-container"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          unwrapped
          renderItem={() => (
            <DashboardContentContainer title={s.title} width={s.width ?? "widget"}>
              <StatusIndicator label="Systems healthy" status="success" />
            </DashboardContentContainer>
          )}
        />
      );
    }
    case "pipeline-overview": {
      const s = settings as ControlSettingsBySlug["pipeline-overview"];
      const stageCount = parsePipelineStageCount(s.stageCount);
      const stageValues = [
        parseCurrencySetting(s.qualificationValue),
        parseCurrencySetting(s.proposalValue),
        parseCurrencySetting(s.negotiationValue),
        parseCurrencySetting(s.closingValue),
        parseCurrencySetting(s.wonValue),
      ].slice(0, stageCount);
      const percentages = normalizePercentages(stageValues);
      const stages = demoPipelineStages.slice(0, stageCount).map((stage, index) => ({
        ...stage,
        displayValue: formatCurrencySetting(stageValues[index] ?? 0),
        percentage: percentages[index] ?? 0,
        value: stageValues[index] ?? 0,
      }));
      const computedTotalValue = formatCurrencySetting(stageValues.reduce((sum, value) => sum + value, 0));
      return (
        <DashboardPreviewGrid
          containerDataComponent="pipeline-overview"
          containerTitle={s.title}
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => (
            <PipelineOverview
              onPeriodChange={(period) => onSettingsChange({ ...s, period } as ControlSettings)}
              period={s.period}
              stages={stages}
              totalLabel={s.totalLabel}
              totalValue={s.totalValue || computedTotalValue || demoPipelineTotalValue}
            />
          )}
        />
      );
    }
    case "deals-over-time": {
      const s = settings as ControlSettingsBySlug["deals-over-time"];
      const maxValue = Math.max(1, Number(s.maxValue) || 100);
      const data = getDealsOverTimeDemoData(s.period);
      return (
        <DashboardPreviewGrid
          containerDataComponent="deals-over-time"
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => (
            <DealsOverTime
              data={data}
              maxValue={maxValue}
              onPeriodChange={(period) => onSettingsChange({ ...s, period } as ControlSettings)}
              palette={s.palette ?? "purple"}
              period={s.period}
              periodOptions={[...dealsOverTimePeriodOptions]}
              title={s.title}
              valueLabel={s.valueLabel}
            />
          )}
        />
      );
    }
    case "404-page": {
      return <NotFoundPageContent />;
    }
    case "403-page": {
      return <ForbiddenPageContent />;
    }
    case "dashboard-list-columns": {
      const s = settings as ControlSettingsBySlug["dashboard-list-columns"];
      return <DashboardListColumnsDashboardPreview settings={s} />;
    }
    case "notes-activity": {
      const s = settings as ControlSettingsBySlug["notes-activity"];
      return (
        <DashboardActionPreview>
          {(reportAction) => (
            <DashboardPreviewGrid
              containerDataComponent="notes-activity"
              containerWidth={s.width ?? "widget"}
              layout={s.previewLayout}
              renderItem={() => (
                <NotesActivity
                  composerPlaceholder={s.composerPlaceholder}
                  footerLabel={s.footerLabel}
                  items={demoNotesActivity}
                  onFooterClick={() => reportAction(s.footerLabel)}
                  onItemClick={(item) => reportAction(item.body)}
                  onNoteSave={(note) => reportAction(`Saved note: ${note}`)}
                  onTabChange={(tab) => reportAction(`Tab: ${tab}`)}
                  saveButtonLabel={s.saveButtonLabel}
                />
              )}
            />
          )}
        </DashboardActionPreview>
      );
    }
    case "upcoming-tasks": {
      const s = settings as ControlSettingsBySlug["upcoming-tasks"];
      return <UpcomingTasksDashboardPreview settings={s} />;
    }
    case "recent-activity": {
      const s = settings as ControlSettingsBySlug["recent-activity"];
      return (
        <DashboardActionPreview>
          {(reportAction) => (
            <DashboardPreviewGrid
              containerDataComponent="recent-activity"
              containerWidth={s.width ?? "widget"}
              layout={s.previewLayout}
              renderItem={() => (
                <RecentActivity
                  footerLabel={s.footerLabel}
                  items={demoRecentActivity}
                  onFooterClick={() => reportAction(s.footerLabel)}
                  onItemClick={(item) => reportAction(item.title)}
                  title={s.title}
                />
              )}
            />
          )}
        </DashboardActionPreview>
      );
    }
    case "top-performing-users": {
      const s = settings as ControlSettingsBySlug["top-performing-users"];
      return (
        <DashboardActionPreview>
          {(reportAction) => (
            <DashboardPreviewGrid
              containerDataComponent="top-performing-users"
              containerWidth={s.width ?? "widget"}
              layout={s.previewLayout}
              renderItem={() => (
                <TopPerformingUsers
                  footerLabel={s.footerLabel}
                  onFooterClick={() => reportAction(s.footerLabel)}
                  onPersonClick={(person) => reportAction(person.name)}
                  title={s.title}
                  users={demoTopPerformingUsers}
                />
              )}
            />
          )}
        </DashboardActionPreview>
      );
    }
    case "status-indicator": {
      const s = settings as ControlSettingsBySlug["status-indicator"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => <StatusIndicator label={s.label} status={s.status} />}
        />
      );
    }
    case "trend-badge": {
      const s = settings as ControlSettingsBySlug["trend-badge"];
      return (
        <DashboardPreviewGrid
          containerWidth={s.width ?? "widget"}
          layout={s.previewLayout}
          renderItem={() => <TrendBadge direction={s.direction} value={s.value} />}
        />
      );
    }
    case "panel": {
      const s = settings as ControlSettingsBySlug["panel"];
      return (
        <Panel
          density={s.density}
          description={s.description}
          divided={s.divided}
          footer={s.footer}
          title={s.title}
          tone={s.tone}
        >
          <p>{s.content}</p>
        </Panel>
      );
    }
    case "section": {
      const s = settings as ControlSettingsBySlug["section"];
      const config = getSectionLayoutConfigFromSettings(s);
      const slots = getSectionDemoSlots(s);
      const sidebarSlot = slots.find((slot) => slot.role === "sidebar");
      const contentSlots = slots.filter((slot) => slot.role === "content");
      const rowProps = {
        columns: s.columns,
        gap: s.gap,
        sidebar: s.sidebar,
        sidebarRatio: s.sidebarRatio,
        stackBelow: s.stackBelow,
      };

      const renderPanel = (slot: { title: string; content: string }) => (
        <Panel density="compact" title={slot.title}>
          <p>{slot.content}</p>
        </Panel>
      );

      if (usesNestedContentRow(config) && sidebarSlot) {
        const contentRow = (
          <Section.Row columns={s.columns} gap={s.gap} stackBelow={s.stackBelow}>
            {contentSlots.map((slot) => (
              <Section.Column key={slot.title}>{renderPanel(slot)}</Section.Column>
            ))}
          </Section.Row>
        );

        return (
          <Section description={s.description} gap={s.gap} title={s.title}>
            <Section.Row {...rowProps}>
              {s.sidebar === "left" ? (
                <>
                  <Section.Column>{renderPanel(sidebarSlot)}</Section.Column>
                  <Section.Column>{contentRow}</Section.Column>
                </>
              ) : (
                <>
                  <Section.Column>{contentRow}</Section.Column>
                  <Section.Column>{renderPanel(sidebarSlot)}</Section.Column>
                </>
              )}
            </Section.Row>
          </Section>
        );
      }

      return (
        <Section description={s.description} gap={s.gap} title={s.title}>
          <Section.Row {...rowProps}>
            {slots.map((slot) => (
              <Section.Column key={slot.title}>{renderPanel(slot)}</Section.Column>
            ))}
          </Section.Row>
        </Section>
      );
    }
    case "table": {
      const s = settings as ControlSettingsBySlug["table"];
      const columns = s.numericColumn ? tableColumns : tableColumns.map((column) => ({ ...column, align: "left" as const }));
      return (
        <Table
          bordered={s.bordered}
          caption={s.caption}
          columns={columns}
          density={s.density}
          rows={s.showEmpty ? [] : tableRows}
          showCaption={s.showCaption}
          striped={s.striped}
          emptyMessage="No component adoption data available."
        />
      );
    }
    case "data-grid": {
      const s = settings as ControlSettingsBySlug["data-grid"];
      return <DataGridPreview settings={s} />;
    }
    case "skeleton": {
      const s = settings as ControlSettingsBySlug["skeleton"];
      return (
        <Skeleton
          animation={s.animation}
          lines={s.lines}
          variant={s.variant}
        />
      );
    }
    case "carousel": {
      const s = settings as ControlSettingsBySlug["carousel"];
      return (
        <Carousel
          images={galleryImagesWithAltCaptions}
          initialIndex={s.initialIndex}
          loop={s.loop}
          showCaptions={s.showCaptions}
          showPips={s.showPips}
        />
      );
    }
    case "lightbox": {
      const s = settings as ControlSettingsBySlug["lightbox"];
      return (
        <Lightbox
          dismissOnBackdrop={s.dismissOnBackdrop}
          dismissOnEscape={s.dismissOnEscape}
          image={{ ...galleryImages[0], caption: galleryImages[0].alt }}
          showCaption={s.showCaptions}
          triggerLabel={s.triggerLabel}
        />
      );
    }
    case "image-thumbnail": {
      const s = settings as ControlSettingsBySlug["image-thumbnail"];
      return (
        <ImageThumbnail
          image={{ ...galleryImages[0], caption: galleryImages[0].alt }}
          openInLightbox={s.openInLightbox}
          showCaption={s.showCaption}
          size={s.size}
        />
      );
    }
    case "image-gallery": {
      const s = settings as ControlSettingsBySlug["image-gallery"];
      return (
        <ImageGallery
          columns={s.columns}
          images={galleryImagesWithAltCaptions}
          showCaptions={s.showCaptions}
          thumbnailSize={s.thumbnailSize}
        />
      );
    }
    case "model-viewer": {
      const s = settings as ControlSettingsBySlug["model-viewer"];
      return (
        <ModelViewer
          asset={modelAssets[0]}
          autoRotate={s.autoRotate}
          cameraControls={s.cameraControls}
          showCaption={s.showCaption}
        />
      );
    }
    case "model-lightbox": {
      const s = settings as ControlSettingsBySlug["model-lightbox"];
      return (
        <ModelLightbox
          asset={modelAssets[0]}
          dismissOnBackdrop={s.dismissOnBackdrop}
          dismissOnEscape={s.dismissOnEscape}
          showCaption={s.showCaption}
          triggerLabel={s.triggerLabel}
        />
      );
    }
    case "model-thumbnail": {
      const s = settings as ControlSettingsBySlug["model-thumbnail"];
      return (
        <ModelThumbnail
          asset={modelAssets[0]}
          openInLightbox={s.openInLightbox}
          showCaption={s.showCaption}
          size={s.size}
        />
      );
    }
    case "model-gallery": {
      const s = settings as ControlSettingsBySlug["model-gallery"];
      return (
        <ModelGallery
          assets={modelAssets}
          columns={s.columns}
          showCaptions={s.showCaptions}
          thumbnailSize={s.thumbnailSize}
        />
      );
    }
    case "tabs": {
      const s = settings as ControlSettingsBySlug["tabs"];
      return (
        <TabsPreview settings={s} onSettingsChange={onSettingsChange} />
      );
    }
    case "accordion": {
      const s = settings as ControlSettingsBySlug["accordion"];
      return (
        <Accordion defaultOpen={s.defaultOpen} disabled={s.disabled} title={s.title}>
          {s.content}
        </Accordion>
      );
    }
    case "accordion-group": {
      const s = settings as ControlSettingsBySlug["accordion-group"];
      return (
        <AccordionGroup
          collapsible={s.collapsible}
          defaultValue={
            s.defaultOpenFirst ? (s.type === "multiple" ? ["item-one"] : "item-one") : undefined
          }
          type={s.type}
        >
          <Accordion title={s.itemOneTitle} value="item-one">
            {s.itemOneContent}
          </Accordion>
          <Accordion title={s.itemTwoTitle} value="item-two">
            {s.itemTwoContent}
          </Accordion>
          <Accordion title={s.itemThreeTitle} value="item-three">
            {s.itemThreeContent}
          </Accordion>
        </AccordionGroup>
      );
    }
    case "show-more": {
      const s = settings as ControlSettingsBySlug["show-more"];
      return (
        <ShowMore
          key={`${s.defaultExpanded}-${s.maxLines}`}
          defaultExpanded={s.defaultExpanded}
          maxLines={s.maxLines}
          showLessLabel={s.showLessLabel}
          showMoreLabel={s.showMoreLabel}
        >
          {s.content}
        </ShowMore>
      );
    }
    case "empty-state": {
      const s = settings as ControlSettingsBySlug["empty-state"];
      const actions =
        s.primaryAction || s.secondaryAction ? (
          <>
            {s.secondaryAction ? <Button variant="secondary">{s.secondaryActionLabel}</Button> : null}
            {s.primaryAction ? <Button variant="primary">{s.primaryActionLabel}</Button> : null}
          </>
        ) : undefined;

      return (
        <EmptyState
          actions={actions}
          description={s.description}
          density={s.density}
          icon={s.showIcon ? s.icon : false}
          title={s.title}
        />
      );
    }
    case "badge": {
      const s = settings as ControlSettingsBySlug["badge"];
      return <Badge dot={s.dot} label={s.label} size={s.size} tone={s.tone} variant={s.variant} />;
    }
    case "avatar": {
      const s = settings as ControlSettingsBySlug["avatar"];
      return (
        <Avatar
          name={s.name}
          shape={s.shape}
          size={s.size}
          src={s.srcEnabled && s.src ? s.src : undefined}
        />
      );
    }
    case "avatar-group": {
      const s = settings as ControlSettingsBySlug["avatar-group"];
      return <AvatarGroup items={demoAvatarGroupItems} max={s.max} size={s.size} />;
    }
    case "list": {
      const s = settings as ControlSettingsBySlug["list"];
      return <List density={s.density} items={demoListItems(s.showIcons)} ordered={s.ordered} />;
    }
    case "description-list": {
      const s = settings as ControlSettingsBySlug["description-list"];
      return <DescriptionList items={demoDescriptionListItems} layout={s.layout} />;
    }
    case "divider": {
      const s = settings as ControlSettingsBySlug["divider"];
      return (
        <div style={{ width: "100%", minHeight: s.orientation === "vertical" ? 80 : undefined, display: "flex", alignItems: "center" }}>
          <Divider
            label={s.labelEnabled && s.orientation === "horizontal" ? s.label : undefined}
            orientation={s.orientation}
            tone={s.tone}
          />
        </div>
      );
    }
    case "content-timeline": {
      const s = settings as ControlSettingsBySlug["content-timeline"];
      return (
        <DashboardContentContainer data-component="notes-activity" width="widget">
          <ContentTimeline items={demoContentTimelineItems(s.includeStatus)} variant="avatar" />
        </DashboardContentContainer>
      );
    }
    case "tree-view": {
      const s = settings as ControlSettingsBySlug["tree-view"];
      return (
        <TreeView
          defaultExpandedIds={s.expandRoots ? ["product", "engineering"] : []}
          nodes={demoTreeViewNodes}
        />
      );
    }
    case "masonry-grid": {
      const s = settings as ControlSettingsBySlug["masonry-grid"];
      return <MasonryGrid columns={s.columns} gap={s.gap} items={demoMasonryItems} />;
    }
    case "property-grid": {
      const s = settings as ControlSettingsBySlug["property-grid"];
      return <PropertyGrid items={demoPropertyItems(s.copyable)} />;
    }
    case "stack": {
      const s = settings as ControlSettingsBySlug["stack"];
      return (
        <Stack direction={s.direction} gap={s.gap} wrap={s.wrap}>
          {layoutDemoTiles.slice(0, 4).map((tile) => (
            <div
              key={tile}
              style={{
                padding: "10px 12px",
                border: "1px solid var(--opus-border)",
                borderRadius: 8,
                background: "color-mix(in srgb, var(--opus-muted) 8%, transparent)",
              }}
            >
              {tile}
            </div>
          ))}
        </Stack>
      );
    }
    case "columns": {
      const s = settings as ControlSettingsBySlug["columns"];
      return (
        <Columns columns={s.columns} direction={s.direction} gap={s.gap}>
          {layoutDemoTiles.map((tile) => (
            <div
              key={tile}
              style={{
                padding: "10px 12px",
                border: "1px solid var(--opus-border)",
                borderRadius: 8,
                background: "color-mix(in srgb, var(--opus-muted) 8%, transparent)",
              }}
            >
              {tile}
            </div>
          ))}
        </Columns>
      );
    }
    case "grid": {
      const s = settings as ControlSettingsBySlug["grid"];
      return (
        <Grid columns={s.columns} gap={s.gap}>
          {layoutDemoTiles.map((tile) => (
            <div
              key={tile}
              style={{
                padding: "14px 12px",
                border: "1px solid var(--opus-border)",
                borderRadius: 8,
                background: "color-mix(in srgb, var(--opus-muted) 8%, transparent)",
                textAlign: "center",
              }}
            >
              {tile}
            </div>
          ))}
        </Grid>
      );
    }
    case "splitter": {
      const s = settings as ControlSettingsBySlug["splitter"];
      return (
        <Splitter defaultSize={s.defaultSize} orientation={s.orientation}>
          <div>Primary pane</div>
          <div>Secondary pane</div>
        </Splitter>
      );
    }
    case "resizable-panel": {
      const s = settings as ControlSettingsBySlug["resizable-panel"];
      return (
        <ResizablePanel defaultHeight={s.defaultHeight} defaultWidth={s.defaultWidth}>
          Drag the corner handle to resize this panel.
        </ResizablePanel>
      );
    }
    case "dock-layout": {
      const s = settings as ControlSettingsBySlug["dock-layout"];
      return (
        <DockLayout
          bottom={s.showBottom ? "Bottom dock" : undefined}
          left={s.showLeft ? "Left dock" : undefined}
          right={s.showRight ? "Right dock" : undefined}
          top={s.showTop ? "Top dock" : undefined}
        >
          Centre workspace
        </DockLayout>
      );
    }
    case "scroll-area": {
      const s = settings as ControlSettingsBySlug["scroll-area"];
      return (
        <ScrollArea maxHeight={s.maxHeight} orientation={s.orientation}>
          <div style={{ padding: 12, display: "grid", gap: 6 }}>
            {layoutScrollLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
        </ScrollArea>
      );
    }
    case "aspect-ratio": {
      const s = settings as ControlSettingsBySlug["aspect-ratio"];
      return (
        <AspectRatio ratio={s.ratio}>
          <div style={{ color: "var(--opus-muted)", fontSize: "0.85rem", fontWeight: 650 }}>{s.ratio}</div>
        </AspectRatio>
      );
    }
    case "container": {
      const s = settings as ControlSettingsBySlug["container"];
      return (
        <Container padded={s.padded} size={s.size}>
          <div
            style={{
              padding: 16,
              border: "1px dashed var(--opus-border)",
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            Container size: {s.size}
          </div>
        </Container>
      );
    }
    case "spacer": {
      const s = settings as ControlSettingsBySlug["spacer"];
      return (
        <div style={{ display: "flex", flexDirection: s.axis === "x" ? "row" : "column", alignItems: "stretch" }}>
          <div style={{ padding: 10, border: "1px solid var(--opus-border)", borderRadius: 8 }}>Above</div>
          <Spacer axis={s.axis} flex={s.flex} size={s.size} />
          <div style={{ padding: 10, border: "1px solid var(--opus-border)", borderRadius: 8 }}>Below</div>
        </div>
      );
    }
    case "breadcrumb": {
      const s = settings as ControlSettingsBySlug["breadcrumb"];
      return <Breadcrumb items={demoBreadcrumbItems} separator={s.separator} />;
    }
    case "pagination": {
      const s = settings as ControlSettingsBySlug["pagination"];
      return (
        <Pagination
          page={s.page}
          pageCount={s.pageCount}
          onPageChange={(page) => onSettingsChange({ ...s, page } as ControlSettings)}
        />
      );
    }
    case "page-header": {
      const s = settings as ControlSettingsBySlug["page-header"];
      return (
        <PageHeader
          actions={
            s.showActions ? (
              <>
                <Button type="button" variant="secondary">
                  Share
                </Button>
                <Button type="button" variant="primary">
                  Edit
                </Button>
              </>
            ) : undefined
          }
          breadcrumbs={s.showBreadcrumbs ? <Breadcrumb items={demoBreadcrumbItems} /> : undefined}
          description="Composable page chrome for documentation and application shells."
          eyebrow="Navigation"
          title="Page header"
        />
      );
    }
    case "toolbar": {
      const s = settings as ControlSettingsBySlug["toolbar"];
      return (
        <Toolbar
          dense={s.dense}
          end={<Button type="button" variant="primary">Publish</Button>}
          start={<Button type="button" variant="secondary">Filter</Button>}
        >
          <Button type="button" variant="light">
            Undo
          </Button>
          <Button type="button" variant="light">
            Redo
          </Button>
        </Toolbar>
      );
    }
    case "bottom-navigation": {
      const s = settings as ControlSettingsBySlug["bottom-navigation"];
      return (
        <BottomNavigation
          items={demoBottomNavItems}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "navigation-rail": {
      const s = settings as ControlSettingsBySlug["navigation-rail"];
      return (
        <NavigationRail
          collapsed={s.collapsed}
          items={demoRailItems}
          value={s.value}
          onChange={(value) => onSettingsChange({ ...s, value } as ControlSettings)}
        />
      );
    }
    case "split-button": {
      const s = settings as ControlSettingsBySlug["split-button"];
      return (
        <SplitButton actions={demoSplitActions} variant={s.variant}>
          Save
        </SplitButton>
      );
    }
    case "fab": {
      const s = settings as ControlSettingsBySlug["fab"];
      return (
        <div style={{ position: "relative", minHeight: 120, width: "100%" }}>
          <FloatingActionButton extended={s.extended} icon="+" label="Create" position="end" size={s.size} />
        </div>
      );
    }
    case "tile": {
      const s = settings as ControlSettingsBySlug["tile"];
      return <TilePreview settings={s} />;
    }
    case "tiles": {
      const s = settings as ControlSettingsBySlug["tiles"];
      return <TilesPreview settings={s} />;
    }
    case "stat-tile": {
      const s = settings as ControlSettingsBySlug["stat-tile"];
      return <StatTilePreview settings={s} />;
    }
    case "stat-tiles": {
      const s = settings as ControlSettingsBySlug["stat-tiles"];
      return <StatTilesPreview settings={s} />;
    }
    case "property-inspector": {
      const s = settings as ControlSettingsBySlug["property-inspector"];
      return <PropertyInspectorPreview searchable={s.searchable} />;
    }
    case "filter-builder": {
      return <FilterBuilderPreview />;
    }
    case "query-builder": {
      const s = settings as ControlSettingsBySlug["query-builder"];
      return <QueryBuilderPreview combinator={s.combinator} />;
    }
    case "rule-builder": {
      const s = settings as ControlSettingsBySlug["rule-builder"];
      return <RuleBuilderPreview showDisabled={s.showDisabled} />;
    }
    case "permissions-matrix": {
      return <PermissionsMatrixPreview />;
    }
    case "dual-list-builder": {
      const s = settings as ControlSettingsBySlug["dual-list-builder"];
      return <DualListBuilderPreview selectedCount={s.selectedCount} />;
    }
    case "scheduler": {
      const s = settings as ControlSettingsBySlug["scheduler"];
      return <Scheduler events={demoSchedulerEvents} endHour={s.endHour} startHour={s.startHour} />;
    }
    case "kanban-board": {
      const s = settings as ControlSettingsBySlug["kanban-board"];
      return <KanbanBoardPreview interactive={s.interactive} />;
    }
    case "calendar": {
      const s = settings as ControlSettingsBySlug["calendar"];
      return <CalendarPreview showEvents={s.showEvents} />;
    }
    case "resource-planner": {
      const s = settings as ControlSettingsBySlug["resource-planner"];
      return (
        <ResourcePlanner
          endHour={s.endHour}
          items={demoResourceItems}
          resources={demoResources}
          startHour={s.startHour}
        />
      );
    }
    case "json-viewer": {
      const s = settings as ControlSettingsBySlug["json-viewer"];
      return <JsonViewer collapsedDepth={s.collapsedDepth} value={demoJsonValue} />;
    }
    case "statistic": {
      const s = settings as ControlSettingsBySlug["statistic"];
      return (
        <Statistic
          label={s.label}
          prefix={s.prefix || undefined}
          suffix={s.suffix || undefined}
          trend={s.trendEnabled ? s.trend : undefined}
          trendLabel={s.trendEnabled ? s.trendLabel : undefined}
          value={s.value}
        />
      );
    }

    case "icon": {
      const s = settings as ControlSettingsBySlug["icon"];
      return (
        <Icon
          label={s.labelEnabled ? s.label : undefined}
          name={s.name}
          size={s.size}
          tone={s.tone}
        />
      );
    }
    case "icon-badge": {
      const s = settings as ControlSettingsBySlug["icon-badge"];
      return <IconBadgePreview settings={s} />;
    }
    case "spinner": {
      const s = settings as ControlSettingsBySlug["spinner"];
      return <Spinner label={s.label} size={s.size} tone={s.tone} />;
    }
    case "portal": {
      const s = settings as ControlSettingsBySlug["portal"];
      return (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0, color: "var(--opus-muted)" }}>Source tree stays here.</p>
          <Portal disabled={s.disabled}>
            <div
              style={{
                position: "fixed",
                right: 24,
                bottom: 24,
                zIndex: 80,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--opus-border)",
                background: "var(--opus-panel)",
                boxShadow: "var(--opus-shadow)",
              }}
            >
              {s.message}
            </div>
          </Portal>
        </div>
      );
    }
    case "portal-host": {
      const s = settings as ControlSettingsBySlug["portal-host"];
      return (
        <PortalHost id={s.hostId}>
          <p style={{ margin: 0, color: "var(--opus-muted)" }}>Host id: {s.hostId}</p>
          <Portal>
            <div
              style={{
                marginTop: 12,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px dashed var(--opus-accent)",
                color: "var(--opus-text)",
              }}
            >
              {s.message}
            </div>
          </Portal>
        </PortalHost>
      );
    }
    case "visually-hidden": {
      const s = settings as ControlSettingsBySlug["visually-hidden"];
      return (
        <div style={{ display: "grid", gap: 8 }}>
          {s.showHint ? (
            <p style={{ margin: 0, color: "var(--opus-muted)" }}>
              Visible hint — the next phrase is only for screen readers.
            </p>
          ) : null}
          <VisuallyHidden>{s.text}</VisuallyHidden>
          <span aria-hidden="true" style={{ color: "var(--opus-text)" }}>
            ★
          </span>
        </div>
      );
    }
    case "focus-trap": {
      const s = settings as ControlSettingsBySlug["focus-trap"];
      return (
        <FocusTrap active={s.active}>
          <div
            style={{
              display: "grid",
              gap: 10,
              padding: 14,
              border: "1px solid var(--opus-border)",
              borderRadius: 12,
              maxWidth: 280,
            }}
          >
            <p style={{ margin: 0 }}>Tab cycles inside this panel while active.</p>
            <Button type="button" variant="secondary">
              First
            </Button>
            <Button type="button" variant="primary">
              Second
            </Button>
            <Button type="button" variant="secondary">
              Third
            </Button>
          </div>
        </FocusTrap>
      );
    }
    case "keyboard-shortcut": {
      const s = settings as ControlSettingsBySlug["keyboard-shortcut"];
      const keys = s.keys.split(/\s*\+\s*|\s+/).filter(Boolean);
      return <KeyboardShortcut keys={keys.length ? keys : ["⌘", "K"]} size={s.size} />;
    }
    case "hotkey-manager": {
      const s = settings as ControlSettingsBySlug["hotkey-manager"];
      return <HotkeyManagerPreview enabled={s.enabled} hotkey={s.key} />;
    }
    case "copy-button": {
      const s = settings as ControlSettingsBySlug["copy-button"];
      return <CopyButton copiedLabel={s.copiedLabel} label={s.label} value={s.value} />;
    }
    case "clipboard": {
      const s = settings as ControlSettingsBySlug["clipboard"];
      return <ClipboardPreview value={s.value} />;
    }
    case "theme-provider": {
      const s = settings as ControlSettingsBySlug["theme-provider"];
      return (
        <ThemeProvider applyToDocument={false} theme={s.theme}>
          <div data-theme={s.theme} style={{ padding: 16, borderRadius: 12, border: "1px solid var(--opus-border)", background: "var(--opus-panel)", color: "var(--opus-text)" }}>
            Theme provider value: <strong>{s.theme}</strong>
          </div>
        </ThemeProvider>
      );
    }
    case "theme-switcher": {
      const s = settings as ControlSettingsBySlug["theme-switcher"];
      return (
        <ThemeSwitcher
          label={s.label}
          value={s.theme}
          onChange={(theme) => onSettingsChange({ ...s, theme } as ControlSettings)}
        />
      );
    }
    case "resize-observer": {
      const s = settings as ControlSettingsBySlug["resize-observer"];
      return (
        <ResizeObserver>
          {(size) => (
            <div
              style={{
                resize: "both",
                overflow: "auto",
                minWidth: 160,
                minHeight: 90,
                width: 240,
                height: 120,
                padding: 12,
                border: "1px dashed var(--opus-accent)",
                borderRadius: 12,
              }}
            >
              <div style={{ color: "var(--opus-muted)", marginBottom: 8 }}>{s.hint}</div>
              <strong>
                {size.width} × {size.height}
              </strong>
            </div>
          )}
        </ResizeObserver>
      );
    }
    case "intersection-observer": {
      const s = settings as ControlSettingsBySlug["intersection-observer"];
      return (
        <div style={{ maxHeight: 180, overflow: "auto", border: "1px solid var(--opus-border)", borderRadius: 12, padding: 12 }}>
          <div style={{ height: 160, color: "var(--opus-muted)" }}>Scroll down…</div>
          <IntersectionObserver threshold={s.threshold}>
            {(visible) => (
              <div
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: visible ? "color-mix(in srgb, var(--opus-accent) 18%, transparent)" : "var(--opus-panel)",
                  border: "1px solid var(--opus-border)",
                }}
              >
                Target is {visible ? "visible" : "hidden"}
              </div>
            )}
          </IntersectionObserver>
          <div style={{ height: 160 }} />
        </div>
      );
    }

    case "sidebar": {
      const s = settings as ControlSettingsBySlug["sidebar"];

      return (
        <SidebarLayout
          collapsed={s.collapsed}
          main="Main content area"
          side={s.side}
        >
          <Sidebar
            collapsed={s.collapsed}
            density={s.density}
            footer={s.showFooter ? s.footerText : undefined}
            header={s.showHeader ? <SidebarHeader title={s.headerTitle} /> : undefined}
            side={s.side}
          >
            <SidebarNav aria-label="Primary">
              <SidebarLink active={s.activeItem === "overview"}>Overview</SidebarLink>
              <SidebarGroup defaultOpen={s.groupOpen} label="Library">
                <SidebarLink active={s.activeItem === "library"}>Components</SidebarLink>
                <SidebarLink>Templates</SidebarLink>
                <SidebarLink>Tokens</SidebarLink>
              </SidebarGroup>
              <SidebarLink active={s.activeItem === "settings"}>Settings</SidebarLink>
            </SidebarNav>
          </Sidebar>
        </SidebarLayout>
      );
    }
    case "mega-menu": {
      const s = settings as ControlSettingsBySlug["mega-menu"];
      const menu = buildMegaMenuPreviewConfig(s);

      return (
        <div className={styles.dialogPreview}>
          <MegaMenu
            closeOnEscape={s.closeOnEscape}
            closeOnOutside={s.closeOnOutside}
            density={s.density}
            menus={[menu]}
            staticPanel
          />
        </div>
      );
    }
    case "top-navigation": {
      const s = settings as ControlSettingsBySlug["top-navigation"];
      return <TopNavigationPreviewDemo settings={s} onSettingsChange={onSettingsChange} />;
    }
    default:
      return null;
  }
}
