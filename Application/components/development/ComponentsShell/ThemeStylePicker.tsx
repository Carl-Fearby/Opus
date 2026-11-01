"use client";

import { useEffect, useRef, useState } from "react";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import { useOpusI18n } from "@/components/OpusI18n";
import type { OpusThemeDefaults } from "@/components/OpusThemeProvider";
import { createThemedPortal } from "@/lib/theme/createThemedPortal";
import styles from "./ThemeStylePicker.module.css";

type Appearance = NonNullable<OpusThemeDefaults["appearance"]>;

const appearanceOrder: Appearance[] = ["standard", "neumorphism", "liquid-glass"];

type MenuPosition = { right: number; top: number };

/**
 * Global surface style for every Opus component and portalled overlay.
 *
 * Drives the same `previewDefaults` the theme designer edits, so a change here
 * is not a header-only preview — it repaints the whole documentation shell.
 *
 * The menu is portalled: the header clips its overflow and sits below the page
 * content in the stacking order, which hid the options inside it.
 */
export function ThemeStylePicker() {
  const { t } = useOpusI18n();
  const { previewDefaults, setPreviewDefaults } = useComponentsTheme();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const value = previewDefaults.appearance ?? "standard";

  const labels: Record<Appearance, string> = {
    standard: t("themeDesigner.standard", "Standard"),
    neumorphism: t("themeDesigner.neumorphism", "Neumorphism"),
    "liquid-glass": t("themeDesigner.liquidGlass", "Liquid glass"),
  };

  useEffect(() => {
    if (!open) return;

    const placeMenu = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
    };

    placeMenu();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
    };
  }, [open]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${t("themeDesigner.themeStyle", "Theme style")}: ${labels[value]}`}
        className={styles.trigger}
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) setMenuPosition({ top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) });
          }
          setOpen((current) => !current);
        }}
      >
        <span className={styles.triggerText}>{labels[value]}</span>
        <span aria-hidden="true" className={styles.chevron} />
      </button>

      {open && menuPosition && typeof document !== "undefined"
        ? createThemedPortal(
            <div
              aria-label={t("themeDesigner.themeStyle", "Theme style")}
              className={styles.menu}
              ref={menuRef}
              role="listbox"
              style={{ right: menuPosition.right, top: menuPosition.top }}
            >
              {appearanceOrder.map((appearance) => (
                <button
                  aria-selected={appearance === value}
                  className={[styles.option, appearance === value ? styles.optionActive : ""].filter(Boolean).join(" ")}
                  key={appearance}
                  role="option"
                  type="button"
                  onClick={() => {
                    setPreviewDefaults({ ...previewDefaults, appearance });
                    setOpen(false);
                  }}
                >
                  {labels[appearance]}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
