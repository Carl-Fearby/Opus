"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import type { DialogActionSet, AlertStatus } from "@/components/fields/types";
import { AlertStatusIcon } from "@/components/AlertStatusIcon";
import { Button } from "@/components/fields/Button";
import type { ButtonVariant } from "@/components/fields/Button";
import { Portal } from "@/components/Portal";
import { useOverlayAccessibility } from "@/lib/a11y/useOverlayAccessibility";
import styles from "./Dialog.module.css";

export type DialogResult = "confirm" | "cancel" | "dismiss";
type DialogPhase = "opening" | "closing";

const EXIT_ANIMATION_MS = 180;

type DialogProps = {
  actionSet?: DialogActionSet;
  children?: ReactNode;
  description: string;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  onClose: (result: DialogResult) => void;
  open: boolean;
  status?: AlertStatus;
  title: string;
};

type DialogAction = {
  label: string;
  result: DialogResult;
  variant: ButtonVariant;
};

function statusButtonVariant(status: AlertStatus): ButtonVariant {
  if (status === "error") {
    return "danger";
  }

  return status;
}

function getActions(actionSet: DialogActionSet, status: AlertStatus): DialogAction[] {
  const confirmVariant = statusButtonVariant(status);

  if (actionSet === "ok") {
    return [{ label: "OK", result: "confirm", variant: confirmVariant }];
  }

  if (actionSet === "yes-no") {
    return [
      { label: "No", result: "cancel", variant: "secondary" },
      { label: "Yes", result: "confirm", variant: confirmVariant },
    ];
  }

  if (actionSet === "delete") {
    return [
      { label: "Cancel", result: "cancel", variant: "secondary" },
      { label: "Delete", result: "confirm", variant: confirmVariant },
    ];
  }

  return [
    { label: "Cancel", result: "cancel", variant: "secondary" },
    { label: "OK", result: "confirm", variant: confirmVariant },
  ];
}

export function Dialog({
  actionSet = "ok-cancel",
  children,
  description,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  onClose,
  open,
  status = "info",
  title,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [rendered, setRendered] = useState(open);
  const [phase, setPhase] = useState<DialogPhase>("opening");

  useOverlayAccessibility(open && rendered, panelRef);

  useEffect(() => {
    let timeout: number | undefined;
    const frame = window.requestAnimationFrame(() => {
      if (open) {
        setRendered(true);
        setPhase("opening");
        return;
      }

      setPhase("closing");
      timeout = window.setTimeout(() => setRendered(false), EXIT_ANIMATION_MS);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !dismissOnEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose("dismiss");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismissOnEscape, onClose, open]);

  if (!rendered) {
    return null;
  }

  const actions = getActions(actionSet, status);

  return (
    <Portal>
      <div
        className={styles.backdrop}
        data-dismissible={dismissOnBackdrop}
        data-phase={phase}
        onMouseDown={(event) => {
          if (event.currentTarget === event.target && dismissOnBackdrop) {
            onClose("dismiss");
          }
        }}
      >
        <section
          ref={panelRef}
          aria-describedby={descriptionId}
          aria-labelledby={titleId}
          aria-modal="true"
          className={styles.dialog}
          data-phase={phase}
          data-status={status}
          role="dialog"
        >
          <div aria-hidden="true" className={styles.icon}>
            <AlertStatusIcon markClassName={styles.iconMark} status={status} svgClassName={styles.iconSvg} />
          </div>
          <div className={styles.content}>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
            <p className={styles.description} id={descriptionId}>
              <span className={styles.visuallyHidden}>{status}: </span>
              {description}
            </p>
            {children ? <div className={styles.body}>{children}</div> : null}
            <div className={styles.actions}>
              {actions.map((action) => (
                <Button key={action.label} variant={action.variant} onClick={() => onClose(action.result)}>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Portal>
  );
}
