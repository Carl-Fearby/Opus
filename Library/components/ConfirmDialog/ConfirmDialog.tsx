"use client";

import type { ReactNode } from "react";
import { Dialog, type DialogAction } from "@/components/Dialog";

export type ConfirmDialogTone = "default" | "danger";

export type ConfirmDialogProps = {
  cancelLabel?: string;
  children?: ReactNode;
  confirmLabel?: string;
  description: string;
  dismissOnBackdrop?: boolean;
  dismissOnEscape?: boolean;
  /** Disables both actions while an async confirmation is running. */
  loading?: boolean;
  loadingLabel?: string;
  /** Called when the user cancels or dismisses the dialog. */
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  /** `danger` styles the confirm action and icon as destructive. */
  tone?: ConfirmDialogTone;
  title: string;
};

export function ConfirmDialog({
  cancelLabel = "Cancel",
  children,
  confirmLabel = "Confirm",
  description,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  loading = false,
  loadingLabel = "Working…",
  onClose,
  onConfirm,
  open,
  tone = "default",
  title,
}: ConfirmDialogProps) {
  const actions: DialogAction[] = [
    {
      disabled: loading,
      label: cancelLabel,
      result: "cancel",
      variant: "secondary",
    },
    {
      disabled: loading,
      label: loading ? loadingLabel : confirmLabel,
      result: "confirm",
      variant: tone === "danger" ? "danger" : "primary",
    },
  ];

  return (
    <Dialog
      actions={actions}
      dismissOnBackdrop={loading ? false : dismissOnBackdrop}
      dismissOnEscape={loading ? false : dismissOnEscape}
      onClose={(result) => {
        if (result === "confirm") {
          onConfirm();
          return;
        }
        onClose();
      }}
      open={open}
      status={tone === "danger" ? "error" : "info"}
      title={title}
      description={description}
    >
      {children}
    </Dialog>
  );
}
