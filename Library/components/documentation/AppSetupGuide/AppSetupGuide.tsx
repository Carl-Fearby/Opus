import { DescriptionList, Panel } from "opus-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import styles from "./AppSetupGuide.module.css";

export function AppSetupGuide() {
  const { t } = useLocale();

  return (
    <div className={styles.root}>
      <Panel title={t("docs.appSetup.title")} description={t("docs.appSetup.description")}>
        <DescriptionList
          items={[
            {
              term: t("docs.appSetup.styles"),
              details: t("docs.appSetup.stylesDetails"),
            },
            {
              term: t("docs.appSetup.globalTheme"),
              details: t("docs.appSetup.globalThemeDetails"),
            },
            {
              term: t("docs.appSetup.globalFont"),
              details: t("docs.appSetup.globalFontDetails"),
            },
            {
              term: t("docs.appSetup.previewControls"),
              details: t("docs.appSetup.previewControlsDetails"),
            },
            {
              term: t("docs.appSetup.portalHost"),
              details: t("docs.appSetup.portalHostDetails"),
            },
          ]}
        />
      </Panel>
    </div>
  );
}
