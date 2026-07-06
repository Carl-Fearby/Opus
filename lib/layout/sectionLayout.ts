import type { CSSProperties } from "react";

export type SectionBreakpoint = "mobile" | "tablet" | "desktop";

/** @deprecated Use sidebar + columns instead. Kept for Section.Row shorthand. */
export type SectionLayoutPreset =
  | "stack"
  | "2-equal"
  | "3-equal"
  | "4-equal"
  | "5-equal"
  | "sidebar-left"
  | "sidebar-right"
  | "auto-fit";

export type SectionSidebar = "none" | "left" | "right";

export type SectionColumns = 1 | 2 | 3 | 4 | 5;

export type SectionGap = "sm" | "md" | "lg";

export type SectionStackBelow = "mobile" | "tablet" | "never";

export type SectionSidebarRatio = "1:2" | "1:3" | "2:3";

export type SectionAlign = "start" | "center" | "end" | "stretch";

export type SectionJustify = "start" | "center" | "end" | "stretch";

export type SectionTemplate = Partial<Record<SectionBreakpoint, string>>;

export type SectionSpan = Partial<Record<SectionBreakpoint, number>>;

export type SectionWidth = Partial<Record<SectionBreakpoint, string>>;

export type SectionLayoutConfig = {
  columns: SectionColumns;
  sidebar: SectionSidebar;
  sidebarRatio: SectionSidebarRatio;
  stackBelow: SectionStackBelow;
};

export type SectionRowLayoutProps = {
  align?: SectionAlign;
  columns?: SectionColumns;
  gap?: SectionGap;
  justify?: SectionJustify;
  layout?: SectionLayoutPreset;
  sidebar?: SectionSidebar;
  sidebarRatio?: SectionSidebarRatio;
  stackBelow?: SectionStackBelow;
  template?: SectionTemplate;
};

export type SectionColumnLayoutProps = {
  span?: SectionSpan;
  width?: SectionWidth;
};

export type SectionDemoSlot = {
  content: string;
  role: "content" | "sidebar";
  title: string;
};

const GAP_VALUES: Record<SectionGap, string> = {
  sm: "8px",
  md: "16px",
  lg: "24px",
};

const SIDEBAR_RATIOS: Record<SectionSidebarRatio, string> = {
  "1:2": "1fr 2fr",
  "1:3": "1fr 3fr",
  "2:3": "2fr 3fr",
};

function equalColumns(count: number) {
  return `repeat(${count}, minmax(0, 1fr))`;
}

function stackColumn() {
  return "1fr";
}

function sidebarTemplate(side: "left" | "right", ratio: SectionSidebarRatio) {
  const template = SIDEBAR_RATIOS[ratio];
  if (side === "left") {
    return template;
  }

  return template.split(" ").reverse().join(" ");
}

function resolveEqualColumns(
  mobile: number,
  tablet: number,
  desktop: number,
  stackBelow: SectionStackBelow,
) {
  if (stackBelow === "never") {
    const max = Math.max(mobile, tablet, desktop);
    const template = equalColumns(max);
    return { mobile: template, tablet: template, desktop: template };
  }

  if (stackBelow === "tablet") {
    return {
      mobile: stackColumn(),
      tablet: stackColumn(),
      desktop: equalColumns(desktop),
    };
  }

  return {
    mobile: stackColumn(),
    tablet: equalColumns(tablet),
    desktop: equalColumns(desktop),
  };
}

function resolveSidebarColumns(side: "left" | "right", ratio: SectionSidebarRatio, stackBelow: SectionStackBelow) {
  const desktop = sidebarTemplate(side, ratio);

  if (stackBelow === "never") {
    return { mobile: desktop, tablet: desktop, desktop };
  }

  if (stackBelow === "tablet") {
    return {
      mobile: stackColumn(),
      tablet: stackColumn(),
      desktop,
    };
  }

  return {
    mobile: stackColumn(),
    tablet: stackColumn(),
    desktop,
  };
}

export function layoutPresetToConfig(
  layout: SectionLayoutPreset,
  overrides: Partial<SectionLayoutConfig> = {},
): SectionLayoutConfig {
  const base: SectionLayoutConfig = {
    columns: 1,
    sidebar: "none",
    sidebarRatio: "1:2",
    stackBelow: "mobile",
  };

  switch (layout) {
    case "stack":
      return { ...base, ...overrides, columns: 1 };
    case "2-equal":
      return { ...base, ...overrides, columns: 2 };
    case "3-equal":
    case "auto-fit":
      return { ...base, ...overrides, columns: 3 };
    case "4-equal":
      return { ...base, ...overrides, columns: 4 };
    case "5-equal":
      return { ...base, ...overrides, columns: 5 };
    case "sidebar-left":
      return { ...base, ...overrides, sidebar: "left", columns: 1 };
    case "sidebar-right":
      return { ...base, ...overrides, sidebar: "right", columns: 1 };
    default:
      return { ...base, ...overrides };
  }
}

export function resolveSectionLayoutConfig(props: SectionRowLayoutProps): SectionLayoutConfig {
  if (props.layout && props.sidebar === undefined && props.columns === undefined) {
    return layoutPresetToConfig(props.layout, {
      sidebarRatio: props.sidebarRatio,
      stackBelow: props.stackBelow,
    });
  }

  return {
    columns: props.columns ?? 1,
    sidebar: props.sidebar ?? "none",
    sidebarRatio: props.sidebarRatio ?? "1:2",
    stackBelow: props.stackBelow ?? "mobile",
  };
}

export function resolveLayoutTemplates(config: SectionLayoutConfig): SectionTemplate {
  const { columns, sidebar, sidebarRatio, stackBelow } = config;

  if (sidebar !== "none") {
    return resolveSidebarColumns(sidebar, sidebarRatio, stackBelow);
  }

  if (columns === 1) {
    return {
      mobile: stackColumn(),
      tablet: stackColumn(),
      desktop: stackColumn(),
    };
  }

  return resolveEqualColumns(1, columns, columns, stackBelow);
}

export function resolveContentRowTemplates(
  columns: SectionColumns,
  stackBelow: SectionStackBelow,
): SectionTemplate {
  if (columns === 1) {
    return {
      mobile: stackColumn(),
      tablet: stackColumn(),
      desktop: stackColumn(),
    };
  }

  return resolveEqualColumns(1, columns, columns, stackBelow);
}

/** Sidebar plus multiple content columns uses a nested row inside the main area. */
export function usesNestedContentRow(config: Pick<SectionLayoutConfig, "columns" | "sidebar">) {
  return config.sidebar !== "none" && config.columns > 1;
}

export function resolveRowStyleVars(props: SectionRowLayoutProps): CSSProperties {
  const config = resolveSectionLayoutConfig(props);
  const resolvedTemplate = {
    ...resolveLayoutTemplates(config),
    ...props.template,
  };

  return {
    "--section-cols-mobile": resolvedTemplate.mobile ?? stackColumn(),
    "--section-cols-tablet": resolvedTemplate.tablet ?? resolvedTemplate.mobile ?? stackColumn(),
    "--section-cols-desktop":
      resolvedTemplate.desktop ??
      resolvedTemplate.tablet ??
      resolvedTemplate.mobile ??
      stackColumn(),
    "--section-gap": GAP_VALUES[props.gap ?? "md"],
    ...(props.align ? { "--section-align": props.align } : {}),
    ...(props.justify ? { "--section-justify": props.justify } : {}),
  } as CSSProperties;
}

export function resolveColumnStyleVars({ span, width }: SectionColumnLayoutProps): CSSProperties {
  const vars: Record<string, string> = {};

  if (span?.mobile !== undefined) {
    vars["--section-col-span-mobile"] = String(span.mobile);
  }

  if (span?.tablet !== undefined) {
    vars["--section-col-span-tablet"] = String(span.tablet);
  }

  if (span?.desktop !== undefined) {
    vars["--section-col-span-desktop"] = String(span.desktop);
  }

  if (width?.mobile) {
    vars["--section-col-width-mobile"] = width.mobile;
  }

  if (width?.tablet) {
    vars["--section-col-width-tablet"] = width.tablet;
  }

  if (width?.desktop) {
    vars["--section-col-width-desktop"] = width.desktop;
  }

  return vars as CSSProperties;
}

export function resolveSectionGapVars(gap: SectionGap = "md"): CSSProperties {
  return {
    "--section-rows-gap": GAP_VALUES[gap],
  } as CSSProperties;
}

export function getSectionDemoSlots(settings: {
  columnFiveContent: string;
  columnFiveTitle: string;
  columnFourContent: string;
  columnFourTitle: string;
  columnOneContent: string;
  columnOneTitle: string;
  columnThreeContent: string;
  columnThreeTitle: string;
  columnTwoContent: string;
  columnTwoTitle: string;
  columns: SectionColumns;
  sidebar: SectionSidebar;
  sidebarContent: string;
  sidebarTitle: string;
}): SectionDemoSlot[] {
  const contentColumns = [
    { title: settings.columnOneTitle, content: settings.columnOneContent },
    { title: settings.columnTwoTitle, content: settings.columnTwoContent },
    { title: settings.columnThreeTitle, content: settings.columnThreeContent },
    { title: settings.columnFourTitle, content: settings.columnFourContent },
    { title: settings.columnFiveTitle, content: settings.columnFiveContent },
  ];

  const slots: SectionDemoSlot[] = [];

  if (settings.sidebar !== "none") {
    slots.push({
      role: "sidebar",
      title: settings.sidebarTitle,
      content: settings.sidebarContent,
    });
  }

  for (const column of contentColumns.slice(0, settings.columns)) {
    slots.push({
      role: "content",
      title: column.title,
      content: column.content,
    });
  }

  return slots;
}

export function getSectionLayoutConfigFromSettings(settings: {
  columns: SectionColumns;
  sidebar: SectionSidebar;
  sidebarRatio: SectionSidebarRatio;
  stackBelow: SectionStackBelow;
}): SectionLayoutConfig {
  return {
    columns: settings.columns,
    sidebar: settings.sidebar,
    sidebarRatio: settings.sidebarRatio,
    stackBelow: settings.stackBelow,
  };
}

/** @deprecated Use getSectionDemoSlots instead. */
export function getSectionDemoColumnCount(settings: {
  columns: SectionColumns;
  sidebar: SectionSidebar;
}) {
  const slots = getSectionDemoSlots({
    ...settings,
    columnFiveContent: "",
    columnFiveTitle: "",
    columnFourContent: "",
    columnFourTitle: "",
    columnOneContent: "",
    columnOneTitle: "",
    columnThreeContent: "",
    columnThreeTitle: "",
    columnTwoContent: "",
    columnTwoTitle: "",
    sidebarContent: "",
    sidebarTitle: "",
  });

  return slots.length;
}
