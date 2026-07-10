type IconBadgeUrgency = "standard" | "danger" | "warning" | "success" | "info";

export type IconBadgeToolbarDemoItem = {
  actionLabel: string;
  count?: number;
  iconName: string;
  label: string;
  urgency?: IconBadgeUrgency;
};

export const iconBadgeToolbarDemoItems: IconBadgeToolbarDemoItem[] = [
  { iconName: "bell", label: "Notifications", count: 8, urgency: "standard", actionLabel: "Notifications" },
  { iconName: "envelope", label: "Messages", count: 3, urgency: "info", actionLabel: "Messages" },
  { iconName: "comment", label: "Comments", count: 5, urgency: "standard", actionLabel: "Comments" },
  { iconName: "heart", label: "Favourites", count: 2, urgency: "danger", actionLabel: "Favourites" },
  { iconName: "bookmark", label: "Saved items", count: 1, urgency: "warning", actionLabel: "Saved items" },
  { iconName: "inbox", label: "Inbox", count: 12, urgency: "success", actionLabel: "Inbox" },
  { iconName: "hashtag", label: "Hundreds", count: 100, urgency: "standard", actionLabel: "Hundreds" },
  { iconName: "fire", label: "Thousands", count: 1000, urgency: "danger", actionLabel: "Thousands" },
  { iconName: "calendar", label: "Calendar", actionLabel: "Calendar" },
  { iconName: "gear", label: "Settings", actionLabel: "Settings" },
];

export const iconBadgeToolbarThemeItem: IconBadgeToolbarDemoItem = {
  iconName: "sun",
  label: "Theme",
  actionLabel: "Theme",
};

function quote(value: string) {
  return JSON.stringify(value);
}

function formatBadgeProps(
  item: IconBadgeToolbarDemoItem,
  size: string,
  tone: string,
  reportAction: string,
): string {
  const props = [
    item.count !== undefined ? `count={${item.count}}` : "",
    `iconName=${quote(item.iconName)}`,
    `label=${quote(item.label)}`,
    size !== "md" ? `size=${quote(size)}` : "",
    tone !== "muted" ? `tone=${quote(tone)}` : "",
    item.urgency && item.urgency !== "standard" ? `urgency=${quote(item.urgency)}` : "",
    `onClick={() => ${reportAction}(${quote(item.actionLabel)})}`,
  ].filter(Boolean);

  return `      <IconBadge\n        ${props.join("\n        ")}\n      />`;
}

export function formatIconBadgeToolbarUsage(size: string, tone: string): string {
  const badges = iconBadgeToolbarDemoItems.map((item) => formatBadgeProps(item, size, tone, "reportAction")).join("\n");
  const themeBadge = formatBadgeProps(iconBadgeToolbarThemeItem, size, tone, "reportAction");

  return `(
  <>
    <div
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 6,
      }}
    >
${badges}
${themeBadge}
    </div>
    <p>{lastAction}</p>
  </>
)`;
}
