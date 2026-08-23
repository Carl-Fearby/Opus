import styles from "./OpusBrand.module.css";

export type OpusBrandVariant = "full" | "icon" | "wordmark";

export type OpusBrandProps = {
  alt?: string;
  className?: string;
  /** Override the bundled artwork, for example with a tenant-specific brand asset. */
  src?: string;
  title?: string;
  variant?: OpusBrandVariant;
};

/**
 * The canonical Opus mark. The default artwork is loaded from the package CSS,
 * so it remains available to npm consumers without copying files into /public.
 */
export function OpusBrand({
  alt = "Opus",
  className,
  src,
  title,
  variant = "full",
}: OpusBrandProps) {
  if (src) {
    return <img alt={alt} className={[styles.image, className].filter(Boolean).join(" ")} src={src} title={title} />;
  }

  return (
    <span
      aria-label={alt}
      className={[styles.root, styles[variant], className].filter(Boolean).join(" ")}
      role="img"
      title={title}
    />
  );
}
