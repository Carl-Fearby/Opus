export type NewsStory = {
  slug: string;
  date: string;
  edition: string;
  title: string;
  standfirst: string;
  summary: string;
  chapters: Array<{ heading: string; body: string }>;
};

export const newsStories: NewsStory[] = [
  {
    slug: "opus-0-7",
    date: "2026-09-04",
    edition: "Opus 0.7",
    title: "Design the system, then take it with you.",
    standfirst: "Visual Theme Designer, global tokens, responsive previews, and the new Search Box arrive in the Opus 0.7 release.",
    summary: "A visual workflow for application-wide design decisions — without giving up component-level control.",
    chapters: [
      { heading: "A live system, not a swatch sheet", body: "The Theme Designer brings tiles, fields, dashboard widgets, actions, and search into one live canvas. Change a token once and see what it means across an application surface." },
      { heading: "Portable defaults", body: "Base, accent, secondary, tertiary, tile, typography, radius, background treatment, and gradient choices become provider-ready code that can travel into a parent application." },
      { heading: "Responsive confidence", body: "Desktop and mobile preview modes make layout verification part of the design loop. Search Box also retains its query, category, and action controls in constrained mobile canvases." },
    ],
  },
  {
    slug: "surfaces-that-belong-together",
    date: "2026-09-03",
    edition: "Surface system",
    title: "A component library should feel at home anywhere.",
    standfirst: "Background atmospheres and universal surface settings gave the catalogue a stronger, more adaptable visual foundation.",
    summary: "A richer foundation for control surfaces that need to feel consistent in calm dashboards, dense workspaces, and expressive product moments.",
    chapters: [
      { heading: "A surface system, not one fixed skin", body: "Universal radius, opaque, standard, and glass treatments let teams establish an application personality without reworking every individual control." },
      { heading: "Atmosphere with restraint", body: "Background Blobs introduced a decorative colour field with parent-fill placement, reduced-motion support, and the controls necessary to make atmosphere feel intentional." },
      { heading: "Documentation that shows the truth", body: "The catalogue previews those treatments against real components in dark and light contexts, so the design decision can be evaluated before it reaches a product." },
    ],
  },
  {
    slug: "quality-is-a-feature",
    date: "2026-08-21",
    edition: "Quality baseline",
    title: "Quality is a feature, not a finishing pass.",
    standfirst: "A library-wide quality baseline made accessibility, public APIs, and release confidence part of the product itself.",
    summary: "The work behind a dependable component library is often invisible — until it is missing. This milestone made it explicit.",
    chapters: [
      { heading: "Accessibility in the delivery loop", body: "Regression coverage strengthened table semantics, tree-menu leaves, lightbox triggers, and named scroll regions so the catalogue is checked for more than appearance." },
      { heading: "A public contract", body: "API stability, support, deprecation, and changelog policies clarified how consumers can adopt Opus with confidence as the package evolves." },
      { heading: "Release gates that matter", body: "Library quality workflows and tree-shaken package bundles made the standards repeatable instead of relying on a final manual check." },
    ],
  },
  {
    slug: "the-brand-travels-with-the-library",
    date: "2026-08-23",
    edition: "Brand system",
    title: "The brand travels with the library.",
    standfirst: "A package-owned Opus brand system removed the fragile dependency on an application's public folder.",
    summary: "Brand assets are part of the product surface too. This release made them portable, deliberate, and as easy to use as any other component.",
    chapters: [
      { heading: "One canonical brand", body: "OpusBrand introduced icon, wordmark, and full-lockup variants backed by assets that belong to the published package." },
      { heading: "No hidden consumer setup", body: "Applications no longer need to carry a copied public asset just to render the shared brand correctly." },
      { heading: "A small change with wide reach", body: "Shared headers and footers moved to the canonical component, making every consumer more consistent while reducing local maintenance." },
    ],
  },
  {
    slug: "workflow-primitives",
    date: "2026-08-10",
    edition: "Workflow edition",
    title: "The everyday work around the work.",
    standfirst: "A major expansion of workflow primitives brought the things business applications rely on into the core library.",
    summary: "The unglamorous but essential interactions — reviews, uploads, recurrences, bulk actions, and long lists — received first-class components.",
    chapters: [
      { heading: "Built for operations", body: "Audit Log, Bulk Action Bar, Diff Viewer, Editable Data Table, File Manager, Product Tour, Recurrence Editor, Save-State Indicator, Signature Pad, Upload Queue, and Virtual List expanded the library's operational vocabulary." },
      { heading: "Better previews, better decisions", body: "Richer interactive examples keep themes, font, colour, usage, Playground, and external rendering aligned so teams can understand a component before they commit to it." },
      { heading: "The details are the product", body: "Alongside the new primitives, a focused pass improved map responsiveness, time selection, form output, composition, interaction, and accessibility across the catalogue." },
    ],
  },
  {
    slug: "media-that-does-not-lose-its-place",
    date: "2026-08-10",
    edition: "Media experience",
    title: "Media that does not lose its place.",
    standfirst: "Persistent playback turned video from an isolated component into an experience that can follow a user through an application.",
    summary: "Navigation should not need to interrupt a task — or the media that supports it.",
    chapters: [
      { heading: "Playback that survives navigation", body: "PersistentVideoPlayerProvider and PersistentVideoPlayer keep an active video alive across page changes and can collapse it into a docked mini-player." },
      { heading: "A complete interaction model", body: "The catalogue includes close, expand, shrink, and configurable persistence controls so teams can evaluate the behaviour as a real feature." },
      { heading: "Keyboard access in long surfaces", body: "The same release made Diff Viewer panes and Virtual List regions focusable, supporting reliable keyboard and assistive-technology navigation." },
    ],
  },
  {
    slug: "time-deserves-a-better-interface",
    date: "2026-08-07",
    edition: "Form controls",
    title: "Time deserves a better interface.",
    standfirst: "Portaled pickers replaced browser-native date and time interfaces with a consistent, application-ready control family.",
    summary: "Choosing a date, time, month, or week should feel like part of the same system — no matter which browser is in front of the user.",
    chapters: [
      { heading: "Beyond the native overlay", body: "DateField gained Opus date/time, time, month, and week pickers, removing the inconsistent browser-native experience from those workflows." },
      { heading: "Suggestions that belong to the system", body: "ComboboxField moved from a native datalist to a filtered, viewport-aware portaled list that behaves like the rest of the library." },
      { heading: "Consistency is speed", body: "Shared positioning and interaction patterns reduce the design decisions teams need to remake in every form." },
    ],
  },
  {
    slug: "the-public-package",
    date: "2026-07-08",
    edition: "Foundation",
    title: "From internal system to installable tool.",
    standfirst: "The first public npm release made Opus usable where it matters: in another team's application.",
    summary: "The beginning of the library as a dependable external package, with its own build, styles, declarations, and consumer documentation.",
    chapters: [
      { heading: "A package with a real contract", body: "The public package shipped transpiled code, CSS, TypeScript declarations, package metadata, and a release workflow designed for consumers rather than the monorepo alone." },
      { heading: "Dogfooding the release", body: "The marketing application switched to consuming the published npm package, making the project's own site a practical consumer of every release." },
      { heading: "A direction, not just a distribution", body: "That release established the groundwork for a component library that can keep growing without losing the traceability and quality expected by production teams." },
    ],
  },
];

export const storyBySlug = new Map(newsStories.map((story) => [story.slug, story]));
