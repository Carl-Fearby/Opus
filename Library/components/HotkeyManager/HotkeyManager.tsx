"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type HotkeyCombo = {
  alt?: boolean;
  ctrl?: boolean;
  description?: string;
  enabled?: boolean;
  id: string;
  key: string;
  meta?: boolean;
  shift?: boolean;
};

type HotkeyHandler = () => void;

type HotkeyManagerContextValue = {
  register: (combo: HotkeyCombo, handler: HotkeyHandler) => () => void;
  shortcuts: HotkeyCombo[];
};

const HotkeyManagerContext = createContext<HotkeyManagerContextValue | null>(null);

function matchesCombo(event: KeyboardEvent, combo: HotkeyCombo) {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  const expected = combo.key.length === 1 ? combo.key.toLowerCase() : combo.key;
  return (
    key === expected &&
    Boolean(combo.meta) === event.metaKey &&
    Boolean(combo.ctrl) === event.ctrlKey &&
    Boolean(combo.alt) === event.altKey &&
    Boolean(combo.shift) === event.shiftKey
  );
}

function shortcutsEqual(a: HotkeyCombo[], b: HotkeyCombo[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((combo, index) => {
    const other = b[index];
    return (
      combo.id === other.id &&
      combo.key === other.key &&
      Boolean(combo.meta) === Boolean(other.meta) &&
      Boolean(combo.ctrl) === Boolean(other.ctrl) &&
      Boolean(combo.alt) === Boolean(other.alt) &&
      Boolean(combo.shift) === Boolean(other.shift) &&
      combo.enabled === other.enabled &&
      combo.description === other.description
    );
  });
}

type HotkeyManagerProps = {
  children: ReactNode;
  enabled?: boolean;
};

export function HotkeyManager({ children, enabled = true }: HotkeyManagerProps) {
  const handlersRef = useRef(new Map<string, { combo: HotkeyCombo; handler: HotkeyHandler }>());
  const [shortcuts, setShortcuts] = useState<HotkeyCombo[]>([]);

  const syncShortcuts = useCallback(() => {
    const next = Array.from(handlersRef.current.values()).map((entry) => entry.combo);
    setShortcuts((current) => (shortcutsEqual(current, next) ? current : next));
  }, []);

  const register = useCallback(
    (combo: HotkeyCombo, handler: HotkeyHandler) => {
      handlersRef.current.set(combo.id, { combo, handler });
      syncShortcuts();
      return () => {
        handlersRef.current.delete(combo.id);
        syncShortcuts();
      };
    },
    [syncShortcuts],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }

      for (const entry of handlersRef.current.values()) {
        if (entry.combo.enabled === false) {
          continue;
        }
        if (matchesCombo(event, entry.combo)) {
          event.preventDefault();
          entry.handler();
          break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);

  const value = useMemo(() => ({ register, shortcuts }), [register, shortcuts]);

  return <HotkeyManagerContext.Provider value={value}>{children}</HotkeyManagerContext.Provider>;
}

export function useHotkey(combo: HotkeyCombo, handler: HotkeyHandler) {
  const context = useContext(HotkeyManagerContext);
  const register = context?.register;
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const { alt, ctrl, description, enabled, id, key, meta, shift } = combo;

  useEffect(() => {
    if (!register) {
      return;
    }

    return register(
      { alt, ctrl, description, enabled, id, key, meta, shift },
      () => {
        handlerRef.current();
      },
    );
  }, [alt, ctrl, description, enabled, id, key, meta, register, shift]);
}

export function useHotkeyManager() {
  const context = useContext(HotkeyManagerContext);
  if (!context) {
    throw new Error("useHotkeyManager must be used within HotkeyManager");
  }
  return context;
}
