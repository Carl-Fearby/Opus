"use client";

import type { CSSProperties, ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { ShowMore } from "@/components/ShowMore";
import styles from "./ChatBubble.module.css";

export type ChatBubbleAlignment = "left" | "right";

export type ChatBubbleAvatar = {
  name: string;
  src?: string;
};

export type ChatBubbleMessage = {
  /** Stable key for the message. Falls back to its position when omitted. */
  id?: string | number;
  /** Plain-text message content. Fenced code blocks are rendered as code. */
  content: string;
  /** Usually a formatted time, for example `10:42 AM`. */
  time?: ReactNode;
};

export type ChatBubbleProps = {
  alignment?: ChatBubbleAlignment;
  avatar?: ChatBubbleAvatar;
  /** CSS colour used for all bubbles in the group. */
  background?: string;
  className?: string;
  messages: readonly ChatBubbleMessage[];
  /** Collapses long message content using the shared ShowMore control. */
  showMore?: boolean;
  showMoreMaxLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
};

type CodeTokenKind = "comment" | "keyword" | "number" | "string";

const KEYWORDS = new Set([
  "as", "async", "await", "break", "case", "catch", "class", "const", "continue", "default", "else",
  "export", "false", "for", "from", "function", "if", "import", "in", "interface", "let", "new", "null",
  "return", "throw", "true", "try", "type", "undefined", "while",
]);

function tokenKind(value: string): CodeTokenKind | undefined {
  if (value.startsWith("//") || value.startsWith("#")) return "comment";
  if (value.startsWith("\"") || value.startsWith("'") || value.startsWith("`")) return "string";
  if (/^\d/.test(value)) return "number";
  if (KEYWORDS.has(value)) return "keyword";
  return undefined;
}

function HighlightedCode({ code }: { code: string }) {
  const matcher = /(\/\/[^\n]*|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g;
  const parts = code.split(matcher);

  return (
    <code>
      {parts.map((part, index) => {
        const kind = tokenKind(part);
        return kind ? <span className={styles[`token${kind[0].toUpperCase()}${kind.slice(1)}`]} key={index}>{part}</span> : part;
      })}
    </code>
  );
}

function MessageContent({ content }: { content: string }) {
  const blocks = content.split(/```([^\n`]*)\n?([\s\S]*?)```/g);

  return (
    <>
      {blocks.map((block, index) => {
        if (index % 3 === 0) return block ? <span className={styles.text} key={index}>{block}</span> : null;
        if (index % 3 === 1) return null;
        const language = blocks[index - 1]?.trim();
        return (
          <pre className={styles.codeBlock} data-language={language || undefined} key={index}>
            {language ? <span className={styles.codeLanguage}>{language}</span> : null}
            <HighlightedCode code={block} />
          </pre>
        );
      })}
    </>
  );
}

export function ChatBubble({
  alignment = "left",
  avatar,
  background,
  className,
  messages,
  showLessLabel,
  showMore = false,
  showMoreLabel,
  showMoreMaxLines = 5,
}: ChatBubbleProps) {
  return (
    <section
      aria-label={avatar ? `Messages from ${avatar.name}` : "Chat messages"}
      className={[styles.group, className].filter(Boolean).join(" ")}
      data-alignment={alignment}
      style={background ? ({ "--chat-bubble-background": background } as CSSProperties) : undefined}
    >
      {avatar ? <Avatar name={avatar.name} size="md" src={avatar.src} /> : null}
      <div className={styles.messages}>
        {messages.map((message, index) => {
          const content = <MessageContent content={message.content} />;
          return (
            <article className={styles.message} data-position={index === 0 ? "first" : index === messages.length - 1 ? "last" : "middle"} key={message.id ?? index}>
              <div className={styles.bubble}>
                {showMore ? <ShowMore maxLines={showMoreMaxLines} showLessLabel={showLessLabel} showMoreLabel={showMoreLabel}>{content}</ShowMore> : content}
              </div>
              {message.time ? <time className={styles.time}>{message.time}</time> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
