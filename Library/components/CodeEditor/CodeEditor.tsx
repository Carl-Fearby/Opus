"use client";

import { useMemo, type CSSProperties } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorView } from "@codemirror/view";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { useOpusTheme } from "@/components/OpusThemeProvider";
import styles from "./CodeEditor.module.css";

export type CodeEditorLanguage = "javascript" | "jsx" | "text" | "tsx" | "typescript";

export type CodeEditorProps = {
  /** Accessible name for the editor region. */
  ariaLabel?: string;
  className?: string;
  /** Fixed height. Numbers are treated as pixels. Defaults to 260px. */
  height?: number | string;
  language?: CodeEditorLanguage;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  /** Shows line numbers and the active line gutter. Defaults to true. */
  showLineNumbers?: boolean;
  value: string;
};

function resolveHeight(height: number | string) {
  return typeof height === "number" ? `${height}px` : height;
}

export function CodeEditor({
  ariaLabel = "Code editor",
  className,
  height = 260,
  language = "tsx",
  onChange,
  placeholder,
  readOnly = false,
  showLineNumbers = true,
  value,
}: CodeEditorProps) {
  const theme = useOpusTheme();

  const extensions = useMemo(() => {
    const next = [
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ "aria-label": ariaLabel }),
    ];

    if (language === "javascript" || language === "jsx" || language === "typescript" || language === "tsx") {
      next.push(
        javascript({
          jsx: language === "jsx" || language === "tsx",
          typescript: language === "typescript" || language === "tsx",
        }),
      );
    }

    return next;
  }, [ariaLabel, language]);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      data-readonly={readOnly || undefined}
      style={{ "--code-editor-height": resolveHeight(height) } as CSSProperties}
    >
      <CodeMirror
        aria-label={ariaLabel}
        basicSetup={{
          bracketMatching: true,
          closeBrackets: true,
          foldGutter: false,
          highlightActiveLine: !readOnly,
          highlightActiveLineGutter: !readOnly,
          lineNumbers: showLineNumbers,
          searchKeymap: true,
        }}
        editable={!readOnly}
        extensions={extensions}
        height={resolveHeight(height)}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        theme={theme === "dark" ? vscodeDark : vscodeLight}
        value={value}
      />
    </div>
  );
}
