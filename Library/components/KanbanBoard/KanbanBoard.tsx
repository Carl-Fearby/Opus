"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { CatalogIcon } from "@/components/CatalogIcon";
import styles from "./KanbanBoard.module.css";

export type KanbanCard = {
  id: string;
  title: string;
  meta?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger";
};

export type KanbanColumn = {
  id: string;
  title: string;
  cardIds: string[];
};

export type KanbanBoardProps = {
  cards: Record<string, KanbanCard>;
  columns: KanbanColumn[];
  onChange?: (columns: KanbanColumn[]) => void;
  onCardClick?: (card: KanbanCard) => void;
};

type DropTarget = {
  columnId: string;
  index: number;
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
      <div className={styles.cardTitle}>{card.title}</div>
      {card.meta ? (
        <div className={styles.cardMeta}>
          <CatalogIcon className={styles.cardMetaIcon} iconName={metaIconName(card.meta)} />
          <span>{card.meta}</span>
        </div>
      ) : null}
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

export function KanbanBoard({ cards, columns, onCardClick, onChange }: KanbanBoardProps) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const didDragRef = useRef(false);
  const dragRef = useRef<DragState | null>(null);
  const columnsRef = useRef(columns);
  const onChangeRef = useRef(onChange);
  const cardLookup = useMemo(() => cards, [cards]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPortalReady(true), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    columnsRef.current = columns;
    onChangeRef.current = onChange;
  }, [columns, onChange]);

  useEffect(() => {
    dragRef.current = drag;
  }, [drag]);

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

  const draggingCard = drag ? cardLookup[drag.cardId] : null;
  const themeStyle = drag
    ? ({
        "--card-accent": drag.accent,
        "--dashboard-section-panel": drag.panel,
        "--dashboard-section-text": drag.text,
        "--dashboard-section-muted": drag.muted,
      } as CSSProperties)
    : undefined;

  const originGhost =
    drag && draggingCard && portalReady && drag.phase === "dragging"
      ? createPortal(
          <div
            aria-hidden="true"
            className={styles.originGhostShell}
            style={
              {
                ...themeStyle,
                left: drag.originLeft,
                top: drag.originTop,
                width: drag.width,
                height: drag.height,
              } as CSSProperties
            }
          >
            <article
              className={`${styles.card} ${styles.originGhost}`}
              data-tone={draggingCard.tone ?? "default"}
              style={
                {
                  width: drag.width,
                  height: drag.height,
                  backgroundColor: drag.panel,
                  color: drag.text,
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

  return (
    <div
      className={styles.root}
      aria-label="Kanban board"
      data-dragging={drag ? "true" : undefined}
      data-dropping={drag?.phase === "dropping" ? "true" : undefined}
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
            data-drop-active={drag?.phase === "dragging" ? "true" : undefined}
            data-kanban-column="true"
            data-kanban-column-id={column.id}
            key={column.id}
          >
            <header className={styles.columnHeader}>
              <h3 className={styles.columnTitle}>{column.title}</h3>
              <span className={styles.count}>{column.cardIds.length}</span>
            </header>
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
                    {onCardClick ? (
                      <button
                        {...sharedProps}
                        type="button"
                        onClick={() => {
                          if (didDragRef.current) {
                            didDragRef.current = false;
                            return;
                          }
                          onCardClick(card);
                        }}
                      >
                        {body}
                      </button>
                    ) : (
                      <article {...sharedProps}>{body}</article>
                    )}
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
          </section>
        );
      })}
      {originGhost}
      {preview}
    </div>
  );
}
