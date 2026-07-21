"use client";

import { useState } from "react";
import { CatalogIcon } from "opus-react";
import { DashboardContentContainer } from "opus-react";
import { NotesActivity, type NotesActivityItem } from "@/components/NotesActivity";
import { Tabs } from "@/components/Tabs";
import type { TabsVariant } from "opus-react";
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
    <div className={styles.emptyPanel}>No documents added yet.</div>
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
