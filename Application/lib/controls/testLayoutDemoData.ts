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
        id: "contact-manager",
        label: "Contact Manager",
        type: "group" as const,
      },
      {
        children: [
          { icon: "boxes-stacked", id: "all-products", label: "All Products" },
          { icon: "layer-group", id: "product-categories", label: "Product Categories" },
        ],
        defaultOpen: false,
        icon: "boxes-stacked",
        id: "product-catalogues",
        label: "Product Catalogues",
        type: "group" as const,
      },
      { icon: "book-open", id: "my-catalogue", label: "My Catalogue" },
      { icon: "chart-line", id: "sales-opportunities", label: "Sales Opportunities" },
      { icon: "comments", id: "communication", label: "Communication" },
      { icon: "file-lines", id: "quotations", label: "Quotations" },
      { icon: "cart-shopping", id: "sales-orders", label: "Sales Orders" },
      { icon: "file-invoice-dollar", id: "sales-invoices", label: "Sales Invoices" },
      { icon: "calendar-days", id: "appointment-diary", label: "Appointment Diary" },
      { icon: "warehouse", id: "stock-control", label: "Stock Control" },
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
      {
        children: [
          { icon: "users", id: "users", label: "Users" },
          { icon: "gear", id: "settings", label: "Settings" },
          { icon: "sliders", id: "custom-fields", label: "Custom Fields" },
          { icon: "puzzle-piece", id: "integrations", label: "Integrations" },
        ],
        defaultOpen: false,
        icon: "gears",
        id: "system-config",
        label: "System Config",
        type: "group" as const,
      },
    ],
    defaultOpen: true,
    id: "settings-group",
    label: "Settings",
    type: "group" as const,
  },
];
