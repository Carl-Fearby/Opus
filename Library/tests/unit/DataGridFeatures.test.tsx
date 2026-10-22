import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid, type DataGridColumn, type DataGridRow } from "../../components/DataGrid";

const columns: DataGridColumn[] = [
  { key: "name", label: "Name" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
];

const rows: DataGridRow[] = [
  { id: "1", values: { team: "Alpha", name: "Website refresh", owner: "Emma Davis", status: "Active" } },
  { id: "2", values: { team: "Beta", name: "Mobile app", owner: "Michael Brown", status: "Paused" } },
];

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
