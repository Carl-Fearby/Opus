"use client";
import { CatalogIcon } from "@/components/CatalogIcon";
import { Divider } from "@/components/Divider";
import { OpusBrand } from "@/components/OpusBrand";
import { Tooltip } from "@/components/Tooltip";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./ApplicationFooter.module.css";
export type ApplicationFooterAction = { iconName: string; id: string; label: string; onSelect?: () => void };
export type ApplicationFooterProps = { actions?: ApplicationFooterAction[]; brandAlt?: string; brandSrc?: string; copyright?: string; onActionSelect?: (action: ApplicationFooterAction) => void; productName?: string; showActions?: boolean; showBrand?: boolean; showVersion?: boolean; version?: string };
export function ApplicationFooter({ actions = [], brandAlt = "Opus", brandSrc, copyright, onActionSelect, productName = "CRM", showActions = true, showBrand = true, showVersion = true, version = "v1.0.0" }: ApplicationFooterProps) {
  const { t } = useOpusI18n();
  const displayCopyright = copyright ?? t("applicationFooter.copyright", "© {year} Opus. All rights reserved.", { year: new Date().getFullYear() });
  return <footer className={styles.root}>
    {showBrand ? <div className={styles.brand}><OpusBrand alt={brandAlt} className={styles.logo} src={brandSrc} /><span className={styles.product}>{productName}</span>{showVersion ? <span className={styles.version}>{version}</span> : null}</div> : null}
    <small className={styles.copyright}>{displayCopyright}</small>
    {showActions ? <nav aria-label={t("applicationFooter.actions", "Footer actions")} className={styles.actions}>{actions.map((action, index) => <span className={styles.actionSlot} key={action.id}>{index ? <Divider orientation="vertical" tone="muted" /> : null}<Tooltip content={action.label} placement="top"><button aria-label={action.label} className={styles.action} onClick={() => { action.onSelect?.(); onActionSelect?.(action); }} type="button"><CatalogIcon iconName={action.iconName} /></button></Tooltip></span>)}</nav> : null}
  </footer>;
}
