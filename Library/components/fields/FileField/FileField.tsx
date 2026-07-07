"use client";

import styles from "./FileField.module.css";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import {
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
  type DragEventHandler,
} from "react";

type FileFieldProps = {
  error?: string;
  footnote?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  fileName?: string;
};

function CloudUploadIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.iconSvg}
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

export function FileField({
  error,
  fileName,
  footnote = "Max file size 10MB",
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  onChange,
}: FileFieldProps) {
  const shellAria = useFieldShellAria();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const assignFiles = (files: FileList | null) => {
    const input = inputRef.current;
    if (!input || !files?.length) {
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(files[0]);
    input.files = dataTransfer.files;

    onChange({
      target: input,
      currentTarget: input,
    } as ChangeEvent<HTMLInputElement>);
  };

  const handleDragOver: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    assignFiles(event.dataTransfer.files);
  };

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      labelTag="div"
      mode={mode}
    >
      <div className={styles.wrapper}>
        <label
          className={`${styles.drop} ${isDragging ? styles.dragging : ""} ${error ? styles.dropError : ""}`}
          htmlFor={id}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <span className={styles.icon}>
            <CloudUploadIcon />
          </span>
          <div className={styles.content}>
            <div className={styles.title}>
              {fileName ? (
                <>Selected: {fileName}</>
              ) : (
                <>
                  <strong>Drag</strong> and drop a file here
                </>
              )}
            </div>
            {!fileName ? <div className={styles.hint}>or</div> : null}
            <span className={styles.action}>{fileName ? "Upload" : "Browse files"}</span>
          </div>
          <input
            ref={inputRef}
            aria-invalid={error ? "true" : undefined}
            className={styles.input}
            id={id}
            onChange={onChange}
            type="file"
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
          />
        </label>
        {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
      </div>
    </FieldShell>
  );
}
