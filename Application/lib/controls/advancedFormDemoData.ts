import type { CascaderOption } from "opus-react";
import type { FilterSelectGroup } from "opus-react";
import type { TreeSelectNode } from "opus-react";

export const filterSelectDemoGroups: FilterSelectGroup[] = [
  {
    label: "Status",
    options: ["Open", "In progress", "Resolved", "Closed"],
  },
  {
    label: "Priority",
    options: ["Low", "Medium", "High", "Urgent"],
  },
];

export const multiSelectDemoOptions = [
  "Design",
  "Engineering",
  "Marketing",
  "Sales",
  "Support",
  "Operations",
];

export const transferListDemoAvailable = [
  "Amsterdam",
  "Berlin",
  "Copenhagen",
  "Dublin",
  "Helsinki",
  "Lisbon",
  "Madrid",
  "Oslo",
  "Prague",
  "Stockholm",
];

export const treeSelectDemoNodes: TreeSelectNode[] = [
  {
    label: "Engineering",
    value: "engineering",
    children: [
      { label: "Frontend", value: "frontend" },
      { label: "Backend", value: "backend" },
      { label: "Platform", value: "platform" },
    ],
  },
  {
    label: "Design",
    value: "design",
    children: [
      { label: "Product design", value: "product-design" },
      { label: "Brand", value: "brand" },
    ],
  },
  {
    label: "Operations",
    value: "operations",
  },
];

export const cascaderDemoOptions: CascaderOption[] = [
  {
    label: "United Kingdom",
    value: "uk",
    children: [
      {
        label: "England",
        value: "england",
        children: [
          { label: "London", value: "london" },
          { label: "Manchester", value: "manchester" },
        ],
      },
      {
        label: "Scotland",
        value: "scotland",
        children: [
          { label: "Edinburgh", value: "edinburgh" },
          { label: "Glasgow", value: "glasgow" },
        ],
      },
    ],
  },
  {
    label: "Germany",
    value: "de",
    children: [
      {
        label: "Bavaria",
        value: "bavaria",
        children: [
          { label: "Munich", value: "munich" },
          { label: "Nuremberg", value: "nuremberg" },
        ],
      },
    ],
  },
];
