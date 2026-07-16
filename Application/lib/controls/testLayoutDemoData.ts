export const testLayoutMenu = [
  { icon: "table-columns", id: "dashboard", label: "Dashboard" },
  {
    children: [
      {
        children: [
          { icon: "address-book", id: "all-contacts", label: "All Contacts" },
          { icon: "rectangle-list", id: "contact-lists", label: "Contact Lists" },
        ],
        defaultOpen: true,
        icon: "users",
        id: "contacts",
        label: "Contacts",
        type: "group" as const,
      },
      {
        children: [
          { icon: "building", id: "all-companies", label: "All Companies" },
          { icon: "layer-group", id: "company-segments", label: "Company Segments" },
        ],
        defaultOpen: false,
        icon: "building",
        id: "companies",
        label: "Companies",
        type: "group" as const,
      },
      { icon: "dollar-sign", id: "deals", label: "Deals" },
      { icon: "list-check", id: "tasks", label: "Tasks" },
      { icon: "note-sticky", id: "notes", label: "Notes" },
      { icon: "calendar", id: "calendar", label: "Calendar" },
    ],
    defaultOpen: true,
    id: "crm",
    label: "CRM",
    type: "group" as const,
  },
  {
    children: [
      { icon: "chart-column", id: "reports", label: "Reports" },
      { icon: "table-columns", id: "dashboards", label: "Dashboards" },
      { icon: "chart-line", id: "charts", label: "Charts" },
    ],
    defaultOpen: true,
    id: "analytics",
    label: "Analytics",
    type: "group" as const,
  },
  {
    children: [
      { icon: "users", id: "users", label: "Users" },
      { icon: "gear", id: "settings", label: "Settings" },
      { icon: "sliders", id: "custom-fields", label: "Custom Fields" },
      { icon: "puzzle-piece", id: "integrations", label: "Integrations" },
    ],
    defaultOpen: true,
    id: "settings-group",
    label: "Settings",
    type: "group" as const,
  },
];
