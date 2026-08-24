"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Avatar } from "@/components/Avatar";
import { Heading } from "@/components/Heading";
import { ShowMore } from "@/components/ShowMore";
import { Spacer } from "@/components/Spacer";
import { SyntaxHighlighter } from "@/components/SyntaxHighlighter";
import { Text } from "@/components/Text";
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
  /** Custom background used when the nearest Opus theme is light. */
  lightBackground?: string;
  /** Custom background used when the nearest Opus theme is dark. */
  darkBackground?: string;
  className?: string;
  messages: readonly ChatBubbleMessage[];
  /** Collapses long message content using the shared ShowMore control. */
  showMore?: boolean;
  showMoreMaxLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
};

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

function contrastingBorderColour(background?: string, foreground?: string) {
  const hex = background?.trim().replace(/^#/, "");
  if (!hex || !foreground || !/^(?:[\da-f]{3}|[\da-f]{6})$/i.test(hex)) return undefined;

  const normalized = hex.length === 3 ? hex.split("").map((part) => `${part}${part}`).join("") : hex;
  const [red, green, blue] = [0, 2, 4].map((start) => Number.parseInt(normalized.slice(start, start + 2), 16) / 255);
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const lightness = (maximum + minimum) / 2;
  const delta = maximum - minimum;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  const hue = delta === 0 ? 0 : (60 * (maximum === red ? (green - blue) / delta : maximum === green ? (blue - red) / delta + 2 : (red - green) / delta + 4) + 360) % 360;
  const borderLightness = Math.max(0, Math.min(1, lightness + (foreground === "#ffffff" ? 0.2 : -0.2)));
  const borderSaturation = Math.min(1, saturation + 0.08);
  const chroma = (1 - Math.abs(2 * borderLightness - 1)) * borderSaturation;
  const secondary = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const match = chroma * 0;
  const [baseRed, baseGreen, baseBlue] = hue < 60 ? [chroma, secondary, match] : hue < 120 ? [secondary, chroma, match] : hue < 180 ? [match, chroma, secondary] : hue < 240 ? [match, secondary, chroma] : hue < 300 ? [secondary, match, chroma] : [chroma, match, secondary];
  const offset = borderLightness - chroma / 2;
  const channels = [baseRed, baseGreen, baseBlue].map((channel) => Math.round((channel + offset) * 255));

  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function InlineText({ content }: { content: string }) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return <>{parts.map((part, index) => {
    const bold = part.match(/^\*\*(.+)\*\*$/);
    return bold ? <strong key={index}>{bold[1]}</strong> : part;
  })}</>;
}

function ProseContent({ content }: { content: string }) {
  const blocks = content.split(/\n\s*\n/).filter(Boolean);

  return <div className={styles.prose}>
    {blocks.map((block, index) => {
      const trimmed = block.trim();
      const markdownHeading = trimmed.match(/^#{1,6}\s+(.+)$/);
      const boldHeading = trimmed.match(/^\*\*(.+?)\*\*:?[\s]*$/);
      const heading = markdownHeading?.[1] ?? boldHeading?.[1]?.replace(/:$/, "");
      const prose = heading
        ? <Heading level={3} padding="snug" size={100}><InlineText content={heading} /></Heading>
        : <Text as="p" padding="snug" size={200}>{block.split("\n").map((line, lineIndex) => <span key={lineIndex}><InlineText content={line} />{lineIndex < block.split("\n").length - 1 ? <br /> : null}</span>)}</Text>;

      return <div className={styles.proseBlock} key={index}>
        {index > 0 ? <Spacer size="small" /> : null}
        {prose}
      </div>;
    })}
  </div>;
}

function MessageContent({ content }: { content: string }) {
  const blocks = content.split(/```([^\n`]*)\n?([\s\S]*?)```/g);

  return (
    <>
      {blocks.map((block, index) => {
        if (index % 3 === 0) return block ? <div className={styles.text} key={index}><ProseContent content={block} /></div> : null;
        if (index % 3 === 1) return null;
        const language = blocks[index - 1]?.trim();
        return <SyntaxHighlighter className={styles.codeBlock} code={block} key={index} language={language} />;
      })}
    </>
  );
}

export function ChatBubble({
  alignment = "left",
  avatar,
  background,
  className,
  darkBackground,
  lightBackground,
  messages,
  showLessLabel,
  showMore = false,
  showMoreLabel,
  showMoreMaxLines = 5,
}: ChatBubbleProps) {
  const bubbleRefs = useRef(new Map<number, HTMLDivElement>());
  const [bubbleWidths, setBubbleWidths] = useState<number[]>([]);
  const lightColour = lightBackground || background;
  const darkColour = darkBackground || background;
  const lightForeground = contrastingTextColour(lightColour);
  const darkForeground = contrastingTextColour(darkColour);
  const lightBorder = contrastingBorderColour(lightColour, lightForeground);
  const darkBorder = contrastingBorderColour(darkColour, darkForeground);
  const groupStyle = lightColour || darkColour
    ? ({
        "--chat-bubble-background-light": lightColour,
        "--chat-bubble-background-dark": darkColour,
        "--chat-bubble-foreground-light": lightForeground,
        "--chat-bubble-foreground-dark": darkForeground,
        "--chat-bubble-border-light": lightBorder,
        "--chat-bubble-border-dark": darkBorder,
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
              <div
                ref={(element) => { if (element) bubbleRefs.current.set(index, element); else bubbleRefs.current.delete(index); }}
                className={styles.bubble}
              >
                {showMore ? <ShowMore maxLines={showMoreMaxLines} showLessLabel={showLessLabel} showMoreLabel={showMoreLabel} staticLayout>{content}</ShowMore> : content}
              </div>
              {index === messages.length - 1 && message.time ? <time className={styles.time}>{message.time}</time> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
