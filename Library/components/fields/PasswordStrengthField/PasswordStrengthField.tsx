"use client";

import "@/lib/fontawesome";
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { PasswordToggle } from "../shared/PasswordToggle";
import styles from "./PasswordStrengthField.module.css";

export type PasswordRequirement = {
  id: string;
  label: string;
  test: (value: string) => boolean;
};

const defaultRequirements: PasswordRequirement[] = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { id: "lower", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value) => /\d/.test(value) },
];

function scorePassword(value: string, requirements: PasswordRequirement[]) {
  if (!value) {
    return 0;
  }

  const passed = requirements.filter((requirement) => requirement.test(value)).length;
  return Math.round((passed / requirements.length) * 100);
}

type PasswordStrengthFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  placeholder?: string;
  required?: boolean;
  requirements?: PasswordRequirement[];
  showRequirements?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function PasswordStrengthField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  placeholder = "Enter a password",
  required,
  requirements = defaultRequirements,
  showRequirements = true,
  value,
  onChange,
}: PasswordStrengthFieldProps) {
  const shellAria = useFieldShellAria();
  const [revealed, setRevealed] = useState(false);
  const score = useMemo(() => scorePassword(value, requirements), [requirements, value]);
  const strengthLevel =
    score >= 100 ? "strong" : score >= 66 ? "good" : score >= 33 ? "fair" : value ? "weak" : "empty";
  const strengthLabel =
    strengthLevel === "empty"
      ? "Empty"
      : strengthLevel.charAt(0).toUpperCase() + strengthLevel.slice(1);

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div className={styles.root}>
        <div className={shared.passwordWrap}>
          <input
            aria-invalid={error ? "true" : undefined}
            autoComplete="new-password"
            className={`${shared.input} ${shared.passwordInput} ${error ? shared.error : ""}`}
            id={id}
            placeholder={placeholder}
            type={revealed ? "text" : "password"}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
          />
          <PasswordToggle
            controlsId={id}
            visible={revealed}
            onToggle={() => setRevealed((current) => !current)}
          />
        </div>
        <div className={styles.meterWrap}>
          <div className={styles.meterTrack}>
            <div
              className={styles.meterFill}
              data-level={strengthLevel}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={styles.meterLabel} data-level={strengthLevel}>
            {strengthLabel}
          </span>
        </div>
        {showRequirements ? (
          <ul className={styles.requirements}>
            {requirements.map((requirement) => {
              const met = requirement.test(value);
              return (
                <li
                  className={met ? styles.requirementMet : styles.requirement}
                  key={requirement.id}
                >
                  <FontAwesomeIcon
                    aria-hidden="true"
                    className={styles.requirementIcon}
                    icon={met ? faCheck : faXmark}
                  />
                  <span>{requirement.label}</span>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </FieldShell>
  );
}
