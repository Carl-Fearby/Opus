"use client";

import { useState } from "react";
import {
  AsyncMultiSelectField,
  BottomSheet,
  Button,
  CodeEditor,
  ConfirmDialog,
  ErrorState,
  Markdown,
  OverflowToolbar,
  TreeTable,
  type AsyncMultiSelectOption,
  type TreeTableColumn,
  type TreeTableNode,
} from "opus-react";
import styles from "./ExtensionPreviews.module.css";

const markdownSample = `# Release notes

Opus **0.8** adds a set of new building blocks for larger applications.

> All new components inherit the active theme, radius, transparency, and appearance defaults.

## What's new

- Confirm dialogs with destructive and async states
- Bottom sheets with swipe-to-dismiss
- Hierarchical tree tables

| Component | Category | Status |
| --- | --- | --- |
| Confirm dialog | Overlays | Ready |
| Tree table | Content | Ready |
| Markdown | Content | Ready |

\`\`\`tsx
<ConfirmDialog
  open={open}
  title="Delete workspace?"
  description="This cannot be undone."
  tone="danger"
  onConfirm={remove}
  onClose={() => setOpen(false)}
/>
\`\`\`

Read the [component guide](https://project-opus.netlify.app/documentation/components) for usage details.
`;

const codeSample = `type Customer = {
  id: string;
  name: string;
  plan: "starter" | "team" | "enterprise";
};

export function activeCustomers(customers: Customer[]) {
  return customers.filter((customer) => customer.plan !== "starter");
}
`;

const treeNodes: TreeTableNode[] = [
  {
    id: "documents",
    label: "Documents",
    children: [
      { id: "contracts", label: "Contracts", children: [{ id: "msa", label: "Master agreement.pdf" }, { id: "nda", label: "NDA.pdf" }] },
      { id: "invoices", label: "Invoices", children: [{ id: "invoice-1042", label: "Invoice 1042.pdf" }] },
    ],
  },
  {
    id: "assets",
    label: "Assets",
    children: [{ id: "brand", label: "Brand guidelines.pdf" }],
  },
  { id: "archive", label: "Archive" },
];

const treeColumns: TreeTableColumn[] = [
  { id: "name", header: "Name", render: (node) => node.label },
  { id: "owner", header: "Owner", width: "140px", render: () => "Emma Davis" },
  { id: "updated", header: "Updated", width: "120px", align: "right", render: () => "2h ago" },
];

const people: AsyncMultiSelectOption[] = [
  { label: "Emma Davis", value: "emma", description: "Procurement" },
  { label: "Michael Brown", value: "michael", description: "Sales" },
  { label: "Olivia Wilson", value: "olivia", description: "Operations" },
  { label: "Noah Patel", value: "noah", description: "Finance" },
];

export function MarkdownPreview() {
  return <Markdown>{markdownSample}</Markdown>;
}

export function CodeEditorPreview() {
  const [code, setCode] = useState(codeSample);
  return <CodeEditor ariaLabel="Customer example" height={300} value={code} onChange={setCode} />;
}

export function TreeTablePreview() {
  return (
    <TreeTable
      ariaLabel="Document library"
      columns={treeColumns}
      defaultExpandedIds={["documents", "contracts"]}
      nodes={treeNodes}
    />
  );
}

export function ErrorStatePreview() {
  return (
    <ErrorState
      actions={
        <>
          <Button variant="secondary">Contact support</Button>
          <Button>Retry</Button>
        </>
      }
      description="The dashboard could not load its latest data. Your saved views are unaffected."
      status="error"
      title="We couldn't load this workspace"
    />
  );
}

export function ConfirmDialogPreview() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.stack}>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete workspace
      </Button>
      <ConfirmDialog
        description="This permanently removes the workspace, its members, and all saved views."
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setLoading(true);
          window.setTimeout(() => {
            setLoading(false);
            setOpen(false);
          }, 900);
        }}
        open={open}
        title="Delete workspace?"
        tone="danger"
      />
    </div>
  );
}

export function BottomSheetPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.stack}>
      <Button onClick={() => setOpen(true)}>Open filters</Button>
      <BottomSheet
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpen(false)}>Apply filters</Button>
          </>
        }
        description="Choose which records are included in this view."
        onClose={() => setOpen(false)}
        open={open}
        title="Filter results"
      >
        <div className={styles.sheetBody}>
          <p>Bottom sheets are designed for thumb reach on mobile and collapse to a comfortable width on desktop.</p>
          <p>Drag the handle down to dismiss, or use the close button.</p>
        </div>
      </BottomSheet>
    </div>
  );
}

export function OverflowToolbarPreview() {
  return (
    <div className={styles.toolbarFrame}>
      <OverflowToolbar label="Document actions">
        <Button size="sm" variant="secondary">Share</Button>
        <Button size="sm" variant="secondary">Export</Button>
        <Button size="sm" variant="secondary">Duplicate</Button>
        <Button size="sm" variant="secondary">Move</Button>
        <Button size="sm" variant="secondary">Archive</Button>
        <Button size="sm">Publish</Button>
      </OverflowToolbar>
    </div>
  );
}

export function AsyncMultiSelectPreview() {
  const [value, setValue] = useState<AsyncMultiSelectOption[]>([people[0]!]);
  return (
    <AsyncMultiSelectField
      defaultOptions={people}
      id="preview-reviewers"
      label="Reviewers"
      loadOptions={async (query) =>
        people.filter((person) => person.label.toLowerCase().includes(query.toLowerCase()))
      }
      onChange={setValue}
      value={value}
    />
  );
}
