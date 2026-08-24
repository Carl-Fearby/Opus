import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatBubble } from "../../components/ChatBubble";

describe("ChatBubble", () => {
  it("renders a right-aligned grouped conversation with an avatar and times", () => {
    const { container } = render(
      <ChatBubble
        alignment="right"
        avatar={{ name: "Ada Lovelace" }}
        messages={[
          { content: "First message", id: "one", time: "10:42" },
          { content: "Second message", id: "two", time: "10:43" },
        ]}
      />,
    );

    expect(screen.getByRole("region", { name: "Messages from Ada Lovelace" })).toHaveAttribute(
      "data-alignment",
      "right",
    );
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.queryByText("10:42")).not.toBeInTheDocument();
    expect(screen.getByText("10:43")).toBeInTheDocument();
    expect(container.querySelectorAll("article")).toHaveLength(2);
  });

  it("renders fenced code as a labelled code block", () => {
    render(
      <ChatBubble
        messages={[{ content: "Try this:\n```ts\nconst answer = 42;\n```" }]}
      />,
    );

    expect(screen.getByText("ts")).toBeInTheDocument();
    expect(screen.getByText("const", { exact: true }).tagName).toBe("SPAN");
    expect(screen.getByText("42", { exact: true })).toBeInTheDocument();
  });

  it("formats bold headings and gives paragraphs native text spacing", () => {
    render(<ChatBubble messages={[{ content: "**Physical characteristics:**\n\nJupiter is a gas giant.\n\nIts storms are immense." }]} />);

    expect(screen.getByRole("heading", { name: "Physical characteristics" })).toBeInTheDocument();
    expect(screen.getByText("Jupiter is a gas giant.").tagName).toBe("SPAN");
    expect(screen.getByText("Its storms are immense.").tagName).toBe("SPAN");
  });

  it("uses a contrasting foreground for a custom background", () => {
    render(<ChatBubble background="#f7e8a4" messages={[{ content: "Readable" }]} />);

    expect(screen.getByRole("region")).toHaveStyle("--chat-bubble-foreground-light: #070912");
    expect(screen.getByRole("region")).toHaveStyle("--chat-bubble-foreground-dark: #070912");
    expect(screen.getByRole("region")).toHaveStyle("--chat-bubble-border-light: #f7d53e");
  });
});
