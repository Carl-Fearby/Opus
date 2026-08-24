import type { ReactNode } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Icon } from "@/components/Icon";
import styles from "./SyntaxHighlighter.module.css";

export type SyntaxHighlighterProps = {
  className?: string;
  code: string;
  language?: string;
};

type TokenKind = "comment" | "keyword" | "number" | "string";

const keywords = new Set(["as", "async", "await", "break", "case", "catch", "class", "const", "continue", "default", "else", "export", "false", "for", "from", "function", "if", "import", "in", "interface", "let", "new", "null", "return", "throw", "true", "try", "type", "undefined", "while"]);

function getTokenKind(value: string): TokenKind | undefined {
  if (value.startsWith("//") || value.startsWith("#")) return "comment";
  if (value.startsWith("\"") || value.startsWith("'") || value.startsWith("`")) return "string";
  if (/^\d/.test(value)) return "number";
  return keywords.has(value) ? "keyword" : undefined;
}

function HighlightedCode({ code }: { code: string }) {
  const matcher = /(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
  const parts = code.split(matcher);
  const tokenClass: Record<TokenKind, string> = { comment: styles.comment, keyword: styles.keyword, number: styles.number, string: styles.string };

  return <code>{parts.map((part, index): ReactNode => {
    const kind = getTokenKind(part);
    return kind ? <span className={tokenClass[kind]} key={index}>{part}</span> : part;
  })}</code>;
}

/** Read-only, theme-aware code block for compact UI surfaces. */
export function SyntaxHighlighter({ className, code, language }: SyntaxHighlighterProps) {
  return (
    <pre className={[styles.root, className].filter(Boolean).join(" ")} data-language={language || undefined}>
      {language ? <span className={styles.language}>{language}</span> : null}
      <CopyButton className={styles.copy} label="Copy code" copiedLabel="Copied" size="sm" value={code} variant="ghost">
        <Icon name="copy" size="sm" />
      </CopyButton>
      <HighlightedCode code={code} />
    </pre>
  );
}
