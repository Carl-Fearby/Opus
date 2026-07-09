import styles from "./ControlDetail.module.css";

export function PreviewLoading() {
  return (
    <div aria-busy="true" aria-live="polite" className={styles.previewLoading}>
      Loading preview…
    </div>
  );
}
