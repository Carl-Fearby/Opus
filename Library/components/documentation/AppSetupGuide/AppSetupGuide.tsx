import { DescriptionList, Panel } from "opus-react";
import styles from "./AppSetupGuide.module.css";

const portalledOverlays = [
  "Drawer",
  "Dialog",
  "Modal",
  "Command palette",
  "Lightbox",
  "Model lightbox",
];

const portalledFloating = [
  "Dropdown menu",
  "Mega menu",
  "Tooltip",
  "Context menu",
  "Emoji picker",
];

export function AppSetupGuide() {
  return (
    <div className={styles.root}>
      <Panel title="App setup boilerplate" description="Copy the Usage tab into a new Next.js app shell.">
        <DescriptionList
          items={[
            {
              term: "Styles",
              description: "Import opus-react/styles.css and opus-react/index.css in the root layout.",
            },
            {
              term: "Theme",
              description:
                "Set data-theme on the html element and wrap the app in ThemeProvider so portalled overlays inherit tokens.",
            },
            {
              term: "Portal host",
              description:
                "Optional PortalHost wrapper for a dedicated mount node. Overlays still portal to document.body when omitted.",
            },
            {
              term: "Portalled overlays",
              description: portalledOverlays.join(", "),
            },
            {
              term: "Portalled floating UI",
              description: portalledFloating.join(", "),
            },
          ]}
        />
      </Panel>
    </div>
  );
}
