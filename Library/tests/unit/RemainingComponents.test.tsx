import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { compilePlaygroundCode } from "../../lib/playground/compilePlaygroundCode";
import { generateUsageCode } from "../../lib/controls/generateUsageCode";
import { defaultSettings } from "../../lib/controls/defaults";
import { UsagePreview } from "../../components/control-detail/ControlDetail/UsagePreview";
import {
  DiffViewer,
  MentionInputField,
  RecurrenceEditor,
  TimeRangeField,
  TextMarquee,
  VirtualList,
} from "../../components/fields";

describe("remaining component set", () => {
  it("announces marquee text once while hiding its visual loop copies", () => {
    const { container } = render(<TextMarquee>Live pipeline updates</TextMarquee>);
    expect(screen.getByRole("region", { name: "Live pipeline updates" })).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).not.toHaveLength(0);
  });

  it("windows a large virtual list", () => {
    render(
      <VirtualList
        items={Array.from({ length: 1000 }, (_, index) => index)}
        height={120}
        itemHeight={30}
        renderItem={(index) => <span>Item {index}</span>}
      />,
    );
    expect(screen.getByRole("list", { name: "Virtual list" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("Item 0")).toBeInTheDocument();
    expect(screen.queryByText("Item 999")).not.toBeInTheDocument();
  });

  it("selects mentions with the keyboard", () => {
    const change = vi.fn();
    const { rerender } = render(
      <MentionInputField
        id="m"
        label="Comment"
        value="@e"
        options={[{ id: "1", label: "Emma" }]}
        onChange={change}
      />,
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(change).toHaveBeenCalledWith("@Emma ");
    rerender(
      <MentionInputField id="m" label="Comment" value="@Emma " options={[]} onChange={change} />,
    );
  });

  it("keeps typed mention text visible while reporting its value", () => {
    const change = vi.fn();
    function ControlledMentionInput() {
      const [value, setValue] = useState("");
      return (
        <MentionInputField
          id="mention-draft"
          label="Comment"
          value={value}
          options={[{ id: "1", label: "Emma" }]}
          onChange={(nextValue) => {
            setValue(nextValue);
            change(nextValue);
          }}
        />
      );
    }

    render(<ControlledMentionInput />);
    const input = screen.getByRole("combobox", { name: "Comment" });
    expect(input).toHaveAttribute("autocomplete", "off");
    expect(input).toHaveAttribute("autocorrect", "off");
    expect(input).toHaveAttribute("spellcheck", "false");
    fireEvent.change(input, { target: { value: "Hello @e" } });
    expect(input).toHaveValue("Hello @e");
    expect(change).toHaveBeenCalledWith("Hello @e");
  });

  it("does not let a delayed parent echo erase newly typed mention text", () => {
    const change = vi.fn();
    render(
      <MentionInputField
        id="mention-delayed-parent"
        label="Delayed comment"
        value="hello"
        options={[{ id: "1", label: "Emma" }]}
        onChange={change}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Delayed comment" });
    fireEvent.change(input, { target: { value: "hello there" } });
    expect(input).toHaveValue("hello there");
    expect(change).toHaveBeenCalledWith("hello there");
  });

  it("keeps mention text editable in the generated catalogue preview", () => {
    const Preview = compilePlaygroundCode(generateUsageCode("mention-input", {}, "forms").full);
    render(<Preview />);
    const input = screen.getByRole("combobox", { name: "Comment" });
    fireEvent.change(input, { target: { value: "Hello @e" } });
    expect(input).toHaveValue("Hello @e");
  });

  it("keeps mention text editable with catalogue action instrumentation", async () => {
    render(<UsagePreview slug="mention-input" category="forms" settings={{}} />);
    const input = screen.getByRole("combobox", { name: "Comment" });
    fireEvent.change(input, { target: { value: "H" } });
    expect(await screen.findByTestId("usage-preview-data")).toHaveTextContent("H");
    expect(screen.getByRole("combobox", { name: "Comment" })).toHaveValue("H");
    fireEvent.change(screen.getByRole("combobox", { name: "Comment" }), {
      target: { value: "He" },
    });
    expect(await screen.findByTestId("usage-preview-data")).toHaveTextContent("He");
    expect(screen.getByRole("combobox", { name: "Comment" })).toHaveValue("He");
  });

  it("does not rerender a controlled text input for every native input event", async () => {
    render(
      <UsagePreview
        slug="text-input"
        category="forms"
        settings={defaultSettings["text-input"]}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Full name" });

    fireEvent.input(input, { target: { value: "J" } });
    expect(input).toHaveValue("J");
    fireEvent.input(input, { target: { value: "Ja" } });
    expect(input).toHaveValue("Ja");
    fireEvent.input(input, { target: { value: "Jane" } });
    expect(input).toHaveValue("Jane");

    fireEvent.change(input, { target: { value: "Jane" } });
    expect(await screen.findByTestId("usage-preview-data")).toHaveTextContent("Jane");
    expect(screen.getByRole("textbox", { name: "Full name" })).toHaveValue("Jane");
  });

  it("uses the Opus button in the generated toast example", () => {
    const usage = generateUsageCode("toast", defaultSettings.toast, "overlays").full;

    expect(usage).toContain("<Button");
    expect(usage).toContain('variant="primary"');
    expect(usage).not.toContain("<button");
  });

  it("reports time changes through Opus hour and minute pickers", async () => {
    const change = vi.fn();
    render(
      <TimeRangeField
        id="t"
        label="Hours"
        value={{ start: "09:00", end: "17:00" }}
        onChange={change}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start time" }));
    const hourList = await screen.findByRole("listbox", { name: "Hour" });
    fireEvent.click(within(hourList).getByRole("option", { name: "10" }));
    expect(change).toHaveBeenCalledWith({ start: "10:00", end: "17:00" });

    const minuteList = screen.getByRole("listbox", { name: "Minute" });
    fireEvent.click(within(minuteList).getByRole("option", { name: "37" }));
    expect(change).toHaveBeenCalledWith({ start: "10:37", end: "17:00" });
  });

  it("updates recurrence frequency", () => {
    const change = vi.fn();
    render(
      <RecurrenceEditor value={{ frequency: "daily", interval: 1, ends: "never" }} onChange={change} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Frequency" }));
    fireEvent.click(screen.getByRole("option", { name: "month(s)" }));
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ frequency: "monthly" }));
  });

  it("switches recurrence to an exclusive date range", () => {
    const change = vi.fn();
    render(
      <RecurrenceEditor value={{ frequency: "weekly", interval: 1, ends: "never" }} onChange={change} />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "Date range" }));
    expect(change).toHaveBeenCalledWith({ mode: "date-range", dateFrom: "", dateTo: "" });
  });

  it("shows additions and removals", () => {
    render(<DiffViewer before="draft" after="approved" />);
    expect(screen.getByLabelText("Unified code differences")).toHaveAttribute("tabindex", "0");
    expect(screen.getByText("draft")).toBeInTheDocument();
    expect(screen.getByText("approved")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Side-by-side diff" }));
    expect(screen.getByLabelText("Original code")).toHaveAttribute("tabindex", "0");
    expect(screen.getByLabelText("Changed code")).toHaveAttribute("tabindex", "0");
  });
});
