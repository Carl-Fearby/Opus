"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/fields/Button";
import { ImageCropUploadField } from "@/components/fields/ImageCropUploadField";
import { Modal } from "@/components/Modal";

export type UserProfilePhotoUploadOptions = {
  cancelButtonLabel?: string;
  changeButtonLabel?: string;
  cropButtonLabel?: string;
  description?: string;
  label?: string;
  maxZoom?: number;
  minZoom?: number;
  outputSize?: number;
  title?: string;
  uploadLabel?: string;
  viewportSize?: number;
  zoomLabel?: string;
  zoomStep?: number;
};

export const defaultUserProfilePhotoUploadOptions: Required<
  Pick<
    UserProfilePhotoUploadOptions,
    | "changeButtonLabel"
    | "cropButtonLabel"
    | "label"
    | "maxZoom"
    | "minZoom"
    | "outputSize"
    | "title"
    | "uploadLabel"
    | "viewportSize"
    | "zoomLabel"
    | "zoomStep"
  >
> = {
  changeButtonLabel: "Change photo",
  cropButtonLabel: "Apply crop",
  label: "Profile photo",
  maxZoom: 3,
  minZoom: 1,
  outputSize: 256,
  title: "Update profile photo",
  uploadLabel: "Browse image",
  viewportSize: 240,
  zoomLabel: "Zoom",
  zoomStep: 0.05,
};

type CropAvailability = {
  applyCrop: () => Promise<void>;
  canApply: boolean;
  isCropping: boolean;
};

type ProfilePhotoUploadModalProps = {
  fieldId: string;
  onClose: () => void;
  onPhotoChange?: (previewUrl: string) => void;
  open: boolean;
  options?: UserProfilePhotoUploadOptions;
  value?: string;
};

export function ProfilePhotoUploadModal({
  fieldId,
  onClose,
  onPhotoChange,
  open,
  options,
  value,
}: ProfilePhotoUploadModalProps) {
  const [draftPhoto, setDraftPhoto] = useState(value ?? "");
  const [cropAvailability, setCropAvailability] = useState<CropAvailability | null>(null);
  const resolvedOptions = { ...defaultUserProfilePhotoUploadOptions, ...options };

  useEffect(() => {
    if (open) {
      setDraftPhoto(value ?? "");
      setCropAvailability(null);
    }
  }, [open, value]);

  const handleClose = () => {
    setDraftPhoto("");
    setCropAvailability(null);
    onClose();
  };

  return (
    <Modal
      actions={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {options?.cancelButtonLabel ?? "Cancel"}
          </Button>
          {cropAvailability?.canApply ? (
            <Button
              disabled={cropAvailability.isCropping}
              type="button"
              variant="primary"
              onClick={() => void cropAvailability.applyCrop()}
            >
              {cropAvailability.isCropping ? "Cropping…" : resolvedOptions.cropButtonLabel}
            </Button>
          ) : null}
        </>
      }
      closeButton
      description={options?.description || undefined}
      dismissOnBackdrop
      dismissOnEscape
      open={open}
      size="small"
      title={resolvedOptions.title}
      onClose={handleClose}
    >
      <ImageCropUploadField
        embedded
        hideActions
        changeButtonLabel={resolvedOptions.changeButtonLabel}
        cropButtonLabel={resolvedOptions.cropButtonLabel}
        id={fieldId}
        label={resolvedOptions.label}
        labelVisuallyHidden
        maxZoom={resolvedOptions.maxZoom}
        minZoom={resolvedOptions.minZoom}
        outputSize={resolvedOptions.outputSize}
        uploadLabel={resolvedOptions.uploadLabel}
        value={draftPhoto || undefined}
        viewportSize={resolvedOptions.viewportSize}
        zoomLabel={resolvedOptions.zoomLabel}
        zoomStep={resolvedOptions.zoomStep}
        onChange={setDraftPhoto}
        onCrop={({ previewUrl }) => {
          onPhotoChange?.(previewUrl);
          handleClose();
        }}
        onCropAvailabilityChange={(state) => {
          setCropAvailability((current) => {
            if (current?.canApply === state.canApply && current?.isCropping === state.isCropping) {
              return current;
            }

            return state;
          });
        }}
      />
    </Modal>
  );
}
