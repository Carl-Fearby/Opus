"use client";

import "@/lib/fontawesome";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faAlignCenter,
  faAlignLeft,
  faAlignRight,
  faBold,
  faCode,
  faEraser,
  faHighlighter,
  faImage,
  faIndent,
  faItalic,
  faLink,
  faLinkSlash,
  faListOl,
  faListUl,
  faMinus,
  faOutdent,
  faPalette,
  faQuoteRight,
  faRotateLeft,
  faRotateRight,
  faStrikethrough,
  faSubscript,
  faSuperscript,
  faTable,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, LabelPosition } from "@/components/fields/types";
import { Tooltip } from "@/components/Tooltip";
import styles from "./RichTextField.module.css";

type InlineAction = {
  id: string;
  command: string;
  icon: IconDefinition;
  label: string;
  shortcut?: string;
};

type ToolbarGroup = InlineAction[];

const inlineGroup: ToolbarGroup = [
  { id: "bold", command: "bold", icon: faBold, label: "Bold", shortcut: "⌘B" },
  { id: "italic", command: "italic", icon: faItalic, label: "Italic", shortcut: "⌘I" },
  { id: "underline", command: "underline", icon: faUnderline, label: "Underline", shortcut: "⌘U" },
  { id: "strikeThrough", command: "strikeThrough", icon: faStrikethrough, label: "Strikethrough" },
  { id: "subscript", command: "subscript", icon: faSubscript, label: "Subscript" },
  { id: "superscript", command: "superscript", icon: faSuperscript, label: "Superscript" },
];

const listGroup: ToolbarGroup = [
  { id: "insertUnorderedList", command: "insertUnorderedList", icon: faListUl, label: "Bullet list" },
  { id: "insertOrderedList", command: "insertOrderedList", icon: faListOl, label: "Numbered list" },
  { id: "outdent", command: "outdent", icon: faOutdent, label: "Decrease indent" },
  { id: "indent", command: "indent", icon: faIndent, label: "Increase indent" },
];

const alignGroup: ToolbarGroup = [
  { id: "justifyLeft", command: "justifyLeft", icon: faAlignLeft, label: "Align left" },
  { id: "justifyCenter", command: "justifyCenter", icon: faAlignCenter, label: "Align centre" },
  { id: "justifyRight", command: "justifyRight", icon: faAlignRight, label: "Align right" },
];

const blockFormats = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 1", value: "h1" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "blockquote" },
  { label: "Code block", value: "pre" },
] as const;

const fontSizes = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Large", value: "5" },
  { label: "Huge", value: "6" },
] as const;

const stateCommands = [
  "bold",
  "italic",
  "underline",
  "strikeThrough",
  "subscript",
  "superscript",
  "insertUnorderedList",
  "insertOrderedList",
  "justifyLeft",
  "justifyCenter",
  "justifyRight",
] as const;

type RichTextFieldProps = {
  error?: string;
  help?: string;
  id: string;
  label: string;
  labelPosition?: LabelPosition;
  minHeight?: number;
  mode?: FieldMode;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  value: string;
  onChange: (html: string) => void;
};

function normaliseBlock(value: string) {
  const cleaned = value.replace(/[<>]/g, "").toLowerCase();
  return cleaned === "div" || cleaned === "" ? "p" : cleaned;
}

function buildTableHtml(rows: number, cols: number) {
  const bodyRows: string[] = [];
  for (let r = 0; r < rows; r += 1) {
    const cells: string[] = [];
    for (let c = 0; c < cols; c += 1) {
      cells.push("<td><br /></td>");
    }
    bodyRows.push(`<tr>${cells.join("")}</tr>`);
  }
  return `<table><tbody>${bodyRows.join("")}</tbody></table><p><br /></p>`;
}

export function RichTextField({
  error,
  help,
  id,
  label,
  labelPosition = "left",
  minHeight = 180,
  mode = "stacked",
  placeholder,
  readOnly = false,
  required,
  value,
  onChange,
}: RichTextFieldProps) {
  const shellAria = useFieldShellAria();
  const editorRef = useRef<HTMLDivElement>(null);
  const syncingValueRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>({});
  const [blockFormat, setBlockFormat] = useState("p");
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);

  const syncHistoryState = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }
    try {
      setCanUndo(document.queryCommandEnabled("undo"));
    } catch {
      setCanUndo(false);
    }
    try {
      setCanRedo(document.queryCommandEnabled("redo"));
    } catch {
      setCanRedo(false);
    }
  }, []);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (!editor || syncingValueRef.current) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = document.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }
    if (editor.contains(selection.anchorNode)) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    const range = savedRangeRef.current;
    editor?.focus();
    if (!range) {
      return;
    }
    const selection = document.getSelection();
    if (!selection) {
      return;
    }
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const syncToolbarState = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }

    const editor = editorRef.current;
    const selection = document.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    if (!editor.contains(selection.anchorNode)) {
      return;
    }

    savedRangeRef.current = selection.getRangeAt(0).cloneRange();

    const nextActive: Record<string, boolean> = {};
    for (const command of stateCommands) {
      try {
        nextActive[command] = document.queryCommandState(command);
      } catch {
        nextActive[command] = false;
      }
    }
    setActiveCommands(nextActive);

    try {
      const block = document.queryCommandValue("formatBlock");
      setBlockFormat(normaliseBlock(block || "p"));
    } catch {
      setBlockFormat("p");
    }
  }, []);

  useEffect(() => {
    if (readOnly) {
      return;
    }

    const handleSelectionChange = () => {
      syncToolbarState();
      syncHistoryState();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [readOnly, syncHistoryState, syncToolbarState]);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    syncingValueRef.current = true;
    onChange(editor.innerHTML);
    syncHistoryState();
    window.requestAnimationFrame(() => {
      syncingValueRef.current = false;
    });
  }, [onChange, syncHistoryState]);

  const focusEditor = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  const exec = useCallback(
    (command: string, commandValue?: string) => {
      if (readOnly) {
        return;
      }
      focusEditor();
      document.execCommand(command, false, commandValue);
      syncToolbarState();
      emitChange();
    },
    [emitChange, focusEditor, readOnly, syncToolbarState],
  );

  const execWithSelection = useCallback(
    (command: string, commandValue?: string) => {
      if (readOnly) {
        return;
      }
      restoreSelection();
      document.execCommand(command, false, commandValue);
      syncToolbarState();
      emitChange();
    },
    [emitChange, readOnly, restoreSelection, syncToolbarState],
  );

  const applyBlockFormat = useCallback(
    (nextValue: string) => {
      if (readOnly) {
        return;
      }
      focusEditor();
      document.execCommand("formatBlock", false, nextValue);
      setBlockFormat(normaliseBlock(nextValue));
      syncToolbarState();
      emitChange();
    },
    [emitChange, focusEditor, readOnly, syncToolbarState],
  );

  const openLinkModal = useCallback(() => {
    if (readOnly) {
      return;
    }
    saveSelection();
    setLinkUrl("");
    setLinkModalOpen(true);
  }, [readOnly, saveSelection]);

  const confirmLink = useCallback(() => {
    const url = linkUrl.trim();
    setLinkModalOpen(false);
    if (!url) {
      return;
    }
    execWithSelection("createLink", url);
  }, [execWithSelection, linkUrl]);

  const insertImage = useCallback(() => {
    if (readOnly) {
      return;
    }
    const url = window.prompt("Image URL");
    if (!url) {
      return;
    }
    exec("insertImage", url);
  }, [exec, readOnly]);

  const openTableModal = useCallback(() => {
    if (readOnly) {
      return;
    }
    saveSelection();
    setTableRows(2);
    setTableCols(2);
    setTableModalOpen(true);
  }, [readOnly, saveSelection]);

  const confirmTable = useCallback(() => {
    setTableModalOpen(false);
    const rows = Math.max(1, Math.min(20, Math.round(tableRows) || 0));
    const cols = Math.max(1, Math.min(20, Math.round(tableCols) || 0));
    if (!rows || !cols) {
      return;
    }
    execWithSelection("insertHTML", buildTableHtml(rows, cols));
  }, [execWithSelection, tableCols, tableRows]);

  function ToolbarButton({
    icon,
    label,
    onPress,
    active = false,
    disabled = false,
    tooltip,
  }: {
    icon: IconDefinition;
    label: string;
    onPress: () => void;
    active?: boolean;
    disabled?: boolean;
    tooltip?: string;
  }) {
    const hint = tooltip ?? label;
    return (
      <Tooltip content={hint} placement="bottom">
        <button
          aria-label={label}
          aria-pressed={active}
          className={[styles.toolbarButton, active ? styles.toolbarButtonActive : ""]
            .filter(Boolean)
            .join(" ")}
          disabled={readOnly || disabled}
          type="button"
          onClick={onPress}
          onMouseDown={(event) => event.preventDefault()}
        >
          <FontAwesomeIcon aria-hidden="true" className={styles.toolbarIcon} icon={icon} />
        </button>
      </Tooltip>
    );
  }

  function ColorButton({
    icon,
    label,
    command,
    swatch,
    defaultColor,
  }: {
    icon: IconDefinition;
    label: string;
    command: string;
    swatch: string;
    defaultColor: string;
  }) {
    return (
      <Tooltip content={label} placement="bottom">
        <label
          className={styles.toolbarButton}
          onMouseDown={() => saveSelection()}
        >
          <FontAwesomeIcon aria-hidden="true" className={styles.toolbarIcon} icon={icon} />
          <span aria-hidden="true" className={styles.colorSwatch} style={{ background: swatch }} />
          <input
            aria-label={label}
            className={styles.colorInput}
            disabled={readOnly}
            defaultValue={defaultColor}
            type="color"
            onChange={(event) => execWithSelection(command, event.target.value)}
          />
        </label>
      </Tooltip>
    );
  }

  function renderGroup(group: ToolbarGroup) {
    return group.map((action) => (
      <ToolbarButton
        active={Boolean(activeCommands[action.command])}
        icon={action.icon}
        key={action.id}
        label={action.label}
        tooltip={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
        onPress={() => exec(action.command)}
      />
    ));
  }

  return (
    <FieldShell
      error={error}
      flaggedAlign="start"
      help={help}
      id={id}
      label={label}
      labelPosition={labelPosition}
      mode={mode}
      required={required}
    >
      <div className={styles.field}>
        <div className={[styles.editorShell, error ? styles.error : ""].filter(Boolean).join(" ")}>
          <div aria-label="Formatting toolbar" className={styles.toolbar} role="toolbar">
            <ToolbarButton
              disabled={!canUndo}
              icon={faRotateLeft}
              label="Undo"
              tooltip="Undo (⌘Z)"
              onPress={() => exec("undo")}
            />
            <ToolbarButton
              disabled={!canRedo}
              icon={faRotateRight}
              label="Redo"
              tooltip="Redo (⇧⌘Z)"
              onPress={() => exec("redo")}
            />
            <span aria-hidden="true" className={styles.divider} />
            <select
              aria-label="Text style"
              className={styles.blockSelect}
              disabled={readOnly}
              value={blockFormat}
              onChange={(event) => applyBlockFormat(event.target.value)}
              onMouseDown={(event) => event.stopPropagation()}
            >
              {blockFormats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Font size"
              className={styles.blockSelect}
              defaultValue="3"
              disabled={readOnly}
              onMouseDown={() => saveSelection()}
              onChange={(event) => execWithSelection("fontSize", event.target.value)}
            >
              {fontSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
            <span aria-hidden="true" className={styles.divider} />
            {renderGroup(inlineGroup)}
            <ColorButton
              command="foreColor"
              defaultColor="#111827"
              icon={faPalette}
              label="Text colour"
              swatch="#111827"
            />
            <ColorButton
              command="hiliteColor"
              defaultColor="#fde047"
              icon={faHighlighter}
              label="Highlight colour"
              swatch="#fde047"
            />
            <span aria-hidden="true" className={styles.divider} />
            {renderGroup(listGroup)}
            <ToolbarButton
              icon={faQuoteRight}
              label="Quote"
              onPress={() => applyBlockFormat("blockquote")}
            />
            <ToolbarButton
              icon={faCode}
              label="Code block"
              onPress={() => applyBlockFormat("pre")}
            />
            <span aria-hidden="true" className={styles.divider} />
            {renderGroup(alignGroup)}
            <span aria-hidden="true" className={styles.divider} />
            <ToolbarButton icon={faLink} label="Insert link" onPress={openLinkModal} />
            <ToolbarButton icon={faLinkSlash} label="Remove link" onPress={() => exec("unlink")} />
            <ToolbarButton
              disabled
              icon={faImage}
              label="Insert image (coming soon)"
              onPress={insertImage}
            />
            <ToolbarButton icon={faTable} label="Insert table" onPress={openTableModal} />
            <ToolbarButton
              icon={faMinus}
              label="Horizontal rule"
              onPress={() => exec("insertHorizontalRule")}
            />
            <span aria-hidden="true" className={styles.divider} />
            <ToolbarButton
              icon={faEraser}
              label="Clear formatting"
              onPress={() => exec("removeFormat")}
            />
          </div>
          <div
            aria-multiline="true"
            aria-readonly={readOnly || undefined}
            className={[styles.editor, readOnly ? styles.readOnly : ""].filter(Boolean).join(" ")}
            contentEditable={readOnly ? false : true}
            data-placeholder={placeholder}
            id={id}
            ref={editorRef}
            role="textbox"
            style={{ minHeight }}
            suppressContentEditableWarning
            onInput={emitChange}
            onKeyUp={syncToolbarState}
            onMouseUp={syncToolbarState}
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
          />
        </div>

        {linkModalOpen ? (
          <div
            className={styles.modalOverlay}
            role="presentation"
            onMouseDown={() => setLinkModalOpen(false)}
          >
            <div
              aria-label="Insert link"
              aria-modal="true"
              className={styles.modal}
              role="dialog"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Insert link</h3>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor={`${id}-link-url`}>
                  URL
                </label>
                <input
                  autoFocus
                  className={styles.modalInput}
                  id={`${id}-link-url`}
                  placeholder="https://example.com"
                  type="url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      confirmLink();
                    } else if (event.key === "Escape") {
                      event.preventDefault();
                      setLinkModalOpen(false);
                    }
                  }}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalCancel}
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.modalConfirm}
                  disabled={!linkUrl.trim()}
                  type="button"
                  onClick={confirmLink}
                >
                  Insert link
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {tableModalOpen ? (
          <div
            className={styles.modalOverlay}
            role="presentation"
            onMouseDown={() => setTableModalOpen(false)}
          >
            <div
              aria-label="Insert table"
              aria-modal="true"
              className={styles.modal}
              role="dialog"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Insert table</h3>
              <div className={styles.modalDimensions}>
                <div className={styles.modalDimensionField}>
                  <label className={styles.modalLabel} htmlFor={`${id}-table-rows`}>
                    Rows
                  </label>
                  <input
                    autoFocus
                    className={styles.modalNumber}
                    id={`${id}-table-rows`}
                    max={20}
                    min={1}
                    type="number"
                    value={tableRows}
                    onChange={(event) => setTableRows(Number(event.target.value))}
                  />
                </div>
                <span aria-hidden="true" className={styles.modalTimes}>
                  ×
                </span>
                <div className={styles.modalDimensionField}>
                  <label className={styles.modalLabel} htmlFor={`${id}-table-cols`}>
                    Columns
                  </label>
                  <input
                    className={styles.modalNumber}
                    id={`${id}-table-cols`}
                    max={20}
                    min={1}
                    type="number"
                    value={tableCols}
                    onChange={(event) => setTableCols(Number(event.target.value))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        confirmTable();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        setTableModalOpen(false);
                      }
                    }}
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalCancel}
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                >
                  Cancel
                </button>
                <button className={styles.modalConfirm} type="button" onClick={confirmTable}>
                  Insert table
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </FieldShell>
  );
}
