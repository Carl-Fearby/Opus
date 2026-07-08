"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PortalHostContextValue = {
  container: HTMLElement | null;
};

const PortalHostContext = createContext<PortalHostContextValue>({ container: null });

export function usePortalHost() {
  return useContext(PortalHostContext);
}

type PortalHostProps = {
  children: ReactNode;
  id?: string;
};

export function PortalHost({ children, id = "opus-portal-host" }: PortalHostProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let host = document.getElementById(id);
    let created = false;

    if (!host) {
      host = document.createElement("div");
      host.id = id;
      document.body.appendChild(host);
      created = true;
    }

    setContainer(host);

    return () => {
      if (created && host?.parentNode) {
        host.parentNode.removeChild(host);
      }
    };
  }, [id]);

  const value = useMemo(() => ({ container }), [container]);

  return <PortalHostContext.Provider value={value}>{children}</PortalHostContext.Provider>;
}

type PortalProps = {
  children: ReactNode;
  container?: HTMLElement | null;
  disabled?: boolean;
};

export function Portal({ children, container, disabled = false }: PortalProps) {
  const host = usePortalHost();
  const [fallback, setFallback] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setFallback(document.body);
  }, []);

  if (disabled) {
    return <>{children}</>;
  }

  const target = container ?? host.container ?? fallback;
  if (!target) {
    return null;
  }

  return createPortal(children, target);
}
