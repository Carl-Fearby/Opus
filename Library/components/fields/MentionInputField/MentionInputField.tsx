"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { FieldShell } from "../FieldShell";
import styles from "./MentionInputField.module.css";
import type { ControlRadius } from "../types";

export type MentionOption = { id: string; label: string; description?: string };
export type MentionInputFieldProps = {
  radius?: ControlRadius;
  transparency?: import("../types").ControlTransparency;
  gradient?: boolean;
  autoCapitalize?: string;
  autoComplete?: string;
  autoCorrect?: "off" | "on";
  id: string;
  label: string;
  name?: string;
  value: string;
  options: MentionOption[];
  trigger?: string;
  placeholder?: string;
  spellCheck?: boolean;
  onChange: (value: string) => void;
  onMention?: (option: MentionOption) => void;
};

export function MentionInputField({
  autoCapitalize = "none",
  autoComplete = "off",
  autoCorrect = "off",
  id,
  label,
  name = id,
  value,
  options,
  trigger = "@",
  placeholder,
  spellCheck = false,
  onChange,
  radius,
  transparency,
  gradient,
  onMention,
}: MentionInputFieldProps) {
  const [active, setActive] = useState(0);
  const [inputValue, setInputValue] = useState(value);
  const lastEmittedValue = useRef<string | null>(null);

  useEffect(() => {
    if (value === lastEmittedValue.current) return;
    setInputValue(value);
  }, [value]);

  const updateValue = (nextValue: string) => {
    lastEmittedValue.current = nextValue;
    setInputValue(nextValue);
    onChange(nextValue);
  };

  const match = inputValue.match(new RegExp(`\\${trigger}([^\\s${trigger}]*)$`));
  const query = match?.[1]?.toLowerCase();
  const shown = useMemo(
    () =>
      query === undefined
        ? []
        : options.filter((option) => option.label.toLowerCase().includes(query)).slice(0, 8),
    [options, query],
  );

  const pick = (option: MentionOption) => {
    updateValue(
      inputValue.slice(0, inputValue.length - (query?.length ?? 0) - 1) +
        `${trigger}${option.label} `,
    );
    onMention?.(option);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!shown.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, shown.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      pick(shown[active]);
    }
    if (event.key === "Escape") {
      updateValue(inputValue.replace(new RegExp(`\\${trigger}[^\\s${trigger}]*$`), ""));
    }
  };

  return (
    <FieldShell id={id} label={label} radius={radius} transparency={transparency} gradient={gradient}>
      <div className={styles.root}>
        <input
          aria-autocomplete="list"
          aria-controls={shown.length ? `${id}-mentions` : undefined}
          aria-expanded={Boolean(shown.length)}
          aria-label={label}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          id={id}
          name={name}
          placeholder={placeholder}
          role="combobox"
          spellCheck={spellCheck}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            updateValue(event.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
        />
        {shown.length ? (
          <div className={styles.menu} id={`${id}-mentions`} role="listbox">
            {shown.map((option, index) => (
              <button
                aria-selected={index === active}
                key={option.id}
                role="option"
                type="button"
                onClick={() => pick(option)}
              >
                <strong>{trigger}{option.label}</strong>
                {option.description ? <small>{option.description}</small> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
