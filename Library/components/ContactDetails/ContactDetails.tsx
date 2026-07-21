"use client";

import type { MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import { ContactCard } from "./ContactCard";
import { defaultContact } from "./demoData";
import type { ContactDetailsProps } from "./types";
import { resolveContactDetailsContact } from "./types";
import styles from "./ContactDetails.module.css";

export type { ContactCompany, ContactDetailsAction, ContactDetailsContact, ContactDetailsProps } from "./types";
export { getPrimaryCompany, resolveContactDetailsContact } from "./types";

export function ContactDetails({
  contact,
  isStaffRecord = false,
  onAction,
  onAvatarChange,
  onPasswordReset,
  showActions = true,
  showStatus = true,
  tabsVariant,
}: ContactDetailsProps) {
  const data = resolveContactDetailsContact(contact, defaultContact);
  const moreActions: MoreActionsMenuItem[] = [
    { callback: () => onAction?.("log-activity"), iconName: "wave-square", id: "log-activity", label: "Log activity" },
    { callback: () => onAction?.("add-task"), iconName: "list-check", id: "add-task", label: "Add task" },
    { callback: () => onAction?.("schedule-meeting"), iconName: "calendar", id: "schedule-meeting", label: "Schedule meeting" },
    { callback: () => onAction?.("add-note"), iconName: "note-sticky", id: "add-note", label: "Add note" },
    { callback: () => onAction?.("export-contact"), iconName: "download", id: "export-contact", label: "Export contact" },
  ];

  return (
    <section
      aria-label={`${isStaffRecord ? "User" : "Contact"} details for ${data.name}`}
      className={styles.root}
      data-staff-record={isStaffRecord ? "true" : "false"}
    >
      <ContactCard
        contact={data}
        isStaffRecord={isStaffRecord}
        moreActions={moreActions}
        onAction={onAction}
        onAvatarChange={onAvatarChange}
        onPasswordReset={onPasswordReset}
        showActions={showActions}
        showStatus={showStatus}
        tabsVariant={tabsVariant}
      />
    </section>
  );
}
