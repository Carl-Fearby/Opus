"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { CatalogIcon } from "@/components/CatalogIcon";
import { DashboardContentContainer } from "@/components/DashboardContentContainer";
import { CompanyLogoUploadModal } from "./CompanyLogoUploadModal";
import styles from "./CompanyIdentityCard.module.css";

export type CompanyIdentityCardProps = {
  className?: string;
  employees?: string;
  industry?: string;
  logoSrc?: string;
  name: string;
  onLogoChange?: (previewUrl: string) => void;
  showStatus?: boolean;
  status?: string;
  type?: string;
};

export function CompanyIdentityCard({
  className,
  employees,
  industry,
  logoSrc,
  name,
  onLogoChange,
  showStatus = true,
  status,
  type,
}: CompanyIdentityCardProps) {
  const [logoUploadOpen, setLogoUploadOpen] = useState(false);
  const [photoSrc, setPhotoSrc] = useState(logoSrc);

  useEffect(() => {
    setPhotoSrc(logoSrc);
  }, [logoSrc]);

  return (
    <DashboardContentContainer
      className={[styles.identityCard, className].filter(Boolean).join(" ")}
      data-component="company-details-identity"
      width="full"
    >
      <div className={styles.identity}>
        <div className={styles.avatarWrap} data-has-logo={photoSrc ? "true" : "false"}>
          {photoSrc ? (
            <div className={styles.logoFrame}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={`${name} logo`} className={styles.logo} src={photoSrc} />
            </div>
          ) : (
            <Avatar name={name} shape="rounded" size="xl" />
          )}
          <button
            aria-label={`Update logo for ${name}`}
            className={styles.avatarEdit}
            onClick={() => setLogoUploadOpen(true)}
            type="button"
          >
            <CatalogIcon iconName="pen" />
          </button>
        </div>

        <div className={styles.headline}>
          <h3>{name}</h3>
          {industry ? <p>{industry}</p> : null}
        </div>

        <ul className={styles.companyList} aria-label="Company summary">
          {type ? (
            <li>
              <span aria-hidden="true" className={styles.companyIcon}>
                <CatalogIcon iconName="building" />
              </span>
              <span className={styles.companyCopy}>
                <strong>{type}</strong>
                <small>Account type</small>
              </span>
            </li>
          ) : null}
          {employees ? (
            <li>
              <span aria-hidden="true" className={styles.companyIcon}>
                <CatalogIcon iconName="users" />
              </span>
              <span className={styles.companyCopy}>
                <strong>{employees}</strong>
                <small>Employees</small>
              </span>
            </li>
          ) : null}
        </ul>

        {showStatus && status ? (
          <div className={styles.status}>
            <Badge dot label={status} tone="success" />
          </div>
        ) : null}
      </div>

      <CompanyLogoUploadModal
        fieldId="company-logo-upload"
        open={logoUploadOpen}
        title="Update company logo"
        value={photoSrc}
        onClose={() => setLogoUploadOpen(false)}
        onLogoChange={(previewUrl) => {
          setPhotoSrc(previewUrl);
          onLogoChange?.(previewUrl);
        }}
      />
    </DashboardContentContainer>
  );
}
