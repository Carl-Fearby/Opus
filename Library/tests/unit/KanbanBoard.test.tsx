import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KanbanBoard, type KanbanCard, type KanbanColumn } from "../../components/KanbanBoard";

const cards: Record<string, KanbanCard> = {
  alpha: {
    id: "alpha",
    title: "Alpha ticket",
    meta: "Planning",
    comments: [
      { id: "c1", author: "Sam Carter", body: "Existing comment", createdAt: "2026-10-22T10:00:00.000Z" },
    ],
  },
  beta: { id: "beta", title: "Beta ticket", meta: "Design" },
};

const columns: KanbanColumn[] = [
  { id: "todo", title: "To do", cardIds: ["alpha"] },
  { id: "doing", title: "Doing", cardIds: ["beta"] },
];

describe("KanbanBoard", () => {
  it("adds a new list through the add list composer", () => {
    const onChange = vi.fn();
    render(<KanbanBoard cards={cards} columns={columns} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Add list" }));
    fireEvent.change(screen.getByLabelText("List title"), { target: { value: "Review" } });
    fireEvent.click(screen.getByRole("button", { name: "Add list" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as KanbanColumn[];
    expect(next).toHaveLength(3);
    expect(next[2]).toMatchObject({ title: "Review", cardIds: [] });
    // The composer stays open so another list can be added immediately.
    expect(screen.getByLabelText("List title")).toBeInTheDocument();
  });

  it("reads and adds comments to a ticket", () => {
    const onAddComment = vi.fn();
    render(<KanbanBoard cards={cards} columns={columns} onAddComment={onAddComment} />);

    fireEvent.click(screen.getByRole("button", { name: "Comments for Alpha ticket, 1 comment" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Existing comment")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Add a comment"), {
      target: { value: "Looks good to me." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledWith(
      "alpha",
      expect.objectContaining({ body: "Looks good to me.", author: "You" }),
    );
    expect(screen.getByText("Looks good to me.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comments for Alpha ticket, 2 comments" })).toBeInTheDocument();
  });

  it("reorders lists with the keyboard handle", () => {
    const onChange = vi.fn();
    render(<KanbanBoard cards={cards} columns={columns} onChange={onChange} />);

    fireEvent.keyDown(
      screen.getByRole("button", { name: /Reorder To do/ }),
      { key: "ArrowRight" },
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as KanbanColumn[]).map((column) => column.id)).toEqual([
      "doing",
      "todo",
    ]);
  });
});

describe("KanbanBoard list editing", () => {
  it("renames a list inline", () => {
    const onChange = vi.fn();
    render(<KanbanBoard cards={cards} columns={columns} onChange={onChange} />);

    fireEvent.click(screen.getAllByTitle("Rename list")[0]);
    fireEvent.change(screen.getByLabelText("List name for To do"), {
      target: { value: "In review" },
    });
    fireEvent.keyDown(screen.getByLabelText("List name for To do"), { key: "Enter" });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as KanbanColumn[])[0]).toMatchObject({
      id: "todo",
      title: "In review",
    });
  });

  it("changes a list colour from the palette", () => {
    const onChange = vi.fn();
    render(<KanbanBoard cards={cards} columns={columns} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Change colour for To do" }));
    expect(screen.getByRole("dialog", { name: "Colour for To do" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Use #f59e0b" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as KanbanColumn[])[0]).toMatchObject({
      id: "todo",
      accent: "#f59e0b",
    });
  });
});
