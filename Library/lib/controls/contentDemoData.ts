import type {
  ContentTimelineGroup,
  ContentTimelineItem,
  DescriptionListItem,
  ListItem,
  MasonryGridItem,
  PropertyGridItem,
  TreeViewNode,
  AvatarGroupItem,
} from "opus-react";
import type { ContentTimelineRowStyle } from "./types";

export const demoAvatarGroupItems: AvatarGroupItem[] = [
  { name: "Alex Morgan" },
  { name: "Jamie Chen" },
  { name: "Sam Rivera" },
  { name: "Taylor Brooks" },
  { name: "Jordan Lee" },
];

export const demoListItems = (showIcons: boolean): ListItem[] => [
  {
    title: "Design tokens",
    description: "Colour, spacing, and typography primitives.",
    meta: "Updated",
    icon: showIcons ? "palette" : undefined,
  },
  {
    title: "Component library",
    description: "Reusable React primitives for product surfaces.",
    meta: "Live",
    icon: showIcons ? "cube" : undefined,
  },
  {
    title: "Documentation",
    description: "Interactive previews and usage guidance.",
    meta: "Draft",
    icon: showIcons ? "book" : undefined,
  },
];

export const demoDescriptionListItems: DescriptionListItem[] = [
  { term: "Owner", details: "Alex Morgan" },
  { term: "Status", details: "In review" },
  { term: "Created", details: "8 Jul 2026" },
  { term: "Workspace", details: "Opus Product" },
];

const demoContentTimelineRowTemplates = [
  {
    avatarName: "Alex Morgan",
    avatarTitle: "Alex Morgan",
    eventTitle: "Release published",
    description: "Release published — opus-react 0.2.20 is available on npm.",
    tags: [
      { label: "Release", tone: "green" as const },
      { label: "npm", tone: "purple" as const },
    ],
    time: "09:40",
    statusKey: "success" as const,
  },
  {
    avatarName: "Jamie Lee",
    avatarTitle: "Jamie Lee",
    eventTitle: "Review requested",
    description: "Review requested for the content component batch.",
    tags: [{ label: "Review", tone: "orange" as const }],
    time: "11:15",
    statusKey: "warning" as const,
  },
  {
    avatarName: "Sam Patel",
    avatarTitle: "Sam Patel",
    eventTitle: "Issue opened",
    description: "JSON Viewer expand depth defaults need review.",
    tags: [{ label: "Bug", tone: "purple" as const }],
    time: "13:02",
    statusKey: "muted" as const,
  },
];

export const demoContentTimelineItems = (
  includeStatus: boolean,
  rowStyles: [ContentTimelineRowStyle, ContentTimelineRowStyle, ContentTimelineRowStyle] = [
    "avatar",
    "avatar",
    "status",
  ],
  includeTags = true,
): ContentTimelineItem[] =>
  demoContentTimelineRowTemplates.map((row, index) => {
    const useAvatar = rowStyles[index] === "avatar";
    const status = includeStatus ? row.statusKey : "default";
    const tags = includeTags ? row.tags : undefined;

    if (useAvatar) {
      return {
        avatarName: row.avatarName,
        title: row.avatarTitle,
        description: row.description,
        tags,
        time: row.time,
        status,
      };
    }

    return {
      title: row.eventTitle,
      description: row.description,
      tags,
      time: row.time,
      status,
    };
  });

export function demoContentTimelineGroups(
  includeStatus: boolean,
  rowStyles: [ContentTimelineRowStyle, ContentTimelineRowStyle, ContentTimelineRowStyle],
  includeTags = true,
): ContentTimelineGroup[] {
  const items = demoContentTimelineItems(includeStatus, rowStyles, includeTags);

  return [
    { label: "Today", items: items.slice(0, 2) },
    { label: "Earlier", items: items.slice(2) },
  ];
}

export const demoTreeViewNodes: TreeViewNode[] = [
  {
    id: "product",
    label: "Product",
    children: [
      { id: "product-overview", label: "Overview" },
      {
        id: "product-components",
        label: "Components",
        children: [
          { id: "product-forms", label: "Forms" },
          { id: "product-content", label: "Content" },
        ],
      },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    children: [
      { id: "eng-docs", label: "Docs" },
      { id: "eng-releases", label: "Releases" },
    ],
  },
];

export const demoMasonryItems: MasonryGridItem[] = [
  { title: "Badge tones", body: "Soft, solid, and outline chips for status labels.", height: 120 },
  { title: "Avatar stacks", body: "Overflow-aware collaborator strips.", height: 160 },
  { title: "List density", body: "Comfortable and compact list rows.", height: 140 },
  { title: "Property grids", body: "Inspector-friendly key/value layouts.", height: 180 },
  { title: "JSON trees", body: "Expand nested payloads without leaving the page.", height: 130 },
  { title: "Timelines", body: "Activity history with status accents.", height: 150 },
];

export const demoPropertyItems = (copyable: boolean): PropertyGridItem[] => [
  { label: "Component", value: "PropertyGrid", copyable },
  { label: "Package", value: "opus-react", copyable },
  { label: "Category", value: "content", copyable },
  { label: "Uses FieldShell", value: "false", copyable },
];

export const demoJsonValue = {
  name: "opus-react",
  version: "0.2.20",
  content: {
    components: ["Badge", "Avatar", "JsonViewer"],
    themes: ["light", "dark"],
  },
  published: true,
};
