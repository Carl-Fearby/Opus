"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faComment, faDownload, faFile, faGripVertical, faPalette, faPaperclip, faPaperPlane, faPen, faSpinner, faTags, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { createThemedPortal as createPortal } from "@/lib/theme/createThemedPortal";
import { Button } from "@/components/fields/Button";
import { ColorPickerPanel } from "@/components/fields/ColorPickerPanel";
import { isRichTextEmpty, RichTextContent, RichTextField } from "@/components/fields/RichTextField";
import { SelectField } from "@/components/fields/SelectField";
import { Modal } from "@/components/Modal";
import styles from "./KanbanBoard.module.css";

export type KanbanComment = {
  id: string;
  /** Files shared with this comment. */
  attachments?: KanbanAttachment[];
  author?: string;
  /** Rich HTML from RichTextField. Render through RichTextContent or sanitise before display. */
  body: string;
  /** ISO timestamp. */
  createdAt?: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  /** Legacy external metadata. Prefer tagIds for visible ticket labels. */
  meta?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  /** Rich HTML from RichTextField. Render through RichTextContent or sanitise before display. */
  description?: string;
  /** Optional side-border colour for the ticket. Falls back to the tone accent. */
  color?: string;
  comments?: KanbanComment[];
  /** Board tag ids assigned to this card. */
  tagIds?: string[];
  /** Board member ids assigned to this card. */
  assigneeIds?: string[];
  attachments?: KanbanAttachment[];
};

export type KanbanAttachment = {
  /** MIME type when known. */
  mimeType?: string;
  /** Dedicated download URL. Falls back to `url`. Use a backend URL with Content-Disposition when possible. */
  downloadUrl?: string;
  /** Transient upload state. Parent data should persist only ready attachments. */
  error?: string;
  id: string;
  name: string;
  /** File size in bytes. */
  size?: number;
  /** Transient upload state. Parent data should persist only ready attachments. */
  status?: "uploading" | "error";
  /** Open or preview URL. */
  url: string;
  uploadedAt?: string;
  uploadedBy?: string;
};

export type KanbanAttachmentContext = {
  card: KanbanCard;
  cardId: string;
  /** Whether the file belongs to the ticket itself, its description, or a comment draft. */
  target: "card" | "comment" | "description";
};

export type KanbanMember = {
  /** Optional avatar image URL. Initials are used when omitted. */
  avatar?: string;
  /** Fallback avatar colour. */
  color?: string;
  id: string;
  name: string;
  role?: string;
};

export type KanbanTag = {
  id: string;
  label: string;
  /** CSS colour shared with the list header palette. */
  color: string;
};

export type KanbanActivity =
  | { at: string; column: KanbanColumn; columns: KanbanColumn[]; type: "list-created" }
  | { at: string; changes: string[]; column: KanbanColumn; columns: KanbanColumn[]; previousColumn: KanbanColumn; type: "list-updated" }
  | { at: string; columnId: string; columns: KanbanColumn[]; fromIndex: number; toIndex: number; type: "list-reordered" }
  | { at: string; cardId: string; columns: KanbanColumn[]; fromColumnId: string; fromIndex: number; toColumnId: string; toIndex: number; type: "card-moved" }
  | { at: string; cardId: string; comment: KanbanComment; comments: KanbanComment[]; type: "comment-added" }
  | { at: string; tag: KanbanTag; tags: KanbanTag[]; type: "tag-created" }
  | { at: string; previousTag: KanbanTag; tag: KanbanTag; tags: KanbanTag[]; type: "tag-updated" }
  | { at: string; tag: KanbanTag; tags: KanbanTag[]; type: "tag-deleted" }
  | { at: string; card: KanbanCard; cardId: string; tagIds: string[]; type: "card-tags-changed" }
  | { at: string; card: KanbanCard; cardId: string; memberIds: string[]; type: "card-assignees-changed" }
  | { at: string; attachments: KanbanAttachment[]; card: KanbanCard; cardId: string; type: "card-attachments-changed" }
  | { at: string; card: KanbanCard; columnId: string; columns: KanbanColumn[]; type: "card-created" }
  | { at: string; card: KanbanCard; cardId: string; changes: string[]; previousCard: KanbanCard; type: "card-updated" };

type WithoutActivityTimestamp<T> = T extends { at: string } ? Omit<T, "at"> : never;

export type KanbanColumnReorder = {
  columnId: string;
  fromIndex: number;
  toIndex: number;
};

export type KanbanCardMove = {
  cardId: string;
  fromColumnId: string;
  fromIndex: number;
  toColumnId: string;
  toIndex: number;
};

export type KanbanColumn = {
  id: string;
  title: string;
  cardIds: string[];
  /** Optional header accent colour (CSS colour). */
  accent?: string;
};

export type KanbanBoardProps = {
  /** Controlled open card/ticket. */
  activeCardId?: string | null;
  /** Board name shown above the lists. Omit to let the board own the title. */
  boardTitle?: string;
  /** Board members available for assignment. */
  members?: KanbanMember[];
  /** Label for the new-card composer trigger. */
  addCardLabel?: string;
  /** Label for the new-list button. */
  addColumnLabel?: string;
  cards: Record<string, KanbanCard>;
  /** Colour presets offered by list headers and the tag manager. */
  columnColors?: string[];
  /** Fixed width for each list. Numbers are pixels. */
  columnWidth?: number | string;
  columns: KanbanColumn[];
  /** Show comment counts and the comment thread action on each card. Defaults to true. */
  commentsEnabled?: boolean;
  /** The current commenter shown in the composer. */
  currentUser?: { name: string };
  /** Initial open card when the board owns ticket state. */
  defaultActiveCardId?: string | null;
  /** Initial members when the board owns member data. */
  defaultMembers?: KanbanMember[];
  /** Initial tags when the board owns tag state. */
  defaultTags?: KanbanTag[];
  onChange?: (columns: KanbanColumn[]) => void;
  onActiveCardChange?: (cardId: string | null, card: KanbanCard | null) => void;
  /** Called when the board title is renamed. */
  onBoardTitleChange?: (title: string) => void;
  onAddComment?: (cardId: string, comment: KanbanComment) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCardCreate?: (
    card: KanbanCard,
    columnId: string,
    columns: KanbanColumn[],
    cards: Record<string, KanbanCard>,
  ) => void;
  onCardMove?: (cardId: string, move: KanbanCardMove, columns: KanbanColumn[]) => void;
  onCardUpdate?: (cardId: string, patch: Partial<KanbanCard>, card: KanbanCard) => void;
  /** Delete an attachment from storage. Called after a ticket attachment is removed and when a finished comment draft attachment is discarded. */
  onAttachmentRemove?: (
    attachment: KanbanAttachment,
    context: KanbanAttachmentContext,
  ) => Promise<void> | void;
  /** Upload a file to your storage. Return the persisted attachment with its final URL. When omitted, local blob URLs are used for demos. */
  onAttachmentUpload?: (
    file: File,
    context: KanbanAttachmentContext,
  ) => Promise<KanbanAttachment> | KanbanAttachment;
  onCardAssigneesChange?: (cardId: string, memberIds: string[], card: KanbanCard) => void;
  onCardAttachmentsChange?: (cardId: string, attachments: KanbanAttachment[], card: KanbanCard) => void;
  onCardTagsChange?: (cardId: string, tagIds: string[], card: KanbanCard) => void;
  onColumnChange?: (column: KanbanColumn, previousColumn: KanbanColumn, columns: KanbanColumn[]) => void;
  onColumnCreate?: (column: KanbanColumn, columns: KanbanColumn[]) => void;
  onColumnReorder?: (columns: KanbanColumn[], change: KanbanColumnReorder) => void;
  onCommentsChange?: (cardId: string, comments: KanbanComment[]) => void;
  /** Structured event stream for persistence: every list, card, comment and tag mutation. */
  onActivity?: (activity: KanbanActivity) => void;
  onTagCreate?: (tag: KanbanTag, tags: KanbanTag[]) => void;
  onTagDelete?: (tag: KanbanTag, tags: KanbanTag[]) => void;
  onTagUpdate?: (tag: KanbanTag, previousTag: KanbanTag, tags: KanbanTag[]) => void;
  onTagsChange?: (tags: KanbanTag[]) => void;
  /** Shows the board-level tag manager. Defaults to true. */
  tagManager?: boolean;
  /** Controlled tags. */
  tags?: KanbanTag[];
  /** Enables the built-in ticket view. Defaults to true. */
  ticketView?: boolean;
};

type DropTarget = {
  columnId: string;
  index: number;
};

type ColumnDragState = {
  accent: string;
  columnId: string;
  dropIndex: number | null;
  fromIndex: number;
  headerHeight: number;
  height: number;
  muted: string;
  offsetX: number;
  offsetY: number;
  originLeft: number;
  originTop: number;
  panel: string;
  phase: "dragging" | "dropping";
  step: number;
  text: string;
  title: string;
  width: number;
  x: number;
  y: number;
};

type DragState = {
  accent: string;
  cardId: string;
  /** True once the board order has been updated and the card fills the gap. */
  committed: boolean;
  dropTarget: DropTarget | null;
  fromColumnId: string;
  height: number;
  homeIndex: number;
  muted: string;
  offsetX: number;
  offsetY: number;
  originLeft: number;
  originTop: number;
  panel: string;
  phase: "dragging" | "dropping";
  text: string;
  tilt: number;
  width: number;
  x: number;
  y: number;
};

const DRAG_THRESHOLD_PX = 4;

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const DEFAULT_COLUMN_COLORS = [
  "#64748b",
  "#0284c7",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#84cc16",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#6366f1",
];
const DROP_ANIMATION_MS = 220;

function formatFileSize(size?: number) {
  if (!size || size < 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function memberInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CardContent({ card }: { card: KanbanCard }) {
  return (
    <div className={styles.cardTitle} title={card.title}>
      {card.title}
    </div>
  );
}

function readThemeTokens(source: HTMLElement) {
  const host = (source.closest("[data-kanban-column]") as HTMLElement | null) ?? source;
  const hostStyles = getComputedStyle(host);
  const sourceStyles = getComputedStyle(source);
  const opaque = (value: string, fallback: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "transparent" || trimmed.includes("rgba(0, 0, 0, 0)")) {
      return fallback;
    }
    return trimmed;
  };

  return {
    panel: opaque(
      sourceStyles.backgroundColor || hostStyles.getPropertyValue("--dashboard-section-panel"),
      "#111827",
    ),
    text: opaque(hostStyles.getPropertyValue("--dashboard-section-text"), "#f8fafc"),
    muted: opaque(hostStyles.getPropertyValue("--dashboard-section-muted"), "#94a3b8"),
    accent: opaque(sourceStyles.getPropertyValue("--card-accent"), "#38bdf8"),
  };
}

function readTranslateY(element: HTMLElement) {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") return 0;
  if (transform.startsWith("matrix3d(")) {
    const parts = transform.slice(9, -1).split(",").map((part) => Number(part.trim()));
    return parts[13] || 0;
  }
  if (transform.startsWith("matrix(")) {
    const parts = transform.slice(7, -1).split(",").map((part) => Number(part.trim()));
    return parts[5] || 0;
  }
  return 0;
}

function readTranslateX(element: HTMLElement) {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") return 0;
  if (transform.startsWith("matrix3d(")) {
    const parts = transform.slice(9, -1).split(",").map((part) => Number(part.trim()));
    return parts[12] || 0;
  }
  if (transform.startsWith("matrix(")) {
    const parts = transform.slice(7, -1).split(",").map((part) => Number(part.trim()));
    return parts[4] || 0;
  }
  return 0;
}

/** Bounding box in layout space (ignores live translateY used for gap animation). */
function getLayoutRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const translateY = readTranslateY(element);
  return {
    left: rect.left,
    width: rect.width,
    height: rect.height,
    top: rect.top - translateY,
    bottom: rect.bottom - translateY,
  };
}

function resolveDropTarget(
  clientX: number,
  clientY: number,
  draggingCardId: string,
  home?: DropTarget | null,
): DropTarget | null {
  const node = document.elementFromPoint(clientX, clientY);
  let column = node?.closest("[data-kanban-column-id]") as HTMLElement | null;

  // Preview / empty gap space can miss the column via elementFromPoint.
  if (!column) {
    const candidates = document.querySelectorAll<HTMLElement>("[data-kanban-column-id]");
    for (const candidate of candidates) {
      const rect = candidate.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        column = candidate;
        break;
      }
    }
  }

  if (!column) return null;

  const columnId = column.dataset.kanbanColumnId;
  if (!columnId) return null;

  const list = column.querySelector("[data-kanban-cards]");
  if (!list) return { columnId, index: 0 };

  const slots = Array.from(list.querySelectorAll<HTMLElement>("[data-kanban-card-id]")).filter(
    (slot) => slot.dataset.kanbanCardId !== draggingCardId,
  );

  for (let index = 0; index < slots.length; index += 1) {
    const rect = getLayoutRect(slots[index]);
    // Keep only a thin band for the original insert index so dragging past the
    // next card (e.g. first card → below the second) can open a gap after the
    // stack collapses into the vacated slot.
    const isHomeInsert =
      Boolean(home) && home!.columnId === columnId && home!.index === index;
    const ratio = isHomeInsert ? 0.18 : 0.5;
    if (clientY < rect.top + rect.height * ratio) {
      return { columnId, index };
    }
  }

  return { columnId, index: slots.length };
}

function getLayoutColumnRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const translateX = readTranslateX(element);
  return {
    height: rect.height,
    left: rect.left - translateX,
    right: rect.right - translateX,
    top: rect.top,
    width: rect.width,
  };
}

function resolveColumnDropIndex(clientX: number, draggingColumnId: string) {
  const columns = Array.from(
    document.querySelectorAll<HTMLElement>("[data-kanban-column-id]"),
  ).filter((column) => column.dataset.kanbanColumnId !== draggingColumnId);

  for (let index = 0; index < columns.length; index += 1) {
    const rect = getLayoutColumnRect(columns[index]);
    if (clientX < rect.left + rect.width / 2) {
      return index;
    }
  }

  return columns.length;
}

function sameDropTarget(a: DropTarget | null, b: DropTarget | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.columnId === b.columnId && a.index === b.index;
}

function resolveDropLanding(
  dropTarget: DropTarget,
  draggingCardId: string,
  _shiftBy: number,
  fallback: { left: number; top: number; width: number },
) {
  const column = document.querySelector<HTMLElement>(
    `[data-kanban-column-id="${CSS.escape(dropTarget.columnId)}"]`,
  );
  const list = column?.querySelector<HTMLElement>("[data-kanban-cards]");
  if (!list) return fallback;

  const slots = Array.from(list.querySelectorAll<HTMLElement>("[data-kanban-card-id]")).filter(
    (slot) => slot.dataset.kanbanCardId !== draggingCardId,
  );

  if (dropTarget.index < slots.length) {
    const rect = getLayoutRect(slots[dropTarget.index]);
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
    };
  }

  if (slots.length > 0) {
    const last = getLayoutRect(slots[slots.length - 1]);
    return {
      left: last.left,
      top: last.bottom + 8,
      width: last.width,
    };
  }

  const listRect = list.getBoundingClientRect();
  return {
    left: listRect.left,
    top: listRect.top,
    width: Math.max(listRect.width - 20, fallback.width),
  };
}

export function KanbanBoard({
  addCardLabel = "Add a card",
  addColumnLabel = "Add list",
  boardTitle,
  cards,
  columnColors = DEFAULT_COLUMN_COLORS,
  columnWidth,
  columns,
  commentsEnabled = true,
  activeCardId,
  currentUser,
  defaultActiveCardId = null,
  defaultMembers = [],
  defaultTags = [],
  onActivity,
  onActiveCardChange,
  onAddComment,
  onBoardTitleChange,
  onCardClick,
  onAttachmentRemove,
  onAttachmentUpload,
  onCardAssigneesChange,
  onCardAttachmentsChange,
  onCardCreate,
  onCardMove,
  onCardTagsChange,
  onCardUpdate,
  onColumnChange,
  onColumnCreate,
  onColumnReorder,
  onChange,
  onCommentsChange,
  onTagCreate,
  onTagDelete,
  onTagUpdate,
  onTagsChange,
  tagManager = true,
  members,
  tags,
  ticketView = true,
}: KanbanBoardProps) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [columnDrag, setColumnDrag] = useState<ColumnDragState | null>(null);
  const [columnDropRect, setColumnDropRect] = useState<{
    height: number;
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [internalActiveCardId, setInternalActiveCardId] = useState<string | null>(defaultActiveCardId);
  const [internalBoardTitle, setInternalBoardTitle] = useState("Kanban board");
  const [editingBoardTitle, setEditingBoardTitle] = useState(false);
  const [boardTitleDraft, setBoardTitleDraft] = useState("");
  const skipBoardTitleCommitRef = useRef(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentAttachments, setCommentAttachments] = useState<KanbanAttachment[]>([]);
  const [localComments, setLocalComments] = useState<Record<string, KanbanComment[]>>({});
  const [scrollInfo, setScrollInfo] = useState({ left: 0, max: 0 });
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [colorMenu, setColorMenu] = useState<{ columnId: string; left: number; top: number } | null>(null);
  const [internalTags, setInternalTags] = useState<KanbanTag[]>(defaultTags);
  const resolvedTags = tags ?? internalTags;
  const resolvedMembers = members ?? defaultMembers;
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagLabel, setEditingTagLabel] = useState("");
  const [expandedTagId, setExpandedTagId] = useState<string | null>(null);
  const [newTagLabel, setNewTagLabel] = useState("");
  const [newTagColor, setNewTagColor] = useState(columnColors[0] ?? "#64748b");
  const [customColorOpen, setCustomColorOpen] = useState(false);
  const [tagColorPicker, setTagColorPicker] = useState<{ left: number; targetId: string; top: number } | null>(null);
  const [localCardTags, setLocalCardTags] = useState<Record<string, string[]>>({});
  const [localCardAssignees, setLocalCardAssignees] = useState<Record<string, string[]>>({});
  const [localAttachments, setLocalAttachments] = useState<Record<string, KanbanAttachment[]>>({});
  const localAttachmentsRef = useRef<Record<string, KanbanAttachment[]>>({});
  const [ticketMemberPickerOpen, setTicketMemberPickerOpen] = useState(false);
  const [ticketMemberSearch, setTicketMemberSearch] = useState("");
  const [localCards, setLocalCards] = useState<Record<string, KanbanCard>>({});
  const [cardComposerColumnId, setCardComposerColumnId] = useState<string | null>(null);
  const [cardDraft, setCardDraft] = useState("");
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCustomColorOpen, setTicketCustomColorOpen] = useState(false);
  const [ticketColorMenu, setTicketColorMenu] = useState<{ left: number; top: number } | null>(null);
  const [ticketTagPickerOpen, setTicketTagPickerOpen] = useState(false);
  const [ticketTagSearch, setTicketTagSearch] = useState("");
  const [moveTicketListId, setMoveTicketListId] = useState<string | null>(null);
  const [moveTicketIndex, setMoveTicketIndex] = useState(0);
  const ticketColorMenuRef = useRef<HTMLDivElement | null>(null);
  const ticketColorPickerRef = useRef<HTMLDivElement | null>(null);
  const previousActiveCardRef = useRef<string | null>(null);
  const commentFieldId = useId();
  const columnFieldId = useId();
  const tagFieldId = useId();
  const didDragRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);
  const columnDragRef = useRef<ColumnDragState | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const columnInputRef = useRef<HTMLInputElement | null>(null);
  const cardComposerRef = useRef<HTMLTextAreaElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const commentAttachmentInputRef = useRef<HTMLInputElement | null>(null);
  const wheelSnapTimerRef = useRef<number | null>(null);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);
  const colorPickerRef = useRef<HTMLDivElement | null>(null);
  const tagManagerRef = useRef<HTMLDivElement | null>(null);
  const skipTitleCommitRef = useRef(false);
  const skipTagCommitRef = useRef(false);
  const onActivityRef = useRef(onActivity);
  const onActiveCardChangeRef = useRef(onActiveCardChange);
  const onTagsChangeRef = useRef(onTagsChange);
  const onCardTagsChangeRef = useRef(onCardTagsChange);
  const onAttachmentRemoveRef = useRef(onAttachmentRemove);
  const onAttachmentUploadRef = useRef(onAttachmentUpload);
  const onCardAssigneesChangeRef = useRef(onCardAssigneesChange);
  const onCardAttachmentsChangeRef = useRef(onCardAttachmentsChange);
  const onCardCreateRef = useRef(onCardCreate);
  const onCardUpdateRef = useRef(onCardUpdate);
  const onCardMoveRef = useRef(onCardMove);
  const onColumnChangeRef = useRef(onColumnChange);
  const onColumnCreateRef = useRef(onColumnCreate);
  const onColumnReorderRef = useRef(onColumnReorder);
  const onTagCreateRef = useRef(onTagCreate);
  const onTagDeleteRef = useRef(onTagDelete);
  const onTagUpdateRef = useRef(onTagUpdate);
  const columnsRef = useRef(columns);
  const onChangeRef = useRef(onChange);
  const onAddCommentRef = useRef(onAddComment);
  const onCommentsChangeRef = useRef(onCommentsChange);
  const cardLookup = useMemo(() => ({ ...cards, ...localCards }), [cards, localCards]);
  const resolvedActiveCardId = activeCardId !== undefined ? activeCardId : internalActiveCardId;
  const resolvedBoardTitle = boardTitle ?? internalBoardTitle;
  const boardTitleEditable = boardTitle === undefined || Boolean(onBoardTitleChange);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    columnsRef.current = columns;
    onChangeRef.current = onChange;
    onAddCommentRef.current = onAddComment;
    onCommentsChangeRef.current = onCommentsChange;
    onActivityRef.current = onActivity;
    onActiveCardChangeRef.current = onActiveCardChange;
    onTagsChangeRef.current = onTagsChange;
    onCardTagsChangeRef.current = onCardTagsChange;
    onAttachmentRemoveRef.current = onAttachmentRemove;
    onAttachmentUploadRef.current = onAttachmentUpload;
    onCardAssigneesChangeRef.current = onCardAssigneesChange;
    onCardAttachmentsChangeRef.current = onCardAttachmentsChange;
    onCardCreateRef.current = onCardCreate;
    onCardUpdateRef.current = onCardUpdate;
    onCardMoveRef.current = onCardMove;
    onColumnChangeRef.current = onColumnChange;
    onColumnCreateRef.current = onColumnCreate;
    onColumnReorderRef.current = onColumnReorder;
    onTagCreateRef.current = onTagCreate;
    onTagDeleteRef.current = onTagDelete;
    onTagUpdateRef.current = onTagUpdate;
  }, [columns, onActiveCardChange, onActivity, onAddComment, onAttachmentRemove, onAttachmentUpload, onCardAssigneesChange, onCardAttachmentsChange, onCardCreate, onCardMove, onCardTagsChange, onCardUpdate, onColumnChange, onColumnCreate, onColumnReorder, onChange, onCommentsChange, onTagCreate, onTagDelete, onTagUpdate, onTagsChange]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    columnDragRef.current = columnDrag;
  }, [columnDrag]);

  const dragColumnId = columnDrag?.columnId;
  const dragColumnHeight = columnDrag?.height;
  const dragColumnIndex = columnDrag?.fromIndex;
  const dragColumnWidth = columnDrag?.width;
  const dragDropIndex = columnDrag?.dropIndex;
  const dragPhase = columnDrag?.phase;

  useLayoutEffect(() => {
    if (!dragColumnId || dragPhase !== "dragging" || dragDropIndex === null || dragDropIndex === undefined) {
      setColumnDropRect(null);
      return;
    }

    const board = rootRef.current;
    if (!board) return;

    const measure = () => {
      const remaining = Array.from(
        board.querySelectorAll<HTMLElement>("[data-kanban-column-id]"),
      ).filter((element) => element.dataset.kanbanColumnId !== dragColumnId);
      const gap = Number.parseFloat(getComputedStyle(board).columnGap || "10") || 10;
      const step = (dragColumnWidth ?? 280) + gap;

      if (!remaining.length) {
        const boardRect = board.getBoundingClientRect();
        setColumnDropRect({
          height: dragColumnHeight ?? 0,
          left: boardRect.left + 10,
          top: boardRect.top,
          width: dragColumnWidth ?? 280,
        });
        return;
      }

      if (dragDropIndex === dragColumnIndex) {
        const source = board.querySelector<HTMLElement>(
          `[data-kanban-column-id="${CSS.escape(dragColumnId)}"]`,
        );
        if (source) {
          const rect = getLayoutColumnRect(source);
          setColumnDropRect({
            height: dragColumnHeight ?? rect.height,
            left: rect.left,
            top: rect.top,
            width: dragColumnWidth ?? rect.width,
          });
          return;
        }
      }

      if (dragDropIndex > (dragColumnIndex ?? 0)) {
        if (dragDropIndex < remaining.length) {
          const rect = getLayoutColumnRect(remaining[dragDropIndex]);
          setColumnDropRect({
            height: dragColumnHeight ?? rect.height,
            left: rect.left - step,
            top: rect.top,
            width: dragColumnWidth ?? rect.width,
          });
          return;
        }

        const last = getLayoutColumnRect(remaining[remaining.length - 1]);
        setColumnDropRect({
          height: dragColumnHeight ?? last.height,
          left: last.right + gap - step,
          top: last.top,
          width: dragColumnWidth ?? last.width,
        });
        return;
      }

      const target = getLayoutColumnRect(remaining[dragDropIndex]);
      setColumnDropRect({
        height: dragColumnHeight ?? target.height,
        left: target.left,
        top: target.top,
        width: dragColumnWidth ?? target.width,
      });
    };

    measure();
    board.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      board.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [dragColumnHeight, dragColumnId, dragColumnIndex, dragColumnWidth, dragDropIndex, dragPhase]);

  useEffect(() => {
    if (resolvedActiveCardId === previousActiveCardRef.current) return;
    previousActiveCardRef.current = resolvedActiveCardId;
    const card = resolvedActiveCardId ? cardLookup[resolvedActiveCardId] : null;
    setTicketTitle(card?.title ?? "");
    setTicketDescription(card?.description ?? "");
    setTicketCustomColorOpen(false);
    setTicketColorMenu(null);
    setTicketTagPickerOpen(false);
    setTicketTagSearch("");
    setTicketMemberPickerOpen(false);
    setTicketMemberSearch("");
    setMoveTicketListId(null);
    setMoveTicketIndex(0);
  }, [cardLookup, resolvedActiveCardId]);

  useEffect(() => {
    if (resolvedActiveCardId && !cards[resolvedActiveCardId]) {
      if (activeCardId === undefined) {
        setInternalActiveCardId(null);
      }
      onActiveCardChangeRef.current?.(null, null);
    }
  }, [activeCardId, cards, localCards, resolvedActiveCardId]);

  useEffect(() => {
    const board = rootRef.current;
    if (!board) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;

      const maxScroll = board.scrollWidth - board.clientWidth;
      if (maxScroll <= 0) return;

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? board.clientWidth : 1;
      const horizontalDelta = event.deltaX * unit;
      const verticalDelta = event.deltaY * unit;

      // Only horizontal gestures move the board. Vertical wheel input must keep
      // scrolling the page or the list under the pointer.
      if (
        Math.abs(horizontalDelta) <= Math.abs(verticalDelta)
        || horizontalDelta === 0
      ) {
        return;
      }

      event.preventDefault();

      // Disable CSS snapping while the gesture is active; mandatory snapping
      // would otherwise pull the board back to its current column after every
      // incremental wheel delta. Restore it once the gesture settles.
      board.style.scrollSnapType = "none";
      if (wheelSnapTimerRef.current !== null) {
        window.clearTimeout(wheelSnapTimerRef.current);
      }
      wheelSnapTimerRef.current = window.setTimeout(() => {
        board.style.scrollSnapType = "";
        wheelSnapTimerRef.current = null;
      }, 180);

      board.scrollLeft = Math.min(
        maxScroll,
        Math.max(0, board.scrollLeft + horizontalDelta),
      );
    };

    board.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      board.removeEventListener("wheel", handleWheel);
      if (wheelSnapTimerRef.current !== null) {
        window.clearTimeout(wheelSnapTimerRef.current);
        wheelSnapTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!colorMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!colorMenuRef.current?.contains(event.target as Node)) {
        setColorMenu(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setColorMenu(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [colorMenu]);

  useEffect(() => {
    if (!tagManagerOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!tagManagerRef.current?.contains(target) && !colorPickerRef.current?.contains(target)) {
        setTagManagerOpen(false);
        setTagColorPicker(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTagManagerOpen(false);
        setTagColorPicker(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [tagManagerOpen]);

  useEffect(() => {
    if (!ticketColorMenu) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !ticketColorMenuRef.current?.contains(target)
        && !ticketColorPickerRef.current?.contains(target)
      ) {
        setTicketColorMenu(null);
        setTicketCustomColorOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTicketColorMenu(null);
        setTicketCustomColorOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ticketColorMenu]);

  useEffect(() => {
    const board = rootRef.current;
    if (!board) return;

    const update = () => {
      setScrollInfo({
        left: board.scrollLeft,
        max: Math.max(0, board.scrollWidth - board.clientWidth),
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(board);
    board.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      board.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [columns.length]);

  function emitActivity(activity: WithoutActivityTimestamp<KanbanActivity>) {
    onActivityRef.current?.({
      ...activity,
      at: new Date().toISOString(),
    } as KanbanActivity);
  }

  function moveCard(cardId: string, toColumnId: string, toIndex: number) {
    const change = onChangeRef.current;
    if (!change) return;

    const currentColumns = columnsRef.current;
    const fromColumn = currentColumns.find((column) => column.cardIds.includes(cardId));
    const fromIndex = fromColumn?.cardIds.indexOf(cardId) ?? -1;
    const without = currentColumns.map((column) => ({
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    }));
    let landedIndex = toIndex;

    const nextColumns = without.map((column) => {
      if (column.id !== toColumnId) return column;
      const cardIds = [...column.cardIds];
      const index = Math.max(0, Math.min(toIndex, cardIds.length));
      landedIndex = index;
      cardIds.splice(index, 0, cardId);
      return { ...column, cardIds };
    });

    change(nextColumns);
    const move = {
      cardId,
      fromColumnId: fromColumn?.id ?? toColumnId,
      fromIndex,
      toColumnId,
      toIndex: landedIndex,
    };
    onCardMoveRef.current?.(cardId, move, nextColumns);
    emitActivity({
      type: "card-moved",
      cardId,
      columns: nextColumns,
      fromColumnId: fromColumn?.id ?? toColumnId,
      fromIndex,
      toColumnId,
      toIndex: landedIndex,
    });
  }

  function commentsForCard(card: KanbanCard) {
    return localComments[card.id] ?? card.comments ?? [];
  }

  function openTicket(card: KanbanCard) {
    setActiveCard(card.id);
    setCommentDraft("");
    setCommentAttachments([]);
  }

  function activateCard(card: KanbanCard) {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (onCardClick) onCardClick(card);
    else if (ticketView) openTicket(card);
  }

  function addComment(event: { preventDefault: () => void }) {
    event.preventDefault();
    const card = resolvedActiveCardId ? cardLookup[resolvedActiveCardId] : null;
    const body = isRichTextEmpty(commentDraft) ? "" : commentDraft;
    const readyAttachments = commentAttachments.filter(
      (attachment) => attachment.status !== "uploading" && attachment.status !== "error",
    );
    if (!card || commentAttachments.length !== readyAttachments.length) return;
    if (!body && readyAttachments.length === 0) return;

    const comment: KanbanComment = {
      id: createId("comment"),
      attachments: readyAttachments.length ? readyAttachments : undefined,
      author: currentUser?.name ?? "You",
      body,
      createdAt: new Date().toISOString(),
    };
    const next = [...commentsForCard(card), comment];

    setLocalComments((current) => ({ ...current, [card.id]: next }));
    setCommentDraft("");
    setCommentAttachments([]);
    onAddCommentRef.current?.(card.id, comment);
    onCommentsChangeRef.current?.(card.id, next);
    emitActivity({ type: "comment-added", cardId: card.id, comment, comments: next });
  }

  function addColumn(event: { preventDefault: () => void }) {
    event.preventDefault();
    const title = newColumnTitle.trim();
    const change = onChangeRef.current;
    if (!title || !change) return;

    const column: KanbanColumn = {
      id: createId("column"),
      title,
      cardIds: [],
    };
    const nextColumns = [...columnsRef.current, column];
    change(nextColumns);
    onColumnCreateRef.current?.(column, nextColumns);
    emitActivity({ type: "list-created", column, columns: nextColumns });
    setNewColumnTitle("");
    window.requestAnimationFrame(() => {
      const board = rootRef.current;
      board?.scrollTo({ left: board.scrollWidth, behavior: "smooth" });
      columnInputRef.current?.focus();
    });
  }

  function createCard(event: { preventDefault: () => void }, columnId: string) {
    event.preventDefault();
    const title = cardDraft.trim();
    if (!title) return;

    const card: KanbanCard = {
      id: createId("card"),
      title,
      tone: "default",
    };
    const nextCards = { ...cardLookup, [card.id]: card };
    const nextColumns = columnsRef.current.map((column) =>
      column.id === columnId
        ? { ...column, cardIds: [...column.cardIds, card.id] }
        : column,
    );

    setLocalCards((current) => ({ ...current, [card.id]: card }));
    onChangeRef.current?.(nextColumns);
    onCardCreateRef.current?.(card, columnId, nextColumns, nextCards);
    emitActivity({ type: "card-created", card, columnId, columns: nextColumns });
    setCardDraft("");
    window.requestAnimationFrame(() => cardComposerRef.current?.focus());
  }

  function updateCard(cardId: string, patch: Partial<KanbanCard>) {
    const previousCard = cardLookup[cardId];
    if (!previousCard) return;
    const card = { ...previousCard, ...patch };
    setLocalCards((current) => ({ ...current, [cardId]: card }));
    onCardUpdateRef.current?.(cardId, patch, card);
    emitActivity({
      type: "card-updated",
      card,
      cardId,
      changes: Object.keys(patch),
      previousCard,
    });
  }

  function updateColumn(columnId: string, patch: Partial<KanbanColumn>) {
    const previousColumn = columnsRef.current.find((column) => column.id === columnId);
    if (!previousColumn) return;

    const nextColumns = columnsRef.current.map((column) =>
      column.id === columnId ? { ...column, ...patch } : column,
    );
    const column = nextColumns.find((entry) => entry.id === columnId);
    if (!column) return;

    onChangeRef.current?.(nextColumns);
    onColumnChangeRef.current?.(column, previousColumn, nextColumns);
    emitActivity({
      type: "list-updated",
      changes: Object.keys(patch),
      column,
      columns: nextColumns,
      previousColumn,
    });
  }

  function beginEditingBoardTitle() {
    if (!boardTitleEditable) return;
    setBoardTitleDraft(resolvedBoardTitle);
    setEditingBoardTitle(true);
  }

  function finishEditingBoardTitle(save: boolean) {
    if (save) {
      const title = boardTitleDraft.trim();
      if (title && title !== resolvedBoardTitle) {
        if (boardTitle === undefined) setInternalBoardTitle(title);
        onBoardTitleChange?.(title);
      }
    }
    setEditingBoardTitle(false);
    setBoardTitleDraft("");
  }

  function beginEditingColumn(column: KanbanColumn) {
    if (!onChange) return;
    setEditingColumnId(column.id);
    setEditingColumnTitle(column.title);
  }

  function finishEditingColumn(save: boolean) {
    const columnId = editingColumnId;
    if (!columnId) return;
    const title = editingColumnTitle.trim();
    if (save && title) updateColumn(columnId, { title });
    setEditingColumnId(null);
    setEditingColumnTitle("");
  }

  function moveColumn(columnId: string, toIndex: number) {
    const change = onChangeRef.current;
    if (!change) return;
    const current = columnsRef.current;
    const fromIndex = current.findIndex((column) => column.id === columnId);
    const nextIndex = Math.max(0, Math.min(toIndex, current.length - 1));
    if (fromIndex < 0 || fromIndex === nextIndex) return;

    const next = [...current];
    const [column] = next.splice(fromIndex, 1);
    next.splice(nextIndex, 0, column);
    change(next);
    onColumnReorderRef.current?.(next, { columnId, fromIndex, toIndex: nextIndex });
    emitActivity({
      type: "list-reordered",
      columnId,
      columns: next,
      fromIndex,
      toIndex: nextIndex,
    });
  }

  function handleColumnKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, columnId: string) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = columnsRef.current.findIndex((column) => column.id === columnId);
    if (index < 0) return;
    moveColumn(columnId, index + (event.key === "ArrowRight" ? 1 : -1));
  }

  function applyTags(nextTags: KanbanTag[]) {
    if (tags === undefined) {
      setInternalTags(nextTags);
    }
    onTagsChangeRef.current?.(nextTags);
  }

  function beginEditingTag(tag: KanbanTag) {
    setEditingTagId(tag.id);
    setEditingTagLabel(tag.label);
    setExpandedTagId(tag.id);
  }

  function finishEditingTag(save: boolean) {
    const tag = resolvedTags.find((entry) => entry.id === editingTagId);
    if (!tag) return;
    const label = editingTagLabel.trim();
    if (save && label && label !== tag.label) {
      updateTag(tag.id, { label });
    }
    setEditingTagId(null);
    setEditingTagLabel("");
  }

  function updateTag(tagId: string, patch: Partial<KanbanTag>) {
    const previousTag = resolvedTags.find((tag) => tag.id === tagId);
    if (!previousTag) return;
    const tag = { ...previousTag, ...patch };
    const nextTags = resolvedTags.map((entry) => (entry.id === tagId ? tag : entry));
    applyTags(nextTags);
    onTagUpdateRef.current?.(tag, previousTag, nextTags);
    emitActivity({ type: "tag-updated", tag, previousTag, tags: nextTags });
  }

  function deleteTag(tagId: string) {
    const tag = resolvedTags.find((entry) => entry.id === tagId);
    if (!tag) return;
    const nextTags = resolvedTags.filter((entry) => entry.id !== tagId);
    applyTags(nextTags);
    setTagColorPicker(null);
    setLocalCardTags((current) =>
      Object.fromEntries(
        Object.entries(current).map(([cardId, tagIds]) => [
          cardId,
          tagIds.filter((id) => id !== tagId),
        ]),
      ),
    );
    onTagDeleteRef.current?.(tag, nextTags);
    emitActivity({ type: "tag-deleted", tag, tags: nextTags });
  }

  function createTag(event: { preventDefault: () => void }) {
    event.preventDefault();
    const label = newTagLabel.trim();
    if (!label) return null;

    const tag: KanbanTag = {
      id: createId("tag"),
      label,
      color: newTagColor,
    };
    const nextTags = [...resolvedTags, tag];
    applyTags(nextTags);
    setNewTagLabel("");
    onTagCreateRef.current?.(tag, nextTags);
    emitActivity({ type: "tag-created", tag, tags: nextTags });
    return tag;
  }

  function tagsForCard(card: KanbanCard) {
    return localCardTags[card.id] ?? card.tagIds ?? [];
  }

  function attachmentsForCard(card: KanbanCard) {
    return localAttachments[card.id] ?? card.attachments ?? [];
  }

  function currentAttachmentsForCard(card: KanbanCard) {
    return localAttachmentsRef.current[card.id] ?? card.attachments ?? [];
  }

  function setCardAttachments(cardId: string, attachments: KanbanAttachment[]) {
    const next = { ...localAttachmentsRef.current, [cardId]: attachments };
    localAttachmentsRef.current = next;
    setLocalAttachments(next);
  }

  function createAttachments(files: FileList | File[], uploading = false) {
    return Array.from(files).map((file) => ({
      id: createId("attachment"),
      mimeType: file.type || undefined,
      name: file.name,
      size: file.size,
      status: uploading ? ("uploading" as const) : undefined,
      url: typeof URL !== "undefined" && "createObjectURL" in URL
        ? URL.createObjectURL(file)
        : "",
      uploadedAt: new Date().toISOString(),
    }));
  }

  function finalizeAttachment(
    uploaded: KanbanAttachment,
    local: KanbanAttachment,
  ): KanbanAttachment {
    return {
      ...local,
      ...uploaded,
      error: undefined,
      id: uploaded.id || local.id,
      name: uploaded.name || local.name,
      status: undefined,
      url: uploaded.url || local.url,
    };
  }

  function persistCardAttachments(
    card: KanbanCard,
    attachments: KanbanAttachment[],
  ) {
    onCardAttachmentsChangeRef.current?.(card.id, attachments, card);
    emitActivity({ type: "card-attachments-changed", attachments, card, cardId: card.id });
  }

  async function uploadInlineAttachment(
    file: File,
    card: KanbanCard,
    target: "comment" | "description",
  ) {
    const upload = onAttachmentUploadRef.current;
    if (upload) {
      const uploaded = await upload(file, { card, cardId: card.id, target });
      return {
        mimeType: uploaded.mimeType,
        name: uploaded.name,
        url: uploaded.url,
      };
    }

    return {
      mimeType: file.type || undefined,
      name: file.name,
      url:
        typeof URL !== "undefined" && "createObjectURL" in URL
          ? URL.createObjectURL(file)
          : "",
    };
  }

  async function uploadCardAttachment(
    card: KanbanCard,
    local: KanbanAttachment,
    file: File,
  ) {
    const upload = onAttachmentUploadRef.current;
    if (!upload) return;

    try {
      const uploaded = await upload(file, { card, cardId: card.id, target: "card" });
      const current = currentAttachmentsForCard(card);
      if (!current.some((attachment) => attachment.id === local.id)) return;
      const next = current.map((attachment) =>
        attachment.id === local.id ? finalizeAttachment(uploaded, local) : attachment,
      );
      setCardAttachments(card.id, next);
      persistCardAttachments(card, next);
    } catch (error) {
      const current = currentAttachmentsForCard(card);
      if (!current.some((attachment) => attachment.id === local.id)) return;
      const next = current.map((attachment) =>
        attachment.id === local.id
          ? {
              ...attachment,
              error: error instanceof Error ? error.message : "Upload failed",
              status: "error" as const,
            }
          : attachment,
      );
      setCardAttachments(card.id, next);
    }
  }

  function addAttachments(files: FileList | File[], card: KanbanCard) {
    const list = Array.from(files);
    if (!list.length) return;

    const upload = onAttachmentUploadRef.current;
    const attachments = createAttachments(list, Boolean(upload));
    const next = [...currentAttachmentsForCard(card), ...attachments];
    setCardAttachments(card.id, next);

    if (!upload) {
      persistCardAttachments(card, next);
      return;
    }

    attachments.forEach((attachment, index) => {
      void uploadCardAttachment(card, attachment, list[index]);
    });
  }

  function removeAttachment(card: KanbanCard, attachmentId: string) {
    const current = currentAttachmentsForCard(card);
    const attachment = current.find((entry) => entry.id === attachmentId);
    if (!attachment) return;
    const next = current.filter((entry) => entry.id !== attachmentId);
    setCardAttachments(card.id, next);
    void onAttachmentRemoveRef.current?.(attachment, {
      card,
      cardId: card.id,
      target: "card",
    });
    persistCardAttachments(card, next);
  }

  async function uploadCommentAttachment(
    card: KanbanCard,
    local: KanbanAttachment,
    file: File,
  ) {
    const upload = onAttachmentUploadRef.current;
    if (!upload) return;

    try {
      const uploaded = await upload(file, { card, cardId: card.id, target: "comment" });
      setCommentAttachments((current) =>
        current.map((attachment) =>
          attachment.id === local.id ? finalizeAttachment(uploaded, local) : attachment,
        ),
      );
    } catch (error) {
      setCommentAttachments((current) =>
        current.map((attachment) =>
          attachment.id === local.id
            ? {
                ...attachment,
                error: error instanceof Error ? error.message : "Upload failed",
                status: "error" as const,
              }
            : attachment,
        ),
      );
    }
  }

  function addCommentAttachments(files: FileList | File[], card: KanbanCard) {
    const list = Array.from(files);
    if (!list.length) return;

    const upload = onAttachmentUploadRef.current;
    const attachments = createAttachments(list, Boolean(upload));
    setCommentAttachments((current) => [...current, ...attachments]);

    if (!upload) return;
    attachments.forEach((attachment, index) => {
      void uploadCommentAttachment(card, attachment, list[index]);
    });
  }

  function removeCommentAttachment(card: KanbanCard, attachmentId: string) {
    const attachment = commentAttachments.find((entry) => entry.id === attachmentId);
    if (!attachment) return;
    setCommentAttachments((current) =>
      current.filter((entry) => entry.id !== attachmentId),
    );
    if (attachment.status !== "uploading") {
      void onAttachmentRemoveRef.current?.(attachment, {
        card,
        cardId: card.id,
        target: "comment",
      });
    }
  }

  function membersForCard(card: KanbanCard) {
    return localCardAssignees[card.id] ?? card.assigneeIds ?? [];
  }

  function toggleCardMember(card: KanbanCard, memberId: string) {
    const current = membersForCard(card);
    const memberIds = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    setLocalCardAssignees((membersByCard) => ({ ...membersByCard, [card.id]: memberIds }));
    onCardAssigneesChangeRef.current?.(card.id, memberIds, card);
    emitActivity({ type: "card-assignees-changed", card, cardId: card.id, memberIds });
  }

  function toggleCardTag(card: KanbanCard, tagId: string) {
    const current = tagsForCard(card);
    const tagIds = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setLocalCardTags((tagsByCard) => ({ ...tagsByCard, [card.id]: tagIds }));
    onCardTagsChangeRef.current?.(card.id, tagIds, card);
    emitActivity({ type: "card-tags-changed", card, cardId: card.id, tagIds });
  }

  function finishDragSession() {
    dragRef.current = null;
    setDrag(null);
    window.setTimeout(() => {
      didDragRef.current = false;
    }, 80);
  }

  function handleCardPointerDown(
    event: ReactPointerEvent<HTMLElement>,
    cardId: string,
    fromColumnId: string,
  ) {
    if (!onChange || event.button !== 0) return;
    if (dragRef.current || columnDragRef.current) return;

    window.getSelection()?.removeAllRanges();
    const source = event.currentTarget;
    const startX = event.clientX;
    const startY = event.clientY;
    let active: DragState | null = null;

    function onPointerMove(moveEvent: PointerEvent) {
      if (active?.phase === "dropping") return;

      if (!active) {
        const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
        if (distance < DRAG_THRESHOLD_PX) return;

        const rect = source.getBoundingClientRect();
        const tokens = readThemeTokens(source);
        const sourceColumn = columnsRef.current.find((column) => column.id === fromColumnId);
        const homeIndex = sourceColumn?.cardIds.indexOf(cardId) ?? 0;
        const home = { columnId: fromColumnId, index: homeIndex };
        didDragRef.current = true;
        active = {
          cardId,
          committed: false,
          dropTarget: resolveDropTarget(moveEvent.clientX, moveEvent.clientY, cardId, home),
          fromColumnId,
          height: rect.height,
          homeIndex,
          offsetX: startX - rect.left,
          offsetY: startY - rect.top,
          originLeft: rect.left,
          originTop: rect.top,
          panel: tokens.panel,
          phase: "dragging",
          text: tokens.text,
          muted: tokens.muted,
          accent: tokens.accent,
          tilt: Math.random() * 6 - 3,
          width: rect.width,
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        };
        dragRef.current = active;
        setDrag(active);
        return;
      }

      const home = { columnId: active.fromColumnId, index: active.homeIndex };
      const dropTarget = resolveDropTarget(
        moveEvent.clientX,
        moveEvent.clientY,
        active.cardId,
        home,
      );
      active = {
        ...active,
        dropTarget: sameDropTarget(active.dropTarget, dropTarget) ? active.dropTarget : dropTarget,
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };
      dragRef.current = active;
      setDrag(active);
    }

    function onPointerUp(upEvent: PointerEvent) {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      const current = dragRef.current;
      if (!current || current.phase === "dropping") {
        finishDragSession();
        return;
      }

      const home = { columnId: current.fromColumnId, index: current.homeIndex };
      const dropTarget =
        resolveDropTarget(upEvent.clientX, upEvent.clientY, current.cardId, home) ??
        current.dropTarget ?? {
          columnId: current.fromColumnId,
          index:
            columnsRef.current.find((column) => column.id === current.fromColumnId)?.cardIds.length ??
            0,
        };

      const unchanged =
        dropTarget.columnId === current.fromColumnId && dropTarget.index === current.homeIndex;
      const shiftBy = current.height + 8;
      const landing = unchanged
        ? { left: current.originLeft, top: current.originTop, width: current.width }
        : resolveDropLanding(dropTarget, current.cardId, shiftBy, {
            left: current.originLeft,
            top: current.originTop,
            width: current.width,
          });

      // Commit into the open gap first so neighbours keep their final layout —
      // only the preview animates into place.
      if (!unchanged) {
        moveCard(current.cardId, dropTarget.columnId, dropTarget.index);
      }

      const dropping: DragState = {
        ...current,
        committed: !unchanged,
        dropTarget,
        phase: "dropping",
      };
      active = dropping;
      dragRef.current = dropping;
      setDrag(dropping);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          const animated: DragState = {
            ...dropping,
            tilt: 0,
            width: landing.width || current.width,
            x: landing.left + current.offsetX,
            y: landing.top + current.offsetY,
          };
          active = animated;
          dragRef.current = animated;
          setDrag(animated);
        });
      });

      window.setTimeout(() => {
        finishDragSession();
      }, DROP_ANIMATION_MS);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  function handleColumnPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    columnId: string,
  ) {
    if (!onChange || event.button !== 0) return;
    if (dragRef.current || columnDragRef.current) return;

    window.getSelection()?.removeAllRanges();
    const handle = event.currentTarget;
    const sourceColumn = handle.closest("[data-kanban-column-id]") as HTMLElement | null;
    if (!sourceColumn) return;
    const columnElement = sourceColumn;

    const startX = event.clientX;
    const startY = event.clientY;
    let active: ColumnDragState | null = null;

    function onPointerMove(moveEvent: PointerEvent) {
      if (active?.phase === "dropping") return;

      if (!active) {
        if (Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < DRAG_THRESHOLD_PX) {
          return;
        }

        const rect = columnElement.getBoundingClientRect();
        const header = columnElement.querySelector<HTMLElement>("[data-kanban-column-header]");
        const headerRect = header?.getBoundingClientRect() ?? rect;
        const tokens = readThemeTokens(columnElement);
        const fromIndex = columnsRef.current.findIndex((column) => column.id === columnId);
        const column = columnsRef.current[fromIndex];
        const root = rootRef.current;
        const gap = root
          ? Number.parseFloat(getComputedStyle(root).columnGap || getComputedStyle(root).gap || "10") || 10
          : 10;

        active = {
          accent: column?.accent ?? tokens.accent,
          columnId,
          dropIndex: fromIndex,
          fromIndex,
          headerHeight: headerRect.height,
          height: rect.height,
          muted: tokens.muted,
          offsetX: startX - rect.left,
          offsetY: startY - rect.top,
          originLeft: rect.left,
          originTop: rect.top,
          panel: tokens.panel,
          phase: "dragging",
          step: rect.width + gap,
          text: tokens.text,
          title: column?.title ?? "",
          width: rect.width,
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        };
        columnDragRef.current = active;
        setColumnDrag(active);
        return;
      }

      const root = rootRef.current;
      if (root) {
        const bounds = root.getBoundingClientRect();
        if (moveEvent.clientX < bounds.left + 48) {
          root.scrollLeft = Math.max(0, root.scrollLeft - 14);
        } else if (moveEvent.clientX > bounds.right - 48) {
          root.scrollLeft = Math.min(root.scrollWidth - root.clientWidth, root.scrollLeft + 14);
        }
      }

      const dropIndex = resolveColumnDropIndex(moveEvent.clientX, columnId);
      active = {
        ...active,
        dropIndex,
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };
      columnDragRef.current = active;
      setColumnDrag(active);
    }

    function onPointerUp(upEvent: PointerEvent) {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      const current = columnDragRef.current;
      if (!current || current.phase === "dropping") {
        columnDragRef.current = null;
        setColumnDrag(null);
        return;
      }

      const dropIndex = resolveColumnDropIndex(upEvent.clientX, columnId);

      if (dropIndex !== current.fromIndex) {
        moveColumn(columnId, dropIndex);
      }

      const dropping: ColumnDragState = {
        ...current,
        dropIndex,
        phase: "dropping",
        x: upEvent.clientX,
        y: upEvent.clientY,
      };
      columnDragRef.current = dropping;
      setColumnDrag(dropping);

      window.setTimeout(() => {
        columnDragRef.current = null;
        setColumnDrag(null);
      }, DROP_ANIMATION_MS);
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  const draggingCard = drag ? cardLookup[drag.cardId] : null;
  const themeStyle = drag
    ? ({
        "--card-accent": drag.accent,
        "--dashboard-section-panel": drag.panel,
        "--dashboard-section-text": drag.text,
        "--dashboard-section-muted": drag.muted,
      } as CSSProperties)
    : undefined;

  const draggingTags = draggingCard
    ? tagsForCard(draggingCard)
        .map((tagId) => resolvedTags.find((tag) => tag.id === tagId))
        .filter((tag): tag is KanbanTag => Boolean(tag))
    : [];

  const preview =
    drag && draggingCard && portalReady
      ? createPortal(
          <div
            aria-hidden="true"
            className={styles.dragPreviewShell}
            data-dropping={drag.phase === "dropping" ? "true" : undefined}
            style={
              {
                ...themeStyle,
                left: drag.x - drag.offsetX,
                top: drag.y - drag.offsetY,
                width: drag.width,
              } as CSSProperties
            }
          >
            <article
              className={`${styles.card} ${styles.dragPreview}`}
              data-tone={draggingCard.tone ?? "default"}
              data-dropping={drag.phase === "dropping" ? "true" : undefined}
              style={
                {
                  width: drag.width,
                  height: drag.height,
                  backgroundColor: drag.panel,
                  color: drag.text,
                  opacity: 1,
                  transform: `rotate(${drag.tilt}deg)`,
                  ["--card-accent" as string]: drag.accent,
                } as CSSProperties
              }
            >
              <CardContent card={draggingCard} />
              {draggingTags.length ? (
                <div className={styles.cardTagRow}>
                  {draggingTags.slice(0, 4).map((tag) => (
                    <span
                      className={styles.cardTag}
                      key={tag.id}
                      style={{ ["--kanban-tag-color" as string]: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          </div>,
          document.body,
        )
      : null;

  const selectedCard = resolvedActiveCardId ? cardLookup[resolvedActiveCardId] : null;
  const selectedCardColumn = selectedCard
    ? columns.find((column) => column.cardIds.includes(selectedCard.id)) ?? null
    : null;
  const selectedTicketTagIds = selectedCard ? tagsForCard(selectedCard) : [];
  const selectedTicketTags = resolvedTags.filter((tag) => selectedTicketTagIds.includes(tag.id));
  const selectedTicketMemberIds = selectedCard ? membersForCard(selectedCard) : [];
  const selectedTicketMembers = resolvedMembers.filter((member) =>
    selectedTicketMemberIds.includes(member.id),
  );

  function setActiveCard(cardId: string | null) {
    if (activeCardId === undefined) {
      setInternalActiveCardId(cardId);
    }
    onActiveCardChangeRef.current?.(cardId, cardId ? cardLookup[cardId] ?? null : null);
  }
  const colorMenuColumn = colorMenu
    ? columns.find((column) => column.id === colorMenu.columnId) ?? null
    : null;

  function openTagColorPicker(event: React.MouseEvent<HTMLButtonElement>, targetId: string) {
    if (tagColorPicker?.targetId === targetId) {
      setTagColorPicker(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const panelRect = tagManagerRef.current?.getBoundingClientRect();
    const width = 260;
    let left = (panelRect?.right ?? rect.right) + 8;

    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, (panelRect?.left ?? rect.left) - width - 8);
    }

    setTagColorPicker({
      left,
      targetId,
      top: Math.max(8, Math.min(rect.top, window.innerHeight - 328)),
    });
  }

  function scrollBoard(direction: -1 | 1) {
    const board = rootRef.current;
    if (!board) return;
    const step = Math.max(240, board.clientWidth * 0.75);
    board.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  const columnShiftFor = (columnId: string) => {
    if (!columnDrag || columnDrag.phase !== "dragging" || columnDrag.dropIndex === null) {
      return 0;
    }
    if (columnId === columnDrag.columnId) {
      return 0;
    }

    const home = columnDrag.fromIndex;
    const drop = columnDrag.dropIndex;
    const remaining = columns.filter((column) => column.id !== columnDrag.columnId);
    const index = remaining.findIndex((column) => column.id === columnId);

    if (index < 0) return 0;
    if (home < drop && index >= home && index < drop) return -columnDrag.step;
    if (drop < home && index >= drop && index < home) return columnDrag.step;
    return 0;
  };

  const columnPreview =
    columnDrag && portalReady
      ? createPortal(
          <div
            aria-hidden="true"
            className={styles.columnDragShell}
            data-dropping={columnDrag.phase === "dropping" ? "true" : undefined}
            style={
              {
                left: columnDrag.x - columnDrag.offsetX,
                top: columnDrag.y - columnDrag.offsetY,
                width: columnDrag.width,
              } as CSSProperties
            }
          >
            <div
              className={styles.columnDragPreview}
              style={
                {
                  "--kanban-header-accent": columnDrag.accent,
                } as CSSProperties
              }
            >
              <FontAwesomeIcon className={styles.columnDragGrip} icon={faGripVertical} />
              <span>{columnDrag.title}</span>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={styles.shell}>
      <div className={styles.boardHeader}>
        {editingBoardTitle ? (
          <input
            aria-label="Board name"
            autoFocus
            className={styles.boardTitleInput}
            onBlur={() => {
              if (skipBoardTitleCommitRef.current) {
                skipBoardTitleCommitRef.current = false;
                return;
              }
              finishEditingBoardTitle(true);
            }}
            onChange={(event) => setBoardTitleDraft(event.target.value)}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                finishEditingBoardTitle(true);
              }
              if (event.key === "Escape") {
                event.preventDefault();
                skipBoardTitleCommitRef.current = true;
                finishEditingBoardTitle(false);
                event.currentTarget.blur();
              }
            }}
            value={boardTitleDraft}
          />
        ) : (
          <h2 className={styles.boardTitle}>
            {boardTitleEditable ? (
              <button
                className={styles.boardTitleButton}
                onClick={beginEditingBoardTitle}
                title="Rename board"
                type="button"
              >
                <span>{resolvedBoardTitle}</span>
                <FontAwesomeIcon aria-hidden="true" className={styles.boardTitleIcon} icon={faPen} />
              </button>
            ) : (
              <span className={styles.boardTitleText}>{resolvedBoardTitle}</span>
            )}
          </h2>
        )}
        <div className={styles.boardToolbar}>
          {tagManager ? (
            <div className={styles.tagManagerWrap} ref={tagManagerRef}>
              <button
                aria-expanded={tagManagerOpen}
                aria-haspopup="dialog"
                className={styles.tagsButton}
                onClick={() => {
                  setTagManagerOpen((current) => {
                    if (current) setTagColorPicker(null);
                    return !current;
                  });
                }}
                type="button"
              >
                <FontAwesomeIcon icon={faTags} />
                <span>Tags</span>
                <span className={styles.tagCount}>{resolvedTags.length}</span>
              </button>
              {tagManagerOpen ? (
                <div aria-label="Tag manager" className={styles.tagManager} role="dialog">
                  <div className={styles.tagManagerHeader}>
                    <span>Tag manager</span>
                    <button
                      aria-label="Close tag manager"
                      className={styles.tagManagerClose}
                      onClick={() => {
                        setTagManagerOpen(false);
                        setTagColorPicker(null);
                      }}
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                  {resolvedTags.length ? (
                    <ul className={styles.tagList}>
                      {resolvedTags.map((tag) => (
                        <li className={styles.tagRow} key={tag.id}>
                          <button
                            aria-expanded={expandedTagId === tag.id}
                            aria-label={`Colour for ${tag.label}`}
                            className={styles.tagColorDot}
                            onClick={() => {
                              setTagColorPicker(null);
                              setExpandedTagId((current) => (current === tag.id ? null : tag.id));
                            }}
                            style={{ background: tag.color }}
                            type="button"
                          />
                          {editingTagId === tag.id ? (
                            <input
                              aria-label={`Tag name for ${tag.label}`}
                              autoFocus
                              className={styles.tagNameInput}
                              onBlur={() => {
                                if (skipTagCommitRef.current) {
                                  skipTagCommitRef.current = false;
                                  return;
                                }
                                finishEditingTag(true);
                              }}
                              onChange={(event) => setEditingTagLabel(event.target.value)}
                              onFocus={(event) => event.currentTarget.select()}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  finishEditingTag(true);
                                }
                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  skipTagCommitRef.current = true;
                                  finishEditingTag(false);
                                  event.currentTarget.blur();
                                }
                              }}
                              value={editingTagLabel}
                            />
                          ) : (
                            <button
                              className={styles.tagName}
                              onClick={() => beginEditingTag(tag)}
                              type="button"
                            >
                              {tag.label}
                            </button>
                          )}
                          <button
                            aria-label={`Delete ${tag.label}`}
                            className={styles.tagDelete}
                            onClick={() => deleteTag(tag.id)}
                            type="button"
                          >
                            ×
                          </button>
                          {expandedTagId === tag.id ? (
                            <div className={styles.tagPalette}>
                              {columnColors.map((color) => (
                                <button
                                  aria-label={`Use ${color} for ${tag.label}`}
                                  aria-pressed={tag.color === color}
                                  className={styles.tagSwatch}
                                  key={color}
                                  onClick={() => updateTag(tag.id, { color })}
                                  style={{ background: color }}
                                  type="button"
                                />
                              ))}
                              <button
                                aria-expanded={tagColorPicker?.targetId === tag.id}
                                className={styles.tagCustomButton}
                                onClick={(event) => openTagColorPicker(event, tag.id)}
                                type="button"
                              >
                                Custom…
                              </button>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.tagEmpty}>No tags yet. Add one below.</p>
                  )}
                  <form className={styles.tagForm} onSubmit={createTag}>
                    <label className={styles.tagFormLabel} htmlFor={tagFieldId}>
                      New tag
                    </label>
                    <div className={styles.tagFormRow}>
                      <input
                        className={styles.tagNameInput}
                        id={tagFieldId}
                        onChange={(event) => setNewTagLabel(event.target.value)}
                        placeholder="e.g. Customer"
                        value={newTagLabel}
                      />
                      <Button disabled={!newTagLabel.trim()} size="sm" type="submit">
                        Add tag
                      </Button>
                    </div>
                    <div className={styles.tagPalette}>
                      {columnColors.map((color) => (
                        <button
                          aria-label={`New tag colour ${color}`}
                          aria-pressed={newTagColor === color}
                          className={styles.tagSwatch}
                          key={color}
                          onClick={() => setNewTagColor(color)}
                          style={{ background: color }}
                          type="button"
                        />
                      ))}
                      <button
                        aria-expanded={tagColorPicker?.targetId === "new"}
                        className={styles.tagCustomButton}
                        onClick={(event) => openTagColorPicker(event, "new")}
                        type="button"
                      >
                        Custom…
                      </button>
                    </div>
                  </form>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className={styles.scrollControls}>
            <button
              aria-label="Scroll board left"
              className={styles.scrollButton}
              disabled={scrollInfo.left <= 1}
              onClick={() => scrollBoard(-1)}
              type="button"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              aria-label="Scroll board right"
              className={styles.scrollButton}
              disabled={scrollInfo.left >= scrollInfo.max - 1}
              onClick={() => scrollBoard(1)}
              type="button"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>
      <div
        className={styles.root}
        aria-label={resolvedBoardTitle}
        data-column-dragging={columnDrag ? "true" : undefined}
        data-column-dropping={columnDrag?.phase === "dropping" ? "true" : undefined}
        data-dragging={drag ? "true" : undefined}
        data-dropping={drag?.phase === "dropping" ? "true" : undefined}
        onDragStart={(event) => event.preventDefault()}
        ref={rootRef}
        style={
          columnWidth
            ? ({
                ["--kanban-column-width" as string]:
                  typeof columnWidth === "number" ? `${columnWidth}px` : columnWidth,
              } as CSSProperties)
            : undefined
        }
      >
      {columns.map((column) => {
        const atHome =
          Boolean(drag) &&
          drag!.phase === "dragging" &&
          drag!.dropTarget != null &&
          drag!.dropTarget.columnId === drag!.fromColumnId &&
          drag!.dropTarget.index === drag!.homeIndex;
        const dropIndex =
          drag && drag.phase === "dragging" && drag.dropTarget?.columnId === column.id
            ? drag.dropTarget.index
            : null;
        // While the pointer is still on the origin slot, keep that space so the
        // next card does not collapse up and block gap detection.
        const visibleIds = column.cardIds.filter((id) => {
          if (!drag || id !== drag.cardId) return true;
          if (drag.committed) return true;
          return atHome && drag.fromColumnId === column.id;
        });
        const shiftBy = drag?.phase === "dragging" && !atHome ? drag.height + 8 : 0;
        const showEndGhost =
          dropIndex !== null && !atHome && dropIndex === visibleIds.length && shiftBy > 0;

        return (
          <section
            className={styles.column}
            data-column-dragging={columnDrag?.columnId === column.id ? "true" : undefined}
            data-drop-active={
              drag?.phase === "dragging" || columnDrag?.phase === "dragging" ? "true" : undefined
            }
            data-kanban-column="true"
            data-kanban-column-id={column.id}
            key={column.id}
            style={
              {
                ...(column.accent ? { ["--kanban-header-accent" as string]: column.accent } : {}),
                transform: columnShiftFor(column.id)
                  ? `translateX(${columnShiftFor(column.id)}px)`
                  : undefined,
              } as CSSProperties
            }
          >
            <header className={styles.columnHeader} data-kanban-column-header="true">
              <button
                aria-label={`Reorder ${column.title}. Use the left and right arrow keys to move this list.`}
                className={styles.columnDragHandle}
                draggable={false}
                onDragStart={(event) => event.preventDefault()}
                onKeyDown={(event) => handleColumnKeyDown(event, column.id)}
                onPointerDown={(event) => handleColumnPointerDown(event, column.id)}
                type="button"
              >
                <FontAwesomeIcon icon={faGripVertical} />
              </button>
              <h3 className={styles.columnTitle}>
                {editingColumnId === column.id ? (
                  <input
                    aria-label={`List name for ${column.title}`}
                    autoFocus
                    className={styles.columnTitleInput}
                    onBlur={() => {
                      if (skipTitleCommitRef.current) {
                        skipTitleCommitRef.current = false;
                        return;
                      }
                      finishEditingColumn(true);
                    }}
                    onChange={(event) => setEditingColumnTitle(event.target.value)}
                    onFocus={(event) => event.currentTarget.select()}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        finishEditingColumn(true);
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        skipTitleCommitRef.current = true;
                        finishEditingColumn(false);
                        event.currentTarget.blur();
                      }
                    }}
                    value={editingColumnTitle}
                  />
                ) : onChange ? (
                  <button
                    className={styles.columnTitleButton}
                    onClick={() => beginEditingColumn(column)}
                    title="Rename list"
                    type="button"
                  >
                    {column.title}
                  </button>
                ) : (
                  column.title
                )}
              </h3>
              {onChange ? (
                <button
                  aria-expanded={colorMenu?.columnId === column.id}
                  aria-haspopup="dialog"
                  aria-label={`Change colour for ${column.title}`}
                  className={styles.columnColorButton}
                  onClick={(event) => {
                    if (colorMenu?.columnId === column.id) {
                      setColorMenu(null);
                      return;
                    }
                    const rect = event.currentTarget.getBoundingClientRect();
                    const width = 292;
                    setCustomColorOpen(false);
                    setColorMenu({
                      columnId: column.id,
                      left: Math.min(
                        Math.max(8, rect.right - width),
                        window.innerWidth - width - 8,
                      ),
                      top: Math.min(rect.bottom + 6, window.innerHeight - 220),
                    });
                  }}
                  type="button"
                >
                  <FontAwesomeIcon icon={faPalette} />
                </button>
              ) : null}
              <span className={styles.count}>{column.cardIds.length}</span>
            </header>
            <div className={styles.cardsViewport} data-kanban-cards-viewport="">
                <ul className={styles.cards} data-kanban-cards="true">
                  {drag?.phase === "dragging" && !atHome && dropIndex === 0 ? (
                    <li
                      aria-hidden="true"
                      className={styles.dropGhostTopItem}
                      style={{ height: drag.height }}
                    >
                      <div
                        className={styles.dropGhost}
                        style={{ ["--card-accent" as string]: drag.accent } as CSSProperties}
                      />
                    </li>
                  ) : null}
                  {column.cardIds.map((cardId) => {
                const card = cardLookup[cardId];
                if (!card) return null;
                const isDragCard = drag?.cardId === card.id;
                const isHomePlaceholder = Boolean(
                  isDragCard && !drag?.committed && atHome && drag?.fromColumnId === column.id,
                );
                const isGhost = Boolean(isDragCard && !drag?.committed && !isHomePlaceholder);
                const isLanding = Boolean(isDragCard && drag?.committed);
                const visibleIndex = isGhost ? -1 : visibleIds.indexOf(cardId);
                const shouldShift =
                  drag?.phase === "dragging" &&
                  !atHome &&
                  !isGhost &&
                  !isHomePlaceholder &&
                  dropIndex !== null &&
                  dropIndex > 0 &&
                  visibleIndex >= dropIndex;
                const showDropGhost =
                  Boolean(drag) &&
                  shouldShift &&
                  dropIndex !== null &&
                  dropIndex > 0 &&
                  visibleIndex === dropIndex;
                const assignedTags = tagsForCard(card)
                  .map((tagId) => resolvedTags.find((tag) => tag.id === tagId))
                  .filter((tag): tag is KanbanTag => Boolean(tag));
                const attachmentCount = attachmentsForCard(card).length;
                const assignedMembers = membersForCard(card)
                  .map((memberId) => resolvedMembers.find((member) => member.id === memberId))
                  .filter((member): member is KanbanMember => Boolean(member));
                const body: ReactNode = (
                  <>
                    <CardContent card={card} />
                    {assignedTags.length ? (
                      <div className={styles.cardTagRow}>
                        {assignedTags.slice(0, 4).map((tag) => (
                          <span
                            className={styles.cardTag}
                            key={tag.id}
                            style={{ ["--kanban-tag-color" as string]: tag.color }}
                            title={tag.label}
                          >
                            {tag.label}
                          </span>
                        ))}
                        {assignedTags.length > 4 ? (
                          <span className={styles.cardTagMore}>+{assignedTags.length - 4}</span>
                        ) : null}
                      </div>
                    ) : null}
                    {assignedMembers.length ? (
                      <div className={styles.cardMembers}>
                        {assignedMembers.slice(0, 3).map((member) => (
                          <span
                            className={styles.cardMemberAvatar}
                            key={member.id}
                            style={{ background: member.color ?? "var(--opus-accent)" }}
                            title={member.name}
                          >
                            {memberInitials(member.name)}
                          </span>
                        ))}
                        {assignedMembers.length > 3 ? (
                          <span className={styles.cardMemberMore}>+{assignedMembers.length - 3}</span>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                );
                const commentCount = commentsForCard(card).length;
                const sharedProps = {
                  "aria-grabbed": isDragCard || undefined,
                  className: styles.card,
                  "data-dragging": isDragCard ? "true" : undefined,
                  "data-tone": card.tone ?? "default",
                  onClick: () => activateCard(card),
                  onPointerDown: (event: ReactPointerEvent<HTMLElement>) =>
                    handleCardPointerDown(event, card.id, column.id),
                  style: card.color
                    ? ({ ["--card-accent" as string]: card.color } as CSSProperties)
                    : undefined,
                } as const;

                return (
                  <li
                    className={
                      isGhost
                        ? styles.ghostSlot
                        : isHomePlaceholder || isLanding
                          ? isLanding
                            ? styles.landingSlot
                            : styles.homePlaceholder
                          : undefined
                    }
                    data-kanban-card-id={card.id}
                    key={card.id}
                    style={{
                      transform: shouldShift ? `translateY(${shiftBy}px)` : "translateY(0)",
                    }}
                  >
                    {showDropGhost ? (
                      <div
                        aria-hidden="true"
                        className={styles.dropGhost}
                        style={
                          {
                            height: drag!.height,
                            top: -shiftBy,
                            ["--card-accent" as string]: drag!.accent,
                          } as CSSProperties
                        }
                      />
                    ) : null}
                    <article
                      {...sharedProps}
                      draggable={false}
                      onDragStart={(event) => event.preventDefault()}
                    >
                      {onCardClick || ticketView ? (
                        <button
                          className={styles.cardOpen}
                          onClick={(event) => {
                            event.stopPropagation();
                            activateCard(card);
                          }}
                          type="button"
                        >
                          {body}
                        </button>
                      ) : (
                        <div className={styles.cardOpenStatic}>{body}</div>
                      )}
                      {ticketView || attachmentCount > 0 ? (
                        <div className={styles.cardFooterActions}>
                          {ticketView ? (
                            <button
                              aria-label={`Open ticket for ${card.title}${commentCount ? `, ${commentCount === 1 ? "1 comment" : `${commentCount} comments`}` : ""}`}
                              className={styles.commentButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                openTicket(card);
                              }}
                              onPointerDown={(event) => event.stopPropagation()}
                              type="button"
                            >
                              <FontAwesomeIcon icon={faComment} />
                              <span>{commentCount || "Comment"}</span>
                            </button>
                          ) : null}
                          {attachmentCount ? (
                            <span
                              className={styles.cardAttachmentBadge}
                              title={`${attachmentCount} attachment${attachmentCount === 1 ? "" : "s"}`}
                            >
                              <FontAwesomeIcon icon={faPaperclip} />
                              {attachmentCount}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  </li>
                );
              })}
              {showEndGhost && drag ? (
                <li
                  aria-hidden="true"
                  className={styles.dropGhostEnd}
                  key={`drop-ghost-${column.id}`}
                  style={
                    {
                      height: drag.height,
                      ["--card-accent" as string]: drag.accent,
                    } as CSSProperties
                  }
                >
                  <div className={styles.dropGhost} />
                </li>
              ) : null}
                </ul>
                {onChange ? (
                  <div className={styles.cardComposerArea}>
                    {cardComposerColumnId === column.id ? (
                      <form
                        className={styles.cardComposer}
                        onSubmit={(event) => createCard(event, column.id)}
                      >
                        <textarea
                          aria-label={`New card title for ${column.title}`}
                          className={styles.cardComposerInput}
                          onChange={(event) => setCardDraft(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                              event.preventDefault();
                              createCard(event, column.id);
                            }
                            if (event.key === "Escape") {
                              event.preventDefault();
                              setCardComposerColumnId(null);
                              setCardDraft("");
                            }
                          }}
                          placeholder="Enter a title…"
                          ref={cardComposerRef}
                          rows={2}
                          value={cardDraft}
                        />
                        <div className={styles.cardComposerActions}>
                          <Button disabled={!cardDraft.trim()} size="sm" type="submit">
                            Add card
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setCardComposerColumnId(null);
                              setCardDraft("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <button
                        className={styles.addCardButton}
                        onClick={() => {
                          setCardComposerColumnId(column.id);
                          setCardDraft("");
                          window.requestAnimationFrame(() => cardComposerRef.current?.focus());
                        }}
                        type="button"
                      >
                        <span aria-hidden="true">+</span> {addCardLabel}
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
          </section>
        );
      })}
      {onChange ? (
        <section className={styles.addColumn} data-kanban-add-column="true">
          {addingColumn ? (
            <form className={styles.addColumnForm} onSubmit={addColumn}>
              <label className={styles.addColumnLabel} htmlFor={columnFieldId}>
                List title
              </label>
              <input
                autoFocus
                className={styles.addColumnInput}
                id={columnFieldId}
                ref={columnInputRef}
                onChange={(event) => setNewColumnTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setAddingColumn(false);
                    setNewColumnTitle("");
                  }
                }}
                placeholder="e.g. Ready for review"
                value={newColumnTitle}
              />
              <div className={styles.addColumnActions}>
                <Button size="sm" type="submit">
                  Add list
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setAddingColumn(false);
                    setNewColumnTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              className={styles.addColumnButton}
              onClick={() => setAddingColumn(true)}
              type="button"
            >
              <span aria-hidden="true">+</span> {addColumnLabel}
            </button>
          )}
        </section>
      ) : null}
      </div>
      {preview}
      {columnDropRect && columnDrag?.phase === "dragging"
        ? createPortal(
            <div
              aria-hidden="true"
              className={styles.columnDropGhost}
              style={columnDropRect}
            />,
            document.body,
          )
        : null}
      {columnPreview}
      {tagColorPicker
        ? (() => {
            const tag = tagColorPicker.targetId === "new"
              ? null
              : resolvedTags.find((entry) => entry.id === tagColorPicker.targetId) ?? null;
            return createPortal(
              <div
                className={styles.colorPickerPopover}
                ref={colorPickerRef}
                style={{ left: tagColorPicker.left, top: tagColorPicker.top }}
              >
                <ColorPickerPanel
                  onClose={() => setTagColorPicker(null)}
                  onSelect={(color) => {
                    if (tag) updateTag(tag.id, { color });
                    else setNewTagColor(color);
                  }}
                  value={tag ? tag.color : newTagColor}
                />
              </div>,
              document.body,
            );
          })()
        : null}
      {colorMenu && colorMenuColumn
        ? createPortal(
            <div
              aria-label={`Colour for ${colorMenuColumn.title}`}
              className={styles.colorMenu}
              ref={colorMenuRef}
              role="dialog"
              style={{ left: colorMenu.left, top: colorMenu.top }}
            >
              <span className={styles.colorMenuTitle}>List colour</span>
              <div className={styles.colorGrid}>
                {columnColors.map((color) => (
                  <button
                    aria-label={`Use ${color}`}
                    aria-pressed={colorMenuColumn.accent === color}
                    className={styles.colorSwatch}
                    key={color}
                    onClick={() => {
                      updateColumn(colorMenuColumn.id, { accent: color });
                      setColorMenu(null);
                    }}
                    style={{ background: color }}
                    type="button"
                  />
                ))}
              </div>
              <div className={styles.colorMenuFooter}>
                <button
                  aria-expanded={customColorOpen}
                  className={styles.colorCustomButton}
                  onClick={() => setCustomColorOpen((current) => !current)}
                  type="button"
                >
                  Custom…
                </button>
                <button
                  className={styles.colorClear}
                  onClick={() => {
                    updateColumn(colorMenuColumn.id, { accent: undefined });
                    setColorMenu(null);
                  }}
                  type="button"
                >
                  Clear
                </button>
              </div>
              {customColorOpen ? (
                <div className={styles.colorPickerWrap}>
                  <ColorPickerPanel
                    onClose={() => setCustomColorOpen(false)}
                    onSelect={(color) => updateColumn(colorMenuColumn.id, { accent: color })}
                    value={colorMenuColumn.accent ?? columnColors[0] ?? "#64748b"}
                  />
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
      {ticketColorMenu && selectedCard
        ? createPortal(
            <div
              aria-label="Ticket header colour"
              className={styles.colorMenu}
              ref={ticketColorMenuRef}
              role="dialog"
              style={{ left: ticketColorMenu.left, top: ticketColorMenu.top }}
            >
              <span className={styles.colorMenuTitle}>Ticket header</span>
              <div className={styles.colorGrid}>
                {columnColors.map((color) => (
                  <button
                    aria-label={`Use ${color} for ticket header`}
                    aria-pressed={selectedCard.color === color}
                    className={styles.colorSwatch}
                    key={color}
                    onClick={() => {
                      updateCard(selectedCard.id, { color });
                      setTicketColorMenu(null);
                    }}
                    style={{ background: color }}
                    type="button"
                  />
                ))}
              </div>
              <div className={styles.colorMenuFooter}>
                <button
                  aria-expanded={ticketCustomColorOpen}
                  className={styles.colorCustomButton}
                  onClick={() => setTicketCustomColorOpen((current) => !current)}
                  type="button"
                >
                  Custom…
                </button>
                <button
                  className={styles.colorClear}
                  onClick={() => {
                    updateCard(selectedCard.id, { color: undefined });
                    setTicketColorMenu(null);
                  }}
                  type="button"
                >
                  Clear
                </button>
              </div>
              {ticketCustomColorOpen ? (
                <div className={styles.colorPickerWrap} ref={ticketColorPickerRef}>
                  <ColorPickerPanel
                    onClose={() => setTicketCustomColorOpen(false)}
                    onSelect={(color) => updateCard(selectedCard.id, { color })}
                    value={selectedCard.color ?? columnColors[0] ?? "#64748b"}
                  />
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
      {ticketView && selectedCard ? (
        <Modal
          actions={
            <Button variant="secondary" onClick={() => setActiveCard(null)}>
              Close
            </Button>
          }
          headerActions={
            <button
              aria-expanded={Boolean(ticketColorMenu)}
              aria-haspopup="dialog"
              aria-label="Change ticket header colour"
              className={styles.ticketHeaderColorButton}
              onClick={(event) => {
                if (ticketColorMenu) {
                  setTicketColorMenu(null);
                  setTicketCustomColorOpen(false);
                  return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                const width = 292;
                setTicketColorMenu({
                  left: Math.min(
                    Math.max(8, rect.right - width),
                    window.innerWidth - width - 8,
                  ),
                  top: Math.min(rect.bottom + 6, window.innerHeight - 320),
                });
                setTicketCustomColorOpen(false);
              }}
              type="button"
            >
              <span
                aria-hidden="true"
                className={styles.ticketHeaderColorDot}
                style={{ background: selectedCard.color ?? "var(--opus-accent)" }}
              />
              <FontAwesomeIcon icon={faPalette} />
            </button>
          }
          onClose={() => setActiveCard(null)}
          open
          panelClassName={styles.ticketModal}
          panelStyle={
            {
              ["--modal-width" as string]: "min(1120px, calc(100vw - 48px))",
              ["--ticket-color" as string]:
                selectedCard.color ?? "var(--opus-accent)",
            } as CSSProperties
          }
          size="large"
          title={selectedCard.title}
          titleContent={
            <input
              aria-label="Ticket title"
              className={styles.ticketTitleInput}
              onBlur={() => {
                const next = ticketTitle.trim();
                if (next && next !== selectedCard.title) {
                  updateCard(selectedCard.id, { title: next });
                }
              }}
              onChange={(event) => setTicketTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              value={ticketTitle}
            />
          }
        >
          <div className={styles.ticketLayout} data-single={commentsEnabled ? undefined : "true"}>
            <section aria-label="Ticket details" className={styles.ticketDetails}>
              <RichTextField
                id={`${selectedCard.id}-ticket-description`}
                label="Description"
                minHeight={190}
                mode="stacked"
                onAttachmentUpload={(file) =>
                  uploadInlineAttachment(file, selectedCard, "description")
                }
                onBlur={() => {
                  if (ticketDescription !== (selectedCard.description ?? "")) {
                    updateCard(selectedCard.id, {
                      description: isRichTextEmpty(ticketDescription)
                        ? undefined
                        : ticketDescription,
                    });
                  }
                }}
                onChange={setTicketDescription}
                placeholder="Add context, acceptance notes, or paste a screenshot…"
                size="sm"
                value={ticketDescription}
              />

              <div className={styles.ticketTags}>
                <div className={styles.ticketTagsHeader}>
                  <span className={styles.cardTagPickerLabel}>Tags</span>
                  <button
                    aria-expanded={ticketTagPickerOpen}
                    className={styles.ticketAddTagButton}
                    onClick={() => {
                      setTicketTagPickerOpen(true);
                      setTicketTagSearch("");
                    }}
                    type="button"
                  >
                    + Add tag
                  </button>
                </div>
                <div className={styles.ticketSelectedTags}>
                  {selectedTicketTags.length ? (
                    selectedTicketTags.map((tag) => (
                      <span
                        className={styles.ticketTagChip}
                        key={tag.id}
                        style={{ ["--kanban-tag-color" as string]: tag.color }}
                      >
                        <span aria-hidden="true" className={styles.cardTagDot} />
                        <span>{tag.label}</span>
                        <button
                          aria-label={`Remove ${tag.label} tag`}
                          onClick={() => toggleCardTag(selectedCard, tag.id)}
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className={styles.ticketTagsEmpty}>No tags selected.</span>
                  )}
                </div>
              </div>

              <div className={styles.ticketMembers}>
                <div className={styles.ticketTagsHeader}>
                  <span className={styles.cardTagPickerLabel}>Members</span>
                  <button
                    aria-expanded={ticketMemberPickerOpen}
                    className={styles.ticketAddTagButton}
                    onClick={() => {
                      setTicketMemberPickerOpen(true);
                      setTicketMemberSearch("");
                    }}
                    type="button"
                  >
                    + Add member
                  </button>
                </div>
                <div className={styles.ticketSelectedMembers}>
                  {selectedTicketMembers.length ? (
                    selectedTicketMembers.map((member) => (
                      <span className={styles.ticketMemberChip} key={member.id}>
                        <span
                          aria-hidden="true"
                          className={styles.ticketMemberAvatar}
                          style={{ background: member.color ?? "var(--opus-accent)" }}
                        >
                          {memberInitials(member.name)}
                        </span>
                        <span>{member.name}</span>
                        <button
                          aria-label={`Remove ${member.name} from ticket`}
                          onClick={() => toggleCardMember(selectedCard, member.id)}
                          type="button"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className={styles.ticketTagsEmpty}>No members assigned.</span>
                  )}
                </div>
              </div>

              <div className={styles.ticketAttachments}>
                <div className={styles.ticketTagsHeader}>
                  <span className={styles.cardTagPickerLabel}>
                    Attachments
                    {attachmentsForCard(selectedCard).length
                      ? ` (${attachmentsForCard(selectedCard).length})`
                      : ""}
                  </span>
                  <button
                    className={styles.ticketAddTagButton}
                    onClick={() => attachmentInputRef.current?.click()}
                    type="button"
                  >
                    + Add file
                  </button>
                </div>
                <input
                  aria-label="Attach files to ticket"
                  className={styles.hiddenFileInput}
                  multiple
                  style={{ display: "none" }}
                  onChange={(event) => {
                    if (event.target.files) addAttachments(event.target.files, selectedCard);
                    event.target.value = "";
                  }}
                  ref={attachmentInputRef}
                  type="file"
                />
                <div className={styles.attachmentList}>
                  {attachmentsForCard(selectedCard).length ? (
                    attachmentsForCard(selectedCard).map((attachment) => {
                      const uploading = attachment.status === "uploading";
                      const failed = attachment.status === "error";
                      const media = attachment.mimeType?.startsWith("image/") ? (
                        <img
                          alt=""
                          className={styles.attachmentThumb}
                          src={attachment.url}
                        />
                      ) : (
                        <span aria-hidden="true" className={styles.attachmentIcon}>
                          <FontAwesomeIcon icon={failed ? faFile : faPaperclip} />
                        </span>
                      );

                      return (
                        <div
                          className={styles.attachmentItem}
                          data-status={attachment.status}
                          key={attachment.id}
                        >
                          {uploading || failed ? (
                            media
                          ) : (
                            <a
                              aria-label={`Open ${attachment.name}`}
                              className={styles.attachmentThumbLink}
                              href={attachment.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              {media}
                            </a>
                          )}
                          <span className={styles.attachmentCopy}>
                            {uploading || failed ? (
                              <span className={styles.attachmentName}>{attachment.name}</span>
                            ) : (
                              <a href={attachment.url} rel="noreferrer" target="_blank">
                                {attachment.name}
                              </a>
                            )}
                            <small>
                              {uploading
                                ? "Uploading…"
                                : failed
                                  ? attachment.error || "Upload failed"
                                  : [
                                      formatFileSize(attachment.size),
                                      attachment.uploadedBy,
                                    ].filter(Boolean).join(" · ")}
                            </small>
                          </span>
                          {uploading ? (
                            <span aria-label="Uploading" className={styles.attachmentStatus}>
                              <FontAwesomeIcon icon={faSpinner} spin />
                            </span>
                          ) : failed ? null : (
                            <span className={styles.attachmentActions}>
                              <a
                                aria-label={`Open ${attachment.name}`}
                                className={styles.attachmentAction}
                                href={attachment.url}
                                rel="noreferrer"
                                target="_blank"
                                title="Open"
                              >
                                <FontAwesomeIcon icon={faUpRightFromSquare} />
                              </a>
                              <a
                                aria-label={`Download ${attachment.name}`}
                                className={styles.attachmentAction}
                                download={attachment.name}
                                href={attachment.downloadUrl ?? attachment.url}
                                rel="noreferrer"
                                title="Download"
                              >
                                <FontAwesomeIcon icon={faDownload} />
                              </a>
                            </span>
                          )}
                          <button
                            aria-label={`Remove ${attachment.name}`}
                            className={styles.attachmentRemove}
                            onClick={() => removeAttachment(selectedCard, attachment.id)}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <span className={styles.ticketTagsEmpty}>No attachments yet.</span>
                  )}
                </div>
              </div>

              <div className={styles.ticketMetaGrid}>
                <SelectField
                  disabled={!onChange}
                  id={`${selectedCard.id}-ticket-list`}
                  label="List"
                  mode="stacked"
                  options={columns.map((column) => column.title)}
                  size="sm"
                  value={
                    columns.find((column) => column.id === (moveTicketListId ?? selectedCardColumn?.id))
                      ?.title ?? selectedCardColumn?.title ?? ""
                  }
                  onChange={(event) => {
                    const target = columns.find((column) => column.title === event.target.value);
                    if (target && target.id !== selectedCardColumn?.id) {
                      const remaining = target.cardIds.filter((id) => id !== selectedCard.id);
                      setMoveTicketListId(target.id);
                      setMoveTicketIndex(remaining.length);
                    }
                  }}
                />
              </div>
            </section>

            {commentsEnabled ? (
              <section aria-label="Ticket discussion" className={styles.ticketDiscussion}>
                <div className={styles.ticketSectionHeader}>
                  <span>Discussion</span>
                  <small>{commentsForCard(selectedCard).length}</small>
                </div>
                {commentsForCard(selectedCard).length ? (
                  <ul aria-label="Comments" className={styles.commentList}>
                    {commentsForCard(selectedCard).map((comment) => (
                      <li className={styles.comment} key={comment.id}>
                        <span aria-hidden="true" className={styles.commentAvatar}>
                          {(comment.author ?? "You").slice(0, 1).toUpperCase()}
                        </span>
                        <div className={styles.commentBody}>
                          <div className={styles.commentMeta}>
                            <strong>{comment.author ?? "You"}</strong>
                            {comment.createdAt ? (
                              <time dateTime={comment.createdAt}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </time>
                            ) : null}
                          </div>
                          {comment.body ? <RichTextContent html={comment.body} /> : null}
                          {comment.attachments?.length ? (
                            <div className={styles.commentAttachments}>
                              {comment.attachments.map((attachment) => (
                                <span className={styles.commentAttachment} key={attachment.id}>
                                  <FontAwesomeIcon icon={faPaperclip} />
                                  <a
                                    href={attachment.url}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    {attachment.name}
                                  </a>
                                  <a
                                    aria-label={`Download ${attachment.name}`}
                                    className={styles.commentAttachmentAction}
                                    download={attachment.name}
                                    href={attachment.downloadUrl ?? attachment.url}
                                    rel="noreferrer"
                                    title="Download"
                                  >
                                    <FontAwesomeIcon icon={faDownload} />
                                  </a>
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.commentEmpty}>No comments yet. Start the conversation.</p>
                )}
                <form className={styles.commentForm} onSubmit={addComment}>
                  <RichTextField
                    id={commentFieldId}
                    label="Add a comment"
                    minHeight={90}
                    mode="stacked"
                    onAttachmentUpload={(file) =>
                      uploadInlineAttachment(file, selectedCard, "comment")
                    }
                    onChange={setCommentDraft}
                    placeholder="Write a comment or paste a screenshot…"
                    size="sm"
                    value={commentDraft}
                  />
                  {commentAttachments.length ? (
                    <div className={styles.commentAttachmentDrafts}>
                      {commentAttachments.map((attachment) => (
                        <span
                          className={styles.commentAttachmentDraft}
                          data-status={attachment.status}
                          key={attachment.id}
                        >
                          <FontAwesomeIcon
                            icon={attachment.status === "uploading" ? faSpinner : faPaperclip}
                            spin={attachment.status === "uploading"}
                          />
                          <span>{attachment.name}</span>
                          <small>
                            {attachment.status === "uploading"
                              ? "Uploading…"
                              : attachment.status === "error"
                                ? attachment.error || "Upload failed"
                                : formatFileSize(attachment.size)}
                          </small>
                          <button
                            aria-label={`Remove ${attachment.name} from comment`}
                            onClick={() => removeCommentAttachment(selectedCard, attachment.id)}
                            type="button"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className={styles.commentActions}>
                    <span className={styles.commentAuthor}>{currentUser?.name ?? "You"}</span>
                    <div className={styles.commentActionButtons}>
                      <input
                        aria-label="Attach files to comment"
                        className={styles.hiddenFileInput}
                        multiple
                        style={{ display: "none" }}
                        onChange={(event) => {
                          if (event.target.files) {
                            addCommentAttachments(event.target.files, selectedCard);
                          }
                          event.target.value = "";
                        }}
                        ref={commentAttachmentInputRef}
                        type="file"
                      />
                      <Button
                        onClick={() => commentAttachmentInputRef.current?.click()}
                        size="sm"
                        type="button"
                        variant="secondary"
                      >
                        <FontAwesomeIcon icon={faPaperclip} /> Attach
                      </Button>
                      <Button
                        disabled={
                          (isRichTextEmpty(commentDraft) && commentAttachments.length === 0) ||
                          commentAttachments.some((attachment) => attachment.status)
                        }
                        size="sm"
                        title={
                          commentAttachments.some((attachment) => attachment.status === "uploading")
                            ? "Wait for attachments to finish uploading"
                            : commentAttachments.some((attachment) => attachment.status === "error")
                              ? "Remove failed attachments before commenting"
                              : undefined
                        }
                        type="submit"
                      >
                        <FontAwesomeIcon icon={faPaperPlane} /> Add comment
                      </Button>
                    </div>
                  </div>
                </form>
              </section>
            ) : null}
          </div>
        </Modal>
      ) : null}
      {ticketTagPickerOpen && selectedCard ? (
        <Modal
          actions={
            <Button variant="secondary" onClick={() => setTicketTagPickerOpen(false)}>
              Done
            </Button>
          }
          onClose={() => setTicketTagPickerOpen(false)}
          open
          size="small"
          title={`Tags for ${selectedCard.title}`}
        >
          <div className={styles.ticketTagModal}>
            <input
              aria-label="Search tags"
              autoFocus
              className={styles.ticketInput}
              onChange={(event) => setTicketTagSearch(event.target.value)}
              placeholder="Search tags…"
              value={ticketTagSearch}
            />
            <div className={styles.ticketTagModalList}>
              {resolvedTags
                .filter((tag) =>
                  tag.label.toLowerCase().includes(ticketTagSearch.trim().toLowerCase()),
                )
                .map((tag) => {
                  const active = tagsForCard(selectedCard).includes(tag.id);
                  return (
                    <button
                      aria-pressed={active}
                      className={styles.ticketTagModalOption}
                      key={tag.id}
                      onClick={() => toggleCardTag(selectedCard, tag.id)}
                      style={{ ["--kanban-tag-color" as string]: tag.color }}
                      type="button"
                    >
                      <span aria-hidden="true" className={styles.cardTagDot} />
                      <span>{tag.label}</span>
                      {active ? (
                        <span aria-hidden="true" className={styles.ticketTagCheck}>
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              {resolvedTags.length === 0 ? (
                <p className={styles.ticketTagsEmpty}>No tags yet. Create one below.</p>
              ) : null}
            </div>
            <form
              className={styles.ticketTagCreate}
              onSubmit={(event) => {
                const tag = createTag(event);
                if (tag) toggleCardTag(selectedCard, tag.id);
              }}
            >
              <span className={styles.tagFormLabel}>Create a tag</span>
              <div className={styles.tagFormRow}>
                <input
                  aria-label="New tag name"
                  className={styles.ticketInput}
                  onChange={(event) => setNewTagLabel(event.target.value)}
                  placeholder="e.g. Ready for QA"
                  value={newTagLabel}
                />
                <Button disabled={!newTagLabel.trim()} size="sm" type="submit">
                  Create tag
                </Button>
              </div>
              <div className={styles.tagPalette}>
                {columnColors.map((color) => (
                  <button
                    aria-label={`New tag colour ${color}`}
                    aria-pressed={newTagColor === color}
                    className={styles.tagSwatch}
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    style={{ background: color }}
                    type="button"
                  />
                ))}
                <button
                  aria-expanded={tagColorPicker?.targetId === "new"}
                  className={styles.tagCustomButton}
                  onClick={(event) => openTagColorPicker(event, "new")}
                  type="button"
                >
                  Custom…
                </button>
              </div>
            </form>
          </div>
        </Modal>
      ) : null}
      {ticketMemberPickerOpen && selectedCard ? (
        <Modal
          actions={
            <Button variant="secondary" onClick={() => setTicketMemberPickerOpen(false)}>
              Done
            </Button>
          }
          onClose={() => setTicketMemberPickerOpen(false)}
          open
          size="small"
          title={`Members for ${selectedCard.title}`}
        >
          <div className={styles.ticketMemberModal}>
            <input
              aria-label="Search members"
              autoFocus
              className={styles.ticketInput}
              onChange={(event) => setTicketMemberSearch(event.target.value)}
              placeholder="Search members…"
              value={ticketMemberSearch}
            />
            <div className={styles.ticketMemberList}>
              {resolvedMembers
                .filter((member) =>
                  [member.name, member.role ?? ""]
                    .join(" ")
                    .toLowerCase()
                    .includes(ticketMemberSearch.trim().toLowerCase()),
                )
                .map((member) => {
                  const active = membersForCard(selectedCard).includes(member.id);
                  return (
                    <button
                      aria-pressed={active}
                      className={styles.ticketMemberOption}
                      key={member.id}
                      onClick={() => toggleCardMember(selectedCard, member.id)}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className={styles.ticketMemberAvatar}
                        style={{ background: member.color ?? "var(--opus-accent)" }}
                      >
                        {memberInitials(member.name)}
                      </span>
                      <span className={styles.ticketMemberCopy}>
                        <strong>{member.name}</strong>
                        {member.role ? <small>{member.role}</small> : null}
                      </span>
                      <span aria-hidden="true" className={styles.ticketTagCheck}>
                        {active ? "✓" : ""}
                      </span>
                    </button>
                  );
                })}
              {resolvedMembers.length === 0 ? (
                <p className={styles.ticketTagsEmpty}>No members available.</p>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}
      {moveTicketListId && selectedCard ? (() => {
        const target = columns.find((column) => column.id === moveTicketListId);
        if (!target) return null;
        const remaining = target.cardIds.filter((id) => id !== selectedCard.id);

        return (
          <Modal
            actions={
              <>
                <Button variant="secondary" onClick={() => setMoveTicketListId(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    moveCard(selectedCard.id, target.id, moveTicketIndex);
                    setMoveTicketListId(null);
                  }}
                >
                  Move
                </Button>
              </>
            }
            onClose={() => setMoveTicketListId(null)}
            open
            size="small"
            title={`Move to ${target.title}`}
          >
            <div className={styles.ticketMove}>
              {(() => {
                const positionOptions = [
                  "Top",
                  ...remaining.map(
                    (cardId) => `After ${cardLookup[cardId]?.title ?? cardId}`,
                  ),
                  ...(remaining.length > 0 ? ["Bottom"] : []),
                ];
                return (
                  <SelectField
                    id={`${selectedCard.id}-ticket-position`}
                    label="Position"
                    mode="stacked"
                    options={positionOptions}
                    size="sm"
                    value={positionOptions[moveTicketIndex] ?? positionOptions[0] ?? "Top"}
                    onChange={(event) => {
                      setMoveTicketIndex(Math.max(0, positionOptions.indexOf(event.target.value)));
                    }}
                  />
                );
              })()}
              <p className={styles.ticketMoveHint}>
                Choose where this ticket should sit in {target.title}.
              </p>
            </div>
          </Modal>
        );
      })() : null}
    </div>
  );
}
