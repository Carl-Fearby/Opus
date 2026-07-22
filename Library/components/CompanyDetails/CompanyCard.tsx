"use client";

import { CompanyIdentityCard } from "./CompanyIdentityCard";
import { CompanySummaryCard } from "./CompanySummaryCard";
import type { CompanyDetailsAction, CompanyDetailsCompany } from "./types";
import type { MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import type { TabsVariant } from "@/components/fields/types";
import styles from "./CompanyCard.module.css";

export type CompanyCardProps = {
  className?: string;
  company: CompanyDetailsCompany;
  moreActions?: MoreActionsMenuItem[];
  onAction?: (action: CompanyDetailsAction) => void;
  onLogoChange?: (previewUrl: string) => void;
  ownerAvatarSrc?: string;
  showActions?: boolean;
  showStatus?: boolean;
  tabsVariant?: TabsVariant;
};

export function CompanyCard({
  className,
  company,
  moreActions,
  onAction,
  onLogoChange,
  ownerAvatarSrc,
  showActions = true,
  showStatus = true,
  tabsVariant,
}: CompanyCardProps) {
  return (
    <div
      aria-label={`Company card for ${company.name}`}
      className={[styles.summaryLayout, className].filter(Boolean).join(" ")}
    >
      <CompanyIdentityCard
        employees={company.employees}
        industry={company.industry}
        logoSrc={company.logoSrc}
        name={company.name}
        onLogoChange={(previewUrl) => {
          onLogoChange?.(previewUrl);
          onAction?.("edit");
        }}
        showStatus={showStatus}
        status={company.status}
        type={company.type}
      />
      <CompanySummaryCard
        company={company}
        moreActions={moreActions}
        ownerAvatarSrc={ownerAvatarSrc}
        showActions={showActions}
        tabsVariant={tabsVariant}
      />
    </div>
  );
}
