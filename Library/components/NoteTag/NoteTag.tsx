"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "./NoteTag.module.css";

export type NoteTagTone =
  | "blue"
  | "cyan"
  | "green"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "slate"
  | "teal"
  | "yellow";

export type NoteTagOption = {
  id?: string;
  label: string;
  tone: NoteTagTone;
};

export const DEFAULT_NOTE_TAG_OPTIONS: NoteTagOption[] = [
  { id: "pricing", label: "Pricing", tone: "purple" },
  { id: "enterprise", label: "Enterprise", tone: "orange" },
  { id: "call", label: "Call", tone: "green" },
  { id: "email", label: "Email", tone: "blue" },
  { id: "deal", label: "Deal", tone: "purple" },
  { id: "legal", label: "Legal", tone: "cyan" },
  { id: "procurement", label: "Procurement", tone: "pink" },
  { id: "renewal", label: "Renewal", tone: "teal" },
  { id: "implementation", label: "Implementation", tone: "yellow" },
  { id: "risk", label: "Risk", tone: "red" },
];

type NoteTagProps = NoteTagOption & {
  className?: string;
  onRemove?: (tag: NoteTagOption) => void;
  removable?: boolean;
  selected?: boolean;
  size?: "sm" | "md";
};

type NoteTagListProps = {
  className?: string;
  onRemove?: (tag: NoteTagOption) => void;
  tags: NoteTagOption[];
  size?: NoteTagProps["size"];
};

type NoteTagPickerProps = {
  buttonClassName?: string;
  children?: ReactNode;
  label?: string;
  onChange: (tags: NoteTagOption[]) => void;
  options?: NoteTagOption[];
  selectedTags: NoteTagOption[];
};

function getTagKey(tag: Pick<NoteTagOption, "id" | "label">) {
  return tag.id ?? tag.label;
}

export function NoteTag({
  className,
  id,
  label,
  onRemove,
  removable = false,
  selected = false,
  size = "md",
  tone,
}: NoteTagProps) {
  const tag = { id, label, tone };

  return (
    <span
      className={[styles.tag, className].filter(Boolean).join(" ")}
      data-selected={selected ? "true" : undefined}
      data-size={size}
      data-tone={tone}
    >
      <span>{label}</span>
      {removable ? (
        <button
          aria-label={`Remove ${label} tag`}
          className={styles.removeButton}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.(tag);
          }}
          type="button"
        >
          x
        </button>
      ) : null}
    </span>
  );
}

export function NoteTagList({ className, onRemove, tags, size = "md" }: NoteTagListProps) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className={[styles.list, className].filter(Boolean).join(" ")}>
      {tags.map((tag) => (
        <NoteTag
          id={tag.id}
          key={getTagKey(tag)}
          label={tag.label}
          onRemove={onRemove}
          removable={Boolean(onRemove)}
          size={size}
          tone={tag.tone}
        />
      ))}
    </div>
  );
}

export function NoteTagPicker({
  buttonClassName,
  children,
  label = "Add tags",
  onChange,
  options = DEFAULT_NOTE_TAG_OPTIONS,
  selectedTags,
}: NoteTagPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedKeys = useMemo(() => new Set(selectedTags.map(getTagKey)), [selectedTags]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleTag = (tag: NoteTagOption) => {
    const tagKey = getTagKey(tag);
    if (selectedKeys.has(tagKey)) {
      onChange(selectedTags.filter((selectedTag) => getTagKey(selectedTag) !== tagKey));
      return;
    }

    onChange([...selectedTags, tag]);
  };

  return (
    <div className={styles.picker} data-note-tag-picker="true" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-label={label}
        className={buttonClassName}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {children ?? label}
      </button>
      {isOpen ? (
        <div className={styles.menu} role="listbox" aria-label={label}>
          <div className={styles.menuHeader}>Tags</div>
          <div className={styles.options}>
            {options.map((tag) => {
              const selected = selectedKeys.has(getTagKey(tag));

              return (
                <button
                  aria-pressed={selected}
                  className={styles.option}
                  data-selected={selected ? "true" : undefined}
                  key={getTagKey(tag)}
                  onClick={() => toggleTag(tag)}
                  type="button"
                >
                  <NoteTag id={tag.id} label={tag.label} selected={selected} size="sm" tone={tag.tone} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
