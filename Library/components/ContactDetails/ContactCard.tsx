"use client";

import { ContactIdentityCard } from "./ContactIdentityCard";
import { ContactSummaryCard } from "./ContactSummaryCard";
import type { ContactDetailsAction, ContactDetailsContact } from "./types";
import type { MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import styles from "./ContactCard.module.css";

export type ContactCardProps = {
  className?: string;
  contact: ContactDetailsContact;
  isStaffRecord?: boolean;
  moreActions?: MoreActionsMenuItem[];
  onAction?: (action: ContactDetailsAction) => void;
  onPasswordReset?: () => void;
  ownerAvatarSrc?: string;
  showActions?: boolean;
  showStatus?: boolean;
};

export function ContactCard({
  className,
  contact,
  isStaffRecord = false,
  moreActions,
  onAction,
  onPasswordReset,
  ownerAvatarSrc,
  showActions = true,
  showStatus = true,
}: ContactCardProps) {
  return (
    <div
      aria-label={`${isStaffRecord ? "User" : "Contact"} card for ${contact.name}`}
      className={[styles.summaryLayout, className].filter(Boolean).join(" ")}
      data-staff-record={isStaffRecord ? "true" : "false"}
    >
      <ContactIdentityCard
        avatarSrc={contact.avatarSrc}
        companies={contact.companies}
        isStaffRecord={isStaffRecord}
        name={contact.name}
        onEdit={() => onAction?.("edit")}
        showStatus={showStatus}
        status={contact.status}
      />
      <ContactSummaryCard
        contact={contact}
        isStaffRecord={isStaffRecord}
        moreActions={moreActions}
        onAction={onAction}
        onPasswordReset={() => {
          onPasswordReset?.();
          onAction?.("reset-password");
        }}
        ownerAvatarSrc={ownerAvatarSrc}
        showActions={showActions}
      />
    </div>
  );
}
