"use client";

import {
  ImageCropUploadField,
  type ImageCropUploadFieldProps,
  type ImageCropUploadResult,
} from "@/components/fields/ImageCropUploadField";
import styles from "./ImageCropUploadWidget.module.css";

export type ImageCropUploadWidgetProps = {
  changeButtonLabel?: string;
  className?: string;
  cropButtonLabel?: string;
  id?: string;
  label?: string;
  maxZoom?: number;
  minZoom?: number;
  onChange?: (previewUrl: string) => void;
  onCrop?: (result: ImageCropUploadResult) => void;
  outputSize?: number;
  title?: string;
  uploadLabel?: string;
  value?: string;
  viewportSize?: number;
  zoomLabel?: string;
  zoomStep?: number;
};

export function ImageCropUploadWidget({
  changeButtonLabel,
  className,
  cropButtonLabel,
  id = "profile-photo-upload",
  label = "Profile photo",
  maxZoom,
  minZoom,
  onChange,
  onCrop,
  outputSize,
  title,
  uploadLabel,
  value,
  viewportSize,
  zoomLabel,
  zoomStep,
}: ImageCropUploadWidgetProps) {
  const fieldProps: ImageCropUploadFieldProps = {
    changeButtonLabel,
    cropButtonLabel,
    id,
    label,
    maxZoom,
    minZoom,
    onChange,
    onCrop,
    outputSize,
    uploadLabel,
    value,
    viewportSize,
    zoomLabel,
    zoomStep,
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <div className={styles.field}>
        <ImageCropUploadField {...fieldProps} />
      </div>
    </div>
  );
}
