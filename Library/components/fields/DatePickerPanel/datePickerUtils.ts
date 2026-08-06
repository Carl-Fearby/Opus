import type { ChangeEvent, ChangeEventHandler } from "react";

export function formatDateDisplay(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Fire a ChangeEvent-compatible update so useFormState.register keeps working. */
export function emitDateInputChange(
  onChange: ChangeEventHandler<HTMLInputElement> | undefined,
  nextValue: string,
  name?: string,
) {
  if (!onChange) return;

  const target = {
    name: name ?? "",
    type: "date",
    value: nextValue,
  } as HTMLInputElement;

  onChange({
    target,
    currentTarget: target,
  } as ChangeEvent<HTMLInputElement>);
}
