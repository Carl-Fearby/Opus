"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { selectAll } from "@codemirror/commands";
import { EditorSelection } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import styles from "./UsageCodeEditor.module.css";

type UsageCodeEditorProps = {
  code: string;
  editable?: boolean;
  fillHeight?: boolean;
  maxHeight?: string;
  minHeight?: string;
  onChange?: (value: string) => void;
  onSelectAllReady?: (selectAll: () => void) => void;
};

export function UsageCodeEditor({
  code,
  editable = false,
  fillHeight = false,
  maxHeight = "320px",
  minHeight,
  onChange,
  onSelectAllReady,
}: UsageCodeEditorProps) {
  const editorViewRef = useRef<EditorView | null>(null);
  const selectAllCode = useCallback(() => {
    const view = editorViewRef.current;

    if (!view) {
      return;
    }

    view.focus();
    view.dispatch({
      selection: EditorSelection.single(0, view.state.doc.length),
      scrollIntoView: true,
    });
  }, []);

  useEffect(() => {
    onSelectAllReady?.(selectAllCode);

    return () => {
      onSelectAllReady?.(() => undefined);
    };
  }, [onSelectAllReady, selectAllCode]);

  const extensions = useMemo(() => {
    const base = [
      javascript({ jsx: true, typescript: true }),
      keymap.of([{ key: "Mod-a", run: selectAll }]),
      EditorView.lineWrapping,
    ];

    if (fillHeight) {
      base.push(
        EditorView.theme({
          "&": {
            display: "flex",
            flex: "1 1 auto",
            flexDirection: "column",
            height: "100%",
            maxHeight: "100%",
            minHeight: 0,
            overflow: "hidden",
          },
          "& .cm-scroller": {
            flex: "1 1 auto",
            minHeight: 0,
            overflow: "auto",
          },
        }),
      );
    }

    return base;
  }, [fillHeight]);

  return (
    <div
      aria-label={editable ? "Editable code editor" : "Generated usage code"}
      className={styles.codeEditor}
      data-editable={editable ? "true" : undefined}
      data-fill-height={fillHeight ? "true" : undefined}
      role="region"
      onKeyDownCapture={(event) => {
        if (event.key.toLowerCase() !== "a" || (!event.metaKey && !event.ctrlKey)) {
          return;
        }

        const view = editorViewRef.current;
        if (!view) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        selectAllCode();
      }}
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;

        if (target.closest(".cm-editor")) {
          return;
        }

        window.requestAnimationFrame(() => editorViewRef.current?.focus());
      }}
    >
      <CodeMirror
        basicSetup={{
          autocompletion: editable,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          highlightSelectionMatches: editable,
          lineNumbers: true,
          searchKeymap: editable,
        }}
        editable={editable}
        extensions={extensions}
        height={fillHeight ? undefined : "auto"}
        maxHeight={fillHeight ? undefined : maxHeight}
        minHeight={fillHeight ? undefined : minHeight}
        theme={vscodeDark}
        value={code}
        onCreateEditor={(view) => {
          editorViewRef.current = view;
        }}
        onChange={editable ? onChange : undefined}
      />
    </div>
  );
}
