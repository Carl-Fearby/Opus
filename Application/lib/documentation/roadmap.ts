export type RoadmapStatus = "In progress" | "Planned";

export type RoadmapMilestone = {
  month: string;
  title: string;
  outcome: string;
  status: RoadmapStatus;
  work: string[];
};

export const roadmapMilestones: RoadmapMilestone[] = [
  {
    month: "August 2026",
    title: "Component quality baseline",
    outcome: "Every published primitive has a dependable API, interaction contract, and test baseline.",
    status: "In progress",
    work: [
      "Complete the callback and Waiting for action audit",
      "Add render tests for every catalogue entry",
      "Add interaction tests for buttons, rows, menus, and fields",
      "Standardise disabled, loading, error, and empty states",
      "Complete keyboard and focus-order checks",
      "Publish component API stability labels",
    ],
  },
  {
    month: "September 2026",
    title: "Forms and validation",
    outcome: "A complete form toolkit for authentication, onboarding, settings, and data-entry workflows.",
    status: "Planned",
    work: [
      "Unify FieldShell labels, help, errors, and required state",
      "Finish range, OTP, token, chip, and masked inputs",
      "Add address, phone, currency, and percentage fields",
      "Add field groups and responsive form sections",
      "Document controlled and uncontrolled usage",
      "Add validation and form-submission examples",
    ],
  },
  {
    month: "October 2026",
    title: "Tables and data workflows",
    outcome: "Production-ready components for browsing, editing, filtering, and exporting structured data.",
    status: "Planned",
    work: [
      "Ship sortable and resizable table columns",
      "Add row selection and bulk actions",
      "Add filters, saved views, and column visibility",
      "Add inline cell editing and validation",
      "Add pagination and virtualised long lists",
      "Create list, grid, and column-view compositions",
    ],
  },
  {
    month: "November 2026",
    title: "Navigation and application shells",
    outcome: "Composable navigation that scales from a focused tool to a complete enterprise application.",
    status: "Planned",
    work: [
      "Harden sidebar collapsed and nested-menu behaviour",
      "Add responsive top-navigation patterns",
      "Complete breadcrumbs, pagination, and step navigation",
      "Add route-aware active states",
      "Standardise header, footer, and profile actions",
      "Document shell layouts for web and desktop",
    ],
  },
  {
    month: "December 2026",
    title: "Overlays and feedback",
    outcome: "Consistent contextual actions and feedback across pointer, keyboard, and touch input.",
    status: "Planned",
    work: [
      "Unify modal, dialog, drawer, and popover focus management",
      "Add anchored positioning and collision handling",
      "Complete toast queues and notification actions",
      "Add command-palette grouping and recent commands",
      "Standardise confirmation and destructive-action flows",
      "Test nested overlays and portal cleanup",
    ],
  },
  {
    month: "January 2027",
    title: "Charts and visualisation",
    outcome: "Accessible, responsive visualisations with consistent data, interaction, and theming APIs.",
    status: "Planned",
    work: [
      "Normalise chart data and series contracts",
      "Add keyboard-accessible legends and tooltips",
      "Improve responsive labels and small-container behaviour",
      "Add data-table alternatives for every graph",
      "Complete empty, loading, and invalid-data states",
      "Publish dashboard chart composition examples",
    ],
  },
  {
    month: "February 2027",
    title: "Media, maps, and assets",
    outcome: "Reliable rich-media components with graceful fallbacks and provider boundaries.",
    status: "Planned",
    work: [
      "Complete video and audio player controls",
      "Add captions, transcripts, and media keyboard shortcuts",
      "Harden image upload, crop, gallery, and lightbox flows",
      "Add map provider adapters and offline fallbacks",
      "Document attribution and third-party licences",
      "Optimise large image, model, and media loading",
    ],
  },
  {
    month: "March 2027",
    title: "Dashboard compositions",
    outcome: "Flexible dashboard building blocks that remain useful from compact panels to wide workspaces.",
    status: "Planned",
    work: [
      "Refine tiles, stat tiles, and overflow controls",
      "Add draggable dashboard grid placement",
      "Add widget loading, refresh, and failure states",
      "Create pipeline, task, activity, and performance widgets",
      "Add dashboard layout persistence and reset",
      "Publish CRM, operations, and analytics examples",
    ],
  },
  {
    month: "April 2027",
    title: "Desktop and installable application",
    outcome: "The same Opus application runs cleanly on the web, as a PWA, and in the desktop wrapper.",
    status: "Planned",
    work: [
      "Extract the desktop shell into public composition APIs",
      "Harden window drag, resize, focus, and edge constraints",
      "Complete dock launch, minimise, restore, and auto-hide",
      "Add installable PWA metadata and offline shell",
      "Align Electron and browser capability adapters",
      "Add desktop end-to-end interaction recordings",
    ],
  },
  {
    month: "May 2027",
    title: "Themes, tokens, and branding",
    outcome: "Teams can create branded Opus experiences without forking component CSS.",
    status: "Planned",
    work: [
      "Publish semantic colour and surface tokens",
      "Add density, radius, motion, and typography scales",
      "Complete light, dark, and high-contrast themes",
      "Add brand preset import and export",
      "Audit accent contrast across every interactive state",
      "Document safe component-level token overrides",
    ],
  },
  {
    month: "June 2027",
    title: "Accessibility, performance, and localisation",
    outcome: "Opus meets release-level quality gates across assistive technology, devices, and locales.",
    status: "Planned",
    work: [
      "Complete WCAG 2.2 AA audit and remediation",
      "Run screen-reader journeys for core workflows",
      "Add reduced-motion and forced-colour coverage",
      "Set bundle, render, and interaction performance budgets",
      "Add right-to-left layout support",
      "Test long translations, dates, numbers, and currencies",
    ],
  },
  {
    month: "July 2027",
    title: "Opus 1.0 release",
    outcome: "A stable, documented, and supported public release with a predictable upgrade path.",
    status: "Planned",
    work: [
      "Freeze and review the public component API",
      "Resolve final visual and interaction regressions",
      "Publish migration guides and codemods",
      "Complete browser and device compatibility matrix",
      "Publish support, deprecation, and release policies",
      "Release opus-react 1.0 and aligned applications",
    ],
  },
];

