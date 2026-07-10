"use client";

import { Button } from "@/components/fields/Button";
import { CatalogIcon } from "@/components/CatalogIcon";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEventHandler,
  type DragEventHandler,
  type PointerEventHandler,
} from "react";
import {
  clampCircularCropOffset,
  cropCircularImage,
  getCircularCropMetrics,
  type CircularCropState,
} from "./cropCircularImage";
import styles from "./ImageCropUploadField.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";

export type ImageCropUploadResult = {
  file: File;
  previewUrl: string;
};

export type ImageCropUploadFieldProps = {
  accept?: string;
  changeButtonLabel?: string;
  cropButtonLabel?: string;
  embedded?: boolean;
  error?: string;
  help?: string;
  hideActions?: boolean;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  labelVisuallyHidden?: boolean;
  maxZoom?: number;
  minZoom?: number;
  mode?: FieldMode;
  onChange?: (previewUrl: string) => void;
  onCrop?: (result: ImageCropUploadResult) => void;
  onCropAvailabilityChange?: (state: {
    applyCrop: () => Promise<void>;
    canApply: boolean;
    isCropping: boolean;
  }) => void;
  outputSize?: number;
  size?: InputControlSize;
  uploadLabel?: string;
  value?: string;
  viewportSize?: number;
  zoomLabel?: string;
  zoomStep?: number;
};

type DragState = {
  active: boolean;
  originX: number;
  originY: number;
  startX: number;
  startY: number;
};

const defaultCropState: CircularCropState = {
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
};

function UploadIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.dropIconSvg}
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 22.5h11c2.76 0 5-2.24 5-5 0-2.39-1.68-4.39-3.93-4.88A5.5 5.5 0 0 0 12.2 9.7 4.5 4.5 0 0 0 10.5 22.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path d="M16 14.5v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M13 17.5h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

export function ImageCropUploadField({
  accept = "image/*",
  changeButtonLabel = "Change photo",
  cropButtonLabel = "Apply crop",
  embedded = false,
  error,
  help,
  hideActions = false,
  id,
  label,
  labelPosition = "left",
  labelVisuallyHidden = false,
  maxZoom = 3,
  minZoom = 1,
  mode = "stacked",
  onChange,
  onCrop,
  onCropAvailabilityChange,
  outputSize = 256,
  size = "md",
  uploadLabel = "Browse image",
  value,
  viewportSize = 240,
  zoomLabel = "Zoom",
  zoomStep = 0.05,
}: ImageCropUploadFieldProps) {
  const shellAria = useFieldShellAria();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<DragState>({
    active: false,
    originX: 0,
    originY: 0,
    startX: 0,
    startY: 0,
  });
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isPointerDragging, setIsPointerDragging] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [cropState, setCropState] = useState<CircularCropState>(defaultCropState);
  const [imageSize, setImageSize] = useState({ height: 0, width: 0 });

  const clearSource = useCallback(() => {
    setIsEditing(false);
    setCropState(defaultCropState);
    setImageSize({ height: 0, width: 0 });
    setSourceName("");
    setSourceUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    return () => {
      setSourceUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });
    };
  }, []);

  const openImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    setSourceUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return URL.createObjectURL(file);
    });
    setSourceName(file.name);
    setIsEditing(true);
    setCropState(defaultCropState);
    setImageSize({ height: 0, width: 0 });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const assignFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      return;
    }

    openImage(file);
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    assignFiles(event.target.files);
  };

  const handleDragOver: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingFile(false);
    }
  };

  const handleDrop: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingFile(false);
    assignFiles(event.dataTransfer.files);
  };

  const updateCropState = (next: CircularCropState) => {
    if (!imageSize.width || !imageSize.height) {
      setCropState(next);
      return;
    }

    setCropState(clampCircularCropOffset(imageSize.width, imageSize.height, viewportSize, next));
  };

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!isEditing || !imageSize.width) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      originX: cropState.offsetX,
      originY: cropState.offsetY,
      startX: event.clientX,
      startY: event.clientY,
    };
    setIsPointerDragging(true);
  };

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    if (!dragRef.current.active) {
      return;
    }

    updateCropState({
      offsetX: dragRef.current.originX + (event.clientX - dragRef.current.startX),
      offsetY: dragRef.current.originY + (event.clientY - dragRef.current.startY),
      zoom: cropState.zoom,
    });
  };

  const endPointerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current.active = false;
    setIsPointerDragging(false);
  };

  const handleZoomChange = (zoom: number) => {
    updateCropState({
      ...cropState,
      zoom: Math.min(maxZoom, Math.max(minZoom, zoom)),
    });
  };

  const handleApplyCrop = useCallback(async () => {
    const image = imageRef.current;
    if (!image || !image.naturalWidth) {
      return;
    }

    setIsCropping(true);

    try {
      const result = await cropCircularImage(image, viewportSize, outputSize, cropState, sourceName || "profile-photo.png");
      onCrop?.(result);
      onChange?.(result.previewUrl);
      clearSource();
    } finally {
      setIsCropping(false);
    }
  }, [clearSource, cropState, onChange, onCrop, outputSize, sourceName, viewportSize]);

  const applyCropRef = useRef(handleApplyCrop);
  applyCropRef.current = handleApplyCrop;
  const onCropAvailabilityChangeRef = useRef(onCropAvailabilityChange);
  onCropAvailabilityChangeRef.current = onCropAvailabilityChange;
  const canApply = Boolean(isEditing && sourceUrl && imageSize.width);

  useEffect(() => {
    onCropAvailabilityChangeRef.current?.({
      applyCrop: () => applyCropRef.current(),
      canApply,
      isCropping,
    });
  }, [canApply, isCropping]);

  const metrics =
    imageSize.width && imageSize.height
      ? getCircularCropMetrics(imageSize.width, imageSize.height, viewportSize, cropState)
      : null;

  const imageStyle = metrics
    ? {
        height: metrics.drawHeight,
        transform: `translate(-50%, -50%) translate(${cropState.offsetX}px, ${cropState.offsetY}px)`,
        width: metrics.drawWidth,
      }
    : undefined;

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="div"
      labelVisuallyHidden={labelVisuallyHidden}
      mode={mode}
    >
      <div
        className={`${styles.root} ${inputControlSizeClassName[size]}`}
        data-embedded={embedded ? "true" : undefined}
      >
        {isEditing && sourceUrl ? (
          <div className={styles.editor}>
            <p className={styles.instruction}>Drag the image to reposition it inside the circle.</p>
            <div
              aria-label="Image crop viewport"
              className={`${styles.viewport} ${isPointerDragging ? styles.viewportDragging : ""}`}
              onPointerCancel={endPointerDrag}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endPointerDrag}
              role="application"
              style={{ height: viewportSize, width: viewportSize }}
            >
              <img
                ref={imageRef}
                alt=""
                className={styles.viewportImage}
                draggable={false}
                src={sourceUrl}
                style={imageStyle}
                onLoad={(event) => {
                  const image = event.currentTarget;
                  const nextSize = {
                    height: image.naturalHeight,
                    width: image.naturalWidth,
                  };
                  setImageSize(nextSize);
                  setCropState(clampCircularCropOffset(nextSize.width, nextSize.height, viewportSize, defaultCropState));
                }}
              />
              <span aria-hidden="true" className={styles.viewportRing} />
            </div>

            <div className={styles.zoomRow}>
              <button
                aria-label="Zoom out"
                className={styles.zoomButton}
                disabled={cropState.zoom <= minZoom}
                type="button"
                onClick={() => handleZoomChange(Number((cropState.zoom - zoomStep).toFixed(2)))}
              >
                −
              </button>
              <input
                aria-label={zoomLabel}
                className={styles.zoomSlider}
                max={maxZoom}
                min={minZoom}
                step={zoomStep}
                type="range"
                value={cropState.zoom}
                onChange={(event) => handleZoomChange(Number(event.target.value))}
              />
              <button
                aria-label="Zoom in"
                className={styles.zoomButton}
                disabled={cropState.zoom >= maxZoom}
                type="button"
                onClick={() => handleZoomChange(Number((cropState.zoom + zoomStep).toFixed(2)))}
              >
                +
              </button>
            </div>
            <p className={styles.zoomLabel}>
              {zoomLabel}: {Math.round(cropState.zoom * 100)}%
            </p>

            {!hideActions ? (
              <div className={styles.actions}>
                <Button disabled={isCropping} type="button" onClick={() => void handleApplyCrop()}>
                  {isCropping ? "Cropping…" : cropButtonLabel}
                </Button>
                <Button disabled={isCropping} type="button" variant="secondary" onClick={clearSource}>
                  Cancel
                </Button>
              </div>
            ) : null}
          </div>
        ) : value ? (
          <div className={styles.previewCard}>
            <div className={styles.previewRow}>
              {embedded ? (
                <div
                  className={styles.previewFrame}
                  style={{ height: viewportSize, width: viewportSize }}
                >
                  <img
                    alt=""
                    className={styles.previewImage}
                    src={value}
                    style={{ height: viewportSize, width: viewportSize }}
                  />
                  <button
                    aria-label={changeButtonLabel}
                    className={styles.previewCameraButton}
                    type="button"
                    onClick={() => inputRef.current?.click()}
                  >
                    <CatalogIcon iconName="camera" />
                  </button>
                </div>
              ) : (
                <>
                  <img alt="" className={styles.previewImage} src={value} />
                  <div className={styles.previewCopy}>
                    <span className={styles.previewTitle}>Photo ready</span>
                    <span className={styles.previewHint}>Cropped to a circular profile image.</span>
                  </div>
                </>
              )}
            </div>
            {!hideActions ? (
              <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
                  {changeButtonLabel}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <label
            className={`${styles.drop} ${isDraggingFile ? styles.dragging : ""} ${error ? styles.dropError : ""}`}
            htmlFor={inputId}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <span className={styles.dropIcon}>
              <UploadIcon />
            </span>
            <div className={styles.dropContent}>
              <div className={styles.dropTitle}>
                <strong>Drag</strong> and drop a profile photo
              </div>
              <div className={styles.dropHint}>or</div>
              <span className={styles.dropAction}>{uploadLabel}</span>
            </div>
          </label>
        )}

        <input
          ref={inputRef}
          accept={accept}
          aria-invalid={error ? "true" : undefined}
          className={styles.hiddenInput}
          id={inputId}
          type="file"
          onChange={handleInputChange}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        />
      </div>
    </FieldShell>
  );
}
