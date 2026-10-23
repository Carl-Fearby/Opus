"use client";

import "@/lib/fontawesome";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type DragEvent as ReactDragEvent,
  type ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBold,
  faCode,
  faImage,
  faItalic,
  faLink,
  faLinkSlash,
  faListOl,
  faListUl,
  faPaperclip,
  faRotateLeft,
  faRotateRight,
  faStrikethrough,
  faTable,
  faUnderline,
} from "@fortawesome/free-solid-svg-icons";
import { FieldShell, fieldInputAriaProps, useFieldShellAria } from "@/components/fields/FieldShell";
import type { FieldMode, InputControlSize, LabelPosition } from "@/components/fields/types";
import { inputControlSizeClassName } from "../shared/inputControlSizes";
import { Tooltip } from "@/components/Tooltip";
import styles from "./RichTextField.module.css";
import type { ControlRadius } from "../types";

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
];

const listGroup: ToolbarGroup = [
  { id: "insertUnorderedList", command: "insertUnorderedList", icon: faListUl, label: "Bullet list" },
  { id: "insertOrderedList", command: "insertOrderedList", icon: faListOl, label: "Numbered list" },
];

const stateCommands = [
  "bold",
  "italic",
  "underline",
  "strikeThrough",
  "insertUnorderedList",
  "insertOrderedList",
] as const;

export type RichTextAttachment = {
  mimeType?: string;
  name?: string;
  url: string;
};

type RichTextFieldProps = {
  /** Upload a pasted, dropped or picked file and return the final URL to embed. */
  onAttachmentUpload?: (
    file: File,
  ) => Promise<RichTextAttachment | null> | RichTextAttachment | null;
  onBlur?: () => void;
  radius?: ControlRadius;
  transparency?: import("../types").ControlTransparency;
  gradient?: boolean;
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
  size?: InputControlSize;
  value: string;
  onChange: (html: string) => void;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildAttachmentHtml(attachment: RichTextAttachment) {
  const name = escapeHtml(attachment.name ?? "Attachment");
  const url = escapeHtml(attachment.url);
  if (attachment.mimeType?.startsWith("image/")) {
    return `<img src="${url}" alt="${name}" />`;
  }
  return `<a href="${url}" rel="noreferrer" target="_blank">${name}</a>`;
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
  onAttachmentUpload,
  onBlur,
  placeholder,
  readOnly = false,
  required,
  size = "md",
  value,
  onChange,
  radius,
  transparency,
  gradient,
}: RichTextFieldProps) {
  const shellAria = useFieldShellAria();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const syncingValueRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);
  const [activeCommands, setActiveCommands] = useState<Record<string, boolean>>({});
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [uploading, setUploading] = useState(0);

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

  const insertHtmlAtSelection = useCallback(
    (html: string) => {
      if (readOnly || !html) {
        return;
      }
      restoreSelection();
      if (typeof document.execCommand === "function") {
        document.execCommand("insertHTML", false, html);
      } else {
        const editor = editorRef.current;
        const selection = document.getSelection();
        if (editor && selection) {
          const range =
            selection.rangeCount > 0
              ? selection.getRangeAt(0)
              : document.createRange();
          if (selection.rangeCount === 0) {
            range.selectNodeContents(editor);
            range.collapse(false);
          }
          range.deleteContents();
          const template = document.createElement("template");
          template.innerHTML = html;
          range.insertNode(template.content.cloneNode(true));
          const nextRange = document.createRange();
          nextRange.selectNodeContents(editor);
          nextRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(nextRange);
        }
      }
      saveSelection();
      syncToolbarState();
      emitChange();
    },
    [emitChange, readOnly, restoreSelection, saveSelection, syncToolbarState],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (readOnly || !onAttachmentUpload || files.length === 0) {
        return;
      }
      saveSelection();
      setUploading((count) => count + files.length);
      for (const file of files) {
        try {
          const attachment = await onAttachmentUpload(file);
          if (attachment) {
            insertHtmlAtSelection(buildAttachmentHtml(attachment));
          }
        } catch {
          // Leave the editor untouched so the author can retry.
        } finally {
          setUploading((count) => Math.max(0, count - 1));
        }
      }
    },
    [insertHtmlAtSelection, onAttachmentUpload, readOnly, saveSelection],
  );

  const openAttachmentPicker = useCallback(
    (kind: "file" | "image") => {
      if (readOnly || !onAttachmentUpload) {
        return;
      }
      saveSelection();
      if (kind === "image") {
        imageInputRef.current?.click();
      } else {
        fileInputRef.current?.click();
      }
    },
    [onAttachmentUpload, readOnly, saveSelection],
  );

  const handlePaste = useCallback(
    (event: ReactClipboardEvent<HTMLDivElement>) => {
      const files = Array.from(event.clipboardData.files ?? []);
      if (files.length === 0) {
        return;
      }
      event.preventDefault();
      saveSelection();
      void uploadFiles(files);
    },
    [saveSelection, uploadFiles],
  );

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length === 0) {
        return;
      }
      event.preventDefault();
      const range =
        typeof document.caretRangeFromPoint === "function"
          ? document.caretRangeFromPoint(event.clientX, event.clientY)
          : null;
      const editor = editorRef.current;
      if (range && editor?.contains(range.startContainer)) {
        savedRangeRef.current = range.cloneRange();
      } else {
        saveSelection();
      }
      void uploadFiles(files);
    },
    [saveSelection, uploadFiles],
  );

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
      radius={radius}
      transparency={transparency}
      gradient={gradient}
      required={required}
    >
      <div className={styles.field}>
        <div className={[styles.editorShell, inputControlSizeClassName[size], error ? styles.error : ""].filter(Boolean).join(" ")}>
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
            {renderGroup(inlineGroup)}
            <span aria-hidden="true" className={styles.divider} />
            <ToolbarButton
              icon={faCode}
              label="Code block"
              onPress={() => applyBlockFormat("pre")}
            />
            {renderGroup(listGroup)}
            <span aria-hidden="true" className={styles.divider} />
            <ToolbarButton icon={faLink} label="Insert link" onPress={openLinkModal} />
            <ToolbarButton icon={faLinkSlash} label="Remove link" onPress={() => exec("unlink")} />
            <ToolbarButton
              disabled={!onAttachmentUpload}
              icon={faImage}
              label="Insert image"
              onPress={() => openAttachmentPicker("image")}
            />
            <ToolbarButton
              disabled={!onAttachmentUpload}
              icon={faPaperclip}
              label="Attach file"
              onPress={() => openAttachmentPicker("file")}
            />
            <ToolbarButton icon={faTable} label="Insert table" onPress={openTableModal} />
          </div>
          <input
            aria-label="Insert images"
            accept="image/*"
            className={styles.hiddenInput}
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length) void uploadFiles(files);
            }}
            ref={imageInputRef}
            style={{ display: "none" }}
            type="file"
          />
          <input
            aria-label="Attach files"
            className={styles.hiddenInput}
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              if (files.length) void uploadFiles(files);
            }}
            ref={fileInputRef}
            style={{ display: "none" }}
            type="file"
          />
          <div
            aria-busy={uploading > 0 || undefined}
            aria-label={label}
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
            onBlur={onBlur}
            onDragOver={(event) => {
              if (event.dataTransfer.types.includes("Files")) {
                event.preventDefault();
              }
            }}
            onDrop={handleDrop}
            onInput={emitChange}
            onKeyUp={syncToolbarState}
            onMouseUp={syncToolbarState}
            onPaste={handlePaste}
            {...fieldInputAriaProps(shellAria, { invalid: Boolean(error) })}
          />
          {uploading > 0 ? (
            <span className={styles.uploadStatus} role="status">
              Uploading {uploading === 1 ? "file" : "files"}…
            </span>
          ) : null}
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

const RICH_TEXT_ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "div",
  "em",
  "font",
  "h1",
  "h2",
  "h3",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strike",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const RICH_TEXT_DANGEROUS_TAGS = new Set([
  "embed",
  "iframe",
  "link",
  "meta",
  "object",
  "script",
  "style",
]);

const RICH_TEXT_ALLOWED_ATTRIBUTES = new Set([
  "alt",
  "color",
  "colspan",
  "height",
  "href",
  "rel",
  "rowspan",
  "size",
  "src",
  "style",
  "target",
  "title",
  "width",
]);

const RICH_TEXT_ALLOWED_STYLE_PROPERTIES = new Set([
  "background-color",
  "color",
  "font-size",
  "font-style",
  "font-weight",
  "text-align",
  "text-decoration",
  "text-decoration-line",
]);

function isSafeRichTextUrl(value: string, allowImageData = false) {
  const url = value.trim();
  if (!url) return false;
  if (/^(javascript|vbscript):/i.test(url)) return false;
  if (url.startsWith("#") || url.startsWith("/")) return true;
  if (/^(https?:|mailto:|tel:|blob:)/i.test(url)) return true;
  return allowImageData && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(url);
}

function sanitizeStyleValue(value: string) {
  return value
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => {
      const [property, rawValue = ""] = entry.split(":");
      const name = property?.trim().toLowerCase() ?? "";
      const cssValue = rawValue.trim().toLowerCase();
      return (
        RICH_TEXT_ALLOWED_STYLE_PROPERTIES.has(name) &&
        !cssValue.includes("url(") &&
        !cssValue.includes("expression(") &&
        !cssValue.includes("javascript:")
      );
    })
    .join("; ");
}

/** Sanitises editor HTML before it is rendered outside the editor. */
export function sanitizeRichTextHtml(html: string) {
  if (!html || typeof DOMParser === "undefined") {
    return "";
  }

  const documentNode = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = documentNode.body.firstElementChild;
  if (!root) return "";

  const clean = (node: Node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    if (RICH_TEXT_DANGEROUS_TAGS.has(tag)) {
      element.remove();
      return;
    }

    Array.from(element.childNodes).forEach(clean);

    if (!RICH_TEXT_ALLOWED_TAGS.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || !RICH_TEXT_ALLOWED_ATTRIBUTES.has(name)) {
        element.removeAttribute(attribute.name);
        return;
      }
      if (name === "href" && !isSafeRichTextUrl(attribute.value)) {
        element.removeAttribute(attribute.name);
      }
      if (name === "src" && !isSafeRichTextUrl(attribute.value, true)) {
        element.removeAttribute(attribute.name);
      }
      if (name === "style") {
        const style = sanitizeStyleValue(attribute.value);
        if (style) element.setAttribute("style", style);
        else element.removeAttribute("style");
      }
    });

    if (tag === "a") {
      element.setAttribute("rel", "noopener noreferrer");
    }
    if (tag === "img") {
      element.setAttribute("loading", "lazy");
    }
  };

  Array.from(root.childNodes).forEach(clean);
  return root.innerHTML;
}

/** True when rich content has no visible text, image, rule or table. */
export function isRichTextEmpty(html: string | null | undefined) {
  if (!html) return true;
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length === 0 && !/<(img|hr|table|video|audio)\b/i.test(html);
}

export function RichTextContent({
  className,
  emptyFallback = null,
  html,
}: {
  className?: string;
  emptyFallback?: ReactNode;
  html: string;
}) {
  const [safeHtml, setSafeHtml] = useState("");

  useEffect(() => {
    setSafeHtml(sanitizeRichTextHtml(html));
  }, [html]);

  if (isRichTextEmpty(safeHtml)) {
    return <>{emptyFallback}</>;
  }

  return (
    <div
      className={[styles.content, className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
