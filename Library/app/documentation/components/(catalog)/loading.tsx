import { PreviewLoading } from "@/components/control-detail/ControlDetail/PreviewLoading";
import styles from "@/components/development/ComponentsShell/ComponentsShell.module.css";

export default function ComponentsCatalogLoading() {
  return (
    <div className={styles.catalogLoading}>
      <PreviewLoading />
    </div>
  );
}
