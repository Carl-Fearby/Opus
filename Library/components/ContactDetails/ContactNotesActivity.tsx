"use client";

import { useState } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import {
  CompactDocuments,
  type CompactDocumentNode,
  type CompactDocumentView,
} from "@/components/CompactDocuments";
import { DashboardContentContainer } from "@/components/DashboardContentContainer";
import { NotesActivity, type NotesActivityItem } from "@/components/NotesActivity";
import { Tabs } from "@/components/Tabs";
import type { TabsVariant } from "@/components/fields/types";
import type { ContactDetailsAction } from "./types";
import { defaultContactNotes } from "./demoData";
import styles from "./ContactNotesActivity.module.css";

export type ContactNotesWorkspaceTab = "notes" | "activities" | "documents" | "additional";

export type ContactNotesActivityProps = {
  activeTab?: ContactNotesWorkspaceTab;
  className?: string;
  defaultTab?: ContactNotesWorkspaceTab;
  items?: NotesActivityItem[];
  onAction?: (action: ContactDetailsAction) => void;
  onAddNote?: (note: string) => void;
  onDocumentOpen?: (document: CompactDocumentNode) => void;
  onDocumentFolderOpen?: (folder: CompactDocumentNode) => void;
  onDocumentViewChange?: (view: CompactDocumentView) => void;
  onTabChange?: (tab: ContactNotesWorkspaceTab) => void;
  tabsVariant?: TabsVariant;
};

export function ContactNotesActivity({
  activeTab: controlledActiveTab,
  className,
  defaultTab = "notes",
  items = defaultContactNotes,
  onAction,
  onAddNote,
  onDocumentOpen,
  onDocumentFolderOpen,
  onDocumentViewChange,
  onTabChange,
  tabsVariant = "card",
}: ContactNotesActivityProps) {
  const [internalTab, setInternalTab] = useState<ContactNotesWorkspaceTab>(defaultTab);
  const workspaceTab = controlledActiveTab ?? internalTab;
  const [notesComposerOpen, setNotesComposerOpen] = useState(false);
  const [activityComposerOpen, setActivityComposerOpen] = useState(false);

  const handleWorkspaceTabChange = (value: string) => {
    const nextTab = value as ContactNotesWorkspaceTab;
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

  const documentsPanel = (
    <CompactDocuments
      className={styles.compactDocuments}
      defaultView="list"
      documents={[
        {
          id: "contact-contracts",
          kind: "folder",
          name: "Contracts",
          children: [
            { id: "contact-nda", kind: "file", name: "Mutual NDA.pdf", meta: "PDF · 420 KB", status: "Signed" },
            { id: "contact-msa", kind: "file", name: "Service agreement.pdf", meta: "PDF · 1.2 MB", status: "Current" },
          ],
        },
        {
          id: "contact-proposals",
          kind: "folder",
          name: "Proposals",
          children: [
            { id: "contact-proposal", kind: "file", name: "Enterprise proposal.pdf", meta: "PDF · 4.8 MB", status: "Approved" },
          ],
        },
        { id: "contact-profile", kind: "file", name: "Contact profile.pdf", meta: "PDF · 180 KB", status: "Current" },
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

  const additionalPanel = (
    <div className={styles.emptyPanel}>No additional details added yet.</div>
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
    ) : null;

  return (
    <DashboardContentContainer
      className={[
        isCardTabs ? styles.tabsCardCard : styles.tabsCardLine,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-component="contact-notes-activity"
      paddingBottom={!isCardTabs}
      paddingLeft={!isCardTabs}
      paddingRight={!isCardTabs}
      paddingTop={!isCardTabs}
      width="full"
    >
      <Tabs
        aria-label="Contact notes and activity"
        className={styles.workspaceTabs}
        items={[
          { label: "Notes", value: "notes", content: notesPanel },
          { label: "Activities", value: "activities", content: activityPanel },
          { label: "Documents", value: "documents", content: documentsPanel },
          { label: "Other Details", value: "additional", content: additionalPanel },
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
