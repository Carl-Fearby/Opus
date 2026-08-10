import { DescriptionList, Panel } from "opus-react";
import styles from "./AppSetupGuide.module.css";

export function AppSetupGuide() {
  return (
    <div className={styles.root}>
      <Panel title="App setup boilerplate" description="Copy the Usage tab into a new Next.js app shell.">
        <DescriptionList
          items={[
            {
              term: "Styles",
              details: "Import opus-react/styles.css and opus-react/index.css in the root layout.",
            },
            {
              term: "Global theme",
              details:
                "Set data-theme on the html element and wrap the app in ThemeProvider so portalled overlays inherit tokens.",
            },
            {
              term: "Global font",
              details:
                "Load Space Grotesk with next/font, then pass its CSS stack to ThemeProvider's fontFamily prop. Opus publishes it as --opus-font-family.",
            },
            {
              term: "Preview controls",
              details:
                "The catalogue preview font picker is deliberately scoped to the preview. It never changes the documentation shell font.",
            },
            {
              term: "Portal host",
              details:
                "Optional PortalHost wrapper for a dedicated mount node. Overlays still portal to document.body when omitted.",
            },
          ]}
        />
      </Panel>
    </div>
  );
}
