"use client";

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useComponentsTheme } from "@/components/development/ComponentsThemeProvider";
import styles from "./UsageCodeEditor.module.css";

type UsageCodeEditorProps = {
  code: string;
};

export function UsageCodeEditor({ code }: UsageCodeEditorProps) {
  const { theme } = useComponentsTheme();

  const extensions = useMemo(
    () => [javascript({ jsx: true, typescript: true }), EditorView.lineWrapping],
    [],
  );

  return (
    <div aria-label="Generated usage code" className={styles.codeEditor} role="region">
      <CodeMirror
        basicSetup={{
          autocompletion: false,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          highlightSelectionMatches: false,
          lineNumbers: true,
          searchKeymap: false,
        }}
        editable={false}
        extensions={extensions}
        height="auto"
        maxHeight="320px"
        theme={theme === "dark" ? vscodeDark : vscodeLight}
        value={code}
      />
    </div>
  );
}
