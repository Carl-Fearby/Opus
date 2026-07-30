"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ComponentProps } from "react";
import "@/lib/fontawesome";
import { getFontAwesomeIconOption } from "@/lib/fontAwesomeIconCatalog";

type CatalogIconProps = {
  className?: string;
  iconName: string;
  style?: ComponentProps<typeof FontAwesomeIcon>["style"];
};

export function CatalogIcon({ className, iconName, style }: CatalogIconProps) {
  return (
    <FontAwesomeIcon
      aria-hidden="true"
      className={className}
      icon={getFontAwesomeIconOption(iconName).icon}
      style={style}
    />
  );
}
