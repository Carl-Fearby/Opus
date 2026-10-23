import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

function setRichText(label: string, html: string) {
  const editor = screen.getByLabelText(label);
  editor.innerHTML = html;
  fireEvent.input(editor);
}

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

    setRichText("Add a comment", "<p>Looks good to me.</p>");
    fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledWith(
      "alpha",
      expect.objectContaining({ body: "<p>Looks good to me.</p>", author: "You" }),
    );
    expect(screen.getByRole("list", { name: "Comments" })).toHaveTextContent(
      "Looks good to me.",
    );
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
    setRichText("Description", "<p>Add acceptance criteria.</p>");
    fireEvent.blur(screen.getByLabelText("Description"));

    expect(onCardUpdate).toHaveBeenCalledWith(
      "alpha",
      { title: "Alpha ticket revised" },
      expect.objectContaining({ id: "alpha" }),
    );
    expect(onCardUpdate).toHaveBeenCalledWith(
      "alpha",
      { description: "<p>Add acceptance criteria.</p>" },
      expect.objectContaining({ description: "<p>Add acceptance criteria.</p>" }),
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

describe("KanbanBoard attachments", () => {
  it("shows ticket attachments and removes them with a persisted callback", () => {
    const onCardAttachmentsChange = vi.fn();
    const onActivity = vi.fn();
    const attachment = {
      id: "a1",
      name: "brief.pdf",
      size: 2048,
      mimeType: "application/pdf",
      url: "https://example.com/brief.pdf",
    };

    render(
      <KanbanBoard
        cards={{ ...cards, alpha: { ...cards.alpha, attachments: [attachment] } }}
        columns={columns}
        onActivity={onActivity}
        onCardAttachmentsChange={onCardAttachmentsChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
    expect(screen.getByRole("link", { name: "brief.pdf" })).toHaveAttribute(
      "href",
      "https://example.com/brief.pdf",
    );
    expect(screen.getByRole("link", { name: "Download brief.pdf" })).toHaveAttribute(
      "download",
      "brief.pdf",
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove brief.pdf" }));

    expect(onCardAttachmentsChange).toHaveBeenCalledWith(
      "alpha",
      [],
      expect.objectContaining({ id: "alpha" }),
    );
    expect(onActivity).toHaveBeenCalledWith(
      expect.objectContaining({ type: "card-attachments-changed", attachments: [] }),
    );
    expect(screen.queryByRole("link", { name: "brief.pdf" })).not.toBeInTheDocument();
  });

  it("uploads a ticket file through the async attachment adapter", async () => {
    const onAttachmentUpload = vi.fn(async (file: File) => ({
      id: "server-a1",
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: "https://cdn.example.com/notes.txt",
      downloadUrl: "https://cdn.example.com/notes.txt?download=1",
    }));
    const onCardAttachmentsChange = vi.fn();

    render(
      <KanbanBoard
        cards={cards}
        columns={columns}
        onAttachmentUpload={onAttachmentUpload}
        onCardAttachmentsChange={onCardAttachmentsChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("Attach files to ticket"), {
      target: { files: [file] },
    });

    expect(onCardAttachmentsChange).not.toHaveBeenCalled();
    expect(screen.getByText("Uploading…")).toBeInTheDocument();
    expect(onAttachmentUpload).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ cardId: "alpha", target: "card" }),
    );

    await waitFor(() => {
      expect(onCardAttachmentsChange).toHaveBeenCalledWith(
        "alpha",
        [
          expect.objectContaining({
            id: "server-a1",
            name: "notes.txt",
            url: "https://cdn.example.com/notes.txt",
          }),
        ],
        expect.objectContaining({ id: "alpha" }),
      );
    });
    expect(screen.getByRole("link", { name: "Download notes.txt" })).toHaveAttribute(
      "href",
      "https://cdn.example.com/notes.txt?download=1",
    );
    expect(screen.queryByText("Uploading…")).not.toBeInTheDocument();
  });

  it("uploads comment files before including them in the comment payload", async () => {
    const onAddComment = vi.fn();
    const onAttachmentUpload = vi.fn(async (file: File) => ({
      id: "server-c1",
      name: file.name,
      size: file.size,
      mimeType: file.type,
      url: "https://cdn.example.com/screenshot.txt",
    }));

    render(
      <KanbanBoard
        cards={cards}
        columns={columns}
        onAddComment={onAddComment}
        onAttachmentUpload={onAttachmentUpload}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
    const file = new File(["comment attachment"], "screenshot.txt", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("Attach files to comment"), {
      target: { files: [file] },
    });

    expect(screen.getByText("Uploading…")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Uploading…")).not.toBeInTheDocument();
    });
    expect(onAttachmentUpload).toHaveBeenCalledWith(
      file,
      expect.objectContaining({ cardId: "alpha", target: "comment" }),
    );

    setRichText("Add a comment", "<p>See attached.</p>");
    fireEvent.click(screen.getByRole("button", { name: "Add comment" }));

    expect(onAddComment).toHaveBeenCalledWith(
      "alpha",
      expect.objectContaining({
        body: "<p>See attached.</p>",
        attachments: [
          expect.objectContaining({
            id: "server-c1",
            name: "screenshot.txt",
            size: 18,
            url: "https://cdn.example.com/screenshot.txt",
          }),
        ],
      }),
    );
    expect(screen.getByRole("link", { name: "screenshot.txt" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download screenshot.txt" })).toHaveAttribute(
      "href",
      "https://cdn.example.com/screenshot.txt",
    );
  });
});

describe("KanbanBoard rich text", () => {
  it("uploads inline images for descriptions and comments", async () => {
    const onAttachmentUpload = vi.fn(async (file: File) => ({
      id: "inline-1",
      mimeType: file.type,
      name: file.name,
      size: file.size,
      url: "https://cdn.example.com/inline.png",
    }));
    const onCardUpdate = vi.fn();

    render(
      <KanbanBoard
        cards={cards}
        columns={columns}
        onAttachmentUpload={onAttachmentUpload}
        onCardUpdate={onCardUpdate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open ticket for Alpha ticket, 1 comment" }));
    const image = new File(["image"], "inline.png", { type: "image/png" });
    const imageInputs = screen.getAllByLabelText("Insert images");

    fireEvent.change(imageInputs[0], { target: { files: [image] } });
    await waitFor(() => {
      expect(onAttachmentUpload).toHaveBeenCalledWith(
        image,
        expect.objectContaining({ cardId: "alpha", target: "description" }),
      );
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Description").querySelector("img")).toHaveAttribute(
        "src",
        "https://cdn.example.com/inline.png",
      );
    });

    fireEvent.blur(screen.getByLabelText("Description"));
    expect(onCardUpdate).toHaveBeenCalledWith(
      "alpha",
      { description: expect.stringContaining('src="https://cdn.example.com/inline.png"') },
      expect.objectContaining({ id: "alpha" }),
    );

    fireEvent.change(screen.getAllByLabelText("Insert images")[1], {
      target: { files: [image] },
    });
    await waitFor(() => {
      expect(onAttachmentUpload).toHaveBeenCalledWith(
        image,
        expect.objectContaining({ cardId: "alpha", target: "comment" }),
      );
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Add a comment").querySelector("img")).toHaveAttribute(
        "src",
        "https://cdn.example.com/inline.png",
      );
    });
  });
});

describe("KanbanBoard board chrome", () => {
  it("shows the board name, tag manager and scroll controls before any tags exist", () => {
    render(<KanbanBoard cards={cards} columns={columns} tags={[]} />);

    expect(screen.getByRole("heading", { name: "Kanban board" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tags/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll board left" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Scroll board right" })).toBeDisabled();
  });

  it("supports a custom board title", () => {
    render(<KanbanBoard boardTitle="Product roadmap" cards={cards} columns={columns} />);

    expect(screen.getByRole("heading", { name: "Product roadmap" })).toBeInTheDocument();
    expect(screen.getByLabelText("Product roadmap")).toBeInTheDocument();
  });

  it("pins the add-card control outside the scrolling card viewport", () => {
    const { container } = render(
      <KanbanBoard cards={cards} columns={columns} onChange={() => undefined} />,
    );
    const column = container.querySelector('[data-kanban-column-id="todo"]');
    const viewport = column?.querySelector('[data-kanban-cards-viewport]');

    expect(column).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(
      within(viewport as HTMLElement).queryByRole("button", { name: "Add a card" }),
    ).not.toBeInTheDocument();
    expect(
      within(column as HTMLElement).getByRole("button", { name: "Add a card" }),
    ).toBeInTheDocument();
  });

  it("renames an uncontrolled board title inline", () => {
    render(<KanbanBoard cards={cards} columns={columns} />);

    fireEvent.click(screen.getByRole("button", { name: "Kanban board" }));
    fireEvent.change(screen.getByLabelText("Board name"), {
      target: { value: "Product roadmap" },
    });
    fireEvent.keyDown(screen.getByLabelText("Board name"), { key: "Enter" });

    expect(screen.getByRole("heading", { name: "Product roadmap" })).toBeInTheDocument();
    expect(screen.getByLabelText("Product roadmap")).toBeInTheDocument();
  });

  it("reports board title edits through the callback", () => {
    const onBoardTitleChange = vi.fn();
    render(
      <KanbanBoard
        boardTitle="Roadmap"
        cards={cards}
        columns={columns}
        onBoardTitleChange={onBoardTitleChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Roadmap" }));
    fireEvent.change(screen.getByLabelText("Board name"), {
      target: { value: "2027 roadmap" },
    });
    fireEvent.blur(screen.getByLabelText("Board name"));

    expect(onBoardTitleChange).toHaveBeenCalledWith("2027 roadmap");
  });
});
