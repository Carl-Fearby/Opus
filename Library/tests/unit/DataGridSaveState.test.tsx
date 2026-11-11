import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataGrid, type DataGridColumn, type DataGridRow } from "../../components/DataGrid";
import { fitDataGridColumnWidths } from "../../components/DataGrid/dataGridState";

const columns: DataGridColumn[] = [
  { key: "name", label: "Name", resizable: true },
  { key: "owner", label: "Owner", resizable: true },
  { key: "status", label: "Status", resizable: true },
];

const rows: DataGridRow[] = [
  { id: "1", values: { team: "Alpha", name: "Website refresh", owner: "Emma", status: "Active" } },
];

const STORAGE_KEY = "opus-datagrid:projects";

function seed(widths: Record<string, number>, key = STORAGE_KEY) {
  window.localStorage.setItem(key, JSON.stringify({ updatedAt: 1, version: 1, widths }));
}

function savedWidths(key = STORAGE_KEY) {
  return JSON.parse(window.localStorage.getItem(key) ?? "{}").widths ?? {};
}

function headerWidth(label: string) {
  const header = screen.getByRole("columnheader", { name: new RegExp(label) });
  return Number.parseFloat(header.style.width);
}

function resizeHandle(label: string) {
  return screen.getByRole("columnheader", { name: new RegExp(label) }).lastElementChild as HTMLElement;
}

/** Captures the grid's ResizeObserver so a container width can be emitted. */
function stubResizeObserver() {
  const observers: ResizeObserverCallback[] = [];

  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        observers.push(callback);
      }

      disconnect() {}

      observe() {}

      unobserve() {}
    },
  );

  return (width: number) =>
    act(() => {
      for (const callback of observers) {
        callback(
          [{ contentRect: { width } } as unknown as ResizeObserverEntry],
          {} as ResizeObserver,
        );
      }
    });
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("DataGrid saveState", () => {
  it("restores saved widths for the matching grid", () => {
    seed({ name: 240, owner: 180 });

    render(<DataGrid columns={columns} rows={rows} saveState="projects" />);

    expect(headerWidth("Name")).toBe(240);
    expect(headerWidth("Owner")).toBe(180);
  });

  it("keeps each grid's widths separate", () => {
    seed({ name: 240 }, "opus-datagrid:projects");
    seed({ name: 300 }, "opus-datagrid:archive");

    const first = render(<DataGrid columns={columns} rows={rows} saveState="projects" />);
    expect(headerWidth("Name")).toBe(240);
    first.unmount();

    render(<DataGrid columns={columns} rows={rows} saveState="archive" />);
    expect(headerWidth("Name")).toBe(300);
  });

  it("ignores stored widths when saveState is off", () => {
    seed({ name: 240 });

    render(<DataGrid columns={columns} rows={rows} />);

    expect(Number.isNaN(headerWidth("Name"))).toBe(true);
  });

  it("writes the committed width on resize and reports it", () => {
    const onColumnWidthsChange = vi.fn();

    render(
      <DataGrid
        columns={columns}
        onColumnWidthsChange={onColumnWidthsChange}
        rows={rows}
        saveState="projects"
      />,
    );

    fireEvent.pointerDown(resizeHandle("Name"), { clientX: 200 });
    fireEvent.pointerMove(window, { clientX: 260 });
    fireEvent.pointerUp(window);

    expect(savedWidths().name).toBe(60);
    expect(onColumnWidthsChange).toHaveBeenCalledWith({ name: 60 });
  });

  it("scales down for a narrow container without overwriting saved widths", () => {
    const emit = stubResizeObserver();

    seed({ name: 300, owner: 300, status: 300 });

    render(<DataGrid columns={columns} rows={rows} saveState="projects" />);
    expect(headerWidth("Name")).toBe(300);

    emit(600);
    expect(headerWidth("Name")).toBeLessThan(300);
    expect(savedWidths().name).toBe(300);

    emit(1200);
    expect(headerWidth("Name")).toBe(300);
  });

  it("keeps the dragged width during the drag, then fits on release", () => {
    const emit = stubResizeObserver();

    seed({ name: 300, owner: 300, status: 300 });
    render(<DataGrid columns={columns} rows={rows} saveState="projects" />);

    emit(600);
    expect(headerWidth("Name")).toBeLessThan(300);

    fireEvent.pointerDown(resizeHandle("Name"), { clientX: 200 });
    fireEvent.pointerMove(window, { clientX: 260 });
    expect(headerWidth("Name")).toBe(360);

    fireEvent.pointerUp(window);
    expect(headerWidth("Name")).toBeLessThan(360);
    expect(savedWidths().name).toBe(360);
  });
});

describe("fitDataGridColumnWidths", () => {
  const base = {
    columns: ["team", "name", "owner"],
    defaultWidths: { name: 130, owner: 130, team: 180 },
    minWidths: { name: 60, owner: 60, team: 60 },
  };

  it("leaves widths alone when the intent fits", () => {
    expect(fitDataGridColumnWidths({ ...base, available: 900, widths: { name: 300 } })).toEqual({});
  });

  it("ignores the fit when nothing has been resized", () => {
    expect(fitDataGridColumnWidths({ ...base, available: 200, widths: {} })).toEqual({});
  });

  it("ignores an unmeasured container", () => {
    expect(fitDataGridColumnWidths({ ...base, available: 0, widths: { name: 600 } })).toEqual({});
  });

  it("scales columns down proportionally when the container is narrower", () => {
    const fitted = fitDataGridColumnWidths({
      ...base,
      available: 500,
      widths: { name: 300, owner: 300, team: 300 },
    });

    const total = Object.values(fitted).reduce((sum, width) => sum + width, 0);

    expect(fitted.name).toBeLessThan(300);
    expect(total).toBeLessThanOrEqual(500);
  });

  it("keeps the saved widths when even the minimums do not fit", () => {
    expect(fitDataGridColumnWidths({ ...base, available: 100, widths: { name: 600 } })).toEqual({});
    expect(fitDataGridColumnWidths({ ...base, available: 20, widths: { name: 600 } })).toEqual({});
  });
});
