import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  FormStateProvider,
  useFormStateContext,
} from "../../components/fields/useFormState";

type DemoValues = {
  email: string;
  subscribed: boolean;
};

const defaults: DemoValues = {
  email: "person@example.com",
  subscribed: false,
};

function ContextConsumer() {
  const form = useFormStateContext<DemoValues>();

  return (
    <>
      <input aria-label="Email" {...form.register("email")} />
      <button onClick={() => form.reset()} type="button">Reset</button>
      <output>{form.isDirty ? "Dirty" : "Pristine"}</output>
    </>
  );
}

describe("FormStateProvider", () => {
  it("shares dirty state and reset actions with descendants", async () => {
    const user = userEvent.setup();
    render(
      <FormStateProvider defaults={defaults}>
        <ContextConsumer />
      </FormStateProvider>,
    );

    const email = screen.getByRole("textbox", { name: "Email" });
    expect(screen.getByText("Pristine")).toBeInTheDocument();

    await user.clear(email);
    await user.type(email, "new@example.com");
    expect(screen.getByText("Dirty")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(email).toHaveValue("person@example.com");
    expect(screen.getByText("Pristine")).toBeInTheDocument();
  });

  it("explains when the context hook is used without its provider", () => {
    expect(() => render(<ContextConsumer />)).toThrow(
      "useFormStateContext must be used within a FormStateProvider",
    );
  });
});
