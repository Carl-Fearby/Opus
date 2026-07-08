"use client";

import { useMemo, useState } from "react";
import type { AvatarShape, AvatarSize } from "@/components/fields/types";
import styles from "./Avatar.module.css";

export type AvatarProps = {
  name: string;
  shape?: AvatarShape;
  size?: AvatarSize;
  src?: string;
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function Avatar({
  name,
  shape = "circle",
  size = "md",
  src,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => initialsFromName(name), [name]);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      aria-label={name}
      className={styles.avatar}
      data-shape={shape}
      data-size={size}
      role="img"
      title={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className={styles.image}
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <span aria-hidden="true" className={styles.initials}>
          {initials}
        </span>
      )}
    </span>
  );
}
