"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PortalHostContextValue = {
  container: HTMLElement | null;
};

const PortalHostContext = createContext<PortalHostContextValue>({ container: null });

type PortalHostEntry = {
  container: HTMLElement;
  createdByOpus: boolean;
  references: number;
};

const portalHostEntries = new Map<string, PortalHostEntry>();

function acquirePortalHost(id: string) {
  const registered = portalHostEntries.get(id);
  if (registered?.container.isConnected) {
    registered.references += 1;
    return registered.container;
  }

  const existing = document.getElementById(id);
  const container = existing ?? document.createElement("div");
  const createdByOpus = existing === null;

  if (createdByOpus) {
    container.id = id;
    container.dataset.opusPortalHost = "true";
    document.body.appendChild(container);
  }

  portalHostEntries.set(id, {
    container,
    createdByOpus,
    references: 1,
  });

  return container;
}

function releasePortalHost(id: string, container: HTMLElement) {
  const registered = portalHostEntries.get(id);
  if (!registered || registered.container !== container) {
    return;
  }

  registered.references -= 1;
  if (registered.references > 0) {
    return;
  }

  portalHostEntries.delete(id);
  if (registered.createdByOpus && registered.container.isConnected) {
    registered.container.remove();
  }
}

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
    const host = acquirePortalHost(id);
    setContainer(host);

    return () => {
      releasePortalHost(id, host);
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
