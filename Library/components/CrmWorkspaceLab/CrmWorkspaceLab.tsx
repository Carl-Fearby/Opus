"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { DashboardContentContainer } from "@/components/DashboardContentContainer";
import { Button } from "@/components/fields/Button";
import { TextField } from "@/components/fields/TextField";
import { TreeMenu, type TreeMenuNode } from "@/components/TreeMenu";
import styles from "./CrmWorkspaceLab.module.css";

export type CrmWorkspaceLabVariant =
  | "appointment-diary"
  | "company-directory"
  | "contact-directory"
  | "document-manager"
  | "notification-centre"
  | "product-catalogue"
  | "quotation-builder"
  | "sales-invoice"
  | "sales-order"
  | "sales-pipeline"
  | "stock-control"
  | "system-configuration"
  | "task-workspace";

type Layout = "directory" | "documents" | "timeline" | "feed" | "board" | "catalogue" | "settings" | "commerce";

type Row = {
  id: string;
  primary: string;
  secondary: string;
  status: string;
  meta: string;
  icon?: string;
  time?: string;
};

type DocNode = {
  id: string;
  name: string;
  kind: "folder" | "file";
  meta?: string;
  status?: string;
  children?: DocNode[];
};

type DocumentView = "list" | "grid" | "columns";

type Definition = {
  action: string;
  actionIcon: string;
  description: string;
  icon: string;
  layout: Layout;
  title: string;
  rows: Row[];
  documents?: DocNode[];
  columns?: string[];
};

const documentTree: DocNode[] = [
  {
    id: "contracts",
    name: "Contracts",
    kind: "folder",
    children: [
      { id: "msa", name: "Master services agreement.pdf", kind: "file", meta: "PDF · 1.2 MB · Carl Fearby", status: "Signed" },
      { id: "nda", name: "Mutual NDA.pdf", kind: "file", meta: "PDF · 420 KB · Emma Davis", status: "Signed" },
    ],
  },
  {
    id: "proposals",
    name: "Proposals",
    kind: "folder",
    children: [
      { id: "proposal", name: "Enterprise proposal.pdf", kind: "file", meta: "PDF · Version 4 · 4.8 MB", status: "Approved" },
      { id: "terms", name: "Commercial terms.docx", kind: "file", meta: "Word · Version 2 · 820 KB", status: "Review" },
    ],
  },
  {
    id: "design",
    name: "Design",
    kind: "folder",
    children: [
      { id: "brief", name: "Implementation brief.fig", kind: "file", meta: "Figma · Version 7 · 12.4 MB", status: "Draft" },
      { id: "wireframes", name: "Wireframes", kind: "folder", children: [
        { id: "onboarding", name: "Onboarding flow.pdf", kind: "file", meta: "PDF · 2.1 MB · Olivia Wilson", status: "Draft" },
      ] },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    kind: "folder",
    children: [
      { id: "invoice-pack", name: "Q2 invoice pack.xlsx", kind: "file", meta: "Excel · 640 KB · Carl Fearby", status: "Current" },
    ],
  },
];

const definitions: Record<CrmWorkspaceLabVariant, Definition> = {
  "contact-directory": {
    title: "Contacts",
    description: "Search, filter, select, and manage customer contacts.",
    action: "Add contact",
    actionIcon: "user-plus",
    icon: "users",
    layout: "directory",
    columns: ["Contact", "Status", "Email"],
    rows: [
      { id: "emma", primary: "Emma Davis", secondary: "Head of Procurement · Acme Ltd", status: "Active", meta: "emma.davis@acme.com", icon: "user" },
      { id: "michael", primary: "Michael Brown", secondary: "Commercial Director · Initech", status: "Opportunity", meta: "michael@initech.com", icon: "user" },
      { id: "olivia", primary: "Olivia Wilson", secondary: "Operations Lead · Global Corp", status: "Active", meta: "olivia@global.example", icon: "user" },
    ],
  },
  "company-directory": {
    title: "Companies",
    description: "Account directory with owners, activity, and pipeline value.",
    action: "Add company",
    actionIcon: "building",
    icon: "building",
    layout: "directory",
    columns: ["Company", "Status", "Pipeline"],
    rows: [
      { id: "acme", primary: "Acme Ltd", secondary: "Manufacturing · 1,001–5,000 employees", status: "Customer", meta: "£842,000 pipeline", icon: "building" },
      { id: "initech", primary: "Initech", secondary: "Technology · 501–1,000 employees", status: "Prospect", meta: "£542,000 pipeline", icon: "building" },
      { id: "global", primary: "Global Corp", secondary: "Professional services · 5,000+ employees", status: "Customer", meta: "£331,000 pipeline", icon: "building" },
    ],
  },
  "task-workspace": {
    title: "Tasks",
    description: "Prioritise work across list, board, and calendar views.",
    action: "Add task",
    actionIcon: "plus",
    icon: "list-check",
    layout: "directory",
    columns: ["Task", "Priority", "Owner"],
    rows: [
      { id: "follow", primary: "Follow up with Sarah Jones", secondary: "Acme Ltd · Proposal discussion", status: "Today", meta: "10:30 · Carl Fearby", icon: "circle-check" },
      { id: "call", primary: "Call with James Smith", secondary: "Global Corp · Demo", status: "In progress", meta: "14:00 · Emma Davis", icon: "phone" },
      { id: "quote", primary: "Prepare quote for Initech", secondary: "Enterprise plan · 50 users", status: "High", meta: "16:30 · Olivia Wilson", icon: "file-lines" },
    ],
  },
  "notification-centre": {
    title: "Notifications",
    description: "Grouped product notifications with explicit read state.",
    action: "Mark all read",
    actionIcon: "check-double",
    icon: "bell",
    layout: "feed",
    rows: [
      { id: "deal", primary: "Deal moved to Proposal", secondary: "Acme Ltd · updated by Emma Davis", status: "Unread", meta: "2 minutes ago", icon: "filter-circle-dollar" },
      { id: "mention", primary: "You were mentioned in a note", secondary: "James Smith · Global Corp", status: "Unread", meta: "18 minutes ago", icon: "at" },
      { id: "task", primary: "Task due soon", secondary: "Prepare quote for Initech", status: "Reminder", meta: "Today at 16:30", icon: "clock" },
    ],
  },
  "document-manager": {
    title: "Documents",
    description: "Browse folders and files like a shared drive.",
    action: "Upload files",
    actionIcon: "cloud-arrow-up",
    icon: "folder-open",
    layout: "documents",
    rows: [],
    documents: documentTree,
  },
  "product-catalogue": {
    title: "Product catalogue",
    description: "Manage sellable products, pricing, and availability.",
    action: "Add product",
    actionIcon: "plus",
    icon: "boxes-stacked",
    layout: "catalogue",
    rows: [
      { id: "enterprise", primary: "Enterprise CRM", secondary: "Annual subscription · OP-CRM-ENT", status: "Active", meta: "£18,000 / year", icon: "cube" },
      { id: "analytics", primary: "Analytics Plus", secondary: "Add-on · OP-AN-PLUS", status: "Active", meta: "£4,800 / year", icon: "chart-column" },
      { id: "onboarding", primary: "Guided onboarding", secondary: "Professional service · OP-SVC-ONB", status: "Limited", meta: "£2,400", icon: "handshake" },
    ],
  },
  "quotation-builder": {
    title: "Quotation builder",
    description: "Build, price, approve, and send customer quotations.",
    action: "New quotation",
    actionIcon: "plus",
    icon: "file-lines",
    layout: "commerce",
    columns: ["Quote", "Status", "Value"],
    rows: [
      { id: "q1048", primary: "Q-1048 · Acme Ltd", secondary: "Enterprise CRM · 50 seats", status: "Draft", meta: "£18,000 · Valid 30 days" },
      { id: "q1047", primary: "Q-1047 · Initech", secondary: "CRM + Analytics Plus", status: "Sent", meta: "£28,800 · Viewed today" },
      { id: "q1046", primary: "Q-1046 · Global Corp", secondary: "Guided onboarding", status: "Approved", meta: "£2,400 · Olivia Wilson" },
    ],
  },
  "sales-order": {
    title: "Sales orders",
    description: "Track confirmed orders from acceptance to fulfilment.",
    action: "New order",
    actionIcon: "plus",
    icon: "cart-shopping",
    layout: "commerce",
    columns: ["Order", "Status", "Total"],
    rows: [
      { id: "so884", primary: "SO-884 · Acme Ltd", secondary: "Enterprise CRM", status: "Processing", meta: "£18,000 · 18 Jul 2026" },
      { id: "so883", primary: "SO-883 · Global Corp", secondary: "Guided onboarding", status: "Fulfilled", meta: "£2,400 · 17 Jul 2026" },
      { id: "so882", primary: "SO-882 · Initech", secondary: "Analytics Plus", status: "On hold", meta: "£4,800 · 16 Jul 2026" },
    ],
  },
  "sales-invoice": {
    title: "Sales invoices",
    description: "Issue invoices and monitor payment status.",
    action: "New invoice",
    actionIcon: "plus",
    icon: "file-invoice-dollar",
    layout: "commerce",
    columns: ["Invoice", "Status", "Amount"],
    rows: [
      { id: "inv1208", primary: "INV-1208 · Acme Ltd", secondary: "Enterprise CRM", status: "Due", meta: "£18,000 · 17 Aug 2026" },
      { id: "inv1207", primary: "INV-1207 · Global Corp", secondary: "Guided onboarding", status: "Paid", meta: "£2,400 · Paid 17 Jul" },
      { id: "inv1206", primary: "INV-1206 · Initech", secondary: "Analytics Plus", status: "Overdue", meta: "£4,800 · 6 days overdue" },
    ],
  },
  "appointment-diary": {
    title: "Appointment diary",
    description: "Coordinate meetings, calls, and customer appointments.",
    action: "New appointment",
    actionIcon: "plus",
    icon: "calendar-days",
    layout: "timeline",
    rows: [
      { id: "discovery", primary: "Discovery call", secondary: "Emma Davis · Acme Ltd", status: "Confirmed", meta: "45 minutes · Teams", time: "09:30", icon: "phone" },
      { id: "demo", primary: "Product demonstration", secondary: "James Smith · Global Corp", status: "Confirmed", meta: "60 minutes · Meeting room 2", time: "11:00", icon: "desktop" },
      { id: "review", primary: "Commercial review", secondary: "Michael Brown · Initech", status: "Tentative", meta: "30 minutes · Zoom", time: "14:30", icon: "handshake" },
    ],
  },
  "stock-control": {
    title: "Stock control",
    description: "Monitor availability, movements, and reorder thresholds.",
    action: "Stock adjustment",
    actionIcon: "plus",
    icon: "warehouse",
    layout: "commerce",
    columns: ["SKU", "Status", "Availability"],
    rows: [
      { id: "kit", primary: "Starter hardware kit", secondary: "SKU HW-KIT-01 · Birmingham", status: "In stock", meta: "148 available · Reorder at 40" },
      { id: "reader", primary: "RFID reader", secondary: "SKU HW-RFID-04 · Coventry", status: "Low", meta: "18 available · Reorder at 25" },
      { id: "tablet", primary: "Field tablet", secondary: "SKU HW-TAB-12 · London", status: "Allocated", meta: "32 available · 21 reserved" },
    ],
  },
  "system-configuration": {
    title: "System configuration",
    description: "Manage organisation-wide behavior, access, and integrations.",
    action: "Save changes",
    actionIcon: "floppy-disk",
    icon: "gears",
    layout: "settings",
    rows: [
      { id: "general", primary: "General settings", secondary: "Organisation, locale, currency, and fiscal year", status: "Configured", meta: "Updated 2 days ago", icon: "sliders" },
      { id: "security", primary: "Security and access", secondary: "Authentication, roles, sessions, and audit policy", status: "Attention", meta: "2 recommendations", icon: "shield-halved" },
      { id: "integrations", primary: "Integrations", secondary: "Email, calendar, accounting, and webhooks", status: "Connected", meta: "8 active integrations", icon: "plug" },
    ],
  },
  "sales-pipeline": {
    title: "Sales opportunity pipeline",
    description: "Move qualified opportunities through a visual deal workflow.",
    action: "Create opportunity",
    actionIcon: "plus",
    icon: "filter-circle-dollar",
    layout: "board",
    rows: [
      { id: "acme", primary: "Acme renewal", secondary: "Acme Ltd · Emma Davis", status: "Qualification", meta: "£842,000 · 34%" },
      { id: "initech", primary: "Initech expansion", secondary: "Initech · Michael Brown", status: "Proposal", meta: "£621,000 · 25%" },
      { id: "global", primary: "Global rollout", secondary: "Global Corp · Olivia Wilson", status: "Negotiation", meta: "£542,000 · 22%" },
    ],
  },
};

function statusTone(status: string): "danger" | "success" | "info" | "warning" | "accent" {
  if (status === "Overdue" || status === "Attention" || status === "High") return "danger";
  if (status === "Paid" || status === "Active" || status === "Configured" || status === "Signed" || status === "Approved" || status === "Fulfilled" || status === "In stock" || status === "Connected") {
    return "success";
  }
  if (status === "Low" || status === "Tentative" || status === "Draft" || status === "Review") return "warning";
  if (status === "Unread" || status === "Reminder") return "accent";
  return "info";
}

function findNode(nodes: DocNode[], id: string): DocNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const nested = findNode(node.children, id);
      if (nested) return nested;
    }
  }
  return null;
}

function buildBreadcrumb(nodes: DocNode[], id: string, trail: DocNode[] = []): DocNode[] | null {
  for (const node of nodes) {
    const next = [...trail, node];
    if (node.id === id) return next;
    if (node.children) {
      const nested = buildBreadcrumb(node.children, id, next);
      if (nested) return nested;
    }
  }
  return null;
}

function RowChevron() {
  return (
    <span aria-hidden="true" className={styles.openChevron}>
      <CatalogIcon iconName="chevron-right" />
    </span>
  );
}

function WorkspaceHeader({
  action,
  actionIcon,
  description,
  icon,
  title,
  onAction,
}: {
  action: string;
  actionIcon: string;
  description: string;
  icon: string;
  title: string;
  onAction: () => void;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.heading}>
        <span className={styles.headingIcon}>
          <CatalogIcon iconName={icon} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      <Button className={styles.headerAction} size="sm" type="button" onClick={onAction}>
        <CatalogIcon iconName={actionIcon} />
        <span>{action}</span>
      </Button>
    </header>
  );
}

function SearchToolbar({
  count,
  label,
  query,
  selectedCount,
  onQueryChange,
  onAction,
}: {
  count: number;
  label: string;
  query: string;
  selectedCount: number;
  onQueryChange: (value: string) => void;
  onAction: (action: string) => void;
}) {
  return (
    <div className={styles.toolbar}>
      <TextField
        id={`${label}-search`}
        label={`Search ${label}`}
        labelVisuallyHidden
        placeholder={`Search ${label.toLowerCase()}...`}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <span className={styles.resultCount}>{count} items</span>
      {selectedCount ? (
        <Button size="sm" type="button" variant="secondary" onClick={() => onAction(`Bulk actions for ${selectedCount} items`)}>
          Actions ({selectedCount})
        </Button>
      ) : null}
    </div>
  );
}

function DirectoryLayout({
  columns,
  query,
  rows,
  selected,
  title,
  onQueryChange,
  onToggle,
  onAction,
}: {
  columns: string[];
  query: string;
  rows: Row[];
  selected: string[];
  title: string;
  onQueryChange: (value: string) => void;
  onToggle: (id: string) => void;
  onAction: (action: string) => void;
}) {
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        `${row.primary} ${row.secondary} ${row.status} ${row.meta}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, rows],
  );

  return (
    <>
      <SearchToolbar
        count={filtered.length}
        label={title}
        query={query}
        selectedCount={selected.length}
        onQueryChange={onQueryChange}
        onAction={onAction}
      />
      <div className={styles.table} role="table" aria-label={title}>
        <div className={`${styles.row} ${styles.tableHead}`} role="row">
          <span />
          <span role="columnheader">{columns[0]}</span>
          <span role="columnheader">{columns[1]}</span>
          <span role="columnheader">{columns[2]}</span>
          <span />
        </div>
        {filtered.map((row) => {
          const checked = selected.includes(row.id);
          return (
            <div className={`${styles.row} ${styles.actionRow}`} role="row" key={row.id}>
              <span className={styles.selectCell} role="cell">
                <input
                  aria-label={`Select ${row.primary}`}
                  checked={checked}
                  type="checkbox"
                  onChange={() => onToggle(row.id)}
                />
              </span>
              <span className={styles.identity} role="cell">
                {row.icon ? (
                  <span className={styles.rowIcon}>
                    <CatalogIcon iconName={row.icon} />
                  </span>
                ) : null}
                <span>
                  <strong>{row.primary}</strong>
                  <small>{row.secondary}</small>
                </span>
              </span>
              <span role="cell">
                <Badge label={row.status} size="sm" tone={statusTone(row.status)} />
              </span>
              <span className={styles.meta} role="cell">
                {row.meta}
              </span>
              <span className={styles.actionCell} role="cell">
                <button
                  aria-label={`Open ${row.primary}`}
                  className={styles.rowActionOverlay}
                  onClick={() => onAction(`Open ${row.primary}`)}
                  type="button"
                >
                  <RowChevron />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function TimelineLayout({ rows, onAction }: { rows: Row[]; onAction: (action: string) => void }) {
  return (
    <div className={styles.timeline} aria-label="Appointments">
      {rows.map((row) => (
        <article className={styles.timelineItem} key={row.id}>
          <div className={styles.timelineTime}>
            <strong>{row.time}</strong>
            <span>{row.meta.split(" · ")[0]}</span>
          </div>
          <button className={styles.timelineCard} onClick={() => onAction(`Open ${row.primary}`)} type="button">
            <span className={styles.timelineIcon}>
              <CatalogIcon iconName={row.icon ?? "calendar"} />
            </span>
            <div className={styles.timelineBody}>
              <div className={styles.timelineTitleRow}>
                <h3>{row.primary}</h3>
                <Badge label={row.status} size="sm" tone={statusTone(row.status)} />
              </div>
              <p>{row.secondary}</p>
              <small>{row.meta}</small>
            </div>
            <RowChevron />
          </button>
        </article>
      ))}
    </div>
  );
}

function FeedLayout({ rows, onAction }: { rows: Row[]; onAction: (action: string) => void }) {
  return (
    <div className={styles.feed} aria-label="Notifications">
      {rows.map((row) => (
        <button
          className={styles.feedItem}
          data-unread={row.status === "Unread" ? "true" : "false"}
          key={row.id}
          onClick={() => onAction(`Open ${row.primary}`)}
          type="button"
        >
          <span className={styles.feedIcon}>
            <CatalogIcon iconName={row.icon ?? "bell"} />
          </span>
          <div className={styles.feedBody}>
            <h3>{row.primary}</h3>
            <p>{row.secondary}</p>
            <small>{row.meta}</small>
          </div>
          <span className={styles.feedBadge}>
            <Badge label={row.status} size="sm" tone={statusTone(row.status)} />
          </span>
          <RowChevron />
        </button>
      ))}
    </div>
  );
}

function BoardLayout({ rows, onAction }: { rows: Row[]; onAction: (action: string) => void }) {
  const columns = ["Qualification", "Proposal", "Negotiation"];
  return (
    <div className={styles.board} aria-label="Pipeline board">
      {columns.map((column) => {
        const cards = rows.filter((row) => row.status === column);
        return (
          <section className={styles.boardColumn} key={column}>
            <header>
              <h3>{column}</h3>
              <span>{cards.length}</span>
            </header>
            <div className={styles.boardCards}>
              {cards.map((row) => (
                <button
                  className={styles.boardCard}
                  key={row.id}
                  onClick={() => onAction(`Open ${row.primary}`)}
                  type="button"
                >
                  <div className={styles.boardCardHeader}>
                    <strong>{row.primary}</strong>
                    <RowChevron />
                  </div>
                  <small>{row.secondary}</small>
                  <span>{row.meta}</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CatalogueLayout({ rows, onAction }: { rows: Row[]; onAction: (action: string) => void }) {
  return (
    <div className={styles.catalogue} aria-label="Products">
      {rows.map((row) => (
        <button
          className={styles.catalogueCard}
          key={row.id}
          onClick={() => onAction(`Open ${row.primary}`)}
          type="button"
        >
          <div className={styles.catalogueTitleRow}>
            <span className={styles.catalogueIcon}>
              <CatalogIcon iconName={row.icon ?? "cube"} />
            </span>
            <Badge label={row.status} size="sm" tone={statusTone(row.status)} />
            <RowChevron />
          </div>
          <div className={styles.catalogueBody}>
            <h3>{row.primary}</h3>
            <p>{row.secondary}</p>
            <strong className={styles.price}>{row.meta}</strong>
          </div>
        </button>
      ))}
    </div>
  );
}

function SettingsLayout({ rows, onAction }: { rows: Row[]; onAction: (action: string) => void }) {
  return (
    <div className={styles.settings} aria-label="Configuration">
      {rows.map((row) => (
        <button
          className={styles.settingsRow}
          key={row.id}
          onClick={() => onAction(`Open ${row.primary}`)}
          type="button"
        >
          <span className={styles.settingsIcon}>
            <CatalogIcon iconName={row.icon ?? "gear"} />
          </span>
          <span className={styles.settingsBody}>
            <strong>{row.primary}</strong>
            <small>{row.secondary}</small>
          </span>
          <Badge label={row.status} size="sm" tone={statusTone(row.status)} />
          <span className={styles.meta}>{row.meta}</span>
          <RowChevron />
        </button>
      ))}
    </div>
  );
}

function DocumentsLayout({ tree, onAction }: { tree: DocNode[]; onAction: (action: string) => void }) {
  const [folderId, setFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<DocumentView>("grid");

  const breadcrumb = folderId ? buildBreadcrumb(tree, folderId) ?? [] : [];
  const current = folderId ? findNode(tree, folderId) : null;
  const visible = useMemo(() => {
    const children = current?.kind === "folder" ? current.children ?? [] : tree;
    return children.filter((node) => node.name.toLowerCase().includes(query.toLowerCase()));
  }, [current, query, tree]);

  const folders = visible.filter((node) => node.kind === "folder");
  const files = visible.filter((node) => node.kind === "file");
  const folderNodes = useMemo(() => {
    const convert = (nodes: DocNode[]): TreeMenuNode[] =>
      nodes
        .filter((node) => node.kind === "folder")
        .map((node) => ({
          children: convert(node.children ?? []),
          icon: "folder",
          id: node.id,
          label: node.name,
          meta: node.children?.length ?? 0,
        }));
    return convert(tree);
  }, [tree]);
  const columnLevels = useMemo(() => {
    const levels: DocNode[][] = [tree];
    breadcrumb.forEach((node, index) => {
      const children = node.children ?? [];
      levels.push(index === breadcrumb.length - 1 ? visible : children);
    });
    return levels;
  }, [breadcrumb, tree, visible]);

  const openFolder = (node: DocNode) => {
    setFolderId(node.id);
    onAction(`Open folder ${node.name}`);
  };

  const changeView = (nextView: DocumentView) => {
    setView(nextView);
    onAction(`Change document view to ${nextView}`);
  };

  return (
    <div className={styles.documents}>
      <aside className={styles.docTree} aria-label="Folders">
        <div className={styles.docTreeHeading}>Folders</div>
        <TreeMenu
          ariaLabel="Document folders"
          defaultExpandedIds={folderNodes.map((node) => node.id)}
          nodes={folderNodes}
          selectedId={folderId ?? undefined}
          onExpandedChange={(_expandedIds, node, expanded) =>
            onAction(`${expanded ? "Expand" : "Collapse"} folder ${node.label}`)
          }
          onSelect={(node) => {
            setFolderId(node.id);
            onAction(`Open folder ${node.label}`);
          }}
        />
      </aside>

      <div className={styles.docBrowser}>
        <div className={styles.docToolbar}>
          <nav className={styles.breadcrumb} aria-label="Path">
            <button type="button" onClick={() => { setFolderId(null); onAction("Open Documents"); }}>
              Documents
            </button>
            {breadcrumb.map((node) => (
              <span key={node.id}>
                <CatalogIcon iconName="chevron-right" />
                <button type="button" onClick={() => { setFolderId(node.id); onAction(`Open folder ${node.name}`); }}>
                  {node.name}
                </button>
              </span>
            ))}
          </nav>
          <div className={styles.docToolbarControls}>
            <TextField
              id="documents-search"
              label="Search folder"
              labelVisuallyHidden
              placeholder="Search this folder..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className={styles.docViewOptions} role="group" aria-label="Document view">
              {([
                ["list", "bars", "List view"],
                ["grid", "table-cells-large", "Grid view"],
                ["columns", "table-columns", "Columns view"],
              ] as const).map(([value, icon, label]) => (
                <button
                  aria-label={label}
                  aria-pressed={view === value}
                  className={styles.docViewButton}
                  key={value}
                  onClick={() => changeView(value)}
                  title={label}
                  type="button"
                >
                  <CatalogIcon iconName={icon} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "grid" ? (
          <div className={styles.docGrid} aria-label="Folder contents">
            {folders.map((node) => (
              <button
                className={styles.docCard}
                data-kind="folder"
                key={node.id}
                type="button"
                onClick={() => openFolder(node)}
              >
                <span className={styles.docCardIcon}>
                  <CatalogIcon iconName="folder" />
                </span>
                <strong>{node.name}</strong>
                <small>{node.children?.length ?? 0} items</small>
              </button>
            ))}
            {files.map((node) => (
              <button
                className={styles.docCard}
                data-kind="file"
                key={node.id}
                onClick={() => onAction(`Open ${node.name}`)}
                type="button"
              >
                <div className={styles.docCardHeader}>
                  <span className={styles.docCardIcon}>
                    <CatalogIcon iconName="file-lines" />
                  </span>
                  <RowChevron />
                </div>
                <strong>{node.name}</strong>
                <small>{node.meta}</small>
                {node.status ? <Badge label={node.status} size="sm" tone={statusTone(node.status)} /> : null}
              </button>
            ))}
            {!visible.length ? <div className={styles.docEmpty}>This folder is empty.</div> : null}
          </div>
        ) : null}

        {view === "list" ? (
          <div className={styles.docList} aria-label="Folder contents">
            <div className={styles.docListHeading} aria-hidden="true">
              <span>Name</span>
              <span>Type</span>
              <span>Details</span>
              <span />
            </div>
            {visible.map((node) => (
              <button
                className={styles.docListRow}
                key={node.id}
                onClick={() => node.kind === "folder" ? openFolder(node) : onAction(`Open ${node.name}`)}
                type="button"
              >
                <span className={styles.docListName}>
                  <span className={styles.docCardIcon}>
                    <CatalogIcon iconName={node.kind === "folder" ? "folder" : "file-lines"} />
                  </span>
                  <strong>{node.name}</strong>
                </span>
                <span>{node.kind === "folder" ? "Folder" : "File"}</span>
                <span>{node.kind === "folder" ? `${node.children?.length ?? 0} items` : node.meta}</span>
                <RowChevron />
              </button>
            ))}
            {!visible.length ? <div className={styles.docEmpty}>This folder is empty.</div> : null}
          </div>
        ) : null}

        {view === "columns" ? (
          <div className={styles.docColumns} aria-label="Folder contents">
            {columnLevels.map((level, levelIndex) => (
              <div className={styles.docColumn} key={`${levelIndex}-${breadcrumb[levelIndex - 1]?.id ?? "root"}`}>
                <div className={styles.docColumnHeading}>
                  {levelIndex === 0 ? "Documents" : breadcrumb[levelIndex - 1]?.name}
                </div>
                {level.map((node) => {
                  const active = breadcrumb.some((item) => item.id === node.id);
                  return (
                    <button
                      className={styles.docColumnItem}
                      data-active={active ? "true" : undefined}
                      key={node.id}
                      onClick={() => node.kind === "folder" ? openFolder(node) : onAction(`Open ${node.name}`)}
                      type="button"
                    >
                      <span className={styles.docCardIcon}>
                        <CatalogIcon iconName={node.kind === "folder" ? "folder" : "file-lines"} />
                      </span>
                      <span>{node.name}</span>
                      {node.kind === "folder" ? <CatalogIcon iconName="chevron-right" /> : null}
                    </button>
                  );
                })}
                {!level.length ? <div className={styles.docColumnEmpty}>Empty folder</div> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Body({
  definition,
  query,
  selected,
  onQueryChange,
  onToggle,
  onAction,
}: {
  definition: Definition;
  query: string;
  selected: string[];
  onQueryChange: (value: string) => void;
  onToggle: (id: string) => void;
  onAction: (action: string) => void;
}): ReactNode {
  switch (definition.layout) {
    case "documents":
      return <DocumentsLayout tree={definition.documents ?? []} onAction={onAction} />;
    case "timeline":
      return <TimelineLayout rows={definition.rows} onAction={onAction} />;
    case "feed":
      return <FeedLayout rows={definition.rows} onAction={onAction} />;
    case "board":
      return <BoardLayout rows={definition.rows} onAction={onAction} />;
    case "catalogue":
      return <CatalogueLayout rows={definition.rows} onAction={onAction} />;
    case "settings":
      return <SettingsLayout rows={definition.rows} onAction={onAction} />;
    case "commerce":
    case "directory":
    default:
      return (
        <DirectoryLayout
          columns={definition.columns ?? ["Name", "Status", "Details"]}
          query={query}
          rows={definition.rows}
          selected={selected}
          title={definition.title}
          onQueryChange={onQueryChange}
          onToggle={onToggle}
          onAction={onAction}
        />
      );
  }
}

export type CrmWorkspaceLabProps = { variant: CrmWorkspaceLabVariant; onAction?: (action: string) => void };

export function CrmWorkspaceLab({ variant, onAction }: CrmWorkspaceLabProps) {
  const definition = definitions[variant];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const reportAction = (action: string) => {
    onAction?.(action);
  };

  return (
    <DashboardContentContainer
      className={styles.root}
      data-component={`lab-${variant}`}
      width="full"
    >
      <WorkspaceHeader
        action={definition.action}
        actionIcon={definition.actionIcon}
        description={definition.description}
        icon={definition.icon}
        title={definition.title}
        onAction={() => reportAction(definition.action)}
      />
      <Body
        definition={definition}
        query={query}
        selected={selected}
        onQueryChange={setQuery}
        onAction={reportAction}
        onToggle={(id) =>
          setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
        }
      />
    </DashboardContentContainer>
  );
}
