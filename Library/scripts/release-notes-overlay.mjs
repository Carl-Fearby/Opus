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
  {
    version: "0.2.27",
    releasedAt: "2026-07-09",
    summary: "Application and package version alignment after the theme release.",
    changes: [
      "Align Application dependency and lockfiles with the latest published opus-react package.",
      "Refresh package metadata for consistent Library and Application installs.",
    ],
  },
  {
    version: "0.2.28",
    releasedAt: "2026-07-09",
    summary: "Expanded component catalog and synchronised Application documentation.",
    changes: [
      "Expand builder, layout, navigation, tile, and dashboard component definitions.",
      "Add richer preview settings and generated usage examples across the catalog.",
      "Synchronise the growing Library catalog, emoji data, and documentation into Application.",
    ],
  },
  {
    version: "0.2.29",
    releasedAt: "2026-07-09",
    summary: "Dashboard widgets, navigation primitives, and interactive content refinements.",
    changes: [
      "Broaden layout and navigation primitives including ThreePaneLayout, Sidebar, tiles, rails, and pagination.",
      "Refine PipelineOverview, DealsOverTime, NotesActivity, NoteComposer, and dashboard tile presentation.",
      "Expand component exports, examples, settings, and package documentation.",
    ],
  },
  {
    version: "0.2.30",
    releasedAt: "2026-07-10",
    summary: "User Profile widget, editable Code Playground, and unified component detail pages.",
    changes: [
      "Add the UserProfileWidget and image-crop profile-photo workflow.",
      "Add the Code Playground with live JSX compilation and component-seeded examples.",
      "Unify preview, documentation, composition, settings, and usage-code panels on component pages.",
    ],
  },
  {
    version: "0.2.31",
    releasedAt: "2026-07-10",
    summary: "Usage-code editor and component documentation workflow improvements.",
    changes: [
      "Improve editable generated source, selection behaviour, and preview theme controls.",
      "Refine component Markdown rendering and usage-code presentation.",
      "Strengthen Library-to-Application source synchronisation for documentation tooling.",
    ],
  },
  {
    version: "0.2.32",
    releasedAt: "2026-07-11",
    summary: "Calendar improvements, documentation navigation, and preview parity auditing.",
    changes: [
      "Improve Calendar behaviour and a broad set of interactive component previews.",
      "Restructure documentation routes and navigation for catalog groups and Playground.",
      "Add preview-versus-usage auditing and improve the Application synchronisation workflow.",
    ],
  },
  {
    version: "0.2.33",
    releasedAt: "2026-07-12",
    summary: "Forms catalog and generated example coverage expansion.",
    changes: [
      "Expand forms overview content, defaults, icons, and component registration.",
      "Add reusable usage-data formatters for richer generated examples.",
      "Improve component previews and settings for newly documented form controls.",
    ],
  },
  {
    version: "0.2.34",
    releasedAt: "2026-07-13",
    summary: "Emoji persistence and source-editor refinements.",
    changes: [
      "Add recent-emoji persistence and shared emoji catalog utilities.",
      "Improve generated source and CodeMirror editor behaviour.",
      "Refresh preview and documentation registration for the updated controls.",
    ],
  },
  {
    version: "0.2.35",
    releasedAt: "2026-07-16",
    summary: "Three-pane CRM lab, composition relationships, and external previews.",
    changes: [
      "Add the resizable Test Layout CRM workspace with collapsible Sidebar and NotesActivity panes.",
      "Add composition relationship views and expand dashboard documentation groups.",
      "Add external Playground previews, NoteTag support, ResizeHandle controls, and richer NotesActivity interactions.",
      "Improve resize persistence, panel sizing, collapse behaviour, and component settings.",
    ],
  },
  {
    version: "0.2.36",
    releasedAt: "2026-07-16",
    summary: "Playground workspace controls and component-library guidance.",
    changes: [
      "Refine Playground source, split, preview, reset, and full-width workspace controls.",
      "Update component-library documentation for the expanded preview workflow.",
    ],
  },
  {
    version: "0.2.37",
    releasedAt: "2026-07-17",
    summary: "Accessibility pass, custom scrollbars, and global font preferences.",
    changes: [
      "Add CustomScrollbar and ScrollArea with styled tracks, thumbs, dual-axis corners, and auto-hide behaviour.",
      "Apply accessibility improvements across navigation, overlays, builders, content, and dashboard components.",
      "Add a global Google Font picker and persist the selected documentation font.",
      "Integrate custom scrolling across the component library and Lab layouts.",
    ],
  },
  {
    version: "0.2.38",
    releasedAt: "2026-07-17",
    summary: "Test Layout polish and documentation composition refinements.",
    changes: [
      "Refine Test Layout pane sizing, scrolling, padding, collapse controls, and responsive behaviour.",
      "Improve NotesActivity demos, relationship views, settings panels, and dashboard overviews.",
      "Synchronise the latest Lab and component-detail experience into Application.",
    ],
  },
  {
    version: "0.2.39",
    releasedAt: "2026-07-17",
    commit: "1243baf87f74e9e9bd1e8c5be7d4c03843c8be42",
    summary: "Font preference API export fix.",
    changes: [
      "Export FontPicker and useFontPreference from the public opus-react package surface.",
      "Republish package declarations and runtime exports for Application consumers.",
    ],
  },
  {
    version: "0.2.40",
    releasedAt: "2026-07-17",
    summary: "Published font API and Application dependency alignment.",
    changes: [
      "Publish the corrected public font-preference API to npm.",
      "Update Application package metadata and lockfile to consume opus-react 0.2.40.",
    ],
  },
  {
    version: "0.2.41",
    releasedAt: "2026-07-17",
    summary: "Custom source-editor scrolling and reusable Sidebar footer insets.",
    changes: [
      "Connect CustomScrollbar tracks to CodeMirror's native scroll viewport while preserving editing and virtualisation.",
      "Add reusable top, right, bottom, and left footer padding controls to Sidebar.",
      "Make Sidebar footer dividers inherit the same horizontal insets as their footer content.",
      "Align Test Layout component and Playground menu content through shared demo data.",
      "Backfill curated release narratives from opus-react 0.2.26 through 0.2.40.",
    ],
  },
  {
    version: "0.2.42",
    releasedAt: "2026-07-17",
    commit: "97f87b8999ca11d030474f34aafe6f9d85c84472",
    summary: "Resize-handle grip affordance and dual-orientation preview.",
    changes: [
      "Add a centred four-dot grip to vertical and horizontal ResizeHandle tracks.",
      "Use a dark muted resting grip that follows the track accent on hover and keyboard focus.",
      "Add interactive vertical and horizontal examples together on the Resize Handle component page.",
      "Publish the updated ResizeHandle styling and Application preview as opus-react 0.2.42.",
    ],
  },
  {
    version: "0.2.43",
    releasedAt: "2026-07-17",
    commit: "2a25a225c42c55b64316b9f76874922e4a064e4c",
    summary: "Stable resize-grip spacing and compact raw-preview URLs.",
    changes: [
      "Replace gradient-rendered grip dots with four fixed-size elements for identical spacing in embedded and external previews.",
      "Replace serialized raw-preview configuration URLs with short same-origin preview IDs.",
      "Retain backward compatibility with existing config query links.",
      "Synchronise raw-preview routing into Application deployments.",
    ],
  },
  {
    version: "0.2.44",
    releasedAt: "2026-07-17",
    commit: "9674bd73dd247b40061a31c6d8adcc5e8419f459",
    summary: "Theme-aware resize-grip dot contrast.",
    changes: [
      "Render resize-handle grip dots in white for light themes and near-black for dark themes.",
      "Use CSS light-dark colour selection so embedded, external, and component previews follow their own active theme.",
      "Publish the corrected ResizeHandle styling and update Application to opus-react 0.2.44.",
    ],
  },
];
