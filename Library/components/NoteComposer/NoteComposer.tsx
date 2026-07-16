"use client";

import { useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import { CatalogIcon } from "@/components/CatalogIcon";
import { EmojiPicker } from "@/components/EmojiPicker";
import {
  DEFAULT_NOTE_TAG_OPTIONS,
  NoteTagList,
  NoteTagPicker,
  type NoteTagOption,
} from "@/components/NoteTag";
import styles from "./NoteComposer.module.css";

export type NoteComposerProps = {
  className?: string;
  defaultValue?: string;
  id?: string;
  onAttachClick?: () => void;
  onChange?: (value: string) => void;
  onEmojiSelect?: (emoji: string) => void;
  onMentionClick?: () => void;
  onSave?: (value: string, tags: NoteTagOption[]) => void;
  onTagsChange?: (tags: NoteTagOption[]) => void;
  placeholder?: string;
  saveButtonLabel?: string;
  showAttach?: boolean;
  showEmoji?: boolean;
  showMention?: boolean;
  showTags?: boolean;
  selectedTags?: NoteTagOption[];
  tagOptions?: NoteTagOption[];
  value?: string;
};

export function NoteComposer({
  className,
  defaultValue = "",
  id = "note-composer",
  onAttachClick,
  onChange,
  onEmojiSelect,
  onMentionClick,
  onSave,
  onTagsChange,
  placeholder = "Add a note...",
  saveButtonLabel = "Save Note",
  showAttach = true,
  showEmoji = true,
  showMention = true,
  showTags = false,
  selectedTags,
  tagOptions = DEFAULT_NOTE_TAG_OPTIONS,
  value,
}: NoteComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef({ end: 0, start: 0 });
  const pendingCaretRef = useRef<number | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [internalTags, setInternalTags] = useState<NoteTagOption[]>([]);
  const currentValue = value ?? internalValue;
  const currentTags = selectedTags ?? internalTags;

  const setValue = (nextValue: string) => {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  };

  const setTags = (nextTags: NoteTagOption[]) => {
    if (selectedTags === undefined) {
      setInternalTags(nextTags);
    }

    onTagsChange?.(nextTags);
  };

  const removeTag = (tag: NoteTagOption) => {
    const tagKey = tag.id ?? tag.label;
    setTags(currentTags.filter((currentTag) => (currentTag.id ?? currentTag.label) !== tagKey));
  };

  const syncSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    selectionRef.current = {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    selectionRef.current = {
      start: event.target.selectionStart,
      end: event.target.selectionEnd,
    };
    setValue(event.target.value);
  };

  const handleSave = () => {
    const trimmed = currentValue.trim();
    if (!trimmed) {
      return;
    }

    onSave?.(trimmed, currentTags);

    if (value === undefined) {
      setInternalValue("");
    }

    if (selectedTags === undefined) {
      setInternalTags([]);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const { end, start } = selectionRef.current;
    const nextValue = `${currentValue.slice(0, start)}${emoji}${currentValue.slice(end)}`;
    const nextCaret = start + emoji.length;

    setValue(nextValue);
    onEmojiSelect?.(emoji);
    pendingCaretRef.current = nextCaret;
  };

  useLayoutEffect(() => {
    if (pendingCaretRef.current === null) {
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const nextCaret = pendingCaretRef.current;
    pendingCaretRef.current = null;
    textarea.focus();
    textarea.setSelectionRange(nextCaret, nextCaret);
    selectionRef.current = { start: nextCaret, end: nextCaret };
  }, [currentValue]);

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <textarea
        className={styles.textarea}
        id={id}
        ref={textareaRef}
        onChange={handleChange}
        onClick={syncSelection}
        onFocus={syncSelection}
        onKeyUp={syncSelection}
        onSelect={syncSelection}
        placeholder={placeholder}
        value={currentValue}
      />
      {showTags && currentTags.length ? (
        <NoteTagList
          className={styles.selectedTags}
          onRemove={removeTag}
          size="sm"
          tags={currentTags}
        />
      ) : null}
      <div className={styles.footer}>
        <div className={styles.tools}>
          {showAttach ? (
            <button
              aria-label="Attach file"
              className={styles.toolButton}
              onClick={onAttachClick}
              type="button"
            >
              <CatalogIcon iconName="paperclip" />
            </button>
          ) : null}
          {showMention ? (
            <button
              aria-label="Mention someone"
              className={styles.toolButton}
              onClick={onMentionClick}
              type="button"
            >
              <CatalogIcon iconName="at" />
            </button>
          ) : null}
          {showEmoji ? (
            <EmojiPicker
              label="Add emoji"
              placement="top"
              trigger={
                <button
                  aria-label="Add emoji"
                  className={styles.toolButton}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    syncSelection();
                  }}
                >
                  <CatalogIcon iconName="face-smile" />
                </button>
              }
              onSelect={handleEmojiSelect}
            />
          ) : null}
          {showTags ? (
            <NoteTagPicker
              buttonClassName={styles.toolButton}
              label="Add tags"
              onChange={setTags}
              options={tagOptions}
              selectedTags={currentTags}
            >
              <CatalogIcon iconName="tag" />
            </NoteTagPicker>
          ) : null}
        </div>
        <button
          className={styles.saveButton}
          disabled={!currentValue.trim()}
          onClick={handleSave}
          type="button"
        >
          {saveButtonLabel}
        </button>
      </div>
    </div>
  );
}
