"use client";

import type { ReactNode } from "react";
import { Dialog, type DialogAction } from "@/components/Dialog";
import { useOpusI18n } from "@/components/OpusI18n";

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
  cancelLabel,
  children,
  confirmLabel,
  description,
  dismissOnBackdrop = true,
  dismissOnEscape = true,
  loading = false,
  loadingLabel,
  onClose,
  onConfirm,
  open,
  tone = "default",
  title,
}: ConfirmDialogProps) {
  const { t } = useOpusI18n();
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel", "Cancel");
  const resolvedConfirmLabel = confirmLabel ?? t("common.confirm", "Confirm");
  const resolvedLoadingLabel = loadingLabel ?? t("common.working", "Working…");
  const actions: DialogAction[] = [
    {
      disabled: loading,
      label: resolvedCancelLabel,
      result: "cancel",
      variant: "secondary",
    },
    {
      disabled: loading,
      label: loading ? resolvedLoadingLabel : resolvedConfirmLabel,
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
