import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar, SidebarLink } from "../../components/Sidebar";

describe("SidebarLink target and rel", () => {
  it("omits target and rel for same-context links", () => {
    render(<SidebarLink href="/prototype">Live prototype</SidebarLink>);

    const link = screen.getByRole("link", { name: "Live prototype" });
    expect(link).toHaveAttribute("href", "/prototype");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("opens a target=_blank link in a new context with a safe rel", () => {
    render(
      <SidebarLink href="/prototype" target="_blank">
        Live prototype
      </SidebarLink>,
    );

    // The anchor keeps its real href, so middle-click and copy-link still work.
    const link = screen.getByRole("link", { name: "Live prototype" });
    expect(link).toHaveAttribute("href", "/prototype");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps an explicit rel instead of the default", () => {
    render(
      <SidebarLink href="https://example.com" rel="noreferrer" target="_blank">
        External docs
      </SidebarLink>,
    );

    const link = screen.getByRole("link", { name: "External docs" });
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("leaves target off for same-context targets", () => {
    render(
      <SidebarLink href="/docs" target="_self">
        Docs
      </SidebarLink>,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("target", "_self");
    expect(link).not.toHaveAttribute("rel");
  });

  it("ignores target in button mode", () => {
    render(
      <SidebarLink itemId="analytics" target="_blank" onSelect={vi.fn()}>
        Analytics
      </SidebarLink>,
    );

    const button = screen.getByRole("button", { name: "Analytics" });
    expect(button).not.toHaveAttribute("target");
    expect(button).not.toHaveAttribute("rel");
  });

  it("passes target and rel through data-driven menu items", () => {
    render(
      <Sidebar
        menu={[
          {
            id: "prototype",
            label: "Live prototype",
            href: "https://prototype.example.com",
            rel: "noreferrer external",
            target: "_blank",
          },
          { id: "dashboard", label: "Dashboard" },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "Live prototype" });
    expect(link).toHaveAttribute("href", "https://prototype.example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer external");

    const button = screen.getByRole("button", { name: "Dashboard" });
    expect(button).not.toHaveAttribute("target");
  });
});
