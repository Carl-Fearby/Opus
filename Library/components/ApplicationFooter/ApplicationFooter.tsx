"use client";
import { CatalogIcon } from "@/components/CatalogIcon";
import { Divider } from "@/components/Divider";
import { Tooltip } from "@/components/Tooltip";
import styles from "./ApplicationFooter.module.css";
export type ApplicationFooterAction = { iconName: string; id: string; label: string; onSelect?: () => void };
export type ApplicationFooterProps = { actions?: ApplicationFooterAction[]; brandAlt?: string; brandSrc?: string; copyright?: string; onActionSelect?: (action: ApplicationFooterAction) => void; productName?: string; version?: string };
export function ApplicationFooter({ actions = [], brandAlt = "Opus", brandSrc = "/opus-logo.png", copyright = `© ${new Date().getFullYear()} Opus. All rights reserved.`, onActionSelect, productName = "CRM", version = "v1.0.0" }: ApplicationFooterProps) {
  return <footer className={styles.root}>
    <div className={styles.brand}>{/* eslint-disable-next-line @next/next/no-img-element */}<img alt={brandAlt} className={styles.logo} src={brandSrc} /><span className={styles.product}>{productName}</span><span className={styles.version}>{version}</span></div>
    <small className={styles.copyright}>{copyright}</small>
    <nav aria-label="Footer actions" className={styles.actions}>{actions.map((action, index) => <span className={styles.actionSlot} key={action.id}>{index ? <Divider orientation="vertical" tone="muted" /> : null}<Tooltip content={action.label} placement="top"><button aria-label={action.label} className={styles.action} onClick={() => { action.onSelect?.(); onActionSelect?.(action); }} type="button"><CatalogIcon iconName={action.iconName} /></button></Tooltip></span>)}</nav>
  </footer>;
}
