import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./shared.module.css";

type DashboardListFooterProps = {
  footerHref?: string;
  footerLabel: string;
  onFooterClick?: () => void;
};

export function DashboardListFooter({ footerHref, footerLabel, onFooterClick }: DashboardListFooterProps) {
  const content = (
    <>
      <span>{footerLabel}</span>
      <span aria-hidden="true" className={styles.footerIcon}>
        <CatalogIcon iconName="arrow-right" />
      </span>
    </>
  );

  return (
    <footer className={styles.footer}>
      {footerHref ? (
        <a className={styles.footerAction} href={footerHref}>
          {content}
        </a>
      ) : (
        <button className={styles.footerAction} onClick={onFooterClick} type="button">
          {content}
        </button>
      )}
    </footer>
  );
}
