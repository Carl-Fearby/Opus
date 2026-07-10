export const defaultUserProfilePhotoSrc = "/user-profile-carl.png";

export type UserProfileMenuItem = {
  destructive?: boolean;
  id: string;
  label: string;
  onSelect?: () => void;
};

export const defaultUserProfileMenuItems: UserProfileMenuItem[] = [
  { id: "change-avatar", label: "Change Avatar" },
  { id: "profile", label: "Profile" },
  { id: "tasks", label: "Tasks" },
  { id: "logout", label: "Logout", destructive: true },
];

export const defaultUserProfilePhotoUploadMenuItemId = "change-avatar";

export const defaultUserProfileMenuItemsJson = JSON.stringify(defaultUserProfileMenuItems, null, 2);

export function formatUserProfileMenuItemsForUsage(
  menuItems: UserProfileMenuItem[],
  photoUploadMenuItemId?: string,
): string {
  return menuItems
    .map((item) => {
      const fields = [`id: ${JSON.stringify(item.id)}`, `label: ${JSON.stringify(item.label)}`];

      if (item.destructive) {
        fields.push("destructive: true");
      }

      if (photoUploadMenuItemId && item.id === photoUploadMenuItemId) {
        fields.push("onSelect: openPhotoUpload");
      } else {
        fields.push(`onSelect: () => console.log(${JSON.stringify(`Selected: ${item.label}`)})`);
      }

      return `  { ${fields.join(", ")} }`;
    })
    .join(",\n");
}

export function formatUserProfileUsageAfterState(
  menuItems: UserProfileMenuItem[],
  photoUploadEnabled: boolean,
  photoUploadMenuItemId = defaultUserProfilePhotoUploadMenuItemId,
): string[] {
  const lines = [
    "",
    "const menuItems = [",
    formatUserProfileMenuItemsForUsage(
      menuItems,
      photoUploadEnabled ? photoUploadMenuItemId : undefined,
    ),
    "];",
  ];

  if (photoUploadEnabled) {
    lines.unshift(
      "// Parent callback — paste this and wire it to menu onSelect and onAvatarClick.",
      "const openPhotoUpload = () => setPhotoUploadOpen(true);",
      "",
      `// Example binds photo upload to the \"${photoUploadMenuItemId}\" menu item.`,
    );
  }

  return lines;
}

export function formatUserProfilePhotoUploadModalUsage(
  fieldId: string,
  photoUploadTitle?: string,
): string {
  const options = photoUploadTitle ? `\n    options={{ title: ${JSON.stringify(photoUploadTitle)} }}\n` : "\n";
  return `<ProfilePhotoUploadModal
    fieldId=${JSON.stringify(fieldId)}
    open={photoUploadOpen}
    value={photo}${options}    onClose={() => setPhotoUploadOpen(false)}
    onPhotoChange={setPhoto}
  />`;
}

export function parseUserProfileMenuItems(json: string): UserProfileMenuItem[] {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) {
      return defaultUserProfileMenuItems;
    }

    return parsed
      .filter(
        (entry): entry is UserProfileMenuItem =>
          typeof entry === "object" &&
          entry !== null &&
          typeof (entry as UserProfileMenuItem).id === "string" &&
          typeof (entry as UserProfileMenuItem).label === "string",
      )
      .map((entry) => ({
        destructive: entry.destructive === true,
        id: entry.id,
        label: entry.label,
      }));
  } catch {
    return defaultUserProfileMenuItems;
  }
}
