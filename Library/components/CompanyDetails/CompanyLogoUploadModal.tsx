"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/fields/Button";
import { ImageCropUploadField } from "@/components/fields/ImageCropUploadField";
import { Modal } from "@/components/Modal";

export type CompanyLogoUploadModalProps = {
  fieldId?: string;
  onClose: () => void;
  onLogoChange?: (previewUrl: string) => void;
  open: boolean;
  title?: string;
  value?: string;
};

type CropAvailability = {
  applyCrop: () => Promise<void>;
  canApply: boolean;
  isCropping: boolean;
};

export function CompanyLogoUploadModal({
  fieldId = "company-logo-upload",
  onClose,
  onLogoChange,
  open,
  title = "Update company logo",
  value,
}: CompanyLogoUploadModalProps) {
  const [draftLogo, setDraftLogo] = useState(value ?? "");
  const [cropAvailability, setCropAvailability] = useState<CropAvailability | null>(null);

  useEffect(() => {
    if (open) {
      setDraftLogo(value ?? "");
      setCropAvailability(null);
    }
  }, [open, value]);

  const handleClose = () => {
    setDraftLogo("");
    setCropAvailability(null);
    onClose();
  };

  return (
    <Modal
      actions={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          {cropAvailability?.canApply ? (
            <Button
              disabled={cropAvailability.isCropping}
              type="button"
              variant="primary"
              onClick={() => void cropAvailability.applyCrop()}
            >
              {cropAvailability.isCropping ? "Cropping…" : "Apply crop"}
            </Button>
          ) : null}
        </>
      }
      closeButton
      description="Upload a logo, then zoom out to fit the full image or zoom in to crop."
      dismissOnBackdrop
      dismissOnEscape
      open={open}
      size="medium"
      title={title}
      onClose={handleClose}
    >
      <ImageCropUploadField
        changeButtonLabel="Change logo"
        cropButtonLabel="Apply crop"
        embedded
        fit="contain"
        hideActions
        id={fieldId}
        label="Company logo"
        labelVisuallyHidden
        maxZoom={4}
        minZoom={1}
        outputHeight={512}
        outputWidth={512}
        shape="rect"
        uploadLabel="Browse image"
        value={draftLogo || undefined}
        viewportSize={280}
        onChange={setDraftLogo}
        onCrop={({ previewUrl }) => {
          onLogoChange?.(previewUrl);
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
