"use client";

import type { MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import { useOpusI18n } from "@/components/OpusI18n";
import { CompanyCard } from "./CompanyCard";
import { defaultCompany } from "./demoData";
import type { CompanyDetailsProps } from "./types";
import { resolveCompanyDetailsCompany } from "./types";
import styles from "./CompanyDetails.module.css";

export type { CompanyDetailsAction, CompanyDetailsCompany, CompanyDetailsProps } from "./types";
export { resolveCompanyDetailsCompany } from "./types";

export function CompanyDetails({
  company,
  onAction,
  showActions = true,
  showStatus = true,
  tabsVariant,
}: CompanyDetailsProps) {
  const { t } = useOpusI18n();
  const data = resolveCompanyDetailsCompany(company, defaultCompany);
  const moreActions: MoreActionsMenuItem[] = [
    { callback: () => onAction?.("add-contact"), iconName: "user-plus", id: "add-contact", label: t("companyDetails.addContact", "Add contact") },
    { callback: () => onAction?.("log-activity"), iconName: "wave-square", id: "log-activity", label: t("companyDetails.logActivity", "Log activity") },
    { callback: () => onAction?.("add-task"), iconName: "list-check", id: "add-task", label: t("companyDetails.addTask", "Add task") },
    { callback: () => onAction?.("schedule-meeting"), iconName: "calendar", id: "schedule-meeting", label: t("companyDetails.scheduleMeeting", "Schedule meeting") },
    { callback: () => onAction?.("add-note"), iconName: "note-sticky", id: "add-note", label: t("companyDetails.addNote", "Add note") },
    { callback: () => onAction?.("export-company"), iconName: "download", id: "export-company", label: t("companyDetails.exportCompany", "Export company") },
  ];

  return (
    <section aria-label={t("companyDetails.sectionAria", "Company details for {name}", { name: data.name })} className={styles.root}>
      <CompanyCard
        company={data}
        moreActions={moreActions}
        onAction={onAction}
        onLogoChange={() => onAction?.("edit")}
        showActions={showActions}
        showStatus={showStatus}
        tabsVariant={tabsVariant}
      />
    </section>
  );
}
