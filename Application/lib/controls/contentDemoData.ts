import type {
  ContentTimelineItem,
  DescriptionListItem,
  ListItem,
  MasonryGridItem,
  PropertyGridItem,
  TreeViewNode,
  AvatarGroupItem,
} from "@/components/fields";

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

export const demoContentTimelineItems = (includeStatus: boolean): ContentTimelineItem[] => [
  {
    avatarName: "Alex Morgan",
    title: "Alex Morgan",
    description: "Release published — opus-react 0.2.20 is available on npm.",
    time: "09:40",
    status: includeStatus ? "success" : "default",
  },
  {
    avatarName: "Jamie Lee",
    title: "Jamie Lee",
    description: "Review requested for the content component batch.",
    time: "11:15",
    status: includeStatus ? "warning" : "default",
  },
  {
    avatarName: "Sam Patel",
    title: "Sam Patel",
    description: "Issue opened for JSON Viewer expand depth defaults.",
    time: "13:02",
    status: includeStatus ? "muted" : "default",
  },
];

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
