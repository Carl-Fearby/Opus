"use client";

import { ContactIdentityCard } from "./ContactIdentityCard";
import { ContactSummaryCard } from "./ContactSummaryCard";
import type { ContactDetailsAction, ContactDetailsContact } from "./types";
import type { MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import type { TabsVariant } from "@/components/fields/types";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./ContactCard.module.css";

export type ContactCardProps = {
  className?: string;
  contact: ContactDetailsContact;
  isStaffRecord?: boolean;
  moreActions?: MoreActionsMenuItem[];
  onAction?: (action: ContactDetailsAction) => void;
  onAvatarChange?: (previewUrl: string) => void;
  onPasswordReset?: () => void;
  ownerAvatarSrc?: string;
  showActions?: boolean;
  showStatus?: boolean;
  tabsVariant?: TabsVariant;
};

export function ContactCard({
  className,
  contact,
  isStaffRecord = false,
  moreActions,
  onAction,
  onAvatarChange,
  onPasswordReset,
  ownerAvatarSrc,
  showActions = true,
  showStatus = true,
  tabsVariant,
}: ContactCardProps) {
  const { t } = useOpusI18n();
  return (
    <div
      aria-label={t("contactDetails.cardAria", "{kind} card for {name}", {
        kind: isStaffRecord ? t("contactDetails.user", "User") : t("contactDetails.contact", "Contact"),
        name: contact.name,
      })}
      className={[styles.summaryLayout, className].filter(Boolean).join(" ")}
      data-staff-record={isStaffRecord ? "true" : "false"}
    >
      <ContactIdentityCard
        avatarSrc={contact.avatarSrc}
        companies={contact.companies}
        isStaffRecord={isStaffRecord}
        name={contact.name}
        onAvatarChange={(previewUrl) => {
          onAvatarChange?.(previewUrl);
          onAction?.("change-avatar");
        }}
        showStatus={showStatus}
        status={contact.status}
      />
      <ContactSummaryCard
        contact={contact}
        isStaffRecord={isStaffRecord}
        moreActions={moreActions}
        onPasswordReset={() => {
          onPasswordReset?.();
          onAction?.("reset-password");
        }}
        ownerAvatarSrc={ownerAvatarSrc}
        showActions={showActions}
        tabsVariant={tabsVariant}
      />
    </div>
  );
}
