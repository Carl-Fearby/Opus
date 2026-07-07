"use client";

import { createContext, useContext } from "react";

export type TopNavigationSelectItem = {
  description?: string;
  id: string;
  label: string;
};

export type TopNavigationContextValue = {
  activeMenu: string | null;
  closeMenu: () => void;
  closeOnEscape: boolean;
  closeOnOutside: boolean;
  closeOnSelect: boolean;
  onMenuSelect?: (menuId: string, item: TopNavigationSelectItem) => void;
  openMenu: (menuId: string) => void;
  presentMenus: ReadonlySet<string>;
  setMenuPresent: (menuId: string, present: boolean) => void;
  showShortcuts: boolean;
};

export const TopNavigationContext = createContext<TopNavigationContextValue | null>(null);

export function useTopNavigation() {
  return useContext(TopNavigationContext);
}
