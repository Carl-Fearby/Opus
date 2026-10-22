"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type ChangeEventHandler,
} from "react";
import { createThemedPortal as createPortal } from "@/lib/theme/createThemedPortal";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { ControlRadius, ControlTransparency, FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import {
  resolveFieldListPortalStyle,
  type FloatingPortalStyle,
} from "@/lib/ui/floatingPortalPosition";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./SelectField.module.css";

type SelectFieldProps = {
  disabled?: boolean;
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
  radius?: ControlRadius;
  transparency?: ControlTransparency;
  gradient?: boolean;
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
  disabled = false,
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
  radius,
  transparency,
  gradient,
  size = "md",
  value,
  onChange,
}: SelectFieldProps) {
  const shellAria = useFieldShellAria();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(Math.max(options.indexOf(value), 0));
  const [portalStyle, setPortalStyle] = useState<FloatingPortalStyle | null>(null);
  const display = value || options[0] || "";

  useLayoutEffect(() => {
    if (!open || !rootRef.current) {
      setPortalStyle(null);
      return;
    }

    const updatePosition = () => {
      const anchor = rootRef.current;
      if (!anchor) return;
      setPortalStyle(
        resolveFieldListPortalStyle(
          anchor.getBoundingClientRect(),
          panelRef.current?.getBoundingClientRect() ?? null,
        ),
      );
    };

    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectOption(option: string) {
    emitSelectChange(onChange, option, name);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlight((current) =>
        event.key === "ArrowDown"
          ? Math.min(current + 1, options.length - 1)
          : Math.max(current - 1, 0),
      );
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setOpen(true);
      setHighlight(event.key === "Home" ? 0 : Math.max(options.length - 1, 0));
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      if (options[highlight]) selectOption(options[highlight]);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setHighlight(Math.max(options.indexOf(value), 0));
      setOpen(true);
    }
  }

  const panel =
    open && portalStyle
      ? createPortal(
          <div
            className={[shared.panel, styles.portal].join(" ")}
            data-control-radius={radius}
            data-portaled="true"
            ref={panelRef}
            style={
              {
                left: portalStyle.left,
                top: portalStyle.top,
                width: portalStyle.width,
              } as CSSProperties
            }
          >
            <div
              aria-label={label}
              className={shared.list}
              id={listboxId}
              role="listbox"
            >
              {options.map((option) => {
                const index = options.indexOf(option);
                const selected = option === value || (!value && option === options[0]);
                return (
                  <button
                    aria-selected={selected}
                    className={[
                      styles.option,
                      selected ? styles.optionActive : "",
                      highlight === index ? styles.optionHighlighted : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    id={`${listboxId}-option-${index}`}
                    key={option}
                    role="option"
                    tabIndex={-1}
                    type="button"
                    onClick={() => selectOption(option)}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlight(index)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

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
      radius={radius}
      transparency={transparency}
      gradient={gradient}
    >
      <div className={styles.root} ref={rootRef}>
        <button
          aria-activedescendant={open && options[highlight] ? `${listboxId}-option-${highlight}` : undefined}
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={label}
          role="combobox"
          className={[
            inputControlSizeClassName[size],
            shared.trigger,
            open ? shared.triggerOpen : "",
            error ? shared.triggerError : "",
          ]
            .filter(Boolean)
            .join(" ")}
          disabled={disabled}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleKeyDown}
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
          disabled={disabled}
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
        {panel}
      </div>
    </FieldShell>
  );
}
