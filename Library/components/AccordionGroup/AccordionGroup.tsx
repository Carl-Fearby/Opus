"use client";

import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import type { AccordionGroupType } from "@/components/fields/types";
import styles from "./AccordionGroup.module.css";

type AccordionGroupContextValue = {
  collapsible: boolean;
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
  type: AccordionGroupType;
};

export const AccordionGroupContext = createContext<AccordionGroupContextValue | null>(null);

type AccordionGroupProps = {
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  type?: AccordionGroupType;
  value?: string | string[];
};

export function AccordionGroup({
  children,
  className,
  collapsible = true,
  defaultValue,
  onValueChange,
  type = "single",
  value,
}: AccordionGroupProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(() => {
    if (defaultValue !== undefined) {
      return defaultValue;
    }

    return type === "multiple" ? [] : "";
  });

  const currentValue = value ?? internalValue;

  const setValue = useCallback(
    (next: string | string[]) => {
      if (value === undefined) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    },
    [onValueChange, value],
  );

  const isOpen = useCallback(
    (itemValue: string) => {
      if (type === "multiple") {
        return Array.isArray(currentValue) && currentValue.includes(itemValue);
      }

      return currentValue === itemValue;
    },
    [currentValue, type],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      if (type === "multiple") {
        const openValues = Array.isArray(currentValue) ? currentValue : [];
        const next = openValues.includes(itemValue)
          ? openValues.filter((entry) => entry !== itemValue)
          : [...openValues, itemValue];
        setValue(next);
        return;
      }

      const isCurrentlyOpen = currentValue === itemValue;
      if (isCurrentlyOpen && !collapsible) {
        return;
      }

      setValue(isCurrentlyOpen ? "" : itemValue);
    },
    [collapsible, currentValue, setValue, type],
  );

  const contextValue = useMemo(
    () => ({
      collapsible,
      isOpen,
      toggle,
      type,
    }),
    [collapsible, isOpen, toggle, type],
  );

  return (
    <AccordionGroupContext.Provider value={contextValue}>
      <div aria-label="Accordion" className={[styles.group, className].filter(Boolean).join(" ")} role="group">
        {children}
      </div>
    </AccordionGroupContext.Provider>
  );
}
