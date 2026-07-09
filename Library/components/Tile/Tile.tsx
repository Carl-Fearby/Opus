"use client";

import { CatalogIcon } from "@/components/CatalogIcon";
import { TileGradientDefs } from "./TileGradientDefs";
import styles from "./Tile.module.css";

export type TileTone = "purple" | "blue";

export type TileProps = {
  className?: string;
  href?: string;
  icon: string;
  label: string;
  onClick?: () => void;
  role?: string;
  tone?: TileTone;
  withGradients?: boolean;
};

export function Tile({
  className,
  href,
  icon,
  label,
  onClick,
  role,
  tone = "purple",
  withGradients = true,
}: TileProps) {
  const content = (
    <>
      <span aria-hidden="true" className={styles.icon} data-tone={tone}>
        <CatalogIcon iconName={icon} />
      </span>
      <span className={styles.label}>{label}</span>
    </>
  );

  const classNames = [styles.tile, className].filter(Boolean).join(" ");

  const gradients = withGradients ? <TileGradientDefs /> : null;

  if (href) {
    return (
      <>
        {gradients}
        <a className={classNames} data-tone={tone} href={href} onClick={onClick} role={role}>
          {content}
        </a>
      </>
    );
  }

  return (
    <>
      {gradients}
      <button className={classNames} data-tone={tone} onClick={onClick} role={role} type="button">
        {content}
      </button>
    </>
  );
}
