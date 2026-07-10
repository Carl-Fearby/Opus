"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import styles from "./UsageCodeEditor.module.css";

type UsageCodeEditorProps = {
  code: string;
  editable?: boolean;
  fillHeight?: boolean;
  maxHeight?: string;
  minHeight?: string;
  onChange?: (value: string) => void;
};

export function UsageCodeEditor({
  code,
  editable = false,
  fillHeight = false,
  maxHeight = "320px",
  minHeight,
  onChange,
}: UsageCodeEditorProps) {
  const extensions = useMemo(() => {
    const base = [javascript({ jsx: true, typescript: true }), EditorView.lineWrapping];

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
        onChange={editable ? onChange : undefined}
      />
    </div>
  );
}
