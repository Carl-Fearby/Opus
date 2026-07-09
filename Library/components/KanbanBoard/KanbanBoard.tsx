"use client";

import { useMemo, useState } from "react";
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
};

export function KanbanBoard({ cards, columns, onChange }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const cardLookup = useMemo(() => cards, [cards]);

  function moveCard(cardId: string, toColumnId: string) {
    if (!onChange) return;
    const next = columns.map((column) => ({
      ...column,
      cardIds: column.cardIds.filter((id) => id !== cardId),
    }));
    onChange(
      next.map((column) =>
        column.id === toColumnId ? { ...column, cardIds: [...column.cardIds, cardId] } : column,
      ),
    );
  }

  return (
    <div className={styles.root} aria-label="Kanban board">
      {columns.map((column) => (
        <section
          className={styles.column}
          key={column.id}
          onDragOver={(event) => {
            if (!onChange) return;
            event.preventDefault();
          }}
          onDrop={(event) => {
            event.preventDefault();
            const cardId = event.dataTransfer.getData("text/plain") || draggingId;
            if (cardId) moveCard(cardId, column.id);
            setDraggingId(null);
          }}
        >
          <header className={styles.columnHeader}>
            <h3 className={styles.columnTitle}>{column.title}</h3>
            <span className={styles.count}>{column.cardIds.length}</span>
          </header>
          <ul className={styles.cards}>
            {column.cardIds.map((cardId) => {
              const card = cardLookup[cardId];
              if (!card) return null;
              return (
                <li key={card.id}>
                  <article
                    className={styles.card}
                    data-tone={card.tone ?? "default"}
                    draggable={Boolean(onChange)}
                    onDragEnd={() => setDraggingId(null)}
                    onDragStart={(event) => {
                      setDraggingId(card.id);
                      event.dataTransfer.setData("text/plain", card.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                  >
                    <div className={styles.cardTitle}>{card.title}</div>
                    {card.meta ? <div className={styles.cardMeta}>{card.meta}</div> : null}
                  </article>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
