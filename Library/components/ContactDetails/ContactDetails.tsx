"use client";

import type { MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import { useOpusI18n } from "@/components/OpusI18n";
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
  const { t } = useOpusI18n();
  const data = resolveContactDetailsContact(contact, defaultContact);
  const moreActions: MoreActionsMenuItem[] = [
    { callback: () => onAction?.("log-activity"), iconName: "wave-square", id: "log-activity", label: t("contactDetails.logActivity", "Log activity") },
    { callback: () => onAction?.("add-task"), iconName: "list-check", id: "add-task", label: t("contactDetails.addTask", "Add task") },
    { callback: () => onAction?.("schedule-meeting"), iconName: "calendar", id: "schedule-meeting", label: t("contactDetails.scheduleMeeting", "Schedule meeting") },
    { callback: () => onAction?.("add-note"), iconName: "note-sticky", id: "add-note", label: t("contactDetails.addNote", "Add note") },
    { callback: () => onAction?.("export-contact"), iconName: "download", id: "export-contact", label: t("contactDetails.exportContact", "Export contact") },
  ];

  return (
    <section
      aria-label={t("contactDetails.sectionAria", "{kind} details for {name}", {
        kind: isStaffRecord ? t("contactDetails.user", "User") : t("contactDetails.contact", "Contact"),
        name: data.name,
      })}
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
