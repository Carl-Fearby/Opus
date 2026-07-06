"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/lib/fontawesome";
import { getFontAwesomeIconOption } from "@/lib/fontAwesomeIconCatalog";

type CatalogIconProps = {
  iconName: string;
};

export function CatalogIcon({ iconName }: CatalogIconProps) {
  return <FontAwesomeIcon aria-hidden="true" icon={getFontAwesomeIconOption(iconName).icon} />;
}
