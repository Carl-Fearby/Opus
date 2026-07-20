export type LabsCatalogEntry = {
  componentName: string;
  compositionParts: readonly string[];
  description: string;
  navigationGroup: "Application" | "Authentication" | "Contacts" | "Dashboard";
  settingsType: "application-footer" | "application-header" | "auth-form" | "contact-details" | "dashboard-list-columns" | "dashboard-welcome" | "notes-activity" | "sidebar" | "three-pane-layout" | "user-profile";
  slug: string;
  sourceFiles: string[];
  title: string;
};

export const labsCatalog = [
  {
    slug: "lab-contact-details",
    title: "Contact Details",
    componentName: "ContactDetails",
    description: "Contact/user record card (ContactCard) with staff password controls. Host route owns page chrome and optional ContactNotesActivity.",
    settingsType: "contact-details",
    navigationGroup: "Contacts",
    compositionParts: ["avatar", "badge", "button", "dashboard-content-container", "icon", "lab-notes-activity", "tabs"],
    sourceFiles: [
      "components/ContactDetails/ContactDetails.tsx",
      "components/ContactDetails/ContactDetails.module.css",
      "components/ContactDetails/ContactCard.tsx",
      "components/ContactDetails/ContactNotesActivity.tsx",
      "components/ContactDetails/ContactIdentityCard.tsx",
      "components/ContactDetails/ContactSummaryCard.tsx",
      "components/Avatar/Avatar.tsx",
      "components/Badge/Badge.tsx",
      "components/NoteComposer/NoteComposer.tsx",
      "components/Tabs/Tabs.tsx",
    ],
  },
  {
    slug: "lab-dashboard-welcome",
    title: "Dashboard Welcome",
    componentName: "WelcomeMessage",
    description:
      "Time-aware dashboard greeting composed with a live date card and JSON-driven quick-action tiles.",
    settingsType: "dashboard-welcome",
    navigationGroup: "Dashboard",
    compositionParts: ["dashboard-content-container", "tiles", "tile", "icon"],
    sourceFiles: [
      "components/WelcomeMessage/WelcomeMessage.tsx",
      "components/WelcomeMessage/WelcomeMessage.module.css",
      "components/Tiles/Tiles.tsx",
      "components/Tile/Tile.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  { slug: "application-footer", title: "Application Footer", componentName: "ApplicationFooter", description: "Composed application footer with product identity, version, copyright, and utility actions.", settingsType: "application-footer", navigationGroup: "Application", compositionParts: ["divider", "tooltip", "icon"], sourceFiles: ["components/ApplicationFooter/ApplicationFooter.tsx", "components/ApplicationFooter/ApplicationFooter.module.css"] },
  {
    slug: "application-header",
    title: "Application Header",
    componentName: "ApplicationHeader",
    description:
      "Composed product header combining brand, search, shortcut guidance, create menu, application actions, theme control, and user profile.",
    settingsType: "application-header",
    navigationGroup: "Application",
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
    navigationGroup: "Dashboard",
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
    navigationGroup: "Application",
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
    navigationGroup: "Application",
    compositionParts: ["dashboard-content-container", "sidebar"],
    sourceFiles: [
      "components/Sidebar/Sidebar.tsx",
      "components/Sidebar/Sidebar.module.css",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-test-layout",
    title: "Dashboard Layout",
    componentName: "ThreePaneLayout",
    description:
      "Complete CRM home workspace with application chrome, dashboard welcome actions, grouped navigation, and Notes & Activity.",
    settingsType: "three-pane-layout",
    navigationGroup: "Dashboard",
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
    navigationGroup: "Application",
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
  {
    slug: "lab-login-form",
    title: "Login Form",
    componentName: "LoginFormComposition",
    description: "Accessible account sign-in composition with email, password, remember-me, and recovery actions.",
    settingsType: "auth-form",
    navigationGroup: "Authentication",
    compositionParts: ["dashboard-content-container", "text-input", "password-input", "checkbox", "button"],
    sourceFiles: [
      "components/fields/TextField/TextField.tsx",
      "components/fields/CheckboxField/CheckboxField.tsx",
      "components/fields/Button/Button.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-register-form",
    title: "Register Form",
    componentName: "RegisterFormComposition",
    description: "Accessible account registration composition with identity, email, password confirmation, and terms consent.",
    settingsType: "auth-form",
    navigationGroup: "Authentication",
    compositionParts: ["dashboard-content-container", "text-input", "email-input", "password-input", "checkbox", "button"],
    sourceFiles: [
      "components/fields/TextField/TextField.tsx",
      "components/fields/CheckboxField/CheckboxField.tsx",
      "components/fields/Button/Button.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-otp-form",
    title: "OTP Form",
    componentName: "OtpFormComposition",
    description: "Accessible one-time passcode verification composition with six numeric code fields and resend action.",
    settingsType: "auth-form",
    navigationGroup: "Authentication",
    compositionParts: ["dashboard-content-container", "button"],
    sourceFiles: [
      "components/fields/Button/Button.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-passkey-login-form",
    title: "Passkey Login Form",
    componentName: "PasskeyLoginFormComposition",
    description: "Passwordless sign-in composition with a passkey action and password fallback.",
    settingsType: "auth-form",
    navigationGroup: "Authentication",
    compositionParts: ["dashboard-content-container", "button", "icon"],
    sourceFiles: [
      "components/fields/Button/Button.tsx",
      "components/CatalogIcon/CatalogIcon.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-social-auth-form",
    title: "Google & Apple Login Form",
    componentName: "SocialAuthFormComposition",
    description: "Combined login and registration composition with Google, Apple, and email authentication options.",
    settingsType: "auth-form",
    navigationGroup: "Authentication",
    compositionParts: ["dashboard-content-container", "text-input", "password-input", "checkbox", "button"],
    sourceFiles: [
      "components/fields/TextField/TextField.tsx",
      "components/fields/CheckboxField/CheckboxField.tsx",
      "components/fields/Button/Button.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
    ],
  },
  {
    slug: "lab-social-register-form",
    title: "Google & Apple Registration Form",
    componentName: "SocialRegisterFormComposition",
    description: "Account registration composition with Google, Apple, and full email registration options.",
    settingsType: "auth-form",
    navigationGroup: "Authentication",
    compositionParts: ["dashboard-content-container", "text-input", "email-input", "password-input", "checkbox", "button"],
    sourceFiles: [
      "components/fields/TextField/TextField.tsx",
      "components/fields/CheckboxField/CheckboxField.tsx",
      "components/fields/Button/Button.tsx",
      "components/DashboardContentContainer/DashboardContentContainer.tsx",
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
