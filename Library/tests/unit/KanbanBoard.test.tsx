import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  KanbanBoard,
  type KanbanCard,
  type KanbanColumn,
  type KanbanMember,
  type KanbanTag,
} from "../../components/KanbanBoard";

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

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
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
    expect(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 2 comments" })).toBeInTheDocument();
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

describe("KanbanBoard tags", () => {
  it("creates tags from the board tag manager and emits activity", () => {
    const onTagsChange = vi.fn();
    const onActivity = vi.fn();
    render(
      <KanbanBoard
        cards={cards}
        columns={columns}
        onActivity={onActivity}
        onTagsChange={onTagsChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Tags/ }));
    expect(screen.getByRole("dialog", { name: "Tag manager" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("New tag"), { target: { value: "Customer" } });
    fireEvent.click(screen.getByRole("button", { name: "New tag colour #f59e0b" }));
    fireEvent.click(screen.getByRole("button", { name: "Add tag" }));

    expect(onTagsChange).toHaveBeenCalledTimes(1);
    expect(onTagsChange.mock.calls[0][0]).toEqual([
      expect.objectContaining({ label: "Customer", color: "#f59e0b" }),
    ]);
    expect(onActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: "tag-created" }),
    );
    expect(screen.getByRole("button", { name: "Customer" })).toBeInTheDocument();
  });

  it("renames a tag inline", () => {
    const tags: KanbanTag[] = [{ id: "t1", label: "Customer", color: "#f59e0b" }];
    const onTagsChange = vi.fn();
    render(
      <KanbanBoard cards={cards} columns={columns} onTagsChange={onTagsChange} tags={tags} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Tags/ }));
    fireEvent.click(screen.getByRole("button", { name: "Customer" }));
    fireEvent.change(screen.getByLabelText("Tag name for Customer"), {
      target: { value: "Account" },
    });
    fireEvent.keyDown(screen.getByLabelText("Tag name for Customer"), { key: "Enter" });

    expect(onTagsChange.mock.calls[0][0]).toEqual([
      { id: "t1", label: "Account", color: "#f59e0b" },
    ]);
  });

  it("assigns tags to a card from its thread", () => {
    const tags: KanbanTag[] = [{ id: "t1", label: "VIP", color: "#ec4899" }];
    const onCardTagsChange = vi.fn();
    render(
      <KanbanBoard
        cards={{ ...cards, alpha: { ...cards.alpha, tagIds: [] } }}
        columns={columns}
        onCardTagsChange={onCardTagsChange}
        tags={tags}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
    fireEvent.click(screen.getByRole("button", { name: "+ Add tag" }));
    fireEvent.click(screen.getByRole("button", { name: "VIP" }));

    expect(onCardTagsChange).toHaveBeenCalledWith(
      "alpha",
      ["t1"],
      expect.objectContaining({ id: "alpha" }),
    );
  });
});

describe("KanbanBoard card creation", () => {
  it("adds a card from the inline composer", () => {
    const onChange = vi.fn();
    const onCardCreate = vi.fn();
    const onActivity = vi.fn();
    render(
      <KanbanBoard
        cards={cards}
        columns={columns}
        onActivity={onActivity}
        onCardCreate={onCardCreate}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Add a card" })[0]);
    const input = screen.getByLabelText("New card title for To do");
    fireEvent.change(input, { target: { value: "Ship the release" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledTimes(1);
    const nextColumns = onChange.mock.calls[0][0] as KanbanColumn[];
    expect(nextColumns[0].cardIds).toHaveLength(2);

    expect(onCardCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Ship the release" }),
      "todo",
      expect.any(Array),
      expect.objectContaining({ alpha: expect.any(Object) }),
    );
    expect(onActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: "card-created" }),
    );
    expect(screen.getByLabelText("New card title for To do")).toBeInTheDocument();
  });
});

describe("KanbanBoard ticket view", () => {
  it("updates the title and description through onCardUpdate", () => {
    const onCardUpdate = vi.fn();
    render(
      <KanbanBoard cards={cards} columns={columns} onCardUpdate={onCardUpdate} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
    fireEvent.change(screen.getByLabelText("Ticket title"), { target: { value: "Alpha ticket revised" } });
    fireEvent.blur(screen.getByLabelText("Ticket title"));
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Add acceptance criteria." },
    });
    fireEvent.blur(screen.getByLabelText("Description"));

    expect(onCardUpdate).toHaveBeenCalledWith(
      "alpha",
      { title: "Alpha ticket revised" },
      expect.objectContaining({ id: "alpha" }),
    );
    expect(onCardUpdate).toHaveBeenCalledWith(
      "alpha",
      { description: "Add acceptance criteria." },
      expect.objectContaining({ description: "Add acceptance criteria." }),
    );
  });

  it("updates the ticket header colour", () => {
    const onCardUpdate = vi.fn();
    render(
      <KanbanBoard cards={cards} columns={columns} onCardUpdate={onCardUpdate} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
    fireEvent.click(screen.getByRole("button", { name: "Change ticket header colour" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Use #f59e0b for ticket header" }),
    );

    expect(onCardUpdate).toHaveBeenCalledWith(
      "alpha",
      { color: "#f59e0b" },
      expect.objectContaining({ color: "#f59e0b" }),
    );
  });
});

const members: KanbanMember[] = [
  { id: "m1", name: "Emma Davis", role: "Design", color: "#ec4899" },
  { id: "m2", name: "Michael Brown", role: "Engineering", color: "#0ea5e9" },
];

describe("KanbanBoard members and ticket activation", () => {
  it("opens the ticket when the card body is clicked", () => {
    const onActiveCardChange = vi.fn();
    render(
      <KanbanBoard
        cards={cards}
        columns={columns}
        onActiveCardChange={onActiveCardChange}
      />,
    );

    fireEvent.click(screen.getByText("Alpha ticket"));
    expect(onActiveCardChange).toHaveBeenCalledWith(
      "alpha",
      expect.objectContaining({ id: "alpha" }),
    );
  });

  it("assigns and unassigns a member from the ticket", () => {
    const onCardAssigneesChange = vi.fn();
    render(
      <KanbanBoard
        cards={{ ...cards, alpha: { ...cards.alpha, assigneeIds: [] } }}
        columns={columns}
        defaultMembers={members}
        onCardAssigneesChange={onCardAssigneesChange}
      />,
    );

    fireEvent.click(screen.getByText("Alpha ticket"));
    fireEvent.click(screen.getByRole("button", { name: "+ Add member" }));
    fireEvent.click(screen.getByRole("button", { name: /Emma Davis/ }));

    expect(onCardAssigneesChange).toHaveBeenCalledWith(
      "alpha",
      ["m1"],
      expect.objectContaining({ id: "alpha" }),
    );
  });

  it("creates and assigns a new tag from the ticket picker", () => {
    const onTagsChange = vi.fn();
    const onCardTagsChange = vi.fn();
    render(
      <KanbanBoard
        cards={{ ...cards, alpha: { ...cards.alpha, tagIds: [] } }}
        columns={columns}
        onCardTagsChange={onCardTagsChange}
        onTagsChange={onTagsChange}
      />,
    );

    fireEvent.click(screen.getByText("Alpha ticket"));
    fireEvent.click(screen.getByRole("button", { name: "+ Add tag" }));
    fireEvent.change(screen.getByLabelText("New tag name"), {
      target: { value: "Needs review" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create tag" }));

    expect(onTagsChange).toHaveBeenCalledWith([
      expect.objectContaining({ label: "Needs review" }),
    ]);
    expect(onCardTagsChange).toHaveBeenCalledWith(
      "alpha",
      [expect.any(String)],
      expect.objectContaining({ id: "alpha" }),
    );
  });
});
