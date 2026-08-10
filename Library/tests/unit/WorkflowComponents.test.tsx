import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AsyncSelectField } from "../../components/fields/AsyncSelectField";
import { SaveStateIndicator } from "../../components/SaveStateIndicator";
import { BulkActionBar } from "../../components/BulkActionBar";
import { EditableDataTable, type EditableDataTableRow } from "../../components/EditableDataTable";
import { FileManager } from "../../components/FileManager";
import { AuditLog } from "../../components/AuditLog";
import { UploadQueue } from "../../components/UploadQueue";

describe("workflow components", () => {
  it("reports save retry and bulk actions", () => {
    const retry = vi.fn();
    const action = vi.fn();
    const clear = vi.fn();
    const { rerender } = render(<SaveStateIndicator state="error" onRetry={retry} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledOnce();
    rerender(<BulkActionBar selectedCount={2} actions={[{ id: "archive", label: "Archive" }]} onAction={action} onClear={clear} />);
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(action).toHaveBeenCalledWith({ id: "archive", label: "Archive" });
    expect(clear).toHaveBeenCalledOnce();
  });

  it("loads and selects asynchronous options", async () => {
    const loadOptions = vi.fn().mockResolvedValue([{ label: "Emma Davis", value: "emma" }]);
    const onChange = vi.fn();
    render(<AsyncSelectField id="person" label="Person" debounceMs={0} loadOptions={loadOptions} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox", { name: "Person" }), { target: { value: "Emma" } });
    await waitFor(() => expect(loadOptions).toHaveBeenCalledWith("Emma"));
    fireEvent.click(await screen.findByRole("option", { name: "Emma Davis" }));
    expect(onChange).toHaveBeenCalledWith({ label: "Emma Davis", value: "emma" });
  });

  it("clears async options immediately when the query is deleted", () => {
    const onChange = vi.fn();
    render(
      <AsyncSelectField
        id="person-clear"
        label="Person"
        defaultOptions={[{ label: "Emma Davis", value: "emma" }]}
        loadOptions={vi.fn().mockResolvedValue([])}
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("combobox", { name: "Person" });
    fireEvent.focus(input);
    expect(screen.getByRole("option", { name: "Emma Davis" })).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "E" } });
    fireEvent.change(input, { target: { value: "" } });

    expect(screen.queryByRole("option", { name: "Emma Davis" })).not.toBeInTheDocument();
    expect(screen.getByText("No options found")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("edits rows and exposes row and selection actions", () => {
    const rows: EditableDataTableRow[] = [{ id: "1", values: { name: "Emma", status: "Active" } }];
    const onRowsChange = vi.fn();
    const onRowSave = vi.fn();
    const onBulkAction = vi.fn();
    render(<EditableDataTable columns={[{ key: "name", label: "Name", editable: true }, { key: "status", label: "Status" }]} rows={rows} onRowsChange={onRowsChange} onRowSave={onRowSave} onBulkAction={onBulkAction} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Name for row 1" }), { target: { value: "Emma Davis" } });
    expect(onRowsChange).toHaveBeenCalledWith([{ id: "1", values: { name: "Emma Davis", status: "Active" } }]);
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onRowSave).toHaveBeenCalledWith(rows[0]);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Archive" }));
    expect(onBulkAction).toHaveBeenCalledWith({ id: "archive", label: "Archive" }, rows);
  });

  it("reports file, audit, and upload queue interactions", () => {
    const onOpen = vi.fn();
    const onEntryClick = vi.fn();
    const onRetry = vi.fn();
    const { rerender } = render(<FileManager entries={[{ id: "1", name: "Brief.pdf", type: "file" }]} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole("button", { name: /Brief.pdf/ }));
    expect(onOpen).toHaveBeenCalledWith({ id: "1", name: "Brief.pdf", type: "file" });
    rerender(<AuditLog entries={[{ id: "1", actor: "Emma", action: "updated contact", timestamp: "Now" }]} onEntryClick={onEntryClick} />);
    fireEvent.click(screen.getByRole("button", { name: /Emma updated contact/ }));
    expect(onEntryClick).toHaveBeenCalledOnce();
    rerender(<UploadQueue items={[{ id: "1", name: "Brief.pdf", progress: 20, status: "error" }]} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Retry Brief.pdf" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
