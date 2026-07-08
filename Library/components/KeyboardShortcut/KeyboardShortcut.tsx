import styles from "./KeyboardShortcut.module.css";

export type KeyboardShortcutSize = "sm" | "md";

type KeyboardShortcutProps = {
  keys: string[];
  size?: KeyboardShortcutSize;
};

export function KeyboardShortcut({ keys, size = "md" }: KeyboardShortcutProps) {
  return (
    <kbd aria-label={keys.join(" + ")} className={styles.shortcut} data-size={size}>
      {keys.map((key, index) => (
        <span key={`${key}-${index}`}>
          {index > 0 ? <span aria-hidden="true" className={styles.plus}>+</span> : null}
          <span className={styles.key}>{key}</span>
        </span>
      ))}
    </kbd>
  );
}
