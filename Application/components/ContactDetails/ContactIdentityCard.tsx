"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { DashboardContentContainer } from "@/components/DashboardContentContainer";
import type { ContactCompany } from "./types";
import { getPrimaryCompany } from "./types";
import styles from "./ContactIdentityCard.module.css";

export type ContactIdentityCardProps = {
  avatarSrc?: string;
  className?: string;
  companies: ContactCompany[];
  isStaffRecord?: boolean;
  name: string;
  onEdit?: () => void;
  showStatus?: boolean;
  status?: string;
};

export function ContactIdentityCard({
  avatarSrc,
  className,
  companies,
  isStaffRecord = false,
  name,
  onEdit,
  showStatus = true,
  status,
}: ContactIdentityCardProps) {
  const primary = getPrimaryCompany(companies);

  return (
    <DashboardContentContainer
      className={[styles.identityCard, className].filter(Boolean).join(" ")}
      data-component="contact-details-identity"
      data-staff-record={isStaffRecord ? "true" : "false"}
      width="full"
    >
      <div className={styles.identity}>
        <div className={styles.avatarWrap}>
          <Avatar name={name} size="xl" src={avatarSrc} />
          <button aria-label={`Edit ${name}`} className={styles.avatarEdit} onClick={onEdit} type="button">
            <CatalogIcon iconName="pen" />
          </button>
        </div>

        <div className={styles.headline}>
          <h3>{name}</h3>
          {primary?.jobTitle ? <p>{primary.jobTitle}</p> : null}
        </div>

        {companies.length ? (
          <ul className={styles.companyList} aria-label="Companies">
            {companies.map((company) => (
              <li key={company.name}>
                <span aria-hidden="true" className={styles.companyIcon}>
                  <CatalogIcon iconName="building" />
                </span>
                <span className={styles.companyCopy}>
                  <strong>
                    {company.name}
                    {company.primary ? <span className={styles.primaryMark}>Primary</span> : null}
                  </strong>
                  {company.jobTitle && company !== primary ? <small>{company.jobTitle}</small> : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {showStatus && status ? (
          <div className={styles.status}>
            <Badge dot label={status} tone="success" />
          </div>
        ) : null}
      </div>
    </DashboardContentContainer>
  );
}
