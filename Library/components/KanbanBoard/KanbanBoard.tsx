"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faComment, faGripVertical, faPalette, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { createThemedPortal as createPortal } from "@/lib/theme/createThemedPortal";
import { Button } from "@/components/fields/Button";
import { CustomScrollbar } from "@/components/CustomScrollbar";
import { Modal } from "@/components/Modal";
import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./KanbanBoard.module.css";

export type KanbanComment = {
  id: string;
  author?: string;
  body: string;
  /** ISO timestamp. */
  createdAt?: string;
};

export type KanbanCard = {
  id: string;
  title: string;
  meta?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  description?: string;
  comments?: KanbanComment[];
};

export type KanbanColumn = {
  id: string;
  title: string;
  cardIds: string[];
  /** Optional header accent colour (CSS colour). */
  accent?: string;
};

export type KanbanBoardProps = {
  /** Label for the new-list button. */
  addColumnLabel?: string;
  cards: Record<string, KanbanCard>;
  /** Colour presets offered by the list colour menu. */
  columnColors?: string[];
  /** Fixed width for each list. Numbers are pixels. */
  columnWidth?: number | string;
  columns: KanbanColumn[];
  /** Show comment counts and the comment thread action on each card. Defaults to true. */
  commentsEnabled?: boolean;
  /** The current commenter shown in the composer. */
  currentUser?: { name: string };
  onChange?: (columns: KanbanColumn[]) => void;
  onAddComment?: (cardId: string, comment: KanbanComment) => void;
  onCardClick?: (card: KanbanCard) => void;
  onCommentsChange?: (cardId: string, comments: KanbanComment[]) => void;
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

function metaIconName(meta?: string) {
  const normalised = meta?.trim().toLowerCase() ?? "";
  if (normalised.includes("plan") || normalised.includes("calendar") || normalised.includes("schedule")) {
    return "calendar";
  }
  return "tag";
}

function CardContent({ card }: { card: KanbanCard }) {
  return (
    <>
      <div className={styles.cardTitle} title={card.title}>
        {card.title}
      </div>
      <div className={styles.cardMeta}>
        {card.meta ? (
          <>
            <CatalogIcon className={styles.cardMetaIcon} iconName={metaIconName(card.meta)} />
            <span title={card.meta}>{card.meta}</span>
          </>
        ) : (
          <span aria-hidden="true">&nbsp;</span>
        )}
      </div>
    </>
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
    left: rect.left - translateX,
    right: rect.right - translateX,
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
  addColumnLabel = "Add list",
  cards,
  columnColors = DEFAULT_COLUMN_COLORS,
  columnWidth,
  columns,
  commentsEnabled = true,
  currentUser,
  onAddComment,
  onCardClick,
  onChange,
  onCommentsChange,
}: KanbanBoardProps) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [columnDrag, setColumnDrag] = useState<ColumnDragState | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [localComments, setLocalComments] = useState<Record<string, KanbanComment[]>>({});
  const [scrollInfo, setScrollInfo] = useState({ left: 0, max: 0 });
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [colorMenu, setColorMenu] = useState<{ columnId: string; left: number; top: number } | null>(null);
  const commentFieldId = useId();
  const columnFieldId = useId();
  const didDragRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);
  const columnDragRef = useRef<ColumnDragState | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const columnInputRef = useRef<HTMLInputElement | null>(null);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);
  const skipTitleCommitRef = useRef(false);
  const columnsRef = useRef(columns);
  const onChangeRef = useRef(onChange);
  const onAddCommentRef = useRef(onAddComment);
  const onCommentsChangeRef = useRef(onCommentsChange);
  const cardLookup = useMemo(() => cards, [cards]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    columnsRef.current = columns;
    onChangeRef.current = onChange;
    onAddCommentRef.current = onAddComment;
    onCommentsChangeRef.current = onCommentsChange;
  }, [columns, onAddComment, onChange, onCommentsChange]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

  useEffect(() => {
    columnDragRef.current = columnDrag;
  }, [columnDrag]);

  useEffect(() => {
    if (selectedCardId && !cards[selectedCardId]) {
      setSelectedCardId(null);
    }
  }, [cards, selectedCardId]);

  useEffect(() => {
    const board = rootRef.current;
    if (!board) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;

      const maxScroll = board.scrollWidth - board.clientWidth;
      if (maxScroll <= 0) return;

      const target = event.target as HTMLElement | null;
      const cardViewport = target?.closest<HTMLElement>("[data-kanban-cards-viewport]");

      // Let a list scroll its own cards first. Once it reaches the end, the
      // remaining wheel movement continues across the board.
      if (cardViewport && !event.shiftKey) {
        const canScrollUp = event.deltaY < 0 && cardViewport.scrollTop > 1;
        const canScrollDown =
          event.deltaY > 0
          && cardViewport.scrollTop + cardViewport.clientHeight < cardViewport.scrollHeight - 1;

        if (canScrollUp || canScrollDown) return;
      }

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? board.clientWidth : 1;
      const horizontalDelta = event.deltaX * unit;
      const verticalDelta = event.deltaY * unit;

      // Horizontal trackpad and tilt-wheel gestures scroll the board directly.
      // Handle them here as well because card viewports contain vertical scroll
      // chaining, which can otherwise swallow the gesture.
      if (Math.abs(horizontalDelta) > Math.abs(verticalDelta)) {
        event.preventDefault();
        board.scrollLeft = Math.min(
          maxScroll,
          Math.max(0, board.scrollLeft + horizontalDelta),
        );
        return;
      }

      if (!verticalDelta) return;

      event.preventDefault();
      board.scrollLeft = Math.min(
        maxScroll,
        Math.max(0, board.scrollLeft + verticalDelta),
      );
    };

    board.addEventListener("wheel", handleWheel, { passive: false });
    return () => board.removeEventListener("wheel", handleWheel);
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

  function moveCard(cardId: string, toColumnId: string, toIndex: number) {
    const change = onChangeRef.current;
    if (!change) return;

    const currentColumns = columnsRef.current;
    const without = currentColumns.map((column) => ({
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    }));

    change(
      without.map((column) => {
        if (column.id !== toColumnId) return column;
        const cardIds = [...column.cardIds];
        const index = Math.max(0, Math.min(toIndex, cardIds.length));
        cardIds.splice(index, 0, cardId);
        return { ...column, cardIds };
      }),
    );
  }

  function commentsForCard(card: KanbanCard) {
    return localComments[card.id] ?? card.comments ?? [];
  }

  function openComments(card: KanbanCard) {
    setSelectedCardId(card.id);
    setCommentDraft("");
  }

  function addComment(event: { preventDefault: () => void }) {
    event.preventDefault();
    const card = selectedCardId ? cardLookup[selectedCardId] : null;
    const body = commentDraft.trim();
    if (!card || !body) return;

    const comment: KanbanComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: currentUser?.name ?? "You",
      body,
      createdAt: new Date().toISOString(),
    };
    const next = [...commentsForCard(card), comment];

    setLocalComments((current) => ({ ...current, [card.id]: next }));
    setCommentDraft("");
    onAddCommentRef.current?.(card.id, comment);
    onCommentsChangeRef.current?.(card.id, next);
  }

  function addColumn(event: { preventDefault: () => void }) {
    event.preventDefault();
    const title = newColumnTitle.trim();
    const change = onChangeRef.current;
    if (!title || !change) return;

    change([
      ...columnsRef.current,
      {
        id: `column-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        cardIds: [],
      },
    ]);
    setNewColumnTitle("");
    window.requestAnimationFrame(() => {
      const board = rootRef.current;
      board?.scrollTo({ left: board.scrollWidth, behavior: "smooth" });
      columnInputRef.current?.focus();
    });
  }

  function updateColumn(columnId: string, patch: Partial<KanbanColumn>) {
    onChangeRef.current?.(
      columnsRef.current.map((column) =>
        column.id === columnId ? { ...column, ...patch } : column,
      ),
    );
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
  }

  function handleColumnKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, columnId: string) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = columnsRef.current.findIndex((column) => column.id === columnId);
    if (index < 0) return;
    moveColumn(columnId, index + (event.key === "ArrowRight" ? 1 : -1));
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
            </article>
          </div>,
          document.body,
        )
      : null;

  const selectedCard = selectedCardId ? cardLookup[selectedCardId] : null;
  const colorMenuColumn = colorMenu
    ? columns.find((column) => column.id === colorMenu.columnId) ?? null
    : null;

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
      {scrollInfo.max > 1 ? (
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
      ) : null}
      <div
        className={styles.root}
        aria-label="Kanban board"
        data-column-dragging={columnDrag ? "true" : undefined}
        data-column-dropping={columnDrag?.phase === "dropping" ? "true" : undefined}
        data-dragging={drag ? "true" : undefined}
        data-dropping={drag?.phase === "dropping" ? "true" : undefined}
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
                    const width = 204;
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
            <CustomScrollbar
              autoHide
              className={styles.cardsScroll}
              label={`${column.title} cards`}
              orientation="vertical"
              thickness={8}
              trackInset={4}
              viewportSelector="[data-kanban-cards-viewport]"
            >
              <div className={styles.cardsViewport} data-kanban-cards-viewport="">
                <ul className={styles.cards} data-kanban-cards="true">
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
                  visibleIndex >= dropIndex;
                const showDropGhost =
                  Boolean(drag) &&
                  shouldShift &&
                  dropIndex !== null &&
                  visibleIndex === dropIndex;
                const body: ReactNode = <CardContent card={card} />;
                const commentCount = commentsForCard(card).length;
                const sharedProps = {
                  "aria-grabbed": isDragCard || undefined,
                  className: styles.card,
                  "data-dragging": isDragCard ? "true" : undefined,
                  "data-tone": card.tone ?? "default",
                  onPointerDown: (event: ReactPointerEvent<HTMLElement>) =>
                    handleCardPointerDown(event, card.id, column.id),
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
                    <article {...sharedProps}>
                      {onCardClick ? (
                        <button
                          className={styles.cardOpen}
                          onClick={() => {
                            if (didDragRef.current) {
                              didDragRef.current = false;
                              return;
                            }
                            onCardClick(card);
                          }}
                          type="button"
                        >
                          {body}
                        </button>
                      ) : (
                        <div className={styles.cardOpenStatic}>{body}</div>
                      )}
                      {commentsEnabled ? (
                        <button
                          aria-label={`Comments for ${card.title}${commentCount ? `, ${commentCount === 1 ? "1 comment" : `${commentCount} comments`}` : ""}`}
                          className={styles.commentButton}
                          onClick={(event) => {
                            event.stopPropagation();
                            openComments(card);
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                          type="button"
                        >
                          <FontAwesomeIcon icon={faComment} />
                          <span>{commentCount || "Comment"}</span>
                        </button>
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
              </div>
            </CustomScrollbar>
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
      {columnPreview}
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
                <label className={styles.colorCustom}>
                  <span>Custom</span>
                  <input
                    aria-label="Custom list colour"
                    onChange={(event) =>
                      updateColumn(colorMenuColumn.id, { accent: event.target.value })
                    }
                    type="color"
                    value={colorMenuColumn.accent ?? columnColors[0] ?? "#64748b"}
                  />
                </label>
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
            </div>,
            document.body,
          )
        : null}
      {commentsEnabled && selectedCard ? (
        <Modal
          description={selectedCard.meta ?? selectedCard.description}
          onClose={() => setSelectedCardId(null)}
          open
          title={selectedCard.title}
        >
          <div className={styles.commentPanel}>
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
                      <p>{comment.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.commentEmpty}>No comments yet. Start the conversation.</p>
            )}
            <form className={styles.commentForm} onSubmit={addComment}>
              <label className={styles.commentLabel} htmlFor={commentFieldId}>
                Add a comment
              </label>
              <textarea
                className={styles.commentInput}
                id={commentFieldId}
                onChange={(event) => setCommentDraft(event.target.value)}
                placeholder="Write a comment…"
                rows={3}
                value={commentDraft}
              />
              <div className={styles.commentActions}>
                <span className={styles.commentAuthor}>
                  {currentUser?.name ?? "You"}
                </span>
                <Button disabled={!commentDraft.trim()} size="sm" type="submit">
                  <FontAwesomeIcon icon={faPaperPlane} /> Add comment
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
