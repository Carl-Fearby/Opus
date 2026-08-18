import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InfiniteSelectableList } from "../../components/InfiniteSelectableList";
import { defaultSettings } from "../../lib/controls/defaults";
import { generateUsageCode } from "../../lib/controls/generateUsageCode";
import { compilePlaygroundCode } from "../../lib/playground/compilePlaygroundCode";
import { ControlPreview } from "../../components/control-detail/ControlDetail/ControlPreview";
import { UsagePreview } from "../../components/control-detail/ControlDetail/UsagePreview";

const items = Array.from({ length: 8 }, (_, index) => ({
  id: `mail-${index}`,
  subject: `Message ${index + 1}`,
}));

function renderList(onSelectionChange = vi.fn()) {
  render(
    <InfiniteSelectableList
      ariaLabel="Inbox"
      getItemId={(item) => item.id}
      height={240}
      itemHeight={48}
      items={items}
      renderItem={(item) => <span>{item.subject}</span>}
      onSelectionChange={onSelectionChange}
    />,
  );
  return onSelectionChange;
}

describe("InfiniteSelectableList", () => {
  it("defaults the catalogue to loaded-page scrollbar sizing", () => {
    const settings = defaultSettings["infinite-selectable-list"];
    expect(settings.scrollbarSizing).toBe("loaded");

    const usage = generateUsageCode(
      "infinite-selectable-list",
      settings,
      "content",
    ).full;
    expect(usage).not.toContain("totalItemCount=");

    const knownTotalUsage = generateUsageCode(
      "infinite-selectable-list",
      { ...settings, scrollbarSizing: "virtual", virtualItemCount: 5000 },
      "content",
    ).full;
    expect(knownTotalUsage).toContain("totalItemCount={5000}");
  });

  it("mounts only the visible window even when the server reports a large total", () => {
    const manyItems = Array.from({ length: 100 }, (_, index) => ({
      id: `large-mail-${index}`,
      subject: `Large message ${index + 1}`,
    }));
    render(
      <InfiniteSelectableList
        ariaLabel="Large inbox"
        getItemId={(item) => item.id}
        height={240}
        itemHeight={48}
        items={manyItems}
        totalItemCount={5000}
        renderItem={(item) => <span>{item.subject}</span>}
        showScrollbar={false}
      />,
    );

    expect(screen.getAllByRole("option")).toHaveLength(9);
    expect(screen.queryByText("Large message 100")).not.toBeInTheDocument();
  });

  it("keeps the catalogue usage example executable", () => {
    const usage = generateUsageCode(
      "infinite-selectable-list",
      defaultSettings["infinite-selectable-list"],
      "content",
    ).full;
    const Preview = compilePlaygroundCode(usage);
    render(<Preview />);
    expect(screen.getByRole("listbox", { name: "Inbox messages" })).toBeInTheDocument();
  });

  it("reports catalogue selection data outside the component", () => {
    render(
      <ControlPreview
        category="content"
        slug="infinite-selectable-list"
        settings={defaultSettings["infinite-selectable-list"]}
        onSettingsChange={() => undefined}
      />,
    );
    fireEvent.mouseDown(screen.getAllByRole("option")[0], { button: 0 });
    expect(screen.getByText("Last action: Selected 1 message")).toBeInTheDocument();
    expect(screen.getByTestId("control-preview-data")).toHaveTextContent("mail-0");
  });

  it("reports mouse and keyboard selection from the real catalogue usage preview", async () => {
    render(
      <UsagePreview
        category="content"
        slug="infinite-selectable-list"
        settings={defaultSettings["infinite-selectable-list"]}
      />,
    );
    const first = screen.getAllByRole("option")[0];
    fireEvent.mouseDown(first, { button: 0 });
    fireEvent.click(first);
    expect(await screen.findByTestId("usage-preview-data")).toHaveTextContent("mail-0");

    fireEvent.keyDown(screen.getByRole("listbox", { name: "Inbox messages" }), {
      key: "ArrowDown",
      shiftKey: true,
    });
    await waitFor(() => {
      expect(screen.getByTestId("usage-preview-data")).toHaveTextContent("mail-1");
    });
  });

  it("supports single, additive, and shift-range pointer selection", () => {
    const change = renderList();
    fireEvent.mouseDown(screen.getByRole("option", { name: "Message 2" }), { button: 0 });
    expect(change).toHaveBeenLastCalledWith(["mail-1"], expect.objectContaining({ reason: "click" }));

    fireEvent.mouseDown(screen.getByRole("option", { name: "Message 4" }), {
      button: 0,
      ctrlKey: true,
    });
    expect(change).toHaveBeenLastCalledWith(
      ["mail-1", "mail-3"],
      expect.objectContaining({ reason: "click" }),
    );

    fireEvent.mouseDown(screen.getByRole("option", { name: "Message 6" }), {
      button: 0,
      shiftKey: true,
    });
    expect(change).toHaveBeenLastCalledWith(
      ["mail-3", "mail-4", "mail-5"],
      expect.objectContaining({ reason: "click" }),
    );
  });

  it("makes the selection control optional and renders an Opus checkbox when requested", () => {
    const { container, rerender } = render(
      <InfiniteSelectableList
        ariaLabel="Inbox"
        getItemId={(item) => item.id}
        height={240}
        itemHeight={48}
        items={items}
        renderItem={(item) => <span>{item.subject}</span>}
      />,
    );
    expect(container.querySelector("input[type='checkbox'], input[type='radio']")).toBeNull();

    rerender(
      <InfiniteSelectableList
        ariaLabel="Inbox"
        getItemId={(item) => item.id}
        height={240}
        itemHeight={48}
        items={items}
        selectionIndicator="checkbox"
        renderItem={(item) => <span>{item.subject}</span>}
      />,
    );
    const checkbox = container.querySelector<HTMLInputElement>("input[type='checkbox']");
    expect(checkbox).not.toBeNull();
    fireEvent.mouseDown(screen.getByRole("option", { name: "Message 1" }), { button: 0 });
    expect(checkbox).toBeChecked();
  });

  it("uses radio-styled controls while retaining multi-selection and all selected data", () => {
    const change = vi.fn();
    const { container } = render(
      <InfiniteSelectableList
        ariaLabel="Inbox"
        getItemId={(item) => item.id}
        height={240}
        itemHeight={48}
        items={items}
        selectionIndicator="radio"
        renderItem={(item) => <span>{item.subject}</span>}
        onSelectionChange={change}
      />,
    );
    expect(container.querySelectorAll("input[type='radio']")).toHaveLength(8);
    expect(screen.getByRole("listbox", { name: "Inbox" })).toHaveAttribute("aria-multiselectable", "true");

    const selectors = container.querySelectorAll<HTMLElement>("[data-selection-control]");
    fireEvent.mouseDown(selectors[1], { button: 0 });
    fireEvent.mouseDown(selectors[4], { button: 0 });
    expect(change).toHaveBeenLastCalledWith(
      ["mail-1", "mail-4"],
      expect.objectContaining({
        focusedId: "mail-4",
        selectedItems: [items[1], items[4]],
      }),
    );
    expect(container.querySelectorAll("input[type='radio']:checked")).toHaveLength(2);
  });

  it.each(["checkbox", "radio"] as const)(
    "preserves non-contiguous %s choices while controlled updates are pending",
    (selectionIndicator) => {
    const change = vi.fn();
    const { container } = render(
      <InfiniteSelectableList
        ariaLabel="Inbox"
        getItemId={(item) => item.id}
        height={240}
        itemHeight={48}
        items={items}
        selectedIds={[]}
        selectionIndicator={selectionIndicator}
        renderItem={(item) => <span>{item.subject}</span>}
        onSelectionChange={change}
      />,
    );

    const selectors = container.querySelectorAll<HTMLElement>("[data-selection-control]");
    fireEvent.mouseDown(selectors[0], { button: 0 });
    fireEvent.mouseDown(selectors[2], { button: 0 });
    fireEvent.mouseDown(selectors[4], { button: 0 });

    expect(change).toHaveBeenLastCalledWith(
      ["mail-0", "mail-2", "mail-4"],
      expect.objectContaining({
        focusedId: "mail-4",
        selectedItems: [items[0], items[2], items[4]],
      }),
    );
    },
  );

  it.each(["checkbox", "radio"] as const)(
    "treats the full row as an additive %s target",
    (selectionIndicator) => {
      const change = vi.fn();
      render(
        <InfiniteSelectableList
          ariaLabel="Inbox"
          getItemId={(item) => item.id}
          height={240}
          itemHeight={48}
          items={items}
          selectionIndicator={selectionIndicator}
          renderItem={(item) => <span>{item.subject}</span>}
          onSelectionChange={change}
        />,
      );

      fireEvent.mouseDown(screen.getByRole("option", { name: "Message 1" }), { button: 0 });
      fireEvent.mouseUp(window);
      fireEvent.mouseDown(screen.getByRole("option", { name: "Message 3" }), { button: 0 });
      fireEvent.mouseUp(window);
      fireEvent.mouseDown(screen.getByRole("option", { name: "Message 5" }), { button: 0 });
      fireEvent.mouseUp(window);

      expect(change).toHaveBeenLastCalledWith(
        ["mail-0", "mail-2", "mail-4"],
        expect.objectContaining({ reason: "click" }),
      );
    },
  );

  it("uses Ctrl/Cmd as add-only modifiers instead of deselecting an existing row", () => {
    const change = vi.fn();
    render(
      <InfiniteSelectableList
        ariaLabel="Inbox"
        getItemId={(item) => item.id}
        height={240}
        itemHeight={48}
        items={items}
        selectionIndicator="checkbox"
        renderItem={(item) => <span>{item.subject}</span>}
        onSelectionChange={change}
      />,
    );

    const first = screen.getByRole("option", { name: "Message 1" });
    fireEvent.mouseDown(first, { button: 0 });
    fireEvent.mouseUp(window);
    fireEvent.mouseDown(first, { button: 0, ctrlKey: true });
    fireEvent.mouseUp(window);
    expect(change).toHaveBeenLastCalledWith(
      ["mail-0"],
      expect.objectContaining({ reason: "click" }),
    );

    fireEvent.mouseDown(screen.getByRole("option", { name: "Message 3" }), {
      button: 0,
      metaKey: true,
    });
    fireEvent.mouseUp(window);
    expect(change).toHaveBeenLastCalledWith(
      ["mail-0", "mail-2"],
      expect.objectContaining({ reason: "click" }),
    );
  });

  it("uses Ctrl/Cmd+Space as an add-only keyboard selection", () => {
    const change = renderList();
    const listbox = screen.getByRole("listbox", { name: "Inbox" });

    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: " ", ctrlKey: true });

    expect(change).toHaveBeenLastCalledWith(
      ["mail-0"],
      expect.objectContaining({ reason: "keyboard" }),
    );
  });

  it("extends selection with Shift+Arrow and selects loaded rows with Ctrl+A", () => {
    const change = renderList();
    const listbox = screen.getByRole("listbox", { name: "Inbox" });
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "ArrowDown", shiftKey: true });
    expect(change).toHaveBeenLastCalledWith(
      ["mail-0", "mail-1"],
      expect.objectContaining({ reason: "keyboard" }),
    );
    fireEvent.keyDown(listbox, { key: "a", ctrlKey: true });
    expect(change).toHaveBeenLastCalledWith(
      items.map((item) => item.id),
      expect.objectContaining({ reason: "select-all" }),
    );
  });

  it("activates a focused item with Enter", () => {
    const activate = vi.fn();
    render(
      <InfiniteSelectableList
        ariaLabel="Inbox"
        getItemId={(item) => item.id}
        height={240}
        itemHeight={48}
        items={items}
        renderItem={(item) => <span>{item.subject}</span>}
        onItemActivate={activate}
      />,
    );
    const listbox = screen.getByRole("listbox", { name: "Inbox" });
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "Enter" });
    expect(activate).toHaveBeenCalledWith(items[0], 0);
  });

  it("selects a contiguous range by dragging across rows", () => {
    const change = renderList();
    fireEvent.mouseDown(screen.getByRole("option", { name: "Message 2" }), { button: 0 });
    fireEvent.mouseEnter(screen.getByRole("option", { name: "Message 5" }), { buttons: 1 });
    expect(change).toHaveBeenLastCalledWith(
      ["mail-1", "mail-2", "mail-3", "mail-4"],
      expect.objectContaining({ reason: "drag" }),
    );
  });

  it("requests the next page as the visible range approaches the loaded end", () => {
    const loadMore = vi.fn();
    render(
      <InfiniteSelectableList
        ariaLabel="Inbox"
        getItemId={(item) => item.id}
        hasMore
        height={240}
        itemHeight={48}
        items={items}
        loadMoreThreshold={2}
        renderItem={(item) => <span>{item.subject}</span>}
        showScrollbar={false}
        onLoadMore={loadMore}
      />,
    );
    const listbox = screen.getByRole("listbox", { name: "Inbox" });
    Object.defineProperty(listbox, "scrollTop", { configurable: true, value: 160 });
    fireEvent.scroll(listbox);
    expect(loadMore).toHaveBeenCalledTimes(1);
  });
});
