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
  maxHeight?: string;
  minHeight?: string;
  onChange?: (value: string) => void;
};

export function UsageCodeEditor({
  code,
  editable = false,
  maxHeight = "320px",
  minHeight,
  onChange,
}: UsageCodeEditorProps) {
  const extensions = useMemo(
    () => [javascript({ jsx: true, typescript: true }), EditorView.lineWrapping],
    [],
  );

  return (
    <div
      aria-label={editable ? "Editable code editor" : "Generated usage code"}
      className={styles.codeEditor}
      data-editable={editable ? "true" : undefined}
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
        height="auto"
        maxHeight={maxHeight}
        minHeight={minHeight}
        theme={vscodeDark}
        value={code}
        onChange={editable ? onChange : undefined}
      />
    </div>
  );
}
