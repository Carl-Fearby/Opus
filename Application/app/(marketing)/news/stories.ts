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
