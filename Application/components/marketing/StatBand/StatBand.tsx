import type { CSSProperties } from "react";
import { getCompositionTree } from "@/lib/controls/compositionGraph";
import { controls } from "@/lib/controls/registry";
import { RAW_PREVIEW_WIDTH_OPTIONS } from "@/components/control-detail/ControlRaw/rawPreviewWidths";
import { repositoryStats } from "@/lib/generated/repositoryStats";
import styles from "./StatBand.module.css";

const compositionNodes = getCompositionTree();
const relationshipCount = compositionNodes.reduce((total, node) => total + node.children.length, 0);
const fixedPreviewWidthCount = RAW_PREVIEW_WIDTH_OPTIONS.filter((option) => option.px !== null).length;

const stats = [
  { value: controls.length.toLocaleString("en-GB"), label: "Documented components" },
  { value: relationshipCount.toLocaleString("en-GB"), label: "Mapped relationships" },
  { value: fixedPreviewWidthCount.toLocaleString("en-GB"), label: "Preview widths" },
  { value: repositoryStats.totalLines.toLocaleString("en-GB"), label: "Source lines" },
  { value: "270", label: "Browser interaction checks" },
  { value: "npm", label: "Published as opus-react" },
];

const languageColours: Record<(typeof repositoryStats.languages)[number]["label"], string> = {
  TypeScript: "#3178c6",
  CSS: "#a855f7",
  JavaScript: "#f7df1e",
  Other: "#14b8a6",
};

function percentage(lines: number) {
  return (lines / repositoryStats.totalLines) * 100;
}

export function StatBand() {
  return (
    <section className={styles.band} aria-label="Key facts">
      <div className={styles.inner}>
        <div className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.breakdown}>
          <div className={styles.breakdownHeading}>
            <strong>Source language breakdown</strong>
            <span>Git-tracked code, excluding dependencies and build output</span>
          </div>
          <div
            aria-label={repositoryStats.languages
              .map((language) => `${language.label} ${percentage(language.lines).toFixed(1)}%`)
              .join(", ")}
            className={styles.languageBar}
            role="img"
          >
            {repositoryStats.languages.map((language) => (
              <span
                className={styles.languageSegment}
                key={language.label}
                style={
                  {
                    "--language-colour": languageColours[language.label],
                    "--language-width": `${percentage(language.lines)}%`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className={styles.legend}>
            {repositoryStats.languages.map((language) => (
              <div className={styles.legendItem} key={language.label}>
                <span
                  aria-hidden="true"
                  className={styles.legendDot}
                  style={{ "--language-colour": languageColours[language.label] } as CSSProperties}
                />
                <strong>{language.label}</strong>
                <span>{language.lines.toLocaleString("en-GB")} lines</span>
                <span>{percentage(language.lines).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
