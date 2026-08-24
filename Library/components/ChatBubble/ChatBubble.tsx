"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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

function contrastingTextColour(background?: string) {
  const hex = background?.trim().replace(/^#/, "");
  if (!hex || !/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return undefined;

  const normalized = hex.length === 3 ? hex.split("").map((part) => `${part}${part}`).join("") : hex;
  const channels = [0, 2, 4].map((start) => Number.parseInt(normalized.slice(start, start + 2), 16) / 255);
  const luminance = channels.reduce(
    (total, channel, index) => total + [0.2126, 0.7152, 0.0722][index] * (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2),
    0,
  );

  return luminance > 0.179 ? "#070912" : "#ffffff";
}

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
  const bubbleRefs = useRef(new Map<number, HTMLDivElement>());
  const [bubbleWidths, setBubbleWidths] = useState<number[]>([]);
  const foreground = contrastingTextColour(background);
  const groupStyle = background
    ? ({
        "--chat-bubble-background": background,
        ...(foreground
          ? {
              "--chat-bubble-foreground": foreground,
              "--opus-text": foreground,
            }
          : {}),
      } as CSSProperties)
    : undefined;

  useLayoutEffect(() => {
    const measure = () => {
      const widths = messages.map((_, index) => Math.round(bubbleRefs.current.get(index)?.getBoundingClientRect().width ?? 0));
      setBubbleWidths((current) => current.length === widths.length && current.every((width, index) => width === widths[index]) ? current : widths);
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    bubbleRefs.current.forEach((bubble) => observer.observe(bubble));
    return () => observer.disconnect();
  }, [messages]);

  return (
    <section
      aria-label={avatar ? `Messages from ${avatar.name}` : "Chat messages"}
      className={[styles.group, className].filter(Boolean).join(" ")}
      data-alignment={alignment}
      style={groupStyle}
    >
      {avatar ? <Avatar name={avatar.name} size="md" src={avatar.src} /> : null}
      <div className={styles.messages}>
        {messages.map((message, index) => {
          const content = <MessageContent content={message.content} />;
          const currentWidth = bubbleWidths[index] ?? 0;
          const widerAbove = Math.max(0, currentWidth - (bubbleWidths[index - 1] ?? 0));
          const widerBelow = Math.max(0, currentWidth - (bubbleWidths[index + 1] ?? 0));
          const cornerStyle = {
            "--chat-bubble-corner-above": `${index > 0 ? Math.min(16, 6 + widerAbove / 2) : 0}px`,
            "--chat-bubble-corner-below": `${index < messages.length - 1 ? Math.min(16, 6 + widerBelow / 2) : 0}px`,
          } as CSSProperties;
          return (
            <article
              className={styles.message}
              data-position={messages.length === 1 ? "only" : index === 0 ? "first" : index === messages.length - 1 ? "last" : "middle"}
              data-adjacent-above={index > 0 || undefined}
              data-adjacent-below={index < messages.length - 1 || undefined}
              key={message.id ?? index}
              style={cornerStyle}
            >
              <div ref={(element) => { if (element) bubbleRefs.current.set(index, element); else bubbleRefs.current.delete(index); }} className={styles.bubble}>
                {showMore ? <ShowMore maxLines={showMoreMaxLines} showLessLabel={showLessLabel} showMoreLabel={showMoreLabel}>{content}</ShowMore> : content}
              </div>
              {index === messages.length - 1 && message.time ? <time className={styles.time}>{message.time}</time> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
