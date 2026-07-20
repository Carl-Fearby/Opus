"use client";

import { useEffect, useState } from "react";
import { Avatar } from "opus-react";
import { Badge } from "opus-react";
import { CatalogIcon } from "opus-react";
import { DashboardContentContainer } from "opus-react";
import { ProfilePhotoUploadModal } from "opus-react";
import type { ContactCompany } from "./types";
import { getPrimaryCompany } from "./types";
import styles from "./ContactIdentityCard.module.css";

export type ContactIdentityCardProps = {
  avatarSrc?: string;
  className?: string;
  companies: ContactCompany[];
  isStaffRecord?: boolean;
  name: string;
  onAvatarChange?: (previewUrl: string) => void;
  photoUploadTitle?: string;
  showStatus?: boolean;
  status?: string;
};

export function ContactIdentityCard({
  avatarSrc,
  className,
  companies,
  isStaffRecord = false,
  name,
  onAvatarChange,
  photoUploadTitle = "Update contact photo",
  showStatus = true,
  status,
}: ContactIdentityCardProps) {
  const primary = getPrimaryCompany(companies);
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [photoSrc, setPhotoSrc] = useState(avatarSrc);

  useEffect(() => {
    setPhotoSrc(avatarSrc);
  }, [avatarSrc]);

  return (
    <DashboardContentContainer
      className={[styles.identityCard, className].filter(Boolean).join(" ")}
      data-component="contact-details-identity"
      data-staff-record={isStaffRecord ? "true" : "false"}
      width="full"
    >
      <div className={styles.identity}>
        <div className={styles.avatarWrap}>
          <Avatar name={name} size="xl" src={photoSrc} />
          <button
            aria-label={`Update photo for ${name}`}
            className={styles.avatarEdit}
            onClick={() => setPhotoUploadOpen(true)}
            type="button"
          >
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

      <ProfilePhotoUploadModal
        fieldId="contact-avatar-upload"
        open={photoUploadOpen}
        options={{
          title: isStaffRecord ? "Update user photo" : photoUploadTitle,
        }}
        value={photoSrc}
        onClose={() => setPhotoUploadOpen(false)}
        onPhotoChange={(previewUrl) => {
          setPhotoSrc(previewUrl);
          onAvatarChange?.(previewUrl);
        }}
      />
    </DashboardContentContainer>
  );
}
