"use client";

import { faBars, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { DocumentationBreadcrumbs } from "@/components/documentation/DocumentationBreadcrumbs";
import { useOpusI18n } from "@/components/OpusI18n";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./ComponentsShell.module.css";

export function ComponentsPageHeader({
  hasSettings = false,
  navOpen,
  onOpenNav,
  onOpenSettings,
  settingsOpen,
}: {
  hasSettings?: boolean;
  navOpen?: boolean;
  onOpenNav?: () => void;
  onOpenSettings?: () => void;
  settingsOpen?: boolean;
}) {
  const { t } = useLocale();
  const { t: tComponent } = useOpusI18n();
  const { pageHeader } = useComponentsTheme();
  const currentLabel = pageHeader.title || undefined;

  return (
    <div className={styles.pageHeader} data-opus-tour="component-heading">
      <div className={styles.mobileToolbar}>
        <button
          aria-controls="components-navigation-drawer"
          aria-expanded={navOpen ? true : false}
          className={styles.mobileToolbarButton}
          onClick={onOpenNav}
          type="button"
        >
          <FontAwesomeIcon aria-hidden="true" icon={faBars} />
          {t("docs.browseComponents")}
        </button>
        {hasSettings ? (
          <button
            aria-controls="components-settings-drawer"
            aria-expanded={settingsOpen ? true : false}
            className={styles.mobileToolbarButton}
            onClick={onOpenSettings}
            type="button"
          >
            <FontAwesomeIcon aria-hidden="true" icon={faSliders} />
            {tComponent("settings.title", "Settings")}
          </button>
        ) : null}
      </div>
      <DocumentationBreadcrumbs currentLabel={currentLabel} />
      {pageHeader.title ? <h1>{pageHeader.title}</h1> : <h1 className={styles.visuallyHidden}>{t("docs.components.hiddenTitle")}</h1>}
      {pageHeader.description ? <p>{pageHeader.description}</p> : null}
    </div>
  );
}
