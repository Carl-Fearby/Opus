"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { SidebarSide, SurfaceDensity } from "@/components/fields/types";
import styles from "./Sidebar.module.css";

type SidebarContextValue = {
  collapsed: boolean;
  density: SurfaceDensity;
};

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  density: "comfortable",
});

type SidebarProps = {
  children: ReactNode;
  collapsed?: boolean;
  density?: SurfaceDensity;
  footer?: ReactNode;
  header?: ReactNode;
  side?: SidebarSide;
};

export function Sidebar({
  children,
  collapsed = false,
  density = "comfortable",
  footer,
  header,
  side = "left",
}: SidebarProps) {
  return (
    <SidebarContext.Provider value={{ collapsed, density }}>
      <aside
        aria-label="Sidebar"
        className={styles.sidebar}
        data-collapsed={collapsed ? "true" : "false"}
        data-density={density}
        data-side={side}
      >
        {header ? <div className={styles.header}>{header}</div> : null}
        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </aside>
    </SidebarContext.Provider>
  );
}

type SidebarHeaderProps = {
  children?: ReactNode;
  title: string;
};

export function SidebarHeader({ children, title }: SidebarHeaderProps) {
  const { collapsed } = useContext(SidebarContext);

  return (
    <div className={styles.headerInner}>
      <h2 className={collapsed ? styles.visuallyHidden : styles.headerTitle}>{title}</h2>
      {children}
    </div>
  );
}

type SidebarNavProps = {
  "aria-label": string;
  children: ReactNode;
};

export function SidebarNav({ "aria-label": ariaLabel, children }: SidebarNavProps) {
  return (
    <nav aria-label={ariaLabel} className={styles.nav}>
      {children}
    </nav>
  );
}

type SidebarLinkProps = {
  active?: boolean;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
};

export function SidebarLink({ active = false, children, href, onClick }: SidebarLinkProps) {
  const { collapsed } = useContext(SidebarContext);
  const className = [styles.link, active ? styles.linkActive : ""].filter(Boolean).join(" ");
  const label = typeof children === "string" ? children : null;
  const content = (
    <>
      {collapsed && label ? <span aria-hidden="true">{label.charAt(0)}</span> : null}
      <span className={collapsed ? styles.visuallyHidden : undefined}>{children}</span>
    </>
  );

  if (href) {
    return (
      <a aria-current={active ? "page" : undefined} className={className} href={href}>
        {content}
      </a>
    );
  }

  return (
    <button
      aria-current={active ? "page" : undefined}
      className={className}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  );
}

function createGroupListId(label: string, id?: string) {
  if (id) {
    return id;
  }

  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `sidebar-group-${slug}` : "sidebar-group";
}

type SidebarGroupProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
  label: string;
};

export function SidebarGroup({ children, defaultOpen = true, id, label }: SidebarGroupProps) {
  const { collapsed } = useContext(SidebarContext);
  const listId = createGroupListId(label, id);
  const [open, setOpen] = useState(defaultOpen);

  if (collapsed) {
    return (
      <div aria-label={label} className={styles.group} role="group">
        {children}
      </div>
    );
  }

  return (
    <div aria-label={label} className={styles.group} role="group">
      <div className={styles.groupHeader}>
        <span className={styles.groupLabel}>{label}</span>
        <button
          aria-controls={listId}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
          className={styles.groupToggle}
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true" className={open ? styles.groupChevronOpen : styles.groupChevron} />
        </button>
      </div>
      <div className={styles.groupItemsWrap} data-open={open ? "true" : "false"}>
        <div className={styles.groupItems} id={listId} inert={!open || undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}

type SidebarLayoutProps = {
  children: ReactNode;
  collapsed?: boolean;
  main: ReactNode;
  side?: SidebarSide;
};

export function SidebarLayout({ children, collapsed = false, main, side = "left" }: SidebarLayoutProps) {
  return (
    <div className={styles.layout} data-collapsed={collapsed ? "true" : "false"} data-side={side}>
      {side === "left" ? children : null}
      <div className={styles.main}>{main}</div>
      {side === "right" ? children : null}
    </div>
  );
}
