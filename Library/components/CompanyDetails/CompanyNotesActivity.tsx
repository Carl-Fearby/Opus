"use client";

import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { Text } from "@/components/Text";
import {
  CompactDocuments,
  type CompactDocumentNode,
  type CompactDocumentView,
} from "@/components/CompactDocuments";
import { DashboardContentContainer } from "@/components/DashboardContentContainer";
import { NotesActivity, type NotesActivityItem } from "@/components/NotesActivity";
import { Tabs } from "@/components/Tabs";
import type { TabsVariant } from "@/components/fields/types";
import { defaultCompanyContacts, defaultCompanyNotes } from "./demoData";
import type { CompanyContactPerson, CompanyDetailsAction } from "./types";
import styles from "./CompanyNotesActivity.module.css";

export type CompanyNotesWorkspaceTab = "notes" | "activities" | "contacts" | "documents";

export type CompanyNotesActivityProps = {
  activeTab?: CompanyNotesWorkspaceTab;
  className?: string;
  contacts?: CompanyContactPerson[];
  defaultTab?: CompanyNotesWorkspaceTab;
  items?: NotesActivityItem[];
  onAction?: (action: CompanyDetailsAction) => void;
  onAddNote?: (note: string) => void;
  onDocumentOpen?: (document: CompactDocumentNode) => void;
  onDocumentFolderOpen?: (folder: CompactDocumentNode) => void;
  onDocumentViewChange?: (view: CompactDocumentView) => void;
  onTabChange?: (tab: CompanyNotesWorkspaceTab) => void;
  tabsVariant?: TabsVariant;
};

export function CompanyNotesActivity({
  activeTab: controlledActiveTab,
  className,
  contacts = defaultCompanyContacts,
  defaultTab = "notes",
  items = defaultCompanyNotes,
  onAction,
  onAddNote,
  onDocumentOpen,
  onDocumentFolderOpen,
  onDocumentViewChange,
  onTabChange,
  tabsVariant = "card",
}: CompanyNotesActivityProps) {
  const [internalTab, setInternalTab] = useState<CompanyNotesWorkspaceTab>(defaultTab);
  const workspaceTab = controlledActiveTab ?? internalTab;
  const [notesComposerOpen, setNotesComposerOpen] = useState(false);
  const [activityComposerOpen, setActivityComposerOpen] = useState(false);

  const handleWorkspaceTabChange = (value: string) => {
    const nextTab = value as CompanyNotesWorkspaceTab;
    if (controlledActiveTab === undefined) {
      setInternalTab(nextTab);
    }
    setNotesComposerOpen(false);
    setActivityComposerOpen(false);
    onTabChange?.(nextTab);
  };

  const isCardTabs = tabsVariant === "card";

  const notesPanel = (
    <NotesActivity
      className={styles.notesActivity}
      composerOpen={notesComposerOpen}
      defaultTab="notes"
      items={items}
      onComposerOpenChange={setNotesComposerOpen}
      onNoteSave={(note) => onAddNote?.(note)}
      showComposerTrigger={false}
      showFooter={false}
      showTabs={false}
    />
  );

  const activityPanel = (
    <NotesActivity
      activeTab="activity"
      className={styles.notesActivity}
      composerOpen={activityComposerOpen}
      composerPlaceholder="Add an activity..."
      items={items}
      onComposerOpenChange={setActivityComposerOpen}
      showComposerTrigger={false}
      showFooter={false}
      showTabs={false}
    />
  );

  const contactsPanel =
    contacts.length === 0 ? (
      <div className={styles.emptyPanel}>No company contacts added yet.</div>
    ) : (
      <ul aria-label="Company contacts" className={styles.contactsList}>
        {contacts.map((person) => (
          <li key={person.id} className={styles.contactRow}>
            <Avatar name={person.name} size="md" src={person.avatarSrc} />
            <div className={styles.contactCopy}>
              <div className={styles.contactHeadline}>
                <strong>{person.name}</strong>
                {person.primary ? <Badge label="Primary" size="sm" tone="accent" /> : null}
                {person.role ? <Badge label={person.role} size="sm" tone="info" /> : null}
              </div>
              {person.jobTitle ? <Text size={200}>{person.jobTitle}</Text> : null}
              <div className={styles.contactMeta}>
                {person.email ? <span>{person.email}</span> : null}
                {person.phone ? <span>{person.phone}</span> : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );

  const documentsPanel = (
    <CompactDocuments
      className={styles.compactDocuments}
      defaultView="list"
      documents={[
        {
          id: "company-contracts",
          kind: "folder",
          name: "Contracts",
          children: [
            { id: "company-msa", kind: "file", name: "Master services agreement.pdf", meta: "PDF · 1.2 MB", status: "Signed" },
            { id: "company-dpa", kind: "file", name: "Data processing agreement.pdf", meta: "PDF · 640 KB", status: "Current" },
          ],
        },
        {
          id: "company-proposals",
          kind: "folder",
          name: "Proposals",
          children: [
            { id: "company-proposal", kind: "file", name: "Enterprise proposal.pdf", meta: "PDF · 4.8 MB", status: "Approved" },
            { id: "company-terms", kind: "file", name: "Commercial terms.docx", meta: "Word · 820 KB", status: "Review" },
          ],
        },
        { id: "company-registration", kind: "file", name: "Company registration.pdf", meta: "PDF · 310 KB", status: "Current" },
      ]}
      onFileOpen={(document) => {
        onDocumentOpen?.(document);
        onAction?.("open-document");
      }}
      onFolderOpen={(folder) => {
        onDocumentFolderOpen?.(folder);
        onAction?.("open-document-folder");
      }}
      onViewChange={onDocumentViewChange}
    />
  );

  const workspaceTrailing =
    workspaceTab === "notes" ? (
      <button
        className={styles.workspaceAction}
        onClick={() => {
          setNotesComposerOpen(true);
          onAction?.("add-note");
        }}
        type="button"
      >
        <CatalogIcon iconName="plus" />
        Add Note
      </button>
    ) : workspaceTab === "activities" ? (
      <button
        className={styles.workspaceAction}
        onClick={() => {
          setActivityComposerOpen(true);
          onAction?.("log-activity");
        }}
        type="button"
      >
        <CatalogIcon iconName="plus" />
        Add Activity
      </button>
    ) : workspaceTab === "contacts" ? (
      <button
        className={styles.workspaceAction}
        onClick={() => onAction?.("add-contact")}
        type="button"
      >
        <CatalogIcon iconName="plus" />
        Add Contact
      </button>
    ) : null;

  return (
    <DashboardContentContainer
      className={[isCardTabs ? styles.tabsCardCard : styles.tabsCardLine, className]
        .filter(Boolean)
        .join(" ")}
      data-component="company-notes-activity"
      paddingBottom={!isCardTabs}
      paddingLeft={!isCardTabs}
      paddingRight={!isCardTabs}
      paddingTop={!isCardTabs}
      width="full"
    >
      <Tabs
        aria-label="Company notes and contacts"
        className={styles.workspaceTabs}
        items={[
          { label: "Notes", value: "notes", content: notesPanel },
          { label: "Activities", value: "activities", content: activityPanel },
          { label: "Company Contacts", value: "contacts", content: contactsPanel },
          { label: "Documents", value: "documents", content: documentsPanel },
        ]}
        onValueChange={handleWorkspaceTabChange}
        panelClassName={isCardTabs ? styles.cardNotesPanel : styles.scrollPanel}
        panelContentClassName={isCardTabs ? styles.cardNotesPanelContent : undefined}
        panelMode={isCardTabs ? "crossfade" : undefined}
        trailing={workspaceTrailing}
        value={workspaceTab}
        variant={tabsVariant}
      />
    </DashboardContentContainer>
  );
}
