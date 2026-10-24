"use client";

import { useOpusI18n } from "@/components/OpusI18n";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { DashboardContentContainer } from "@/components/DashboardContentContainer";
import { MoreActionsMenu, type MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import { Tabs } from "@/components/Tabs";
import type { TabsVariant } from "@/components/fields/types";
import type { CompanyBranch, CompanyDetailsCompany } from "./types";
import { getPrimaryBranch } from "./types";
import styles from "./CompanySummaryCard.module.css";

export type CompanySummaryTab = string;

export type CompanySummaryCardProps = {
  className?: string;
  company: CompanyDetailsCompany;
  defaultTab?: CompanySummaryTab;
  moreActions?: MoreActionsMenuItem[];
  ownerAvatarSrc?: string;
  showActions?: boolean;
  tabsVariant?: TabsVariant;
};

function DetailItem({ icon, label, value }: { icon: string; label: string; value: ReactNode }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailIcon}>
        <CatalogIcon iconName={icon} />
      </span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}

function DetailsColumn({ children, empty = false }: { children?: ReactNode; empty?: boolean }) {
  return (
    <div className={styles.detailsColumn} data-empty={empty ? "true" : undefined}>
      {children}
    </div>
  );
}

function DetailsGrid({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}) {
  return (
    <div className={styles.detailsGrid} data-columns={columns}>
      {children}
    </div>
  );
}

function BranchDetails({ branch }: { branch: CompanyBranch }) {
  const { t } = useOpusI18n();
  return (
    <DetailsGrid columns={3}>
      <DetailsColumn>
        <DetailItem
          icon="building"
          label={t("companyDetails.branch", "Branch")}
          value={
            <span className={styles.branchName}>
              {branch.label}
              {branch.primary ? <Badge label={t("companyDetails.primary", "Primary")} size="sm" tone="accent" /> : null}
            </span>
          }
        />
        <DetailItem icon="briefcase" label={t("companyDetails.type", "Type")} value={branch.type ?? "—"} />
        {branch.phone ? <DetailItem icon="phone" label={t("companyDetails.phone", "Phone")} value={branch.phone} /> : null}
      </DetailsColumn>
      <DetailsColumn>
        <DetailItem icon="house" label={t("companyDetails.addressLine1", "Address Line 1")} value={branch.addressLine1} />
        <DetailItem icon="house" label={t("companyDetails.addressLine2", "Address Line 2")} value={branch.addressLine2 ?? "—"} />
        <DetailItem icon="landmark" label={t("companyDetails.townCity", "Town / City")} value={branch.city} />
        <DetailItem icon="hashtag" label={t("companyDetails.postcode", "Postcode")} value={branch.postcode} />
        <DetailItem icon="globe" label={t("companyDetails.country", "Country")} value={branch.country} />
      </DetailsColumn>
      <DetailsColumn empty />
    </DetailsGrid>
  );
}

export function CompanySummaryCard({
  className,
  company,
  defaultTab = "basic",
  moreActions,
  ownerAvatarSrc = "/user-profile-carl.png",
  showActions = true,
  tabsVariant = "card",
}: CompanySummaryCardProps) {
  const { t } = useOpusI18n();
  const branchIds = useMemo(() => new Set(company.branches.map((branch) => branch.id)), [company.branches]);
  const initialTab =
    defaultTab === "basic" || branchIds.has(defaultTab)
      ? defaultTab
      : (getPrimaryBranch(company.branches)?.id ?? "basic");
  const [detailsTab, setDetailsTab] = useState<CompanySummaryTab>(initialTab);

  useEffect(() => {
    if (detailsTab !== "basic" && !branchIds.has(detailsTab)) {
      setDetailsTab(getPrimaryBranch(company.branches)?.id ?? "basic");
    }
  }, [branchIds, company.branches, detailsTab]);

  const tabItems = useMemo(() => {
    const overviewContent = (
      <DetailsGrid columns={3}>
        <DetailsColumn>
          <DetailItem icon="phone" label={t("companyDetails.phone", "Phone")} value={company.phone} />
          <DetailItem icon="envelope" label={t("companyDetails.email", "Email")} value={company.email} />
          <DetailItem icon="globe" label={t("companyDetails.website", "Website")} value={company.website} />
          <DetailItem icon="industry" label={t("companyDetails.industry", "Industry")} value={company.industry} />
          <DetailItem icon="users" label={t("companyDetails.employees", "Employees")} value={company.employees} />
        </DetailsColumn>
        <DetailsColumn>
          <DetailItem icon="building" label={t("companyDetails.accountType", "Account type")} value={company.type} />
          <DetailItem icon="chart-line" label={t("companyDetails.annualRevenue", "Annual revenue")} value={company.annualRevenue ?? "—"} />
          <DetailItem icon="share-nodes" label={t("companyDetails.source", "Source")} value={company.source} />
          <DetailItem
            icon="flag"
            label={t("companyDetails.status", "Status")}
            value={<Badge label={company.status} size="sm" tone="accent" />}
          />
          <DetailItem
            icon="tag"
            label={t("companyDetails.tags", "Tags")}
            value={
              <span className={styles.tags}>
                {company.tags.map((tag) => (
                  <Badge key={tag} label={tag} size="sm" tone="info" />
                ))}
              </span>
            }
          />
        </DetailsColumn>
        <DetailsColumn>
          <DetailItem
            icon="user"
            label={t("companyDetails.owner", "Owner")}
            value={
              <span className={styles.owner}>
                <Avatar name={company.owner} size="sm" src={ownerAvatarSrc} /> {company.owner}
              </span>
            }
          />
          <DetailItem icon="calendar-plus" label={t("companyDetails.dateCreated", "Date Created")} value={company.dateCreated} />
          <DetailItem icon="pen-to-square" label={t("companyDetails.dateLastEdited", "Date Last Edited")} value={company.dateLastEdited} />
          <DetailItem
            icon="location-dot"
            label={t("companyDetails.branches", "Branches")}
            value={
              company.branches.length === 1
                ? t("companyDetails.locationOne", "1 location")
                : t("companyDetails.locationMany", "{count} locations", { count: company.branches.length })
            }
          />
        </DetailsColumn>
      </DetailsGrid>
    );

    return [
      { content: overviewContent, label: t("companyDetails.overviewTab", "Overview"), value: "basic" },
      ...company.branches.map((branch) => ({
        content: <BranchDetails branch={branch} />,
        label: branch.label,
        value: branch.id,
      })),
    ];
  }, [company, ownerAvatarSrc, t]);

  return (
    <DashboardContentContainer
      className={[styles.detailsCard, className].filter(Boolean).join(" ")}
      data-component="company-details-summary"
      paddingBottom={false}
      paddingLeft={false}
      paddingRight={false}
      paddingTop={false}
      width="full"
    >
      <Tabs
        aria-label={t("companyDetails.detailSections", "Company detail sections")}
        className={styles.summaryTabs}
        items={tabItems}
        onValueChange={setDetailsTab}
        panelClassName={tabsVariant === "card" ? styles.summaryPanel : undefined}
        panelMode="active"
        trailing={
          showActions && moreActions?.length ? (
            <MoreActionsMenu items={moreActions} label={t("companyDetails.moreActions", "More company actions")} />
          ) : null
        }
        value={detailsTab}
        variant={tabsVariant}
      />
    </DashboardContentContainer>
  );
}
