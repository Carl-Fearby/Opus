"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useId } from "react";
import styles from "./RadioGroup.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { ChoiceShape, FieldMode, LabelPosition } from "@/components/fields/types";

type RadioGroupContextValue = {
  name: string;
  selectedValue: string | null;
  setSelectedValue: (value: string) => void;
  shape: ChoiceShape;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

type RadioGroupProps = {
  children: ReactNode;
  error?: string;
  help?: string;
  id?: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  name: string;
  onChange: (value: string) => void;
  shape?: ChoiceShape;
  value: string | null;
};

export function RadioGroup({
  children,
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  name,
  onChange,
  shape = "round",
  value,
}: RadioGroupProps) {
  const autoId = useId();
  const groupId = id ?? `radio-group-${autoId}`;

  return (
    <RadioGroupContext.Provider
      value={{
        name,
        selectedValue: value,
        setSelectedValue: onChange,
        shape,
      }}
    >
      <FieldShell
        className={styles.shell}
        error={error}
        flaggedAlign="start"
        help={help}
        id={groupId}
        label={label}
        labelPosition={labelPosition}
        labelTag="div"
        mode={mode}
      >
        <RadioGroupOptions error={error}>{children}</RadioGroupOptions>
      </FieldShell>
    </RadioGroupContext.Provider>
  );
}

function RadioGroupOptions({ children, error }: { children: ReactNode; error?: string }) {
  const shellAria = useFieldShellAria();

  return (
    <div
      aria-invalid={error ? "true" : undefined}
      className={styles.options}
      role="radiogroup"
      {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
    >
      {children}
    </div>
  );
}

type RadioProps = {
  children?: ReactNode;
  error?: string;
  name?: string;
  shape?: ChoiceShape;
  value: string;
  defaultChecked?: boolean;
};

export function Radio({ children, error, name, shape, value, defaultChecked }: RadioProps) {
  const group = useContext(RadioGroupContext);
  const inputName = group?.name ?? name;
  const checked = group ? group.selectedValue === value : undefined;
  const choiceShape = shape ?? group?.shape ?? "round";

  return (
    <div className={styles.option}>
      <label className={styles.choice}>
        <input
          className={styles.nativeInput}
          checked={checked}
          defaultChecked={group ? undefined : defaultChecked}
          name={inputName}
          onChange={() => group?.setSelectedValue(value)}
          type="radio"
          value={value}
        />
        <span
          aria-hidden="true"
          className={`${styles.visual} ${
            choiceShape === "round" ? styles.round : styles.square
          }`}
        />
        <span>{children ?? value}</span>
      </label>
      {error ? <div className={styles.error}>{error}</div> : null}
    </div>
  );
}
