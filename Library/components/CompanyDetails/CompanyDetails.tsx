"use client";

import type { MoreActionsMenuItem } from "@/components/MoreActionsMenu";
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
  const data = resolveCompanyDetailsCompany(company, defaultCompany);
  const moreActions: MoreActionsMenuItem[] = [
    { callback: () => onAction?.("add-contact"), iconName: "user-plus", id: "add-contact", label: "Add contact" },
    { callback: () => onAction?.("log-activity"), iconName: "wave-square", id: "log-activity", label: "Log activity" },
    { callback: () => onAction?.("add-task"), iconName: "list-check", id: "add-task", label: "Add task" },
    { callback: () => onAction?.("schedule-meeting"), iconName: "calendar", id: "schedule-meeting", label: "Schedule meeting" },
    { callback: () => onAction?.("add-note"), iconName: "note-sticky", id: "add-note", label: "Add note" },
    { callback: () => onAction?.("export-company"), iconName: "download", id: "export-company", label: "Export company" },
  ];

  return (
    <section aria-label={`Company details for ${data.name}`} className={styles.root}>
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
