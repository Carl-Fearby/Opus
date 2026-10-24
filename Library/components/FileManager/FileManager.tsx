"use client";
import { useMemo, useState } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import { Button } from "../fields/Button";
import { TextField } from "../fields/TextField";
import styles from "./FileManager.module.css";

export type FileManagerEntry = { id: string; name: string; type: "file" | "folder"; size?: string; modified?: string; fileType?: string };
export type FileManagerProps = { entries: FileManagerEntry[]; path?: string[]; initialView?: "grid" | "list"; onOpen: (entry: FileManagerEntry) => void; onUpload?: () => void; onCreateFolder?: () => void; onPathChange?: (index: number) => void };

export function FileManager({ entries, path = ["Documents"], initialView = "grid", onOpen, onUpload, onCreateFolder, onPathChange }: FileManagerProps) {
  const { t } = useOpusI18n();
  const [view, setView] = useState(initialView);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => entries.filter((entry) => entry.name.toLowerCase().includes(query.toLowerCase())), [entries, query]);

  return (
    <section className={styles.root} aria-label={t("fileManager.label", "File manager")}>
      <header className={styles.header}>
        <nav aria-label={t("fileManager.folderPath", "Folder path")}>
          {path.map((part, index) => (
            <span key={`${part}-${index}`}>
              <button type="button" onClick={() => onPathChange?.(index)}>{part}</button>
              {index < path.length - 1 ? <i aria-hidden="true">/</i> : null}
            </span>
          ))}
        </nav>
        <div className={styles.headerActions}>
          {onCreateFolder ? <Button size="sm" variant="secondary" type="button" onClick={onCreateFolder}>{t("fileManager.newFolder", "New folder")}</Button> : null}
          {onUpload ? <Button size="sm" type="button" onClick={onUpload}>{t("fileManager.upload", "Upload")}</Button> : null}
        </div>
      </header>
      <div className={styles.tools}>
        <TextField
          id="file-manager-search"
          label={t("fileManager.search", "Search files")}
          labelVisuallyHidden
          placeholder={t("fileManager.searchPlaceholder", "Search files…")}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div role="group" aria-label={t("fileManager.view", "View")}>
          <Button aria-pressed={view === "grid"} size="sm" variant="secondary" type="button" onClick={() => setView("grid")}>{t("fileManager.grid", "Grid")}</Button>
          <Button aria-pressed={view === "list"} size="sm" variant="secondary" type="button" onClick={() => setView("list")}>{t("fileManager.list", "List")}</Button>
        </div>
      </div>
      <div className={styles.entries} data-view={view}>
        {filtered.map((entry) => (
          <button className={styles.entry} key={entry.id} type="button" onDoubleClick={() => onOpen(entry)} onClick={() => onOpen(entry)}>
            <span aria-hidden="true" className={styles.entryIcon}>{entry.type === "folder" ? "▰" : "▤"}</span>
            <span className={styles.entryCopy}>
              <strong>{entry.name}</strong>
              <small>{[entry.fileType, entry.size, entry.modified].filter(Boolean).join(" · ") || (entry.type === "folder" ? t("fileManager.folder", "Folder") : t("fileManager.file", "File"))}</small>
            </span>
          </button>
        ))}
      </div>
      {!filtered.length ? <p className={styles.empty} role="status">{t("fileManager.empty", "No files match your search.")}</p> : null}
    </section>
  );
}
