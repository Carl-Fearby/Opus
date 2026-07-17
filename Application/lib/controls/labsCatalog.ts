export type LabsCatalogEntry = {
  componentName: string;
  compositionParts: readonly string[];
  description: string;
  settingsType: "application-footer" | "application-header" | "dashboard-list-columns" | "notes-activity" | "sidebar" | "three-pane-layout" | "user-profile";
  slug: string;
  sourceFiles: string[];
  title: string;
};

export const labsCatalog = [
  { slug: "application-footer", title: "Application Footer", componentName: "ApplicationFooter", description: "Composed application footer with product identity, version, copyright, and utility actions.", settingsType: "application-footer", compositionParts: ["divider", "tooltip", "icon"], sourceFiles: ["components/ApplicationFooter/ApplicationFooter.tsx", "components/ApplicationFooter/ApplicationFooter.module.css"] },
  {
    slug: "application-header",
    title: "Application Header",
    componentName: "ApplicationHeader",
    description:
      "Composed product header combining brand, search, shortcut guidance, create menu, application actions, theme control, and user profile.",
    settingsType: "application-header",
    compositionParts: [
      "search-input",
      "keyboard-shortcut",
      "dropdown-menu",
      "icon-badge",
      "divider",
      "theme-switcher",
      "user-profile",
      "tooltip",
    ],
    sourceFiles: [
      "components/ApplicationHeader/ApplicationHeader.tsx",
      "components/ApplicationHeader/ApplicationHeader.module.css",
    ],
  },
  {
    slug: "lab-dashboard-list-columns",
    title: "Dashboard List Columns",
    componentName: "Columns",
    description:
      "CRM dashboard composition combining upcoming tasks, recent activity, and top performing people in a Columns layout.",
    settingsType: "dashboard-list-columns",
    compositionParts: [
      "columns",
      "dashboard-content-container",
      "upcoming-tasks",
      "recent-activity",
      "top-performing-users",
    ],
    sourceFiles: [
      "components/Columns/Columns.tsx",
      "components/Columns/Columns.module.css",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
      "components/UpcomingTasks/UpcomingTasks.tsx",
      "components/RecentActivity/RecentActivity.tsx",
      "components/TopPerformingUsers/TopPerformingUsers.tsx",
    ],
  },
  {
    slug: "lab-notes-activity",
    title: "Notes & Activity",
    componentName: "NotesActivity",
    description:
      "CRM notes and activity timeline with tabbed composer, avatar feed, tag pills, and footer link.",
    settingsType: "notes-activity",
    compositionParts: ["dashboard-content-container", "note-composer", "emoji-picker", "content-timeline", "avatar"],
    sourceFiles: [
      "components/NotesActivity/NotesActivity.tsx",
      "components/NotesActivity/NotesActivity.module.css",
      "components/NoteComposer/NoteComposer.tsx",
      "components/ContentTimeline/ContentTimeline.tsx",
      "components/Avatar/Avatar.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-sidebar",
    title: "Sidebar",
    componentName: "Sidebar",
    description:
      "Documentation-style side navigation composed as a reusable Labs widget with optional dashboard container chrome.",
    settingsType: "sidebar",
    compositionParts: ["dashboard-content-container", "sidebar"],
    sourceFiles: [
      "components/Sidebar/Sidebar.tsx",
      "components/Sidebar/Sidebar.module.css",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-test-layout",
    title: "Test Layout",
    componentName: "ThreePaneLayout",
    description:
      "Three-pane CRM workspace with grouped side navigation, a fluid content canvas, and Notes & Activity.",
    settingsType: "three-pane-layout",
    compositionParts: ["three-pane-layout", "resize-handle", "sidebar", "content-timeline", "note-composer"],
    sourceFiles: [
      "components/ThreePaneLayout/ThreePaneLayout.tsx",
      "components/ThreePaneLayout/ThreePaneLayout.module.css",
      "components/ResizeHandle/ResizeHandle.tsx",
      "components/Sidebar/Sidebar.tsx",
      "components/NotesActivity/NotesActivity.tsx",
    ],
  },
  {
    slug: "lab-user-profile",
    title: "User Profile",
    componentName: "UserProfileWidget",
    description:
      "Signed-in user profile chip with optional photo, name, role, and chevron menu driven by a JSON menu config.",
    settingsType: "user-profile",
    compositionParts: ["dashboard-content-container", "user-profile", "avatar", "dropdown-menu", "modal", "image-crop-upload"],
    sourceFiles: [
      "components/UserProfileWidget/UserProfileWidget.tsx",
      "components/UserProfileWidget/UserProfileWidget.module.css",
      "components/UserProfileWidget/ProfilePhotoUploadModal.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
      "components/Avatar/Avatar.tsx",
      "components/DropdownMenu/DropdownMenu.tsx",
      "components/Modal/Modal.tsx",
      "components/fields/ImageCropUploadField/ImageCropUploadField.tsx",
    ],
  },
] as const satisfies readonly LabsCatalogEntry[];

export type LabsControlSlug = (typeof labsCatalog)[number]["slug"];

export const LABS_SLUGS = labsCatalog.map((entry) => entry.slug);

const labsSlugSet = new Set<string>(LABS_SLUGS);

export function isLabsSlug(slug: string): slug is LabsControlSlug {
  return labsSlugSet.has(slug);
}

export function getLabsCatalogEntry(slug: LabsControlSlug) {
  return labsCatalog.find((entry) => entry.slug === slug)!;
}
