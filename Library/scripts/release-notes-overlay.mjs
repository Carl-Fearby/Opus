/** Curated opus-react release notes for npm publishes that only left chore commits in git. */
export const releaseNotesOverlay = [
  {
    version: "0.2.15",
    releasedAt: "2026-07-08",
    summary: "First public npm publish after the Library/Application split.",
    changes: [
      "Publish opus-react to npm with transpiled dist, CSS, and TypeScript declarations.",
      "Wire Application to consume the published package instead of local source.",
      "Add publish workflow and package metadata for the component library.",
    ],
  },
  {
    version: "0.2.16",
    releasedAt: "2026-07-08",
    summary: "Package export and style entry fixes for Next.js consumers.",
    changes: [
      "Fix opus-react style and flag asset paths in published package exports.",
      "Align Application lockfile with the first published build.",
    ],
  },
  {
    version: "0.2.17",
    releasedAt: "2026-07-08",
    summary: "Follow-up publish with README and install guidance updates.",
    changes: [
      "Expand opus-react README with install, theming, and Next.js setup notes.",
      "Republish after documentation and export path corrections.",
    ],
  },
  {
    version: "0.2.18",
    releasedAt: "2026-07-08",
    summary: "Republish after catalog and preview wiring fixes.",
    changes: [
      "Sync generated usage code and preview imports with the published package surface.",
      "Republish to npm after Application integration fixes.",
    ],
  },
  {
    version: "0.2.19",
    releasedAt: "2026-07-08",
    summary: "Republish after component docs and settings panel corrections.",
    changes: [
      "Fix component documentation metadata and settings defaults in the docs site.",
      "Republish library build consumed by Application.",
    ],
  },
  {
    version: "0.2.20",
    releasedAt: "2026-07-08",
    summary: "Stabilise the first wave of npm publishes for the monorepo split.",
    changes: [
      "Finalise package version alignment between Library and Application.",
      "Republish opus-react after initial monorepo packaging iterations.",
    ],
  },
  {
    version: "0.2.22",
    releasedAt: "2026-07-08",
    commit: "b98fb2182d1d87b5c2723234b7ae94cbf34c424c",
    summary: "Major library expansion — data grid, utilities, content primitives, and charts.",
    changes: [
      "Add Data Grid pivot mode, layout helpers, and expanded demo datasets.",
      "Add Avatar, AvatarGroup, Badge, Clipboard, ContentTimeline, CopyButton, DescriptionList, Divider, FocusTrap, HotkeyManager, Icon, JsonViewer, List, and related utility components.",
      "Expand chart catalog and SpecializedCharts with additional dashboard chart types.",
      "Add form overview layouts and richer generated usage code for complex controls.",
      "Add documentation top-bar version badge and improved component settings panels.",
      "Publish the large post-monorepo feature batch to npm as opus-react@0.2.22.",
    ],
  },
  {
    version: "0.2.23",
    releasedAt: "2026-07-08",
    commit: "e5e3c56022db179e01108922792e61935b344a8d",
    summary: "Dashboard section shell and pipeline funnel widget.",
    changes: [
      "Add DashboardContentContainer for shared neon-glass dashboard section chrome.",
      "Add PipelineOverview funnel widget with stage legend, totals, and period selector.",
      "Refactor pipeline preview layout and dashboard widget width rules.",
      "Publish dashboard shell primitives to npm.",
    ],
  },
  {
    version: "0.2.24",
    releasedAt: "2026-07-09",
    commit: "faa171450e8da8d2d13641c6dc469adff4c1dcef",
    summary: "CRM dashboard list widgets, Labs/System catalogs, and error pages.",
    changes: [
      "Add UpcomingTasks, RecentActivity, and TopPerformingUsers dashboard widgets.",
      "Add Labs catalog with Dashboard List Columns composition preview.",
      "Add System catalog with shared 403 and 404 documentation error pages.",
      "Add documentation breadcrumbs across guide, components, and version pages.",
      "Improve checkbox field sizing and interactive task-row behaviour.",
    ],
  },
  {
    version: "0.2.25",
    releasedAt: "2026-07-09",
    commit: "4117aed4083166cb9ca9fc22831587723472027f",
    summary: "Deals Over Time chart and dashboard catalog growth.",
    changes: [
      "Add DealsOverTime line-chart widget with period selector and purple/blue palettes.",
      "Register DealsOverTime in dashboard catalog, docs, icons, and usage-code generation.",
      "Expand dashboard preview grid and settings panels for new chart widgets.",
      "Tune metric tiles, gauges, progress visuals, and tabs styling for dashboard density.",
    ],
  },
  {
    version: "0.2.26",
    releasedAt: "2026-07-09",
    commit: "d404b53de133beb7a76caf22861c95280c7bb51d",
    summary: "Theme architecture split, preview isolation, and release history improvements.",
    changes: [
      "Split global shell theme from independent preview theme with separate storage keys.",
      "Isolate preview theming via PreviewThemeBoundary and preview-scoped CSS overrides.",
      "Prevent theme flash on load using cookie-backed SSR and a beforeInteractive bootstrap script.",
      "Keep the documentation top bar permanently dark while the shell respects the global theme toggle.",
      "Rebuild the version page with curated release notes instead of raw chore commit messages.",
      "Fix OpusThemeProvider document theme resolution and remove hardcoded app-shell dark theme.",
    ],
  },
];
