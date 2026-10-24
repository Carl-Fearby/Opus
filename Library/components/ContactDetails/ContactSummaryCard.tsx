"use client";

import { useOpusI18n } from "@/components/OpusI18n";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { DashboardContentContainer } from "@/components/DashboardContentContainer";
import { TextField } from "@/components/fields/TextField";
import { MoreActionsMenu, type MoreActionsMenuItem } from "@/components/MoreActionsMenu";
import { Tabs } from "@/components/Tabs";
import type { TabsVariant } from "@/components/fields/types";
import type { ContactDetailsContact } from "./types";
import { getPrimaryCompany } from "./types";
import styles from "./ContactSummaryCard.module.css";

export type ContactSummaryTab = "basic" | "other" | "security";

export type ContactSummaryCardProps = {
  className?: string;
  contact: ContactDetailsContact;
  defaultTab?: ContactSummaryTab;
  isStaffRecord?: boolean;
  moreActions?: MoreActionsMenuItem[];
  onPasswordReset?: () => void;
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

function SecurityField({
  icon,
  id,
  label,
  onChange,
  value,
}: {
  icon: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailIcon}>
        <CatalogIcon iconName={icon} />
      </span>
      <span className={styles.securityField}>
        <small>{label}</small>
        <TextField
          id={id}
          label={label}
          labelVisuallyHidden
          mode="stacked"
          onChange={(event) => onChange(event.target.value)}
          size="md"
          type="password"
          value={value}
        />
      </span>
    </div>
  );
}

function DetailsColumn({ children }: { children: ReactNode }) {
  return <div className={styles.detailsColumn}>{children}</div>;
}

const tabLabels: Record<ContactSummaryTab, string> = {
  basic: "Overview",
  other: "Personal",
  security: "Security",
};

export function ContactSummaryCard({
  className,
  contact,
  defaultTab = "basic",
  isStaffRecord = false,
  moreActions,
  onPasswordReset,
  ownerAvatarSrc = "/user-profile-carl.png",
  showActions = true,
  tabsVariant = "card",
}: ContactSummaryCardProps) {
  const { t } = useOpusI18n();
  const availableTabs: ContactSummaryTab[] = isStaffRecord
    ? ["basic", "other", "security"]
    : ["basic", "other"];
  const initialTab = availableTabs.includes(defaultTab) ? defaultTab : "basic";
  const [detailsTab, setDetailsTab] = useState<ContactSummaryTab>(initialTab);
  const [password, setPassword] = useState(contact.password ?? "");
  const [confirmPassword, setConfirmPassword] = useState(contact.password ?? "");
  const primaryCompany = getPrimaryCompany(contact.companies);
  const additionalCompanies = contact.companies.filter((company) => company !== primaryCompany);

  useEffect(() => {
    if (!isStaffRecord && detailsTab === "security") {
      setDetailsTab("basic");
    }
  }, [detailsTab, isStaffRecord]);

  const tabItems = useMemo(() => {
    const overviewContent = (
      <div className={styles.detailsGrid}>
        <DetailsColumn>
          <DetailItem icon="phone" label={t("contactDetails.phone", "Phone")} value={contact.phone} />
          <DetailItem icon="mobile-screen" label={t("contactDetails.mobile", "Mobile")} value={contact.mobile} />
          <DetailItem icon="envelope" label={t("contactDetails.email", "Email")} value={contact.email} />
          <DetailItem icon="globe" label={t("contactDetails.website", "Website")} value={primaryCompany?.website ?? "—"} />
          <DetailItem
            icon="building"
            label={contact.companies.length > 1 ? "Companies" : "Company"}
            value={
              <span className={styles.companies}>
                {contact.companies.map((company) => (
                  <Badge
                    key={company.name}
                    label={company.primary ? `${company.name} · Primary` : company.name}
                    size="sm"
                    tone={company.primary ? "accent" : "info"}
                  />
                ))}
              </span>
            }
          />
        </DetailsColumn>
        <DetailsColumn>
          <DetailItem icon="user" label={t("contactDetails.jobTitle", "Job Title")} value={primaryCompany?.jobTitle ?? "—"} />
          <DetailItem icon="building" label={t("contactDetails.department", "Department")} value={primaryCompany?.department ?? "—"} />
          <DetailItem icon="user-group" label={t("contactDetails.role", "Role")} value={contact.role} />
          <DetailItem icon="industry" label={t("contactDetails.industry", "Industry")} value={primaryCompany?.industry ?? "—"} />
          <DetailItem icon="users" label={t("contactDetails.employees", "Employees")} value={primaryCompany?.employees ?? "—"} />
        </DetailsColumn>
        <DetailsColumn>
          <DetailItem
            icon="user"
            label={t("contactDetails.owner", "Owner")}
            value={
              <span className={styles.owner}>
                <Avatar name={contact.owner} size="sm" src={ownerAvatarSrc} /> {contact.owner}
              </span>
            }
          />
          <DetailItem icon="share-nodes" label={t("contactDetails.source", "Source")} value={contact.source} />
          <DetailItem icon="flag" label={t("contactDetails.leadStatus", "Lead Status")} value={<Badge label={contact.leadStatus} tone="accent" />} />
          <DetailItem icon="clock" label={t("contactDetails.lastContact", "Last Contact")} value={contact.lastContact} />
          <DetailItem
            icon="tag"
            label={t("contactDetails.tags", "Tags")}
            value={
              <span className={styles.tags}>
                {contact.tags.map((tag) => (
                  <Badge key={tag} label={tag} size="sm" tone="info" />
                ))}
              </span>
            }
          />
        </DetailsColumn>
      </div>
    );

    const personalContent = (
      <div className={styles.detailsGrid}>
        <DetailsColumn>
          <DetailItem icon="house" label={t("contactDetails.addressLine1", "Address Line 1")} value="24 Willow Crescent" />
          <DetailItem icon="house" label={t("contactDetails.addressLine2", "Address Line 2")} value="Earlsdon" />
          <DetailItem icon="landmark" label={t("contactDetails.townCity", "Town / City")} value="Coventry" />
          <DetailItem icon="map" label={t("contactDetails.county", "County")} value="West Midlands" />
          <DetailItem icon="hashtag" label={t("contactDetails.postcode", "Postcode")} value="CV5 6NR" />
          <DetailItem icon="globe" label={t("contactDetails.country", "Country")} value="United Kingdom" />
        </DetailsColumn>
        <DetailsColumn>
          <DetailItem icon="envelope" label={t("contactDetails.personalEmail", "Personal Email")} value="emma.davis@gmail.com" />
          <DetailItem icon="envelope" label={t("contactDetails.workEmail", "Work Email")} value="emma.davis@acme.com" />
          <DetailItem icon="mobile-screen" label={t("contactDetails.personalMobile", "Personal Mobile")} value="+44 7700 900123" />
          <DetailItem icon="mobile-screen" label={t("contactDetails.workMobile", "Work Mobile")} value="+44 7700 555321" />
          <DetailItem icon="comment-dots" label={t("contactDetails.preferredContactMethod", "Preferred Contact Method")} value="Email" />
        </DetailsColumn>
        <DetailsColumn>
          <DetailItem
            icon="circle-check"
            label={t("contactDetails.activeStatus", "Active Status")}
            value={<strong className={styles.statusValue}>{contact.status}</strong>}
          />
          <DetailItem icon="calendar-plus" label={t("contactDetails.dateCreated", "Date Created")} value={contact.dateCreated} />
          <DetailItem icon="pen-to-square" label={t("contactDetails.dateLastEdited", "Date Last Edited")} value={contact.dateLastEdited} />
          <DetailItem icon="calendar-days" label={t("contactDetails.dateOfBirth", "Date of Birth")} value="14 Feb 1988" />
          <DetailItem icon="language" label={t("contactDetails.preferredLanguage", "Preferred Language")} value="English" />
          <DetailItem icon="clock" label={t("contactDetails.timeZone", "Time Zone")} value="GMT / London" />
          {additionalCompanies.map((company) => (
            <DetailItem
              key={company.name}
              icon="building"
              label={t("contactDetails.additionalCompany", "Additional Company")}
              value={
                <span className={styles.companyEmployment}>
                  <strong>{company.name}</strong>
                  {company.jobTitle ? <small>{company.jobTitle}</small> : null}
                </span>
              }
            />
          ))}
        </DetailsColumn>
      </div>
    );

    const securityContent = (
      <div className={styles.detailsGrid}>
        <DetailsColumn>
          <SecurityField
            icon="lock"
            id="contact-staff-password"
            label={t("contactDetails.password", "Password")}
            onChange={setPassword}
            value={password}
          />
          <SecurityField
            icon="lock"
            id="contact-staff-confirm-password"
            label={t("contactDetails.confirmPassword", "Confirm password")}
            onChange={setConfirmPassword}
            value={confirmPassword}
          />
          <DetailItem
            icon="key"
            label={t("contactDetails.passwordReset", "Password reset")}
            value={
              <button className={styles.securityAction} onClick={onPasswordReset} type="button">
                {t("contactDetails.resetPassword", "Reset password")}
              </button>
            }
          />
        </DetailsColumn>
      </div>
    );

    const items: Array<{ content: ReactNode; label: string; value: ContactSummaryTab }> = [
      { content: overviewContent, label: tabLabels.basic, value: "basic" },
      { content: personalContent, label: tabLabels.other, value: "other" },
    ];

    if (isStaffRecord) {
      items.push({ content: securityContent, label: tabLabels.security, value: "security" });
    }

    return items;
  }, [
    additionalCompanies,
    confirmPassword,
    contact,
    isStaffRecord,
    onPasswordReset,
    ownerAvatarSrc,
    password,
    primaryCompany,
    t,
  ]);

  return (
    <DashboardContentContainer
      className={[styles.detailsCard, className].filter(Boolean).join(" ")}
      data-component="contact-details-summary"
      data-staff-record={isStaffRecord ? "true" : "false"}
      paddingBottom={false}
      paddingLeft={false}
      paddingRight={false}
      paddingTop={false}
      width="full"
    >
      <Tabs
        aria-label={t("contactDetails.detailSections", "Contact detail sections")}
        className={styles.summaryTabs}
        items={tabItems}
        onValueChange={(value) => setDetailsTab(value as ContactSummaryTab)}
        panelClassName={tabsVariant === "card" ? styles.summaryPanel : undefined}
        panelMode="active"
        trailing={
          showActions && moreActions?.length ? (
            <MoreActionsMenu items={moreActions} label={t("contactDetails.moreActions", "More contact actions")} />
          ) : null
        }
        value={detailsTab}
        variant={tabsVariant}
      />
    </DashboardContentContainer>
  );
}
