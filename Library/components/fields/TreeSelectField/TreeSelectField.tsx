"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import shared from "../shared/fieldControl.module.css";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import styles from "./TreeSelectField.module.css";

export type TreeSelectNode = {
  children?: TreeSelectNode[];
  label: string;
  value: string;
};

type TreeSelectFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  mode?: FieldMode;
  nodes: TreeSelectNode[];
  placeholder?: string;
  required?: boolean;
  size?: InputControlSize;
  value: string | null;
  onChange: (value: string | null) => void;
};

function flattenLabels(nodes: TreeSelectNode[], prefix = ""): Record<string, string> {
  return nodes.reduce<Record<string, string>>((acc, node) => {
    const label = prefix ? `${prefix} / ${node.label}` : node.label;
    acc[node.value] = label;
    if (node.children?.length) {
      Object.assign(acc, flattenLabels(node.children, label));
    }
    return acc;
  }, {});
}

function TreeOptions({
  depth = 0,
  nodes,
  onSelect,
  selected,
}: {
  depth?: number;
  nodes: TreeSelectNode[];
  onSelect: (value: string) => void;
  selected: string | null;
}) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.value}>
          <button
            className={[styles.treeOption, selected === node.value ? styles.treeOptionActive : ""]
              .filter(Boolean)
              .join(" ")}
            style={{ paddingLeft: `${10 + depth * 14}px` }}
            type="button"
            onClick={() => onSelect(node.value)}
          >
            {node.label}
          </button>
          {node.children?.length ? (
            <TreeOptions depth={depth + 1} nodes={node.children} onSelect={onSelect} selected={selected} />
          ) : null}
        </div>
      ))}
    </>
  );
}

export function TreeSelectField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  mode = "stacked",
  nodes,
  placeholder = "Select an item…",
  required,
  size = "md",
  value,
  onChange,
}: TreeSelectFieldProps) {
  const shellAria = useFieldShellAria();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const labels = useMemo(() => flattenLabels(nodes), [nodes]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <FieldShell
      error={error}
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div className={styles.root} ref={rootRef}>
        <button
          aria-expanded={open}
          aria-haspopup="tree"
          className={[
            inputControlSizeClassName[size],
            shared.trigger,
            open ? shared.triggerOpen : "",
            error ? shared.triggerError : "",
          ]
            .filter(Boolean)
            .join(" ")}
          id={id}
          type="button"
          onClick={() => setOpen((current) => !current)}
          {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
        >
          <span className={value ? "" : shared.placeholder}>
            {value ? labels[value] ?? value : placeholder}
          </span>
          <span aria-hidden="true" className={shared.chevron}>
            ▾
          </span>
        </button>
        {open ? (
          <div className={shared.panel}>
            <div className={shared.list} role="tree">
              <TreeOptions
                nodes={nodes}
                selected={value}
                onSelect={(next) => {
                  onChange(next);
                  setOpen(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
