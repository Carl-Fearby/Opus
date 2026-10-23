import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  isRichTextEmpty,
  RichTextContent,
  RichTextField,
  sanitizeRichTextHtml,
} from "../../components/fields/RichTextField";

describe("RichTextField attachments", () => {

  it("uploads a pasted screenshot into the editor", async () => {
    const onAttachmentUpload = vi.fn(async (file: File) => ({
      mimeType: file.type,
      name: file.name,
      url: "https://cdn.example.com/pasted.png",
    }));

    const { container } = render(
      <RichTextField
        id="pasted"
        label="Pasted notes"
        onAttachmentUpload={onAttachmentUpload}
        onChange={() => undefined}
        value=""
      />,
    );

    const file = new File(["image"], "pasted.png", { type: "image/png" });
    fireEvent.paste(screen.getByLabelText("Pasted notes"), {
      clipboardData: { files: [file] },
    });

    await waitFor(() => {
      expect(onAttachmentUpload).toHaveBeenCalledWith(file);
    });
    await waitFor(() => {
      expect(container.querySelector("#pasted img")).toHaveAttribute(
        "src",
        "https://cdn.example.com/pasted.png",
      );
    });
  });

  it("uploads a picked image and inserts it into the editor", async () => {
    const onAttachmentUpload = vi.fn(async (file: File) => ({
      mimeType: file.type,
      name: file.name,
      url: "https://cdn.example.com/screenshot.png",
    }));
    const onChange = vi.fn();

    const { container } = render(
      <RichTextField
        id="notes"
        label="Notes"
        onAttachmentUpload={onAttachmentUpload}
        onChange={onChange}
        value=""
      />,
    );

    const file = new File(["image"], "screenshot.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Insert images"), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(onAttachmentUpload).toHaveBeenCalledWith(file);
    });
    await waitFor(() => {
      expect(container.querySelector("#notes img")).toHaveAttribute(
        "src",
        "https://cdn.example.com/screenshot.png",
      );
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.stringContaining('src="https://cdn.example.com/screenshot.png"'),
    );
  });
});

describe("RichTextContent", () => {
  it("strips scripts, event handlers and unsafe URLs", async () => {
    const html =
      '<p onclick="alert(1)">Safe text</p><script>alert(1)</script>' +
      '<img alt="bad" src="javascript:alert(1)" />' +
      '<a href="javascript:alert(1)">Bad link</a>';

    const { container } = render(<RichTextContent html={html} />);

    await waitFor(() => {
      expect(screen.getByText("Safe text")).toBeInTheDocument();
    });
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("p")).not.toHaveAttribute("onclick");
    expect(container.querySelector("img")).not.toHaveAttribute("src");
    expect(container.querySelector("a")).not.toHaveAttribute("href");
  });

  it("recognises visually empty rich HTML", () => {
    expect(isRichTextEmpty("<p><br /></p>")).toBe(true);
    expect(isRichTextEmpty("<p>&nbsp;</p>")).toBe(true);
    expect(isRichTextEmpty("<p>Hello</p>")).toBe(false);
    expect(isRichTextEmpty('<p><img src="/image.png" /></p>')).toBe(false);
  });

  it("keeps safe formatting and links", () => {
    expect(
      sanitizeRichTextHtml(
        '<p style="color: red; background-image: url(javascript:alert(1))"><strong>Hi</strong></p>',
      ),
    ).toContain('<strong>Hi</strong>');
    expect(sanitizeRichTextHtml('<a href="https://example.com">Link</a>')).toContain(
      'rel="noopener noreferrer"',
    );
  });
});
