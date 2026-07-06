"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Tooltip } from "@/components/Tooltip";
import styles from "./FieldShell.module.css";
import type { FieldMode, LabelPosition } from "@/components/fields/types";

export type FieldShellAriaContextValue = {
  describedBy?: string;
  errorId?: string;
  labelId?: string;
  required?: boolean;
};

const FieldShellAriaContext = createContext<FieldShellAriaContextValue | null>(null);

export function useFieldShellAria() {
  return useContext(FieldShellAriaContext);
}

export function fieldInputAriaProps(
  aria: FieldShellAriaContextValue | null | undefined,
  options?: { invalid?: boolean },
) {
  if (!aria) {
    return {};
  }

  return {
    ...(aria.describedBy ? { "aria-describedby": aria.describedBy } : {}),
    ...(aria.errorId && options?.invalid ? { "aria-errormessage": aria.errorId } : {}),
    ...(aria.required ? { "aria-required": true as const, required: true as const } : {}),
    ...(aria.labelId ? { "aria-labelledby": aria.labelId } : {}),
  };
}

type FieldShellProps = {
  children: ReactNode;
  className?: string;
  compactControl?: boolean;
  error?: string;
  fitContent?: boolean;
  flaggedAlign?: "center" | "start";
  help?: string;
  id?: string;
  label: string;
  labelVisuallyHidden?: boolean;
  labelPosition?: LabelPosition;
  labelTag?: "div" | "label";
  mode?: FieldMode;
  required?: boolean;
  suppressErrorDisplay?: boolean;
};

function FieldLabelContent({
  help,
  label,
  required,
}: {
  help?: string;
  label: string;
  required?: boolean;
}) {
  return (
    <>
      <span>{label}</span>
      {required ? <span className={styles.required}>(required)</span> : null}
      {help ? <Tooltip content={help} label={`Help for ${label}`} /> : null}
    </>
  );
}

function FieldLabel({
  className,
  help,
  id,
  label,
  labelTag,
  htmlFor,
  required,
}: {
  className: string;
  help?: string;
  id?: string;
  label: string;
  labelTag: "div" | "label";
  htmlFor?: string;
  required?: boolean;
}) {
  const content = <FieldLabelContent help={help} label={label} required={required} />;

  if (labelTag === "label") {
    return (
      <label className={className} htmlFor={htmlFor} id={id}>
        {content}
      </label>
    );
  }

  return (
    <div className={className} id={id}>
      {content}
    </div>
  );
}

export function FieldShell({
  children,
  className,
  compactControl,
  error,
  fitContent,
  flaggedAlign = "start",
  help,
  id,
  label,
  labelVisuallyHidden,
  labelPosition = "left",
  labelTag = "label",
  mode = "stacked",
  required,
  suppressErrorDisplay,
}: FieldShellProps) {
  const flagged = mode === "flagged";
  const stackedSide = labelPosition === "right" ? styles.stackedRight : styles.stackedLeft;
  const labelClassName = `${styles.label} ${flagged ? styles.labelFlagged : ""} ${
    labelVisuallyHidden ? styles.visuallyHidden : ""
  }`;
  const controlClassName = `${styles.control} ${flagged ? styles.controlFlagged : ""}`;
  const errorClassName = `${styles.error} ${flagged ? styles.errorFlagged : ""}`;
  const compactGridColumns =
    flagged && compactControl
      ? labelPosition === "left"
        ? "minmax(0, 1fr) var(--opus-control-height)"
        : "var(--opus-control-height) minmax(0, 1fr)"
      : undefined;

  const labelId = id ? `${id}-label` : undefined;
  const helpId = id && help ? `${id}-help` : undefined;
  const errorId = id && error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  const ariaContext = useMemo(
    () => ({
      describedBy,
      errorId,
      labelId,
      required,
    }),
    [describedBy, errorId, labelId, required],
  );

  const labelProps = {
    className: labelClassName,
    help,
    id: labelId,
    label,
    labelTag,
    htmlFor: labelTag === "label" ? id : undefined,
    required,
  };

  const errorNode =
    error && !suppressErrorDisplay ? (
      <p className={errorClassName} id={errorId} role="alert">
        {error}
      </p>
    ) : null;

  const helpNode =
    help && helpId ? (
      <span className={styles.visuallyHidden} id={helpId}>
        {help}
      </span>
    ) : null;

  return (
    <FieldShellAriaContext.Provider value={ariaContext}>
      <div
        data-fit-content={fitContent ? "true" : undefined}
        className={[
          styles.root,
          flagged ? styles.flagged : styles.stacked,
          flagged && flaggedAlign === "center" ? styles.flaggedCenter : "",
          flagged && flaggedAlign === "start" ? styles.flaggedStart : "",
          flagged && compactControl ? styles.compactControl : "",
          flagged && fitContent ? styles.fitContent : "",
          !flagged ? stackedSide : "",
          flagged && labelPosition === "left" ? styles.labelLeft : "",
          flagged && labelPosition === "right" ? styles.labelRight : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={compactGridColumns ? { gridTemplateColumns: compactGridColumns } : undefined}
      >
        {flagged ? (
          <>
            {labelPosition === "left" ? <FieldLabel {...labelProps} /> : null}
            <div className={controlClassName}>
              {children}
              {helpNode}
            </div>
            {labelPosition === "right" ? <FieldLabel {...labelProps} /> : null}
            {errorNode}
          </>
        ) : (
          <>
            <FieldLabel {...labelProps} />
            <div className={controlClassName}>
              {children}
              {helpNode}
            </div>
            {errorNode}
          </>
        )}
      </div>
    </FieldShellAriaContext.Provider>
  );
}
