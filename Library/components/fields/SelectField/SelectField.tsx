"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
} from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./SelectField.module.css";

type SelectFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelVisuallyHidden?: boolean;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  name?: string;
  options: string[];
  required?: boolean;
  size?: InputControlSize;
  value: string;
  onChange: ChangeEventHandler<HTMLSelectElement>;
};

function emitSelectChange(
  onChange: ChangeEventHandler<HTMLSelectElement>,
  nextValue: string,
  name?: string,
) {
  const target = {
    name: name ?? "",
    type: "select-one",
    value: nextValue,
  } as HTMLSelectElement;
  onChange({
    target,
    currentTarget: target,
  } as ChangeEvent<HTMLSelectElement>);
}

export function SelectField({
  error,
  help,
  id,
  label,
  labelVisuallyHidden,
  labelPosition = "left",
  mode = "stacked",
  name,
  options,
  required,
  size = "md",
  value,
  onChange,
}: SelectFieldProps) {
  const shellAria = useFieldShellAria();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const display = value || options[0] || "";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectOption(option: string) {
    emitSelectChange(onChange, option, name);
    setOpen(false);
  }

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelVisuallyHidden={labelVisuallyHidden}
      labelPosition={labelPosition}
      labelTag="div"
      mode={mode}
      required={required}
    >
      <div className={styles.root} ref={rootRef}>
        <button
          aria-label={label}
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={[
            inputControlSizeClassName[size],
            shared.trigger,
            open ? shared.triggerOpen : "",
            error ? shared.triggerError : "",
          ]
            .filter(Boolean)
            .join(" ")}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        >
          <span className={display ? undefined : shared.placeholder}>
            {display || "Select…"}
          </span>
          <span aria-hidden="true" className={shared.chevron} />
        </button>
        <select
          aria-hidden="true"
          className={styles.hiddenSelect}
          name={name}
          required={required}
          tabIndex={-1}
          value={value}
          onChange={() => undefined}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {open ? (
          <div className={shared.panel}>
            <div
              aria-label={label}
              className={shared.list}
              id={listboxId}
              role="listbox"
            >
              {options.map((option) => {
                const selected = option === value || (!value && option === options[0]);
                return (
                  <button
                    aria-selected={selected}
                    className={[styles.option, selected ? styles.optionActive : ""]
                      .filter(Boolean)
                      .join(" ")}
                    key={option}
                    role="option"
                    type="button"
                    onClick={() => selectOption(option)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
