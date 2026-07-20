"use client";

import { useState } from "react";
import { CatalogIcon } from "opus-react";
import { DashboardContentContainer } from "opus-react";
import { NotesActivity, type NotesActivityItem } from "opus-react";
import { Tabs } from "opus-react";
import type { ContactDetailsAction } from "./types";
import { defaultContactNotes } from "./demoData";
import styles from "./ContactNotesActivity.module.css";

export type ContactNotesActivityProps = {
  className?: string;
  items?: NotesActivityItem[];
  onAction?: (action: ContactDetailsAction) => void;
  onAddNote?: (note: string) => void;
};

export function ContactNotesActivity({
  className,
  items = defaultContactNotes,
  onAction,
  onAddNote,
}: ContactNotesActivityProps) {
  const [workspaceTab, setWorkspaceTab] = useState("notes");
  const [notesComposerOpen, setNotesComposerOpen] = useState(false);
  const [activityComposerOpen, setActivityComposerOpen] = useState(false);

  const handleWorkspaceTabChange = (value: string) => {
    setWorkspaceTab(value);
    setNotesComposerOpen(false);
    setActivityComposerOpen(false);
  };

  const notesPanel = (
    <NotesActivity
      className={styles.notesActivity}
      composerOpen={notesComposerOpen}
      defaultTab="notes"
      items={items}
      notesFooterLabel="View all notes"
      onComposerOpenChange={setNotesComposerOpen}
      onNoteSave={(note) => onAddNote?.(note)}
      showComposerTrigger={false}
      showTabs={false}
    />
  );

  const activityPanel = (
    <NotesActivity
      activeTab="activity"
      activityFooterLabel="View all activities"
      className={styles.notesActivity}
      composerOpen={activityComposerOpen}
      composerPlaceholder="Add an activity..."
      items={items}
      onComposerOpenChange={setActivityComposerOpen}
      showComposerTrigger={false}
      showTabs={false}
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
    ) : null;

  return (
    <DashboardContentContainer
      className={[styles.tabsCard, className].filter(Boolean).join(" ")}
      data-component="contact-notes-activity"
      width="full"
    >
      <Tabs
        aria-label="Contact notes and activity"
        items={[
          { label: "Notes", value: "notes", content: notesPanel },
          { label: "Activities", value: "activities", content: activityPanel },
          { label: "Documents", value: "documents", content: <div className={styles.emptyPanel}>No documents added yet.</div> },
          { label: "Other Details", value: "additional", content: <div className={styles.emptyPanel}>No additional details added yet.</div> },
        ]}
        onValueChange={handleWorkspaceTabChange}
        trailing={workspaceTrailing}
        value={workspaceTab}
      />
    </DashboardContentContainer>
  );
}
