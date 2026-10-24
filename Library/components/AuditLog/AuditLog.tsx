"use client";
import { useMemo, useState } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import { SelectField } from "../fields/SelectField";
import { TextField } from "../fields/TextField";
import styles from "./AuditLog.module.css";

export type AuditLogEntry = { id: string; actor: string; action: string; timestamp: string; category?: string; details?: string; status?: "success" | "warning" | "error" };
export type AuditLogProps = { entries: AuditLogEntry[]; categories?: string[]; onEntryClick?: (entry: AuditLogEntry) => void };

export function AuditLog({ entries, categories = [], onEntryClick }: AuditLogProps) {
  const { t } = useOpusI18n();
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const allCategoriesLabel = t("auditLog.allCategories", "All categories");
  const filtered = useMemo(
    () => entries.filter((entry) => (category === "all" || entry.category === category) && `${entry.actor} ${entry.action} ${entry.details ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [category, entries, query],
  );

  return (
    <section className={styles.root} aria-label={t("auditLog.label", "Audit log")}>
      <header>
        <div>
          <h2>{t("auditLog.title", "Audit log")}</h2>
          <p>{t("auditLog.description", "Immutable history of important changes.")}</p>
        </div>
        <TextField
          id="audit-log-search"
          label={t("auditLog.search", "Search audit log")}
          labelVisuallyHidden
          placeholder={t("auditLog.searchPlaceholder", "Search activity…")}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectField
          id="audit-log-category"
          label={t("auditLog.filterCategory", "Filter category")}
          labelVisuallyHidden
          options={[allCategoriesLabel, ...categories]}
          value={category === "all" ? allCategoriesLabel : category}
          onChange={(event) => setCategory(event.target.value === allCategoriesLabel ? "all" : event.target.value)}
        />
      </header>
      <ol>
        {filtered.map((entry) => (
          <li key={entry.id}>
            <button type="button" onClick={() => onEntryClick?.(entry)}>
              <span className={styles.marker} data-status={entry.status ?? "success"} />
              <span className={styles.copy}>
                <strong>{entry.actor} <span>{entry.action}</span></strong>
                {entry.details ? <small>{entry.details}</small> : null}
              </span>
              <time>{entry.timestamp}</time>
            </button>
          </li>
        ))}
      </ol>
      {!filtered.length ? <p className={styles.empty} role="status">{t("auditLog.empty", "No audit events found.")}</p> : null}
    </section>
  );
}
