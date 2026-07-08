import type { AvatarSize } from "@/components/fields/types";
import { Avatar } from "@/components/Avatar";
import styles from "./AvatarGroup.module.css";

export type AvatarGroupItem = {
  name: string;
  src?: string;
};

type AvatarGroupProps = {
  items: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
};

export function AvatarGroup({ items, max = 4, size = "md" }: AvatarGroupProps) {
  const safeMax = Math.max(1, Math.round(max));
  const visible = items.slice(0, safeMax);
  const overflow = Math.max(0, items.length - visible.length);

  return (
    <div aria-label={`${items.length} people`} className={styles.group} role="group">
      {visible.map((item, index) => (
        <span className={styles.item} key={`${item.name}-${index}`} style={{ zIndex: visible.length - index }}>
          <Avatar name={item.name} size={size} src={item.src} />
        </span>
      ))}
      {overflow > 0 ? (
        <span
          aria-label={`${overflow} more`}
          className={styles.overflow}
          data-size={size}
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
