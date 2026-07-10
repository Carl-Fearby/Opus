export type LabsCatalogEntry = {
  componentName: string;
  compositionParts: readonly string[];
  description: string;
  settingsType: "dashboard-list-columns" | "notes-activity" | "user-profile";
  slug: string;
  sourceFiles: string[];
  title: string;
};

export const labsCatalog = [
  {
    slug: "dashboard-list-columns",
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
    slug: "notes-activity",
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
    slug: "user-profile",
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
