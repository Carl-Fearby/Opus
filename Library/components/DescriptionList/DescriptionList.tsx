import type { DescriptionListLayout } from "@/components/fields/types";
import styles from "./DescriptionList.module.css";

export type DescriptionListItem = {
  details: string;
  term: string;
};

type DescriptionListProps = {
  items: DescriptionListItem[];
  layout?: DescriptionListLayout;
};

export function DescriptionList({
  items,
  layout = "stacked",
}: DescriptionListProps) {
  return (
    <dl className={styles.list} data-layout={layout}>
      {items.map((item, index) => (
        <div className={styles.row} key={`${item.term}-${index}`}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.details}>{item.details}</dd>
        </div>
      ))}
    </dl>
  );
}
