import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomSheet } from "../../components/BottomSheet";
import { CodeEditor } from "../../components/CodeEditor";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ErrorBoundary, ErrorState } from "../../components/ErrorState";
import { Markdown } from "../../components/Markdown";
import { OverflowToolbar } from "../../components/OverflowToolbar";
import { TreeTable, type TreeTableColumn, type TreeTableNode } from "../../components/TreeTable";
import { AsyncMultiSelectField } from "../../components/fields/AsyncMultiSelectField";
import { MultiSelectField } from "../../components/fields/MultiSelectField";
import { NumberField } from "../../components/fields/NumberField";
import { Button } from "../../components/fields/Button";

describe("CodeEditor", () => {
  it("renders an accessible editable code surface", () => {
    render(<CodeEditor ariaLabel="Config" height={140} value="const value = 1;" />);
    expect(screen.getAllByLabelText("Config").length).toBeGreaterThan(0);
  });
});

describe("ConfirmDialog", () => {
  it("confirms and cancels with the expected callbacks", () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        description="This action cannot be undone."
        onClose={onClose}
        onConfirm={onConfirm}
        open
        title="Delete account?"
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete account?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables both actions while loading", () => {
    render(
      <ConfirmDialog
        description="Saving"
        loading
        onClose={() => undefined}
        onConfirm={() => undefined}
        open
        title="Save changes?"
      />,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Working…" })).toBeDisabled();
  });
});

describe("BottomSheet", () => {
  it("renders sheet content and closes from the close button", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet onClose={onClose} open title="Filters">
        <p>Sheet body</p>
      </BottomSheet>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Sheet body")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close sheet" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("ErrorState and ErrorBoundary", () => {
  it("renders status copy and actions", () => {
    render(<ErrorState actions={<Button>Retry</Button>} code="404" status="not-found" />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("catches render errors and recovers on retry", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    let shouldThrow = true;

    function Boom() {
      if (shouldThrow) throw new Error("Boom");
      return <span>Recovered</span>;
    }

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
    shouldThrow = false;
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("Recovered")).toBeInTheDocument();
    consoleError.mockRestore();
  });
});

describe("TreeTable", () => {
  const nodes: TreeTableNode[] = [
    {
      id: "src",
      label: "src",
      children: [{ id: "index", label: "index.ts" }],
    },
    { id: "readme", label: "README.md" },
  ];
  const columns: TreeTableColumn[] = [
    { id: "name", header: "Name", render: (node) => node.label },
  ];

  it("expands and collapses child rows", () => {
    const onExpandedChange = vi.fn();
    render(<TreeTable ariaLabel="Files" columns={columns} nodes={nodes} onExpandedChange={onExpandedChange} />);

    expect(screen.queryByText("index.ts")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand src" }));
    expect(screen.getByText("index.ts")).toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenCalledWith(["src"]);
  });

  it("supports controlled expansion", () => {
    render(<TreeTable ariaLabel="Files" columns={columns} expandedIds={["src"]} nodes={nodes} />);
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("shows an empty message", () => {
    render(<TreeTable ariaLabel="Files" columns={columns} emptyMessage="Nothing here" nodes={[]} />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });
});

describe("Markdown", () => {
  it("renders GFM content and opens external links in a new tab", () => {
    render(
      <Markdown>
        {"# Guide\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n[Opus](https://example.com)"}
      </Markdown>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Guide" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Opus" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
  });
});

describe("OverflowToolbar", () => {
  it("renders toolbar actions", () => {
    render(
      <OverflowToolbar label="Editor actions">
        <Button>Save</Button>
        <Button>Preview</Button>
      </OverflowToolbar>,
    );

    const toolbar = screen.getByRole("toolbar", { name: "Editor actions" });
    expect(within(toolbar).getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Preview" })).toBeInTheDocument();
  });
});

describe("AsyncMultiSelectField", () => {
  const people = [
    { label: "Emma Davis", value: "emma" },
    { label: "Michael Brown", value: "michael" },
  ];

  function Wrapper() {
    const [value, setValue] = useState<typeof people>([]);
    return (
      <AsyncMultiSelectField
        defaultOptions={people}
        id="people"
        label="People"
        loadOptions={async () => people}
        onChange={setValue}
        value={value}
      />
    );
  }

  it("adds and removes selected values", async () => {
    render(<Wrapper />);
    const input = screen.getByRole("combobox", { name: "People" });
    fireEvent.focus(input);

    const option = await screen.findByRole("option", { name: /Emma Davis/ });
    fireEvent.click(option);

    expect(screen.getByRole("button", { name: "Remove Emma Davis" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove Emma Davis" }));
    expect(screen.queryByRole("button", { name: "Remove Emma Davis" })).not.toBeInTheDocument();
  });
});

describe("Disabled field parity", () => {
  it("disables numeric steppers and inputs together", () => {
    render(<NumberField disabled id="quantity" label="Quantity" value={2} onChange={() => undefined} />);
    expect(screen.getByLabelText("Quantity")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Decrease Quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase Quantity" })).toBeDisabled();
  });

  it("disables multi-select triggers", () => {
    render(
      <MultiSelectField
        disabled
        id="tags"
        label="Tags"
        options={["Design", "Engineering"]}
        value={[]}
        onChange={() => undefined}
      />,
    );
    expect(document.getElementById("tags")).toBeDisabled();
  });
});
