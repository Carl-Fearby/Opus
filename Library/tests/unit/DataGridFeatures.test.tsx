import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid, type DataGridColumn, type DataGridRow } from "../../components/DataGrid";
import { getRowCellText } from "../../components/DataGrid/dataGridLayout";

const columns: DataGridColumn[] = [
  { key: "name", label: "Name" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
];

const rows: DataGridRow[] = [
  { id: "1", values: { team: "Alpha", name: "Website refresh", owner: "Emma Davis", status: "Active" } },
  { id: "2", values: { team: "Beta", name: "Mobile app", owner: "Michael Brown", status: "Paused" } },
];

function StatusPill({ children }: { children: ReactNode }) {
  return <span className="statusPill">{children}</span>;
}

function LabelBadge({ label }: { label: string }) {
  return <span className="labelBadge">{label}</span>;
}

function rowLabels() {
  return screen.getAllByRole("rowheader").map((cell) => cell.textContent);
}

describe("DataGrid sorting of rich cell content", () => {
  it("sorts pills by the text rendered inside them", () => {
    const pillColumns: DataGridColumn[] = [
      { key: "name", label: "Name" },
      { key: "status", label: "Status", sortable: true },
    ];
    const pillRows: DataGridRow[] = [
      { id: "1", values: { team: "Team one", name: "Paused project", status: <StatusPill>Paused</StatusPill> } },
      { id: "2", values: { team: "Team two", name: "Active project", status: <StatusPill>Active</StatusPill> } },
      { id: "3", values: { team: "Team three", name: "Review project", status: <StatusPill>Review</StatusPill> } },
    ];

    render(<DataGrid columns={pillColumns} rows={pillRows} />);
    expect(rowLabels()).toEqual(["Team one", "Team two", "Team three"]);

    fireEvent.click(screen.getByRole("button", { name: "Sort by Status" }));
    expect(rowLabels()).toEqual(["Team two", "Team one", "Team three"]);

    fireEvent.click(screen.getByRole("button", { name: "Status, sorted ascending" }));
    expect(rowLabels()).toEqual(["Team three", "Team one", "Team two"]);
  });

  it("sorts label-only components by their label", () => {
    const badgeColumns: DataGridColumn[] = [
      { key: "name", label: "Name" },
      { key: "status", label: "Status", sortable: true },
    ];
    const badgeRows: DataGridRow[] = [
      { id: "1", values: { team: "Team one", name: "First", status: <LabelBadge label="Blocked" /> } },
      { id: "2", values: { team: "Team two", name: "Second", status: <LabelBadge label="Approved" /> } },
    ];

    render(<DataGrid columns={badgeColumns} rows={badgeRows} />);

    fireEvent.click(screen.getByRole("button", { name: "Sort by Status" }));
    expect(rowLabels()).toEqual(["Team two", "Team one"]);
  });

  it("derives text from nested markup for filtering and grouping", () => {
    const row: DataGridRow = {
      id: "1",
      values: {
        team: "Atlas",
        status: <LabelBadge label="Blocked" />,
        nested: (
          <StatusPill>
            <LabelBadge label="Review" />
          </StatusPill>
        ),
        mixed: [3, <StatusPill key="high">high</StatusPill>],
      },
    };

    expect(getRowCellText(row, "status")).toBe("Blocked");
    expect(getRowCellText(row, "nested")).toBe("Review");
    expect(getRowCellText(row, "mixed")).toBe("3 high");
    expect(getRowCellText(row, "team")).toBe("Atlas");
  });
});

describe("DataGrid column management", () => {
  it("hides and restores columns from the Columns menu", () => {
    render(<DataGrid caption="Projects" columnManager columns={columns} rows={rows} />);

    expect(screen.getByRole("columnheader", { name: /Owner/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Columns" }));

    const ownerToggle = screen.getByRole("checkbox", { name: /Owner/ });
    expect(ownerToggle).toBeChecked();

    fireEvent.click(ownerToggle);
    expect(screen.queryByRole("columnheader", { name: /Owner/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Emma Davis")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show all" }));
    expect(screen.getByRole("columnheader", { name: /Owner/ })).toBeInTheDocument();
  });

  it("respects controlled column visibility", () => {
    render(
      <DataGrid
        columnManager
        columnVisibility={{ owner: false }}
        columns={columns}
        rows={rows}
      />,
    );

    expect(screen.queryByRole("columnheader", { name: /Owner/ })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
  });

  it("applies saved views and reports the selected view", () => {
    const onActiveViewChange = vi.fn();
    const onColumnVisibilityChange = vi.fn();

    render(
      <DataGrid
        columnManager
        columns={columns}
        rows={rows}
        views={[
          { id: "all", label: "All columns" },
          { id: "compact", label: "Compact", hiddenColumnKeys: ["owner", "status"] },
        ]}
        onActiveViewChange={onActiveViewChange}
        onColumnVisibilityChange={onColumnVisibilityChange}
      />,
    );

    const viewSelect = screen.getByLabelText("Saved view");
    fireEvent.change(viewSelect, { target: { value: "compact" } });

    expect(screen.getByRole("columnheader", { name: /Name/ })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /Owner/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Status" })).not.toBeInTheDocument();
    expect(onActiveViewChange).toHaveBeenCalledWith("compact");
    expect(onColumnVisibilityChange).toHaveBeenCalledWith({ owner: false, status: false });
  });
});
